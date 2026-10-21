#!/usr/bin/env bash
set -euo pipefail
printf 'shell=%s\nBASH=%s\nBASH_VERSION=%s\n' "$0" "$BASH" "$BASH_VERSION"
pwd
for tool in bash git node tar python ffmpeg ffprobe; do command -v "$tool" || true; done
node --version
tar --version
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/render.mjs demos/cases/archive-os/index.html --orient portrait --fps 30 --format jpeg --audio --out dev/shots/T5/render/portrait 2>&1 | tee dev/shots/T13/archive-render-portrait.log
ffprobe -v error -show_streams -show_format -of json dev/shots/T5/render/portrait.mp4 > dev/shots/T13/archive-ffprobe-portrait.json
