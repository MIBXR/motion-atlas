import fs from 'node:fs';
import { launch } from '../../../../scripts/lib/cdp.mjs';
const browser = await launch({width:1440,height:900});
const checks = [];
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:4326/lab.html');
  checks.push(await page.eval(String.raw`(() => {
    document.querySelector('#exTabs [data-k="prompt"]').click();
    const text = document.getElementById('exOut').textContent;
    const sentences = text.split(/[。！？\n]/).filter(Boolean);
    return {name:'lab prompt', maxSentence:Math.max(...sentences.map(s=>[...s].length)), text};
  })()`));
  await page.goto('http://localhost:4326/');
  checks.push(await page.eval(String.raw`({name:'home carriers', cards:document.querySelectorAll('#carriers .carrier').length, labels:[...document.querySelectorAll('#carriers h3')].map(h=>h.textContent), footer:document.getElementById('site-footer').textContent.replace(/\s+/g,' ').trim()})`));
  await page.goto('http://localhost:4326/patterns.html');
  await page.viewport(390,844);
  checks.push(await page.eval('({name:"pattern mobile", overflow:document.documentElement.scrollWidth>innerWidth+1, width:innerWidth, selects:[...document.querySelectorAll(".toolbar select")].map(s=>[s.id,s.getBoundingClientRect().width])})'));
} finally { await browser.close(); }
fs.writeFileSync('dev/wip/Tcopy/page-checks.json',JSON.stringify(checks,null,2)+'\n');
console.log(JSON.stringify(checks,null,2));
