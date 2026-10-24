import fs from 'node:fs';
import path from 'node:path';

const source = 'resources/lemo-opuscar/core';
const files = fs.readdirSync(source, { recursive: true }).filter(file => fs.statSync(path.join(source, file)).isFile());
const mismatches = files.filter(file => !fs.readFileSync(path.join(source, file)).equals(fs.readFileSync(path.join('dist/core', file))));
const http = [];
for (const file of ['lib.js', 'fonts/fonts.css', 'post/crt.js', 'assets/polyhaven/walnut_diff.jpg', 'assets/polyhaven/tea_set_01/tea_set_01.gltf']) {
  const response = await fetch('http://localhost:4328/core/' + file);
  const matches = Buffer.from(await response.arrayBuffer()).equals(fs.readFileSync(path.join(source, file)));
  http.push({ file, status: response.status, matches });
}
const missingStatus = (await fetch('http://localhost:4328/core/not-a-lemo-file.js')).status;
const result = { files: files.length, mismatches, http, missingStatus };
fs.writeFileSync('dev/wip/Tres/evidence/core-verification.json', JSON.stringify(result, null, 2) + '\n');
if (mismatches.length || http.some(item => item.status !== 200 || !item.matches) || missingStatus !== 404) throw new Error(JSON.stringify(result));
console.log(JSON.stringify(result, null, 2));
