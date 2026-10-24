import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const qa=JSON.parse(fs.readFileSync('dev/shots/T7/fix7-layout/checks.json','utf8'));
const old=fs.readFileSync('dev/reports/T7.md','utf8');
const gpu=old.slice(old.indexOf('## 探针改动与两项专项回归'),old.indexOf('## 竖屏Zz实测与停止原因'));
const perf=old.slice(old.indexOf('## 保留的性能优化证据'));
const fmt=r=>`(${r.x.toFixed(3)}, ${r.y.toFixed(3)}) ${r.w.toFixed(3)}×${r.h.toFixed(3)}`;
const inter=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y);return{x,y,w:Math.min(a.x+a.w,b.x+b.w)-x,h:Math.min(a.y+a.h,b.y+b.h)-y}};
const s1=qa.checks.find(c=>c.t===7),s2=qa.checks.find(c=>c.t===17);
const names=Object.fromEntries(s2.labels.map(n=>[n.id,n.text]));
const nameRows=s2.labels.map(n=>`| ${n.text} | ${fmt(n.facility)} | ${fmt(n.rect)} | ${n.bottomGap.toFixed(3)} | ${n.overflow.left.toFixed(3)} / ${n.overflow.right.toFixed(3)} |`).join('\n');
const pairs=s1.zz.flatMap(z=>z.names.map(n=>({id:z.id,name:n.id,zz:z.rect,label:n.rect,overlap:inter(z.rect,n.rect)})));
const pairRows=pairs.map(p=>`| ${names[p.id]} / ${names[p.name]} | ${fmt(p.zz)} | ${fmt(p.label)} | ${fmt(p.overlap)} |`).join('\n');
const cross=qa.checks.reduce((s,c)=>s+c.labels.reduce((s,n)=>s+n.otherFacilities.length+n.otherLabels.length,0)+c.zz.reduce((s,z)=>s+z.otherFacilities.length+z.names.filter(n=>n.id!==z.id).length,0),0);
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const head=git('rev-parse','HEAD');
const manifest='dev/reports/T7-files.txt';fs.writeFileSync(manifest,'');
const tracked=git('diff','--name-only','HEAD').split('\n').filter(Boolean);
const untracked=git('ls-files','--others','--exclude-standard').split('\n').filter(Boolean);
fs.writeFileSync(manifest,`Branch: feat/endfield-protocol\nBaseline: HEAD ${head}\nScope: all current tracked modifications and non-ignored untracked files; no staging or commits.\nIgnored local evidence: dev/shots/T7/ (not included in Git branch changes).\n\nTRACKED MODIFIED (${tracked.length})\n${tracked.join('\n')}\n\nUNTRACKED (${untracked.length})\n${untracked.join('\n')}\n`);
fs.writeFileSync('dev/reports/T7.md',`# T7 终末地 · 集成工业协议

当前状态：竖屏名牌底边已定位在设施底边内侧6px；Zz已加nowrap、右上角(-40,+10)、字号33.6px。9张S1/S2截图已重截并逐张查看。不同设施之间的框/名牌交叉已消除，但名牌自然宽度大于设施，不能满足整体在框内；Zz还与同一设施名牌相交。按“若仍相交，停下报告”的要求停止，未执行本轮三次smoke、MP4、capture与构建，尚未完成交付。

工作树.worktrees/endfield，分支feat/endfield-protocol；没有暂存、提交、推送或切分支。横屏规则不变。性能优化及已授权GPU探针改动保留。

## 本轮实现与尺寸约束

竖屏名牌保持原字体28px、胶囊样式、42px高度、4px 12px内边距、状态点；只改top:auto、bottom:6px，沿用水平居中。Zz使用white-space:nowrap、left:calc(100% - 40px)、top:10px、font-size:calc(var(--subtitle) * .8)。

现有尺寸无法同时满足“字号、样式、状态点不变”和“名牌整体不超出设施框”：三字名牌自然宽108px，而普通设施仅73.141px，供电桩54.844px；工作状态点及间距使名牌再增宽18px。仅移动位置不能消除这个宽度差，没有裁切、压缩文字或更改设施尺寸。

17秒、1080×1920舞台、镜头scale=1时，各名牌实测如下。矩形格式为(左,顶) 宽×高，单位px。

| 名牌 | 设施框 | 名牌矩形 | 底边内距 | 左/右溢出 |
| --- | --- | --- | ---: | ---: |
${nameRows}

## Zz相交检查与截图

检查S1 4.5/7/9.7秒，S2 10.5/12/16/17/20/23.7秒，共9张，页面异常0。不同设施之间的Zz/名牌与其他设施框/名牌的相交记录合计${cross}。但同一设施内Zz与自己的名牌矩形相交；下表为7秒实测，Zz矩形包含错位的小写z。

| Zz / 名牌 | Zz矩形 | 名牌矩形 | 交集矩形 |
| --- | --- | --- | --- |
${pairRows}

供电桩名牌在自身设施内占据大部分高度，截图中Zz被其明显遮挡；精炼炉与配件机B也有自身名牌遮挡。种植机矩形边缘有小幅相交，不能以视觉不明显作为完全无交集。Zz自身已不换行，33.6px字号保持。

原始数据：[checks.json](../shots/T7/fix7-layout/checks.json)。9张截图均已打开查看：

| 截图 |
| --- |
${qa.screenshots.map(f=>`| [${f.split('/').at(-1)}](../shots/T7/fix7-layout/${f.split('/').at(-1)}) |`).join('\n')}

## 本轮验收状态

| 项目 | 当前结果 |
| --- | --- |
| Zz / 名牌 | 未通过：名牌超宽，且同一设施内Zz与名牌仍相交 |
| 原命令smoke第1/2/3次 | 本轮均未执行：先触发布局相交停止条件 |
| 两段MP4 | 未重渲最新源码60秒/30fps带音轨影片，未ffprobe、未解码抽6帧 |
| capture | 未执行 |
| build / check / build:site | 未执行；不使用旧结果替代 |

dev/shots/T7/render/industrial-protocol-landscape.mp4及industrial-protocol-portrait.mp4仍是更早版本，未覆盖，不作为本轮成片交付。派生catalog/agent数据尚未重新build同步当前renderer声明。

需要主任务放宽至少一项名牌宽度约束，并给出同一设施内Zz与名牌的避让参数；只移动保持原尺寸的名牌，无法使108px内容装进54.844px设施。

## 本分支全部改动文件清单

清单基准为本分支当前HEAD ${head}，覆盖整个工作区累计未提交改动，并非仅本轮两个CSS规则。Git报告已跟踪修改${tracked.length}项、未跟踪且未忽略文件${untracked.length}项；完整逐文件清单见[T7-files.txt](T7-files.txt)。未忽略的新文件包含dev/wip/T7的草稿、工具与日志，全部未暂存。dev/shots/T7的本地截图、音频和旧渲染帧受Git忽略规则管理，不作为分支源码文件。

已跟踪修改文件：

${tracked.map(f=>'- '+f).join('\n')}

未跟踪清单中长期交付相关的文件为dev/reports/T7.md、dev/reports/T7-files.txt及previews/cases/industrial-protocol-portrait.jpg；dev/wip/T7为过程资料。未承诺将过程资料纳入提交。

以下探针专项回归代码未变，复用有效证据；它们不能替代当前T7画面修改后的三次smoke。

${gpu}
以下为软件渲染环境的性能优化快照，早于本轮名牌/Zz位置，不作为本轮GPU性能或画面一致性验收。

${perf}`);
let doc=fs.readFileSync('docs/research/industrial-protocol.md','utf8').replace('竖屏相对设施中心偏移(+28,-36)，字号33.6px','竖屏相对设施右上角偏移(-40,+10)，加white-space:nowrap，字号33.6px');
doc=doc.replace('## 视觉token','- 竖屏名牌保持28px字体、42px高度和状态点，水平居中，底边距设施底边6px；当前自然宽度大于部分设施，整体在框内的约束尚未满足。\n\n## 视觉token');
doc=doc.slice(0,doc.indexOf('## 验证记录'))+`## 验证记录

| 检查 | 当前状态与证据 |
| --- | --- |
| 竖屏名牌与Zz | 9张S1/S2截图逐张查看，名牌底边内距6px、Zz单行33.6px已落实。不同设施之间的相交记录${cross}；同一设施的Zz与自身名牌仍相交，名牌自然宽度108px超过普通设施73.141px/供电桩54.844px。矩形见dev/shots/T7/fix7-layout/checks.json。 |
| GPU探针 | smoke/capture已具备临时1×1 Canvas后备探针并释放上下文；四个软件关键词不变。archive-os、day-night-flip已有各一次通过证据，代码未变。 |
| 本轮T7验收 | 先触发布局相交停止条件，三次smoke、capture、build/check/build:site、最新双画幅MP4及ffprobe/解码抽帧均未执行。 |
| 性能与声音 | 性能优化、音谱均保留；已有软件环境render均值1.658→0.584ms及WAV60秒/48kHz/2ch、99事件、峰值−3.2352dBFS、削波0证据不能替代当前成片验收。 |

完整矩形、截图、验证状态及本分支文件清单见dev/reports/T7.md与dev/reports/T7-files.txt。
`;
fs.writeFileSync('docs/research/industrial-protocol.md',doc);
fs.appendFileSync('dev/wip/T7/progress.md','\n- 2026-10-23：竖屏名牌底边内距6px、Zz nowrap完成9张S1/S2重截并逐张查看；不同设施间相交0，但名牌宽108px大于73.14/54.84px设施，同设施Zz与自身名牌仍相交。依要求停止T7 smoke/MP4/capture/构建，报告记录尺寸冲突与完整工作区文件清单。\n');
console.log(JSON.stringify({tracked:tracked.length,untracked:untracked.length,cross},null,2));console.log(nameRows);console.log(pairRows);
