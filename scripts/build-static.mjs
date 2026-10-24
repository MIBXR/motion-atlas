import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/catalog.mjs';
import './build.mjs';

const output = path.join(ROOT, 'dist');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const directory of ['agent', 'assets', 'data', 'demos', 'docs', 'entries', 'kit', 'previews', 'prompts', 'resources']) {
  fs.cpSync(path.join(ROOT, directory), path.join(output, directory), { recursive: true });
}
for (const file of fs.readdirSync(ROOT).filter((name) => /\.(html|md)$/.test(name))) {
  fs.copyFileSync(path.join(ROOT, file), path.join(output, file));
}
fs.mkdirSync(path.join(output, 'scripts'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'scripts/lemo-status.json'), path.join(output, 'scripts/lemo-status.json'));
const core = path.join(output, 'core');
if (fs.existsSync(core)) throw new Error('dist/core/ already exists');
fs.cpSync(path.join(ROOT, 'resources/lemo-opuscar/core'), core, { recursive: true });
console.log('static site ready · dist/');
