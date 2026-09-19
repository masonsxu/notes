# opencode 进阶与实战 · 练习素材包

配合《opencode 进阶与实战：建立工作体系，完成你的第一个项目》（`ppt/ppt2-workshop/opencode-advanced-practice.md`）使用的课堂素材。

## 内容

| 位置 | 用途 | 何时用 |
| --- | --- | --- |
| `data/` | w31–w34 四个批次的接触电阻模拟数据（CSV × 4） | 课前发放，课中作为项目唯一输入 |
| `reference/AGENTS.md` | 参考版 AGENTS.md（含全部口径与坑的沉淀） | 课后对照 |
| `reference/report-w31-w34.md` | 参考成品报告（数字与 data/ 完全一致） | 课后对照 |

## data/ 说明

- 列定义：`batch, wafer_id, die_x, die_y, rc_mohm`（单位 mΩ）
- 每批 3 片 wafer、每片 10×10 = 100 个 die，单文件 300 数据行
- 数据为脚本生成的模拟数据，非真实产线数据

## 使用提醒

- `reference/` 在课中**不要看**——先产出你自己的版本，再对照差异，学习效果才在
- 参考报告中的锚点数字只对本批数据成立；换一批数据，锚点要重算

## 讲师维护

数据由 `ppt/ppt2-workshop/scripts/gen_data.py` 生成（固定随机种子，仅标准库）：

```bash
uv run --no-project scripts/gen_data.py
```

脚本会同时输出统计总表、边缘/中心拆分与分箱频次表，并自校验数据埋点；改动种子或批次参数后，`reference/` 的全部数字必须重新核对。埋点设计见脚本头部注释。
