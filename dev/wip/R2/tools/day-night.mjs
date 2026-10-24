import fs from 'node:fs';
import {launch} from '../../../../scripts/lib/cdp.mjs';
import {spawnSync} from 'node:child_process';
import {directEntry,openBrowser,openCase,seekIdle} from '../../T4b/tools/plate.mjs';

directEntry();
const effectRoot='dev/shots/R2/day-night';
const dir=effectRoot+'/mad';
fs.mkdirSync(dir,{recursive:true});

const snapshot=`(() => {
  const st=__motion.stage,root=st.root,r=root.getBoundingClientRect(),k=st.scale;
  const shown=e=>{let opacity=1;for(let p=e;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden')return false;opacity*=Number(c.opacity);}return opacity>.001;};
  const masks=[];
  const push=(b,element,type,shadow='none',extent={left:0,right:0,top:0,bottom:0})=>{
    if(b.width===0&&b.height===0)return;
    masks.push({element,type,x:(b.left-r.left)/k-extent.left-2,y:(b.top-r.top)/k-extent.top-2,w:b.width/k+extent.left+extent.right+4,h:b.height/k+extent.top+extent.bottom+4,shadow});
  };
  const surfaces='#badge,#note,#toast,#chapter .ct-chip,#flashback,#compare,#alert .al-bar,#alert .al-chip,.card .cd-media,.mk-label,.rt-tag,.attrib';
  for(const e of root.querySelectorAll(surfaces)) {
    if(!shown(e))continue;
    const computed=getComputedStyle(e),background=computed.backgroundColor;
    const alpha=background.startsWith('rgba')?Number(background.slice(background.lastIndexOf(',')+1,-1).trim()):background==='transparent'?0:1;
    if(alpha===0&&computed.backgroundImage==='none'&&!e.querySelector('canvas'))continue;
    const b=e.getBoundingClientRect();
    let left=0,right=0,top=0,bottom=0;
    const shadow=computed.boxShadow;
    if(shadow!=='none')for(const part of shadow.replace(/rgba?\\([^)]*\\)/g,'').split(',')) {
      if(part.includes('inset'))continue;
      const [x,y,blur=0,spread=0]=(part.match(/-?\\d*\\.?\\d+px/g)||[]).map(parseFloat);
      const extent=2*blur+spread;
      left=Math.max(left,extent-x);right=Math.max(right,extent+x);top=Math.max(top,extent-y);bottom=Math.max(bottom,extent+y);
    }
    push(b,e.id||e.getAttribute('class')||e.tagName,'painted-surface',shadow,{left,right,top,bottom});
  }
  const selectors='.hud-day,.compass,.hud-geo,.hud-clock,.np,.scale,.attrib,#badge,#note,#toast,#chapter,#intro,#loc,#daycard,#flashback,#compare,#outro,#alert,.card,.mk-label,.rt-tag';
  const seen=new Set();
  for(const e of root.querySelectorAll(selectors)) {
    const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
    for(let node;node=walker.nextNode();) {
      if(seen.has(node)||!node.textContent.trim()||!shown(node.parentElement))continue;
      seen.add(node);const range=document.createRange();range.selectNodeContents(node);
      for(const rect of range.getClientRects())push(rect,node.parentElement.id||node.parentElement.getAttribute('class')||node.parentElement.tagName,'text-range');
    }
  }
  for(const e of root.querySelectorAll('#geo path,#geo line,#geo circle,#geo rect,#geo polygon,#geo polyline,#hudgfx text,#hudgfx path,#hudgfx line,#hudgfx circle,#hudgfx rect,.compass path,.compass line,.compass circle,.np svg rect'))if(shown(e))push(e.getBoundingClientRect(),e.getAttribute('class')||e.tagName,'svg-leaf');
  const m=__map,g=m.painter.context.gl,ext=g.getExtension('WEBGL_debug_renderer_info');
  const wash=document.querySelector('#wash'),c=getComputedStyle(root);
  return {actualT:__motion.time,width:st.width,height:st.height,scale:k,renderer:ext?g.getParameter(ext.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER),camera:{center:m.getCenter().toArray(),zoom:m.getZoom(),bearing:m.getBearing(),pitch:m.getPitch(),padding:m.getPadding()},night:c.getPropertyValue('--night'),clock:document.querySelector('.hc-time').textContent,wash:{display:getComputedStyle(wash).display,opacity:getComputedStyle(wash).opacity,background:getComputedStyle(wash).backgroundImage},grain:{opacity:getComputedStyle(document.querySelector('#grain')).opacity,transform:document.querySelector('#grain').style.transform},masks};
})()`;
function thumbnail(file,width,height) {
  const r=spawnSync('ffmpeg',['-v','error','-i',file,'-vf',`scale=${width}:${height}:flags=area`,'-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],{maxBuffer:1024*1024});
  if(r.status!==0)throw new Error(r.stderr.toString()||r.error?.message||'thumbnail failed');
  if(r.stdout.length!==width*height*3)throw new Error('Unexpected thumbnail dimensions');
  return r.stdout;
}
function compare(pattern,reference,orient) {
  const [width,height]=orient==='portrait'?[108,192]:[192,108];
  const a=thumbnail(pattern.file,width,height),b=thumbnail(reference.file,width,height);
  const masks=[...pattern.state.masks,...reference.state.masks];
  const scaleX=pattern.state.width/width,scaleY=pattern.state.height/height;
  let pixels=0,total=0;const meanA=[0,0,0],meanB=[0,0,0],regions={};
  const mask=Buffer.alloc(width*height*3);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const cell={x:x*scaleX,y:y*scaleY,w:scaleX,h:scaleY},i=(y*width+x)*3;
    const quadrant=(y<height/2?'top':'bottom')+(x<width/2?'Left':'Right');
    const region=regions[quadrant]||(regions[quadrant]={pixels:0,totalPixels:0,totalAbsoluteDifference:0});region.totalPixels++;
    const excluded=masks.some(r=>cell.x<r.x+r.w&&cell.x+cell.w>r.x&&cell.y<r.y+r.h&&cell.y+cell.h>r.y);
    if(excluded)continue;
    pixels++;region.pixels++;
    for(let c=0;c<3;c++){const difference=Math.abs(a[i+c]-b[i+c]);total+=difference;region.totalAbsoluteDifference+=difference;meanA[c]+=a[i+c];meanB[c]+=b[i+c];mask[i+c]=255;}
  }
  const maskFile=`${dir}/${orient}-case-${reference.t}-mask.ppm`;
  fs.writeFileSync(maskFile,Buffer.concat([Buffer.from(`P6\n${width} ${height}\n255\n`),mask]));
  const maskPng=maskFile.replace(/\.ppm$/,'.png');
  const encoded=spawnSync('ffmpeg',['-y','-v','error','-i',maskFile,'-vf','scale=iw*4:ih*4:flags=neighbor','-frames:v','1',maskPng]);
  if(encoded.status!==0)throw new Error(encoded.stderr.toString()||'mask PNG encoding failed');
  for(const region of Object.values(regions)){region.coverage=region.pixels/region.totalPixels;region.mad=region.pixels?region.totalAbsoluteDifference/(region.pixels*3):null;}
  return {caseT:reference.t,thumbnail:{width,height,filter:'area'},pixels,totalPixels:width*height,coverage:pixels/(width*height),regions,mad:total/(pixels*3),pass:pixels>0&&total/(pixels*3)<4,meanPattern:meanA.map(v=>v/pixels),meanCase:meanB.map(v=>v/pixels),maskFile,maskPng,maskLegend:'White pixels participate; black pixels are excluded. Enlarged4x with nearest-neighbor solely for inspection.',masks};
}
const report={patternT:3.2,mappedCaseT:34.5,acceptanceCaseT:34.5,threshold:4,unit:'mean absolute RGB channel difference, 0–255',patternInput:'Fresh native scale1 screenshots of pattern t3.2 and case t34.5, captured by this run.',method:'Area-average thumbnail. Union of visible text Range and SVG painted-leaf bounds from both full screenshots is excluded; opaque/canvas surfaces retain full bounds and computed shadows(2×blur+spread). Edge margin2px. No whole HUD/stepper-group bounding boxes. Map wash, grain, vignette and HUD fade remain; specified camera poses retained.',passMeaning:'Numerical MAD <4 only. Inspect maskPng, coverage and regional coverage before treating it as representative map comparison; no new coverage threshold or extra masks are introduced to obtain a pass.',items:[]};
const browser=await launch({width:1920,height:1080,args:['--enable-gpu','--use-angle=d3d11','--ignore-gpu-blocklist']});
try {
  for(const orient of ['landscape','portrait']) {
    const page=await browser.newPage();
    await page.viewport(...(orient==='portrait'?[1080,1920]:[1920,1080]),1);
    await page.goto(`http://localhost:4322/demos/patterns/day-night-flip/index.html?render=1&orient=${orient}`,60000);
    await page.waitFor('window.__motion && window.__map',30000);
    await page.eval('Promise.resolve(__motion.ready).then(()=>true)',60000);
    await page.eval('__motion.pause()');
    for(const t of [3.2]) {
      await seekIdle(page,t);
      await page.screenshot(effectRoot+'/'+orient+'-'+t+'.png');
    }
    const pattern={t:3.2,file:`${effectRoot}/${orient}-3.2.png`,state:await page.eval(snapshot)};
    if(pattern.state.scale!==1)throw new Error('Expected native stage scale1');
    await page.send('Page.close');
    const source=await openCase(browser,orient,null,34.5),references=[];
    for(const t of [34.5]) {
      await seekIdle(source,t);
      const reference={t,file:`${dir}/${orient}-case-${t}.png`,state:await source.eval(snapshot)};
      await source.screenshot(reference.file);references.push(reference);
    }
    await source.send('Page.close');
    const item={orient,pattern,references,comparisons:references.map(reference=>compare(pattern,reference,orient))};
    report.items.push(item);
    fs.writeFileSync(`${dir}/verification.json`,JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({orient,renderer:pattern.state.renderer,comparisons:item.comparisons.map(({caseT,mad,coverage,pass})=>({caseT,mad,coverage,pass}))}));
  }
} finally {await browser.close();}
const acceptance=report.items.map(item=>item.comparisons.find(row=>row.caseT===34.5));
report.pass=acceptance.length===2&&acceptance.every(row=>row.pass&&row.pixels>0);
fs.writeFileSync(`${dir}/verification.json`,JSON.stringify(report,null,2)+'\n');
fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：day-night t3.2 / case34.5 缩略RGB MAD 双画幅已测，结果 ${acceptance.map(row=>row.mad.toFixed(6)).join('/')}，严格小于4=${report.pass}；完整图/叶节点遮挡矩形/参与像素与分区覆盖/PNG mask/renderer/camera见 ${dir}/verification.json。\n`);
if(!report.pass)process.exitCode=1;
