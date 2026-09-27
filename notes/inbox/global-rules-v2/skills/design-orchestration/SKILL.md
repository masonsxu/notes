---
name: design-orchestration
description: Use when building or reviewing UI with the frontend-design and ui-ux-pro-max skills. Defines which skill leads on which axis, the three-stage pipeline, and the delivery gate.
---

# Design Skill Orchestration (frontend-design + ui-ux-pro-max)

Both skills exist in this environment. Their trigger conditions overlap, and on the color/typography/style axes they assert opposite claims (derived vs database lookup); without orchestration rules the output direction is unstable.

## Division of Labor

| Skill | Responsibility | Use case |
|---|---|---|
| frontend-design | Visual direction distinctiveness: token plan → anti-template self-review → code | Brand-new pages/sites, tasks needing a visual identity |
| ui-ux-pro-max | System completeness: UX guidelines, interaction patterns, delivery checklist | Component development, UX/a11y review, delivery gate |

## Pipeline (three stages for large new-UI tasks)

1. Set direction: frontend-design leads (4–6 color tokens + font pairing + signature element + self-review)
2. Consult rules: ui-ux-pro-max retrieves patterns (UX guidelines, component specs, `--stack` guidance); it MUST NOT lead visual direction
3. Delivery gate: ui-ux-pro-max PRE-DELIVERY CHECKLIST (contrast 4.5:1, visible keyboard focus, `prefers-reduced-motion`, 375/768/1024/1440px breakpoints) + frontend-design restraint self-review (remove one decoration)

## Conflict-Axis Arbitration

On the color/typography/style axes exactly one skill leads at a time:
- New project: frontend-design sets direction.
- Existing design system: ui-ux-pro-max supplies specs.
- Project-level rules already lock fonts/colors: both skills' recommendations yield to project-level `AGENTS.md`.

## Retrieval Script Essentials (ui-ux-pro-max)

- Full-path invocation, no cwd dependency. Adjust `<skills-root>` to where the skill is installed (`~/.agents/skills/` or `~/.pi/agent/skills/`):
  `uv run python <skills-root>/ui-ux-pro-max/scripts/search.py "<query>" --domain <style|color|ux|typography|chart|...> [--stack <react|shadcn|vue|...>]`
- The `ux` domain matches guideline keywords (`keyboard` / `contrast` / `forms`), not product keywords (`portfolio`).
- On 0 results, explicitly declare "no database match"; NEVER silently degrade or fabricate.
