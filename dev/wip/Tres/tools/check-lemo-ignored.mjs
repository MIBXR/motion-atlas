import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const evidence = 'dev/wip/Tres/evidence';
const expected = fs.readFileSync(`${evidence}/lemo-ignored-files.txt`, 'utf8').trim().split(/\r?\n/).sort();
const result = spawnSync('git', ['ls-files', '--others', '--ignored', '--exclude-standard', 'resources'], { encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr);
fs.writeFileSync(`${evidence}/lemo-ignored-actual.txt`, result.stdout);
const actual = result.stdout.trim().split(/\r?\n/).filter(Boolean).sort();
const extra = actual.filter(file => !expected.includes(file)), missing = expected.filter(file => !actual.includes(file));
const upstreamIgnoreUnchanged = fs.readFileSync('resources/lemo-opuscar/.gitignore').equals(fs.readFileSync('../../dev/shots/Tnew/refs/2-lemo-opuscar/.gitignore'));
const summary = { expected: expected.length, actual: actual.length, extra, missing, upstreamIgnoreUnchanged };
fs.writeFileSync(`${evidence}/lemo-ignored-comparison.json`, JSON.stringify(summary, null, 2) + '\n');
console.log('ignored comparison ' + JSON.stringify(summary));
assert.equal(expected.length, 84);
assert.deepEqual(actual, expected);
assert.equal(upstreamIgnoreUnchanged, true);
