import fs from 'node:fs';
import vm from 'node:vm';

const ids = ['corner-hud','vertical-title-blur','route-draw-marker','day-night-flip','card-expand-fullscreen','chapter-frame','split-compare-stamp','collect-counter','alert-reroute','outro-stat-stack','seekable-timeline','film-grain'];
const archiveIds = ['boot-typing','rolling-digits','decrypt-reveal','wave-array','idle-breathing'];
const files = ['entries/cases/archive-os.json','entries/cases/map-pilgrimage.json',...ids.map(id=>`entries/patterns/${id}.json`),...archiveIds.map(id=>`entries/patterns/${id}.json`),'AGENT.md','CONTRIBUTING.md','dev/wip/Tcopy/content-diff.md','dev/wip/Tcopy/docs-diff.md','dev/reports/Tcopy.md'];
const dir = 'dev/wip/Tcopy/rework-1';
fs.mkdirSync(dir,{recursive:true});
const snapshot = `${dir}/before.json`;
if (fs.existsSync(snapshot)) throw new Error('Rework baseline already exists; refusing to overwrite');
const before = Object.fromEntries(files.map(p=>[p,fs.readFileSync(p,'utf8')]));
fs.writeFileSync(snapshot,JSON.stringify(before,null,2)+'\n');
const write = (file,e) => fs.writeFileSync(file,JSON.stringify(e,null,2)+'\n');

const archive = JSON.parse(before['entries/cases/archive-os.json']);
archive.focus = '四十份档案按五类排列：可以阅读、查看 3D 模型、拆解再重组结构。画面、声音与操作共用一条时间轴，随时可以暂停和拖动。';
archive.observations = [
  ['档案阵列','五列档案：工程研究、生命科学、机构档案、能量研究、特别项目，每列八份。'],
  ['选择与镜头','选中的档案轻轻抬起，镜头沿阵列平滑跟随，停下时没有回弹。'],
  ['文字滚动','编号与标题切换时滚动约 460ms，页签、检索、收藏随时可用。'],
  ['解密','读取档案时正文沿对角线逐块解密，约 3.6 秒完成。'],
  ['画幅','横屏 1920×1080，画面整体等比缩放。'],
  ['逐字输入','开机文字逐字打出，每个字都配一声短音。'],
  ['浏览节奏','22 秒展开阵列，35 秒读取第一份档案，62.6 秒起四向循环浏览。'],
  ['声音','开机、打字和每一次操作都有对应音效，全片 77.6 秒。'],
].map(([at,what])=>({at,what}));
write('entries/cases/archive-os.json',archive);

const map = JSON.parse(before['entries/cases/map-pilgrimage.json']);
map.observations = [
  ['0:04.8','竖排「関西周遊」从模糊变清，英文逐字打出，每字配键击。'],
  ['0:13.5','左上日序日期，右上坐标海拔缩放时钟；左下曲名歌词，右下步进器印章。'],
  ['0:19–0:20','鸟居卡片沿引线浮入，MIKAN计数上滚，随后盖下京都印章。'],
  ['0:21–0:24','鸟居卡片铺满画面，HUD转白；呼啸后落下低音，再收回地图。'],
  ['0:27.8','河畔插画中，「ゆく河の流れは」「絶えずして」竖排显影，逐字配钟声。'],
  ['0:30.8','明信片与实景并排，「10.01·17:40 JST」斜戳配盖章声。'],
  ['0:33.8','地图逐层转为深蓝黑，HUD变浅色，下扫呼啸接低音。'],
  ['0:41.8','奈良卡片浮入，琥珀色斜纹胶带与网点标出章节。'],
  ['0:45–0:47','红色WRONG TRAIN横幅擦入，REROUTING省略号与蜂鸣同拍。'],
  ['0:58.8','3天4站、4枚印章、×4目击、1次误乘与194km逐行计数，钟声收尾。'],
].map(([at,what])=>({at,what}));
write('entries/cases/map-pilgrimage.json',map);

const copy = {
  'corner-hud': ['旅程开始、需要持续定位时','观众随时知道走到哪、过了多久。'],
  'vertical-title-blur': ['片名、地名或回忆字幕出现时','地名有登场感，章节更容易记住。'],
  'route-draw-marker': ['启程、抵达或切换交通方式时','下一站与行进方向一眼可见。'],
  'day-night-flip': ['一天结束、进入夜晚时','不用字幕也能看出一天过去了。'],
  'card-expand-fullscreen': ['需要停下来细看一处风景时','从路线总览转向现场细节，再回到旅程。'],
  'chapter-frame': ['进入新的旅程章节时','用颜色与边框提示新段落开始。'],
  'split-compare-stamp': ['同一地点的今昔需要对照时','同一地点的时间差异一眼可见。'],
  'collect-counter': ['到站、盖章或发现角色时','每次抵达都有积累感，进度看得见。'],
  'alert-reroute': ['行程出错、需要改道时','先看出哪里出了错，再跟上新的方向。'],
  'outro-stat-stack': ['旅程结束、回顾收获时','把旅程收获汇成一张能读完的结果页。'],
  'seekable-timeline': ['需要回看或比较某段画面时','观众可按自己的节奏反复看清动作。'],
  'film-grain': ['地图、照片与插画交替出现时','不同媒介保持连贯，回忆段更有时间感。'],
};
const timing = [];
for (const id of ids) {
  const file = `entries/patterns/${id}.json`, e = JSON.parse(before[file]);
  [e.trigger,e.effect] = copy[id];
  if (id === 'day-night-flip') {
    e.mechanism = '地图、3D建筑与HUD逐层插值昼夜配色，叠加暖色光。';
    e.composition.notes = e.mechanism;
  }
  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync(`demos/patterns/${id}/config.js`,'utf8'),context);
  const markers = context.window.CONFIG.markers;
  const removed = [], retained = [], uncertain = [];
  e.timing = e.timing.filter(item=>{
    const marker = markers.find(m=>m.label === item.name && item.value === `${m.t}s`);
    if (marker && item.name !== '时长') { removed.push(item); return false; }
    retained.push(item);
    if (!['时长','声音 voice'].includes(item.name)) uncertain.push(item);
    return true;
  });
  timing.push({id,removed,retained,uncertain,markerFile:`demos/patterns/${id}/config.js`});
  write(file,e);
}
fs.writeFileSync(`${dir}/timing-review.json`,JSON.stringify(timing,null,2)+'\n');
for (const file of ['AGENT.md','CONTRIBUTING.md']) {
  let s = before[file].replaceAll('--carrier video|console|showcase','--carrier video|console').replace(' / `showcase` 交互展示台','');
  fs.writeFileSync(file,s);
}
console.log('rework 1 applied · 10 map observations · 12 triggers/effects · '+timing.reduce((n,r)=>n+r.removed.length,0)+' demo marker timing items removed · '+timing.reduce((n,r)=>n+r.uncertain.length,0)+' uncertain');
