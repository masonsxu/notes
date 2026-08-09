---
format: 1920x1080
duration: 120s
message: "opencode 不是聊天框，而是能读写文件、执行命令的 Code Agent——打开项目、Plan 先审、Build 执行，今天交付首个真实任务"
arc: Hook → Reframe(chat→Code Agent) → Mechanism(tool layer) → Payoff(deliverables) → How-to(context + Plan/Build) → Proof → Demo → CTA
audience: 半导体工程团队（资深工程师 + 新人 / 非编程岗）
mode: collaborative
music: confident minimal tech underscore
angle: concept-explainer with process
---

## Video direction

- **Palette (from frame.md, never invent):** canvas `#0D1117` ground · panel `#161B22` (+1 step) · ink `#E6EDF3` text / `#8B949E` muted · teal `#2DD4BF` = the ONE voltage per frame · blue `#58A6FF` = secondary signal (the tool layer / Code Agent idea). Status hues only for status. No pure black/white, no fourth hue.
- **Type (by role):** Noto Sans SC for Chinese headlines + body; JetBrains Mono for the `opencode` wordmark, kickers, code/terminal, and all numerals.
- **Motion grammar:** smooth long-tail settles (`power3`) — never bouncy/overshoot. **VO-paced reveal** on every frame: at t=0 only what the VO is saying enters; each further piece (line / layer / node / card / stat) reveals on its spoken cue, spread across the back ~50%. Held beats are deliberate. During a hold: **subtle jitter only** — no lazy breathing, no back-half pan/push (stillness beats bad motion). Entrances use `fromTo`; no `repeat`/`yoyo`, no `Math.random`.
- **Rhythm / held-frame allocation:** most frames reveal to the VO; F4 ends on a held trio (breather before breadth), F9 lands then holds (measured, no overclaim), F12 (thesis) + F13 (CTA) are the still climax/close.
- **Caption band:** narration + zh captions ON — keep all primary content in the **top ~83%**; a centered hero anchors at **y ≈ 0.42 × 1080 ≈ 454**, not the canvas midpoint. Background/ambient/surface layers may stay full-bleed.
- **Negative list:** no real UI/cursors EXCEPT the reconstructed terminal in F6/F10 (the topic IS the terminal); no AI purple/blue gradients; no front-load-then-freeze (slideshow); no breathing / drifting / many-things-floating (screensaver).

## Frame 1 — Hook / wordmark

- scene: 暗场，一句反问打出，随后 opencode 单字标落地，teal 辉光缓动
- voiceover: "你以为大模型只能聊天？有一种——能读你的文件，跑你的命令。它叫 opencode。"
- duration: 8.064s
- poster: 6s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Counterintuitive claim + concept announcement
- beat: surprise + curiosity
- blueprint: kinetic-type-beats

narrativeRole: 打开认知缺口——把"大模型=聊天"的前提撬开，引出主角 opencode。
keyMessage: 存在一种能直接动手（读写文件、执行命令）的大模型工具，它叫 opencode。
blueprint: kinetic-type-beats (Adapt → wordmark lockup finish)
focal: the `opencode` mono wordmark
roles: reframe line = foreground (early) · wordmark = hero (center) · ambient teal/blue radials = background · mono index = supporting
sfx: whoosh-soft, blip
Scene 1 (0.0–2.2s): dark canvas; two soft ambient-glow radials drift in (`ambient-glow-bloom`); reframe line "你以为大模型只能聊天？" enters per-word staggered reveal (`dynamic-content-sequencing`, `power3`); Centered-upper, y≈0.28.
Scene 2 (2.2–5.5s): on "能读你的文件，跑你的命令" two mono keyword chips (读文件 · 跑命令) pop beneath via `spring-pop-entrance`.
Scene 3 (5.5–8.0s): reframe + chips `scale-swap-transition` out; `opencode` wordmark lands dead-center (teal, mono) with a mono index "· 工具使用入门" beneath; hold — subtle jitter only. Layout: centered hero, ≥3 depth layers (glow / mid / wordmark).

## Frame 2 — 聊天应用 vs Code Agent

- scene: 左右两个 hairline 面板：左"聊天应用"止于文本（死端），右"Code Agent"多出一层工具执行层，teal 连线点亮
- voiceover: "普通聊天应用，止于一段文本。Code Agent，多了一层——工具执行层。"
- duration: 6.96s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-compare.html
- type: product_intro
- persuasion: Comparison of two options + subtractive framing（先说"不是什么"）
- beat: clarity + orientation
- blueprint: comparison-split

narrativeRole: 命名核心概念——用对照界定 Code Agent 的本质差异（多了一层执行层）。
keyMessage: Code Agent 与聊天应用的区别，是多了一个能真正执行 I/O 的工具层。
blueprint: comparison-split (Reproduce)
focal: the teal "工具执行层" node on the right panel
roles: left panel (聊天应用) = supporting · right panel (Code Agent) = foreground · tool-layer node = hero · connectors = supporting
sfx: whoosh-soft
Scene 1 (0.0–2.5s): two hairline panels enter from opposite wings via `split-tilt-cards`; left "聊天应用" + a dead-end "文本" node; right "Code Agent" label.
Scene 2 (2.5–5.0s): on "多了一层——工具执行层" the right panel gains a teal tool-layer node (`layer-reveal`); a teal connector draws (`svg-path-draw`) model→tool→文件系统/终端命令; left stays a dead-end.
Scene 3 (5.0–7.0s): hold the asymmetry; the teal node `ambient-glow-bloom` once; settle still. Split-screen, mirrored, ≥3 depth layers.

## Frame 3 — 工具执行层（function calling 闭环）

- scene: 架构图：用户 → 大模型 → 工具层 → 文件系统 / 终端命令；teal 连线 dash-march 流动，标注 ①推理 ②执行 ③观测 ④再推理
- voiceover: "大模型只产出调用意图。真正读写文件、执行命令的，是宿主程序。推理、执行、观测、再推理——一个闭环。"
- duration: 11.76s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/03-arch.html
- type: feature_showcase
- persuasion: Progressive disclosure + causal chain
- beat: comprehension + "aha"
- blueprint: spatial-pan-stations

narrativeRole: 揭示机制——拆解工具层如何把"调用意图"变成"真实执行"，建立工程师能接受的因果链。
keyMessage: 大模型只给意图，宿主程序执行；由此带来可控的拦截点（权限）。
blueprint: spatial-pan-stations (Adapt → closed loop finish)
focal: the closed loop 推理→执行→观测→再推理
roles: nodes (用户/大模型/宿主程序/文件系统/终端) = foreground · loop arrows = supporting · glow = background
sfx: tick, dash-flow
Scene 1 (0.0–3.0s): base 用户→大模型; on "大模型只产出调用意图" a "调用意图" token travels model→宿主 via a teal `dash-march` connector.
Scene 2 (3.0–7.0s): on "真正读写文件、执行命令的，是宿主程序" the 宿主程序 + 文件系统 / 终端命令 nodes reveal via `center-outward-expansion`; teal connectors draw.
Scene 3 (7.0–11.8s): on "推理、执行、观测、再推理——一个闭环" four phase chips light in sequence around the loop; a teal `dash-march` runs the closed loop; hold. Asymmetric 60/40, dense diagram + caption rail.

## Frame 4 — 输出是可交付物

- scene: 单行 statement：一段文本 → 三件交付物（改好的代码 / 跑通的脚本 / 整理好的报告）依次浮现
- voiceover: "所以它的输出，不是建议——是可交付的产物。改好的代码，跑通的脚本，整理好的报告。"
- duration: 8.736s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-deliverable.html
- type: benefit_highlight
- persuasion: Concretization（抽象"产物"→ 三件具体物）+ contrast（建议 vs 产物）
- beat: comprehension + conviction
- blueprint: kinetic-type-beats

narrativeRole: 落地含义——把"能力"翻译成受众关心的"交付物"，区分于聊天框的"文本建议"。
keyMessage: opencode 的产出止于可交付产物，而非文本建议。
blueprint: kinetic-type-beats (Reproduce)
focal: the three deliverable cards
roles: struck "不是建议" = supporting · three deliverables = foreground · hero word "产物" = hero
sfx: blip, tick
Scene 1 (0.0–3.0s): statement "不是建议" appears, then a teal "是可交付的产物" lands via in-place token swap (`discrete-text-sequence`); Centered-upper.
Scene 2 (3.0–7.5s): on the three spoken cues, three deliverable cards reveal sequentially (`spring-pop-entrance`): 改好的代码 · 跑通的脚本 · 整理好的报告 — each a hairline panel + mono glyph.
Scene 3 (7.5–8.7s): hold the trio still (deliberate held beat before breadth). Triptych, ≥3 depth layers.

## Frame 5 — 六类通用场景

- scene: 3×2 scenario-card 网格依次点亮：代码理解 / 缺陷修复 / 脚本自动化 / 资料检索 / 数据分析 / 文档整理，每格 mono 序号 teal
- voiceover: "代码理解、缺陷修复、脚本自动化、资料检索、数据分析、文档整理——六类通用场景，按岗位映射。"
- duration: 10.2s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-scenarios.html
- type: feature_showcase
- persuasion: Numbered enumeration + frame-then-fill
- beat: foresight + momentum
- blueprint: grid-card-assemble

narrativeRole: 拓宽想象——给受众一张"它能干什么"的地图，各自对号入座。
keyMessage: opencode 覆盖六类通用工程场景，每位听众都能找到自己的接入点。
blueprint: grid-card-assemble (Reproduce)
focal: the 3×2 scenario grid
roles: six scenario-cards = foreground · kicker = supporting
sfx: tick
Scene 1 (0.0–1.5s): kicker "六类通用场景" + lead slide-up.
Scene 2 (1.5–8.5s): six scenario-cards assemble in staggered cascade (`grid-card-assemble`) as the VO names each — 代码理解 / 缺陷修复 / 脚本自动化 / 资料检索 / 数据分析 / 文档整理; mono index 01–06 teal in each cell.
Scene 3 (8.5–10.2s): on "按岗位映射" a subtle highlight sweeps the grid; hold. Full-width grid, dense.

## Frame 6 — 打开项目 = 上下文感知

- scene: 终端窗口，命令逐字键入 `cd ~/work/my-project` → `opencode`；右侧文件树/代码/文档汇聚为"上下文"
- voiceover: "怎么用？打开你的项目目录。文件树、代码、文档，就是它的上下文——不用你逐段粘贴。"
- duration: 8.952s
- transition_in: crossfade
- status: animated
- src: compositions/frames/06-context.html
- type: feature_showcase
- persuasion: Worked example + anchoring on a familiar referent（"打开项目"）
- beat: orientation + mastery
- blueprint: prompt-type-submit-generate

narrativeRole: 转入"怎么用"——用最自然的动作（打开项目）建立上下文感知的心智模型。
keyMessage: 以项目文件为上下文，而非依赖用户文本输入——这是"打开项目"的全部含义。
blueprint: prompt-type-submit-generate (Reproduce, terminal variant)
focal: the typed command + the assembled context cluster
roles: terminal window = foreground · context cluster (文件树/代码/文档) = supporting · glow = background
sfx: keystroke, blip
Scene 1 (0.0–3.5s): `terminal-surface` types on (`discrete-text-sequence` + caret) `cd ~/work/my-project` then `opencode` (teal prompt); camera holds.
Scene 2 (3.5–7.0s): on "文件树、代码、文档，就是它的上下文" a context cluster assembles beside the terminal (文件树 / 代码 / 文档 chips via `center-outward-expansion`) tethered by a teal line.
Scene 3 (7.0–8.9s): on "不用你逐段粘贴" a struck "复制粘贴" motif fades; hold the project-as-context lockup. Asymmetric 60/40.

## Frame 7 — Plan / Build 工作流

- scene: 流程图：提出需求 → 复杂度判断 → PLAN（只规划）→ 用户审核 → BUILD（执行）→ 验证；"确认门"节点 teal 高亮
- voiceover: "复杂任务，先 Plan——拆步骤、列文件、评估方案，不动手。确认之后，再 Build 执行。"
- duration: 8.64s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/07-plan-build.html
- type: feature_showcase
- persuasion: Signposting + progressive disclosure（先规划后执行）
- beat: focus + confidence
- blueprint: spatial-pan-stations

narrativeRole: 教工作模式——先规划后执行，把"误操作风险"降到最低；这是工程受众最在意的可控性。
keyMessage: Plan 只规划不产生变更；Build 按确认方案执行，受权限约束。
blueprint: spatial-pan-stations (Adapt → gate)
focal: the teal "确认门" gate node
roles: PLAN node / BUILD node = foreground · 确认门 = hero · flow arrows = supporting
sfx: tick, whoosh-soft
Scene 1 (0.0–4.5s): flow reveals L→R: 提出需求 → 复杂度判断 → PLAN node ("只规划") with three sub-chips 拆步骤 / 列文件 / 评估方案 via `layer-reveal`; "不动手" tag.
Scene 2 (4.5–6.5s): on "确认之后" the 确认门 node lights teal (`spring-pop-entrance`) between Plan and Build.
Scene 3 (6.5–8.6s): on "再 Build 执行" the BUILD node appears; a teal connector flows Plan→门→Build→验证 (`dash-march`); hold. Full-width strip flow.

## Frame 8 — AGENTS.md 与权限

- scene: 一个 AGENTS.md 卡片四段式（角色 / 术语 / 规范 / 约束）+ 一条权限提示"写文件/执行命令前 → 请求批准(ask)"
- voiceover: "把你的角色、术语、规范，写进 AGENTS.md。写文件、跑命令之前——它默认先问你。"
- duration: 8.88s
- transition_in: crossfade
- status: animated
- src: compositions/frames/08-config.html
- type: feature_showcase
- persuasion: Frame-then-fill（四段式模板）+ demonstration
- beat: confidence + safety
- blueprint: grid-card-assemble

narrativeRole: 回应"可控性/安全边界"关切——配置层与权限层让工具稳定、可控、可复用。
keyMessage: AGENTS.md 注入岗位上下文；权限层默认在写/执行前请求批准。
blueprint: grid-card-assemble (Adapt → four-segment card + permission chip)
focal: the AGENTS.md four-segment card
roles: AGENTS.md card = foreground · permission chip = hero · kicker = supporting
sfx: tick, blip
Scene 1 (0.0–4.0s): an AGENTS.md panel assembles its four segments sequentially (`grid-card-assemble`): ①角色与背景 ②领域术语 ③代码与输出规范 ④安全与约束 — mono indices.
Scene 2 (4.0–6.5s): on "写文件、跑命令之前" a permission chip "写文件 / 执行命令 → 请求批准 (ask)" pops (`spring-pop-entrance`, teal).
Scene 3 (6.5–8.9s): on "默认先问你" the chip `ambient-glow-bloom`; hold. Asymmetric 60/40, card + caption rail.

## Frame 9 — 工时对比（参考量级）

- scene: number-hero 计数 + 三条对比：日志解析 / 陌生代码 / 文档排版，工时下降条形；标注"量级参考"
- voiceover: "重复、规则化的任务，工时下降最显著——日志解析、陌生代码、文档排版。量级参考，因任务而异。"
- duration: 10.464s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/09-stat.html
- type: social_proof
- persuasion: Statistical proof（量级）+ caveat（诚实标注参考性）
- beat: conviction + measured
- blueprint: dataviz-countup

narrativeRole: 用量级证据支撑价值主张，同时诚实标注其参考性（不夸大）。
keyMessage: 重复性、规则化任务的工时下降最显著；具体取决于任务复杂度。
blueprint: dataviz-countup (Reproduce)
focal: the descending before→after bars
roles: three task bars = foreground · "量级参考" tag = supporting · kicker = supporting
sfx: tick
Scene 1 (0.0–1.5s): kicker "工时对比（参考量级）" slide-up.
Scene 2 (1.5–8.0s): three horizontal pairs draw + the "后" bar shrinks (`stat-bars-and-fills`) as the VO names each — 日志解析 / 陌生代码 / 文档排版; teal accent on the delta; a small count ticks (`counting-dynamic-scale`).
Scene 3 (8.0–10.5s): on "量级参考，因任务而异" a mono "量级参考" tag appears; hold still (measured, no overclaim). Full-width strip, 3 rows.

## Frame 10 — 日志统计 Demo

- scene: 终端 + Plan/Build 双栏：①cd+启动 ②Plan 指令（读 .log、提取 Error、按错误码统计、输出表格）③审核 ④Build 执行 ⑤交付 Markdown 表格
- voiceover: "一个真实任务：读日志、提错误行、按错误码统计频次、输出表格。Plan 说思路，Build 出交付物——全程不用复制粘贴。"
- duration: 11.808s
- transition_in: cut
- status: animated
- src: compositions/frames/10-demo.html
- type: feature_showcase
- persuasion: Worked example with real steps + demonstration
- beat: mastery + "aha"
- blueprint: agent-progress-theater

narrativeRole: 端到端演示一个真实任务，把前述概念/工作流落到一个可信的最小闭环。
keyMessage: 用 Plan→Build 走通一个真实任务，全程无需复制粘贴日志。
blueprint: agent-progress-theater (Reproduce)
focal: the delivered Markdown 错误统计表
roles: terminal + Plan/Build columns = foreground · step checklist = supporting · deliverable table = hero
sfx: keystroke, check, blip
Scene 1 (0.0–4.0s): terminal types the Plan instruction (`discrete-text-sequence`): "读取 .log · 提取 Error · 按错误码统计 · 输出 Markdown 表格"; "Plan 说思路" tag.
Scene 2 (4.0–8.5s): "确认 → Build" — a step checklist checks off sequentially (`agent-progress-theater`): ①cd+启动 ✓ ②Plan ✓ ③审核 ✓ ④Build 执行 ✓ (badges flip teal).
Scene 3 (8.5–11.8s): on "Build 出交付物" the deliverable — a Markdown 错误统计表 — scales up as hero; "全程不用复制粘贴" mono tag; hold. Asymmetric 60/40, dense.

## Frame 11 — 上手 Checklist

- scene: 8 步 scenario-card 列表依次 check：安装 / 登录 / 进项目 / /init / 问一句 / Plan 小任务 / 会话命令 / 交付真实任务
- voiceover: "上手就八步：安装、登录、进项目、初始化、问一句、Plan 一个小任务、走一遍会话命令、交付一个真实任务。"
- duration: 10.512s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/11-checklist.html
- type: benefit_highlight
- persuasion: Numbered enumeration + distillation
- beat: confidence + resolve
- blueprint: grid-card-assemble

narrativeRole: 给出可立即执行的路径——把"当天上手"压缩成一张清单。
keyMessage: 八步即可从安装走到交付第一个真实任务。
blueprint: grid-card-assemble (Reproduce)
focal: the 8-step list + progress rail
roles: eight step-cards = foreground · progress rail = supporting
sfx: tick, check
Scene 1 (0.0–1.5s): kicker "上手 8 步" slide-up.
Scene 2 (1.5–9.0s): eight scenario-cards assemble + check off in sequence as the VO names them (`grid-card-assemble` + check badges): 安装 / 登录 / 进项目 / /init / 问一句 / Plan 小任务 / 会话命令 / 交付真实任务; mono indices 01–08.
Scene 3 (9.0–10.5s): a progress rail fills to 8/8 (teal); hold. 4×2 grid, dense.

## Frame 12 — Thesis

- scene: 单行 statement："把对大模型的认知，从'聊天应用'，推进到 'Code Agent'。" Code Agent teal
- voiceover: "把对大模型的认知，从'聊天应用'——推进到，Code Agent。"
- duration: 5.448s
- transition_in: crossfade
- status: animated
- src: compositions/frames/12-thesis.html
- type: branding
- persuasion: Distillation + callback（回到开篇反问）
- beat: clarity + inevitability
- blueprint: titlecard-reveal

narrativeRole: 收束论点——一句话回到开篇的认知反转，完成理解闭环。
keyMessage: 本课的目标，是完成这次认知推进。
blueprint: titlecard-reveal (Reproduce)
focal: the reframe line with "Code Agent" teal
roles: statement line = foreground · "Code Agent" = hero · ambient glow = background
sfx: blip
Scene 1 (0.0–2.0s): statement slides up + crossfade (`titlecard-reveal`): "把对大模型的认知，从'聊天应用'".
Scene 2 (2.0–4.0s): on "推进到，Code Agent" the second half lands with "Code Agent" in teal + `asr-keyword-glow`.
Scene 3 (4.0–5.4s): hold still (climax breather); subtle jitter only. Centered hero.

## Frame 13 — CTA

- scene: 暗场 + teal 辉光，sign-off"今天，完成你的第一个真实任务。" + 一个 teal closing-cta pill
- voiceover: "今天，完成你的第一个真实任务。"
- duration: 3.312s
- transition_in: crossfade
- status: animated
- src: compositions/frames/13-cta.html
- type: cta
- persuasion: Direct address + callback
- beat: resolve + inspiration
- blueprint: cta-morph-press

narrativeRole: 行动召唤——把"理解"转化为"今天就做一件事"。
keyMessage: 今天完成首个真实任务，建立手感。
blueprint: cta-morph-press (Reproduce)
focal: the teal closing-cta pill
roles: sign-off line = foreground · cta pill = hero · ambient glow = background
sfx: whoosh-soft, blip
Scene 1 (0.0–1.5s): ambient-glow blooms; sign-off "今天，完成你的第一个真实任务。" slides up.
Scene 2 (1.5–3.3s): the teal `closing-cta` pill morphs in at center (`cta-morph-press`) — dark ink on teal; this is the FINAL frame — a real held finish to the last frame is allowed; hold. Centered.
