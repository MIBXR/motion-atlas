import fs from 'node:fs';
const qa=JSON.parse(fs.readFileSync('dev/shots/T7/qa.json','utf8'));
const scenes=[['S0',0,4,'标题、字标与加载'],['S1',4,10,'工地与工业HUD'],['S2',10,24,'蓝图、建造与物料'],['S3',24,36,'配件机生产与收取'],['S4',36,48,'干员升级'],['S5',48,56,'分享蓝图'],['S6',56,60,'运转工地与收尾']];
const index=scenes.map(([id,a,b,label])=>`| ${id} ${label} | ${[a+.5,(a+b)/2,b-.3].map(t=>t.toFixed(3)).join(' / ')} | ${['landscape','portrait'].map(o=>[a+.5,(a+b)/2,b-.3].map(t=>`[${t.toFixed(3)}s](../shots/T7/shots/${o}-${id}-${t.toFixed(3)}.png)`).join('、')).join(' | ')} |`).join('\n');
const md=`# T7 终末地 · 集成工业协议

工作树为用户指定的 \`.worktrees/endfield\`，分支 \`feat/endfield-protocol\`。没有暂存、提交、推送、切分支或发布。服务仅使用 \`http://localhost:4325\`。

## 执行对照

| 规格 | 实现 | 证据 |
| --- | --- | --- |
| 0. 范围与素材 | 本地参考仅用于观察和并排比较；片内设备、地形、图标、人物全部自绘；只替换指定案例、条目、研究文档和必要生成物 | 源码diff；\`dev/wip/T7/progress.md\` |
| 1. token、字体、字号 | config包含13个颜色token、五色品牌条、两套七档字号；Google Fonts经preload等待，七种spec就绪后开始 | \`demos/cases/industrial-protocol/config.js\`；\`dev/shots/T7/qa.json\` |
| 2. S0 | 黑底字标、百分比加载、提示与黄带；加载线自身距底120/260px | 下方S0三时刻两画幅截图 |
| 2. S1 | 固定种子Canvas草地/泥斑/碎石/网格；边界、五设施、待机、模式切换、资源、设备栏、任务；竖屏触控布局 | S1截图；源码render(t) |
| 2. S2 | 三设备512px蓝图、三次贝塞尔、180/22弹簧跟随、旋转、网格吸附、线框/扫描/角标、分段铺带、物料、唤醒、资源与连通提示 | S2截图；\`compare/S2-blueprint.png\` |
| 2. S3 | 横1320×730展开面板、竖1080×1220底部弹层；背包、配方、两轮生产及75%第三轮、收取飞行、20→22、关闭 | S3截图；\`compare/S3-machine-panel.png\` |
| 2. S4 | 剪影、头像、属性、技能、黄带、等级20→21、经验和提示；竖屏黄带字标与等级说明见当前状态 | S4截图；\`compare/S4-operator.png\` |
| 2. S5 | 网格纸产线、详情2×4格、白条弹窗、分享码、复制反馈、确认及收起；竖屏下方详情与上下按钮 | S5截图 |
| 2. S6 | 回工地、拉远、HUD淡出、字标与淡黑；生产物料持续运转 | S6截图 |
| 3. 标记 | 0/4/10/14.4/24/32/36/39.6/48/56，共10个 | config、entry与ready消息 |
| 4. 音谱 | 99事件、17种现有音色；13s click gain0.9；24个铺带段对应tick；renderWav导出 | \`render/audio-metrics.json\` |
| 5. 技术约束 | MotionKit.stage；地图/物料Canvas，UI DOM，自绘内联SVG；render(t)全量计算，无累加动画；reduced镜头和扫带改淡变 | QA确定性、画幅切换和reduced记录 |
| 6. 资料与预览 | 条目和研究文档重写，3段官方视频source，版权说明；build同步kit及生成资料，横竖预览 | entry/docs/previews及生成文件 |
| 7. 交付验证 | 三轮smoke、build、check与build:site；两套影片实际状态见验证及当前状态 | 下列验证表与本地日志 |

## 截图索引

每场景开始+0.5s、中点、结束−0.3s，合计42张规定截图；另有7张补充场景截图、4张确定性截图、6张reduced截图。

| 场景 | 规定时刻 | 横屏 | 竖屏 |
| --- | --- | --- | --- |
${index}

| 对照图 | 内容 |
| --- | --- |
| [S2-blueprint.png](../shots/T7/compare/S2-blueprint.png) | 横屏12/16/20s与官方03号43.350s帧并排 |
| [S3-machine-panel.png](../shots/T7/compare/S3-machine-panel.png) | 横屏29s与官方03号45.583s帧并排 |
| [S4-operator.png](../shots/T7/compare/S4-operator.png) | 横屏44s与01-02干员联系表并排 |

七张六帧导航图位于 \`dev/shots/T7/compare/S0-contact.png\` 至 \`S6-contact.png\`；逐张人工验收记录位于 \`dev/wip/T7/visual-panel.md\`、\`visual-operator.md\`。导航图不能替代原图逐张检查。

## 实际验证

| 检查 | 结果 | 证据 |
| --- | --- | --- |
| ready与画幅 | 横1920×1080、竖1080×1920；duration60；sound:true | qa.json orientations |
| 字体 | 七种spec均loaded | qa.json ready/font记录 |
| 任意seek | 两方向12→44→12的PNG、Canvas、stage DOM、world DOM均相等 | qa.json determinism；a/b截图 |
| 画幅切换 | 32s切至另一画幅再切回，时刻和尺寸保持 | qa.json orientationSwitch |
| reduced motion | 两方向3.7/5/57s无镜头scale变化、黄带无旋转；以opacity淡变 | reduced截图及qa.json |
| 浏览器错误 | console/error/未捕获异常均0 | qa.json |
| smoke | 首轮状态连续3/3通过；横最小13.8px、竖最小24.1px；旧24/36px门槛为警告 | smoke-1/2/3.log；最终状态见当前状态 |
| build | 成功 | build输出 |
| check | 49项均为既定24/36px旧字号下限，其他错误0；未改scripts | check.log |
| build:site | 成功，dist生成 | build-site.log |
| WAV | 60s，48000Hz，2ch，99事件；峰值${qa.audio.peakDb.toFixed(4)}dBFS，RMS${qa.audio.rmsDb.toFixed(4)}dBFS；削波0，满足≤−1dBFS | render/audio-metrics.json；industrial-protocol.wav |
| MP4 | 初版横竖均完成60s/30fps/1800帧且带音轨；最终源码版本等待最终渲染确认 | render目录；待最终ffprobe |

复现命令使用既有direct-browser导入以避免本机浏览器代理影响：

~~~sh
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --only industrial-protocol --base http://localhost:4325
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/capture.mjs --only industrial-protocol --base http://localhost:4325
node scripts/build.mjs
node scripts/check.mjs
node scripts/build-static.mjs
~~~

## 当前状态、偏离与限制

用户已明确覆盖的三项均已实施：13s使用click/gain0.9；蓝图三设备与两段64px传送带共512px；一格统一64px。

竖屏S4的240px描边字标超过700px三角黄区，以及LEVEL/40与人物手臂对比不足，已将具体处理选项交给用户决定；未自行更改构图或字号。最终S4截图和影片将在决定落实后更新。

既有五个patternIds资料关联保留；正文只描述实际实现，不宣称片内存在长按确认或文字解码。固定详情面板按规格覆盖其下方部分产线；设施名牌保持规定字号，在相邻设备图形上层显示，避免文字残缺。

首次预检的clack缺失及蓝图数量/尺寸问题已由用户决定解决。截图拼接最初尝试Python Pillow时发现未安装，改用已有浏览器Canvas完成，未新增依赖。确定性工具的摘要算法写入被HASH guard拒绝后，改用直接字节和字符串比较。后台页面rAF超时通过Page.bringToFront修复。这些问题均没有通过降低验收要求跳过。

报告只把已实际执行的检查写为通过；截图视觉效果以原图和人工逐张记录为准，官方参考与本片自绘素材不存在逐像素相同的主张。
`;
fs.writeFileSync('dev/reports/T7.md',md);
