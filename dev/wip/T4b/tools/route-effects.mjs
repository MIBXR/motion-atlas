import fs from 'node:fs';
import {directEntry,openBrowser,seekIdle} from './plate.mjs';

directEntry();
const dir='dev/shots/T4b/fix5-effects/route-draw-marker';
fs.mkdirSync(dir,{recursive:true});
const report={id:'route-draw-marker',times:[9,10.4],candidateIndexBase:0,items:[],errors:[]};
const snapshot=`(() => {
  const st=__motion.stage,root=st.root,sr=root.getBoundingClientRect(),k=st.scale,m=__map;
  const shown=e=>{for(let p=e;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden'||Number(c.opacity)<=.001)return false;}return true;};
  const box=e=>{const r=e.getBoundingClientRect();return {x:(r.x-sr.x)/k,y:(r.y-sr.y)/k,w:r.width/k,h:r.height/k};};
  const stops=['jrNara','naraPark'].map(id=>{const ll=CASE_CONFIG.stops[id].lngLat,p=m.project(ll),index=CASE_CONFIG.tracks.markers.findIndex(marker=>marker.stop===id),e=document.querySelectorAll('.mk-label')[index];return {id,lngLat:ll,x:p.x,y:p.y,label:{shown:shown(e),text:e.textContent,opacity:getComputedStyle(e).opacity,box:box(e),transform:e.style.transform}};});
  const g=m.painter.context.gl,ext=g.getExtension('WEBGL_debug_renderer_info');
  const attribution=document.querySelector('.attrib');
  return {actualT:__motion.time,orient:st.orient,width:st.width,height:st.height,scale:k,renderer:ext?g.getParameter(ext.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER),camera:{center:m.getCenter().toArray(),zoom:m.getZoom(),bearing:m.getBearing(),pitch:m.getPitch(),padding:m.getPadding()},stops,placement:window.__routeLabelDiagnostics,attribution:{shown:shown(attribution),box:box(attribution),zIndex:getComputedStyle(attribution).zIndex},loaded:m.loaded(),tilesLoaded:m.areTilesLoaded()};
})()`;
const browser=await openBrowser();
try {
  for(const orient of ['landscape','portrait']) {
    const page=await browser.newPage();
    page.on('Runtime.exceptionThrown',event=>report.errors.push({orient,error:event.exceptionDetails?.exception?.description||event.exceptionDetails?.text}));
    await page.viewport(...(orient==='portrait'?[1080,1920]:[1920,1080]),1);
    await page.goto(`http://localhost:4322/demos/patterns/route-draw-marker/index.html?render=1&orient=${orient}`,60000);
    await page.waitFor('window.__motion && window.__map',30000);
    await page.eval('Promise.resolve(__motion.ready).then(()=>true)',60000);
    await page.eval('__motion.pause()');
    for(const t of report.times) {
      await seekIdle(page,t);
      await page.eval('new Promise(resolve=>requestAnimationFrame(resolve))');
      const state=await page.eval(snapshot);
      if(state.scale!==1||state.actualT!==t||!state.placement)throw new Error('Expected native stage, requested time, and render label diagnostics');
      const file=`${dir}/${orient}-${t}.png`;
      await page.screenshot(file);
      const item={orient,t,file,...state};report.items.push(item);
      fs.writeFileSync(`${dir}/${orient}-${t}.json`,JSON.stringify(item,null,2)+'\n');
      fs.writeFileSync(`${dir}/index.json`,JSON.stringify(report,null,2)+'\n');
      console.log(JSON.stringify({orient,t,file,renderer:state.renderer,camera:state.camera,stops:state.stops.map(({id,x,y})=>({id,x,y})),labels:state.placement.labels.map(({stop,selectedCandidateIndex,side,dy,fallback,finalCollisions})=>({stop,selectedCandidateIndex,side,dy,fallback,finalCollisions}))}));
    }
    await page.send('Page.close');
  }
} finally {await browser.close();}
fs.writeFileSync(`${dir}/index.json`,JSON.stringify(report,null,2)+'\n');
fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：route S3 t9/10.4 横竖四张效果图与实际镜头/两站坐标/候选序号、side、dy、fallback及碰撞诊断已保存 ${dir}/index.json；浏览器已关闭。此项为效果采样，不属于完整验收。\n`);
if(report.errors.length)process.exitCode=1;
