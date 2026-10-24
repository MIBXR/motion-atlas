import fs from 'node:fs';
import {directEntry,openBrowser,seekIdle} from './plate.mjs';

directEntry();
const jobs={'day-night-flip':[.5,2,3.5,5,6.5],'film-grain':[3.75,6.25]};
const root='dev/shots/T4b/fix5-effects';
const report={started:new Date().toISOString(),execArgv:process.execArgv,NODE_OPTIONS:process.env.NODE_OPTIONS||'',items:[],errors:[]};
const browser=await openBrowser();
try {
  for(const [id,times] of Object.entries(jobs))for(const orient of ['landscape','portrait']) {
    const dir=`${root}/${id}`;fs.mkdirSync(dir,{recursive:true});
    const page=await browser.newPage();
    page.on('Runtime.exceptionThrown',event=>report.errors.push({id,orient,error:event.exceptionDetails?.exception?.description||event.exceptionDetails?.text}));
    await page.viewport(...(orient==='portrait'?[1080,1920]:[1920,1080]),1);
    await page.goto(`http://localhost:4322/demos/patterns/${id}/index.html?render=1&orient=${orient}`,60000);
    await page.waitFor('window.__motion',30000);
    await page.eval('Promise.resolve(__motion.ready).then(()=>true)',60000);
    await page.eval('__motion.pause()');
    for(const t of times) {
      await page.send('Page.bringToFront');
      if(id==='day-night-flip')await seekIdle(page,t);
      else await page.eval(`__motion.seek(${t})`,60000);
      await page.eval('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
      const file=`${dir}/${orient}-${t}.png`;
      const state=await page.eval(`(()=>{
        const s=__motion.stage,r=s.root.getBoundingClientRect(),k=s.scale;
        const box=e=>{const b=e.getBoundingClientRect(),c=getComputedStyle(e);return{x:(b.x-r.x)/k,y:(b.y-r.y)/k,w:b.width/k,h:b.height/k,opacity:c.opacity,display:c.display,borderRadius:c.borderRadius,boxShadow:c.boxShadow};};
        const gl=window.__map?.painter?.context?.gl,ext=gl?.getExtension('WEBGL_debug_renderer_info');
        return{time:__motion.time,orient:s.orient,stage:[s.width,s.height],scale:k,renderer:gl?(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)):null,clock:document.querySelector('.hc-time').textContent,day:document.querySelector('.hd-title').textContent,date:document.querySelector('.hd-date').textContent,lyrics:document.querySelector('.np-lyric-text').textContent,night:getComputedStyle(s.root).getPropertyValue('--night'),attribution:box(document.querySelector('.attrib')),canvases:[...document.querySelectorAll('#plates canvas')].map(e=>({width:e.width,height:e.height,...box(e)}))};
      })()`);
      if(state.scale!==1)throw new Error('Expected native fixed stage');
      await page.screenshot(file);
      report.items.push({id,orient,t,file,...(id==='day-night-flip'?{caseT:+(t<4.5?31.3+t:36.6+t-4.5).toFixed(6)}:{}),state});
      fs.writeFileSync(`${root}/day-film-index.json`,JSON.stringify(report,null,2)+'\n');
      console.log(`${id}/${orient} ${t}`);
    }
    await page.send('Page.close');
    fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}: Saved ${id}/${orient} specified effect screenshots (${times.length}); no full acceptance.\n`);
  }
} finally {
  await browser.close();report.ended=new Date().toISOString();
  fs.writeFileSync(`${root}/day-film-index.json`,JSON.stringify(report,null,2)+'\n');
}
if(report.errors.length)process.exitCode=1;
