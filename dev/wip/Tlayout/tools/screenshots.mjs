import fs from 'node:fs';
import path from 'node:path';
import { launch, click, goto } from './browser.mjs';

const base = 'http://localhost:4326';
const out = 'dev/shots/Tlayout';
fs.mkdirSync(out, { recursive: true });
const browser = await launch({ width: 1440, height: 900 });
const mobileOnly = process.argv.includes('--mobile-only');
const index = mobileOnly ? JSON.parse(fs.readFileSync('dev/wip/Tlayout/screenshot-index.json', 'utf8')) : [];
async function save(page, name, selector) {
  const file = path.join(out, `${name}.png`);
  if (selector) {
    const clip = await page.eval(`(() => {
      const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
      return { x: Math.max(0, r.x - 6), y: Math.max(0, r.y - 6) + scrollY, width: Math.min(innerWidth - r.x, r.width + 12), height: Math.min(innerHeight - r.y, r.height + 12), scale: 1 };
    })()`);
    const shot = await page.send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: false });
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
  } else await page.screenshot(file);
  const record = { name, file: file.replaceAll('\\', '/'), url: await page.eval('location.href'), viewport: await page.eval('[innerWidth, innerHeight]') };
  const previous = index.findIndex(item => item.name === name);
  if (previous < 0) index.push(record);
  else index[previous] = record;
  console.log('shot', file);
}
async function load(page, route, width = 1440, height = 900) {
  await page.viewport(width, height);
  await goto(page, `${base}/${route}`);
  await page.waitFor('document.querySelector(".nav-toggle") && (document.querySelector("#grid .card") || document.querySelector("#doc h1") || document.querySelector("#beat-list button"))');
  await page.eval('document.fonts.ready');
  await page.waitFor('[...document.querySelectorAll("#grid .card img")].filter(i => { const r = i.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }).every(i => i.complete && i.naturalWidth > 0)');
  await page.eval('new Promise(r => setTimeout(r, 250))');
}
try {
  const page = await browser.newPage();
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: "localStorage.setItem('ma-theme', JSON.stringify('dark'));" });
  if (!mobileOnly) for (const theme of ['dark', 'light']) {
    await load(page, 'docs.html', 1440, 420);
    await page.eval(`document.documentElement.dataset.theme = '${theme}'`);
    await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 256, y: 200 });
    await page.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 100, y: 200, deltaY: 80, deltaX: 0 });
    await page.eval('new Promise(r => setTimeout(r, 50))');
    const evidence = await page.eval(`(() => { const s = document.querySelector('.lib-side'); const c = getComputedStyle(s); return { scrollHeight: s.scrollHeight, clientHeight: s.clientHeight, clientWidth: s.clientWidth, offsetWidth: s.offsetWidth, color: c.scrollbarColor, width: c.scrollbarWidth }; })()`);
    await save(page, `docs-scrollbar-${theme}`, '.lib-side');
    index.at(-1).scrollbar = evidence;
  }
  if (!process.argv.includes('--scrollbars-only')) {
    if (!mobileOnly) {
    for (const width of [1440, 2560]) for (const kind of ['cases', 'patterns', 'docs']) {
      await load(page, `${kind}.html`, width);
      await save(page, `${kind}-${width}`);
      if (width === 1440 && kind === 'patterns') await save(page, 'patterns-toolbar-1440', '.toolbar');
    }
    for (const id of ['archive-os', 'map-pilgrimage']) {
      await load(page, `cases.html#case/${id}`);
      await page.waitFor('document.querySelector(".stage-frame") && !document.querySelector(".stage-frame").hasAttribute("aria-busy")');
      await page.eval('document.querySelector(".scrubber").scrollIntoView({ block: "center", behavior: "instant" }); new Promise(r => setTimeout(r, 300))');
      await save(page, `${id}-beats-1440`, '.scrubber');
    }
    }
    await load(page, 'cases.html', 390, 844);
    await save(page, 'cases-390');
    await click(page, '.nav-toggle');
    await save(page, 'cases-menu-390');
    await click(page, '[data-view="site"]');
    await save(page, 'site-nav-390');
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await load(page, 'patterns.html', 390, 844);
    await save(page, 'patterns-390');
    await page.eval('scrollTo({ top: 1500, behavior: "instant" }); new Promise(r => setTimeout(r, 250))');
    await page.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 200, y: 500, deltaX: 0, deltaY: -100 });
    await page.waitFor('!document.querySelector(".site-header").classList.contains("is-hidden")');
    await page.eval('new Promise(r => setTimeout(r, 250))');
    await save(page, 'header-returned-390');
    await load(page, 'docs.html', 390, 844);
    await click(page, '.nav-toggle');
    await save(page, 'docs-menu-390');
  }
} finally {
  fs.writeFileSync(`dev/wip/Tlayout/${process.argv.includes('--scrollbars-only') ? 'scrollbar' : 'screenshot'}-index.json`, JSON.stringify(index, null, 2) + '\n');
  await browser.close();
}
