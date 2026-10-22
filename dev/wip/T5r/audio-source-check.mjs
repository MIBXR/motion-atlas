import fs from 'node:fs';
import assert from 'node:assert/strict';
const upstream = fs.readFileSync('C:/Users/mibxr/AppData/Local/Temp/mmref/RhineLabUI/src/audio.ts', 'utf8').replaceAll('\r\n', '\n');
const port = fs.readFileSync('vendor/rhinelabui/src/audio.ts', 'utf8').replaceAll('\r\n', '\n');
assert.equal(port.split('// MOTION-ATLAS: §3.4 accepts')[0], upstream.split('export class TerminalAudio')[0]);
console.log('Original sample banks, typing rotation, rampLevel, BOOT_CUES and synthesizeSound: identical.');
