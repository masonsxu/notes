# Covertype 森林覆盖类型预测服务

基于 XGBoost 的森林覆盖类型 3 分类应用，从数据准备、特征分析、超参调优到 HTTP 推理服务，全流程闭环。本文件是 `app/` 子应用的工程文档，告诉你怎么把这套服务跑起来。理论部分见上层 `learning/xgboost/README.md`。

---

## 项目简介

预测目标是一片森林的地表覆盖类型，输入是地形、距离、土壤等 54 个特征，输出是三个树种类别之一：

| 编号 | 类别 | 含义 |
|------|------|------|
| 0 | Spruce/Fir | 云杉/冷杉 |
| 1 | Lodgepole Pine | 黑松 |
| 2 | Ponderosa Pine | 黄松 |

**数据集：** sklearn 内置的 Forest CoverType（UCI ML Repository 经典数据集）。原始 7 类，这里取样本量最大的前 3 类做 3 分类。每类采样 20000 条，共 60000 条平衡样本。

**特征构成（54 个）：**

- 10 个连续特征：Elevation（海拔）、Aspect、Slope、到水文/道路/火点的距离、Hillshade 光照索引等
- 4 个二值特征：Wilderness_Area_0~3（荒野区域）
- 40 个二值特征：Soil_Type_0~39（土壤类型）

**为什么选这个数据集：**

- 连续特征与稀疏二值特征混合，贴近真实业务场景，特征工程空间大
- 样本量够大（6 万条），XGBoost 的正则化、列抽样、缺失值处理等特性才显现得出来
- sklearn 原生支持，首次自动下载，之后读本地缓存，零外部数据依赖
- 是公认的树模型基准数据集，Elevation 作为判别力最强的特征这一结论有大量公开研究佐证

---

## 目录结构

```
app/
├── src/
│   ├── data.py        数据准备：下载/缓存 Covertype，生成 parquet + 特征 schema
│   ├── features.py    特征分析：分布、相关性、ANOVA，输出图表 + feature_summary.json
│   ├── train.py       训练：Optuna 调参 + XGBoost 多分类 + SHAP 解释
│   └── schemas.py     Pydantic 模型，API 请求/响应契约
├── api/
│   └── main.py        FastAPI 推理服务
├── web/
│   └── index.html     前端页面（Vue CDN，单文件），由 GET / 返回
├── data/              ★ 已生成：covertype.parquet + 特征 schema + 前端样本
├── models/            ★ 已生成：model.json + metadata.json + metrics.json
└── output/            ★ 已生成：7 张分析图 + feature_summary.json + train_log.txt
```

带 ★ 的目录产物已随仓库跑通生成，开箱即用。如果你想从头复现，删掉对应目录后按下面的快速开始执行即可。

---

## 快速开始

### 前置条件

依赖在仓库根 `pyproject.toml` 统一管理（xgboost、scikit-learn、optuna、shap、fastapi、uvicorn、pyarrow、pandas、matplotlib），`app/` 目录没有独立的 `pyproject.toml`。所有命令都通过仓库根的虚拟环境执行：

```
仓库根 venv: /Volumes/Vault/repos/github/notes/.venv/bin/python
应用目录:    /Volumes/Vault/repos/github/notes/learning/xgboost/app
```

下面的命令都假设你在 `app/` 目录下。先切过去：

```bash
cd /Volumes/Vault/repos/github/notes/learning/xgboost/app
```

### 1. 数据准备

```bash
/Volumes/Vault/repos/github/notes/.venv/bin/python -m src.data
```

首次运行会下载约 80MB 的 Covertype 数据集到 `~/scikit_learn_data/`，筛选 3 类、平衡采样后写入 `data/covertype.parquet`（zstd 压缩）。同时生成 `data/features.json`（特征 schema）和 `data/covertype_sample.{csv,json}`（前端预填样本）。之后运行直接读 parquet 缓存，秒级完成。

预期产出：`data/covertype.parquet`（约 830KB）、`data/features.json`、`data/covertype_sample.csv`、`data/covertype_sample.json`。

### 2. 特征分析

```bash
/Volumes/Vault/repos/github/notes/.venv/bin/python -m src.features
```

输出 4 张图到 `output/`：目标分布、连续特征分布、相关性热力图、类别箱线图；并生成 `data/feature_summary.json`（含 ANOVA F 值排名）。这一步帮你在训练前看清数据形态，判断哪些特征有判别力。

预期产出：`output/01_target_distribution.png`、`output/02_continuous_distribution.png`、`output/03_correlation_heatmap.png`、`output/04_class_boxplot_top.png`、`data/feature_summary.json`。

### 3. 训练模型

```bash
APP_TRAIN_TRIALS=30 /Volumes/Vault/repos/github/notes/.venv/bin/python -m src.train
```

`APP_TRAIN_TRIALS` 控制 Optuna 试验次数，默认 30。想快速验证流程可以用 `APP_TRAIN_TRIALS=3`，1 分钟内跑完。数据按 80/20 切分（48000 训练 / 12000 测试），训练含 early stopping、Optuna 调参、混淆矩阵、SHAP 全局摘要图和依赖图。

预期产出：`models/model.json`（XGBoost 原生格式）、`models/metadata.json`（参数与划分信息）、`models/metrics.json`（测试集指标）、`output/05_confusion_matrix.png`、`output/06_shap_summary.png`、`output/07_shap_dependence_Elevation.png`。

### 4. 启动推理服务

```bash
/Volumes/Vault/repos/github/notes/.venv/bin/uvicorn api.main:app --reload --port 8000
```

模型在启动时一次性载入内存。服务起来后：

- 前端页面：浏览器打开 http://localhost:8000
- Swagger 文档：http://localhost:8000/docs

`--reload` 适合开发，改代码自动重启。生产部署去掉 `--reload`，按需加 `--host 0.0.0.0`。

---

## API 文档

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 返回前端页面 `web/index.html` |
| GET | `/api/info` | 模型元信息 + 特征 schema（类别名、特征名、best_iteration、测试指标） |
| GET | `/api/sample` | 随机返回一条样本，可选 `?seed=42`，供前端预填表单 |
| POST | `/api/predict` | 单样本预测，返回三类概率；`?explain=true` 附带 SHAP top-5 贡献特征 |
| GET | `/api/health` | 健康检查 |

调用示例：

```bash
# 模型信息
curl http://localhost:8000/api/info

# 取一条随机样本（返回完整的 54 个特征 + true_label）
curl http://localhost:8000/api/sample
```

`/api/predict` 要求请求体带齐 54 个特征，少一个都返回 400。最省事的做法是先调 `/api/sample` 拿到完整特征，把它的 `features` 字段原样回填到预测请求里。下面用 `jq` 串起这两步，并附带 SHAP 解释：

```bash
# 取样本 → 直接预测（带 SHAP top-5）
curl -s http://localhost:8000/api/sample | \
  jq '{features}' | \
  curl -s -X POST "http://localhost:8000/api/predict?explain=true" \
    -H "Content-Type: application/json" \
    -d @- | jq
```

不装 `jq` 的话，手动把 `/api/sample` 返回的 `features` 对象贴到 `-d '{"features": { ... }}` 里即可。预测响应里 `probabilities` 是三类概率，`top_features` 是 SHAP 贡献最大的 5 个特征（仅 `?explain=true` 时返回）。

缺失特征的处理：入参按训练时的特征顺序对齐，缺的特征不会自动补 NaN，而是直接报 400 并列出缺哪些。所以请求体必须凑齐 54 项。

---

## 技术要点

**XGBoost 多分类。** 目标函数 `multi:softprob`，输出三类概率。`predict_proba` 取 argmax 作为预测类别，概率本身可用于阈值决策或置信度过滤。原生支持缺失值，54 个特征里若某项缺数据无需预填充。

**Optuna 调参。** 用 Optuna 搜索树结构参数（max_depth、min_child_weight）、抽样参数（subsample、colsample_bytree）和正则参数（reg_alpha、reg_lambda、gamma），配合 early stopping 自动定迭代轮数。相比 `GridSearchCV`，参数空间大时 Optuna 的 TPE 采样效率高得多。默认 30 trials，实测在 6 万样本上约 89 秒完成。

**SHAP 解释。** TreeExplainer 给出每个特征对每个样本、每个类别的贡献值。全局看 `output/06_shap_summary.png`，单特征非线性效应看 `output/07_shap_dependence_Elevation.png`，单次预测的局部解释走 `/api/predict?explain=true`。结论很一致：Elevation 是判别力最强的特征，ANOVA F 值 87558 排名第一（第二名 Wilderness_Area_3 仅 27914），SHAP 也最强。这符合 Covertype 数据集的已知规律，海拔直接决定树种分布。

**离线缓存数据。** 原始数据 58 万行，首次下载后筛 3 类、平衡采样到 6 万行，用 zstd 压缩成 parquet 存到 `data/`。这样做有三个好处：训练和特征分析读同一份快照保证可复现；parquet 列存读取比每次重新 fetch 快一个数量级；版本可控，数据变了能 diff 出来。原始下载包留在 `~/scikit_learn_data/`，删掉 parquet 重跑 `src.data` 即可重建。

---

## 已训练模型参考指标

当前 `models/` 下的模型测试集表现（30 trials Optuna 调参后）：

| 指标 | 调参后 | baseline（未调参） |
|------|--------|--------------------|
| accuracy | 0.9138 | 0.9253 |
| f1_macro | 0.9136 | 0.9251 |
| roc_auc_ovr | 0.9825 | 0.9857 |
| best_iteration | 1998 | - |

调参后指标略低于 baseline 是正常现象。这份数据相对干净，baseline 已接近上限，Optuna 在验证集上选的参数泛化到测试集时小幅波动。说明调参不是万能药，数据本身的质量和特征工程的天花板更关键。完整逐类指标见 `models/metrics.json`。

---

## 常见问题

**启动服务报 "model not found" 怎么办？**

API 启动时检查 `models/model.json` 是否存在，缺失会直接抛错。先跑一遍训练：

```bash
cd /Volumes/Vault/repos/github/notes/learning/xgboost/app
APP_TRAIN_TRIALS=3 /Volumes/Vault/repos/github/notes/.venv/bin/python -m src.train
```

`APP_TRAIN_TRIALS=3` 是快速验证模式，1 分钟左右生成可用的模型产物。

**想改训练量或试验次数怎么调？**

- 试验次数：改 `APP_TRAIN_TRIALS` 环境变量，数值越大搜索越充分但越慢
- 每类样本数：改 `src/data.py` 里的 `PER_CLASS_SAMPLE`（默认 20000），改完要删掉 `data/covertype.parquet` 重新生成
- 训练/测试划分比例：在 `src/train.py` 里调整，当前 80/20

**如何换成自己的数据？**

改 `src/data.py` 的 `load_or_fetch()` 和 `_build_dataset()`，让它返回一个 pandas DataFrame，要求：列是特征（数值型），最后一列叫 `target`（整数类别标签）。其余训练、特征分析、API 流程不用动。如果特征数变了，记得同步更新 `src/schemas.py` 的校验逻辑，API 会自动从 metadata 读取新的特征名。

**特征分析图表在哪看？**

全部在 `output/` 目录，PNG 格式。重点看 `06_shap_summary.png`（全局特征重要性）和 `07_shap_dependence_Elevation.png`（海拔的非线性效应），这两张能直接讲清楚模型在依赖什么做决策。
