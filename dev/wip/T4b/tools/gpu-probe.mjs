import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';
const browser = await launch({ width: 1920, height: 1080, args: ['--use-angle=d3d11'] });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4322/demos/cases/map-pilgrimage/index.html?render=1&orient=landscape&t=8', 45000);
  await page.waitFor('window.__motion', 20000);
  await page.eval('Promise.resolve(__motion.ready).then(() => true)', 60000);
  const result = await page.eval(`(async () => {
    const gl=__map.painter.context.gl, ext=gl.getExtension('WEBGL_debug_renderer_info');
    const result={renderer:gl.getParameter(ext.UNMASKED_RENDERER_WEBGL), noMap:document.querySelector('#stage').classList.contains('no-map'), frames:[]};
    for(const t of [8,8.03333,20.4,20.43333]) {const start=performance.now();await __motion.seek(t);result.frames.push({t,ms:performance.now()-start,loaded:__map.loaded(),tiles:__map.areTilesLoaded()});}
    return result;
  })()`, 120000);
  await page.screenshot('dev/shots/T4b/gpu-probe.png');
  fs.writeFileSync('dev/shots/T4b/gpu-probe.json', JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
