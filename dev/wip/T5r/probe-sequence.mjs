import fs from 'node:fs';
import { launch } from '../../../scripts/lib/cdp.mjs';
const browser=await launch({width:1920,height:1080});
try {
  const results=[];
  for(const [orient,width,height] of [['landscape',1920,1080],['portrait',1080,1920]]){
    const page=await browser.newPage();await page.viewport(width,height);
    const errors=[];
    page.on('Runtime.exceptionThrown',p=>errors.push(p.exceptionDetails?.exception?.description||p.exceptionDetails?.text));
    await page.goto('http://localhost:4323/demos/cases/archive-os/app/index.html?film=1&quality=original');
    await page.waitFor('window.__filmApp && window.__clock',30000);
    await page.eval('__filmApp.ready.then(()=>true)',120000);
    const result=await page.eval(`(async()=>{
      const {createSequence}=await import('./film/sequence.js');
      const seq=createSequence(window,35);__filmSkipRender=true;
      for(let i=0;i<4656;i++)await seq.step();
      return {log:seq.log,stats:seq.snapshot(),frame:__clock.frame};
    })()`,120000);
    result.orient=orient;result.errors=errors;
    results.push(result);
    console.log(JSON.stringify({orient,frame:result.frame,errors,actions:result.log.filter(x=>x.type==='key').map(x=>({t:x.t,key:x.key,before:x.before.selected,after:x.after.selected,from:x.before.cell,to:x.after.cell}))},null,2));
    await page.send('Page.close');
  }
  fs.writeFileSync('dev/shots/T5r/sequence.json',JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();}
