import fs from 'node:fs';
import path from 'node:path';
import {launch} from '../../../scripts/lib/cdp.mjs';
const out='dev/shots/T7', base='http://localhost:4325';
const times={S1:[4.5,7,9.7],S2:[10.5,12,16,17,20,23.7],S3:[29,30],S4:[36.5,42,44,47.7],S5:[52],S6:[58]};
const result={browser:null,screenshots:[],checks:[],errors:[]};
const b=await launch({width:1920,height:1080});result.browser=b.exe;
const imageURL=f=>'data:image/'+(f.endsWith('.png')?'png':'jpeg')+';base64,'+fs.readFileSync(f).toString('base64');
try{
 for(const orient of ['landscape','portrait']){
  const p=await b.newPage();await p.viewport(orient==='portrait'?1080:1920,orient==='portrait'?1920:1080,1);
  p.on('Runtime.exceptionThrown',e=>result.errors.push(e.exceptionDetails?.exception?.description||e.exceptionDetails?.text));
  await p.goto(`${base}/demos/cases/industrial-protocol/index.html?render=1&embed=1&orient=${orient}`);
  await p.waitFor('window.__motion');await p.eval('__motion.ready.then(()=>true)');await p.send('Page.bringToFront');
  for(const[scene,list]of Object.entries(times))for(const t of list){
   await p.eval(`__motion.seek(${t}).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))`);
   const file=`${out}/shots/${orient}-${scene}-${t.toFixed(3)}.png`;await p.screenshot(file);result.screenshots.push(file);
  }
  result.checks.push(await p.eval(`(async()=>{
   await __motion.seek(17);const box=e=>{const r=e.getBoundingClientRect(),s=__motion.stage.scale;return{x:r.x/s,y:r.y/s,w:r.width/s,h:r.height/s}};
   const gradient=box(document.querySelector('.build-backing'));const keys=[...document.querySelectorAll('.key-row')].map(e=>({rect:box(e),bg:getComputedStyle(e).backgroundColor,padding:getComputedStyle(e).padding}));
   const zz=[...document.querySelectorAll('.machine .zz')].map(e=>{const m=box(e.parentElement),z=box(e);return{id:e.parentElement.id,dx:z.x-m.x-m.w,dy:z.y-m.y}});
   const wheels=[];for(const t of [15,19.3,19.6]){await __motion.seek(t);wheels.push({t,left:document.querySelector('#machine-crusher .machine-cut-left').getAttribute('transform'),right:document.querySelector('#machine-crusher .machine-cut-right').getAttribute('transform')});}
   return{orient:__motion.orient,gradient,keys,zz,wheels};})()`));
  await p.send('Page.close');
 }
 const refs=path.resolve('../../dev/shots/T7/refs');
 for(const[id,ts,reference]of[['S2',[12,16,20],path.join(refs,'frames/03/000043.350.jpg')],['S3',[29],path.join(refs,'frames/03/000045.583.jpg')],['S4',[44],path.join(refs,'sheets/01-02.jpg')]]){
  const p=await b.newPage();await p.viewport(1920,ts.length*590+40,1);await p.send('Page.bringToFront');
  const rows=ts.map(t=>`<div class="row"><figure><figcaption>${id} ${t.toFixed(1)}s · implementation</figcaption><img src="${imageURL(`${out}/shots/landscape-${id}-${t.toFixed(3)}.png`)}"></figure><figure><figcaption>Local reference</figcaption><img src="${imageURL(reference)}"></figure></div>`).join('');
  await p.eval(`(async()=>{document.body.innerHTML=${JSON.stringify('<style>body{margin:0;background:#17191b;color:white;font:18px Arial}.row{display:flex;height:590px}figure{margin:0;width:960px}figcaption{height:40px;padding:10px;box-sizing:border-box}img{width:960px;height:540px;object-fit:contain;display:block}</style>'+rows)};await Promise.all([...document.images].map(i=>i.decode()));return true})()`);
  await p.screenshot(`${out}/compare/${{S2:'S2-blueprint',S3:'S3-machine-panel',S4:'S4-operator'}[id]}.png`);await p.send('Page.close');
 }
}finally{await b.close();fs.writeFileSync(`${out}/final-shots.json`,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify({browser:result.browser,screenshots:result.screenshots.length,errors:result.errors}));
