import fs from 'node:fs';
import {launch} from '../../../../scripts/lib/cdp.mjs';
import {seekIdle} from '../../T4b/tools/plate.mjs';

const output = 'dev/shots/R2/closeout';
fs.mkdirSync(output, {recursive: true});
const report = {stamps: [], labels: []};
const browser = await launch({width: 1080, height: 1920, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist']});
try {
  for (const [kind, id, times] of [['cases', 'map-pilgrimage', [13.8, 42.8, 52.4]], ['patterns', 'collect-counter', [2, 4.4, 5.8]]]) {
    console.log('open',id);
    const page = await browser.newPage();
    await page.viewport(1080, 1920, 1);
    await page.goto(`http://localhost:4322/demos/${kind}/${id}/index.html?render=1&orient=portrait`, 60000);
    await page.waitFor('window.__motion', 30000);
    await page.eval('Promise.resolve(__motion.ready).then(()=>true)', 60000);
    console.log('ready',id);
    await page.eval('__motion.pause()');
    for (const t of times) {
      console.log('seek',id,t);
      if (kind === 'cases') await seekIdle(page, t);
      else await page.eval(`__motion.seek(${t})`, 60000);
      await page.eval('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
      const state = await page.eval(`(() => {
        const c=window.CASE_CONFIG||CONFIG,l=c.layout.portrait;
        return {scale:__motion.stage.scale,stamps:[...document.querySelectorAll('.stamp')].map((g,i)=>{
          const m=g.getCTM(),r=Number(g.querySelector('.sp-slot').getAttribute('r'));
          return {x:m.e,scaleX:m.a,scaleY:m.d,bottom:m.f+r*m.d,expectedBottom:l.stamps.ys[i]+r,text:g.textContent};
        })};
      })()`);
      const pass=state.scale===1&&state.stamps.length===4&&state.stamps.every(s=>Math.abs(s.x-980)<.01&&Math.abs(s.scaleX-.917)<.00001&&Math.abs(s.scaleY-.917)<.00001&&Math.abs(s.bottom-s.expectedBottom)<.01);
      const file=`${output}/${id}-portrait-${t}.png`;
      await page.screenshot(file);
      report.stamps.push({id,t,file,pass,...state});
      fs.writeFileSync(`${output}/screenshots.json`,JSON.stringify(report,null,2)+'\n');
      if(!pass)throw Error('Stamp geometry failed '+id+' '+t);
    }
    await page.send('Page.close');
  }
  for(const name of ['cases','patterns']) {
    const page=await browser.newPage();
    await page.viewport(1440,900);
    await page.goto(`http://localhost:4322/${name}.html`,45000);
    await page.waitFor('document.querySelector(".hero-art text")');
    for(const width of [1440,800,390]) {
      await page.viewport(width,width===390?844:900);
      await page.eval('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
      const labels=await page.eval(`[...document.querySelectorAll('.hero-art text')].map(e=>{const m=e.getScreenCTM();return{text:e.textContent,px:parseFloat(getComputedStyle(e).fontSize)*Math.hypot(m.c,m.d)}})`);
      const pass=labels.every(x=>x.px>=12);
      report.labels.push({page:name,width,labels,pass});
      if(!pass)throw Error('Hero font failed '+name+' '+width);
    }
    await page.send('Page.close');
  }
} finally {
  await browser.close();
  fs.writeFileSync(`${output}/screenshots.json`,JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({stampScreenshots:report.stamps.length,stampPassed:report.stamps.filter(x=>x.pass).length,labelViewportChecks:report.labels.length,labelPassed:report.labels.filter(x=>x.pass).length}));
