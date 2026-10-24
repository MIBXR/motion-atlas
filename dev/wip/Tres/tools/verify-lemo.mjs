import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const main = path.resolve('../..'), dir = 'resources/lemo-opuscar';
const upstream = JSON.parse(fs.readFileSync(`${dir}/UPSTREAM.json`, 'utf8'));
const verification = { git: 0, pack: 0, mismatches: [], durations: JSON.parse(fs.readFileSync('dev/wip/Tres/evidence/lemo-durations.json', 'utf8')), bytes: {}, largest: [], totalBytes: 0 };
for (const file of upstream.files) {
  const group = file.origin.split(':')[0];
  verification.bytes[group] = (verification.bytes[group] || 0) + file.bytes;
  const local = fs.readFileSync(path.toNamespacedPath(path.resolve(dir, file.path)));
  let original;
  if (group === 'git') original = fs.readFileSync(path.toNamespacedPath(path.join(main, 'dev/shots/Tnew/refs/2-lemo-opuscar', file.path)));
  else if (group === 'pack') {
    const result = spawnSync('tar', ['--force-local', '-xOf', path.join(main, 'dev/shots/Tnew/survey2/packs', file.origin.slice(5)), file.path], { maxBuffer: 128 * 1024 * 1024 });
    if (result.status !== 0) throw new Error(result.stderr.toString());
    original = result.stdout;
  }
  if (original) {
    verification[group]++;
    if (!local.equals(original)) verification.mismatches.push(file.path);
  }
}
verification.totalBytes = upstream.files.reduce((n, f) => n + f.bytes, 0) + fs.statSync(`${dir}/UPSTREAM.json`).size;
verification.manifestBytes = fs.statSync(`${dir}/UPSTREAM.json`).size;
verification.largest = [...upstream.files].sort((a, b) => b.bytes - a.bytes).slice(0, 10);
fs.writeFileSync('dev/wip/Tres/evidence/lemo-verification.json', JSON.stringify(verification, null, 2) + '\n');
console.log(JSON.stringify({ git: verification.git, pack: verification.pack, mismatches: verification.mismatches, bytes: verification.bytes, manifestBytes: verification.manifestBytes, totalBytes: verification.totalBytes, durationOutliers: verification.durations.filter(d => Math.abs(d.delta) > .1) }, null, 2));
if (verification.mismatches.length) process.exitCode = 1;
