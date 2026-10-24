import fs from 'node:fs';
const qa=JSON.parse(fs.readFileSync('dev/shots/T7/gpu-zz/checks.json','utf8'));
const command='node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --only industrial-protocol --base http://localhost:4325';
fs.writeFileSync('dev/wip/T7/gpu-smoke-env.json',JSON.stringify({command,cwd:process.cwd(),node:process.execPath,NODE_OPTIONS:process.env.NODE_OPTIONS??null,BROWSER_PATH:process.env.BROWSER_PATH??null,browser:qa.browser,qaRenderer:qa.renderer},null,2));
const old=fs.readFileSync('dev/reports/T7.md','utf8');
const perf=old.slice(old.indexOf('## 分项性能测量'),old.indexOf('## smoke与失败时刻')).replace('## 分项性能测量','## 保留的性能优化证据').replace('当前横屏','性能快照横屏').replace('当前竖屏','性能快照竖屏');
const z=qa.checks.find(c=>c.t===7).zz.filter(z=>z.names.length);
const rect=r=>`(${r.x.toFixed(3)}, ${r.y.toFixed(3)}) ${r.w.toFixed(3)}×${r.h.toFixed(3)}`;
fs.writeFileSync('dev/reports/T7.md',`# T7 终末地 · 集成工业协议

当前状态：条目已声明renderer:gpu，竖屏Zz已按(-40,+10)及0.8倍字号实施，性能优化保留。原命令smoke第1次在GPU探针处失败：需要GPU，未找到WebGL canvas；尚未进入seek/播放验收。按用户“若失败，停下报告”的要求，未运行第2/3次、MP4、capture或构建。竖屏Zz与其他设施框没有相交，但仍与两处相邻名牌相交，尚不满足全部验收条件。

工作树.worktrees/endfield，分支feat/endfield-protocol；没有暂存、提交、推送或切分支，scripts目录未修改，仅使用4325。

## 当前实现

| 要求 | 实现与证据 |
| --- | --- |
| GPU条目 | entries/cases/industrial-protocol.json包含renderer:gpu；smoke已进入GPU专用分支。 |
| 竖屏Zz | CSS为left:calc(100% - 40px)、top:10px、font-size:calc(var(--subtitle) * .8)。实测字号33.6px（42×0.8）；所有待机设施使用该规则，唤醒动画保持原时序。 |
| 横屏Zz | (+8,-28)及原字号不变；本轮只增加portrait选择器。 |
| 性能优化 | 静态地面保留、传送带缓存、静止flow复用、静态节点缓存、DOM写入去重、无逐帧布局读取全部保留。 |

## smoke原命令与renderer

~~~sh
${command}
~~~

PowerShell只在命令末尾添加输出重定向以保存日志，无附加Node参数。NODE_OPTIONS=null，BROWSER_PATH=null，未改浏览器入口。环境见[gpu-smoke-env.json](../wip/T7/gpu-smoke-env.json)。

| 次数 | 结果 |
| --- | --- |
| 1 | 退出1；smoke 0/1 passed；landscape WebGL 未找到WebGL canvas；需要GPU，未找到WebGL canvas |
| 2 | 按失败即停要求，未执行 |
| 3 | 按失败即停要求，未执行 |

日志：[gpu-smoke-1.log](../wip/T7/gpu-smoke-1.log)。这次失败在GPU_PROBE阶段，早于seek、播放与字号检查，不能据此判断硬件模式下的播放计时是否达标。

代码已确认原因：scripts/smoke.mjs:81的GPU_PROBE只遍历页面已有Canvas并尝试webgl2/webgl；页面terrain和flow都已取得2d上下文，无法再获取WebGL上下文，因此结果为空。scripts/capture.mjs:37的checkRenderer有相同限制。它们可分流启动GPU浏览器，但当前探针只适用于页面实际存在WebGL Canvas的案例。

在Zz截图检查中，使用同样的GPU启动参数（--enable-gpu、--use-angle=d3d11、--ignore-gpu-blocklist），通过独立、未挂入页面DOM的Canvas探测到：

~~~text
${qa.renderer}
~~~

这是截图检查的独立WebGL驱动探测结果，不是smoke打印的renderer，也不单独证明全部Canvas 2D与DOM层的硬件合成状态。未向正式页面添加空WebGL Canvas来满足探针。

## 竖屏Zz检查

已生成并逐张查看9张截图：S1 4.5/7/9.7秒，S2 10.5/12/16/17/20/23.7秒。页面异常0；检查可见Zz（包含错位小写z的矩形）与名牌、其他设施框的交集。其他设施框相交数为0，但名牌相交仍存在。

| 7秒时的Zz | Zz合并矩形 | 所在设施矩形 | 相交对象 |
| --- | --- | --- | --- |
${z.map(v=>`| ${v.id} | ${rect(v.rect)} | ${rect(v.facility)} | ${v.names.join(', ')} |`).join('\n')}

截图可见种植机Zz被精炼炉名牌遮住，配件机B的Zz被供电桩名牌局部遮住。原因是邻近名牌本身已覆盖这两台设施的右上区域，移入设施框内仍不能避开。配件机B唤醒后标记淡出；种植机保持待机，S2末仍存在遮挡。没有擅自修改给定坐标、名牌或设施位置。

原始矩形、字号与每时刻相交记录：[checks.json](../shots/T7/gpu-zz/checks.json)。

| 截图 |
| --- |
${qa.screenshots.map(f=>`| [${f.split('/').at(-1)}](../shots/T7/gpu-zz/${f.split('/').at(-1)}) |`).join('\n')}

## 未完成交付与待处理边界

- smoke连续3次通过未完成；第1次GPU探针失败后停止。
- 未重渲横竖60秒、30fps、带音轨MP4，未ffprobe或解码抽6帧。dev/shots/T7/render/industrial-protocol-landscape.mp4、industrial-protocol-portrait.mp4仍是更早版本，不作为本轮交付。
- capture、build、check、build:site未执行；生成的catalog/agent数据尚未同步本轮renderer声明。没有以旧验证替代本轮通过。
- 继续工作需先处理Canvas 2D/DOM案例的GPU探针兼容性，以及两处Zz/相邻名牌的布局冲突。初始任务明确不改scripts且布局由主任务给定，因此本轮没有自行修改这两处边界。

以下为性能优化快照的有效证据，采于软件渲染环境、竖屏Zz新坐标应用之前；不冒充本轮GPU性能或新坐标的一致性验收。

${perf}`);
let doc=fs.readFileSync('docs/research/industrial-protocol.md','utf8');
doc=doc.replace('- 待机Zz相对设施外框右上角偏移(+8,-28)，唤醒时仍按既定时序上飘淡出。','- 条目声明renderer:gpu，由支持该字段的工具选择GPU启动配置。横屏待机Zz相对设施外框右上角偏移(+8,-28)；竖屏偏移(-40,+10)，字号33.6px，为原42px的0.8倍。唤醒仍按既定时序上飘淡出。');
doc=doc.slice(0,doc.indexOf('## 验证记录'))+`## 验证记录

| 检查 | 当前状态与证据 |
| --- | --- |
| 性能优化 | 保留静态层缓存、DOM去重和无逐帧布局读取。软件渲染性能快照中同步render平均1.658→0.584ms；该数据不作为GPU环境复测结果。 |
| 竖屏Zz | 9张S1/S2截图已逐张查看；实测字号33.6px。没有与其他设施框相交，但种植机/精炼炉名牌、配件机B/供电桩名牌仍相交。证据dev/shots/T7/gpu-zz/checks.json。 |
| GPU探测 | 截图检查的独立Canvas报告${qa.renderer}。该结果与原smoke输出分开记录。 |
| smoke | 原命令第1次退出1，在GPU_PROBE处报“需要GPU，未找到WebGL canvas”。现有探针只检查页面已有WebGL Canvas；本案例为Canvas 2D/DOM。未进入播放检查，按要求停止第2/3次。NODE_OPTIONS、BROWSER_PATH均未设置。 |
| 预览与构建 | 因smoke失败停止，capture、build、check、build:site未执行，派生条目尚未刷新renderer字段。 |
| 成片 | 未重渲最新横竖60秒/30fps带音轨MP4、未ffprobe及6帧解码；现存MP4不作为本轮交付。 |
| 音谱 | 音谱未改，已有WAV60秒/48kHz/2ch、99事件、峰值−3.2352dBFS、削波0证据有效；不替代新MP4音轨验证。 |

完整报告、原始命令、截图索引及未完成事项见本地dev/reports/T7.md。
`;
fs.writeFileSync('docs/research/industrial-protocol.md',doc);
fs.appendFileSync('dev/wip/T7/progress.md','\n- 2026-10-23：GPU配置下完成9张竖屏S1/S2截图并逐张查看，独立探针读到Intel Iris Xe/D3D11；Zz字号33.6px、其他设施框相交0，但种植机/精炼炉名牌与配件机B/供电桩名牌仍相交。原命令smoke第1次在WebGL探针处退出1（Canvas 2D/DOM页面无WebGL Canvas）；依要求停止第2/3次、MP4、capture及构建，报告和研究文档已同步。\n');
console.log('Updated report, research document, environment record and progress.');
