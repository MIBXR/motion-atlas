#!/usr/bin/env node
// 构建：同步 motion-kit 副本 → 生成站点数据、Prompt 文档、Agent 资料包与 README 计数。
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, buildAll, walk } from './lib/catalog.mjs';

// 先同步 kit 副本，再生成资料包的文件清单。
const first = buildAll();
const kitSrc = fs.readFileSync(path.join(ROOT, 'kit/motion-kit.js'));
for (const dir of first.kitTargets) {
  const dest = path.join(ROOT, dir, 'motion-kit.js');
  if (!fs.existsSync(dest) || !fs.readFileSync(dest).equals(kitSrc)) {
    fs.writeFileSync(dest, kitSrc);
    console.log('sync kit →', dir);
  }
}

const { files, cases, patterns, materials } = buildAll();
let changed = 0;
for (const [rel, content] of Object.entries(files)) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (fs.existsSync(abs) && fs.readFileSync(abs, 'utf8') === content) continue;
  fs.writeFileSync(abs, content);
  changed++;
}
// 清理已删除条目的旧生成物
for (const dir of ['agent', 'prompts', 'data']) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const rel of walk(dir)) {
    if (!(rel in files)) { fs.rmSync(path.join(ROOT, rel)); console.log('remove', rel); }
  }
}
console.log(`build ok · ${cases.length} cases · ${patterns.length} patterns · ${materials.length} materials · ${changed} files updated`);
