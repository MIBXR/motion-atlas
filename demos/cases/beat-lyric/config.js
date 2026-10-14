/*
 * 节拍动态字幕 · 迁移入口
 * 一切以“拍”为单位：bpm 决定速度；lyrics 里的 beat 可以是小数（0.5 = 八分音符反拍）。
 * sections 定义每段的配色与背景切换；pattern 定义合成鼓点（开启声音后与画面同拍）。
 */
window.CONFIG = {
  bpm: 96,
  bars: 12,
  title: 'ON THE ONE',
  credit: 'Motion Atlas Original · 96 BPM',
  sections: [
    { bar: 0, bg: '#111214', fg: '#f5f0e6', accent: '#ff4d2e', name: 'INTRO' },
    { bar: 2, bg: '#ff4d2e', fg: '#111214', accent: '#f5f0e6', name: 'VERSE' },
    { bar: 4, bg: '#2b59ff', fg: '#ffffff', accent: '#ffd23f', name: 'STACK' },
    { bar: 6, bg: '#f5f0e6', fg: '#111214', accent: '#ff4d2e', name: 'BUILD' },
    { bar: 8, bg: '#111214', fg: '#ffffff', accent: '#ff4d2e', name: 'DROP', strobe: ['#111214', '#ff4d2e', '#2b59ff', '#f5f0e6'] },
    { bar: 10, bg: '#111214', fg: '#f5f0e6', accent: '#ff4d2e', name: 'OUTRO' },
  ],
  // 歌词：beat 出现，hold 持续拍数；style: slam（拍入）| rise（遮罩上升）| stack（堆叠网格）| count（倒数）| giant（铺满）
  lyrics: [
    { beat: 0, text: '1', style: 'count' }, { beat: 1, text: '2', style: 'count' }, { beat: 2, text: '3', style: 'count' }, { beat: 3, text: '4', style: 'count' },
    { beat: 4, text: 'WE', style: 'slam', hold: 1 }, { beat: 5, text: 'MOVE', style: 'slam', hold: 1 }, { beat: 6, text: 'ON THE', style: 'slam', hold: 1 }, { beat: 7, text: 'ONE', style: 'slam', hold: 1 },
    { beat: 8, text: '城市', style: 'rise', hold: 2 }, { beat: 10, text: '在拍子里', style: 'rise', hold: 2 }, { beat: 12, text: '醒来', style: 'rise', hold: 1.5 }, { beat: 14, text: '每一步', style: 'rise', hold: 1 }, { beat: 15, text: '都算数', style: 'rise', hold: 1 },
    { beat: 16, text: 'EVERY', style: 'stack', cell: 0 }, { beat: 17, text: 'STEP', style: 'stack', cell: 1 }, { beat: 18, text: 'LANDS', style: 'stack', cell: 2 }, { beat: 19, text: 'ON', style: 'stack', cell: 3 },
    { beat: 20, text: 'TIME', style: 'stack', cell: 4 }, { beat: 21, text: 'ON', style: 'stack', cell: 5 }, { beat: 22, text: 'THE', style: 'stack', cell: 6 }, { beat: 23, text: 'ONE', style: 'stack', cell: 7 },
    ...Array.from({ length: 16 }, (_, i) => ({ beat: 24 + i * 0.5, text: 'UP', style: 'build', i })),
    { beat: 32, text: 'DROP', style: 'giant', hold: 8 },
    { beat: 40, text: 'STAY', style: 'slam', hold: 1 }, { beat: 41, text: 'ON', style: 'slam', hold: 1 }, { beat: 42, text: 'THE', style: 'slam', hold: 1 }, { beat: 43, text: 'ONE', style: 'slam', hold: 1 },
  ],
  // 合成鼓点（每小节 16 个十六分音符位置：x = 触发）
  pattern: {
    kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', bassNotes: [55, 55, 49, 52],
    buildFrom: 24, dropFrom: 32, dropTo: 40,
  },
};
