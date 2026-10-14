#!/usr/bin/env node
// 只读检查：条目校验、kit 副本同步、生成物是否最新、预览图、字号下限（≥ 12px）。
// 有错误时退出码为 1，适合放进 CI 或提交前运行。
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, buildAll, kitStatus, walk } from './lib/catalog.mjs';

const errors = [], warnings = [];
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
const sources = [...walk('assets'), ...walk('demos'), ...walk('kit'), ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'))]
  .filter((f) => /\.(css|html|js)$/.test(f) && !SKIP.test(f) && !(f.endsWith('motion-kit.js') && f !== 'kit/motion-kit.js'));
const RULES = [
  /font-size\s*:\s*(\d+(?:\.\d+)?)px/g,
  /\bfont\s*:\s*(?:[a-z-]+\s+|\d{3}\s+)*?(\d+(?:\.\d+)?)px/gi,
  /\.font\s*=\s*[`'"](?:[^`'"]*?\s)?(\d+(?:\.\d+)?)px/g,
  /font-size="(\d+(?:\.\d+)?)"/g, // SVG 属性：用户单位按 1:1 粗查，缩放后的实际字号需截图确认
];
for (const f of sources) {
  const lines = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('check:allow-small-font')) return;
    for (const re of RULES) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line))) {
        const px = Number(m[1]);
        if (px > 0 && px < 12) errors.push(`${f}:${i + 1} 字号 ${px}px 小于 12px`);
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
