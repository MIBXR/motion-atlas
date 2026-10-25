import fs from 'node:fs';
const data = {
  'corner-hud': ['配置镜头、时钟、步进器与规尺函数。', '设置日序、日期、进度、歌词、步进器与横竖布局。'],
  'vertical-title-blur': ['配置片名、地名、回忆、收尾的模糊与打字入场。', '设置片名、地点、回忆字幕、收尾与横竖布局。'],
  'route-draw-marker': ['配置镜头、路线、标记、引线、投影与标签避让。', '设置地点、路线、镜头与横竖S1/S2/S3取景。'],
  'day-night-flip': ['配置昼夜配色、镜头、时钟与HUD。', '设置昼夜、镜头、时钟、HUD；镜头固定在34.5s。'],
  'card-expand-fullscreen': ['配置卡片、引线、场景绘制与镜头。', '设置卡片与引线、展开时刻、媒体画面与横竖布局。'],
  'chapter-frame': ['配置章节标签、标题、框线与胶带。', '设置章节轨道、标题、配色、装饰与横竖布局。'],
  'split-compare-stamp': ['配置分屏、两侧场景、边框与印章。', '设置对比轨道、明信片与照片画布、横竖布局。'],
  'collect-counter': ['配置计数、徽章、角色托盘与回弹。', '设置计数与角色事件、镜头和横竖布局。'],
  'alert-reroute': ['配置警示、改道提示、路线与标签。', '设置警示轨道、错误路线、地图与横竖布局。'],
  'outro-stat-stack': ['配置统计行、数值计数与fin.入场。', '设置收尾与横竖布局；58s底图显示完成路线和标记。'],
  'seekable-timeline': ['配置HUD、卡片、引线、镜头、时钟与控制条。', '设置顶部HUD、kix卡片与MIKAN；13s底图配七段拖动。'],
  'film-grain': ['配置场景绘制、颗粒与暗角。', '颗粒按floor(t×12)定位；10.4s地图配机窗照片与回忆。'],
};
for (const [id, [functions, config]] of Object.entries(data)) {
  const p = `entries/patterns/${id}.json`, e = JSON.parse(fs.readFileSync(p, 'utf8'));
  e.migration[0].field = '动效函数';
  e.migration[0].how = functions;
  e.migration[1].how = /MapLibre/.test(e.migration[1].how) ? '配置MapLibre 5.6.0、样式、图层与地图镜像。' : '配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。';
  e.migration[2].how = config;
  e.migration[3].how = e.migration[3].how.replaceAll('caseT ', '').replaceAll('；', '/').replace('固定镜头 ', '镜头');
  e.migration[4].how = '调整声音事件，按巧思时间对齐，保留音色参数。';
  if (e.sound?.description) e.sound.description = '声音随画面事件播放，音色与时刻由乐谱设置。';
  fs.writeFileSync(p, JSON.stringify(e, null, 2) + '\n');
}
