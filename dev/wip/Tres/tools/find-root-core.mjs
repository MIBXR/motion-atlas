import fs from 'node:fs';

const files = JSON.parse(fs.readFileSync('scripts/lemo-runtime-files.json', 'utf8'));
const references = [];
for (const file of new Set(Object.values(files).flat())) {
  if (!/\.(js|mjs|html|css)$/.test(file)) continue;
  const text = fs.readFileSync('resources/lemo-opuscar/' + file, 'utf8');
  for (const match of text.matchAll(/(['"`])(\/(?:core|styles|fonts|assets|data)\/[^'"`\s]+)\1/g)) references.push({ file, url: match[2] });
}
fs.writeFileSync('dev/wip/Tres/evidence/root-core-references.json', JSON.stringify(references, null, 2) + '\n');
console.log(JSON.stringify({ urls: [...new Set(references.map(item => item.url))], files: references.length, styles: [...new Set(references.map(item => item.file.split('/')[1]))] }, null, 2));
