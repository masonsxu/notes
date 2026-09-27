---
name: codegraph
description: Use when a `.codegraph/` directory exists at the repo root and the task needs to understand or locate code. Prefer it BEFORE grep/find or reading files.
---

# CodeGraph

- MCP tool (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- Shell (always works): `codegraph explore "<symbol names or question>"` prints the same output.
- If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
- Fallback tools: `rg` / `fd` / `bat`. NEVER invent internal API signatures from memory.
