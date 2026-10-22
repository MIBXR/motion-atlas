import fs from 'node:fs';
import {spawn} from 'node:child_process';

const [log, ...args] = process.argv.slice(2);
const started = new Date().toISOString();
const nodeOptions = process.env.NODE_OPTIONS || '';
const output = fs.createWriteStream(log);
const child = spawn(process.execPath, args, {stdio:['ignore','pipe','pipe']});
for (const pipe of [child.stdout, child.stderr]) pipe.on('data', chunk => {
  output.write(chunk);
  process.stdout.write(chunk);
});
child.on('error', error => { throw error; });
child.on('close', code => {
  output.end(() => {
    const ended = new Date().toISOString();
    fs.writeFileSync(`${log}.json`, JSON.stringify({command:[process.execPath,...args],args,NODE_OPTIONS:nodeOptions,started,ended,exitCode:code},null,2)+'\n');
    fs.appendFileSync('dev/wip/T4b/progress.md',`- ${ended}: ${args.join(' ')} exited ${code}; UTF-8 log ${log}.\n`);
    process.exitCode = code;
  });
});
