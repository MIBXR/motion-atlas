#!/usr/bin/env node
// 构建：同步 motion-kit 副本 → 生成站点数据、Prompt 文档、Agent 资料包与 README 计数。
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, PROJECT_DOCS, buildAll, walk, documentTitle, compareDocuments } from './lib/catalog.mjs';

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
const docs = JSON.parse(files['data/docs.js'].match(/window\.MA_DOCS = (.+);/)[1]);
const snapshotDocs = new Set(materials.flatMap(e => e.snapshotFiles || []));
const entryDocs = [...new Set([...cases, ...patterns, ...materials].flatMap(e => [e.fidelity, e.licenses]).filter(p => p && !snapshotDocs.has(p)))].map(p => {
  const content = fs.readFileSync(path.join(ROOT, p), 'utf8');
  return { path: p, title: documentTitle(p, content), group: '条目文档', hidden: true, content };
});
const projectDocs = PROJECT_DOCS.map(p => {
  const content = files[p] ?? fs.readFileSync(path.join(ROOT, p), 'utf8');
  return { path: p, title: documentTitle(p, content), group: '项目说明', content };
});
docs.push(...entryDocs, ...projectDocs);
const docPaths = new Set(docs.map(d => d.path));
const localTargets = new Set();
for (const d of docs) {
  const markdown = d.content.replace(/```[^\n]*\n[\s\S]*?```/g, '');
  for (const [, href] of markdown.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const url = new URL(href, `https://atlas.local/${d.path}`);
    const p = decodeURIComponent(url.pathname.slice(1));
    if (url.origin !== 'https://atlas.local' || !fs.existsSync(path.join(ROOT, p))) continue;
    localTargets.add(p);
    if (!p.endsWith('.md') || docPaths.has(p)) continue;
    const content = files[p] ?? fs.readFileSync(path.join(ROOT, p), 'utf8');
    docs.push({ path: p, title: documentTitle(p, content), group: '条目文档', hidden: true, content });
    docPaths.add(p);
  }
}
docs.sort(compareDocuments);
const documentEntries = Object.entries({ cases, patterns, materials }).flatMap(([kind, list]) => list.map(e => ({
  id: e.id, kind, root: e.snapshotPath || path.posix.dirname(e.demo) + '/', upstream: e.upstream, sources: e.sources, attribution: e.attribution,
  promptSource: e.prompt && docs.find(d => d.path.startsWith('demos/materials/') && d.content.trim() === e.prompt.trim())?.path,
})));
files['data/docs.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA_DOCS = ${JSON.stringify(docs)};\nwindow.MA_DOC_LINKS = ${JSON.stringify({ files: [...localTargets], entries: documentEntries })};\n`;
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
