#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../../.."
pwd
printf 'shell=%s\n' "$BASH"
command -v bash git node tar python
node --version
tar --version
python --version
node scripts/build.mjs | tee dev/wip/Tcopy/build.log
node scripts/check.mjs | tee dev/wip/Tcopy/check.log
npm run build:site | tee dev/wip/Tcopy/build-site.log
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4326 2>&1 | tee dev/wip/Tcopy/smoke-1.log
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4326 2>&1 | tee dev/wip/Tcopy/smoke-2.log
