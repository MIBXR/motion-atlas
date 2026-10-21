// 站点详情页：加载中 / 横屏 / 切到竖屏 / 声音开关，各截一张并读出状态
// node dev/shots/T4/tools/site.mjs <输出目录> [宽x高]
import { launch } from '../../../../scripts/lib/cdp.mjs';
import fs from 'node:fs';
import path from 'node:path';
const [outDir = 'dev/shots/T4/site', size = '1440x900'] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// 定位后等缓冲到位（实时模式；站点内的 Demo 直连 OpenFreeMap），最多 120 秒
const settle = (page, t) => page.eval(`new Promise(r => { const a = Date.now(); const iv = setInterval(() => { const b = document.getElementById('demo-frame').contentWindow.__buffer; if ((b && b.bufferedUntil >= ${t} + 1) || Date.now() - a > 120000) { clearInterval(iv); r(b ? b.bufferedUntil : -1); } }, 250); })`, 130000);
const browser = await launch({ width: w, height: h, args: ['--autoplay-policy=no-user-gesture-required'] });
const F = `document.getElementById('demo-frame')`;
const STATE = `(() => { const d = document.querySelector('.detail'), f = ${F}, m = f && f.contentWindow.__motion, ld = document.querySelector('.stage-loading'), snd = document.querySelector('.sound-btn'), seg = document.querySelector('.orient-seg');
  return { orient: d && d.dataset.orient, segVisible: seg && !seg.hidden, pressed: seg ? [...seg.querySelectorAll('button')].map((b) => b.dataset.orient + ':' + b.getAttribute('aria-pressed')).join(' ') : null,
    sound: snd && snd.dataset.state, soundTxt: snd && snd.querySelector('.sound-state').textContent, loading: ld && { cls: ld.className, text: ld.textContent.trim(), bar: ld.querySelector('.ld-bar b') && ld.querySelector('.ld-bar b').style.cssText },
    demo: m ? { orient: m.orient, orients: m.orients, t: +m.time.toFixed(2), playing: m.playing, scale: m.stage && +m.stage.scale.toFixed(3) } : null,
    iframe: f && (() => { const b = f.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; })() }; })()`;
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('Runtime.exceptionThrown', (p) => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  page.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error') errors.push(p.args.map((a) => a.value ?? a.description).join(' ')); });
  await page.goto('http://localhost:4321/cases.html#case/map-pilgrimage', 60000);
  // 加载中：每 150ms 看一次，拍下第一张有进度的画面
  let shotLoading = false;
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    const s = await page.eval(STATE);
    if (!shotLoading && s.loading && /on|show|active/.test(s.loading.cls) && !/^\s*$/.test(s.loading.text)) { await page.screenshot(path.join(outDir, 'site-L-loading.png')); console.log('loading', JSON.stringify(s.loading)); shotLoading = true; }
    if (s.demo && (await page.eval(`Promise.race([Promise.resolve(${F}.contentWindow.__motion.ready).then(() => true), new Promise(r => setTimeout(() => r(false), 50))])`))) break;
    await sleep(150);
  }
  console.log('ready after', ((Date.now() - t0) / 1000).toFixed(1), 's');
  await sleep(1500);
  await page.eval(`(() => { const m = ${F}.contentWindow.__motion; m.pause(); return m.seek(18.6).then(() => true); })()`, 30000);
  console.log('buffered', await settle(page, 18.6));
  await sleep(2500);
  console.log('landscape', JSON.stringify(await page.eval(STATE)));
  await page.screenshot(path.join(outDir, 'site-L.png'));
  // 声音开关
  await page.eval(`(document.querySelector('.sound-btn').click(), true)`);
  await sleep(800);
  console.log('sound after click', JSON.stringify(await page.eval(`({ state: document.querySelector('.sound-btn').dataset.state, txt: document.querySelector('.sound-state').textContent, audio: ${F}.contentWindow.MotionKit.audio.state })`)));
  await page.screenshot(path.join(outDir, 'site-L-sound.png'));
  // 切到竖屏
  await page.eval(`(document.querySelector('.orient-seg [data-orient="portrait"]').click(), true)`);
  await sleep(3000);
  await page.eval(`(() => { const m = ${F}.contentWindow.__motion; m.pause(); return m.seek(41.8).then(() => true); })()`, 30000);
  console.log('buffered', await settle(page, 41.8));
  await sleep(2500);
  console.log('portrait', JSON.stringify(await page.eval(STATE)));
  await page.screenshot(path.join(outDir, 'site-P.png'));
  console.log('errors', errors.length, errors.slice(0, 5).join(' | '));
} finally { await browser.close(); }
