---
name: precision-detail
description: Use when writing weekly reports, design docs, meeting notes, commit messages, or any long-form text. Provides the AI filler modifier deletion test, examples, and self-check.
---

# Output Precision Detail

Filler modifiers are the main source of the "AI flavor". If deleting a modifier leaves the meaning unchanged, or weakens a meaning that a number/fact should carry, delete or replace it.

## Deletion Test

- Delete the word; meaning unchanged → DELETE
- Delete the word; meaning weakens → REPLACE with a number/fact, NEVER a synonym
- Meaning depends on the word → KEEP

## Examples

| Category | Before → After |
|---|---|
| Decorative adverbs | 针对性适配 → 适配 · 实测核对 → 核对 · 自行适配 → 适配 · 进一步优化 → 优化 |
| Decorative adjectives | 高级信息 → 信息 · 独立阻塞 → 阻塞 · 深度分析 → 分析 · 有效方案 → 方案 |
| Vague qualifiers | 初步了解 → 了解 · 直接复用 → 复用 · 基本完成 → 完成（或给实际进度%） |
| Hollow descriptions | 响应不及时 → 8 个月才响应 · 性能很差 → 从 120ms 升至 950ms |
| Intensity words | 严重滞后 → 滞后 3 天 · 明显改进 → 从 72% 提至 88% · 大幅提升 → +16pp |

## Self-Check

Before delivery, run the deletion test on every sentence; remove at least one class of filler. If a sentence turns hollow after deletion, it needed numbers/facts, not synonyms.

## Scope

Weekly reports, design docs, meeting notes, PPT body, commit messages. Code comments/identifiers are exempt (naming follows each language's spec).
