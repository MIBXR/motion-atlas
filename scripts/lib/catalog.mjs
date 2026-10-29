// 内容源 → 生成物：data/catalog.js、data/docs.js、prompts/、agent/、README 计数。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SCHEMA_VERSION = 1;

export const TAXONOMY = {
  carriers: { video: '影像视频', console: '交互操作台' },
  types: {
    composition: '画面构成', 'type-motion': '文字动效', transition: '转场', camera: '镜头与空间',
    feedback: '交互反馈', rhythm: '节奏与时序', hud: '信息层 HUD', texture: '质感与后期', sound: '声音',
  },
  roles: { foundation: '骨架：决定主视觉与信息层级', support: '支撑：承担一个区域的交互或信息', accent: '点睛：短时、局部的强调' },
};

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

function listJSON(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((f) => f.endsWith('.json')).map((f) => {
    const file = `${dir}/${f}`;
    let data;
    try { data = JSON.parse(read(file)); } catch (e) { throw new Error(`${file} 不是有效 JSON：${e.message}`); }
    return { file, data };
  });
}

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out.sort();
}

export function fileManifest(files) {
  return files.filter(exists).map((p) => {
    return { path: p, bytes: fs.statSync(path.join(ROOT, p)).size };
  });
}

export function loadEntries() {
  const cases = listJSON('entries/cases').map((x) => ({ ...x.data, _file: x.file })).sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id));
  const patterns = listJSON('entries/patterns').map((x) => ({ ...x.data, _file: x.file })).sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id));
  const materials = listJSON('entries/materials').map((x) => ({ ...x.data, _file: x.file })).sort((a, b) => a.id.localeCompare(b.id));
  return { cases, patterns, materials };
}

const clean = (e) => { const { _file, ...rest } = e; return rest; };
const demoDir = (demo) => path.posix.dirname(demo);

function previewFor(kind, id) {
  for (const ext of ['jpg', 'png', 'webp']) {
    const p = `previews/${kind}/${id}.${ext}`;
    if (exists(p)) return p;
  }
  return null;
}

export function entryFiles(e) {
  if (e.skillPath) return [`entries/materials/${e.id}.json`, ...walk(e.skillPath.replace(/\/$/, '')), ...e.gallery.map((image) => image.path)];
  const dirs = [demoDir(e.demo), ...(e.sources || []).map(s => `demos/cases/${s.caseId}`)];
  const kind = e.demo.startsWith('demos/cases/') ? 'cases' : 'patterns';
  const previews = [previewFor(kind, e.id), previewFor(kind, `${e.id}-portrait`)].filter(Boolean);
  const research = [e.id, ...(e.sources || []).map(s => s.caseId)].map(id => `docs/research/${id}.md`).filter(exists);
  return [...new Set([...new Set(dirs)].flatMap(walk).concat(previews, research))].sort();
}

function promptDoc(kind, e) {
  const L = [];
  L.push(`# ${e.title}`, '');
  L.push('## 实现 Prompt', '', e.prompt, '');
  if (e.videoPrompt) L.push('## 视频生成 Prompt', '', e.videoPrompt, '');
  if (e.negativePrompt) L.push('## 负向约束', '', e.negativePrompt, '');
  if (e.timing?.length) L.push('## 参数', '', ...e.timing.map((t) => `- **${t.name}**：${t.value}${t.note ? `（${t.note}）` : ''}`), '');
  if (e.tokens?.motion?.length) L.push('## 动效 Token', '', ...e.tokens.motion.map((t) => `- **${t.name}**：${t.value}`), '');
  if (e.constraints?.length) L.push('## 制作约束', '', ...e.constraints.map((c) => `- ${c}`), '');
  if (e.migration?.length) L.push('## 迁移', '', ...e.migration.map((m) => `- \`${m.field}\`：${m.how}`), '');
  L.push(`[打开 Demo](../../${e.demo}) · [在库中查看](../../${kind === 'cases' ? 'cases.html#case' : 'patterns.html#pattern'}/${e.id})`, '');
  return L.join('\n');
}

const DOC_GROUPS = [
  ['docs/', '指南'],
  ['docs/research/', '研究'],
  ['prompts/cases/', '案例 Prompt'],
  ['prompts/patterns/', '巧思 Prompt'],
];
const GUIDE_ORDER = ['docs/guide.md', 'docs/rhythm.md', 'docs/prompting.md', 'docs/methodology.md', 'docs/pipeline.md'];

function collectDocs(extra) {
  const files = walk('docs').filter((f) => f.endsWith('.md'));
  const docs = files.map((p) => ({ path: p, content: extra[p] ?? read(p) }));
  for (const [p, content] of Object.entries(extra)) if (p.startsWith('prompts/') && p.endsWith('.md')) docs.push({ path: p, content });
  return docs.map((d) => {
    const m = d.content.match(/^#\s+(.+)$/m);
    const group = DOC_GROUPS.filter(([pre]) => d.path.startsWith(pre)).at(-1)[1];
    return { path: d.path, title: m ? m[1].trim() : d.path, group, content: d.content };
  }).sort((a, b) => {
    const ga = DOC_GROUPS.findIndex(([, g]) => g === a.group), gb = DOC_GROUPS.findIndex(([, g]) => g === b.group);
    if (ga !== gb) return ga - gb;
    const ia = GUIDE_ORDER.indexOf(a.path), ib = GUIDE_ORDER.indexOf(b.path);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.path.localeCompare(b.path);
  });
}

export function buildAll() {
  const entries = loadEntries();
  const files = {};
  const kitTargets = [];
  // preview：横屏预览（1280×720）；previewPortrait：竖屏预览（720×1280，Demo 迁移到固定画幅舞台并支持竖屏后才有）
  const cases = entries.cases.map((c) => ({ ...clean(c), preview: previewFor('cases', c.id), previewPortrait: previewFor('cases', `${c.id}-portrait`) }));
  const patterns = entries.patterns.map((p) => ({ ...clean(p), preview: previewFor('patterns', p.id), previewPortrait: previewFor('patterns', `${p.id}-portrait`) }));
  const materials = entries.materials.map((r) => ({ ...clean(r), preview: r.gallery[0]?.path || null }));
  for (const e of [...entries.cases, ...entries.patterns]) {
    if (/\bsrc=["'](?:\.\/)?motion-kit\.js["']/.test(read(e.demo))) kitTargets.push(demoDir(e.demo));
  }

  // Prompt 文档
  for (const c of cases) files[`prompts/cases/${c.id}.md`] = promptDoc('cases', c);
  for (const p of patterns) files[`prompts/patterns/${p.id}.md`] = promptDoc('patterns', p);

  // 站点数据
  const site = { schemaVersion: SCHEMA_VERSION, taxonomy: TAXONOMY, cases, patterns };
  files['data/catalog.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA = ${JSON.stringify(site)};\n`;
  files['data/materials.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA.materials = ${JSON.stringify(materials)};\n`;
  // README 计数块（先于文档集合生成，文档中心读到的是更新后的 README）
  if (exists('README.md')) {
    const readme = read('README.md');
    const block = `<!-- counts:start -->\n**${cases.length} 个案例**　·　**${patterns.length} 个巧思**　·　**${materials.length} 个素材**　·　**${cases.filter((c) => c.timeline).length} 个可逐帧渲染的影像 Demo**\n<!-- counts:end -->`;
    files['README.md'] = readme.replace(/<!-- counts:start -->[\s\S]*?<!-- counts:end -->/, block);
  }
  const docs = collectDocs(files);
  files['data/docs.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA_DOCS = ${JSON.stringify(docs)};\n`;

  // Agent 资料包
  const bundleSummaries = { cases: [], patterns: [], materials: [] };
  const kitFile = 'kit/motion-kit.js';
  for (const c of cases) {
    const demoFiles = entryFiles(c);
    const bundle = {
      schemaVersion: SCHEMA_VERSION, kind: 'case', id: c.id, entry: c,
      documents: {
        prompt: files[`prompts/cases/${c.id}.md`],
      },
      entrypoint: c.demo,
      files: fileManifest(demoFiles),
    };
    const json = JSON.stringify(bundle, null, 2) + '\n';
    files[`agent/cases/${c.id}.json`] = json;
    bundleSummaries.cases.push({
      id: c.id, title: c.title, summary: c.summary, carriers: c.carriers, tags: c.tags || [],
      useCases: c.useCases || [], avoid: c.avoid || [], patternIds: c.patternIds || [], seekable: !!c.timeline,
      bundle: `agent/cases/${c.id}.json`,
    });
  }
  for (const p of patterns) {
    const demoFiles = entryFiles(p);
    const bundle = {
      schemaVersion: SCHEMA_VERSION, kind: 'pattern', id: p.id, pattern: p,
      sourceCases: (p.sources || []).map((s) => ({ caseId: s.caseId, bundle: `agent/cases/${s.caseId}.json` })),
      documents: { prompt: files[`prompts/patterns/${p.id}.md`] },
      entrypoint: p.demo,
      files: fileManifest(demoFiles),
    };
    const json = JSON.stringify(bundle, null, 2) + '\n';
    files[`agent/patterns/${p.id}.json`] = json;
    bundleSummaries.patterns.push({
      id: p.id, title: p.title, summary: p.summary, types: p.types, carriers: p.carriers, role: p.composition?.role || null,
      sourceCases: (p.sources || []).map((s) => s.caseId), pairsWellWith: p.composition?.pairsWellWith || [],
      bundle: `agent/patterns/${p.id}.json`,
    });
  }
  for (const r of materials) {
    const snapshotFiles = walk(r.skillPath.replace(/\/$/, ''));
    const bundle = {
      schemaVersion: SCHEMA_VERSION, kind: 'materials', id: r.id, material: r,
      documents: {
        skill: read(`${r.skillPath}SKILL.md`),
        readme: read(`${r.skillPath}README.md`),
        readmeZh: read(`${r.skillPath}README.zh-CN.md`),
        references: Object.fromEntries(snapshotFiles.filter((p) => p.endsWith('.md') && !['SKILL.md', 'README.md', 'README.zh-CN.md'].some((name) => p === r.skillPath + name)).map((p) => [p, read(p)])),
      },
      entrypoint: `${r.skillPath}SKILL.md`,
      files: fileManifest(entryFiles(r)),
    };
    files[`agent/materials/${r.id}.json`] = JSON.stringify(bundle, null, 2) + '\n';
    bundleSummaries.materials.push({
      id: r.id, title: r.title, summary: r.summary, type: r.type,
      carrierNote: r.carrierNote, useCases: r.useCases, avoid: r.avoid,
      skillPath: r.skillPath, relatedEntries: r.relatedEntries,
      bundle: `agent/materials/${r.id}.json`,
    });
  }
  files['agent/materials.json'] = JSON.stringify({
    schemaVersion: SCHEMA_VERSION, kind: 'materials', count: materials.length, materials: bundleSummaries.materials,
  }, null, 2) + '\n';
  const catalog = {
    schemaVersion: SCHEMA_VERSION,
    name: 'Motion Atlas',
    description: '影像与操作台参考库：按时间线播放的影像视频、交互操作台与展示台的案例、巧思、节拍表、Prompt 与可运行的 Demo。',
    taxonomy: TAXONOMY,
    protocol: {
      seek: 'Demo 若 entry.timeline 为 true，则暴露 window.__motion = { duration, markers, seek(t)→Promise, play(), pause(), on(fn), ready, orient, orients, setOrient(o), audio }；orients 为空表示自适应布局。',
      urlParams: '?embed 隐藏控制条；?render 关闭自动播放供逐帧渲染；?t=秒 定位到指定时刻；?orient=landscape|portrait 固定画幅；?autoplay=0 不自动播放；?sound=1 尝试开启声音。',
      stage: '固定画幅舞台：横屏 1920×1080 / 竖屏 1080×1920，整体等比缩放；声音为乐谱（MotionKit.audio），可离线导出 WAV。见 docs/pipeline.md。',
      mountFilm: '时间纯函数作品提供 renderAt(t)、时长、尺寸与 fps，通过 MotionKit.mountFilm 创建舞台、播放控制与 window.__motion。',
      replay: 'MotionKit.replay 按 segments 引用来源案例片段，提供拼接时间轴、声音同步与宿主协议。',
      kit: kitFile,
    },
    counts: { cases: cases.length, patterns: patterns.length, materials: materials.length },
    materialCatalog: 'agent/materials.json',
    cases: bundleSummaries.cases,
    patterns: bundleSummaries.patterns,
    materials: bundleSummaries.materials,
  };
  files['agent/catalog.json'] = JSON.stringify(catalog, null, 2) + '\n';

  return { files, kitTargets, cases, patterns, materials };
}

export { rel, walk, exists, read };
