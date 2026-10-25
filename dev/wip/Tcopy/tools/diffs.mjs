import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = p => fs.readFileSync(p, 'utf8');
const old = p => execFileSync('git', ['show', 'HEAD:' + p], { encoding: 'utf8', maxBuffer: 30_000_000 });
const cell = v => String(v ?? '（删除）').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('\n', '<br>');
const flatten = (v, key = '', out = {}) => {
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) flatten(x, key ? Array.isArray(v) ? `${key}[${k}]` : `${key}.${k}` : k, out);
  else out[key] = v;
  return out;
};
const inventory = JSON.parse(read('dev/wip/Tcopy/copy-inventory.json'));
const content = ['# 条目文案对照', '', '基准：a452ea4。字段顺序沿用条目；删除的资料字段一并列出。Demo舞台文字按范围要求保留。', ''];
let count = 0;
for (const kind of ['cases', 'patterns']) for (const name of fs.readdirSync(`entries/${kind}`)) {
  const file = `entries/${kind}/${name}`, before = flatten(JSON.parse(old(file))), after = flatten(JSON.parse(read(file)));
  const rows = [];
  for (const field of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (before[field] === after[field]) continue;
    const ids = inventory.filter(r => r.file === file && r.block.split(' / ')[2] === field).map(r => r.id);
    rows.push(`| ${cell(field)}${ids.length ? ' · ' + ids.join(', ') : ''} | ${cell(before[field])} | ${cell(after[field])} |`);
  }
  if (rows.length) content.push(`## ${file}`, '', '| 字段 / 清单id | 原文 | 新文 |', '| --- | --- | --- |', ...rows, '');
  count += rows.length;
}
content.push('## 节奏实验室', '', '| 位置 / 清单id | 原文 | 新文 |', '| --- | --- | --- |');
for (const file of ['lab.html', 'assets/lab.js']) {
  const a = old(file).split('\n'), b = read(file).split('\n');
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) {
    const ids = [...new Set(inventory.filter(r => r.page === 'lab' && r.file === file && r.line === i + 1 && r.flags.some(f => ['wordy', 'internal', 'provenance'].includes(f))).map(r => r.id))];
    content.push(`| ${file}:${i + 1}${ids.length ? ' · ' + ids.join(', ') : ''} | ${cell(a[i])} | ${cell(b[i])} |`);
  }
}
fs.writeFileSync('dev/wip/Tcopy/content-diff.md', content.join('\n').trimEnd() + '\n');

const docs = ['# 文档段落对照', '', '基准：a452ea4。每行对应一个连续删改区段，保持原段落正文。', ''];
let paragraphs = 0;
for (const file of ['docs/guide.md', 'docs/rhythm.md', 'docs/prompting.md', 'docs/methodology.md', 'docs/pipeline.md', 'README.md', 'AGENT.md', 'CONTRIBUTING.md']) {
  const a = old(file).trim().split(/\r?\n\s*\r?\n/), b = read(file).trim().split(/\r?\n\s*\r?\n/);
  const dp = Array.from({ length:a.length+1 }, () => Array(b.length+1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? 1 + dp[i+1][j+1] : Math.max(dp[i+1][j], dp[i][j+1]);
  let i = 0, j = 0, removed = [], added = [];
  const flush = () => {
    if (removed.length || added.length) { docs.push(`| ${cell(removed.join('\n\n') || '（新增）')} | ${cell(added.join('\n\n') || '（删除）')} |`); paragraphs++; removed = []; added = []; }
  };
  docs.push(`## ${file}`, '', '| 原文 | 新文 |', '| --- | --- |');
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { flush(); i++; j++; }
    else if (i < a.length && (j >= b.length || dp[i+1][j] >= dp[i][j+1])) removed.push(a[i++]);
    else added.push(b[j++]);
  }
  flush(); docs.push('');
}
fs.writeFileSync('dev/wip/Tcopy/docs-diff.md', docs.join('\n').trimEnd() + '\n');
console.log(`diffs written · ${count} entry field changes · ${paragraphs} document change blocks`);
