#!/usr/bin/env bash
set -eo pipefail
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4328 | tee dev/wip/Tres/evidence/smoke-after-vendor-1.log
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4328 | tee dev/wip/Tres/evidence/smoke-after-vendor-2.log
