import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch } from '../../../scripts/lib/cdp.mjs';

const reference = path.resolve('../../dev/shots/T5/reference-runtime');
const { createServer } = await import(pathToFileURL(path.join(reference, 'node_modules/vite/dist/node/index.js')));
const output = path.resolve('dev/shots/T5r/reference');
fs.mkdirSync(output, { recursive: true });
const hasNovecento = ['Normal', 'DemiBold', 'Bold'].every(weight => fs.existsSync(path.join(reference, `public/fonts/novecento/webFonts/NovecentoSansWide${weight}/font.woff2`)));
const server = await createServer({
  root: reference,
  configFile: false,
  cacheDir: path.resolve('dev/shots/T5r/reference-vite-cache'),
  define: { __RHINE_MODELS__: '{}', __RHINE_NOVECENTO__: JSON.stringify(hasNovecento) },
  server: { host: '127.0.0.1', port: 4331, strictPort: true },
});
let browser;
try {
  await server.listen();
  browser = await launch({ width: 1920, height: 1080, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--no-proxy-server'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  await page.goto('http://127.0.0.1:4331/');
  await page.waitFor('window.rhine?.stats().ready && document.querySelector(".entry-start")?.disabled === false', 60000);
  const bounds = await page.eval('(() => { const r = document.querySelector(".entry-start").getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()');
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...bounds });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...bounds });
  await page.waitFor('window.rhine.stats().startup === "started"', 60000);
  await page.eval(`window.__referenceTrace = []; window.__referenceStarted = performance.now();
    window.__referenceTimer = setInterval(() => {
      const s = window.rhine.stats();
      window.__referenceTrace.push({ elapsed: (performance.now()-window.__referenceStarted)/1000, mode:s.mode, selected:s.selected, bootTime:s.bootTime, boot:document.querySelector('#stage').dataset.boot });
    }, 50);`);
  const result = { url: 'http://127.0.0.1:4331/', viewport: [1920, 1080], screenshots: [], samples: [], errors };
  for (const second of [2, 6, 10, 14, 18, 20.4, 22, 26, 30, 34, 36]) {
    await page.eval(`new Promise(resolve => setTimeout(resolve, Math.max(0, ${second}*1000-(performance.now()-window.__referenceStarted))))`);
    const sample = await page.eval(`(() => {const s=window.rhine.stats();return {elapsed:(performance.now()-window.__referenceStarted)/1000,mode:s.mode,selected:s.selected,bootTime:s.bootTime,boot:document.querySelector('#stage').dataset.boot};})()`);
    result.samples.push(sample);
    console.log(JSON.stringify(sample));
    if ([20.4, 22, 34, 36].includes(second)) {
      const name = `landscape-${second}.png`;
      await page.screenshot(path.join(output, name));
      result.screenshots.push(name);
    }
  }
  result.trace = await page.eval('(clearInterval(window.__referenceTimer), window.__referenceTrace)');
  result.modes = [...new Set(result.trace.map(x => x.mode))];
  result.firstDetail = result.trace.find(x => x.mode === 'detail');
  result.firstArchive = result.trace.find(x => x.mode === 'archive') || null;
  const before = await page.eval('window.rhine.stats().selected');
  await page.eval('window.rhine.seek(22)');
  await page.eval('new Promise(resolve => requestAnimationFrame(resolve))');
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
  result.bootArrowDown = await page.eval(`({ before: ${JSON.stringify(before)}, after: window.rhine.stats().selected, mode: window.rhine.stats().mode, bootTime: window.rhine.stats().bootTime })`);
  await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  result.explicitEscape = await page.eval('({ mode: window.rhine.stats().mode, selected: window.rhine.stats().selected })');
  fs.writeFileSync(path.join(output, 'trace.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ modes: result.modes, firstArchive: result.firstArchive, firstDetail: result.firstDetail, bootArrowDown: result.bootArrowDown, explicitEscape: result.explicitEscape }));
} finally {
  if (browser) await browser.close();
  await server.close();
}
