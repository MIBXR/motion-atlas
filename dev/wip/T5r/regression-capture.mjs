import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const jobs = [
  { name: 'full-regression', args: ['--import', './dev/wip/T4a/tools/direct-browser.mjs', 'scripts/smoke.mjs', '--strict-fonts', '--base', 'http://localhost:4323'] },
  { name: 'capture', args: ['scripts/capture.mjs', '--only', 'archive-os', '--base', 'http://localhost:4323'] },
];
const results = [];
for (const job of jobs.filter(job => !process.argv.includes('--skip-capture') || job.name !== 'capture')) {
  const file = new URL(`../../../dev/shots/T5r/${job.name}.log`, import.meta.url);
  const log = fs.createWriteStream(file, { encoding: 'utf8' });
  const started = performance.now();
  const child = spawn(process.execPath, job.args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', chunk => { log.write(chunk); process.stdout.write(chunk); });
  child.stderr.on('data', chunk => { log.write(chunk); process.stderr.write(chunk); });
  const code = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', resolve); });
  await new Promise(resolve => log.end(resolve));
  new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(file));
  results.push({ name: job.name, code, milliseconds: performance.now() - started, log: `dev/shots/T5r/${job.name}.log` });
  fs.writeFileSync(new URL('../../../dev/shots/T5r/regression-capture.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
  if (code !== 0) process.exitCode = 1;
}
console.log(JSON.stringify(results, null, 2));
