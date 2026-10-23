import fs from 'node:fs';
import {launch} from '../../../../scripts/lib/cdp.mjs';
const file='dev/shots/T7/imagegen/qa.json',qa=JSON.parse(fs.readFileSync(file,'utf8')),checks=[];
const b=await launch({width:1920,height:1080,args:['--enable-gpu','--use-angle=d3d11']});
try{for(const orient of ['landscape','portrait']){
 const p=await b.newPage();await p.viewport(orient==='portrait'?1080:1920,orient==='portrait'?1920:1080,1);
 await p.goto(`http://localhost:4325/demos/cases/industrial-protocol/index.html?render=1&embed=1&orient=${orient}`);await p.waitFor('__motion');await p.eval('__motion.ready.then(()=>true)');
 for(const t of [36.5,41,41.2,42,47.7]){await p.eval(`__motion.seek(${t}).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))`);const path=`dev/shots/T7/imagegen/after/${orient}-S4-${t.toFixed(3)}.png`;await p.screenshot(path);if(!qa.screenshots.includes(path))qa.screenshots.push(path);
 checks.push(await p.eval(`(()=>{const box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};return{orient:__motion.orient,t:${t},outer:box(document.querySelector('.op-person')),art:box(document.querySelector('.op-person-art')),toast:box(document.querySelector('.op-level-toast'))}})()`));}
 await p.send('Page.close');
}}finally{await b.close();qa.s4Fit=checks;fs.writeFileSync(file,JSON.stringify(qa,null,2));}
console.log(JSON.stringify(checks.filter(c=>c.t===41.2),null,2));
