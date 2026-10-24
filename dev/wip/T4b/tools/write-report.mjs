import fs from 'node:fs';

const base='dev/shots/T4b/';
const effectsBase=base+'fix5-effects/';
const read=file=>fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
const code=value=>'`'+String(value)+'`';
const cell=value=>String(value??'未记录').replaceAll('|','\\|').replaceAll('\n','<br>');
const num=(value,digits=6)=>typeof value==='number'?Number(value.toFixed(digits)):'未记录';
const index=read(effectsBase+'index.json');
const items=index?.items||[];
const route=read(effectsBase+'route-draw-marker/index.json');
const seek=read(effectsBase+'seekable-timeline/checks.json');
const dayReview=read(effectsBase+'day-night-flip/review.json');
const mad=read(effectsBase+'day-night-flip/mad/verification.json');
const finalState=read(base+'final-state.json');
const lineSummary=read(base+'portrait-lines/summary.json');
const dayEntry=read('entries/patterns/day-night-flip.json');
const seekScore=read('demos/patterns/seekable-timeline/score.json');
const comparisons=(mad?.items||[]).map(item=>({item,result:item.comparisons.find(result=>result.caseT===35.8)}));
const reviewed=new Set(items.filter(item=>item.review?.file===item.file).map(item=>item.file));
const existing=items.filter(item=>fs.existsSync(item.file));
const lowContrast=(dayReview?.rows||[]).filter(row=>row.issues?.includes('low-contrast-hud'));
const rect=value=>value?`${num(value.x)}, ${num(value.y)}, ${num(value.w??value.width)}, ${num(value.h??value.height)}`:'未记录';
let report=`# T4b 本轮局部效果报告

本轮按最新用户决定修改seekable-timeline并交付四项效果截图、逐张审图、全段碰撞检查和地图区域MAD；**没有进行T4b完整验收，也不宣称最终完成。** 本轮核心PNG为24张（route4、seek6、day-night10、film4），另有MAD参考图和参与区mask。

当前结果：seek已去掉底部HUD与Δ，上移导致的旧碰撞不再作为当前停止原因；628/628局部检查通过。day-night地图MAD横竖均未达到严格<4/255，且六张采样有HUD低对比观察。已保留既定画面与口径，等待主任务决定镜头/参考几何及HUD配色问题。

## 范围与实现

| 项目 | 本轮实现 | 局部证据/边界 |
|---|---|---|
| route S3 | 两站地理中点、舞台居中、零padding、20%边距且zoom≥13；源候选优先避开可见路线、其他标签/标记和舞台边缘；不避让隐藏HUD | t9、10.4横竖四图及候选诊断，不代表全片验收 |
| seek底部 | 不显示NOW PLAYING、歌词、步进器，取消Δ；保留顶部HUD、kix卡片/引线、徽章、控制条；署名在控制条上方，g横12/竖18，右对齐 | 全段采样与t0.5、2.3、4.5横竖六图；不是smoke |
| day-night | caseT=31.3+t（t<4.5），之后36.6+(t−4.5)；全HUD/dayNight取caseT，镜头仍固定34.5；复制wash暖色，score重取四事件 | t0.5、2、3.5、5、6.5横竖十图；MAD只对源35.8 |
| film | 照片取源13.5媒体实际可见区，插画取回忆画布，cover铺满；不带CSS卡片框/阴影/圆角/说明 | t3.75、6.25横竖四图；root逐张看过，无新增问题 |

方案背景为${code('dev/wip/T4b/plan-fix-5.md')}及最新用户决定。GPU状态：条目${code('entries/patterns/day-night-flip.json')}的renderer=${code(dayEntry?.renderer??'未记录')}，**GPU声明，待外分支机制合并后复验**。本分支未实现GPU分流机制、未修改scripts；本轮硬件适配器只用于获准截图/局部测量，不能称正式smoke/capture通过。

## 24张效果图与逐张查看

总索引${code(effectsBase+'index.json')}：记录${items.length}张，文件存在${existing.length}张，索引含逐张review${reviewed.size}张。索引中的renderer与原生尺寸记录保留；本轮截图适配器：${cell(JSON.stringify(index?.rendererAdapter??'见索引'))}。

| 巧思 | 画幅 | t | PNG | 实际观察 |
|---|---|---:|---|---|
`;
for(const item of items)report+=`| ${item.id} | ${item.orient} | ${item.t} | ${code(item.file)} | ${cell(item.review?.observation??item.review?.observations?.join('；')??'尚无逐张观察记录')} |\n`;
report+=`
逐张记录分别为${['route-draw-marker','seekable-timeline','day-night-flip','film-grain'].map(id=>code(effectsBase+id+'/review.json')).join('、')}。day10张由spec_audit逐张看原生PNG；其他14张按索引所附root/代理记录，不把“生成过”视为“已查看”。

## route两站坐标与标签候选

以下是本轮新镜头实测，旧route-final-cameras.json中x384/898的居中前方案不作当前证据。候选编号从0开始；完整路线折线、线宽及各候选碰撞结果在${code(effectsBase+'route-draw-marker/index.json')}及同目录每帧JSON。

| 画幅/t | camera | JR NARA x/y | NARA PARK x/y | 选择结果 |
|---|---|---|---|---|
`;
for(const item of route?.items||[]){const jr=item.stops.find(stop=>stop.id==='jrNara'),park=item.stops.find(stop=>stop.id==='naraPark');const selections=(item.placement?.labels||[]).map(label=>`${label.stop}: #${label.selectedCandidateIndex}, side=${label.side}, dy=${label.dy}, fallback=${label.fallback}; 碰撞=${JSON.stringify(label.finalCollisions)}`).join('；');report+=`| ${item.orient}/${item.t} | ${cell(JSON.stringify(item.camera))} | ${num(jr?.x)} / ${num(jr?.y)} | ${num(park?.x)} / ${num(park?.y)} | ${cell(selections)} |\n`;}
report+=`
两站关于舞台中心近似对称；审图记录中JR标签已避开步行虚线。t9的NARA字样属于源入场打字中间态，不能当作截断缺字。

## seek全段局部碰撞检查

证据${code(effectsBase+'seekable-timeline/checks.json')}：完成${seek?.summary?.sampled??'未记录'}/${seek?.summary?.planned??'未记录'}采样，碰撞${seek?.summary?.collisions??'未记录'}，失败采样${seek?.summary?.failedSamples??'未记录'}，执行错误${seek?.summary?.errors??'未记录'}。该检查验证底部HUD隐藏、应保留部件、署名/控制条间距与卡片/说明碰撞；不跑播放测试。

本轮无底部HUD，也无Δ字段布局规则。kix卡片及说明未移动或缩小。seek声音事件数为${Array.isArray(seekScore)?seekScore.length:'未记录'}，没有独立步进器事件需要删除，其余保留；本轮没有重新导出WAV或进行声音完整验收。

## day-night地图MAD：已验证失败

证据${code(effectsBase+'day-night-flip/mad/verification.json')}。严格比较巧思t3.5与案例35.8；巧思按映射实际caseT34.8、镜头固定34.5。复用同版同t的原生巧思PNG，只新增源35.8参考图；不改参考时刻或相机求通过。

方法：保留wash、grain、vignette及HUD fade；只排除双方可见文字Range、SVG叶形状、实体背景/画布与计算阴影。面积平均缩略图按RGB通道绝对差取平均；阈值严格<4/255，没有新增覆盖率阈值或为通过增大mask。

| 画幅 | MAD | 阈值结果 | 地图参与比例/像素 | RGB均值差绝对值 | camera Δzoom/Δbearing | mask PNG |
|---|---:|---|---|---|---|---|
`;
for(const {item,result} of comparisons){if(!result)continue;const a=item.pattern.state.camera,b=item.references.find(reference=>reference.t===35.8).state.camera;const meanDiff=result.meanPattern.map((value,index)=>Math.abs(value-result.meanCase[index]));report+=`| ${item.orient} | ${num(result.mad)} | ${result.pass?'通过数值阈值':'失败'} | ${num(result.coverage*100,2)}% / ${result.pixels} | ${meanDiff.map(value=>num(value)).join(' / ')} | ${num(Math.abs(a.zoom-b.zoom))} / ${num(Math.abs(a.bearing-b.bearing))} | ${code(result.maskPng)} |\n`;}
report+=`
双方RGB均值各通道差<0.25，是上述数值结果；**不能证明唯一差异来源就是几何或颗粒**。camera的zoom差约0.066675、bearing差约1.333505也是实测，但不是单因果证明。判定只说明本口径MAD未过，不应直接改称“纯色调错误”或“仅几何造成”。

参与区横约50.96%、竖约23.27%。竖屏源note及其阴影占据大面积，剩余地图代表性有限；PNG mask白色参与、黑色排除，四区coverage和MAD均在JSON中。root和审阅代理查看过参与区图。没有增加mask或改阈值使数值通过。

## day-night逐图低对比观察

${code(effectsBase+'day-night-flip/review.json')}保留${lowContrast.length}张低对比采样：${lowContrast.map(row=>`${row.orient} t${row.t}`).join('、')}。t0.5白色HUD落在亮地图上；t2灰色HUD与灰地图接近；t5部分日期/海拔/曲目信息仍偏淡。t3.5夜景和t6.5白天的主体文字可辨，t3.5时钟已为20:35。

这是实际原生截图观察，不是新测得的对比度数值。代码关系可见source over=max(expandF,fbVis,cmpVis)，未显示compare时该源变量仍可能影响HUD配色；它是原因推断，未量化因果。最新用户决定与既定方案未授权自行改色、镜头或MAD口径，问题交主任务决定。

## 本轮边界与后续

- 仅完成本轮源码改动、24张效果截图及逐张查看、seek全段局部检查和双幅MAD。没有三轮smoke、全量smoke、案例MP4、capture、全部对照重截或其他完整验收；旧记录不作本轮通过证据。
- day-night保持GPU声明；外分支检测机制合并、删减与字号调整完成后，再统一完整验收。临时GPU三轮在本轮没有执行。
- MAD双幅失败与HUD低对比六帧需主任务决定；未继续调色/相机/MAD方法。seek已无底部HUD与Δ，不再引用旧上移碰撞作为当前STOP。
- 行首文字基线检查可复用${code(base+'portrait-lines/summary.json')}：${lineSummary?.sources??42}源、${lineSummary?.pages??13}页、${lineSummary?.uniqueSamples??1326}点、真实发现${lineSummary?.findings??0}，字幕检查${lineSummary?.subtitleChecks??25}次；36旋转文字误报已复查排除。它不代替本轮布局/色差检查或最终验收。

关键历史证据仅作索引：F1/F2见${code(base+'case-fixes/verification.json')}；旧正式日志归档${code(base+'before-fix-3/')}；旧WAV见${code(base+'audio/verification.json')}，day-night新score不能拿旧WAV当新验证。本轮不展开旧十二项证据细节。

## 收尾状态

${finalState?`${code(base+'final-state.json')}：服务器已停止=${finalState.serverStopped}；4322监听=${finalState.port4322Listeners}；本轮浏览器进程=${finalState.browserCount}；4321/4323未触碰。分支=${code(finalState.git.branch)}，HEAD=${code(finalState.git.head)}，暂存=${finalState.git.staged}。`:'本轮final-state.json未提供，不以旧归档代替收尾证明。'}

报告生成时间：${new Date().toISOString()}。没有commit、push或切分支；具体工作树和进程状态以本轮final-state记录为准。
`;
fs.writeFileSync('dev/reports/T4b.md',report);
fs.appendFileSync('dev/wip/T4b/progress.md',`- ${new Date().toISOString()}：本轮局部报告已生成：24效果图、seek局部无碰撞、MAD双幅失败与6图低对比如实保留；完整验收未进行，GPU机制待合并。\n`);
