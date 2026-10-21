import fs from 'node:fs';
import path from 'node:path';
import { launch } from '../../../scripts/lib/cdp.mjs';

const out = 'dev/shots/T13/map';
fs.mkdirSync(out, { recursive: true });
const browser = await launch({ width: 540, height: 960, args: ['--no-proxy-server'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  page.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') errors.push(p.args.map(a => a.value ?? a.description).join(' ')); });
  const url='http://localhost:4321/demos/cases/map-pilgrimage/index.html?render=1&embed=1&orient=portrait';
  await page.goto(url, 60000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 120000);
  const samples = [];
  for (let start = 0; start <= 1800; start += 30) {
    const batch = await page.eval(`(async () => {
      const m = window.__motion, samples = [], pending = [];
      const scale=m.stage.scale;
      const rect = e => { const r = e.getBoundingClientRect(); return { left:r.left/scale, top:r.top/scale, right:r.right/scale, bottom:r.bottom/scale, width:r.width/scale, height:r.height/scale }; };
      const visible = e => { let opacity = 1; for (let p=e; p && p!==document.documentElement; p=p.parentElement) { const s=getComputedStyle(p); if (s.visibility==='hidden' || s.display==='none') return false; opacity *= +s.opacity; } return opacity > .001; };
      const overlap = (a,b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      m.pause();
      for (let i=${start}; i<=${Math.min(start + 29, 1800)}; i++) {
        pending.push(m.seek(i/30));
        const e=document.querySelector('.attrib'), r=rect(e), range=document.createRange();
        range.selectNodeContents(e);
        const ink=rect({getBoundingClientRect:()=>range.getBoundingClientRect()}), tape=document.querySelector('.tape'), tr=rect(tape);
        const conflicts=[...document.querySelectorAll('.st-label,.np-track,.np-lyric,.np-sub,.ou-stats,.ou-fin,.ou-credits,.cd-cap')].filter(x=>visible(x) && overlap(ink,rect(x))).map(x=>x.className.baseVal||x.className);
        const style=getComputedStyle(e);
        const occluders=[...document.querySelector('#stage').children].filter(x=>x!==e && +getComputedStyle(x).zIndex>=+style.zIndex && visible(x) && overlap(ink,rect(x))).map(x=>x.id||x.className);
        samples.push({t:i/30, visible:visible(e), opacity:+style.opacity, zIndex:+style.zIndex, color:style.color, background:style.backgroundColor, attribution:r, ink, tape:tr, tapeVisible:visible(tape), tapeGap:tr.top-ink.bottom, clipped:ink.left<0||ink.right>1080||ink.top<0||ink.bottom>1920, conflicts,occluders});
      }
      await Promise.all(pending);
      return samples;
    })()`, 120000);
    samples.push(...batch);
    if (start % 300 === 0) console.log(`geometry ${start}/1800`);
  }
  // 截图使用新载入的页面，避免回扫时保留收尾衬底。
  await page.goto(url,60000);
  await page.waitFor('window.__motion',30000);
  await page.eval('Promise.resolve(window.__motion.ready).then(()=>true)',120000);
  const screenshots = [];
  for (const t of [5.2, 20.4, 24.8, 31, 35, 40.8, 41.8, 44, 46, 51.6, 58.5]) {
    await page.eval(`window.__motion.seek(${t}).then(()=>new Promise(r=>requestAnimationFrame(r)))`, 90000);
    const file=path.join(out,`P-${t.toFixed(1)}.png`);
    await page.screenshot(file);
    screenshots.push(file);
  }
  const shown=samples.filter(x=>x.visible), tapeShown=shown.filter(x=>x.tapeVisible);
  const result={fps:30,samples:samples.length,range:[0,60],visible:shown.length,tapeVisible:tapeShown.length,minTapeGap:Math.min(...tapeShown.map(x=>x.tapeGap)),clipped:shown.filter(x=>x.clipped),conflicts:shown.filter(x=>x.conflicts.some(c=>c!=='cd-cap')),cardCaptionUnderlays:shown.filter(x=>x.conflicts.includes('cd-cap')),occluded:shown.filter(x=>x.occluders.length),hidden:samples.filter(x=>!x.visible),errors,screenshots,samples};
  fs.writeFileSync(path.join(out,'attribution.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({...result,samples:samples.length,clipped:result.clipped.length,conflicts:result.conflicts.length,cardCaptionUnderlays:result.cardCaptionUnderlays.length,occluded:result.occluded.length,hidden:result.hidden.length,errors:errors.length},null,2));
  if(result.clipped.length||result.conflicts.length||result.occluded.length||result.hidden.length||result.minTapeGap<0||errors.length)process.exitCode=1;
} finally { await browser.close(); }
