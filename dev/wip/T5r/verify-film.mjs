import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../../scripts/lib/cdp.mjs';

const args = process.argv.slice(2);
const get = (key, fallback) => args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const entry = JSON.parse(await readFile(path.join(repo, 'entries/cases/archive-os.json'), 'utf8'));
const gpu = entry.renderer === 'gpu';
const browserArgs = gpu ? ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] : [];
const base = get('--base', 'http://localhost:4323').replace(/\/$/, '');
const A = Number(get('--a', get('--A', 35)));
const quality = get('--quality', gpu ? 'original' : 'auto');
const B = A + 27.6;
const orientations = get('--orient', 'both') === 'both'
  ? ['landscape', 'portrait'] : [get('--orient')];
const output = path.resolve(repo, get('--out', 'dev/shots/T5r/determinism'));
const resultPath = path.join(output, 'results.json');
const targets = [0, 2, 6, 10, 14, 18, 26, 34.5, A + 0.5, A + 4,
  A + 8, A + 10.5, A + 13, A + 14.8, A + 19.7, A + 21.4,
  A + 24.5, A + 26.5, B + 4.5, B + 12.9].map((t) => Math.round(t * 60) / 60);
if (!orientations.every((value) => ['landscape', 'portrait'].includes(value))) {
  throw new Error('--orient must be both, landscape, or portrait');
}

const report = {
  startedAt: new Date().toISOString(),
  base, A, B, requestedDuration: get('--duration', null),
  quality, entryRenderer: entry.renderer ?? null, launchArgs: browserArgs, targets,
  thumbnail: { width: 64, height: 36, channels: 'RGB', filter: 'browser canvas interpolation' },
  pixelLimit: 2 / 255,
  screenshotScope: 'Composited viewport, including the active WebGL canvas and original application DOM',
  orientations: [], failures: [], status: 'running',
};
const save = () => writeFile(resultPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
let seed = 0x5EED;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
function mad(left, right) {
  let total = 0;
  for (let i = 0; i < left.length; i++) total += Math.abs(left[i] - right[i]);
  return total / left.length / 255;
}
const STATE = `(() => {
  const win = document.querySelector('iframe').contentWindow;
  const doc = win.document, s = win.__filmApp.stats();
  const viewer = doc.querySelector('.model-viewer');
  return {
    mode: doc.querySelector('#stage').dataset.mode,
    selected: s.selected,
    activeTab: doc.querySelector('.detail-tabs [aria-selected="true"]')?.dataset.tab ?? null,
    viewerOpen: s.viewerOpen,
    viewer: s.viewerOpen ? {
      ...s.viewer,
      lifecycle: viewer.dataset.transition,
      exploded: viewer.dataset.exploded,
    } : null,
  };
})()`;

async function seek(page, time) {
  const started = performance.now();
  await page.eval(`(async () => {
    const m = window.__motion;
    m.pause();
    await m.seek(${time});
    await Promise.resolve();
    return m.time;
  })()`, 60000);
  return performance.now() - started;
}
async function capture(page) {
  const state = await page.eval(STATE);
  const png = await page.screenshot();
  const rgb = await page.eval(`(async () => {
    const bytes = Uint8Array.from(atob(${JSON.stringify(png.toString('base64'))}), (c) => c.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 36;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, 64, 36); bitmap.close();
    const rgba = ctx.getImageData(0, 0, 64, 36).data, rgb = [];
    for (let i = 0; i < rgba.length; i += 4) rgb.push(rgba[i], rgba[i + 1], rgba[i + 2]);
    return rgb;
  })()`);
  return { state, png, rgb };
}

await mkdir(output, { recursive: true });
let browser;
try {
  browser = await launch({ width: 1920, height: 1080, args: browserArgs });
  report.browser = browser.exe;
  for (const orient of orientations) {
    const page = await browser.newPage();
    const portrait = orient === 'portrait';
    await page.viewport(portrait ? 1080 : 1920, portrait ? 1920 : 1080);
    const evidenceDir = path.join(output, orient);
    await mkdir(evidenceDir, { recursive: true });
    const errors = [], coldRequests = [];
    let coldBytes = 0, cold = true;
    page.on('Network.loadingFinished', (event) => {
      if (cold) {
        coldBytes += event.encodedDataLength;
        coldRequests.push({ requestId: event.requestId, bytes: event.encodedDataLength });
      }
    });
    page.on('Runtime.exceptionThrown', (event) => errors.push(
      event.exceptionDetails?.exception?.description || event.exceptionDetails?.text,
    ));
    page.on('Runtime.consoleAPICalled', (event) => {
      if (event.type === 'error') errors.push(event.args.map((arg) => arg.value ?? arg.description).join(' '));
    });
    const data = { orient, samples: [], errors };
    report.orientations.push(data);
    try {
      await page.send('Network.enable');
      await page.send('Network.setCacheDisabled', { cacheDisabled: true });
      const started = performance.now();
      const query = new URLSearchParams({ render: '1', orient });
      if (quality !== 'auto') query.set('quality', quality);
      await page.goto(`${base}/demos/cases/archive-os/index.html?${query}`, 60000);
      await page.waitFor('window.__motion && window.__motion.ready', 60000);
      await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 60000);
      data.coldReadyMs = performance.now() - started;
      cold = false;
      data.coldDownloadBytes = coldBytes;
      data.coldDownloadRequests = coldRequests;
      await page.send('Network.setCacheDisabled', { cacheDisabled: false });
      data.duration = await page.eval('window.__motion.duration');
      data.selectedQuality = await page.eval('({quality:__motion.quality,softwareGL:__motion.softwareGL})');
      data.renderer = await page.eval(`(() => {
        const canvas = document.querySelector('iframe').contentDocument.querySelector('#three-scene canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        const info = gl.getExtension('WEBGL_debug_renderer_info');
        return { renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), vendor: info ? gl.getParameter(info.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR) };
      })()`);
      if ((gpu || args.includes('--require-hardware')) && /swiftshader|software|llvmpipe|microsoft basic render/i.test(data.renderer.renderer)) {
        throw new Error(`${orient}: requested hardware renderer, received ${data.renderer.renderer}`);
      }
      if (report.requestedDuration !== null && Math.abs(data.duration - Number(report.requestedDuration)) > 1e-6) {
        report.failures.push(`${orient}: duration ${data.duration} differs from requested ${report.requestedDuration}`);
      }
      if (targets.some((time) => time > data.duration)) throw new Error('A produces sample targets beyond the actual duration');

      if (!args.includes('--skip-performance')) {
      await seek(page, 0);
      data.forwardSeekMs = await seek(page, data.duration);
      data.forwardRealtimeMultiple = data.duration / (data.forwardSeekMs / 1000);
      data.endTo30Ms = await seek(page, 30);
      data.endTo30Pass = data.endTo30Ms <= 6000;
      if (!data.endTo30Pass) report.failures.push(`${orient}: end → 30 took ${data.endTo30Ms.toFixed(1)}ms > 6000ms`);
      } else data.performanceSkipped = true;

      for (const [index, target] of targets.entries()) {
        const sample = { index: index + 1, target, routes: [] };
        data.samples.push(sample);
        const origins = [
          { name: 'zero', time: 0 },
          { name: 'end', time: data.duration },
          { name: 'random', time: Math.round(random() * data.duration * 60) / 60 },
        ];
        let baseline;
        for (const origin of origins) {
          const originSeekMs = await seek(page, origin.time);
          const targetSeekMs = await seek(page, target);
          const current = await capture(page);
          const domEqual = !baseline || JSON.stringify(current.state) === JSON.stringify(baseline.state);
          const difference = baseline ? mad(baseline.rgb, current.rgb) : 0;
          const pass = domEqual && difference < report.pixelLimit;
          const filename = `${String(index + 1).padStart(2, '0')}-F${target.toFixed(3)}-from-${origin.name}.png`;
          let image = null;
          if (!baseline || !pass) {
            const file = path.join(evidenceDir, filename);
            await writeFile(file, current.png);
            image = path.relative(repo, file).replaceAll('\\', '/');
          }
          sample.routes.push({
            from: origin.name, origin: origin.time, originSeekMs, targetSeekMs,
            state: current.state, domEqual, pixelMad: difference,
            pixelMad255: difference * 255, pass, image,
            thumbnailRGB: Buffer.from(current.rgb).toString('base64'),
          });
          if (!pass) report.failures.push(`${orient} F=${target} from ${origin.name}: DOM=${domEqual}, MAD=${(difference * 255).toFixed(4)}/255`);
          baseline ??= current;
        }
        await save();
        console.log(`${orient} ${index + 1}/${targets.length} F=${target.toFixed(3)} ${sample.routes.every((route) => route.pass) ? 'PASS' : 'FAIL'}`);
      }
      if (errors.length) report.failures.push(`${orient}: ${errors.length} browser errors`);
      console.log(JSON.stringify({ orient, coldReadyMs: data.coldReadyMs, coldDownloadBytes: data.coldDownloadBytes,
        forwardRealtimeMultiple: data.forwardRealtimeMultiple, endTo30Ms: data.endTo30Ms, renderer: data.renderer }));
    } finally {
      await page.send('Page.close');
    }
  }
  report.status = report.failures.length ? 'failed' : 'passed';
} catch (error) {
  report.status = 'failed';
  report.failures.push(error.stack || String(error));
} finally {
  await browser?.close();
  report.finishedAt = new Date().toISOString();
  await save();
}
console.log(`${report.status}: ${resultPath}`);
if (report.status !== 'passed') process.exitCode = 1;
