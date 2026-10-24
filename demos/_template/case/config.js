/*
 * 舞台模板 · 配置（案例迁移时只改这里）
 * 约定：
 *  - 时间一律写“第几拍”（beats），由 bpm 换算成秒；画面与乐谱读同一张节拍表，声画天然对齐。
 *  - 版式（layout）按画幅分两套，坐标是舞台像素：横屏 1920×1080、竖屏 1080×1920。
 *    几何（圆环、节点、引线）只给参数，具体坐标由 script.js 的同一个 polar() 计算，保证端点与圆心重合。
 *  - 舞台字号按设计决定，不设下限；网站界面 ≥ 12px。
 */
window.CONFIG = {
  title: '固定画幅',
  kicker: 'MOTION ATLAS / STAGE TEMPLATE',
  subtitle: ['1920 × 1080 / 1080 × 1920', '两套构图 · 整体等比缩放'],
  items: [
    { cn: '舞台', en: 'STAGE' },
    { cn: '声音', en: 'AUDIO' },
    { cn: '预加载', en: 'PRELOAD' },
  ],
  end: { title: '可迁移起点', en: 'READY FOR MIGRATION', stamp: 'T1' },

  bpm: 120,
  // 节拍表（单位：拍）。120 BPM 下 1 拍 = 0.5 秒
  beats: { kicker: 1, ring: 2, drop: 4, sub: 6, items: [7, 9, 11], riser: 12, outro: 14, end: 15, total: 19 },

  palette: { bg: '#0b0d10', ink: '#f2efe8', dim: '#8b919b', line: '#272c34', accent: '#ff5b2e' },

  // HUD 左上角的标记（内联 SVG，演示 MotionKit.preload.image 的用法）
  mark: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" fill="none" stroke="#ff5b2e" stroke-width="4"/><path d="M12 34 24 12l12 22" fill="none" stroke="#f2efe8" stroke-width="4" stroke-linejoin="round"/></svg>'),

  layout: {
    // 横屏：文字在左列，圆环在右侧；节点引线先沿半径外伸 elbow 像素，再水平拉到 labelX
    landscape: { ring: { cx: 1290, cy: 540, r: 270 }, nodes: [35, 90, 145], leader: 'h', elbow: 46, labelX: 1640, ticks: 72 },
    // 竖屏：圆环在上，三个节点在下半圈，引线垂直落到 labelY，文字块在下方
    portrait: { ring: { cx: 540, cy: 640, r: 330 }, nodes: [235, 180, 125], leader: 'v', labelY: 1060, ticks: 72 },
  },

  // 声音：节拍底（十六分步进，X 重音 / x 普通 / o 弱音 / . 休止）与铺底和弦
  sound: {
    drums: {
      kick: 'X...x...X...x.x.',
      clap: '....X.......X...',
      hat: '..x...x...x...x.',
      hat2: 'o.o.o.o.o.o.o.o.',
    },
    chord: ['A2', 'E3', 'A3', 'C4', 'E4', 'G4', 'B4'],
    nodes: ['A5', 'C6', 'E6'],
  },
};
