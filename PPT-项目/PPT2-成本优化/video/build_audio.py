#!/usr/bin/env python3
"""Concatenate per-slide audio into one master narration track using ffmpeg,
placing each clip at its manifest audioStart via inserted silence gaps."""
import json
import os
import subprocess
import tempfile

ROOT = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(ROOT, "assets", "audio")
FFMPEG = os.path.join(ROOT, ".bin", "ffmpeg")
if not os.path.exists(FFMPEG):
    FFMPEG = "ffmpeg"

manifest = json.load(open(os.path.join(AUDIO, "manifest.json")))
slides = manifest["slides"]

# Build concat list: clip1, silence, clip2, silence, ..., clipN, tail-silence
tmp = tempfile.mkdtemp(prefix="concat-")
seg_files = []
plan = []
for i, s in enumerate(slides):
    seg_files.append(os.path.join(AUDIO, f"{s['slide']:02d}.mp3"))
    plan.append(f"clip {s['slide']:02d} @ {s['audioStart']:.1f} dur {s['audioDuration']:.1f}")
    if i < len(slides) - 1:
        nxt = slides[i + 1]
        gap = nxt["audioStart"] - (s["audioStart"] + s["audioDuration"])
    else:
        gap = 0.4  # tail silence
    if gap > 0.005:
        sil = os.path.join(tmp, f"sil_{i:02d}.mp3")
        subprocess.run(
            [FFMPEG, "-y", "-loglevel", "error",
             "-f", "lavfi", "-i", "anullsrc=channel_layout=mono:sample_rate=24000",
             "-t", f"{gap:.3f}", "-c:a", "libmp3lame", "-b:a", "96k", sil],
            check=True,
        )
        seg_files.append(sil)
        plan.append(f"silence {gap:.2f}s")

# Write concat list (safe format)
listfile = os.path.join(tmp, "list.txt")
with open(listfile, "w") as f:
    for sf in seg_files:
        f.write(f"file '{sf}'\n")

out = os.path.join(AUDIO, "narration.mp3")
subprocess.run(
    [FFMPEG, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
     "-i", listfile, "-c:a", "libmp3lame", "-b:a", "128k", out],
    check=True,
)
print("\n".join(plan))
print(f"\nWrote {out}")
# report duration
r = subprocess.run([os.path.join(ROOT, ".bin", "ffprobe"), "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1", out],
                   capture_output=True, text=True)
print(f"Master duration: {float(r.stdout.strip()):.1f}s (manifest total {manifest['totalDuration']:.1f}s)")
