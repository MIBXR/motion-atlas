import fs from 'node:fs';
import path from 'node:path';
import {directEntry,openBrowser,openCase,savePlate,seekIdle,snapshot,plateName} from './plate.mjs';

directEntry();
const specs = {
  'corner-hud': [[10.4,'map'],[41,'map']],
  'vertical-title-blur': [[5.95,'map'],[19.7,'map'],[58,'map,routes,markers']],
  'card-expand-fullscreen': [[20.4,'map']],
  'chapter-frame': [[24.6,'map'],[41,'map']],
  'split-compare-stamp': [[24.6,'map']],
  'collect-counter': [[10.4,'map'],[20.4,'map'],[41,'map'],[51.6,'map']],
  'outro-stat-stack': [[58,'map,routes,markers']],
  'seekable-timeline': [[13,'map']],
  'film-grain': [[10.4,'map']],
};
const unique = [...new Map(Object.values(specs).flat().map(([t,layers])=>[`${t}:${layers}`,[t,layers]])).values()];
const anchors = {landscape:{},portrait:{}};
const manifest = {plates:[],copies:[],anchors:'dev/wip/T4b/anchors.json'};
const browser = await openBrowser();
try {
  for (const orient of ['landscape','portrait']) {
    const source = await openCase(browser,orient);
    for (const t of [...new Set(unique.map(([t])=>t))]) {
      await seekIdle(source,t);
      anchors[orient][t] = {caseT:t,...await snapshot(source)};
    }
    await source.send('Page.close');
    fs.writeFileSync('dev/wip/T4b/anchors.json',JSON.stringify(anchors,null,2)+'\n');
    fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：${orient} 全部9个底图时刻的屏幕锚点、镜头、标签框和引线已提取到 dev/wip/T4b/anchors.json。\n`);
    for (const layers of ['map','map,routes,markers']) {
      const page = await openCase(browser,orient,layers);
      for (const [t,mode] of unique.filter(([,mode])=>mode===layers)) {
        const name = plateName(t,orient,mode)+'.webp';
        const canonical = `dev/shots/T4b/plates/${name}`;
        const record = await savePlate(page,t,orient,mode,canonical);
        manifest.plates.push(record);
        for (const [id,list] of Object.entries(specs)) if (list.some(([tt,ll])=>tt===t&&ll===mode)) {
          const target = `demos/patterns/${id}/plates/${name}`;
          fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(canonical,target);
          manifest.copies.push({id,caseT:t,orient,layers:mode,file:target,source:canonical});
        }
      }
      await page.send('Page.close');
    }
    fs.writeFileSync('dev/shots/T4b/plates/manifest.json',JSON.stringify(manifest,null,2)+'\n');
    fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：${orient} 9张不重复底图已生成并分发至9个静态巧思plates目录（16个文件），原生尺寸、WebP82、idle及所有可见瓦片loaded均通过。\n`);
  }
} finally { await browser.close(); }
console.log(JSON.stringify({unique:manifest.plates.length,files:manifest.copies.length,anchors:manifest.anchors}));
