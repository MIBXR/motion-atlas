// 内容源 → 生成物：data/catalog.js、data/docs.js、prompts/、agent/、README 计数。
// build.mjs 写入；check.mjs 在内存中重建并比对，发现未重建的改动。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

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
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out.sort();
}

export function fileManifest(files) {
  return files.filter(exists).map((p) => {
    const buf = fs.readFileSync(path.join(ROOT, p));
    return { path: p, bytes: buf.length, sha256: sha(buf) };
  });
}

export function loadEntries() {
  const cases = listJSON('entries/cases').map((x) => ({ ...x.data, _file: x.file })).sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id));
  const patterns = listJSON('entries/patterns').map((x) => ({ ...x.data, _file: x.file })).sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.id.localeCompare(b.id));
  return { cases, patterns };
}

const CASE_REQUIRED = ['id', 'title', 'carriers', 'summary', 'prompt', 'demo', 'composition'];
const PATTERN_REQUIRED = ['id', 'title', 'types', 'carriers', 'summary', 'mechanism', 'trigger', 'effect', 'prompt', 'demo', 'sources', 'composition', 'accessibility'];

export function validate({ cases, patterns }) {
  const errors = [];
  const ids = new Set();
  const caseIds = new Set(cases.map((c) => c.id));
  const patIds = new Set(patterns.map((p) => p.id));
  for (const c of cases) {
    for (const k of CASE_REQUIRED) if (c[k] == null || (Array.isArray(c[k]) && !c[k].length)) errors.push(`${c._file}: 缺少 ${k}`);
    if (ids.has(c.id)) errors.push(`${c._file}: 重复 id ${c.id}`);
    ids.add(c.id);
    if (`entries/cases/${c.id}.json` !== c._file) errors.push(`${c._file}: 文件名应为 ${c.id}.json`);
    for (const k of c.carriers || []) if (!TAXONOMY.carriers[k]) errors.push(`${c._file}: 未知载体 ${k}`);
    if (c.demo && !exists(c.demo)) errors.push(`${c._file}: Demo 不存在 ${c.demo}`);
    for (const pid of c.patternIds || []) if (!patIds.has(pid)) errors.push(`${c._file}: 关联巧思不存在 ${pid}`);
    for (const b of c.rhythm?.beats || []) if (typeof b.t !== 'number' || !b.label) errors.push(`${c._file}: 节拍需要数值 t 与 label`);
    if (c.energy && c.energy.some((v) => typeof v !== 'number' || v < 0 || v > 1)) errors.push(`${c._file}: energy 取值应在 0–1`);
  }
  for (const p of patterns) {
    for (const k of PATTERN_REQUIRED) if (p[k] == null || (Array.isArray(p[k]) && !p[k].length)) errors.push(`${p._file}: 缺少 ${k}`);
    if (ids.has(p.id)) errors.push(`${p._file}: id 与其他条目重复 ${p.id}`);
    ids.add(p.id);
    if (`entries/patterns/${p.id}.json` !== p._file) errors.push(`${p._file}: 文件名应为 ${p.id}.json`);
    for (const k of p.types || []) if (!TAXONOMY.types[k]) errors.push(`${p._file}: 未知类型 ${k}`);
    for (const k of p.carriers || []) if (!TAXONOMY.carriers[k]) errors.push(`${p._file}: 未知载体 ${k}`);
    if (p.demo && !exists(p.demo)) errors.push(`${p._file}: Demo 不存在 ${p.demo}`);
    for (const s of p.sources || []) {
      if (!caseIds.has(s.caseId)) errors.push(`${p._file}: 所属案例不存在 ${s.caseId}`);
    }
    const comp = p.composition || {};
    if (comp.role && !TAXONOMY.roles[comp.role]) errors.push(`${p._file}: 未知组合职责 ${comp.role}`);
    for (const id of [...(comp.pairsWellWith || []), ...(comp.conflicts || [])]) if (!patIds.has(id)) errors.push(`${p._file}: 组合关系引用不存在 ${id}`);
  }
  // 巧思应包含在所属案例的 patternIds 中。
  for (const p of patterns) for (const s of p.sources || []) {
    const c = cases.find((x) => x.id === s.caseId);
    if (c && !(c.patternIds || []).includes(p.id)) errors.push(`${c._file}: patternIds 缺少 ${p.id}`);
  }
  return errors;
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
  ['prompts/cases/', '案例 Prompt'],
  ['prompts/patterns/', '巧思 Prompt'],
];
const GUIDE_ORDER = ['docs/guide.md', 'docs/rhythm.md', 'docs/prompting.md', 'docs/methodology.md', 'docs/pipeline.md'];

function collectDocs(extra) {
  const files = fs.readdirSync(path.join(ROOT, 'docs')).filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`);
  const docs = files.map((p) => ({ path: p, content: extra[p] ?? read(p) }));
  for (const [p, content] of Object.entries(extra)) if (p.startsWith('prompts/') && p.endsWith('.md')) docs.push({ path: p, content });
  return docs.map((d) => {
    const m = d.content.match(/^#\s+(.+)$/m);
    const group = DOC_GROUPS.find(([pre]) => d.path.startsWith(pre))[1];
    return { path: d.path, title: m ? m[1].trim() : d.path, group, content: d.content };
  }).sort((a, b) => {
    const ga = DOC_GROUPS.findIndex(([, g]) => g === a.group), gb = DOC_GROUPS.findIndex(([, g]) => g === b.group);
    if (ga !== gb) return ga - gb;
    const ia = GUIDE_ORDER.indexOf(a.path), ib = GUIDE_ORDER.indexOf(b.path);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.path.localeCompare(b.path);
  });
}

/** 计算全部生成物，返回 { files: {path: content}, kitTargets: [dir], errors } */
export function buildAll() {
  const entries = loadEntries();
  const errors = validate(entries);
  const files = {};
  const kitTargets = [];
  // preview：横屏预览（1280×720）；previewPortrait：竖屏预览（720×1280，Demo 迁移到固定画幅舞台并支持竖屏后才有）
  const cases = entries.cases.map((c) => ({ ...clean(c), preview: previewFor('cases', c.id), previewPortrait: previewFor('cases', `${c.id}-portrait`) }));
  const patterns = entries.patterns.map((p) => ({ ...clean(p), preview: previewFor('patterns', p.id), previewPortrait: previewFor('patterns', `${p.id}-portrait`) }));
  for (const e of [...entries.cases, ...entries.patterns]) if (e.kit) kitTargets.push(demoDir(e.demo));

  // Prompt 文档
  for (const c of cases) files[`prompts/cases/${c.id}.md`] = promptDoc('cases', c);
  for (const p of patterns) files[`prompts/patterns/${p.id}.md`] = promptDoc('patterns', p);

  // 站点数据
  const site = { schemaVersion: SCHEMA_VERSION, taxonomy: TAXONOMY, cases, patterns };
  files['data/catalog.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA = ${JSON.stringify(site)};\n`;
  // README 计数块（先于文档集合生成，文档中心读到的是更新后的 README）
  if (exists('README.md')) {
    const readme = read('README.md');
    const block = `<!-- counts:start -->\n**${cases.length} 个案例**　·　**${patterns.length} 个巧思**　·　**${cases.filter((c) => c.timeline).length} 个可逐帧渲染的影像 Demo**\n<!-- counts:end -->`;
    files['README.md'] = readme.replace(/<!-- counts:start -->[\s\S]*?<!-- counts:end -->/, block);
  }
  const docs = collectDocs(files);
  files['data/docs.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA_DOCS = ${JSON.stringify(docs)};\n`;

  // Agent 资料包
  const bundleSummaries = { cases: [], patterns: [] };
  const kitFile = 'kit/motion-kit.js';
  for (const c of cases) {
    const demoFiles = walk(demoDir(c.demo));
    const bundle = {
      schemaVersion: SCHEMA_VERSION, kind: 'case', id: c.id, entry: c,
      documents: {
        prompt: files[`prompts/cases/${c.id}.md`],
      },
      entrypoint: c.demo,
      files: fileManifest([...demoFiles, ...(c.preview ? [c.preview] : []), ...(c.previewPortrait ? [c.previewPortrait] : [])]),
    };
    const json = JSON.stringify(bundle, null, 2) + '\n';
    files[`agent/cases/${c.id}.json`] = json;
    bundleSummaries.cases.push({
      id: c.id, title: c.title, summary: c.summary, carriers: c.carriers, tags: c.tags || [],
      useCases: c.useCases || [], avoid: c.avoid || [], patternIds: c.patternIds || [], seekable: !!c.timeline,
      bundle: `agent/cases/${c.id}.json`, bundleSha256: sha(Buffer.from(json)),
    });
  }
  for (const p of patterns) {
    const demoFiles = walk(demoDir(p.demo));
    const bundle = {
      schemaVersion: SCHEMA_VERSION, kind: 'pattern', id: p.id, pattern: p,
      sourceCases: (p.sources || []).map((s) => ({ caseId: s.caseId, bundle: `agent/cases/${s.caseId}.json` })),
      documents: { prompt: files[`prompts/patterns/${p.id}.md`] },
      entrypoint: p.demo,
      files: fileManifest([...demoFiles, ...(p.preview ? [p.preview] : []), ...(p.previewPortrait ? [p.previewPortrait] : [])]),
    };
    const json = JSON.stringify(bundle, null, 2) + '\n';
    files[`agent/patterns/${p.id}.json`] = json;
    bundleSummaries.patterns.push({
      id: p.id, title: p.title, summary: p.summary, types: p.types, carriers: p.carriers, role: p.composition?.role || null,
      sourceCases: (p.sources || []).map((s) => s.caseId), pairsWellWith: p.composition?.pairsWellWith || [],
      bundle: `agent/patterns/${p.id}.json`, bundleSha256: sha(Buffer.from(json)),
    });
  }
  const versionText = [...bundleSummaries.cases, ...bundleSummaries.patterns].map((b) => `${b.bundle}:${b.bundleSha256}`).sort().join('\n');
  const catalog = {
    schemaVersion: SCHEMA_VERSION,
    name: 'Motion Atlas',
    description: '动态视觉参考库：影像视频与交互操作台的案例、巧思、节拍表、Prompt 与可运行的 Demo。',
    contentVersion: sha(Buffer.from(versionText)),
    taxonomy: TAXONOMY,
    protocol: {
      seek: 'Demo 若 entry.timeline 为 true，则暴露 window.__motion = { duration, markers, seek(t)→Promise, play(), pause(), on(fn), ready, orient, orients, setOrient(o), audio }；orients 为空表示未迁移到固定画幅的旧 Demo。',
      urlParams: '?embed 隐藏控制条；?render 关闭自动播放供逐帧渲染；?t=秒 定位到指定时刻；?orient=landscape|portrait 固定画幅；?autoplay=0 不自动播放；?sound=1 尝试开启声音。',
      stage: '固定画幅舞台：横屏 1920×1080 / 竖屏 1080×1920，整体等比缩放；声音为乐谱（MotionKit.audio），可离线导出 WAV。见 docs/pipeline.md。',
      kit: kitFile,
    },
    counts: { cases: cases.length, patterns: patterns.length },
    cases: bundleSummaries.cases,
    patterns: bundleSummaries.patterns,
  };
  files['agent/catalog.json'] = JSON.stringify(catalog, null, 2) + '\n';

  return { files, kitTargets, errors, cases, patterns };
}

export function kitStatus(kitTargets) {
  const src = fs.readFileSync(path.join(ROOT, 'kit/motion-kit.js'));
  return kitTargets.map((dir) => {
    const p = path.join(ROOT, dir, 'motion-kit.js');
    return { dir, ok: fs.existsSync(p) && sha(fs.readFileSync(p)) === sha(src) };
  });
}

export { rel, walk, exists, read, sha };
