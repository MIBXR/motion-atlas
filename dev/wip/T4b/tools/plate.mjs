import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {launch} from '../../../../scripts/lib/cdp.mjs';

export const plateName = (t, orient, layers) => `${orient}-${Number(t)}-${layers.replaceAll(',', '-')}`;
export function directEntry() {
  if (process.execArgv.some(a => a.endsWith('direct-browser.mjs'))) return;
  const r = spawnSync(process.execPath, ['--import', './dev/wip/T4a/tools/direct-browser.mjs', ...process.argv.slice(1)], {stdio: 'inherit'});
  process.exit(r.status ?? 1);
}
export const openBrowser = () => launch({width: 1920, height: 1080});
export async function openCase(browser, orient, layers = null, t = 10.4) {
  const page = await browser.newPage();
  await page.viewport(...(orient === 'portrait' ? [1080, 1920] : [1920, 1080]), 1);
  const u = new URL('http://localhost:4322/demos/cases/map-pilgrimage/index.html');
  for (const [key, value] of Object.entries({render: '1', t, orient, ...(layers ? {layers} : {})})) u.searchParams.set(key, value);
  await page.goto(u.href, 60000);
  await page.waitFor('window.__motion && window.__map', 30000);
  await page.eval('Promise.resolve(__motion.ready).then(() => true)', 60000);
  const info = await page.eval('({fallback:document.querySelector("#stage").classList.contains("no-map"),width:__motion.stage.width,height:__motion.stage.height,scale:__motion.stage.scale})');
  if (info.fallback || info.scale !== 1) throw new Error(`Expected real native map: ${JSON.stringify(info)}`);
  await page.eval('__motion.pause()');
  return page;
}
export async function seekIdle(page, t) {
  await page.eval(`__motion.seek(${Number(t)})`, 60000);
  return page.eval(`new Promise((resolve,reject) => {
    const m=__map;
    const state=()=>{
      const sources=Object.entries(m.style.sourceCaches).filter(([id])=>m.style._order.some(lid=>{const l=m.style._layers[lid];return l.source===id&&!l.isHidden(m.getZoom());})).map(([id,sc])=>({id,tiles:Object.values(sc._tiles).map(tile=>({key:tile.tileID.key,state:tile.state}))}));
      return {loaded:m.loaded(),tilesLoaded:m.areTilesLoaded(),moving:m.isMoving(),sources};
    };
    const done=()=>{const s=state();if(s.loaded&&s.tilesLoaded&&!s.moving&&s.sources.every(sc=>sc.tiles.every(tile=>tile.state==='loaded'))){clearTimeout(timer);m.off('idle',done);resolve({...s,idleEvent:true});}};
    const timer=setTimeout(()=>{m.off('idle',done);reject(new Error('Map idle / loaded tile gate failed: '+JSON.stringify(state())));},30000);
    m.on('idle',done);m.triggerRepaint();
  })`, 35000);
}
export async function snapshot(page) {
  return page.eval(`(() => {
    const m=__map,st=__motion.stage,rr=st.root.getBoundingClientRect(),scale=st.scale||1;
    const box=e=>{const r=e.getBoundingClientRect();return {x:(r.x-rr.x)/scale,y:(r.y-rr.y)/scale,w:r.width/scale,h:r.height/scale};};
    const shown=e=>{for(let p=e;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden'||Number(c.opacity)===0)return false;}return true;};
    const stops=Object.fromEntries(Object.entries(CONFIG.stops).map(([id,s])=>{const p=m.project(s.lngLat);return [id,{x:p.x,y:p.y}];}));
    const labels=[...document.querySelectorAll('.mk-label')].map((e,i)=>({stop:CONFIG.tracks.markers[i].stop,visible:shown(e),box:box(e),transform:e.style.transform,text:e.querySelector('.mk-en').textContent,ja:e.querySelector('em').textContent}));
    const leader=document.querySelector('#geo .leader'),cap=document.querySelector('#geo .leader-cap');
    const c=m.getCenter(),g=m.painter.context.gl,e=g.getExtension('WEBGL_debug_renderer_info');
    return {stops,camera:{center:[c.lng,c.lat],zoom:m.getZoom(),bearing:m.getBearing(),pitch:m.getPitch(),padding:m.getPadding()},labels,leader:leader?{d:leader.getAttribute('d'),style:leader.getAttribute('style'),cap:cap?{x:cap.getAttribute('x'),y:cap.getAttribute('y'),style:cap.getAttribute('style')}:null}:null,cards:[...document.querySelectorAll('.card')].map(e=>({visible:shown(e),box:box(e),style:e.getAttribute('style')})),renderer:e?g.getParameter(e.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)};
  })()`);
}
export async function savePlate(page, t, orient, layers, target) {
  const idle = await seekIdle(page, t);
  const key = plateName(t, orient, layers);
  const dir = 'dev/shots/T4b/plates';
  fs.mkdirSync(dir, {recursive: true});
  fs.mkdirSync(path.dirname(target), {recursive: true});
  const png = path.join(dir, key + '.png');
  await page.screenshot(png);
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-c:v', 'libwebp', '-q:v', '82', '-frames:v', '1', target], {encoding: 'utf8'});
  if (r.status !== 0) throw new Error(r.stderr || r.error?.message || 'WebP encoding failed');
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,codec_name', '-of', 'json', target], {encoding: 'utf8'});
  if (probe.status !== 0) throw new Error(probe.stderr);
  const stream = JSON.parse(probe.stdout).streams[0];
  const [width,height] = orient === 'portrait' ? [1080,1920] : [1920,1080];
  if (stream.width !== width || stream.height !== height || stream.codec_name !== 'webp') throw new Error(`Unexpected plate: ${probe.stdout}`);
  const data = {caseT:Number(t),orient,layers,quality:82,png,target,probe:stream,idle,...await snapshot(page)};
  fs.writeFileSync(path.join(dir, key + '.json'),JSON.stringify(data,null,2)+'\n');
  console.log(`plate ${key}: ${width}x${height}, WebP82, idle + loaded tiles`);
  return data;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  directEntry();
  const [time,orient,layers,target] = process.argv.slice(2);
  if (!Number.isFinite(Number(time)) || !['landscape','portrait'].includes(orient) || !['map','map,routes,markers'].includes(layers) || !target?.endsWith('.webp')) throw new Error('Usage: plate.mjs <caseT> <orient> <layers> <out.webp>');
  const browser = await openBrowser();
  try {
    const page = await openCase(browser,orient,layers,Number(time));
    await savePlate(page,Number(time),orient,layers,target);
    fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：底图 ${target} 已由案例 caseT=${time}/${orient}/${layers} 原生截图生成，WebP82、idle 与所有可见瓦片 loaded 通过。\n`);
  } finally { await browser.close(); }
}
