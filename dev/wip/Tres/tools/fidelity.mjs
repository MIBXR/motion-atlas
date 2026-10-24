import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const context = { window: {} };
vm.runInNewContext(fs.readFileSync('data/resources.js', 'utf8'), context);
const styles = context.window.MA_RES.styles.items.filter(s => s.status === 'ready');
const statuses = JSON.parse(fs.readFileSync('scripts/lemo-status.json', 'utf8'));
const films = path.resolve('../..', 'dev/shots/Tnew/films-web');
const output = 'dev/shots/Tres/fidelity', results = [];
fs.mkdirSync(output, { recursive: true });
const gpuArgs = ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--no-proxy-server'];
const browser = await launch({ width: 1920, height: 1080, args: gpuArgs });
function ffmpeg(args) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { maxBuffer: 16 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(r.stderr.toString());
  return r.stdout;
}
const pixels = file => ffmpeg(['-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
try {
  for (const s of styles) {
    const page = await browser.newPage(), errors = [];
    const failedScripts = [];
    page.on('Runtime.exceptionThrown', e => errors.push(e.exceptionDetails.exception?.description || e.exceptionDetails.text));
    page.on('Runtime.consoleAPICalled', e => { if (e.type === 'error') errors.push(e.args.map(a => a.value || a.description).join(' ')); });
    page.on('Network.responseReceived', e => { if (e.type === 'Script' && e.response.status >= 400) failedScripts.push({ url: e.response.url, status: e.response.status }); });
    await page.send('Network.enable');
    const start = Date.now();
    try {
      await page.goto(`http://localhost:4328/demos/styles/player/?style=${s.slug}&render=1`, 60000);
      await page.waitFor('window.__motion', 180000);
      const deadline = Date.now() + 180000;
      while (!await page.eval('window.__motion.stage.root.querySelector("iframe").contentWindow.READY === true')) {
        if (failedScripts.length) throw new Error('Required script failed: ' + JSON.stringify(failedScripts));
        if (errors.length) throw new Error('Upstream init error: ' + errors.join('\n'));
        if (Date.now() >= deadline) throw new Error('Upstream READY timeout');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await page.eval('window.__motion.ready.then(() => true)', 195000);
      const readyMs = Date.now() - start;
      const duration = await page.eval('window.__motion.duration');
      const points = [], web = statuses[s.slug].web;
      for (const [index, t] of [s.frameSec, duration * 0.25, duration * 0.5, duration * 0.75].entries()) {
        const measured = await page.eval(`(async () => {
          const m = window.__motion; m.pause();
          const start = performance.now(); await m.seek(${t});
          const renderMs = performance.now() - start;
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          return { renderMs, time: m.time, stage: [m.stage.root.offsetWidth, m.stage.root.offsetHeight], iframeQuery: m.stage.root.querySelector('iframe').contentWindow.location.search };
        })()`, 180000);
        const frame = `${output}/${s.slug}-${index}-player.png`;
        const player = `${output}/${s.slug}-${index}-player-480.png`;
        const reference = `${output}/${s.slug}-${index}-film.png`;
        const capture = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 } });
        fs.writeFileSync(frame, Buffer.from(capture.data, 'base64'));
        ffmpeg(['-i', frame, '-frames:v', '1', '-vf', 'scale=480:270', player]);
        ffmpeg(['-i', path.join(films, web), '-ss', String(t), '-frames:v', '1', '-vf', 'scale=480:270', reference]);
        const a = pixels(player), b = pixels(reference);
        if (a.length !== 480 * 270 * 3 || b.length !== a.length) throw new Error('Unexpected reference frame size');
        let difference = 0;
        for (let i = 0; i < a.length; i++) difference += Math.abs(a[i] - b[i]);
        points.push({ t, mad: difference / a.length, ...measured, frame, player, reference });
      }
      const pair = `${output}/${s.slug}.jpg`;
      const inputs = points.flatMap(p => ['-i', p.player, '-i', p.reference]);
      const filters = points.map((p, i) => `[${i * 2}:v][${i * 2 + 1}:v]hstack=inputs=2,pad=1088:270:128:0:color=0x141414,drawtext=fontfile='C\\:/Windows/Fonts/consola.ttf':text='t=${p.t.toFixed(3)} s':x=8:y=126:fontsize=16:fontcolor=white[row${i}]`);
      filters.push('[row0][row1][row2][row3]vstack=inputs=4');
      ffmpeg([...inputs, '-filter_complex', filters.join(';'), '-frames:v', '1', '-q:v', '2', pair]);
      const maxMad = Math.max(...points.map(p => p.mad));
      results.push({ slug: s.slug, status: 'rendered', frameSec: s.frameSec, web, duration, readyMs, points, maxMad, errors, pair });
      fs.writeFileSync('dev/wip/Tres/evidence/fidelity.json', JSON.stringify({ reference: 'web-film', gpuArgs, results }, null, 2) + '\n');
      console.log(`${s.slug} MAD=${points.map(p => p.mad.toFixed(3)).join('/')} max=${maxMad.toFixed(3)} readyMs=${readyMs} renderMs=${points.map(p => p.renderMs.toFixed(1)).join('/')}`);
    } catch (error) {
      results.push({ slug: s.slug, status: 'unavailable', frameSec: s.frameSec, maxMad: null, readyMs: null, elapsedMs: Date.now() - start, error: error.message, failedScripts, errors });
      console.error(`${s.slug} unavailable: ${error.message}`);
    } finally { await page.send('Page.close'); }
  }
} finally {
  fs.writeFileSync('dev/wip/Tres/evidence/fidelity.json', JSON.stringify({ reference: 'web-film', gpuArgs, results }, null, 2) + '\n');
  await browser.close();
}
if (results.some(result => result.status !== 'rendered')) process.exitCode = 1;
