/* Motion Atlas · 首页：统计、监视器轮播、时间轴示意、载体与类型入口 */
(function () {
  'use strict';
  const { esc, ICONS, favs } = window.Site;
  const MA = window.MA, TAX = MA.taxonomy;
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#stats').innerHTML = `<b>${MA.cases.length}</b> 个完整案例 · <b>${MA.patterns.length}</b> 个独立巧思 · <b>${MA.materials.length}</b> 个创作素材 · <b>${MA.cases.filter((c) => c.timeline).length}</b> 个可逐帧渲染的 Demo`;

  const withPrev = MA.cases.filter((c) => c.preview);
  const monitor = $('#monitor'), toggle = $('#preview-toggle');
  let idx = 0, paused = reduce;
  function showCase(i) {
    const c = withPrev[i % withPrev.length];
    const img = $('#monImg');
    img.src = c.preview;
    img.alt = `${c.title} Demo 截图`;
    monitor.href = `cases.html#case/${c.id}`;
    $('#monTag').textContent = `截图预览 / ${c.title}`;
  }
  function paintPause() {
    toggle.textContent = paused ? '继续轮播' : '暂停轮播';
    toggle.setAttribute('aria-pressed', String(paused));
  }
  toggle.addEventListener('click', () => { paused = !paused; paintPause(); });
  showCase(idx);
  paintPause();
  setInterval(() => {
    if (!paused && !document.hidden && !monitor.matches(':hover') && !monitor.parentElement.contains(document.activeElement)) showCase(++idx);
  }, 3200);

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
    return `<article class="card"><div class="card-media">${c.preview ? `<img src="${esc(c.preview)}" alt="${esc(c.title)} Demo 实际截图" loading="lazy">` : '<span class="ph">PREVIEW</span>'}</div>
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
    return n ? `<a class="type" href="patterns.html?type=${k}"><span>${esc(v)}</span><b>${String(n).padStart(2, '0')}</b></a>` : '';
  }).join('');
})();
