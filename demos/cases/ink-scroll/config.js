/*
 * 水墨长卷展台 · 迁移入口
 * span：长卷宽度（视口宽度的倍数）；layers：远→近的墨色层（视差系数、墨色、显影时刻）；
 * poem：竖排题诗（公有领域）；seal：印章文字；timing：展开、显影、平移、盖章的节奏（秒）。
 */
window.CONFIG = {
  span: 3.2,
  palette: { paper: '#f1ead8', ink: '#1e1d1b', seal: '#b8322a', mist: '#f6f1e3' },
  layers: [
    { name: 'far', parallax: 0.35, tone: 0.18, height: 0.42, rough: 3, peaks: 7, bleed: 2.2, seed: 3 },
    { name: 'mid', parallax: 0.6, tone: 0.42, height: 0.5, rough: 4, peaks: 6, bleed: 3.0, seed: 8 },
    { name: 'near', parallax: 1.0, tone: 0.82, height: 0.3, rough: 5, peaks: 9, bleed: 3.8, seed: 13 },
  ],
  poem: { lines: ['行到水穷处', '坐看云起时'], author: '王维 · 终南别业', at: 0.82 },
  seal: { chars: ['观', '山'], small: '墨' },
  timing: { open: 0.5, unroll: 2.6, text: 5.0, panFrom: 6.4, panTo: 11.6, stamp: 12.0, duration: 14.5 },
};
