/* Motion Atlas · 首页：统计、监视器轮播、时间轴示意、载体与类型入口 */
(function () {
  'use strict';
  const { esc, ICONS, favs } = window.Site;
  const MA = window.MA, TAX = MA.taxonomy;
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#stats').innerHTML = `<b>${MA.cases.length}</b> 个完整案例 · <b>${MA.patterns.length}</b> 个独立巧思 · <b>${MA.materials.length}</b> 个创作素材 · <b>${MA.cases.filter((c) => c.timeline).length}</b> 个可逐帧渲染的 Demo`;

  // 监视器：轮播案例预览；时间码随轮播推进
  const withPrev = MA.cases.filter((c) => c.preview);
  let idx = 0, t0 = performance.now();
  function showCase(i) {
    const c = withPrev[i % withPrev.length];
    if (!c) return;
    const img = $('#monImg');
    img.style.opacity = 0;
    setTimeout(() => { img.src = c.preview; img.alt = `${c.title} Demo 截图`; img.style.opacity = 1; }, reduce ? 0 : 250);
    $('#monTag').textContent = `${String((i % withPrev.length) + 1).padStart(2, '0')} · ${c.title}`;
    $('#monitor').onclick = () => { location.href = `cases.html#case/${c.id}`; };
    $('#monitor').style.cursor = 'pointer';
  }
  showCase(0);
  if (!reduce) setInterval(() => showCase(++idx), 3200);
  (function tc() {
    const s = (performance.now() - t0) / 1000, f = Math.floor((s % 1) * 24);
    const pad = (n) => String(Math.floor(n)).padStart(2, '0');
    $('#monTc').textContent = `00:${pad(s / 60)}:${pad(s % 60)}:${pad(f)}`;
    if (!reduce) requestAnimationFrame(tc);
  })();

  // 时间轴示意：五条轨道 + 播放头（减少动态时静止）
  const TRACKS = [
    ['CAM', [[0, 34, 'var(--line-2)'], [36, 62, 'var(--line-2)']], [10, 48, 80]],
    ['HUD', [[8, 96, 'color-mix(in srgb, var(--accent) 35%, transparent)']], []],
    ['TYPE', [[14, 30, 'var(--ink-2)'], [52, 66, 'var(--ink-2)'], [78, 92, 'var(--ink-2)']], []],
    ['FX', [[30, 36, 'var(--accent)'], [62, 68, 'var(--accent)']], [33, 65]],
    ['SFX', [], [6, 18, 30, 42, 54, 66, 78, 90]],
  ];
  $('#tracks').innerHTML = TRACKS.map(([name, clips, keys]) => `<div class="trk"><b>${name}</b><div class="lane">${clips.map(([a, b, c]) => `<i class="clip" style="left:${a}%;width:${b - a}%;background:${c}"></i>`).join('')}${keys.map((k) => `<i class="key" style="left:${k}%"></i>`).join('')}</div></div>`).join('') + '<i class="playhead" id="ph"></i>';
  if (!reduce) {
    const ph = $('#ph');
    (function loop(now) {
      const lane = document.querySelector('.trk .lane');
      if (lane) { const w = lane.clientWidth, p = ((now / 1000) % 8) / 8; ph.style.left = `${76 + p * w}px`; }
      requestAnimationFrame(loop);
    })(0);
  }

  // 载体
  const CARRIER_DESC = {
    video: ['只能看的影像：转场、HUD、字幕与镜头都写在时间轴上，可以逐帧导出成视频。', '地图巡礼'],
    console: ['可以操作的界面：选择、确认、翻页都有清楚的反馈，随时可以暂停。', '档案终端'],
  };
  $('#carriers').innerHTML = Object.entries(TAX.carriers).map(([k, v]) => {
    const n = MA.cases.filter((c) => c.carriers.includes(k)).length;
    return `<a class="carrier" href="cases.html?carrier=${k}"><span class="num">${String(n).padStart(2, '0')}</span><h3>${esc(v)}</h3><p>${esc(CARRIER_DESC[k][0])}</p><span class="eg">${esc(CARRIER_DESC[k][1])}</span></a>`;
  }).join('');

  // 案例卡片（与案例库相同的卡片结构）
  $('#caseGrid').innerHTML = MA.cases.map((c, i) => {
    const fav = favs.has('cases', c.id);
    return `<article class="card"><div class="card-media">${c.preview ? `<img src="${esc(c.preview)}" alt="${esc(c.title)} Demo 实际截图" loading="lazy">` : '<span class="ph">PREVIEW</span>'}<span class="card-index">${String(i + 1).padStart(2, '0')} / ${esc(TAX.carriers[c.carriers[0]])}</span></div>
      <div class="card-body"><div class="card-title"><a href="cases.html#case/${c.id}">${esc(c.title)}</a><button class="fav-btn" type="button" data-fav="${c.id}" aria-pressed="${fav}" aria-label="${fav ? '取消收藏' : '收藏'}：${esc(c.title)}">${fav ? ICONS.starFill : ICONS.star}</button></div>
      <p class="card-sum">${esc(c.summary)}</p><div class="card-tags">${c.carriers.map((k) => `<span class="chip">${esc(TAX.carriers[k])}</span>`).join('')}</div></div></article>`;
  }).join('');
  $('#caseGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    const on = favs.toggle('cases', b.dataset.fav);
    b.setAttribute('aria-pressed', String(on));
    b.innerHTML = on ? ICONS.starFill : ICONS.star;
  });

  // 巧思类型
  $('#types').innerHTML = Object.entries(TAX.types).map(([k, v]) => {
    const n = MA.patterns.filter((p) => p.types.includes(k)).length;
    return n ? `<a class="type" href="patterns.html?type=${k}"><span>${esc(v)}<br><small>${k}</small></span><b>${String(n).padStart(2, '0')}</b></a>` : '';
  }).join('');
})();
