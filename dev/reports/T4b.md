# T4b 本轮局部效果报告

本轮按最新用户决定修改seekable-timeline并交付四项效果截图、逐张审图、全段碰撞检查和地图区域MAD；**没有进行T4b完整验收，也不宣称最终完成。** 本轮核心PNG为24张（route4、seek6、day-night10、film4），另有MAD参考图和参与区mask。

当前结果：seek已去掉底部HUD与Δ，上移导致的旧碰撞不再作为当前停止原因；628/628局部检查通过。day-night地图MAD横竖均未达到严格<4/255，且六张采样有HUD低对比观察。已保留既定画面与口径，等待主任务决定镜头/参考几何及HUD配色问题。

## 范围与实现

| 项目 | 本轮实现 | 局部证据/边界 |
|---|---|---|
| route S3 | 两站地理中点、舞台居中、零padding、20%边距且zoom≥13；源候选优先避开可见路线、其他标签/标记和舞台边缘；不避让隐藏HUD | t9、10.4横竖四图及候选诊断，不代表全片验收 |
| seek底部 | 不显示NOW PLAYING、歌词、步进器，取消Δ；保留顶部HUD、kix卡片/引线、徽章、控制条；署名在控制条上方，g横12/竖18，右对齐 | 全段采样与t0.5、2.3、4.5横竖六图；不是smoke |
| day-night | caseT=31.3+t（t<4.5），之后36.6+(t−4.5)；全HUD/dayNight取caseT，镜头仍固定34.5；复制wash暖色，score重取四事件 | t0.5、2、3.5、5、6.5横竖十图；MAD只对源35.8 |
| film | 照片取源13.5媒体实际可见区，插画取回忆画布，cover铺满；不带CSS卡片框/阴影/圆角/说明 | t3.75、6.25横竖四图；root逐张看过，无新增问题 |

方案背景为`dev/wip/T4b/plan-fix-5.md`及最新用户决定。GPU状态：条目`entries/patterns/day-night-flip.json`的renderer=`gpu`，**GPU声明，待外分支机制合并后复验**。本分支未实现GPU分流机制、未修改scripts；本轮硬件适配器只用于获准截图/局部测量，不能称正式smoke/capture通过。

## 24张效果图与逐张查看

总索引`dev/shots/T4b/fix5-effects/index.json`：记录24张，文件存在24张，索引含逐张review24张。索引中的renderer与原生尺寸记录保留；本轮截图适配器："dev/wip/T4b/tools/hardware-browser.mjs (screenshots only)"。

| 巧思 | 画幅 | t | PNG | 实际观察 |
|---|---|---:|---|---|
| route-draw-marker | landscape | 9 | `dev/shots/T4b/fix5-effects/route-draw-marker/landscape-9.png` | 两站横跨画面中央，围绕舞台中心近似对称；JR NARA 标签放在站点左侧，步行虚线没有穿过文字。Nara Park 正在按源函数打字，当前显示 NARA，衬底随当前子串增长。署名在底边清晰可见。 |
| route-draw-marker | landscape | 10.4 | `dev/shots/T4b/fix5-effects/route-draw-marker/landscape-10.4.png` | 镜头与9秒相同，两站关于舞台中心近似对称；JR NARA 位于站点左侧，NARA PARK 位于站点右侧，双语标签完整，路线没有穿过标签。署名在底边清晰可见。 |
| route-draw-marker | portrait | 9 | `dev/shots/T4b/fix5-effects/route-draw-marker/portrait-9.png` | 两站位于画面中央区域，左右位置关于舞台中心近似对称；JR NARA 标签置于站点下方，Nara Park 标签置于站点左上方，正在打出的 NARA 与步行线分离。署名清晰可见。 |
| route-draw-marker | portrait | 10.4 | `dev/shots/T4b/fix5-effects/route-draw-marker/portrait-10.4.png` | 镜头与9秒相同；JR NARA 下方标签、NARA PARK 左上方标签均为完整双语文字，路线与标签没有交叠，标签没有出画，两个站点与署名均清晰可见。 |
| seekable-timeline | landscape | 0.5 | `dev/shots/T4b/fix5-effects/seekable-timeline/landscape-0.5.png` | kix照片卡片、引线与说明文字清楚可见，未被底部控件遮挡。；顶部HUD、MIKAN徽章、独立署名和控制条保留。；底部NOW PLAYING、歌词、步进器和底部HUD渐变均未显示；署名与控制条、卡片说明无重叠。 |
| seekable-timeline | landscape | 2.3 | `dev/shots/T4b/fix5-effects/seekable-timeline/landscape-2.3.png` | kix照片卡片、引线与说明文字清楚可见，未被底部控件遮挡。；顶部HUD、MIKAN徽章、独立署名和控制条保留。；底部NOW PLAYING、歌词、步进器和底部HUD渐变均未显示；署名与控制条、卡片说明无重叠。 |
| seekable-timeline | landscape | 4.5 | `dev/shots/T4b/fix5-effects/seekable-timeline/landscape-4.5.png` | kix卡片与引线已随源时刻退场。；顶部HUD、MIKAN徽章、独立署名和控制条保留。；底部NOW PLAYING、歌词、步进器和底部HUD渐变均未显示；署名与控制条、卡片区域无重叠。 |
| seekable-timeline | portrait | 0.5 | `dev/shots/T4b/fix5-effects/seekable-timeline/portrait-0.5.png` | kix照片卡片、引线与说明文字清楚可见，未被底部控件遮挡。；顶部HUD、MIKAN徽章、独立署名和控制条保留。；底部NOW PLAYING、歌词、步进器和底部HUD渐变均未显示；署名与控制条、卡片说明无重叠。 |
| seekable-timeline | portrait | 2.3 | `dev/shots/T4b/fix5-effects/seekable-timeline/portrait-2.3.png` | kix照片卡片、引线与说明文字清楚可见，未被底部控件遮挡。；顶部HUD、MIKAN徽章、独立署名和控制条保留。；底部NOW PLAYING、歌词、步进器和底部HUD渐变均未显示；署名与控制条、卡片说明无重叠。 |
| seekable-timeline | portrait | 4.5 | `dev/shots/T4b/fix5-effects/seekable-timeline/portrait-4.5.png` | kix卡片与引线已随源时刻退场。；顶部HUD、MIKAN徽章、独立署名和控制条保留。；底部NOW PLAYING、歌词、步进器和底部HUD渐变均未显示；署名与控制条、卡片区域无重叠。 |
| day-night-flip | landscape | 0.5 | `dev/shots/T4b/fix5-effects/day-night-flip/landscape-0.5.png` | 白天地形、蓝青强调色，时钟18:30，DAY 01 / THU日期。白色日序、日期、坐标与歌词落在明亮地图上，对比很低；不是文字缺失。竖屏白底署名可辨，横屏署名偏淡。未见卡片或徽章泄漏。 |
| day-night-flip | landscape | 2 | `dev/shots/T4b/fix5-effects/day-night-flip/landscape-2.png` | 入夜中间态night=0.5，地图和HUD均呈中灰；时钟、日期、坐标、曲名与歌词很淡，蓝青进度线和节点仍可辨。截图不宜表述为全部文字清晰。 |
| day-night-flip | landscape | 3.5 | `dev/shots/T4b/fix5-effects/day-night-flip/landscape-3.5.png` | 夜景变深，地图右侧有暖褐色调；20:35、DAY 01、THU日期、完整Lanterns歌词、坐标/海拔、步进器与署名可辨。整体颜色接近参考的判断不等于MAD通过；固定镜头与案例35.8的几何仍不同。 |
| day-night-flip | landscape | 5 | `dev/shots/T4b/fix5-effects/day-night-flip/landscape-5.png` | 天亮过渡中，DAY 02 / FRI、08:38，歌词Morn为源逐字状态。橘红进度与节点明显；日期、海拔和曲目信息在中灰地图上仍偏淡。没有据此自行调色。 |
| day-night-flip | landscape | 6.5 | `dev/shots/T4b/fix5-effects/day-night-flip/landscape-6.5.png` | 白天结束态，DAY 02 / FRI、09:05、完整Morning trains and bowing deer及中文歌词可辨。橘红进度/步进器、地图固定构图和署名保持，未观察到新的裁切或图层泄漏。 |
| day-night-flip | portrait | 0.5 | `dev/shots/T4b/fix5-effects/day-night-flip/portrait-0.5.png` | 白天地形、蓝青强调色，时钟18:30，DAY 01 / THU日期。白色日序、日期、坐标与歌词落在明亮地图上，对比很低；不是文字缺失。竖屏白底署名可辨，横屏署名偏淡。未见卡片或徽章泄漏。 |
| day-night-flip | portrait | 2 | `dev/shots/T4b/fix5-effects/day-night-flip/portrait-2.png` | 入夜中间态night=0.5，地图和HUD均呈中灰；时钟、日期、坐标、曲名与歌词很淡，蓝青进度线和节点仍可辨。截图不宜表述为全部文字清晰。 |
| day-night-flip | portrait | 3.5 | `dev/shots/T4b/fix5-effects/day-night-flip/portrait-3.5.png` | 夜景变深，地图右侧有暖褐色调；20:35、DAY 01、THU日期、完整Lanterns歌词、坐标/海拔、步进器与署名可辨。整体颜色接近参考的判断不等于MAD通过；固定镜头与案例35.8的几何仍不同。 |
| day-night-flip | portrait | 5 | `dev/shots/T4b/fix5-effects/day-night-flip/portrait-5.png` | 天亮过渡中，DAY 02 / FRI、08:38，歌词Morn为源逐字状态。橘红进度与节点明显；日期、海拔和曲目信息在中灰地图上仍偏淡。没有据此自行调色。 |
| day-night-flip | portrait | 6.5 | `dev/shots/T4b/fix5-effects/day-night-flip/portrait-6.5.png` | 白天结束态，DAY 02 / FRI、09:05、完整Morning trains and bowing deer及中文歌词可辨。橘红进度/步进器、地图固定构图和署名保持，未观察到新的裁切或图层泄漏。 |
| film-grain | landscape | 3.75 | `dev/shots/T4b/fix5-effects/film-grain/landscape-3.75.png` | 照片画布按cover铺满舞台，没有留边或透明空隙；没有卡片CSS边框、阴影和caption。照片内容中的飞机舷窗轮廓属于原插画，保留源绘制内容。颗粒可见。 |
| film-grain | landscape | 6.25 | `dev/shots/T4b/fix5-effects/film-grain/landscape-6.25.png` | 回忆插画铺满横屏，保持宽高比并居中裁切，没有卡片框、caption或留白；画布颗粒与舞台暗角可见。 |
| film-grain | portrait | 3.75 | `dev/shots/T4b/fix5-effects/film-grain/portrait-3.75.png` | 照片画布居中裁切后铺满竖屏，天空与跑道延伸到舞台四边；没有外层卡片边框、阴影、caption或空白墙面。颗粒可见。 |
| film-grain | portrait | 6.25 | `dev/shots/T4b/fix5-effects/film-grain/portrait-6.25.png` | 回忆插画铺满竖屏，保持宽高比并居中裁切，没有卡片框、caption或留白；画布颗粒与舞台暗角可见。 |

逐张记录分别为`dev/shots/T4b/fix5-effects/route-draw-marker/review.json`、`dev/shots/T4b/fix5-effects/seekable-timeline/review.json`、`dev/shots/T4b/fix5-effects/day-night-flip/review.json`、`dev/shots/T4b/fix5-effects/film-grain/review.json`。day10张由spec_audit逐张看原生PNG；其他14张按索引所附root/代理记录，不把“生成过”视为“已查看”。

## route两站坐标与标签候选

以下是本轮新镜头实测，旧route-final-cameras.json中x384/898的居中前方案不作当前证据。候选编号从0开始；完整路线折线、线宽及各候选碰撞结果在`dev/shots/T4b/fix5-effects/route-draw-marker/index.json`及同目录每帧JSON。

| 画幅/t | camera | JR NARA x/y | NARA PARK x/y | 选择结果 |
|---|---|---|---|---|
| landscape/9 | {"center":[135.829405,34.683045],"zoom":15.24974452935124,"bearing":0,"pitch":0,"padding":{"top":0,"bottom":0,"left":0,"right":0}} | 384 / 691.950365 | 1536 / 388.045497 | jrNara: #1, side=-1, dy=0, fallback=false; 碰撞={"stage":false,"labels":[],"markers":[],"routes":[]}；naraPark: #0, side=1, dy=0, fallback=false; 碰撞={"stage":false,"labels":[],"markers":[],"routes":[]} |
| landscape/10.4 | {"center":[135.829405,34.683045],"zoom":15.24974452935124,"bearing":0,"pitch":0,"padding":{"top":0,"bottom":0,"left":0,"right":0}} | 384 / 691.950365 | 1536 / 388.045497 | jrNara: #1, side=-1, dy=0, fallback=false; 碰撞={"stage":false,"labels":[],"markers":[],"routes":[]}；naraPark: #0, side=1, dy=0, fallback=false; 碰撞={"stage":false,"labels":[],"markers":[],"routes":[]} |
| portrait/9 | {"center":[135.829405,34.683045],"zoom":14.419668671314271,"bearing":0,"pitch":0,"padding":{"top":0,"bottom":0,"left":0,"right":0}} | 216.000193 / 1045.472029 | 863.999807 / 874.525643 | jrNara: #2, side=0, dy=76, fallback=false; 碰撞={"stage":false,"labels":[],"markers":[],"routes":[]}；naraPark: #7, side=-1, dy=-70, fallback=false; 碰撞={"stage":false,"labels":[],"markers":[],"routes":[]} |
| portrait/10.4 | {"center":[135.829405,34.683045],"zoom":14.419668671314271,"bearing":0,"pitch":0,"padding":{"top":0,"bottom":0,"left":0,"right":0}} | 216.000193 / 1045.472029 | 863.999807 / 874.525643 | jrNara: #2, side=0, dy=76, fallback=false; 碰撞={"stage":false,"labels":[],"markers":[],"routes":[]}；naraPark: #7, side=-1, dy=-70, fallback=false; 碰撞={"stage":false,"labels":[],"markers":[],"routes":[]} |

两站关于舞台中心近似对称；审图记录中JR标签已避开步行虚线。t9的NARA字样属于源入场打字中间态，不能当作截断缺字。

## seek全段局部碰撞检查

证据`dev/shots/T4b/fix5-effects/seekable-timeline/checks.json`：完成628/628采样，碰撞0，失败采样0，执行错误0。该检查验证底部HUD隐藏、应保留部件、署名/控制条间距与卡片/说明碰撞；不跑播放测试。

本轮无底部HUD，也无Δ字段布局规则。kix卡片及说明未移动或缩小。seek声音事件数为13，没有独立步进器事件需要删除，其余保留；本轮没有重新导出WAV或进行声音完整验收。

## day-night地图MAD：已验证失败

证据`dev/shots/T4b/fix5-effects/day-night-flip/mad/verification.json`。严格比较巧思t3.5与案例35.8；巧思按映射实际caseT34.8、镜头固定34.5。复用同版同t的原生巧思PNG，只新增源35.8参考图；不改参考时刻或相机求通过。

方法：保留wash、grain、vignette及HUD fade；只排除双方可见文字Range、SVG叶形状、实体背景/画布与计算阴影。面积平均缩略图按RGB通道绝对差取平均；阈值严格<4/255，没有新增覆盖率阈值或为通过增大mask。

| 画幅 | MAD | 阈值结果 | 地图参与比例/像素 | RGB均值差绝对值 | camera Δzoom/Δbearing | mask PNG |
|---|---:|---|---|---|---|---|
| landscape | 5.015804 | 失败 | 50.96% / 10567 | 0.239425 / 0.196555 / 0.144317 | 0.066675 / 1.333505 | `dev/shots/T4b/fix5-effects/day-night-flip/mad/landscape-case-35.8-mask.png` |
| portrait | 4.185868 | 失败 | 23.27% / 4826 | 0.24741 / 0.219022 / 0.217157 | 0.066675 / 1.333505 | `dev/shots/T4b/fix5-effects/day-night-flip/mad/portrait-case-35.8-mask.png` |

双方RGB均值各通道差<0.25，是上述数值结果；**不能证明唯一差异来源就是几何或颗粒**。camera的zoom差约0.066675、bearing差约1.333505也是实测，但不是单因果证明。判定只说明本口径MAD未过，不应直接改称“纯色调错误”或“仅几何造成”。

参与区横约50.96%、竖约23.27%。竖屏源note及其阴影占据大面积，剩余地图代表性有限；PNG mask白色参与、黑色排除，四区coverage和MAD均在JSON中。root和审阅代理查看过参与区图。没有增加mask或改阈值使数值通过。

## day-night逐图低对比观察

`dev/shots/T4b/fix5-effects/day-night-flip/review.json`保留6张低对比采样：landscape t0.5、landscape t2、landscape t5、portrait t0.5、portrait t2、portrait t5。t0.5白色HUD落在亮地图上；t2灰色HUD与灰地图接近；t5部分日期/海拔/曲目信息仍偏淡。t3.5夜景和t6.5白天的主体文字可辨，t3.5时钟已为20:35。

这是实际原生截图观察，不是新测得的对比度数值。代码关系可见source over=max(expandF,fbVis,cmpVis)，未显示compare时该源变量仍可能影响HUD配色；它是原因推断，未量化因果。最新用户决定与既定方案未授权自行改色、镜头或MAD口径，问题交主任务决定。

## 本轮边界与后续

- 仅完成本轮源码改动、24张效果截图及逐张查看、seek全段局部检查和双幅MAD。没有三轮smoke、全量smoke、案例MP4、capture、全部对照重截或其他完整验收；旧记录不作本轮通过证据。
- day-night保持GPU声明；外分支检测机制合并、删减与字号调整完成后，再统一完整验收。临时GPU三轮在本轮没有执行。
- MAD双幅失败与HUD低对比六帧需主任务决定；未继续调色/相机/MAD方法。seek已无底部HUD与Δ，不再引用旧上移碰撞作为当前STOP。
- 行首文字基线检查可复用`dev/shots/T4b/portrait-lines/summary.json`：42源、13页、1326点、真实发现0，字幕检查25次；36旋转文字误报已复查排除。它不代替本轮布局/色差检查或最终验收。

关键历史证据仅作索引：F1/F2见`dev/shots/T4b/case-fixes/verification.json`；旧正式日志归档`dev/shots/T4b/before-fix-3/`；旧WAV见`dev/shots/T4b/audio/verification.json`，day-night新score不能拿旧WAV当新验证。本轮不展开旧十二项证据细节。

## 收尾状态

`dev/shots/T4b/final-state.json`：服务器已停止=true；4322监听=0；本轮浏览器进程=0；4321/4323未触碰。分支=`feat/patterns-t4b-t5`，HEAD=`cb2249cc468d081b5c2d5891387e45d381e6ac86`，暂存=false。

报告生成时间：2026-10-22T22:07:36.851Z。没有commit、push或切分支；具体工作树和进程状态以本轮final-state记录为准。
