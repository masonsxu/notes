---
name: python-toolchain
description: Use when the task involves Python code, dependencies, environments, or formatting. Enforces uv and ruff; forbids pip/poetry/conda.
---

# Python Toolchain

- MUST use `uv add` / `uv run` for dependencies and execution. MUST NOT use `pip` / `poetry` / `conda`.
- After Python changes, run `ruff format`.
- Run `ruff check --fix` only if the project has `[tool.ruff]` config (default rules can break `star import`s).
