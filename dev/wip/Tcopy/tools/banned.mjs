import fs from 'node:fs';

const words = ['dev/', 'T4a', 'T4b', 'T5r', 'T7', 'T13', 'Codex', 'smoke', '实测', '驱动', '帧窗', '用户提供', '参考来源', '原版', '上游', '转译', '移植', '证据', '推断', '待核验', '策展', '能量强', '展示台', 'showcase', 'industrial-protocol', 'chamfer-panel', 'text-scramble', 'conveyor-flow', 'hold-confirm', 'scanline-wipe'];
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(dir + '/' + e.name) : [dir + '/' + e.name]);
const files = [
  ...walk('entries'), ...walk('prompts'),
  ...fs.readdirSync('assets').filter(f => /\.(js|css)$/.test(f)).map(f => 'assets/' + f),
  ...fs.readdirSync('.').filter(f => f.endsWith('.html')),
  ...fs.readdirSync('docs').filter(f => f.endsWith('.md')).map(f => 'docs/' + f),
  ...fs.readdirSync('data').filter(f => f.endsWith('.js')).map(f => 'data/' + f), 'README.md',
].sort();
const hits = [], exceptions = [];
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let block = false;
  for (const [i, line] of lines.entries()) {
    const isComment = file.startsWith('assets/') && file.endsWith('.js') && (block || /^\s*\/[/\*]/.test(line));
    if (/^\s*\/\*/.test(line) && !line.includes('*/')) block = true;
    if (block && line.includes('*/')) block = false;
    for (const word of words) {
      for (let from = 0, j; (j = line.indexOf(word, from)) !== -1; from = j + word.length) {
        const item = { file, line: i + 1, column: j + 1, word, text: line.slice(Math.max(0, j - 45), j + word.length + 65) };
        const command = file === 'README.md' && word === 'smoke' && /`node scripts\/smoke\.mjs/.test(line) && j >= line.indexOf('`node scripts/smoke.mjs') && j < line.indexOf('`', line.indexOf('`node scripts/smoke.mjs') + 1);
        if (isComment || command) exceptions.push({ ...item, reason: isComment ? 'assets JavaScript注释，不会呈现给访客' : 'README命令行示例中的可执行脚本路径' });
        else hits.push(item);
      }
    }
  }
}
const result = { scanned: files.length, hitCount: hits.length, exceptionCount: exceptions.length, hits, exceptions };
fs.writeFileSync('dev/wip/Tcopy/banned-results.json', JSON.stringify(result, null, 2) + '\n');
for (const h of hits) console.log(`HIT ${h.file}:${h.line}:${h.column} ${h.word} ${h.text}`);
for (const h of exceptions) console.log(`EXCEPTION ${h.file}:${h.line}:${h.column} ${h.word} — ${h.reason}`);
console.log(`banned ${hits.length} hits · ${exceptions.length} exceptions · ${files.length} files scanned`);
if (hits.length) process.exitCode = 1;
