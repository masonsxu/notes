# PPT 项目 · 阶段接力文档（HANDOFF）

> **当前状态**：第一阶段（证据分析 + SCR + 逐页大纲）✅ 已完成并经用户确认；第二阶段风格样张 ✅ 已确认（风格 4）；**待在具备图像生成 + PPT 渲染的环境继续**。
> **暂停原因**：当前环境无 ImageGen（无法生成逐页蓝图位图）、无 LibreOffice/PowerPoint（无法做渲染视觉 QA），无法满足 CyberPPT 技能第二/三阶段硬门槛。用户选择方案 B：换环境再做。

---

## 一、新环境必须具备的能力

| 能力 | 用途 | 检查命令 |
|---|---|---|
| **ImageGen 图像生成**（OpenAI gpt-image / DALL·E / 其他） | 第二阶段逐页 16:9 蓝图位图 | 确认有可调用的图像生成工具或 API |
| **LibreOffice (`soffice`) 或 PowerPoint** | 第三阶段 PPTX→PNG 渲染、视觉 QA 对照 | `which soffice` 或确认有 PowerPoint |
| **Node.js + PptxGenJS** | 第三阶段正式 PPTX 生成（技能强制，禁用 python-pptx） | `node -v` + `npm i pptxgenjs` |
| **Python 3 + python-pptx + Pillow** | QA 辅助脚本（测量/对照/裁图） | `pip install python-pptx Pillow` |
| **CyberPPT 技能目录** | scripts（validate_pptx.py 等）+ assets/icons + assets/palette-samples | 默认在 `~/.pi/agent/skills/cyber-ppt/` |

> 三条硬门槛：①必须有图像生成；②必须有渲染器；③第三阶段 PPTX 必须用 PptxGenJS。缺任意一条即无法走完整 CyberPPT 流程。

---

## 二、已确认的全部决策（不要再问）

1. **项目**：两份 PPT —— PPT1《公司大模型工具使用入门》、PPT2《大模型成本优化与高级功能配置》。
2. **页数**：PPT1 = **17 页**（Demo 全加，分3页每页2个）；PPT2 = **18 页**。合计 35 页。
3. **品牌统一**：两份 PPT **共用同一套视觉风格**。
4. **视觉风格（已确认）**：**风格 4「象牙白 + 深蓝强调」**。
   - 底色 `#F7F6F0`；标题 `#101820`；正文 `#303030`；次级 `#6F7275`；线条 `#C9CDD1`；强调 `#12355B`
   - 适用：科技 / SaaS / B2B / 企业数字化 / AI Agent 报告 —— 与"大模型工具平台"主题高度契合，既适合 PPT1 新人教学，又适合 PPT2 老板/TL 汇报。
5. **PPT1 语调**：面向新人，**手把手教学**（口语化、命令/模板代码块突出、强调色高亮操作）。
6. **PPT2 效果数据口径**：效果百分比（成本降60%+、单次降50%等）**未做过测试**，PPT 只表述"**大概/预估效果（待实测验证）**"，绝不写成已实现成果。
7. **跨 PPT 承接**：PPT1 结尾承接 PPT2；PPT2 回链 PPT1（"新人入门见 PPT1"）。
8. **Demo（PPT1）**：6 个 Demo 全保留，分 3 页（①②文件邮件+CPK / ③④SOP+PPT大纲 / ⑤⑥DOE+调研）。

---

## 三、已产出文件（换环境后直接读取，无需重做）

```
/Volumes/Vault/repos/github/notes/
├── PPT1-公司大模型工具使用入门.md          # 源材料
├── PPT2-大模型成本优化与高级功能配置.md     # 源材料
└── PPT-项目/
    ├── HANDOFF-接力文档.md                 # ← 本文件
    ├── PPT1-入门/analysis/
    │   ├── 01-evidence-table.md            # 38 条证据（E01-E38）
    │   └── 02-storyline-and-outline.md     # SCR + 17 页逐页大纲（v2 已确认）
    └── PPT2-成本优化/analysis/
        ├── 01-evidence-table.md            # 36 条证据（E01-E36）
        └── 02-storyline-and-outline.md     # SCR + 18 页逐页大纲（已确认）
```

> 若新环境不共享此磁盘，请把 `PPT-项目/` 整个目录和两份源 `.md` 一起拷过去。

---

## 四、接力起点（新环境里从这一步继续）

已完成阶段：**第一阶段全部 + 第二阶段风格样张确认**。

**下一步 = 第二阶段·逐页蓝图子阶段**，顺序：

1. 读取 `references/visual-system.md`，**锁定视觉系统记录**（页面尺寸 13.333×7.5 英寸、安全边距、列网格、15 级 Typography Scale C0/T1-T14、字体族、Style 4 色板、图表配色、表格样式、页眉页脚、SO WHAT 栏、间距节奏、**图标库锁定一个**：chunk-filled / tabler-filled / tabler-outline / phosphor-duotone 四选一）。
2. 为每页先建 `slide_content_lock`（用 `scripts/build_content_lock.py`，内容来自已确认证据表+大纲，**真实文案/数据**）。
3. 用 **ImageGen** 为全部 35 页生成 16:9 蓝图位图（每页 prompt 必须含锁定风格编号 4、色板、`target_language=zh`、密度目标、组件清单）。**禁止**用 PptxGenJS/python-pptx/HTML/SVG/canvas/matplotlib 画蓝图。
4. 每页蓝图确认后冻结 `blueprint_component_signature`（`scripts/build_component_signature.py`）+ `visual_element_registry`（`scripts/measure_blueprint.py`），记录路径与 SHA-256。
5. **第二次确认门**：向用户展示逐页蓝图，获批准后进入第三阶段。

**第三阶段**（逐页 PptxGenJS 还原 + PowerPoint 渲染 QA + 逐页验收 + 合并）严格按 `references/ppt-production.md`、`references/quality-assurance.md` 与 SKILL.md 执行：逐页制作、逐页验收，**不得一次性生成完整 deck 作为终版**。

---

## 五、给新环境的执行提醒

- 默认目标语言 = **中文**（源材料主语言）；代码命令/英文专有名词（如 `npm install -g cimicode-tui`、SECS/GEM、Overdrive）作为 `allowed_foreign_terms` 保留。
- 每页蓝图 prompt 与最终 manifest 必须记录 `target_language=zh`、`language_source=source_material`、`effective_language=zh`，且这些元数据**不得作为可见文字**出现在画面里。
- 表格页（模型一览、权限分级、模型选择映射、措施效果矩阵等）正文按语义登记 T7/T10，不得用 T11。
- 含中心图/流程图/架构图的页（核心概念四支柱、Plan-Build 流程、落地路线图）必须做空间锚点 + 标签避让检查。
- 风格 4 的页面表面系统：象牙白连续纸面 + 深蓝强调 + 细线条分区，**不得**降级成大面积纯白卡片堆叠。
