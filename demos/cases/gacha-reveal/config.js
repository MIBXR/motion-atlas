/*
 * 抽卡揭示舞台 · 迁移入口
 * results：十连结果（3/4/5 星）；最高稀有度决定“预示色”与是否有升格（假动作）。
 * timing：蓄力、预示、爆发、飞入、逐张翻牌、金卡停顿的时间（秒）。
 */
window.CONFIG = {
  title: 'STELLAR DRAW',
  rarityColors: { 3: '#4aa8ff', 4: '#b06bff', 5: '#ffcf4a' },
  results: [
    { r: 3, name: 'DRIFT', glyph: 'moon' }, { r: 3, name: 'CINDER', glyph: 'flame' }, { r: 4, name: 'VESPER', glyph: 'star' },
    { r: 3, name: 'TIDE', glyph: 'wave' }, { r: 3, name: 'QUILL', glyph: 'feather' }, { r: 3, name: 'ASH', glyph: 'flame' },
    { r: 4, name: 'LUMEN', glyph: 'sun' }, { r: 3, name: 'MOSS', glyph: 'leaf' }, { r: 3, name: 'ECHO', glyph: 'wave' },
    { r: 5, name: 'AURELIA', glyph: 'crown' },
  ],
  timing: {
    press: 0.6, charge: 1.5, tell: 2.1, upgrade: 2.55, burst: 2.9, fly: 3.2, flyStagger: 0.07,
    flip: 4.1, flipStagger: 0.12, goldPause: 0.7, results: 7.0, duration: 9.5,
  },
};
