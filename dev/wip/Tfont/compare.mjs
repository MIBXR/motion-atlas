import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {launch} from '../../../scripts/lib/cdp.mjs';
import {directEntry} from '../T4b/tools/plate.mjs';

directEntry();
const directory = 'dev/shots/Tfont/compare';
const referenceDirectory = 'dev/shots/Tfont/reference';
const currentDirectory = 'demos/cases/map-pilgrimage';
const oldStarts = [0, 3.3, 4, 8.2, 11.6, 31, 11.6, 15.8, 20.6, 21.6, 25.2, 29.4, 33, 35.3, 38.1, 41, 44.3, 50.6, 51];
const source = fs.readFileSync(`${currentDirectory}/script.js`, 'utf8');
const markerSource = source.match(/const markers = (\[[\s\S]*?\n  \]);/);
if (!markerSource) throw new Error('Current case markers not found');
const markers = vm.runInNewContext(`(${markerSource[1]})`);
if (markers.length !== oldStarts.length) throw new Error(`Expected 19 markers, found ${markers.length}`);
const args = process.argv.slice(2), onlyIndex = args.indexOf('--only');
const selected = onlyIndex < 0 ? null : new Set(args[onlyIndex + 1].split(',').map(Number));
const mapping = markers.map((marker, index) => ({
  index: index + 1, label: marker.label, afterT: marker.t + .5, beforeT: oldStarts[index] + .5,
}));
const manifest = {
  source: JSON.parse(fs.readFileSync(`${referenceDirectory}/source.json`, 'utf8')),
  method: 'Same typography roles at nearby content times. Subjects, layout, language, and source media differ; this is not a pixel parity comparison.',
  composition: {
    landscape: {beforeViewport: [1280, 720], beforeScale: 1.5, afterViewport: [1920, 1080], output: [3840, 1080]},
    portrait: {beforeViewport: [390, 844], beforeScale: 1080 / 390, afterViewport: [1080, 1920], beforeScaled: [1080, Math.round(844 * 1080 / 390)], output: [2160, Math.round(844 * 1080 / 390)], padding: 'After image padded at bottom to reference height; no stretching.'},
  },
  mapping, rows: [], errors: [],
};
fs.mkdirSync(directory, {recursive: true});
fs.mkdirSync(`${directory}/raw`, {recursive: true});
const save = () => fs.writeFileSync(`${directory}/index.json`, JSON.stringify(manifest, null, 2) + '\n');
const nextFrames = 'new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))';

async function idle(page) {
  return page.eval(`new Promise((resolve,reject)=>{
    const map=window.__map||window.__fontCompareMap;
    if(!map){reject(new Error('Real map not captured'));return;}
    const state=()=>({loaded:map.loaded(),tilesLoaded:map.areTilesLoaded(),moving:map.isMoving()});
    const finish=()=>{const s=state();if(s.loaded&&s.tilesLoaded&&!s.moving){clearTimeout(timer);map.off('idle',finish);resolve(s);}};
    const timer=setTimeout(()=>{map.off('idle',finish);reject(new Error('Font comparison map idle failed: '+JSON.stringify(state())));},30000);
    map.on('idle',finish);map.triggerRepaint();
  })`, 35000);
}

async function open(browser, orient, before) {
  const page = await browser.newPage();
  const [width, height] = before ? (orient === 'portrait' ? [390, 844] : [1280, 720]) : (orient === 'portrait' ? [1080, 1920] : [1920, 1080]);
  await page.viewport(width, height, 1);
  page.on('Runtime.exceptionThrown', (event) => {
    manifest.errors.push({orient, before, error: event.exceptionDetails?.exception?.description || event.exceptionDetails?.text});
  });
  const url = new URL(`http://localhost:4322/${before ? referenceDirectory : currentDirectory}/index.html`);
  url.searchParams.set('render', '1');
  url.searchParams.set('t', '.5');
  if (!before) url.searchParams.set('orient', orient);
  await page.goto(url.href, 60000);
  await page.waitFor('window.__motion', 60000);
  await page.eval('Promise.resolve(__motion.ready).then(()=>true)', 120000);
  if (await page.eval('document.querySelector("#stage").classList.contains("no-map")')) throw new Error(`${before ? 'Reference' : 'Current'} ${orient}: fallback map`);
  await page.eval('__motion.pause()');
  await page.eval('document.fonts.ready.then(()=>true)');
  if (before) {
    await page.eval(`(()=>{
      const prototype=window.maplibregl.Map.prototype,original=prototype.jumpTo;
      prototype.jumpTo=function(...args){window.__fontCompareMap=this;return original.apply(this,args);};
    })()`);
  }
  return page;
}

async function capture(page, t, file, before, orient) {
  await page.send('Page.bringToFront');
  await page.eval(`__motion.seek(${t})`, 60000);
  const mapState = await idle(page);
  await page.eval(nextFrames);
  const state = await page.eval(`(()=>{
    const map=window.__map||window.__fontCompareMap,gl=map.painter.context.gl,debug=gl.getExtension('WEBGL_debug_renderer_info');
    const root=document.querySelector('#stage');
    const visible=e=>{let opacity=1;for(let p=e;p;p=p.parentElement){const c=getComputedStyle(p);opacity*=Number(c.opacity);if(c.display==='none'||c.visibility==='hidden')return false;}const r=e.getBoundingClientRect();return opacity>.001&&r.width>0&&r.height>0;};
    const selectors=['.it-cjk','.it-en','.it-sub','.lt-cjk','.lt-en','.lt-sub','.dc-row','.dc-date','.ct-chip','.ct-title','.al-title','.al-detail','.al-chip','.ts-text','.ts-sub','.nt-text','.nt-sign','.hd-title','.hd-title small','.hd-date','.hud-geo','.hud-clock','.hc-tz','.st-label','.bd-label','.bd-n','.np-head','.np-track','.np-lyric','.np-sub','.attrib','.ou-stats b','.ou-stats span','.ou-fin','.ou-fin small','.ou-credits','.fb-vtext','.fb-en','.fb-caption','.cmp-label','.cmp-stamp','.mk-label'];
    const text=selectors.flatMap(selector=>[...root.querySelectorAll(selector)].filter(visible).map(element=>{const c=getComputedStyle(element),r=element.getBoundingClientRect();return{selector,text:element.textContent.trim().slice(0,80),fontSize:parseFloat(c.fontSize),lineHeight:c.lineHeight,box:[r.x,r.y,r.width,r.height]};}));
    return{actualT:__motion.time,viewport:[innerWidth,innerHeight],fallback:root.classList.contains('no-map'),renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),stage:__motion.stage?{width:__motion.stage.width,height:__motion.stage.height,scale:__motion.stage.scale}:null,text};
  })()`);
  if (state.fallback || /swiftshader|llvmpipe|software|microsoft basic render/i.test(state.renderer)) throw new Error(`${before ? 'Reference' : 'Current'} ${orient}: invalid map renderer ${state.renderer}`);
  if (!before && state.stage?.scale !== 1) throw new Error(`Current case ${orient}: stage scale ${state.stage?.scale}`);
  await page.screenshot(file);
  return {...state, mapState, file};
}

function combine(before, after, output, orient) {
  const filter = orient === 'landscape'
    ? '[0:v]scale=1920:1080:flags=lanczos,setsar=1[b];[1:v]setsar=1[a];[b][a]hstack=inputs=2'
    : '[0:v]scale=1080:2337:flags=lanczos,setsar=1[b];[1:v]pad=1080:2337:0:0:black,setsar=1[a];[b][a]hstack=inputs=2';
  const result = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', before, '-i', after, '-filter_complex', filter, '-frames:v', '1', output], {encoding: 'utf8'});
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || 'Font comparison hstack failed');
}

const browser = await launch({width: 1920, height: 1080, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist']});
try {
  for (const orient of ['landscape', 'portrait']) {
    const beforePage = await open(browser, orient, true);
    const afterPage = await open(browser, orient, false);
    for (const item of mapping.filter((row) => !selected || selected.has(row.index))) {
      const name = `${String(item.index).padStart(2, '0')}-${orient}`;
      const before = await capture(beforePage, item.beforeT, `${directory}/raw/${name}-before.png`, true, orient);
      const after = await capture(afterPage, item.afterT, `${directory}/raw/${name}-after.png`, false, orient);
      const file = `${directory}/${name}.png`;
      combine(before.file, after.file, file, orient);
      manifest.rows.push({...item, orient, before, after, file});
      save();
      console.log(`font compare ${name}: before ${item.beforeT}s / after ${item.afterT}s, ${after.renderer}`);
    }
    await beforePage.send('Page.close');
    await afterPage.send('Page.close');
  }
} catch (error) {
  manifest.errors.push({error: error.stack || error.message});
  throw error;
} finally {
  save();
  await browser.close();
}
console.log(JSON.stringify({pairs: manifest.rows.length, errors: manifest.errors.length, index: `${directory}/index.json`}));
if (manifest.errors.length) process.exitCode = 1;
