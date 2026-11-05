import fs from 'node:fs';
import path from 'node:path';


import { pathToFileURL } from 'node:url';
const { launch } = await import(pathToFileURL(path.join(path.resolve(process.argv[3]), 'scripts/lib/cdp.mjs')).href);
const out=path.join(path.resolve(process.argv[2]),'codex/case-impl'),dest=path.join(out,'intro-rasters');fs.mkdirSync(dest,{recursive:true});
process.env.BROWSER_PATH='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser=await launch({width:1920,height:1080,port:19363,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});
try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:4362/demos/cases/butterfly-garden-score/index.html?render=1&embed=1',60000);await page.waitFor('window.__motion?.duration>0',60000);await page.eval('Promise.resolve(__motion.ready).then(()=>document.fonts.ready).then(()=>true)',90000);
  const glyphs=[...'劇場版 少女☆歌劇 レヴュースタァライト 劇伴'];const metrics=[];
  const actors=glyphs.flatMap((text,index)=>text===' '?[]:[['NotoSerif',400],['NotoSerif',500],['NotoSerif',700],['Shippori',700]].map(([family,weight])=>({id:`jp-${index}-${family}-${weight}`,text,index,family,weight,size:30,x:1018,y:184+37*index})));
  actors.push({id:'prologue',text:'Prologue — bars 1–2',family:'Cormorant',weight:500,size:32,x:141,y:161});
  for(const w of actors){
    const r=await page.eval(`(()=>{const w=${JSON.stringify(w)},c=document.createElement('canvas'),x=c.getContext('2d');x.font=(w.family==='Cormorant'?'italic ':'')+w.weight+' '+w.size+'px "'+w.family+'","NotoSerif",serif';const m=x.measureText(w.text),font=x.font,p=8;c.width=Math.ceil((m.actualBoundingBoxLeft+m.actualBoundingBoxRight+2*p)*2);c.height=Math.ceil((m.actualBoundingBoxAscent+m.actualBoundingBoxDescent+2*p)*2);x.scale(2,2);x.font=font;x.fillStyle='white';x.fillText(w.text,p+m.actualBoundingBoxLeft,p+m.actualBoundingBoxAscent);return{image:c.toDataURL('image/png'),anchor:[p+m.actualBoundingBoxLeft,p+m.actualBoundingBoxAscent]}})()`);
    fs.writeFileSync(path.join(dest,w.id+'.png'),Buffer.from(r.image.split(',')[1],'base64'));delete r.image;metrics.push({...w,...r});
  }
  fs.writeFileSync(path.join(out,'intro-raster-metrics.json'),JSON.stringify(metrics));console.log('intro font rasters',metrics.length);
}finally{await browser.close()}

