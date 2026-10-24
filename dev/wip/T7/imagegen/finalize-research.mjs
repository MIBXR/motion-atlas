import fs from 'node:fs';
const file='docs/research/industrial-protocol.md';let doc=fs.readFileSync(file,'utf8');
doc=doc.slice(0,doc.indexOf('## 验证记录'))+`## 验证记录

| 检查 | 生图版当前证据 |
| --- | --- |
| 素材规格与透明度 | 15图：地面2048²无损WebP，7设施512² PNG，6物品128² PNG，人物1024×1536 PNG。14张PNG均有真实透明像素，人物原生alpha最大254保持不变。记录dev/wip/T7/imagegen/normalized.json。 |
| 预加载与场景 | 两画幅各15图完整进入MotionKit.preload缓存；ready后启动。蓝图虚影中的image/img数量0，真实设施位图8。48张全场景及呼吸峰值截图已查看，未见本次位图引入的明显AI结构、透明边缘或加载问题；页面errors/warnings均0。 |
| 人物与背包矩形 | 人物外框横(720,150)520×820、竖(202.734,330)394.516×900与替换前一致。呼吸采样为37秒1.01/+1°、39秒0.99/−1°，周期4秒。背包图片横64²、竖112²，数量和第三格逻辑保留。 |
| 重生成 | core重生成1次修正三角桁架；pylon重生成2次修正俯视投影；其他0次。所有18次原图与完整提示词均保留于素材来源记录。 |
| 前后对照 | S1 7秒、S3 29秒、S4 42秒横屏并排图在dev/shots/T7/imagegen/compare/，对照图已查看。 |
| 原命令smoke | 默认Edge，NODE_OPTIONS/BROWSER_PATH未设置，连续3次退出0、1/1 passed；横竖Intel Iris Xe / D3D11。仅旧字号警告。日志dev/wip/T7/imagegen/smoke-{1,2,3}.log。 |
| 成片与音频 | 生图版双MP4均60.000秒/30fps/1800帧，H.264+AAC 48kHz双声道。每段解码查看2/15.5/29/42/52/58秒六帧。WAV峰值−3.236dBFS、削波0，99事件。记录dev/shots/T7/imagegen/render/final-media.json。 |
| 预览 | capture退出0，横竖预览已刷新并打印硬件renderer。 |

构建退出码、check旧字号清单、全部截图索引和原始命令详见本地dev/reports/T7.md。生图版成片位于dev/shots/T7/imagegen/render/；原dev/shots/T7/render/保留代码绘制版基线，二者不混用。
`;
fs.writeFileSync(file,doc);
console.log('Research verification updated. Kit identical:',fs.readFileSync('kit/motion-kit.js').equals(fs.readFileSync('demos/cases/industrial-protocol/motion-kit.js')));
