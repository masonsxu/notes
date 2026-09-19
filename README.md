# Notes

个人笔记、代码片段、技术参考。

## opencode 系列课程

| 篇目 | 讲义 | 配套 |
| --- | --- | --- |
| 理念开篇 | — | `ppt/ai-agent-evolution/` PPTX（build.js 生成） |
| 第 1 讲 · 入门 | `ppt/ppt1-intro/opencode-getting-started.md`（图表内嵌 mermaid） | 同目录 `opencode-入门.pptx`（build.js 生成） |
| 第 2 讲 · 进阶与实战（60 分钟课 + 课后完整手册） | `ppt/ppt2-workshop/opencode-advanced-practice.md`（图表内嵌 mermaid） | 同目录 `opencode-进阶与实战.pptx`（build.js 生成）＋ 练习素材包 `materials/` |

### PPT 的生成与维护

每份 PPT 目录里放一个自包含的 `build.js`（[pptxgenjs](https://pptxgenjs.com/) 脚本），运行后在本目录输出同名 `.pptx`——**改脚本 → 跑脚本 → 重新生成**，产物不手改。

```bash
# 依赖：bun（本机直接可用全局 pptxgenjs；缺了就装一次）
bun add -g pptxgenjs

# 重新生成某一讲（覆盖旧 .pptx）
cd ppt/ppt1-intro && bun build.js

# 三份全部重新生成
for d in ppt/ai-agent-evolution ppt/ppt1-intro ppt/ppt2-workshop; do (cd "$d" && bun build.js); done
```

维护要点：

- **内容以讲义 `.md` 为源头**。先改讲义，再把对应文字同步进 `build.js`；每页幻灯片是按 `// ===== S7 大模型 =====` 顺序注释的独立代码块，增删页时同步改顶部的 `TOTAL` 总页数（页脚计数用）。
- **两讲共用一套设计系统**：`build.js` 顶部的颜色/字体常量（`OR`/`ORB` 主橙、`INK`/`MUT` 文字灰、`F` 微软雅黑、`MONO` Consolas）。换主题色或字体只动常量，不要在页面代码里写死色值。
- **常用辅助函数**：`T()` 单行文本、`PG()` 多段文本（颜色写在每段的 `o.c`，内部映射为 pptxgenjs 的 `color`）、`card()` 圆角卡、`arrow()` 箭头、`chip()` 标签、`term()` 深色终端卡（贯穿两讲的母题）。演讲者备注用 `s.addNotes()`。
- **理念开篇的脚本**（`ai-agent-evolution/build.js`）额外依赖 `react` / `react-icons` / `sharp`（渲染图标）；第 1、2 讲的脚本只依赖 `pptxgenjs`，形状与图表全部原生绘制。
- **预览校验**（可选）：

  ```bash
  soffice --headless --convert-to pdf --outdir /tmp opencode-入门.pptx
  pdftoppm -png -r 100 /tmp/opencode-入门.pdf /tmp/page
  ```

  注意本机 LibreOffice 会把微软雅黑替换为替代字体，预览有轻微字宽差异属正常；最终效果以装有微软雅黑的 PowerPoint / WPS 放映为准。
