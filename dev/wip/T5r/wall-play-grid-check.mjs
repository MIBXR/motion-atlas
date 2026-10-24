import fs from 'node:fs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { launch } from '../../../scripts/lib/cdp.mjs';

const args=process.argv.slice(2),get=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const out=get('--out','dev/shots/T5r/wall-play-final');
const orientations=get('--orient','both')==='both'?['landscape','portrait']:[get('--orient')];
const fromFilter=args.includes('--from')?Number(get('--from')):null;
const timerMethod=get('--timer','page');
assert.ok(orientations.every(orient=>['landscape','portrait'].includes(orient)),'--orient must be landscape, portrait, or both.');
assert.ok(['page','cdp'].includes(timerMethod),'--timer must be page or cdp.');
fs.mkdirSync(out, { recursive: true });
const browser = await launch({ width: 1920, height: 1080 });
const result = { timerMethod, cases: [], errors: [] };
const state = `(() => {const win=document.querySelector('iframe').contentWindow,doc=win.document,s=win.__filmApp.stats();return {
  mode:doc.querySelector('#stage').dataset.mode,selected:s.selected,tab:s.activeTab,viewerOpen:s.viewerOpen,viewer:s.viewer,
  boot:doc.querySelector('#stage').dataset.boot,bootTime:s.bootTime,frame:win.__clock.frame,clockNow:win.__clock.now,
  inputs:__filmDriver.log.map(({t,type,key,selector,step,frame})=>({t,type,key,selector,step,frame}))
};})()`;
const rafProbe = `(() => {
  const native=requestAnimationFrame.bind(window),now=performance.now.bind(performance);
  const qa=window.__wallQA={until:0,releases:[],steps:[]};
  window.requestAnimationFrame=callback=>native(timestamp=>{
    const delay=qa.until-now();
    if(delay>0)setTimeout(()=>{qa.releases.push({at:now(),frame:document.querySelector('iframe')?.contentWindow.__clock?.frame});callback(now());},delay);
    else callback(timestamp);
  });
})();`;
function thumbnail(file) {
  const run=spawnSync(process.env.FFMPEG_PATH||'ffmpeg',['-v','error','-i',file,'-vf','scale=64:36:flags=area','-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
  assert.equal(run.status,0,run.stderr?.toString());assert.equal(run.stdout.length,64*36*3);return run.stdout;
}
try {
  for(const orient of orientations) {
    const page=await browser.newPage();
    page.on('Runtime.exceptionThrown',event=>result.errors.push(event.exceptionDetails.exception?.description||event.exceptionDetails.text));
    page.on('Runtime.consoleAPICalled',event=>{if(event.type==='error')result.errors.push(event.args.map(arg=>arg.description||arg.value||arg.type).join(' '));});
    await page.send('Page.addScriptToEvaluateOnNewDocument',{source:rafProbe});
    await page.viewport(...(orient==='landscape'?[1920,1080]:[1080,1920]));
    await page.goto(`http://localhost:4323/demos/cases/archive-os/index.html?autoplay=0&quality=original&orient=${orient}`,120000);
    await page.waitFor('window.__motion',30000);await page.eval('__motion.ready.then(()=>true)',120000);
    for(const config of [{from:21.5},{from:40},{from:60},...(orient==='landscape'?[{from:60,delay:650}]:[])].filter(config=>fromFilter===null||config.from===fromFilter)) {
      await page.eval(`__motion.seek(${config.from})`,60000);
      const name=`${orient}-${config.from}${config.delay?'-catchup':''}`;
      const startCode=`
        const win=document.querySelector('iframe').contentWindow,clock=win.__clock,nativeStep=clock.step;
        __wallQA.steps=[];__wallQA.releases=[];
        clock.step=function(...args){const before=clock.frame,skip=!!win.__filmSkipRender,begin=performance.now();const value=nativeStep.apply(clock,args);const end=performance.now();__wallQA.steps.push({before,frame:clock.frame,skip,begin,end,milliseconds:end-begin});return value;};
        const from=__motion.time,startFrame=clock.frame,started=performance.now();
        __wallQA.until=${config.delay||0}?started+${config.delay||0}:0;
        await __motion.play();`;
      const stopCode=`
        const pauseEnteredAt=performance.now();
        const wallSeconds=(performance.now()-started)/1000,pauseStarted=performance.now();
        const pauseReturn=__motion.pause();
        const sync={outer:__motion.time,iframe:clock.now/1000,frame:clock.frame,playing:__motion.playing};
        const pauseReturnedAt=performance.now(),pauseMilliseconds=pauseReturnedAt-pauseStarted;
        clock.step=nativeStep;
        return {from,startFrame,startedAt:started,pauseEnteredAt,pauseReturnedAt,wallSeconds,pauseMilliseconds,pauseReturnedPromise:!!pauseReturn?.then,sync,steps:__wallQA.steps,releases:__wallQA.releases};`;
      let timing;
      if(timerMethod==='page')timing=await page.eval(`(async()=>{${startCode}await new Promise(resolve=>setTimeout(resolve,5000));${stopCode}})()`,30000);
      else {
        const playRequestAt=performance.now();
        await page.eval(`(async()=>{${startCode}window.__wallSample={from,startFrame,started,clock,nativeStep};return true;})()`);
        const playResponseAt=performance.now();
        await new Promise(resolve=>setTimeout(resolve,5000));
        const pauseRequestAt=performance.now();
        timing=await page.eval(`(()=>{const{from,startFrame,started,clock,nativeStep}=window.__wallSample;${stopCode}})()`);
        const pauseResponseAt=performance.now();
        timing.node={playRequestAt,playResponseAt,pauseRequestAt,pauseResponseAt,requestDelaySeconds:(pauseRequestAt-playResponseAt)/1000,pauseRoundTripMs:pauseResponseAt-pauseRequestAt};
      }
      const item={name,orient,forcedRafDelayMs:config.delay||0,timing};
      item.timerOvershootSeconds=timing.wallSeconds-5;
      const gpuSteps=timing.steps.filter(step=>!step.skip),simulationSteps=timing.steps.filter(step=>step.skip);
      item.stepProfile={gpuSteps:gpuSteps.length,simulationSteps:simulationSteps.length,maxGpuStepHostMs:Math.max(0,...gpuSteps.map(step=>step.milliseconds)),maxSimulationStepHostMs:Math.max(0,...simulationSteps.map(step=>step.milliseconds))};
      item.actualRafDelayMs=timing.releases.length?timing.releases[0].at-timing.startedAt:0;
      item.advance=timing.sync.outer-timing.from;
      item.advanceFrames=Math.round(timing.sync.outer*60)-timing.startFrame;
      item.advanceGridSeconds=item.advanceFrames/60;
      item.differences={wallOuter:Math.abs(item.advance-timing.wallSeconds),wallIframe:Math.abs(timing.sync.iframe-timing.from-timing.wallSeconds),outerIframe:Math.abs(timing.sync.outer-timing.sync.iframe)};
      item.timingPass=item.advanceFrames>=4.9*60&&item.advanceFrames<=5.1*60&&item.differences.outerIframe<=1/60+1e-6&&!timing.sync.playing;
      item.stepsContiguous=timing.steps.every((step,index)=>step.frame===step.before+1&&step.before===(index?timing.steps[index-1].frame:timing.startFrame))&&timing.steps.length===timing.sync.frame-timing.startFrame;
      let run=0;item.maxSkippedRun=0;for(const step of timing.steps){run=step.skip?run+1:0;item.maxSkippedRun=Math.max(item.maxSkippedRun,run);}
      item.catchupPass=!config.delay||(timing.releases.length>0&&item.maxSkippedRun>30&&item.stepsContiguous);
      await page.eval('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      item.playDom=await page.eval(state);await page.screenshot(`${out}/${name}-play.png`);
      await page.eval(`__motion.seek(0).then(()=>__motion.seek(${timing.sync.outer}))`,60000);
      await page.eval('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      item.seekDom=await page.eval(state);await page.screenshot(`${out}/${name}-seek.png`);
      item.domMatches=JSON.stringify(item.playDom)===JSON.stringify(item.seekDom);
      const left=thumbnail(`${out}/${name}-play.png`),right=thumbnail(`${out}/${name}-seek.png`);
      let difference=0;for(let index=0;index<left.length;index++)difference+=Math.abs(left[index]-right[index]);
      item.mad255=difference/left.length;item.madNormalized=item.mad255/255;
      item.pass=item.timingPass&&item.stepsContiguous&&item.catchupPass&&item.domMatches&&item.mad255<2;
      result.cases.push(item);fs.writeFileSync(`${out}/result.json`,JSON.stringify(result,null,2)+'\n');
      console.log(JSON.stringify({name,pass:item.pass,advance:item.advance,advanceFrames:item.advanceFrames,advanceGridSeconds:item.advanceGridSeconds,wallSeconds:timing.wallSeconds,timerOvershootSeconds:item.timerOvershootSeconds,stepProfile:item.stepProfile,differences:item.differences,pauseMilliseconds:timing.pauseMilliseconds,steps:timing.steps.length,stepsContiguous:item.stepsContiguous,maxSkippedRun:item.maxSkippedRun,domMatches:item.domMatches,mad255:item.mad255}));
    }
    await page.send('Page.close');
  }
  assert.ok(result.cases.length>0,'No test cases matched the filters.');
  result.pass=result.errors.length===0&&result.cases.every(item=>item.pass);
  if(!result.pass)process.exitCode=1;
} catch(error) {result.error=error.stack||error.message;process.exitCode=1;}
finally {await browser.close();fs.writeFileSync(`${out}/result.json`,JSON.stringify(result,null,2)+'\n');}
