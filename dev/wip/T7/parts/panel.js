function createPanel(host) {
  const root = document.createElement('section');
  root.id = 'machine-panel';
  attribute(root, 'aria-label', '配件机生产面板');
  const items = [
    ['crystal', 45, 'white'], ['module', 29, 'gold'], ['part', 20, 'purple'], ['canister', 21, 'white'],
    ['part', 2, 'purple'], ['ore', 50, 'gold'], ['canister', 1, 'purple'], ['module', 1, 'white'],
    ['ore', 11, 'gold'], ['plate', 20, 'purple'], ['crystal', 10, 'purple'], ['plate', 19, 'white'],
  ];
  const itemImage = (name, size) => `<img class="mp-item-image" src="assets/gen/item-${name}.png" width="${size}" height="${size}" alt="">`;
  const num = (name, value) => `<span class="mp-number" data-number="${name}"><span>${value}</span><span>${value}</span></span>`;
  write(root, "innerHTML", `<div class="mp-dimmer"></div><div class="mp-pane">
    <header class="mp-header"><span class="mp-header-icon">${icon('gear', 48)}</span><h2>配件机</h2><i></i><p>耗电功率值: 20</p></header>
    <div class="mp-warehouse">${icon('warehouse', 36)}</div><div class="mp-close" aria-label="关闭">${icon('close', 36)}</div>
    <div class="mp-toggle"><b>开</b><span>关</span></div>
    <div class="mp-mini-actions"><span>移动</span><i></i><span>收纳</span></div>
    <div class="mp-bag-title"><h3>背包</h3><span>容量 24/35</span></div>
    <div class="mp-bag-grid">${items.map(([name, count, rarity], i) => `<div class="mp-item mp-rarity-${rarity}${i === 2 ? ' mp-accessory' : ''}" aria-label="${i === 2 ? '配件' : '背包物品'}"><div class="mp-item-icon">${itemImage(name, 64)}</div>${num(`bag-${i}`, count)}<i class="mp-rarity"></i><i class="mp-item-flash"></i></div>`).join('')}</div>
    <div class="mp-drop"><b>四号谷地仓库｜全部</b><p>将物品拖入该区域，可展开并存放入仓库</p></div>
    <div class="mp-machine-visual"><svg viewBox="0 0 360 250" fill="none" aria-label="配件机正视线框示意图"><g stroke="currentColor" stroke-width="2"><path d="M83 26h194l24 22v158l-24 22H83l-24-22V48z"/><path d="M93 26v202m174-202v202M59 74h242M59 174h242M112 51h136v145H112z"/><path d="M133 68h94v110h-94zM180 68v110M133 122h94M112 196l21-18m115 18-21-18M35 90h24m242 0h24M35 158h24m242 0h24"/><path d="M152 94l28-16 28 16v36l-28 16-28-16zM152 94l28 16 28-16m-28 16v36"/><path stroke="var(--yellow-deep)" stroke-width="5" d="M59 58V42h22m198 0h22v16M59 192v16h22m198 0h22v-16"/></g></svg></div>
    <div class="mp-slot mp-input"><span class="mp-slot-icon">${itemImage('crystal', 54)}</span>${num('input', 9)}<small>晶体</small></div>
    <div class="mp-slot mp-output"><span class="mp-slot-icon">${itemImage('part', 54)}</span>${num('output', 0)}<small>配件</small><i class="mp-output-flash"></i></div>
    <svg class="mp-flow" viewBox="0 0 700 240" fill="none" aria-hidden="true"><path d="M46 126h173m262 0h173" stroke="currentColor" stroke-width="2"/><path d="m205 118 12 8-12 8m435-16 12 8-12 8" stroke="currentColor" stroke-width="2"/></svg>
    <div class="mp-cycle"><i></i><i></i><span>2秒</span></div>
    <div class="mp-recipe-title">当前自动生产中的配方</div>
    <div class="mp-recipe"><span>${itemImage('crystal', 42)}</span><i>${icon('arrow', 24)}</i><b>${icon('chevrons', 28)} 2秒</b><i>${icon('arrow', 24)}</i><span>${itemImage('part', 42)}</span></div>
    <div class="mp-collect"><i></i><span>全部收取</span><b>${icon('warehouse', 30)}</b></div>
    <div class="mp-progress"><i></i></div><div class="mp-producing">${icon('chevrons', 20)}<span>生产中</span></div>
    <div class="mp-flying">${itemImage('part', 40)}</div><div class="mp-flying">${itemImage('part', 40)}</div>
  </div>`);
  host.appendChild(root);
  const pane = root.querySelector('.mp-pane');
  const dimmer = root.querySelector('.mp-dimmer');
  const progress = root.querySelector('.mp-progress i');
  const outputFlash = root.querySelector('.mp-output-flash');
  const bagFlash = root.querySelector('.mp-accessory .mp-item-flash');
  const collect = root.querySelector('.mp-collect');
  const flights = [...root.querySelectorAll('.mp-flying')];
  const numbers = Object.fromEntries([...root.querySelectorAll('[data-number]')].map(el => [el.dataset.number, el]));
  const dots = [...root.querySelectorAll('.mp-cycle i')];
  function roll(el, before, after, q) {
    write(el.children[0], "textContent", before);
    write(el.children[1], "textContent", after);
    write(el.children[0].style, "transform", `translateY(${-100 * q}%)`);
    write(el.children[1].style, "transform", `translateY(${100 - 100 * q}%)`);
  }
  function sequence(name, initial, events, t) {
    let before = initial, after = initial, q = 1;
    for (const [time, next] of events) {
      if (t < time) break;
      before = after; after = next; q = seg(t, time, .18, E.outCubic);
    }
    roll(numbers[name], before, after, q);
  }
  function targets(p) {
    return p ? { collect: { x: 540, y: 1088 }, close: { x: 1020, y: 748 } } : { collect: { x: 1388, y: 680 }, close: { x: 1570, y: 218 } };
  }
  function render(t, p, deviceRect) {
    const visible = t >= 25 && t < 35.5;
    write(root.style, "display", visible ? 'block' : 'none');
    const open = seg(t, 25, p ? .4 : .5, E.outCubic);
    const close = seg(t, 35, .5, E.outCubic);
    const active = open * (1 - close);
    const x = p ? 0 : 300, y = p ? 700 : 170, w = p ? 1080 : 1320, h = p ? 1220 : 730;
    let px = x, py = y, sx = 1, sy = 1;
    if (p && t < 35) py = y + 1220 * (1 - open);
    else {
      px = lerp(deviceRect.x, x, active); py = lerp(deviceRect.y, y, active);
      sx = lerp(deviceRect.w / w, 1, active); sy = lerp(deviceRect.h / h, 1, active);
    }
    write(pane.style, "transform", `translate(${px}px,${py}px) scale(${sx},${sy})`);
    write(pane.style, "opacity", String(clamp(active * 5, 0, 1)));
    write(dimmer.style, "opacity", String(active));
    const elapsed = clamp(t - 25.5, 0, 5.5), cycle = elapsed % 2 / 2;
    write(progress.style, "width", `${100 * cycle}%`);
    dots.forEach((dot, i) => { write(dot.style, "opacity", cycle >= i * .5 ? '1' : '.3'); });
    sequence('input', 9, [[27.5, 8], [29.5, 7]], t);
    sequence('output', 0, [[27.5, 1], [29.5, 2], [32.1, 1], [32.25, 0]], t);
    sequence('bag-2', 20, [[32.5, 21], [32.65, 22]], t);
    const flashAt = (time, duration = .15) => t >= time && t < time + duration ? 1 - (t - time) / duration : 0;
    write(outputFlash.style, "opacity", String(Math.max(flashAt(27.5), flashAt(29.5))));
    write(bagFlash.style, "opacity", String(Math.max(flashAt(32.5), flashAt(32.65))));
    const pressed = t >= 32 && t < 32.12;
    write(collect.style, "background", pressed ? 'var(--yellow-deep)' : 'var(--yellow)');
    write(collect.style, "transform", `translateY(${pressed ? 2 : 0}px)`);
    const from = p ? { x: 930, y: 194 } : { x: 1148, y: 276 };
    const to = p ? { x: 644, y: 576 } : { x: 312, y: 264 };
    flights.forEach((el, i) => {
      const q = seg(t, 32.1 + i * .15, .4, E.inOutCubic);
      const x = (1 - q) ** 2 * from.x + 2 * (1 - q) * q * (from.x + to.x) / 2 + q ** 2 * to.x;
      const y = (1 - q) ** 2 * from.y + 2 * (1 - q) * q * (Math.min(from.y, to.y) - (p ? 180 : 180)) + q ** 2 * to.y;
      write(el.style, "display", q > 0 && q < 1 ? 'grid' : 'none');
      write(el.style, "transform", `translate(${x - 24}px,${y - 24}px) rotate(${q * 180}deg)`);
    });
  }
  return { root, render, targets };
}
