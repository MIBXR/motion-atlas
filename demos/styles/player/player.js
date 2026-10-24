const MK = MotionKit;
const stage = MK.stage({ orients: ['landscape'] });
const slug = new URLSearchParams(location.search).get('style') || '';
const error = document.getElementById('player-error');
const statuses = await fetch('../../../scripts/lemo-status.json').then(r => r.json());
if (!Object.hasOwn(statuses, slug) || statuses[slug].status !== 'ready') {
  error.textContent = `未知或不可运行的样片：${slug}`;
  error.hidden = false;
} else {
  const dir = `../../../resources/lemo-opuscar/styles/${slug}`;
  const meta = await fetch(`${dir}/style.json`).then(r => r.json());
  document.title = `${meta.cn} · ${meta.en}`;
  const frame = document.createElement('iframe');
  frame.title = document.title;
  frame.width = 1920; frame.height = 1080;
  frame.src = `${dir}/demo/index.html`;
  stage.root.appendChild(frame);
  let frameReady = false, frameLoaded, pending = null, running = null;
  async function loadFrame() {
    const start = performance.now();
    while (frame.contentWindow.READY !== true) {
      if (performance.now() - start >= 180000) {
        error.textContent = '样片未能在 180 秒内就绪';
        error.hidden = false;
        throw new Error(error.textContent);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const dur = frame.contentWindow.DUR;
    tl.duration = typeof dur === 'number' && dur > 0 ? dur : meta.dur;
    if (!(typeof dur === 'number' && dur > 0)) console.warn('DUR fallback', slug);
    frameReady = true;
  }
  const loaded = MK.preload([
    { label: `载入样片 ${meta.cn}`, run: () => frameLoaded = loadFrame() },
    { label: `${slug}.ogg`, run: async () => {
      const response = await fetch(`../../../resources/lemo-opuscar/audio/${slug}.ogg`);
      if (response.status === 404) return;
      if (!response.ok) throw new Error(`Film audio ${response.status}`);
      const audioBuffer = await new OfflineAudioContext(2, 1, 48000).decodeAudioData(await response.arrayBuffer());
      await frameLoaded;
      MK.audio.attach(tl, [{ t: 0, dur: tl.duration, resume: true, bus: 'music', voice: (ctx, out, when, p) => {
        MK.audio.dsp.sample(ctx, out, when, audioBuffer, { offset: p.offset || 0 });
        return when + audioBuffer.duration - (p.offset || 0);
      } }]);
    } },
  ], { timeout: 180000 });
  function render(t) {
    pending = t;
    if (!running) running = (async () => {
      await loaded;
      while (pending !== null) {
        const at = pending;
        pending = null;
        if (frameReady) await frame.contentWindow.render(at);
      }
    })().finally(() => { running = null; });
    return running;
  }
  const tl = MK.timeline({ duration: meta.dur, render });
  MK.expose(tl, { title: document.title });
  MK.start(tl, { autoplay: !MK.params().embed });
}
