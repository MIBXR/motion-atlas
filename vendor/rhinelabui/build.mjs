import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const vendor = fileURLToPath(new URL('.', import.meta.url));
const app = path.resolve(vendor, '../../demos/cases/archive-os/app');
const upstream = 'C:/Users/mibxr/AppData/Local/Temp/mmref/RhineLabUI';
const walk = (dir, rel = '') => fs.readdirSync(path.join(dir, rel), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(dir, path.join(rel, e.name)) : [path.join(rel, e.name)]);
fs.mkdirSync(app, { recursive: true });
if (process.argv.includes('--sync-assets')) fs.cpSync(path.join(upstream, 'public'), app, { recursive: true });
for (const rel of walk(app)) {
  if (rel === 'index.html' || /(?:^|[/\\])[^/\\]+-[\w-]{8,}\.(?:js|css)$/.test(rel)) fs.rmSync(path.join(app, rel));
}
await build({ root: vendor, configFile: path.join(vendor, 'vite.config.ts') });
// MOTION-ATLAS: §3.5 public font URLs resolve from the emitted assets stylesheet.
for (const rel of walk(app).filter(f => /\.css$/.test(f) && f.startsWith('assets'))) {
  const file = path.join(app, rel);
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('/fonts/', '../fonts/'));
}
fs.mkdirSync(path.join(app, 'film'), { recursive: true });
for (const file of ['clock-shim.js', 'sequence.js']) fs.copyFileSync(path.join(vendor, 'film', file), path.join(app, 'film', file));
let bytes = 0;
for (const rel of walk(app).sort()) { const size = fs.statSync(path.join(app, rel)).size; bytes += size; console.log(`${rel.replaceAll('\\','/')}\t${size}`); }
console.log(`archive build: ${walk(app).length} files, ${bytes} bytes`);
