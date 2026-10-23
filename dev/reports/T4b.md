# T4b / R2 当前执行与验收报告

四步实施与规定验收均已执行。三项裁定已落实：竖屏印章保留 x980 右栏并按 0.917 缩放、网站两组 SVG 实际字号 ≥ 12px、指定八处失效说明原句替换。追加复验为站点 140/140、六张竖屏章图几何与逐张查看通过、同命令 smoke 25/25、build/check/build:site 通过。

当前为本地未提交工作树，分支 feat/patterns-t4b-t5，HEAD 7a84101；没有commit、push或切分支。112个明确删除项由git rm暂存，其余修改未暂存。执行期间出现的dev/wip/T7/未由本任务创建或修改。

## 四步执行对照

| 步骤 | 已实施与已验证 | 边界与结论 |
|---|---|---|
| 1 day-night | t3.2与case34.5同镜头MAD；day-night的fbVis/cmpVis/over=0；案例与12巧思共同HUD函数同步端点色和a(n)；40张最终图逐张查看 | 横屏署名按要求维持原色，在n=.5时低对比；没有加入未授权保护层 |
| 2 删除 | 6案例/16巧思，112源/预览文件+44生成物删除；用户6段文字逐字应用，decrypt组合项只删除；build3/22，删除ID和旧计数零匹配；16组合站点走查 | 站点 140/140；两列表横竖实际字号均 ≥ 12px |
| 3 字号 | 案例+12巧思53选择器1365项一致；印章整体缩放；容器、模板、控制条k；检查脚本取消Demo下限，archive fontFloor字段删除且renderer保留；指定文档更新 | 竖屏按裁定保留 x980 右栏；指定八处旧说明已替换 |
| 4 验收 | 198组同caseT对照、38组字号对照逐张审阅；署名180适用样本和18例外；4次smoke25/25；capture25/25/14竖；两MP4及ffprobe；12WAV；build/check/build:site | 追加一轮 smoke 25/25；六张竖屏章图复验通过，未放宽验收阈值 |

## HUD 淡出、切色、淡入

地图和其他覆盖层继续使用原n平滑插值。HUD在n<.5取昼端点、n>=.5取夜端点，并在顶部/底部HUD、进度规尺组和步进器组容器上乘a(n)=clamp(abs(n-.5)/.25,0,1)。强调色原实现不随n插值，保留既有章节强调色；实际全屏覆盖层所需白色上下文在案例保留，在day-night按决定清零。署名为stage直接子元素、opacity1，不跟随HUD淡出。

最终样本为巧思横竖16张、案例横竖24张，共40张，全部逐张查看同分辨率JPEG审图副本；原PNG保留。没有发现opacity>=.5且HUD主字与背景同灰的样本。

| 巧思t | caseT | n | a(n) | 横竖结论 |
|---|---|---:|---:|---|
| 0.5 | 31.8 | 0.000000 | 1.000000 | 端点色主字可辨读 |
| 1.75 | 33.05 | 0.062500 | 1.000000 | 端点色主字可辨读 |
| 2 | 33.3 | 0.500000 | 0.000000 | HUD 完全淡出 |
| 2.25 | 33.55 | 0.937500 | 1.000000 | 端点色主字可辨读 |
| 4.75 | 36.85 | 0.914266 | 1.000000 | 端点色主字可辨读 |
| 5 | 37.1 | 0.351166 | 0.595336 | 端点色主字可辨读 |
| 5.25 | 37.35 | 0.018519 | 1.000000 | 端点色主字可辨读 |
| 6.5 | 38.6 | 0.000000 | 1.000000 | 端点色主字可辨读 |

案例四段32.8–33.8、36.6–37.5、47.6–48.6、54.6–55.5各取起点/中点/终点，横竖均查看：起终点a=1且主字可辨；中点a≈0，HUD完全淡出。四十张的n、a、计算颜色、容器/祖先透明度、署名状态和renderer逐项见dev/shots/R2/hud-transition/verification.json；视觉记录见同目录review.json。

横屏n=.5的地图署名仍沿用原muted插值，肉眼低对比；它在DOM上始终位于HUD外、opacity1、舞台内且没有被覆盖。竖屏署名有现有浅底，清楚。这里没有把DOM可见等同于横屏署名对比清晰。

## MAD

巧思t3.2映射caseT34.5，对案例caseT34.5，使用相同原生画幅与上一轮area缩略/文字Range/SVG叶节点/有色面/阴影外扩遮罩口径，没有新增遮罩或覆盖率阈值。

- landscape：MAD 0/255，参与区 57.4074%，严格<4通过。
- portrait：MAD 0/255，参与区 24.8601%，严格<4通过。

renderer均为ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A0) Direct3D11 vs_5_0 ps_5_0, D3D11)。原图、mask及相机/数值见dev/shots/R2/day-night/mad/verification.json。原六图文件也已刷新到新HUD/最终字号状态，review.json引用40图总记录。

## 十二巧思逐条对照

每段横竖各取段首+.2、中点、段尾-.2；新截198组，全部case图按同caseT刷新，没有复用改字号前的源图。66张三组拼图均逐组查看。完整时刻/片段/底图/源图索引：dev/shots/T4b/parity/index.json；逐组审阅：dev/shots/R2/parity-review.json。

| 巧思 | 时长/段数 | 对照组数 | WAV事件数 | 执行与观察 |
|---|---|---:|---:|---|
| corner-hud | 13.8s / 2段 | 12 | 7 | 日期、时钟、坐标、歌词及步进器在同caseT对应；源多余层未带入。夜字在固定日间底图上的对比弱于源夜景，HUD渐变衬底仍在。 |
| vertical-title-blur | 14.1s / 4段 | 24 | 74 | 片名、地点、回忆字幕与fin的文字/入退场对应；C署名按例外隐藏。B尾浅字对比偏弱，C尾源compare遮住回忆、提取层仍可见，单列图层差异。 |
| route-draw-marker | 10.6s / 3段 | 18 | 37 | 三个固定镜头按动作重放；标签前缀到完整双语文本清楚，S3两站关于中心分布，标签不被步行线穿过。 |
| day-night-flip | 7s / 2段 | 12 | 4 | 固定34.5镜头，caseT分段映射；隐藏覆盖层上下文清零；HUD新淡出切色淡入满足40图验收，地图MAD双0。 |
| card-expand-fullscreen | 6.6s / 1段 | 6 | 5 | FU前缀、全屏鸟居与回收后完整标签对应；画布与源同形态，未带入源HUD，署名始终外置。 |
| chapter-frame | 7.05s / 3段 | 18 | 4 | 鸭川框线、章节标签与奈良胶带/网点的文字和进入/退场对应；浅底上的退场字较弱，未擅改。 |
| split-compare-stamp | 4.8s / 1段 | 6 | 4 | 分屏、标签、时间印记与横向/竖向构图对应；进入/退出时源另有回忆或HUD，未带入。 |
| collect-counter | 6.6s / 5段 | 30 | 12 | 徽章计数与章形/整体缩放对应；横屏章与stepper同列。12组有章竖屏样本按裁定保留右侧列；追加6张案例 / 巧思竖屏图确认 x980、0.917 缩放及底边不变。 |
| alert-reroute | 6.2s / 1段 | 6 | 23 | 红横幅、详情、改道胶囊对应；固定总览与源运动镜头的锚点/标签差异按规定保留。 |
| outro-stat-stack | 5.2s / 1段 | 6 | 28 | 统计数字、标签、fin、账号与制作名单对应；中段147km、末段194km。 |
| seekable-timeline | 7s / 7段 | 42 | 13 | 只保留顶部HUD、KIX卡片/引线、徽章及控制条；署名与条体分离且无遮挡。源变镜头引线端点有指定差异，无卡片/说明/控件碰撞。 |
| film-grain | 7.5s / 3段 | 18 | 2 | B/C画布cover铺满，无卡片边框/阴影/说明；交叉淡化和轻推可见，B/C按例外隐藏署名。 |

F1站名衬底保留前缀测量缓存，按当前computed字体/padding/gap算宽；对照图可见KA/FU等前缀到完整标签的变化，未重跑依赖旧6px圆角的尺寸断言。F2的两种layers过滤规则保留，根署名也落在统一隐藏选择器内；本轮未另开完整F2专项，原有机制与本次字号修改分开描述。

同源函数/CSS、anchors、指定固定镜头/底图、分段时间和hold按配置保留。地图锚点/引线随源运动镜头与巧思固定镜头不同，未把此规定差异当字体/卡片布局失败。进入、淡出、隐藏或数字变换帧中不可见的内容没有假称已验证。

## 署名专项

33个片段×2画幅共66组合、每组合3时刻，共198样本。180个应显示样本的署名均在HUD外、舞台内、未被卡片/控件遮挡；film B/C和vertical C共18样本按例外隐藏。DOM与范围记录dev/shots/R2/attribution.json；逐图观察见parity-review.json。该专项不把未采样连续帧或低对比自动推定为清晰。

## smoke、预览、声音与构建

四次均执行同一原命令：node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4322。没有其他smoke适配器，NODE_OPTIONS为空；step、播放检查、错误与GPU门未放宽。

- smoke-1：smoke 25/25 passed，exit 0；dev/shots/R2/smoke-1.log及.log.json。
- smoke-2：smoke 25/25 passed，exit 0；dev/shots/R2/smoke-2.log及.log.json。
- smoke-3：smoke 25/25 passed，exit 0；dev/shots/R2/smoke-3.log及.log.json。
- smoke-full：smoke 25/25 passed，exit 0；dev/shots/R2/smoke-full.log及.log.json。
- closeout-smoke：同一命令 smoke 25/25 passed，exit 0；dev/shots/R2/closeout-smoke.log及.log.json。

仅day-night-flip与archive-os由条目自动走GPU，两者横竖五轮均打印上述Intel Iris Xe/D3D11 renderer。地图案例及12地图巧思最小舞台文字横18/竖33；archive输出最小5.3px，仅报告。11个未迁移条目按既有协议做seek/play/错误检查，跳过固定画幅与舞台字号采样。

capture按node scripts/capture.mjs --base http://localhost:4322实际执行，25/25，14个固定竖屏预览；两个GPU条目自动分流。日志dev/shots/R2/capture.log。

12个WAV导出到dev/shots/T4b/audio/，213个事件与score一致，132/132检查通过，削波样本0；最高PCM峰值-2.231dBFS，全部严格<=-1dBFS。证据同目录verification.json，日志dev/shots/R2/audio.log。

build为3 cases·22 patterns，check exit0；npm run build:site exit0、static site ready。dist的1146个文件中被删ID路径与文本内容均0。本次完整站点走查 140/140；SVG 字号单独在 1440 / 800 / 390 宽度实测均 ≥ 12px。构建与站点复验日志使用 dev/shots/R2/closeout- 前缀。

## MP4

- landscape：dev/shots/R2/render/map-pilgrimage-landscape-8-31.mp4；1920×1080，30/1fps，690帧，23s，h264/yuvj420p，aac 48000Hz/2ch，ffprobe通过。
- portrait：dev/shots/R2/render/map-pilgrimage-portrait-8-31.mp4；1080×1920，30/1fps，690帧，23s，h264/yuvj420p，aac 48000Hz/2ch，ffprobe通过。

按指定8–31s窗口从最终工作树重渲，使用现有hardware-browser适配器。该窗口不包含32.8s之后的四段昼夜过渡，过渡效果由40张专门截图覆盖。ffprobe原始记录及核对表在dev/shots/R2/render/；已从两个成品各抽取case20.4的一帧查看，真实地图、照片、字体与署名存在，无fallback或空白画面。

## 三项裁定与实际限制

1. 竖屏印章中心 x=[980,980,980,980]，整体 0.917，底边不变；横屏仍对齐对应站点。计划已更正。案例 t=13.8/42.8/52.4 与 collect-counter t=2/4.4/5.8 六图逐张查看，圆环、汉字完整，无新增重叠或裁切；几何 6/6。截图与坐标见 dev/shots/R2/closeout/screenshots.json。
2. 网站两组 hero SVG 标签仅按实际缩放修正 font-size，复用既有 resize。桌面 1440、窄屏 800、手机 390 实测分别为 12.000068、12.000148、12.000717px。站点 16 组合 / 140 项全部通过，四张受影响列表截图已重新查看。
3. 指定八处下限 / 豁免正文均原样使用“舞台字号按设计决定，不设下限；网站界面 ≥ 12px。”，其余正文逐文件比对未变。证据 dev/shots/R2/closeout/text-changes.json。
4. 横屏过渡中点署名保持原配色，低对比，按用户明确保留现状记录。corner 夜字 / vertical B 尾浅字在固定浅底上对比弱于源；vertical C 尾的 compare 遮层差异亦保留。
5. 地图正常入口通过；初始 URL 非零 t=23.6 的内部预载 20% 观察仍保留，开头 gate / 缓冲窗口冲突为代码结合现象的判断，未扩展修改缓冲。工业协议手机 16:9 详情仅露顶部区域，T7 重做另行规划。

## 执行阻碍与处理

- HUD中段同灰问题由用户给定的淡出/切色/淡入规则解决，40图验证通过；横屏layout把署名重挂回footer的路径已修成始终root并复验。
- PowerShell管道/JSON默认编码与BOM问题已纠正为UTF-8/LF；报告/JSON读回可解析，业务源文本没有被破坏。
- 两个审图代理出现后端408传输超时。保留截图与已完成横屏19/19结论；用fresh上下文、小批量、同分辨率JPEG代理补齐余项，每张立即存记录。未重渲未变化的素材，原PNG和MAD输入未动。
- 初次站点平滑滚动CDP超时改用测试脚本instant滚动后完成；非零初始t的视觉失败留档，正常入口重查没有掩盖该限制。
- MP4验收脚本额外限定yuv420p而误拒yuvj420p；实际ffprobe为有效H264全范围输出。取消这一未请求限制并保留真实pixelFormat，复用已完成横屏成品，仅续跑竖屏；帧率/尺寸/时长/帧数/音轨核对未放宽。
- 本次初次印章截图在 Runtime.evaluate 时浏览器连接关闭，未产出样本；原因未确认。保留 closeout-capture-initial.log，单独重跑后六图及六项 SVG 视口字号检查全部通过。
- Windows Bash -c包装未实际执行构建，已改为UTF-8/LF的临时.sh入口，核实bash/node/npm解析路径并实际完成npm run build:site。

代表截图与全部结果索引：dev/shots/R2/verification.json。没有依赖安装、发布或Git提交操作。

本次启动的4322服务器已关闭并核对无监听；截图、媒体与声音工作流均已结束。4321、4323、4324未操作。

## 范围外文案待决

另有 12 个地图巧思 entries 的 tokens.type，以及 dev/wip/T4b/tools/scores-entries.mjs，仍写“横屏 ≥24px、竖屏 ≥36px。”。这些不在本次指定八处中，按用户要求保留原文，已询问是否同步替换；尚未修改。
