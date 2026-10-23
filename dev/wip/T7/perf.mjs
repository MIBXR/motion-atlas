import fs from 'node:fs';
import {launch} from '../../../scripts/lib/cdp.mjs';
const phase=process.argv[2]||'before', dir=`dev/shots/T7/perf/${phase}`;
fs.mkdirSync(dir,{recursive:true});
const source=fs.readFileSync('demos/cases/industrial-protocol/script.js','utf8');
if(phase==='before'){
 fs.mkdirSync('dev/wip/T7/perf-before',{recursive:true});
 for(const f of ['script.js','style.css','config.js','index.html'])fs.copyFileSync(`demos/cases/industrial-protocol/${f}`,`dev/wip/T7/perf-before/${f}`);
 fs.cpSync('dev/wip/T7/parts','dev/wip/T7/perf-before/parts',{recursive:true});
}
let code=source.replace('function render(t){','function render(t){const perfStart=performance.now();let perfGround,perfBeltStart,perfBeltEnd,perfMachineEnd;')
 .replace('    const mode=seg(t,5,','    perfGround=performance.now();\n    const mode=seg(t,5,')
 .replace('    const nextFlowKey=', '    perfBeltStart=performance.now();\n    const nextFlowKey=')
 .replace('    fx.clearRect','    perfBeltStart=performance.now();\n    fx.clearRect')
 .replace('    for(const{m,el}of machineEls)','    perfBeltEnd=performance.now();\n    for(const{m,el}of machineEls)')
 .replace("    $('.hud-mode').style.opacity", "    perfMachineEnd=performance.now();\n    $('.hud-mode').style.opacity")
 .replace('    write(node(\'.hud-mode\').style, "opacity"', '    perfMachineEnd=performance.now();\n    write(node(\'.hud-mode\').style, "opacity"')
 .replace('  MK.preload([',`  window.__perfRows=[];\n  MK.preload([`)
 .replace(/(?:\$\('#fade'\).style.opacity=String\(seg\(t,59.4,.6,E.inOutSine\)\);|write\(node\('#fade'\).style, "opacity", String\(seg\(t,59.4,.6,E.inOutSine\)\)\);)/, "$&const end=performance.now();window.__perfRows?.push({t,ground:perfGround-perfStart,facilities:perfMachineEnd-perfBeltEnd,belts:perfBeltEnd-perfBeltStart,other:end-perfStart-(perfGround-perfStart)-(perfMachineEnd-perfBeltEnd)-(perfBeltEnd-perfBeltStart),total:end-perfStart});");
fs.writeFileSync('dev/wip/T7/perf-instrumented.js',code);
let html=fs.readFileSync('demos/cases/industrial-protocol/index.html','utf8').replace('<head>','<head><base href="/demos/cases/industrial-protocol/">').replace('src="script.js"','src="/dev/wip/T7/perf-instrumented.js"');
fs.writeFileSync('dev/wip/T7/perf.html',html);
const result={phase,NODE_OPTIONS:process.env.NODE_OPTIONS??null,BROWSER_PATH:process.env.BROWSER_PATH??null,samples:[],cold:[],targets:[]};
const b=await launch({width:1280,height:720});result.browser=b.exe;
try{
 for(const orient of ['landscape','portrait']){
  const p=await b.newPage();
  await p.goto(`http://localhost:4325/dev/wip/T7/perf.html?render=1&embed=1&orient=${orient}`);
  await p.waitFor('__motion');await p.eval('__motion.ready.then(()=>true)');
  result.cold.push({orient,frames:await p.eval('__perfRows.splice(0)')});
  for(const t of [7,17,30,42,52]){
   const frames=await p.eval(`(async()=>{__perfRows.length=0;const wall=[];let last=performance.now();for(let i=0;i<60;i++){await new Promise(requestAnimationFrame);const now=performance.now();wall.push(now-last);last=now;await __motion.seek(${t}+i/60);}return{render:__perfRows.splice(0),wall};})()`);
   result.samples.push({orient,t,...frames});
  }
  await p.viewport(orient==='portrait'?1080:1920,orient==='portrait'?1920:1080,1);
  for(const t of [7,17,30,42,52]){
   await p.eval(`__motion.seek(${t}).then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))`);
   await p.screenshot(`${dir}/${orient}-${t}.png`);
  }
  result.targets.push(await p.eval(`(()=>{const s=__motion.stage,r=s.root.getBoundingClientRect();return{orient:__motion.orient,targets:['.copy-button','.capsule.confirm'].map(q=>{const a=document.querySelector(q).getBoundingClientRect();return{x:(a.x-r.x+a.width/2)/s.scale,y:(a.y-r.y+a.height/2)/s.scale}})}})()`));
  await p.send('Page.close');
 }
}finally{await b.close();fs.writeFileSync(`${dir}/timings.json`,JSON.stringify(result,null,2));}
for(const s of result.samples){const avg=k=>+(s.render.reduce((a,v)=>a+v[k],0)/s.render.length).toFixed(3);console.log(s.orient,s.t,JSON.stringify(Object.fromEntries(['ground','facilities','belts','other','total'].map(k=>[k,avg(k)]))));}
console.log(JSON.stringify(result.targets));
