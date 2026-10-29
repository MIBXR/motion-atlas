// entries/、demos/、docs/ → 站点数据、Prompt、Agent 资料包与案例索引。
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
  materialTypes: { 'component-library': '组件库', image: '图像', sound: '声音', font: '字体', poster: '海报', 'agent-skill': 'Agent Skill', 'prompt-kit': '提示词套件' },
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
    const name = path.posix.basename(p);
    const role = /^(?:licen[cs]es?|notice|copying|ofl)(?:[._-]|$)|[-_](?:licen[cs]e|notice|ofl)(?:[._-]|$)/i.test(name) ? 'license'
      : p.includes('/source/') ? 'process'
      : p.includes('/vendor/') ? 'vendor'
      : p.includes('/fonts/') ? 'font'
      : p.startsWith('previews/') ? 'preview'
      : p.startsWith('entries/') ? 'entry'
      : /\.(?:md|txt)$/.test(p) ? 'doc'
      : /\.(?:html|css|m?js|tsx?)$/.test(p) ? 'source' : 'asset';
    return { path: p, bytes: fs.statSync(path.join(ROOT, p)).size, role };
  });
}

export function loadEntries() {
  const cases = listJSON('entries/cases').map((x) => ({ ...x.data, _file: x.file })).sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id));
  const patterns = listJSON('entries/patterns').map((x) => ({ ...x.data, _file: x.file })).sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id));
  const materials = listJSON('entries/materials').map((x) => ({ ...x.data, _file: x.file })).sort((a, b) => a.id.localeCompare(b.id));
  for (const e of materials) {
    if (!Object.hasOwn(TAXONOMY.materialTypes, e.type)) throw new Error(`${e._file}: 未知素材类型 ${e.type}`);
    if (e.snapshotPath) {
      if (e.snapshotPath !== `demos/materials/${e.id}/` || !e.snapshotEntry || !exists(e.snapshotPath + e.snapshotEntry)) throw new Error(`${e._file}: 快照目录或主文档不存在`);
    } else if (e.demo !== `demos/materials/${e.id}/index.html` || !exists(e.demo)) throw new Error(`${e._file}: 素材入口不存在`);
  }
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
  const kind = (e.snapshotPath || e.demo).split('/')[1];
  const sourceIds = kind === 'patterns' ? (e.sources || []).map(s => s.caseId) : [];
  const dirs = [(e.snapshotPath || demoDir(e.demo)).replace(/\/$/, ''), ...sourceIds.map(id => `demos/cases/${id}`)];
  const previews = [previewFor(kind, e.id), previewFor(kind, `${e.id}-portrait`)].filter(Boolean);
  const documents = [`docs/${kind}/${e.id}.md`, ...sourceIds.map(id => `docs/cases/${id}.md`), e.research].filter(p => p && exists(p));
  return [...new Set([...new Set(dirs)].flatMap(walk).concat(`entries/${kind}/${e.id}.json`, sourceIds.map(id => `entries/cases/${id}.json`), previews, documents, (e.gallery || []).map(image => image.path), e.sourceFiles || []))].sort();
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
  const hash = { cases: 'case', patterns: 'pattern', materials: 'material' }[kind];
  L.push(`[${e.snapshotPath ? '打开原文' : '打开 Demo'}](../../${e.snapshotPath ? e.snapshotPath + e.snapshotEntry : e.demo}) · [在库中查看](../../${kind}.html#${hash}/${e.id})`, '');
  return L.join('\n');
}

const DOC_GROUPS = [
  ['docs/', '指南'],
  ['docs/cases/', '案例研究'],
  ['docs/patterns/', '巧思说明'],
  ['docs/materials/', '素材说明'],
  ['prompts/cases/', '案例 Prompt'],
  ['prompts/patterns/', '巧思 Prompt'],
  ['prompts/materials/', '素材 Prompt'],
  ['demos/materials/', '素材原文'],
];
const GUIDE_ORDER = ['docs/guide.md', 'docs/rhythm.md', 'docs/prompting.md', 'docs/methodology.md', 'docs/pipeline.md'];

function collectDocs(extra, materials) {
  const files = [...walk('docs'), ...materials.flatMap(r => r.snapshotFiles || [])].filter((f) => f.endsWith('.md'));
  const docs = [...new Set([...files, ...Object.keys(extra).filter(p => /^(?:docs|prompts)\/.+\.md$/.test(p))])].map(p => ({ path: p, content: extra[p] ?? read(p) }));
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
  const documentsFor = (kind, e) => Object.fromEntries([
    ['research', `docs/${kind}/${e.id}.md`],
    ['fidelity', `demos/${kind}/${e.id}/fidelity.md`],
    ['licenses', `demos/${kind}/${e.id}/LICENSES.md`],
  ].filter(([, p]) => exists(p)));
  const cases = entries.cases.map(c => ({ ...clean(c), ...documentsFor('cases', c), preview: previewFor('cases', c.id), previewPortrait: previewFor('cases', `${c.id}-portrait`) }));
  const patterns = entries.patterns.map(p => ({ ...clean(p), ...documentsFor('patterns', p), preview: previewFor('patterns', p.id), previewPortrait: previewFor('patterns', `${p.id}-portrait`) }));
  const materials = entries.materials.map(r => ({ ...clean(r), ...documentsFor('materials', r), preview: r.preview || r.gallery?.[0]?.path || previewFor('materials', r.id), ...(r.snapshotPath ? { snapshotFiles: walk(r.snapshotPath.replace(/\/$/, '')) } : {}) }));
  for (const e of [...entries.cases, ...entries.patterns, ...entries.materials].filter(e => e.demo)) {
    if (/\bsrc=["'](?:\.\/)?motion-kit\.js["']/.test(read(e.demo))) kitTargets.push(demoDir(e.demo));
  }

  // Prompt 文档
  for (const [kind, list] of Object.entries({ cases, patterns, materials })) {
    for (const e of list) if (e.prompt) files[`prompts/${kind}/${e.id}.md`] = promptDoc(kind, e);
  }
  files['docs/cases/README.md'] = ['# 案例研究', '', '| 案例 | 资料 |', '| --- | --- |', ...cases.map(c => `| [${c.title}](../../cases.html#case/${c.id}) | ${c.research ? `[研究](${c.id}.md)` : `[条目](../../entries/cases/${c.id}.json)`} |`), ''].join('\n');

  // 站点数据
  const site = { schemaVersion: SCHEMA_VERSION, taxonomy: TAXONOMY, cases };
  files['data/cases.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA = ${JSON.stringify(site)};\n`;
  files['data/patterns.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA.patterns = ${JSON.stringify(patterns)};\n`;
  files['data/materials.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA.materials = ${JSON.stringify(materials)};\n`;
  files['data/asset-sources.js'] = '/* 由 scripts/build.mjs 生成，请勿手改 */\nglobalThis.MotionAtlasAssetSources = {"assets":{}};\n';
  // README 计数块
  if (exists('README.md')) {
    const readme = read('README.md');
    const block = `<!-- counts:start -->\n**${cases.length} 个案例**　·　**${patterns.length} 个巧思**　·　**${materials.length} 个素材**　·　**${cases.filter((c) => c.timeline).length} 个可逐帧渲染的影像 Demo**\n<!-- counts:end -->`;
    files['README.md'] = readme.replace(/<!-- counts:start -->[\s\S]*?<!-- counts:end -->/, block);
  }
  const docs = collectDocs(files, materials);
  files['data/docs.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA_DOCS = ${JSON.stringify(docs)};\n`;

  // Agent 资料包
  const bundleSummaries = { cases: [], patterns: [], materials: [] };
  const kitFile = 'kit/motion-kit.js';
  const entryDocuments = e => Object.fromEntries(['research', 'fidelity', 'licenses'].filter(key => e[key]).map(key => [key, read(e[key])]));
  for (const c of cases) {
    const demoFiles = entryFiles(c);
    const bundle = {
      schemaVersion: SCHEMA_VERSION, kind: 'case', id: c.id, entry: c,
      documents: {
        ...entryDocuments(c),
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
      documents: { ...entryDocuments(p), ...(p.prompt ? { prompt: files[`prompts/patterns/${p.id}.md`] } : {}) },
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
    const snapshotDocuments = (r.snapshotFiles || []).filter(p => p.endsWith('.md') && p !== r.snapshotPath + r.snapshotEntry).map(p => [p, read(p)]);
    const bundle = {
      schemaVersion: SCHEMA_VERSION, kind: 'materials', id: r.id, material: r,
      documents: {
        ...entryDocuments(r),
        ...(r.snapshotPath ? { snapshot: read(r.snapshotPath + r.snapshotEntry), references: Object.fromEntries(snapshotDocuments) } : {}),
        ...(r.prompt ? { prompt: files[`prompts/materials/${r.id}.md`] } : {}),
      },
      entrypoint: r.snapshotPath ? r.snapshotPath + r.snapshotEntry : r.demo,
      files: fileManifest(entryFiles(r)),
    };
    files[`agent/materials/${r.id}.json`] = JSON.stringify(bundle, null, 2) + '\n';
    bundleSummaries.materials.push({
      id: r.id, title: r.title, summary: r.summary, type: r.type,
      carrierNote: r.carrierNote, useCases: r.useCases, avoid: r.avoid,
      snapshotPath: r.snapshotPath, snapshotEntry: r.snapshotEntry, demo: r.demo, relatedEntries: r.relatedEntries,
      bundle: `agent/materials/${r.id}.json`,
    });
  }
  for (const kind of ['cases', 'patterns', 'materials']) {
    files[`agent/${kind}/index.json`] = JSON.stringify({ schemaVersion: SCHEMA_VERSION, kind, count: bundleSummaries[kind].length, [kind]: bundleSummaries[kind] }, null, 2) + '\n';
  }
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
    caseCatalog: 'agent/cases/index.json',
    patternCatalog: 'agent/patterns/index.json',
    materialCatalog: 'agent/materials/index.json',
    cases: bundleSummaries.cases,
    patterns: bundleSummaries.patterns,
    materials: bundleSummaries.materials,
  };
  files['agent/catalog.json'] = JSON.stringify(catalog, null, 2) + '\n';

  return { files, kitTargets, cases, patterns, materials };
}

export { rel, walk, exists, read };
