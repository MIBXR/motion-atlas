#!/usr/bin/env bash
set -euo pipefail
node scripts/build.mjs | tee dev/wip/Tres/evidence/b1-build.log
node scripts/check.mjs | tee dev/wip/Tres/evidence/b1-check.log
npm run build:site | tee dev/wip/Tres/evidence/b1-build-site.log
node -e 'const fs=require("node:fs"); for(const p of ["dist/resources/lemo-opuscar/","dist/demos/styles/player/","dist/scripts/lemo-status.json","dist/core/lib.js"]) {if(!fs.existsSync(p)) throw new Error("missing "+p); console.log("dist exists "+p); } const scripts=fs.readdirSync("dist/scripts"); if(JSON.stringify(scripts)!==JSON.stringify(["lemo-status.json"])) throw new Error("Unexpected dist/scripts files");' | tee dev/wip/Tres/evidence/b1-dist.log
node dev/wip/Tres/tools/check-lemo-ignored.mjs | tee dev/wip/Tres/evidence/b1-ignored.log
