import fs from 'node:fs';
import path from 'node:path';
import { launch } from '../../../scripts/lib/cdp.mjs';

const history = process.argv.includes('--history');
const out = path.resolve('dev/shots/T7/diagnostic', history ? 'history' : '.');
fs.mkdirSync(out, { recursive: true });
const browser = await launch({ width: 1080, height: 1920, args: ['--no-proxy-server'] });
const result = { console: [], exceptions: [], images: [] };
try {
  const page = await browser.newPage();
  page.on('Runtime.consoleAPICalled', e => result.console.push({ type: e.type, text: e.args.map(a => a.value ?? a.description).join(' ') }));
  page.on('Runtime.exceptionThrown', e => result.exceptions.push(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text));
  await page.viewport(1080, 1920, 1);
  await page.goto('http://localhost:4325/demos/cases/industrial-protocol/index.html?render=1&embed=1&orient=portrait', 60000);
  await page.waitFor('window.__motion && window.__motion.ready', 45000);
  await page.eval(`(async () => { await __motion.ready; __motion.pause(); await __motion.seek(${history ? 0 : 30}); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return true; })()`);
  if (history) for (const t of [0.5, 2, 3.7, 4.5, 7, 9.7, 10.5, 17, 23.7, 24.5, 30]) {
    await page.eval(`(async () => { await __motion.seek(${t}); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return true; })()`);
    await page.screenshot();
  }
  const probe = () => page.eval(`(() => {
    const rect = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return { x:r.x,y:r.y,width:r.width,height:r.height,display:s.display,visibility:s.visibility,opacity:s.opacity,transform:s.transform,filter:s.filter,backdropFilter:s.backdropFilter,background:s.background }; };
    return {
      time:__motion.time, orient:__motion.orient, viewport:[innerWidth,innerHeight],
      pane:rect(document.querySelector('.mp-pane')), dimmer:rect(document.querySelector('.mp-dimmer')),
      world:rect(document.querySelector('#world')), bag:rect(document.querySelector('.mp-bag-grid')),
      bagTitle:rect(document.querySelector('.mp-bag-title')), items:[...document.querySelectorAll('.mp-item')].map(rect),
      firstItemIcon:rect(document.querySelector('.mp-item-icon')),
      bagText:document.querySelector('.mp-bag-grid').textContent,
      bodyScroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],
      paneChildCount:document.querySelector('.mp-pane').children.length
    };
  })()`);
  result.baseline = await probe();
  const surface = path.join(out, 'portrait-panel-30-surface.png');
  await page.screenshot(surface);
  result.images.push({ variant:'surface-default', path:surface });
  const viewport = path.join(out, 'portrait-panel-30-viewport.png');
  const raw = await page.send('Page.captureScreenshot', { format:'png', captureBeyondViewport:false, fromSurface:false });
  fs.writeFileSync(viewport, Buffer.from(raw.data, 'base64'));
  result.images.push({ variant:'fromSurface-false', path:viewport });
  result.viewportCaptureDOM = await probe();
  await page.eval(`(async () => {
    document.querySelector('.mp-dimmer').style.backdropFilter='none';
    document.querySelector('.mp-dimmer').style.webkitBackdropFilter='none';
    document.querySelector('#world').style.filter='blur(4px)';
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    return true;
  })()`);
  result.worldBlur = await probe();
  const world = path.join(out, 'portrait-panel-30-world-blur.png');
  await page.screenshot(world);
  result.images.push({ variant:'no-backdrop-world-blur', path:world });
  const images = result.images.map(item => ({ ...item, data:'data:image/png;base64,'+fs.readFileSync(item.path).toString('base64') }));
  const composite = await browser.newPage();
  await composite.viewport(1620, 1000, 1);
  await composite.eval(`(async () => {
    document.body.style.cssText='margin:0;background:#17191b;color:white;font:16px Arial';
    const images=${JSON.stringify(images)};
    document.body.innerHTML='<div style="display:flex">'+images.map(x=>'<figure style="margin:0;width:540px"><figcaption style="height:40px;padding:10px;box-sizing:border-box">'+x.variant+'</figcaption><img style="width:540px;height:960px;display:block" src="'+x.data+'"></figure>').join('')+'</div>';
    await Promise.all([...document.images].map(i=>i.decode())); return true;
  })()`);
  await composite.screenshot(path.join(out, 'portrait-panel-30-three-way.png'));
} finally {
  fs.writeFileSync(path.join(out,'portrait-panel-30.json'),JSON.stringify(result,null,2)+'\n');
  await browser.close();
}
console.log(JSON.stringify({ images:result.images, pane:result.baseline.pane, bag:result.baseline.bag, itemCount:result.baseline.items.length, dimmer:result.worldBlur.dimmer, world:result.worldBlur.world, console:result.console, exceptions:result.exceptions },null,2));
