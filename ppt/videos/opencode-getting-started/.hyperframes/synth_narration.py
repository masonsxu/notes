#!/usr/bin/env python3
"""Synthesize narration with edge-tts (Microsoft neural, Mandarin) and emit a
HyperFrames-compatible audio_meta.json (frame-keyed voices + per-token words).

Why edge-tts: HuggingFace + HeyGen are network-blocked here, so Kokoro/HeyGen
can't download. speech.platform.bing.com (edge-tts) is reachable and ships
high-quality zh-CN neural voices. This version emits SentenceBoundary (per-
sentence), so per-token karaoke timing is interpolated within each sentence
window by character weight — smooth and well-paced.
"""
import asyncio, json, os, re, sys, subprocess
from pathlib import Path

VOICE = os.environ.get("EDGE_VOICE", "zh-CN-XiaoxiaoNeural")
RATE = os.environ.get("EDGE_RATE", "+0%")  # e.g. "-5%" slower
import edge_tts

PROJ = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
SCRIPT_MD = PROJ / "SCRIPT.md"
AUDIO_DIR = PROJ / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
OUT = PROJ / "audio_meta.json"

# ---- parse SCRIPT.md: "## ... (Frame N)" opens a line; indented block = text ----
def parse_script(md):
    lines, cur, collecting = [], None, False
    for ln in md.splitlines():
        m = re.match(r"^#{2,3}\s+.*?\(frame\s+(\d+)\)", ln, re.I)
        if m:
            if cur: lines.append(cur)
            cur = {"frame": int(m.group(1)), "text": ""}
            collecting = False
            continue
        if cur is not None and re.match(r"^\s*\*\*", ln):
            continue
        if cur is not None and re.match(r"^(?: {4,}|\t)(.+)$", ln):
            cur["text"] += ("" if not cur["text"] else " ") + re.match(r"^(?: {4,}|\t)(.+)$", ln).group(1).strip()
            collecting = True
    if cur: lines.append(cur)
    return [l for l in lines if l["text"].strip()]

PUNCT = set("，。？！、；：·—–-…）)】》」』\"'.,;:!?")
def tokenize(text):
    """CJK char (+ trailing punctuation) = one token; latin/digit run = one token."""
    toks, i = [], 0
    while i < len(text):
        c = text[i]
        if c.isspace():
            i += 1; continue
        if re.match(r"[A-Za-z0-9_/.\-+@#]", c):
            j = i
            while j < len(text) and re.match(r"[A-Za-z0-9_/.\-+@#]", text[j]): j += 1
            toks.append(text[i:j]); i = j; continue
        # CJK or other single char, gobble trailing punctuation
        j = i + 1
        while j < len(text) and text[j] in PUNCT: j += 1
        toks.append(text[i:j]); i = j
    return toks

def weight(t):
    w = 0
    for c in t:
        if c in PUNCT: w += 0.3
        elif re.match(r"[A-Za-z0-9]", c): w += 0.5
        else: w += 1.0
    return max(w, 0.4)

async def synth(text):
    comm = edge_tts.Communicate(text, VOICE, rate=RATE)
    audio = bytearray()
    sents = []  # (offset_s, dur_s, text)
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
        elif chunk["type"] == "SentenceBoundary":
            sents.append((chunk["offset"] / 1e7, chunk["duration"] / 1e7, chunk.get("text", "")))
    return bytes(audio), sents

def words_from(sents):
    """Distribute per-token timings within each sentence window by char weight.
    Uses each boundary's own text for tokenization."""
    if not sents:
        return [], 0.0
    words, idx = [], 0
    for (off, dur, ptext) in sents:
        toks = tokenize(ptext) or [ptext]
        total = sum(weight(t) for t in toks) or 1
        acc = 0.0
        for t in toks:
            w = weight(t)
            ws = off + acc / total * dur
            we = off + (acc + w) / total * dur
            words.append({"id": idx, "text": t, "start": round(ws, 3), "end": round(we, 3)})
            acc += w; idx += 1
    total_dur = max((s[0] + s[1]) for s in sents) if sents else 0.0
    return words, round(total_dur, 3)

def probe_duration(path):
    try:
        out = subprocess.check_output([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "csv=p=0", str(path)
        ], text=True).strip()
        return round(float(out), 3)
    except Exception:
        return None

async def main():
    lines = parse_script(SCRIPT_MD.read_text(encoding="utf-8"))
    print(f"parsed {len(lines)} narration lines from SCRIPT.md; voice={VOICE} rate={RATE}")
    voices = []
    for ln in lines:
        f = ln["frame"]; text = ln["text"]
        audio, sents = await synth(text)
        outmp3 = AUDIO_DIR / f"voice-{f:02d}.mp3"
        outmp3.write_bytes(audio)
        words, est = words_from(sents)
        dur = probe_duration(outmp3) or est
        voices.append({"frame": f, "path": f"audio/voice-{f:02d}.mp3",
                       "duration_s": dur, "words": words})
        print(f"  frame {f:02d}: {dur:.2f}s  {len(words)} tokens  {outmp3.name}")
    meta = {"bgm": None, "bgm_pending": False, "voices": voices, "sfx": []}
    OUT.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    total = round(sum(v["duration_s"] for v in voices), 2)
    print(f"\n✓ wrote {OUT.name}: {len(voices)} clips, {total}s narration total")

asyncio.run(main())
