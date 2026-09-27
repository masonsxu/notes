---
name: go-diagnostics
description: Use when the task involves Go code or Go build/compile errors. Enforces build-first diagnostics.
---

# Go Diagnostics

- Diagnose with `go build -o /dev/null ./...` before any fix; read the full compiler output first.
