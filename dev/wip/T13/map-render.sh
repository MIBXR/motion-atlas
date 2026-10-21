#!/usr/bin/env bash
set -euo pipefail
orient=${1:-portrait}
mkdir -p dev/shots/T13/seek
exec > >(tee "dev/shots/T13/seek/map-render-$orient.log") 2>&1
printf 'shell=%s\ncwd=%s\n' "$BASH" "$PWD"
for tool in bash git node tar ffmpeg ffprobe; do command -v "$tool"; done
node --version
tar --version | head -n 1
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/render.mjs 'http://localhost:4321/demos/cases/map-pilgrimage/index.html' --orient "$orient" --fps 30 --from 8 --to 31 --audio --format jpeg --out "dev/shots/T4/render/$orient-8-31"
ffprobe -v error -show_streams -show_format -of json "dev/shots/T4/render/$orient-8-31.mp4" > "dev/shots/T13/seek/map-ffprobe-$orient.json"
