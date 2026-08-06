"""数据层:Covertype 数据集加载与离线缓存
================================================

数据源:sklearn 内置的 Forest CoverType(UCI ML Repository 经典数据)
  - 54 个特征:10 个连续(Elevation/Slope/距离/光照索引等)
              + 4 个 Wilderness_Area 二值 + 40 个 Soil_Type 二值
  - 7 个原始类别 → 取样本量最大的 3 类做 3 分类:
        0 = Spruce/Fir       (原始 1)
        1 = Lodgepole Pine   (原始 2)
        2 = Ponderosa Pine   (原始 3)

为什么选这个数据集:
  - 真实业务场景特征:连续 + 稀疏二值混合,有噪声,样本量足够大
  - 50+ 特征满足需求,且特征工程空间大(后续可衍生交互特征)
  - sklearn 原生支持,首次自动下载,之后读本地缓存

运行:
    cd learning/xgboost/app
    uv run python -m src.data            # 生成 data/covertype.parquet
"""
from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path

import pandas as pd
from sklearn.datasets import fetch_covtype

# 路径约定:模块相对路径,不依赖 cwd
APP_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = APP_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

FULL_PARQUET = DATA_DIR / "covertype.parquet"           # 全量 3 分类样本(*.parquet 已 gitignored)
SAMPLE_CSV = DATA_DIR / "covertype_sample.csv"          # 前端预填小样本(可入库)
SAMPLE_JSON = DATA_DIR / "covertype_sample.json"        # JSON 版本(前端直接 fetch)
FEATURES_JSON = DATA_DIR / "features.json"              # 特征 schema(名称+类型+范围)

# 模型产物路径(单一事实来源,train/api 共用)
MODELS_DIR = APP_DIR / "models"
MODEL_PATH = MODELS_DIR / "model.json"                  # XGBoost 原生格式
MODEL_PATH_FALLBACK = MODEL_PATH                        # API 兼容别名
METADATA_PATH = MODELS_DIR / "metadata.json"
METRICS_PATH = MODELS_DIR / "metrics.json"

# 模型版本归档目录:每次训练把当前 active 模型归档到 versions/<version_id>/
VERSIONS_DIR = MODELS_DIR / "versions"

# 用户上传的训练数据目录
UPLOADS_DIR = DATA_DIR / "uploads"

for _d in (VERSIONS_DIR, UPLOADS_DIR):
    _d.mkdir(parents=True, exist_ok=True)

# 3 分类映射:原始 cover_type → 我们的目标类
KEEP_RAW_CLASSES = [1, 2, 3]   # 取样本量前三的类
CLASS_NAMES = ["Spruce/Fir", "Lodgepole Pine", "Ponderosa Pine"]

# 每类采样上限(避免 58 万行训练过慢)
PER_CLASS_SAMPLE = 20000


def load_or_fetch() -> pd.DataFrame:
    """读缓存或下载。首次调用会下载 ~80MB 压缩包到 ~/scikit_learn_data/。"""
    if FULL_PARQUET.exists():
        return pd.read_parquet(FULL_PARQUET)

    print("[Data] 首次下载 Covertype 数据集(约 80MB)...")
    bunch = fetch_covtype(as_frame=True)
    df = _build_dataset(bunch)
    df.to_parquet(FULL_PARQUET, compression="zstd")
    print(f"[Data] cached → {FULL_PARQUET}  shape={df.shape}")
    print(f"[Data] target distribution:\n{df['target'].value_counts().sort_index()}")
    return df


def _build_dataset(bunch) -> pd.DataFrame:
    """3 类筛选 + 平衡采样 + shuffle。"""
    df = bunch.frame
    df = df[df["Cover_Type"].isin(KEEP_RAW_CLASSES)].copy()
    raw_to_new = {raw: i for i, raw in enumerate(KEEP_RAW_CLASSES)}
    df["target"] = df["Cover_Type"].map(raw_to_new).astype("int8")
    df = df.drop(columns=["Cover_Type"])

    parts = []
    for cls in range(len(KEEP_RAW_CLASSES)):
        sub = df[df["target"] == cls]
        n = min(PER_CLASS_SAMPLE, len(sub))
        parts.append(sub.sample(n=n, random_state=42))
    df = pd.concat(parts, ignore_index=True)
    return df.sample(frac=1.0, random_state=42).reset_index(drop=True)


def get_feature_schema(df: pd.DataFrame) -> list[dict]:
    """生成前端表单与训练一致性校验用的特征 schema。"""
    schema = []
    for col in df.columns:
        if col == "target":
            continue
        if df[col].nunique() <= 2 and set(df[col].unique()) <= {0, 1}:
            ftype, lo, hi = "binary", 0, 1
        else:
            ftype = "continuous"
            lo, hi = float(df[col].min()), float(df[col].max())
        schema.append({
            "name": col,
            "type": ftype,
            "min": lo,
            "max": hi,
            "default": float(df[col].median() if ftype == "continuous" else 0),
        })
    return schema


# ---------- 模型版本管理 ----------
def derive_version_id(created_at: str | None = None,
                      fallback_path: Path | None = None) -> str:
    """从 created_at(ISO) 推导 YYYYMMDD_HHMMSS 格式的版本 ID;失败回退文件 mtime。"""
    if created_at:
        try:
            dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            return dt.strftime("%Y%m%d_%H%M%S")
        except (ValueError, TypeError):
            pass
    if fallback_path and fallback_path.exists():
        return datetime.fromtimestamp(fallback_path.stat().st_mtime).strftime("%Y%m%d_%H%M%S")
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def unique_version_dir(base_id: str) -> Path:
    """返回不冲突的 versions/<base_id> 路径;同秒重训自动加 _2/_3 后缀。"""
    candidate = VERSIONS_DIR / base_id
    if not candidate.exists():
        return candidate
    n = 2
    while (VERSIONS_DIR / f"{base_id}_{n}").exists():
        n += 1
    return VERSIONS_DIR / f"{base_id}_{n}"


def archive_current_model() -> str | None:
    """把当前 active 模型归档到 versions/<version_id>/。幂等:已归档过则跳过。

    返回版本 ID;无 active 模型(model.json 不存在)时返回 None。
    """
    if not MODEL_PATH.exists():
        return None
    created_at = None
    if METADATA_PATH.exists():
        try:
            created_at = json.loads(METADATA_PATH.read_text()).get("created_at")
        except (json.JSONDecodeError, OSError):
            pass
    vid = derive_version_id(created_at, fallback_path=MODEL_PATH)
    target = VERSIONS_DIR / vid
    if target.exists():
        return vid
    target.mkdir(parents=True, exist_ok=True)
    shutil.copy2(MODEL_PATH, target / MODEL_PATH.name)
    if METADATA_PATH.exists():
        shutil.copy2(METADATA_PATH, target / METADATA_PATH.name)
    if METRICS_PATH.exists():
        shutil.copy2(METRICS_PATH, target / METRICS_PATH.name)
    return vid


def find_version_dir(version_id: str) -> Path | None:
    if not VERSIONS_DIR.exists():
        return None
    d = VERSIONS_DIR / Path(version_id).name
    if d.is_dir() and (d / MODEL_PATH.name).exists():
        return d
    return None


def promote_version_to_active(version_id: str) -> bool:
    """把指定版本的 3 个文件复制回顶层 models/,覆盖当前 active。失败返回 False。"""
    src = find_version_dir(version_id)
    if src is None:
        return False
    shutil.copy2(src / MODEL_PATH.name, MODEL_PATH)
    if (src / METADATA_PATH.name).exists():
        shutil.copy2(src / METADATA_PATH.name, METADATA_PATH)
    if (src / METRICS_PATH.name).exists():
        shutil.copy2(src / METRICS_PATH.name, METRICS_PATH)
    return True


def _read_metrics_summary(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        m = json.loads(path.read_text())
        return {k: m[k] for k in ("accuracy", "f1_macro", "roc_auc_ovr") if k in m}
    except (json.JSONDecodeError, OSError):
        return {}


def list_versions() -> list[dict]:
    """返回 active 版本 + 所有归档版本,按 version_id 降序。active 永远在最前。"""
    versions: list[dict] = []
    if METADATA_PATH.exists() and MODEL_PATH.exists():
        try:
            md = json.loads(METADATA_PATH.read_text())
            versions.append({
                "version_id": md.get("version_id") or derive_version_id(md.get("created_at"), MODEL_PATH),
                "created_at": md.get("created_at"),
                "is_active": True,
                "model_type": md.get("model_type"),
                "objective": md.get("objective"),
                "num_class": md.get("num_class"),
                "n_features": md.get("n_features"),
                "class_names": md.get("class_names", []),
                "best_iteration": md.get("best_iteration"),
                "n_train_samples": md.get("n_train_samples"),
                "best_params": md.get("best_params", {}),
                "metrics": _read_metrics_summary(METRICS_PATH),
            })
        except (json.JSONDecodeError, OSError):
            pass
    archived: list[dict] = []
    if VERSIONS_DIR.exists():
        for d in VERSIONS_DIR.iterdir():
            if not d.is_dir():
                continue
            md_path = d / METADATA_PATH.name
            if not md_path.exists():
                continue
            try:
                md = json.loads(md_path.read_text())
            except (json.JSONDecodeError, OSError):
                continue
            archived.append({
                "version_id": d.name,
                "created_at": md.get("created_at"),
                "is_active": False,
                "model_type": md.get("model_type"),
                "objective": md.get("objective"),
                "num_class": md.get("num_class"),
                "n_features": md.get("n_features"),
                "class_names": md.get("class_names", []),
                "best_iteration": md.get("best_iteration"),
                "n_train_samples": md.get("n_train_samples"),
                "best_params": md.get("best_params", {}),
                "metrics": _read_metrics_summary(d / METRICS_PATH.name),
            })
    archived.sort(key=lambda v: v["version_id"], reverse=True)
    return versions + archived


# ---------- 用户上传数据集 ----------
def dataset_path(name: str) -> Path:
    """安全拼接上传目录路径,防路径穿越(只取文件名部分)。"""
    return UPLOADS_DIR / Path(name).name


def list_datasets() -> list[dict]:
    if not UPLOADS_DIR.exists():
        return []
    out = []
    for p in sorted(UPLOADS_DIR.glob("*.csv"), key=lambda x: x.stat().st_mtime, reverse=True):
        st = p.stat()
        out.append({
            "name": p.name,
            "size_bytes": st.st_size,
            "created_at": datetime.fromtimestamp(st.st_mtime).isoformat(timespec="seconds"),
        })
    return out


def summarize_dataset(df: pd.DataFrame) -> dict:
    """读 DataFrame 的训练数据摘要(行数/特征数/类别分布)。要求含 target 列。"""
    feature_names = [c for c in df.columns if c != "target"]
    class_counts = df["target"].value_counts().sort_index().to_dict() if "target" in df.columns else {}
    return {
        "n_rows": int(len(df)),
        "n_features": len(feature_names),
        "feature_names": feature_names,
        "class_distribution": {int(k): int(v) for k, v in class_counts.items()},
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="准备 Covertype 数据集")
    args = parser.parse_args()

    df = load_or_fetch()

    # 写特征 schema
    schema = get_feature_schema(df)
    FEATURES_JSON.write_text(json.dumps(schema, ensure_ascii=False, indent=2))
    print(f"[Data] features schema → {FEATURES_JSON}  ({len(schema)} features)")

    # 写前端样本(20 条随机样本,带 target 用于校验)
    sample = df.sample(n=min(20, len(df)), random_state=7)
    sample.to_csv(SAMPLE_CSV, index=False)
    SAMPLE_JSON.write_text(sample.to_json(orient="records", force_ascii=False))
    print(f"[Data] frontend sample → {SAMPLE_CSV} / {SAMPLE_JSON}")

    # 简单描述性统计(直接打印)
    print("\n[Stats] 连续特征描述:")
    cont_cols = [c for c in df.columns if c != "target" and df[c].nunique() > 2]
    print(df[cont_cols].describe().T[["mean", "std", "min", "25%", "50%", "75%", "max"]])


if __name__ == "__main__":
    main()
