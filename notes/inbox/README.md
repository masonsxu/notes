# inbox

本目录当前只有一套有效方案：`global-rules-v2.md`（AI 编码代理全局规则的渐进式披露方案快照）。旧的 `global-rules.md`（v1）已删除，原因见下。

## 为什么删除 v1

v1 是单体中文规则文件（PowerShell 语法基线），被 v2 取代的三个原因：

1. **语言策略错误**。v1 经历过"双语逐条对照"的弯路：英文规则 + 中文补充看似兼顾两端，实际是负收益——token 翻倍、双语表述的细微差异制造噪音、改一条规则要同步两处。结论：规则是给模型看的，英文 `MUST` / `NEVER` 理解更一致；中文对照单独放 `.zh.md`，仅供人读。
2. **单体结构错误**。v1 把所有规则全量注入每次会话，其中大部分与当前任务无关（写周报时不需要 Go 诊断，改 Go 代码时不需要无信息修饰语范例表）。v2 改为渐进式披露：全局文件只留 45 行硬约束 + 触发表，任务规则下沉到 6 个 skill 按需加载。常驻上下文 130 行 → 45 行。
3. **PowerShell 基线错误**。v1 明确"命令默认 PowerShell 语法"，但 agent 场景下这是三个已知问题的根源：agent 的 `shell` 配置可能被忽略并回退 PowerShell 5.1；中文 Windows 下 PowerShell 输出按 GBK 解码导致乱码；模型训练数据以 bash 为主，PowerShell 语法（`$env:`、`NUL`、`\` 路径）试错率高。v2 以 POSIX/Git Bash 为基线。

v1 的合理内容已全部并入 v2：工具链锁定（uv / bun / podman compose / go build）、CodeGraph 指引、设计 skill 编排、冲突仲裁。v1 独有的 Windows 特有写法（`go build -o NUL`、PowerShell 检索命令）按 Git Bash 基线改写（`/dev/null`、`uv run python` + POSIX 路径）。

## 目的

- **常驻上下文最小化**：每次会话只注入 45 行硬约束，token 留给代码和推理
- **任务规则按需加载**：6 个 skill（python-toolchain / frontend-toolchain / go-diagnostics / codegraph / precision-detail / design-orchestration）只在触发条件命中时读取
- **跨端一致**：macOS（pi）与 Windows（opencode）共用同一套 AGENTS.md 与 skills，规则单点维护
- **人机分离**：英文版给模型（权威），中文版给人（对照），互不污染

已部署位置：pi 权威文件在 `~/.pi/agent/AGENTS.md`（+ 同目录 `AGENTS.zh.md`），skills 在 `~/.agents/skills/`（pi 与 opencode 都原生加载该目录）。本目录的 `global-rules-v2.md` 是再部署快照，漂移时以已部署文件为准并重新生成快照。

## Windows（pwsh + Windows Terminal + Git Bash）适配步骤

前置认知：**pwsh 留给人，bash 留给 agent**。日常交互继续用 Windows Terminal + pwsh，不必放弃；只要求 agent 的命令执行环境走 Git Bash。两者不冲突。

### 1. 安装并确认 Git Bash

- 从 [git-scm.com](https://git-scm.com/) 安装 Git for Windows（勾选 Git Bash Here）
- 把 `C:\Program Files\Git\bin\` 放到系统 PATH **最前面**，确保 `bash --version` 返回 Git Bash（含 MSYS/MinGW 字样），而不是 WSL 或 Microsoft Store 的 bash

### 2. 让 agent 的 shell 走 Git Bash（按优先级）

- **方式 A（推荐）**：系统环境变量 `SHELL = C:\Program Files\Git\bin\bash.exe`
- **方式 B**：Windows Terminal 新建 Git Bash profile（命令行 `C:\Program Files\Git\bin\bash.exe -i -l`），从该 profile 启动 agent——agent 探测父进程 shell 自动生效
- **方式 C（兜底）**：`%USERPROFILE%\.config\opencode\opencode.json` 显式指定 `"shell": "C:/Program Files/Git/bin/bash.exe"`。已知 bug：此配置可能被忽略并回退 PowerShell 5.1，所以优先保证 A/B 生效

### 3. 编码

- Git Bash 默认 UTF-8，无需处理；`locale` 应输出 `UTF-8`
- 仅当必须在 pwsh 里查看 agent 输出时：`[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`（或 `chcp 65001`）
- 可选：`git config --global core.quotepath false`，避免中文文件名被转义显示

### 4. 部署文件

| 内容 | 目标位置 |
|---|---|
| `AGENTS.md`（快照 §3） | `%USERPROFILE%\.config\opencode\AGENTS.md` |
| `AGENTS.zh.md`（可选，仅人读） | 同目录（agent 不会加载 `.zh.md`） |
| 6 个 skill 目录（快照 §5） | `%USERPROFILE%\.agents\skills\<name>\SKILL.md` |
| `opencode.json` 补一行 | `"instructions": ["~/.config/opencode/AGENTS.md"]`，显式加载规则，防默认发现失效 |

路径写法注意：AGENTS.md 与 SKILL.md 里的 `~`、`/dev/null`、`/c/Users/...` 都是 POSIX 风格，在 Git Bash 下原生成立，**不要**改回 `%USERPROFILE%` / `NUL`（那是 v1 的 PowerShell 写法）。

### 5. 验证

- `bash --version` → 含 MSYS/MinGW（Git Bash），不是 `Linux`（那说明误连了 WSL）
- 在 agent 内执行 `uname -s` → `MINGW64_NT-*`，证明命令确实走 Git Bash
- `echo $SHELL` → 指向 `bash.exe`
- 派一个 Python 任务 → 观察是否加载 `python-toolchain`；派一个 Go 任务 → 确认没有误触发
- 中文输入输出无乱码

### 6. 回退（某 agent 强制走 pwsh 时）

- 社区工具 `ps-bash` 包装器：提供 `bash.exe` 风格接口、底层调用 pwsh
- 关注 opencode 对 Windows shell 处理的 issue 进展，修复后切回原生
- 最不推荐：把 AGENTS.md 的 Shell 节改回 PowerShell 语法（即 v1 做法）——问题会全部回来
