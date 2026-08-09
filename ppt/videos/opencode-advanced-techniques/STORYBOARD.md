---
format: 1920x1080
duration: 120s
message: "工具已就位，差距在手法——变量不是模型能力，而是使用方式：把提问、配置、上下文管理做到位，用一个真实任务完整走一遍"
arc: Hook → Reframe(变量是使用方式) → Loop → 三因子 → 提问方法 → 配置 → PLAN-BUILD → Skill → 上下文 → 实战 → 认知 → CTA
audience: 半导体工程团队（已看过入门，进入工程化方法）
mode: collaborative
music: confident minimal tech underscore
angle: concept-explainer with process
---

## Video direction

- **Palette:** canvas `#0D1117` · panel `#161B22` · ink `#E6EDF3` / muted `#8B949E` · **blue `#58A6FF` = the ONE voltage per frame** · teal `#2DD4BF` = secondary. Status hues only for status. No pure black/white.
- **Type:** Noto Sans SC (Chinese headlines+body); JetBrains Mono (wordmark, kickers, code, numerals).
- **Motion grammar:** smooth long-tail `power3` (never bouncy); VO-paced reveal (t=0 only what VO says; rest on cue across back ~50%); held beats deliberate; subtle jitter only on holds; no breathing / back-half pan.
- **Caption band:** content in top ~83%; hero anchor y≈454.
- **Negative:** no real UI/cursors; no AI purple gradients; no front-load-freeze; no breathing.

## Frame 1 — Hook / wordmark
- scene: 暗场，"工具已就位——差距在手法"打出，opencode 单字标（蓝）落地
- voiceover: "工具已经就位。真正的差距——在手法。这是 opencode 的工程化使用。"
- duration: 7.248s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Counterintuitive claim + concept announcement
- beat: surprise + curiosity
- blueprint: kinetic-type-beats
narrativeRole: 撬开"会用了就行"的前提，引出"方法决定产出"。
keyMessage: 工具已就位，真正的变量是使用方式。

## Frame 2 — 聊天机器人 vs 编程智能体
- scene: 左右两面板：左"聊天机器人"止于对话，右"编程智能体"能动手；标"变量是使用方式"
- voiceover: "聊天机器人止于对话；编程智能体能动手。变量，不是模型能力，是使用方式。"
- duration: 8.208s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-compare.html
- type: product_intro
- persuasion: Comparison + subtractive framing
- beat: clarity + orientation
- blueprint: comparison-split
narrativeRole: 界定本支主角"编程智能体"，并立核心论点。
keyMessage: 决定产出的是使用方式，不是模型本身。

## Frame 3 — 工作循环
- scene: 闭环图：Plan 规划→确认门→Build 执行→验证→（未达标重试）；蓝色 dash-march 流动
- voiceover: "一个循环：Plan 规划，确认门拦截，Build 执行，验证交付。未达标，重试。"
- duration: 8.184s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/03-loop.html
- type: feature_showcase
- persuasion: Causal chain + progressive disclosure
- beat: comprehension + "aha"
- blueprint: spatial-pan-stations
narrativeRole: 给出贯穿全支的工作骨架。
keyMessage: Plan 只规划，确认门拦截，Build 执行，验证把关。

## Frame 4 — 产出三因子
- scene: 三个并排因子卡：提问具体度 / 配置覆盖度 / 上下文管理
- voiceover: "产出好坏，看三个因子：提问具体度、配置覆盖度、上下文管理。"
- duration: 6.672s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-factors.html
- type: feature_showcase
- persuasion: Numbered enumeration + frame-then-fill
- beat: foresight + momentum
- blueprint: grid-card-assemble
narrativeRole: 把"方法"拆成三个可操作杠杆，成为后续章节索引。
keyMessage: 三个因子决定产出质量，本支逐一展开。

## Frame 5 — 模糊 vs 具体指令
- scene: 左"帮我排查这个报错"（灰、死端）vs 右"data_analyzer.py L42 · KeyError wafer_id · test_results.csv"（蓝、可执行）
- voiceover: "'帮我排查报错'——系统未知、无可执行。给文件、行号、字段——才能定位根因。"
- duration: 8.088s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-prompt.html
- type: feature_showcase
- persuasion: Before/after + counterexample
- beat: comprehension + conviction
- blueprint: comparison-split
narrativeRole: 用对照让"提问具体度"立刻可感。
keyMessage: 具体到文件、行号、字段，指令才可执行。

## Frame 6 — 五段式提问
- scene: 5 段卡：①背景 ②目标 ③约束 ④输入 ⑤输出，依次点亮
- voiceover: "五段式提问：背景、目标、约束、输入、输出。不必写满，缺哪段补哪段。"
- duration: 8.28s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/06-five.html
- type: feature_showcase
- persuasion: Numbered enumeration + frame-then-fill
- beat: mastery + confidence
- blueprint: grid-card-assemble
narrativeRole: 给出可复用的提问模板。
keyMessage: 五段式把脑中默认成立的前提显式写出。

## Frame 7 — 配置：AGENTS.md 双层 + 术语
- scene: 上方双层卡：项目级（高优先）覆盖全局级（低优先）；下方术语消歧 Yield/Probe/DOE 通用义↔专业义
- voiceover: "配置分两层：项目级 AGENTS.md 优先，全局级兜底。术语，写清专业义。"
- duration: 8.256s
- transition_in: crossfade
- status: animated
- src: compositions/frames/07-config.html
- type: feature_showcase
- persuasion: Frame-then-fill + contrast（通用义 vs 专业义）
- beat: confidence + safety
- blueprint: grid-card-assemble
narrativeRole: 让工具稳定、可控——配置层与术语消歧。
keyMessage: 项目级覆盖全局级；术语写专业义避免误解。

## Frame 8 — 多轮 PLAN-BUILD
- scene: 第一轮（整体架构）→确认→第二轮（关键阶段深入）→确认→Build；确认门蓝高亮
- voiceover: "多轮规划，先粗后细。确认门设在执行前——返工成本最低的位置。"
- duration: 6.936s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/08-plan.html
- type: feature_showcase
- persuasion: Progressive disclosure + signposting
- beat: focus + confidence
- blueprint: spatial-pan-stations
narrativeRole: 升级工作流——多轮规划降低返工。
keyMessage: 先粗后细，确认门设在执行前。

## Frame 9 — SKILL 组合
- scene: 4 步串联：需求澄清→planning→Build+领域 Skill→review，节点依次点亮连成链
- voiceover: "单个 Skill 解决单领域；组合多个——才跑通跨环节流程。"
- duration: 5.544s
- transition_in: crossfade
- status: animated
- src: compositions/frames/09-skill.html
- type: feature_showcase
- persuasion: Causal chain + demonstration
- beat: comprehension + foresight
- blueprint: grid-card-assemble
narrativeRole: 从单点能力到端到端流程的跃迁。
keyMessage: 组合多个 Skill 才能跑通跨环节流程。

## Frame 10 — 上下文管理
- scene: 左：token 累积→时延/费用↑/注意力稀释；右：会话策略（不粘贴大文件/预处理/结构化输入）
- voiceover: "上下文随对话累积：时延、费用上升，注意力被稀释。不粘贴大文件，让它自行读取。"
- duration: 9.072s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/10-context.html
- type: feature_showcase
- persuasion: Causal chain + rule of three
- beat: unease + relief
- blueprint: comparison-split
narrativeRole: 揭示上下文成本，给出输入优化准则。
keyMessage: 该记的记，该清的清；不粘贴大文件。

## Frame 11 — 实战：文字→PPT 七步
- scene: 七步流水线 + 三个数字"35 页 · 100% 可编辑 · 0 图片"；步骤依次点亮
- voiceover: "实战：文字材料→可交付 PPT，七步走完。三十五页，百分之百可编辑。"
- duration: 8.04s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/11-case.html
- type: social_proof
- persuasion: Worked example + statistical proof
- beat: conviction + fascination
- blueprint: grid-card-assemble
narrativeRole: 用一个端到端真实案例证明方法论可行（亦为本系列 deck 自身的产出方式）。
keyMessage: 七步工作流把文字材料变成可交付 PPT。

## Frame 12 — 三个认知校正
- scene: 三行认知：①价值在端到端动手 ②环境能力决定路径 ③降级不等于失败
- voiceover: "三个认知：价值在端到端动手；环境能力决定路径；降级不等于失败。"
- duration: 7.416s
- transition_in: crossfade
- status: animated
- src: compositions/frames/12-cognition.html
- type: benefit_highlight
- persuasion: Rule of three + distillation
- beat: clarity + resolve
- blueprint: kinetic-type-beats
narrativeRole: 校正预期，让受众用对心态。
keyMessage: 端到端动手、先核查环境、降级留痕照样交付。

## Frame 13 — CTA
- scene: 暗场 + 蓝辉光，sign-off"用一个真实任务完整走一遍" + 蓝色 closing-cta pill
- voiceover: "工具已就位。用一个真实任务，完整走一遍——最直接的掌握方式。"
- duration: 6.576s
- transition_in: crossfade
- status: animated
- src: compositions/frames/13-cta.html
- type: cta
- persuasion: Direct address + callback
- beat: resolve + inspiration
- blueprint: cta-morph-press
narrativeRole: 行动召唤——用一个真实任务收束。
keyMessage: 用一个真实任务完整走一遍，是最直接的掌握方式。
