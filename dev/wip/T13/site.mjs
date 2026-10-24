import fs from 'node:fs';
import path from 'node:path';
import { launch } from '../../../scripts/lib/cdp.mjs';

const out = 'dev/shots/T13/site';
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const F = 'document.getElementById("demo-frame")';
const M = `${F}.contentWindow.__motion`;
const only = new Set(process.argv.slice(2));
const results = only.size ? JSON.parse(fs.readFileSync(path.join(out, 'results.json'), 'utf8')) : [];
const browser = await launch({ args: ['--no-proxy-server', '--autoplay-policy=document-user-activation-required'] });
async function click(page, selector) {
  await page.eval(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);
  const p = await page.eval(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); const r = e.getBoundingClientRect(); const x=r.x+r.width/2,y=r.y+r.height/2; if(!e.contains(document.elementFromPoint(x,y))) throw new Error('点击目标被遮挡：'+${JSON.stringify(selector)}); return {x,y}; })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...p, button: 'left', clickCount: 1 });
  await sleep(60);
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...p, button: 'left', clickCount: 1 });
}
async function snapshot(page) {
  return page.eval(`(() => {
    const rect = (e) => { const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right}; };
    const f=${F}, m=f?.contentWindow.__motion, d=document.querySelector('.detail');
    const texts=[...document.querySelectorAll('body *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width&&r.height&&s.visibility==='visible'&&s.display!=='none'&&r.y<innerHeight&&r.bottom>0;});
    return {viewport:[innerWidth,innerHeight],overflow:document.documentElement.scrollWidth>innerWidth,
      minSiteFont:Math.min(...texts.map(e=>parseFloat(getComputedStyle(e).fontSize))),
      orient:d?.dataset.orient,frame:f&&rect(f),stage:m?.stage&&rect(m.stage.root),timeline:document.querySelector('#scrubber')&&rect(document.querySelector('#scrubber')),
      demo:m&&{orient:m.orient,orients:m.orients,time:m.time,playing:m.playing},
      sound:document.querySelector('.sound-btn')?.dataset.state,
      soundEngine:f?.contentWindow.MotionKit?.audio.state,
      loading:document.querySelector('.stage-loading')?.className,
      progress:window.__siteMessages.filter(e=>e.type==='motion:loading').map(e=>e.progress),
      ready:window.__siteMessages.filter(e=>e.type==='motion:ready').at(-1),
      fullscreen:!!document.fullscreenElement||document.querySelector('#stage-col')?.classList.contains('is-fs')};
  })()`);
}
function check(result, ok, message) { result.checks.push({ ok: !!ok, message }); }
async function layout(page, result, label) {
  await page.eval('scrollTo(0,0)');
  await sleep(300);
  const s = await snapshot(page);
  result.states[label] = s;
  check(result, !s.overflow, `${label} 无横向溢出`);
  check(result, s.minSiteFont >= 12, `${label} 站点文字至少12px`);
  if (s.frame) {
    check(result, s.frame.y >= 0 && s.frame.bottom <= s.viewport[1] + 1, `${label} 完整舞台在首屏`);
    check(result, s.timeline.y >= 0 && s.timeline.bottom <= s.viewport[1] + 1, `${label} 时间轴在首屏`);
    if (s.stage) check(result, s.stage.x >= -1 && s.stage.y >= -1 && s.stage.right <= s.frame.w + 1 && s.stage.bottom <= s.frame.h + 1, `${label} 固定舞台contain完整显示`);
  }
  await page.screenshot(path.join(out, `${result.name}-${label}.png`));
}
try {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    for (const job of [
      { name: 'home', url: '/' },
      { name: 'map', url: '/cases.html', id: 'map-pilgrimage', kind: 'case', at: 41.8 },
      { name: 'archive', url: '/cases.html', id: 'archive-os', kind: 'case', at: 39.22 },
      { name: 'legacy', url: '/cases.html', id: 'gacha-reveal', kind: 'case', at: 4 },
      { name: 'pattern', url: '/patterns.html', id: 'boot-typing', kind: 'pattern', at: 4 },
      { name: 'lab', url: '/lab.html' },
    ]) {
      if (only.size && !only.has(`${width}-${job.name}`)) continue;
      const result = { name: `${width}-${job.name}`, checks: [], states: {}, errors: [] };
      const page = await browser.newPage();
      await page.viewport(width, height);
      page.on('Runtime.exceptionThrown', (p) => result.errors.push(p.exceptionDetails.exception?.description || p.exceptionDetails.text));
      page.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error') result.errors.push(p.args.map((a) => a.value ?? a.description).join(' ')); });
      await page.send('Page.addScriptToEvaluateOnNewDocument', { source: "window.__siteMessages=[];addEventListener('message',e=>{if(e.data?.type?.startsWith('motion:'))window.__siteMessages.push(e.data)});" });
      try {
        await page.goto(`http://localhost:4321${job.url}`, 60000);
        await page.waitFor('window.Site && document.querySelector(".site-nav")');
        if (job.id) {
          await page.eval('localStorage.removeItem("ma-orient");localStorage.removeItem("ma-sound")');
          await page.waitFor(`document.querySelector('a[href="#${job.kind}/${job.id}"]')`);
          await click(page, `a[href="#${job.kind}/${job.id}"]`);
          await page.waitFor(`${F} && ${M}`, 120000);
          if (await page.eval('document.querySelector(".stage-loading").classList.contains("show")')) await page.screenshot(path.join(out, `${result.name}-loading.png`));
          await page.eval(`Promise.resolve(${M}.ready).then(()=>true)`, 180000);
          await page.waitFor('document.querySelector("#scrubber").dataset.ready==="1"', 30000);
          await page.eval(`${M}.pause();${M}.seek(${job.at})`, 120000);
          if (job.name === 'map') await page.waitFor(`${F}.contentWindow.__buffer?.bufferedUntil>=${job.at + 1}`, 180000);
          await layout(page, result, 'landscape');
          check(result, !result.states.landscape.loading.includes('show'), 'ready后加载遮罩消失');
          await click(page, '.sound-btn');
          await page.waitFor('document.querySelector(".sound-btn").dataset.state==="on"', 15000);
          check(result, await page.eval(`${F}.contentWindow.MotionKit.audio.state==='on'`), '声音按钮开启引擎');
          await click(page, '.sound-btn');
          await page.waitFor('document.querySelector(".sound-btn").dataset.state==="off"');
          await page.waitFor(`${F}.contentWindow.MotionKit.audio.state==='off'`);
          check(result, await page.eval(`${F}.contentWindow.MotionKit.audio.state==='off'`), '声音按钮关闭引擎');
          const t0 = await page.eval(`${M}.time`);
          await click(page, '#scrub-play');
          await sleep(1800);
          const played = await page.eval(`({playing:${M}.playing,time:${M}.time})`);
          check(result, played.playing && played.time > t0 + 0.4, '播放按钮推进时间轴');
          await click(page, '#scrub-play');
          const paused = await page.eval(`({playing:${M}.playing,time:${M}.time})`);
          await sleep(250);
          check(result, !paused.playing && Math.abs(await page.eval(`${M}.time`) - paused.time) < 0.001, '暂停按钮冻结时间');
          const orients = await page.eval(`${M}.orients`);
          if (orients.length > 1) {
            await click(page, '.orient-seg [data-orient="portrait"]');
            await page.waitFor(`${M}.orient==='portrait'`);
            await page.eval(`${M}.seek(${job.at})`, 120000);
            if (job.name === 'map') await page.waitFor(`${F}.contentWindow.__buffer?.bufferedUntil>=${job.at + 1}`, 180000);
            await layout(page, result, 'portrait');
            await click(page, '.orient-seg [data-orient="landscape"]');
            await page.waitFor(`${M}.orient==='landscape'`);
            check(result, true, '横竖双向切换');
          } else result.orientation = '旧Demo无固定画幅切换，显示16:9自适应标签';
          await click(page, '[data-act="fullscreen"]');
          await page.waitFor('document.querySelector("#stage-col").classList.contains("is-fs")');
          check(result, true, '全屏进入');
          await page.screenshot(path.join(out, `${result.name}-fullscreen.png`));
          await click(page, '[data-act="fullscreen"]');
          await page.waitFor('!document.querySelector("#stage-col").classList.contains("is-fs")');
          check(result, true, '全屏退出');
          result.messages = await page.eval('window.__siteMessages.filter(e=>e.type!=="motion:time")');
        } else if (job.name === 'lab') {
          await page.waitFor('window.__lab');
          await click(page, '#play');
          await page.waitFor('document.querySelector("#play").dataset.playing==="true"');
          check(result, await page.eval('MotionKit.audio.state==="on"'), '实验室播放启用合成音频');
          await click(page, '#snd');
          check(result, await page.eval('!MotionKit.audio.enabled'), '实验室静音');
          await click(page, '#snd');
          await page.waitFor('MotionKit.audio.state==="on"');
          await click(page, '#play');
          check(result, await page.eval('document.querySelector("#play").dataset.playing==="false"'), '实验室停止');
          await page.eval('document.querySelector("#s-quant").scrollIntoView()');
          await sleep(400);
          await page.screenshot(path.join(out, `${result.name}-quant.png`));
          await page.eval('scrollTo(0,document.body.scrollHeight)');
          await sleep(400);
          result.toTop = await page.eval(`(() => {const a=document.querySelector('.to-top').getBoundingClientRect();return [...document.querySelectorAll('.field-row output')].map(e=>({text:e.textContent,r:e.getBoundingClientRect()})).filter(e=>e.r.top<a.bottom&&e.r.bottom>a.top&&e.r.left<a.right&&e.r.right>a.left).map(e=>e.text)})()`);
          await layout(page, result, 'top');
          result.controls = '实验室使用走带/音量/A-B网格，无Demo画幅和全屏控件';
        } else {
          await page.waitFor('document.querySelectorAll("#caseGrid .card").length===9');
          await layout(page, result, 'top');
          result.controls = '首页为预览图与导航，无Demo播放/声音/画幅/全屏控件';
        }
        check(result, result.errors.length === 0, '控制台无报错');
      } catch (error) { result.errors.push(error.stack); check(result, false, error.message); }
      const previous=results.findIndex(r=>r.name===result.name);
      if(previous<0)results.push(result);else results[previous]=result;
      fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2) + '\n');
      console.log(result.name, result.checks.filter((c) => c.ok).length + '/' + result.checks.length, result.errors.length ? result.errors.join('\n') : '0 console errors');
      await page.send('Page.close');
    }
  }
} finally { await browser.close(); }
const checks = results.flatMap((r) => r.checks);
console.log(`site ${results.length}/12 pages · ${checks.filter((c) => c.ok).length}/${checks.length} checks`);
if (checks.some((c) => !c.ok)) process.exitCode = 1;
