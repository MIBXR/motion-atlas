import fs from 'node:fs';
import {launch} from '../../../../scripts/lib/cdp.mjs';
const out='dev/shots/T7/imagegen/after';fs.mkdirSync(out,{recursive:true});
const result={screenshots:[],checks:[],errors:[],warnings:[]};
const times={S0:[.5,2,3.7],S1:[4.5,7,9.7],S2:[10.5,17,23.7],S3:[24.5,29,30,35.7],S4:[36.5,42,47.7],S5:[48.5,52,55.7],S6:[56.5,58,59.7]};
const b=await launch({width:1920,height:1080,args:['--enable-gpu','--use-angle=d3d11']});
try{for(const orient of ['landscape','portrait']){
 const p=await b.newPage();await p.viewport(orient==='portrait'?1080:1920,orient==='portrait'?1920:1080,1);
 p.on('Runtime.exceptionThrown',e=>result.errors.push(e.exceptionDetails?.exception?.description||e.exceptionDetails?.text));
 p.on('Runtime.consoleAPICalled',e=>{if(['error','warning'].includes(e.type))result.warnings.push({type:e.type,text:e.args.map(a=>a.value||a.description).join(' ')})});
 await p.goto(`http://localhost:4325/demos/cases/industrial-protocol/index.html?render=1&embed=1&orient=${orient}`);await p.waitFor('__motion');await p.eval('__motion.ready.then(()=>true)',120000);
 result.checks.push(await p.eval(`(()=>({orient:__motion.orient,duration:__motion.duration,preloaded:[...MotionKit.preload.cache].filter(([s,v])=>s.includes('assets/gen')).map(([src,i])=>({src,w:i.naturalWidth,h:i.naturalHeight,complete:i.complete})),ghostImages:document.querySelectorAll('#ghost image,#ghost img').length,facilityImages:document.querySelectorAll('.machine-bitmap image,image.machine-bitmap').length}))()`));
 for(const[scene,ts]of Object.entries(times))for(const t of ts){await p.eval(`__motion.seek(${t}).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))`);const file=`${out}/${orient}-${scene}-${t.toFixed(3)}.png`;await p.screenshot(file);result.screenshots.push(file);}
 result.checks.push(await p.eval(`(async()=>{const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}};const person=[];for(const t of [36,37,39,40,42]){await __motion.seek(t);person.push({t,rect:rect(document.querySelector('.op-person')),transform:document.querySelector('.op-person-art').style.transform})}await __motion.seek(29);const items=[...document.querySelectorAll('.mp-bag-grid .mp-item-image')].map(i=>({src:i.getAttribute('src'),rect:rect(i),loaded:i.complete&&i.naturalWidth>0}));return{orient:__motion.orient,person,items}})()`));
 await p.send('Page.close');
}}finally{await b.close();fs.writeFileSync('dev/shots/T7/imagegen/qa.json',JSON.stringify(result,null,2));}
console.log(JSON.stringify({screenshots:result.screenshots.length,checks:result.checks,errors:result.errors,warnings:result.warnings},null,2));
