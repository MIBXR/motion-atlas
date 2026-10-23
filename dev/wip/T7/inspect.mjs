import fs from 'node:fs';
import {launch} from '../../../scripts/lib/cdp.mjs';
const browser=await launch({width:1920,height:1080});
try{
 for(const orient of ['landscape','portrait']){
  const p=await browser.newPage();await p.viewport(orient==='portrait'?1080:1920,orient==='portrait'?1920:1080);
  const errors=[];p.on('Runtime.exceptionThrown',e=>errors.push(e.exceptionDetails?.exception?.description||e.exceptionDetails?.text));
  await p.send('Page.addScriptToEvaluateOnNewDocument',{source:"addEventListener('motion:ready',e=>window.__readyInfo=e.detail)"});
  await p.goto(`http://localhost:4325/demos/cases/industrial-protocol/index.html?render=1&orient=${orient}`);
  await p.waitFor('window.__motion');await p.eval('window.__motion.ready.then(()=>true)',90000);
  for(const t of [2,8,12,16,20,29,32.8,44,52,54,58]){await p.eval(`window.__motion.seek(${t})`);await p.screenshot(`dev/shots/T7/initial/${orient}-${t}.png`);}
  const info=await p.eval(`({ready:window.__readyInfo,fonts:document.fonts.check('700 40px "Noto Sans SC"'),barlow:document.fonts.check('700 40px "Barlow Semi Condensed"'),fontStatus:document.fonts.status,stage:[__motion.stage.width,__motion.stage.height]})`);
  console.log(JSON.stringify({orient,errors,info}));await p.send('Page.close');
 }
}finally{await browser.close();}
