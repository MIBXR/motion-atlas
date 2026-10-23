import fs from 'node:fs';
const q=JSON.parse(fs.readFileSync('dev/shots/T7/qa.json','utf8'));
const s4=JSON.parse(fs.readFileSync('dev/shots/T7/s4-measure.json','utf8'));
const at=(o,t=44)=>s4.layouts.find(v=>v.orient===o&&v.time===t);
const num=n=>Number(n.toFixed(3));
const rect=r=>`(${num(r.x)}, ${num(r.y)}) ${num(r.width)} × ${num(r.height)}`;
const h=at('landscape'),p=at('portrait');
const times=[['S0',0,4],['S1',4,10],['S2',10,24],['S3',24,36],['S4',36,48],['S5',48,56],['S6',56,60]];
const index=times.map(([id,a,b])=>`| ${id} | ${[a+.5,(a+b)/2,b-.3].map(t=>t.toFixed(3)).join(' / ')} | ${['landscape','portrait'].map(o=>[a+.5,(a+b)/2,b-.3].map(t=>`[${t.toFixed(3)}s](../shots/T7/shots/${o}-${id}-${t.toFixed(3)}.png)`).join('、')).join(' | ')} |`).join('\n');
const lines=`# T7 终末地 · 集成工业协议

当前状态：本轮无歧义的S4坐标和自绘美术已经实施并生成审查截图，尚未达到最终交付。100px字标外框与自然字体墨迹宽度冲突、粉碎机对辊周期仍待用户决定；没有压字、降字号、裁切或代选周期。最终两套60秒MP4尚未按本轮源码重渲。

工作树：.worktrees/endfield；分支feat/endfield-protocol。没有暂存、提交、推送、切分支或发布。服务只使用localhost:4325，scripts目录未修改。

## S4实测矩形

坐标均为舞台像素，矩形格式为(x,y)宽×高。人物同时记录SVG框与实际可见路径，避免把留白误认为剪影尺寸。数据来自s4-measure.json，几何采样44秒，提示条采样41.8秒。

| 项目 | 横屏 | 竖屏 |
| --- | --- | --- |
| 等级块合并框 | ${rect(h.levelUnion)} | ${rect(p.levelUnion)} |
| 数字字框 | ${rect(h.boxes['.op-level-roll'])}；220px | ${rect(p.boxes['.op-level-roll'])}；200px |
| LEVEL/40 | ${rect(h.boxes['.op-level-caption'])} | ${rect(p.boxes['.op-level-caption'])} |
| 经验条 | ${rect(h.boxes['.op-experience'])} | ${rect(p.boxes['.op-experience'])} |
| 升级胶囊 | ${rect(h.boxes['.op-upgrade'])} | ${rect(p.boxes['.op-upgrade'])} |
| 旋转字指定外框 | (1790,80)100×920；160px | (960,110)100×680；150px |
| 旋转字实际可见墨迹 | (1784,221)114×639 | (957,150)107×600 |
| 人物SVG框 | ${rect(h.boxes['.op-person'])} | ${rect(p.boxes['.op-person'])} |
| 人物可见路径框 | ${rect(h.silhouette)} | ${rect(p.silhouette)} |
| 提示条中心 | (960,120) | (540,200)，底边约247.398，位于头顶330上方 |

两画幅的LEVEL/40与人物SVG框、可见路径框均不相交。旋转字完整显示、没有舞台裁切、不与等级块相交，但自然墨迹越出指定100px宽外框：横超14px、竖超7px。字体独立探针采用完整alpha轮廓得到114×642、107×602；实际画面隔离墨迹采用RGB阈值<128，故高度有少量差异。两项证据均确认宽度冲突，未混作同一测量方法。

## 本轮执行对照

| 用户要求 | 实现与状态 | 证据 |
| --- | --- | --- |
| 横屏S4坐标 | 黄带1440/1640；等级x1500、数字250、caption500、经验532、胶囊568；toast中心960/120 | s4-measure.json；S4截图 |
| 竖屏S4坐标 | 人物可见高约900、中心约400、头顶约330；黄带720/900至1220；等级x720、数字800、caption1010、经验1046、胶囊1080；toast中心540/200；信息卡保持 | s4-measure.json；S4截图 |
| 中频草地与草叶 | 120px尺度深浅斑块、35%透明度；每32×32区域6根3–6px草叶；固定种子 | main.js makeTerrain；S1/S2截图 |
| 泥土与石块 | 六块不规则泥土、边缘blur2px、内部颗粒；40块6–14px大石带1px阴影，避开设施和带路 | makeTerrain；S1/S2截图 |
| 设施通用外观 | 6px深外缘、内面板及1px横竖缝、黄L角、白色四向端口、右上6px状态灯及2pxhalo；名牌保持 | machineSVG；S1/S2截图 |
| 七类专属结构 | 炉口/竖栅、齿轮/上下横栅、相切双辊、箱格栅/60%宽条、三行作物点、柱顶菱形/三电弧、核心三角桁架/菱形/黄环 | machine-art片段整合后的script.js |
| 指定专属动效 | 炉口0.8s呼吸、齿轮2s/圈、电弧0.3s定种子换形已实现；双辊反向周期未定，当前未转 | renderMachineDetails |
| 传送带 | 连续40px带体+两边各4px深边、白色14px V纹/3px线/32px间距、圆角L与切线转向、物料2px深描边 | drawBelt；S2截图 |
| 蓝图虚影 | 三设备用同一专属结构的ghost线框绘制，保留512px整体与原旋转吸附时序 | S2 12s与对照图 |
| 其他内容 | 时长、标记、音谱、面板/分享交互保持；17种音色、99事件未变 | config；有效WAV复用 |

## 截图与比较索引

本轮审查版本已重截42张规定点和7张补充点，逐张查看记录在visual-panel.md、visual-operator.md。未将自然字形越外框和未定对辊周期写成设计通过。

| 场景 | 时刻 | 横屏 | 竖屏 |
| --- | --- | --- | --- |
${index}

三组参考并排图：[S2蓝图](../shots/T7/compare/S2-blueprint.png)、[S3设备](../shots/T7/compare/S3-machine-panel.png)、[S4干员](../shots/T7/compare/S4-operator.png)。七张contact sheet只作导航，不替代原图逐张查看。

## 验证数据与边界

- 本轮审查快照qa自动ok=${q.ok}，complete=${q.complete}；六组DOM、Canvas及严格PNG均相同；字体、sound:true、画幅切换保时刻、reduced-motion检查通过；console及未捕获异常为0。自动结果不等于设计约束通过。
- 音谱未改，复用60秒、48000Hz、2ch、99事件的有效WAV：峰值${q.audio.peakDb.toFixed(4)}dBFS，削波${q.audio.clipped}。没有重复导出或更改混音。
- build及build:site成功；check只有49项旧24/36px字号错误，其他错误0，未改scripts。
- smoke本轮未达到连续三次通过：完整seek可执行，但播放1.5秒有时只推进约0.27–0.33秒；不是字号错误。render同步计算实测约0.85–1.4ms/次，单独播放曾推进1.60秒；正在对照页面调度与完整seek历史，尚未断言内部原因。
- 旧严格PNG差异数据仍保存在diagnostic/png-diffs.json，属于不同源码审查快照，不拿旧结果覆盖本轮六组相同的新结果。
- 全长MP4仍是前一版文件，不包含本轮美术和S4新布局，不作为本轮交付。待约束明确并通过smoke后，按最新源码重渲两段、ffprobe并解码抽6帧。

## 待决定与遗留

1. 字标：保持160/150px并扩宽目标外框至自然114/107px，或维持100px框并允许旋转后字形横向压缩，或由主任务另给字号/外框坐标。当前不擅自采用其中任何一种。
2. 粉碎机双辊：请给旋转周期。当前代码没有默认值，不能用静态图证明已完成反向转动。

既有布局的名牌及种植机Zz覆盖相邻机体边缘但文字完整；竖屏连通提示与资源胶囊间距实际130px而原说明24px。本轮要求只改指定范围，因此这些坐标没有扩大修改，作为审查备注保留。

嵌套SVG默认百分比视口曾使ghost内部横偏192逻辑像素，已给设备SVG明确width/height纠正。S3合成重复问题仍有旧红样本，地图层模糊的当前原QA截图反馈通过。服务未运行造成的一次页面等待超时已通过只启动4325服务解决。
`;
fs.writeFileSync('dev/reports/T7.md',lines);
