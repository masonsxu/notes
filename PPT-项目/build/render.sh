#!/usr/bin/env bash
# render.sh — PPTX → 每页 PNG（LibreOffice + PyMuPDF）
# 用法: bash render.sh <input.pptx> <output_png_dir> [dpi]
set -euo pipefail
SOFFICE="/Volumes/Vault/Application/LibreOffice.app/Contents/MacOS/soffice"
IN="$1"; OUTDIR="$2"; DPI="${3:-140}"
mkdir -p "$OUTDIR"
TMP="$(mktemp -d)"
echo "[1/3] LibreOffice → PDF"
"$SOFFICE" --headless --convert-to pdf --outdir "$TMP" "$IN" >/dev/null 2>&1
PDF="$TMP/$(basename "${IN%.pptx}.pdf")"
[ -f "$PDF" ] || { echo "PDF 生成失败"; exit 1; }
echo "[2/3] PyMuPDF → PNG @ ${DPI}dpi"
uv run --project /Volumes/Vault/repos/github/notes python - "$PDF" "$OUTDIR" "$DPI" <<'PY'
import sys, fitz, os, re
pdf, outdir, dpi = sys.argv[1], sys.argv[2], int(sys.argv[3])
doc = fitz.open(pdf)
base = re.sub(r'\.pdf$', '', os.path.basename(pdf))
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=dpi)
    out = os.path.join(outdir, f"slide-{i+1:02d}.png")
    pix.save(out)
    print(f"  {out}  {pix.width}x{pix.height}")
print(f"共 {doc.page_count} 页")
PY
rm -rf "$TMP"
echo "[3/3] 完成 → $OUTDIR"