#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/../../../.."
grep -rnI -E 'industrial-protocol|chamfer-panel|text-scramble|conveyor-flow|hold-confirm|scanline-wipe' --exclude-dir=dev --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist . > dev/wip/Tcopy/references-before.txt || test "$?" = 1
