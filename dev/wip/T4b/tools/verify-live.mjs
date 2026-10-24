import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const output = 'dev/shots/T4b/live';
fs.mkdirSync(output, { recursive: true });
const onlyIndex = process.argv.indexOf('--only');
const ids = onlyIndex < 0 ? ['route-draw-marker', 'alert-reroute', 'day-night-flip'] : process.argv[onlyIndex + 1].split(',');
const reportPath = `${output}/${onlyIndex < 0 ? 'verification-quick' : 'verification-route'}.json`;
const report = { items: [], checks: [], errors: [] };
const check = (name, pass, detail) => {
  report.checks.push({ name, pass, detail });
  if (!pass) console.log(`FAIL ${name} ${JSON.stringify(detail)}`);
};
const source = fs.readFileSync('demos/cases/map-pilgrimage/script.js', 'utf8');
const cameraStart = source.indexOf('  function cameraAt(');
const cameraFunction = source.slice(cameraStart, source.indexOf('\n\n  /*', cameraStart));
const reference = (t, orient) => `(() => {
  const MK=MotionKit,C=CASE_CONFIG,CAM=C.tracks.camera,O=${JSON.stringify(orient)},{clamp,lerp,ease}=MK,rad=Math.PI/180;
  const merc=([lng,lat])=>[(lng+180)/360,(1-Math.log(Math.tan(Math.PI/4+lat*rad/2))/Math.PI)/2];
  const unmerc=([x,y])=>[x*360-180,Math.atan(Math.sinh(Math.PI*(1-2*y)))/rad];
  const EASE={inOut:ease.inOutCubic,out:x=>1-Math.pow(1-x,3.2),in:ease.inCubic,linear:ease.linear};
  ${cameraFunction}
  return cameraAt(${t},O);
})()`;
const snapshot = `(() => {
  const shown=e=>{if(!e)return false;for(let p=e;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden'||Number(c.opacity)<=.001)return false;}const r=e.getBoundingClientRect(),s=__motion.stage.root.getBoundingClientRect();return r.width>0&&r.height>0&&r.right>s.left&&r.left<s.right&&r.bottom>s.top&&r.top<s.bottom;};
  const rect=e=>{const r=e.getBoundingClientRect(),s=__motion.stage.root.getBoundingClientRect(),k=__motion.stage.scale;return {x:(r.x-s.x)/k,y:(r.y-s.y)/k,w:r.width/k,h:r.height/k};};
  const m=__map,c=getComputedStyle(document.querySelector('#stage'));
  return {
    cam:{center:m.getCenter().toArray(),zoom:m.getZoom(),bearing:m.getBearing(),pitch:m.getPitch(),padding:m.getPadding()},loaded:m.loaded(),tiles:m.areTilesLoaded(),
    tags:[...document.querySelectorAll('.rt-tag')].filter(shown).map(e=>e.textContent),
    labels:CASE_CONFIG.tracks.markers.map((mk,i)=>{const e=document.querySelectorAll('.mk-label')[i];return {stop:mk.stop,shown:shown(e),text:e.textContent,rect:rect(e)};}),
    routes:CASE_CONFIG.tracks.routes.map(r=>({id:r.id,visible:m.getLayoutProperty('rt-'+r.id,'visibility')!=='none',glow:m.getLayer('rt-'+r.id+'-glow')?m.getPaintProperty('rt-'+r.id+'-glow','line-opacity'):null})),
    veil:{opacity:Number(getComputedStyle(document.querySelector('#veil')).opacity),shown:shown(document.querySelector('#veil')),tagShown:shown(document.querySelector('.veil-tag'))},
    night:Number(c.getPropertyValue('--night')),ink:c.getPropertyValue('--ink'),water:m.getPaintProperty('water','fill-color'),clock:document.querySelector('.hc-time').textContent,grain:document.querySelector('#grain').style.transform,
  };
})()`;
const sameCamera = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const within = (value, expected) => Math.abs(value - expected) < 1e-8;
const browser = await launch({ width: 1920, height: 1080, args: ['--use-angle=d3d11'] });
try {
  for (const orient of ['landscape', 'portrait']) for (const id of ids) {
    const item = { orient, id, samples: [], exceptions: [], warnings: [] };
    report.items.push(item);
    const page = await browser.newPage();
    page.on('Runtime.exceptionThrown', event => item.exceptions.push(event.exceptionDetails?.exception?.description || event.exceptionDetails?.text));
    page.on('Runtime.consoleAPICalled', event => {
      if (['warning', 'error'].includes(event.type)) item.warnings.push({ type: event.type, text: event.args.map(arg => arg.value ?? arg.description ?? '').join(' ') });
    });
    const at = t => item.samples.find(sample => sample.t === t);
    const name = `${id} ${orient}`;
    try {
      await page.viewport(...(orient === 'portrait' ? [1080, 1920] : [1920, 1080]));
      await page.goto(`http://localhost:4322/demos/patterns/${id}/index.html?render=1&orient=${orient}`, 60000);
      await page.waitFor('window.__motion', 30000);
      await page.eval('Promise.resolve(__motion.ready).then(()=>true)', 120000);
      await page.eval('__motion.pause();__motion.seek(0)', 30000);
      item.renderer = await page.eval(`(()=>{const g=__map.painter.context.gl,e=g.getExtension('WEBGL_debug_renderer_info');return g.getParameter(e.UNMASKED_RENDERER_WEBGL);})()`);
      check(`${name} hardware renderer`, !/swiftshader|software|llvmpipe/i.test(item.renderer), item.renderer);
      item.idle = await page.eval(`new Promise(res=>{let done=false;const fin=v=>{if(done)return;done=true;__map.off('idle',ok);res(v);};const ok=()=>fin(true);__map.once('idle',ok);__map.triggerRepaint();setTimeout(()=>fin(false),4000);})`);
      const initial = await page.eval(snapshot);
      check(`${name} ready idle + loaded`, item.idle && initial.loaded && initial.tiles, { idle: item.idle, loaded: initial.loaded, tiles: initial.tiles });
      const times = id === 'route-draw-marker' ? [0, .8, 3.1, 3.6, 3.79, 3.8, 4, 6.2, 6.5, 6.8, 6.99, 7, 7.2, 8.8, 9.5, 10.6] : id === 'alert-reroute' ? [0, .2, 1.5, 2.2, 4.4, 5.5, 6.2] : [0, .1, 1.5, 2, 2.5, 4.5, 4.95, 5.4, 7];
      for (const t of times) {
        await page.eval(`__motion.seek(${t})`, 30000);
        const sample = await page.eval(snapshot);
        item.samples.push({ t, ...sample });
        check(`${name} ${t} tags hidden`, sample.tags.length === 0, sample.tags);
        check(`${name} ${t} tiles loaded`, sample.loaded && sample.tiles);
      }
      if (id === 'route-draw-marker') {
        for (const [a, b] of [[0, .8], [.8, 3.79], [3.8, 6.99], [7, 10.6]]) check(`${name} fixed ${a}..${b}`, sameCamera(at(a).cam, at(b).cam), { a: at(a).cam, b: at(b).cam });
        check(`${name} bearing/pitch zero`, item.samples.every(sample => within(sample.cam.bearing, 0) && within(sample.cam.pitch, 0)));
        for (const [t, stops] of [[.8, ['kix', 'kyoto']], [4, ['kyoto', 'jrNara']]]) {
          await page.eval(`__motion.seek(${t})`, 30000);
          const points = await page.eval(`(${JSON.stringify(stops)}).map(id=>{const p=__map.project(CASE_CONFIG.stops[id].lngLat);return {id,x:p.x/__motion.stage.width,y:p.y/__motion.stage.height};})`);
          check(`${name} ${t} 12% camera frame`, points.every(p => p.x >= .11999 && p.x <= .88001 && p.y >= .11999 && p.y <= .88001), points);
        }
        check(`${name} S2 JR label minZoom`, at(6.2).cam.zoom < 13 && !at(6.2).labels.find(label => label.stop === 'jrNara').shown, { t: 6.2, zoom: at(6.2).cam.zoom, label: at(6.2).labels.find(label => label.stop === 'jrNara') });
        check(`${name} S3 zoom >=13`, at(7.2).cam.zoom >= 13, at(7.2).cam.zoom);
        check(`${name} S3 JR label visible`, at(7.2).labels.find(label => label.stop === 'jrNara').shown, at(7.2).labels.find(label => label.stop === 'jrNara'));
        check(`${name} S3 Nara Park label visible`, at(9.5).labels.find(label => label.stop === 'naraPark').shown, at(9.5).labels.find(label => label.stop === 'naraPark'));
        for (const [t, opacity] of [[3.6, 0], [3.8, 1], [6.8, 0], [7, 1], [7.2, 0]]) check(`${name} veil ${t}`, Math.abs(at(t).veil.opacity - opacity) < .002 && !at(t).veil.tagShown, at(t).veil);
        for (const t of [3.1, 6.5, 9.5]) {
          const route = t === 3.1 ? 'haruka' : 'naraLine';
          const value = at(t).routes.find(value => value.id === route);
          check(`${name} ${route} persistent glow at ${t}`, Math.abs(value.glow - .19) < .001, value);
        }
        item.sourceS3 = await page.eval(reference(40.3, orient));
        await page.eval('__motion.seek(9.5)', 30000);
        const sourceCamera = { ...item.sourceS3, bearing: 0, pitch: 0 };
        const actualCamera = (await page.eval(snapshot)).cam;
        item.s3 = await page.eval(`(() => {
          const stage=[__motion.stage.width,__motion.stage.height], ids=['jrNara','naraPark'];
          const points=()=>ids.map(id=>{const lngLat=CASE_CONFIG.stops[id].lngLat,p=__map.project(lngLat);return {id,lngLat,x:p.x,y:p.y,nx:p.x/stage[0],ny:p.y/stage[1]};});
          const finalPoints=points();
          __map.jumpTo(${JSON.stringify(sourceCamera)});
          const sourcePoints=points();
          const stops=ids.map(id=>CASE_CONFIG.stops[id].lngLat),rad=Math.PI/180;
          const ys=stops.map(ll=>(1-Math.log(Math.tan(Math.PI/4+ll[1]*rad/2))/Math.PI)/2);
          const bboxCenter=[(stops[0][0]+stops[1][0])/2,Math.atan(Math.sinh(Math.PI*(1-ys[0]-ys[1])))/rad];
          return {stage,sourceCamera:${JSON.stringify(sourceCamera)},finalCamera:${JSON.stringify(actualCamera)},sourcePoints,finalPoints,bboxCenter};
        })()`);
        const sourceSafe = item.s3.sourcePoints.every(point => point.nx >= .08 && point.nx <= .92 && point.ny >= .08 && point.ny <= .92);
        item.s3.usedFallback = item.sourceS3.zoom < 13 || !sourceSafe;
        const changed = actualCamera.center.some((value, i) => !within(value, sourceCamera.center[i])) || !within(actualCamera.zoom, sourceCamera.zoom);
        check(`${name} S3 approved fallback trigger`, changed === item.s3.usedFallback, { sourceZoom: item.sourceS3.zoom, sourceSafe, usedFallback: item.s3.usedFallback, changed });
        if (item.s3.usedFallback) {
          check(`${name} S3 fallback 20% frame`, item.s3.finalPoints.every(point => point.nx >= .19999 && point.nx <= .80001 && point.ny >= .19999 && point.ny <= .80001), item.s3.finalPoints);
          check(`${name} S3 fallback bbox center`, actualCamera.center.every((value, i) => within(value, item.s3.bboxCenter[i])), { actual: actualCamera.center, bbox: item.s3.bboxCenter });
        } else check(`${name} S3 source center/zoom`, !changed, { actual: actualCamera, source: sourceCamera });
        item.s3.finalCamera.focus = [item.s3.stage[0] / 2 + (actualCamera.padding.left - actualCamera.padding.right) / 2, item.s3.stage[1] / 2 + (actualCamera.padding.top - actualCamera.padding.bottom) / 2];
        await page.eval('__motion.seek(9.5)', 30000);
        await page.screenshot(`${output}/route-${orient}-S3.png`);
      } else if (id === 'alert-reroute') {
        check(`${name} fixed camera`, item.samples.every(sample => sameCamera(sample.cam, item.samples[0].cam)));
        item.original = await page.eval(reference(46.475, orient));
        item.projected = await page.eval(`(()=>{const points=[];for(const id of ['wrong','reroute']){const r=CASE_CONFIG.tracks.routes.find(r=>r.id===id),pts=PATHS[r.path].map(point=>point.slice());pts[0]=CASE_CONFIG.stops[r.from].lngLat;pts[pts.length-1]=CASE_CONFIG.stops[r.to].lngLat;points.push(...pts);}const project=()=>points.map(ll=>{const p=__map.project(ll);return {x:p.x/__motion.stage.width,y:p.y/__motion.stage.height};});const actual=project();__map.jumpTo(${JSON.stringify(item.original)});const original=project();return {actual,original};})()`);
        await page.eval('__motion.seek(6.2)', 30000);
        const sourceSafe = item.projected.original.every(p => p.x >= .08 && p.x <= .92 && p.y >= .08 && p.y <= .92);
        item.usedFallback = !sourceSafe;
        const pad = sourceSafe ? .08 : .15;
        check(`${name} route safety frame ${pad}`, item.projected.actual.every(p => p.x >= pad - 1e-5 && p.x <= 1 - pad + 1e-5 && p.y >= pad - 1e-5 && p.y <= 1 - pad + 1e-5), { fallback: !sourceSafe, minX: Math.min(...item.projected.actual.map(p => p.x)), maxX: Math.max(...item.projected.actual.map(p => p.x)), minY: Math.min(...item.projected.actual.map(p => p.y)), maxY: Math.max(...item.projected.actual.map(p => p.y)) });
        check(`${name} bearing/pitch preserved`, within(item.samples[0].cam.bearing, item.original.bearing) && within(item.samples[0].cam.pitch, item.original.pitch), { actual: item.samples[0].cam, source: item.original });
        await page.eval('__motion.seek(1.74)', 30000);
        await page.screenshot(`${output}/alert-${orient}.png`);
      } else {
        check(`${name} fixed camera`, item.samples.every(sample => sameCamera(sample.cam, item.samples[0].cam)));
        for (const [t, night] of [[0, 0], [1.5, 0], [2, .5], [2.5, 1], [4.5, 1], [4.95, .5], [5.4, 0], [7, 0]]) check(`${name} night ${t}`, Math.abs(at(t).night - night) < .006, at(t).night);
        const day = at(0), night = at(2.5), end = at(7);
        check(`${name} HUD+map day/night linkage`, day.ink !== night.ink && day.water !== night.water && day.ink === end.ink && day.water === end.water, { day: { ink: day.ink, water: day.water }, night: { ink: night.ink, water: night.water }, end: { ink: end.ink, water: end.water } });
        check(`${name} clock advances`, new Set(item.samples.map(sample => sample.clock)).size > 1, item.samples.map(sample => [sample.t, sample.clock]));
        check(`${name} grain advances`, day.grain !== at(.1).grain, { a: day.grain, b: at(.1).grain });
        await page.eval('__motion.seek(2.5)', 30000);
        await page.screenshot(`${output}/night-${orient}.png`);
      }
      check(`${name} no JS exceptions`, item.exceptions.length === 0, item.exceptions);
      console.log(`DONE ${name} ${item.renderer} samples=${item.samples.length}`);
    } catch (error) {
      report.errors.push({ id, orient, error: error.stack });
      console.log(`ERROR ${name} ${error.message}`);
    } finally {
      await page.send('Page.close');
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  }
} finally {
  await browser.close();
  report.summary = { items: report.items.length, checks: report.checks.length, passed: report.checks.filter(check => check.pass).length, failed: report.checks.filter(check => !check.pass).length, errors: report.errors.length };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  const finalCameras = report.items.filter(item => item.id === 'route-draw-marker' && item.s3).map(item => ({ orient: item.orient, ...item.s3 }));
  if (finalCameras.length) fs.writeFileSync(`${output}/route-final-cameras.json`, JSON.stringify(finalCameras, null, 2) + '\n');
  console.log(JSON.stringify(report.summary));
}
