import fs from 'node:fs';
import {spawn} from 'node:child_process';

const [name, ...args] = process.argv.slice(2);
const dir = 'dev/shots/R2';
fs.mkdirSync(dir, {recursive: true});
const file = `${dir}/${name}.log`;
const log = fs.createWriteStream(file, {encoding: 'utf8'});
const metadata = {
  command: ['node', ...args].join(' '),
  executable: process.execPath,
  cwd: process.cwd(),
  started: new Date().toISOString(),
  environment: {
    NODE_OPTIONS: process.env.NODE_OPTIONS ?? null,
    BROWSER_PATH: process.env.BROWSER_PATH ?? null,
    PATH: process.env.PATH,
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
};
fs.writeFileSync(file + '.json', JSON.stringify(metadata, null, 2) + '\n');
const child = spawn(process.execPath, args, {stdio: ['ignore', 'pipe', 'pipe']});
for (const stream of [child.stdout, child.stderr]) stream.on('data', data => {
  log.write(data);
  process.stdout.write(data);
});
const code = await new Promise(resolve => child.on('exit', resolve));
await new Promise(resolve => log.end(resolve));
metadata.ended = new Date().toISOString();
metadata.exitCode = code;
fs.writeFileSync(file + '.json', JSON.stringify(metadata, null, 2) + '\n');
process.exitCode = code ?? 1;
