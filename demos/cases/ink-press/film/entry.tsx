import { Thumbnail } from '@remotion/player';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ThemedFilm } from './src/themes/ThemedFilm';
import { AIFL_TOTAL } from './src/aifl/Main';

export function mountInk(el: HTMLElement) {
  window.remotion_staticBase = new URL('../assets', import.meta.url).pathname.replace(/\/$/, '');
  if (new URLSearchParams(window.location.search).has('render')) {
    window.process = { env: { NODE_ENV: 'production' } };
    window.remotion_puppeteerTimeout = 30000;
  }
  const root = createRoot(el);

  async function renderAt(t: number) {
    const frame = Math.min(AIFL_TOTAL - 1, Math.max(0, Math.round(t * 30)));
    flushSync(() => root.render(
      <Thumbnail
        component={ThemedFilm}
        inputProps={{ theme: 'ink-press' }}
        compositionWidth={1920}
        compositionHeight={1080}
        durationInFrames={AIFL_TOTAL}
        fps={30}
        frameToDisplay={frame}
        style={{ width: 1920, height: 1080 }}
      />
    ));
    await Promise.all(Array.from(el.querySelectorAll('img'), img => img.decode()));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }

  return { renderAt, duration: AIFL_TOTAL / 30, width: 1920, height: 1080, fps: 30 };
}
