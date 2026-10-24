#!/usr/bin/env bash
set -euo pipefail
node dev/wip/Tres/tools/measure-web.mjs | tee dev/wip/Tres/evidence/lemo-durations.log
lemo_main=$(cygpath -am ../..)
node scripts/vendor-resources.mjs lemo-opuscar "$lemo_main/dev/shots/Tnew/refs/2-lemo-opuscar" --commit 3961ddb3d24d8876e0e2754f7790d66908acee51 --packs "$lemo_main/dev/shots/Tnew/survey2/packs" --web "$lemo_main/dev/shots/Tnew/films-web" --fetched 2026-10-24 | tee dev/wip/Tres/evidence/vendor-lemo.log
git ls-files --others --ignored --exclude-standard resources > dev/wip/Tres/evidence/lemo-ignored-files.txt
if [[ -s dev/wip/Tres/evidence/lemo-ignored-files.txt ]]; then
  printf '%s\n' 'STOP: resources 中仍有被忽略的文件，按 B1 第 1.3a 节停止。'
  wc -l dev/wip/Tres/evidence/lemo-ignored-files.txt
  exit 3
fi
