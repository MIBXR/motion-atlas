#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const CONFIG = {
  'opus-videos': {
    dir: 'resources/opus-videos', repo: 'yihui-dev/awesome-opus5-5-videos',
    license: 'MIT（列表）；视频与提示词归各作者',
    notice: ['Every video and prompt belongs to its creator, linked from each entry. Previews are short clips hosted for this list. If you are a creator and want an entry changed or removed, open an issue.'],
    excluded: ['.git/'],
  },
  'garden-skills': {
    dir: 'resources/skills/garden-skills', repo: 'ConardLi/garden-skills', license: 'MIT', notice: [],
    excluded: ['.git/', '.github/', 'website/（上游宣传站点，18 MB）'],
  },
  'agent-anime-skill': {
    dir: 'resources/skills/agent-anime-skill', repo: 'waterpro/agent-anime-skill',
    license: '未声明许可；上游 README：仅供个人娱乐，请勿进行商业用途。',
    notice: ['仅供个人娱乐，请勿进行商业用途。', '若有人使用此skill进行侵权行为，与本人无关，自行承担法律风险。'],
    excluded: ['.git/'],
  },
};
const [name, sourceArg, ...args] = process.argv.slice(2);
const config = CONFIG[name];
const commit = args[args.indexOf('--commit') + 1];
const today = new Date();
const fetchedAt = args.includes('--fetched') ? args[args.indexOf('--fetched') + 1] :
  [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
if (!config || !sourceArg || !args.includes('--commit') || !/^[a-f0-9]{40}$/.test(commit || '')) {
  throw new Error('用法：node scripts/vendor-resources.mjs <name> <上游克隆目录> --commit <sha> [--fetched YYYY-MM-DD]');
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(sourceArg), target = path.resolve(root, config.dir);
if (!target.startsWith(path.join(root, 'resources') + path.sep)) throw new Error('目标必须位于 resources/');
const excluded = new Set(config.excluded.map((p) => p.split('/')[0]));
const paths = [];
function walk(dir, prefix = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!prefix && excluded.has(entry.name)) continue;
    const relative = prefix + entry.name;
    if (entry.isDirectory()) walk(path.join(dir, entry.name), relative + '/');
    else paths.push(relative);
  }
}
walk(source);
fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });
const files = paths.sort().map((relative) => {
  const from = path.toNamespacedPath(path.join(source, relative));
  const to = path.toNamespacedPath(path.join(target, relative));
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to);
  const bytes = fs.readFileSync(to);
  return { path: relative, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
});
const upstream = {
  name, repo: config.repo, url: `https://github.com/${config.repo}`, commit, fetchedAt,
  license: config.license, notice: config.notice, excluded: config.excluded, files,
};
fs.writeFileSync(path.join(target, 'UPSTREAM.json'), JSON.stringify(upstream, null, 2) + '\n');
console.log(`收录 ${files.length} 个文件，共 ${files.reduce((sum, f) => sum + f.bytes, 0)} 字节`);
