import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const qa=JSON.parse(fs.readFileSync('dev/shots/T7/fix8-layout/checks.json','utf8'));
const old=fs.readFileSync('dev/reports/T7.md','utf8');
const gpu=old.slice(old.indexOf('## 探针改动与两项专项回归'),old.indexOf('## 保留的性能优化证据'));
const perf=old.slice(old.indexOf('## 保留的性能优化证据'));
const fmt=r=>`(${r.x.toFixed(3)}, ${r.y.toFixed(3)}) ${r.w.toFixed(3)}×${r.h.toFixed(3)}`;
const inter=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y);return{x,y,w:Math.min(a.x+a.w,b.x+b.w)-x,h:Math.min(a.y+a.h,b.y+b.h)-y}};
const frame=qa.checks.find(c=>c.t===17),names=Object.fromEntries(frame.labels.map(n=>[n.id,n.text]));
const pairs=frame.labels.flatMap(n=>n.otherFacilities.map(f=>({label:n.text,other:names[f.id],a:n.rect,b:f.rect,c:inter(n.rect,f.rect)})));
const rows=pairs.map(p=>`| ${p.label} → ${p.other} | ${fmt(p.a)} | ${fmt(p.b)} | ${fmt(p.c)} |`).join('\n');
const states=[['furnace',19],['b',19.4],['power',19.8]].map(([id,t])=>({id,t,samples:[t,t+.15,t+.3].map(at=>{const s=qa.states.find(s=>Math.abs(s.t-at)<.0001);return{t:s.t,...s.devices.find(d=>d.id===id)}})}));
const stateRows=states.map(s=>`| ${names['machine-'+s.id]} | ${s.samples.map(s=>s.t.toFixed(2)).join(' / ')} | ${s.samples.map(s=>(+s.icon).toFixed(2)).join(' → ')} | ${s.samples.map(s=>s.lamp).join(' → ')} |`).join('\n');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const head=git('rev-parse','HEAD'),tracked=git('diff','--name-only','HEAD').split('\n').filter(Boolean),untracked=git('ls-files','--others','--exclude-standard').split('\n').filter(Boolean);
fs.writeFileSync('dev/reports/T7-files.txt',`Branch: feat/endfield-protocol\nBaseline: HEAD ${head}\nScope: all current tracked modifications and non-ignored untracked files. Nothing staged or committed.\nIgnored local evidence: dev/shots/T7/ (not Git branch source changes).\n\nTRACKED MODIFIED (${tracked.length})\n${tracked.join('\n')}\n\nUNTRACKED (${untracked.length})\n${untracked.join('\n')}\n`);
fs.writeFileSync('dev/reports/T7.md',`# T7 终末地 · 集成工业协议

当前状态：竖屏名牌已恢复设施下方原位置；竖屏Zz全部隐藏，待机蓝灯与中心图标0.7、0.3秒唤醒插值已实现并采样验证。9张S1/S2截图逐张查看后仍发现跨设施相交：精炼炉名牌→种植机、供电桩名牌→配件机B、配件机A名牌→粉碎机、粉碎机名牌→仓储箱。已按用户明确的跨设施相交即停要求停止，未执行本轮三次smoke、MP4、capture及构建，尚未完成交付。

工作树.worktrees/endfield，分支feat/endfield-protocol；没有暂存、提交、推送或切分支。横屏CSS位置、Zz及状态行为保持原逻辑，新的图标透明度和灯色插值仅在portrait分支应用；本轮没有重跑横屏像素对比，不将代码限定范围冒充截图验证。

## 当前实现与唤醒采样

- 竖屏名牌：恢复top:calc(100% + 8px)，保持28px字体、42px高度、4px 12px内边距、水平居中与原状态点。
- 竖屏Zz：display:none；9个截图时刻可见Zz数量均为0。
- 待机中心图标：SVG独立组opacity=0.7；外壳、栅线等外部静态细节保持。状态灯取配置zz色#4aa8ff。
- 精炼炉/配件机B/供电桩分别在19.0/19.4/19.8秒开始唤醒，0.3秒内灯色插值至ok色#5fd38a、中心图标opacity至1。旋转细环在各自唤醒时出现，延用4秒一圈。
- 种植机持续待机；20.2秒仍为蓝灯、图标0.7，外圈不出现。

| 设施 | 采样秒（开始/中点/完成） | 图标透明度 | 灯色 |
| --- | --- | --- | --- |
${stateRows}

唤醒采样与截图数据均在[checks.json](../shots/T7/fix8-layout/checks.json)。脚本语法检查通过；截图页面异常0。

## 跨设施检查与实测矩形

已重截并逐张查看S1 4.5/7/9.7秒，S2 10.5/12/16/17/20/23.7秒，共9张。检测明确排除名牌所属设施，只比较其他设施框及其他名牌；不将自身名牌的悬挂位置算违规。

17秒、1080×1920舞台、镜头scale=1的实测如下。格式为(左,顶) 宽×高，单位px。

| 名牌 → 其他设施 | 名牌矩形 | 其他设施框 | 交集 |
| --- | --- | --- | --- |
${rows}

名牌与名牌相交记录为${qa.checks.reduce((s,c)=>s+c.labels.reduce((s,n)=>s+n.otherLabels.length,0),0)}。停止原因是上表跨设施框相交。竖屏恢复原位置时保留了原有紧凑设施间距；隐藏Zz不改变名牌矩形。

| 截图 |
| --- |
${qa.screenshots.map(f=>`| [${f.split('/').at(-1)}](../shots/T7/fix8-layout/${f.split('/').at(-1)}) |`).join('\n')}

## 验收状态

| 项目 | 本轮结果 |
| --- | --- |
| 竖屏状态表示 | Zz隐藏、蓝灯/0.7图标及0.3秒唤醒采样通过 |
| 跨设施相交 | 未通过，存在4组名牌与其他设施框交集 |
| 原命令smoke第1/2/3次 | 均未执行：先触发跨设施相交即停条件 |
| 双画幅MP4 | 未重渲最新源码60秒/30fps带音轨影片，未ffprobe、未解码抽6帧 |
| capture | 未执行 |
| build / check / build:site | 未执行，不使用旧结果替代 |

现存dev/shots/T7/render/industrial-protocol-landscape.mp4和industrial-protocol-portrait.mp4仍是更早版本，未覆盖，不作为本轮交付。派生catalog/agent数据尚未build同步本轮竖屏状态说明。

继续交付前需要主任务给出这4组名牌/其他设施的避让参数；当前没有擅自移动设施或更改名牌样式。

## 改动文件清单

相对本分支HEAD ${head}，累计已跟踪修改${tracked.length}项、未跟踪且未忽略文件${untracked.length}项；完整清单见[T7-files.txt](T7-files.txt)。这是整个工作区累计状态，不只本轮改动。dev/wip/T7是过程资料，未暂存；被Git忽略的dev/shots/T7仅保留本地截图、音频和渲染证据。

${tracked.map(f=>'- '+f).join('\n')}

本轮实际源码变更为script.js（竖屏图标/灯色插值）、style.css（恢复名牌/隐藏Zz）及条目设施说明；对应parts、研究文档、报告和清单同步。GPU探针及性能缓存保留。

以下GPU专项回归的脚本代码未变，复用有效证据；它们不能替代当前T7三次smoke。

${gpu}
${perf}`);
let doc=fs.readFileSync('docs/research/industrial-protocol.md','utf8');
doc=doc.replace(/- 条目声明renderer:gpu[^\n]*/, '- 条目声明renderer:gpu。横屏待机Zz与原状态行为保持；竖屏隐藏Zz，以蓝色状态灯和中心图标0.7透明度表示待机。精炼炉/配件机B/供电桩在19.0/19.4/19.8秒开始0.3秒蓝绿灯色及图标0.7→1插值，外圈旋转细环出现。');
doc=doc.replace(/- 竖屏名牌保持[^\n]*/, '- 竖屏名牌采用设施下方8px的原位置，保持28px字体、42px高度、水平居中及状态点；名牌不要求收进设施内部，跨设施相交仍需验收。');
doc=doc.slice(0,doc.indexOf('## 验证记录'))+`## 验证记录

| 检查 | 当前状态与证据 |
| --- | --- |
| 竖屏状态 | 9张S1/S2截图可见Zz为0；图标0.7、19.0/19.4/19.8秒起0.3秒唤醒颜色和透明度采样通过。原始数据dev/shots/T7/fix8-layout/checks.json。 |
| 跨设施布局 | 未通过：精炼炉名牌→种植机，供电桩名牌→配件机B，配件机A名牌→粉碎机，粉碎机名牌→仓储箱；检查排除了自身设施。完整矩形在报告。 |
| GPU与性能 | 保留1×1后备探针和性能缓存。既有archive-os/day-night-flip各一次通过证据有效，不能替代T7当前画面的三次smoke。 |
| 本轮交付 | 因跨设施相交停止，3次smoke、capture、build/check/build:site、最新双画幅MP4及ffprobe/解码抽帧均未执行；旧MP4不作为交付。 |
| 音谱 | 未改音谱，已有WAV60秒/48kHz/2ch、99事件、峰值−3.2352dBFS、削波0证据不替代新成片音轨验证。 |

完整报告、截图、命令及文件清单见dev/reports/T7.md与dev/reports/T7-files.txt。
`;
fs.writeFileSync('docs/research/industrial-protocol.md',doc);
fs.appendFileSync('dev/wip/T7/progress.md','\n- 2026-10-23：9张竖屏S1/S2截图逐张查看，Zz可见0；炉/B/电桩0.3秒唤醒中点图标0.85、完成1，灯蓝→绿采样通过。恢复下挂名牌后出现炉→种植、电桩→B、A→粉碎、粉碎→仓储4组跨设施相交，按用户条件停止smoke/MP4/capture/构建；报告及文件清单已更新。\n');
console.log(rows);console.log(stateRows);console.log(JSON.stringify({tracked:tracked.length,untracked:untracked.length}));
