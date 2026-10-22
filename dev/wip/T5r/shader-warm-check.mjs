import fs from 'node:fs';
import { launch } from '../../../scripts/lib/cdp.mjs';

const args=process.argv.slice(2),get=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const smokePrefix=args.includes('--smoke-prefix');
const domProbe=args.includes('--dom-probe');
const entry=JSON.parse(fs.readFileSync(new URL('../../../entries/cases/archive-os.json',import.meta.url),'utf8'));
const gpu=entry.renderer==='gpu',browserArgs=gpu?['--enable-gpu','--use-angle=d3d11','--ignore-gpu-blocklist']:[];
const out=get('--out','dev/shots/T5r/shader-warm-baseline'),quality=get('--quality','auto');
if(!['auto','original','performance'].includes(quality))throw new Error('--quality must be auto, original, or performance.');
fs.mkdirSync(out,{recursive:true});
const result={requestedQuality:quality,entryRenderer:entry.renderer??null,hardwareRequested:gpu,launchArgs:browserArgs,smokePrefix,domProbe,stages:[],errors:[]};
const installProbe=`(() => {
  const now=performance.now.bind(performance),createdAt=now(),threshold=1000/60;
  const shaders=new WeakMap(),programs=new WeakMap(),contexts=new WeakMap(),activePrograms=new WeakMap(),seen=new Set(),totals=new Map();
  const shaderList=[],programList=[],contextList=[],calls=[],steps=[];
  const domCalls=[],domTotals=new Map(),domSeen=new Set();
  if(window===parent)window.__shaderWarmDocuments=[];
  let phase='loading',readyAt=null;
  const contextInfo=gl=>{
    let info=contexts.get(gl);if(!info){info={id:contextList.length+1,type:gl.constructor.name,canvasId:gl.canvas.id||'',parentId:gl.canvas.parentElement?.id||''};contexts.set(gl,info);contextList.push(info);}return info;
  };
  const shaderInfo=shader=>{
    let info=shaders.get(shader);if(!info){info={id:shaderList.length+1,name:'',type:''};shaders.set(shader,info);shaderList.push(info);}return info;
  };
  const programInfo=program=>{
    let info=programs.get(program);if(!info){info={id:programList.length+1,shaderIds:[],firstUseAt:null,firstUsePhase:null};programs.set(program,info);programList.push(info);}return info;
  };
  const label=info=>info.shaderIds?info.shaderIds.map(id=>shaderList[id-1].name||shaderList[id-1].type).filter(Boolean).filter((value,index,list)=>list.indexOf(value)===index).join(' / '):info.name||info.type;
  const elementLabel=element=>element instanceof Element?{tag:element.tagName,id:element.id,class:element.getAttribute('class')}:null;
  function measureDom(method,target,args,native){
    const begin=now(),callPhase=phase,frame=window.__clock?.frame??null;
    let result;
    try{return result=native.apply(target,args);}finally{
      const end=now(),milliseconds=end-begin,key=callPhase+'|'+method;
      let total=domTotals.get(key);if(!total){total={phase:callPhase,method,count:0,milliseconds:0,maxMilliseconds:0,longCount:0,longMilliseconds:0};domTotals.set(key,total);}
      total.count++;total.milliseconds+=milliseconds;total.maxMilliseconds=Math.max(total.maxMilliseconds,milliseconds);if(milliseconds>=threshold){total.longCount++;total.longMilliseconds+=milliseconds;}
      const first=!domSeen.has(key);domSeen.add(key);
      if(first||milliseconds>=threshold)domCalls.push({phase:callPhase,method,element:elementLabel(method==='getComputedStyle'?args[0]:target),args:method==='getComputedStyle'?[elementLabel(args[0]),args[1]??null]:args,returnValue:method==='getBoundingClientRect'&&result?{x:result.x,y:result.y,width:result.width,height:result.height}:method==='getComputedStyle'?'CSSStyleDeclaration':result,frame,firstForPhase:first,begin,end,milliseconds});
    }
  }
  if(${domProbe}){
    for(const [prototype,name] of [[HTMLElement.prototype,'focus'],[Element.prototype,'getBoundingClientRect'],[window,'getComputedStyle']]){const native=prototype[name];prototype[name]=function(...args){return measureDom(name,this,args,native);};}
    for(const name of ['width','height']){const descriptor=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,name),native=descriptor.set;Object.defineProperty(HTMLCanvasElement.prototype,name,{...descriptor,set(value){return measureDom('canvas.'+name,this,[value],native);}});}
  }
  function measure(gl,method,args,native,info){
    const context=contextInfo(gl),begin=now(),callPhase=phase,frame=window.__clock?.frame??null;
    try{return native.apply(gl,args);}finally{
      const end=now(),milliseconds=end-begin,pname=method==='getProgramParameter'?args[1]:null,material=info?label(info)||'(unnamed)':'(no active program)';
      const key=[callPhase,context.id,method,material,pname].join('|');
      let total=totals.get(key);if(!total){total={phase:callPhase,contextId:context.id,method,material,pname,count:0,milliseconds:0,maxMilliseconds:0,longCount:0,longMilliseconds:0};totals.set(key,total);}
      total.count++;total.milliseconds+=milliseconds;total.maxMilliseconds=Math.max(total.maxMilliseconds,milliseconds);
      if(milliseconds>=threshold){total.longCount++;total.longMilliseconds+=milliseconds;}
      const firstKey=[callPhase,context.id,method,info?.id||0,pname].join('|'),first=!seen.has(firstKey);seen.add(firstKey);
      if(first||milliseconds>=threshold)calls.push({phase:callPhase,contextId:context.id,method,programId:info?.shaderIds?info.id:null,shaderId:info&&!info.shaderIds?info.id:null,material,pname,frame,firstForPhase:first,begin,end,milliseconds});
    }
  }
  for(const prototype of [window.WebGLRenderingContext?.prototype,window.WebGL2RenderingContext?.prototype].filter(Boolean)){
    const wrap=(name,factory)=>{const native=prototype[name];if(!native||native.__shaderWarmProbe)return;const wrapped=factory(native);wrapped.__shaderWarmProbe=true;prototype[name]=wrapped;};
    wrap('shaderSource',native=>function(shader,source){const info=shaderInfo(shader);info.name=source.match(/^\\s*#define\\s+SHADER_NAME[ \\t]*([^\\r\\n]*)/m)?.[1]?.trim()||'';info.type=source.match(/^\\s*#define\\s+SHADER_TYPE[ \\t]*([^\\r\\n]*)/m)?.[1]?.trim()||'';return native.call(this,shader,source);});
    wrap('attachShader',native=>function(program,shader){const info=programInfo(program),id=shaderInfo(shader).id;if(!info.shaderIds.includes(id))info.shaderIds.push(id);return native.call(this,program,shader);});
    wrap('useProgram',native=>function(program){activePrograms.set(this,program);if(!program)return native.call(this,program);const info=programInfo(program);if(info.firstUseAt!==null)return native.call(this,program);info.firstUseAt=now();info.firstUsePhase=phase;return measure(this,'useProgram',arguments,native,info);});
    for(const name of ['getProgramInfoLog','getProgramParameter'])wrap(name,native=>function(program,...rest){return measure(this,name,[program,...rest],native,programInfo(program));});
    wrap('getShaderInfoLog',native=>function(shader){return measure(this,'getShaderInfoLog',[shader],native,shaderInfo(shader));});
    if(${smokePrefix})for(const name of ['bufferData','texImage2D','clear','drawElements','drawElementsInstanced','drawArrays','drawArraysInstanced','getUniformLocation'])wrap(name,native=>function(...args){const program=name==='getUniformLocation'?args[0]:activePrograms.get(this);return measure(this,name,args,native,program?programInfo(program):null);});
  }
  function wrapClock(){const clock=window.__clock;if(!clock||clock.step.__shaderWarmProbe)return;const native=clock.step,wrapped=function(...args){const begin=now(),before=clock.frame,skip=!!window.__filmSkipRender,stepPhase=phase;try{return native.apply(clock,args);}finally{const end=now();steps.push({phase:stepPhase,before,frame:clock.frame,skip,begin,end,milliseconds:end-begin});}};wrapped.__shaderWarmProbe=true;clock.step=wrapped;}
  addEventListener('film:progress',event=>{if(event.detail?.frame&&!readyAt){readyAt=now();phase=${smokePrefix}?parent.__shaderWarmPhase||'after-ready':'after-ready';if(${smokePrefix})wrapClock();}});
  window.__shaderWarmProbe={
    setPhase(value){phase=value;},
    wrapClock,
    snapshot(){return{createdAt,readyAt,appReadyMs:readyAt===null?null:readyAt-createdAt,longThresholdMs:threshold,contexts:contextList,shaders:shaderList,programs:programList.map(info=>({...info,material:label(info)})),totals:[...totals.values()],calls,steps,domTotals:[...domTotals.values()],domCalls};},
  };
  if(${smokePrefix}&&window!==parent)parent.__shaderWarmDocuments.push({url:location.href,probe:window.__shaderWarmProbe});
})();`;
const browser=await launch({...(smokePrefix?{width:1280,height:720}:{width:1920,height:1080}),args:browserArgs});
result.browser=browser.exe;
try{
  const page=await browser.newPage();
  page.on('Runtime.exceptionThrown',event=>result.errors.push(event.exceptionDetails.exception?.description||event.exceptionDetails.text));
  page.on('Runtime.consoleAPICalled',event=>{if(event.type==='error')result.errors.push(event.args.map(arg=>arg.description||arg.value||arg.type).join(' '));});
  await page.send('Page.addScriptToEvaluateOnNewDocument',{source:installProbe});
  const url=new URL('http://localhost:4323/demos/cases/archive-os/index.html');if(smokePrefix){url.searchParams.set('render','1');url.searchParams.set('orient','landscape');}else url.searchParams.set('autoplay','0');if(quality!=='auto')url.searchParams.set('quality',quality);
  const started=performance.now();await page.goto(url.href,120000);await page.waitFor('window.__motion',30000);await page.eval('__motion.ready.then(()=>true)',180000);
  result.readyTotalMs=performance.now()-started;
  result.ready=await page.eval(`(()=>{const win=document.querySelector('iframe').contentWindow,doc=win.document,gl=doc.querySelector('#three-scene canvas').getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');const renderer=gl.getParameter(debug?debug.UNMASKED_RENDERER_WEBGL:gl.RENDERER);return{renderer,software:/swiftshader|llvmpipe|software|microsoft basic render/i.test(renderer),quality:__filmDriver.quality,renderQuality:doc.querySelector('#three-scene').dataset.renderQuality||null,shadersMs:win.__filmApp.metrics?.shadersMs??null,metrics:win.__filmApp.metrics??null,appModule:doc.querySelector('script[type=module]')?.src,probe:win.__shaderWarmProbe.snapshot()};})()`);
  fs.writeFileSync(`${out}/ready.json`,JSON.stringify(result.ready,null,2)+'\n');
  if(gpu&&result.ready.software)throw new Error('Entry renderer=gpu requires hardware WebGL; received '+result.ready.renderer);
  if(!smokePrefix)await page.screenshot(`${out}/ready.png`);
  if(smokePrefix){
    const fontProbe=fs.readFileSync('scripts/smoke.mjs','utf8').match(/const REFERENCE_FONT_PROBE = `([\s\S]*?)`;/)[1];
    const state=`(()=>{const win=document.querySelector('iframe').contentWindow;return{playing:__motion.playing,time:__motion.time,frame:win.__clock?.frame,clockNow:win.__clock?.now,quality:__filmDriver.quality,stats:win.__filmApp?.stats(),log:__filmDriver.log,probe:win.__shaderWarmProbe?.snapshot()};})()`;
    const save=()=>fs.writeFileSync(`${out}/result.json`,JSON.stringify(result,null,2)+'\n');
    async function measure(label,expression,timeout=60000){
      await page.eval(`window.__shaderWarmPhase=${JSON.stringify(label)};document.querySelector('iframe').contentWindow.__shaderWarmProbe.setPhase(${JSON.stringify(label)})`);
      const entry={label,status:'pending',startedAt:new Date().toISOString(),before:await page.eval(state)};result.stages.push(entry);save();
      const begin=performance.now();try{entry.value=await page.eval(expression,timeout);entry.status='complete';}catch(error){entry.status='error';entry.error=error.stack||error.message;throw error;}finally{entry.milliseconds=performance.now()-begin;entry.after=await page.eval(state);fs.writeFileSync(`${out}/${label}.json`,JSON.stringify(entry,null,2)+'\n');save();console.log(JSON.stringify({label,status:entry.status,milliseconds:entry.milliseconds,playing:entry.after.playing,time:entry.after.time,frame:entry.after.frame}));}
      return entry;
    }
    const D=await page.eval('__motion.duration');
    await measure('sweep',`(()=>{const m=window.__motion;m.pause();for(let t=0;t<=${D};t+=0.2)m.seek(t);m.seek(${D});return true;})()`);
    await measure('seek0-play','(window.__motion.seek(0),window.__motion.play(),window.__motion.time)');
    await measure('play1500','new Promise(r=>setTimeout(r,1500))');
    await measure('read-time','window.__motion.time');
    await measure('pause','window.__motion.pause()');
    for(const target of [0,7.76,22,23.28,35,38.8,42.5,49]){
      if(target===49)fs.writeFileSync(`${out}/before-49.json`,JSON.stringify(await page.eval(state),null,2)+'\n');
      const entry=await measure(`seek-${target}`,`window.__motion.seek(${target})`,target===49?180000:30000);
      entry.fonts=await page.eval(fontProbe,30000);fs.writeFileSync(`${out}/seek-${target}.json`,JSON.stringify(entry,null,2)+'\n');save();
      if(target===49)result.smokeSeek49Passed=entry.milliseconds<30000;
    }
    result.documents=await page.eval(`window.__shaderWarmDocuments.map(item=>({url:item.url,...item.probe.snapshot()}))`);
  }else{
  await page.eval(`(()=>{__motion.pause();const probe=document.querySelector('iframe').contentWindow.__shaderWarmProbe;probe.setPhase('ready');probe.wrapClock();})()`);
  for(const target of [23.28,36,50]){
    await page.eval(`__motion.pause();document.querySelector('iframe').contentWindow.__shaderWarmProbe.setPhase('seek:${target}')`);
    const seekStarted=performance.now();await page.eval(`__motion.seek(${target})`,180000);
    const milliseconds=performance.now()-seekStarted;
    await page.eval('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const stage=await page.eval(`(()=>{const win=document.querySelector('iframe').contentWindow,probe=win.__shaderWarmProbe.snapshot(),phase='seek:${target}';return{target:${target},outer:__motion.time,frame:win.__clock.frame,clockNow:win.__clock.now,quality:__filmDriver.quality,shadersMs:win.__filmApp.metrics?.shadersMs??null,stats:win.__filmApp.stats(),totals:probe.totals.filter(item=>item.phase===phase),calls:probe.calls.filter(item=>item.phase===phase),steps:probe.steps.filter(item=>item.phase===phase),programs:probe.programs};})()`);
    stage.milliseconds=milliseconds;stage.longCalls=stage.calls.filter(call=>call.milliseconds>=1000/60);stage.longCallMilliseconds=stage.totals.reduce((sum,item)=>sum+item.longMilliseconds,0);
    await page.screenshot(`${out}/seek-${target}.png`);fs.writeFileSync(`${out}/seek-${target}.json`,JSON.stringify(stage,null,2)+'\n');
    result.stages.push({target,milliseconds,outer:stage.outer,frame:stage.frame,clockNow:stage.clockNow,quality:stage.quality,longCalls:stage.longCalls.length,longCallMilliseconds:stage.longCallMilliseconds,maxStepMs:Math.max(0,...stage.steps.map(step=>step.milliseconds)),stepCount:stage.steps.length});
    console.log(JSON.stringify(result.stages.at(-1)));
  }
  result.finalProbe=await page.eval(`document.querySelector('iframe').contentWindow.__shaderWarmProbe.snapshot()`);
  }
  if(result.errors.length)process.exitCode=1;
}catch(error){result.error=error.stack||error.message;process.exitCode=1;}
finally{await browser.close();fs.writeFileSync(`${out}/result.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({readyTotalMs:result.readyTotalMs,renderer:result.ready?.renderer,software:result.ready?.software,quality:result.ready?.quality,shadersMs:result.ready?.shadersMs,stages:result.stages.map(s=>smokePrefix?{label:s.label,status:s.status,milliseconds:s.milliseconds,playing:s.after?.playing,time:s.after?.time,frame:s.after?.frame}:s),errors:result.errors,error:result.error}));}
