import fs from 'node:fs';
import vm from 'node:vm';
import {directEntry,openBrowser,openCase} from './plate.mjs';
directEntry();
const roots={
  'corner-hud':['.hud-top','.hud-bottom','#hudgfx','.attrib'],
  'vertical-title-blur':['#intro','#loc','#flashback','#outro .ou-fin'],
  'card-expand-fullscreen':['#cards .card:nth-child(2)','#labels .mk-label:nth-child(4)'],
  'chapter-frame':['#chapter','#decor'],
  'split-compare-stamp':['#compare'],
  'collect-counter':['#badge','#hudgfx .stepper-g','#hudgfx .stamp'],
  'outro-stat-stack':['#outro'],
  'seekable-timeline':['.hud-top','.hud-bottom','.attrib','#hudgfx .stepper-g','#badge','#cards .card:nth-child(1)'],
  'film-grain':[],
};
const oi=process.argv.indexOf('--only');
const ids=oi<0?Object.keys(roots):process.argv[oi+1].split(',');
const rows=JSON.parse(fs.readFileSync('dev/shots/T4b/parity/index.json','utf8')).rows.filter(r=>ids.includes(r.id));
for(const id of ids){
  const ctx={window:{}};vm.runInNewContext(fs.readFileSync('demos/patterns/'+id+'/config.js','utf8'),ctx);
  const config=ctx.window.CONFIG;
  for(const row of rows.filter(r=>r.id===id)){
    const segment=config.segments[row.segment],p=Math.max(0,Math.min(1,(row.t-segment.start)/segment.duration));
    const e=segment.mode==='drag'?(p<.5?4*p*p*p:1-((-2*p+2)**3)/2):p;
    row.caseT=id==='film-grain'?segment.from:segment.from+(segment.to-segment.from)*e;
  }
}
const probe=`(selectors)=>{
  const st=__motion.stage,rr=st.root.getBoundingClientRect(),scale=st.scale||1,out={},seen=new Set();
  const shown=e=>{let opacity=1;for(let p=e;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden')return false;opacity*=Number(c.opacity);}return opacity>.001;};
  for(const selector of selectors) [...document.querySelectorAll(selector)].forEach((root,ri)=>{
    for(const e of [root,...root.querySelectorAll('*')]) {
      if(seen.has(e)||!shown(e))continue;seen.add(e);
      let text='';for(const n of e.childNodes)if(n.nodeType===3)text+=n.textContent;
      text=text.replace(/\\s+/g,' ').trim();if(!text)continue;
      const chain=[];for(let n=e;n!==root;n=n.parentElement)chain.unshift([...n.parentElement.children].indexOf(n));
      const c=getComputedStyle(e),r=e.getBoundingClientRect();
      out[selector+'['+ri+']/'+chain.join('/') ]={text,font:c.fontSize,fontFamily:c.fontFamily,fontWeight:c.fontWeight,color:c.color,transform:c.transform,rect:[(r.x-rr.x)/scale,(r.y-rr.y)/scale,r.width/scale,r.height/scale]};
    }
  });return out;
}`;
const report={frames:[],differences:[]};
const browser=await openBrowser();
try{
  for(const orient of ['landscape','portrait']){
    const source=await openCase(browser,orient);
    for(const id of ids){
      const jobs=rows.filter(r=>r.id===id&&r.orient===orient),selectors=roots[id];
      await source.send('Page.bringToFront');
      const reference=await source.eval(`(async()=>{const probe=${probe},out={},pending=[];for(const t of ${JSON.stringify([...new Set(jobs.map(r=>r.caseT))])}){pending.push(__motion.seek(t));out[t]=probe(${JSON.stringify(selectors)});}await Promise.all(pending);return out;})()`,60000);
      const page=await browser.newPage();await page.viewport(...(orient==='portrait'?[1080,1920]:[1920,1080]),1);
      await page.goto('http://localhost:4322/demos/patterns/'+id+'/index.html?render=1&orient='+orient,60000);
      await page.waitFor('window.__motion',30000);await page.eval('Promise.resolve(__motion.ready).then(()=>true)',60000);
      await page.eval('__motion.pause()');
      const actual=await page.eval(`(async()=>{const probe=${probe},out={};for(const t of ${JSON.stringify(jobs.map(r=>r.t))}){await __motion.seek(t);out[t]=probe(${JSON.stringify(selectors)});}return out;})()`,60000);
      for(const job of jobs){
        const a=actual[job.t],b=reference[job.caseT],differences=[];
        for(const key of new Set([...Object.keys(a),...Object.keys(b)])){
          const x=a[key],y=b[key];
          if(!x||!y){differences.push({key,property:'visible',pattern:x||null,case:y||null});continue;}
          for(const property of ['text','font','fontFamily','fontWeight','color','transform'])if(x[property]!==y[property])differences.push({key,property,pattern:x[property],case:y[property]});
          const anchored=key.startsWith('#labels');
          if(!anchored&&x.rect.some((v,i)=>Math.abs(v-y.rect[i])>.15))differences.push({key,property:'rect',pattern:x.rect,case:y.rect});
        }
        const row={id,orient,t:job.t,caseT:job.caseT,parts:Object.keys(a).length,differences: differences.length};
        report.frames.push(row);report.differences.push(...differences.map(d=>({...row,...d})));
      }
      await page.send('Page.close');console.log(`overlay ${id}/${orient}: ${jobs.length} frames`);
    }
    await source.send('Page.close');
  }
}finally{await browser.close();fs.writeFileSync('dev/shots/T4b/parity/overlay-check.json',JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({frames:report.frames.length,parts:report.frames.reduce((n,r)=>n+r.parts,0),differences:report.differences.length}));
