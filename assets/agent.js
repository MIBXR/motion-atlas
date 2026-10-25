/* Motion Atlas · Agent 工作流：指令生成器 */
(function () {
  'use strict';
  const { esc, ICONS, store, copy } = window.Site;
  const MA = window.MA, TAX = MA.taxonomy;
  const $ = (s) => document.querySelector(s);
  const ROLE_ORDER = { foundation: 0, support: 1, accent: 2 };
  const ROLE_NAME = { foundation: '骨架', support: '支撑', accent: '点睛', case: '案例' };

  const items = [
    ...MA.cases.map((e) => ({ kind: 'cases', e, role: 'case', sub: e.carriers.map((k) => TAX.carriers[k]).join(' / ') })),
    ...MA.patterns.map((e) => ({ kind: 'patterns', e, role: (e.composition && e.composition.role) || 'support', sub: e.types.map((k) => TAX.types[k]).join(' / ') })),
  ];
  const byId = new Map(items.map((x) => [x.e.id, x]));
  const S = Object.assign({ sel: ['map-pilgrimage', 'split-compare-stamp'], kind: 'all', target: 'code', brief: '' }, store.get('ma-agent', {}));
  S.sel = S.sel.filter((id) => byId.has(id));
  const save = () => store.set('ma-agent', S);

  function drawList() {
    const q = $('#genQ').value.trim().toLowerCase();
    const list = items.filter((x) => (S.kind === 'all' || x.kind === S.kind) && (!q || [x.e.id, x.e.title, x.e.summary, x.sub, ...(x.e.tags || [])].join(' ').toLowerCase().includes(q)));
    $('#genList').innerHTML = list.map((x) => `<label class="gen-item"><input type="checkbox" value="${esc(x.e.id)}"${S.sel.includes(x.e.id) ? ' checked' : ''}><span><b>${esc(x.e.title)}</b><small>${esc(x.e.id)} · ${esc(x.sub)}</small></span><span class="role ${x.role}">${ROLE_NAME[x.role]}</span></label>`).join('') || '<p class="ag-sub">没有匹配的条目</p>';
  }

  function ordered() {
    return S.sel.map((id) => byId.get(id)).filter(Boolean).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'cases' ? -1 : 1) || (ROLE_ORDER[a.role] ?? -1) - (ROLE_ORDER[b.role] ?? -1));
  }

  function warnings(sel) {
    const w = [];
    const pats = sel.filter((x) => x.kind === 'patterns');
    const f = pats.filter((x) => x.role === 'foundation');
    if (f.length > 1) w.push(`选了 ${f.length} 个骨架（${f.map((x) => x.e.title).join('、')}），通常只保留一个。`);
    if (pats.filter((x) => x.role === 'accent').length > 2) w.push('点睛超过 2 个，容易互相抢戏；让它们出现在不同时刻。');
    for (const x of pats) for (const c of (x.e.composition && x.e.composition.conflicts) || []) {
      if (S.sel.includes(c) && x.e.id < c) w.push(`${x.e.title} 与 ${byId.get(c).e.title} 标注为冲突，不要放在同一时刻。`);
    }
    return w;
  }

  function codeText(sel) {
    const L = [];
    const brief = S.brief.trim();
    const base = sel.find((x) => x.kind === 'cases') || sel.find((x) => x.role === 'foundation') || sel[0];
    L.push(`任务：${brief ? `做「${brief}」` : '做一个动态视觉作品'}，参考下列 Motion Atlas 条目的结构、节奏与参数，内容与品牌换成我的。`, '');
    L.push('先读资料包（本地仓库内），再动手：');
    for (const x of sel) L.push(`- agent/${x.kind}/${x.e.id}.json — ${x.e.title}（${x.kind === 'cases' ? `案例 · ${x.sub}` : `巧思 · ${ROLE_NAME[x.role]}`}）`);
    L.push('', '做法：');
    L.push(`1. 以「${base.e.title}」为底：运行 node scripts/atlas.mjs export ${base.e.id} --out <你的目录>，只改 ${base.kind === 'cases' ? 'config.js' : 'index.html 顶部的 CONFIG 块'}（文案、配色、时刻表），保留时间结构。`);
    const others = sel.filter((x) => x !== base);
    if (others.length) L.push(`2. 依次融入：${others.map((x) => `${x.e.title}（${ROLE_NAME[x.role]}）`).join('、')}——按各自资料包 documents.prompt 的“实现 Prompt”与“参数”实现，骨架决定版式，支撑占一个区域，点睛只在关键时刻出现。`);
    L.push(`${others.length ? 3 : 2}. 按时间播放的部分写成 render(t) 纯函数，并通过 MotionKit.expose() 暴露 window.__motion（见 docs/pipeline.md）；配置与逻辑分离，零依赖。`);
    L.push('', '要点摘录：');
    for (const x of sel) L.push(`【${x.e.title}】${x.e.prompt}`, '');
    const pairs = [...new Set(sel.flatMap((x) => (x.e.composition && x.e.composition.pairsWellWith) || []))].filter((id) => !S.sel.includes(id) && byId.has(id)).slice(0, 4);
    L.push('约束：', '- 普通网页文字 ≥ 12px；案例、巧思和画面内文字按设计需要决定字号；功能图标用 SVG。', '- prefers-reduced-motion 时去掉位移、缩放、震动与闪烁，只保留透明度变化，长动画停在可读的关键帧。', '- 不使用任何第三方作品的画面、角色、名称、标志、音乐与字体文件。');
    const neg = sel.map((x) => x.e.negativePrompt).filter(Boolean);
    if (neg.length) L.push(`- 避免：${neg.join('；')}`);
    if (pairs.length) L.push(`- 可选搭配：${pairs.map((id) => byId.get(id).e.title).join('、')}。`);
    L.push('', '需要成片时：node scripts/render.mjs <入口 HTML> --fps 30。');
    return L.join('\n');
  }

  function videoText(sel) {
    const L = [];
    const brief = S.brief.trim();
    const base = sel.find((x) => x.e.videoPrompt);
    if (base) {
      L.push(base.e.videoPrompt);
      if (brief) L.push('', `Replace the subject matter with: ${brief}. Keep the duration, beat structure, camera language and transitions.`);
    } else {
      L.push(`${brief ? `${brief}. ` : ''}Motion graphics video, 1920×1080, 20–30 seconds, every cut locked to a steady beat.`);
    }
    const devices = sel.filter((x) => x !== base);
    if (devices.length) {
      L.push('', 'Motion devices to include (one at a time, at key moments):');
      for (const x of devices) L.push(`- ${x.e.title}: ${x.e.effect || x.e.summary}`);
    }
    const neg = sel.map((x) => x.e.negativePrompt).filter(Boolean);
    L.push('', `Negative: ${neg.length ? neg.join('; ') + '; ' : ''}no third-party logos, characters or copyrighted footage; no illegible tiny text.`);
    if (!base) L.push('', '（所选条目都没有视频生成 Prompt：以上为按巧思拼出的骨架，建议再选一个案例作为底稿。）');
    return L.join('\n');
  }

  function drawOut() {
    const sel = ordered();
    document.querySelectorAll('#genTarget button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.t === S.target)));
    document.querySelectorAll('#genKind button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === S.kind)));
    if (!sel.length) { $('#genOut').textContent = '在左侧勾选一个或多个条目。建议：1 个案例或骨架巧思 + 若干支撑与点睛。'; $('#genWarn').textContent = ''; return; }
    $('#genOut').textContent = S.target === 'code' ? codeText(sel) : videoText(sel);
    $('#genWarn').textContent = warnings(sel).join(' ');
  }

  $('#genList').addEventListener('change', (e) => {
    const id = e.target.value;
    S.sel = e.target.checked ? [...new Set([...S.sel, id])] : S.sel.filter((x) => x !== id);
    save(); drawOut();
  });
  $('#genQ').addEventListener('input', drawList);
  $('#genKind').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { S.kind = b.dataset.k; save(); drawList(); drawOut(); } });
  $('#genTarget').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) { S.target = b.dataset.t; save(); drawOut(); } });
  $('#genBrief').value = S.brief;
  $('#genBrief').addEventListener('input', (e) => { S.brief = e.target.value; save(); drawOut(); });
  $('#genCopy').innerHTML = `${ICONS.copy}复制`;
  $('#genCopy').addEventListener('click', () => copy($('#genOut').textContent));
  drawList(); drawOut();
})();
