import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { launch } from '../../../scripts/lib/cdp.mjs';

const out = path.resolve('dev/shots/T7');
const fontOnly = process.argv.includes('--font-only');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('dev/wip/T7/parts/config.js', 'utf8'), context);
const config = context.window.CONFIG;
const browser = await launch({ width: 1920, height: 1080, args: ['--no-proxy-server'] });
const results = { fonts: [], layouts: [], failures: [] };
const fontProbe = `(() => {
  const out = [];
  for (const [orient,size,targetHeight] of [['landscape',160,920],['portrait',150,680]]) {
    const canvas = document.createElement('canvas'); canvas.width = 2000; canvas.height = 500;
    const ctx = canvas.getContext('2d', { willReadFrequently:true });
    ctx.font = '700 ' + size + 'px "Barlow Semi Condensed"'; ctx.letterSpacing = size * .02 + 'px';
    ctx.lineWidth = 2; ctx.strokeStyle = '#17191b'; ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText('ENDFIELD'); ctx.strokeText('ENDFIELD',100,300);
    const pixels = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;
    for(let y=0;y<canvas.height;y++) for(let x=0;x<canvas.width;x++) if(pixels[(y*canvas.width+x)*4+3]) {
      minX=Math.min(minX,x); minY=Math.min(minY,y); maxX=Math.max(maxX,x); maxY=Math.max(maxY,y);
    }
    const ink = { x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1 };
    out.push({ orient,font:ctx.font,fontLoaded:document.fonts.check(ctx.font,'ENDFIELD'),letterSpacing:ctx.letterSpacing,
      textWidth:m.width,actualBoundingBoxAscent:m.actualBoundingBoxAscent,actualBoundingBoxDescent:m.actualBoundingBoxDescent,
      strokeWidth:2,ink,rotatedInk:{width:ink.height,height:ink.width},target:{width:120,height:targetHeight},fits:ink.height<=120&&ink.width<=targetHeight });
  }
  return out;
})()`;

try {
  const fontPage = await browser.newPage();
  await fontPage.eval(`(async () => {
    await Promise.all(${JSON.stringify(config.fonts)}.map(href => new Promise((resolve,reject) => {
      const link = document.createElement('link'); link.rel='stylesheet'; link.href=href; link.onload=resolve; link.onerror=reject; document.head.append(link);
    })));
    await document.fonts.load('700 160px "Barlow Semi Condensed"','ENDFIELD'); await document.fonts.ready; return true;
  })()`,60000);
  results.fonts = await fontPage.eval(fontProbe);
  await fontPage.send('Page.close');
  if (!fontOnly) for (const [orient,width,height] of [['landscape',1920,1080],['portrait',1080,1920]]) {
    const page = await browser.newPage(); await page.viewport(width,height,1);
    await page.goto(`http://localhost:4325/demos/cases/industrial-protocol/index.html?render=1&embed=1&orient=${orient}`,60000);
    await page.waitFor('window.__motion && window.__motion.ready');
    await page.eval('Promise.resolve(__motion.ready).then(()=>{__motion.pause();return true;})');
    for (const t of [36.5,41.8,44,47.7]) {
      await page.send('Page.bringToFront');
      await page.eval(`(async()=>{await __motion.seek(${t});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return true;})()`);
      const layout = await page.eval(`(() => {
        const stage=__motion.stage.root, sr=stage.getBoundingClientRect(), scale=__motion.stage.scale;
        const rect = el => {if(!el)return null;const r=el.getBoundingClientRect();return{x:(r.x-sr.x)/scale,y:(r.y-sr.y)/scale,width:r.width/scale,height:r.height/scale};};
        const select = s => document.querySelector('#operator-scene '+s);
        const person=select('.op-person'), bb=person.getBBox(), matrix=person.getScreenCTM();
        const corners=[[bb.x,bb.y],[bb.x+bb.width,bb.y],[bb.x,bb.y+bb.height],[bb.x+bb.width,bb.y+bb.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(matrix));
        const xs=corners.map(p=>(p.x-sr.x)/scale),ys=corners.map(p=>(p.y-sr.y)/scale);
        const silhouette={x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
        const intersect=(a,b)=>a&&b?{overlap:a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y,width:Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)),height:Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y))}:null;
        const boxes=Object.fromEntries(['.op-level','.op-level-roll','.op-level-old','.op-level-new','.op-level-caption','.op-experience','.op-upgrade','.op-outline-frame','.op-outline-word','.op-person','.op-level-toast'].map(s=>[s,rect(select(s))]));
        const members=['.op-level-roll','.op-level-caption','.op-experience','.op-upgrade'].map(s=>boxes[s]);
        const levelUnion={x:Math.min(...members.map(r=>r.x)),y:Math.min(...members.map(r=>r.y))};
        levelUnion.width=Math.max(...members.map(r=>r.x+r.width))-levelUnion.x;levelUnion.height=Math.max(...members.map(r=>r.y+r.height))-levelUnion.y;
        const word=select('.op-outline-word'),ws=getComputedStyle(word),toast=select('.op-level-toast'),ts=getComputedStyle(toast);
        return{time:__motion.time,orient:__motion.orient,boxes,levelUnion,silhouette,wordStyle:{font:ws.font,fontSize:ws.fontSize,transform:ws.transform,overflow:ws.overflow,textStroke:ws.webkitTextStroke,letterSpacing:ws.letterSpacing},toastStyle:{opacity:ts.opacity,transform:ts.transform},captionVsPersonSVG:intersect(boxes['.op-level-caption'],boxes['.op-person']),captionVsVisibleSilhouette:intersect(boxes['.op-level-caption'],silhouette),outlineVsLevel:intersect(boxes['.op-outline-word'],levelUnion)};
      })()`);
      results.layouts.push(layout);
      if (layout.captionVsVisibleSilhouette.overlap) results.failures.push(`${orient}@${t}: LEVEL/40与可见人物矩形相交`);
      await page.screenshot(path.join(out, `s4-measure-${orient}-${t.toFixed(3)}.png`));
    }
    await page.eval(`(() => {
      const style=document.createElement('style');style.id='s4-ink-isolation';
      style.textContent='#stage{background:white!important}#stage *{visibility:hidden!important}#stage #operator-scene,#stage .op-outline-frame,#stage .op-outline-word,#stage .op-outline-word *,#stage .op-paper{visibility:visible!important}#stage .op-paper{background:white!important}#stage .op-outline-word{color:transparent!important}#stage .op-outline-text{stroke:black!important;fill:none!important}';
      document.head.append(style); return true;
    })()`);
    await page.eval('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const png = await page.screenshot(path.join(out, `s4-ink-${orient}.png`));
    const ink = await page.eval(`(async()=>{
      const img=new Image();img.src=${JSON.stringify('data:image/png;base64,'+png.toString('base64'))};await img.decode();
      const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);const p=x.getImageData(0,0,c.width,c.height).data;
      let left=c.width,top=c.height,right=-1,bottom=-1,count=0;
      for(let y=0;y<c.height;y++)for(let q=0;q<c.width;q++){const i=(y*c.width+q)*4;if(p[i]<128&&p[i+1]<128&&p[i+2]<128){left=Math.min(left,q);top=Math.min(top,y);right=Math.max(right,q);bottom=Math.max(bottom,y);count++;}}
      return{left,top,right,bottom,width:right-left+1,height:bottom-top+1,pixels:count};
    })()`);
    results.layouts.push({orient,actualOutlineInk:ink});
    await page.send('Page.close');
  }
} catch(error) { results.failures.push(error.stack||error.message); }
finally { await browser.close(); }
const target=path.join(out,fontOnly?'s4-font-measure.json':'s4-measure.json');
fs.writeFileSync(target,JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({path:target,...results},null,2));
if(results.failures.length||results.fonts.some(f=>!f.fits))process.exitCode=1;
