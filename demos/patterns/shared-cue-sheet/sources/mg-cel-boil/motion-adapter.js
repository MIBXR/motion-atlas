const MK = window.MotionKit;
while (window.__ready !== true) await new Promise(requestAnimationFrame);

const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';
document.head.appendChild(viewport);

const { width = 1920, height = 1080, fps = 30, duration = 10 } = window.DEMO || {};
const root = document.getElementById('c');
root.style.background = getComputedStyle(document.body).backgroundColor;
MK.stage({ root, orients: ['landscape'], sizes: { landscape: [width, height] }, background: '#000' });

const cues = await (await fetch('./cues.json')).json();
const labels = {
  "anticip": "动作预备",
  "strike_start": "火柴划动",
  "strike_scrape": "摩擦火花",
  "ignite": "点火闪光",
  "match_land": "火柴落定",
  "eyes_open": "眼睛睁开",
  "blink": "角色眨眼",
  "look_left": "向左看",
  "look_right": "向右看",
  "crouch": "蹲下预备",
  "jump": "火苗起跳",
  "land": "火苗落地",
  "hops": "舞步落点",
  "twirl": "转身跳跃",
  "shimmy": "摆动肩膀",
  "tada": "亮相定格",
  "sparkles": "亮相闪光",
  "bounce": "聚力下蹲",
  "spin_start": "旋转蓄力",
  "squash": "压缩蓄力",
  "burst": "爆炸开始",
  "impact_frames": "冲击画格",
  "box_blown": "道具吹飞",
  "strokes": "火花写字",
  "title_settle": "标题落定",
  "letters": "英文入场",
  "tagline": "标语擦入",
  "spirit_pop": "火苗重生",
  "wink": "火苗眨眼",
  "end": "影片结束",
  "burst_debris": "爆炸碎片",
  "pullback": "镜头拉回",
  "loop": "红笔圈注",
  "riffle": "纸页翻阅",
  "arrow": "箭头画出"
};
const markers = Object.entries(labels).flatMap(([key, label]) => {
  const times = Array.isArray(cues[key]) ? cues[key] : [cues[key]];
  return times.map((t, i) => ({ t, label: label + (times.length > 1 ? i + 1 : '') }));
}).sort((a, b) => a.t - b.t);

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
bar = MK.controls(tl, { sound: { toggle: () => setSound(!soundEnabled) }, accent: '#F5B730', orient: false });
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
