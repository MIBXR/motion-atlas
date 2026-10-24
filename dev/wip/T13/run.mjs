import fs from 'node:fs';
import { spawn } from 'node:child_process';

const [name, command, ...args] = process.argv.slice(2);
fs.mkdirSync('dev/shots/T13', { recursive: true });
const log = fs.createWriteStream(`dev/shots/T13/${name}.log`, { encoding: 'utf8' });
const started = Date.now();
const child = spawn(command, args, { windowsHide: true });
for (const stream of [child.stdout, child.stderr]) stream.on('data', (data) => { log.write(data); process.stdout.write(data); });
child.on('error', (error) => { log.end(String(error)); process.exitCode = 1; });
child.on('close', (code) => {
  const result = { command: [command, ...args], exitCode: code, seconds: (Date.now() - started) / 1000 };
  fs.writeFileSync(`dev/shots/T13/${name}.json`, JSON.stringify(result, null, 2) + '\n');
  log.end();
  process.exitCode = code ?? 1;
});
