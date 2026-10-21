import fs from 'node:fs';
import path from 'node:path';
import { launch } from '../../../scripts/lib/cdp.mjs';

const args = process.argv.slice(2);
const get = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
const base = get('--base', 'http://localhost:4321').replace(/\/$/, '');
const orient = get('--orient', 'both');
const orientations = orient === 'both' ? ['landscape', 'portrait'] : [orient];
if (orientations.some(value => !['landscape', 'portrait'].includes(value))) throw new Error('无效画幅');
const from = 8, to = 31, fps = 30;
const dense = args.includes('--30fps');
const times = dense ? Array.from({ length: (to - from) * fps }, (_, i) => +(from + i / fps).toFixed(5))
  : [8, 8.03333, 8.5, 9, 9.5, 10, 10.5, 11, 11.3, 11.6, 12, 12.1, 12.5, 13.1, 13.6, 14, 14.6, 15, 16.6, 18, 18.4, 18.6, 19, 20.4, 21, 21.6, 23.8, 24, 24.35, 24.4, 24.8, 25.6, 27.2, 29.2, 30, 30.96667];
const out = get('--out', `dev/shots/T13/seek/forward-${dense ? '30fps' : 'keys'}-${orient}`);
fs.mkdirSync(out, { recursive: true });
const scriptPath = 'demos/cases/map-pilgrimage/script.js';
const sourceURL = `${base}/${scriptPath}`;
const source = {
  before: fs.readFileSync(get('--before', 'dev/shots/T13/seek/script-before.js')),
  current: fs.readFileSync(scriptPath),
};
const served = Buffer.from(await (await fetch(sourceURL)).arrayBuffer());
if (!served.equals(source.current)) throw new Error('4321的地图源码与当前工作树不一致');
const manifest = { sourceURL, sourceBytes: Object.fromEntries(Object.entries(source).map(([key, value]) => [key, value.length])), servedEqualsCurrent: true, mode: dense ? '30fps' : 'keyframes', from, to, fps, times, orientations };
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'script-before.js'), source.before);
fs.writeFileSync(path.join(out, 'script-current.js'), source.current);
fs.writeFileSync(path.join(out, 'differences.jsonl'), '');

const SNAPSHOT = `(() => {
  const stage = document.querySelector('#stage'), nodes = {};
  const key = e => e === stage ? '#stage' : key(e.parentElement) + '>' + e.tagName.toLowerCase() + ':nth-of-type(' + ([...e.parentElement.children].filter(x => x.tagName === e.tagName).indexOf(e) + 1) + ')';
  const visible = e => { let opacity = 1; for (let p = e; p; p = p.parentElement) { const s = getComputedStyle(p); if (s.display === 'none' || s.visibility === 'hidden' || s.visibility === 'collapse') return false; opacity *= +s.opacity; } return opacity > .0001; };
  for (const e of [stage, ...stage.querySelectorAll('*')]) {
    if (e.closest('#map') || !visible(e)) continue;
    const s = getComputedStyle(e), r = e.getBoundingClientRect();
    nodes[key(e)] = {
      id: e.id, class: [...e.classList].sort().join(' '), text: e.children.length ? '' : e.textContent,
      attrs: Object.fromEntries([...e.attributes].filter(a => !['class', 'style'].includes(a.name)).map(a => [a.name, a.value]).sort(([a], [b]) => a.localeCompare(b))),
      rect: [r.x, r.y, r.width, r.height],
      computed: Object.fromEntries(['display', 'visibility', 'opacity', 'transform', 'filter', 'clip-path', 'color', 'background-color', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset'].map(k => [k, s.getPropertyValue(k)])),
    };
  }
  const map = window.__map, routes = {};
  for (const route of window.CONFIG.tracks.routes) {
    const id = 'rt-' + route.id, source = map.getSource(id);
    routes[id] = { data: ['flight', 'walk'].includes(route.style) ? JSON.parse(JSON.stringify(source._data)) : null,
      layers: map.getStyle().layers.filter(l => l.source === id).map(l => ({ id: l.id, layout: l.layout, paint: l.paint })) };
  }
  return { nodes, routes, camera: { center: map.getCenter().toArray(), zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing(), padding: map.getPadding() },
    native: { stageScale: window.__motion.stage.scale, pixelRatio: map.getPixelRatio(), antialias: map.painter.context.gl.getContextAttributes().antialias } };
})()`;
const differences = (a, b) => {
  const changed = (left, right) => [...new Set([...Object.keys(left), ...Object.keys(right)])]
    .filter(key => JSON.stringify(left[key]) !== JSON.stringify(right[key]))
    .map(key => ({ key, before: left[key], current: right[key] }));
  return { nodes: changed(a.nodes, b.nodes), routes: changed(a.routes, b.routes), camera: JSON.stringify(a.camera) === JSON.stringify(b.camera) ? null : { before: a.camera, current: b.camera } };
};
const browser = await launch({ args: ['--no-proxy-server'] });
const errors = [], results = [], baselines = new Map();
try {
  for (const orientation of orientations) {
    for (const version of ['before', 'current']) {
      const page = await browser.newPage();
      await page.viewport(...(orientation === 'portrait' ? [1080, 1920, 1] : [1920, 1080, 1]));
      page.on('Runtime.exceptionThrown', p => errors.push({ orientation, version, message: p.exceptionDetails?.exception?.description || p.exceptionDetails?.text }));
      page.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') errors.push({ orientation, version, message: p.args.map(a => a.value ?? a.description).join(' ') }); });
      let injected = 0;
      page.on('Fetch.requestPaused', p => {
        const job = p.request.url === sourceURL
          ? (injected++, page.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/javascript; charset=utf-8' }], body: source[version].toString('base64') }))
          : page.send('Fetch.continueRequest', { requestId: p.requestId });
        job.catch(error => errors.push({ orientation, version, message: error.message }));
      });
      await page.send('Fetch.enable', { patterns: [{ urlPattern: sourceURL, requestStage: 'Request' }] });
      try {
        await page.goto(`${base}/demos/cases/map-pilgrimage/index.html?render=1&embed=1&orient=${orientation}`, 60000);
        await page.waitFor('window.__motion && window.__map', 60000);
        await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 120000);
        await page.eval('window.__motion.pause(); true');
        await page.eval(`window.__motion.seek(${from})`, 60000);
        await page.eval('new Promise(r => setTimeout(r, 600))');
        if (injected !== 1) throw new Error(`${version}脚本替换次数${injected}，应为1`);
        const file = path.join(out, `${orientation}-${version}.jsonl`);
        fs.writeFileSync(file, '');
        for (let i = 0; i < times.length; i++) {
          const t = times[i];
          await page.eval(`window.__motion.seek(${t}).then(() => new Promise(r => requestAnimationFrame(() => r())))`, 60000);
          const state = await page.eval(SNAPSHOT, 30000);
          if (state.native.stageScale !== 1 || state.native.pixelRatio !== 1 || !state.native.antialias) throw new Error('未使用原生尺寸地图设置');
          fs.appendFileSync(file, JSON.stringify({ t, state }) + '\n');
          const key = `${orientation}:${t}`;
          if (version === 'before') baselines.set(key, state);
          else {
            const diff = differences(baselines.get(key), state);
            const row = { orientation, t, nodeDifferences: diff.nodes.length, routeDifferences: diff.routes.length, cameraDifferences: !!diff.camera };
            results.push(row);
            if (diff.nodes.length || diff.routes.length || diff.camera) fs.appendFileSync(path.join(out, 'differences.jsonl'), JSON.stringify({ ...row, ...diff }) + '\n');
          }
          if (args.includes('--shots') && [8.5, 13.1, 13.6, 20.4, 24.8].includes(t)) await page.screenshot(path.join(out, `${orientation}-${version}-${t}.png`));
          if (i % 30 === 0 || i === times.length - 1) console.log(`${orientation} ${version} ${i + 1}/${times.length} @${t}s`);
        }
      } finally { await page.send('Page.close'); }
    }
  }
} finally { await browser.close(); }
const changedSource = !fs.readFileSync(scriptPath).equals(source.current);
const summary = { ...manifest, checkedStates: results.length, nodeFailures: results.filter(r => r.nodeDifferences).length, routeFailures: results.filter(r => r.routeDifferences).length, cameraFailures: results.filter(r => r.cameraDifferences).length, changedSource, errors, results };
fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ checkedStates: summary.checkedStates, nodeFailures: summary.nodeFailures, routeFailures: summary.routeFailures, cameraFailures: summary.cameraFailures, changedSource, errors }));
if (summary.nodeFailures || summary.routeFailures || summary.cameraFailures || errors.length || changedSource) process.exitCode = 1;
