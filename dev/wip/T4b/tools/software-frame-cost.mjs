import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const output = 'dev/shots/T4b/perf/frame-cost-final';
fs.mkdirSync(output, { recursive: true });
const limits = [
  'Painter/renderLayer durations are synchronous CPU plus any blocking driver time, not independent GPU execution time.',
  'Trace event durations are inclusive and nested; CPU, GPU and compositor threads overlap and must not be added.',
  'A seek readiness window can contain several map renders. The first target render is reported separately; the seek wall duration is not a single-frame CPU cost.',
  'CPU profile group values are sampling estimates including descendants. Groups can overlap and zero samples do not prove zero cost.',
  'LayerTree identifies the grain compositor layer and paint activity. Zero grain repaint does not prove zero compositor/GPU cost.',
  'No CSS/layer isolation, rendering backend change, visual function edit or GL synchronous finish/readback was introduced.',
];
const manifest = { started: new Date().toISOString(), rendererRequested: 'default SwiftShader', jobs: [], errors: [], limits };

function targetRanges(events, windows) {
  return windows.map(window => {
    const start = events.find(event => event.name === `T4bCost:${window.id}:start`);
    const end = events.find(event => event.name === `T4bCost:${window.id}:end`);
    return { id: window.id, start: start?.ts, end: end?.ts };
  }).filter(range => Number.isFinite(range.start) && Number.isFinite(range.end));
}

function traceSummary(events, windows, grain) {
  const ranges = targetRanges(events, windows), threads = new Map();
  for (const event of events) if (event.ph === 'M' && event.name === 'thread_name') threads.set(`${event.pid}:${event.tid}`, event.args?.name);
  const aggregated = new Map(), paint = [];
  for (const event of events) {
    if (event.ph !== 'X' || !event.dur) continue;
    const overlap = ranges.reduce((sum, range) => sum + Math.max(0, Math.min(event.ts + event.dur, range.end) - Math.max(event.ts, range.start)), 0);
    if (!overlap) continue;
    const thread = threads.get(`${event.pid}:${event.tid}`) || 'unknown';
    if (/Renderer|Gpu|Viz|Compositor|Raster|Worker/i.test(thread)) {
      const key = `${event.pid}:${event.tid}:${event.name}`;
      const row = aggregated.get(key) || { pid: event.pid, tid: event.tid, thread, name: event.name, count: 0, inclusiveWallMs: 0 };
      row.count++; row.inclusiveWallMs += overlap / 1000; aggregated.set(key, row);
    }
    if (/Paint|Raster|Composite|Swap|DrawFrame/i.test(event.name)) paint.push({ name: event.name, ts: event.ts, dur: event.dur, pid: event.pid, tid: event.tid, args: event.args });
  }
  const grainPaint = paint.filter(event => {
    const data = event.args?.data || {};
    return data.nodeId === grain.backendNodeId || data.backendNodeId === grain.backendNodeId || (grain.layerIds.length && grain.layerIds.includes(String(data.layerId)));
  });
  return { targetRanges: ranges, topInclusiveEvents: [...aggregated.values()].sort((a, b) => b.inclusiveWallMs - a.inclusiveWallMs).slice(0, 45), paintEventsInTargetWindows: paint.length, grainMatchedPaintEvents: grainPaint, grainGpuMs: null, grainGpuAttribution: 'Not independently attributable from these CPU/paint/compositor events.', limits };
}

function profileSummary(profile, events, windows) {
  const ranges = targetRanges(events, windows), nodes = new Map(profile.nodes.map(node => [node.id, node])), parents = new Map();
  for (const node of profile.nodes) for (const child of node.children || []) parents.set(child, node.id);
  const self = new Map(), groups = { overlays: 0, grain: 0, mapLibrary: 0 };
  const overlay = /^(drawHud|drawMarkers|drawPatternMarkers|drawAlert|drawRoutesSVG|drawCards|drawLeader|drawChapter|drawIntro|drawLocTitle|drawFlashback|drawCompare|drawOutro)$/;
  let timestamp = profile.startTime, selected = 0;
  for (let index = 0; index < (profile.samples || []).length; index++) {
    const delta = profile.timeDeltas[index] || 0; timestamp += delta;
    if (!ranges.some(range => timestamp >= range.start && timestamp <= range.end)) continue;
    selected++;
    const id = profile.samples[index], leaf = nodes.get(id), key = `${leaf.callFrame.functionName || '(anonymous)'} ${leaf.callFrame.url}:${leaf.callFrame.lineNumber + 1}`;
    self.set(key, (self.get(key) || 0) + delta / 1000);
    const hit = new Set();
    for (let current = id; current !== undefined; current = parents.get(current)) {
      const frame = nodes.get(current)?.callFrame;
      if (!frame) continue;
      if (overlay.test(frame.functionName)) hit.add('overlays');
      if (frame.functionName === 'drawGrain') hit.add('grain');
      if ((frame.url || '').includes('maplibre-gl')) hit.add('mapLibrary');
    }
    for (const group of hit) groups[group] += delta / 1000;
  }
  return { alignment: selected ? 'Profiler timestamps intersect target performance.mark trace ranges.' : 'No aligned samples; group estimates unavailable.', selectedSamples: selected, groupInclusiveSampleMs: selected ? groups : null, topSelfSamples: [...self].sort((a, b) => b[1] - a[1]).slice(0, 35).map(([frame, estimatedMs]) => ({ frame, estimatedMs })), limits };
}

function numericSummary(values) {
  if (!values.length) return { count: 0, meanMs: null, minMs: null, maxMs: null };
  return { count: values.length, meanMs: values.reduce((sum, value) => sum + value, 0) / values.length, minMs: Math.min(...values), maxMs: Math.max(...values) };
}

const browser = await launch({ width: 1280, height: 720 });
try {
  for (const orient of ['landscape', 'portrait']) for (const id of ['route-draw-marker', 'day-night-flip', 'alert-reroute']) {
    const page = await browser.newPage();
    const errors = [];
    page.on('Runtime.exceptionThrown', event => errors.push(event.exceptionDetails?.exception?.description || event.exceptionDetails?.text));
    await page.viewport(...(orient === 'portrait' ? [720, 1280] : [1280, 720]));
    try {
      await page.goto(`http://localhost:4322/demos/patterns/${id}/index.html?render=1&orient=${orient}`, 45000);
      await page.waitFor('window.__motion', 25000);
      await page.eval('Promise.resolve(__motion.ready).then(()=>true)', 60000);
      await page.eval('__motion.pause()', 30000);
      await page.send('DOM.enable'); await page.send('LayerTree.enable');
      let layerTree = [];
      const layerPainted = [];
      page.on('LayerTree.layerTreeDidChange', event => { layerTree = event.layers || []; });
      page.on('LayerTree.layerPainted', event => layerPainted.push(event));
      const document = await page.send('DOM.getDocument', { depth: 1 });
      const grainNode = await page.send('DOM.querySelector', { nodeId: document.root.nodeId, selector: '#grain' });
      const grainInfo = await page.send('DOM.describeNode', { nodeId: grainNode.nodeId });
      await page.eval(`(() => {
        const map=__map,painter=map.painter,probe=window.__frameCost={phase:'idle',target:null,renders:[],layers:[],windows:[],grainMutations:[]};
        if(typeof painter.renderLayer!=='function')throw new Error('MapLibre painter.renderLayer unavailable: '+Object.getOwnPropertyNames(Object.getPrototypeOf(painter)).join(','));
        const render=painter.render,renderLayer=painter.renderLayer,definitions=new Map(map.getStyle().layers.map(layer=>[layer.id,{source:layer.source}]));
        painter.render=function(...args){const row={index:probe.renders.length,phase:probe.phase,target:probe.target,start:performance.now(),layers:[]};probe.current=row;probe.renders.push(row);try{return render.apply(this,args);}finally{row.end=performance.now();row.duration=row.end-row.start;probe.current=null;}};
        painter.renderLayer=function(...args){const layer=args.find(arg=>arg&&typeof arg.id==='string'&&typeof arg.type==='string'),style=layer&&definitions.get(layer.id);const start=performance.now();try{return renderLayer.apply(this,args);}finally{const duration=performance.now()-start;const group=layer?.type==='fill-extrusion'?'buildings3D':layer?.id?.startsWith('rt-')?'routes':style?.source==='openmaptiles'||style?.source==='dem'?'tiles':'mapOther';const row={render:probe.current?.index??null,phase:probe.phase,target:probe.target,layer:layer?.id??null,type:layer?.type??null,source:style?.source??null,pass:painter.renderPass,group,start,duration};probe.layers.push(row);if(probe.current)probe.current.layers.push(row);}};
        const grain=document.querySelector('#grain');new MutationObserver(records=>{if(probe.phase==='target')for(const record of records)probe.grainMutations.push({target:probe.target,time:performance.now(),attribute:record.attributeName,oldValue:record.oldValue,newValue:grain.getAttribute(record.attributeName)});}).observe(grain,{attributes:true,attributeOldValue:true,attributeFilter:['style']});
        return true;
      })()`);
      const points = id === 'route-draw-marker' ? [8.9] : id === 'day-night-flip' ? [.2, 2] : [2.75];
      for (const time of points) {
        const name = `${id}-${orient}-${String(time).replace('.', '_')}`, prefix = `${output}/${name}`;
        await page.eval(`__motion.seek(${Math.max(0, time - 1 / 12)})`, 30000);
        const metadata = await page.eval(`(() => {const gl=__map.painter.context.gl,ext=gl.getExtension('WEBGL_debug_renderer_info'),grain=getComputedStyle(document.querySelector('#grain'));return {renderer:gl.getParameter(ext.UNMASKED_RENDERER_WEBGL),antialias:gl.getContextAttributes().antialias,pixelRatio:__map.getPixelRatio(),scale:__motion.stage.scale,visibleTilesLoaded:__map.areTilesLoaded(),camera:{center:__map.getCenter().toArray(),zoom:__map.getZoom(),pitch:__map.getPitch(),bearing:__map.getBearing(),padding:__map.getPadding()},grain:{willChange:grain.willChange,mixBlendMode:grain.mixBlendMode,backgroundSize:grain.backgroundSize},layerDefinitions:__map.getStyle().layers.map(layer=>({id:layer.id,type:layer.type,source:layer.source,visibility:layer.layout?.visibility||'visible'}))};})()`);
        if (!/swiftshader|llvmpipe|softpipe|software|basic render/i.test(metadata.renderer)) throw new Error(`Expected default software GL, got ${metadata.renderer}`);
        await page.eval(`(()=>{const p=__frameCost;p.renders=[];p.layers=[];p.windows=[];p.grainMutations=[];return true;})()`);
        const events = [];
        page.on('Tracing.dataCollected', event => events.push(...event.value));
        const tracingDone = page.once('Tracing.tracingComplete', 60000);
        await page.send('Profiler.enable'); await page.send('Profiler.setSamplingInterval', { interval: 500 }); await page.send('Profiler.start');
        await page.send('Tracing.start', { categories: 'toplevel,devtools.timeline,disabled-by-default-devtools.timeline,v8,blink,blink.user_timing,gpu,cc,viz', transferMode: 'ReportEvents' });
        for (let frame = 1; frame <= 6; frame++) await page.eval(`(async()=>{const p=__frameCost;p.phase='prepare';p.target=null;await __motion.seek(${Math.max(0, time - 1 / 12)});p.phase='target';p.target=${frame};const window={id:${frame},start:performance.now()};p.windows.push(window);performance.mark('T4bCost:'+window.id+':start');const syncStart=performance.now(),pending=__motion.seek(${time});window.syncSeekMs=performance.now()-syncStart;await pending;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));performance.mark('T4bCost:'+window.id+':end');window.end=performance.now();window.readinessWallMs=window.end-window.start;p.phase='idle';p.target=null;return true;})()`, 60000);
        const { profile } = await page.send('Profiler.stop'); await page.send('Tracing.end'); await tracingDone;
        const raw = await page.eval(`(()=>{const p=__frameCost;return {renders:p.renders,layers:p.layers,windows:p.windows,grainMutations:p.grainMutations,loaded:__map.loaded(),tilesLoaded:__map.areTilesLoaded()};})()`);
        const grainLayers = layerTree.filter(layer => layer.backendNodeId === grainInfo.node.backendNodeId);
        const grain = { backendNodeId: grainInfo.node.backendNodeId, layerIds: grainLayers.map(layer => String(layer.layerId)), layers: grainLayers, compositingReasons: [] };
        for (const layer of grainLayers) grain.compositingReasons.push({ layerId: layer.layerId, ...await page.send('LayerTree.compositingReasons', { layerId: layer.layerId }) });
        const first = raw.windows.map(window => raw.renders.find(render => render.phase === 'target' && render.target === window.id)).filter(Boolean);
        const groups = {};
        for (const group of ['tiles', 'buildings3D', 'routes', 'mapOther']) groups[group] = numericSummary(first.map(render => render.layers.filter(layer => layer.group === group).reduce((sum, layer) => sum + layer.duration, 0)));
        const summary = { id, orient, representativeTime: time, targetVisualFrames: 6, targetFramesWithMapRender: first.length, targetFramesWithoutMapRender: 6-first.length, actualTargetMapRenders: raw.renders.filter(render => render.phase === 'target').length, firstMapRenderCpuDriverMs: numericSummary(first.map(render => render.duration)), firstRenderLayerCpuDriverMs: groups, synchronousSeekSubmissionMs: numericSummary(raw.windows.map(window => window.syncSeekMs)), seekReadinessWallMs: numericSummary(raw.windows.map(window => window.readinessWallMs)), grain, grainLayerPaintedEvents: layerPainted.filter(event => grain.layerIds.includes(String(event.layerId))), grainTransformMutations: raw.grainMutations.length, trace: traceSummary(events, raw.windows, grain), cpu: profileSummary(profile, events, raw.windows), metadata, errors, limits };
        fs.writeFileSync(`${prefix}.trace.json`, JSON.stringify({ traceEvents: events }));
        fs.writeFileSync(`${prefix}.cpu-profile.json`, JSON.stringify(profile));
        fs.writeFileSync(`${prefix}.layers.json`, JSON.stringify({ ...raw, layerTree, layerPainted, grain }, null, 2) + '\n');
        fs.writeFileSync(`${prefix}.summary.json`, JSON.stringify(summary, null, 2) + '\n');
        manifest.jobs.push({ id, orient, time, summary: `${prefix}.summary.json`, trace: `${prefix}.trace.json`, profile: `${prefix}.cpu-profile.json`, layerTiming: `${prefix}.layers.json`, renderer: metadata.renderer, firstMapRenderCpuDriverMs: summary.firstMapRenderCpuDriverMs, layerGroups: groups, grainGpuMs: null });
        fs.writeFileSync(`${output}/index.json`, JSON.stringify(manifest, null, 2) + '\n');
        console.log('[T4bCost] ' + JSON.stringify({ id, orient, time, firstMapRenderCpuDriverMs: summary.firstMapRenderCpuDriverMs, layerGroups: groups, targetMapRenders: summary.actualTargetMapRenders, grainLayers: grain.layerIds, profileSamples: summary.cpu.selectedSamples }));
      }
      if (id === 'route-draw-marker' || id === 'alert-reroute') {
        const time = id === 'route-draw-marker' ? 3.45 : 2.75;
        await page.eval(`__motion.seek(${time})`, 30000);
        const labels = await page.eval(`(() => {const wanted=${JSON.stringify(id === 'route-draw-marker' ? ['kix','kyoto'] : ['takanohara','saidaiji'])};return wanted.map(id=>{const index=CASE_CONFIG.tracks.markers.findIndex(marker=>marker.stop===id),element=document.querySelectorAll('.mk-label')[index],style=getComputedStyle(element),rect=element.getBoundingClientRect(),stage=__motion.stage.root.getBoundingClientRect(),scale=__motion.stage.scale;let effectiveOpacity=1;for(let p=element;p&&p!==document.documentElement;p=p.parentElement)effectiveOpacity*=Number(getComputedStyle(p).opacity);return {id,text:element.textContent,opacity:Number(style.opacity),effectiveOpacity,visibility:style.visibility,display:style.display,background:style.backgroundColor,rect:{x:(rect.x-stage.x)/scale,y:(rect.y-stage.y)/scale,width:rect.width/scale,height:rect.height/scale}};});})()`);
        const screenshot = `${output}/${id}-${orient}-label-effect.png`;
        await page.screenshot(screenshot);
        fs.writeFileSync(`${output}/${id}-${orient}-label-effect.json`, JSON.stringify({ id, orient, time, labels, screenshot, note: 'Incidental same-page effect record after profiling, not a new smoke/acceptance run.' }, null, 2) + '\n');
      }
    } catch (error) {
      manifest.errors.push({ id, orient, error: error.stack }); console.error(`[T4bCost] ${id} ${orient}: ${error.message}`);
    } finally { await page.send('Page.close'); }
  }
} finally {
  await browser.close(); manifest.ended = new Date().toISOString();
  fs.writeFileSync(`${output}/index.json`, JSON.stringify(manifest, null, 2) + '\n');
  fs.appendFileSync('dev/wip/T4b/progress.md', `${manifest.ended} Default software GL frame-cost collection finished: ${manifest.jobs.length} point/orientation jobs, ${manifest.errors.length} errors; raw trace/CPU profile/layer timing and non-additive summaries in ${output}. Browsers closed; no smoke retry or further optimization.\n`);
  console.log('[T4bCost] ' + JSON.stringify({ jobs: manifest.jobs.length, errors: manifest.errors.length, closed: true }));
}
