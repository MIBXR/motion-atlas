const MK = window.MotionKit;
const config = window.PATTERN_CONFIG;
const stage = document.getElementById('stage');
const cue = document.getElementById('cue');
document.title = config.title;
MK.stage({ root: stage, orients: config.orients || ['landscape'], background: '#000' });

let offset = 0;
const segments = config.segments.map(segment => {
  const start = offset;
  offset += segment.to - segment.from;
  return { ...segment, start, end: offset };
});
const records = new Map();
for (const segment of segments) {
  if (records.has(segment.source)) continue;
  const frame = document.createElement('iframe');
  frame.title = segment.label;
  frame.allow = 'autoplay';
  frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
  stage.insertBefore(frame, cue);
  const loaded = new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
  frame.src = segment.source + '?embed=1&render=1';
  records.set(segment.source, { frame, loaded, segment, media: null });
}

const prepared = Promise.all([...records.values()].map(async record => {
  await record.loaded;
  record.window = record.frame.contentWindow;
  while (!record.window.__motion) await new Promise(requestAnimationFrame);
  await record.window.__motion.ready;
  record.window.__motion.pause();
  record.window.MotionKit.audio.disable();
  if (!record.segment.legacy) {
    const bytes = await (await fetch(record.segment.audio)).arrayBuffer();
    const media = new Audio();
    record.media = media;
    media.preload = 'auto';
    media.muted = true;
    const metadata = new Promise((resolve, reject) => {
      media.addEventListener('loadedmetadata', resolve, { once: true });
      media.addEventListener('error', () => reject(media.error), { once: true });
    });
    media.src = URL.createObjectURL(new Blob([bytes], { type: 'audio/mp4' }));
    await metadata;
  }
  await new Promise(requestAnimationFrame);
}));
MK.preload([{ label: '原作画面与同段音轨', run: () => prepared }], { timeout: 120000 });

function mapped(time) {
  const segment = segments.find(item => time < item.end - 0.000001) || segments[segments.length - 1];
  return { segment, sourceTime: segment.from + Math.min(segment.to - segment.from, Math.max(0, time - segment.start)) };
}

let soundEnabled = false, soundState = 'off', audioRevision = 0, activeSource = null, bar;
const rendering = MK.params().render;
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

const timeline = MK.timeline({
  duration: offset, fps: 30,
  markers: config.markers,
  async render(time) {
    await prepared;
    const { segment, sourceTime } = mapped(time);
    const record = records.get(segment.source);
    for (const [source, item] of records) item.frame.style.visibility = source === segment.source ? 'visible' : 'hidden';
    if (activeSource !== segment.source) {
      activeSource = segment.source;
      void syncAudio();
    }
    if (config.cueOverlay) {
      const current = segment.cues.filter(item => item.t <= sourceTime + 0.000001).at(-1);
      cue.hidden = false;
      cue.textContent = segment.label + ' · ' + (current ? current.label : '片段开始');
    }
    if (record.media && soundEnabled && timeline.playing && !record.media.paused && !record.media.seeking && Math.abs(record.media.currentTime - sourceTime) > 0.08) record.media.currentTime = sourceTime;
    if (segment.legacy) return record.window.__motion.seek(sourceTime);
    return record.window.renderAt(sourceTime);
  },
});

async function syncAudio() {
  const revision = ++audioRevision;
  await prepared;
  if (revision !== audioRevision) return;
  const { segment, sourceTime } = mapped(timeline.time);
  const selected = records.get(segment.source);
  for (const record of records.values()) {
    if (record.segment.legacy) {
      if (record !== selected || !soundEnabled || !timeline.playing) {
        record.window.__motion.pause();
        record.window.MotionKit.audio.disable();
      }
    } else if (record !== selected || !soundEnabled || !timeline.playing) {
      record.media.pause();
      record.media.muted = true;
    }
  }
  if (segment.legacy) {
    const original = selected.window.__motion;
    original.setRate(timeline.rate);
    await original.seek(sourceTime);
    if (soundEnabled && timeline.playing) {
      selected.window.MotionKit.audio.enable();
      original.play();
      soundState = selected.window.MotionKit.audio.state;
    }
  } else {
    const media = selected.media;
    media.currentTime = sourceTime;
    media.playbackRate = timeline.rate;
    media.muted = !soundEnabled;
    if (soundEnabled && timeline.playing) {
      try {
        await media.play();
        if (revision !== audioRevision) return;
        soundState = 'on';
      } catch (error) {
        if (revision !== audioRevision || error.name === 'AbortError') return;
        if (error.name !== 'NotAllowedError') throw error;
        soundState = 'blocked';
      }
    }
  }
  soundStatus();
}
async function setSound(on) {
  soundEnabled = !!on && !rendering;
  soundState = soundEnabled ? 'on' : 'off';
  await syncAudio();
  soundStatus();
}
for (const event of ['play', 'pause', 'seek', 'rate', 'end']) timeline.on(event, () => void syncAudio());
for (const type of ['pointerdown', 'keydown']) addEventListener(type, () => {
  if (soundState === 'blocked') void setSound(true);
}, true);
addEventListener('message', event => {
  if (event.source !== parent) return;
  if (event.data?.type === 'motion:sound') {
    event.stopImmediatePropagation();
    void setSound(event.data.on);
  } else if (event.data?.type === 'motion:query') queueMicrotask(soundStatus);
}, true);
Object.defineProperties(timeline, {
  soundEnabled: { get: () => soundEnabled },
  soundState: { get: () => soundState },
});
MK.expose(timeline, { title: config.title, sound: true });
bar = MK.controls(timeline, { sound: { toggle: () => setSound(!soundEnabled) } });
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { if (event.matches) timeline.pause(); });
await MK.start(timeline, { t: 0, reduced: config.reduced });
soundStatus();
