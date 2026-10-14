/*
 * 工业协议 · 迁移入口
 * tabs / machines / links 定义界面与产线；autopilot 为自动演示事件（秒），真实点击会切到实时交互。
 */
window.CONFIG = {
  brand: { code: 'PROTOCOL · FIELD TERMINAL', site: 'SECTOR K-7', build: 'v0.92-K7' },
  palette: { paper: '#e6e6e1', panel: '#f4f4f0', dark: '#1d1f22', ink: '#1d1f22', muted: '#6b6e70', line: '#c9cbc6', yellow: '#ffd400', alert: '#ff6b1a', ok: '#2fbf71' },
  resources: [{ k: 'ALLOY', v: 12480 }, { k: 'POWER', v: 82, unit: '%' }, { k: 'CREDITS', v: 3360 }],
  tabs: [
    { id: 'aic', label: 'FACTORY', cn: '集成工业', sub: ['产线总览', '蓝图', '电力网络', '物流'] },
    { id: 'ops', label: 'OPERATORS', cn: '干员', sub: ['编队', '装备', '培养'] },
    { id: 'depot', label: 'DEPOT', cn: '仓储', sub: ['物资', '配方', '记录'] },
    { id: 'mission', label: 'MISSIONS', cn: '任务', sub: ['主线', '区域', '日常'] },
  ],
  // 产线：x/y 为 1000×600 画布坐标；rate 为每分钟产量
  machines: [
    { id: 'm1', code: 'MN-01', name: '采矿机', en: 'MINER', x: 80, y: 120, rate: 30, icon: 'drill' },
    { id: 'm2', code: 'MN-02', name: '采矿机', en: 'MINER', x: 80, y: 470, rate: 30, icon: 'drill' },
    { id: 'm3', code: 'RF-02', name: '精炼炉', en: 'REFINERY', x: 360, y: 295, rate: 24, icon: 'flame', eff: 87, power: 64 },
    { id: 'm4', code: 'AS-04', name: '装配机', en: 'ASSEMBLER', x: 640, y: 120, rate: 12, icon: 'gear' },
    { id: 'm5', code: 'PK-01', name: '封装机', en: 'PACKAGER', x: 640, y: 470, rate: 12, icon: 'box' },
    { id: 'm6', code: 'DP-K7', name: '仓储节点', en: 'DEPOT', x: 905, y: 295, rate: 24, icon: 'depot' },
  ],
  links: [['m1', 'm3'], ['m2', 'm3'], ['m3', 'm4'], ['m3', 'm5'], ['m4', 'm6'], ['m5', 'm6']],
  operators: [
    { name: 'VESNA', role: 'CASTER', rarity: 6 }, { name: 'KORIN', role: 'GUARD', rarity: 6 }, { name: 'ODALYS', role: 'SUPPORT', rarity: 5 },
    { name: 'BRANT', role: 'DEFENDER', rarity: 5 }, { name: 'MIREL', role: 'VANGUARD', rarity: 4 }, { name: 'TOVA', role: 'DEFENDER', rarity: 4 },
  ],
  holdDuration: 1.2,
  autopilot: [
    { t: 4.6, type: 'select', id: 'm3' },
    { t: 6.4, type: 'holdStart' }, { t: 7.8, type: 'holdEnd' },
    { t: 9.4, type: 'tab', i: 1 }, { t: 12.2, type: 'tab', i: 2 }, { t: 14.6, type: 'tab', i: 0 },
  ],
  duration: 17,
};
