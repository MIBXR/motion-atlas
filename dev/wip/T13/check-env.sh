#!/usr/bin/env bash
set -eu
printf 'shell=%s\ncwd=%s\n' "$BASH" "$PWD"
for tool in bash git node tar python ffmpeg ffprobe npm; do command -v "$tool" || true; done
node --version
git --version
tar --version | head -n 1
