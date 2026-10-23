import fs from 'node:fs';
const file='docs/research/industrial-protocol.md';let doc=fs.readFileSync(file,'utf8');
doc=doc.slice(0,doc.indexOf('## 验证记录'))+`## 验证记录

| 检查 | 当前证据 |
| --- | --- |
| S1/S2布局 | 横竖28张截图已查看，4.0–23.9秒两向各200个时刻扫描：名牌与其他设施框/名牌相交0。竖屏临时名牌间距12px，垂直居中误差约0.008px，17秒起隐藏。证据dev/shots/T7/fix9-layout/checks.json。 |
| 状态表示 | 竖屏不显示Zz；蓝灯及图标0.7表示待机，19.0/19.4/19.8秒起0.3秒唤醒采样为0.70→0.85→1.00；外圈出现。 |
| 原命令smoke | 默认Edge、NODE_OPTIONS和BROWSER_PATH未设置，连续3次退出0、1/1 passed；横竖均打印Intel Iris Xe / D3D11硬件renderer。只有旧字号警告，日志dev/wip/T7/fix9-smoke-{1,2,3}.log。 |
| GPU探针回归 | archive-os、day-night-flip各一次smoke通过。没有既有WebGL Canvas时，1×1离屏探针读取renderer后释放上下文；软件判定关键词保持。 |
| 成片 | 横1920×1080、竖1080×1920，均60.000秒/30fps/1800帧、H.264视频及AAC 48kHz双声道。每段解码查看2/15.5/29/42/52/58秒六帧，未见重复分块或编码破损。证据dev/shots/T7/render/final-media.json。 |
| 音频 | 两份renderWav均60秒/48kHz/2ch/16bit，99事件；导出PCM峰值−3.236dBFS、削波0。 |
| 参考并排 | 当前S2 12/16/20秒、S3 29秒、S4 44秒与本地参考重新拼接，位于dev/shots/T7/compare/。游戏参考图只用于本地对照，不进入案例素材。 |
| 性能优化证据 | 软件环境采样同步render均值1.658→0.584ms；10组缩略MAD最大6.556e-7。该测量早于最终坐标覆盖，不冒充当前GPU复测。 |

预览、构建、check旧字号条目、完整原始命令、截图索引和文件清单见本地dev/reports/T7.md。成片使用GPU启动参数与渲染器已有JPEG92中间帧选项，脚本render.mjs未修改。
`;
fs.writeFileSync(file,doc);
console.log('Research validation evidence updated.');
console.log('Kit copy matches source:',fs.readFileSync('kit/motion-kit.js').equals(fs.readFileSync('demos/cases/industrial-protocol/motion-kit.js')));
