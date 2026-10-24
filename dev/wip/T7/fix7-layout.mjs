import fs from 'node:fs';
import {launch} from '../../../scripts/lib/cdp.mjs';
const out='dev/shots/T7/fix7-layout';fs.mkdirSync(out,{recursive:true});
const result={browser:null,renderer:null,checks:[],screenshots:[],errors:[]};
const b=await launch({width:1080,height:1920,args:['--enable-gpu','--use-angle=d3d11','--ignore-gpu-blocklist']});result.browser=b.exe;
try{
 const p=await b.newPage();p.on('Runtime.exceptionThrown',e=>result.errors.push(e.exceptionDetails?.exception?.description||e.exceptionDetails?.text));
 await p.goto('http://localhost:4325/demos/cases/industrial-protocol/index.html?render=1&embed=1&orient=portrait');await p.waitFor('__motion');await p.eval('__motion.ready.then(()=>true)');
 result.renderer=await p.eval(`(()=>{const c=document.createElement('canvas');c.width=c.height=1;const g=c.getContext('webgl');try{return g.getParameter(g.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL)}finally{g.getExtension('WEBGL_lose_context').loseContext();c.remove()}})()`);
 for(const [scene,t]of [['S1',4.5],['S1',7],['S1',9.7],['S2',10.5],['S2',12],['S2',16],['S2',17],['S2',20],['S2',23.7]]){
  await p.eval(`__motion.seek(${t}).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))`);
  const file=`${out}/portrait-${scene}-${t.toFixed(3)}.png`;await p.screenshot(file);result.screenshots.push(file);
  result.checks.push(await p.eval(`(()=>{
   const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};
   const shown=e=>{for(let a=e;a&&a!==document.body;a=a.parentElement){const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.01)return false;}return true;};
   const overlap=(a,b)=>Math.min(a.x+a.w,b.x+b.w)>Math.max(a.x,b.x)&&Math.min(a.y+a.h,b.y+b.h)>Math.max(a.y,b.y);
   const machines=[...document.querySelectorAll('.machine')].filter(shown),names=[...document.querySelectorAll('.machine-name')].filter(shown);
   return{t:${t},labels:names.map(n=>{const r=rect(n),m=rect(n.parentElement),s=getComputedStyle(n);return{id:n.parentElement.id,text:n.textContent,rect:r,facility:m,font:parseFloat(s.fontSize),bottomGap:m.y+m.h-r.y-r.h,overflow:{left:Math.max(0,m.x-r.x),right:Math.max(0,r.x+r.w-m.x-m.w)},otherFacilities:machines.filter(a=>a!==n.parentElement&&overlap(r,rect(a))).map(a=>({id:a.id,rect:rect(a)})),otherLabels:names.filter(a=>a!==n&&overlap(r,rect(a))).map(a=>({id:a.parentElement.id,rect:rect(a)}))}}),zz:[...document.querySelectorAll('.machine .zz')].filter(shown).map(z=>{
    const boxes=[rect(z),rect(z.querySelector('b'))],r={x:Math.min(...boxes.map(b=>b.x)),y:Math.min(...boxes.map(b=>b.y))};r.w=Math.max(...boxes.map(b=>b.x+b.w))-r.x;r.h=Math.max(...boxes.map(b=>b.y+b.h))-r.y;
    const m=rect(z.parentElement),s=getComputedStyle(z);return{id:z.parentElement.id,rect:r,facility:m,font:+parseFloat(s.fontSize),cssLeft:s.left,cssTop:s.top,names:names.filter(n=>overlap(r,rect(n))).map(n=>({id:n.parentElement.id,rect:rect(n)})),otherFacilities:machines.filter(n=>n!==z.parentElement&&overlap(r,rect(n))).map(n=>({id:n.id,rect:rect(n)})),ownFrameCrossing:r.x<m.x||r.y<m.y||r.x+r.w>m.x+m.w||r.y+r.h>m.y+m.h};
   })};})()`));
 }
}finally{await b.close();fs.writeFileSync(`${out}/checks.json`,JSON.stringify(result,null,2));}
console.log(JSON.stringify({renderer:result.renderer,screenshots:result.screenshots.length,intersections:result.checks.flatMap(c=>c.zz.filter(z=>z.names.length||z.otherFacilities.length).map(z=>({t:c.t,...z}))),errors:result.errors},null,2));
