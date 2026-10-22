import fs from 'node:fs';
import {directEntry,openBrowser} from './plate.mjs';

const staticTimes={
  'corner-hud':[9.9],'vertical-title-blur':[2.5,6.05,9.95,13.05],
  'card-expand-fullscreen':[3.1],'chapter-frame':[4.55],'split-compare-stamp':[2.2],
  'collect-counter':[5.3],'outro-stat-stack':[3.5],'seekable-timeline':[1],
  'film-grain':[1.25,3.75,6.25],
};
const jobs=[
  {id:'map-pilgrimage',orient:'portrait',times:[46.5,6.3]},
  {id:'map-pilgrimage',orient:'landscape',times:[10.4]},
  ...['route-draw-marker','alert-reroute','day-night-flip'].flatMap(id=>['landscape','portrait'].map(orient=>({id,orient,times:id==='route-draw-marker'?[1,3.45]:id==='alert-reroute'?[2.75,5.3]:[3.5]}))),
  ...Object.entries(staticTimes).flatMap(([id,times])=>['landscape','portrait'].map(orient=>({id,orient,times}))),
];
if(!process.argv.includes('--run')){
  console.log(JSON.stringify({mode:'prepared; no browser',pages:jobs.length,samples:jobs.reduce((n,j)=>n+j.times.length,0),jobs},null,2));
  process.exit(0);
}
if(/hardware-browser|d3d11|--use-angle/i.test([...process.execArgv,process.env.NODE_OPTIONS||''].join('\n')))throw new Error('Use the default GL path with direct-browser only.');
directEntry();
const dir='dev/shots/T4b/authorized-effects-default';fs.mkdirSync(dir,{recursive:true});
const result={purpose:'专项效果证据；不构成最终验收',execArgv:process.execArgv,nodeOptions:process.env.NODE_OPTIONS||'',samples:[],checks:[],errors:[]};
const check=(name,pass,detail)=>{result.checks.push({name,pass,detail});if(!pass)console.log('FAIL '+name+' '+JSON.stringify(detail));};
const probe=`(()=>{
  const st=__motion.stage,root=st.root,sr=root.getBoundingClientRect(),k=st.scale||1,C=window.CASE_CONFIG||window.CONFIG;
  const box=e=>{const r=e.getBoundingClientRect();return{x:(r.x-sr.x)/k,y:(r.y-sr.y)/k,w:r.width/k,h:r.height/k};};
  const opacity=e=>{let a=1;for(let p=e;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden')return 0;a*=Number(c.opacity);}return a;};
  const shown=e=>{const r=e.getBoundingClientRect();return opacity(e)>.001&&r.width>0&&r.height>0&&r.right>sr.left&&r.left<sr.right&&r.bottom>sr.top&&r.top<sr.bottom;};
  const a=root.querySelector('.attrib'),ac=getComputedStyle(a),ab=box(a),bar=root.querySelector('.mk-controls'),bc=bar&&getComputedStyle(bar);
  const overlays=[...root.children].filter(e=>e!==a&&shown(e)).map(e=>({id:e.id||e.className.baseVal||e.className,z:getComputedStyle(e).zIndex}));
  const gl=window.__map?.painter?.context?.gl,ext=gl&&gl.getExtension('WEBGL_debug_renderer_info'),m=window.__map;
  return {
    orient:st.orient,stage:[st.width,st.height],scale:k,renderer:gl?(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)):null,
    cam:m?{center:m.getCenter().toArray(),zoom:m.getZoom(),bearing:m.getBearing(),pitch:m.getPitch(),padding:m.getPadding()}:null,
    labels:C.tracks.markers.map((mk,i)=>{const e=root.querySelectorAll('.mk-label')[i],en=e.querySelector('.mk-en'),ja=e.querySelector('em');return{stop:mk.stop,shown:shown(e),opacity:opacity(e),computedOpacity:Number(getComputedStyle(e).opacity),en:en.textContent,ja:ja.textContent,jaOpacity:Number(getComputedStyle(ja).opacity),full:C.stops[mk.stop].name,fullJa:C.stops[mk.stop].ja,minZoom:C.stops[mk.stop].minZoom??0,rect:box(e)};}),
    avoid:C.layout[st.orient].avoid,
    attribution:{shown:shown(a),opacity:opacity(a),text:a.textContent,expected:st.orient==='portrait'?C.map.attributionShort:C.map.attribution,rect:ab,background:ac.backgroundColor,color:ac.color,fontSize:ac.fontSize,z:ac.zIndex,directChild:a.parentElement===root,overlays},
    controls:bar?{rect:box(bar),opacity:Number(bc.opacity),gap:box(bar).y-(ab.y+ab.h),expectedGap:parseFloat(getComputedStyle(root.querySelector('.hud-geo')).lineHeight),rightGap:st.width-(ab.x+ab.w),expectedRightGap:C.layout[st.orient].margin}:null,
    subtitle:[...root.querySelectorAll('.it-sub-portrait > span')].map(e=>({text:e.textContent,shown:shown(e),rect:box(e),fontSize:getComputedStyle(e).fontSize,whiteSpace:getComputedStyle(e).whiteSpace,clientRects:e.getClientRects().length})),
  };
})()`;
const browser=await openBrowser();
try{
  for(const job of jobs){
    const page=await browser.newPage(),pageErrors=[];
    page.on('Runtime.exceptionThrown',e=>pageErrors.push(e.exceptionDetails?.exception?.description||e.exceptionDetails?.text));
    try{
      await page.viewport(...(job.orient==='portrait'?[1080,1920]:[1920,1080]),1);
      const group=job.id==='map-pilgrimage'?'cases':'patterns';
      await page.goto(`http://localhost:4322/demos/${group}/${job.id}/index.html?render=1&orient=${job.orient}&t=${job.times[0]}`,60000);
      await page.waitFor('window.__motion',30000);
      await page.eval('Promise.resolve(__motion.ready).then(()=>true)',60000);
      await page.eval('__motion.pause()');
      for(const t of job.times){
        await page.send('Page.bringToFront');await page.eval(`__motion.seek(${t})`,60000);
        await page.eval('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
        const data=await page.eval(probe),file=`${dir}/${job.id}-${job.orient}-${t}.png`;
        await page.screenshot(file);result.samples.push({...job,t,times:undefined,file,...data});
        const name=job.id+'/'+job.orient+'/'+t;
        const hidden=job.id==='film-grain'?t>=2.5:job.id==='vertical-title-blur'&&t>=7.9&&t<12;
        check(name+' attribution visibility',data.attribution.shown===!hidden,data.attribution);
        if(!hidden){
          check(name+' attribution text',data.attribution.text===data.attribution.expected);
          if(job.orient==='portrait')check(name+' attribution white background',data.attribution.background==='rgba(250, 249, 245, 0.94)',data.attribution.background);
          if(group==='patterns')check(name+' attribution above visible stage layers',data.attribution.directChild&&Number(data.attribution.z)>=Math.max(...data.attribution.overlays.map(o=>Number(o.z)||0)),{z:data.attribution.z,overlays:data.attribution.overlays});
        }
        if(job.id==='seekable-timeline'){
          check(name+' attribution HUD line gap',Math.abs(data.controls.gap-data.controls.expectedGap)<.1,data.controls);
          check(name+' attribution right alignment',Math.abs(data.controls.rightGap-data.controls.expectedRightGap)<.1,data.controls);
        }
        if(job.id==='route-draw-marker'){
          for(const stop of t===1?['kix']:['kix','kyoto']){
            const label=data.labels.find(l=>l.stop===stop);
            check(name+' '+stop+' complete bilingual visible',label.shown&&label.en===label.full&&label.ja===label.fullJa&&label.jaOpacity===1,label);
          }
          check(name+' source avoid restored',data.avoid.length===4,data.avoid);
        }
        if(job.id==='alert-reroute')for(const stop of ['saidaiji','takanohara']){
          const label=data.labels.find(l=>l.stop===stop),factor=Math.max(0,Math.min(1,(data.cam.zoom-10.75)/.25)),expected=job.orient==='portrait'?1:+factor.toFixed(3);
          check(name+' '+stop+' opacity',label.shown&&Math.abs(label.computedOpacity-expected)<.002,{expected,label});
          check(name+' '+stop+' minZoom restored',label.minZoom===11,label.minZoom);
        }
        if(job.orient==='portrait'&&((job.id==='map-pilgrimage'&&t===6.3)||(job.id==='vertical-title-blur'&&t===2.5))){
          const expected=['SHANGHAI → KANSAI','KYOTO · NARA · OSAKA','10.01 – 10.03'];
          check(name+' three portrait subtitle lines',data.subtitle.length===3&&data.subtitle.every((s,i)=>s.shown&&s.text===expected[i]&&s.fontSize==='36px'&&s.whiteSpace==='nowrap'&&s.clientRects===1),data.subtitle);
        }
      }
    }catch(error){result.errors.push({id:job.id,orient:job.orient,error:error.stack});}
    finally{await page.send('Page.close').catch(error=>result.errors.push({id:job.id,error:error.message}));}
    result.errors.push(...pageErrors.map(error=>({id:job.id,orient:job.orient,error})));
    fs.writeFileSync(dir+'/checks.json',JSON.stringify(result,null,2)+'\n');
    fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：默认GL专项 ${job.id}/${job.orient} 已完成本页规定采样；证据 ${dir}/checks.json（不代表最终验收）。\n`);
    console.log(`effects ${job.id}/${job.orient}`);
  }
}finally{await browser.close();result.summary={samples:result.samples.length,checks:result.checks.length,failed:result.checks.filter(c=>!c.pass).length,errors:result.errors.length};fs.writeFileSync(dir+'/checks.json',JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result.summary));
if(result.summary.failed||result.summary.errors)process.exitCode=1;
