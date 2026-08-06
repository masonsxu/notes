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
