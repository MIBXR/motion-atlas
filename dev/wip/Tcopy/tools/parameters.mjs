import fs from 'node:fs';
const changes = {
  'cases/archive-os': {
    summary: '白底开场后，五列档案循环展开。读取时对角解密，还能360°查看模型、拆解与重组结构。',
    'tokens.motion.0.value': '开场以25fps离散播放。',
    'migration.2.field': '运行资源', 'migration.3.field': '舞台与控制',
  },
  'cases/map-pilgrimage': {
    focus: '地图是稳定的底座，HUD持续更新，高光时切到全屏。60秒走过关西机场、伏见稻荷、鸭川、奈良公园和道顿堀。OpenStreetMap呈现3D建筑、铁路与水系。画面与乐谱共用一张时间表。',
    'rhythm.beats.2.note': '関西周遊逐字160ms；\'26打字；7.3s淡出。',
    'rhythm.beats.10.note': '0.75s分屏1930s；10.01·17:40JST盖章。',
    'rhythm.beats.16.note': 'z15.6俯仰58°，大阪3D夜景与霓虹卡出现。',
    'observations.8.what': '动画2015/实景2026分屏；10.01·18:20JST斜戳盖章。',
    'constraints.5': '约730块/130MB；约290块/66MB必需。10Mbps缓冲1–2次。',
  },
  'patterns/card-expand-fullscreen': {
    'migration.2.how': '设置20.4s底图锚点、鸟居照片、卡片与展开轨道、横竖布局。',
  },
};
for (const [id, fields] of Object.entries(changes)) {
  const p = `entries/${id}.json`, e = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const [key,value] of Object.entries(fields)) {
    const keys = key.split('.'), last = keys.pop(); let target = e;
    for (const k of keys) target = target[k];
    target[last] = value;
  }
  fs.writeFileSync(p, JSON.stringify(e, null, 2) + '\n');
}
