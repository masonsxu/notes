# Notes

个人知识仓库 monorepo：Markdown 材料 + 自包含 HTML 报告 + VitePress 浏览站点。

## 结构

```
notes/     Markdown 材料库（调研底稿、核对留痕、证据摘录、想法、月志）
reports/   HTML 报告库（工程蓝图主题，自包含可直开，主题域分子目录）
templates/ report.html 报告模板（新报告起点）
apps/site/ VitePress 站点（浏览入口，消费顶层 notes/ 与 reports/）
```

LLM 代理请从根目录 [llms.txt](llms.txt) 进入；写入操作前必读 [AGENTS.md](AGENTS.md)。

## 常用命令

包管理器固定 pnpm（工作区内禁用 bun/npm/yarn），本机经 mise 提供：

```bash
pnpm install            # 安装根 turbo + apps/site 依赖
pnpm dev                # 站点开发（sync 监听 notes/ 与 reports/ 变更 + vitepress dev）
pnpm build              # sync 物化内容 + vitepress 构建，产物在 apps/site/dist/
pnpm preview            # 预览构建产物
```

## 新增 HTML 报告

1. 复制 `templates/report.html` 到 `reports/<主题域>/<名称>.html`；
2. 替换标题与占位内容（色板 token 在 `:root`，勿改变量名）；
3. `pnpm build` —— sync.mjs 自动生成嵌入页、报告库总览与侧栏，零登记；
4. 更新 `llms.txt` 索引（规则见 AGENTS.md）。

## 新增 Markdown 材料

放入 `notes/<主题域>/`，站点下次构建自动渲染；如需进侧栏与 llms.txt，见 AGENTS.md 约定。

## 历史

2026-09-19 仓库删除重建（原历史与远程已删除）；同日完成 monorepo 化。旧结构（含已删除的 ppt/）封存于分支 `archive/pre-monorepo`。
