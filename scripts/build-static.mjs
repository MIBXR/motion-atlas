import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/catalog.mjs';
import './build.mjs';

const output = path.join(ROOT, 'dist');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const directory of ['agent', 'assets', 'data', 'demos', 'docs', 'entries', 'kit', 'previews', 'prompts']) {
  fs.cpSync(path.join(ROOT, directory), path.join(output, directory), { recursive: true });
}
for (const file of fs.readdirSync(ROOT).filter((name) => /\.(html|md)$/.test(name))) {
  fs.copyFileSync(path.join(ROOT, file), path.join(output, file));
}
console.log('static site ready · dist/');
