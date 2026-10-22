import fs from 'node:fs';
import { launch } from '../../../scripts/lib/cdp.mjs';
const browser = await launch({ width: 1920, height: 1080 });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  page.on('Runtime.consoleAPICalled', p => { if (p.type==='error') errors.push(p.args.map(a=>a.value??a.description).join(' ')); });
  await page.goto('http://localhost:4323/demos/cases/archive-os/app/index.html?film=1&quality=original');
  await page.waitFor('window.__filmApp && window.__clock', 30000);
  console.log(await page.eval('JSON.stringify({progress:__filmApp.progress,error:__filmApp.error})'));
  await page.eval('window.__filmApp.ready.then(()=>true)', 120000);
  const result = await page.eval(`(async () => {
    const canvas=document.querySelector('#three-scene canvas'), gl=canvas.getContext('webgl2'), ext=gl.getExtension('WEBGL_debug_renderer_info');
    const renderer=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
    const started=parent.performance.now();let arrayFrame, detailFrame;
    __filmSkipRender=true;
    while(__clock.frame<3000) {
      __clock.step(); await Promise.resolve();await Promise.resolve();
      if(arrayFrame===undefined && document.querySelector('#stage').dataset.boot==='array')arrayFrame=__clock.frame;
      if(rhine.stats().mode==='detail'){detailFrame=__clock.frame;break;}
    }
    return {renderer,arrayFrame,array:arrayFrame/60,detailFrame,A:Math.ceil(detailFrame/6)/10,stats:__filmApp.stats(),frame:__clock.frame};
  })()`, 60000);
  result.errors = errors;
  fs.writeFileSync('dev/shots/T5r/opening.json', JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
} finally { await browser.close(); }
