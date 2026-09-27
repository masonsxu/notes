---
name: frontend-toolchain
description: Use when the task involves frontend code, JavaScript, TypeScript, package installation, or package scripts. Enforces pnpm; forbids npm/yarn/bun.
---

# Frontend Toolchain

- MUST use `pnpm install` / `pnpm run`. MUST NOT use `npm` / `yarn` / `bun`.
- Monorepo: declare packages in `pnpm-workspace.yaml`; run scoped scripts with `pnpm --filter <selector>`.
