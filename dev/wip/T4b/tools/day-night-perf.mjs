import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const renderer = process.argv.includes('--d3d11') ? 'd3d11' : 'swiftshader';
const orient = process.argv.includes('--portrait') ? 'portrait' : 'landscape';
const repeats = process.argv.includes('--once') ? 1 : 2;
const viewport = orient === 'portrait' ? [720, 1280] : [1280, 720];
const report = { renderer, viewport, orient, runs: [], errors: [] };
const browser = await launch({ width: viewport[0], height: viewport[1], args: renderer === 'd3d11' ? ['--use-angle=d3d11'] : [] });
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', event => report.errors.push(event.exceptionDetails?.exception?.description || event.exceptionDetails?.text));
  await page.goto(`http://localhost:4322/demos/patterns/day-night-flip/index.html?render=1&orient=${orient}`, 45000);
  await page.waitFor('window.__motion', 25000);
  await page.eval('Promise.resolve(__motion.ready).then(()=>true)', 60000);
  report.ready = await page.eval(`(() => {
    const gl=__map.painter.context.gl,e=gl.getExtension('WEBGL_debug_renderer_info');
    return {renderer:gl.getParameter(e.UNMASKED_RENDERER_WEBGL),mapLoaded:__map.loaded(),tilesLoaded:__map.areTilesLoaded(),stageScale:__motion.stage.scale,pixelRatio:__map.getPixelRatio()};
  })()`);
  await page.eval(`(() => {
    const probe=window.__perfProbe={counts:{jumpTo:0,render:0,triggerRepaint:0,setPaintProperty:0,rafRequests:0,rafCallbacks:0},frames:[],trace:[]};
    for(const name of ['jumpTo','triggerRepaint','setPaintProperty']){
      const original=__map[name];
      __map[name]=function(...args){probe.counts[name]++;return original.apply(this,args);};
    }
    __map.on('render',()=>probe.counts.render++);
    const originalRAF=requestAnimationFrame;
    window.requestAnimationFrame=fn=>{probe.counts.rafRequests++;return originalRAF(time=>{probe.counts.rafCallbacks++;fn(time);});};
    probe.startFrames=()=>{probe.active=true;const observe=time=>{if(!probe.active)return;probe.frames.push(time);probe.trace.push({wall:performance.now(),time:__motion.time});probe.frameId=originalRAF(observe);};probe.frameId=originalRAF(observe);};
    probe.stopFrames=()=>{probe.active=false;cancelAnimationFrame(probe.frameId);};
    return true;
  })()`);
  for (let run = 1; run <= repeats; run++) {
    await page.eval(`(() => {const m=__motion;m.pause();for(let t=0;t<=m.duration;t+=.2)m.seek(t);m.seek(m.duration);return true;})()`, 60000);
    const before = await page.eval(`(() => {const p=__perfProbe;p.counts={jumpTo:0,render:0,triggerRepaint:0,setPaintProperty:0,rafRequests:0,rafCallbacks:0};p.frames=[];p.trace=[];p.startFrames();p.wall0=performance.now();return (__motion.seek(0),__motion.play(),__motion.time);})()`);
    await page.eval('new Promise(resolve=>setTimeout(resolve,1500))');
    const after = await page.eval(`(() => {const p=__perfProbe;p.stopFrames();const gaps=p.frames.slice(1).map((time,i)=>time-p.frames[i]);return {time:__motion.time,wallMs:performance.now()-p.wall0,counts:p.counts,rafFrames:p.frames.length,rafGapsMs:gaps,trace:p.trace,mapLoaded:__map.loaded(),tilesLoaded:__map.areTilesLoaded()};})()`);
    await page.eval('__motion.pause()');
    report.runs.push({ run, t0: before, t1: after.time, pass: after.time > before + .5, ...after });
    console.log(JSON.stringify({ renderer, orient, run, t0: before, t1: after.time, pass: after.time > before + .5, wallMs: after.wallMs, counts: after.counts, rafFrames: after.rafFrames, maxRafGapMs: Math.max(0, ...after.rafGapsMs) }));
  }
  await page.send('Page.close');
} catch (error) {
  report.errors.push(error.stack);
  console.error(error.message);
} finally {
  await browser.close();
  fs.mkdirSync('dev/shots/T4b/perf', { recursive: true });
  fs.writeFileSync(`dev/shots/T4b/perf/day-night-${renderer}-${orient}.json`, JSON.stringify(report, null, 2) + '\n');
}
