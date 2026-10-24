#!/usr/bin/env bash
set -e
pwd -P
printf 'Bash %s\n' "$BASH_VERSION"
command -v bash git node tar python
tar --version | head -1
node scripts/build.mjs
node scripts/check.mjs
npm run build:site
node dev/wip/Tres/tools/verify-dist.mjs
