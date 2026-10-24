#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CONFIG = {
  'lemo-opuscar': {
    dir: 'resources/lemo-opuscar', repo: 'lemomo-ai/lemo-opuscar',
    license: '代码与文档 MIT；样片成片与静帧 CC BY 4.0（署名 LemoLab，附仓库链接，注明改动）；第三方素材见各 demo/CREDITS；game-show、paper-lantern、news-package 的配音不在 CC BY 4.0 范围内，不得复用',
    notice: [], excluded: ['.git/', '.github/', 'styleboard/', 'plugin/'],
  },
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
const lemo = name === 'lemo-opuscar';
const statuses = lemo ? JSON.parse(fs.readFileSync(path.join(root, 'scripts/lemo-status.json'), 'utf8')) : null;
const runtimeFiles = lemo ? JSON.parse(fs.readFileSync(path.join(root, 'scripts/lemo-runtime-files.json'), 'utf8')) : null;
const packs = new Map();
let web, ffmpeg;
function findFfmpeg() {
  const candidates = [process.env.FFMPEG_PATH, 'ffmpeg'].filter(Boolean);
  const local = process.env.LOCALAPPDATA;
  if (process.platform === 'win32' && local) {
    candidates.push(path.join(local, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'));
    const pkgs = path.join(local, 'Microsoft', 'WinGet', 'Packages');
    if (fs.existsSync(pkgs)) for (const d of fs.readdirSync(pkgs).filter(n => /ffmpeg/i.test(n))) {
      for (const sub of fs.readdirSync(path.join(pkgs, d))) candidates.push(path.join(pkgs, d, sub, 'bin', 'ffmpeg.exe'));
    }
  }
  return candidates.find(c => spawnSync(c, ['-version'], { stdio: 'ignore' }).status === 0) || null;
}
function tar(args) {
  const result = spawnSync('tar', ['--force-local', ...args], { maxBuffer: 128 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.error?.message || result.stderr.toString());
  return result.stdout;
}
if (lemo) {
  if (!args.includes('--packs') || !args.includes('--web')) throw new Error('lemo-opuscar 需要 --packs <demo 包目录> --web <web 成片目录>');
  const packDir = path.resolve(args[args.indexOf('--packs') + 1]);
  web = path.resolve(args[args.indexOf('--web') + 1]);
  ffmpeg = findFfmpeg();
  if (!ffmpeg) throw new Error('未找到 ffmpeg');
  config.notice = fs.readFileSync(path.join(source, 'README.md'), 'utf8').split(/\r?\n/).slice(362, 373).filter(line => line.trim());
  config.notice.push('Motion Atlas 的改动：audio/*.ogg 为上游 web Release 成片的音轨，转码为 Ogg Opus 128 kbps；未收录 game-show、paper-lantern、news-package 的音轨（含不可复用的配音）。');
  for (const [slug, item] of Object.entries(statuses)) {
    if (!item.web || !fs.existsSync(path.join(web, item.web))) throw new Error(`缺少 web 成片：${slug}`);
    if (item.status !== 'ready') continue;
    const file = path.join(packDir, `demo-${slug}.tar`);
    const entries = tar(['-tf', file]).toString('utf8').split(/\r?\n/).filter(Boolean);
    for (const entry of entries) {
      if (path.posix.isAbsolute(entry) || path.win32.isAbsolute(entry) || entry.split(/[\\/]/).includes('..')) throw new Error(`拒绝不安全的 tar 条目：${file} / ${entry}`);
    }
    packs.set(slug, { file, entries: new Map(entries.map(entry => [entry.replace(/^\.\//, ''), entry])) });
  }
}
const paths = [];
function walk(dir, prefix = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!prefix && excluded.has(entry.name)) continue;
    const relative = prefix + entry.name;
    if (entry.isDirectory()) {
      if (!prefix && lemo && !['styles', 'core', 'tools', 'docs'].includes(entry.name)) continue;
      walk(path.join(dir, entry.name), relative + '/');
    }
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
  return { path: relative, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), ...(lemo ? { origin: 'git' } : {}) };
});
function addFile(relative, bytes, origin) {
  const to = path.toNamespacedPath(path.join(target, relative));
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, bytes);
  files.push({ path: relative, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), origin });
}
if (lemo) {
  for (const [slug, pack] of packs) {
    for (const relative of runtimeFiles[slug]) {
      if (fs.existsSync(path.toNamespacedPath(path.join(source, relative)))) continue;
      const entry = pack.entries.get(relative);
      if (!entry) throw new Error(`包内缺少依赖：${slug} / ${relative}`);
      addFile(relative, tar(['-xOf', pack.file, entry]), `pack:demo-${slug}.tar`);
    }
  }
  const audioDir = path.join(target, 'audio');
  fs.mkdirSync(audioDir, { recursive: true });
  for (const [slug, item] of Object.entries(statuses)) {
    if (['game-show', 'paper-lantern', 'news-package'].includes(slug)) continue;
    const relative = `audio/${slug}.ogg`, out = path.join(target, relative);
    const result = spawnSync(ffmpeg, ['-v', 'error', '-i', path.join(web, item.web), '-vn', '-map', '0:a:0', '-c:a', 'libopus', '-b:a', '128k', '-ar', '48000', '-ac', '2', out], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`音轨提取失败：${slug}`);
    const bytes = fs.readFileSync(out);
    files.push({ path: relative, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), origin: `film-audio:web/${item.web}` });
  }
  files.sort((a, b) => a.path.localeCompare(b.path));
}
const upstream = {
  name, repo: config.repo, url: `https://github.com/${config.repo}`, commit, fetchedAt,
  license: config.license, notice: config.notice, excluded: config.excluded, files,
};
fs.writeFileSync(path.join(target, 'UPSTREAM.json'), JSON.stringify(upstream, null, 2) + '\n');
console.log(`收录 ${files.length} 个文件，共 ${files.reduce((sum, f) => sum + f.bytes, 0)} 字节`);
if (lemo) for (const origin of ['git', 'pack', 'film-audio']) {
  const group = files.filter(f => f.origin.split(':')[0] === origin);
  console.log(`${origin}: ${group.length} 个文件，${group.reduce((sum, f) => sum + f.bytes, 0)} 字节`);
}
