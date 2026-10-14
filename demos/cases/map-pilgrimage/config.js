/*
 * 地图巡礼 · 迁移入口
 * 只改这个文件就能换成你自己的旅程：地点、日期、路线、卡片素材、章节、节奏（时间点）。
 * 所有 t / at 单位为秒；“轨道”思路同剪辑软件：每条轨道是一串按时间排列的事件。
 * 素材：stop.media 或 card.media 填图片路径（相对本目录）即用真实照片；留空则用 scenes.js 生成原创画面。
 */
window.CONFIG = {
  meta: {
    titleCJK: '江南巡游',
    titleEN: "JIANGNAN WALK '26",
    subline: 'BEIJING → HANGZHOU → SUZHOU → SHANGHAI · 10.01 – 10.03',
    handle: '@motion_atlas',
    tz: 'CST',
    totalDays: 3,
    duration: 56,
  },

  // 底图：OpenFreeMap 免费无需密钥；离线或加载失败时自动退回网格底图
  map: {
    style: 'https://tiles.openfreemap.org/styles/positron',
    lib: 'https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js',
    css: 'https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.css',
    attribution: '© OpenStreetMap contributors · OpenFreeMap · © OpenMapTiles',
  },

  palette: {
    paper: '#f2efe8', // 白天底色
    ink: '#16171a',
    nightPaper: '#090c12',
    nightInk: '#e9edf2',
    accent: '#d9632b', // 默认强调色；章节会临时替换
    alert: '#e5483b',
  },

  mascot: { label: 'CAT SPOTTED' },

  music: {
    title: 'Paper Lanterns',
    artist: 'Motion Atlas Original',
    lyrics: [
      { t: 8.4, text: 'Paper lanterns on the water line', sub: '水面上一排纸灯笼' },
      { t: 14.0, text: 'Every bridge I cross remembers me', sub: '走过的每一座桥都记得我' },
      { t: 19.8, text: 'Rain at noon, and sunlight after three', sub: '正午下雨，三点以后放晴' },
      { t: 29.4, text: 'Night comes down the way it always does', sub: '夜晚照旧落下来' },
      { t: 35.0, text: 'Count the gables, count the boats', sub: '数一数山墙，数一数小船' },
      { t: 41.6, text: 'Wrong train, right city, anyway', sub: '坐错了车，城市却没错' },
      { t: 47.0, text: 'All the lights along the river say goodbye', sub: '江边的灯一起说再见' },
    ],
  },

  days: [
    { n: 0, date: 'WED · SEP 30 2026' },
    { n: 1, date: 'THU · OCT 01 2026' },
    { n: 2, date: 'FRI · OCT 02 2026' },
    { n: 3, date: 'SAT · OCT 03 2026' },
  ],

  stops: {
    beijing: { name: 'BEIJING', code: 'PEK', cjk: '北京', lngLat: [116.5975, 40.0801], elev: 35 },
    hangzhou: { name: 'HANGZHOU', code: 'HGH', cjk: '杭州', place: 'WEST LAKE', lngLat: [120.1446, 30.2427], elev: 7, scene: 'lake' },
    suzhou: { name: 'SUZHOU', code: 'SZH', cjk: '苏州', place: 'PINGJIANG ROAD', lngLat: [120.631, 31.315], elev: 4, scene: 'canal' },
    shanghai: { name: 'SHANGHAI', code: 'SHA', cjk: '上海', place: 'THE BUND', lngLat: [121.4903, 31.2397], elev: 6, scene: 'skyline' },
  },

  // 右下角旅程步进器的站点顺序
  stepper: ['beijing', 'hangzhou', 'suzhou', 'shanghai'],

  // 章节主题：标签 + 标题 + 强调色 + 四角框线
  chapters: {
    poetry: { tag: 'POETRY TRAIL', title: '苏轼 · 饮湖上初晴后雨', accent: '#1f8f84' },
    garden: { tag: 'GARDEN CITY', title: '平江路 · 水巷与园林', accent: '#3d58c8' },
  },

  tracks: {
    // 镜头：center[lng,lat] zoom pitch bearing；相邻关键帧之间缓入缓出
    camera: [
      { t: 0, center: [106, 33], zoom: 1.35, pitch: 0, bearing: 0 },
      { t: 3.4, center: [113, 34], zoom: 2.3, pitch: 0, bearing: 0 },
      { t: 8.0, center: [117.4, 35.6], zoom: 3.3, pitch: 0, bearing: 0 },
      { t: 9.8, center: [119.2, 33.0], zoom: 4.6, pitch: 10, bearing: -4 },
      { t: 11.6, center: [120.15, 30.25], zoom: 11.0, pitch: 45, bearing: -12 },
      { t: 20, center: [120.142, 30.246], zoom: 11.6, pitch: 52, bearing: -22 },
      { t: 29.4, center: [120.15, 30.25], zoom: 11.8, pitch: 55, bearing: -30 },
      { t: 32.0, center: [120.42, 30.8], zoom: 8.4, pitch: 28, bearing: -6 },
      { t: 34.6, center: [120.631, 31.315], zoom: 12.6, pitch: 55, bearing: 10 },
      { t: 37.8, center: [120.625, 31.312], zoom: 12.9, pitch: 56, bearing: 18 },
      { t: 38.8, center: [120.5, 31.35], zoom: 10.0, pitch: 38, bearing: 0 },
      { t: 41.4, center: [120.52, 31.34], zoom: 9.8, pitch: 38, bearing: 0 },
      { t: 44.2, center: [121.4903, 31.2397], zoom: 13.6, pitch: 60, bearing: 32 },
      { t: 48.6, center: [121.488, 31.237], zoom: 14.2, pitch: 62, bearing: 44 },
      { t: 51.2, center: [118.4, 34.6], zoom: 4.6, pitch: 0, bearing: 0 },
      { t: 56, center: [118.2, 34.6], zoom: 4.45, pitch: 0, bearing: 0 },
    ],
    // 昼夜：0 白天 → 1 夜晚；中途会经过“灰”的过渡
    night: [
      { t: 0, v: 1 }, { t: 3.3, v: 1 }, { t: 4.2, v: 0 },
      { t: 28.8, v: 0 }, { t: 29.8, v: 1 },
      { t: 32.8, v: 1 }, { t: 33.7, v: 0 },
      { t: 41.4, v: 0 }, { t: 42.6, v: 1 },
      { t: 50.6, v: 1 }, { t: 51.6, v: 0 },
    ],
    // 时钟（当地时间）；同一时刻连续两帧可表示跨天跳变
    clock: [
      { t: 0, time: '06:10' }, { t: 7.8, time: '06:40' }, { t: 11.2, time: '09:12' },
      { t: 20, time: '13:40' }, { t: 28.6, time: '17:10' }, { t: 32.9, time: '21:30' },
      { t: 33.0, time: '08:20' }, { t: 41.3, time: '16:55' }, { t: 41.4, time: '18:40' },
      { t: 50, time: '22:15' }, { t: 50.1, time: '07:50' }, { t: 56, time: '07:52' },
    ],
    // DAY 计数（阶梯变化）
    day: [{ t: 0, n: 0 }, { t: 11.2, n: 1 }, { t: 33.0, n: 2 }, { t: 41.6, n: 3 }],
    // 大号日序卡：DAY 描边 + 数字实心
    dayCard: [{ t: 33.0, n: 2, dur: 2.0 }, { t: 41.6, n: 3, dur: 2.0 }],
    // 旅程进度（0 = 第一站 … 3 = 最后一站），连续值
    progress: [
      { t: 0, v: 0 }, { t: 7.8, v: 0 }, { t: 11.2, v: 1 }, { t: 31.6, v: 1 },
      { t: 34.6, v: 2 }, { t: 41.6, v: 2 }, { t: 44.2, v: 3 }, { t: 56, v: 3 },
    ],
    // 路线：from/to 或 path；style = dash（航线）| rail（地面）| alert（错误路线）
    routes: [
      { id: 'flight', from: 'beijing', to: 'hangzhou', bend: 0.18, style: 'dash', t0: 8.2, t1: 11.3 },
      { id: 'rail1', path: [[120.213, 30.291], [120.38, 30.6], [120.47, 30.95], [120.631, 31.315]], style: 'rail', t0: 31.0, t1: 34.5 },
      { id: 'wrong', path: [[120.631, 31.315], [120.52, 31.36], [120.38, 31.39]], style: 'alert', t0: 38.2, t1: 39.6 },
      { id: 'rail2', path: [[120.631, 31.315], [120.9, 31.33], [121.2, 31.28], [121.4903, 31.2397]], style: 'rail', t0: 41.0, t1: 44.1 },
    ],
    // 地图标记出现时刻（站点 id）
    markers: [
      { stop: 'beijing', t: 1.0 }, { stop: 'hangzhou', t: 1.6 },
      { stop: 'suzhou', t: 33.9 }, { stop: 'shanghai', t: 43.7 },
    ],
    // 地点标题：竖排汉字逐字模糊入场 + 英文打字
    locTitle: [
      { stop: 'hangzhou', t: 11.6, dur: 3.9 },
      { stop: 'suzhou', t: 35.3, dur: 2.8 },
      { stop: 'shanghai', t: 44.3, dur: 3.4 },
    ],
    // 照片卡片：expand 定义“卡片→全屏→回到卡片”
    cards: [
      { stop: 'hangzhou', t: 12.4, until: 20.4, caption: 'WEST LAKE · SU CAUSEWAY', expand: { t: 15.8, hold: 3.0 } },
      { stop: 'suzhou', t: 35.6, until: 38.2, caption: 'PINGJIANG ROAD · CANAL' },
      { stop: 'shanghai', t: 44.9, until: 49.2, caption: 'THE BUND · RIVERSIDE', portrait: true },
    ],
    counter: [{ t: 14.4, n: 1 }, { t: 36.4, n: 2 }, { t: 46.4, n: 3 }],
    // 收集托盘：三个印章位依次点亮
    collect: [
      { t: 13.4, label: '西湖', stop: 'hangzhou' },
      { t: 36.0, label: '平江', stop: 'suzhou' },
      { t: 45.6, label: '外滩', stop: 'shanghai' },
    ],
    chapter: [
      { key: 'poetry', t: 20.6, until: 28.6 },
      { key: 'garden', t: 35.4, until: 38.0 },
    ],
    // 全屏回忆：插画风格 + 回忆框 + 竖排字幕逐字
    flashback: [
      {
        t: 21.6, until: 25.2, scene: 'lake', tag: 'ARCHIVE · AD 1089',
        vtext: '欲把西湖比西子', en: 'Compare West Lake to Xi Shi, the beauty of old.',
        caption: 'Su Causeway — where the poem still holds',
      },
    ],
    // 分屏对比：先实景全屏，再由分割线从左滑到中线
    compare: [
      { t: 25.2, until: 28.9, scene: 'lake', left: 'POSTCARD · 1930s', right: 'REAL · 2026', stamp: '10.01 · 16:50 CST' },
    ],
    toast: [{ t: 29.9, until: 32.0, text: 'TRAVEL NOTE · 2 NEW' }],
    note: [{ t: 30.4, until: 32.6, text: 'Rain on the lake, then sun.\n苏轼 was right.', sign: '@motion_atlas · 10.01' }],
    alert: [
      { t: 38.1, until: 41.0, title: 'WRONG TRAIN', detail: 'G7215 · boarded at Suzhou · heading west to Nanjing', chip: 'REROUTING' },
    ],
    outro: {
      t: 51.0,
      stats: [
        { value: 3, label: 'DAYS · 4 CITIES' },
        { value: 4, label: 'STOPS ON THE ROUTE' },
        { value: 2, label: 'TRAVEL NOTES LEFT' },
        { value: 3, prefix: '×', label: 'CATS SPOTTED' },
        { value: 312, suffix: ' km', label: 'ON THE GROUND · +1,130 km IN THE AIR' },
      ],
      fin: '江南巡游 — fin.',
      credits: [
        'MUSIC · Motion Atlas Original — “Paper Lanterns”（示意，无音轨）',
        'POEM · 苏轼《饮湖上初晴后雨》（公有领域）',
      ],
    },
  },
};
