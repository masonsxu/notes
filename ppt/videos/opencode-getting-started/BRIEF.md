---
workflow: faceless-explainer
flow: automation
storyboard: yes
message: "opencode 不是聊天框，而是能读写文件、执行命令的 Code Agent——打开项目目录、Plan 先审、Build 执行，今天就能交付第一个真实任务"
destination: embed
aspect: 1920x1080
language: zh
length: 120s
angle: concept
audience: 半导体工程团队（资深工程师 + 新人 / 非编程岗）
narration: yes
---

## Intent

把团队对大模型的认知，从"问答聊天"推进到"Code Agent"——一个能进入工作目录、读写文件、执行命令、产出可交付物的工程任务执行工具。语气务实、克制、面向工程师：少口号，多"它到底能干什么、怎么上手"。受众两极（20 年资深 + 应届/非编程岗），统一从基本能力与使用场景切入。这是两支系列视频的**第一支（入门）**，目标是当天完成 安装 → 配置 → 首个真实任务。

## Assets

- 源文稿：`../../../ppt1-intro/opencode-getting-started.bento.html`（24 页 Bento deck，作为信息来源；其文字已抽入 `capture/extracted/visible-text.txt`，视频按教学节奏重组，不逐页复述）

## Customizations

- **视觉延续**：沿用源 deck 的设计语言——暗底 `#0D1117`、强调色青 `#2DD4BF`、标题用等宽字体（`ui-monospace`）、正文无衬线。作为品牌色 token 注入所选 frame preset。
- **中文配音 + 中文字幕**：旁白用中文（离线 Kokoro 中文音色），并生成中文字幕层。
- 系列一致性：与第二支（进阶，蓝色强调 `#58A6FF`）共享结构骨架（封面 / 章节卡 / 总结），仅强调色不同。

## Notes

- 不出现真实截图或产品 UI 画面（faceless）；所有视觉为排版 / 抽象图形 / 图示 / 数据可视化。
- 精华浓缩版：24 页压缩为约 12–14 个分镜，控制在 ~120s（faceless-explainer 硬上限 ~3min）。
- 离线引擎：未登录 HeyGen，TTS 用本地 Kokoro（中文 z 前缀音色），配乐用本地 MusicGen。
- 受众含非编程岗，术语首次出现需一句话消歧（如 Code Agent / function calling / AGENTS.md）。
