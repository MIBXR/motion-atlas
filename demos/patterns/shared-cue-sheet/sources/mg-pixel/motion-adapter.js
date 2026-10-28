await import('./motion-kit.js');

const MK = window.MotionKit;
const { width = 1920, height = 1080, fps = 30, duration = 10 } = window.DEMO || {};
const params = MK.params();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';
document.head.appendChild(viewport);
document.title = 'PIXEL QUEST 像素冒险';
MK.stage({ root: document.getElementById('c'), orients: ['landscape'], sizes: { landscape: [width, height] }, background: '#000' });

const cues = await (await fetch('./cues.json')).json();
const labels = [
  ['crt_on', '显像管开机'], ['jumps', '跳跃'], ['coins', '收集金币'], ['lands', '落地'],
  ['stomp', '踩踏史莱姆'], ['skid', '滑步'], ['stop', '停步'], ['alert', '发现宝箱'],
  ['box_open', '对话框展开'], ['type', '逐字显示'], ['box_close', '对话框收起'],
  ['zoom', '阶梯推近'], ['chest_shake', '宝箱抖动'], ['question', '疑问气泡'],
  ['lid_hops', '箱盖跳动'], ['chest_open', '宝箱打开'], ['cheer', '欢呼'],
  ['item_get', '获得水晶'], ['logo', '片名落下'], ['shine', '高光扫过'],
  ['subtitle', '副标题出现'], ['press_start', '开始提示'], ['rays_off', '光芒收束'],
  ['night_wave', '夜色推进'], ['flinch', '后缩蓄势'], ['end', '结束'],
];
const markers = labels.flatMap(([key, label]) => [].concat(cues[key]).map(t => ({ t, label })));
for (const [key, label] of [
  ['day', '白昼'], ['afternoon', '午后'], ['golden', '金色时刻'], ['sunset', '日落'],
  ['flash', '开箱闪光'], ['dusk', '暮色'], ['night', '夜色'],
]) markers.push({ t: cues.palette[key], label });
markers.sort((a, b) => a.t - b.t);

const tl = MK.timeline({ duration, fps, markers, render(t) { return window.renderAt(t); } });
const audioBytes = await (await fetch('audio/film.m4a')).arrayBuffer();
const media = new Audio(URL.createObjectURL(new Blob([audioBytes], { type: 'audio/mp4' })));
media.preload = 'auto';
media.muted = true;
await new Promise((resolve, reject) => {
  media.addEventListener('loadedmetadata', resolve, { once: true });
  media.addEventListener('error', () => reject(media.error), { once: true });
});
let soundEnabled = false, soundState = 'off', audioRevision = 0, bar = null;
const post = message => { if (parent !== window) parent.postMessage(message, location.origin); };
function soundStatus() {
  if (bar) {
    bar.dataset.sound = soundState;
    const button = bar.querySelector('[data-act="sound"]');
    button.setAttribute('aria-pressed', String(soundEnabled));
    button.setAttribute('aria-label', soundState === 'off' ? '开启声音' : soundState === 'blocked' ? '声音已开启，点击画面以启用' : '关闭声音');
  }
  post({ type: 'motion:sound', on: soundEnabled, state: soundState });
}
async function syncAudio() {
  const revision = ++audioRevision;
  media.currentTime = tl.time;
  media.playbackRate = tl.rate;
  if (!soundEnabled || !tl.playing) {
    media.pause();
    soundStatus();
    return;
  }
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
  soundEnabled = !!on && !params.render;
  media.muted = !soundEnabled;
  soundState = soundEnabled ? 'on' : 'off';
  await syncAudio();
  soundStatus();
}
for (const event of ['play', 'pause', 'seek', 'rate', 'end']) tl.on(event, () => { void syncAudio(); });
tl.on(t => {
  if (soundEnabled && tl.playing && !media.paused && Math.abs(media.currentTime - t) > 0.08) media.currentTime = t;
});
for (const event of ['pointerdown', 'keydown']) {
  addEventListener(event, () => { if (soundState === 'blocked') void setSound(true); }, true);
}
addEventListener('message', event => {
  if (event.source !== parent) return;
  const message = event.data;
  if (message?.type === 'motion:sound') {
    event.stopImmediatePropagation();
    void setSound(message.on);
  } else if (message?.type === 'motion:query') {
    event.stopImmediatePropagation();
    post({ type: 'motion:ready', duration, markers, orients: ['landscape'], orient: 'landscape', sound: true, title: document.title, kit: tl.kit });
    post({ type: 'motion:loading', progress: 1 });
    soundStatus();
  }
}, true);
Object.defineProperties(tl, {
  soundEnabled: { get: () => soundEnabled },
  soundState: { get: () => soundState },
});
MK.expose(tl, { sound: true, title: document.title, bpm: cues.bpm });
bar = MK.controls(tl, { sound: { toggle() { void setSound(!soundEnabled); } }, accent: '#4FB0FF', orient: false });
if (bar) {
  const label = document.createElement('label');
  label.textContent = '速度 ';
  label.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:13px;white-space:nowrap';
  const speed = document.createElement('select');
  speed.setAttribute('aria-label', '播放速度');
  speed.style.cssText = 'font:inherit;background:#20222a;color:inherit;border:0;border-radius:4px;padding:4px';
  for (const value of [0.5, 0.75, 1, 1.25, 1.5, 2]) {
    const option = new Option(`${value} 倍`, String(value), false, value === 1);
    speed.add(option);
  }
  speed.onchange = () => tl.setRate(Number(speed.value));
  tl.on('rate', value => { speed.value = String(value); });
  label.appendChild(speed);
  bar.appendChild(label);
}
reduced.addEventListener('change', event => { if (event.matches) tl.pause(); });
addEventListener('motion:ready', soundStatus);
await MK.start(tl, { t: 0, reduced: 9.5 });
soundStatus();
