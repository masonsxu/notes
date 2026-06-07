#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

MSG="${1:-sync $(date '+%Y-%m-%d %H:%M')}"

git add -A
git commit -m "$MSG"
git push
