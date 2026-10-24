import fs from 'node:fs';
import { spawn } from 'node:child_process';

const output = 'dev/shots/T5r';
fs.mkdirSync(output, { recursive: true });
const results = [];
for (const [name, args] of [
  ['check', ['scripts/check.mjs']],
  ['regression', ['--import', './dev/wip/T4a/tools/direct-browser.mjs', 'scripts/smoke.mjs', '--strict-fonts', '--base', 'http://localhost:4323']],
  ['build-site', ['scripts/build-static.mjs']],
]) {
  const log = fs.createWriteStream(`${output}/${name}.log`, { encoding: 'utf8' });
  const started = performance.now();
  const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', data => { log.write(data); process.stdout.write(data); });
  child.stderr.on('data', data => { log.write(data); process.stderr.write(data); });
  const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  await new Promise(resolve => log.end(resolve));
  results.push({ name, args, code, elapsedMs: performance.now() - started });
  fs.writeFileSync(`${output}/checkpoint-checks.json`, JSON.stringify(results, null, 2) + '\n');
  console.log(`${name}: exit ${code}`);
}
