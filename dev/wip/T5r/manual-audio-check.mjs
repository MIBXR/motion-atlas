import fs from 'node:fs';
import { launch } from '../../../scripts/lib/cdp.mjs';

const browser = await launch({ width: 1920, height: 1080 });
const result = { steps: [], failures: [], errors: [] };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const out = 'dev/shots/T5r/manual-audio';
fs.mkdirSync(out, { recursive: true });
const check = (condition, message) => { if (!condition) result.failures.push(message); };
const instrument = `(() => {
  const qa = window.__audioQA = { outputs: [], sources: [], gains: [], trusted: [] };
  const createGain = BaseAudioContext.prototype.createGain;
  BaseAudioContext.prototype.createGain = function (...args) { const gain = Reflect.apply(createGain, this, args); qa.gains.push(gain); return gain; };
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (...args) {
    const value = Reflect.apply(connect, this, args);
    if (args[0] === this.context.destination) {
      const analyser = this.context.createAnalyser(); analyser.fftSize = 2048;
      Reflect.apply(connect, this, [analyser]); qa.outputs.push({ context: this.context, analyser });
    }
    return value;
  };
  const start = AudioBufferSourceNode.prototype.start, stop = AudioScheduledSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.start = function (...args) {
    qa.sources.push({ type: 'start', when: args[0] || 0, offset: args[1] || 0, bufferDuration: this.buffer?.duration, time: this.context.currentTime });
    return Reflect.apply(start, this, args);
  };
  AudioScheduledSourceNode.prototype.stop = function (...args) {
    if (this instanceof AudioBufferSourceNode) qa.sources.push({ type: 'stop', when: args[0] || 0, bufferDuration: this.buffer?.duration, time: this.context.currentTime });
    return Reflect.apply(stop, this, args);
  };
  for (const type of ['keydown', 'pointerdown']) document.addEventListener(type, event => {
    if (event.isTrusted) qa.trusted.push({ type, key: event.key || null });
  }, true);
  qa.meters = () => qa.outputs.map(({context,analyser}) => {
    const data = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(data);
    let sum = 0, peak = 0; for (const value of data) { sum += value * value; peak = Math.max(peak, Math.abs(value)); }
    return { state: context.state, peak, rms: Math.sqrt(sum / data.length) };
  });
})();`;
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', event => result.errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
  page.on('Runtime.consoleAPICalled', event => { if (event.type === 'error') result.errors.push(event.args.map(arg => arg.description || arg.value || arg.type).join(' ')); });
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: instrument });
  const base = 'http://localhost:4323/demos/cases/archive-os/index.html';
  await page.goto(`${base}?render=1&quality=original`, 120000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('__motion.ready.then(() => true)', 120000);
  result.score = await page.eval('__motion.audio.events()');
  check(result.score.length === 1 && result.score[0].t === 0, 'The film must expose exactly one score event at t=0.');
  const wav = await page.eval('__motion.audio.renderWav({from:30,to:32})', 120000);
  fs.writeFileSync(`${out}/excerpt-30-32.wav`, Buffer.from(wav.base64, 'base64'));
  delete wav.base64;
  result.wav = wav;
  check(wav.peakDb > -100 && wav.rmsDb > -100, 'Offline excerpt must contain nonzero sound.');
  check(wav.peakDb <= -1 + 1e-5, 'Offline excerpt exceeded the kit ceiling of -1 dBFS.');
  result.renderModeEnable = await page.eval('MotionKit.audio.enable()');
  await page.goto(`${base}?autoplay=0&quality=original`, 120000);
  await page.waitFor('window.__motion', 30000);
  await page.eval('__motion.ready.then(() => true)', 120000);
  const state = () => page.eval(`(() => { const win=document.querySelector('iframe').contentWindow; return { time:__motion.time,playing:__motion.playing,manual:__filmDriver.manual,frame:__filmDriver.frame,clock:{now:win.__clock.now,mode:win.__clock.mode},focused:win.document.activeElement?.outerHTML?.slice(0,250),app:win.__filmApp.stats(),audio:win.__filmAudio.stats(),meters:win.__audioQA.meters(),gains:win.__audioQA.gains.map(gain=>gain.gain.value),sources:win.__audioQA.sources,kit:{enabled:MotionKit.audio.enabled,state:MotionKit.audio.state,active:MotionKit.audio.active,meter:MotionKit.audio.meter(),sources:__audioQA.sources} }; })()`);
  await page.eval('__motion.pause();__motion.seek(30)');
  const enabled = await page.send('Runtime.evaluate', { expression: 'MotionKit.audio.enable()', userGesture: true, returnByValue: true });
  check(enabled.result.value === true, 'Live kit audio could not be enabled.');
  await page.waitFor('MotionKit.audio.ctx?.state === "running" && MotionKit.audio.ctx.currentTime > .2',10000);
  await page.eval('__motion.play()'); await sleep(800);
  result.steps.push({ name: 'sample-playing', state: await state() });
  check(result.steps.at(-1).state.kit.active > 0 && result.steps.at(-1).state.kit.meter.rms > 0, 'Film sample has no live output.');
  await page.eval('__motion.pause()'); await sleep(250);
  result.steps.push({ name: 'sample-paused', state: await state() });
  check(result.steps.at(-1).state.kit.active === 0 && result.steps.at(-1).state.kit.meter.rms < 1e-6, 'Pausing left an active sample or audible residue.');
  await page.eval('__motion.seek(32)'); await sleep(100);
  result.steps.push({ name: 'sample-seek-paused', state: await state() });
  check(result.steps.at(-1).state.kit.active === 0, 'Seeking while paused left an active sample.');
  await page.eval('__motion.play()'); await sleep(450);
  result.steps.push({ name: 'sample-resumed', state: await state() });
  const starts = result.steps.at(-1).state.kit.sources.filter(source => source.type === 'start' && Math.abs(source.bufferDuration - 77.6) < 0.1);
  check(starts.some(source => Math.abs(source.offset - 30) < 0.15), 'Initial sampled score did not start at the current timeline offset.');
  check(starts.some(source => Math.abs(source.offset - 32) < 0.15), 'Sampled score did not resume at the seek offset.');
  await page.eval('__motion.pause();__motion.seek(62)');
  async function click(selector) {
    const position = await page.eval(`(() => { const iframe=document.querySelector('iframe'), win=iframe.contentWindow, target=win.document.querySelector(${JSON.stringify(selector)}); if(!target)throw new Error('Missing target');const a=iframe.getBoundingClientRect(), b=target.getBoundingClientRect(), scale=a.width/iframe.clientWidth;return{x:a.x+(b.x+b.width/2)*scale,y:a.y+(b.y+b.height/2)*scale};})()`);
    await page.send('Input.dispatchMouseEvent', { type:'mouseMoved', ...position });
    await page.send('Input.dispatchMouseEvent', { type:'mousePressed', button:'left', clickCount:1, ...position });
    await page.send('Input.dispatchMouseEvent', { type:'mouseReleased', button:'left', clickCount:1, ...position });
  }
  async function key(key, code, windowsVirtualKeyCode) {
    await page.send('Input.dispatchKeyEvent', { type:'keyDown', key, code, windowsVirtualKeyCode, nativeVirtualKeyCode:windowsVirtualKeyCode });
    await page.send('Input.dispatchKeyEvent', { type:'keyUp', key, code, windowsVirtualKeyCode, nativeVirtualKeyCode:windowsVirtualKeyCode });
  }
  await page.eval(`(()=>{const iframe=document.querySelector('iframe');iframe.contentWindow.focus();iframe.contentDocument.body.tabIndex=-1;iframe.contentDocument.body.focus();})()`);
  await key('ArrowDown','ArrowDown',40);
  await page.waitFor(`document.querySelector('iframe').contentWindow.__filmAudio.stats().loaded && document.querySelector('iframe').contentWindow.__filmAudio.stats().now > .2`,10000);
  await sleep(1500);
  result.steps.push({ name:'manual-arrow-down', state:await state() });
  check(result.steps.at(-1).state.manual && result.steps.at(-1).state.app.selected === 'X-006', 'A real ArrowDown did not enter manual mode and select X-006.');
  check(result.steps.at(-1).state.audio.state === 'running' && result.steps.at(-1).state.meters.some(meter=>meter.rms>0), 'Original live WebAudio output has no measured energy.');
  const decryptionStart=performance.now();
  await key('Enter','Enter',13);
  await page.waitFor(`document.querySelector('iframe').contentWindow.__filmApp.stats().mode==='detail'`,10000);
  await page.waitFor(`document.querySelector('iframe').contentWindow.__filmApp.stats().decryption.phase==='clear'`,30000);
  result.manualDecryptionMs=performance.now()-decryptionStart;
  result.steps.push({name:'manual-decryption',state:await state()});
  await page.screenshot(`${out}/manual-detail.png`);
  await click('[data-action="model-viewer"]');
  await page.waitFor(`document.querySelector('iframe').contentWindow.__filmApp.stats().viewerOpen`,10000);
  await page.waitFor(`document.querySelector('iframe').contentWindow.__filmApp.stats().viewer?.ready`,10000);
  result.steps.push({name:'manual-viewer',state:await state()});
  await page.screenshot(`${out}/manual-viewer.png`);
  await page.eval('MotionKit.audio.disable()'); await sleep(350);
  result.steps.push({name:'manual-site-muted',state:await state()});
  const muted=result.steps.at(-1).state;
  check(!muted.audio.preferences.sound && !muted.audio.preferences.music,'The site sound switch did not disable both original sound and music preferences.');
  check(muted.meters.every(meter=>meter.state!=='running'||meter.rms<1e-6),'The original audio output remained audible after site mute.');
  await page.send('Runtime.evaluate',{expression:'MotionKit.audio.enable()',userGesture:true,returnByValue:true});
  await page.waitFor(`document.querySelector('iframe').contentWindow.__filmAudio.stats().state==='running'`,10000);
  await sleep(500);
  result.steps.push({name:'manual-site-restored',state:await state()});
  const restored=result.steps.at(-1).state;
  check(restored.audio.preferences.sound && restored.audio.preferences.music,'The site sound switch did not restore both original preferences.');
  check(restored.meters.some(meter=>meter.state==='running'&&meter.rms>0),'The original audio output did not resume after site sound enabled.');
  result.trusted = await page.eval(`document.querySelector('iframe').contentWindow.__audioQA.trusted`);
  check(result.trusted.some(event=>event.key==='ArrowDown')&&result.trusted.some(event=>event.key==='Enter')&&result.trusted.some(event=>event.type==='pointerdown'),'The manual interaction was not driven by trusted browser input.');
  const resetStart=performance.now();
  await page.eval('window.__manualDocument=document.querySelector("iframe").contentDocument;__motion.play()');
  try {
    await page.waitFor(`!__filmDriver.manual && window.__manualDocument!==document.querySelector('iframe').contentDocument && __filmDriver.frame>=Math.round(__motion.time*60)-1`,12000,100);
  } catch(error) { result.failures.push(`Manual play rebuild: ${error.message}`); }
  result.rebuildMs=performance.now()-resetStart;
  result.rebuiltDocument=await page.eval('window.__manualDocument!==document.querySelector("iframe").contentDocument');
  result.steps.push({name:'manual-play-rebuild',state:await state()});
  await page.eval('__motion.pause()');
  result.finalPaused=await state();
  check(result.rebuiltDocument && !result.finalPaused.manual,'Play did not recreate a clean film iframe.');
  check(result.errors.length===0,'Browser emitted errors.');
} catch(error) {
  result.failures.push(error.stack||error.message);
} finally {
  fs.writeFileSync(`${out}/result.json`,JSON.stringify(result,null,2)+'\n');
  await browser.close();
  console.log(JSON.stringify({failures:result.failures,errors:result.errors,score:result.score,wav:result.wav,rebuildMs:result.rebuildMs,steps:result.steps.map(step=>({name:step.name,time:step.state.time,frame:step.state.frame,mode:step.state.app.mode,selected:step.state.app.selected,viewerOpen:step.state.app.viewerOpen,manual:step.state.manual,originalAudio:step.state.audio.state,originalMeter:step.state.meters,kitActive:step.state.kit.active,kitRms:step.state.kit.meter.rms}))},null,2));
  if(result.failures.length)process.exitCode=1;
}
