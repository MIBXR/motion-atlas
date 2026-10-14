/*
 * 赛事转播图形包 · 迁移入口
 * 所有出入场都写成“第几拍”，bpm 决定一拍多长：改 bpm 就能整体加快或放慢，且始终踩在拍点上。
 */
window.CONFIG = {
  bpm: 120,
  event: { name: 'VELOCITY LEAGUE', stage: 'GRAND FINAL · GAME 5', venue: 'SHANGHAI ARENA' },
  palette: { navy: '#0a1230', deep: '#050a1c', lime: '#c6ff3d', cyan: '#29d3ff', white: '#ffffff', magenta: '#ff2e88' },
  teams: [
    { code: 'HLX', name: 'TEAM HELIX', color: '#c6ff3d', score: [2, 3] },
    { code: 'NVA', name: 'NOVA SEVEN', color: '#29d3ff', score: [2, 2] },
  ],
  lowerThird: { name: 'AURORA KANE', role: 'CAPTAIN · TEAM HELIX', tag: 'PLAYER CAM' },
  stats: [
    { label: 'ELIMINATIONS', a: 24, b: 19 },
    { label: 'OBJECTIVES', a: 5, b: 3 },
    { label: 'GOLD (K)', a: 48.2, b: 44.9, decimals: 1 },
  ],
  ticker: 'HELIX LEAD THE SERIES · NOVA SEVEN TAKE GAME 4 IN OVERTIME · NEXT: AWARD CEREMONY 21:30 · MVP VOTING NOW OPEN',
  // 节拍表（单位：拍）
  beats: { stingerIn: 0, bug: 4, l3In: 8, l3Out: 15, statsIn: 16, statsOut: 23, point: 24, replayIn: 28, replayOut: 36, ticker: 37, winner: 42, outro: 46, end: 48 },
};
