---
version: alpha
name: opencode dark — Frame (video / frame layer)
description: >
  Bespoke frame-scale design system lifted from the opencode training deck. The unit is the frame
  (1920×1080). Atoms: a GitHub-dark ground (#0D1117), a single teal (#2DD4BF) as scarce "voltage",
  a calm blue (#58A6FF) as the secondary signal, light ink type, hairline elevation, and a soft
  teal ambient glow as the only atmosphere. Display carries the deck's signature monospace
  wordmark; Chinese headlines + body run in Noto Sans SC; technical chrome + terminal/code run in
  JetBrains Mono. Composition is free; the brand is sacred. Motion lives in the workflow's
  motion-language.md + hyperframes-animation.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · one teal moment per frame

colors:
  canvas: "#0D1117"        # the ground — GitHub dark (NAME is load-bearing: the assembler paints #root with this)
  panel: "#161B22"         # +1 elevation step (the "card" surface)
  panel-raised: "#1C2330"  # +2 step (raised / hover / code title bar)
  ink: "#E6EDF3"           # primary text on dark
  muted: "#8B949E"         # secondary text / labels
  faint: "#6E7681"         # tertiary / chrome numerals
  accent: "#2DD4BF"        # teal — the scarce voltage (wordmark, kickers, one emphasis per frame)
  accent-2: "#58A6FF"      # blue — the secondary signal (the tool layer, links, the Code Agent idea)
  success: "#3FB950"       # status: verified / shipped
  warn: "#D29922"          # status: caution / ask
  danger: "#F85149"        # status: blocked / risk

borders: { hairline: "1px solid rgba(255,255,255,0.10)", hairline-strong: "1px solid rgba(255,255,255,0.16)", teal-rule: "1px solid rgba(45,212,191,0.40)" }
shadows: { glow-teal: "0 0 60px rgba(45,212,191,0.14)", glow-blue: "0 0 60px rgba(88,166,255,0.12)", lift: "0 8px 30px rgba(0,0,0,0.45)", none: "none" }

typography:
  # — Chinese-first reading + chrome ramp —
  body:        { fontFamily: "Noto Sans SC", cqw: 1.7, weight: 400, lineHeight: 1.6 }
  lead:        { fontFamily: "Noto Sans SC", cqw: 2.2, weight: 500, lineHeight: 1.5 }
  card-title:  { fontFamily: "Noto Sans SC", cqw: 2.4, weight: 700, lineHeight: 1.25, tracking: "-0.005em" }
  tag-upper:   { fontFamily: "JetBrains Mono", cqw: 1.35, weight: 500, tracking: "0.18em", upper: true }
  kicker:      { fontFamily: "JetBrains Mono", cqw: 1.4, weight: 500, tracking: "0.18em", upper: true }
  mono-label:  { fontFamily: "JetBrains Mono", cqw: 1.4, weight: 500, tracking: "0.02em" }
  code:        { fontFamily: "JetBrains Mono", cqw: 1.6, weight: 400, lineHeight: 1.6 }
  # — display ramp —
  headline:    { fontFamily: "Noto Sans SC", cqw: 4.4, weight: 700, lineHeight: 1.12, tracking: "-0.01em" }
  statement:   { fontFamily: "Noto Sans SC", cqw: 5.2, weight: 700, lineHeight: 1.1, tracking: "-0.012em" }
  display:     { fontFamily: "Noto Sans SC", cqw: 6.4, weight: 800, lineHeight: 1.06, tracking: "-0.015em" }
  number-hero: { fontFamily: "JetBrains Mono", cqw: 9.0, weight: 700, lineHeight: 0.95, tracking: "-0.02em" }
  number-unit: { fontFamily: "JetBrains Mono", cqw: 2.1, weight: 500, lineHeight: 1.0 }
  # — the signature opencode wordmark: monospace, teal, oversized —
  wordmark:    { fontFamily: "JetBrains Mono", cqw: 9.6, weight: 800, lineHeight: 1.0, tracking: "-0.03em" }

spacing:
  slide-pad: "5cqw"      # ~96px @1920 — matches the deck's 96px side margins
  gap-md: "1.7cqw"
  gap-lg: "3cqw"
  hairline: "1px"
  radius-sm: "6px"
  radius-md: "8px"
  radius-lg: "12px"
  radius-pill: "9999px"

components:
  ambient-glow:
    description: "The deck's only atmosphere — large soft teal/blue radial ellipses at very low alpha, drifting (ken-burns). One or two behind a cover/divider; never on content-dense frames."
  kicker:
    typography: "{typography.kicker}"
    color: "{colors.accent}"
    description: "The eyebrow — JetBrains Mono UPPERCASE 0.18em in teal, 2–5 words. Opens every section; prefixed with '· ' or '▸ '. Never a sentence, never on the same line as the headline."
  panel:
    backgroundColor: "{colors.panel}"
    border: "1px solid rgba(255,255,255,0.10)"
    rounded: "{spacing.radius-lg}"
    description: "The content card — a +1 dark step on the canvas with a hairline. Elevation is the step + hairline; add {shadows.lift} only when the panel floats (modal/terminal). No glow on content cards."
  terminal-surface:
    backgroundColor: "{colors.panel-raised} title bar / {colors.canvas} body"
    textColor: "{colors.ink} (JetBrains Mono); prompt '{colors.accent}', flag '{colors.accent-2}', comment '{colors.muted}'"
    border: "1px solid rgba(255,255,255,0.10)"
    rounded: "{spacing.radius-md}"
    description: "The terminal / code window — a raised title bar (mac dots in teal/blue/muted + filename in mono) over a darker body. Commands type on; the prompt '$'/'❯' is teal. This owns the surface + chrome; code content is the frame's own text."
  flow-node:
    backgroundColor: "{colors.panel}"
    border: "1px solid rgba(255,255,255,0.12)"
    rounded: "{spacing.radius-md}"
    typography: "{typography.card-title} / {typography.mono-label}"
    description: "An architecture / process node — a hairline pill-ish card holding a short label. Connectors are 1px teal/blue lines or dashed marches between nodes."
  connector:
    description: "1px line (rgba white 16%, or teal 40% for the live path) joining flow-nodes. Animate with a dash-march loop to show flow direction; arrowhead is a small teal triangle."
  number-lockup:
    typography: "{typography.number-hero} figure + {typography.number-unit} unit"
    description: "Hero stat — a JetBrains Mono figure paired with a mono unit (−70%, 6 类, 8 步). The figure may count up; the unit is always mono, never the sans."
  scenario-card:
    backgroundColor: "{colors.panel}"
    border: "1px solid rgba(255,255,255,0.10)"
    rounded: "{spacing.radius-md}"
    description: "A numbered grid cell (六类场景 / checklist) — mono index '01' in teal top-left, Noto Sans SC title, one-line caption. 6-up or 8-up grid; uniform."
  closing-cta:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    rounded: "{spacing.radius-pill}"
    typography: "{typography.tag-upper}"
    description: "The ONE voltage moment on the close — a teal pill with dark ink text. At most one teal-filled element per frame."
---

# opencode dark — Frame (video / frame layer)

## Overview

This is the opencode training deck come alive at frame scale — a **calm, technical, terminal-native**
register. The thesis is three values: **canvas is the dark ground, ink is the voice, teal is the
voltage**, with blue as a quiet second signal for the "tool layer / Code Agent" idea. Every surface
is the dark canvas or a half-step panel above it; elevation is a **1px hairline** plus, rarely, a
soft lift shadow or a low-alpha teal **ambient glow**. There are no heavy drops, no glows on
content, no gradients on text.

Three voices, each in its own face: **JetBrains Mono** carries the deck's signature — the `opencode`
wordmark, kickers, technical labels, and the terminal/code window; **Noto Sans SC** carries every
Chinese headline and body line; numerals run in JetBrains Mono. Switching a voice's face collapses
the register: a sans wordmark or a serif headline reads as a different brand.

**Key characteristics at frame scale:**

- **Dark canvas / light ink / teal voltage** + a blue secondary; no pure white, no pure black, no fourth hue.
- **JetBrains Mono** wordmark + kickers + code; **Noto Sans SC** headlines + body; numerals mono.
- **Hairline elevation** — 1px low-alpha white border; a soft lift shadow only when a panel floats.
- **Teal is rationed** — at most ONE teal-filled / teal-emphasis moment per frame (the wordmark, a kicker row, OR the closing pill); teal never floods a body run.
- **Ambient glow** — one or two large soft teal/blue radials behind a cover or divider only; never under dense content.
- **Density is free** — fill the frame as the content wants; a frame may stand on a single wordmark or carry a dense diagram.

## Font loading (load in EVERY frame's <head>)

Noto Sans SC + JetBrains Mono are NOT installed on the render host. Paste this into every frame's
`<head>` (the caption skin uses the same families via `--font-display`/`--font-body`, so captions
resolve too). System CJK (PingFang SC) is the offline fallback if the fetch fails — still legible.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Noto+Sans+SC:wght@400;500;700;900&display=swap" rel="stylesheet">
```

## The Frame

### Frame Craft Bar

Eyeball tests gate every frame before any structural check:

- **Squint** — one display moment (wordmark / statement / number-hero) dominates at 3–6× its neighbor.
- **Trinity** — dark canvas ground, light ink text, teal exactly **once** as emphasis; blue is the only second hue; no pure white / pure black.
- **Type** — Noto Sans SC Chinese headlines + body; JetBrains Mono wordmark / kickers / code; numerals mono.

- **Primary:** 1920×1080 (16:9). Display authored in **`cqw`** (`px ÷ 1920 × 100 = cqw`).
- **Vertical:** 1080×1920 (9:16). **Square:** 1080×1080 (1:1).
- **Safe area:** `slide-pad` ~5cqw (≈96px); kickers/mono chrome sit inside it.

**The container law (load-bearing).** Every frame ground sets `container-type: size`; ALL
frame-relative units are `cqw`/`cqh` against it — never `vw`. Hairlines stay 1px; card radii stay
6/8/12px; the dark reading must survive every ratio.

## Colors

Default ground `{colors.canvas}` (#0D1117); content gathers on `{colors.panel}` / `{colors.panel-raised}`
(half-step dark lifts, never a hard contrast). **Headlines & body:** `{colors.ink}` on canvas/panel;
`{colors.muted}` for secondary, `{colors.faint}` for chrome numerals. **Teal** (`{colors.accent}`) is
the scarce voltage — one moment per frame (wordmark, a kicker row, a key underline, OR the closing
pill), never a body run, never a card fill (except the closing CTA). **Blue** (`{colors.accent-2}`)
is the secondary signal — the "tool layer / Code Agent" idea, links, flags; quieter than teal. Status
colors (success/warn/danger) carry meaning by hue — use them only for status.

## Typography

Two ramps. The **reading/chrome ramp** (Noto Sans SC `body` 1.7cqw / `lead` 2.2cqw; JetBrains Mono
`kicker`/`mono-label`/`code`) carries copy + chrome; the **display ramp** (Noto Sans SC `headline`
4.4cqw → `display` 6.4cqw weight 800; the `statement` 5.2cqw tier for single-line reframes) carries
every headline. The **wordmark** (`opencode`, JetBrains Mono 9.6cqw weight 800, teal) is its own
thing — the cover identity.

- **Legibility floor:** any load-bearing line ≥ **1.4cqw**.
- **Chinese headlines** are Noto Sans SC, weight 700–800, slight negative tracking; keep them short (≤ 14 chars/line) and let them breathe.
- **Numerals are always JetBrains Mono** — stats, counts, step indices, terminal output. Pair a `number-hero` figure with a `number-unit`.
- **Kickers** are JetBrains Mono UPPERCASE 0.18em in teal — the section eyebrow.

## Depth & Surface

Hairline elevation on dark:

- **1px hairline** white border at ~10% alpha is the primary lift (16% for stronger separators).
- **Half-step surface** — a `{colors.panel}` block on canvas reads elevated by the dark step, not by a cast shadow.
- **Soft lift** (`{shadows.lift}`) only when a panel truly floats (a modal, the terminal window).
- **Ambient glow** (`{shadows.glow-teal}` / `glow-blue`) behind covers/dividers only — never under content.

**Ceiling:** no heavy drop on content, no glow on content, no gradient on text, no tilt. The system
reads by the dark step + hairline + (rarely) atmosphere.

## Shapes

- **6px** small chrome, **8px** panels / terminal / flow-nodes, **12px** large cards, **9999px** the
  closing CTA pill and tag chips. No square corners on content; the technical register is gently
  rounded, never hard.

## Components

- **ambient-glow** — the only atmosphere; one/two soft teal-blue radials behind cover/divider. **kicker** — the teal mono eyebrow opening every section.
- **panel** — the content card (hairline + dark step). **terminal-surface** — the terminal/code window (raised title bar + darker body, mono).
- **flow-node** + **connector** — architecture/process diagrams; connectors animate with a dash-march to show flow.
- **number-lockup** — mono figure + mono unit (stats count up). **scenario-card** — numbered grid cell (六类场景 / checklist).
- **closing-cta** — the ONE teal-filled pill on the close.

## Frame Treatments

> Recipe: ground · container · composes · focal · chrome · accent · Fixed/Free · density.
> One teal emphasis per frame; open sections with a kicker.

### 1 · Cover (identity · move: oversized mono wordmark · dark + glow)

**Ground** `{colors.canvas}`, `slide-pad`, 1–2 **ambient-glow** teal/blue radials drifting.
**Composes** kicker, wordmark, lead, mono-label index. **Focal** the `opencode` **wordmark**
(JetBrains Mono 9.6cqw, teal) under a teal kicker ("· 工具使用入门"). **Chrome** mono index strip
(内部培训 · 半导体工程团队). **Accent** the teal wordmark (the one voltage). **Fixed** mono wordmark,
dark ground, hairline. **Free** the lead line, the index, layout. **Density** free.

### 2 · Statement (reframe · move: single Noto Sans SC line · dark)

**Ground** `{colors.canvas}`. **Composes** kicker, statement, optional lead. **Focal** one 2-line
Noto Sans SC `statement` carrying the reframe ("它不是聊天框，是能动手干活的 Code Agent") — reach for
one teal word for the voltage. **Chrome** mono kicker. **Accent** one teal word, or none. **Fixed**
Noto Sans SC statement, dark ground. **Free** the line, layout. **Density** free.

### 3 · Comparison (chat vs Code Agent · move: two panels diverge · dark)

**Ground** `{colors.canvas}`. **Composes** kicker, two **panel**s, mono labels, connectors.
**Focal** the LEFT panel (聊天应用: user → model → text, dead-end) vs the RIGHT panel (Code Agent:
user → model → **tool layer** → 文件系统 / 终端命令), the right panel lit by a teal connector that the
left lacks. **Chrome** mono panel titles. **Accent** the teal "tool layer" node + connector on the
right only. **Fixed** two hairline panels, mono chrome. **Free** the node labels, the divergence.
**Density** dense.

### 4 · Architecture / Loop (diagram · move: nodes + dash-march connectors · dark)

**Ground** `{colors.canvas}`. **Composes** kicker, **flow-node**s, **connector**s (dash-march),
mono labels. **Focal** the loop or pipeline — Plan → 确认门 → Build → 验证, or the function-calling
闭环 (推理→执行→观测→再推理). **Chrome** mono node labels. **Accent** the live path in teal; the
"确认门" node lit teal. **Fixed** hairline nodes, 1px connectors. **Free** the node set, the path.
**Density** dense.

### 5 · Terminal / Code (command · move: types on · dark)

**Ground** `{colors.canvas}` framing a **terminal-surface**. **Composes** terminal title bar, mono
command (types on), optional output. **Focal** the command (`cd ~/work/my-project` · `opencode`) or
the instruction typed line by line. **Chrome** mac dots (teal/blue/muted) + mono filename. **Accent**
the teal prompt `❯`/`$`. **Fixed** raised terminal surface, mono. **Free** the command, output.
**Density** dense.

### 6 · Number / Impact (stat · move: count-up · dark)

**Ground** `{colors.canvas}`, `slide-pad`. **Composes** kicker, **number-lockup**, lead/caption,
optional hairline rule. **Focal** a `number-hero` figure (count up) with a mono unit over a 1px rule
— 工时对比 / 频次. **Chrome** mono tag. **Accent** at most one teal unit. **Fixed** mono figure +
mono unit, hairline. **Free** the figures, tag, layout. **Density** free.

### 7 · Grid / Scenario (list · move: cells reveal in sequence · dark)

**Ground** `{colors.canvas}`, `slide-pad`. **Composes** kicker, 6/8 **scenario-card**s. **Focal**
the grid — 六类通用场景 or the 上手 Checklist. **Chrome** mono index '01..06' teal in each cell.
**Accent** the teal indices (one emphasis family). **Fixed** hairline cells, mono indices. **Free**
the cell content, grid count. **Density** dense.

### 8 · Closing (sign-off · move: teal voltage · dark + glow)

**Ground** `{colors.canvas}`, 1 ambient-glow. **Composes** statement sign-off, **closing-cta** pill,
mono index. **Focal** a short Noto Sans SC sign-off ("今天，完成首个真实任务") with the ONE
**closing-cta** teal pill. **Chrome** mono index. **Accent** the single teal pill. **Fixed** one teal
moment, dark ground. **Free** the sign-off, layout. **Density** free.

## Composition Rules

### Do

- Stand every frame on the **dark canvas floor**; gather content on a **half-step panel**.
- Set Chinese headlines + body in **Noto Sans SC**; the **wordmark** / kickers / code / numerals in **JetBrains Mono**.
- Elevate with a **1px hairline** (+ dark step); a soft lift only on floating panels; **ambient glow** behind cover/divider only.
- Lead with **one clear focal**; open regions with a **kicker**. **Ration teal to one emphasis per frame.**
- Pair every stat with a **mono unit**; render commands in the **terminal-surface**.

### Don't

- No pure white, no pure black, no fourth hue (blue is the only secondary; status colors are status-only).
- No heavy drop on content, no glow on content, no gradient on text, no tilt.
- No sans wordmark; no serif headline; no sans numeral; no teal body run; no two teal-filled moments in one frame.
- Don't crowd a Chinese headline — keep it short and let it breathe; step the ramp down before it blows the measure.

## Aspect-Ratio Behavior

| Treatment        | 16:9                  | 9:16                  | 1:1               |
| ---------------- | --------------------- | --------------------- | ----------------- |
| Cover            | wordmark left, glow   | wordmark top, stacked | centered          |
| Statement        | line left/centered    | line stacked          | centered          |
| Comparison       | two panels side by side | panels stacked      | stacked           |
| Architecture     | nodes flow L→R        | nodes flow top→bottom | radial/centered   |
| Terminal         | panel framed in canvas | panel taller         | centered          |
| Number/Impact    | figure left           | figure centered       | centered          |
| Grid/Scenario    | 3×2 / 4×2 grid        | 2×3 stack             | 3×2 / 2×3         |
| Closing          | sign-off + pill       | sign-off top, pill below | centered       |

`slide-pad` holds on the short edge; re-step display above the 1.4cqw floor.

## Numerals & Claims (hard rule)

Render only figures the source deck states (工时对比 is explicitly "参考量级"). Where a stat is
illustrative, label it 量级参考 and keep it qualitative. Never invent precise metrics.

## Pre-Render Self-Audit

- **Squint** — one display moment dominates.
- **Trinity** — dark canvas + panel step + light ink voice; teal exactly once; blue the only second hue; no pure white/black.
- **Type** — Noto Sans SC headlines + body; JetBrains Mono wordmark / kickers / code / numerals; ≥1.4cqw floor; fonts loaded.
- **Depth** — 1px hairline + dark step; soft lift only on floating panels; glow only behind cover/divider.
- **Fabrication** — every numeral traces to the deck, else qualitative.

## Known Gaps

- **Motion intentionally out of scope here.** This frame.md specifies composition only. The motion register — soft fades, no overshoot/bounce/elastic, teal the only "draw-on", numbers count up, commands type on, connectors dash-march — lives in the workflow's `motion-language.md` + `hyperframes-animation`.
- **Fonts load via Google Fonts** (Noto Sans SC + JetBrains Mono) pasted into each frame `<head>`; system CJK (PingFang SC) is the offline fallback. No local font files to stage.
- **9:16 / 1:1 are guidance**; this video ships 16:9 — verify the legibility floor and the one-teal discipline hold.
