import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';

const spawn = childProcess.spawn;
childProcess.spawn = function (executable, args, options) {
  if (/[/\\](?:msedge|chrome)\.exe$/i.test(executable) && args.includes('--headless=new')) {
    args = [...args.filter(a => a !== '--hide-scrollbars'), '--no-proxy-server'];
  }
  return spawn.call(this, executable, args, options);
};
syncBuiltinESMExports();
export const { launch } = await import('../../../../scripts/lib/cdp.mjs');

export async function goto(page, url) {
  const current = await page.eval('location.href');
  if (current.split('#')[0] === url.split('#')[0] && current !== url) {
    await page.send('Page.navigate', { url });
    await page.eval('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
  } else await page.goto(url);
}

export async function click(page, selector) {
  const point = await page.eval(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el || !el.checkVisibility()) throw new Error('Invisible control: ' + ${JSON.stringify(selector)});
    const r = el.getBoundingClientRect();
    const x = r.x + r.width / 2, y = r.y + r.height / 2;
    if (!el.contains(document.elementFromPoint(x, y))) throw new Error('Control is covered: ' + ${JSON.stringify(selector)});
    return { x, y };
  })()`);
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  await page.eval('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
}
