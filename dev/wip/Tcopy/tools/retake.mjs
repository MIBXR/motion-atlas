import { launch } from '../../../../scripts/lib/cdp.mjs';
const browser = await launch({ width:1440, height:900, args:['--enable-gpu','--use-angle=d3d11','--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4326/');
  await page.waitFor('document.querySelector("#monImg")?.complete && Number(getComputedStyle(document.querySelector("#monImg")).opacity) > .99');
  await page.eval('document.fonts.ready');
  await page.screenshot('dev/shots/Tcopy/home-desktop.png');
  for (const [url, name, time] of [
    ['cases.html#case/archive-os','archive-rhythm-desktop',35],
    ['patterns.html#pattern/rolling-digits','pattern-detail-desktop',2.2],
  ]) {
    await page.goto('http://localhost:4326/'+url);
    await page.waitFor('document.querySelector("#scrubber")?.dataset.ready === "1" && !document.querySelector("#stage-frame")?.hasAttribute("aria-busy")', 60000);
    await page.eval(`(async () => {const m = document.getElementById('demo-frame').contentWindow.__motion; await m.ready; m.pause(); await m.seek(${time}); m.pause();})()`, 60000);
    if (name.startsWith('archive')) await page.eval(`(() => {const h=[...document.querySelectorAll('.note-sec h2')].find(h=>h.textContent.startsWith('节奏结构')); scrollTo({top:scrollY+h.getBoundingClientRect().top-158,behavior:'instant'});})()`);
    await page.eval('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    await page.screenshot('dev/shots/Tcopy/'+name+'.png');
    console.log(name, await page.eval('({playing:document.getElementById("scrub-play").dataset.playing, time:document.getElementById("scrub-time").textContent})'));
  }
} finally { await browser.close(); }
