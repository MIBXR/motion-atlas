import fs from 'node:fs';
import vm from 'node:vm';
import {directEntry,openBrowser} from './plate.mjs';

const context={window:{}};
vm.runInNewContext(fs.readFileSync('demos/patterns/seekable-timeline/config.js','utf8'),context);
const config=context.window.CONFIG,C=context.window.CASE_CONFIG;
const round=t=>Math.round(t*1e6)/1e6,times=new Set([0,config.duration]);
for(let frame=0;frame<=Math.ceil(config.duration*30);frame++)times.add(round(Math.min(config.duration,frame/30)));
const caseTimes=[12,12.001,12.1,12.3,12.55,12.7,14,14.6,14.8,15,15.5,16.6];
for(const lyric of C.music.lyrics.filter(l=>l.t>=12&&l.t<=16.6))for(let i=0;i<Array.from(lyric.text).length;i++)caseTimes.push(lyric.t+.8*(i+.5)/Array.from(lyric.text).length);
for(const s of config.segments){
  for(const d of [0,.001,s.duration/2,Math.max(0,s.duration-.001),s.duration])times.add(round(s.start+d));
  for(const t of caseTimes){let p=(t-s.from)/(s.to-s.from);if(p<0||p>1)continue;if(s.mode==='drag')p=p<.5?Math.cbrt(p/4):1-Math.cbrt((1-p)/4);times.add(round(s.start+p*s.duration));}
}
const samples=[...times].sort((a,b)=>a-b),shots=[.5,2.3,4.5];
if(!process.argv.includes('--run')){console.log(JSON.stringify({mode:'prepared; no browser',duration:config.duration,samplesPerOrient:samples.length,total:samples.length*2,screenshots:shots}));process.exit(0);}
directEntry();
const dir='dev/shots/T4b/fix5-effects/seekable-timeline';fs.mkdirSync(dir,{recursive:true});
const report={plan:'latest-user-decision-seek-bottom-hud',execArgv:process.execArgv,nodeOptions:process.env.NODE_OPTIONS||'',samplesPlannedPerOrient:samples.length,samples:[],screenshots:[],collisions:[],failed:[],errors:[]};
const probe=`(()=>{
  const st=__motion.stage,root=st.root,sr=root.getBoundingClientRect(),scale=st.scale||1;
  const rect=r=>({x:(r.x-sr.x)/scale,y:(r.y-sr.y)/scale,w:r.width/scale,h:r.height/scale});
  const box=e=>rect(e.getBoundingClientRect());
  const shown=e=>{let a=1;for(let p=e;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden')return false;a*=Number(c.opacity);}return a>.05;};
  const hidden=['.hud-bottom','#hudgfx .stepper-g','.hud-fade.bottom'].map(selector=>{const e=root.querySelector(selector),cs=getComputedStyle(e);return{selector,display:cs.display,transform:cs.transform,rect:box(e),visibleDescendants:[e,...e.querySelectorAll('*')].filter(n=>shown(n)&&n.getBoundingClientRect().width&&n.getBoundingClientRect().height).length};});
  const retained=[['top HUD','.hud-top'],['MIKAN badge','#badge'],['controls','.mk-controls'],['attribution','.attrib']].map(([part,selector])=>{const e=root.querySelector(selector);return{part,shown:shown(e),rect:box(e)};});
  const ruler=[...root.querySelectorAll('#hudgfx .rl-base,#hudgfx .rl-fill,#hudgfx .rl-tick,#hudgfx .rl-head')].filter(shown).map(e=>{const r=box(e),stroke=parseFloat(getComputedStyle(e).strokeWidth)||0,pad=stroke/2;return{part:'top ruler '+e.getAttribute('class'),rect:{x:r.x-pad,y:r.y-pad,w:r.w+stroke,h:r.h+stroke}};});
  const card=root.querySelector('#cards .card'),targets=[];
  if(shown(card)){targets.push({part:'kix card',rect:box(card)});for(const e of card.querySelectorAll('.cd-cap b,.cd-cap span'))if(shown(e))targets.push({part:'kix caption',text:e.textContent,rect:box(e)});}
  const overlap=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),w=Math.min(a.x+a.w,b.x+b.w)-x,h=Math.min(a.y+a.h,b.y+b.h)-y;return w>.1&&h>.1?{x,y,w,h}:null;};
  const collisions=[],controls=retained.filter(p=>p.shown);
  for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++){const intersection=overlap(controls[i].rect,controls[j].rect);if(intersection)collisions.push({a:controls[i],b:controls[j],intersection});}
  for(const a of [...controls,...ruler])for(const b of targets){const intersection=overlap(a.rect,b.rect);if(intersection)collisions.push({a,target:b,intersection});}
  const bar=root.querySelector('.mk-controls'),attrib=root.querySelector('.attrib'),bb=box(bar),ab=box(attrib),gap=st.orient==='portrait'?18:12;
  const attributionGap=bb.y-(ab.y+ab.h),margin=(window.CASE_CONFIG||window.CONFIG).layout[st.orient].margin;
  const checks={removedGroupsCannotPaint:hidden.every(h=>h.display==='none'&&h.visibleDescendants===0&&h.rect.w===0&&h.rect.h===0),deltaRuleRemoved:getComputedStyle(root).getPropertyValue('--seek-hud-shift').trim()===''&&hidden.every(h=>h.transform==='none'),retainedVisible:retained.every(p=>p.shown),topRulerVisible:ruler.length>0,attributionGap:Math.abs(attributionGap-gap)<.1,attributionRightAligned:Math.abs(st.width-ab.x-ab.w-margin)<.1,barBottomUnchanged:Math.abs(st.height-bb.y-bb.h-(st.orient==='portrait'?34:30))<.1,barSidesUnchanged:Math.abs(bb.x-margin)<.1&&Math.abs(st.width-bb.x-bb.w-margin)<.1,noCollisions:collisions.length===0};
  return{orient:st.orient,stage:[st.width,st.height],bar:bb,attrib:ab,gap,attributionGap,hidden,retained,ruler,targets,checks,collisions};
})()`;
const browser=await openBrowser();
try{
  for(const orient of ['landscape','portrait']){
    const page=await browser.newPage();
    page.on('Runtime.exceptionThrown',e=>report.errors.push({orient,error:e.exceptionDetails?.exception?.description||e.exceptionDetails?.text}));
    try{
      await page.viewport(...(orient==='portrait'?[1080,1920]:[1920,1080]),1);
      await page.goto(`http://localhost:4322/demos/patterns/seekable-timeline/index.html?render=1&orient=${orient}`,60000);
      await page.waitFor('window.__motion',30000);await page.eval('Promise.resolve(__motion.ready).then(()=>true)',60000);await page.eval('__motion.pause()');
      for(const t of samples){
        await page.send('Page.bringToFront');await page.eval(`__motion.seek(${t})`,60000);
        const data=await page.eval(probe);report.samples.push({t,...data});
        report.collisions.push(...data.collisions.map(c=>({t,orient,...c})));
        const failures=Object.entries(data.checks).filter(([,pass])=>!pass).map(([name])=>name);
        if(failures.length)report.failed.push({t,orient,failures});
        if(shots.includes(t)){
          await page.eval('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
          const file=`${dir}/${orient}-${t}.png`;await page.screenshot(file);report.screenshots.push({t,orient,file});
        }
      }
    }catch(error){report.errors.push({orient,error:error.stack});}
    finally{await page.send('Page.close').catch(error=>report.errors.push({orient,error:error.message}));}
    fs.writeFileSync(dir+'/checks.json',JSON.stringify(report,null,2)+'\n');
  }
}finally{
  await browser.close();report.summary={sampled:report.samples.length,planned:samples.length*2,collisions:report.collisions.length,failedSamples:report.failed.length,errors:report.errors.length,screenshots:report.screenshots.length};
  fs.writeFileSync(dir+'/checks.json',JSON.stringify(report,null,2)+'\n');
  fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：latest-user-decision-seek-bottom-hud 全段判定执行${report.samples.length}/${samples.length*2}帧，相交${report.collisions.length}，失败采样${report.failed.length}，错误${report.errors.length}；效果截图${report.screenshots.length}张，证据 ${dir}/checks.json。\n`);
}
console.log(JSON.stringify(report.summary));if(report.summary.collisions||report.summary.failedSamples||report.summary.errors||report.summary.sampled!==report.summary.planned)process.exitCode=1;
