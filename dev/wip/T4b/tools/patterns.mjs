import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const sourceDir = path.join(root, 'demos/cases/map-pilgrimage');
const toolsDir = path.join(root, 'dev/wip/T4b/tools');
const read = (name) => fs.readFileSync(path.join(sourceDir, name), 'utf8');
const definitions = [
  ['corner-hud', [[7,13.6,10.4,'顶部 HUD 入场'],[35.8,42.4,41,'跨天']], .6],
  ['vertical-title-blur', [[3.8,8,5.95,'片名'],[17.9,21.6,19.7,'地点标题'],[25.5,29.6,null,'回忆竖排字幕'],[57.9,60,58,'fin.','map,routes,markers']], 0],
  ['route-draw-marker', [[0,3.6,null,'机场'],[4,6.8,null,'第二段'],[7.2,10.6,null,'步行']], 0],
  ['day-night-flip', [[31.3,35.8,null,'白天与入夜'],[36.6,39.1,null,'天亮']], 0],
  ['card-expand-fullscreen', [[18.4,24.6,20.4,'出卡']], .4],
  ['chapter-frame', [[24.2,25.85,24.6,'鸭川框线入场'],[33,33.8,24.6,'框线退场'],[40.6,44.8,41,'奈良胶带与网点']], .4],
  ['split-compare-stamp', [[29,33.4,24.6,'分屏']], .4],
  ['collect-counter', [[8.1,8.9,10.4,'徽章出现'],[12.6,14,10.4,'×1 + 关空'],[19.2,20.4,20.4,'×2 + 京都'],[41.8,43,41,'×3 + 奈良'],[51.2,52.6,51.6,'×4 + 大阪']], .6],
  ['alert-reroute', [[44.8,50.3,null,'警示改道']], .7],
  ['outro-stat-stack', [[55.6,60,58,'统计','map,routes,markers']], .8],
  ['seekable-timeline', [[12,14,13,'播放'],[14,12.6,13,'倒拖'],[12.6,13.4,13,'播放'],[13.4,15.5,13,'前跳'],[15.5,16.6,13,'播放'],[16.6,13,13,'再倒拖'],[13,14.4,13,'播放']], 0],
  ['film-grain', [[10.4,12.9,10.4,'地图上的颗粒'],[13.5,16,null,'照片颗粒'],[27.56,30.06,null,'插画颗粒']], 0],
];
const liveIds = new Set(['route-draw-marker','alert-reroute','day-night-flip']);
const ctx = {window:{}};
vm.runInNewContext(read('config.js'), ctx);
const caseConfig = ctx.window.CONFIG;
const anchorFile = path.join(root,'dev/wip/T4b/anchors.json');
const anchors = fs.existsSync(anchorFile) ? JSON.parse(fs.readFileSync(anchorFile,'utf8')) : {};
let source = read('script.js');
source = source.replace('const C = window.CONFIG;', 'const PC = window.CONFIG;\n  const C = window.CASE_CONFIG;\n  const isLive = [\'route-draw-marker\',\'alert-reroute\',\'day-night-flip\'].includes(PC.id);');
source = source.replace("const layerMode = ['map', 'map,routes,markers'].includes(layerParam) ? layerParam : null;", 'const layerMode = null;');
source = source.replace('function project(ll) {', `function project(ll) {
    if (!isLive) {
      const stops = PC.anchors[O]?.[String(currentPlateT)]?.stops || {};
      const stop = Object.values(S).find(s => s.lngLat[0] === ll[0] && s.lngLat[1] === ll[1]);
      const id = Object.keys(S).find(id => S[id] === stop);
      return stops[id] || {x:-10000,y:-10000};
    }`);
const renderStart = source.indexOf('  function render(t) {');
const renderEnd = source.indexOf('  /* ---------- 路线（GL） ---------- */', renderStart);
const renderSource = source.slice(renderStart,renderEnd);
const colorStart = renderSource.indexOf('    /* --- 覆盖程度');
const colorEnd = renderSource.indexOf('    /* --- 地图配色');
const contextSource = renderSource.slice(colorStart,colorEnd);
const grainStart = renderSource.indexOf('    /* --- 质感');
const grainEnd = renderSource.indexOf('    /* --- 地图降级',grainStart);
const grainSource = renderSource.slice(grainStart,grainEnd);
source = source.slice(0,renderStart) + '__PATTERN_RUNTIME__\n' + source.slice(renderEnd);
const audioStart = source.indexOf('  const at = (bar, beat = 0)');
source = source.slice(0,audioStart);
source = source.replace('  const stageEl =', '  let currentPlateT = null;\n  const stageEl =');
const kit = read('motion-kit.js');
const controlStart = kit.indexOf('    style.textContent = `',kit.indexOf('  function controls('))+25;
const controlEnd = kit.indexOf('`;',controlStart);
const controlCSS = kit.slice(controlStart,controlEnd);
const scaledControlCSS = ['landscape','portrait'].map(orient=>{
  const k=(orient==='landscape'?24:36)/13;
  const selector=`[data-orient="${orient}"] `;
  return controlCSS.replace(/(-?[\d.]+)px/g,(_,n)=>`${+(Number(n)*k).toFixed(5)}px`).replace(/\.mk-controls/g,`${selector}.mk-controls`);
}).join('\n');
const runtime = fs.readFileSync(path.join(toolsDir,'pattern-runtime.js'),'utf8')
  .replace('__CASE_CONTEXT__', contextSource).replace('__CASE_GRAIN__',grainSource).replace('__CONTROL_CSS__',scaledControlCSS);
const liveFile = path.join(toolsDir,'live-runtime.js');
const liveRuntime = fs.existsSync(liveFile) ? fs.readFileSync(liveFile,'utf8') : 'async function initPatternMap() {}\nfunction renderLive(t) { return drawPattern(t); }';
const html = read('index.html').replace(/\s*<link rel="(?:preconnect|preload)"[^>]*>/g,'')
  .replace('<script src="config.js"></script>', '<script src="config.js"></script>')
  .replace('    <canvas id="space"', '    <div id="plates" class="plates" aria-hidden="true"></div>\n    <canvas id="space"');
const css = read('style.css') + `\n.pattern-off{display:none!important}\n.plates{inset:0;z-index:0;overflow:hidden}.plate{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:center}\n[data-pattern="vertical-title-blur"] .ou-stats,[data-pattern="vertical-title-blur"] .ou-credits{visibility:hidden!important}\n[data-pattern="seekable-timeline"] .scale{display:none!important}\n[data-pattern] .attrib{z-index:10000;opacity:1!important;visibility:visible!important;pointer-events:none}.attrib.pattern-attrib-hidden{display:none!important}\n[data-pattern="seekable-timeline"] .attrib{text-align:right}\n`;

for (const [id, rows, hold] of definitions) {
  let at = 0;
  const seekDur = [2,.6,.8,.5,1.1,.6,1.4];
  const segments = rows.map(([from,to,plate,label,layers='map'],i) => {
    const duration = id === 'seekable-timeline' ? seekDur[i] : to-from;
    const result = {from,to,plate,label,layers,start:+at.toFixed(4),duration:+duration.toFixed(4)};
    at += duration;
    if (id === 'seekable-timeline') result.mode = [1,0,1,0,1,0,1][i] ? 'play' : 'drag';
    return result;
  });
  const selectedAnchors = {};
  if(['card-expand-fullscreen','seekable-timeline'].includes(id)) {
    const stop=id==='card-expand-fullscreen'?'inari':'kix';
    for(const orient of ['landscape','portrait']) {
      selectedAnchors[orient]={};
      for(const segment of segments)if(anchors[orient]?.[String(segment.plate)]) {
        selectedAnchors[orient][String(segment.plate)]={stops:{[stop]:anchors[orient][String(segment.plate)].stops[stop]}};
      }
    }
  }
  const config = {id,duration:+(at+hold).toFixed(4),hold,segments,markers:segments.map(s=>({t:s.start,label:s.label})),anchors:selectedAnchors};
  if (id === 'route-draw-marker') {
    config.duration=10.6;
    config.segments.forEach((s,i)=>{s.start=[0,4,7.2][i];s.duration=[3.6,2.8,3.4][i];});
    config.markers=[{t:0,label:'机场'},{t:.6,label:'描画'},{t:4,label:'第二段'},{t:7.2,label:'步行'}];
    config.actions=[{at:0,from:1.5,to:2.35,stop:'kix'},{at:.6,from:14.6,to:17.05,route:'haruka'},{at:2.6,from:16.6,to:17.45,stop:'kyoto'},{at:4,from:37.4,to:39.85,route:'naraLine'},{at:6,from:39.4,to:40.25,stop:'jrNara'},{at:7.2,from:39.4,to:41.25,route:'walk1'},{at:8.6,from:40.8,to:41.65,stop:'naraPark'}];
  }
  if(id==='day-night-flip')config.markers=[{t:0,label:'白天'},{t:1.5,label:'入夜'},{t:4.5,label:'天亮'}];
  if(id==='card-expand-fullscreen')config.markers=[{t:0,label:'出卡'},{t:2.6,label:'展开'},{t:5.4,label:'收回'}];
  if(id==='split-compare-stamp')config.markers=[{t:0,label:'分屏'},{t:1.65,label:'盖章'}];
  if(id==='alert-reroute')config.markers=[{t:.2,label:'警示'},{t:1.5,label:'错误终点'},{t:2.2,label:'改道'}];
  if(id==='outro-stat-stack')config.markers=[{t:.65,label:'统计'},{t:2.4,label:'fin.'}];
  if(id==='seekable-timeline')config.markers=[{t:0,label:'播放'},{t:2,label:'倒拖'},{t:3.4,label:'前跳'},{t:5,label:'再倒拖'}];
  const dir = path.join(root,'demos/patterns',id);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),html.replace('<title>地图巡礼 · 游戏过场式旅行影像 — Motion Atlas Demo</title>',`<title>${id} — Motion Atlas Demo</title>`));
  fs.writeFileSync(path.join(dir,'style.css'),css);
  fs.writeFileSync(path.join(dir,'config.js'),`window.CASE_CONFIG = ${JSON.stringify(caseConfig,null,2)};\nwindow.CONFIG = ${JSON.stringify(config,null,2)};\n`);
  fs.copyFileSync(path.join(sourceDir,'paths.js'),path.join(dir,'paths.js'));
  fs.copyFileSync(path.join(sourceDir,'scenes.js'),path.join(dir,'scenes.js'));
  fs.writeFileSync(path.join(dir,'script.js'),source.replace('__PATTERN_RUNTIME__',runtime)+'\n'+liveRuntime+`\n  startPattern();\n})();\n`);
  console.log(`${id}: ${config.duration}s, ${segments.length} segments${liveIds.has(id)?', live':''}`);
}
fs.appendFileSync(path.join(root,'dev/wip/T4b/progress.md'),`- ${new Date().toISOString()}：同步十二巧思源码、配置与案例函数/CSS副本；保留score、entries和plates。\n`);
