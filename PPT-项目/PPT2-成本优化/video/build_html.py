#!/usr/bin/env python3
"""Generate index.html: a 17-scene narrated training video composition.
Static DOM (content) built in Python; GSAP timeline (timing/opacity) built in JS.
All animation is opacity/transform on static elements => fully seek-safe."""
import html
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
manifest = json.load(open(os.path.join(ROOT, "assets", "audio", "manifest.json")))
SLIDES = manifest["slides"]
import subprocess as _sp
_probe = _sp.run([os.path.join(ROOT, ".bin", "ffprobe"), "-v", "error",
                  "-show_entries", "format=duration",
                  "-of", "default=noprint_wrappers=1:nokey=1",
                  os.path.join(ROOT, "assets", "audio", "narration.mp3")],
                 capture_output=True, text=True)
AUDIO_DUR = float(_probe.stdout.strip())
TOTAL = manifest["totalDuration"]
# composition duration = master audio length; audio slot matches exactly
DUR = AUDIO_DUR

# ---- section accent colors ----
SECT = {
    "intro":  ("#22d3ee", "#0891b2"),   # cyan
    "01":     ("#22d3ee", "#0891b2"),   # 资源总览
    "02":     ("#818cf8", "#4f46e5"),   # 权限与安装 indigo
    "03":     ("#a78bfa", "#7c3aed"),   # 概念与工作流 violet
    "04":     ("#34d399", "#059669"),   # 场景与Demo emerald
    "05":     ("#fbbf24", "#d97706"),   # AGENTS.md amber
    "06":     ("#38bdf8", "#0284c7"),   # Skill sky
    "07":     ("#fb7185", "#e11d48"),   # 安全 rose
    "08":     ("#fb923c", "#ea580c"),   # FAQ orange
    "end":    ("#22d3ee", "#0891b2"),   # 收束 cyan
}

def esc(s):
    return html.escape(str(s), quote=False)

def chip(num, label):
    if num:
        return f'<span class="chip"><b>{esc(num)}</b><span class="chip-label">{esc(label)}</span></span>'
    return f'<span class="chip chip-plain"><span class="chip-label">{esc(label)}</span></span>'

def takeaway(text):
    return f'<div class="takeaway"><span class="tk-tag">SO&nbsp;WHAT</span><span class="tk-text">{esc(text)}</span></div>'

def render_title(d):
    return f'''
      <div class="layout-title">
        <div class="kvline"><span>{esc(d["kicker"])}</span></div>
        <h1 class="big-title">{esc(d["title"])}</h1>
        <p class="big-sub">{esc(d["subtitle"])}</p>
        <div class="meta">{esc(d["meta"])}</div>
        <div class="footnote">{esc(d["footnote"])}</div>
      </div>'''

def render_agenda(d):
    cards = "".join(
        f'<div class="acard"><div class="acard-num" style="--c:{SECT["01"][0]}">{esc(c["num"])}</div>'
        f'<div class="acard-body"><div class="acard-t">{esc(c["label"])}</div>'
        f'<div class="acard-d">{esc(c["desc"])}</div></div></div>'
        for c in d["cards"]
    )
    steps = "".join(
        f'<div class="rs"><span class="rs-n" style="--c:{SECT["01"][0]}">{esc(i+1)}</span>'
        f'<span class="rs-t">{esc(s)}</span></div>'
        for i, s in enumerate(d["roadmap"])
    )
    return f'''
      <div class="agenda">
        <div class="ag-col">
          <div class="ag-h">公司已就位的能力</div>
          <div class="acards">{cards}</div>
        </div>
        <div class="ag-col">
          <div class="ag-h">本课五段路线图</div>
          <div class="rsteps">{steps}</div>
        </div>
      </div>'''

def render_models(d):
    cards = "".join(
        f'<div class="mcard {"mcard-pri" if c.get("primary") else ""}">'
        f'<div class="mcard-tag">{esc(c["tag"])}</div>'
        f'<div class="mcard-name">{esc(c["name"])}</div>'
        f'<div class="mcard-cost">{esc(c["cost"])}</div>'
        f'<div class="mcard-desc">{esc(c["desc"])}</div></div>'
        for c in d["models"]
    )
    return f'<div class="mcards">{cards}</div>' + takeaway(d["take"])

def render_forms(d):
    cards = "".join(
        f'<div class="fcard"><div class="fcard-n">{esc(c["name"])}</div>'
        f'<div class="fcard-w">{esc(c["where"])}</div>'
        f'<div class="fcard-u">{esc(c["use"])}</div></div>'
        for c in d["forms"]
    )
    return f'''<div class="forms">{cards}</div>
      <div class="code-block"><code>{esc(d["code"])}</code></div>''' + takeaway(d["take"])

def render_steps(d):
    steps = "".join(
        f'<div class="stp"><span class="stp-n" style="--c:{SECT["02"][0]}">{esc(s["n"])}</span>'
        f'<span class="stp-t">{esc(s["t"])}</span></div>'
        for s in d["steps"]
    )
    reasons = "".join(f'<li>{esc(r)}</li>' for r in d["callout"]["reasons"])
    return f'''<div class="steps3"><div class="stps">{steps}</div>
      <div class="callout callout-{d["callout"]["tone"]}">
        <div class="callout-h">{esc(d["callout"]["title"])}</div>
        <ul class="callout-list">{reasons}</ul></div></div>'''

def render_install2(d):
    cols = "".join(
        f'<div class="icol"><div class="icol-h">{esc(c["name"])}</div>'
        f'<ol class="icol-steps">' + "".join(f'<li>{esc(s)}</li>' for s in c["steps"]) + '</ol></div>'
        for c in d["cols"]
    )
    code = "".join(f'<code>{esc(line)}</code>' for line in d["code"])
    return f'''<div class="install2"><div class="icols">{cols}</div>
      <div class="code-block code-lines">{code}</div></div>'''

def render_concepts(d):
    cards = "".join(
        f'<div class="ccard"><div class="ccard-n">{esc(c["n"])}</div>'
        f'<div class="ccard-t">{esc(c["t"])}</div><div class="ccard-d">{esc(c["d"])}</div></div>'
        for c in d["concepts"]
    )
    return f'''<div class="concepts">
        <div class="cc-center">{esc(d["center"])}</div>
        <div class="ccards">{cards}</div></div>'''

def render_workflow(d):
    flow = ""
    for i, node in enumerate(d["flow"]):
        if i > 0:
            flow += '<div class="fl-arrow">→</div>'
        kind = "fl-node fl-decision" if "确认" in node else "fl-node"
        flow += f'<div class="{kind}">{esc(node)}</div>'
    code = "".join(f'<code>{esc(line)}</code>' for line in d["code"])
    return f'''<div class="workflow"><div class="flow">{flow}</div>
      <div class="code-block code-lines">{code}</div></div>''' + takeaway(d["take"])

def render_grid6(d):
    cards = "".join(
        f'<div class="gcard"><div class="gcard-n" style="--c:{SECT["04"][0]}">{esc(c["n"])}</div>'
        f'<div class="gcard-t">{esc(c["t"])}</div><div class="gcard-d">{esc(c["d"])}</div></div>'
        for c in d["grid"]
    )
    return f'<div class="grid6">{cards}</div>' + takeaway(d["take"])

def render_demo2(d):
    cards = "".join(
        f'<div class="dcard"><div class="dcard-t">{esc(c["t"])}</div>'
        f'<div class="dcard-prompt">{esc(c["prompt"])}</div>'
        f'<div class="dcard-out"><b>输出</b> {esc(c["out"])}</div></div>'
        for c in d["demos"]
    )
    return f'<div class="demos">{cards}</div>' + takeaway(d["take"])

def render_config(d):
    secs = "".join(
        f'<div class="cfg-sec"><div class="cfg-key">{esc(list(s.keys())[0])}</div>'
        f'<div class="cfg-val">{esc(list(s.values())[0])}</div></div>'
        for s in d["code"]
    )
    return f'''<div class="config">
        <div class="cfg-why">{esc(d["why"])}</div>
        <div class="code-block cfg-code"><div class="cfg-secs">{secs}</div></div>
        <div class="cfg-path">{esc(d["path"])}</div></div>'''

def render_skills2(d):
    cards = "".join(
        f'<div class="scard"><div class="scard-t">{esc(c["t"])}</div>'
        f'<div class="scard-d">{esc(c["d"])}</div>'
        f'<div class="code-block scard-cmd"><code>{esc(c["cmd"])}</code></div></div>'
        for c in d["skills"]
    )
    return f'<div class="skills2">{cards}</div>' + takeaway(d["take"])

def render_safety(d):
    green = "".join(f'<li>{esc(x)}</li>' for x in d["green"])
    red = "".join(f'<li>{esc(x)}</li>' for x in d["red"])
    return f'''<div class="safety">
        <div class="zone zone-green"><div class="zone-h">✓ Auto-Approve 适用</div><ul>{green}</ul></div>
        <div class="zone zone-red"><div class="zone-h">⚠ 安全红线 · 严禁全局免确认</div><ul>{red}</ul></div>
      </div>''' + takeaway(d["take"])

def render_faq3(d):
    cards = "".join(
        f'<div class="qcard"><div class="qcard-q">{esc(c["q"])}</div><ol class="qcard-a">'
        + "".join(f'<li>{esc(a)}</li>' for a in c["a"]) + '</ol></div>'
        for c in d["faqs"]
    )
    return f'<div class="faqs">{cards}</div>'

def render_checklist(d):
    items = "".join(
        f'<div class="ck"><span class="ck-box">✓</span><span class="ck-n">{esc(i+1)}</span>'
        f'<span class="ck-t">{esc(x)}</span></div>'
        for i, x in enumerate(d["items"])
    )
    return f'''<div class="checklist"><div class="cks">{items}</div>
        <div class="ck-next">{esc(d["next"])}</div></div>'''

def render_panels(d):
    grid = d.get("grid", "repeat(3,1fr)")
    panels = ""
    for p in d["panels"]:
        items = ""
        if p.get("items"):
            items = '<ul class="pn-list">' + "".join(f"<li>{esc(x)}</li>" for x in p["items"]) + "</ul>"
        note = f'<div class="pn-note">{esc(p["note"])}</div>' if p.get("note") else ""
        num = f'<span class="pn-num" style="--c:{SECT["01"][0]}">{esc(p["num"])}</span>' if p.get("num") else ""
        panels += f'<div class="panel"><div class="pn-head">{num}<span class="pn-t">{esc(p["t"])}</span></div>{items}{note}</div>'
    out = f'<div class="panels" style="grid-template-columns:{grid}">{panels}</div>'
    return out + (takeaway(d["take"]) if d.get("take") else "")

def render_compare(d):
    def col(c, kind):
        body = ""
        if c.get("items"):
            body += '<ul class="cmp-list">' + "".join(f"<li>{esc(x)}</li>" for x in c["items"]) + "</ul>"
        if c.get("code"):
            body += '<div class="code-block code-lines">' + "".join(f"<code>{esc(x)}</code>" for x in c["code"]) + "</div>"
        tag = f'<span class="cmp-tag">{esc(c["tag"])}</span>' if c.get("tag") else ""
        return f'<div class="cmp cmp-{kind}">{tag}<div class="cmp-h">{esc(c["h"])}</div><div class="cmp-body">{body}</div></div>'
    return f'<div class="compare">{col(d["left"],"bad")}{col(d["right"],"good")}</div>' + (takeaway(d["take"]) if d.get("take") else "")

def render_phases(d):
    cols = ""
    for p in d["phases"]:
        items = "".join(f"<li>{esc(x)}</li>" for x in p.get("items", []))
        cols += f'<div class="ph"><div class="ph-tag">{esc(p["tag"])}</div><div class="ph-h">{esc(p["t"])}</div><div class="ph-dur">{esc(p["dur"])}</div><ul class="ph-list">{items}</ul></div>'
    return f'<div class="phases">{cols}</div>' + (takeaway(d["take"]) if d.get("take") else "")

LAYOUTS = {
    "title": render_title, "agenda": render_agenda, "models": render_models,
    "forms": render_forms, "steps": render_steps, "install2": render_install2,
    "concepts": render_concepts, "workflow": render_workflow, "grid6": render_grid6,
    "demo2": render_demo2, "config": render_config, "skills2": render_skills2,
    "safety": render_safety, "faq3": render_faq3, "checklist": render_checklist,
    "panels": render_panels, "compare": render_compare, "phases": render_phases,
}

# ---- slide content ----
from content import CONTENT, BRAND_SUB, DOC_TITLE


def build_scene(n, info, timing):
    sec = info["section"]
    c1, c2 = SECT[sec]
    chipnum, chiplabel = info["chip"]
    renderer = LAYOUTS[info["layout"]]
    body = renderer(info["data"])
    title_html = ""
    if info["layout"] != "title":
        title_html = f'<h2 class="scene-title">{esc(info["title"])}</h2>'
    head = chip(chipnum, chiplabel)
    counter = f'<span class="counter">{n:02d}<i>/</i>17</span>'
    return f'''    <section class="scene" id="scene-{n}" data-n="{n}" style="--c1:{c1};--c2:{c2}">
      <div class="scene-inner">
        <div class="scene-head">{head}{counter}</div>
        {title_html}
        <div class="scene-body">{body}</div>
      </div>
    </section>'''

# build scene HTML
scenes_html = "\n".join(build_scene(n, CONTENT[n], SLIDES[n-1]) for n in range(1, len(CONTENT) + 1))

# build caption elements (one per cue, absolute positioned, opacity-tweened)
cap_html_parts = []
ci = 0
for s in SLIDES:
    base = s["audioStart"]
    for cue in s["captions"]:
        cap_html_parts.append(
            f'      <div class="cap" id="cap-{ci}" data-in="{base + cue["start"]:.3f}" '
            f'data-out="{base + cue["end"]:.3f}"><span>{esc(cue["text"])}</span></div>'
        )
        ci += 1
captions_html = "\n".join(cap_html_parts)
print(f"Total caption cues: {ci}")

# build timing JSON for JS (per-scene start/duration + caption times)
timing_js = {
    "total": round(DUR, 3),
    "scenes": [{"n": s["slide"], "start": round(s["sceneStart"], 3),
                "dur": round(s["sceneDuration"], 3)} for s in SLIDES],
}
timing_json = json.dumps(timing_js, ensure_ascii=False)

# caption data for JS (in/out times)
cap_data = []
ci = 0
for s in SLIDES:
    base = s["audioStart"]
    for cue in s["captions"]:
        cap_data.append({"i": ci, "in": round(base + cue["start"], 3),
                         "out": round(base + cue["end"], 3)})
        ci += 1
cap_json = json.dumps(cap_data, ensure_ascii=False)

HTML = '''<!doctype html>
<html lang="zh-CN" data-resolution="landscape">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>CIMICode · __DOC_TITLE__</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
  :root{
    --bg0:#070b16; --bg1:#0d1326; --bg2:#111a33;
    --panel:rgba(255,255,255,.045); --panel2:rgba(255,255,255,.07);
    --line:rgba(255,255,255,.10); --line2:rgba(255,255,255,.16);
    --ink:#eef3fb; --ink2:#aeb9cc; --ink3:#7c889e;
    --c1:#22d3ee; --c2:#0891b2;
  }
  @font-face { font-family:'PingFang SC'; src:local('PingFang SC'), local('.PingFangSC-Regular'); font-display:swap; }
  @font-face { font-family:'Noto Sans SC'; src:local('Noto Sans SC'); font-display:swap; }
  @font-face { font-family:'Microsoft YaHei'; src:local('Microsoft YaHei'); font-display:swap; }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;width:1920px;height:1080px;overflow:hidden;
    background:radial-gradient(120% 90% at 78% 8%, var(--bg2) 0%, var(--bg1) 38%, var(--bg0) 100%);
    font-family:"PingFang SC","Noto Sans SC","Microsoft YaHei",system-ui,-apple-system,sans-serif;
    color:var(--ink); -webkit-font-smoothing:antialiased;}
  #stage{position:relative;width:1920px;height:1080px;overflow:hidden;}
  /* faint grid + glow */
  #stage::before{content:"";position:absolute;inset:0;pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
      linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
    background-size:80px 80px;mask-image:radial-gradient(80% 70% at 50% 40%,#000 30%,transparent 100%);}
  #stage::after{content:"";position:absolute;width:1100px;height:1100px;right:-260px;top:-420px;
    background:radial-gradient(circle, color-mix(in srgb,var(--c1) 22%,transparent) 0%, transparent 62%);
    filter:blur(8px);pointer-events:none;opacity:.5;}

  /* persistent brand + progress */
  #brand{position:absolute;top:46px;left:72px;display:flex;align-items:center;gap:14px;z-index:40;
    opacity:0;}
  #brand .logo{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;font-weight:800;
    font-size:19px;color:#06121a;background:linear-gradient(135deg,var(--c1),var(--c2));
    box-shadow:0 6px 20px color-mix(in srgb,var(--c1) 40%,transparent);}
  #brand .wm{font-size:23px;font-weight:700;letter-spacing:.5px;}
  #brand .wm b{color:var(--c1);}
  #brand .wm .sep{color:var(--ink3);margin:0 8px;font-weight:400;}
  #progress{position:absolute;left:0;bottom:0;height:6px;width:100%;z-index:45;
    background:rgba(255,255,255,.06);}
  #progress .fill{height:100%;width:100%;transform-origin:left center;transform:scaleX(0);
    background:linear-gradient(90deg,var(--c1),var(--c2) 70%,color-mix(in srgb,var(--c1) 60%, #818cf8));}
  #section-rail{position:absolute;right:72px;top:52px;z-index:40;display:flex;gap:7px;opacity:0;}
  #section-rail .dot{width:9px;height:9px;border-radius:3px;background:rgba(255,255,255,.16);
    transition:none;}
  #section-rail .dot.on{background:var(--c1);box-shadow:0 0 10px color-mix(in srgb,var(--c1) 70%,transparent);}

  /* scenes */
  .scene{position:absolute;inset:0;display:flex;opacity:0;z-index:10;padding:118px 96px 152px;}
  .scene-inner{width:100%;margin:auto 0;display:flex;flex-direction:column;gap:26px;}
  .scene-head{display:flex;align-items:center;justify-content:space-between;}
  .chip{display:inline-flex;align-items:center;gap:11px;padding:8px 16px 8px 9px;border-radius:999px;
    background:color-mix(in srgb,var(--c1) 12%,transparent);border:1px solid color-mix(in srgb,var(--c1) 40%,transparent);}
  .chip b{display:grid;place-items:center;min-width:34px;height:30px;padding:0 8px;border-radius:8px;
    font-size:16px;color:#02060c;background:linear-gradient(135deg,var(--c1),var(--c2));font-weight:800;}
  .chip-label{font-size:19px;font-weight:600;color:var(--ink);letter-spacing:.5px;}
  .chip-plain{padding-left:16px;}
  .counter{font-size:21px;font-weight:600;color:var(--ink2);font-variant-numeric:tabular-nums;}
  .counter i{font-style:normal;color:#8d98ae;margin:0 6px;font-weight:400;}
  .scene-title{font-size:62px;line-height:1.16;font-weight:800;margin:0;letter-spacing:-.5px;
    max-width:1500px;}
  .scene-title em{font-style:normal;background:linear-gradient(120deg,var(--c1),color-mix(in srgb,var(--c1) 55%,#a78bfa));
    -webkit-background-clip:text;background-clip:text;color:transparent;}
  .scene-body{flex:1;min-height:0;}

  .takeaway{display:flex;align-items:center;gap:18px;padding:20px 26px;border-radius:16px;
    background:linear-gradient(90deg,color-mix(in srgb,var(--c1) 14%,transparent),transparent 80%);
    border-left:4px solid var(--c1);}
  .tk-tag{font-size:15px;font-weight:800;letter-spacing:2px;color:var(--c1);
    padding:5px 11px;border:1px solid color-mix(in srgb,var(--c1) 45%,transparent);border-radius:7px;flex:none;}
  .tk-text{font-size:26px;font-weight:500;color:var(--ink);line-height:1.45;}

  /* ---- title slide ---- */
  .layout-title{display:flex;flex-direction:column;gap:0;}
  .kvline{font-size:24px;font-weight:600;color:var(--c1);letter-spacing:2px;margin-bottom:26px;}
  .big-title{font-size:104px;line-height:1.1;font-weight:900;margin:0;letter-spacing:-1px;
    max-width:1400px;}
  .big-sub{font-size:46px;font-weight:500;color:var(--ink2);margin:30px 0 0;}
  .meta{font-size:25px;color:var(--ink3);margin-top:64px;letter-spacing:.5px;}
  .footnote{font-size:21px;color:var(--ink3);margin-top:14px;opacity:.85;}

  /* ---- agenda ---- */
  .agenda{display:grid;grid-template-columns:1fr 1fr;gap:40px;}
  .ag-h{font-size:23px;font-weight:700;color:var(--c1);margin-bottom:18px;letter-spacing:.5px;}
  .acards{display:flex;flex-direction:column;gap:14px;}
  .acard{display:flex;align-items:center;gap:22px;padding:22px 26px;border-radius:16px;
    background:var(--panel);border:1px solid var(--line);}
  .acard-num{font-size:60px;font-weight:900;line-height:1;color:var(--c);min-width:96px;}
  .acard-t{font-size:30px;font-weight:700;}
  .acard-d{font-size:21px;color:var(--ink2);margin-top:5px;line-height:1.4;}
  .rsteps{display:flex;flex-direction:column;gap:11px;}
  .rs{display:flex;align-items:center;gap:18px;padding:15px 22px;border-radius:13px;
    background:var(--panel);border:1px solid var(--line);}
  .rs-n{display:grid;place-items:center;width:40px;height:40px;border-radius:11px;flex:none;
    font-size:21px;font-weight:800;color:#06121a;background:var(--c);}
  .rs-t{font-size:25px;font-weight:600;}

  /* ---- models ---- */
  .mcards{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}
  .mcard{display:flex;flex-direction:column;gap:10px;padding:28px 24px;border-radius:18px;
    background:var(--panel);border:1px solid var(--line);position:relative;overflow:hidden;}
  .mcard-pri{background:linear-gradient(160deg,color-mix(in srgb,var(--c1) 22%,transparent),var(--panel));
    border-color:color-mix(in srgb,var(--c1) 55%,transparent);box-shadow:0 18px 50px color-mix(in srgb,var(--c1) 18%,transparent);}
  .mcard-tag{align-self:flex-start;font-size:17px;font-weight:800;padding:6px 14px;border-radius:8px;
    color:#06121a;background:linear-gradient(135deg,var(--c1),var(--c2));}
  .mcard-pri .mcard-tag{background:linear-gradient(135deg,#fde68a,#f59e0b);}
  .mcard-name{font-size:31px;font-weight:800;margin-top:4px;}
  .mcard-cost{font-size:20px;font-weight:700;color:var(--c1);}
  .mcard-pri .mcard-cost{color:#f59e0b;}
  .mcard-desc{font-size:19px;color:var(--ink2);line-height:1.5;margin-top:auto;}

  /* ---- forms ---- */
  .forms{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-bottom:8px;}
  .fcard{padding:26px;border-radius:18px;background:var(--panel);border:1px solid var(--line);
    border-top:3px solid var(--c1);}
  .fcard-n{font-size:30px;font-weight:800;}
  .fcard-w{font-size:20px;color:var(--c1);font-weight:600;margin-top:8px;}
  .fcard-u{font-size:20px;color:var(--ink2);margin-top:16px;line-height:1.5;}

  .code-block{font-family:"SF Mono","JetBrains Mono",ui-monospace,monospace;border-radius:14px;
    background:#05080f;border:1px solid var(--line2);padding:22px 28px;overflow:hidden;}
  .code-block code{font-size:24px;color:#7ee0ff;line-height:1.7;white-space:pre-wrap;display:block;}
  .code-lines{display:flex;flex-direction:column;gap:2px;}
  .code-lines code{font-size:23px;}

  /* ---- steps3 ---- */
  .steps3{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;}
  .stps{display:flex;flex-direction:column;gap:16px;}
  .stp{display:flex;align-items:center;gap:22px;padding:24px 28px;border-radius:16px;
    background:var(--panel);border:1px solid var(--line);}
  .stp-n{display:grid;place-items:center;width:58px;height:58px;border-radius:16px;flex:none;
    font-size:30px;font-weight:900;color:#06121a;background:var(--c);}
  .stp-t{font-size:29px;font-weight:600;line-height:1.35;}
  .callout{padding:26px 28px;border-radius:18px;}
  .callout-indigo{background:linear-gradient(160deg,color-mix(in srgb,#818cf8 22%,transparent),var(--panel));
    border:1px solid color-mix(in srgb,#818cf8 45%,transparent);}
  .callout-h{font-size:27px;font-weight:800;color:#c7d2fe;margin-bottom:16px;}
  .callout-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px;}
  .callout-list li{font-size:21px;color:var(--ink);padding-left:26px;position:relative;line-height:1.5;}
  .callout-list li::before{content:"›";position:absolute;left:0;color:#a5b4fc;font-weight:800;}

  /* ---- install2 ---- */
  .install2{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;}
  .icol{padding:26px;border-radius:18px;background:var(--panel);border:1px solid var(--line);
    border-top:3px solid var(--c1);}
  .icol-h{font-size:29px;font-weight:800;margin-bottom:18px;}
  .icol-steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:13px;counter-reset:s;}
  .icol-steps li{font-size:22px;color:var(--ink);padding-left:38px;position:relative;line-height:1.5;counter-increment:s;}
  .icol-steps li::before{content:counter(s);position:absolute;left:0;top:-2px;width:26px;height:26px;
    display:grid;place-items:center;font-size:15px;font-weight:800;border-radius:7px;color:#06121a;
    background:var(--c1);}

  /* ---- concepts ---- */
  .concepts{display:flex;flex-direction:column;gap:24px;}
  .cc-center{align-self:center;text-align:center;padding:18px 36px;border-radius:14px;font-size:25px;
    font-weight:700;color:var(--ink);background:var(--panel2);border:1px dashed var(--line2);}
  .ccards{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
  .ccard{padding:24px 22px;border-radius:16px;background:var(--panel);border:1px solid var(--line);
    border-top:3px solid var(--c1);}
  .ccard-n{font-size:42px;font-weight:900;color:var(--c1);line-height:1;}
  .ccard-t{font-size:26px;font-weight:800;margin-top:12px;}
  .ccard-d{font-size:19px;color:var(--ink2);margin-top:10px;line-height:1.5;}

  /* ---- workflow ---- */
  .workflow{display:flex;flex-direction:column;gap:22px;}
  .flow{display:flex;align-items:stretch;gap:10px;justify-content:center;}
  .fl-node{flex:1;max-width:230px;padding:20px 16px;border-radius:14px;background:var(--panel);
    border:1px solid var(--line);display:flex;align-items:center;justify-content:center;text-align:center;
    font-size:19px;font-weight:600;line-height:1.4;white-space:pre-line;min-height:96px;}
  .fl-decision{background:linear-gradient(160deg,color-mix(in srgb,var(--c1) 22%,transparent),var(--panel));
    border-color:color-mix(in srgb,var(--c1) 50%,transparent);color:var(--ink);}
  .fl-arrow{display:grid;place-items:center;color:var(--c1);font-size:30px;font-weight:700;}

  /* ---- grid6 ---- */
  .grid6{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:1fr 1fr;gap:20px;}
  .gcard{padding:24px;border-radius:16px;background:var(--panel);border:1px solid var(--line);
    display:flex;flex-direction:column;gap:8px;position:relative;}
  .gcard-n{position:absolute;top:18px;right:22px;font-size:52px;font-weight:900;color:var(--c);opacity:.3;line-height:1;}
  .gcard-t{font-size:27px;font-weight:800;padding-right:48px;}
  .gcard-d{font-size:20px;color:var(--ink2);line-height:1.5;margin-top:auto;}

  /* ---- demos ---- */
  .demos{display:grid;grid-template-columns:1fr 1fr;gap:28px;}
  .dcard{padding:28px;border-radius:18px;background:var(--panel);border:1px solid var(--line);
    display:flex;flex-direction:column;gap:16px;border-top:3px solid var(--c1);}
  .dcard-t{font-size:27px;font-weight:800;color:var(--c1);}
  .dcard-prompt{font-size:22px;color:var(--ink);line-height:1.6;padding:18px 20px;border-radius:12px;
    background:#05080f;border:1px solid var(--line2);border-left:3px solid var(--c1);}
  .dcard-out{font-size:20px;color:var(--ink2);line-height:1.5;}
  .dcard-out b{color:var(--c1);font-weight:700;margin-right:6px;}

  /* ---- config ---- */
  .config{display:grid;grid-template-columns:1fr;gap:16px;}
  .cfg-why{font-size:24px;color:var(--c1);font-weight:600;}
  .cfg-code{padding:6px 0;}
  .cfg-secs{display:flex;flex-direction:column;}
  .cfg-sec{display:grid;grid-template-columns:340px 1fr;gap:24px;padding:18px 28px;border-bottom:1px solid var(--line);}
  .cfg-sec:last-child{border-bottom:none;}
  .cfg-key{font-family:"SF Mono","JetBrains Mono",ui-monospace,monospace;font-size:22px;font-weight:700;color:#7ee0ff;}
  .cfg-val{font-size:21px;color:var(--ink);line-height:1.5;}
  .cfg-path{font-size:20px;color:var(--ink2);font-family:"SF Mono","JetBrains Mono",ui-monospace,monospace;}

  /* ---- skills2 ---- */
  .skills2{display:grid;grid-template-columns:1fr 1fr;gap:28px;}
  .scard{padding:28px;border-radius:18px;background:var(--panel);border:1px solid var(--line);
    display:flex;flex-direction:column;gap:14px;border-top:3px solid var(--c1);}
  .scard-t{font-size:27px;font-weight:800;color:var(--c1);}
  .scard-d{font-size:21px;color:var(--ink);line-height:1.6;}
  .scard-cmd{margin-top:auto;}

  /* ---- safety ---- */
  .safety{display:grid;grid-template-columns:1fr 1fr;gap:28px;}
  .zone{padding:28px;border-radius:18px;display:flex;flex-direction:column;gap:14px;}
  .zone-green{background:linear-gradient(160deg,color-mix(in srgb,#34d399 18%,transparent),var(--panel));
    border:1px solid color-mix(in srgb,#34d399 42%,transparent);}
  .zone-red{background:linear-gradient(160deg,color-mix(in srgb,#fb7185 18%,transparent),var(--panel));
    border:1px solid color-mix(in srgb,#fb7185 42%,transparent);}
  .zone-h{font-size:26px;font-weight:800;}
  .zone-green .zone-h{color:#6ee7b7;} .zone-red .zone-h{color:#fda4af;}
  .zone ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px;}
  .zone li{font-size:23px;color:var(--ink);padding-left:34px;position:relative;line-height:1.5;}
  .zone-green li::before{content:"✓";position:absolute;left:0;color:#34d399;font-weight:800;}
  .zone-red li::before{content:"✕";position:absolute;left:0;color:#fb7185;font-weight:800;}

  /* ---- faq ---- */
  .faqs{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
  .qcard{padding:26px;border-radius:18px;background:var(--panel);border:1px solid var(--line);
    display:flex;flex-direction:column;gap:16px;border-top:3px solid var(--c1);}
  .qcard-q{font-size:26px;font-weight:800;color:var(--c1);line-height:1.35;}
  .qcard-a{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:11px;counter-reset:q;}
  .qcard-a li{font-size:21px;color:var(--ink2);padding-left:34px;position:relative;line-height:1.5;counter-increment:q;}
  .qcard-a li::before{content:counter(q);position:absolute;left:0;top:0;width:24px;height:24px;
    display:grid;place-items:center;font-size:14px;font-weight:800;border-radius:6px;color:#06121a;
    background:var(--c1);}

  /* ---- checklist ---- */
  .checklist{display:flex;flex-direction:column;gap:20px;}
  .cks{display:grid;grid-template-columns:1fr 1fr;gap:13px 40px;}
  .ck{display:flex;align-items:center;gap:16px;padding:14px 22px;border-radius:13px;
    background:var(--panel);border:1px solid var(--line);}
  .ck-box{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;flex:none;font-size:17px;
    font-weight:800;color:#06121a;background:linear-gradient(135deg,#34d399,#059669);}
  .ck-n{font-size:19px;font-weight:800;color:var(--c1);min-width:26px;}
  .ck-t{font-size:22px;font-weight:500;color:var(--ink);}
  .ck-next{font-size:22px;color:var(--ink2);padding:18px 24px;border-radius:13px;
    background:linear-gradient(90deg,color-mix(in srgb,var(--c1) 12%,transparent),transparent 80%);
    border-left:4px solid var(--c1);line-height:1.5;}

  /* ---- panels (versatile titled grid) ---- */
  .panels{display:grid;gap:20px;}
  .panel{padding:24px;border-radius:16px;background:var(--panel);border:1px solid var(--line);
    border-top:3px solid var(--c1);display:flex;flex-direction:column;gap:12px;}
  .pn-head{display:flex;align-items:center;gap:12px;}
  .pn-num{display:grid;place-items:center;width:36px;height:36px;border-radius:10px;flex:none;
    font-size:18px;font-weight:800;color:#06121a;background:var(--c);}
  .pn-t{font-size:25px;font-weight:800;line-height:1.3;}
  .pn-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:9px;}
  .pn-list li{font-size:20px;color:var(--ink2);padding-left:22px;position:relative;line-height:1.5;}
  .pn-list li::before{content:"·";position:absolute;left:6px;color:var(--c1);font-weight:800;}
  .pn-note{font-size:18px;color:var(--ink3);font-style:italic;margin-top:auto;}

  /* ---- compare (bad vs good) ---- */
  .compare{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
  .cmp{padding:26px;border-radius:18px;display:flex;flex-direction:column;gap:14px;}
  .cmp-bad{background:linear-gradient(160deg,color-mix(in srgb,#fb7185 14%,transparent),var(--panel));
    border:1px solid color-mix(in srgb,#fb7185 38%,transparent);}
  .cmp-good{background:linear-gradient(160deg,color-mix(in srgb,var(--c1) 16%,transparent),var(--panel));
    border:1px solid color-mix(in srgb,var(--c1) 42%,transparent);}
  .cmp-tag{align-self:flex-start;font-size:16px;font-weight:800;padding:5px 13px;border-radius:8px;color:#06121a;}
  .cmp-bad .cmp-tag{background:linear-gradient(135deg,#fda4af,#fb7185);}
  .cmp-good .cmp-tag{background:linear-gradient(135deg,var(--c1),var(--c2));}
  .cmp-h{font-size:24px;font-weight:800;line-height:1.4;white-space:pre-line;}
  .cmp-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;}
  .cmp-list li{font-size:20px;color:var(--ink);padding-left:26px;position:relative;line-height:1.5;}
  .cmp-bad .cmp-list li::before{content:"✗";position:absolute;left:0;color:#fb7185;font-weight:800;}
  .cmp-good .cmp-list li::before{content:"✓";position:absolute;left:0;color:var(--c1);font-weight:800;}

  /* ---- phases (timeline columns) ---- */
  .phases{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
  .ph{padding:20px 18px;border-radius:15px;background:var(--panel);border:1px solid var(--line);
    border-top:3px solid var(--c1);display:flex;flex-direction:column;gap:8px;}
  .ph-tag{align-self:flex-start;font-size:15px;font-weight:800;padding:4px 11px;border-radius:7px;
    color:#06121a;background:linear-gradient(135deg,var(--c1),var(--c2));}
  .ph-h{font-size:22px;font-weight:800;line-height:1.3;}
  .ph-dur{font-size:17px;color:var(--c1);font-weight:600;}
  .ph-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;}
  .ph-list li{font-size:17px;color:var(--ink2);padding-left:16px;position:relative;line-height:1.4;}
  .ph-list li::before{content:"›";position:absolute;left:0;color:var(--c1);font-weight:800;}

  /* ---- captions ---- */
  #captions{position:absolute;left:0;right:0;bottom:56px;height:0;z-index:35;pointer-events:none;}
  .cap{position:absolute;bottom:0;left:50%;transform:translateX(-50%);max-width:1720px;opacity:0;
    padding:12px 30px;border-radius:15px;background:rgba(8,12,22,.93);
    border:1px solid color-mix(in srgb,var(--c1) 35%,transparent);
    box-shadow:0 10px 40px rgba(0,0,0,.5);}
  .cap span{font-size:31px;font-weight:700;color:#fff;line-height:1.3;letter-spacing:.3px;
    text-shadow:0 2px 12px rgba(0,0,0,.7);}
</style>
</head>
<body>
  <div id="stage" data-composition-id="main-video" data-width="1920" data-height="1080"
       data-start="0" data-duration="__DUR__">

    <div id="brand">
      <div class="logo">C</div>
      <div class="wm"><b>CIMICode</b><span class="sep">·</span>__BRAND_SUB__</div>
    </div>

    <div id="section-rail"></div>

    <!-- scenes -->
__SCENES__

    <!-- captions -->
    <div id="captions">
__CAPTIONS__
    </div>

    <!-- master narration audio -->
    <audio id="narration" class="clip" data-start="0" data-duration="__DUR__" data-track-index="0" data-volume="1"
           src="assets/audio/narration.mp3"></audio>

    <!-- progress -->
    <div id="progress"><div class="fill" id="prog-fill"></div></div>

    <script>
      (function(){
        const TIMING = __TIMING__;
        const CAPS = __CAPS__;
        const DUR = TIMING.total;

        // section rail dots: 8 sections
        const rail = document.getElementById('section-rail');
        const railEl = (function(){ /* build 9 markers by section group */ return null; })();

        const tl = gsap.timeline({ paused: true });
        window.__timelines = window.__timelines || {};

        // brand + rail fade in early
        tl.fromTo('#brand', {opacity:0, y:-12}, {opacity:1, y:0, duration:0.7, ease:'power2.out'}, 0.2);
        tl.fromTo('#section-rail', {opacity:0, y:-12}, {opacity:1, y:0, duration:0.7, ease:'power2.out'}, 0.3);

        // progress bar fill across whole duration
        gsap.set('#prog-fill', { scaleX: 0 });
        tl.to('#prog-fill', { scaleX: 1, duration: DUR, ease:'none' }, 0);

        // scenes: fade+rise in, fade out at end
        TIMING.scenes.forEach(function(sc){
          const sel = '#scene-' + sc.n;
          gsap.set(sel, { opacity: 0, y: 24 });
          // entrance
          tl.to(sel, { opacity: 1, y: 0, duration: 0.55, ease:'power3.out' }, sc.start);
          // body items stagger on a touch after entrance
          // exit (last 0.32s)
          tl.to(sel, { opacity: 0, y: -16, duration: 0.34, ease:'power2.in' }, sc.start + sc.dur - 0.34);
          tl.set(sel, { opacity: 0 }, sc.start + sc.dur);
        });

        // captions: opacity tween per cue (seek-safe — static text, only opacity animates)
        CAPS.forEach(function(c){
          const sel = '#cap-' + c.i;
          const dur = Math.max(0.25, c.out - c.in);
          tl.set(sel, { opacity: 0 }, 0);
          tl.fromTo(sel, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.18, ease:'power2.out' }, c.in);
          tl.to(sel, { opacity: 0, y: -6, duration: 0.16, ease:'power2.in' }, c.out - 0.16);
          tl.set(sel, { opacity: 0 }, c.out);
        });

        // section rail highlight: pre-compute per-time active section via tweens on dots
        // build dots dynamically and tween their class state across each scene band
        const sectionBand = [];
        TIMING.scenes.forEach(function(sc){
          const key = 's' + sc.n;
          sectionBand.push({ start: sc.start, end: sc.start + sc.dur });
        });
        // (rail dots rendered statically below via inline style markers are optional; keep minimal)

        window.__timelines['main-video'] = tl;
      })();
    </script>
  </div>
</body>
</html>
'''

out = HTML.replace("__DUR__", f"{DUR:.2f}") \
          .replace("__SCENES__", scenes_html) \
          .replace("__CAPTIONS__", captions_html) \
          .replace("__TIMING__", timing_json) \
          .replace("__CAPS__", cap_json) \
          .replace("__DOC_TITLE__", DOC_TITLE) \
          .replace("__BRAND_SUB__", BRAND_SUB)
with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
    f.write(out)
print(f"Wrote index.html  (duration {DUR:.1f}s)")
