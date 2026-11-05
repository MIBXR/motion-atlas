import fs from 'node:fs';
import path from 'node:path';


import { pathToFileURL } from 'node:url';
const { launch } = await import(pathToFileURL(path.join(path.resolve(process.argv[3]), 'scripts/lib/cdp.mjs')).href);
const out=path.join(path.resolve(process.argv[2]),'codex/case-impl'),words=JSON.parse(fs.readFileSync(path.join(out,'word-descriptors.json'),'utf8')),dest=path.join(out,'word-rasters');
fs.mkdirSync(dest,{recursive:true});process.env.BROWSER_PATH='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser=await launch({width:1920,height:1080,port:19362});
try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:4362/demos/cases/butterfly-garden-score/index.html?render=1&embed=1',60000);await page.waitFor('window.__motion?.duration>0',60000);await page.eval('Promise.resolve(__motion.ready).then(()=>document.fonts.ready).then(()=>true)',90000);
  const metrics={};
  for(const w of words){
    const result=await page.eval(`(()=>{const w=${JSON.stringify(w)},c=document.createElement('canvas'),p=20,d=2,x=c.getContext('2d');x.font=(w.fontFamily==='Cormorant'?'italic ':'')+w.fontWeight+' '+w.fontSize+'px "'+w.fontFamily+'","NotoSerif",serif';const m=x.measureText(w.text),font=x.font;c.width=Math.ceil((m.actualBoundingBoxLeft+m.actualBoundingBoxRight+2*p)*d);c.height=Math.ceil((m.actualBoundingBoxAscent+m.actualBoundingBoxDescent+2*p)*d);x.scale(d,d);x.font=font;x.fillStyle='white';x.textBaseline='alphabetic';x.fillText(w.text,p+m.actualBoundingBoxLeft,p+m.actualBoundingBoxAscent);return{image:c.toDataURL('image/png'),left:m.actualBoundingBoxLeft,right:m.actualBoundingBoxRight,ascent:m.actualBoundingBoxAscent,descent:m.actualBoundingBoxDescent,anchor:[p+m.actualBoundingBoxLeft,p+m.actualBoundingBoxAscent]}})()`);
    fs.writeFileSync(path.join(dest,w.id+'.png'),Buffer.from(result.image.split(',')[1],'base64'));delete result.image;metrics[w.id]=result;
  }
  fs.writeFileSync(path.join(out,'word-font-metrics.json'),JSON.stringify(metrics,null,2));console.log('word rasters',words.length);
}finally{await browser.close()}
