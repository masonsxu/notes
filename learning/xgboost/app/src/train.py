"""模型训练:XGBoost 多分类 + Optuna 调参 + SHAP 解释
================================================

流程:
  1. 加载数据 → 64/16/20 train/val/test
  2. baseline 训练(early_stopping)
  3. Optuna 调参(5 折 CV,trials 默认 30,可调小)
  4. 用最优参数重训 → test 集最终评估
  5. SHAP 全局/局部解释
  6. 保存 artifacts 到 models/

产物:
  models/model.json          XGBoost 模型(原生格式)
  models/metadata.json       特征列表、类别、超参、训练时间
  models/metrics.json        test 集各项指标 + 混淆矩阵
  output/05_confusion_matrix.png
  output/06_shap_summary.png
  output/07_shap_dependence_<top>.png

运行:
    cd learning/xgboost/app
    uv run python -m src.train                      # 默认 30 trials
    APP_TRAIN_TRIALS=10 uv run python -m src.train  # 快速验证
"""
from __future__ import annotations

import json
import os
import shutil
import time
from datetime import datetime
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
import optuna
import xgboost as xgb
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    f1_score, precision_score, recall_score, roc_auc_score,
)
from sklearn.model_selection import KFold, train_test_split

from .data import (
    CLASS_NAMES, APP_DIR, load_or_fetch,
    MODEL_PATH, METADATA_PATH, METRICS_PATH,
    derive_version_id, unique_version_dir, archive_current_model,
)

OUTPUT_DIR = APP_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)


def _setup_cjk_font() -> None:
    from matplotlib import font_manager
    for name in ["PingFang SC", "Heiti SC", "STHeiti",
                 "Noto Sans CJK SC", "Microsoft YaHei", "SimHei",
                 "Arial Unicode MS"]:
        if name in {f.name for f in font_manager.fontManager.ttflist}:
            plt.rcParams["font.sans-serif"] = [name, "DejaVu Sans"]
            plt.rcParams["axes.unicode_minus"] = False
            return


def make_splits(X: pd.DataFrame, y: pd.Series) -> dict:
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2,
                                              random_state=42, stratify=y)
    X_tr, X_va, y_tr, y_va = train_test_split(X_tr, y_tr, test_size=0.2,
                                              random_state=42, stratify=y_tr)
    return dict(X_tr=X_tr, X_va=X_va, X_te=X_te,
                y_tr=y_tr, y_va=y_va, y_te=y_te)


def train_model(X_tr, X_va, y_tr, y_va, *,
                class_names: list[str] = CLASS_NAMES, **params) -> xgb.XGBClassifier:
    defaults = dict(
        n_estimators=2000,
        learning_rate=0.1,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        early_stopping_rounds=50,
        eval_metric="mlogloss",
        objective="multi:softprob",
        num_class=len(class_names),
        tree_method="hist",
        random_state=42,
        n_jobs=-1,
    )
    defaults.update(params)
    model = xgb.XGBClassifier(**defaults)
    model.fit(X_tr, y_tr, eval_set=[(X_va, y_va)], verbose=False)
    return model


def evaluate(model, X_te, y_te, *,
             class_names: list[str] = CLASS_NAMES) -> dict:
    y_pred = model.predict(X_te)
    y_proba = model.predict_proba(X_te)
    metrics = {
        "accuracy": float(accuracy_score(y_te, y_pred)),
        "f1_macro": float(f1_score(y_te, y_pred, average="macro")),
        "precision_macro": float(precision_score(y_te, y_pred, average="macro")),
        "recall_macro": float(recall_score(y_te, y_pred, average="macro")),
        "roc_auc_ovr": float(roc_auc_score(y_te, y_proba, multi_class="ovr",
                                           average="macro")),
    }
    cm = confusion_matrix(y_te, y_pred, labels=list(range(len(class_names))))
    metrics["confusion_matrix"] = cm.tolist()
    metrics["classification_report"] = classification_report(
        y_te, y_pred, target_names=class_names, output_dict=True, digits=4)
    return metrics


def plot_confusion(cm: np.ndarray, *,
                   class_names: list[str] = CLASS_NAMES) -> None:
    fig, ax = plt.subplots(figsize=(6, 5))
    im = ax.imshow(cm, cmap="Blues")
    ax.set_xticks(range(len(class_names)))
    ax.set_yticks(range(len(class_names)))
    ax.set_xticklabels(class_names, rotation=30, ha="right")
    ax.set_yticklabels(class_names)
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.set_title("Confusion Matrix (test set)")
    # 格子里的数字
    thresh = cm.max() / 2
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, f"{cm[i, j]:,}",
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black",
                    fontsize=10)
    fig.colorbar(im, fraction=0.046, pad=0.04)
    plt.tight_layout()
    out = OUTPUT_DIR / "05_confusion_matrix.png"
    plt.savefig(out, dpi=120)
    plt.close(fig)
    print(f"[Train] saved {out}")


def tune_with_optuna(X: pd.DataFrame, y: pd.Series, n_trials: int, *,
                     class_names: list[str] = CLASS_NAMES) -> dict:
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
        cv_f1 = []
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        for tr_idx, va_idx in kf.split(X):
            m = train_model(X.iloc[tr_idx], X.iloc[va_idx],
                            y.iloc[tr_idx], y.iloc[va_idx],
                            class_names=class_names, **params)
            cv_f1.append(f1_score(y.iloc[va_idx], m.predict(X.iloc[va_idx]),
                                  average="macro"))
        return float(np.mean(cv_f1))

    study = optuna.create_study(direction="maximize",
                                sampler=optuna.samplers.TPESampler(seed=42))
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)
    print(f"[Optuna] best cv f1_macro = {study.best_value:.4f}")
    print(f"[Optuna] best params = {study.best_params}")
    return study.best_params


def explain_with_shap(model, X_te: pd.DataFrame, *,
                      class_names: list[str] = CLASS_NAMES) -> None:
    """SHAP TreeExplainer,多分类会返回 (n_samples, n_features, n_classes)。"""
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_te)

    # 多分类:取所有类别绝对值均值作为全局重要性
    if isinstance(shap_values, list):
        sv = np.stack([np.abs(s) for s in shap_values]).mean(0)
    elif shap_values.ndim == 3:
        sv = np.abs(shap_values).mean(axis=2)
    else:
        sv = np.abs(shap_values)

    # summary plot(对类别 0,展示方向性)
    target_class = 0
    sv_for_class = (shap_values[target_class]
                    if isinstance(shap_values, list)
                    else shap_values[..., target_class])
    plt.figure()
    shap.summary_plot(sv_for_class, X_te, show=False)
    plt.title(f"SHAP Summary - {class_names[target_class]}")
    plt.tight_layout()
    out = OUTPUT_DIR / "06_shap_summary.png"
    plt.savefig(out, dpi=120, bbox_inches="tight")
    plt.close()
    print(f"[Train] saved {out}")

    # dependence plot(全局最重要特征)
    top_idx = int(sv.mean(0).argmax())
    top_feat = X_te.columns[top_idx]
    plt.figure()
    shap.dependence_plot(top_feat, sv_for_class, X_te, show=False)
    plt.title(f"SHAP Dependence: {top_feat} ({class_names[target_class]})")
    plt.tight_layout()
    out = OUTPUT_DIR / f"07_shap_dependence_{top_feat}.png"
    plt.savefig(out, dpi=120, bbox_inches="tight")
    plt.close()
    print(f"[Train] saved {out}")


def run_training(df: pd.DataFrame, trials: int | None = None, *,
                 generate_shap: bool = False,
                 class_names_default: list[str] = CLASS_NAMES
                 ) -> tuple[dict, dict, str]:
    """在给定 DataFrame 上跑完整训练流程。

    流程:baseline → Optuna 调参 → 重训评估 → 归档旧模型 → 保存新 active + 版本归档。
    df 必须含 target 列(整数类别,0-based 连续)。返回 (metadata, metrics, version_id)。
    供 CLI 与 API 共用;API 路径传 generate_shap=False 跳过出图。
    """
    started = time.time()
    if "target" not in df.columns:
        raise ValueError("训练数据缺少 target 列")

    X = df.drop(columns=["target"])
    y = df["target"]
    feature_names = list(X.columns)

    num_class = int(y.nunique())
    class_names = list(class_names_default)
    if num_class > len(class_names):
        class_names += [f"Class {i}" for i in range(len(class_names), num_class)]
    class_names = class_names[:num_class]

    splits = make_splits(X, y)
    print(f"[Train] train={splits['X_tr'].shape}, val={splits['X_va'].shape}, "
          f"test={splits['X_te'].shape}, num_class={num_class}")

    print("[Train] baseline")
    baseline = train_model(splits["X_tr"], splits["X_va"],
                           splits["y_tr"], splits["y_va"], class_names=class_names)
    base_metrics = evaluate(baseline, splits["X_te"], splits["y_te"],
                            class_names=class_names)
    print(f"[Train] baseline test: acc={base_metrics['accuracy']:.4f}, "
          f"f1_macro={base_metrics['f1_macro']:.4f}, "
          f"auc_ovr={base_metrics['roc_auc_ovr']:.4f}")

    if trials is None:
        trials = int(os.environ.get("APP_TRAIN_TRIALS", "30"))
    print(f"[Train] Optuna tune ({trials} trials × 5-fold CV)")
    X_tune = pd.concat([splits["X_tr"], splits["X_va"]])
    y_tune = pd.concat([splits["y_tr"], splits["y_va"]])
    best_params = tune_with_optuna(X_tune, y_tune, trials, class_names=class_names)

    print("[Train] retrain with best params")
    final_model = train_model(splits["X_tr"], splits["X_va"],
                              splits["y_tr"], splits["y_va"],
                              class_names=class_names, **best_params)
    metrics = evaluate(final_model, splits["X_te"], splits["y_te"],
                       class_names=class_names)
    print(f"[Train] final test: acc={metrics['accuracy']:.4f}, "
          f"f1_macro={metrics['f1_macro']:.4f}, "
          f"auc_ovr={metrics['roc_auc_ovr']:.4f}")

    if generate_shap:
        plot_confusion(np.array(metrics["confusion_matrix"]),
                       class_names=class_names)
        sample_X = splits["X_te"].sample(n=min(2000, len(splits["X_te"])),
                                         random_state=42)
        explain_with_shap(final_model, sample_X, class_names=class_names)

    elapsed = time.time() - started

    # 先归档当前 active(幂等:已归档则跳过),再覆盖写新 active,最后把新版本也复制进 versions/
    archive_current_model()
    created_at = datetime.now().isoformat(timespec="seconds")
    version_id = derive_version_id(created_at)
    final_model.save_model(MODEL_PATH)
    metadata = {
        "version_id": version_id,
        "created_at": created_at,
        "model_type": "XGBClassifier",
        "objective": "multi:softprob",
        "num_class": num_class,
        "class_names": class_names,
        "feature_names": feature_names,
        "n_features": len(feature_names),
        "n_train_samples": int(len(splits["X_tr"]) + len(splits["X_va"])),
        "n_test_samples": int(len(splits["X_te"])),
        "best_iteration": int(final_model.best_iteration),
        "best_params": best_params,
        "baseline_test_metrics": {k: v for k, v in base_metrics.items()
                                  if not isinstance(v, (list, dict))},
        "training_seconds": round(elapsed, 1),
    }
    METADATA_PATH.write_text(json.dumps(metadata, ensure_ascii=False, indent=2))
    METRICS_PATH.write_text(json.dumps(metrics, ensure_ascii=False, indent=2,
                                       default=float))

    vdir = unique_version_dir(version_id)
    vdir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(MODEL_PATH, vdir / MODEL_PATH.name)
    shutil.copy2(METADATA_PATH, vdir / METADATA_PATH.name)
    shutil.copy2(METRICS_PATH, vdir / METRICS_PATH.name)

    print(f"[Train] saved active → {MODEL_PATH}")
    print(f"[Train] archived version → {vdir}")
    print(f"[Train] done in {elapsed:.1f}s, version_id={version_id}")
    return metadata, metrics, version_id


def main() -> None:
    _setup_cjk_font()
    print("=" * 60)
    print("[1/2] Load data")
    df = load_or_fetch()
    print("=" * 60)
    print("[2/2] Train (with SHAP explanation)")
    metadata, metrics, version_id = run_training(df, generate_shap=True)
    print(f"\n[Done] version_id={version_id}, "
          f"模型与元数据已保存到 {MODEL_PATH.parent}")


if __name__ == "__main__":
    main()
