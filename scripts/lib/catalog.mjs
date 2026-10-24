// 内容源 → 生成物：data/catalog.js、data/docs.js、prompts/、agent/、README 计数。
// build.mjs 写入；check.mjs 在内存中重建并比对，发现未重建的改动。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SCHEMA_VERSION = 1;

export const TAXONOMY = {
  carriers: { video: '影像视频', console: '交互操作台', showcase: '交互展示台' },
  sources: { reference: '用户提供的参考', game: '游戏界面转译', original: '原创设计语言' },
  types: {
    composition: '画面构成', 'type-motion': '文字动效', transition: '转场', camera: '镜头与空间',
    feedback: '交互反馈', rhythm: '节奏与时序', hud: '信息层 HUD', texture: '质感与后期', sound: '声音',
  },
  evidence: { observed: '逐帧/源码实测', adapted: '本地转译', inferred: '公开资料推断·待核验', original: '原创设计' },
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

const CASE_REQUIRED = ['id', 'title', 'carriers', 'source', 'evidence', 'summary', 'prompt', 'demo', 'composition', 'sources'];
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
    if (!TAXONOMY.sources[c.source]) errors.push(`${c._file}: 未知来源 ${c.source}`);
    if (!TAXONOMY.evidence[c.evidence]) errors.push(`${c._file}: 未知证据等级 ${c.evidence}`);
    if (c.demo && !exists(c.demo)) errors.push(`${c._file}: Demo 不存在 ${c.demo}`);
    if (c.research && !exists(c.research)) errors.push(`${c._file}: 研究笔记不存在 ${c.research}`);
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
      if (!caseIds.has(s.caseId)) errors.push(`${p._file}: 来源案例不存在 ${s.caseId}`);
      if (!TAXONOMY.evidence[s.evidence]) errors.push(`${p._file}: 未知证据等级 ${s.evidence}`);
    }
    const comp = p.composition || {};
    if (comp.role && !TAXONOMY.roles[comp.role]) errors.push(`${p._file}: 未知组合职责 ${comp.role}`);
    for (const id of [...(comp.pairsWellWith || []), ...(comp.conflicts || [])]) if (!patIds.has(id)) errors.push(`${p._file}: 组合关系引用不存在 ${id}`);
  }
  // 反向关联：巧思的来源案例应在该案例 patternIds 中
  for (const p of patterns) for (const s of p.sources || []) {
    const c = cases.find((x) => x.id === s.caseId);
    if (c && !(c.patternIds || []).includes(p.id)) errors.push(`${c._file}: patternIds 缺少 ${p.id}（其来源指向本案例）`);
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
  L.push(`# ${e.title} · 复用 Prompt`, '');
  L.push(`由 [结构化条目](../../entries/${kind}/${e.id}.json) 自动生成。${e.research ? `观察与边界见 [研究笔记](../../${e.research})。` : ''}`, '');
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
  ['docs/research/', '案例研究'],
  ['prompts/', '复用 Prompt'],
  ['docs/', '指南与方法'],
  ['', '项目说明'],
];
const GUIDE_ORDER = ['docs/guide.md', 'docs/rhythm.md', 'docs/prompting.md', 'docs/pipeline.md', 'docs/methodology.md', 'README.md', 'AGENT.md', 'CONTRIBUTING.md'];

function collectDocs(extra) {
  const files = [...walk('docs').filter((f) => f.endsWith('.md')), ...['README.md', 'AGENT.md', 'CONTRIBUTING.md'].filter(exists)];
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

export const RESOURCE_DIRS = {
  'lemo-opuscar': 'resources/lemo-opuscar',
  'opus-videos': 'resources/opus-videos',
  'garden-skills': 'resources/skills/garden-skills',
  'agent-anime-skill': 'resources/skills/agent-anime-skill',
};
export const RESOURCE_SKILLS = ['beautiful-article', 'gpt-image-2', 'kb-retriever', 'motion-showreel', 'web-design-engineer', 'web-video-presentation', 'ai-handdrawn-video'];

function frontmatterValue(front, key) {
  const lines = front.split('\n');
  const index = lines.findIndex((line) => line.startsWith(key + ':'));
  if (index === -1) return '';
  const value = lines[index].slice(key.length + 1).trim();
  if (/^[>|][+-]?$/.test(value)) {
    const block = [];
    for (const line of lines.slice(index + 1)) {
      if (line.trim() && !/^\s/.test(line)) break;
      block.push(line);
    }
    const indent = Math.min(...block.filter((line) => line.trim()).map((line) => line.match(/^ */)[0].length));
    const body = block.map((line) => line.slice(indent));
    let text = '';
    for (let i = 0; i < body.length; i++) {
      text += body[i];
      const next = body[i + 1];
      text += value[0] === '|' || next == null || /^\s/.test(body[i]) || /^\s/.test(next) ? '\n' :
        body[i] && next ? ' ' : body[i] ? '' : '\n';
    }
    return value.endsWith('-') ? text.replace(/\n+$/, '') : value.endsWith('+') ? text : text.replace(/\n*$/, '\n');
  }
  if (value.startsWith('"') && value.endsWith('"')) return JSON.parse(value);
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

export function buildResources() {
  const manifests = Object.fromEntries(Object.entries(RESOURCE_DIRS).map(([name, dir]) => [name, JSON.parse(read(`${dir}/UPSTREAM.json`))]));
  const { repo, url, commit, fetchedAt, license, notice } = manifests['opus-videos'];
  const items = JSON.parse(read('resources/opus-videos/data/videos.json')).map((v) => {
    let partial = 'none';
    if (v.prompt_partial !== false) {
      const md = read(`resources/opus-videos/prompts/${v.slug}.md`);
      if (md.includes('The author shared only part of the prompt.')) partial = 'part';
      else if (md.includes("The author didn't publish the full prompt.")) partial = 'post';
      else throw new Error(`无法判定提示词完整度：${v.slug}`);
    }
    const prompt = Array.from(v.prompt.replace(/\s+/g, ' ').trim());
    return {
      slug: v.slug, title: v.title ?? null, author: v.author, authorUrl: v.author_url, postUrl: v.post_url,
      remakeUrl: v.skillry_url, category: v.category, tags: v.tech_tags, partial, poster: v.poster_url, added: v.added,
      excerpt: prompt.slice(0, 200).join('') + (prompt.length > 200 ? '…' : ''),
    };
  }).sort((a, b) => b.added.localeCompare(a.added) || a.slug.localeCompare(b.slug));
  const skills = [];
  for (const name of ['garden-skills', 'agent-anime-skill']) {
    const upstream = manifests[name];
    for (const file of walk(RESOURCE_DIRS[name]).filter((p) => p.endsWith('/SKILL.md') && !/\/(references|assets|templates)\//.test(p))) {
      const front = read(file).replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
      if (!front) throw new Error(`缺少 YAML frontmatter：${file}`);
      const dir = path.posix.dirname(file);
      skills.push({
        id: frontmatterValue(front, 'name'), repo: name, dir, description: frontmatterValue(front, 'description'),
        upstream: { repo: upstream.repo, url: upstream.url, commit: upstream.commit, license: upstream.license, notice: upstream.notice },
        files: walk(dir).map((p) => ({ path: p.slice(dir.length + 1), bytes: fs.statSync(path.join(ROOT, p)).size })),
      });
    }
  }
  skills.sort((a, b) => Number(a.repo !== 'garden-skills') - Number(b.repo !== 'garden-skills') || a.id.localeCompare(b.id));
  if (skills.length !== 7 || skills.some((s) => !RESOURCE_SKILLS.includes(s.id) || !s.description.trim()) || new Set(skills.map((s) => s.id)).size !== 7) {
    throw new Error(`资源 Skill 应恰为指定的 7 个且 description 非空，实际：${skills.map((s) => s.id).join(', ')}`);
  }
  const lemo = manifests['lemo-opuscar'], status = JSON.parse(read('scripts/lemo-status.json'));
  const styleItems = fs.readdirSync(path.join(ROOT, 'resources/lemo-opuscar/styles'), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('_')).map(entry => {
      const slug = entry.name, dir = `resources/lemo-opuscar/styles/${slug}`;
      const s = JSON.parse(read(`${dir}/style.json`)), state = status[slug];
      return {
        slug, num: s.num, en: s.en, cn: s.cn, categoryCn: s.category_cn, categoryEn: s.category_en,
        film: s.film, line: s.line, lineCn: s.line_cn, uses: s.uses, frameSec: s.frame_sec, dur: s.dur,
        status: state.status, heavy: Boolean(state.heavy), audio: exists(`resources/lemo-opuscar/audio/${slug}.ogg`),
        poster: `${dir}/poster.jpg`, dir,
        docs: ['STYLE.md', 'DEMO.md', 'demo/CREDITS'].filter(file => exists(`${dir}/${file}`)),
        player: state.status === 'ready' ? `demos/styles/player/?style=${slug}` : null,
        filmUrl: state.film ? `https://github.com/${lemo.repo}/releases/download/films/${state.film}` : null,
        treeUrl: `https://github.com/${lemo.repo}/tree/${lemo.commit}/styles/${slug}`,
      };
    }).sort((a, b) => Number(a.num) - Number(b.num));
  const styles = { upstream: Object.fromEntries(['repo', 'url', 'commit', 'fetchedAt', 'license', 'notice'].map(key => [key, lemo[key]])), items: styleItems };
  return { videos: { upstream: { repo, url, commit, fetchedAt, license, notice }, items }, styles, skills };
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
  const resources = buildResources();
  files['data/resources.js'] = `/* 由 scripts/build.mjs 生成，请勿手改 */\nwindow.MA_RES = ${JSON.stringify(resources)};\n`;
  // README 计数块（先于文档集合生成，文档中心读到的是更新后的 README）
  if (exists('README.md')) {
    const readme = read('README.md');
    const block = `<!-- counts:start -->\n**${cases.length} 个案例**　·　**${patterns.length} 个巧思**　·　**${cases.filter((c) => c.timeline).length} 个可逐帧渲染的影像 Demo**　·　**${resources.styles.items.length} 种代码片风格**　·　**${resources.videos.items.length} 条视频提示词**　·　**${resources.skills.length} 个 Skill**\n<!-- counts:end -->`;
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
        research: c.research && exists(c.research) ? read(c.research) : null,
      },
      entrypoint: c.demo,
      files: fileManifest([...demoFiles, ...(c.preview ? [c.preview] : []), ...(c.previewPortrait ? [c.previewPortrait] : [])]),
    };
    const json = JSON.stringify(bundle, null, 2) + '\n';
    files[`agent/cases/${c.id}.json`] = json;
    bundleSummaries.cases.push({
      id: c.id, title: c.title, summary: c.summary, carriers: c.carriers, source: c.source, evidence: c.evidence, tags: c.tags || [],
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
    description: '多媒体动态视觉参考库：影像视频、交互操作台、交互展示台的案例、巧思、节奏表、Prompt 与可迁移 Demo。',
    contentVersion: sha(Buffer.from(versionText)),
    taxonomy: TAXONOMY,
    protocol: {
      seek: 'Demo 若 entry.timeline 为 true，则暴露 window.__motion = { duration, markers, seek(t)→Promise, play(), pause(), on(fn), ready, orient, orients, setOrient(o), audio }；orients 为空表示未迁移到固定画幅的旧 Demo。',
      urlParams: '?embed 隐藏控制条；?render 关闭自动播放供逐帧渲染；?t=秒 定位到指定时刻；?orient=landscape|portrait 固定画幅；?autoplay=0 不自动播放；?sound=1 尝试开启声音。',
      stage: '固定画幅舞台：横屏 1920×1080 / 竖屏 1080×1920，整体等比缩放；声音为乐谱（MotionKit.audio），可离线导出 WAV。见 docs/pipeline.md。',
      kit: kitFile,
    },
    counts: { cases: cases.length, patterns: patterns.length },
    resources: {
      videos: { count: resources.videos.items.length, data: 'resources/opus-videos/data/videos.json', prompts: 'resources/opus-videos/prompts/', license: resources.videos.upstream.license },
      styles: { count: resources.styles.items.length, ready: resources.styles.items.filter(s => s.status === 'ready').length, path: 'resources/lemo-opuscar/styles/', player: 'demos/styles/player/?style=<slug>', license: resources.styles.upstream.license },
      skills: resources.skills.map((s) => ({ id: s.id, path: `${s.dir}/SKILL.md`, license: s.upstream.license })),
    },
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
