import fs from 'node:fs';
import { launch } from '../../../scripts/lib/cdp.mjs';

const out = 'dev/shots/T5r/gpu-play-timing';
fs.mkdirSync(out, { recursive: true });
const entry = JSON.parse(fs.readFileSync('entries/cases/archive-os.json', 'utf8'));
const args = entry.renderer === 'gpu' ? ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] : [];
const result = { nodeOptions: process.env.NODE_OPTIONS ?? null, execArgv: process.execArgv, entryRenderer: entry.renderer, launchArgs: args, cases: [] };
const browser = await launch({ width: 1280, height: 720, args });
try {
  for (const orient of ['landscape', 'portrait']) {
    const page = await browser.newPage();
    try {
      await page.viewport(orient === 'portrait' ? 720 : 1280, orient === 'portrait' ? 1280 : 720);
      await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
        if (window === top) {
          window.__playTiming = { phase: 'initial', loading: [], ready: [], play: [] };
          addEventListener('motion:loading', e => __playTiming.loading.push({ at: performance.now(), phase: __playTiming.phase, progress: e.detail.progress }));
        } else addEventListener('film:progress', e => {
          if (e.detail.frame) top.__playTiming.ready.push({ at: top.performance.now(), phase: top.__playTiming.phase });
        });
      })()` });
      const started = performance.now();
      await page.goto(`http://localhost:4323/demos/cases/archive-os/index.html?render=1&orient=${orient}`, 45000);
      await page.waitFor('window.__motion?.ready');
      await page.eval('__motion.ready.then(()=>true)', 60000);
      const readyMs = performance.now() - started;
      const environment = await page.eval(`(() => {
        const gl = document.querySelector('iframe').contentDocument.querySelector('#three-scene canvas').getContext('webgl2');
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        __motion.on('play', () => __playTiming.play.push({ at: performance.now(), phase: __playTiming.phase, time: __motion.time }));
        return { renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL), quality: __motion.quality, softwareGL: __motion.softwareGL };
      })()`);
      const duration = await page.eval('__motion.duration');
      await page.eval(`(() => { __playTiming.phase='sweep'; const m=__motion; m.pause(); for(let t=0;t<=${duration};t+=.2)m.seek(t); m.seek(${duration}); return true; })()`, 60000);
      const t0 = await page.eval(`(() => { __playTiming.phase='play-window'; __playTiming.requestAt=performance.now(); __motion.seek(0); __motion.play(); return __motion.time; })()`);
      await page.eval('new Promise(r=>setTimeout(r,1500))');
      const t1 = await page.eval('__motion.time');
      await page.eval('__motion.pause()');
      const state = await page.eval(`(() => {
        const win=document.querySelector('iframe').contentWindow;
        return { timing:__playTiming, outer:__motion.time, playing:__motion.playing, frame:win.__clock?.frame??null };
      })()`);
      const play = state.timing.play.find(e => e.phase === 'play-window');
      result.cases.push({ orient, readyMs, ...environment, t0, t1, advance:t1-t0, passesOriginalThreshold:t1>t0+.5,
        requestToPlayMs: play ? play.at-state.timing.requestAt : null, ...state });
      fs.writeFileSync(`${out}/result.json`, JSON.stringify(result,null,2)+'\n');
      console.log(JSON.stringify({ orient, t0, t1, requestToPlayMs:result.cases.at(-1).requestToPlayMs, renderer:environment.renderer }));
    } finally { await page.send('Page.close'); }
  }
} finally { await browser.close(); }
