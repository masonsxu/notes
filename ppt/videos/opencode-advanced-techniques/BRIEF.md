---
workflow: faceless-explainer
flow: automation
storyboard: yes
message: "工具已就位，差距在手法——变量不是模型能力，而是使用方式：把提问、配置、上下文管理做到位，用一个真实任务完整走一遍"
destination: embed
aspect: 1920x1080
language: zh
length: 120s
angle: concept-explainer with process
audience: 半导体工程团队（已看过入门，进入工程化方法）
narration: yes
---

## Intent

系列第二支（进阶）。前提：受众已知 opencode 是能读写文件、执行命令的 Code Agent。本支把焦点从"功能"推进到"方法"——决定产出结果的变量不是模型能力，而是使用方式：提问具体度、配置覆盖度、上下文管理。语气务实、工程师对工程师，强调"可控、可复用、可降级"。视觉延续第一支的暗底技术风，仅强调色由青转蓝（#58A6FF），保持系列一致。

## Assets

- 源文稿：`../../../ppt2-advanced/opencode-advanced-techniques.bento.html`（20 页 Bento deck，信息来源；文字已抽入 `capture/extracted/visible-text.txt`）

## Customizations

- **视觉延续**：暗底 `#0D1117`，强调色蓝 `#58A6FF`（本支主色），青 `#2DD4BF` 作次色；标题等宽、正文 Noto Sans SC。与第一支共享结构骨架（封面 / 章节卡 / 总结）。
- **中文配音 + 中文字幕**：旁白中文（离线 edge-tts，zh-CN-XiaoxiaoNeural），生成中文字幕层。

## Notes

- 不出现真实截图或产品 UI（faceless）；视觉为排版 / 抽象图形 / 图示 / 数据可视化。
- 精华浓缩版：20 页压缩为约 13 个分镜，~120s。
- 离线引擎：edge-tts（Microsoft 神经中文）+ 本地 ffprobe；BGM 关闭（未要求配乐）。
- 本支的实战案例"文字→可交付 PPT 七步"恰好是这两份 deck 自身的产出方式，可作为收束的呼应。
