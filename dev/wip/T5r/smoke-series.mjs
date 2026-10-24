import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const runs = [];
for (let index = 1; index <= 3; index++) {
  const path = new URL(`../../../dev/shots/T5r/smoke-${index}.log`, import.meta.url);
  const log = fs.createWriteStream(path, { encoding: 'utf8' });
  const started = performance.now();
  const child = spawn(process.execPath, ['scripts/smoke.mjs', '--only', 'archive-os', '--strict-fonts', '--base', 'http://localhost:4323'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', chunk => { log.write(chunk); process.stdout.write(chunk); });
  child.stderr.on('data', chunk => { log.write(chunk); process.stderr.write(chunk); });
  const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
  await new Promise(resolve => log.end(resolve));
  new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(path));
  runs.push({ run: index, code, milliseconds: performance.now() - started, log: `dev/shots/T5r/smoke-${index}.log` });
  fs.writeFileSync(new URL('../../../dev/shots/T5r/smoke-series.json', import.meta.url), JSON.stringify(runs, null, 2) + '\n');
  if (code !== 0) throw new Error(`Smoke ${index} failed with status ${code}; see smoke-${index}.log.`);
}
console.log(JSON.stringify(runs, null, 2));
