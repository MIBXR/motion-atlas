#!/usr/bin/env node
// 只读检查：条目校验、kit 副本同步、生成物是否最新、预览图、字号下限。
// 字号下限：
//   - 站点页面与 kit：≥ 12px；
//   - Demo 目录（demos/<类>/<名>/，含 demos/_template/）：已迁移到固定画幅舞台（代码里调用了 MotionKit.stage( / MK.stage(）的
//     按舞台字号检查——横屏 ≥ 24px，选择器含 portrait 的规则 ≥ 36px；未迁移的旧 Demo 仍以 12px 为错误线，
//     低于 24px 的只汇总为警告（--verbose 列出逐行位置），等它们迁移后自动转为严格检查。
// 有错误时退出码为 1，适合放进 CI 或提交前运行。
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, buildAll, kitStatus, walk } from './lib/catalog.mjs';

const verbose = process.argv.includes('--verbose');
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
  /font-size="(\d+(?:\.\d+)?)"/g, // SVG 属性：按用户单位 1:1 粗查，缩放后的实际字号由 smoke.mjs 在运行时复查
];
const STAGE_CALL = /\b(?:MotionKit|MK)\.stage\(/;
const demoDir = (f) => (f.startsWith('demos/') ? f.split('/').slice(0, 3).join('/') : null);
const migrated = new Map();
const isMigrated = (dir) => {
  if (!migrated.has(dir)) {
    migrated.set(dir, walk(dir).some((f) => /\.(js|html)$/.test(f) && !f.endsWith('motion-kit.js') && STAGE_CALL.test(fs.readFileSync(path.join(ROOT, f), 'utf8'))));
  }
  return migrated.get(dir);
};
const legacySmall = new Map(); // 旧 Demo：dir → { n, min, lines }
let stageDirs = 0;
for (const f of sources) {
  const dir = demoDir(f);
  const staged = dir ? isMigrated(dir) : false;
  const lines = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
  let sel = ''; // 当前 CSS 选择器上下文（.css 与 <style> 内），用于识别竖屏规则
  lines.forEach((line, i) => {
    if (!line.includes('check:allow-small-font')) {
      for (const re of RULES) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line))) {
          const px = Number(m[1]);
          if (!(px > 0)) continue;
          const before = line.slice(0, m.index), open = before.lastIndexOf('{');
          const ctx = open > -1 ? before.slice(before.lastIndexOf('}', open) + 1, open) : sel;
          const where = `${f}:${i + 1}`;
          if (!dir) { if (px < 12) errors.push(`${where} 字号 ${px}px 小于 12px`); continue; }
          if (staged) {
            const portrait = /portrait/i.test(ctx);
            const floor = portrait ? 36 : 24;
            if (px < floor) errors.push(`${where} 字号 ${px}px 小于${portrait ? '竖屏' : '舞台'}下限 ${floor}px`);
          } else {
            if (px < 12) errors.push(`${where} 字号 ${px}px 小于 12px`);
            if (px < 24) {
              const s = legacySmall.get(dir) || { n: 0, min: Infinity, lines: [] };
              s.n++; s.min = Math.min(s.min, px); s.lines.push(`${where} ${px}px`);
              legacySmall.set(dir, s);
            }
          }
        }
      }
    }
    const lo = line.lastIndexOf('{');
    if (lo > -1) sel = line.slice(line.lastIndexOf('}', lo) + 1, lo);
  });
}
for (const [dir, ok] of migrated) if (ok) stageDirs++;
for (const [dir, s] of legacySmall) {
  warnings.push(`旧 Demo 未迁移到固定画幅：${dir} 有 ${s.n} 处字号 < 24px（最小 ${s.min}px）${verbose ? '\n    ' + s.lines.join('\n    ') : ''}`);
}

for (const w of warnings) console.warn('警告：' + w);
if (errors.length) {
  console.error(`检查失败（${errors.length}）：\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log(`check ok · ${cases.length} cases · ${patterns.length} patterns · ${sources.length} source files scanned · kit copies ${kitTargets.length} · 固定画幅 Demo ${stageDirs}/${migrated.size}${legacySmall.size ? ` · 旧 Demo 字号警告 ${legacySmall.size} 个目录` : ''}`);
