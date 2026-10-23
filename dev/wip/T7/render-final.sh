#!/usr/bin/env bash
set -euo pipefail
echo "Shell: $BASH_VERSION"
pwd
command -v node git ffmpeg ffprobe
node --import ./dev/wip/T4a/tools/direct-browser.mjs --import ./dev/wip/T7/render-gpu.mjs scripts/render.mjs demos/cases/industrial-protocol/index.html --port 4325 --orient "$1" --fps 30 --from 0 --to 60 --format jpeg --audio --out "dev/shots/T7/render/industrial-protocol-$1"
