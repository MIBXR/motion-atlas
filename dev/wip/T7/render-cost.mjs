import {launch} from '../../../scripts/lib/cdp.mjs';
const b=await launch({width:1280,height:720,args:['--no-proxy-server']});
try{const p=await b.newPage();await p.goto('http://localhost:4325/demos/cases/industrial-protocol/index.html?render=1&orient=landscape');await p.waitFor('__motion');await p.eval('__motion.ready.then(()=>true)');console.log(JSON.stringify(await p.eval(`(async()=>{
 const m=__motion, costs=[];for(const t of [0,5,12,20,29,44,52,58]){const a=performance.now();for(let i=0;i<20;i++)await m.seek(t);costs.push({t,ms:(performance.now()-a)/20});}
 await m.seek(0);const samples=[];const off=m.on((t,playing)=>{if(playing)samples.push({t,now:performance.now()})});m.play();await new Promise(r=>setTimeout(r,1500));m.pause();off();return{costs,hidden:document.hidden,visibility:document.visibilityState,advance:m.time,samples};})()`),null,2));}finally{await b.close();}
