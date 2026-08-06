"""FastAPI 推理服务

启动:
    cd learning/xgboost/app
    uv run uvicorn api.main:app --reload --port 8000

接口:
    GET  /                       前端页面(web/index.html)
    GET  /api/info               模型元信息 + 特征 schema
    GET  /api/sample             随机样本(前端预填表单用)
    POST /api/predict            单样本预测,可选 SHAP 局部解释
    GET  /api/models             列出所有模型版本(active + 归档)
    GET  /api/models/active      当前激活版本摘要
    POST /api/models/switch      热切换激活版本(无需重启)
    GET  /api/datasets           列出已上传训练数据集
    POST /api/datasets           上传训练数据 CSV(含 target 列)
    DELETE /api/datasets/{name}  删除上传的数据集
    POST /api/train              用指定数据集触发训练(生成新版本)
    POST /api/predict/batch      批量预测,上传特征 CSV 下载结果 CSV
    GET  /api/health             健康检查
"""
from __future__ import annotations

import json
import random
import re
import threading
from datetime import datetime
from io import BytesIO
from pathlib import Path

import numpy as np
import pandas as pd
import xgboost as xgb
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, Response

from src.schemas import (
    ClassScore, DatasetListItem, DatasetListResponse, DatasetSummary,
    ModelInfo, ModelListResponse, ModelVersionSummary, PredictRequest,
    PredictResponse, SwitchRequest, SwitchResponse, TrainRequest, TrainResponse,
)
from src.data import (
    APP_DIR, CLASS_NAMES, DATA_DIR, FEATURES_JSON, MODEL_PATH_FALLBACK,
    METADATA_PATH, METRICS_PATH, SAMPLE_JSON, UPLOADS_DIR,
    dataset_path, derive_version_id, list_datasets, list_versions,
    promote_version_to_active, summarize_dataset,
)
from src.train import run_training

WEB_DIR = APP_DIR / "web"
INDEX_HTML = WEB_DIR / "index.html"

app = FastAPI(
    title="Covertype XGBoost Classifier",
    description="3 分类森林覆盖类型预测 - 推理 / 版本管理 / 训练触发",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- 模型状态:可热加载 ----------
_state: dict = {}
_training_lock = threading.Lock()


def _build_state() -> dict:
    """从磁盘读 active 模型构建新 state。无模型时返回空 state(predict 会 503)。"""
    empty = {"model": None, "metadata": {}, "metrics": {},
             "feature_schema": [], "samples": [],
             "feature_names": [], "class_names": []}
    if not MODEL_PATH_FALLBACK.exists() or not METADATA_PATH.exists():
        return empty
    model = xgb.XGBClassifier()
    model.load_model(MODEL_PATH_FALLBACK)
    metadata = json.loads(METADATA_PATH.read_text())
    # 老模型 metadata 无 version_id,内存层补推导值(不写回磁盘),保证 health/日志一致
    if "version_id" not in metadata:
        metadata["version_id"] = derive_version_id(
            metadata.get("created_at"), MODEL_PATH_FALLBACK)
    metrics = json.loads(METRICS_PATH.read_text()) if METRICS_PATH.exists() else {}
    feature_schema = json.loads(FEATURES_JSON.read_text()) if FEATURES_JSON.exists() else []
    samples = json.loads(SAMPLE_JSON.read_text()) if SAMPLE_JSON.exists() else []
    return {
        "model": model,
        "metadata": metadata,
        "metrics": metrics,
        "feature_schema": feature_schema,
        "samples": samples,
        "feature_names": metadata.get("feature_names", []),
        "class_names": metadata.get("class_names", list(CLASS_NAMES)),
    }


def reload_state() -> None:
    """重建 state 并原子替换全局引用(训练/切换后热加载,无需重启)。"""
    global _state
    _state = _build_state()
    md = _state["metadata"]
    print(f"[API] reloaded model: version={md.get('version_id')} "
          f"features={len(_state['feature_names'])} "
          f"classes={_state['class_names']} "
          f"acc={_state['metrics'].get('accuracy')}")


@app.on_event("startup")
def _load() -> None:
    reload_state()


def _require_model() -> None:
    if _state.get("model") is None:
        raise HTTPException(503, "当前无可用模型,请先训练或切换到一个已存在的版本")


# ---------- 基础路由 ----------
@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return INDEX_HTML.read_text()


@app.get("/api/info", response_model=ModelInfo)
def info() -> ModelInfo:
    md, mt, sch = _state["metadata"], _state["metrics"], _state["feature_schema"]
    if not md:
        raise HTTPException(503, "当前无可用模型")
    return ModelInfo(
        model_type=md["model_type"],
        objective=md["objective"],
        num_class=md["num_class"],
        class_names=md["class_names"],
        feature_names=md["feature_names"],
        feature_schema=sch,
        n_features=md["n_features"],
        best_iteration=md.get("best_iteration"),
        test_metrics={k: v for k, v in mt.items()
                      if k in {"accuracy", "f1_macro", "roc_auc_ovr"}},
        created_at=md.get("created_at"),
    )


@app.get("/api/sample")
def sample(seed: int | None = None) -> JSONResponse:
    samples = _state.get("samples") or []
    if not samples:
        raise HTTPException(404, "no samples cached; run src.data first")
    rng = random.Random(seed)
    s = dict(rng.choice(samples))
    target = s.pop("target", None)
    return JSONResponse({"features": s, "true_label": target})


@app.post("/api/predict", response_model=PredictResponse)
def predict(req: PredictRequest, explain: bool = False) -> PredictResponse:
    _require_model()
    feature_names = _state["feature_names"]
    class_names = _state["class_names"]
    model: xgb.XGBClassifier = _state["model"]

    missing = [f for f in feature_names if f not in req.features]
    if missing:
        raise HTTPException(
            400, f"missing {len(missing)} features: {missing[:5]}{'...' if len(missing) > 5 else ''}")
    row = np.array([[float(req.features[f]) for f in feature_names]],
                   dtype=np.float32)
    proba = model.predict_proba(row)[0]
    pred_idx = int(np.argmax(proba))

    top_features: list[dict] = []
    if explain:
        import shap
        explainer = shap.TreeExplainer(model)
        sv = explainer.shap_values(row)
        if isinstance(sv, list):
            contrib = np.sum([np.abs(s[0]) for s in sv], axis=0)
        else:
            contrib = np.abs(sv[0]).sum(-1) if sv[0].ndim == 2 else np.abs(sv[0])
        order = np.argsort(-contrib)[:5]
        top_features = [
            {"name": feature_names[i],
             "contribution": float(contrib[i]),
             "value": float(req.features[feature_names[i]])}
            for i in order
        ]

    return PredictResponse(
        predicted_class=pred_idx,
        predicted_class_name=class_names[pred_idx]
            if pred_idx < len(class_names) else f"Class {pred_idx}",
        probabilities=[
            ClassScore(class_index=i,
                       class_name=class_names[i] if i < len(class_names) else f"Class {i}",
                       probability=float(p))
            for i, p in enumerate(proba)
        ],
        top_features=top_features,
    )


@app.get("/api/health")
def health() -> dict:
    md = _state.get("metadata", {})
    return {
        "status": "ok",
        "ready": _state.get("model") is not None,
        "active_version_id": md.get("version_id"),
    }


# ---------- 模型版本管理 ----------
@app.get("/api/models", response_model=ModelListResponse)
def models() -> ModelListResponse:
    versions = list_versions()
    active_id = next((v["version_id"] for v in versions if v.get("is_active")), None)
    return ModelListResponse(
        active_version_id=active_id,
        versions=[ModelVersionSummary(**v) for v in versions],
    )


@app.get("/api/models/active", response_model=ModelVersionSummary)
def active_model() -> ModelVersionSummary:
    versions = list_versions()
    for v in versions:
        if v.get("is_active"):
            return ModelVersionSummary(**v)
    raise HTTPException(404, "当前无 active 模型")


@app.post("/api/models/switch", response_model=SwitchResponse)
def switch_model(req: SwitchRequest) -> SwitchResponse:
    versions = {v["version_id"]: v for v in list_versions()}
    if req.version_id not in versions:
        raise HTTPException(404, f"版本不存在: {req.version_id}")
    if versions[req.version_id].get("is_active"):
        reload_state()
    elif not promote_version_to_active(req.version_id):
        raise HTTPException(500, f"切换失败:无法提升版本 {req.version_id}")
    else:
        reload_state()
    return SwitchResponse(
        version_id=req.version_id,
        feature_names=_state["feature_names"],
        class_names=_state["class_names"],
        num_class=len(_state["class_names"]),
    )


# ---------- 训练数据上传 ----------
@app.post("/api/datasets", response_model=DatasetSummary)
async def upload_dataset(file: UploadFile) -> DatasetSummary:
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(400, "仅支持 .csv 文件")
    content = await file.read()
    if not content:
        raise HTTPException(400, "上传文件为空")
    try:
        df = pd.read_csv(BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"CSV 解析失败: {e}")
    if "target" not in df.columns:
        raise HTTPException(400, "训练数据必须含 target 列")
    if df["target"].isna().any():
        raise HTTPException(400, "target 列含空值")

    try:
        df["target"] = df["target"].astype(int)
    except Exception:
        raise HTTPException(400, "target 列必须为整数类别")
    unique_classes = sorted(df["target"].unique())
    if unique_classes != list(range(len(unique_classes))):
        raise HTTPException(
            400, f"target 必须为 0-based 连续整数(当前唯一值: {unique_classes})")

    features = df.drop(columns=["target"])
    for col in features.columns:
        if not pd.api.types.is_numeric_dtype(features[col]):
            coerced = pd.to_numeric(features[col], errors="coerce")
            if coerced.isna().all():
                raise HTTPException(400, f"特征列 {col} 无法解析为数值")
            df[col] = coerced

    if len(df) < 10:
        raise HTTPException(400, f"数据量过少({len(df)} 行),至少需要 10 行")

    stem = Path(file.filename).stem
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    save_name = f"{stem}_{ts}.csv"
    save_path = UPLOADS_DIR / save_name
    df.to_csv(save_path, index=False)

    summary = summarize_dataset(df)
    return DatasetSummary(
        name=save_name,
        size_bytes=save_path.stat().st_size,
        **summary,
    )


@app.get("/api/datasets", response_model=DatasetListResponse)
def datasets() -> DatasetListResponse:
    return DatasetListResponse(
        datasets=[DatasetListItem(**d) for d in list_datasets()])


@app.delete("/api/datasets/{name}")
def delete_dataset(name: str) -> dict:
    path = dataset_path(name)
    if not path.exists():
        raise HTTPException(404, f"数据集不存在: {name}")
    path.unlink()
    return {"deleted": path.name}


# ---------- 手动触发训练 ----------
@app.post("/api/train", response_model=TrainResponse)
def train_endpoint(req: TrainRequest) -> TrainResponse:
    # 同步 def(Starlette 自动放线程池);Lock 非阻塞抢占,并发请求返回 409
    if not _training_lock.acquire(blocking=False):
        raise HTTPException(409, "已有训练任务在运行,请稍后再试")
    try:
        path = dataset_path(req.dataset_name)
        if not path.exists():
            raise HTTPException(404, f"数据集不存在: {req.dataset_name}")
        df = pd.read_csv(path)
        if "target" not in df.columns:
            raise HTTPException(400, "数据集缺少 target 列")
        trials = req.trials if req.trials is not None else 5
        metadata, metrics, version_id = run_training(
            df, trials=trials, generate_shap=False)
        reload_state()
        return TrainResponse(
            new_version_id=version_id,
            num_class=metadata["num_class"],
            n_rows=metadata["n_train_samples"] + metadata["n_test_samples"],
            accuracy=metrics.get("accuracy"),
            f1_macro=metrics.get("f1_macro"),
            roc_auc_ovr=metrics.get("roc_auc_ovr"),
            elapsed_seconds=metadata.get("training_seconds", 0.0),
        )
    finally:
        _training_lock.release()


# ---------- 批量预测 ----------
@app.post("/api/predict/batch")
async def batch_predict(file: UploadFile) -> Response:
    _require_model()
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(400, "仅支持 .csv 文件")
    state = _state
    feature_names = state["feature_names"]
    class_names = state["class_names"]
    content = await file.read()
    if not content:
        raise HTTPException(400, "上传文件为空")
    try:
        df = pd.read_csv(BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"CSV 解析失败: {e}")

    missing = [f for f in feature_names if f not in df.columns]
    if missing:
        raise HTTPException(
            400, f"缺少 {len(missing)} 个模型所需特征列: {missing[:10]}"
            f"{'...' if len(missing) > 10 else ''}")

    has_target = "target" in df.columns
    X = df[feature_names].apply(lambda c: pd.to_numeric(c, errors="coerce"))

    def _predict() -> tuple[np.ndarray, np.ndarray]:
        model = state["model"]
        proba = model.predict_proba(X.values)
        return proba, proba.argmax(axis=1)

    proba, preds = await run_in_threadpool(_predict)

    result = df.drop(columns=["target"]) if has_target else df.copy()
    result["predicted_class"] = preds.astype(int)
    result["predicted_class_name"] = [
        class_names[int(p)] if int(p) < len(class_names) else f"Class {int(p)}"
        for p in preds
    ]
    for i, cn in enumerate(class_names):
        safe = re.sub(r"\W+", "_", str(cn)).strip("_") or f"class_{i}"
        result[f"prob_{safe}"] = proba[:, i]

    csv_bytes = result.to_csv(index=False)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="predictions.csv"'},
    )
