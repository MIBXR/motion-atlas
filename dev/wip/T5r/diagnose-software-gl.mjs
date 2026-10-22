import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { launch } from '../../../scripts/lib/cdp.mjs';

const output = 'dev/shots/T5r/software-gl';
const pausedOnly = process.argv.includes('--paused-only');
const resultPath = output + (pausedOnly ? '/seek-paused-profile.json' : '/seek-profile.json');
fs.mkdirSync(output, { recursive: true });
const processes = () => {
  const rows = JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'headless' } | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Depth 2"], { encoding: 'utf8' }) || '[]');
  const matched = (Array.isArray(rows) ? rows : [rows]).map(({ CommandLine, ...p }) => ({ ...p, browserRoot: /^(msedge|chrome)\.exe$/i.test(p.Name) && /--headless/.test(CommandLine) && !/--type=/.test(CommandLine) }));
  return { at: new Date().toISOString(), matched, browserRoots: matched.filter(p => p.browserRoot).length };
};
const result = { pausedOnly, nodeOptions: process.env.NODE_OPTIONS ?? null, execArgv: process.execArgv, before: processes(), seeks: [] };
const browser = await launch({ width: 1280, height: 720 });
let page;
try {
  page = await browser.newPage();
  result.during = processes();
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
    const data = top.__softwareProfile ||= { phase: 'ready', calls: {}, slow: [], steps: [] };
    let clock;
    Object.defineProperty(window, '__clock', { configurable: true, get: () => clock, set: value => {
      clock = value;
      const step = clock.step;
      clock.step = function(...args) {
        const started = top.performance.now(), before = clock.frame, skip = !!window.__filmSkipRender;
        const result = step.apply(this, args), ms = top.performance.now() - started;
        if (!skip || ms > 25) data.steps.push({ phase: data.phase, before, frame: clock.frame, skip, ms });
        return result;
      };
    } });
    const shaders = new WeakMap(), programs = new WeakMap();
    const now = () => top.performance.now();
    const proto = WebGL2RenderingContext.prototype;
    const source = proto.shaderSource, attach = proto.attachShader, use = proto.useProgram;
    proto.shaderSource = function(shader, text) { shaders.set(shader, text.match(/#define SHADER_NAME (\\w+)/)?.[1] || text.match(/#define SHADER_TYPE (\\w+)/)?.[1] || 'unnamed'); return source.call(this, shader, text); };
    proto.attachShader = function(program, shader) { programs.set(program, shaders.get(shader)); return attach.call(this, program, shader); };
    const active = new WeakMap();
    proto.useProgram = function(program) { active.set(this, programs.get(program)); return use.call(this, program); };
    for (const name of ['compileShader','linkProgram','getShaderParameter','getProgramParameter','getShaderInfoLog','getProgramInfoLog','getUniformLocation','getAttribLocation','getActiveUniform','getActiveAttrib','drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced','texImage2D','texStorage2D','renderbufferStorageMultisample','readPixels','finish','clear','bufferData','bufferSubData','blitFramebuffer','framebufferTexture2D','generateMipmap']) {
      const fn = proto[name];
      proto[name] = function(...args) {
        const shader = /^(compileShader|getShaderParameter|getShaderInfoLog)$/.test(name) ? shaders.get(args[0]) : /^(linkProgram|getProgramParameter|getProgramInfoLog)$/.test(name) ? programs.get(args[0]) : active.get(this);
        const started = now(), value = fn.apply(this, args), ms = now() - started;
        const key = [data.phase, this.canvas.parentElement?.id || 'probe', name, shader || 'none'].join('/');
        const stats = data.calls[key] ||= { calls: 0, totalMs: 0, maxMs: 0 };
        stats.calls++; stats.totalMs += ms; stats.maxMs = Math.max(stats.maxMs, ms);
        if (ms > 25) data.slow.push({ phase: data.phase, name, shader, ms, frame: window.__clock?.frame });
        return value;
      };
    }
  })()` });
  await page.goto('http://localhost:4323/demos/cases/archive-os/index.html?render=1&orient=landscape');
  await page.waitFor('window.__motion?.ready');
  await page.eval('__motion.ready.then(()=>true)', 60000);
  result.settings = await page.eval(`(() => {
    const win = document.querySelector('iframe').contentWindow, canvas = win.document.querySelector('#three-scene canvas');
    const gl = canvas.getContext('webgl2'), ext = gl.getExtension('WEBGL_debug_renderer_info');
    return { quality: __motion.quality, softwareGL: __motion.softwareGL, renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL), renderQuality: JSON.parse(win.document.querySelector('#three-scene').dataset.renderQuality) };
  })()`);
  async function measure(label, expression) {
    await page.eval(`__softwareProfile.phase=${JSON.stringify(label)}`);
    const started = performance.now();
    try {
      const state = await page.eval(`(async () => { await (${expression}); const win=document.querySelector('iframe').contentWindow; return { time:__motion.time,playing:__motion.playing,frame:win.__clock?.frame,stats:win.__filmApp?.stats() }; })()`, 180000);
      result.seeks.push({ label, milliseconds: performance.now() - started, state });
    } catch (error) {
      result.seeks.push({ label, milliseconds: performance.now() - started, error: error.message });
      throw error;
    } finally { fs.writeFileSync(resultPath, JSON.stringify(result, null, 2) + '\n'); }
  }
  if (!pausedOnly) {
    await measure('smoke sweep', '(() => { const m=__motion; m.pause(); for(let t=0;t<=m.duration;t+=.2)m.seek(t); return m.seek(m.duration); })()');
    await measure('smoke play then pause', '(() => { __motion.seek(0); __motion.play(); return new Promise(r=>setTimeout(()=>{__motion.pause();r();},1500)); })()');
  } else await page.eval('__motion.pause()');
  for (const t of pausedOnly ? [22, 23.28] : [0, 7.76, 22, 23.28]) await measure('seek ' + t, '__motion.seek(' + t + ')');
  result.profile = await page.eval('__softwareProfile');
  result.pass = true;
} catch (error) {
  result.error = error.stack || String(error);
} finally {
  if (page) result.profile = await page.eval('__softwareProfile').catch(() => null);
  await browser.close();
  result.after = processes();
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2) + '\n');
}
console.log(JSON.stringify({ settings: result.settings, seeks: result.seeks.map(s => ({ label: s.label, ms: s.milliseconds, error: s.error })), error: result.error }, null, 2));
if (!result.pass) process.exitCode = 1;
