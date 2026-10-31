import { P, K, setCtx, outlined } from './toon.js';
import { drawDot, drawTick } from './chars.js';
const Q = new URLSearchParams(location.search);
const cv = document.getElementById('c'), g = cv.getContext('2d');
setCtx(g);
await Promise.all(['80px Titan', '40px Lilita', '40px VT', '40px Arch', '40px Gochi', '400 40px Silk', '700 40px Silk', '400 40px Inter', '700 40px Inter', '900 40px Inter'].map(f => document.fonts.load(f)));
const mods = {};
const film = await import('./film.js');
const lines = await (await fetch('lines.json')).json();
const durs = await (await fetch('voices/dur.json')).json();
film.setLines(lines, durs);
window.EV = film.events(); window.SUBS = film.subs(); window.SRT = film.srtCues();
window.render = async t => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  film.renderFilm(g, t, Q);
  if (Q.has('poster')) posterOverlay(g);
};
function posterOverlay(g) {
  g.save(); g.fillStyle = 'rgba(20,6,50,.35)'; g.fillRect(0, 0, 1920, 180);
  outlined(g, 'FIVE-SECOND ASTRONAUT', 960, 120, { font: '96px Titan', lw: 14, fill: P.gold, shadow: P.mag, sd: [6, 10] });
  g.restore();
}
window.DUR = film.DUR;
window.READY = true;
