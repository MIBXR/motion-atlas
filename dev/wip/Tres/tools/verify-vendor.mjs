import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const sources = [
  ['resources/opus-videos', '../../dev/shots/Tnew/refs/1-awesome-opus5-5-videos'],
  ['resources/skills/garden-skills', '../../dev/shots/Tnew/refs/3-garden-skills'],
  ['resources/skills/agent-anime-skill', '../../dev/shots/Tnew/refs/4-agent-anime-skill'],
];
function walk(dir, excluded = new Set(), prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (!prefix && excluded.has(e.name)) return [];
    return e.isDirectory() ? walk(path.join(dir, e.name), excluded, prefix + e.name + '/') : [prefix + e.name];
  }).sort();
}
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.toNamespacedPath(path.resolve(file)))).digest('hex');
const results = sources.map(([dir, source]) => {
  const manifest = JSON.parse(fs.readFileSync(`${dir}/UPSTREAM.json`, 'utf8'));
  const paths = walk(source, new Set(manifest.excluded.map((p) => p.split('/')[0])));
  const copied = walk(dir, new Set(['UPSTREAM.json']));
  const missing = paths.filter((p) => !copied.includes(p)), extra = copied.filter((p) => !paths.includes(p));
  const different = paths.filter((p) => copied.includes(p) && sha(path.join(source, p)) !== sha(path.join(dir, p)));
  return { name: manifest.name, equal: paths.length - missing.length - different.length, different: different.length, missing, extra, differentPaths: different };
});
const result = { results, equal: results.reduce((n, r) => n + r.equal, 0), different: results.reduce((n, r) => n + r.different + r.missing.length + r.extra.length, 0) };
fs.writeFileSync('dev/wip/Tres/evidence/vendor-comparison.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
assert.equal(result.different, 0);
