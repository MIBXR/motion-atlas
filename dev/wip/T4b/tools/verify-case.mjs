import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {launch} from '../../../../scripts/lib/cdp.mjs';

const root = process.cwd();
const out = path.join(root, 'dev/shots/T4b/case-fixes');
fs.mkdirSync(out, {recursive: true});
const report = {checks: [], labels: [], layers: [], screenshots: [], errors: []};
const check = (name, pass, detail) => report.checks.push({name, pass, detail});
const cssFile = 'demos/cases/map-pilgrimage/style.css';
const oldCSS = execFileSync('git', ['show', `HEAD:${cssFile}`], {encoding: 'utf8'});
const newCSS = fs.readFileSync(cssFile, 'utf8');
for (const declaration of ['background: var(--surface)', 'border-radius: 6px', 'background: var(--alert)', 'gap: 10px; padding: 7px 12px 7px 12px', 'gap: 12px; padding: 8px 14px']) {
  check(`F1 preserved CSS: ${declaration}`, oldCSS.includes(declaration) && newCSS.includes(declaration));
}
const browser = await launch({width: 1920, height: 1080});
try {
  for (const orient of ['landscape', 'portrait']) {
    const page = await browser.newPage();
    await page.viewport(...(orient === 'landscape' ? [1920, 1080] : [1080, 1920]));
    page.on('Runtime.exceptionThrown', (e) => report.errors.push({orient, error: e.exceptionDetails?.exception?.description || e.exceptionDetails?.text}));
    const open = async (mode) => {
      const url = new URL('http://localhost:4322/demos/cases/map-pilgrimage/index.html');
      url.searchParams.set('render', '1'); url.searchParams.set('orient', orient); url.searchParams.set('t', '10.4');
      if (mode) url.searchParams.set('layers', mode);
      await page.goto(url.href, 45000);
      await page.waitFor('window.__motion', 20000);
      await page.eval('Promise.resolve(window.__motion.ready).then(() => true)', 60000);
      await page.eval('window.__motion.pause(); window.__motion.seek(10.4)', 30000);
      check(`${orient} ${mode || 'default'} real map`, await page.eval('!!window.__map && !document.querySelector("#stage").classList.contains("no-map")'));
    };
    const shot = async (name, t) => {
      await page.eval(`window.__motion.seek(${t})`, 30000);
      const file = `dev/shots/T4b/case-fixes/${orient}-${name}.png`;
      await page.screenshot(file); report.screenshots.push(file);
    };
    await open(null);
    const labels = await page.eval(`(async () => {
      const st = __motion.stage, scale = st.scale || 1, rows = [], seeks = [];
      const visible = e => { let a=1; for(let p=e;p&&p!==document.documentElement;p=p.parentElement) { const c=getComputedStyle(p); if(c.display==='none'||c.visibility==='hidden')return false; a*=Number(c.opacity); } const r=e.getBoundingClientRect(),s=st.root.getBoundingClientRect(); return a>.001&&r.right>s.left&&r.left<s.right&&r.bottom>s.top&&r.top<s.bottom; };
      for (let i=0;i<CONFIG.tracks.markers.length;i++) {
        const marker=CONFIG.tracks.markers[i], full=CONFIG.stops[marker.stop].name;
        for (const dt of [.14,.18,.22,.26,.30,.34,.38,.42,.46,.50,.54,.58,.62,.95]) {
          const t=+(marker.t+dt).toFixed(3); seeks.push(__motion.seek(t));
          const e=document.querySelectorAll('.mk-label')[i], en=e.querySelector('.mk-en'),ja=e.querySelector('em'),c=getComputedStyle(e),r=e.getBoundingClientRect();
          const jaOpacity=Number(getComputedStyle(ja).opacity), ew=en.getBoundingClientRect().width/scale, jw=ja.getBoundingClientRect().width/scale;
          const natural=parseFloat(c.paddingLeft)+parseFloat(c.paddingRight)+ew+(jaOpacity>0?(parseFloat(c.columnGap)||0)+jw:0);
          rows.push({stop:marker.stop,t,visible:visible(e),text:en.textContent,full,width:r.width/scale,height:r.height/scale,expected:en.textContent===full&&jaOpacity>0?Math.ceil(natural):natural,jaOpacity,color:c.backgroundColor,radius:c.borderRadius});
        }
      }
      await Promise.all(seeks); return rows;
    })()`, 60000);
    report.labels.push(...labels.map(r => ({orient,...r})));
    for (const stop of [...new Set(labels.map(r => r.stop))]) {
      const rows = labels.filter(r => r.stop === stop && r.visible);
      if (!rows.length) { check(`${orient} ${stop} visible onset samples`, true, 'No visible onset sample; original camera / placement hides this marker in this window.'); continue; }
      check(`${orient} ${stop} prefix measured width`, rows.every(r => Math.abs(r.width-r.expected)<1.01), rows.filter(r=>Math.abs(r.width-r.expected)>=1.01));
      check(`${orient} ${stop} height fixed`, Math.max(...rows.map(r=>r.height))-Math.min(...rows.map(r=>r.height))<.02, [...new Set(rows.map(r=>r.height))]);
      check(`${orient} ${stop} width grows`, rows.every((r,i)=>!i||r.width>=rows[i-1].width-.02), rows.map(r=>[r.text,r.width]));
      check(`${orient} ${stop} radius preserved`, rows.every(r=>r.radius==='6px'));
    }
    const red = labels.filter(r=>r.stop==='takanohara'&&r.visible);
    const alertHex = await page.eval('CONFIG.palette.alert');
    const alertRGB = `rgb(${[1,3,5].map(i=>parseInt(alertHex.slice(i,i+2),16)).join(', ')})`;
    check(`${orient} red TAKANOHARA visible`, red.length>0, red.length);
    check(`${orient} red TAKANOHARA color`, red.every(r=>r.color===alertRGB), {expected:alertRGB,actual:[...new Set(red.map(r=>r.color))]});
    await shot('takanohara-prefix', 46.54);
    await shot('takanohara-final', 46.9);
    for (const mode of ['map', 'map,routes,markers']) {
      await open(mode);
      for (const t of [10.4,15.5,20.4,39.0,46.6,58.0]) {
        await page.eval(`window.__motion.seek(${t})`, 30000);
        const data = await page.eval(`(() => {
          const mode=${JSON.stringify(mode)}, t=${t};
          const shown=e=> { for(let p=e;p&&p!==document.documentElement;p=p.parentElement) { const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden'||Number(c.opacity)===0)return false; }return true; };
          const overlays=[...document.querySelector('#stage').children].filter(e=>!['map','fallback','geo'].includes(e.id)&&shown(e)).map(e=>e.id||e.className.baseVal||e.className);
          const geo=[...document.querySelector('#geo').children].filter(shown).map(e=>({class:e.getAttribute('class'),children:[...e.children].filter(shown).map(c=>c.getAttribute('class'))}));
          const routes=CONFIG.tracks.routes.map(r=>({id:r.id,t1:r.t1,expected:mode==='map,routes,markers'&&t>=r.t1, layers:__map.getStyle().layers.filter(l=>l.id==='rt-'+r.id||l.id.startsWith('rt-'+r.id+'-')).map(l=>({id:l.id,visible:__map.getLayoutProperty(l.id,'visibility')!=='none',paint:l.paint}))}));
          return {overlays,geo,routes,mapLoaded:__map.loaded(),tilesLoaded:__map.areTilesLoaded()};
        })()`);
        report.layers.push({orient,mode,t,...data});
        check(`${orient} ${mode} ${t} DOM overlays hidden`, data.overlays.length===0, data.overlays);
        check(`${orient} ${mode} ${t} route visibility`, data.routes.every(r=>r.layers.every(l=>l.visible===r.expected)), data.routes.filter(r=>r.layers.some(l=>l.visible!==r.expected)));
        check(`${orient} ${mode} ${t} SVG`, mode==='map' ? data.geo.length===0 : data.geo.every(g=>g.class.split(' ').includes('node')&&g.children.every(c=>['nd-core','nd-ring'].includes(c))), data.geo);
      }
      await shot(mode==='map'?'map-only':'map-routes-markers',58);
    }
    await page.send('Page.close');
  }
} catch (e) {
  report.errors.push({error:e.stack});
} finally {
  await browser.close();
  report.summary={checks:report.checks.length,passed:report.checks.filter(c=>c.pass).length,failed:report.checks.filter(c=>!c.pass).length,labelSamples:report.labels.length,visibleLabelSamples:report.labels.filter(r=>r.visible).length,layerSamples:report.layers.length,screenshots:report.screenshots.length,errors:report.errors.length};
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');
  fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：F1/F2专项验证：${report.summary.passed}/${report.summary.checks}检查通过；${report.summary.labelSamples}标签采样，${report.summary.layerSamples}图层采样，${report.summary.screenshots}截图；见 dev/shots/T4b/case-fixes/verification.json。\n`);
  console.log(JSON.stringify(report.summary));
  for (const item of report.checks.filter(c=>!c.pass)) console.error(JSON.stringify(item));
  for (const error of report.errors) console.error(JSON.stringify(error));
  if(report.summary.failed||report.summary.errors)process.exitCode=1;
}
