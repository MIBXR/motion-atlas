import fs from 'node:fs';
import { spawn } from 'node:child_process';

const status = JSON.parse(fs.readFileSync('scripts/lemo-status.json', 'utf8'));
const urls = Object.keys(status).filter(slug => status[slug].status === 'ready').flatMap(slug => ['--url', `http://localhost:4328/demos/styles/player/?style=${slug}`]);
for (let run = 1; run <= 2; run++) {
  const args = ['--import', './dev/wip/T4a/tools/direct-browser.mjs', 'scripts/smoke.mjs', '--base', 'http://localhost:4328', '--gpu', '--ready-timeout', '180', ...urls];
  fs.writeFileSync(`dev/wip/Tres/evidence/style-smoke-${run}-command.json`, JSON.stringify([process.execPath, ...args], null, 2) + '\n');
  const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const log = fs.createWriteStream(`dev/wip/Tres/evidence/style-smoke-${run}.log`);
  child.stdout.on('data', data => { process.stdout.write(data); log.write(data); });
  child.stderr.on('data', data => { process.stderr.write(data); log.write(data); });
  const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  await new Promise(resolve => log.end(resolve));
  fs.writeFileSync(`dev/wip/Tres/evidence/style-smoke-${run}-exit.json`, JSON.stringify({ code }) + '\n');
  if (code !== 0) process.exitCode = 1;
  console.log(`style smoke run ${run} exit=${code}`);
}
