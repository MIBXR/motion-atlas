import fs from 'node:fs';
import {launch} from '../../../scripts/lib/cdp.mjs';
const out='dev/shots/T7/fix9-layout';fs.mkdirSync(out,{recursive:true});
const result={browser:null,renderer:null,screenshots:[],checks:[],sweep:[],errors:[]};
const b=await launch({width:1920,height:1080,args:['--enable-gpu','--use-angle=d3d11','--ignore-gpu-blocklist']});result.browser=b.exe;
const probe=`(()=>{
 const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
 const visible=e=>{for(let a=e;a&&a!==document.body;a=a.parentElement){const s=getComputedStyle(a);if(s.display==='none'||s.visibility==='hidden'||+s.opacity<=.001)return false;}return true};
 const hit=(a,b)=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>.01&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>.01;
 const machines=[...document.querySelectorAll('.machine')].filter(visible),labels=[...document.querySelectorAll('.machine-name')].filter(visible);
 const names=labels.map(e=>{const r=rect(e),m=rect(e.parentElement);return{id:e.parentElement.id,rect:r,facility:m,opacity:+e.style.opacity,gap:m.x-r.x-r.w,centerDelta:r.y+r.h/2-m.y-m.h/2,facilities:machines.filter(a=>a!==e.parentElement&&hit(r,rect(a))).map(a=>({id:a.id,rect:rect(a)})),labels:labels.filter(a=>a!==e&&hit(r,rect(a))).map(a=>({id:a.parentElement.id,rect:rect(a)}))}});
 return{orient:__motion.orient,t:__motion.time,names,zz:[...document.querySelectorAll('.machine .zz')].filter(visible).length};
})()`;
try{
 for(const orient of ['landscape','portrait']){
  const p=await b.newPage();await p.viewport(orient==='portrait'?1080:1920,orient==='portrait'?1920:1080,1);
  p.on('Runtime.exceptionThrown',e=>result.errors.push(e.exceptionDetails?.exception?.description||e.exceptionDetails?.text));
  await p.goto(`http://localhost:4325/demos/cases/industrial-protocol/index.html?render=1&embed=1&orient=${orient}`);await p.waitFor('__motion');await p.eval('__motion.ready.then(()=>true)');
  result.renderer=await p.eval(`(()=>{const c=document.createElement('canvas');c.width=c.height=1;const g=c.getContext('webgl');try{return g.getParameter(g.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL)}finally{g.getExtension('WEBGL_lose_context').loseContext();c.remove()}})()`);
  for(const t of [4.5,7,9.7,10.5,12,14.7,15.1,15.5,16,16.45,16.75,17,20,23.7]){
   await p.eval(`__motion.seek(${t}).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))`);
   result.checks.push(await p.eval(probe));
   const f=`${out}/${orient}-${t<10?'S1':'S2'}-${t.toFixed(3)}.png`;await p.screenshot(f);result.screenshots.push(f);
  }
  result.sweep.push(await p.eval(`(async()=>{const failures=[];for(let i=40;i<240;i++){await __motion.seek(i/10);const c=${probe};for(const n of c.names)if(n.facilities.length||n.labels.length)failures.push(c);}return{orient:__motion.orient,samples:200,failures}})()`));
  await p.send('Page.close');
 }
}finally{await b.close();fs.writeFileSync(`${out}/checks.json`,JSON.stringify(result,null,2));}
console.log(JSON.stringify({renderer:result.renderer,screenshots:result.screenshots.length,visiblePortraitNames:result.checks.filter(c=>c.orient==='portrait').map(c=>({t:c.t,names:c.names.map(n=>({id:n.id,opacity:n.opacity,gap:n.gap,centerDelta:n.centerDelta}))})),failures:result.sweep.map(s=>({orient:s.orient,count:s.failures.length,first:s.failures[0]})),errors:result.errors},null,2));
