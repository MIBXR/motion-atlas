import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const inventoryPath = 'dev/shots/T4b/inventory/README.md';
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const writeJSON = (file, value) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, file), JSON.stringify(value, null, 2) + '\n');
};
const progress = (message) => fs.appendFileSync(path.join(ROOT, 'dev/wip/T4b/progress.md'), `${new Date().toISOString()} ${message}\n`);
const rounded = (t) => +t.toFixed(6);

const definitions = {
  'corner-hud': {
    summary: '日序、坐标、时钟、歌词与步进器钉在四角，数值随镜头与时间持续更新，中央留给地图。',
    segments: [[7, 13.6], [35.8, 42.4]],
    functions: ['drawHud', 'cameraAt', 'clockAt', 'stepAtX', 'ruleX'],
    data: 'config.js 的 tracks.camera / clock / day / progress / lyrics、stepper 与横竖 layout。',
    layers: '仅 drawHud 的日序、日期、规尺、指南针、坐标、海拔、缩放、时钟、歌词、步进器、比例尺和署名。',
  },
  'vertical-title-blur': {
    summary: '竖排大字从模糊中显影，配副标题与逐字打字；片名、地点、回忆字幕与收尾共用一套入场。',
    segments: [[3.8, 8], [17.9, 21.6], [25.5, 29.6], [57.9, 60]],
    functions: ['drawIntro', 'drawLocTitle', 'drawFlashback', 'drawOutro', 'blurIn', 'typeIn', 'mountScene', 'paintScene'],
    data: 'config.js 的 meta、tracks.locTitle / flashback / outro、横竖 layout；scenes.js 的回忆插画。',
    layers: '片名、地点标题、全屏回忆插画与竖排字幕，以及 drawOutro 的 fin.。',
  },
  'route-draw-marker': {
    summary: '路线按进度描画，车头沿线前进，站点标记弹入并打出双语站名。',
    actions: [
      { label: 'kix', from: 1.5, to: 2.35, at: 0 },
      { label: 'haruka', from: 14.6, to: 17.05, at: 0.6 },
      { label: 'kyoto', from: 16.6, to: 17.45, at: 2.6 },
      { label: 'naraLine', from: 37.4, to: 39.85, at: 4 },
      { label: 'jrNara', from: 39.4, to: 40.25, at: 6 },
      { label: 'walk1', from: 39.4, to: 41.25, at: 7.2 },
      { label: 'naraPark', from: 40.8, to: 41.65, at: 8.6 },
    ],
    functions: ['cameraAt', 'addRouteLayers', 'updateRoutesGL', 'drawRoutesSVG', 'drawMarkers', 'measureMarkerLabels', 'project', 'routeP', 'pointAt'],
    data: 'config.js 的 stops、tracks.routes / markers、tracks.camera；paths.js 的 haruka / naraLine / walk1 几何；横竖 S1 / S2 / S3 固定镜头。',
    layers: '三个固定镜头中的路线、车头、标记圆点与双语标签；jrNara minZoom=13；镜头间使用案例纸色转场。',
  },
  'day-night-flip': {
    summary: '地图配色与 HUD 强调色一起在昼夜之间过渡，交代时间的流逝。',
    segments: [[31.3,35.8],[36.6,39.1]],
    functions: ['dayNight', 'valueAt', 'cameraAt', 'drawHud', 'clockAt', 'classify', 'setPaint'],
    data: 'config.js 的 map / mapPalette、tracks.night / camera / clock、HUD 轨道与横竖 layout；固定镜头为案例 34.5s。',
    layers: '地图、3D 建筑、HUD 与案例暖色 wash；镜头固定为案例 34.5s，HUD 与昼夜值按 caseT 31.3→35.8、36.6→39.1 求值。',
  },
  'card-expand-fullscreen': {
    summary: '照片卡片由引线牵出，展开到全屏停留，再收回原位。',
    segments: [[18.4, 24.6]],
    functions: ['drawCards', 'drawLeader', 'drawMarkers', 'measureMarkerLabels', 'mountScene', 'sceneCanvas', 'paintScene'],
    data: 'config.js 的 inari、tracks.cards 与 expand、横竖 layout；20.4s 底图对应的横竖屏幕锚点；scenes.js 的 torii 照片画布。',
    layers: 'inari 标记、引线、照片卡片、全屏展开与收回。',
  },
  'chapter-frame': {
    summary: '章节标签配框线或胶带网点入场，为一段旅程划出章节。',
    segments: [[24.2, 25.85], [33, 33.8], [40.6, 44.8]],
    functions: ['drawChapter', 'applyStaticLayout'],
    data: 'config.js 的 chapters、tracks.chapter、横竖 layout；案例框线 SVG、胶带 CSS 和半色调画布。',
    layers: 'drawChapter 的章节标签、框线、四角方块、胶带与网点。',
  },
  'split-compare-stamp': {
    summary: '旧明信片与今日实景左右对比，分割线划过后盖上时间戳。',
    segments: [[29, 33.4]],
    functions: ['drawCompare', 'mountScene', 'sceneCanvas', 'paintScene'],
    data: 'config.js 的 tracks.compare 与横竖 layout；scenes.js 的 postcard / photo 两侧画布。',
    layers: 'drawCompare 的两侧插画、分割线、边框与时间戳印章。',
  },
  'collect-counter': {
    summary: '每到一站计数滚动加一，印章落进托盘，步进器同步前进。',
    segments: [[8.1, 8.9], [12.6, 14], [19.2, 20.4], [41.8, 43], [51.2, 52.6]],
    functions: ['drawHud', 'stepAtX', 'ruleX', 'stampXY'],
    data: 'config.js 的 mascot、stepper、tracks.counter / stamps / progress 与横竖 layout。',
    layers: 'MIKAN 徽章、收集计数、印章托盘与 drawHud 的步进器。',
  },
  'alert-reroute': {
    summary: '坐错车时红色警示横幅压下，错误路线打叉，改道路线重新描画。',
    segments: [[44.8, 50.3]],
    functions: ['drawAlert', 'addRouteLayers', 'updateRoutesGL', 'drawRoutesSVG', 'drawMarkers', 'measureMarkerLabels', 'cameraAt', 'project'],
    data: 'config.js 的 tracks.alert / routes / markers、stops 与 tracks.camera；paths.js 的 wrong / reroute 与已完成路线几何；横竖安全框判断后的固定镜头。',
    layers: '警示横幅、改道胶囊、错误路线与 X、改道路线、该时段标记标签，以及已完成的持续路线。',
  },
  'outro-stat-stack': {
    summary: '收尾时统计数字逐行堆叠，最后以 fin. 收束。',
    segments: [[55.6, 60]],
    functions: ['drawOutro', 'blurIn'],
    data: 'config.js 的 tracks.outro 与横竖 layout；58s 底图包含已完成路线和标记圆点。',
    layers: 'drawOutro 的统计行、数值计数与 fin.。',
  },
  'seekable-timeline': {
    summary: '所有画面都是时间 t 的函数，拖动、倒退、跳转都能得到同一帧。',
    actions: [
      { label: '播放', from: 12, to: 14, at: 0 },
      { label: '播放', from: 12.6, to: 13.4, at: 2.6 },
      { label: '播放', from: 15.5, to: 16.6, at: 3.9 },
      { label: '播放', from: 13, to: 14.4, at: 5.6 },
    ],
    functions: ['render', 'drawHud', 'drawCards', 'drawLeader', 'cameraAt', 'clockAt', 'controls'],
    data: 'config.js 的顶部 HUD / kix 卡片 / mascot 轨道、tracks.camera 与横竖 layout；13s 底图屏幕锚点；七段拖动曲线和复制的控制条结构 / CSS。',
    layers: '顶部 HUD（日序、日期、进度线、指南针、坐标、海拔、缩放与时钟）、kix 卡片与引线、MIKAN 徽章、控制条上方右对齐的署名，以及舞台内随 caseT 更新的复制控制条。',
  },
  'film-grain': {
    summary: '动态胶片颗粒与暗角覆盖地图、照片和插画，统一整片的质感。',
    functions: ['render', 'sceneCanvas', 'paintScene', 'grainPass', 'vignette'],
    data: '案例舞台颗粒纹理生成与 floor(t×12) 定位代码、grain / vignette CSS；10.4s 地图底图；scenes.js 的 window 照片和 kamo 回忆插画。',
    layers: '地图、kix 照片画布与回忆插画三段全屏底，以及案例颗粒和暗角。',
  },
};

export const IDS = Object.keys(definitions);

export function inventoryEvents(id) {
  const markdown = read(inventoryPath);
  const heading = `## ${id}\n`;
  const start = markdown.indexOf(heading);
  if (start < 0) throw new Error(`Missing inventory section: ${id}`);
  const next = markdown.indexOf('\n## ', start + heading.length);
  const section = markdown.slice(start, next < 0 ? undefined : next);
  return [...section.matchAll(/^\|\s*(\d+(?:\.\d+)?)\s*\|\s*([a-zA-Z][a-zA-Z0-9-]*)\s*\|\s*`(\{[^`]*\})`\s*\|\s*$/gm)]
    .map((match) => ({ t: Number(match[1]), voice: match[2], ...JSON.parse(match[3]) }));
}

function sequentialActions(segments) {
  let at = 0;
  return segments.map(([from, to], i) => {
    const action = { from, to, at: rounded(at), label: String.fromCharCode(65 + i) };
    at += to - from;
    return action;
  });
}

function uniqueEvents(events) {
  return [...new Map(events.map((event) => [JSON.stringify(event), event])).values()];
}

export function scoreFor(id) {
  const definition = definitions[id];
  let source = inventoryEvents(id);
  const origins = new Map(source.map((event) => [JSON.stringify(event), id]));
  if (id === 'seekable-timeline') {
    source = uniqueEvents(['corner-hud', 'card-expand-fullscreen', 'collect-counter'].flatMap((section) => inventoryEvents(section).map((event) => {
      origins.set(JSON.stringify(event), section);
      return event;
    })));
  }
  const trace = [];
  if (id === 'film-grain') {
    const event = source.find((event) => event.voice === 'vinyl');
    trace.push({ source: id, caseT: event.t, action: '地图上的颗粒', event: { ...event, t: 0, gain: (event.gain ?? 1) * 0.5 } });
    trace.push({ source: id, caseT: event.t, action: '插画颗粒', event: { ...event, t: 5 } });
  } else {
    const actions = definition.actions || sequentialActions(definition.segments);
    for (const action of actions) for (const event of source) {
      if (event.t >= action.from && event.t < action.to) {
        trace.push({ source: origins.get(JSON.stringify(event)), caseT: event.t, action: action.label, event: { ...event, t: rounded(action.at + event.t - action.from) } });
      }
    }
    if (id === 'seekable-timeline') {
      const tick = inventoryEvents('vertical-title-blur').find((event) => event.voice === 'tick');
      for (const t of [2, 3.4, 5]) trace.push({ source: 'vertical-title-blur', caseT: tick.t, action: '拖动提示', event: { ...tick, t } });
    }
  }
  const score = uniqueEvents(trace.map(({ event }) => event)).sort((a, b) => a.t - b.t);
  return { score, trace, sourceCount: source.length };
}

export function writeScores() {
  const index = {};
  for (const id of IDS) {
    const { score, trace, sourceCount } = scoreFor(id);
    writeJSON(`demos/patterns/${id}/score.json`, score);
    index[id] = { source: inventoryPath, sourceCount, eventCount: score.length, voices: [...new Set(score.map((event) => event.voice))], trace };
    progress(`${id}: score.json generated from its inventory event table (${score.length} events).`);
  }
  writeJSON('dev/shots/T4b/audio/event-map.json', index);
  return index;
}

function readConfig(id) {
  const sandbox = { window: {} };
  vm.runInNewContext(read(`demos/patterns/${id}/config.js`), sandbox, { filename: `${id}/config.js` });
  return sandbox.window.CONFIG;
}

function cssVariables() {
  const css = read('demos/cases/map-pilgrimage/style.css');
  const declarations = [css.match(/:root\s*\{([^}]+)\}/)[1], css.match(/\.stage\s*\{([^}]+)\}/)[1]].join('\n');
  return Object.fromEntries([...declarations.matchAll(/(--[a-z-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
}

export function updateEntry(id, config) {
  const file = `entries/patterns/${id}.json`;
  const entry = JSON.parse(read(file));
  const definition = definitions[id];
  const { score } = scoreFor(id);
  const voices = [...new Set(score.map((event) => event.voice))];
  const variables = cssVariables();
  const duration = config.duration ?? config.meta?.duration;
  if (!(duration > 0) || !Array.isArray(config.segments) || !Array.isArray(config.markers)) throw new Error(`${id}: final config duration / segments / markers required`);
  let clips = config.segments.map((segment) => `caseT ${segment.from}→${segment.to}`).join('；');
  if (id === 'route-draw-marker') clips = definition.actions.map((action) => `${action.label}: caseT ${action.from}→${action.to}`).join('；');
  if (id === 'day-night-flip') clips = 'caseT 31.3→35.8；caseT 36.6→39.1；固定镜头 caseT 34.5，全部 HUD 按片段求值';
  if (id === 'film-grain') clips = '地图固定 caseT 10.4；kix 照片画布固定 caseT 13.5；回忆插画画布固定 caseT 27.56';
  const timing = config.markers.map((marker) => ({ name: marker.label, value: `${marker.t}s` }));
  timing.push({ name: '时长', value: `${duration}s` }, { name: '声音 voice', value: voices.join('、') });
  entry.summary = definition.summary;
  entry.mechanism = `${definition.layers}以巧思时间 t 映射到案例时刻 caseT，复制函数 ${definition.functions.join('、')} 按 caseT 求值。`;
  entry.trigger = '播放、暂停或 seek 到巧思时间 t。';
  entry.effect = definition.summary;
  entry.timing = timing;
  entry.markers = config.markers.map((marker) => ({ t: marker.t, label: marker.label }));
  entry.sound = { voices, score: `demos/patterns/${id}/score.json`, description: `MotionKit.audio.attach 挂接事件：${voices.join('、')}。` };
  if(id==='seekable-timeline')entry.sound.description=`MotionKit.audio.attach 挂接卡片、MIKAN 计数、印章与拖动提示事件：${voices.join('、')}；无独立步进器声音。`;
  entry.tokens = {
    palette: [...new Set(Object.values(variables).filter((value) => /^#[0-9a-f]+$/i.test(value)))],
    type: '案例 CSS 的 --f-sans / --f-display / --f-mono / --f-ja / --f-zh / --f-mincho / --f-serif / --f-hand / --f-hand-ja；舞台字号按设计决定，不设下限；网站界面 ≥ 12px。',
    css: variables,
    motion: timing.filter((item) => item.name !== '声音 voice'),
  };
  const liveMap = ['route-draw-marker', 'day-night-flip', 'alert-reroute'].includes(id);
  const surface = liveMap ? '使用固定镜头的实时地图' : id === 'film-grain' ? '使用固定地图底图与给定 caseT 的程序画布' : '使用固定底图与屏幕锚点';
  entry.prompt = `${definition.summary}复用地图巡礼的 ${definition.functions.join('、')} 与对应 CSS。${definition.layers}片段：${clips}；时长 ${duration}s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，${surface}，声音由 score.json 挂接。`;
  entry.accessibility = { reducedMotion: '可使用时间轴暂停在完整帧。', keyboard: '空格播放/暂停，←/→ 跳 1 秒，Shift+←/→ 跳到上/下一个标记。' };
  entry.composition.notes = definition.layers;
  entry.sources = [{ caseId: 'map-pilgrimage', observation: definition.summary, evidence: 'observed', locator: clips }];
  entry.migration = [
    { field: '复制的函数', how: definition.functions.join('、') },
    { field: '依赖', how: `MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。${liveMap ? '实时地图使用案例 MapLibre 5.6.0、样式 URL、自定义图层与 tilemirror / demmirror 参数。' : ''}` },
    { field: '需要的数据', how: definition.data },
    { field: 'config.js → segments / markers', how: clips },
    { field: 'score.json', how: `事件 voice：${voices.join('、')}；保持 inventory 中全部音色参数，t 映射为巧思时刻。` },
  ];
  writeJSON(file, entry);
  progress(`${id}: entry updated from final config (${duration}s / ${config.markers.length} markers).`);
  return entry;
}

export function updateEntries() {
  return IDS.map((id) => updateEntry(id, readConfig(id)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (!process.argv.includes('--entries-only')) {
    const index = writeScores();
    console.log(JSON.stringify(Object.fromEntries(Object.entries(index).map(([id, item]) => [id, { events: item.eventCount, voices: item.voices }]))));
  }
  if (!process.argv.includes('--scores-only')) {
    updateEntries();
    console.log('Updated entries from all 12 final configs.');
  }
}
