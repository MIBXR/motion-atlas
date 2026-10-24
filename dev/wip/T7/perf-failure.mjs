import fs from 'node:fs';
import {launch} from '../../../scripts/lib/cdp.mjs';
const result={time:.1835,note:'Separate read-only render sample at the failed timeline time; not a trace of the failed smoke process.',NODE_OPTIONS:process.env.NODE_OPTIONS??null,BROWSER_PATH:process.env.BROWSER_PATH??null,orientations:[]};
const b=await launch({width:1280,height:720});result.browser=b.exe;
try{for(const orient of ['landscape','portrait']){
 const p=await b.newPage();await p.goto(`http://localhost:4325/dev/wip/T7/perf.html?render=1&embed=1&orient=${orient}`);await p.waitFor('__motion');await p.eval('__motion.ready.then(()=>true)');
 result.orientations.push({orient,frames:await p.eval('(async()=>{await __motion.seek(.1835);__perfRows.length=0;for(let i=0;i<60;i++){await new Promise(requestAnimationFrame);await __motion.seek(.1835);}return __perfRows.splice(0)})()')});
 await p.send('Page.close');
}}finally{await b.close();fs.writeFileSync('dev/shots/T7/perf/failure-time.json',JSON.stringify(result,null,2));}
for(const o of result.orientations)console.log(o.orient,JSON.stringify(Object.fromEntries(['ground','facilities','belts','other','total'].map(k=>[k,o.frames.reduce((s,v)=>s+v[k],0)/60]))));
