import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const main = path.resolve('../..');
const status = JSON.parse(fs.readFileSync('scripts/lemo-status.json', 'utf8'));
const durations = [];
for (const [slug, item] of Object.entries(status)) {
  if (!item.web) continue;
  const film = path.join(main, 'dev/shots/Tnew/films-web', item.web);
  const result = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', film], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
  const filmDur = Number(JSON.parse(result.stdout).format.duration);
  const meta = JSON.parse(fs.readFileSync(path.join(main, 'dev/shots/Tnew/refs/2-lemo-opuscar/styles', slug, 'style.json'), 'utf8'));
  durations.push({ slug, film: item.web, styleDur: meta.dur, filmDur, delta: filmDur - meta.dur, audio: !['game-show', 'paper-lantern', 'news-package'].includes(slug) });
}
fs.writeFileSync('dev/wip/Tres/evidence/lemo-durations.json', JSON.stringify(durations, null, 2) + '\n');
console.log(JSON.stringify({ count: durations.length, outliers: durations.filter(d => Math.abs(d.delta) > .1) }, null, 2));
