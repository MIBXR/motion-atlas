(() => {
  const score = [];
  const add = (t, voice, gain = 1, extra = {}) => score.push({ t, voice, gain, ...extra });
  add(0.4, 'whoosh');
  add(0.4, 'chime');
  for (let i = 0; i <= 12; i++) add(Number((1 + i * 0.2).toFixed(2)), 'tick', 0.3);
  add(3.4, 'whoosh');
  [4.6, 5.4, 5.8, 6.2].forEach(t => add(t, 'click', 0.6));
  add(5, 'key');
  add(10, 'blip');
  add(10.3, 'click');
  add(13, 'click', 0.9);
  add(13.6, 'tick');
  add(14.4, 'impact', 0.7);
  [14.6, 14.9, 15.2].forEach(t => add(t, 'sonar', 0.5));
  for (let i = 0; i < 24; i++) add(Number((16 + i * ((2.5 - 0.12) / 23)).toFixed(6)), 'tick', 0.25);
  for (let i = 0; i < 19; i++) add(18.5 + i * 2, 'sub', 0.2);
  [19, 19.4, 19.8].forEach(t => add(t, 'beep'));
  add(22.8, 'confirm');
  add(25, 'whoosh');
  [27.5, 29.5].forEach(t => add(t, 'chime', 0.5));
  add(32, 'stamp');
  [32.1, 32.25].forEach(t => add(t, 'sparkle'));
  add(35, 'whoosh', 0.6);
  add(36, 'whoosh');
  add(39.4, 'click');
  add(39.6, 'riser', 1, { dur: 0.8 });
  add(40.4, 'impact');
  add(40.4, 'shimmer');
  [43, 43.4, 43.8, 44.2].forEach(t => add(t, 'blip'));
  add(48, 'whoosh');
  add(50, 'paper');
  add(51.6, 'click');
  add(53, 'confirm');
  add(57.4, 'bell');
  add(57.4, 'shimmer');
  add(59.4, 'sub');

  window.CONFIG = {
    duration: 60,
    title: '终末地 · 集成工业协议',
    en: 'Endfield · AIC Protocol',
    sound: true,
    seed: 20261023,
    tokens: {
      ink: '#17191b', panel: 'rgba(28,30,33,.86)', glass: 'rgba(236,238,238,.88)',
      paper: '#e8e9e8', white: '#f7f7f5', grey: '#8b8f93', line: '#c8cacb',
      yellow: '#ffe400', 'yellow-deep': '#e9c500', belt: '#f2a51c',
      ghost: '#2d8cff', ok: '#5fd38a', zz: '#4aa8ff'
    },
    brand: ['#ff4d4d', '#ffb000', '#00c2ff', '#6b5bff', '#39d98a'],
    brandSize: { landscape: { width: 64, height: 4 }, portrait: { width: 96, height: 4 } },
    fontSizes: {
      landscape: { micro: 16, body: 20, subtitle: 26, panel: 34, number: 64, level: 220, outline: 160 },
      portrait: { micro: 28, body: 34, subtitle: 42, panel: 52, number: 96, level: 200, outline: 150 }
    },
    fonts: ['https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:ital,wght@0,400;0,600;0,700;1,700&family=Noto+Sans+SC:wght@400;500;700&display=swap'],
    fontSpecs: [
      '400 20px "Barlow Semi Condensed"', '600 20px "Barlow Semi Condensed"',
      '700 20px "Barlow Semi Condensed"', 'italic 700 132px "Barlow Semi Condensed"',
      '400 20px "Noto Sans SC"', '500 20px "Noto Sans SC"', '700 20px "Noto Sans SC"'
    ],
    stages: { landscape: { width: 1920, height: 1080 }, portrait: { width: 1080, height: 1920 } },
    markers: [
      { t: 0, label: '标题' }, { t: 4, label: '工业模式' },
      { t: 10, label: '放置蓝图' }, { t: 14.4, label: '建造' },
      { t: 24, label: '设备面板' }, { t: 32, label: '全部收取' },
      { t: 36, label: '干员' }, { t: 39.6, label: '等级提升' },
      { t: 48, label: '分享蓝图' }, { t: 56, label: '收尾' }
    ],
    scenes: [
      { id: 'S0', start: 0, end: 4, label: '标题与加载' },
      { id: 'S1', start: 4, end: 10, label: '工业模式 HUD' },
      { id: 'S2', start: 10, end: 24, label: '放置蓝图' },
      { id: 'S3', start: 24, end: 36, label: '配件机面板' },
      { id: 'S4', start: 36, end: 48, label: '终端 · 干员升级' },
      { id: 'S5', start: 48, end: 56, label: '分享蓝图' },
      { id: 'S6', start: 56, end: 60, label: '收尾' }
    ],
    buildArea: {
      landscape: { x: 120, y: 96, width: 1680, height: 904 },
      portrait: { x: 60, y: 240, width: 960, height: 940 }, grid: 64
    },
    machines: [
      { id: 'core', name: '协议核心', x: 520, y: 430, width: 256, height: 256, icon: 'core' },
      { id: 'refinery', name: '精炼炉', x: 300, y: 700, width: 128, height: 128, icon: 'refinery', wakeAt: 19 },
      { id: 'planter', name: '种植机', x: 300, y: 860, width: 128, height: 160, icon: 'planter' },
      { id: 'power', name: '供电桩', x: 1560, y: 560, width: 96, height: 96, icon: 'power', wakeAt: 19.8 },
      { id: 'accessory-b', name: '配件机 · B', x: 1460, y: 700, width: 128, height: 128, icon: 'accessory', wakeAt: 19.4 }
    ],
    toolbar: [
      { name: '精炼炉', icon: 'refinery' }, { name: '配件机', icon: 'accessory' },
      { name: '粉碎机', icon: 'crusher' }, { name: '种植机', icon: 'planter' },
      { name: '供电桩', icon: 'power' }, { name: '传送带', icon: 'belt' },
      { name: '分流器', icon: 'splitter' }, { name: '仓储箱', icon: 'storage' }
    ],
    blueprint: {
      length: 512, grid: 64,
      machines: [
        { id: 'accessory-a', name: '配件机 · A', icon: 'accessory', offset: -192, width: 128, height: 128, buildAt: 14.6 },
        { id: 'crusher', name: '粉碎机', icon: 'crusher', offset: 0, width: 128, height: 128, buildAt: 14.9 },
        { id: 'storage', name: '仓储箱', icon: 'storage', offset: 192, width: 128, height: 128, buildAt: 15.2 }
      ],
      belts: [{ offset: -96, length: 64 }, { offset: 96, length: 64 }],
      route: ['core', 'accessory-a', 'crusher', 'storage', 'accessory-b'],
      cursor: {
        landscape: [[960, 540], [1100, 620], [1150, 380], [1180, 420]],
        portrait: [[540, 900], [603.6363636364, 1020], [626.3636363636, 660], [640, 720]]
      },
      spring: { stiffness: 180, damping: 22 }, beltSpeed: 80, materialInterval: 0.5
    },
    machineArt: { crusherPeriod: 1.2 },
    production: { start: 25.5, cycle: 2, stop: 31, input: 9, output: 0, backpack: 20, collectAt: 32.1 },
    operator: { name: '管理员', level: 20, levelTo: 21, cap: 40,
      layout: {
        landscape: {
          band: [[1440, 0], [1920, 0], [1920, 1080], [1640, 1080]],
          outline: { fontSize: 160, rotate: -90, rect: { x: 1780, y: 80, width: 120, height: 920 } },
          level: {
            x: 1500, number: { y: 250, fontSize: 220 }, caption: { y: 500 },
            experience: { x: 1500, y: 532, width: 260, height: 8 },
            button: { x: 1500, y: 568, width: 260, height: 64 }
          },
          person: { centerX: 980, top: 150, height: 820 },
          toast: { centerX: 960, centerY: 120 },
          info: { x: 60, y: 150, width: 440, height: 600 }
        },
        portrait: {
          band: [[720, 0], [1080, 0], [1080, 1220], [900, 1220]],
          outline: { fontSize: 150, rotate: -90, rect: { x: 950, y: 110, width: 120, height: 680 } },
          level: {
            x: 720, number: { y: 800, fontSize: 200 }, caption: { y: 1010 },
            experience: { x: 720, y: 1046, width: 300, height: 8 },
            button: { x: 720, y: 1080, width: 300, height: 80 }
          },
          person: { centerX: 400, top: 330, height: 900 },
          toast: { centerX: 540, centerY: 200 },
          info: { x: 40, y: 1240, width: 1000, height: 640 }
        }
      },
      attributes: [
      { name: '攻击', from: 342, to: 358 }, { name: '生命', from: 2341, to: 2420 },
      { name: '防御', from: 326, to: 335 }, { name: '源石技艺', from: 35, to: 35 }
    ] },
    shareCode: 'EF01-7KQ2-M9A3-ZT58',
    copyright: '界面复刻自游戏，未使用游戏美术素材',
    score: score.sort((a, b) => a.t - b.t)
  };
})();
