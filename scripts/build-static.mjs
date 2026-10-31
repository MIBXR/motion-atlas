import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadEntries } from './lib/catalog.mjs';
import { assetSources, rewriteCSS, rewriteHTML } from './lib/site-assets.mjs';
import './build.mjs';

const args = process.argv.slice(2);
if (args.length > 1 || args.some(arg => arg !== '--site')) throw new Error('Usage: node scripts/build-static.mjs [--site]');
const site = args.includes('--site');
const directories = ['agent', 'site', 'data', 'demos', 'docs', 'entries', 'kit', 'scripts/templates', 'previews', 'prompts'];
const snapshots = loadEntries().materials.filter(e => e.snapshotPath).map(e => e.snapshotPath);
const sources = site ? assetSources(ROOT, directories) : { assets: {} };
const dist = path.join(ROOT, 'dist');
const output = site ? path.join(dist, 'client') : dist;
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const directory of directories) {
  fs.cpSync(path.join(ROOT, directory), path.join(output, directory), { recursive: true, filter: file => !sources.assets[path.relative(ROOT, file).split(path.sep).join('/')] });
}
for (const file of fs.readdirSync(ROOT).filter((name) => /\.(html|md)$/.test(name) || name === 'asset-cache-worker.js')) {
  fs.copyFileSync(path.join(ROOT, file), path.join(output, file));
}
if (site) {
  fs.writeFileSync(path.join(output, 'data/asset-sources.js'), `globalThis.MotionAtlasAssetSources = ${JSON.stringify(sources)};\n`);
  const media = Object.fromEntries(Object.entries(sources.assets).map(([filename, asset]) => ['/' + filename, asset.url]));
  const server = path.join(dist, 'server');
  fs.mkdirSync(server, {recursive:true});
  fs.writeFileSync(path.join(server, 'index.js'), `const media = ${JSON.stringify(media)};\nexport default {\n  fetch(request, env) {\n    const target = media[decodeURIComponent(new URL(request.url).pathname)];\n    if (target) return new Response(null, {status:302, headers:{Location:target, 'Cache-Control':'no-store'}});\n    return env.ASSETS.fetch(request);\n  }\n};\n`);
  fs.writeFileSync(path.join(server, 'wrangler.json'), JSON.stringify({main:'index.js', compatibility_date:'2026-10-30', assets:{directory:'../client', binding:'ASSETS', run_worker_first:true, not_found_handling:'none'}}, null, 2) + '\n');
}
let bytes = 0, count = 0;
function finalize(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { finalize(file); continue; }
    const filename = path.relative(output, file).split(path.sep).join('/');
    if (site && !snapshots.some(prefix => filename.startsWith(prefix)) && /\.(?:html|css)$/.test(filename)) {
      const text = fs.readFileSync(file, 'utf8');
      fs.writeFileSync(file, filename.endsWith('.html') ? rewriteHTML(text, filename, sources) : rewriteCSS(text, filename, sources));
    }
    count++;
    bytes += fs.statSync(file).size;
  }
}
finalize(output);
const omittedBytes = Object.values(sources.assets).reduce((sum, asset) => sum + asset.bytes, 0);
console.log(`static site ready · dist/ · ${site ? 'site' : 'local'} · ${count} files · ${bytes} bytes (${(bytes / 1024 / 1024).toFixed(2)} MiB)`);
if (site) console.log(`GitHub media · ${Object.keys(sources.assets).length} files · ${omittedBytes} bytes · commit ${sources.commit}`);
