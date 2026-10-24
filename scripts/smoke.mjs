#!/usr/bin/env node
// 浏览器冒烟测试：逐个打开 Demo，按 0.2 秒步长 seek 全时间轴，再实际播放 1.5 秒，收集未捕获异常与 console.error。
// 使用 MotionKit.stage() 的 Demo 额外检查：
//   - 两种画幅（?orient=）各跑一遍：画幅与舞台尺寸是否正确；运行中切换画幅后时刻是否保持；
//   - 运行时字号：在若干时刻遍历舞台内可见文字，按“计算字号 × 变换比例”（舞台坐标，不含舞台整体缩放）检查
//     横屏 ≥ 24px、竖屏 ≥ 36px。默认只报告，--strict-fonts 时计为失败。
// 未使用 stage() 的旧 Demo 只做 seek / 播放错误检查。需要先启动 npm start。
// 用法：node scripts/smoke.mjs [--only id1,id2] [--url <页面>]… [--orient both|landscape|portrait] [--strict-fonts]
//        [--base http://localhost:4321] [--w 1280 --h 720] [--step 0.2]
import { launch } from './lib/cdp.mjs';
import { loadEntries } from './lib/catalog.mjs';

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : d; };
const all = (k) => args.flatMap((a, i) => (a === k ? [args[i + 1]] : []));
const base = get('--base', 'http://localhost:4321').replace(/\/$/, '');
const only = get('--only', '') ? new Set(get('--only').split(',')) : null;
const urls = all('--url');
const w = Number(get('--w', 1280)), h = Number(get('--h', 720));
const step = Number(get('--step', 0.2));
const orientArg = get('--orient', 'both');
const strictFonts = args.includes('--strict-fonts');
const MIN = { landscape: Number(get('--min-landscape', 24)), portrait: Number(get('--min-portrait', 36)) };
const ORIENTS = orientArg === 'both' ? ['landscape', 'portrait'] : [orientArg];
if (!ORIENTS.every((o) => o === 'landscape' || o === 'portrait')) { console.error('--orient 只能是 both / landscape / portrait'); process.exit(1); }

const { cases, patterns } = loadEntries();
const jobs = [
  ...(urls.length && !only ? [] : [...cases, ...patterns].filter((e) => !only || only.has(e.id)).map((e) => ({ id: e.id, url: `${base}/${e.demo}`, fontFloor: e.fontFloor, renderer: e.renderer }))),
  ...urls.map((u) => ({ id: u.replace(/^https?:\/\/[^/]+\//, '').replace(/\/index\.html.*$|\?.*$/, ''), url: /^https?:/.test(u) ? u : `${base}/${u.replace(/^\//, '')}` })),
];

// 在页面里执行：遍历舞台内可见文字，返回 [{px, text}]（px 为舞台坐标下的字号）
const FONT_PROBE = `(() => {
  const st = window.__motion.stage, root = st.root, scale = st.scale || 1;
  const rr = root.getBoundingClientRect(), out = [];
  const opacityOf = (el) => { let op = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) { op *= parseFloat(getComputedStyle(e).opacity); if (op < 0.05) return 0; } return op; };
  for (const el of root.querySelectorAll('*')) {
    let text = '';
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) text += n.textContent.trim();
    if (!text) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility !== 'visible') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.right <= rr.left || r.left >= rr.right || r.bottom <= rr.top || r.top >= rr.bottom) continue;
    if (opacityOf(el) < 0.05) continue;
    // 变换比例（舞台坐标）：SVG 文字用屏幕框 / 用户坐标框再除以舞台缩放；HTML 沿祖先链累乘 transform 的纵向比例（不含舞台根）
    let k = 1;
    if (el instanceof SVGGraphicsElement) {
      const bb = el.getBBox && el.getBBox();
      if (bb && bb.height > 0) k = r.height / bb.height / scale;
      else { const m = el.getScreenCTM(); if (m) k = Math.hypot(m.c, m.d) / scale; }
    } else {
      for (let e = el; e && e !== root; e = e.parentElement) {
        const tf = getComputedStyle(e).transform;
        if (tf && tf !== 'none') { const m = new DOMMatrixReadOnly(tf); k *= Math.hypot(m.m21, m.m22); }
      }
    }
    out.push({ px: Math.round(parseFloat(cs.fontSize) * k * 10) / 10, text: text.slice(0, 20) });
  }
  return out;
})()`;

const REFERENCE_FONT_PROBE = `(() => {
  const st = window.__motion.stage, scale = st.scale || 1;
  const doc = st.root.querySelector('iframe').contentDocument, win = doc.defaultView, out = [];
  const opacityOf = (el) => { let op = 1; for (let e = el; e; e = e.parentElement) { op *= parseFloat(win.getComputedStyle(e).opacity); if (op < 0.05) return 0; } return op; };
  for (const el of doc.querySelectorAll('*')) {
    let text = '';
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) text += n.textContent.trim();
    if (!text) continue;
    const cs = win.getComputedStyle(el), r = el.getBoundingClientRect();
    if (parseFloat(cs.fontSize) <= 0 || cs.display === 'none' || cs.visibility !== 'visible' || r.width < 1 || r.height < 1) continue;
    if (r.right <= 0 || r.left >= win.innerWidth || r.bottom <= 0 || r.top >= win.innerHeight || opacityOf(el) < 0.05) continue;
    out.push({ px: Math.round(parseFloat(cs.fontSize) * scale * 10) / 10, text: text.slice(0, 20) });
  }
  return out;
})()`;

const GPU_PROBE = `(() => {
  const renderers = new Set();
  function inspect(doc) {
    for (const canvas of doc.querySelectorAll('canvas')) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) continue;
      const debug = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debug) throw new Error('无法读取 WebGL UNMASKED_RENDERER_WEBGL');
      renderers.add(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL));
    }
    for (const frame of doc.querySelectorAll('iframe')) if (frame.contentDocument) inspect(frame.contentDocument);
  }
  inspect(document);
  return [...renderers].join(' / ');
})()`;

const browser = jobs.some((job) => job.renderer !== 'gpu') ? await launch({ width: w, height: h }) : null;
const failures = [];
let fontWarn = 0;

async function openPage(runner, url, vw, vh) {
  const page = await runner.newPage();
  await page.viewport(vw, vh);
  const errors = [];
  page.on('Runtime.exceptionThrown', (p) => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  page.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error') errors.push(p.args.map((a) => a.value ?? a.description).join(' ')); });
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: "addEventListener('motion:ready', (e) => { window.__smokeReady = e.detail; });" });
  await page.goto(url, 45000);
  const hasMotion = await page.eval('new Promise(r => { let n = 0; const iv = setInterval(() => { if (window.__motion || ++n > 150) { clearInterval(iv); r(!!window.__motion); } }, 100); })', 25000);
  if (hasMotion) await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 60000);
  return { page, errors, hasMotion };
}

async function sweep(page, errors) {
  const D = await page.eval('window.__motion.duration');
  await page.eval(`(() => { const m = window.__motion; m.pause(); for (let t = 0; t <= ${D}; t += ${step}) m.seek(t); m.seek(${D}); return true; })()`, 60000);
  const t0 = await page.eval('(async () => { const m = window.__motion; await m.seek(0); await m.play(); return m.time; })()');
  await page.eval('new Promise(r => setTimeout(r, 1500))');
  const t1 = await page.eval('window.__motion.time');
  if (!(t1 > t0 + 0.5)) errors.push(`播放 1.5 秒后时间只从 ${t0} 走到 ${t1}`);
  await page.eval('window.__motion.pause()');
  return D;
}

async function fontCheck(page, orient, D, reference) {
  const marks = await page.eval('(window.__motion.markers || []).map(m => m.t)');
  const times = [...new Set([...marks, ...[0.1, 0.3, 0.5, 0.7, 0.9].map((k) => k * D), Math.max(0, D - 0.01)].map((t) => Math.round(Math.min(D, Math.max(0, t)) * 100) / 100))].sort((a, b) => a - b).slice(0, 16);
  const bad = new Map();
  let min = Infinity;
  for (const t of times) {
    await page.eval(`window.__motion.seek(${t})`, 30000);
    const list = await page.eval(reference ? REFERENCE_FONT_PROBE : FONT_PROBE, 30000);
    for (const f of list) {
      min = Math.min(min, f.px);
      if (f.px < MIN[orient] - 0.05) {
        const key = `${f.text}@${f.px}`;
        if (!bad.has(key)) bad.set(key, { ...f, t });
      }
    }
  }
  return { min, bad: [...bad.values()] };
}

try {
  for (const job of jobs) {
    const errors = [], notes = [];
    let legacy = false;
    let gpuBrowser;
    try {
      const runner = job.renderer === 'gpu'
        ? (gpuBrowser = await launch({ width: w, height: h, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] }))
        : browser;
      for (const [idx, orient] of ORIENTS.entries()) {
        const portrait = orient === 'portrait';
        const [vw, vh] = portrait ? [Math.min(w, h), Math.max(w, h)] : [Math.max(w, h), Math.min(w, h)];
        const u = new URL(job.url);
        u.searchParams.set('render', '1');
        u.searchParams.set('orient', orient);
        const { page, errors: errs, hasMotion } = await openPage(runner, u.href, vw, vh);
        try {
          if (job.renderer === 'gpu') {
            const renderer = await page.eval(GPU_PROBE);
            notes.push(`${orient} WebGL ${renderer || '未找到 WebGL canvas'}`);
            if (!renderer) throw new Error('需要 GPU，未找到 WebGL canvas');
            if (/swiftshader|llvmpipe|software|microsoft basic render/i.test(renderer)) throw new Error(`需要 GPU，当前为软件渲染：${renderer}`);
          }
          if (!hasMotion) { await page.eval('new Promise(r => setTimeout(r, 1500))'); notes.push('interactive'); errors.push(...errs); break; }
          const info = await page.eval('({ orients: window.__motion.orients || [], orient: window.__motion.orient || null, sound: !!window.__smokeReady?.sound, score: !!window.__motion.audio })');
          legacy = !info.orients.length;
          if (legacy) {
            const D = await sweep(page, errs);
            notes.push(`seek 0–${+D.toFixed(2)}s · 旧 Demo（未使用 stage()）：跳过画幅与字号检查${info.sound ? ' · 旧版音效' : ' · 无声音'}`);
            errors.push(...errs);
            break;
          }
          if (!info.orients.includes(orient)) { notes.push(`${orient}：Demo 不支持，跳过`); continue; }
          if (info.orient !== orient) errs.push(`?orient=${orient} 未生效（实际 ${info.orient}）`);
          const size = await page.eval('(() => { const r = window.__motion.stage.root; return [r.offsetWidth, r.offsetHeight, document.documentElement.dataset.orient]; })()');
          const want = portrait ? [1080, 1920] : [1920, 1080];
          if (size[0] !== want[0] || size[1] !== want[1] || size[2] !== orient) errs.push(`${orient} 舞台尺寸 ${size[0]}×${size[1]}（data-orient=${size[2]}），应为 ${want.join('×')}`);
          const D = await sweep(page, errs);
          const referenceFonts = job.fontFloor === 'reference';
          const fc = await fontCheck(page, orient, D, referenceFonts);
          if (fc.bad.length && !referenceFonts) {
            fontWarn++;
            const msg = `${orient} 字号 < ${MIN[orient]}px ${fc.bad.length} 处：` + fc.bad.slice(0, 4).map((b) => `「${b.text}」${b.px}px@${b.t}s`).join('，');
            if (strictFonts) errs.push(msg); else notes.push('⚠ ' + msg);
          }
          const fontNote = referenceFonts ? `字号沿用参考（最小 ${Number.isFinite(fc.min) ? fc.min + 'px' : '—'}）` : `最小字号 ${Number.isFinite(fc.min) ? fc.min + 'px' : '—'}`;
          notes.push(`${orient} seek 0–${+D.toFixed(2)}s · ${fontNote}${info.sound ? info.score ? ' · 乐谱' : ' · 即时音效' : ' · 无声音'}`);
          // 运行中切换画幅：时刻保持、舞台尺寸跟随
          if (idx === 0 && info.orients.length > 1) {
            const other = portrait ? 'landscape' : 'portrait';
            const r = await page.eval(`(async () => { const m = window.__motion; await m.seek(${(D * 0.5).toFixed(3)}); const t0 = m.time; await m.setOrient('${other}'); const a = [m.orient, m.stage.root.offsetWidth, m.stage.root.offsetHeight, m.time]; await m.setOrient('${orient}'); return { t0, a, back: m.orient, t1: m.time }; })()`, 30000);
            const ow = other === 'portrait' ? [1080, 1920] : [1920, 1080];
            if (r.a[0] !== other || r.a[1] !== ow[0] || r.a[2] !== ow[1]) errs.push(`运行中切换到 ${other} 失败：${JSON.stringify(r.a)}`);
            if (Math.abs(r.a[3] - r.t0) > 1e-6 || Math.abs(r.t1 - r.t0) > 1e-6 || r.back !== orient) errs.push(`切换画幅后时刻未保持：${r.t0} → ${r.a[3]} → ${r.t1}`);
          }
          errors.push(...errs);
        } finally {
          try { await page.send('Page.close'); } catch { /* 已关闭 */ }
        }
      }
    } catch (err) {
      errors.push(err.message);
    } finally {
      if (gpuBrowser) await gpuBrowser.close();
    }
    if (errors.length) failures.push({ id: job.id, errors });
    console.log(errors.length ? '✗' : '✓', job.id, notes.join(' | '), errors.length ? `\n    ${[...new Set(errors)].slice(0, 4).join('\n    ')}` : '');
  }
} finally {
  if (browser) await browser.close();
}
console.log(`smoke ${jobs.length - failures.length}/${jobs.length} passed${fontWarn ? ` · ${fontWarn} 项字号警告${strictFonts ? '' : '（未计为失败，--strict-fonts 时失败）'}` : ''}`);
if (failures.length) process.exit(1);
