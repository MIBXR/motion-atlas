#!/usr/bin/env bash
set -e
printf 'Bash: %s\n' "$BASH"
pwd
command -v node npm
npm run build:site
