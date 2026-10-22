import fs from 'node:fs';
import path from 'node:path';
import { launch } from '../../../scripts/lib/cdp.mjs';

const args = process.argv.slice(2);
const get = (key, fallback) => { const i = args.indexOf(key); return i < 0 ? fallback : args[i + 1]; };
const entry = JSON.parse(fs.readFileSync(new URL('../../../entries/cases/archive-os.json', import.meta.url), 'utf8'));
const gpu = entry.renderer === 'gpu';
const browserArgs = gpu ? ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] : [];
const base = get('--base', 'http://localhost:4323');
const out = path.resolve(get('--out', 'dev/shots/T5r/play-cancel/red.json'));
const readyDelay = Number(get('--ready-delay', 0));
const result = { startedAt: new Date().toISOString(), base, readyDelayMs: readyDelay, entryRenderer: entry.renderer ?? null, launchArgs: browserArgs, environments: [], cases: [], failures: [] };

async function runCase(kind) {
  const motion = window.__motion, iframe = motion.stage.root.querySelector('iframe');
  const state = () => ({ playing: motion.playing, time: motion.time,
    frame: iframe.contentWindow.__clock?.frame ?? null,
    document: iframe.contentWindow.__playCancelDocument ?? null,
    ready: iframe.contentWindow.__playCancelReadyResolved ?? false });
  const twoFrames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  motion.pause();
  await motion.seek(motion.duration);
  const before = state(), oldDocument = iframe.contentDocument;
  let rebuildDone = false;
  const rebuild = motion.seek(0);
  rebuild.then(() => { rebuildDone = true; });
  await new Promise((resolve, reject) => {
    function inspect() {
      if (iframe.contentDocument !== oldDocument && !iframe.contentWindow.__playCancelReadyResolved) return resolve();
      if (rebuildDone) return reject(new Error('Rebuild finished before cancellation; use --ready-delay 150 to expose the pending interval.'));
      requestAnimationFrame(inspect);
    }
    inspect();
  });
  const rebuilding = state();
  const play = motion.play();
  let cancel, expectedTime;
  if (kind === 'pause') {
    motion.pause();
    expectedTime = motion.time;
  } else {
    expectedTime = 1;
    cancel = motion.seek(expectedTime);
  }
  const cancelled = state();
  const settled = await Promise.allSettled([rebuild, play, cancel].map(value => Promise.resolve(value)));
  await twoFrames();
  const after = state();
  const checks = {
    realIframeRebuild: rebuilding.document !== before.document && !rebuilding.ready,
    paused: after.playing === false,
    timeUnchanged: Math.abs(after.time - expectedTime) < 1e-9,
    frameMatches: after.frame === Math.round(expectedTime * 60),
    promisesFulfilled: settled.every(value => value.status === 'fulfilled'),
  };
  motion.pause();
  return { kind, before, rebuilding, cancelled, expectedTime, after, checks,
    promises: settled.map(value => ({ status: value.status, ...(value.status === 'rejected' ? { error: String(value.reason) } : {}) })),
    pass: Object.values(checks).every(Boolean) };
}

const browser = await launch({ args: browserArgs });
result.browser = browser.exe;
try {
  for (const orient of ['landscape', 'portrait']) {
    const page = await browser.newPage(), errors = [];
    page.on('Runtime.exceptionThrown', event => errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
    page.on('Runtime.consoleAPICalled', event => { if (event.type === 'error') errors.push(event.args.map(a => a.value ?? a.description).join(' ')); });
    try {
      const [width, height] = orient === 'portrait' ? [1080, 1920] : [1920, 1080];
      await page.viewport(width, height);
      await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
        if (window === top) { window.__playCancelNextDocument = 0; return; }
        if (new URLSearchParams(location.search).get('film') !== '1') return;
        window.__playCancelDocument = ++top.__playCancelNextDocument;
        window.__playCancelReadyResolved = false;
        const nativeTimeout = window.setTimeout.bind(window);
        let app;
        Object.defineProperty(window, '__filmApp', { configurable: true,
          get: () => app,
          set(value) {
            app = value;
            if (${readyDelay} > 0) value.ready = value.ready.then(() => new Promise(resolve => nativeTimeout(resolve, ${readyDelay})));
            value.ready.then(() => { window.__playCancelReadyResolved = true; });
          },
        });
      })();` });
      const url = new URL('/demos/cases/archive-os/index.html', base);
      url.searchParams.set('render', '1'); url.searchParams.set('orient', orient);
      if (gpu) url.searchParams.set('quality', 'original');
      await page.goto(url.href, 60000);
      await page.waitFor('window.__motion', 30000);
      await page.eval('window.__motion.ready.then(() => true)', 120000);
      const environment = await page.eval(`(() => {
        const canvas = document.querySelector('iframe').contentDocument.querySelector('#three-scene canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        const info = gl.getExtension('WEBGL_debug_renderer_info');
        return { quality: window.__motion.quality, softwareGL: window.__motion.softwareGL,
          renderer: gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER),
          vendor: gl.getParameter(info ? info.UNMASKED_VENDOR_WEBGL : gl.VENDOR) };
      })()`);
      result.environments.push({ orient, ...environment });
      if (gpu && /swiftshader|software|llvmpipe|microsoft basic render/i.test(environment.renderer)) {
        result.failures.push(`${orient}: entry renderer=gpu received ${environment.renderer}`);
        throw new Error(result.failures.at(-1));
      }
      for (const kind of ['pause', 'seek']) {
        const measured = await page.eval(`(${runCase.toString()})(${JSON.stringify(kind)})`, 120000);
        const entry = { orient, ...environment, ...measured, errors: [...errors] };
        result.cases.push(entry);
        if (!entry.pass || errors.length) result.failures.push(`${orient}/${kind}`);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
        console.log(JSON.stringify({ orient, kind, pass: entry.pass, rebuilding: entry.rebuilding, after: entry.after, checks: entry.checks }));
      }
    } finally {
      await page.send('Page.close');
    }
  }
} finally {
  await browser.close();
  result.finishedAt = new Date().toISOString();
  result.status = result.failures.length ? 'failed' : 'passed';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
}
if (result.failures.length) process.exitCode = 1;
