/*
 * 任务指挥台 · 迁移入口
 * states：每个告警态的配色与闪烁节奏；contacts：雷达目标（极坐标 + 速度）；autopilot：自动演示事件（秒）。
 */
window.CONFIG = {
  mission: { name: 'OPERATION LANTERN', code: 'MSN-0417', station: 'ORBITAL WATCH · DECK 3' },
  states: {
    nominal: { label: 'NOMINAL', main: '#5ff3ff', dim: '#1d4a55', bg: '#05080b', panel: '#0a1117', blink: 0 },
    caution: { label: 'CAUTION', main: '#ffb000', dim: '#5a420c', bg: '#0a0805', panel: '#14100a', blink: 1 },
    alert: { label: 'ALERT', main: '#ff3b30', dim: '#5a1612', bg: '#0c0505', panel: '#170a0a', blink: 2 },
  },
  radar: { period: 4, rings: 4, rangeKm: 120, glow: 1.3 },
  contacts: [
    { id: 'K-21', r: 0.62, a: 40, vr: -0.004, va: 1.2, kind: 'CARGO' },
    { id: 'K-34', r: 0.38, a: 128, vr: 0.003, va: -0.8, kind: 'PATROL' },
    { id: 'X-07', r: 0.82, a: 215, vr: -0.018, va: 2.5, kind: 'UNKNOWN' },
    { id: 'K-12', r: 0.5, a: 302, vr: 0.002, va: 0.6, kind: 'RELAY' },
  ],
  log: [
    { t: 1.6, text: 'LINK ESTABLISHED · 4 NODES' },
    { t: 3.2, text: 'SWEEP NOMINAL · RANGE 120 KM' },
    { t: 6.0, text: 'OPERATOR SELECT · X-07' },
    { t: 7.6, text: 'X-07 LOCKED · BRG 215 · VEL 2.5' },
    { t: 9.6, text: 'CAUTION · X-07 CLOSING' },
    { t: 12.6, text: 'ALERT · X-07 INSIDE PERIMETER' },
    { t: 15.8, text: 'COUNTERMEASURE DEPLOYED' },
    { t: 17.0, text: 'THREAT NEUTRALIZED · RESUME' },
  ],
  autopilot: [
    { t: 6.0, type: 'lock', id: 'X-07' },
    { t: 9.5, type: 'state', s: 'caution' },
    { t: 12.5, type: 'state', s: 'alert' },
    { t: 16.6, type: 'state', s: 'nominal' },
  ],
  duration: 20,
};
