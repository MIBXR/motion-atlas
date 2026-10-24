import fs from 'node:fs';
import path from 'node:path';

const main = path.resolve('../..'), evidence = 'dev/wip/Tres/evidence';
const runtime = JSON.parse(fs.readFileSync(path.join(main, 'dev/shots/Tnew/survey2/lemo-runtime.json'), 'utf8'));
const releases = Object.fromEntries(['films', 'web'].map(tag => [tag, JSON.parse(fs.readFileSync(`${evidence}/lemo-release-${tag}.json`, 'utf8')).assets]));
const states = { '就绪': 'ready', '仍缺素材': 'needs-assets', '仍需构建': 'needs-build' };
const status = {}, files = {};
for (const item of runtime.filter(x => !x.slug.startsWith('_')).sort((a, b) => a.slug.localeCompare(b.slug))) {
  const slug = item.slug;
  status[slug] = {
    status: slug === 'city-symphony' ? 'needs-build' : states[item.category],
    film: releases.films.find(a => a.name === `${slug}.mp4`)?.name ?? null,
    web: releases.web.find(a => a.name === `${slug}.mp4`)?.name ?? null,
  };
  if (status[slug].status === 'ready') {
    files[slug] = [...new Set(item.requests.filter(r => r.sameOrigin && r.status >= 200 && r.status < 300 && r.filePath).map(r => r.filePath))].sort();
    for (const file of files[slug]) if (!file.startsWith(`styles/${slug}/`) && !file.startsWith('core/')) throw new Error(`Unexpected dependency ${slug}: ${file}`);
  }
}
const counts = Object.fromEntries(Object.values(states).map(s => [s, Object.values(status).filter(x => x.status === s).length]));
if (Object.keys(status).length !== 59 || counts.ready !== 24 || counts['needs-assets'] !== 17 || counts['needs-build'] !== 18) throw new Error(JSON.stringify(counts));
fs.writeFileSync('scripts/lemo-status.json', JSON.stringify(status, null, 2) + '\n');
fs.writeFileSync('scripts/lemo-runtime-files.json', JSON.stringify(files, null, 2) + '\n');
const dest = path.join(main, 'dev/shots/Tnew/films-web').replaceAll('\\', '/');
const quote = s => "'" + s.replaceAll("'", "'\\''") + "'";
const lines = ['#!/usr/bin/env bash', 'set -euo pipefail', `mkdir -p ${quote(dest)}`];
for (const [slug, item] of Object.entries(status)) {
  if (!item.web) continue;
  const bytes = releases.web.find(a => a.name === item.web).size;
  lines.push(`if [[ ! -f ${quote(dest + '/' + item.web)} ]] || [[ $(stat -c %s ${quote(dest + '/' + item.web)} 2>/dev/null || true) != ${bytes} ]]; then`,
    `  gh release download web -R lemomo-ai/lemo-opuscar --pattern ${quote(item.web)} --dir ${quote(dest)} --clobber`,
    'fi', `printf '%s\\n' ${quote(slug + ' ' + bytes)}`);
}
fs.writeFileSync('dev/wip/Tres/tools/download-web.sh', lines.join('\n') + '\n');
console.log({ counts, missingReleaseAssets: Object.entries(status).filter(([, s]) => !s.web || !s.film), runtimeFiles: Object.values(files).reduce((n, f) => n + f.length, 0), webBytes: Object.values(status).reduce((n, s) => n + (releases.web.find(a => a.name === s.web)?.size ?? 0), 0) });
