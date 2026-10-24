function createOperator(host) {
  const svg = (content, size = 48, view = '0 0 48 48') => `<svg width="${size}" height="${size}" viewBox="${view}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
  const shapes = [
    '<path d="M11 35 34 12m-20 2 21 21M25 9l14 14M9 25l14 14"/><path d="m29 10 9 9-7 1-3-3z"/>',
    '<path d="M24 39S7 29 7 18c0-11 13-12 17-3 4-9 17-8 17 3 0 11-17 21-17 21Z"/><path d="M12 24h7l3-8 5 16 4-8h5"/>',
    '<path d="m24 6 15 6v12c0 10-15 18-15 18S9 34 9 24V12Z"/><path d="M24 14v18m-9-9h18"/>',
    '<path d="m25 4-13 23h11l-1 17 14-25H25Z"/>',
  ];
  const skillShapes = [
    '<path d="m30 7-17 20h12l-7 14 18-21H24Z"/>',
    '<circle cx="24" cy="24" r="8"/><path d="m24 5 5 9 10 1-4 9 4 9-10 1-5 9-5-9-10-1 4-9-4-9 10-1Z"/>',
    '<path d="m24 7 17 28H7Z"/><circle cx="24" cy="26" r="6"/><path d="M24 7v9m17 19-9-5M7 35l9-5"/>',
    '<path d="M9 24c0-8 7-15 15-15m15 15c0 8-7 15-15 15"/><path d="m17 5 7 4-6 6m13 28-7-4 6-6"/><circle cx="24" cy="24" r="7"/>',
  ];
  const star = svg('<path d="m24 5 5.8 11.7 12.9 1.9-9.4 9.1 2.2 12.9L24 34.5l-11.5 6.1 2.2-12.9-9.4-9.1 12.9-1.9Z" fill="currentColor" stroke="none"/>', 21);
  const silhouette = (background = false) => `<svg class="${background ? 'op-shadow-person' : 'op-person'}" viewBox="0 0 520 820" aria-hidden="true" fill="currentColor">
    <path d="M225 18c-27 9-42 29-45 62l-3 58 38 35 73-1 39-40-2-52c-3-37-19-57-51-63Z"/>
    <g class="op-hair"><path d="m182 71-29 77 27-13-7 49 37-51 4-49Zm135 1 34 77-28-16 9 54-40-55-4-48Z"/></g>
    <path d="m227 144-7 34-57 24-36 91-25 122 28 8 44-109 35-63 100 1 37 68 39 96 30-9-29-117-38-87-57-25-8-34Z"/>
    <path d="m109 405-11 22-14 9-12 27 13-7 8-15 2 24 8 3 7-25 11-18 10-13Zm272-1 11 19 17 11 15 28-13-5-10-15-2 24-8 2-8-25-13-17Z"/>
    <path d="m210 236-14 143 19 137h92l18-136-16-144Z"/>
    <g class="op-coat-tail"><path d="m190 320-37 89-34 202 91-36 47-174 39 174 93 37-36-203-36-89-16 53-44 23-48-24Z"/></g>
    <path d="m217 493 1 155-13 125 41 4 17-128 7-113 6 112 10 129 43-4-7-127-15-153Z"/>
    <path d="m205 760-6 37-25 13v10h78l-3-59Zm79 0-1 60h75v-10l-28-13-4-36Z"/>
    <path class="op-silhouette-detail" d="m224 185 35 27 34-27m-34 29-3 181m-45 10-22 129m116-129 26 131M224 637h21m43 0h26" fill="none" stroke-width="3"/>
  </svg>`;
  const avatar = (i) => `<div class="op-avatar${i === 0 ? ' selected' : ''}" style="--avatar-bg:${['#a8afb1', '#c8b4a5', '#aabbb9', '#b9b7c7', '#c5c2ac', '#a6b9c9'][i]}">${svg(`<path d="M15 20c0-16 18-19 19-2l-2 9-15 1Z" fill="currentColor" stroke="none"/><path d="m17 28-9 8-3 12h40l-5-12-9-8Z" fill="currentColor" stroke="none"/>`, 48)}</div>`;
  const labels = ['攻击', '生命', '防御', '源石技艺'];
  const root = document.createElement('section');
  root.className = 'operator-scene'; root.id = 'operator-scene';
  root.innerHTML = `
    <div class="op-paper"></div>${silhouette(true)}
    <svg class="op-floor" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true"><path d="M370 990C635 875 1155 860 1500 1000" fill="none" stroke="#c8cacb" stroke-width="1"/></svg>
    <div class="op-section-label"><span>//</span> 干员</div>
    <div class="op-avatar-tabs">${Array.from({ length: 6 }, (_, i) => avatar(i)).join('')}</div>
    <button class="op-close" aria-label="关闭干员界面">${svg('<path d="m12 12 24 24m0-24L12 36"/>', 32)}</button>
    ${silhouette()}
    <svg class="op-yellow-band" viewBox="0 0 1920 1080" preserveAspectRatio="none" aria-hidden="true"><polygon class="op-band-landscape" points="1440,0 1920,0 1920,1080 1640,1080" fill="var(--yellow)"/><polygon class="op-band-portrait" points="720,0 1080,0 1080,1220 900,1220" fill="var(--yellow)"/></svg>
    <div class="op-outline-word"><svg class="op-outline-ink" aria-hidden="true"><text class="op-outline-text" x="0" y="0">ENDFIELD</text></svg></div>
    <div class="op-band-shine"></div>
    <div class="op-level">
      <div class="op-level-roll"><div class="op-level-old">20</div><div class="op-level-new">21</div></div>
      <div class="op-level-caption">LEVEL/40</div>
      <div class="op-experience"><div></div></div>
      <button class="op-upgrade" aria-label="等级提升"><span>等级提升</span>${svg('<path d="m18 11 13 13-13 13"/>', 28)}</button>
    </div>
    <div class="op-info">
      <div class="op-name">管理员</div><div class="op-stars">${star.repeat(6)}</div>
      <div class="op-attributes">${labels.map((s, i) => `<div class="op-stat">${svg(shapes[i], 36)}<div class="op-stat-label">${s}</div><div class="op-stat-value" data-stat="${i}"><span class="op-stat-old">${[342, 2341, 326, 35][i]}</span><span class="op-stat-new"></span></div></div>`).join('')}</div>
      <div class="op-skills">${skillShapes.map((s, i) => `<div class="op-skill">${svg(s, 40)}<svg class="op-skill-ring" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="34" pathLength="100" fill="none" stroke="var(--yellow)" stroke-width="2" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-90 36 36)"/></svg></div>`).join('')}</div>
      <div class="op-info-buttons"><button>查看详情</button><button>装备</button></div>
    </div>
    <div class="op-level-toast">等级提升　<span>20</span><svg width="38" height="22" viewBox="0 0 38 22" aria-hidden="true"><path d="M2 11h31M24 2l10 9-10 9" fill="none" stroke="currentColor" stroke-width="2"/></svg><strong>21</strong></div>`;
  host.append(root);
  const oldLevel = root.querySelector('.op-level-old');
  const newLevel = root.querySelector('.op-level-new');
  const exp = root.querySelector('.op-experience > div');
  const toast = root.querySelector('.op-level-toast');
  const shine = root.querySelector('.op-band-shine');
  const band = root.querySelector('.op-yellow-band');
  const person = root.querySelector('.op-person');
  const outline = root.querySelector('.op-outline-text');
  const textContext = document.createElement('canvas').getContext('2d');
  const upgrade = root.querySelector('.op-upgrade');
  const statEls = Array.from(root.querySelectorAll('.op-stat-value'));
  const rings = Array.from(root.querySelectorAll('.op-skill-ring circle'));
  const tails = root.querySelectorAll('.op-coat-tail');
  const hair = root.querySelectorAll('.op-hair');
  function render(t, p) {
    band.setAttribute('viewBox', p ? '0 0 1080 1920' : '0 0 1920 1080');
    person.setAttribute('viewBox', p ? '72 17 352 803' : '0 0 520 820');
    textContext.font = `700 ${p ? 150 : 160}px "Barlow Semi Condensed"`;
    textContext.letterSpacing = p ? '3px' : '3.2px';
    const ink = textContext.measureText('ENDFIELD');
    const textX = (ink.actualBoundingBoxRight - ink.actualBoundingBoxLeft) / 2;
    const textY = (ink.actualBoundingBoxDescent - ink.actualBoundingBoxAscent) / 2;
    outline.setAttribute('transform', `translate(60 ${p ? 340 : 460}) rotate(-90) translate(${-textX} ${-textY})`);
    const roll = seg(t, 40.4, .4, E.outBack);
    const height = p ? 210 : 242;
    oldLevel.style.transform = `translateY(${-roll * height}px)`;
    newLevel.style.transform = `translateY(${(1 - roll) * height}px)`;
    const values = [342, 2341, 326, 35];
    const ends = [358, 2420, 335, 35];
    const statProgress = seg(t, 40.8, 1.2, E.outCubic);
    statEls.forEach((el, i) => {
      const value = lerp(values[i], ends[i], statProgress);
      const integer = Math.floor(value), fraction = value - integer, row = p ? 96 : 64;
      el.children[0].textContent = integer;
      el.children[1].textContent = integer + 1;
      el.children[0].style.transform = `translateY(${-fraction * row}px)`;
      el.children[1].style.transform = `translateY(${(1 - fraction) * row}px)`;
    });
    let experience = .7 + .3 * seg(t, 39.6, .8, E.inOutCubic);
    if (t >= 40.8) experience = .12 * seg(t, 40.8, 1.2, E.outCubic);
    exp.style.width = `${experience * 100}%`;
    const press = t >= 39.4 && t < 39.52;
    upgrade.style.background = press ? 'var(--yellow-deep)' : 'var(--yellow)';
    upgrade.style.transform = `translateY(${press ? 2 : 0}px)`;
    const toastOpacity = seg(t, 41, .2, E.outCubic) * (1 - seg(t, 42.4, .2, E.inOutCubic));
    toast.style.opacity = toastOpacity;
    toast.style.transform = `translate(-50%, calc(-50% + ${lerp(-16, 0, seg(t, 41, .2, E.outCubic))}px))`;
    const shineP = seg(t, 40.4, .4, E.outCubic);
    shine.style.opacity = t >= 40.4 && t < 40.8 ? Math.sin(shineP * Math.PI) : 0;
    shine.style.top = `${lerp(-180, p ? 1220 : 1080, shineP)}px`;
    rings.forEach((ring, i) => { ring.style.strokeDashoffset = 100 * (1 - seg(t, 43 + i * .4, .6, E.outCubic)); });
    const sway = Math.sin((t - 36) * Math.PI / 2) * 2;
    tails.forEach((el) => { el.setAttribute('transform', `rotate(${sway} 260 380)`); });
    hair.forEach((el) => { el.setAttribute('transform', `rotate(${-sway} 260 90)`); });
  }
  function targets(p) { return { upgrade: p ? { x: 870, y: 1120 } : { x: 1630, y: 600 } }; }
  return { root, render, targets };
}
