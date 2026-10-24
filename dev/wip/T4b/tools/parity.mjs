import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {directEntry,openBrowser,openCase} from './plate.mjs';

directEntry();
const ids = ['corner-hud','vertical-title-blur','route-draw-marker','day-night-flip','card-expand-fullscreen','chapter-frame','split-compare-stamp','collect-counter','alert-reroute','outro-stat-stack','seekable-timeline','film-grain'];
const args = process.argv.slice(2), oi = args.indexOf('--only');
const previous=fs.existsSync('dev/shots/T4b/parity/index.json')?JSON.parse(fs.readFileSync('dev/shots/T4b/parity/index.json','utf8')):{rows:[],errors:[]};
const pending=args.includes('--pending');
const requested=oi < 0 ? ids : args[oi+1].split(',');
const only=requested.filter(id=>!pending||previous.rows.some(r=>r.id===id&&r.current===false));
const configs = Object.fromEntries(only.map(id=>{const ctx={window:{}};vm.runInNewContext(fs.readFileSync(`demos/patterns/${id}/config.js`,'utf8'),ctx);return [id,ctx.window.CONFIG];}));
const round = n => Math.round(n*1000000)/1000000;
const ease = p => p<.5?4*p*p*p:1-((-2*p+2)**3)/2;
function reference(config,segment,t) {
  if (config.id === 'film-grain') return {caseT:segment.from,note:'The pattern holds this source canvas state, enlarges it to the stage, and applies the specified 1.00–1.04 push.'};
  if (config.id === 'route-draw-marker') {
    const actions=config.actions.filter(a=>a.at<=t);
    const action=actions.at(-1);
    return {caseT:round(action.from+Math.min(t-action.at,action.to-action.from)),action,actionStates:actions.map(a=>({...a,caseT:round(a.from+Math.min(t-a.at,a.to-a.from))})),note:'The primary reference follows the latest action. Concurrent actions retain their independent case clocks in actionStates.'};
  }
  const p=Math.max(0,Math.min(1,(t-segment.start)/segment.duration));
  const caseT=segment.from+(segment.to-segment.from)*(segment.mode==='drag'?ease(p):p);
  const note=config.id==='day-night-flip'?'HUD values use the fixed caseT 34.5 camera, while this reference follows the specified day/night interval.':config.id==='alert-reroute'?'The pattern uses the approved fixed camera. The reference retains the original case camera at caseT; anchored positions may differ.':null;
  return {caseT:round(caseT),...(note?{note}:{})};
}
const sourceDir='dev/shots/T4b/parity/source';
fs.mkdirSync(sourceDir,{recursive:true});
const inventory=fs.readdirSync('dev/shots/T4b/inventory',{recursive:true}).filter(f=>f.endsWith('.png'));
const key=r=>`${r.id}:${r.orient}:${r.t}`;
const targets=only.flatMap(id=>['landscape','portrait'].flatMap(orient=>configs[id].segments.flatMap((s,segment)=>[.2,s.duration/2,s.duration-.2].map(offset=>({id,orient,t:round(s.start+offset),segment}))))).filter(r=>!pending||previous.rows.some(p=>key(p)===key(r)&&p.current===false));
const targetKeys=new Set(targets.map(key));
const manifest={rows:previous.rows.filter(r=>!targetKeys.has(key(r))),errors:previous.errors.filter(r=>!only.includes(r.id))};
const freshCases=new Set();
const browser=await openBrowser();
try {
  for (const orient of ['landscape','portrait']) {
    const source=await openCase(browser,orient);
    for (const id of only) {
      const jobs=targets.filter(r=>r.id===id&&r.orient===orient);
      if(!jobs.length)continue;
      const config=configs[id],dir=`dev/shots/T4b/parity/${id}`;
      fs.mkdirSync(dir,{recursive:true});
      const page=await browser.newPage();
      await page.viewport(...(orient==='portrait'?[1080,1920]:[1920,1080]),1);
      const errors=[];
      page.on('Runtime.exceptionThrown',p=>errors.push(p.exceptionDetails?.exception?.description||p.exceptionDetails?.text));
      await page.goto(`http://localhost:4322/demos/patterns/${id}/index.html?render=1&orient=${orient}`,60000);
      await page.waitFor('window.__motion',30000);
      await page.eval('Promise.resolve(__motion.ready).then(()=>true)',60000);
      await page.eval('__motion.pause()');
      for (const job of jobs) {
          const si=job.segment,segment=config.segments[si],t=job.t,ref=reference(config,segment,t);
          await page.send('Page.bringToFront');
          await page.eval(`__motion.seek(${t})`,60000);
          await page.eval('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
          const pattern=`${dir}/${orient}-${t}-pattern.png`;
          await page.screenshot(pattern);
          let caseFile=`${sourceDir}/${orient}-${ref.caseT}.png`,reused=null;
          const markerAffected=['route-draw-marker','card-expand-fullscreen','alert-reroute'].includes(id);
          if (!fs.existsSync(caseFile) || (markerAffected&&!freshCases.has(caseFile))) {
            const filename=`case-${orient}-${ref.caseT}.png`;
            const hit=!markerAffected&&inventory.find(file=>path.basename(file)===filename);
            if(hit){reused=path.join('dev/shots/T4b/inventory',hit);fs.copyFileSync(reused,caseFile);}
            else {
              await source.send('Page.bringToFront');
              await source.eval(`__motion.seek(${ref.caseT})`,60000);
              await source.eval('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
              await source.screenshot(caseFile);freshCases.add(caseFile);
            }
          }
          const file=`${dir}/${orient}-${t}.png`;
          const combine=spawnSync('ffmpeg',['-y','-loglevel','error','-i',pattern,'-i',caseFile,'-filter_complex','[0:v][1:v]hstack=inputs=2','-frames:v','1',file],{encoding:'utf8'});
          if(combine.status!==0)throw new Error(combine.stderr||combine.error?.message||'Parity hstack failed');
          manifest.rows.push({id,orient,t,segment:si,from:segment.from,to:segment.to,...ref,pattern,case:caseFile,file,reused,current:true});
      }
      await page.send('Page.close');
      manifest.errors.push(...errors.map(error=>({id,orient,error})));
      fs.writeFileSync('dev/shots/T4b/parity/index.json',JSON.stringify(manifest,null,2)+'\n');
      fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：${id}/${orient} 每段3时刻的巧思与原案例左右对照图已保存至 ${dir}，对应caseT及指定组合差异见 parity/index.json。\n`);
      console.log(`parity ${id}/${orient}: ${jobs.length} pairs`);
    }
    await source.send('Page.close');
  }
} finally {await browser.close();}
console.log(JSON.stringify({sampled:targets.length,pairs:manifest.rows.length,current:manifest.rows.filter(r=>r.current).length,errors:manifest.errors.length}));
if(manifest.errors.length)process.exitCode=1;
