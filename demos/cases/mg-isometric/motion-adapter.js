const MK = window.MotionKit;
const cuesReady = fetch('./cues.json').then(response => response.json());
const originalReady = (async () => {
  while (window.__ready !== true) await new Promise(requestAnimationFrame);
})();
const media = new Audio();
media.preload = 'auto';
media.muted = true;
const mediaReady = (async () => {
  const audioBytes = await (await fetch('audio/film.m4a')).arrayBuffer();
  const metadata = new Promise((resolve, reject) => {
    media.addEventListener('loadedmetadata', resolve, { once: true });
    media.addEventListener('error', () => reject(media.error), { once: true });
  });
  media.src = URL.createObjectURL(new Blob([audioBytes], { type: 'audio/mp4' }));
  await metadata;
})();
MK.preload([{ label: '原作画面与时间表', run: () => Promise.all([originalReady, cuesReady]) }]);

const { width = 1920, height = 1080, fps = 30, duration = 10 } = window.DEMO || {};
const cues = await cuesReady;
const labels = {
  rings: '地块环', soil: '土层伸展', roads: '道路描出', houses: '住宅',
  turbines: '风机', rail: '轨道构建', downtown: '楼房', cars: '车辆入场',
  train: '列车启程', drop: '城市激活', drones: '无人机', callouts: '数据卡',
  whoosh: '拉远风声', plate: '标题落版', letters_start: '字母起落', final: '标语揭示', end: '结束',
};
const towerLabels = { base: '核心基座', seg1: '核心一段', seg2: '核心二段', seg3: '核心三段', antenna: '核心天线', ring: '核心光环' };
const markers = [
  ...['rings', 'turbines', 'drones', 'callouts'].flatMap(key => cues[key].map((t, i) => ({ t, label: `${labels[key]}${i + 1}` }))),
  ...['houses', 'downtown'].flatMap(key => Object.values(cues[key]).map((t, i) => ({ t, label: `${labels[key]}${i + 1}` }))),
  ...Object.entries(cues.tower).map(([key, t]) => ({ t, label: towerLabels[key] })),
  ...['soil', 'roads', 'rail', 'cars', 'train', 'drop', 'whoosh', 'plate', 'letters_start', 'final', 'end'].map(key => ({ t: cues[key], label: labels[key] })),
  ...cues.pullback.map((t, i) => ({ t, label: ['拉远开始', '拉远到位'][i] })),
  ...cues.blueprint.map((t, i) => ({ t, label: ['蓝图起绘', '蓝图成形'][i] })),
  ...cues.sweep.map(([, t], i) => ({ t, label: `生长前沿${i + 1}` })),
].sort((a, b) => a.t - b.t);
const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';
document.head.appendChild(viewport);
const root = document.getElementById('stage');
root.style.background = getComputedStyle(document.body).backgroundColor;
MK.stage({ root, orients: ['landscape'], sizes: { landscape: [width, height] }, background: '#000' });

const tl = MK.timeline({ duration, fps, markers, async render(t) { await originalReady; return window.renderAt(t); } });
const rendering = new URLSearchParams(location.search).has('render');
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
  if (!soundEnabled) { media.pause(); return; }
  await mediaReady;
  if (revision !== audioRevision) return;
  media.currentTime = tl.time;
  media.playbackRate = tl.rate;
  if (!tl.playing) { media.pause(); return; }
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
tl.on('pause', () => { ++audioRevision; media.pause(); if (media.readyState >= 1) media.currentTime = tl.time; });
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
bar = MK.controls(tl, { sound: { toggle: () => setSound(!soundEnabled) }, accent: '#A08CFF', orient: false });
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
