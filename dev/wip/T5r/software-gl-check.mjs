import fs from 'node:fs';
import { launch } from '../../../scripts/lib/cdp.mjs';

const output = 'dev/shots/T5r/software-gl';
fs.mkdirSync(output, { recursive: true });
const result = { nodeOptions: process.env.NODE_OPTIONS ?? null, execArgv: process.execArgv, cases: [] };
const browser = await launch({ width: 1280, height: 720 });
try {
  for (const quality of [null, 'original', 'performance']) {
    const page = await browser.newPage();
    try {
      const suffix = quality === null ? '' : `&quality=${quality}`;
      await page.goto(`http://localhost:4323/demos/cases/archive-os/index.html?render=1${suffix}`);
      await page.waitFor('window.__motion?.ready');
      await page.eval('__motion.ready.then(()=>true)', 60000);
      const state = await page.eval(`(() => {
        const m = __motion, iframe = document.querySelector('iframe');
        const canvas = iframe.contentDocument.querySelector('#three-scene canvas');
        const gl = canvas.getContext('webgl2'), ext = gl.getExtension('WEBGL_debug_renderer_info');
        return { quality: m.quality, softwareGL: m.softwareGL, iframe: iframe.getAttribute('src'),
          renderer: gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER),
          readonlyQuality: !Reflect.set(m, 'quality', 'ultra'),
          readonlySoftwareGL: !Reflect.set(m, 'softwareGL', false) };
      })()`);
      const expected = quality ?? (state.softwareGL ? 'performance' : 'original');
      result.cases.push({ requested: quality, ...state, pass: state.quality === expected && new URL(state.iframe, 'http://localhost').searchParams.get('quality') === expected && state.readonlyQuality && state.readonlySoftwareGL });
    } finally { await page.send('Page.close'); }
  }
} finally {
  await browser.close();
  fs.writeFileSync(`${output}/selection.json`, JSON.stringify(result, null, 2) + '\n');
}
console.log(JSON.stringify(result, null, 2));
if (result.cases.length !== 3 || result.cases.some(c => !c.pass)) process.exitCode = 1;
