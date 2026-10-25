#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../../.."
node scripts/build.mjs | tee dev/wip/Tcopy/build.log
node scripts/check.mjs | tee dev/wip/Tcopy/check.log
npm run build:site | tee dev/wip/Tcopy/build-site.log
node dev/wip/Tcopy/tools/banned.mjs
git diff --check
git diff --cached --check
