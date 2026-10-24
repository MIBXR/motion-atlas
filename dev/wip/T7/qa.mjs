import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../../scripts/lib/cdp.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const out = path.join(root, 'dev/shots/T7');
const args = process.argv.slice(2);
const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : 'http://localhost:4325';
const scenes = [
  { id: 'S0', start: 0, end: 4 }, { id: 'S1', start: 4, end: 10 },
  { id: 'S2', start: 10, end: 24 }, { id: 'S3', start: 24, end: 36 },
  { id: 'S4', start: 36, end: 48 }, { id: 'S5', start: 48, end: 56 },
  { id: 'S6', start: 56, end: 60 }
];
const sizes = { landscape: [1920, 1080], portrait: [1080, 1920] };
const rel = file => path.relative(root, file).split(path.sep).join('/');
const json = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
const shotName = (orient, scene, t) => `${orient}-${scene}-${t.toFixed(3)}.png`;
const result = {
  startedAt: new Date().toISOString(), url: `${base}/demos/cases/industrial-protocol/index.html`,
  complete: false, ok: false, orientations: {}, screenshots: [], compare: [], contactSheets: [],
  console: [], exceptions: [], failures: [], visualReview: 'pending'
};
if (args.includes('--resume')) {
  const prior = JSON.parse(fs.readFileSync(path.join(out, 'qa.json'), 'utf8'));
  result.screenshots = prior.screenshots.filter(item => fs.existsSync(path.join(root, item.path)));
  result.reusedScreenshots = result.screenshots.map(item => item.path);
}
for (const name of ['shots', 'compare', 'render']) fs.mkdirSync(path.join(out, name), { recursive: true });
const browser = await launch({ width: 1920, height: 1080, args: ['--no-proxy-server'] });
result.browser = browser.exe;

function listen(page, context) {
  page.on('Runtime.consoleAPICalled', event => result.console.push({
    context, type: event.type,
    text: event.args.map(a => a.value ?? a.description ?? a.type).join(' ').slice(0, 4000)
  }));
  page.on('Runtime.exceptionThrown', event => result.exceptions.push({
    context, text: event.exceptionDetails?.exception?.description || event.exceptionDetails?.text
  }));
}

async function open(orient, reduced = false) {
  const page = await browser.newPage();
  listen(page, `${orient}:${reduced ? 'reduced' : 'normal'}`);
  await page.viewport(...sizes[orient], 1);
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
  await page.send('Page.addScriptToEvaluateOnNewDocument', {
    source: "addEventListener('motion:ready', e => { window.__qaReady = e.detail; });"
  });
  const url = new URL(result.url);
  url.searchParams.set('render', '1'); url.searchParams.set('embed', '1'); url.searchParams.set('orient', orient);
  await page.goto(url.href, 60000);
  await page.waitFor('window.__motion && typeof window.__motion.seek === "function"', 45000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => { window.__motion.pause(); return true; })', 60000);
  await page.waitFor('window.__qaReady', 10000);
  return page;
}

async function seek(page, t) {
  await page.send('Page.bringToFront');
  await page.eval(`(async () => {
    window.__motion.pause(); await window.__motion.seek(${t});
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return window.__motion.time;
  })()`);
}

async function readyInfo(page) {
  return page.eval(`(() => {
    const m = window.__motion, st = m.stage;
    return {
      ready: window.__qaReady, duration: m.duration, orient: m.orient, orients: m.orients,
      stage: { width: st.root.offsetWidth, height: st.root.offsetHeight, scale: st.scale },
      hasAudio: !!m.audio, progress: m.progress,
      fonts: {
        status: document.fonts.status,
        checks: CONFIG.fontSpecs.map(spec => ({ spec, loaded: document.fonts.check(spec, 'ENDFIELD 集成工业协议管理员配件机') })),
        faces: [...document.fonts].map(f => ({ family: f.family, weight: f.weight, style: f.style, status: f.status }))
      }
    };
  })()`);
}

async function capture(page, orient, scene, t) {
  const existing = result.screenshots.find(item => item.orient === orient && item.scene === scene && item.t === t);
  if (existing) return existing;
  const file = path.join(out, 'shots', shotName(orient, scene, t));
  await seek(page, t);
  const bytes = await page.screenshot(file);
  const item = { orient, scene, t, path: rel(file), bytes: bytes.length };
  if (orient === 'portrait' && scene === 'S3' && t === 30) {
    item.pixelFeedback = await page.eval(`(async () => {
      const image = new Image(); image.src = ${JSON.stringify('data:image/png;base64,' + bytes.toString('base64'))}; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let delta = 0, exact = 0, samples = 0;
      for (let y = 0; y < 900; y += 4) for (let x = 0; x < canvas.width; x += 8) {
        const a = (y * canvas.width + x) * 4, b = ((y + 953) * canvas.width + x) * 4;
        const d = Math.abs(pixels[a] - pixels[b]) + Math.abs(pixels[a + 1] - pixels[b + 1]) + Math.abs(pixels[a + 2] - pixels[b + 2]);
        delta += d; exact += d === 0 ? 1 : 0; samples++;
      }
      const meanRGBAbsoluteDelta = delta / (samples * 3), exactPixelFraction = exact / samples;
      return { offset: 953, samples, meanRGBAbsoluteDelta, exactPixelFraction, pass: !(meanRGBAbsoluteDelta <= 1 && exactPixelFraction >= 0.99) };
    })()`);
    if (!item.pixelFeedback.pass) result.failures.push('portrait-S3-30.000.png出现953px重复分块');
  }
  result.screenshots.push(item);
  return item;
}

async function state(page) {
  return page.eval(`(() => ({
    t: window.__motion.time,
    stageDOM: window.__motion.stage.root.outerHTML,
    worldDOM: document.querySelector('#world').outerHTML,
    canvases: [...document.querySelectorAll('#world canvas')].map(c => ({ id: c.id, width: c.width, height: c.height, data: c.toDataURL('image/png') }))
  }))()`);
}

async function deterministic(page, orient, via = 44) {
  await seek(page, 12);
  const before = await state(page);
  const variant = via === 44 ? '' : `-via-${via.toFixed(3)}`;
  const aFile = path.join(out, 'shots', `${orient}-determinism${variant}-a-12.000.png`);
  const a = await page.screenshot(aFile);
  await seek(page, via);
  await seek(page, 12);
  const after = await state(page);
  const bFile = path.join(out, 'shots', `${orient}-determinism${variant}-b-12.000.png`);
  const b = await page.screenshot(bFile);
  const summary = data => ({
    t: data.t, stageDOMCharacters: data.stageDOM.length, worldDOMCharacters: data.worldDOM.length,
    canvases: data.canvases.map(({ data: pixels, ...info }) => ({ ...info, encodedCharacters: pixels.length }))
  });
  const check = {
    sequence: [12, via, 12], before: summary(before), after: summary(after),
    screenshots: [rel(aFile), rel(bFile)], pngBytes: [a.length, b.length], pngEqual: a.equals(b),
    canvasEqual: JSON.stringify(before.canvases) === JSON.stringify(after.canvases),
    stageDOMEqual: before.stageDOM === after.stageDOM, worldDOMEqual: before.worldDOM === after.worldDOM
  };
  if (!check.pngEqual || !check.canvasEqual || !check.worldDOMEqual || !check.stageDOMEqual) result.failures.push(`${orient}: 12→${via}→12截图、stage/world DOM或canvas不确定`);
  return check;
}

async function switchOrient(page, orient) {
  const other = orient === 'landscape' ? 'portrait' : 'landscape';
  const change = await page.eval(`(async () => {
    const m = window.__motion; m.pause(); await m.seek(32);
    const read = () => ({ t: m.time, orient: m.orient, width: m.stage.root.offsetWidth, height: m.stage.root.offsetHeight });
    const before = read(); await m.setOrient('${other}'); const middle = read();
    await m.setOrient('${orient}'); return { before, middle, after: read() };
  })()`);
  change.pass = change.before.t === change.middle.t && change.before.t === change.after.t
    && change.middle.orient === other && change.after.orient === orient
    && change.middle.width === sizes[other][0] && change.middle.height === sizes[other][1];
  if (!change.pass) result.failures.push(`${orient}: setOrient未保持时刻或舞台尺寸`);
  return change;
}

async function motionStyle(page, t) {
  await seek(page, t);
  return page.eval(`(() => {
    const world = document.querySelector('#world'), wipe = document.querySelector('#wipe');
    const w = getComputedStyle(world), s = getComputedStyle(wipe), r = wipe.getBoundingClientRect();
    return {
      t: window.__motion.time, media: matchMedia('(prefers-reduced-motion: reduce)').matches,
      world: { transform: w.transform, opacity: w.opacity },
      wipe: { display: s.display, transform: s.transform, opacity: s.opacity, width: s.width, height: s.height, box: { x: r.x, y: r.y, width: r.width, height: r.height } }
    };
  })()`);
}

async function reducedMotion(normal, orient) {
  const page = await open(orient, true);
  const checks = [];
  for (const t of [3.7, 5, 57]) {
    const normalStyle = await motionStyle(normal, t), reducedStyle = await motionStyle(page, t);
    const file = path.join(out, 'shots', `${orient}-reduced-${t.toFixed(3)}.png`);
    await page.screenshot(file);
    checks.push({ t, normal: normalStyle, reduced: reducedStyle, screenshot: rel(file) });
  }
  const pass = checks.every(c => c.reduced.media && c.reduced.world.transform === 'matrix(1, 0, 0, 1, 0, 0)')
    && checks[0].reduced.wipe.transform === 'none' && checks[0].reduced.wipe.display !== 'none'
    && checks[0].normal.wipe.transform !== checks[0].reduced.wipe.transform
    && checks[1].normal.world.transform !== checks[1].reduced.world.transform
    && checks[2].normal.world.transform !== checks[2].reduced.world.transform;
  await page.send('Page.close');
  if (!pass) result.failures.push(`${orient}: reduced-motion镜头/斜带替换未通过`);
  return { pass, checks };
}

async function audio(page) {
  const data = await page.eval('window.__motion.audio.renderWav({ from: 0, to: 60, sampleRate: 48000 })', 300000);
  const { base64, ...metrics } = data;
  const file = path.join(out, 'render/industrial-protocol.wav');
  const bytes = Buffer.from(base64, 'base64');
  fs.writeFileSync(file, bytes);
  const info = {
    ...metrics, path: rel(file), bytes: bytes.length,
    pass: metrics.duration === 60 && metrics.sampleRate === 48000 && metrics.channels === 2
      && metrics.clipped === 0 && metrics.peakDb <= -1
  };
  json(path.join(out, 'render/audio-metrics.json'), info);
  if (!info.pass) result.failures.push(`音频不符合要求: peak=${metrics.peakDb}dBFS clipped=${metrics.clipped} duration=${metrics.duration}`);
  return info;
}

const imageURL = file => `data:image/${/\.jpe?g$/i.test(file) ? 'jpeg' : 'png'};base64,${fs.readFileSync(file).toString('base64')}`;
const htmlEscape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
async function sheet(file, title, rows, cellWidth, rowHeights) {
  const page = await browser.newPage();
  const width = cellWidth * rows[0].length;
  const height = 54 + rowHeights.reduce((n, h) => n + h + 36, 0);
  await page.viewport(width, height, 1);
  const body = rows.map((row, i) => `<section style="display:grid;grid-template-columns:repeat(${row.length},${cellWidth}px)">${row.map(item => `<figure style="margin:0"><figcaption style="height:36px;padding:8px 12px;box-sizing:border-box;font-size:16px">${htmlEscape(item.label)}</figcaption><div style="width:${cellWidth}px;height:${rowHeights[i]}px;display:flex;align-items:center;justify-content:center;background:#17191b"><img src="${imageURL(item.file)}" style="width:100%;height:100%;object-fit:contain;display:block"></div></figure>`).join('')}</section>`).join('');
  await page.eval(`(async () => {
    document.documentElement.style.cssText = 'margin:0;padding:0;background:#0b0c0d';
    document.body.style.cssText = 'margin:0;padding:0;color:#f7f7f5;font:16px Arial,sans-serif';
    document.body.innerHTML = ${JSON.stringify(`<header style="height:54px;padding:14px 12px;box-sizing:border-box;font-size:20px">${htmlEscape(title)}</header>${body}`)};
    await Promise.all([...document.images].map(img => img.decode()));
    return true;
  })()`);
  await page.screenshot(file);
  await page.send('Page.close');
  return { path: rel(file), width, height };
}

async function comparisons() {
  const refRoot = path.resolve(root, '../../dev/shots/T7/refs');
  const screenshot = (scene, t) => path.join(out, 'shots', shotName('landscape', scene, t));
  for (const { name, scene, times, reference } of [
    { name: 'S2-blueprint', scene: 'S2', times: [12, 16, 20], reference: 'frames/03/000043.350.jpg' },
    { name: 'S3-machine-panel', scene: 'S3', times: [29], reference: 'frames/03/000045.583.jpg' },
    { name: 'S4-operator', scene: 'S4', times: [44], reference: 'sheets/01-02.jpg' }
  ]) {
    const rows = times.map(t => [
      { file: path.join(refRoot, reference), label: `官方本地参考 · ${reference}` },
      { file: screenshot(scene, t), label: `案例横屏 · ${scene} · ${t.toFixed(3)}s` }
    ]);
    result.compare.push(await sheet(path.join(out, 'compare', `${name}.png`), `${name} · 左：参考 / 右：自绘复刻`, rows, 960, rows.map(() => 540)));
  }
  for (const scene of scenes) {
    const times = [scene.start + 0.5, (scene.start + scene.end) / 2, scene.end - 0.3];
    const rows = ['landscape', 'portrait'].map(orient => times.map(t => ({
      file: path.join(out, 'shots', shotName(orient, scene.id, t)), label: `${orient} · ${scene.id} · ${t.toFixed(3)}s`
    })));
    result.contactSheets.push(await sheet(path.join(out, 'compare', `${scene.id}-contact.png`), `${scene.id} · 六帧导航（逐张验收使用原图）`, rows, 480, [270, 480]));
  }
}

try {
  for (const orient of ['landscape', 'portrait']) {
    const page = await open(orient);
    const info = await readyInfo(page);
    result.orientations[orient] = { info };
    if (info.duration !== 60 || info.ready.sound !== true || !info.hasAudio) result.failures.push(`${orient}: duration/sound/audio接口异常`);
    if (info.orient !== orient || info.stage.width !== sizes[orient][0] || info.stage.height !== sizes[orient][1]) result.failures.push(`${orient}: 初始化舞台尺寸不符`);
    if (info.fonts.status !== 'loaded' || info.fonts.checks.some(f => !f.loaded)) result.failures.push(`${orient}: 字体尚未完整加载`);
    for (const scene of scenes) {
      for (const t of [scene.start + 0.5, (scene.start + scene.end) / 2, scene.end - 0.3]) await capture(page, orient, scene.id, t);
    }
    for (const t of orient === 'landscape' ? [12, 16, 20, 29, 44, 52, 54] : [52, 54]) {
      const scene = scenes.find(s => t >= s.start && t < s.end);
      if (!result.screenshots.some(s => s.orient === orient && s.t === t)) await capture(page, orient, scene.id, t);
    }
    result.orientations[orient].determinism = await deterministic(page, orient);
    result.orientations[orient].additionalDeterminism = [];
    for (const via of [29, 36.2]) result.orientations[orient].additionalDeterminism.push(await deterministic(page, orient, via));
    result.orientations[orient].setOrient = await switchOrient(page, orient);
    result.orientations[orient].reducedMotion = await reducedMotion(page, orient);
    if (orient === 'landscape') {
      if (args.includes('--reuse-audio')) {
        const metrics = JSON.parse(fs.readFileSync(path.join(out, 'render/audio-metrics.json'), 'utf8'));
        if (!metrics.pass || fs.statSync(path.join(root, metrics.path)).size !== metrics.bytes) throw new Error('可复用音频证据或WAV缺失');
        result.audio = { ...metrics, reused: true };
      } else result.audio = await audio(page);
    }
    await page.send('Page.close');
    console.log(`${orient}: screenshots and protocol checks complete`);
  }
  await comparisons();
  result.complete = true;
} catch (error) {
  result.failures.push(error.stack || error.message);
} finally {
  result.finishedAt = new Date().toISOString();
  const consoleErrors = result.console.filter(event => event.type === 'error');
  if (consoleErrors.length) result.failures.push(`console.error ${consoleErrors.length}项`);
  if (result.exceptions.length) result.failures.push(`Runtime.exceptionThrown ${result.exceptions.length}项`);
  result.ok = result.complete && result.failures.length === 0;
  json(path.join(out, 'qa.json'), result);
  await browser.close();
}
console.log(JSON.stringify({ complete: result.complete, ok: result.ok, screenshots: result.screenshots.length, compare: result.compare.length, contactSheets: result.contactSheets.length, audio: result.audio, failures: result.failures, result: rel(path.join(out, 'qa.json')) }, null, 2));
if (!result.ok) process.exitCode = 1;
