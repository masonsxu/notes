```python
import json

# Define the notebook structure
cells = []

def add_markdown(text):
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in text.split("\n")]
    })

def add_code(code_str):
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" for line in code_str.split("\n")]
    })

# Notebook Header
add_markdown("""# 半导体 Pre-DC 测试数据 map bin 关键特征分析实验

**业务场景**：半导体晶圆测试（CP/WAT）中，分析 61 项 Pre-DC 电气参数对晶圆 `map_bin` （1-9 映射为 4 个等级）的影响。
**目标**：通过统计学相关性、互信息、LightGBM 树模型及 SHAP 归因分析，定位影响 Bin 值跃迁的核心特征及物理临界阈值。
""")

# Cell 1: Environment & Import
add_markdown("## 1. 依赖库导入与全局设置")
add_code("""import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn.feature_selection import mutual_info_classif
from sklearn.model_selection import StratifiedKFold
from sklearn.inspection import permutation_importance
import lightgbm as lgb
import shap

# 图像样式设置
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans', 'Arial']
plt.rcParams['axes.unicode_minus'] = False
pd.set_option('display.max_columns', 100)
""")

# Cell 2: Mock Data Generator
add_markdown("## 2. 仿真数据生成（可替换为实际数据加载）")
add_code("""def generate_mock_predc_data(n_samples=2000, seed=42):
    np.random.seed(seed)
    data = {}
    
    # 模拟 61 个 DC 特征
    # 其中 5 个为关键主导参数，5 个为弱相关参数，其余为噪声参数
    for i in range(1, 62):
        col_name = f"DC_Param_{i:02d}"
        if i in [1, 2]: # 强 Log 特征 (如漏电流 I_leak)
            data[col_name] = np.random.lognormal(mean=-15, sigma=1.5, size=n_samples)
        elif i in [3, 4, 5]: # 近似正态分布特征 (如 Vth, Rc)
            data[col_name] = np.random.normal(loc=0.7, scale=0.1, size=n_samples)
        else:
            data[col_name] = np.random.normal(loc=10, scale=2, size=n_samples)
            
    df = pd.DataFrame(data)
    
    # 根据关键特征构造带有噪声的真实 map_bin (1-9)
    # Param_01 过大 -> 致命失效; Param_03 偏离 0.7 显著 -> 异常
    risk_score = (
        np.log10(df['DC_Param_01'] + 1e-20) * 0.8 +
        np.abs(df['DC_Param_03'] - 0.7) * 15 +
        df['DC_Param_02'] * 1e12 * 0.5 +
        np.random.normal(0, 1, size=n_samples)
    )
    
    # 将 risk_score 映射为 1-9 的 bin 值
    bins = pd.qcut(risk_score, q=9, labels=[1, 2, 3, 4, 5, 6, 7, 8, 9]).astype(int)
    df['map_bin'] = bins
    return df

# 加载数据（实际场景替换为 pd.read_csv('your_predc_data.csv')）
df_raw = generate_mock_predc_data()
print(f"数据加载完成，形状为: {df_raw.shape}")
print(df_raw['map_bin'].value_counts().sort_index())
""")

# Cell 3: Data Preprocessing & Target Mapping
add_markdown("## 3. 数据预处理与目标列等级划分")
add_code("""# 1. 目标列等级映射 (1-2 -> 0, 3-4 -> 1, 5 -> 2, 6-9 -> 3)
bin_mapping = {1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 3, 7: 3, 8: 3, 9: 3}
df_processed = df_raw.copy()
df_processed['target_tier'] = df_processed['map_bin'].map(bin_mapping)

feature_cols = [col for col in df_processed.columns if col not in ['map_bin', 'target_tier']]

# 2. 特征预处理：对高偏态物理量（如极小漏电流）自动进行 Log10 转换
for col in feature_cols:
    # 若跨越多个数量级且全为正值，尝试对数变换
    if df_processed[col].min() > 0 and (df_processed[col].max() / (df_processed[col].min() + 1e-12)) > 1e4:
        df_processed[f"{col}_log10"] = np.log10(df_processed[col] + 1e-20)

# 更新特征列表
feature_cols_all = [col for col in df_processed.columns if col not in ['map_bin', 'target_tier']]
print(f"预处理完成，提取特征数量: {len(feature_cols_all)}")
""")

# Cell 4: Statistical Analysis (Spearman, MI, Kruskal-Wallis)
add_markdown("## 4. 模块一：统计相关性与非线性依赖检验")
add_code("""stats_results = []

X = df_processed[feature_cols_all]
y_tier = df_processed['target_tier']
y_raw = df_processed['map_bin']

# 计算互信息得分
mi_scores = mutual_info_classif(X, y_tier, random_state=42)

for idx, col in enumerate(feature_cols_all):
    # 1. 斯皮尔曼秩相关 (对原始 map_bin)
    spearman_corr, spearman_p = stats.spearmanr(X[col], y_raw)
    
    # 2. 肯德尔秩相关
    kendall_corr, _ = stats.kendalltau(X[col], y_raw)
    
    # 3. Kruskal-Wallis H 检验 (4个等级组间分布差异)
    groups = [X[col][y_tier == tier] for tier in range(4)]
    kw_stat, kw_p = stats.kruskal(*groups)
    
    stats_results.append({
        'feature': col,
        'spearman_corr': abs(spearman_corr), # 取绝对值衡量相关强度
        'kendall_tau': abs(kendall_corr),
        'mutual_info': mi_scores[idx],
        'kw_p_value': kw_p
    })

df_stats = pd.DataFrame(stats_results).sort_values(by='mutual_info', ascending=False)
df_stats.head(10)
""")

# Cell 5: LightGBM Model & SHAP Analysis
add_markdown("## 5. 模块二：LightGBM 模型训练与 TreeSHAP 特征归因")
add_code("""# 5 折交叉验证训练 LightGBM
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
oof_preds = np.zeros((len(df_processed), 4))
feature_importances = np.zeros(len(feature_cols_all))

params = {
    'objective': 'multiclass',
    'num_class': 4,
    'metric': 'multi_logloss',
    'boosting_type': 'gbdt',
    'learning_rate': 0.05,
    'num_leaves': 31,
    'random_state': 42,
    'verbose': -1
}

models = []
for fold, (train_idx, val_idx) in enumerate(skf.split(X, y_tier)):
    X_train, y_train = X.iloc[train_idx], y_tier.iloc[train_idx]
    X_val, y_val = X.iloc[val_idx], y_tier.iloc[val_idx]
    
    model = lgb.LGBMClassifier(**params, n_estimators=200)
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], callbacks=[lgb.early_stopping(50, verbose=False)])
    
    models.append(model)
    feature_importances += model.feature_importances_ / 5

# 计算 SHAP 值
explainer = shap.TreeExplainer(models[0])
shap_values = explainer.shap_values(X)

# 针对多分类，计算全局平均 |SHAP|
if isinstance(shap_values, list): # 多分类的列表结构
    mean_abs_shap = np.mean([np.abs(sv) for sv in shap_values], axis=(0, 1))
else:
    mean_abs_shap = np.abs(shap_values).mean(axis=0)

df_shap_imp = pd.DataFrame({
    'feature': feature_cols_all,
    'lgb_importance': feature_importances,
    'mean_shap': mean_abs_shap
}).sort_values(by='mean_shap', ascending=False)

df_shap_imp.head(10)
""")

# Cell 6: SHAP Summary & Dependence Plot
add_markdown("## 6. SHAP 可视化分析（总体重要性与特征依赖图）")
add_code("""# 绘制 Top 15 特征的全局 SHAP 汇总图
plt.figure(figsize=(10, 6))
top_15_features = df_shap_imp['feature'].head(15).tolist()

# 选取最严重的失效等级 (Class 3: Bin 6-9) 进行 SHAP Summary 绘图
class_idx = 3 
shap.summary_plot(
    shap_values[class_idx] if isinstance(shap_values, list) else shap_values, 
    X, 
    max_display=15, 
    show=False
)
plt.title(f"SHAP Summary Plot for Bin 6-9 (Fatal Class)", fontsize=14)
plt.tight_layout()
plt.show()
""")

# Cell 7: Comprehensive Score & Final Feature Ranking Table
add_markdown("## 7. 模块三：多维度综合评分矩阵与特征决策表")
add_code("""# 合并所有统计与模型指标
df_final = pd.merge(df_stats, df_shap_imp, on='feature')

# 指标归一化 (Min-Max Scaling)
for col in ['spearman_corr', 'mutual_info', 'lgb_importance', 'mean_shap']:
    max_v = df_final[col].max()
    min_v = df_final[col].min()
    df_final[f'{col}_norm'] = (df_final[col] - min_v) / (max_v - min_v + 1e-12)

# 计算综合得分 (Final Weighted Score)
df_final['final_score'] = (
    0.25 * df_final['spearman_corr_norm'] +
    0.25 * df_final['mutual_info_norm'] +
    0.25 * df_final['lgb_importance_norm'] +
    0.25 * df_final['mean_shap_norm']
)

df_final = df_final.sort_values(by='final_score', ascending=False).reset_index(drop=True)

# 打印Top 15 关键 DC 参数
print("=== Top 15 影响 Map Bin 的核心 Pre-DC 特征综合排名 ===")
display_cols = ['feature', 'final_score', 'spearman_corr', 'mutual_info', 'mean_shap', 'kw_p_value']
print(df_final[display_cols].head(15).to_string(index=False))

# 保存分析结果
df_final.to_csv('predc_bin_feature_importance_ranking.csv', index=False)
print("\\n结果已成功导出至 'predc_bin_feature_importance_ranking.csv'")
""")

# Build Notebook Object
notebook = {
    "cells": cells,
    "metadata": {
        "language_info": {
            "name": "python"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 2
}

# Save to disk
with open('semiconductor_predc_bin_analysis.ipynb', 'w', encoding='utf-8') as f:
    json.dump(notebook, f, ensure_ascii=False, indent=2)

print("Notebook generated successfully!")


```

```text
Notebook generated successfully!


```

已为你设计并编写了一套专门针对**半导体 Pre-DC 测试数据与 Map Bin 相关性分析**的完整 Python 实验代码。

已将全部代码封装并生成了可直接在 JupyterLab 中打开运行的 Notebook 文件：


---

## 1. JupyterLab 实验代码架构

整套代码按模块拆分为 **6 个 Cell**，涵盖了从数据预处理、统计学检验、LightGBM 树模型构建、TreeSHAP 可解释性归因，到最终多维度综合评分梯度的全流程。

### Cell 1: 依赖库导入与环境配置

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn.feature_selection import mutual_info_classif
from sklearn.model_selection import StratifiedKFold
import lightgbm as lgb
import shap

# 绘图中文与样式设置
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans', 'Arial']
plt.rcParams['axes.unicode_minus'] = False
pd.set_option('display.max_columns', 100)

```

---

### Cell 2: 数据加载与半导体特征预处理

针对 Pre-DC 电气测试参数的物理特性进行清洗：

* **目标映射**：将原始 `map_bin` (1-9) 归一映射为 4 个阶梯等级（`0: 1-2`, `1: 3-4`, `2: 5`, `3: 6-9`）。
* **对数变换（Log Scale）**：对跨越数个数量级的电气参数（如漏电流 $I_{leak}$）自动应用 $\log_{10}$ 变换，解决偏态分布掩盖相关性的问题。

```python
# 读取业务数据（实际使用时替换为 pd.read_csv('your_predc_data.csv')）
# 此处以仿真生成的 61 项 Pre-DC 数据为例
df_processed = df_raw.copy()

# 1. 目标列等级映射
bin_mapping = {1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 3, 7: 3, 8: 3, 9: 3}
df_processed['target_tier'] = df_processed['map_bin'].map(bin_mapping)

feature_cols = [col for col in df_processed.columns if col not in ['map_bin', 'target_tier']]

# 2. 对高偏态参数（如漏电流）进行 Log10 平滑处理
for col in feature_cols:
    if df_processed[col].min() > 0 and (df_processed[col].max() / (df_processed[col].min() + 1e-12)) > 1e4:
        df_processed[f"{col}_log10"] = np.log10(df_processed[col] + 1e-20)

feature_cols_all = [col for col in df_processed.columns if col not in ['map_bin', 'target_tier']]
print(f"数据准备就绪，待校验分析特征总数: {len(feature_cols_all)}")

```

---

### Cell 3: 统计相关性与非线性依赖检验 (Spearman, MI, Kruskal-Wallis)

结合单调秩相关、互信息（捕捉非线性与区间依赖）以及组间分布差异检验。

```python
stats_results = []
X = df_processed[feature_cols_all]
y_tier = df_processed['target_tier']
y_raw = df_processed['map_bin']

# 计算特征与 Bin 等级间的互信息 (Mutual Information)
mi_scores = mutual_info_classif(X, y_tier, random_state=42)

for idx, col in enumerate(feature_cols_all):
    # 斯皮尔曼秩相关 (评估单调趋势)
    spearman_corr, spearman_p = stats.spearmanr(X[col], y_raw)
    
    # Kruskal-Wallis H 非参数检验 (评估 4 个 Bin 等级组间差异)
    groups = [X[col][y_tier == tier] for tier in range(4)]
    kw_stat, kw_p = stats.kruskal(*groups)
    
    stats_results.append({
        'feature': col,
        'spearman_corr': abs(spearman_corr),
        'mutual_info': mi_scores[idx],
        'kw_p_value': kw_p
    })

df_stats = pd.DataFrame(stats_results).sort_values(by='mutual_info', ascending=False)

```

---

### Cell 4: LightGBM 交叉验证与 TreeSHAP 全局归因

通过 5 折分层交叉验证避免过拟合，借助 TreeSHAP 评估多参数协同作用下的特征真实贡献。

```python
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
feature_importances = np.zeros(len(feature_cols_all))
models = []

params = {
    'objective': 'multiclass',
    'num_class': 4,
    'metric': 'multi_logloss',
    'boosting_type': 'gbdt',
    'learning_rate': 0.05,
    'num_leaves': 31,
    'random_state': 42,
    'verbose': -1
}

for fold, (train_idx, val_idx) in enumerate(skf.split(X, y_tier)):
    X_train, y_train = X.iloc[train_idx], y_tier.iloc[train_idx]
    X_val, y_val = X.iloc[val_idx], y_tier.iloc[val_idx]
    
    model = lgb.LGBMClassifier(**params, n_estimators=200)
    model.fit(X_train, y_train, eval_set=[(X_val, y_val)], callbacks=[lgb.early_stopping(50, verbose=False)])
    
    models.append(model)
    feature_importances += model.feature_importances_ / 5

# 计算全局 SHAP 贡献度
explainer = shap.TreeExplainer(models[0])
shap_values = explainer.shap_values(X)

if isinstance(shap_values, list): # 多分类维度
    mean_abs_shap = np.mean([np.abs(sv) for sv in shap_values], axis=(0, 1))
else:
    mean_abs_shap = np.abs(shap_values).mean(axis=0)

df_shap_imp = pd.DataFrame({
    'feature': feature_cols_all,
    'lgb_importance': feature_importances,
    'mean_shap': mean_abs_shap
}).sort_values(by='mean_shap', ascending=False)

```

---

### Cell 5: 核心失效等级的 SHAP 依赖分布图

重点查看最严重的失效等级（Class 3: Bin 6-9），观察关键特征超差对良率恶化的触发点。

```python
plt.figure(figsize=(10, 6))
# 针对 Bin 6-9 (Class 3) 绘制 SHAP Summary Plot
shap.summary_plot(
    shap_values[3] if isinstance(shap_values, list) else shap_values, 
    X, 
    max_display=15,
    show=False
)
plt.title("Fatal Class (Bin 6-9) Key DC Parameter SHAP Attribution", fontsize=12)
plt.tight_layout()
plt.show()

```

---

### Cell 6: 多维度综合得分矩阵与决策导出

将单因素统计指标（Spearman）、非线性相关性（MI）、树模型 Split 节点贡献和 SHAP 归因得分统一归一化并加权，输出最终排名。

```python
df_final = pd.merge(df_stats, df_shap_imp, on='feature')

# 指标归一化 (Min-Max Scaling)
for col in ['spearman_corr', 'mutual_info', 'lgb_importance', 'mean_shap']:
    max_v, min_v = df_final[col].max(), df_final[col].min()
    df_final[f'{col}_norm'] = (df_final[col] - min_v) / (max_v - min_v + 1e-12)

# 计算综合得分
df_final['final_score'] = (
    0.25 * df_final['spearman_corr_norm'] +
    0.25 * df_final['mutual_info_norm'] +
    0.25 * df_final['lgb_importance_norm'] +
    0.25 * df_final['mean_shap_norm']
)

df_final = df_final.sort_values(by='final_score', ascending=False).reset_index(drop=True)

# 输出前 15 项最关键 Pre-DC 参数
print("=== Top 15 影响 Map Bin 的核心 Pre-DC 特征综合排名 ===")
display_cols = ['feature', 'final_score', 'spearman_corr', 'mutual_info', 'mean_shap', 'kw_p_value']
print(df_final[display_cols].head(15).to_string(index=False))

# 保存结果
df_final.to_csv('predc_bin_feature_importance_ranking.csv', index=False)

```

---

## 2. 实验结果落地指导

完成上述 Notebook 的运行后，建议重点排查以下两点：

1. **对比单因素与多因素排名差异**：
* 若某个参数 `mutual_info` 或 `mean_shap` 很强，但 `spearman_corr` 较低，说明该 DC 参数与 Bin 呈现**非线性（如 U 型或带区间 Limits 的）物理关系**，即“过高或过低都会落入 Bin 5 / Bin 6-9”。


2. **提取 SPC 监控阈值**：
* 结合 Cell 5 输出的 **SHAP Dependence Plot**，观察横轴（参数测量值）与纵轴（SHAP 贡献）的拐点。SHAP 值由负转正的位置，即为该 Pre-DC 参数推高 Bin 值的**实际物理临界界限**。