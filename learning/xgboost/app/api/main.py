"""FastAPI 推理服务(最小 MVP)
================================

启动:
    cd learning/xgboost/app
    uv run uvicorn api.main:app --reload --port 8000

接口:
    GET  /                  前端页面(web/index.html)
    GET  /api/info          模型元信息 + 特征 schema
    GET  /api/sample        随机样本(前端预填表单用)
    POST /api/predict       单样本预测,可选 SHAP 局部解释
"""
from __future__ import annotations

import json
import random
from pathlib import Path

import numpy as np
import pandas as pd
import xgboost as xgb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

from src.schemas import ModelInfo, PredictRequest, PredictResponse, ClassScore
from src.data import (
    APP_DIR, CLASS_NAMES, DATA_DIR, FEATURES_JSON, METADATA_PATH,
    METRICS_PATH, SAMPLE_JSON, MODEL_PATH_FALLBACK,
)

WEB_DIR = APP_DIR / "web"
INDEX_HTML = WEB_DIR / "index.html"

app = FastAPI(
    title="Covertype XGBoost Classifier",
    description="3 分类森林覆盖类型预测 - 50+ 特征 XGBoost 应用 MVP",
    version="0.1.0",
)

# 前端用 Vue CDN 直接打开 file:// 也能跑,但开发时跨源更省心
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- 启动时一次性加载模型 ----------
_state: dict = {}


@app.on_event("startup")
def _load() -> None:
    if not MODEL_PATH_FALLBACK.exists():
        raise RuntimeError(
            f"model not found: {MODEL_PATH_FALLBACK}\n"
            "请先运行 `uv run python -m src.train` 生成模型")
    model = xgb.XGBClassifier()
    model.load_model(MODEL_PATH_FALLBACK)
    metadata = json.loads(METADATA_PATH.read_text())
    metrics = json.loads(METRICS_PATH.read_text()) if METRICS_PATH.exists() else {}
    feature_schema = json.loads(FEATURES_JSON.read_text()) if FEATURES_JSON.exists() else []
    samples = json.loads(SAMPLE_JSON.read_text()) if SAMPLE_JSON.exists() else []

    _state.update(model=model, metadata=metadata, metrics=metrics,
                  feature_schema=feature_schema, samples=samples,
                  feature_names=metadata["feature_names"])
    print(f"[API] loaded model from {MODEL_PATH_FALLBACK}")
    print(f"[API] features={len(metadata['feature_names'])}, "
          f"classes={metadata['class_names']}, "
          f"test_acc={metrics.get('accuracy')}")


# ---------- 路由 ----------
@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return INDEX_HTML.read_text()


@app.get("/api/info", response_model=ModelInfo)
def info() -> ModelInfo:
    md, mt, sch = _state["metadata"], _state["metrics"], _state["feature_schema"]
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
    """随机返回一条样本(包含 features + true_label),便于前端调试。"""
    samples = _state.get("samples") or []
    if not samples:
        raise HTTPException(404, "no samples cached; run src.data first")
    rng = random.Random(seed)
    s = rng.choice(samples)
    target = s.pop("target", None)
    return JSONResponse({"features": s, "true_label": target})


@app.post("/api/predict", response_model=PredictResponse)
def predict(req: PredictRequest, explain: bool = False) -> PredictResponse:
    feature_names = _state["feature_names"]
    model: xgb.XGBClassifier = _state["model"]

    # 校验 + 按训练顺序对齐(缺失填 NaN,XGBoost 原生处理)
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
        sv = explainer.shap_values(row)  # list[3] or ndarray
        # 多分类:对每个特征汇总 |contribution| across classes
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
        predicted_class_name=CLASS_NAMES[pred_idx],
        probabilities=[
            ClassScore(class_index=i, class_name=CLASS_NAMES[i],
                       probability=float(p))
            for i, p in enumerate(proba)
        ],
        top_features=top_features,
    )


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
