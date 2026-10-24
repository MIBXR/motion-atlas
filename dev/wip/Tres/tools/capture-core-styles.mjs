import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const browser = await launch({ width: 1440, height: 900, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--no-proxy-server'] });
const screenshots = [];
try {
  for (const slug of ['crayon-book', 'urban-sketch']) {
    const page = await browser.newPage();
    await page.goto(`http://localhost:4328/resources.html#style/${slug}`, 180000);
    await page.waitFor('document.querySelector(".style-player")?.dataset.ready === "true"', 180000);
    await page.eval('scrollTo({ top: 0, behavior: "instant" }); document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))', 180000);
    const state = await page.eval(`(() => {
      const m = document.querySelector('#style-frame').contentWindow.__motion;
      const minFontPx = Math.min(...[...document.querySelectorAll('body *')].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0).map(el => parseFloat(getComputedStyle(el).fontSize)));
      return { time: m.time, duration: m.duration, minFontPx, ready: document.querySelector('.style-player').dataset.ready };
    })()`);
    if (state.ready !== 'true' || state.minFontPx < 12) throw new Error(JSON.stringify(state));
    const file = `dev/shots/Tres/1440-style-${slug}.png`;
    await page.screenshot(file);
    screenshots.push({ file, hash: `#style/${slug}`, width: 1440, height: 900, ...state });
    console.log(`SCREENSHOT ${file} time=${state.time} ready=${state.ready}`);
    await page.send('Page.close');
  }
} finally {
  fs.writeFileSync('dev/wip/Tres/evidence/new-style-shots.json', JSON.stringify(screenshots, null, 2) + '\n');
  await browser.close();
}
