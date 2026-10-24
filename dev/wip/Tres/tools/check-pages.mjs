import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const base = 'http://localhost:4328';
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('data/resources.js', 'utf8'), context);
const resources = JSON.parse(JSON.stringify(context.window.MA_RES));
const upstreamVideos = JSON.parse(fs.readFileSync('resources/opus-videos/data/videos.json', 'utf8'));
const evidence = { assertions: [], missing: [], screenshots: [], consoleErrors: [] };
const knownMissing = new Set([
  'resources/skills/garden-skills/skills/web-video-presentation/references/PRINCIPLES.md',
  'resources/skills/garden-skills/skills/web-video-presentation/references/PATTERNS.md',
  'resources/skills/garden-skills/demo/web-design-engineer-demo/',
  'resources/skills/garden-skills/demo/web-design-engineer-demo',
  'resources/skills/garden-skills/demo/web-design-engineer-demo/README.md',
  'resources/skills/garden-skills/website/gpt-image2-website/LICENSE',
  'resources/skills/garden-skills/dist/prompt/claude-design-system-prompt.md',
]);
function check(label, ok, detail) {
  evidence.assertions.push({ label, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail == null ? '' : ' · ' + JSON.stringify(detail)}`);
}
const browser = await launch({ width: 1440, height: 900, args: ['--no-proxy-server'] });
try {
  const page = await browser.newPage();
  page.on('Runtime.exceptionThrown', (e) => evidence.consoleErrors.push(e.exceptionDetails.exception?.description || e.exceptionDetails.text));
  page.on('Runtime.consoleAPICalled', (e) => { if (e.type === 'error') evidence.consoleErrors.push(e.args.map((a) => a.value || a.description).join(' ')); });
  await page.goto(`${base}/resources.html#videos`);
  await page.waitFor('document.querySelectorAll("#grid .card").length === 48');
  check('(a) 视频列表无控制台错误', evidence.consoleErrors.length === 0, evidence.consoleErrors);
  check('(a) 共 703 条', await page.eval('document.querySelector("#result-count").textContent') === '共 703 条');
  check('(a) 首屏 48 张卡', await page.eval('document.querySelectorAll("#grid .card").length') === 48);
  const filters = {};
  for (const [group, value] of [['cat', '3d'], ['tag', 'shader'], ['full', 'post']]) {
    await page.eval(`document.querySelector('[data-group="${group}"][data-value="${value}"]').click()`);
    filters[group] = value;
    const actual = await page.eval('Number(document.querySelector("#result-count").textContent.split(" ")[1])');
    const expected = await page.eval(`window.MA_RES.videos.items.filter(v => ${JSON.stringify(filters.cat)} === v.category && ${filters.tag ? `v.tags.includes(${JSON.stringify(filters.tag)})` : 'true'} && ${filters.full ? `v.partial === ${JSON.stringify(filters.full)}` : 'true'}).length`);
    check(`(b) ${group}=${value}`, actual === expected, { actual, expected });
  }
  const promptStatuses = await page.eval(`(async () => {
    const results = [], items = MA_RES.videos.items;
    for (let i = 0; i < items.length; i += 24) results.push(...await Promise.all(items.slice(i, i + 24).map(async v => ({ slug: v.slug, status: (await fetch('resources/opus-videos/prompts/' + v.slug + '.md')).status }))));
    return results;
  })()`);
  check('(c) 703 份提示词文件全部 200', promptStatuses.length === 703 && promptStatuses.every((r) => r.status === 200), { count: promptStatuses.length, failed: promptStatuses.filter((r) => r.status !== 200) });
  await page.send('Browser.grantPermissions', { origin: base, permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] });
  await page.send('Page.bringToFront');
  async function route(hash, selector, text) {
    await page.eval(`new Promise(resolve => { const hash = ${JSON.stringify(hash)}; if (location.hash === hash) resolve(true); else { addEventListener('hashchange', () => resolve(true), { once: true }); location.hash = hash; } })`);
    await page.waitFor(`document.querySelector(${JSON.stringify(selector)})${text ? `?.textContent.includes(${JSON.stringify(text)})` : ''}`);
  }
  const chosen = [resources.videos.items.find((v) => v.title), resources.videos.items.find((v) => v.partial === 'part'), resources.videos.items.find((v) => v.partial === 'post'),
    resources.videos.items.find((v) => v.slug === 'ajith-io-615243'), resources.videos.items.find((v) => v.slug === '0xlangeai-178533')];
  for (const item of chosen) {
    await route(`#video/${item.slug}`, '#doc h2', 'Prompt');
    await page.waitFor('document.querySelector("#doc pre code")');
    check(`(d) ${item.slug} · Prompt h2 / 代码块`, await page.eval('[...document.querySelectorAll("#doc h2")].some(h => h.textContent === "Prompt") && !!document.querySelector("#doc pre code")'));
    await page.eval('navigator.clipboard.writeText("__before_copy__")');
    await page.send('Runtime.evaluate', { expression: 'document.querySelector("#copy-prompt").click()', userGesture: true });
    await page.waitFor('document.querySelector(".toast-msg.show")?.textContent === "已复制"');
    const copied = await page.eval('navigator.clipboard.readText()');
    const original = upstreamVideos.find((v) => v.slug === item.slug).prompt;
    check(`(d) ${item.slug} · 复制原文`, copied === original, { originalLength: original.length, copiedLength: copied.length, equalAfterCRLFToLF: copied.replace(/\r\n/g, '\n') === original });
    await page.eval('document.querySelector(".toast-msg")?.classList.remove("show")');
  }
  const statuses = new Map(), missing = new Map();
  let markdownCount = 0, linkCount = 0;
  for (const skill of resources.skills) {
    for (const file of skill.files.filter((f) => /\.md$/i.test(f.path))) {
      await route(`#skill/${skill.id}/${file.path}`, '.doc-path', skill.dir.replace('resources/skills/', '') + '/' + file.path);
      markdownCount++;
      const urls = await page.eval(`(() => [...document.querySelectorAll('#doc a[href], #doc img[src]')].map(el => {
        const raw = el.getAttribute(el.tagName === 'IMG' ? 'src' : 'href');
        if (raw.startsWith('#skill/')) {
          const [, id, ...parts] = decodeURIComponent(raw.slice(1)).split('/');
          const skill = MA_RES.skills.find(s => s.id === id);
          return { raw, url: new URL(skill.dir + '/' + parts.join('/').split('#')[0], location.href).href };
        }
        return { raw, url: new URL(raw, location.href).href };
      }).filter(item => new URL(item.url).origin === location.origin))()`);
      for (const item of urls) {
        const url = new URL(item.url); url.hash = '';
        linkCount++;
        if (!statuses.has(url.href)) statuses.set(url.href, (await fetch(url)).status);
        const status = statuses.get(url.href);
        if (status >= 400) {
          const path = decodeURIComponent(url.pathname.slice(1));
          if (!missing.has(path)) missing.set(path, { path, status, known: knownMissing.has(path), sources: [] });
          missing.get(path).sources.push({ skill: skill.id, file: file.path, raw: item.raw });
        }
      }
    }
  }
  evidence.missing = [...missing.values()];
  check('(e) 所有 Skill Markdown 阅读视图与站内链接/图片', evidence.missing.every((m) => m.known), { skills: resources.skills.length, markdownCount, linkCount, uniqueURLs: statuses.size, known404: evidence.missing.filter((m) => m.known).length, unexpected404: evidence.missing.filter((m) => !m.known) });
  for (const name of ['guide', 'pipeline', 'archive-os']) {
    const before = fs.readFileSync(`dev/shots/Tres/docs-before-${name}.png`), after = fs.readFileSync(`dev/shots/Tres/docs-after-${name}.png`);
    check(`(f) Markdown 提取前后 ${name} · 1440×900`, before.equals(after), { differingPixels: before.equals(after) ? 0 : '需解码比较', documentHTMLIdentical: fs.readFileSync(`dev/wip/Tres/evidence/docs-before-${name}.html`).equals(fs.readFileSync(`dev/wip/Tres/evidence/docs-after-${name}.html`)) });
  }
  await page.viewport(390, 844);
  for (const [hash, selector, text] of [['#videos', '#grid', null], [`#video/${chosen[0].slug}`, '#doc h2', 'Prompt'], ['#skill/motion-showreel', '.doc-path', '/SKILL.md']]) {
    await route(hash, selector, text);
    const width = await page.eval('document.documentElement.scrollWidth');
    check(`(g) 390×844 ${hash}`, width <= 390, { scrollWidth: width });
  }
  await route('#videos', '#grid');
  await page.eval('document.querySelector(".res-more button").click()');
  check('分页追加 48 张', await page.eval('document.querySelectorAll("#grid .card").length') === 96);
  await page.eval('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
  await page.eval('scrollTo({ top: 620, behavior: "instant" })');
  const listState = await page.eval('({ hash: location.hash, scroll: scrollY, cards: document.querySelectorAll("#grid .card").length, detail: document.querySelector("#grid .card a").getAttribute("href") })');
  await route(listState.detail, '#doc h2', 'Prompt');
  await page.eval('document.querySelector(".res-back").click()');
  await page.waitFor('document.querySelectorAll("#grid .card").length === 96');
  await page.eval('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))');
  const restored = await page.eval('({ hash: location.hash, scroll: scrollY, cards: document.querySelectorAll("#grid .card").length })');
  check('详情返回恢复筛选、分页与滚动位置', restored.hash === listState.hash && restored.cards === listState.cards && restored.scroll === listState.scroll, { saved: listState, restored });
  await page.eval('document.querySelector(".side-toggle").click()');
  check('移动端筛选按钮展开侧栏', await page.eval('document.querySelector("#lib-side").classList.contains("open") && document.querySelector(".side-toggle").getAttribute("aria-expanded") === "true"'));
  await page.eval('document.querySelector(\'[data-group="cat"][data-value="3d"]\').click()');
  check('筛选变化重置为 48 张', await page.eval('document.querySelectorAll("#grid .card").length') === 48);
  await page.eval('document.querySelector("#search").value = "shader"; document.querySelector("#search").dispatchEvent(new Event("input", { bubbles: true })); document.querySelector("#sort").value = "author"; document.querySelector("#sort").dispatchEvent(new Event("change", { bubbles: true }))');
  const searchResult = await page.eval(`(() => {
    const items = MA_RES.videos.items.filter(v => v.category === '3d' && [v.author, v.title || '', v.excerpt].some(s => s.toLowerCase().includes('shader'))).sort((a, b) => a.author.localeCompare(b.author));
    return { expected: items.length, actual: Number(document.querySelector('#result-count').textContent.split(' ')[1]), ordered: [...document.querySelectorAll('#grid .card-title a')].every((a, i) => a.getAttribute('href') === '#video/' + items[i].slug), hash: location.hash };
  })()`);
  check('搜索、作者排序与 replaceState 筛选 URL', searchResult.expected === searchResult.actual && searchResult.ordered && searchResult.hash.includes('cat=3d') && searchResult.hash.includes('q=shader') && searchResult.hash.includes('sort=author'), searchResult);
  await route('#skills', '#grid');
  for (const [repo, expected] of [['agent-anime-skill', 1], ['garden-skills', 6]]) {
    await page.eval(`document.querySelector('[data-group="repo"][data-value="${repo}"]').click()`);
    check(`Skill 来源 ${repo}`, await page.eval('document.querySelectorAll("#grid .card").length') === expected);
  }
  const shots = [
    ['videos', '#videos'], ['videos-3d', '#videos?cat=3d'], ['video-title', `#video/${chosen[0].slug}`], ['video-post', `#video/${chosen[2].slug}`],
    ['skills', '#skills'], ['skill-motion-showreel', '#skill/motion-showreel'], ['skill-ai-handdrawn-video', '#skill/ai-handdrawn-video'], ['skill-chapter-craft', '#skill/web-video-presentation/references/CHAPTER-CRAFT.md'],
  ];
  async function screenshot(name, hash, width, height) {
    await page.viewport(width, height);
    const selector = hash.startsWith('#video/') ? '#doc h2' : hash.startsWith('#skill/') ? '.doc-path' : '#grid';
    await route(hash, selector, hash.startsWith('#skill/') ? hash.endsWith('.md') ? 'CHAPTER-CRAFT.md' : '/SKILL.md' : null);
    await page.eval('document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))');
    await page.eval(`Promise.race([Promise.all([...document.querySelectorAll('img')].filter(img => img.getBoundingClientRect().top < innerHeight && !img.complete).map(img => new Promise(resolve => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); }))), new Promise(r => setTimeout(r, 8000))])`);
    const minFontPx = await page.eval(`Math.min(...[...document.querySelectorAll('body *')].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0).map(el => parseFloat(getComputedStyle(el).fontSize)))`);
    check(`界面字号 ${width} ${hash}`, minFontPx >= 12, { minFontPx });
    const file = `dev/shots/Tres/${width}-${name}.png`;
    await page.screenshot(file);
    evidence.screenshots.push({ file, hash, width, height, minFontPx });
    console.log(`SCREENSHOT ${file} ${hash}`);
  }
  for (const [name, hash] of shots) await screenshot(name, hash, 1440, 900);
  for (const [name, hash] of shots.filter(([n]) => ['videos', 'video-title', 'skill-motion-showreel'].includes(n))) await screenshot(name, hash, 390, 844);
  check('资源页全程无 JavaScript 控制台错误', evidence.consoleErrors.length === 0, evidence.consoleErrors);
  assert.ok(evidence.assertions.every((a) => a.ok), '页面检查存在失败断言');
} finally {
  fs.mkdirSync('dev/wip/Tres/evidence', { recursive: true });
  fs.writeFileSync('dev/wip/Tres/evidence/check-pages.json', JSON.stringify(evidence, null, 2) + '\n');
  await browser.close();
}
