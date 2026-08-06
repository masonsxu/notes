"""特征分析:数据探索 + 可视化 + 摘要 JSON
========================================

输出(全部到 output/):
  - 01_target_distribution.png       3 类分布
  - 02_continuous_distribution.png   10 个连续特征的类内分布(KDE)
  - 03_correlation_heatmap.png       连续特征间相关性
  - 04_class_boxplot_top.png         按 SHAP/F 分挑选的判别力 top 特征箱型图
  - feature_summary.json             数值摘要(均值/方差/缺失/相关性 top)

运行:
    cd learning/xgboost/app
    uv run python -m src.features
"""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from .data import (
    CLASS_NAMES,
    DATA_DIR,
    FULL_PARQUET,
    load_or_fetch,
    APP_DIR,
)

OUTPUT_DIR = APP_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)
SUMMARY_JSON = DATA_DIR / "feature_summary.json"


def _setup_cjk_font() -> None:
    """复用 xgboost_demo.py 的中文字体策略。"""
    from matplotlib import font_manager
    candidates = ["PingFang SC", "Heiti SC", "STHeiti",
                  "Noto Sans CJK SC", "Microsoft YaHei", "SimHei",
                  "Arial Unicode MS"]
    available = {f.name for f in font_manager.fontManager.ttflist}
    for name in candidates:
        if name in available:
            plt.rcParams["font.sans-serif"] = [name, "DejaVu Sans"]
            plt.rcParams["axes.unicode_minus"] = False
            return
    print("[Setup] CJK font NOT FOUND - 中文标题会显示方块")


def _split_features(df: pd.DataFrame) -> tuple[list[str], list[str]]:
    """区分连续特征与二值特征。"""
    cont, bin_ = [], []
    for c in [c for c in df.columns if c != "target"]:
        (cont if df[c].nunique() > 2 else bin_).append(c)
    return cont, bin_


def plot_target_distribution(df: pd.DataFrame) -> None:
    counts = df["target"].value_counts().sort_index()
    fig, ax = plt.subplots(figsize=(7, 4))
    bars = ax.bar([CLASS_NAMES[i] for i in counts.index], counts.values,
                  color=["#4C72B0", "#55A868", "#C44E52"])
    for b, v in zip(bars, counts.values):
        ax.text(b.get_x() + b.get_width() / 2, v + max(counts) * 0.01,
                f"{v:,}", ha="center", fontsize=10)
    ax.set_title("目标类分布(Covertype 3-class,平衡采样后)")
    ax.set_ylabel("样本数")
    plt.tight_layout()
    out = OUTPUT_DIR / "01_target_distribution.png"
    plt.savefig(out, dpi=120)
    plt.close(fig)
    print(f"[Feat] saved {out}")


def plot_continuous_distribution(df: pd.DataFrame, cont_cols: list[str]) -> None:
    """KDE:每个连续特征在 3 类下的分布重叠情况。分布差异越大,判别力越强。"""
    n = len(cont_cols)
    cols = 2
    rows = (n + cols - 1) // cols
    fig, axes = plt.subplots(rows, cols, figsize=(13, 2.6 * rows))
    axes = axes.ravel()
    palette = {"0": "#4C72B0", "1": "#55A868", "2": "#C44E52"}
    for ax, col in zip(axes, cont_cols):
        for cls in sorted(df["target"].unique()):
            sub = df[df["target"] == cls][col]
            sns.kdeplot(sub, ax=ax, label=CLASS_NAMES[cls],
                        color=palette[str(cls)], fill=False, linewidth=1.5)
        ax.set_title(col, fontsize=10)
        ax.set_xlabel("")
        ax.legend(fontsize=8)
    for ax in axes[n:]:
        ax.axis("off")
    fig.suptitle("连续特征在 3 类下的分布对比", y=1.005, fontsize=12)
    plt.tight_layout()
    out = OUTPUT_DIR / "02_continuous_distribution.png"
    plt.savefig(out, dpi=120, bbox_inches="tight")
    plt.close(fig)
    print(f"[Feat] saved {out}")


def plot_correlation_heatmap(df: pd.DataFrame, cont_cols: list[str]) -> None:
    corr = df[cont_cols].corr(method="pearson")
    fig, ax = plt.subplots(figsize=(9, 7))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm",
                center=0, square=True, ax=ax,
                cbar_kws={"shrink": 0.8}, annot_kws={"size": 8})
    ax.set_title("连续特征相关性矩阵")
    plt.tight_layout()
    out = OUTPUT_DIR / "03_correlation_heatmap.png"
    plt.savefig(out, dpi=120)
    plt.close(fig)
    print(f"[Feat] saved {out}")


def plot_class_boxplot(df: pd.DataFrame, top_features: list[str]) -> None:
    """选判别力最强的几个特征画箱型图。top_features 由 build_summary 给出。"""
    n = min(6, len(top_features))
    fig, axes = plt.subplots(2, 3, figsize=(14, 7))
    for ax, feat in zip(axes.ravel(), top_features[:n]):
        sns.boxplot(data=df, x="target", y=feat, ax=ax,
                    palette=["#4C72B0", "#55A868", "#C44E52"])
        ax.set_xticklabels(CLASS_NAMES, fontsize=9)
        ax.set_title(feat, fontsize=10)
        ax.set_xlabel("")
    fig.suptitle("Top 判别力特征 - 类内箱型图", fontsize=12)
    plt.tight_layout()
    out = OUTPUT_DIR / "04_class_boxplot_top.png"
    plt.savefig(out, dpi=120)
    plt.close(fig)
    print(f"[Feat] saved {out}")


def build_summary(df: pd.DataFrame, cont_cols: list[str]) -> list[str]:
    """计算每个特征的 ANOVA F-statistic(跨 3 类)排序,top 即判别力。"""
    from sklearn.feature_selection import f_classif
    X = df.drop(columns=["target"])
    y = df["target"]
    fstat, pval = f_classif(X, y)
    rank = (pd.DataFrame({"feature": X.columns, "f_stat": fstat, "p_val": pval})
            .sort_values("f_stat", ascending=False))
    rank["rank"] = range(1, len(rank) + 1)

    # 数值摘要
    summary = {
        "n_samples": int(len(df)),
        "n_features": int(X.shape[1]),
        "n_continuous": len(cont_cols),
        "n_binary": int(X.shape[1] - len(cont_cols)),
        "class_names": CLASS_NAMES,
        "class_counts": {CLASS_NAMES[int(k)]: int(v)
                         for k, v in df["target"].value_counts().sort_index().items()},
        "missing_total": int(X.isna().sum().sum()),
        "top_features_by_fstat": rank.head(15)[["feature", "f_stat", "p_val"]] \
                                       .to_dict(orient="records"),
        "continuous_corr_top": _top_corr_pairs(df[cont_cols]),
    }
    SUMMARY_JSON.write_text(json.dumps(summary, ensure_ascii=False, indent=2,
                                       default=float))
    print(f"[Feat] summary → {SUMMARY_JSON}")
    return rank["feature"].tolist()


def _top_corr_pairs(corr_df: pd.DataFrame, k: int = 10) -> list[dict]:
    corr = corr_df.corr().abs()
    pairs = []
    seen = set()
    for i in range(len(corr)):
        for j in range(i + 1, len(corr)):
            pairs.append({"a": corr.columns[i], "b": corr.columns[j],
                          "abs_corr": float(corr.iloc[i, j])})
    pairs.sort(key=lambda x: -x["abs_corr"])
    return pairs[:k]


def main() -> None:
    _setup_cjk_font()
    print("[Feat] loading data ...")
    df = load_or_fetch()
    cont_cols, bin_cols = _split_features(df)
    print(f"[Feat] continuous={len(cont_cols)}, binary={len(bin_cols)}")

    plot_target_distribution(df)
    plot_continuous_distribution(df, cont_cols)
    plot_correlation_heatmap(df, cont_cols)

    print("[Feat] computing ANOVA F-stat for discriminative ranking ...")
    ranked = build_summary(df, cont_cols)
    plot_class_boxplot(df, ranked)

    print("\n[Feat] Top-10 判别力特征:")
    for i, f in enumerate(ranked[:10], 1):
        print(f"  {i:2d}. {f}")
    print(f"\n[Feat] 所有图表已保存到 {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
