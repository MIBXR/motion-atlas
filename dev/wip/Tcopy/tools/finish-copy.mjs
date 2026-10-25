import fs from 'node:fs';
const changes = {
  'cases/archive-os': {
    'observations.6.what': '22.0s阵列；35.0s读取X-001；62.6s浏览，77.6s结束。',
    'observations.7.what': '77.6s/48kHz双声道，106音=10开场+71逐字+25交互。',
  },
  'cases/map-pilgrimage': {
    subtitle: 'CARTOGRAPHIC PILGRIMAGE · MAP / HUD',
    'rhythm.beats.17.note': 'DAY 03天亮，镜头拉远，全线路与标记同屏。',
    'tokens.motion.0.value': '550ms outCubic，字间160ms。模糊18px→0，上移14px→0。地名标题使用同样参数。',
    'tokens.motion.2.value': '550ms outCubic浮入，400ms inCubic离场。图片持续Ken Burns推近。',
    'tokens.motion.3.value': '600ms inOutCubic展开。停2.2s，Ken Burns缩放1.04→1.10。550ms收回，HUD转白字，上下压暗。',
    'tokens.motion.5.value': '标签350ms擦出，标题700ms打字。框线800ms inOutCubic描出。四角方块120ms错峰，300ms outBack。',
    'tokens.motion.6.value': '分割线750ms outQuart滑到中线。时间戳360ms outBack盖章。',
    'tokens.motion.9.value': '缓冲<0.5s时暂停，显示BUFFERING MAP xx%。攒够4s继续。',
    'observations.10.what': '7天2国5作品3笔记，×19目击，1,159km；「聖地巡礼」收尾。',
    'constraints.5': '横屏730块/130MB，必需290块/66MB；10Mbps缓冲1–2次。',
    'migration.3.how': '设置铁路与步行经纬度，可用rail图层或GeoJSON线。',
    'migration.10.how': '设置开头门槛、解析与下载范围、内存预算、暂停与继续阈值。',
  },
  'patterns/alert-reroute': {
    'timing.4.value': 'blip、whoosh、error、glitch。clack、alarm、beep、stamp。',
  },
};
for (const [id, fields] of Object.entries(changes)) {
  const p = `entries/${id}.json`, e = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const [key, value] of Object.entries(fields)) {
    const keys = key.split('.'), last = keys.pop(); let target = e;
    for (const k of keys) target = target[k];
    target[last] = value;
  }
  fs.writeFileSync(p, JSON.stringify(e, null, 2) + '\n');
}
const p = 'docs/pipeline.md';
let s = fs.readFileSync(p, 'utf8');
s = s.replace('`dev/shots/T1/voices-gallery.wav`（本地生成，不提交）可以按顺序试听全部音色。', '');
fs.writeFileSync(p, s);
