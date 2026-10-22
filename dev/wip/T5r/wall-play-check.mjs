import fs from 'node:fs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { launch } from '../../../scripts/lib/cdp.mjs';

const out = 'dev/shots/T5r/wall-play';
fs.mkdirSync(out, { recursive: true });
const browser = await launch({ width: 1920, height: 1080 });
const result = { errors: [] };
const snapshot = `(() => {
  const win=document.querySelector('iframe').contentWindow,doc=win.document,stats=win.__filmApp.stats();
  return { mode:doc.querySelector('#stage').dataset.mode,selected:stats.selected,tab:stats.activeTab,
    viewerOpen:stats.viewerOpen,viewer:stats.viewer,boot:doc.querySelector('#stage').dataset.boot,
    bootTime:stats.bootTime,frame:win.__clock.frame,clockNow:win.__clock.now };
})()`;
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', event => result.errors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text));
  page.on('Runtime.consoleAPICalled', event => { if(event.type==='error')result.errors.push(event.args.map(arg=>arg.description||arg.value||arg.type).join(' ')); });
  await page.goto('http://localhost:4323/demos/cases/archive-os/index.html?autoplay=0&quality=original',120000);
  await page.waitFor('window.__motion',30000);
  await page.eval('__motion.ready.then(()=>true)',120000);
  result.renderer = await page.eval(`(() => {const gl=document.querySelector('iframe').contentDocument.querySelector('#three-scene canvas').getContext('webgl2'),debug=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(debug?debug.UNMASKED_RENDERER_WEBGL:gl.RENDERER);})()`);
  await page.eval('__motion.seek(21.5)',60000);
  result.play = await page.eval(`(async () => {
    const from=__motion.time,started=performance.now();
    await __motion.play();
    await new Promise(resolve=>setTimeout(resolve,5000));
    __motion.pause();
    return {from,to:__motion.time,wallSeconds:(performance.now()-started)/1000,
      frame:__filmDriver.frame,clockNow:document.querySelector('iframe').contentWindow.__clock.now};
  })()`,30000);
  await page.waitFor('__filmDriver.frame===Math.round(__motion.time*60)',30000);
  await page.eval('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  result.playDom=await page.eval(snapshot);
  await page.screenshot(`${out}/play.png`);
  await page.eval(`__motion.seek(0).then(()=>__motion.seek(${result.play.to}))`,60000);
  await page.eval('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  result.seekDom=await page.eval(snapshot);
  await page.screenshot(`${out}/seek.png`);
  const pixels = file => {
    const run=spawnSync(process.env.FFMPEG_PATH||'ffmpeg',['-v','error','-i',file,'-vf','scale=64:36:flags=area','-frames:v','1','-pix_fmt','rgb24','-f','rawvideo','pipe:1']);
    assert.equal(run.status,0,run.stderr?.toString());
    assert.equal(run.stdout.length,64*36*3);
    return run.stdout;
  };
  const left=pixels(`${out}/play.png`),right=pixels(`${out}/seek.png`);
  let difference=0;for(let index=0;index<left.length;index++)difference+=Math.abs(left[index]-right[index]);
  result.mad255=difference/left.length;
  result.madNormalized=result.mad255/255;
  result.domMatches=JSON.stringify(result.playDom)===JSON.stringify(result.seekDom);
  result.gridMatches=result.playDom.frame===Math.round(result.play.to*60)&&Math.abs(result.playDom.clockNow-result.playDom.frame*1000/60)<1e-6;
  result.wallDelta=result.play.wallSeconds-(result.play.to-result.play.from);
  result.liveLagSeconds=result.play.to-result.play.clockNow/1000;
  result.liveClockMatches=Math.abs(result.liveLagSeconds)<1/60;
  result.playSeekMatches=result.domMatches&&result.gridMatches&&result.mad255<2;
  if(result.errors.length||!result.playSeekMatches||!result.liveClockMatches)process.exitCode=1;
} catch(error) {
  result.error=error.stack||error.message;
  process.exitCode=1;
} finally {
  await browser.close();
  fs.writeFileSync(`${out}/result.json`,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
}
