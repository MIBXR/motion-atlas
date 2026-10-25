import fs from 'node:fs';
import { launch } from '../../Tlayout/tools/browser.mjs';

const base = 'http://localhost:4326';
const browser = await launch({ width: 1440, height: 900 });
const results = [];
const snapshot = page => page.eval(`({
  search: location.search,
  controls: [...document.querySelectorAll('.toolbar select')].map(s => [s.id, s.value]),
  sidebar: [...document.querySelectorAll('.lib-side [data-group]')].map(b => [b.dataset.group, b.dataset.value, b.getAttribute('aria-pressed'), b.querySelector('.count').textContent]),
  ids: [...document.querySelectorAll('#grid .card-title a')].map(a => a.hash)
})`);
function check(kind, name, actual, expected) {
  results.push({ kind, name, pass: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
}
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  for (const kind of ['cases', 'patterns']) {
    await page.goto(`${base}/${kind}.html`);
    await page.waitFor('document.querySelector("#sort") && document.querySelector(".nav-toggle")');
    const records = await page.eval(`(async () => {
      const kind = ${JSON.stringify(kind)}, records = [], items = MA[kind];
      const group = kind === 'cases' ? 'carrier' : 'type';
      function check(name, actual, expected) {
        records.push({ name, pass: JSON.stringify(actual) === JSON.stringify(expected), actual, expected });
      }
      const select = (id, value) => {
        const el = document.getElementById(id);
        el.value = value; el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const side = value => document.querySelector('[data-group="' + group + '"][data-value="' + value + '"]').click();
      const ids = () => [...document.querySelectorAll('#grid .card-title a')].map(a => a.hash.split('/').pop());
      const expected = (type, carrier, caseId, query = '', fav = false) => items.filter(p =>
        (type === 'all' || p.types.includes(type)) && (carrier === 'all' || p.carriers.includes(carrier)) &&
        (caseId === 'all' || p.sources.some(s => s.caseId === caseId)) && (!fav || Site.favs.has(kind, p.id)) &&
        (!query || [p.id, p.title, p.subtitle, p.summary, ...(p.tags || []), ...(p.useCases || []), p.mechanism, p.trigger, p.effect,
          ...p.carriers.map(c => MA.taxonomy.carriers[c]), ...(p.types || []).map(t => MA.taxonomy.types[t])].filter(Boolean).join(' ').toLowerCase().includes(query))
      );
      function counts(type, carrier, caseId, query = '', fav = false) {
        for (const b of document.querySelectorAll('[data-group="' + group + '"]')) {
          const value = b.dataset.value;
          const want = expected(group === 'type' ? value : type, group === 'carrier' ? value : carrier, caseId, query, fav).length;
          check('facet count ' + [type, carrier, caseId, query, fav, value].join('/'), Number(b.querySelector('.count').textContent), want);
        }
      }
      check('sidebar groups', [...document.querySelectorAll('.lib-side summary, .lib-side h2')].map(h => h.textContent), [kind === 'cases' ? '载体' : '类型', '收藏与工具']);
      check('sidebar default open', document.querySelector('.lib-side details').open, true);
      check('toolbar filters', [...document.querySelectorAll('.toolbar select.select')].map(s => s.id), kind === 'cases' ? [] : ['carrier-filter', 'case-filter']);
      check('sort accessible name', document.querySelector('#sort').getAttribute('aria-label'), '排序方式');
      check('sort options', [...document.querySelector('#sort').options].map(o => [o.value, o.text]), [['order', '编号'], ['title', '名称']]);
      check('default order', ids(), [...items].sort((a, b) => a.order - b.order).map(x => x.id));
      check('default URL omits sort', new URLSearchParams(location.search).has('sort'), false);
      const types = kind === 'patterns' ? ['all', ...Object.keys(MA.taxonomy.types)] : ['all'];
      const cases = kind === 'patterns' ? ['all', ...MA.cases.map(c => c.id)] : ['all'];
      const carriers = ['all', ...Object.keys(MA.taxonomy.carriers)];
      for (const type of types) for (const carrier of carriers) for (const caseId of cases) {
        if (kind === 'patterns') { side(type); select('carrier-filter', carrier); select('case-filter', caseId); }
        else side(carrier);
        const want = expected(type, carrier, caseId).map(p => p.id);
        const label = [type, carrier, caseId].join('/');
        check('filter ' + label, ids(), want);
        check('result count ' + label, document.querySelectorAll('#grid .card').length, want.length);
        check('sidebar selection ' + label, document.querySelector('[data-group="' + group + '"][aria-pressed="true"]').dataset.value, kind === 'cases' ? carrier : type);
        counts(type, carrier, caseId);
        const q = new URLSearchParams(location.search);
        check('carrier URL ' + label, q.get('carrier'), carrier === 'all' ? null : carrier);
        if (kind === 'patterns') {
          check('type URL ' + label, q.get('type'), type === 'all' ? null : type);
          check('case URL ' + label, q.get('case'), caseId === 'all' ? null : caseId);
        }
        await new Promise(r => setTimeout(r, 200));
      }
      side('all');
      if (kind === 'patterns') { select('carrier-filter', 'all'); select('case-filter', 'all'); }
      const search = document.querySelector('#search');
      search.value = '档案'; search.dispatchEvent(new Event('input', { bubbles: true }));
      check('search results', ids(), expected('all', 'all', 'all', '档案').map(p => p.id));
      counts('all', 'all', 'all', '档案');
      Site.favs.toggle(kind, items[0].id);
      document.querySelector('[data-group="fav"]').click();
      counts('all', 'all', 'all', '档案', true);
      side(kind === 'cases' ? 'console' : 'rhythm');
      check('facet preserves favorites', new URLSearchParams(location.search).get('fav'), '1');
      check('facet preserves search', document.querySelector('#search').value, '档案');
      counts(kind === 'cases' ? 'all' : 'rhythm', kind === 'cases' ? 'console' : 'all', 'all', '档案', true);
      document.querySelector('[data-group="fav"]').click();
      Site.favs.toggle(kind, items[0].id);
      side('all');
      const resetSearch = document.querySelector('#search');
      resetSearch.value = ''; resetSearch.dispatchEvent(new Event('input', { bubbles: true }));
      select('sort', 'title');
      check('name sorting', ids(), [...items].sort((a,b) => a.title.localeCompare(b.title, 'zh')).map(p => p.id));
      check('name sort URL', new URLSearchParams(location.search).get('sort'), 'title');
      select('sort', 'order');
      check('order sorting', ids(), items.map(p => p.id));
      check('order URL omitted', new URLSearchParams(location.search).has('sort'), false);
      return records;
    })()`);
    results.push(...records.map(r => ({ kind, ...r })));
    await page.goto(`${base}/${kind}.html`);
    await page.waitFor('document.querySelector("#sort")');
    const clean = await snapshot(page);
    const url = `${base}/${kind}.html?carrier=console${kind === 'patterns' ? '&type=rhythm&case=archive-os' : ''}&sort=title`;
    await page.goto(url);
    await page.waitFor('document.querySelector("#sort")');
    const before = await snapshot(page);
    const initialCount = await page.eval(`MA[${JSON.stringify(kind)}].filter(p => p.carriers.includes('console') && (${JSON.stringify(kind)} === 'cases' || (p.types.includes('rhythm') && p.sources.some(s => s.caseId === 'archive-os')))).length`);
    check(kind, 'URL initial restoration', await page.eval(`({ carrier: new URLSearchParams(location.search).get('carrier'), type: document.querySelector('[data-group="type"][aria-pressed="true"]')?.dataset.value || null, sort: document.querySelector('#sort').value, count: document.querySelectorAll('#grid .card').length })`), { carrier: 'console', type: kind === 'patterns' ? 'rhythm' : null, sort: 'title', count: initialCount });
    await page.goto(url);
    await page.waitFor('document.querySelector("#sort")');
    check(kind, 'URL reload round trip', await snapshot(page), before);
    await page.goto(`${base}/${kind}.html`);
    await page.waitFor('document.querySelector("#sort")');
    await page.eval('history.back()');
    await page.waitFor('location.search.includes("carrier=console") && document.querySelector("#sort")?.value === "title"');
    check(kind, 'browser back restores URL and controls', await snapshot(page), before);
    await page.eval('history.forward()');
    await page.waitFor('location.search === "" && document.querySelector("#sort")?.value === "order"');
    check(kind, 'browser forward restores defaults', await snapshot(page), clean);
    await page.goto(`${base}/${kind}.html?source=reference&sort=curated`);
    await page.waitFor('document.querySelector("#sort")');
    check(kind, 'removed URL values normalized', await page.eval('({search: location.search, sort: document.querySelector("#sort").value})'), { search: '', sort: 'order' });
  }
  check('all', 'runtime exceptions', errors, []);
} catch (error) {
  results.push({ name: 'script completion', pass: false, error: error.message });
} finally { await browser.close(); }
fs.writeFileSync('dev/wip/Tlayout/filter-results.json', JSON.stringify(results, null, 2) + '\n');
const passed = results.filter(r => r.pass).length;
console.log(`filters ${passed}/${results.length} passed · sidebar facets, combined filters, contextual counts, sorting, URL reload/back/forward`);
for (const r of results.filter(r => !r.pass)) console.error(JSON.stringify(r));
if (passed !== results.length) process.exitCode = 1;
