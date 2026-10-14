/*
 * 怪盗动势 · 迁移入口
 * 指令、队伍、敌人、文案与节拍时间都在这里。时间单位为秒；autopilot 段落顺序即一场战斗的节奏。
 */
window.CONFIG = {
  palette: { red: '#d7141a', deep: '#8f0b10', black: '#0b0b0c', white: '#ffffff', hp: '#9be15d', sp: '#ff6fb0', blue: '#1fb4ff' },
  // 指令：位置是相对角色中心的角度（度）与半径比例；glyph 为几何按键符号
  commands: [
    { key: 'W', label: 'SKILL', cn: '技能', glyph: 'triangle', angle: -125, color: '#9be15d' },
    { key: 'D', label: 'GUARD', cn: '防御', glyph: 'circle', angle: -55, color: '#ff4b5c' },
    { key: 'S', label: 'ATTACK', cn: '攻击', glyph: 'cross', angle: 20, color: '#1fb4ff' },
    { key: 'A', label: 'ITEM', cn: '道具', glyph: 'square', angle: 160, color: '#ff6fb0' },
  ],
  party: [
    { name: 'NOIR', hp: [312, 340], sp: [88, 120], color: '#f7d046' },
    { name: 'FOX', hp: [264, 290], sp: [140, 160], color: '#ff7a3c' },
    { name: 'ORACLE', hp: [198, 230], sp: [176, 200], color: '#6fe0ff' },
    { name: 'WRAITH', hp: [341, 366], sp: [64, 110], color: '#b98cff' },
  ],
  enemy: { name: 'GILDED MASK', level: 'LV 28', hp: 1 },
  text: {
    weak: 'WEAK', more: '1 MORE!', holdUp: 'HOLD UP!', allOut: 'ALL-OUT ATTACK', finish: 'CURTAIN CALL', finishCn: '怪盗谢幕', ask: 'GO FOR IT?',
    results: [['EXP', '+1,280'], ['MONEY', '¥ 3,400'], ['ITEM', 'GILDED SHARD ×1']],
  },
  // 战斗节拍（秒）
  beats: {
    menuIdle: [0, 2.6], select: 2.6, hit: 3.05, weak: 3.15, more: 3.9, holdUp: 5.4, ask: 6.5, confirm: 7.4,
    wipe: 7.5, frenzy: [7.9, 10.6], finish: 10.7, results: 14.2, end: 17.5,
  },
  menuCursor: [{ t: 0.4, i: 0 }, { t: 1.0, i: 1 }, { t: 1.6, i: 3 }, { t: 2.1, i: 2 }],
  seed: 5,
  duration: 17.5,
};
