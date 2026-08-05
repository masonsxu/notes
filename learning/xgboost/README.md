# XGBoost 学习笔记

XGBoost 系统化学习笔记:理论 → 实战 → 特征分析 → 调参,全流程闭环。

---

## 学习路径(6 阶段)

### 阶段 1:理论最小集(半天,不要超过)

不推公式,但要知道 XGBoost 在做什么,否则调参全凭玄学。

读两份资料即可,不要再多:

1. **陈天奇原论文** "XGBoost: A Scalable Tree Boosting System" (KDD 2016, arXiv:1603.02754)
   - 只读 Section 2 和 Section 3
   - 重点理解:目标函数 = 损失 + 正则,**二阶泰勒展开**近似(XGBoost 比 GBRT 快且准的关键)
   - **Sparsity-aware split finding**(缺失值如何自动学方向)
   - **列抽样**(借鉴 RF,降方差)

2. **官方 Introduction to Boosted Trees**
   https://xgboost.readthedocs.io/en/latest/tutorials/model.html
   陈天奇本人写的可视化教程,比任何中文博客都清晰。

**通过标准**:能用自己的话讲清楚——为什么 XGBoost 对缺失值不需要预填充?为什么 learning_rate 小了反而可能更好?

---

### 阶段 2:跑通 baseline(1 天)

**跳过** 鸢尾花、波士顿房价这种玩具数据。直接上 **Kaggle Home Credit Default Risk** 或 **House Prices: Advanced Regression Techniques**:
- 样本量足够大(几万到几十万),XGBoost 的特性才显现
- 有类别特征、缺失值、噪声——真实工程场景
- Kaggle 上有几百份公开高分 notebook 可对比

**任务**:
- 用 `XGBClassifier` / `XGBRegressor`(sklearn API)跑通 baseline
- 加 `early_stopping_rounds=50`,观察验证集曲线
- 用 `eval_metric` 看训练曲线

**本目录脚本** `xgboost_demo.py` 用 sklearn 自带的 California Housing(回归任务,2 万样本 × 8 特征)作为零依赖入门;切换到 Home Credit 的方式写在脚本顶部 docstring 里。

---

### 阶段 3:特征分析(2-3 天)— **重点**

按重要性**由低到高**学三套方法,**别只学第一套就停**:

| 方法 | 工具 | 局限 |
|---|---|---|
| `plot_importance` (weight/gain/cover) | XGBoost 内置 | weight 偏好低基数特征,gain 偏好连续特征,三种指标可能互相矛盾 |
| **Permutation Importance** | `sklearn.inspection.permutation_importance` | 模型无关,更稳健,但仍只有"重要性"无"方向" |
| **SHAP** (TreeExplainer) | `shap` 库 | **强烈推荐**。给出每个特征对每个样本的正/负贡献,beeswarm 图是当前业界特征分析的事实标准 |

**通过标准**:能解释清楚 SHAP summary plot 上一个红蓝色带的含义,并用 SHAP 依赖图分析单个特征的非线性效应。

---

### 阶段 4:调参闭环(2 天)

**经验顺序**(来自官方 + Owen Zhang 等竞赛高手经验):

```
Step 1: 固定 learning_rate=0.1, n_estimators 用 early_stopping 自动定
Step 2: 调树结构     → max_depth (3-10), min_child_weight (1-10)
Step 3: 调抽样       → subsample (0.6-1.0), colsample_bytree (0.5-1.0)
Step 4: 调正则       → reg_alpha, reg_lambda, gamma
Step 5: 收尾         → learning_rate 降到 0.01,n_estimators 相应放大
```

**用 Optuna**(`optuna.integration.XGBoostPruningCallback`)而不是 `GridSearchCV`——后者在参数空间大时是灾难。

**通过标准**:能讲清楚 `min_child_weight` 增大与 `max_depth` 减小,哪个对抑制过拟合更有效,为什么。

---

### 阶段 5:工程进阶(按需)

挑你实际会碰到的学:

- **类别特征原生处理**(XGBoost 1.5+):`enable_categorical=True` + pandas category dtype,不再需要 one-hot
- **GPU 训练**:`tree_method='hist'`, `device='cuda'`,大样本提速 5-20 倍
- **类别不平衡**:`scale_pos_weight` 不是无脑设成 `neg/pos`,要先看 eval 用的什么 metric
- **Monotonic constraints**:领域知识注入(如"价格越高,购买概率单调下降")
- **部署**:用 `treelite` 或 ONNX 把模型编译成无依赖的本地推理库

---

### 阶段 6:横向对比(半天,但必做)

至少跑一次 **XGBoost vs LightGBM vs CatBoost** 在同一数据集上的对比:

| 库 | 优势 | 劣势 |
|---|---|---|
| XGBoost | 生态最成熟,工程稳定性最好 | 训练速度不如 LightGBM |
| LightGBM | 训练快,leaf-wise 增长 | 容易过拟合(小数据上) |
| CatBoost | 类别特征处理最强,无需手动编码 | 生态较小,自定义不灵活 |

**不学这个,等于不知道为什么选 XGBoost**。

---

## 关键资源(全部权威源)

- **官方文档**:https://xgboost.readthedocs.io/
- **陈天奇原论文**:arXiv:1603.02754
- **SHAP 论文**:Lundberg & Lee, NeurIPS 2017, "A Unified Approach to Interpreting Model Predictions"
- **SHAP 文档**:https://shap.readthedocs.io/
- **Optuna**:https://optuna.org/
- **Kaggle Learn XGBoost**:https://www.kaggle.com/learn/xgboost

---

## 实战脚本

`xgboost_demo.py` —— 全流程最小可运行示例(310 行)。

```bash
cd learning/xgboost
uv run xgboost_demo.py                          # 默认 Optuna 30 trials
XGB_DEMO_TRIALS=3 uv run xgboost_demo.py        # 快速验证,~1 分钟
```

依赖通过 notes 仓库根目录的 `pyproject.toml` 管理,已包含:xgboost, scikit-learn, shap, optuna, matplotlib, pandas。

### 输出

5 张图到 `output/`(已 .gitignore,本地查看):

1. `01_classic_importance.png` — 传统 weight/gain/cover 对比
2. `02_permutation_importance.png` — Permutation Importance
3. `03_shap_summary.png` — **SHAP 全局(必看)**
4. `04_shap_dependence_*.png` — SHAP 单特征非线性效应
5. `05_shap_waterfall_sample0.png` — SHAP 单样本解释

### 验证结果参考

California Housing 数据集上的 baseline 表现:
- best_iter = 657(early_stopping 自动选定)
- test RMSE = 0.4479
- test R² = 0.8469
- SHAP 排名:Latitude > Longitude > MedInc > AveOccup > AveRooms > HouseAge > AveBedrms > Population

Optuna 调参(30 trials)后预计 RMSE 略有提升,但增益不大——California Housing 是相对干净的小数据集,基线已接近上限。**真实业务数据上的提升空间通常更大**。

---

## 学习目标

完成本笔记后,你应该能:

- 解释 XGBoost 训练过程(梯度提升、二阶导、正则化、列抽样)
- 用三种方法做特征分析,并知道各自的局限
- 按"经验顺序"调参,用 Optuna 自动化
- 选型时知道 XGBoost vs LightGBM vs CatBoost 的差异
- 处理类别特征、缺失值、不平衡样本
- 把模型部署到生产(treelite / ONNX)
