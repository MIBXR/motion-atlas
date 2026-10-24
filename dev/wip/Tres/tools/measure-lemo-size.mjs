import fs from 'node:fs';
import path from 'node:path';

const root = 'resources/lemo-opuscar';
const manifest = JSON.parse(fs.readFileSync(`${root}/UPSTREAM.json`, 'utf8'));
const groups = {};
for (const file of manifest.files) {
  const origin = file.origin.split(':')[0];
  const group = groups[origin] ||= { files: 0, bytes: 0 };
  group.files++;
  group.bytes += fs.statSync(path.toNamespacedPath(path.resolve(root, file.path))).size;
}
let files = 0, bytes = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(path.toNamespacedPath(path.resolve(dir)), { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else { files++; bytes += fs.statSync(path.toNamespacedPath(path.resolve(file))).size; }
  }
}
walk(root);
const result = { groups, files, bytes, manifestBytes: fs.statSync(`${root}/UPSTREAM.json`).size, largest: [...manifest.files].sort((a, b) => b.bytes - a.bytes).slice(0, 10) };
fs.writeFileSync('dev/wip/Tres/evidence/lemo-size-final.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
