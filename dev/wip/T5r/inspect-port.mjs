import fs from 'node:fs';
import { launch } from '../../../scripts/lib/cdp.mjs';
const browser=await launch({width:1920,height:1080});
try{
  const page=await browser.newPage(),errors=[];
  page.on('Runtime.exceptionThrown',p=>errors.push(p.exceptionDetails?.exception?.description||p.exceptionDetails?.text));
  const started=performance.now();
  await page.goto('http://localhost:4323/demos/cases/archive-os/index.html?render=1&quality=original');
  await page.waitFor('window.__motion',30000);await page.eval('__motion.ready.then(()=>true)',120000);
  console.log(JSON.stringify({readyMs:performance.now()-started,info:await page.eval('({duration:__motion.duration,A:__motion.A,B:__motion.B,progress:__motion.progress,frame:__filmDriver.frame,playing:__motion.playing})')}));
  fs.mkdirSync('dev/shots/T5r/port',{recursive:true});
  for(const t of [2,22.5,44,55,59,75.6]){
    const start=performance.now();await page.eval(`__motion.seek(${t})`,60000);
    await page.eval('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    console.log(JSON.stringify({t,seekMs:performance.now()-start,state:await page.eval(`(()=>{const s=document.querySelector('iframe').contentWindow.__filmApp.stats();return{mode:s.mode,selected:s.selected,tab:s.activeTab,viewerOpen:s.viewerOpen,viewer:s.viewer}})()`)}));
    await page.screenshot(`dev/shots/T5r/port/landscape-${t}.png`);
  }
  console.log(JSON.stringify({errors}));
}finally{await browser.close();}
