import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import ts from '../../../vendor/rhinelabui/node_modules/typescript/lib/typescript.js';
import { inputs, timeline } from '../../../vendor/rhinelabui/film/sequence.js';

const memo = new Map();
function sourceModule(file) {
  if (memo.has(file)) return memo.get(file).exports;
  const module = { exports: {} };
  memo.set(file, module);
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(`(function(exports, require, module) { ${compiled}\n })`)(module.exports, relative => sourceModule(path.resolve(path.dirname(file), `${relative}.ts`)), module);
  return module.exports;
}
const data = JSON.parse(fs.readFileSync('dev/shots/T5r/audio/film-audio.json', 'utf8'));
const { TYPING_FRAMES } = sourceModule(path.resolve('vendor/rhinelabui/src/typing-rhythm.ts'));
const audio = data.audio, events = audio.scheduled;
const recordedActions = data.actions.map(({ frame, before, after, ...action }) => action);
assert.deepEqual(recordedActions, inputs(data.A));
assert.equal(data.duration, timeline(data.A).duration);
assert.equal(data.duration, 77.6);
assert.equal(data.sampleRate, 48000);
assert.equal(data.channels, 2);
assert.equal(audio.tracks, 3);
assert.equal(audio.loaded, true);
assert.equal(audio.error, '');
assert.equal(events.some(event => event.time < 1 / 60), false, 'Startup must not add an initialization tick.');
const source = fs.readFileSync('vendor/rhinelabui/src/audio.ts', 'utf8');
const expected = [...source.matchAll(/\{ time: ([\d.]+), sound: "([^"]+)" \}/g)].map(match => ({ time: Number(match[1]) - 5, sound: match[2], source: 'audio.ts BOOT_CUES' }));
expected.push(...TYPING_FRAMES.map(frame => ({ time: frame / 25 - 5, sound: 'key', source: 'typing-rhythm.ts TYPING_FRAMES' })));
for (const [time, sound] of [[42.5,'ui-tick'],[45,'ui-tick'],[47.5,'ui-tick'],[49,'page-open'],[50.7,'ui-tick'],[52.4,'ui-tick'],[54.1,'explode'],[57.5,'ui-tick'],[58.35,'assemble'],[60.15+.22,'page-close'],[60.6,'back'],[62.6,'tick'],[63.6,'tick'],[64.6,'column'],[65.6,'column'],[66.6,'column'],[67.6,'tick'],[68.6,'tick'],[69.6,'tick'],[70.6,'tick'],[71.6,'column'],[71.95,'column'],[73,'column'],[74,'tick'],[75,'tick']]) expected.push({ time, sound, source: 'main.ts / model-viewer.ts input handlers' });
const remaining = [...events];
for (const event of expected) {
  const index = remaining.findIndex(actual => actual.sound === event.sound && Math.abs(actual.time - event.time) <= 1 / 60 + 1e-6);
  assert.ok(index >= 0, `Missing ${event.sound} at ${event.time}s (${event.source})`);
  assert.equal(remaining[index].pan, event.sound === 'column' ? event.time < 70 ? 0.45 : -0.45 : 0);
  remaining.splice(index, 1);
}
assert.deepEqual(remaining, [], 'Every scheduled sound must match an original cue or specified input.');
const counts = {};
for (const event of events) counts[event.sound] = (counts[event.sound] || 0) + 1;
assert.equal(counts.key, TYPING_FRAMES.length);
assert.equal(counts.key, audio.playedKeys);
const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,sample_rate,channels,duration:format=duration,size', '-of', 'json', 'demos/cases/archive-os/film-audio.ogg'], { encoding: 'utf8' });
assert.equal(probe.status, 0, probe.stderr);
const spec = JSON.parse(probe.stdout);
assert.equal(spec.streams[0].codec_name, 'vorbis');
assert.equal(Number(spec.streams[0].sample_rate), 48000);
assert.equal(spec.streams[0].channels, 2);
assert.equal(Number(spec.format.duration), 77.6);
fs.writeFileSync('dev/shots/T5r/audio/ffprobe.json', JSON.stringify(spec, null, 2) + '\n');
const result = { checkedEvents: events.length, checkedInputActions: recordedActions.length, currentSequenceMatchesRecorded: true, bootCues: 10, originalTypingFrames: TYPING_FRAMES.length, counts, tracks: audio.tracks, duration: data.duration, sampleRate: data.sampleRate, channels: data.channels, peak: data.peak, rms: data.rms, peakDb: 20 * Math.log10(data.peak), rmsDb: 20 * Math.log10(data.rms), checkedPan: true, additionalEvents: remaining };
fs.writeFileSync('dev/shots/T5r/audio/verification.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
