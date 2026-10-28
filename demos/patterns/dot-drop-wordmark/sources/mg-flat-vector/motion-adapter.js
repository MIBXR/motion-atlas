const MK = window.MotionKit;
while (window.__ready !== true) await new Promise(requestAnimationFrame);

const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';
document.head.appendChild(viewport);

const { width = 1920, height = 1080, fps = 30, duration = 10 } = window.DEMO || {};
const root = document.getElementById('S');
root.style.background = getComputedStyle(document.body).backgroundColor;
MK.stage({ root, orients: ['landscape'], sizes: { landscape: [width, height] }, background: '#000' });

const cues = await (await fetch('./cues.json')).json();
const labels = {
  impact1: '首次落地', impact2: '再次碰撞', antic: '弹射预备', launch: '圆点弹射',
  sunLand: '太阳落定', rays: '光芒展开', farRise: '远景升起', bldStart: '建筑入场',
  clouds: '云朵入场', birds: '飞鸟入场', trees: '树木入场', winStart: '窗户点亮',
  winEnd: '窗户齐备', heroWin: '主角窗口', camAntic: '推进预备', push: '镜头推进',
  glass: '穿过玻璃', arrive: '镜头到达', blink: '人物眨眼', ping: '手机提示',
  reactAntic: '反应预备', headSnap: '人物转头', exclaim: '惊叹出现', bubbleAntic: '气泡预备',
  wipe: '圆形擦除', wipe2: '胶囊擦除', wipe3: '半圆擦除', coreDot: '圆点回归',
  burst1: '柱图落点', burst2: '对勾落点', burst3: '爱心落点', burst4: '金币落点',
  collapseAntic: '汇合预备', merge: '图形汇合', logoWipe: '标志擦入', letters: '字母入场',
  dotLand2: '圆点落字', tagCN: '中文标语', tagEN: '英文标语', beatBob1: '首次律动',
  beatBob2: '再次律动', slam: '图形落定', dotRise: '圆点上升', dotApex: '圆点顶点',
  dotDrop: '圆点下落', cnFlip: '标语翻动', coreHit: '圆点撞击', matchStart: '匹配开始',
  matchEnd: '匹配结束',
};
const markers = [
  ...Object.entries(labels).map(([key, label]) => ({ t: cues.frames[key] / cues.fps, label })),
  { t: cues.build, label: '音乐构建' },
  { t: cues.drop, label: '音乐落点' },
  { t: cues.outro, label: '音乐尾声' },
].sort((a, b) => a.t - b.t);

const audioData = await (await fetch('./audio/film.m4a')).arrayBuffer();
const media = new Audio();
media.preload = 'auto';
media.muted = true;
const audioReady = new Promise((resolve, reject) => {
  media.addEventListener('loadedmetadata', resolve, { once: true });
  media.addEventListener('error', () => reject(media.error), { once: true });
});
media.src = URL.createObjectURL(new Blob([audioData], { type: 'audio/mp4' }));
await audioReady;
const rendering = MK.params().render;
let revision = 0;
let blocked = false;
const postSound = () => {
  const state = !MK.audio.enabled ? 'off' : blocked ? 'blocked' : MK.audio.state;
  const bar = document.querySelector('.mk-controls');
  if (bar) {
    bar.dataset.sound = state;
    const button = bar.querySelector('[data-act="sound"]');
    button.setAttribute('aria-pressed', String(MK.audio.enabled));
    button.setAttribute('aria-label', state === 'off' ? '开启声音' : state === 'blocked' ? '点击画面启用声音' : '关闭声音');
  }
  if (parent !== window) parent.postMessage({ type: 'motion:sound', on: MK.audio.enabled, state }, location.origin);
};
const tl = MK.timeline({
  duration, fps, markers,
  render(t) {
    if (MK.audio.enabled && tl.playing && Math.abs(media.currentTime - t) > 0.1) media.currentTime = t;
    return window.renderAt(t);
  },
});
async function syncAudio() {
  const current = ++revision;
  media.muted = !MK.audio.enabled || rendering;
  media.currentTime = tl.time;
  media.playbackRate = tl.rate;
  if (!MK.audio.enabled || !tl.playing || rendering) { media.pause(); postSound(); return; }
  try {
    await media.play();
    if (current !== revision) return;
    blocked = false;
  } catch (error) {
    if (current !== revision || error.name === 'AbortError') return;
    if (error.name !== 'NotAllowedError') throw error;
    blocked = true;
  }
  postSound();
}
for (const event of ['play', 'pause', 'seek', 'rate', 'end']) tl.on(event, () => void syncAudio());
MK.audio.on('change', () => void syncAudio());
for (const event of ['pointerdown', 'keydown']) addEventListener(event, () => {
  if (blocked && MK.audio.enabled) void syncAudio();
}, true);

MK.expose(tl, { sound: true });
Object.defineProperties(tl, {
  soundEnabled: { get: () => MK.audio.enabled },
  soundState: { get: () => !MK.audio.enabled ? 'off' : blocked ? 'blocked' : MK.audio.state },
});
const bar = MK.controls(tl, { sound: MK.audio, accent: '#FF5A4E', orient: false });
if (bar) {
  const speed = document.createElement('select');
  speed.setAttribute('aria-label', '播放速度');
  speed.style.cssText = 'font:12px sans-serif;color:inherit;background:#17171e;border:0;padding:5px;border-radius:8px';
  for (const rate of [0.5, 0.75, 1, 1.25, 1.5, 2]) {
    const option = document.createElement('option');
    option.value = rate;
    option.textContent = `${rate} 倍速`;
    option.selected = rate === 1;
    speed.appendChild(option);
  }
  speed.onchange = () => tl.setRate(Number(speed.value));
  bar.appendChild(speed);
  tl.on('rate', rate => { speed.value = rate; });
}
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
  if (event.matches) tl.pause();
});
await MK.start(tl, { t: 0, reduced: 9.5 });
postSound();
