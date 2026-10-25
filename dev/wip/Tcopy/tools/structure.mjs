import fs from 'node:fs';

function edit(file, fn) { const before = fs.readFileSync(file, 'utf8'); const after = fn(before); fs.writeFileSync(file, after); }
const replace = (s, a, b) => { if (!s.includes(a)) throw new Error('Missing text: ' + a.slice(0, 80)); return s.replaceAll(a, b); };

edit('assets/library.js', s => {
  s = s.replace(/^  const evBadge = .*\n/m, '');
  s = s.replace(/^    source: .*\n/m, '').replace(/^    if \(KIND === 'cases' && state.source.*\n/m, '').replace(/^      if \(KIND === 'cases' && state.source.*\n/m, '');
  s = replace(s, "q.get('sort') || 'curated'", "q.get('sort') === 'title' ? 'title' : 'order'");
  s = replace(s, "state.sort !== 'curated'", "state.sort !== 'order'");
  s = replace(s, ', TAX.sources?.[it.source]', '');
  s = s.replace(/^    if \(state.sort === 'energy'\).*\n/m, '').replace(/^  const avg = .*\n/m, '');
  const a = s.indexOf('    const countBy ='), b = s.indexOf('    root.innerHTML =', a);
  s = s.slice(0, a) + `    const side = \`<div class="side-group"><h2>收藏与工具</h2><ul class="side-list">
      \${sideButton('fav', '1', '我的收藏', favs.all()[KIND].length)}
      <li><button type="button" data-tool="export"><span>导出收藏</span>\${ICONS.download}</button></li>
      <li><button type="button" data-tool="import"><span>导入收藏</span>\${ICONS.upload}</button></li>
      <li><a href="\${KIND === 'cases' ? 'patterns.html' : 'cases.html'}"><span>\${KIND === 'cases' ? '浏览巧思库' : '浏览案例库'}</span>\${ICONS.arrow}</a></li>
      </ul></div>\`;
    const filterSelect = (id, label, all, values, value) => \`<select class="select" id="\${id}" aria-label="\${label}"><option value="all">\${all}</option>\${values.map(([k, v]) => \`<option value="\${k}"\${value === k ? ' selected' : ''}>\${esc(v)}</option>\`).join('')}</select>\`;
    const filters = [
      KIND === 'patterns' ? filterSelect('type-filter', '类型', '全部类型', Object.entries(TAX.types), state.type) : '',
      filterSelect('carrier-filter', '载体', '全部载体', carriers, state.carrier),
      KIND === 'patterns' ? filterSelect('case-filter', '所属案例', '全部案例', MA.cases.map(c => [c.id, c.title]), state.caseId) : '',
    ].join('');
    const sortOptions = [['order', '编号'], ['title', '名称']];

` + s.slice(b);
  s = replace(s, "${KIND === 'cases' ? '案例分类' : '巧思分类'}", '收藏与工具');
  s = replace(s, '${items.length} 个完整案例：拆成镜头、信息层、文字、转场与声音轨道，附节拍表、动效 Token、可复用 Prompt 与可逐帧定位的 Demo。', '${items.length} 个案例：节拍表、动效参数、可复用 Prompt，以及能拖动逐帧查看的 Demo。');
  s = replace(s, '${items.length} 个独立巧思：每项都有触发、结果、参数、组合边界、可复制 Prompt 和单文件 Demo，可以跨案例组合。', '${items.length} 个巧思：每个都有触发方式、效果、参数、可复制的 Prompt 和独立 Demo。');
  s = replace(s, '<span>分类与工具</span>', '<span>收藏与工具</span>');
  s = replace(s, '${caseOptions}', '${filters}');
  s = replace(s, "[...it.carriers.map((c) => `<span class=\"chip\">${esc(TAX.carriers[c])}</span>`), `<span class=\"chip accent\">${esc(TAX.sources[it.source])}</span>`].join('')", "it.carriers.map((c) => `<span class=\"chip\">${esc(TAX.carriers[c])}</span>`).join('')");
  s = replace(s, '清除分类筛选', '清除筛选');
  s = replace(s, "    const cf = root.querySelector('#case-filter');\n    if (cf) cf.addEventListener('change', (e) => { state.caseId = e.target.value; paintGrid(); });", "    for (const [id, key] of [['carrier-filter', 'carrier'], ['type-filter', 'type'], ['case-filter', 'caseId']]) {\n      const select = root.querySelector('#' + id);\n      if (select) select.addEventListener('change', (e) => { state[key] = e.target.value; paintGrid(); });\n    }");
  s = replace(s, '正在预加载资源 ${pct}%', '正在载入 ${pct}%');
  s = s.replace(/这个 Demo[^'`\n]*16:9[^'`\n]*/g, '这个 Demo 按 16:9 显示，内容随画框自适应。');
  s = replace(s, "sec('逐帧观察', 'OBSERVED'", "sec('画面细节', 'DETAILS'");
  s = s.replace(/      sec\('来源与证据', 'SOURCES',[\s\S]*?\.join\(''\)\}<\/ul>`\),\n/, '');
  s = s.replace(/      sec\('来源', 'SOURCES',[\s\S]*?\.join\(''\)\}<\/ul>`\),/, "      `<p>所属案例：${(it.sources || []).map((s) => { const c = byId(MA.cases, s.caseId); return c ? `<a href=\"cases.html#case/${c.id}\">${esc(c.title)}</a>` : ''; }).join('、')}</p>`,");
  s = replace(s, ', `<span class="chip accent">${esc(TAX.sources[it.source])}</span>`', '');
  return s;
});

edit('assets/home.js', s => {
  s = replace(s, '可逐帧渲染成视频的影像：转场、HUD、字幕与镜头都写在时间轴上。', '只能看的影像：转场、HUD、字幕与镜头都写在时间轴上，可以逐帧导出成视频。');
  s = replace(s, '可以操作的界面：选择、锁定、确认、换页都有方向、余波与回程。', '可以操作的界面：选择、确认、翻页都有清楚的反馈，随时可以暂停。');
  s = s.replace(/^    showcase: .*\n/m, '');
  return replace(s, '<span class="chip accent">${esc(TAX.sources[c.source])}</span>', '');
});
edit('assets/home.css', s => replace(s, '.carriers { display: grid; grid-template-columns: repeat(3,', '.carriers { display: grid; grid-template-columns: repeat(2,'));
edit('assets/site.js', s => {
  s = replace(s, '<b>MOTION ATLAS</b> · 多媒体动态视觉参考库：案例、巧思、节奏、Prompt 与可迁移 Demo。<br>品牌与影像权利归各自所有者；本库 Demo 为原创转译与教学示范。', '<b>MOTION ATLAS</b> · 动态视觉参考库：案例、巧思、节奏、Prompt 与可运行的 Demo。');
  return replace(s, '>收录方法</a>', '>条目结构</a>');
});
edit('assets/site.css', s => {
  s = replace(s, '.side-list button[aria-pressed="true"] {', '.side-list button[aria-pressed="true"], .side-list a[aria-current="page"] {');
  return s.replace(/^\.side-foot[^\n]*\n/gm, '');
});
edit('index.html', s => {
  const inv = JSON.parse(fs.readFileSync('dev/wip/Tcopy/copy-inventory.json', 'utf8'));
  const copy = {
    C076: 'Motion Atlas · 动态视觉参考库', C087: 'MOTION ATLAS · 动态视觉参考库',
    C089: '拆解影像与界面里的动态设计：每个案例都配节拍表、动效参数、可复用的 Prompt，以及能拖动、逐帧播放的 Demo。',
    C013: 'TWO CARRIERS', C014: '两种载体，一套节奏语言', C015: 'HOW A CASE IS BUILT', C016: '一个案例怎么拆',
    C018: '逐帧看画面，记下每个转场、每层信息出现和消失的时刻。',
    C025: '每个能复用的手法单独成条：怎么触发、什么效果、参数多少、能和谁搭配。',
    C028: '实现 Prompt、视频生成 Prompt 和负向约束，配一份改配置就能复用的 Demo。',
    C030: '同一份代码可以实时播放、拖动定位，也能逐帧导出成视频。',
    C003: '结构化索引、每个条目的完整资料包和命令行工具：检索、读取、导出可运行的 Demo。',
  };
  for (const [id, value] of Object.entries(copy)) s = replace(s, inv.find(r => r.id === id).text, value);
  return s;
});
edit('.gitignore', s => s.replace(/^.*industrial-protocol.*\n/gm, ''));
