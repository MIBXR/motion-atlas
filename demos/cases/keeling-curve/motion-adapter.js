import { DUR, FPS, SHOTS, EVENTS } from './timeline.js';

const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';
document.head.appendChild(viewport);

const originalURL = location.href;
const params = new URLSearchParams(location.search);
const embedded = params.has('embed');
const rendering = params.has('render');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const setupURL = new URL(location.href);
setupURL.searchParams.set('w', '1920');
setupURL.searchParams.set('h', '1080');
setupURL.searchParams.set('preview', '1');
setupURL.searchParams.delete('render');
history.replaceState(null, '', setupURL);

await import('./scene.js');
await import('./preview.js');
const preview = await window.__showreelPreviewLoading;
history.replaceState(null, '', originalURL);
if (preview.error) throw preview.error;

preview.pause();
preview.audio.muted = true;
const media = new Audio(preview.audio.src);
media.preload = 'auto';
media.muted = true;
let time = 0, rate = 1, playing = false, frameRequest = 0;
let originTime = time, originNow = performance.now(), audioRevision = 0;
let soundEnabled = false;
let soundState = 'off';
const listeners = new Set();
const events = new Map();
const labels = ['开场与早期锯齿', '续画到 2025', '推近', '2025 高亮', '拉远', '落版'];
const markers = [
  ...SHOTS.map((shot, i) => ({ t: shot.t0, label: labels[i] })),
  { t: EVENTS.firstStroke, label: '音效① · 第一笔' },
  { t: EVENTS.peak, label: '音效② · 峰值高亮' },
  { t: EVENTS.source, label: '音效③ · 来源落定' },
].sort((a, b) => a.t - b.t);
const post = message => { if (parent !== window) parent.postMessage(message, location.origin); };
const emit = (name, ...args) => events.get(name)?.forEach(fn => fn(...args));
const shadow = preview.host.shadowRoot;
const button = shadow.getElementById('play');
const seekInput = shadow.getElementById('seek');
const speedInput = shadow.getElementById('speed');
const clock = shadow.getElementById('clock');
const status = shadow.getElementById('status');
const clampTime = value => Math.max(0, Math.min(DUR, Number(value) || 0));
const clockTime = now => clampTime(originTime + (now - originNow) / 1000 * rate);
const playbackTime = now => soundEnabled && soundState === 'on' && !media.paused && media.readyState >= 2
  ? clampTime(media.currentTime) : clockTime(now);
const soundButton = document.createElement('button');
soundButton.type = 'button';
shadow.querySelector('.bar').appendChild(soundButton);

function soundStatus() {
  soundButton.textContent = soundEnabled ? '声音开' : '声音关';
  soundButton.setAttribute('aria-pressed', String(soundEnabled));
  soundButton.setAttribute('aria-label', soundEnabled ? '关闭声音' : '开启声音');
  status.textContent = soundState === 'blocked'
    ? '声音已开启，点击画面以启用。'
    : '最终混音 · ← / →：逐帧 · 速度仅影响预览';
  post({ type: 'motion:sound', on: soundEnabled, state: soundState });
}
async function setSound(on) {
  soundEnabled = on && !rendering;
  media.muted = !soundEnabled;
  soundState = soundEnabled ? 'on' : 'off';
  await syncAudio();
  soundStatus();
}
async function syncAudio() {
  const revision = ++audioRevision;
  media.currentTime = time;
  media.playbackRate = rate;
  if (!soundEnabled || !playing) { media.pause(); return; }
  try {
    await media.play();
    if (revision !== audioRevision) return;
    soundState = 'on';
  }
  catch (error) {
    if (revision !== audioRevision || error.name === 'AbortError') return;
    if (error.name !== 'NotAllowedError') throw error;
    soundState = 'blocked';
  }
  soundStatus();
}
soundButton.onclick = () => setSound(!soundEnabled);
for (const type of ['pointerdown', 'keydown']) {
  addEventListener(type, () => { if (soundState === 'blocked') void setSound(true); }, true);
}
const arrow = d => `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
for (const [id, label, path] of [
  ['back', '上一帧', 'M15 5l-7 7 7 7'],
  ['next', '下一帧', 'M9 5l7 7-7 7'],
]) {
  const el = shadow.getElementById(id);
  el.innerHTML = arrow(path);
  el.title = label;
  el.setAttribute('aria-label', label);
}
shadow.querySelector('.bar').setAttribute('aria-label', '短片预览');
seekInput.setAttribute('aria-label', '播放时间');
speedInput.setAttribute('aria-label', '播放速度');
shadow.querySelector('label').firstChild.textContent = '速度 ';
function update() {
  const label = playing ? '暂停' : '播放';
  if (button.textContent !== label) button.textContent = label;
  button.setAttribute('aria-label', label);
  seekInput.value = String(time);
  speedInput.value = String(rate);
  clock.value = `${time.toFixed(2)} / ${DUR.toFixed(2)} 秒`;
  listeners.forEach(fn => fn(time, playing));
}
function tick(now) {
  if (!playing) return;
  time = playbackTime(now);
  originTime = time;
  originNow = now;
  window.render(time);
  update();
  if (time >= DUR) { motion.pause(); emit('end', time); }
  else frameRequest = requestAnimationFrame(tick);
}

if (embedded || rendering) {
  preview.host.style.display = 'none';
  document.getElementById('showreel-preview-fit').remove();
  document.body.removeAttribute('data-showreel-preview-stage');
  const canvas = document.getElementById('c');
  const fit = () => {
    const scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    canvas.style.transformOrigin = '0 0';
    canvas.style.transform = `translate(${(innerWidth - 1920 * scale) / 2}px, ${(innerHeight - 1080 * scale) / 2}px) scale(${scale})`;
  };
  fit();
  addEventListener('resize', fit);
}

const motion = {
  duration: DUR, markers, fps: FPS, orients: ['landscape'], orient: 'landscape', sound: true,
  get time() { return time; },
  get playing() { return playing; },
  get rate() { return rate; },
  get soundEnabled() { return soundEnabled; },
  get soundState() { return soundState; },
  async seek(t) {
    const from = time;
    time = clampTime(Number(Number(t).toFixed(6)));
    originTime = time;
    originNow = performance.now();
    emit('seek', time, from);
    await window.render(time);
    update();
    await syncAudio();
    return time;
  },
  async play() {
    if (playing) return;
    if (time >= DUR) await motion.seek(0);
    playing = true;
    originTime = time;
    originNow = performance.now();
    emit('play', time);
    update();
    frameRequest = requestAnimationFrame(tick);
    await syncAudio();
  },
  pause() {
    const wasPlaying = playing;
    if (playing) time = playbackTime(performance.now());
    playing = false;
    cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    ++audioRevision;
    media.pause();
    window.render(time);
    if (wasPlaying) emit('pause', time);
    update();
  },
  toggle() { return playing ? motion.pause() : motion.play(); },
  setRate(value) {
    const next = Number(value);
    if (![0.5, 0.75, 1, 1.25, 1.5, 2].includes(next)) return;
    if (playing) time = playbackTime(performance.now());
    rate = next;
    originTime = time;
    originNow = performance.now();
    media.playbackRate = rate;
    emit('rate', rate);
    window.render(time);
    update();
    void syncAudio();
  },
  setOrient(orient) {
    post({ type: 'motion:orient', orient: 'landscape', supported: ['landscape'], ...(orient === 'landscape' ? {} : { rejected: orient }) });
    return Promise.resolve(orient === 'landscape');
  },
  on(name, fn) {
    const set = typeof name === 'function' ? listeners : events.get(name) || new Set();
    if (typeof name !== 'function') events.set(name, set);
    const listener = typeof name === 'function' ? name : fn;
    set.add(listener);
    return () => set.delete(listener);
  },
};
const step = direction => { motion.pause(); return motion.seek(time + direction / FPS); };
button.onclick = () => motion.toggle();
shadow.getElementById('back').onclick = () => step(-1);
shadow.getElementById('next').onclick = () => step(1);
seekInput.oninput = () => motion.seek(seekInput.value);
speedInput.onchange = () => motion.setRate(speedInput.value);
addEventListener('keydown', event => {
  if (!['Space', 'ArrowLeft', 'ArrowRight'].includes(event.code)) return;
  const target = event.composedPath()[0];
  if (target?.matches?.('input,select,textarea,[contenteditable]')) return;
  if (event.code === 'Space' && target?.matches?.('button')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.code === 'Space') void motion.toggle();
  else void step(event.code === 'ArrowRight' ? 1 : -1);
}, true);
const readyMessage = () => ({ type: 'motion:ready', duration: DUR, markers, orients: ['landscape'], orient: 'landscape', sound: true, title: document.title });
addEventListener('message', event => {
  if (event.source !== parent) return;
  const message = event.data;
  if (!message) return;
  if (['motion:sound', 'motion:query', 'motion:orient'].includes(message.type)) event.stopImmediatePropagation();
  if (message.type === 'motion:sound') void setSound(!!message.on);
  else if (message.type === 'motion:query') {
    post(readyMessage());
    post({ type: 'motion:loading', progress: 1 });
    soundStatus();
  } else if (message.type === 'motion:orient') void motion.setOrient(message.orient);
  else if (message.type === 'motion:play') void motion.play();
  else if (message.type === 'motion:pause') motion.pause();
  else if (message.type === 'motion:seek') void motion.seek(message.t);
}, true);
window.__motion = motion;
await motion.seek(params.has('t') ? Number(params.get('t')) : reduced.matches ? 18.5 : 0);
motion.ready = Promise.resolve();
document.documentElement.dataset.motionReady = '1';
post(readyMessage());
post({ type: 'motion:loading', progress: 1 });
soundStatus();
reduced.addEventListener('change', event => { if (event.matches) motion.pause(); });
if (!rendering && !reduced.matches && params.get('autoplay') !== '0') await motion.play();
