import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { launch } from '../../../scripts/lib/cdp.mjs';

const args=process.argv.slice(2);
const get=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const tag=get('--tag','final');
const quick=args.includes('--quick');
const native=args.includes('--native');
const subset=get('--targets','').split(',').filter(Boolean).map(Number);
const out=path.join('dev/shots/T13/seek',tag);
fs.mkdirSync(out,{recursive:true});
const log=[];
const say=value=>{const s=typeof value==='string'?value:JSON.stringify(value);log.push(s);fs.writeFileSync(path.join(out,'run.log'),log.join('\n')+'\n');console.log(s);};
const SNAPSHOT=`(() => {
  const stage=document.querySelector('#stage'), nodes={};
  const key=e=>e===stage?'#stage':key(e.parentElement)+'>'+e.tagName.toLowerCase()+':nth-of-type('+([...e.parentElement.children].filter(x=>x.tagName===e.tagName).indexOf(e)+1)+')';
  const effective=e=>{let opacity=1;for(let p=e;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||s.visibility==='collapse')return {visible:false,opacity:0,hiddenReason:'css-hidden'};opacity*=+s.opacity;}const alpha=+opacity.toFixed(6);if(opacity<=.0001)return {visible:false,opacity:alpha,hiddenReason:'transparent'};if(e instanceof SVGGraphicsElement){if(e.tagName.toLowerCase()==='path'&&!e.getAttribute('d')?.trim())return {visible:false,opacity:alpha,hiddenReason:'empty-path'};const b=e.getBBox();if(!b.width&&!b.height)return {visible:false,opacity:alpha,hiddenReason:'empty-svg-geometry'};}return {visible:true,opacity:alpha};};
  for(const e of [stage,...stage.querySelectorAll('*')]) {
    if(e.closest('#map'))continue;
    const s=getComputedStyle(e), attrs={};
    for(const a of e.attributes)if(!['class','style'].includes(a.name))attrs[a.name]=a.value;
    const inline=Object.fromEntries([...e.style].sort().map(k=>{const v=e.style.getPropertyValue(k);return [k,v.startsWith('url("data:image/')?'inline-image:'+v.length:v];}));
    nodes[key(e)]={tag:e.tagName,id:e.id,class:[...e.classList].sort().join(' '),attrs,inline,text:e.children.length?'':e.textContent,...effective(e),computed:{display:s.display,visibility:s.visibility,opacity:s.opacity,transform:s.transform,filter:s.filter,clipPath:s.clipPath,color:s.color,background:s.backgroundColor}};
  }
  const map=window.__map, routes={};
  if(map)for(const route of window.CONFIG.tracks.routes){const id='rt-'+route.id,source=map.getSource(id);routes[id]={data:source?JSON.parse(JSON.stringify(source._data)):null,layers:map.getStyle().layers.filter(l=>l.source===id).map(l=>({id:l.id,layout:l.layout,paint:l.paint}))};}
  const camera=map?{center:map.getCenter().toArray(),zoom:map.getZoom(),pitch:map.getPitch(),bearing:map.getBearing(),padding:map.getPadding()}:null;
  return {orient:window.__motion.orient,time:window.__motion.time,nodes,routes,camera:JSON.parse(JSON.stringify(camera,(_,v)=>typeof v==='number'?+v.toFixed(9):v))};
})()`;
const compare=(reference,actual)=>{
  const visible=[],hidden=[];
  for(const key of new Set([...Object.keys(reference.nodes),...Object.keys(actual.nodes)])){
    const a=reference.nodes[key],b=actual.nodes[key];
    if(JSON.stringify(a)===JSON.stringify(b))continue;
    const fields=[...new Set([...Object.keys(a||{}),...Object.keys(b||{})])].filter(k=>JSON.stringify(a?.[k])!==JSON.stringify(b?.[k]));
    const item={key,id:b?.id||a?.id,class:b?.class||a?.class,fields,changes:Object.fromEntries(fields.map(k=>[k,{reference:a?.[k],actual:b?.[k]}]))};
    (a?.visible||b?.visible?visible:hidden).push(item);
  }
  const routes=[];
  for(const id of new Set([...Object.keys(reference.routes),...Object.keys(actual.routes)]))if(JSON.stringify(reference.routes[id])!==JSON.stringify(actual.routes[id]))routes.push({id,reference:reference.routes[id],actual:actual.routes[id]});
  return {visible,hidden,routes,camera:JSON.stringify(reference.camera)===JSON.stringify(actual.camera)?null:{reference:reference.camera,actual:actual.camera}};
};
const boundaries=[0,3,4,8,11.6,12,14.6,15,18,18.6,21,21.6,23.8,24.35,24.4,25.6,29.2,32.8,34,34.4,36.4,36.6,37,40.8,41.2,44,45,47.4,47.6,50,50.6,54,54.6,56,60];
const context={window:{}};
vm.runInNewContext(fs.readFileSync('demos/cases/map-pilgrimage/config.js','utf8'),context);
const tracks=context.window.CONFIG.tracks;
boundaries.push(7.3,7.9,8.2,tracks.outro.t+.5);
for(const name of ['cards','chapter','flashback','compare','toast','note','alert','dayCard','locTitle'])for(const item of tracks[name]||[])boundaries.push(...[item.t,item.until,Number.isFinite(item.dur)?item.t+item.dur:undefined].filter(Number.isFinite));
const targets=[...new Set([...boundaries.flatMap(t=>[Math.max(0,t-.01),Math.min(60,t+.01)]),0,13.1,13.6,21.4,24.033333,27.2,41.8,58.5,60,3.105].map(x=>+x.toFixed(6)))].sort((a,b)=>a-b);
const browser=await launch({width:native?1920:960,height:native?1080:540,args:['--no-proxy-server']});
const errors=[];
const results=[];
const record=result=>{results.push(result);fs.appendFileSync(path.join(out,'checks.jsonl'),JSON.stringify(result)+'\n');};
fs.writeFileSync(path.join(out,'checks.jsonl'),'');
try {
  for(const orient of quick?['portrait']:['landscape','portrait']) {
    const page=await browser.newPage();
    await page.viewport(...(orient==='portrait'?(native?[1080,1920,1]:[540,960,1]):(native?[1920,1080,1]:[960,540,1])));
    page.on('Runtime.exceptionThrown',p=>errors.push({orient,type:'exception',message:p.exceptionDetails?.exception?.description||p.exceptionDetails?.text}));
    page.on('Runtime.consoleAPICalled',p=>{if(p.type==='error')errors.push({orient,type:'console',message:p.args.map(a=>a.value??a.description).join(' ')});});
    await page.goto('http://localhost:4321/demos/cases/map-pilgrimage/index.html?render=1&embed=1&orient='+orient,60000);
    await page.waitFor('window.__motion',30000);
    await page.eval('Promise.resolve(window.__motion.ready).then(()=>true)',120000);
    await page.eval('window.__motion.pause(),true');
    say({orient,runtime:await page.eval('({stageScale:window.__motion.stage.scale,pixelRatio:window.__map.getPixelRatio(),antialias:window.__map.painter.context.gl.getContextAttributes().antialias,measureWaitFrames:window.__map.style.projection._verticalPerspectiveProjection?._errorMeasurement?._measureWaitFrames})')});
    const chosen=quick?[41.8]:native?[3.105,18,41.8]:subset.length?subset:targets, baseline=new Map();
    await page.eval('window.__motion.seek(0)',90000);
    for(const t of chosen){await page.eval('window.__motion.seek('+t+')',90000);baseline.set(t,await page.eval(SNAPSHOT));if(native&&t===18)await page.screenshot(path.join(out,orient+'-ascending-18.png'));}
    say({orient,phase:'baseline',targets:chosen.length});
    if(quick)await page.screenshot(path.join(out,orient+'-ascending-41.8.png'));
    let seed=20261022;
    const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return +(seed/4294967296*60).toFixed(6);};
    for(let i=0;i<chosen.length;i++) {
      const target=chosen[i];
      for(const [route,from] of quick?[['from60',60]]:[['from60',60],['from0',0],['random',rand()]]) {
        await page.eval('window.__motion.seek('+from+')',90000);
        await page.eval('window.__motion.seek('+target+')',90000);
        const actual=await page.eval(SNAPSHOT),diff=compare(baseline.get(target),actual);
        record({orient,target,route,from,...diff});
        if(native&&target===18)await page.screenshot(path.join(out,orient+'-'+route+'-18.png'));
        if(quick)await page.screenshot(path.join(out,orient+'-from60-41.8.png'));
      }
      if(!quick&&!native&&!subset.length&&[0,13.1,27.2,41.8,60].includes(target)){await page.eval('window.__motion.setOrient('+JSON.stringify(orient==='portrait'?'landscape':'portrait')+')',90000);await page.eval('window.__motion.setOrient('+JSON.stringify(orient)+')',90000);const actual=await page.eval(SNAPSHOT);record({orient,target,route:'orientation-roundtrip',from:target,...compare(baseline.get(target),actual)});}
      if(i%10===0||i===chosen.length-1)say({orient,done:i+1,total:chosen.length,checks:results.length,visibleFailures:results.filter(r=>r.visible.length).length,routeFailures:results.filter(r=>r.routes.length).length,cameraFailures:results.filter(r=>r.camera).length});
    }
    if(!quick&&!native&&!subset.length){
      for(const [name,from,target] of [['space-same-bucket',3.101,3.105],['flight-partial-key',8.5,8.50000001],['walk1-partial-key',39.5,39.5000001],['walk2-partial-key',44.2,44.2000001],['walk3-partial-key',49.8,49.8000001],['card-before',11.5,13.1],['card-enter',12.1,13.6]]){
        await page.eval('window.__motion.seek(0)',90000);await page.eval('window.__motion.seek('+target+')',90000);const reference=await page.eval(SNAPSHOT);await page.eval('window.__motion.seek(0)',90000);await page.eval('window.__motion.seek('+from+')',90000);await page.eval('window.__motion.seek('+target+')',90000);record({orient,target,route:name,from,...compare(reference,await page.eval(SNAPSHOT))});
      }
    }
    await page.send('Page.close');
  }
  const summary={tag,quick,native,targetsPerOrient:quick?1:native?3:subset.length||targets.length,orientations:quick?['portrait']:['landscape','portrait'],checks:results.length,visibleFailures:results.filter(r=>r.visible.length).length,hiddenOnlyDifferences:results.filter(r=>!r.visible.length&&r.hidden.length).length,routeFailures:results.filter(r=>r.routes.length).length,cameraFailures:results.filter(r=>r.camera).length,errors};
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({summary,targets:quick?[41.8]:native?[3.105,18,41.8]:subset.length?subset:targets,results},null,2)+'\n');
  fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');
  say(summary);
  if(summary.visibleFailures||summary.routeFailures||summary.cameraFailures||errors.length)process.exitCode=1;
} finally {await browser.close();}
