"""XGBoost 实战最小脚本 - 全流程
================================

覆盖:
  1. 数据加载 (California Housing 回归)
  2. baseline 训练 (含 early_stopping)
  3. 评估
  4. 特征分析 - 三种方法对比:
       a. plot_importance (weight / gain / cover)
       b. Permutation Importance (sklearn, 模型无关)
       c. SHAP (TreeExplainer, 含方向性 + 局部解释)  <-- 重点
  5. Optuna 贝叶斯调参 (5 折 CV)
  6. 用最优参数重训练 + 最终评估

运行:
    cd learning/xgboost
    uv run xgboost_demo.py                          # 默认 Optuna 30 trials,几分钟
    XGB_DEMO_TRIALS=3 uv run xgboost_demo.py        # 快速验证模式

依赖通过 notes 项目根目录的 pyproject.toml 管理(已 uv add)。
切换到 Home Credit Default Risk (二分类):
  - 从 https://www.kaggle.com/competitions/home-credit-default-risk/data
    下载 application_train.csv
  - 把 load_data() 替换为:
        df = pd.read_csv("application_train.csv")
        y = (df["TARGET"] == 1).astype(int)
        X = df.drop(columns=["TARGET", "SK_ID_CURR"])
        # XGBoost 1.5+ 原生支持类别特征:
        #   for c in X.select_dtypes("object").columns:
        #       X[c] = X[c].astype("category")
        # 模型改用 XGBClassifier,eval_metric 改 "auc" / "logloss"
"""

from __future__ import annotations

import os
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # 脚本模式,避免 GUI 后端
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
import optuna
import xgboost as xgb
from sklearn.datasets import fetch_california_housing
from sklearn.inspection import permutation_importance
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import KFold, train_test_split

# 图片输出到脚本同目录的 output/(已 .gitignore)
OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)


def _setup_cjk_font() -> str | None:
    from matplotlib import font_manager
    candidates = [
        "PingFang SC", "Heiti SC", "STHeiti", "Hiragino GB",  # macOS
        "Noto Sans CJK SC", "Source Han Sans SC",              # Linux
        "Microsoft YaHei", "SimHei",                            # Windows
        "Arial Unicode MS",                                     # 跨平台 fallback
    ]
    available = {f.name for f in font_manager.fontManager.ttflist}
    for name in candidates:
        if name in available:
            plt.rcParams["font.sans-serif"] = [name, "DejaVu Sans"]
            plt.rcParams["axes.unicode_minus"] = False  # 负号渲染修复
            return name
    return None


_CJK_FONT = _setup_cjk_font()
if _CJK_FONT:
    print(f"[Setup] CJK font: {_CJK_FONT}")
else:
    print("[Setup] CJK font NOT FOUND - 中文标题会显示方块(图表逻辑不受影响)")



# ---------- 1. 数据 ----------
def load_data() -> tuple[pd.DataFrame, pd.Series]:
    """California Housing: 20640 行 × 8 特征,目标 = 房价中位数(单位:10万美元)"""
    X, y = fetch_california_housing(return_X_y=True, as_frame=True)
    print(f"[Data] shape={X.shape}, target_stats: min={y.min():.2f}, "
          f"max={y.max():.2f}, mean={y.mean():.2f}")
    return X, y


def make_splits(X: pd.DataFrame, y: pd.Series) -> dict:
    """train / val / test = 64% / 16% / 20%
    val 用于 early_stopping,test 仅最终评估一次,避免数据泄露。
    """
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
    X_tr, X_va, y_tr, y_va = train_test_split(X_tr, y_tr, test_size=0.2, random_state=42)
    return dict(X_tr=X_tr, X_va=X_va, X_te=X_te, y_tr=y_tr, y_va=y_va, y_te=y_te)


# ---------- 2. 训练 ----------
def train_model(X_tr, X_va, y_tr, y_va, **params) -> xgb.XGBRegressor:
    """基线训练。early_stopping 决定实际迭代数,避免全程过拟合。"""
    defaults = dict(
        n_estimators=2000,        # 上限,由 early_stopping 决定实际值
        learning_rate=0.1,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        early_stopping_rounds=50,
        eval_metric="rmse",
        random_state=42,
        tree_method="hist",       # 推荐值,GPU 上可改 device="cuda"
    )
    defaults.update(params)
    model = xgb.XGBRegressor(**defaults)
    model.fit(X_tr, y_tr, eval_set=[(X_va, y_va)], verbose=False)
    print(f"[Train] best_iter={model.best_iteration}, "
          f"val_rmse={model.best_score:.4f}")
    return model


# ---------- 3. 评估 ----------
def evaluate(model, X, y, label="test") -> float:
    pred = model.predict(X)
    rmse = float(np.sqrt(mean_squared_error(y, pred)))
    r2 = r2_score(y, pred)
    print(f"[Eval:{label}] RMSE={rmse:.4f}, R2={r2:.4f}")
    return rmse


# ---------- 4a. 传统 plot_importance ----------
def feature_importance_classic(model, feature_names) -> None:
    """weight/gain/cover 三种指标并排,看它们如何互相矛盾。"""
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    for ax, kind in zip(axes, ["weight", "gain", "cover"]):
        xgb.plot_importance(model, importance_type=kind, ax=ax,
                            title=f"importance_type={kind}",
                            show_values=False)
    plt.tight_layout()
    out = OUTPUT_DIR / "01_classic_importance.png"
    plt.savefig(out, dpi=120)
    plt.close(fig)
    print(f"[Feat-classic] saved {out}")

    booster = model.get_booster()
    print("  各指标 Top-3 对比(注意三者排序可能不一致):")
    for kind in ["weight", "gain", "cover"]:
        scores = booster.get_score(importance_type=kind)
        top3 = sorted(scores.items(), key=lambda kv: -kv[1])[:3]
        print(f"    {kind:6s}: {top3}")


# ---------- 4b. Permutation Importance ----------
def feature_importance_permutation(model, X_te, y_te, feature_names) -> None:
    """模型无关,更稳健。但只能给"重要性"不能给"方向"。"""
    r = permutation_importance(model, X_te, y_te, n_repeats=10,
                               random_state=42, scoring="neg_root_mean_squared_error")
    order = r.importances_mean.argsort()[::-1]
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(range(len(feature_names)), r.importances_mean[order],
           yerr=r.importances_std[order])
    ax.set_xticks(range(len(feature_names)))
    ax.set_xticklabels(np.array(feature_names)[order], rotation=45, ha="right")
    ax.set_ylabel("ΔRMSE (shuffle 后的下降量)")
    ax.set_title("Permutation Importance (test set)")
    plt.tight_layout()
    out = OUTPUT_DIR / "02_permutation_importance.png"
    plt.savefig(out, dpi=120)
    plt.close(fig)
    print(f"[Feat-perm] saved {out}")


# ---------- 4c. SHAP (重点) ----------
def feature_importance_shap(model, X_te, feature_names) -> None:
    """TreeExplainer 是 XGBoost 特征分析的事实标准。
    输出: 全局 summary + 单特征 dependence + 局部 waterfall。
    """
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_te)

    # (a) 全局 summary: 每个点 = 一个样本,颜色 = 特征值高低,x = SHAP 贡献
    plt.figure()
    shap.summary_plot(shap_values, X_te, show=False)
    plt.title("SHAP Summary (全局特征重要性 + 方向性)")
    plt.tight_layout()
    out = OUTPUT_DIR / "03_shap_summary.png"
    plt.savefig(out, dpi=120, bbox_inches="tight")
    plt.close()
    print(f"[Feat-shap] saved {out}")

    # (b) 依赖图: 选 SHAP 绝对值最大的特征,看非线性效应
    top_idx = int(np.argmax(np.abs(shap_values).mean(0)))
    top_feat = feature_names[top_idx]
    plt.figure()
    shap.dependence_plot(top_feat, shap_values, X_te, show=False)
    plt.title(f"SHAP Dependence: {top_feat}")
    plt.tight_layout()
    out = OUTPUT_DIR / f"04_shap_dependence_{top_feat}.png"
    plt.savefig(out, dpi=120, bbox_inches="tight")
    plt.close()
    print(f"[Feat-shap] saved {out}")

    # (c) 局部解释: 单个样本为什么会得到这个预测
    sample_idx = 0
    plt.figure()
    shap.waterfall_plot(shap.Explanation(
        values=shap_values[sample_idx],
        base_values=explainer.expected_value,
        data=X_te.iloc[sample_idx].values,
        feature_names=list(feature_names),
    ), show=False)
    plt.title(f"SHAP Waterfall (single sample #{sample_idx})")
    plt.tight_layout()
    out = OUTPUT_DIR / f"05_shap_waterfall_sample{sample_idx}.png"
    plt.savefig(out, dpi=120, bbox_inches="tight")
    plt.close()
    print(f"[Feat-shap] saved {out}")

    # 数值摘要
    mean_abs = np.abs(shap_values).mean(0)
    rank = sorted(zip(feature_names, mean_abs), key=lambda kv: -kv[1])
    print("  SHAP mean|contribution| 排名:")
    for name, val in rank:
        print(f"    {name:20s} {val:.4f}")


# ---------- 5. Optuna 调参 ----------
def tune_with_optuna(X, y, n_trials: int = 30) -> dict:
    """5 折 CV + early_stopping。learning_rate 固定,调树结构和正则。
    收尾时再降 learning_rate 提 n_estimators(本示例跳过这一步,生产建议做)。
    """
    optuna.logging.set_verbosity(optuna.logging.WARNING)

    def objective(trial: optuna.Trial) -> float:
        params = dict(
            max_depth=trial.suggest_int("max_depth", 3, 10),
            min_child_weight=trial.suggest_float("min_child_weight", 1, 10),
            subsample=trial.suggest_float("subsample", 0.6, 1.0),
            colsample_bytree=trial.suggest_float("colsample_bytree", 0.5, 1.0),
            reg_alpha=trial.suggest_float("reg_alpha", 1e-3, 10, log=True),
            reg_lambda=trial.suggest_float("reg_lambda", 1e-3, 10, log=True),
            gamma=trial.suggest_float("gamma", 0, 5),
        )
        cv_rmse = []
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        for tr_idx, va_idx in kf.split(X):
            X_tr, X_va = X.iloc[tr_idx], X.iloc[va_idx]
            y_tr, y_va = y.iloc[tr_idx], y.iloc[va_idx]
            m = train_model(X_tr, X_va, y_tr, y_va, **params)
            pred = m.predict(X_va)
            cv_rmse.append(np.sqrt(mean_squared_error(y_va, pred)))
        return float(np.mean(cv_rmse))

    study = optuna.create_study(direction="minimize",
                                sampler=optuna.samplers.TPESampler(seed=42))
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)
    print(f"[Optuna] best_value(cv_rmse)={study.best_value:.4f}")
    print(f"[Optuna] best_params={study.best_params}")
    return study.best_params


# ---------- 主流程 ----------
def main() -> None:
    print("=" * 60)
    print("[1/6] Load data")
    X, y = load_data()
    splits = make_splits(X, y)

    print("\n" + "=" * 60)
    print("[2/6] Baseline train (early_stopping)")
    baseline = train_model(splits["X_tr"], splits["X_va"],
                           splits["y_tr"], splits["y_va"])

    print("\n" + "=" * 60)
    print("[3/6] Evaluate baseline on test set")
    evaluate(baseline, splits["X_te"], splits["y_te"], "baseline")

    print("\n" + "=" * 60)
    print("[4/6] Feature analysis (3 methods)")
    feature_names = list(X.columns)
    feature_importance_classic(baseline, feature_names)
    feature_importance_permutation(baseline, splits["X_te"], splits["y_te"],
                                   feature_names)
    feature_importance_shap(baseline, splits["X_te"], feature_names)

    print("\n" + "=" * 60)
    n_trials = int(os.environ.get("XGB_DEMO_TRIALS", "30"))
    print(f"[5/6] Tune with Optuna ({n_trials} trials × 5-fold CV)")
    # 调参在 train+val 上做,test 完全隔离
    X_tune = pd.concat([splits["X_tr"], splits["X_va"]])
    y_tune = pd.concat([splits["y_tr"], splits["y_va"]])
    best_params = tune_with_optuna(X_tune, y_tune, n_trials=n_trials)

    print("\n" + "=" * 60)
    print("[6/6] Retrain with best params, final eval on test set")
    final_model = train_model(splits["X_tr"], splits["X_va"],
                              splits["y_tr"], splits["y_va"], **best_params)
    evaluate(final_model, splits["X_te"], splits["y_te"], "tuned")

    print("\n[Done] 所有图片已保存到:", OUTPUT_DIR)
    print("  01_classic_importance.png        - 传统 weight/gain/cover 对比")
    print("  02_permutation_importance.png    - Permutation Importance")
    print("  03_shap_summary.png              - SHAP 全局(必看)")
    print("  04_shap_dependence_*.png         - SHAP 单特征非线性效应")
    print("  05_shap_waterfall_sample0.png    - SHAP 单样本解释")


if __name__ == "__main__":
    main()
