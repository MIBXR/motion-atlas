import fs from 'node:fs';
import { launch } from '../../../scripts/lib/cdp.mjs';
const browser=await launch({width:1920,height:1080});
const result=[];
const only=process.argv[process.argv.indexOf('--orient')+1];
try{
  for(const [orient,width,height] of [['landscape',1920,1080],['portrait',1080,1920]]){
    if(process.argv.includes('--orient')&&only!==orient)continue;
    const page=await browser.newPage();await page.viewport(width,height);
    let bytes=0,cold=true;
    page.on('Network.loadingFinished',p=>{if(cold)bytes+=p.encodedDataLength;});
    await page.send('Network.enable');await page.send('Network.setCacheDisabled',{cacheDisabled:true});
    const started=performance.now();
    await page.goto(`http://localhost:4323/demos/cases/archive-os/index.html?render=1&quality=original&orient=${orient}`);
    await page.waitFor('__motion?.ready',30000);await page.eval('__motion.ready.then(()=>true)',120000);
    const r={orient,readyMs:performance.now()-started,downloadBytes:bytes};
    cold=false;await page.send('Network.setCacheDisabled',{cacheDisabled:false});
    const forward=performance.now();await page.eval('__motion.seek(__motion.duration)',60000);
    r.forwardMs=performance.now()-forward;r.forwardRealtimeMultiple=77.6/(r.forwardMs/1000);
    const backward=performance.now();await page.eval('__motion.seek(30)',60000);
    r.endTo30Ms=performance.now()-backward;
    r.marks=await page.eval('performance.getEntriesByType("mark").map(x=>({name:x.name,t:x.startTime}))');
    if(r.endTo30Ms>6000&&!process.argv.includes('--no-profile')){
      await page.eval('__motion.seek(__motion.duration)',60000);
      await page.send('Profiler.enable');await page.send('Profiler.start');
      await page.eval('__motion.seek(30)',60000);
      const profile=(await page.send('Profiler.stop')).profile;
      fs.writeFileSync(`dev/shots/T5r/profile-${orient}.json`,JSON.stringify(profile));
      r.profileTop=profile.nodes.filter(n=>n.hitCount).sort((a,b)=>b.hitCount-a.hitCount).slice(0,15).map(n=>({hits:n.hitCount,...n.callFrame}));
    }
    result.push(r);console.log(JSON.stringify(r,null,2));
    await page.send('Page.close');
  }
}finally{await browser.close();fs.writeFileSync('dev/shots/T5r/performance.json',JSON.stringify(result,null,2)+'\n');}
