import fs from 'node:fs';
import {launch} from '../../../../scripts/lib/cdp.mjs';
const out='dev/shots/T7/imagegen/before',boxes=[];
const b=await launch({width:1920,height:1080,args:['--enable-gpu','--use-angle=d3d11']});
try{for(const orient of ['landscape','portrait']){
 const p=await b.newPage();await p.viewport(orient==='portrait'?1080:1920,orient==='portrait'?1920:1080,1);
 await p.goto(`http://localhost:4325/demos/cases/industrial-protocol/index.html?render=1&embed=1&orient=${orient}`);await p.waitFor('__motion');await p.eval('__motion.ready.then(()=>true)');
 for(const [scene,t]of [['S1',7],['S3',29],['S4',42]]){
  await p.eval(`__motion.seek(${t}).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))`);
  await p.screenshot(`${out}/${orient}-${scene}.png`);
  if(scene==='S4')boxes.push(await p.eval(`(()=>{const r=document.querySelector('.op-person').getBoundingClientRect();return{orient:__motion.orient,x:r.x,y:r.y,w:r.width,h:r.height}})()`));
 }
 await p.send('Page.close');
}}finally{await b.close();fs.writeFileSync(`${out}/boxes.json`,JSON.stringify(boxes,null,2))}
console.log(JSON.stringify(boxes));
