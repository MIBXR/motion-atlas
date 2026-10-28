await import('./film.js');

const MK = MotionKit;
const { width = 1920, height = 1080, fps = 30, duration = 10 } = window.DEMO || {};
const cues = await (await fetch('./cues.json')).json();
const drawLabels = {
  'ground0@0.7': '墨线开场', seed: '种子成形', stem1: '茎节生长', leaf1: '首叶展开',
  stem2: '茎节延伸', leaf2: '次叶展开', stem3: '树梢生长', leaf3: '三叶展开',
  shoot: '枝梢伸展', tendril: '卷须生长', roof: '屋梁展开', pavilion: '亭阁成形',
  tower: '高塔生长', tower2: '塔身落笔', sky: '天际展开', sky2: '尖塔落笔',
  horizon: '地平延伸', wave: '海浪翻起', curl: '浪花卷曲', lift: '光线抬升',
  ring: '圆环描绘', foot: '圆环接续', arch: '拱门描绘', 'arch>': '轮廓闭合',
};
const markers = [
  ...cues.draw.map(([t, key], i, draw) => ({ t, label: i > 0 && draw[i - 1][1] === key ? '停顿续笔' : drawLabels[key] })),
  { t: cues.morph[0], label: '卷须成梁' },
  { t: cues.fill.start, label: '线环成面' },
  { t: cues.pulse.start, label: '光脉回溯' },
  { t: cues.camera.poster_from, label: '海报拉远' },
  { t: cues.wordmark.start, label: '字标入场' },
  { t: cues.wordmark.tagline, label: '标语入场' },
  { t: cues.breath.start, label: '光脉回流' },
  { t: cues.camera.poster_to, label: '海报落定' },
  { t: cues.rules[0], label: '细线签章' },
].sort((a, b) => a.t - b.t);
const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';
document.head.appendChild(viewport);
MK.stage({ root: '#c', orients: ['landscape'], sizes: { landscape: [width, height] }, background: '#000' });

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
bar = MK.controls(tl, { sound: { toggle: () => setSound(!soundEnabled) }, accent: '#E6CB8E', orient: false });
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
