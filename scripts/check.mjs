#!/usr/bin/env node
// 只读检查：条目、kit 副本、生成物、预览与网站界面 12px 下限。
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, buildAll, kitStatus, walk, RESOURCE_DIRS, sha } from './lib/catalog.mjs';

const errors = [], warnings = [];
for (const [name, dir] of Object.entries(RESOURCE_DIRS)) {
  const file = `${dir}/UPSTREAM.json`;
  try {
    const upstream = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
    for (const key of ['name', 'repo', 'url', 'commit', 'fetchedAt', 'license', 'notice', 'excluded', 'files']) {
      if (!Object.hasOwn(upstream, key)) errors.push(`R1 ${file} 缺少 ${key}`);
    }
    if (upstream.name !== name) errors.push(`R1 ${file} name 应为 ${name}`);
    if (!Array.isArray(upstream.files)) errors.push(`R1 ${file} files 应为数组`);
    else {
      const listed = new Set(upstream.files.map((f) => `${dir}/${f.path}`));
      for (const f of upstream.files) {
        const rel = `${dir}/${f.path}`, abs = path.join(ROOT, rel);
        if (!fs.existsSync(abs)) { errors.push(`R2 清单文件不存在 ${rel}`); continue; }
        const bytes = fs.readFileSync(abs);
        if (bytes.length !== f.bytes) errors.push(`R2 bytes 不一致 ${rel}`);
        if (sha(bytes) !== f.sha256) errors.push(`R2 sha256 不一致 ${rel}`);
      }
      for (const rel of walk(dir)) if (rel !== file && !listed.has(rel)) errors.push(`R2 清单之外的文件 ${rel}`);
    }
  } catch (e) { errors.push(`R1 ${file} 读取失败：${e.message}`); }
}
const videoFile = path.join(ROOT, 'resources/opus-videos/data/videos.json');
const lemoDir = path.join(ROOT, 'resources/lemo-opuscar');
if (fs.existsSync(lemoDir)) {
  const status = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/lemo-status.json'), 'utf8'));
  const slugs = fs.readdirSync(path.join(lemoDir, 'styles'), { withFileTypes: true }).filter(entry => entry.isDirectory() && !entry.name.startsWith('_')).map(entry => entry.name).sort();
  if (JSON.stringify(Object.keys(status).sort()) !== JSON.stringify(slugs)) errors.push('R6 状态表与风格目录集合不一致');
  for (const [state, count] of [['ready', 24], ['needs-assets', 17], ['needs-build', 18]]) {
    if (Object.values(status).filter(s => s.status === state).length !== count) errors.push(`R6 ${state} 应为 ${count}`);
  }
  for (const slug of slugs) {
    const expected = !['game-show', 'paper-lantern', 'news-package'].includes(slug);
    if (fs.existsSync(path.join(lemoDir, 'audio', `${slug}.ogg`)) !== expected) errors.push(`R7 ${slug} 音轨${expected ? '缺失' : '不应收录'}`);
  }
  const runtimeFiles = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/lemo-runtime-files.json'), 'utf8'));
  const ready = Object.keys(status).filter(slug => status[slug].status === 'ready').sort();
  if (JSON.stringify(Object.keys(runtimeFiles).sort()) !== JSON.stringify(ready)) errors.push('R8 依赖清单与 ready 集合不一致');
  for (const slug of ready) for (const file of runtimeFiles[slug] || []) {
    if (!fs.existsSync(path.join(lemoDir, file))) errors.push(`R8 ${slug} 缺少同源依赖 ${file}`);
  }
}
if (fs.existsSync(videoFile)) {
  const slugs = new Set(JSON.parse(fs.readFileSync(videoFile, 'utf8')).map((v) => v.slug));
  const prompts = new Set(walk('resources/opus-videos/prompts').filter((p) => p.endsWith('.md')).map((p) => p.slice('resources/opus-videos/prompts/'.length, -3)));
  for (const slug of slugs) if (!prompts.has(slug)) errors.push(`R3 缺少 prompts/${slug}.md`);
  for (const slug of prompts) if (!slugs.has(slug)) errors.push(`R3 prompts/${slug}.md 没有对应的视频 slug`);
}
if (errors.length) {
  console.error(`检查失败（${errors.length}）：\n- ` + errors.join('\n- '));
  process.exit(1);
}
const { files, kitTargets, errors: entryErrors, cases, patterns } = buildAll();
errors.push(...entryErrors);

for (const k of kitStatus(kitTargets)) if (!k.ok) errors.push(`${k.dir}/motion-kit.js 与 kit/motion-kit.js 不一致（运行 node scripts/build.mjs 同步）`);

for (const [rel, content] of Object.entries(files)) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) errors.push(`缺少生成物 ${rel}（运行 node scripts/build.mjs）`);
  else if (fs.readFileSync(abs, 'utf8') !== content) errors.push(`生成物已过期 ${rel}（运行 node scripts/build.mjs）`);
}

for (const e of cases) if (!e.preview) errors.push(`案例 ${e.id} 缺少预览图（运行 node scripts/capture.mjs --only ${e.id}）`);
for (const e of patterns) if (!e.preview) warnings.push(`巧思 ${e.id} 缺少预览图`);

// 字号下限：CSS 的 font-size / font 简写、SVG 的 font-size 属性，以及 Canvas 的 ctx.font
const SKIP = /(^|\/)(data|agent|prompts|previews|renders|frames|node_modules)\//;
const sources = [...walk('assets'), ...walk('kit'), ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'))]
  .filter((f) => /\.(css|html|js)$/.test(f) && !SKIP.test(f) && !(f.endsWith('motion-kit.js') && f !== 'kit/motion-kit.js'));
const RULES = [
  /font-size\s*:\s*(\d+(?:\.\d+)?)px/g,
  /\bfont\s*:\s*(?:[a-z-]+\s+|\d{3}\s+)*?(\d+(?:\.\d+)?)px/gi,
  /\.font\s*=\s*[`'"](?:[^`'"]*?\s)?(\d+(?:\.\d+)?)px/g,
  /font-size="(\d+(?:\.\d+)?)"/g, // SVG 属性：按用户单位 1:1 粗查，缩放后的实际字号由 smoke.mjs 在运行时复查
];
for (const f of sources) {
  const lines = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (!line.includes('check:allow-small-font')) {
      for (const re of RULES) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line))) {
          const px = Number(m[1]);
          if (!(px > 0)) continue;
          const where = `${f}:${i + 1}`;
          if (px < 12) errors.push(`${where} 字号 ${px}px 小于 12px`);
        }
      }
    }
  });
}
for (const w of warnings) console.warn('警告：' + w);
if (errors.length) {
  console.error(`检查失败（${errors.length}）：\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log(`check ok · ${cases.length} cases · ${patterns.length} patterns · ${sources.length} source files scanned · kit copies ${kitTargets.length}`);
