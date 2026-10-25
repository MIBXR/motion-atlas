import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';

const base = 'http://localhost:4326';
const browser = await launch({ width: 1440, height: 900 });
const results = [];
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('Runtime.exceptionThrown', p => errors.push(p.exceptionDetails?.exception?.description || p.exceptionDetails?.text));
  for (const kind of ['cases', 'patterns']) {
    await page.goto(`${base}/${kind}.html`);
    await page.waitFor('document.querySelector("#carrier-filter")');
    const result = await page.eval(`(async () => {
      const kind = ${JSON.stringify(kind)}, records = [], items = MA[kind];
      function check(name, actual, expected) {
        const pass = JSON.stringify(actual) === JSON.stringify(expected);
        records.push({ name, pass, actual, expected });
        if (!pass) throw new Error(name + ': ' + JSON.stringify({ actual, expected }));
      }
      const select = (id, value) => {
        const el = document.getElementById(id);
        el.value = value; el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const ids = () => [...document.querySelectorAll('#grid .card-title a')].map(a => a.hash.split('/').pop());
      check('sidebar groups', [...document.querySelectorAll('.lib-side h2')].map(h => h.textContent), ['收藏与工具']);
      check('sort options', [...document.querySelector('#sort').options].map(o => [o.value, o.text]), [['order', '编号'], ['title', '名称']]);
      check('default order', ids(), [...items].sort((a, b) => a.order - b.order).map(x => x.id));
      check('default URL omits sort', new URLSearchParams(location.search).has('sort'), false);
      const types = kind === 'patterns' ? ['all', ...Object.keys(MA.taxonomy.types)] : ['all'];
      const cases = kind === 'patterns' ? ['all', ...MA.cases.map(c => c.id)] : ['all'];
      const carriers = ['all', ...Object.keys(MA.taxonomy.carriers)];
      for (const type of types) for (const carrier of carriers) for (const caseId of cases) {
        if (kind === 'patterns') { select('type-filter', type); select('case-filter', caseId); }
        select('carrier-filter', carrier);
        const expected = items.filter(p => (type === 'all' || p.types.includes(type)) && (carrier === 'all' || p.carriers.includes(carrier)) && (caseId === 'all' || p.sources.some(s => s.caseId === caseId))).map(p => p.id);
        check('filter ' + [type, carrier, caseId].join('/'), ids(), expected);
        check('result count ' + [type, carrier, caseId].join('/'), document.querySelectorAll('#grid .card').length, expected.length);
        const q = new URLSearchParams(location.search);
        check('carrier URL ' + [type, carrier, caseId].join('/'), q.get('carrier'), carrier === 'all' ? null : carrier);
        if (kind === 'patterns') { check('type URL ' + type, q.get('type'), type === 'all' ? null : type); check('case URL ' + caseId, q.get('case'), caseId === 'all' ? null : caseId); }
        await new Promise(r => setTimeout(r, 200));
      }
      if (kind === 'patterns') { select('type-filter', 'all'); select('case-filter', 'all'); }
      select('carrier-filter', 'all');
      select('sort', 'title');
      check('name sorting', ids(), [...items].sort((a,b) => a.title.localeCompare(b.title, 'zh')).map(p => p.id));
      check('name sort URL', new URLSearchParams(location.search).get('sort'), 'title');
      select('sort', 'order');
      check('order sorting', ids(), items.map(p => p.id));
      check('order URL omitted', new URLSearchParams(location.search).has('sort'), false);
      return records;
    })()`);
    results.push(...result.map(r => ({ kind, ...r })));
    const url = `${base}/${kind}.html?carrier=console${kind === 'patterns' ? '&type=rhythm&case=archive-os' : ''}&sort=title`;
    await page.goto(url);
    await page.waitFor('document.querySelector("#carrier-filter")');
    const snapshot = () => page.eval(`({ values: [...document.querySelectorAll('.toolbar select')].map(s => [s.id, s.value]), ids: [...document.querySelectorAll('#grid .card-title a')].map(a => a.hash), url: location.href })`);
    const before = await snapshot();
    await page.goto(before.url);
    await page.waitFor('document.querySelector("#carrier-filter")');
    const after = await snapshot();
    const pass = JSON.stringify(before) === JSON.stringify(after);
    results.push({ kind, name: 'URL round trip', pass, actual: after, expected: before });
    if (!pass) throw new Error('URL round trip failed');
    await page.goto(`${base}/${kind}.html?source=reference&sort=curated`);
    await page.waitFor('document.querySelector("#sort")');
    const clean = await page.eval('({search: location.search, sort: document.querySelector("#sort").value})');
    results.push({ kind, name: 'removed source and curated URL normalized', pass: clean.search === '' && clean.sort === 'order', actual: clean, expected: { search: '', sort: 'order' } });
  }
  if (errors.length) throw new Error(errors.join('\n'));
} catch (error) {
  results.push({ name: 'script completion', pass: false, error: error.message });
} finally {
  await browser.close();
}
fs.writeFileSync('dev/wip/Tcopy/filter-results.json', JSON.stringify(results, null, 2) + '\n');
const passed = results.filter(r => r.pass).length;
console.log(`filters ${passed}/${results.length} passed · cases console=1 video=1 · all type/carrier/case combinations, sorting, URL round trips`);
if (passed !== results.length) process.exitCode = 1;
