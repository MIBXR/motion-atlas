(function () {
  'use strict';
  const { esc, ICONS, copy } = window.Site;
  const { render } = window.MAMarkdown;
  // 页头已显示标题与说明：正文去掉 YAML frontmatter 与开头的一级标题，避免重复
  const stripFrontmatter = (md) => md.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const stripTitle = (md) => md.replace(/^#\s[^\n]*\n+/, '');
  const RES = window.MA_RES;
  const root = document.getElementById('app');
  const CATEGORIES = { motion: '动效', '3d': '3D 场景', explainer: '讲解', interactive: '交互' };
  const PARTIAL = { none: '完整提示词', part: '部分提示词', post: '仅原帖文字' };
  const tagCounts = new Map();
  RES.videos.items.forEach((v) => v.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1)));
  const tags = [...tagCounts].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  let videoState = {}, skillState = { repo: '', q: '' }, limit = 48;
  const lists = { videos: { hash: '#videos', scroll: 0, limit: 48 }, skills: { hash: '#skills', scroll: 0 } };
  let view, revision = 0, spy, promptData;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const $ = (s) => root.querySelector(s);
  const chip = (label, accent = false) => `<span class="chip${accent ? ' accent' : ''}">${esc(label)}</span>`;
  const partialChip = (v) => v.partial === 'none' ? '' : chip(PARTIAL[v.partial], true);
  const title = (v) => v.title || `@${v.author} 的作品`;
  const licenseChip = (s) => chip(s.upstream.license === 'MIT' ? 'MIT' : '未声明许可', s.upstream.license !== 'MIT');
  const external = (url, label, cls = 'btn') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`;
  const back = (kind, label) => `<a class="res-back" href="${esc(lists[kind].hash)}">${ICONS.back}${label}</a>`;

  function head(kind) {
    return `<header class="lib-head"><div><p class="eyebrow">RESOURCES · PROMPTS / SKILLS</p><h1>别人做成的片子，<br>和<em>做片的方法</em>。</h1><p>收录外部仓库的视频提示词与 Skill，原样保存，保留作者与许可。</p></div></header>
      <nav class="res-tabs" aria-label="资源类型"><a href="#videos"${kind === 'videos' ? ' aria-current="page"' : ''}>视频提示词 <span>${RES.videos.items.length}</span></a><a href="#skills"${kind === 'skills' ? ' aria-current="page"' : ''}>Skills <span>${RES.skills.length}</span></a></nav>`;
  }
  function sideButton(group, value, label, count, selected) {
    return `<li><button type="button" data-group="${group}" data-value="${esc(value)}" aria-pressed="${selected === value}"><span>${esc(label)}</span><span class="count">${String(count).padStart(2, '0')}</span></button></li>`;
  }
  function sideGroup(label, group, choices, state, count) {
    return `<div class="side-group"><h2>${label}</h2><ul class="side-list">${choices.map(([value, name]) => sideButton(group, value, name, count(value), state[group])).join('')}</ul></div>`;
  }
  function matches(v, state) {
    return (!state.cat || v.category === state.cat) && (!state.tag || v.tags.includes(state.tag)) && (!state.full || v.partial === state.full) &&
      (!state.q || [v.author, v.title || '', v.excerpt].some((s) => s.toLowerCase().includes(state.q.toLowerCase())));
  }
  function sync(kind) {
    const p = new URLSearchParams();
    const state = kind === 'videos' ? videoState : skillState;
    for (const key of kind === 'videos' ? ['cat', 'tag', 'full', 'q', 'sort'] : ['repo']) {
      if (state[key] && !(key === 'sort' && state[key] === 'added')) p.set(key, state[key]);
    }
    lists[kind].hash = `#${kind}${p.size ? '?' + p : ''}`;
    history.replaceState(null, '', lists[kind].hash);
  }
  function listShell(kind) {
    document.title = '资源库 · Motion Atlas';
    const videos = kind === 'videos';
    root.innerHTML = `<div class="lib"><aside class="lib-side" id="lib-side" aria-label="资源筛选"></aside><section>${head(kind)}
      <div class="toolbar"><button class="btn side-toggle" type="button" aria-expanded="false" aria-controls="lib-side">${ICONS.filter}<span>筛选</span></button>
      <label class="field">${ICONS.search}<span class="sr-only">搜索</span><input id="search" type="search" placeholder="${videos ? '搜索作者、标题、提示词片段…' : '搜索 Skill 名称与说明…'}" value="${esc(videos ? videoState.q : skillState.q)}"></label>
      ${videos ? `<select class="select" id="sort" aria-label="排序"><option value="added"${videoState.sort === 'added' ? ' selected' : ''}>最新收录</option><option value="author"${videoState.sort === 'author' ? ' selected' : ''}>作者 A–Z</option></select>` : ''}</div>
      <div class="result-line"><span id="result-count" role="status"></span>${videos ? '<span>提示词多为英文原文，点开可复制</span>' : ''}</div><div class="grid" id="grid"></div><div class="res-more"></div></section></div>`;
    $('#search').addEventListener('input', (e) => {
      if (videos) { videoState.q = e.target.value; limit = 48; paintVideos(); }
      else { skillState.q = e.target.value; paintSkills(); }
    });
    $('#lib-side').addEventListener('click', (e) => {
      const b = e.target.closest('[data-group]');
      if (!b) return;
      if (videos) { videoState[b.dataset.group] = b.dataset.value; limit = 48; paintVideos(); }
      else { skillState.repo = b.dataset.value; paintSkills(); }
    });
    const toggle = $('.side-toggle');
    if (toggle) toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String($('#lib-side').classList.toggle('open'))));
    if (videos) $('#sort').addEventListener('change', (e) => { videoState.sort = e.target.value; limit = 48; paintVideos(); });
    if (videos) paintVideos(); else paintSkills();
  }
  function paintVideos() {
    const facetCount = (group, value) => RES.videos.items.filter((v) => matches(v, { ...videoState, [group]: value })).length;
    $('#lib-side').innerHTML = sideGroup('分类', 'cat', [['', '全部'], ...Object.entries(CATEGORIES)], videoState, (v) => facetCount('cat', v)) +
      sideGroup('技术标签', 'tag', [['', '全部标签'], ...tags.map((t) => [t, t])], videoState, (v) => facetCount('tag', v)) +
      sideGroup('提示词完整度', 'full', [['', '全部'], ...Object.entries(PARTIAL)], videoState, (v) => facetCount('full', v)) +
      '<p class="side-foot"><b>●</b> SOURCE · awesome-opus5-5-videos<br>视频与提示词归各作者</p>';
    const items = RES.videos.items.filter((v) => matches(v, videoState));
    if (videoState.sort === 'author') items.sort((a, b) => a.author.localeCompare(b.author));
    $('#result-count').textContent = `共 ${items.length} 条`;
    $('#grid').innerHTML = items.slice(0, limit).map((v, i) => `<article class="card">
      <div class="card-media"><img src="${esc(v.poster)}" alt="@${esc(v.author)} 的视频封面" loading="lazy" decoding="async"><span class="card-index">${String(i + 1).padStart(3, '0')} / ${CATEGORIES[v.category]}</span></div>
      <div class="card-body"><h3 class="card-title"><a href="#video/${esc(v.slug)}">${esc(title(v))}</a></h3><p class="res-author">@${esc(v.author)}</p><p class="card-sum res-excerpt">${esc(v.excerpt)}</p><div class="card-tags">${v.tags.map((t) => chip(t)).join('')}${partialChip(v)}</div></div></article>`).join('');
    $('#grid').querySelectorAll('img').forEach((img) => img.addEventListener('error', () => { const ph = document.createElement('span'); ph.className = 'ph'; ph.textContent = 'VIDEO'; img.replaceWith(ph); }, { once: true }));
    const remaining = Math.max(0, items.length - limit);
    $('.res-more').innerHTML = remaining ? `<button class="btn" type="button">再显示 48 条（剩余 ${remaining}）</button>` : '';
    if (remaining) $('.res-more button').addEventListener('click', () => { limit += 48; paintVideos(); });
    sync('videos');
  }
  function paintSkills() {
    const matchesQuery = (s) => !skillState.q || [s.id, s.description].some((v) => v.toLowerCase().includes(skillState.q.toLowerCase()));
    $('#lib-side').innerHTML = sideGroup('来源', 'repo', [['', '全部'], ['garden-skills', 'garden-skills'], ['agent-anime-skill', 'agent-anime-skill']], skillState,
      (repo) => RES.skills.filter((s) => (!repo || s.repo === repo) && matchesQuery(s)).length) + '<p class="side-foot"><b>●</b> 原样收录上游文件<br>许可见各 Skill</p>';
    const items = RES.skills.filter((s) => (!skillState.repo || s.repo === skillState.repo) && matchesQuery(s));
    $('#result-count').textContent = `共 ${items.length} 个 Skill`;
    $('#grid').innerHTML = items.map((s, i) => `<article class="card"><div class="card-media"><span class="ph">SKILL</span><span class="card-index">${String(i + 1).padStart(3, '0')} / ${esc(s.repo)}</span></div><div class="card-body"><h3 class="card-title"><a href="#skill/${esc(s.id)}">${esc(s.id)}</a></h3><p class="card-sum res-description">${esc(s.description)}</p><div class="card-tags">${chip(s.repo)}${chip(s.files.length + ' 个文件')}${licenseChip(s)}</div></div></article>`).join('');
    sync('skills');
  }
  async function videoDetail(slug, token) {
    const v = RES.videos.items.find((item) => item.slug === slug);
    if (!v) return;
    const upstream = RES.videos.upstream;
    document.title = `${title(v)} · Motion Atlas`;
    root.innerHTML = `<div class="res-detail">${back('videos', '视频提示词')}<header class="detail-head"><p class="eyebrow">${CATEGORIES[v.category]} · 收录于 ${esc(v.added)}</p><h1>${esc(title(v))}</h1><div class="chips">${external(v.authorUrl, '@' + esc(v.author), 'chip')}${v.tags.map((t) => chip(t)).join('')}${partialChip(v)}</div></header>
      <div class="detail-actions"><button class="btn" id="copy-prompt" type="button">${ICONS.copy}复制提示词</button>${external(v.postUrl, `原帖 ${ICONS.external}`)}${v.remakeUrl ? external(v.remakeUrl, `看复刻 ${ICONS.external}`) : ''}</div>
      <img class="res-poster" src="${esc(v.poster)}" alt="@${esc(v.author)} 的视频封面"><article class="doc" id="doc"></article>
      <p class="side-foot">提示词版权归 ${external(v.authorUrl, '@' + esc(v.author), '')} 所有 · 来源 ${external(upstream.url, esc(upstream.repo), '')} @ ${esc(upstream.commit.slice(0, 7))} · MIT（列表）</p></div>`;
    $('.res-poster').addEventListener('error', (e) => { e.target.hidden = true; }, { once: true });
    promptData ||= fetch('resources/opus-videos/data/videos.json').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
    $('#copy-prompt').addEventListener('click', async () => copy((await promptData).find((item) => item.slug === slug).prompt));
    const file = `resources/opus-videos/prompts/${slug}.md`;
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(response.status);
      const md = await response.text();
      if (token === revision) { $('#doc').innerHTML = render(stripTitle(md), file, []); bindCodeCopy(); }
    } catch {
      if (token === revision) $('#doc').innerHTML = '<p class="doc-empty">提示词文件读取失败</p>';
    }
  }
  function bindCodeCopy() {
    root.querySelectorAll('.doc pre').forEach((pre) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'btn'; button.innerHTML = `${ICONS.copy}复制`;
      button.addEventListener('click', () => copy(pre.querySelector('code').textContent));
      pre.appendChild(button);
    });
  }
  function fileSize(bytes) {
    return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  async function skillDetail(id, rawPath, token) {
    const skill = RES.skills.find((s) => s.id === id);
    if (!skill) return;
    const [file, fragment] = (rawPath || 'SKILL.md').split('#');
    const base = `${skill.dir}/${file}`, up = skill.upstream;
    const groups = new Map();
    skill.files.forEach((f) => { const dir = f.path.includes('/') ? f.path.slice(0, f.path.lastIndexOf('/')) : '/'; if (!groups.has(dir)) groups.set(dir, []); groups.get(dir).push(f); });
    const route = (p) => `#skill/${skill.id}/${p}`;
    document.title = `${skill.id} · Motion Atlas`;
    root.innerHTML = `<div class="res-detail res-skill-head">${back('skills', 'Skills')}<header class="detail-head"><p class="eyebrow">SKILL · ${esc(skill.repo)}</p><h1>${esc(skill.id)}</h1><p class="res-skill-description">${esc(skill.description)}</p><div class="chips">${external(up.url, `${esc(up.repo)} @ ${esc(up.commit.slice(0, 7))}`, 'chip')}${licenseChip(skill)}</div></header>${up.notice.length ? `<div class="res-notice">${up.notice.map((line, i) => `<p>${i === 0 ? '上游声明：' : ''}${esc(line)}</p>`).join('')}</div>` : ''}</div>
      <div class="docs res-skill-docs"><aside class="docs-side" aria-label="Skill 文件"><button class="btn docs-toggle" type="button" aria-expanded="false">${ICONS.menu}全部文件（${skill.files.length}）</button><nav id="docNav">${[...groups].map(([dir, files]) => `<details open><summary>${esc(dir)}</summary>${files.map((f) => /\.md$/i.test(f.path) ? `<a href="${esc(route(f.path))}"${f.path === file ? ' aria-current="page"' : ''}>${esc(f.path.split('/').pop())}</a>` : `<a href="${esc(skill.dir + '/' + f.path)}" target="_blank" rel="noopener">${esc(f.path.split('/').pop())}<span class="res-file-bytes">${fileSize(f.bytes)}</span></a>`).join('')}</details>`).join('')}</nav></aside><article class="doc" id="doc" tabindex="-1"></article><aside class="doc-toc" aria-label="本页目录"><p class="eyebrow">ON THIS PAGE</p><nav id="toc"></nav></aside></div>`;
    $('.docs-toggle').addEventListener('click', (e) => e.currentTarget.setAttribute('aria-expanded', String($('.docs-side').classList.toggle('open'))));
    const link = (resolved) => {
      const [p] = resolved.split('#');
      return p.startsWith(skill.dir + '/') && /\.md$/i.test(p) ? route(resolved.slice(skill.dir.length + 1)) : resolved;
    };
    try {
      const response = await fetch(base);
      if (!response.ok) throw new Error(response.status);
      const md = await response.text();
      if (token !== revision) return;
      const heads = [];
      $('#doc').innerHTML = `<div class="doc-path"><span>${esc(skill.repo)} / ${esc(skill.dir.replace(`resources/skills/${skill.repo}/`, '') + '/' + file)}</span><a href="${esc(base)}">原始 Markdown</a></div>${render(stripFrontmatter(md), base, heads, { link })}`;
      bindCodeCopy();
      const toc = heads.filter((h) => h.lv === 2 || h.lv === 3);
      $('#toc').innerHTML = toc.map((h) => `<a href="${esc(route(file) + '#' + h.id)}" data-id="${esc(h.id)}"${h.lv === 3 ? ' class="sub"' : ''}>${esc(h.text)}</a>`).join('');
      if ('IntersectionObserver' in window && toc.length) {
        spy = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) $('#toc').querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === e.target.id)); }), { rootMargin: '-80px 0px -70% 0px' });
        toc.forEach((h) => spy.observe(document.getElementById(h.id)));
      }
      if (fragment) document.getElementById(fragment)?.scrollIntoView({ behavior: 'instant' });
    } catch {
      if (token === revision) $('#doc').innerHTML = '<p class="doc-empty">文件读取失败</p>';
    }
  }
  function openRoute() {
    if (view === 'videos' || view === 'skills') { lists[view].scroll = scrollY; if (view === 'videos') lists.videos.limit = limit; }
    const previous = view, token = ++revision;
    if (spy) { spy.disconnect(); spy = null; }
    const hash = location.hash.slice(1) || 'videos';
    const [name, params = ''] = hash.split('?');
    const query = new URLSearchParams(params);
    if (name.startsWith('video/')) { view = 'video'; scrollTo({ top: 0, behavior: 'instant' }); videoDetail(decodeURIComponent(name.slice(6)), token); }
    else if (name.startsWith('skill/')) { view = 'skill'; const [, id, ...file] = decodeURIComponent(name).split('/'); scrollTo({ top: 0, behavior: 'instant' }); skillDetail(id, file.join('/'), token); }
    else {
      const kind = name === 'skills' ? 'skills' : 'videos';
      const restore = previous === (kind === 'videos' ? 'video' : 'skill') && '#' + hash === lists[kind].hash;
      view = kind;
      if (kind === 'videos') { videoState = { cat: query.get('cat') || '', tag: query.get('tag') || '', full: query.get('full') || '', q: query.get('q') || '', sort: query.get('sort') || 'added' }; limit = restore ? lists.videos.limit : 48; }
      else skillState.repo = query.get('repo') || '';
      listShell(kind);
      requestAnimationFrame(() => scrollTo({ top: restore ? lists[kind].scroll : 0, behavior: 'instant' }));
    }
  }
  addEventListener('hashchange', openRoute);
  openRoute();
})();
