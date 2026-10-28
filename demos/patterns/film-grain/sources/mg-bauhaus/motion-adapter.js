await import('./film.js');

const MK = MotionKit;
const { width = 1920, height = 1080, fps = 30, duration = 10 } = window.DEMO || {};
const cues = await (await fetch('./cues.json')).json();
const labels = {
  marks: '定位标记', circle_land: '圆形落位', bar_land: '黑条落位',
  target1: '定位一', tri_in: '三角入场', target2: '定位二', tri_flip: '三角翻转',
  target3: '定位三', sq_scale: '方形缩放', target4: '定位四', circle_slide: '圆形滑动',
  pivot: '轴心落点', group_turn: '组合转向', semi_slide: '半圆滑动', qd_sweep: '扇形扫入',
  rule: '横线绘制', ticker_in: '拍数入场', red_in: '红块入场', red_split: '红块分割',
  drop: '重拍级联', reveal: '三原色显现', freeze: '海报定格', type_small: '小字入场', lock: '套印锁定',
  R1: '旋转波', R2: '横向翻牌', R3: '列对滑动', R4: '向心翻牌',
};
const markers = [
  { t: cues.grid.land0, label: '网格落笔' },
  ...cues.events.map(cue => ({ t: cue.t, label: labels[cue.id] })),
  ...cues.ripples.map(cue => ({ t: cue.start, label: labels[cue.id] })),
].sort((a, b) => a.t - b.t);
const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';
document.head.appendChild(viewport);
MK.stage({ root: '#out', orients: ['landscape'], sizes: { landscape: [width, height] }, background: '#000' });

const tl = MK.timeline({ duration, fps, markers, render: t => window.renderAt(t) });
const rendering = new URLSearchParams(location.search).has('render');
const audioBytes = await (await fetch('audio/film.m4a')).arrayBuffer();
const media = new Audio();
media.preload = 'auto';
media.muted = true;
const mediaReady = new Promise((resolve, reject) => {
  media.addEventListener('loadedmetadata', resolve, { once: true });
  media.addEventListener('error', () => reject(media.error), { once: true });
});
media.src = URL.createObjectURL(new Blob([audioBytes], { type: 'audio/mp4' }));
await mediaReady;
let soundEnabled = false, soundState = 'off', audioRevision = 0, bar;
const post = message => { if (parent !== window) parent.postMessage(message, location.origin); };
function soundStatus() {
  if (bar) {
    bar.dataset.sound = soundState;
    const button = bar.querySelector('[data-act="sound"]');
    button.setAttribute('aria-pressed', String(soundEnabled));
    button.setAttribute('aria-label', soundEnabled ? '关闭声音' : '开启声音');
    button.title = soundState === 'blocked' ? '声音已开启，点击画面以启用' : soundEnabled ? '关闭声音' : '开启声音';
  }
  post({ type: 'motion:sound', on: soundEnabled, state: soundState });
}
async function syncAudio() {
  const revision = ++audioRevision;
  media.currentTime = tl.time;
  media.playbackRate = tl.rate;
  if (!soundEnabled || !tl.playing) { media.pause(); return; }
  try {
    await media.play();
    if (revision !== audioRevision) return;
    soundState = 'on';
  } catch (error) {
    if (revision !== audioRevision || error.name === 'AbortError') return;
    if (error.name !== 'NotAllowedError') throw error;
    soundState = 'blocked';
  }
  soundStatus();
}
async function setSound(on) {
  soundEnabled = !!on && !rendering;
  media.muted = !soundEnabled;
  soundState = soundEnabled ? 'on' : 'off';
  await syncAudio();
  soundStatus();
}
tl.on('play', () => { void syncAudio(); });
tl.on('seek', () => { void syncAudio(); });
tl.on('rate', () => { void syncAudio(); });
tl.on('pause', () => { ++audioRevision; media.pause(); media.currentTime = tl.time; });
tl.on('end', () => { ++audioRevision; media.pause(); });
tl.on(t => {
  if (soundEnabled && tl.playing && soundState === 'on' && media.readyState >= 2 && !media.seeking && Math.abs(media.currentTime - t) > 0.08) media.currentTime = t;
});
for (const type of ['pointerdown', 'keydown']) {
  addEventListener(type, () => { if (soundState === 'blocked') void setSound(true); }, true);
}
addEventListener('message', event => {
  if (event.source !== parent || !event.data) return;
  if (event.data.type === 'motion:sound') {
    event.stopImmediatePropagation();
    void setSound(event.data.on);
  } else if (event.data.type === 'motion:query') queueMicrotask(soundStatus);
}, true);
MK.expose(tl, { title: document.title, sound: true });
Object.defineProperties(tl, {
  soundEnabled: { get: () => soundEnabled },
  soundState: { get: () => soundState },
});
bar = MK.controls(tl, { sound: { toggle: () => setSound(!soundEnabled) }, accent: '#E03C31', orient: false });
if (bar) {
  const speed = document.createElement('label');
  speed.textContent = '速度 ';
  const select = document.createElement('select');
  select.setAttribute('aria-label', '播放速度');
  select.style.cssText = 'font:inherit;font-size:13px;color:inherit;background:#26272b;border:0;border-radius:4px;padding:5px 2px';
  for (const rate of [0.5, 0.75, 1, 1.25, 1.5, 2]) {
    const option = new Option(`${rate} 倍`, String(rate), false, rate === 1);
    select.add(option);
  }
  select.onchange = () => tl.setRate(Number(select.value));
  tl.on('rate', rate => { select.value = String(rate); });
  speed.appendChild(select);
  bar.appendChild(speed);
}
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { if (event.matches) tl.pause(); });
soundStatus();
await MK.start(tl, { t: 0, reduced: 9.75 });
