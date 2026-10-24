import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from '../../../scripts/lib/cdp.mjs';

const args = process.argv.slice(2);
const refreshFilmOnly = args.includes('--refresh-film-only');
const alignedProbe = args.includes('--aligned-probe');
const ssaoProbe = args.includes('--ssao-probe');
const clockAligned = alignedProbe || args.includes('--clock-aligned');
const get = (key, fallback) => args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const reference = path.resolve(repo, '../../dev/shots/T5/reference-runtime');
const output = path.resolve(repo, get('--out', alignedProbe ? 'dev/shots/T5r/parity-aligned-probe' : clockAligned ? 'dev/shots/T5r/parity-aligned' : 'dev/shots/T5r/parity'));
const base = get('--base', 'http://localhost:4323').replace(/\/$/, '');
const A = Number(get('--a', 35));
const B = A + 27.6, duration = A + 42.6;
const times = args.includes('--random-only') ? [] : ssaoProbe ? [22.5] : alignedProbe ? [2, 6, 14] : [2, 6, 10, 14, 18, 22.5, 33, 36, 40, 44, 50, 55, 59, 64.1, 67.1, 72.1, 75.6];
const orientations = get('--orient', 'both') === 'both'
  ? ['landscape', 'portrait'] : [get('--orient')];
if (!orientations.every((value) => ['landscape', 'portrait'].includes(value))) {
  throw new Error('--orient must be both, landscape, or portrait');
}
const shown = (file) => path.relative(repo, file).replaceAll('\\', '/');
const sequenceSource = refreshFilmOnly ? null : fs.readFileSync(path.join(repo, 'vendor/rhinelabui/film/sequence.js'), 'utf8')
  .replace(/^export\s+(?=function\b)/gm, '');
const clockSource = clockAligned ? fs.readFileSync(path.join(repo, 'vendor/rhinelabui/film/clock-shim.js'), 'utf8') : null;
const SSAO_INSTRUMENT = `(() => {
  const d = window.__ssaoDiagnostic = { kernels: [], textures: [], randomCalls: 0, randomGroups: [] };
  const recent = [], callCounts = {};
  let activeGroup;
  function wrapRandom(fn) { return function(...args) {
    const value = fn.apply(this, args), stack = new Error().stack;
    const index = ++d.randomCalls;
    const origin = stack.split('\\n').slice(2, 7).join('\\n');
    const type = stack.includes('_generateSampleKernel') ? 'kernel' : stack.includes('_generateRandomKernelRotations') ? 'noise' : null;
    if (type && activeGroup?.type !== type) {
      activeGroup = { type, firstIndex: index, frame: window.__clock?.frame, stack, priorCalls: recent.slice(), priorCallCounts: { ...callCounts }, values: [] };
      d.randomGroups.push(activeGroup);
    }
    if (type) activeGroup.values.push(value); else activeGroup = null;
    callCounts[origin] = (callCounts[origin] || 0) + 1;
    recent.push({ index, value, stack }); if (recent.length > 12) recent.shift();
    return value;
  }; }
  let random = wrapRandom(Math.random);
  Object.defineProperty(Math, 'random', { configurable: true, get: () => random, set: fn => { random = wrapRandom(fn); } });
  const locations = new WeakMap();
  const proto = WebGL2RenderingContext.prototype;
  for (const name of ['getUniformLocation', 'uniform3fv', 'texImage2D', 'texSubImage2D']) {
    const original = proto[name];
    proto[name] = function(...args) {
      if (name === 'getUniformLocation') { const loc = original.apply(this, args); if (loc) locations.set(loc, args[1]); return loc; }
      const d = window.__ssaoDiagnostic;
      if (name === 'uniform3fv' && /^kernel(?:\\[0\\])?$/.test(locations.get(args[0]) || '')) {
        const value = Array.from(args[1]);
        if (!d.kernels.some(k => JSON.stringify(k.value) === JSON.stringify(value))) d.kernels.push({ frame: window.__clock?.frame, canvasHost: this.canvas.parentElement?.id || this.canvas.parentElement?.className, value });
      }
      if (name === 'texImage2D' && args[3] === 4 && args[4] === 4 && ArrayBuffer.isView(args[8])) d.textures.push({ frame: window.__clock?.frame, format: args[6], type: args[7], canvasHost: this.canvas.parentElement?.id || this.canvas.parentElement?.className, value: Array.from(args[8]) });
      if (name === 'texSubImage2D' && args[4] === 4 && args[5] === 4 && ArrayBuffer.isView(args[8])) d.textures.push({ frame: window.__clock?.frame, format: args[6], type: args[7], canvasHost: this.canvas.parentElement?.id || this.canvas.parentElement?.className, value: Array.from(args[8]) });
      return original.apply(this, args);
    };
  }
})()`;
const ALIGNMENT = `(() => {
  const win = window.__motion ? document.querySelector('iframe').contentWindow : window;
  return { frame: win.__clock.frame, now: win.__clock.now,
    performanceNow: win.performance.now(), dateNow: win.Date.now(),
    focus: { tag: win.document.activeElement?.tagName, id: win.document.activeElement?.id,
      focusVisible: win.document.activeElement?.matches(':focus-visible') },
    animations: win.document.getAnimations().map(a => ({
      state: a.playState, currentTime: a.currentTime,
      target: { tag: a.effect?.target?.tagName, id: a.effect?.target?.id,
        class: typeof a.effect?.target?.className === 'string' ? a.effect.target.className : a.effect?.target?.className?.baseVal },
    })) };
})()`;
function findFfmpeg() {
  const candidates = [process.env.FFMPEG_PATH, 'ffmpeg'].filter(Boolean);
  const local = process.env.LOCALAPPDATA;
  if (process.platform === 'win32' && local) {
    candidates.push(path.join(local, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'));
    const packages = path.join(local, 'Microsoft', 'WinGet', 'Packages');
    if (fs.existsSync(packages)) {
      for (const name of fs.readdirSync(packages).filter((value) => /ffmpeg/i.test(value))) {
        for (const sub of fs.readdirSync(path.join(packages, name))) {
          candidates.push(path.join(packages, name, sub, 'bin', 'ffmpeg.exe'));
        }
      }
    }
  }
  return candidates.find((candidate) => spawnSync(candidate, ['-version'], { stdio: 'ignore' }).status === 0);
}
const ffmpeg = findFfmpeg();
if (!ffmpeg) throw new Error('FFmpeg was not found through FFMPEG_PATH, PATH, or WinGet');
function encode(command) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...command], { maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr?.toString() || String(result.error));
  return result.stdout;
}
function thumbnail(file) {
  const rgb = encode(['-i', file, '-vf', 'scale=64:36:flags=area', '-frames:v', '1', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1']);
  if (rgb.length !== 64 * 36 * 3) throw new Error(`Unexpected thumbnail length for ${file}: ${rgb.length}`);
  return rgb;
}
function difference(left, right) {
  let total = 0;
  for (let index = 0; index < left.length; index++) total += Math.abs(left[index] - right[index]);
  return total / left.length;
}
const OBSERVE = `(() => {
  const win = window.__motion ? document.querySelector('iframe').contentWindow : window;
  const doc = win.document, s = win.__filmApp?.stats() ?? win.rhine.stats();
  const viewer = doc.querySelector('.model-viewer');
  const viewerOpen = s.viewerOpen ?? Boolean(viewer && !viewer.hidden);
  const viewerState = viewerOpen ? JSON.parse(viewer.dataset.stats || '{}') : null;
  return {
    elapsed: window.__parityStarted === undefined ? null : (performance.now() - window.__parityStarted) / 1000,
    state: {
      mode: doc.querySelector('#stage').dataset.mode,
      selected: s.selected,
      tab: doc.querySelector('.detail-tabs [aria-selected="true"]')?.dataset.tab ?? null,
      viewerOpen,
      viewer: viewerState,
      viewerLifecycle: viewerOpen ? viewer.dataset.transition : null,
      viewerExploded: viewerOpen ? viewer.dataset.exploded : null,
      boot: doc.querySelector('#stage').dataset.boot,
      bootTime: s.bootTime,
      modelPosition: s.modelPosition,
      cameraPosition: s.cameraPosition,
      selectedCell: s.selectedCell,
      decryption: s.decryption,
      cameraDetail: s.cameraDetail,
      extraction: s.extraction,
      fps: s.fps,
      column: doc.querySelector('#column-index').textContent,
      row: doc.querySelector('#selected-number').textContent,
    },
  };
})()`;
const RENDERER = `(() => {
  const doc = window.__motion ? document.querySelector('iframe').contentDocument : document;
  const canvas = doc.querySelector('#three-scene canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
})()`;
function logical(state) {
  return {
    mode: state.mode, selected: state.selected, tab: state.mode === 'detail' ? state.tab : null,
    viewerOpen: state.viewerOpen, viewerLifecycle: state.viewerLifecycle,
    viewerExploded: state.viewerExploded,
    viewer: state.viewerOpen ? {
      ready: state.viewer.ready,
      targetClarity: state.viewer.targetClarity,
      target: state.viewer.target,
      resetting: state.viewer.resetting,
      parts: state.viewer.parts?.map(({ id, meshes }) => ({ id, meshes })),
    } : null,
  };
}
function requireHardware(renderer) {
  if (/swiftshader|software|llvmpipe|microsoft basic render/i.test(renderer)) {
    throw new Error(`Parity requires a hardware renderer; received ${renderer}`);
  }
}
function collectErrors(page, errors) {
  page.on('Runtime.exceptionThrown', (event) => errors.push(
    event.exceptionDetails?.exception?.description || event.exceptionDetails?.text,
  ));
  page.on('Runtime.consoleAPICalled', (event) => {
    if (event.type === 'error') errors.push(event.args.map((arg) => arg.value ?? arg.description).join(' '));
  });
}
async function clickOriginal(page, selector) {
  const point = await page.eval(`(() => {
    const button = document.querySelector(${JSON.stringify(selector)});
    if (!button || button.disabled) throw new Error('Original button unavailable: ' + ${JSON.stringify(selector)});
    const r = button.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
}
async function nativeSurface(page, width, height) {
  await page.send('Emulation.clearDeviceMetricsOverride');
  const client = await page.eval('({ width: innerWidth, height: innerHeight })');
  const { windowId, bounds } = await page.send('Browser.getWindowForTarget');
  const inset = { width: bounds.width - client.width, height: bounds.height - client.height };
  await page.send('Browser.setWindowBounds', { windowId, bounds: {
    windowState: 'normal', width: width + inset.width, height: height + inset.height,
  } });
  await page.viewport(width, height);
  await page.send('Emulation.setVisibleSize', { width, height });
  return { windowId, bounds, client, inset, target: [width, height] };
}

fs.mkdirSync(output, { recursive: true });
const resultPath = path.join(output, 'results.json');
const report = refreshFilmOnly ? JSON.parse(fs.readFileSync(resultPath, 'utf8')) : {
  startedAt: new Date().toISOString(),
  reference: { path: reference, url: 'http://127.0.0.1:4331/', readOnly: true },
  base, A, B, duration, quality: 'original', times,
  comparison: { order: 'reference left / film right', thumbnail: '64x36 RGB, FFmpeg area filter',
    sampling: 'Reference uses native realtime timers after same-document public-API/GPU warmup; nearest native RAF states and actual PNG screencast timestamps are recorded.' },
  orientations: [], failures: [], status: 'running',
};
if (clockAligned && !refreshFilmOnly) report.clockAlignment = {
  referenceStartFrame: -37, preparatorySteps: 37,
  bootstrap: 'Original entry and real click; 36 steps remove its original 600ms loading layer; original rhine.seek(-1/60), then one step renders internal time zero at shared clock frame zero. No archive/detail/viewer warmup or replay.',
  clockFile: 'vendor/rhinelabui/film/clock-shim.js', injectedBytesUnchanged: true,
  filmClockCopyEqual: fs.readFileSync(path.join(repo, 'demos/cases/archive-os/app/film/clock-shim.js')).equals(Buffer.from(clockSource)),
  seed: '0x5EED', randomStateObservation: 'No RNG values are sampled; compare actual pixels and Web Animations state without consuming the random stream.',
};
if (clockAligned && !refreshFilmOnly) report.comparison.sampling = 'Readonly original entry and click, then negative-37-frame startup preparation and public rhine.seek alignment at frame zero; both applications advance on the identical injected clock and random seed. Captures are taken while the virtual clock is frozen at each exact target frame.';
if (refreshFilmOnly) {
  report.status = 'refreshing-film';
  report.failures = [];
  report.visualReview = 'pending';
  report.filmRefresh = { startedAt: new Date().toISOString(), mode: 'film-only', base, orientations,
    referenceImagesReused: true, referenceServerStarted: false };
  report.referenceFrameStateNote = 'Reference PNGs and their native capture metadata are reused unchanged. Saved reference DOM/model state is paired to the nearest native RAF and is not guaranteed to describe the exact displayed compositor frame. In particular, landscape F72.1 visibly shows an outgoing X-006 while the saved logical selected state is X-005. logicalDOMEqual is not a visible-text or pixel-parity verdict.';
}
const save = () => fs.writeFileSync(resultPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
let browser, server;
try {
  if (!refreshFilmOnly) {
    const { createServer, build, preview } = await import(pathToFileURL(path.join(reference, 'node_modules/vite/dist/node/index.js')));
    const hasNovecento = ['Normal', 'DemiBold', 'Bold'].every((weight) =>
      fs.existsSync(path.join(reference, `public/fonts/novecento/webFonts/NovecentoSansWide${weight}/font.woff2`)),
    );
    if (args.includes('--reference-production')) {
      const outDir = path.join(output, 'reference-production');
      await build({ root: reference, configFile: false, logLevel: 'error', cacheDir: path.join(output, 'reference-vite-cache'),
        publicDir: false, base: './', define: { __RHINE_MODELS__: '{}', __RHINE_NOVECENTO__: JSON.stringify(hasNovecento) },
        build: { outDir, emptyOutDir: false },
      });
      const instance = await preview({ root: reference, configFile: false, build: { outDir },
        preview: { host: '127.0.0.1', port: 4331, strictPort: true }, plugins: [{ name: 'readonly-public-assets', configurePreviewServer(s) {
          s.middlewares.use((req, res, next) => {
            const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
            const source = path.join(reference, 'public', pathname);
            if (!fs.existsSync(source) || !fs.statSync(source).isFile()) return next();
            const types = { '.json': 'application/json', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
            res.setHeader('Content-Type', types[path.extname(source)] || 'application/octet-stream');
            fs.createReadStream(source).pipe(res);
          });
        } }],
      });
      server = { close: () => new Promise((resolve, reject) => instance.httpServer.close(error => error ? reject(error) : resolve())) };
      report.reference.productionBuild = { sourceUnchanged: true, outDir: shown(outDir), publicResourcesReadOnlyFallback: true };
    } else {
    server = await createServer({
      root: reference, configFile: false,
      cacheDir: path.join(output, 'reference-vite-cache'),
      define: { __RHINE_MODELS__: '{}', __RHINE_NOVECENTO__: JSON.stringify(hasNovecento) },
      server: { host: '127.0.0.1', port: 4331, strictPort: true },
    });
    await server.listen();
    }
  }
  browser = await launch({ width: 1920, height: 1080,
    args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--no-proxy-server'] });
  report.browser = browser.exe;
  for (const orient of orientations) {
    const [width, height] = orient === 'portrait' ? [1080, 1920] : [1920, 1080];
    const data = refreshFilmOnly ? report.orientations.find((item) => item.orient === orient)
      : { orient, viewport: [width, height], referenceErrors: [], filmErrors: [], samples: [] };
    if (!data) throw new Error(`No saved reference capture for ${orient}`);
    if (!refreshFilmOnly) report.orientations.push(data);
    if (refreshFilmOnly) {
      data.filmErrors = [];
      for (const sample of data.samples) {
        if (!fs.existsSync(path.resolve(repo, sample.reference.image))) throw new Error(`Missing saved reference PNG: ${sample.reference.image}`);
        sample.film = null;
        delete sample.comparison;
        delete sample.logicalDOMEqual;
        if (Math.abs(sample.reference.observationOffsetMs) >= 1000) report.failures.push(`${orient} F=${sample.target}: saved reference frame offset exceeds one second`);
      }
      if (data.referenceTrace.visibility.some((item) => item.hidden)) report.failures.push(`${orient}: saved reference capture became hidden`);
      save();
    }
    if (!refreshFilmOnly) {
    const refPage = await browser.newPage();
    try {
      await refPage.viewport(width, height);
      await refPage.send('Emulation.setVisibleSize', { width, height });
      await refPage.send('Page.bringToFront');
      collectErrors(refPage, data.referenceErrors);
      if (clockAligned) {
        await refPage.send('Page.addScriptToEvaluateOnNewDocument', { source:
          `window.__filmClockRequested = true; window.__filmClockStartFrame = -37;\n${clockSource}\n${ssaoProbe ? SSAO_INSTRUMENT : ''}` });
        await refPage.goto('http://127.0.0.1:4331/?quality=original', 60000);
        await refPage.waitFor('window.rhine?.stats().ready && document.querySelector(".entry-start")?.disabled === false', 60000);
        data.referencePreparation = { beforeClick: await refPage.eval(ALIGNMENT) };
        if (data.referencePreparation.beforeClick.frame !== -37) throw new Error('Reference test clock did not start at frame -37');
        await refPage.eval(`(async () => {
          const content = ${args.includes('--reference-production') ? fs.readFileSync(path.join(reference, 'content/archives.json'), 'utf8') : "await fetch('/content/archives.json').then(r => r.json())"};
          await Promise.all([300, 400, 600, 700].map(w => document.fonts.load(w + ' 20px MiSans', document.body.textContent + JSON.stringify(content.records))));
          await document.fonts.ready;
          await Promise.all(['archive-cassette', 'archive-assembly'].map(name => fetch('/assets/' + name + '.glb').then(r => r.arrayBuffer())));
        })()`);
        await clickOriginal(refPage, '.entry-start');
        await refPage.waitFor('window.rhine.stats().startup === "started"', 60000);
        await refPage.eval(`(async () => {
          while (window.__clock.frame < -1) { window.__clock.step(); await Promise.resolve(); await Promise.resolve(); }
        })()`);
        data.referencePreparation.beforeZero = await refPage.eval(`({ alignment: ${ALIGNMENT}, loadingPresent: !!document.querySelector('#loading'), state: ${OBSERVE} })`);
        await refPage.eval('window.rhine.seek(-1/60); window.__clock.step();');
        data.referencePreparation.zero = await refPage.eval(`({ alignment: ${ALIGNMENT}, loadingPresent: !!document.querySelector('#loading'), state: ${OBSERVE} })`);
        const zero = data.referencePreparation.zero;
        if (zero.alignment.frame !== 0 || zero.alignment.now !== 0 || zero.loadingPresent || Math.abs(zero.state.state.bootTime - 5) > 1e-8) {
          throw new Error('Original F0 did not align at the first white opening frame');
        }
        await refPage.eval(`(() => { ${sequenceSource}\nwindow.__paritySequence = createSequence(window, ${A}); })()`);
        data.referenceRenderer = await refPage.eval(RENDERER);
        requireHardware(data.referenceRenderer);
        for (const target of times) {
          const targetFrame = Math.round(target * 60);
          while (await refPage.eval('window.__clock.frame') < targetFrame) {
            await refPage.eval(`(async () => {
              const until = Math.min(${targetFrame}, window.__clock.frame + 30);
              while (window.__clock.frame < until) await window.__paritySequence.step();
            })()`, 60000);
            await refPage.waitFor(`(() => {
              const viewer = document.querySelector('.model-viewer');
              return !viewer || viewer.hidden || JSON.parse(viewer.dataset.stats || '{}').ready === true;
            })()`, 60000);
          }
          const observed = await refPage.eval(OBSERVE);
          const alignment = await refPage.eval(ALIGNMENT);
          const file = path.join(output, `${orient}-${target}-reference.png`);
          await refPage.screenshot(file);
          data.samples.push({ target, reference: { image: shown(file), elapsed: alignment.now / 1000,
            observationOffsetMs: alignment.now - target * 1000, state: observed.state, alignment } });
          save();
          console.log(`${orient} aligned reference F=${target}: frame ${alignment.frame}`);
        }
        data.referenceActions = await refPage.eval('window.__paritySequence.log');
        if (ssaoProbe) data.referenceGPU = await refPage.eval('window.__ssaoDiagnostic');
      } else {
      await refPage.goto('http://127.0.0.1:4331/?scene=archive', 60000);
      await refPage.waitFor('window.rhine?.stats().ready && !document.querySelector("#loading")', 60000);
      await refPage.eval('document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))');
      data.referenceRenderer = await refPage.eval(RENDERER);
      requireHardware(data.referenceRenderer);
      if (args.includes('--probe')) {
        const surface = await nativeSurface(refPage, width, height);
        const frames = [];
        let phase = 'surface-stabilizing';
        refPage.on('Page.screencastFrame', (event) => {
          void refPage.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch((error) => {
            if (refPage.ws.readyState === 1) data.referenceErrors.push(String(error));
          });
          const png = Buffer.from(event.data.slice(0, 44), 'base64');
          frames.push({ phase, width: png.readUInt32BE(16), height: png.readUInt32BE(20), timestamp: event.metadata.timestamp });
        });
        await refPage.send('Page.startScreencast', { format: 'png', maxWidth: width, maxHeight: height, everyNthFrame: 1 });
        const surfaceDeadline = Date.now() + 10000;
        while (frames.length < 2 || frames.slice(-2).some((frame) => frame.width !== width || frame.height !== height)) {
          if (Date.now() > surfaceDeadline) throw new Error('Native surface did not stabilize at the required dimensions');
          await refPage.once('Page.screencastFrame', 10000);
        }
        phase = 'click-replay-resize';
        await clickOriginal(refPage, '[data-action="replay"]');
        await refPage.eval('new Promise(r => setTimeout(r, 700))');
        await refPage.viewport(width, height);
        await refPage.send('Browser.setWindowBounds', { windowId: surface.windowId, bounds: {
          width: width + surface.inset.width, height: height + surface.inset.height,
        } });
        await refPage.eval('new Promise(r => setTimeout(r, 700))');
        await refPage.send('Page.stopScreencast');
        await refPage.eval('window.rhine.archive()');
        await refPage.eval('new Promise(r => setTimeout(r, 4000))');
        const fpsBefore = await refPage.eval('window.rhine.stats()');
        await refPage.eval('new Promise(r => setTimeout(r, 4000))');
        const noStream = await refPage.eval('window.rhine.stats()');
        phase = 'continuous-png';
        await refPage.send('Page.startScreencast', { format: 'png', maxWidth: width, maxHeight: height, everyNthFrame: 1 });
        await refPage.eval('new Promise(r => setTimeout(r, 4000))');
        const withStream = await refPage.eval('window.rhine.stats()');
        await refPage.send('Page.stopScreencast');
        const bad = frames.filter((frame) => frame.phase !== 'surface-stabilizing' && (frame.width !== width || frame.height !== height));
        data.probe = { surface, frames, incorrectSurfaceFrames: bad.length,
          startupTransientFrames: frames.filter((frame) => frame.phase === 'surface-stabilizing' && (frame.width !== width || frame.height !== height)).length,
          fps: { before: fpsBefore.fps, noStream: noStream.fps, continuousPNG: withStream.fps },
          rendered: { noStream: noStream.renderedFrames - fpsBefore.renderedFrames,
            continuousPNG: withStream.renderedFrames - noStream.renderedFrames } };
        if (bad.length) report.failures.push(`${orient}: ${bad.length} probe PNG frames have incorrect dimensions`);
        save();
        console.log(JSON.stringify({ orient, probe: { surface, frames: frames.length, incorrectSurfaceFrames: bad.length, fps: data.probe.fps } }));
        continue;
      }
      await refPage.goto('http://127.0.0.1:4331/', 60000);
      await refPage.waitFor('window.rhine?.stats().ready && document.querySelector(".entry-start")?.disabled === false', 60000);
      await clickOriginal(refPage, '.entry-start');
      await refPage.waitFor('window.rhine.stats().startup === "started" && !document.querySelector("#loading")', 60000);
      const warmStarted = performance.now();
      console.log(`${orient} reference: same-document glyph / main / viewer GPU warmup`);
      data.referenceWarmup = { method: 'Original public select(1)/detail APIs and original viewer/replay buttons; native time throughout' };
      await refPage.eval(`(async () => {
        const content = await fetch('/content/archives.json').then(response => response.json());
        const text = document.body.textContent + JSON.stringify(content.records);
        await Promise.all([300, 400, 600, 700].map(weight => document.fonts.load(weight + ' 20px MiSans', text)));
        await document.fonts.ready;
        window.rhine.select(1);
        window.rhine.detail();
      })()`);
      await refPage.waitFor('window.rhine.stats().mode === "detail" && window.rhine.stats().decryption.phase === "clear"', 60000);
      data.referenceWarmup.main = await refPage.eval(OBSERVE);
      await refPage.screenshot();
      await clickOriginal(refPage, '[data-action="model-viewer"]');
      await refPage.waitFor(`(() => {
        const root = document.querySelector('.model-viewer');
        return root && !root.hidden && JSON.parse(root.dataset.stats || '{}').ready;
      })()`, 60000);
      await refPage.eval(`(() => {
        const canvas = document.querySelector('.viewer-canvas canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        gl.finish();
      })()`);
      await refPage.screenshot();
      data.referenceWarmup.viewer = await refPage.eval(OBSERVE);
      await clickOriginal(refPage, '[data-viewer="close"]');
      await refPage.waitFor('document.querySelector(".model-viewer").hidden', 30000);
      data.referenceWarmup.nativeSurface = await nativeSurface(refPage, width, height);
      await refPage.eval('window.rhine.archive()');
      await refPage.waitFor(`(() => {
        const s = window.rhine.stats();
        return s.mode === 'archive' && Math.abs(s.extraction - 0.4) < 0.002 && s.cameraDetail < 0.002 && s.returningFiles === 0;
      })()`, 60000);
      await refPage.eval('window.rhine.select(0)');
      await refPage.waitFor(`(() => {
        const s = window.rhine.stats();
        return s.mode === 'archive' && s.selected === 'X-001' && s.selectionPhase === 'settled'
          && Math.abs(s.extraction - 0.4) < 0.002 && s.cameraDetail < 0.002 && s.returningFiles === 0;
      })()`, 60000);
      data.referenceWarmup.settled = await refPage.eval(OBSERVE);
      data.referenceWarmup.elapsedMs = performance.now() - warmStarted;
      console.log(`${orient} reference: warmup complete in ${data.referenceWarmup.elapsedMs.toFixed(1)}ms`);
      await refPage.eval(`(() => {
        ${sequenceSource}
        window.__parityCreateSequence = createSequence;
      })()`);
      let originEpoch;
      const candidates = times.map((target) => ({ target }));
      const stream = { count: 0, firstTimestamp: null, lastTimestamp: null, timestampUnit: null, epochChecks: [], surfaces: [],
        mode: 'PNG windows centered on each target, nominal width 0.7s', windows: [] };
      data.referenceScreencast = stream;
      refPage.on('Page.screencastFrame', (event) => {
        void refPage.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch((error) => {
          if (refPage.ws.readyState === 1) data.referenceErrors.push(String(error));
        });
        const pngHeader = Buffer.from(event.data.slice(0, 44), 'base64');
        stream.surfaces.push({ width: pngHeader.readUInt32BE(16), height: pngHeader.readUInt32BE(20) });
        const epoch = event.metadata.timestamp;
        if (stream.firstTimestamp === null) {
          stream.firstTimestamp = epoch;
          const nodeEpoch = Date.now() / 1000;
          stream.epochChecks.push({ timestamp: epoch, nodeEpoch, deltaMs: (epoch - nodeEpoch) * 1000 });
          stream.timestampUnit = Math.abs(epoch - nodeEpoch) < 60 ? 'seconds since Unix epoch (measured against Date.now)' : 'unverified';
        }
        stream.count++;
        stream.lastTimestamp = epoch;
        if (originEpoch === undefined) return;
        const elapsed = epoch - originEpoch;
        for (const candidate of candidates) {
          if (candidate.finalized) continue;
          if (candidate.elapsed === undefined || Math.abs(elapsed - candidate.target) < Math.abs(candidate.elapsed - candidate.target)) {
            Object.assign(candidate, { elapsed, metadata: event.metadata, data: event.data });
          }
          if (elapsed >= candidate.target) {
            candidate.finalized = true;
            console.log(`${orient} reference screencast F=${candidate.target}: nearest ${candidate.elapsed.toFixed(4)}s (${((candidate.elapsed - candidate.target) * 1000).toFixed(1)}ms)`);
          }
        }
      });
      await refPage.send('Page.startScreencast', { format: 'png', maxWidth: width, maxHeight: height, everyNthFrame: 1 });
      const surfaceDeadline = Date.now() + 10000;
      while (stream.surfaces.length < 2 || stream.surfaces.slice(-2).some((frame) => frame.width !== width || frame.height !== height)) {
        if (Date.now() > surfaceDeadline) throw new Error('Native surface did not stabilize at the required dimensions');
        await refPage.once('Page.screencastFrame', 10000);
      }
      stream.surface = stream.surfaces.at(-1);
      await refPage.send('Page.stopScreencast');
      await clickOriginal(refPage, '[data-action="replay"]');
      originEpoch = await refPage.eval(`(() => {
        window.__parityInputTrace = [];
        for (const type of ['keydown', 'click', 'pointerdown', 'pointermove', 'pointerup']) {
          document.addEventListener(type, (event) => {
            if (window.__parityStarted === undefined) return;
            const target = event.target.closest?.('[data-tab],[data-action],[data-viewer]');
            window.__parityInputTrace.push({ elapsed: (performance.now() - window.__parityStarted)/1000,
              type, key: event.key, tab: target?.dataset.tab, action: target?.dataset.action,
              viewer: target?.dataset.viewer, x: event.clientX, y: event.clientY });
          }, true);
        }
        window.rhine.seek(0);
        window.__parityStarted = performance.now();
        window.__parityEpoch = (performance.timeOrigin + window.__parityStarted) / 1000;
        window.__paritySequence = window.__parityCreateSequence(window, ${A}, { quantize: false });
        window.__parityVisibility = [{ elapsed: 0, hidden: document.hidden }];
        document.addEventListener('visibilitychange', () => window.__parityVisibility.push({
          elapsed: (performance.now()-window.__parityStarted)/1000, hidden: document.hidden,
        }));
        window.__parityTrace = [];
        function observeFrame(ms) {
          const observation = ${OBSERVE};
          window.__parityTrace.push({ ...observation,
            frameEpoch: (performance.timeOrigin + ms)/1000,
            frameElapsed: (ms-window.__parityStarted)/1000,
          });
          window.__parityRAF = requestAnimationFrame(observeFrame);
        }
        window.__parityRAF = requestAnimationFrame(observeFrame);
        return window.__parityEpoch;
      })()`);
      stream.originEpoch = originEpoch;
      data.referenceWarmup.calibratedZero = await refPage.eval(OBSERVE);
      for (const target of times) {
        await refPage.eval(`new Promise(resolve => setTimeout(resolve, Math.max(0,
          ${target - 0.35}*1000 - (performance.now() - window.__parityStarted))))`, 45000);
        const started = await refPage.eval('(performance.now() - window.__parityStarted)/1000');
        await refPage.send('Page.startScreencast', { format: 'png', maxWidth: width, maxHeight: height, everyNthFrame: 1 });
        await refPage.eval(`new Promise(resolve => setTimeout(resolve, Math.max(0,
          ${target + 0.35}*1000 - (performance.now() - window.__parityStarted))))`, 45000);
        await refPage.send('Page.stopScreencast');
        const ended = await refPage.eval('(performance.now() - window.__parityStarted)/1000');
        stream.windows.push({ target, started, ended });
      }
      await refPage.eval(`new Promise(resolve => setTimeout(resolve, Math.max(0,
        ${duration}*1000 - (performance.now() - window.__parityStarted))))`, 45000);
      const trace = await refPage.eval(`(() => {
        cancelAnimationFrame(window.__parityRAF);
        return { actions: window.__paritySequence.log, inputs: window.__parityInputTrace,
          frames: window.__parityTrace, visibility: window.__parityVisibility };
      })()`);
      Object.assign(data, { referenceTrace: trace });
      if (stream.timestampUnit === 'unverified') throw new Error('Screencast metadata.timestamp is not verified as epoch seconds');
      for (const candidate of candidates) {
        if (!candidate.data) throw new Error(`No native screencast frame near F=${candidate.target}`);
        const nearest = trace.frames.reduce((best, frame) =>
          !best || Math.abs(frame.frameElapsed - candidate.elapsed) < Math.abs(best.frameElapsed - candidate.elapsed) ? frame : best,
        null);
        if (!nearest) throw new Error(`No native RAF state near F=${candidate.target}`);
        const file = path.join(output, `${orient}-${candidate.target}-reference.png`);
        fs.writeFileSync(file, Buffer.from(candidate.data, 'base64'));
        const offset = (candidate.elapsed - candidate.target) * 1000;
        data.samples.push({ target: candidate.target, reference: {
          image: shown(file), elapsed: candidate.elapsed,
          observationOffsetMs: offset,
          stateTraceElapsed: nearest.frameElapsed,
          stateTraceOffsetMs: (nearest.frameElapsed - candidate.elapsed) * 1000,
          metadata: candidate.metadata, state: nearest.state,
        } });
        if (Math.abs(offset) >= 1000) report.failures.push(`${orient} F=${candidate.target}: nearest reference frame offset ${offset.toFixed(1)}ms`);
      }
      save();
      if (trace.visibility.some((sample) => sample.hidden)) {
        report.failures.push(`${orient}: reference became hidden during realtime capture`);
      }
      }
    } finally {
      if (refPage.ws.readyState === 1) await refPage.send('Page.close');
    }
    }

    const filmPage = await browser.newPage();
    try {
      await filmPage.viewport(width, height);
      await filmPage.send('Emulation.setVisibleSize', { width, height });
      await filmPage.send('Page.bringToFront');
      collectErrors(filmPage, data.filmErrors);
      if (ssaoProbe) await filmPage.send('Page.addScriptToEvaluateOnNewDocument', { source: SSAO_INSTRUMENT });
      await filmPage.goto(`${base}/demos/cases/archive-os/index.html?render=1&quality=original&orient=${orient}`, 60000);
      await filmPage.waitFor('window.__motion && window.__motion.ready', 60000);
      await filmPage.eval('Promise.resolve(window.__motion.ready).then(() => true)', 60000);
      await filmPage.eval('window.__motion.pause()');
      data.filmRenderer = await filmPage.eval(RENDERER);
      requireHardware(data.filmRenderer);
      if (clockAligned) data.filmZero = { state: await filmPage.eval(OBSERVE), alignment: await filmPage.eval(ALIGNMENT) };
      for (const sample of data.samples) {
        await filmPage.eval(`window.__motion.seek(${sample.target})`, 60000);
        const observed = await filmPage.eval(OBSERVE);
        const file = path.join(output, `${orient}-${sample.target}-film.png`);
        await filmPage.screenshot(file);
        sample.film = { image: shown(file), state: observed.state };
        if (clockAligned) sample.film.alignment = await filmPage.eval(ALIGNMENT);
        sample.logicalDOMEqual = JSON.stringify(logical(sample.reference.state)) === JSON.stringify(logical(observed.state));
        if (!sample.logicalDOMEqual) report.failures.push(`${orient} F=${sample.target}: logical DOM differs`);
        save();
        console.log(`${orient} film F=${sample.target}: logical DOM ${sample.logicalDOMEqual ? 'equal' : 'DIFFERS'}`);
      }
      data.filmCapturedAt = new Date().toISOString();
      if (ssaoProbe) data.filmGPU = await filmPage.eval('document.querySelector("iframe").contentWindow.__ssaoDiagnostic');
    } finally {
      if (filmPage.ws.readyState === 1) await filmPage.send('Page.close');
    }
    for (const sample of data.samples) {
      const refImage = path.resolve(repo, sample.reference.image);
      const filmImage = path.resolve(repo, sample.film.image);
      const combined = path.join(output, `${orient}-${sample.target}.png`);
      encode(['-y', '-i', refImage, '-i', filmImage, '-filter_complex', '[0:v][1:v]hstack=inputs=2',
        '-frames:v', '1', '-update', '1', combined]);
      const refRGB = thumbnail(refImage), filmRGB = thumbnail(filmImage);
      const absolute = difference(refRGB, filmRGB);
      sample.comparison = { image: shown(combined), mad255: absolute, mad: absolute / 255,
        referenceThumbnailRGB: refRGB.toString('base64'), filmThumbnailRGB: filmRGB.toString('base64') };
      save();
      console.log(`${orient} F=${sample.target}: MAD ${absolute.toFixed(4)}/255 → ${shown(combined)}`);
    }
    for (const kind of ['referenceErrors', 'filmErrors']) {
      if (data[kind].length) report.failures.push(`${orient}: ${data[kind].length} ${kind}`);
    }
  }
  report.status = report.failures.length ? 'completed-with-differences' : refreshFilmOnly ? 'film-refreshed' : args.includes('--probe') ? 'probe-completed' : 'captured';
  report.visualReview = args.includes('--probe') ? 'not applicable' : 'pending';
} catch (error) {
  report.status = 'failed';
  report.failures.push(error.stack || String(error));
} finally {
  try { await browser?.close(); }
  finally { await server?.close(); }
  if (refreshFilmOnly) report.filmRefresh.finishedAt = new Date().toISOString();
  else report.finishedAt = new Date().toISOString();
  save();
}
console.log(`${report.status}: ${resultPath}`);
if (report.failures.length) process.exitCode = 1;
