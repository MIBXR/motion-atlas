import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const dirs = ['resources/opus-videos', 'resources/skills/garden-skills', 'resources/skills/agent-anime-skill'];
const counts = dirs.map((dir) => ({ dir, files: JSON.parse(fs.readFileSync(`${dir}/UPSTREAM.json`, 'utf8')).files.length }));
function count(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);
}
const result = { counts, expected: counts.reduce((n, d) => n + d.files, 0) + 3, actual: count('dist/resources') };
assert.equal(result.actual, result.expected);
fs.writeFileSync('dev/wip/Tres/evidence/dist-count.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
