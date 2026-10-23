import fs from 'node:fs';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const before=read('dev/shots/T7/perf/before/timings.json'),after=read('dev/shots/T7/perf/after/timings.json'),diff=read('dev/shots/T7/perf/consistency.json'),failure=read('dev/shots/T7/perf/failure-time.json');
const avg=(a,k)=>a.reduce((s,v)=>s+(k?v[k]:v),0)/a.length;
const fmt=v=>v.toFixed(3),keys=['ground','facilities','belts','other','total'];
const command='node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --only industrial-protocol --base http://localhost:4325';
const env={command,cwd:process.cwd(),node:process.execPath,NODE_OPTIONS:process.env.NODE_OPTIONS??null,BROWSER_PATH:process.env.BROWSER_PATH??null,browser:after.browser};
fs.writeFileSync('dev/wip/T7/perf-smoke-env.json',JSON.stringify(env,null,2));
const rows=before.samples.map((b,i)=>{const a=after.samples[i];return{orient:b.orient,t:b.t,before:Object.fromEntries(keys.map(k=>[k,avg(b.render,k)])),after:Object.fromEntries(keys.map(k=>[k,avg(a.render,k)])),wallBefore:avg(b.wall),wallAfter:avg(a.wall),p95Before:[...b.render].sort((a,b)=>a.total-b.total)[56].total,p95After:[...a.render].sort((a,b)=>a.total-b.total)[56].total,maxBefore:Math.max(...b.render.map(v=>v.total)),maxAfter:Math.max(...a.render.map(v=>v.total))};});
const totalBefore=avg(rows.map(r=>r.before.total)),totalAfter=avg(rows.map(r=>r.after.total));
fs.writeFileSync('dev/shots/T7/perf/summary.json',JSON.stringify({rows,totalBefore,totalAfter,reduction:1-totalAfter/totalBefore},null,2));
let report=`# T7 终末地 · 集成工业协议

当前状态：渲染优化和前后测量、画面一致性检查已完成。默认无头Edge的原命令smoke第1次仍失败，播放1.5秒只推进到0.1835秒。依照“若仍失败，停下来”的要求，未执行第2/3次smoke、最新MP4渲染、ffprobe/解码抽帧或build/check/build:site，尚未完成交付。

工作树为 .worktrees/endfield，分支 feat/endfield-protocol；没有暂存、提交、推送或切分支，scripts目录未修改，仅使用4325服务。诊断插桩位于dev/wip/T7/perf-instrumented.js，正式demo源码不含计时插桩。

## 实现与范围

| 要求 | 当前实现 | 证据 |
| --- | --- | --- |
| 静态地面 | 地面Canvas是保留层，草地、斑块、草叶、泥斑、颗粒、碎石和网格仅初始化/画幅切换绘制；斜纹边界为静态DOM。镜头只变换world层。基线本来已有此行为，本轮没有把它误报为新增收益。 | script.js makeTerrain / layoutKey；ground分项 |
| 传送带与物料 | 完整带体按画幅缓存到离屏Canvas；施工中仍按原64px段绘制；V纹和物料按原时间计算。静止阶段保留flow层，不重复clearRect及绘制。 | drawBelt / flowKey；10组像素比较 |
| 设施静态与动态 | 设施底座、面板缝、角标、名牌继续使用静态DOM/SVG；节点列表缓存，灯、Zz、齿轮和对辊等只在值变化时写属性。 | machineSVG / renderMachineDetails |
| DOM去重 | style、文本、innerHTML和SVG属性相同值不重复写。资源数字使用固定子节点，仅更新变换；隐藏的面板/干员时间限制在不可见边界。 | write / styles / attribute / roll |
| 无逐帧布局读取 | 光标目标使用既定布局坐标与弹窗变换计算，移除render链中的getBoundingClientRect。字体度量仍按实际已加载字体计算。 | cursorAt / createOperator |
| 画面不变 | 10组全尺寸逐像素RGB比较及四分之一缩略MAD均通过给定阈值；最大通道差1，符合离屏合成与栅格化边缘8位舍入的特征（原因推断）。无构图、字号、时序、音谱修改。 | consistency.json / before / after |

缓存字体度量的尝试在图像比较中暴露了竖排字位置差异，已撤掉；最终10组结果不包含该差异。

## 分项性能测量

实际环境为默认无头Edge，入口 ${after.browser}，NODE_OPTIONS与BROWSER_PATH均未设置。测量采用原smoke使用的CDP启动器及direct-browser导入，窗口1280×720。每个画幅的7、17、30、42、52秒分别连续采60帧，时间为 t+i/60，i=0..59；每次在requestAnimationFrame回调后同步seek。每阶段共600帧，原始JSON保存每帧分项及回调间隔。

测量使用正式源码的临时插桩副本；下表是同步render(t)平均耗时（ms），不包含异步GPU栅格化、合成、呈现及浏览器调度等待。地面分项也包含静态层失效条件检查；设施分项含设施与蓝图虚影，其他含HUD、面板、干员、光标及转场。performance.now的约0.1ms粒度使极小分项只宜看均值，0.000不表示不存在成本。

| 画幅/秒 | 地面 前→后 | 设施 前→后 | 带/料 前→后 | 其他 前→后 | 合计 前→后 | 降幅 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.map(r=>`| ${r.orient}/${r.t} | ${keys.map(k=>`${fmt(r.before[k])} → ${fmt(r.after[k])}`).join(' | ')} | ${((1-r.after.total/r.before.total)*100).toFixed(1)}% |`).join('\n')}

全样本均值：${fmt(totalBefore)} → ${fmt(totalAfter)} ms，降低${((1-totalAfter/totalBefore)*100).toFixed(1)}%。带体离屏合成在部分动态时刻的同步成本高于直接描线；本轮收益主要来自DOM去重、去掉同步布局读取及静止flow层保留，不宣称每一分项都变快。

| 画幅/秒 | render P95 前→后 ms | render最大值 前→后 ms | rAF间隔均值 前→后 ms |
| --- | ---: | ---: | ---: |
${rows.map(r=>`| ${r.orient}/${r.t} | ${fmt(r.p95Before)} → ${fmt(r.p95After)} | ${fmt(r.maxBefore)} → ${fmt(r.maxAfter)} | ${fmt(r.wallBefore)} → ${fmt(r.wallAfter)} |`).join('\n')}

原始数据：[优化前](../shots/T7/perf/before/timings.json)、[优化后](../shots/T7/perf/after/timings.json)、[汇总](../shots/T7/perf/summary.json)。rAF间隔包含当前测试环境的调度/绘制开销，不作为smoke播放通过的替代证据。

## 画面一致性与截图

比较相同t的1920×1080、1080×1920截图。全尺寸逐像素比较RGB；缩略图为480×270、270×480，MAD为所有RGB通道绝对差均值除以255。阈值1/255约0.003921569。

| 画幅/秒 | 全尺寸MAD | 缩略MAD | 全尺寸变化像素数 | 最大通道差 |
| --- | ---: | ---: | ---: | ---: |
${diff.map(d=>`| ${d.orient}/${d.t} | ${d.result[0].MAD.toExponential(6)} | ${d.result[1].MAD.toExponential(6)} | ${d.result[0].changed} | ${d.result[0].max} |`).join('\n')}

缩略MAD最大${Math.max(...diff.map(d=>d.result[1].MAD)).toExponential(9)}，10/10通过。差异符合离屏缓冲抗锯齿透明边缘与地面合成时的8位舍入特征；S3模糊及半透明层可能扩散这些微小差异。这是基于差异幅度和绘制路径的推断，未逐像素追踪归因。S5两画幅完全相同。数据：[consistency.json](../shots/T7/perf/consistency.json)。

| 场景/秒 | 当前横屏 | 当前竖屏 |
| --- | --- | --- |
${[['S1',7],['S2',17],['S3',30],['S4',42],['S5',52]].map(([s,t])=>`| ${s}/${t} | [横屏](../shots/T7/perf/after/landscape-${t}.png) | [竖屏](../shots/T7/perf/after/portrait-${t}.png) |`).join('\n')}

所有对应基线位于dev/shots/T7/perf/before/。S0/S6未在本轮新增截图；此前完整截图与三组参考对照仍位于dev/shots/T7/shots/与dev/shots/T7/compare/，不能称为本轮重新生成。

## smoke与失败时刻

实际Node命令原样为：

~~~sh
${command}
~~~

PowerShell仅在末尾使用 *> dev/wip/T7/perf-smoke-1.log 保存输出，无附加Node参数或环境变量。NODE_OPTIONS=null，BROWSER_PATH=null。环境记录：[perf-smoke-env.json](../wip/T7/perf-smoke-env.json)。

| 次数 | 结果 |
| --- | --- |
| 1 | 退出1；播放1.5秒只从0走到0.1835秒；smoke 0/1 passed |
| 2 | 按失败即停要求，未执行 |
| 3 | 按失败即停要求，未执行 |

完整日志：[perf-smoke-1.log](../wip/T7/perf-smoke-1.log)。两画幅的0–60秒seek扫描完成，日志有2项旧字号警告，明确未计为失败。失败原因是播放时间推进不足；日志没有标明是哪一画幅的播放检查失败，不推定方向。

为报告失败时刻的计算耗时，单独在默认Edge里对t=0.1835秒、两画幅各采60次render；没有重跑smoke或修改源码。这是失败时刻的独立样本，不是失败进程现场trace，不能用于断言当时GPU/调度的耗时。

| 画幅 | 地面 ms | 设施 ms | 带/料 ms | 其他 ms | 合计均值 ms | 合计最大 ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${failure.orientations.map(o=>`| ${o.orient} | ${keys.map(k=>fmt(avg(o.frames,k))).join(' | ')} | ${fmt(Math.max(...o.frames.map(v=>v.total)))} |`).join('\n')}

数据：[failure-time.json](../shots/T7/perf/failure-time.json)。已验证同步render明显下降，但原smoke仍失败；“减少计算成本即可稳定通过”的预期未实现。既有Edge诊断中出现过LayerTreeHost析构/GL等待约1.1秒，本次没有重新采到失败现场trace，不能把历史线索当作此次已确认根因。

## Zz视觉观察结论

相对设施外框右上角(+8,-28)锚点保持不变。重新查看优化后的portrait-7.png，仍能看到精炼炉Zz与协议核心名牌、种植机Zz与精炼炉名牌、配件机B的Zz与供电桩名牌局部相交。缓存优化没有引入或消除该现象；给定坐标已落实，但“没有任何名牌遮挡”不成立。本轮只做性能优化，没有擅自移动标记、设施或名牌。

## 未完成交付

- 未获得原命令连续3次通过，因此没有最新源码的两段60秒/30fps带音轨MP4。
- 现存 dev/shots/T7/render/industrial-protocol-landscape.mp4 与 industrial-protocol-portrait.mp4 是更早版本，未覆盖；本轮未ffprobe或解码抽6帧，不作为本轮成片交付。
- build、check、build:site未执行；用户允许旧字号报错，但本轮不能声称其他构建检查通过。scripts未改。
- 音谱未修改，已有renderWav的60秒/48kHz/2ch、99事件、峰值−3.2352dBFS/削波0证据仍适用于音谱，不能替代新MP4音轨验证。
- 需继续解决默认Edge的原smoke播放推进失败，才可恢复完整渲染交付；当前已按用户明确的停止条件结束执行。
`;
fs.writeFileSync('dev/reports/T7.md',report);
let doc=fs.readFileSync('docs/research/industrial-protocol.md','utf8');
const appendix=doc.indexOf('\n- 工作中的粉碎机');
const params=appendix<0?'':doc.slice(appendix).trim();
if(appendix>=0)doc=doc.slice(0,appendix);
doc=doc.replace('## 视觉token',params+'\n\n- 静态地面及设施外观采用保留层；完整带体按画幅离屏缓存，静止flow不重画。动态帧只更新变化属性，光标路径不读取布局。\n\n## 视觉token');
doc=doc.slice(0,doc.indexOf('## 验证记录'))+`## 验证记录

| 检查 | 当前状态与证据 |
| --- | --- |
| 横竖性能 | 默认无头Edge在7/17/30/42/52秒各连续60帧；同步render平均${fmt(totalBefore)}→${fmt(totalAfter)}ms，完整分项与原始帧数据见dev/reports/T7.md及dev/shots/T7/perf/。地面基线已有静态缓存，收益主要来自DOM写入、布局读取和静止flow处理。 |
| 画面一致性 | 横竖10组全尺寸逐像素比较，缩略MAD最大${Math.max(...diff.map(d=>d.result[1].MAD)).toExponential(6)}，均小于1/255；通道最大差1，符合离屏合成边缘舍入特征（原因推断）。 |
| S4排版 | 横160/竖150自然字体，目标框120px宽，无压缩/裁切；LEVEL/40与人物分离。当前42秒截图在dev/shots/T7/perf/after/。 |
| Zz | (+8,-28)锚点正确；竖屏部分Zz仍与邻近名牌局部相交，性能优化不改变此布局。 |
| smoke | 默认Edge原命令第1次退出1：1.5秒仅推进0.1835秒；字号警告未计为失败。按失败即停要求，未执行第2/3次。NODE_OPTIONS与BROWSER_PATH均未设置。 |
| 失败时刻耗时 | 对t=0.1835秒独立采样的同步render平均横${fmt(avg(failure.orientations[0].frames,'total'))}ms/竖${fmt(avg(failure.orientations[1].frames,'total'))}ms；不是失败现场GPU/调度trace。 |
| 构建与成片 | 因smoke失败停止，未执行本轮build/check/build:site、最新横竖全长MP4、ffprobe及6帧解码；现存MP4不作为本轮交付。 |
| 音谱 | 音谱未改，已有WAV60秒/48kHz/2ch、99事件、峰值−3.2352dBFS、削波0证据有效；新MP4音轨待实际重渲验证。 |

完整报告、原始命令、截图索引及未完成事项见本地dev/reports/T7.md。
`;
fs.writeFileSync('docs/research/industrial-protocol.md',doc);
fs.appendFileSync('dev/wip/T7/progress.md',`\n- 2026-10-23：优化后默认Edge原命令smoke第1次退出1，播放1.5秒仅推进0.1835秒；按要求停止第2/3次、MP4和构建。失败时刻独立采样render均值横${fmt(avg(failure.orientations[0].frames,'total'))}ms/竖${fmt(avg(failure.orientations[1].frames,'total'))}ms（非失败现场trace）。报告/研究文档已同步，Zz残留名牌相交结论保留。\n`);
console.log(JSON.stringify({totalBefore,totalAfter,reduction:1-totalAfter/totalBefore,rows:rows.map(r=>({orient:r.orient,t:r.t,wallBefore:r.wallBefore,wallAfter:r.wallAfter}))},null,2));
