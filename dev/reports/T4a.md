# T4a 交付报告：地图巡礼（关西路线 · 两套构图 · 乐谱 · 渐进缓冲）

本报告覆盖案例 T4a 的调研、设计、实现与交付验证。12 个相关巧思 T4b 在本次范围外。最终案例代码在同一启动命令下连续三次完整 smoke 通过，路径、播放性能修复与证据见 4.2。

## 〇、摘要

- **路线改到日本**：関西周遊（上海 → 关西机场 → 京都伏见稻荷 → 鸭川 → 奈良公园 → 大阪道顿堀，三天，60 秒 / 120 BPM）。三条日本候选路线 + 旧中国路线逐镜头实测瓦片后选定；铁路发光线的几何直接取自矢量瓦片里的真实铁路，与底图严格重合。
- **固定画幅两套构图**：横屏 1920×1080 / 竖屏 1080×1920 各自排版（竖屏 HUD 收进顶部、印章右侧一列、卡片放下半屏、镜头焦点单独取景）；舞台字号要求横 ≥ 24px、竖 ≥ 36px，最终 smoke 结果见 4.2。
- **声音**：整段原创乐谱（环境底、和弦、贝斯、鼓、日本阳音阶拨弦 + 30 多种事件音），离线导出 60s / 688 事件 / 峰值 -1.7 dBFS / 0 削波。
- **渐进缓冲（视频式）**：“扫描 → 分级 → 下载 / 解析两级 → 带宽三档 → 内存预算”。最终横屏 50Mbps 冷缓存复测：ready 5.3s、0 次暂停、0/675 缺瓦片帧、GC 后驻留峰值 566MB。横屏 10Mbps 与竖屏 50Mbps 保留交接版本的历史测量，详见 4.1，不作为当前扫描策略的重新实测。
- **无头验证**：软件 GL 预览关闭 MSAA、首测后停止重复精度读回；舞台主题变量去重写入、无可见节点时不读取避让几何。原生尺寸导出保留抗锯齿与正常精度测量。smoke 保留各时刻渲染、播放、字号与画幅切换检查，连续验收见 4.2。
- **复拍发现并修复**：航线段画面里没有飞机（镜头 3.8 秒推近 9 级把匀速飞机甩出画面）→ 屏幕空间跟随；竖屏机场标签挡飞机；竖屏引线穿标签；收尾鸟瞰标签中途换边；伏见稻荷一镜 3D 建筑几乎不可见；竖屏京都站节点压在标题字上。
- **交付物**：两段 MP4（横 / 竖，8–31 秒，含音频）、横竖预览图、站点详情页截图、条目 JSON、研究笔记；最终代码 build/check 通过。

## 一、调研要点

### 1.1 参考视频（复看补充；完整逐帧研究见 `docs/research/map-pilgrimage.md`）

素材 `dev/shots/T4/ref/`（全片 2 秒一帧 `every2/`、9 段转场细扫 `fine-*/`、21 张全分辨率帧与拼图 `full/`）。主要观察：

1. 原片本身就是一段日本旅行（首尔 → 关西机场 → 西宫 / 京都 / 宇治 → 东京），HUD 时区 JST；城市近景都有成片的 3D 建筑与铁路细线——日本的 OSM 数据是这种观感的前提。
2. 章节有两种装饰：屏幕四角框线（带方块角标），以及底部斜纹警示胶带 + 整张地图染章节色。Demo 鸭川用框线、奈良用胶带 + 网点。
3. 便签出现时整张地图被一层纸色“洗”淡，便签像贴在地图上（Demo 的 `wash` 层）。
4. 收集托盘是一排缩略图逐个点亮；Demo 改为与步进器同列的原创车站印章，不复制角色收集。
5. 竖排地名在原片是粗黑体；Demo 用明朝体（与古都的气质一致，属本地设计选择）。

### 1.2 日本路线与瓦片实测（`dev/shots/T4/tiles/`：`results.jsonl`、拼图 `sheet-A1/A2/BC/HS.jpg`）

每个镜头点位在实际缩放下用 MapLibre 渲染并统计视口内要素：

| 点位 | 缩放 | 建筑 | 有高度 | 城区覆盖 | 铁路要素 |
| --- | --- | --- | --- | --- | --- |
| 京都站 | z14.5 | 417 | 79% | 100% | 83 |
| 伏见稻荷 | z15 | 256 | 79% | 97% | 45 |
| 鸭川三条 | z15 | 249 | 78% | 99% | 19 |
| 奈良公园 | z15 | 51 | 61% | 92% | 11 |
| 道顿堀 | z15 | 1594 | 95% | 100% | 105 |
| 杭州（旧） | z15 | 55 | 78% | 98% | 14 |
| 苏州平江路（旧） | z15 | 80 | 73% | 93% | 17 |
| 上海外滩（旧） | z15 | 439 | 92% | 99% | 3 |

候选 A 关西环线 / B 东京 → 镰仓 → 京都 → 大阪 / C 东京湾 都完整；A 跨度最小（只需一次长距离推拉：航线），三天成环，选 A。铁路几何：`tiles/rails.mjs` 从 transportation 图层（class = rail）提取线段并做最短路 → `rails.json` → `mkpaths.mjs` → `demos/cases/map-pilgrimage/paths.js`。

### 1.3 瓦片体量（`tools/bitrate.mjs`，横屏缓冲计划 × 镜像磁盘文件大小）

当前横屏缓冲计划为 725 块（必需 292 / 可选 433）；竖屏当前策略的计划规模未单独测量。没有当前采样策略的完整字节分析文件，不能将旧计划的字节数当作当前精确体量。独立体量分析的 1288 点版本为 731 块 / 132.6MB，主要突发需求在航线、伏见稻荷和道顿堀；该版按必需字节估算，10Mbps 全程不停顿需约 9.2s 起播等待。这个估算只说明突发负载，不能替代当前实测。

## 二、设计

### 2.1 节拍表（120 BPM，1 小节 = 2 秒；画面与乐谱读 `config.js` 同一张时间表）

| t | 段落 | t | 段落 |
| --- | --- | --- | --- |
| 0 | 冷开场 · 夜间地球 | 29.2 | 分屏对比（明信片 1930s / 实景 2026 + 盖章） |
| 3.0 | 天亮（逐图层插值） | 32.8 | 入夜 · 通知 · 手写便签 |
| 4.0 | 片名「関西周遊」 | 37.0 | DAY 02 · JR 奈良线 |
| 8.0 | 航线 MU 515（一口气推近关西机场） | 40.8 | 章节 02 · 奈良公园（胶带装饰） |
| 11.6 | DAY 01 · 机窗卡片 · 印章 | 45.0 | WRONG TRAIN · 错误路线打叉 · REROUTING |
| 14.6 | 特急 HARUKA → 京都 | 47.4 | 改道近铁 · 入夜 |
| 18.0 | 伏见稻荷 · 千本鸟居卡片 | 50.0 | 道顿堀霓虹 · 最后一枚印章 |
| 21.0 | 卡片 → 全屏（遮挡下换到鸭川） | 54.6 | DAY 03 · 全程鸟瞰 |
| 24.4 | 章节 01 · 鸭川（四角框线） | 56.0 | 结尾统计 · fin. |
| 25.6 | 回忆（方丈記 1212） | | |

条目 `rhythm.beats` 19 个点（≤ 60s）、`energy` 30 个值（每 2 秒）。

### 2.2 构图与对齐规则

- 横屏：边距 64，规尺 y=116，四角 HUD，卡片右侧 824×464，地名标题左上，右下印章与步进器同列。竖屏：HUD 在顶部 276px 内，规尺 y=264，印章右侧一列，卡片下半屏通栏 968×544，步进器底部；镜头关键帧 `fp` / `zp` 单独取景。
- 所有点位（节点、路线端点、车头、飞机、引线、标签锚点）由同一个投影函数计算；站名标签固定宽度 + 8 个候选位置，避开 HUD 保留区与事件文字矩形（事件文字先画）；路线标签沿线多点 + 法线两侧候选；引线在标签放好后画、从标签外缘出发。
- 标签偏好可按画幅给（`stops.*.sideP`，0 = 节点正下方）；压在事件文字字形上的节点随文字淡出；收尾鸟瞰镜头只留 0.05 级拉远，保证标签整段不换边。

### 2.3 声音表（节选；`script.js` 的 `buildScore()`）

| 事件 | 音色 |
| --- | --- |
| 全程 | 空气声（air）+ 铺底和弦（pad，按段落换和弦）+ 贝斯 + 半拍鼓组 + 阳音阶拨弦琶音；夜间低频持续音（drone） |
| 冷开场标记 | 声呐（sonar） |
| 天亮 / 入夜 | 反向渐强 + 上扫 → 钟声 / 下扫 + 次低频 |
| 片名、地名 | 每字一声键击（key）+ 英文打字 tick + riser |
| 航线 | 起拍底鼓 + 次低频，长呼啸 + 风声，着陆下扫 |
| 铁路描线 | 每拍一次过轨“哐当”（自定义 clack），车头到站提示音 |
| 卡片 / 计数 / 印章 | 快门 + 纸声 / 两音确认 / 印章 + 闪光 |
| 卡片 → 全屏 | 上扫 + 冲击，收回下扫 |
| 章节 | riser → 钟 → 三音确认 |
| 回忆 | 反向渐强 + shimmer + 黑胶噪点（自定义 vinyl）+ 逐字钟 |
| 分屏对比 | 两段呼啸 + 盖章 + 次低频 |
| 意外 | 错误音 + 警报 + 故障声 + 与省略号同拍的“嘀” |
| 道顿堀 | 霓虹嗡鸣（自定义 neon） |
| 结尾 | 阳音阶上行计数 + 钟 + shimmer + 终止和弦 |

### 2.4 缓冲（实时播放）设计

1. 扫描：开始播放前把全片镜头按时间采样（阈值缩放 0.12 级 / 平移横 150px、竖 100px / 俯仰 2.5° / 方位 3°；静止段最多 0.2 秒一个；`zoom < 6` 的地球远景快速段为 0.005 秒，其余快速段为 0.025 秒；跨整数缩放的一格细分 6 份），每个采样点让 MapLibre 算出所需瓦片，记录“最早 / 最晚用到”（最晚 = 下一个采样点时刻，末段为全片结尾）。本次横屏 932 点、扫描 1.621s。
2. 分级：只在快速推拉帧（缩放 > 1 级/秒）用到、且 3 级以内（世界尺度 z ≤ 5 放宽到 4 级）有必需上级瓦片可顶替、上级到时仍在缓存的，是“可选”瓦片。
3. 两级：下载窗口 45 秒（fetch 进 HTTP 缓存，不占 JS 堆）+ 解析窗口 10 秒（MapLibre worker 解析进瓦片缓存）。已解析瓦片在主线程堆上约为 pbf 原始字节的 8–10 倍（实测），不在画面上的已解析瓦片按原始字节设预算 20MB（`deviceMemory` ≤ 4 的设备 10MB），超出时只解析 5 秒以内的并收紧淘汰窗口。
4. 带宽三档：近期必需（解析窗口内）> 远处必需（只下载）> 可选（20 秒内的必需全部到手后）。MapLibre 自己为画面发出的可选瓦片请求在带宽紧张且播放中时推迟。
5. 播放控制：前方缓冲 < 0.5 秒停在当前帧并显示舞台内 “BUFFERING MAP xx%”，攒够 4 秒继续；开头 6 秒就绪即开播；加载进度按 `motion:loading` 报给站点。渲染模式不走缓冲，逐帧 seek 等瓦片。软件 GL 预览保留首次地球精度测量结果，避免重复同步读回。

## 三、实现清单

| 文件 | 内容 |
| --- | --- |
| `demos/cases/map-pilgrimage/config.js` | 60s / 120BPM 全部轨道；日本站点（含 `sideP`）、横竖 layout、镜头关键帧 `f / fp / zp / e`；航线 `follow: true`；收尾镜头只留 0.05 级拉远；声音和弦与阳音阶 |
| `demos/cases/map-pilgrimage/paths.js` | 从矢量瓦片提取的铁路 / 步行几何 |
| `demos/cases/map-pilgrimage/index.html`、`style.css` | 两套构图；缓冲胶囊；颗粒改为比舞台大一个周期的独立合成层（只改 transform） |
| `demos/cases/map-pilgrimage/scenes.js` | 机窗 / 千本鸟居 / 鸭川 / 奈良鹿 / 道顿堀霓虹 × 照片 / 明信片 / 插画，旅伴“蜜柑” |
| `demos/cases/map-pilgrimage/script.js` | 舞台、MapLibre（地球投影、山体阴影 z5.5–13、z14 起 3D 建筑，高度 14 → 14.15 长出）、line-gradient 路线、同源投影对齐、HUD、乐谱与自定义音色；两级缓冲、采样区间末端、分级、带宽三档、内存预算、推迟可选请求、加密采样、`upLevels`；颗粒合成层；软件 GL 预览关闭 MSAA、首测后停止重复精度读回，原生尺寸导出保留完整设置；未出场路线不可见；航线屏幕跟随；标签与节点文字避让；`?demmirror=`；调试接口 |
| `entries/cases/map-pilgrimage.json` | summary / focus / tags / energy / rhythm（60s、bpm、19 个节拍）/ layers（含声音层、缓冲层）/ composition（含 sound）/ tokens / interaction / constraints / prompt / videoPrompt / negativePrompt / migration / sources（方丈記、Terrain Tiles）/ previewAt 20.4 / previewAtPortrait 41.8；patternIds 未动 |
| `docs/research/map-pilgrimage.md` | 复看补充、日本路线与瓦片实测、预取与缓冲设计与实测、无头播放成本、差异、验证记录 |
| `previews/cases/map-pilgrimage.jpg`、`map-pilgrimage-portrait.jpg` | capture.mjs 生成 |
| `dev/shots/T4/tools/` | 验证工具：`live`、`tileproxy`、`bitrate`、`tileprobe`、`gpucost`、`frametimes`、`smokeplay`、`scanprobe` / `scanwhen`、`labels`、`site` / `siteprobe`、`rwait`、`livesum`、`beats`、`sheet`、`wavprof` 等 |

`motion-kit.js` 由 build 同步，不手改。`dev/wip/T4a/tools/` 不在本次允许修改范围，验证使用 `dev/shots/T4/tools/`，本次不追加工具同步。

## 四、验证

### 4.1 缓冲实测（冷缓存，每次新建浏览器配置；本地瓦片镜像；视口 640×360 / 360×640；无头 Edge 软件渲染；全程自动播放）

本机浏览器经系统代理访问 OpenFreeMap 极慢且不稳（32 块 z14 浏览器 268 秒、node 直连 4.5 秒），测出来的是代理不是 Demo，所以实测走 `tools/tileproxy.mjs`（首次从源站取回存盘，之后按设定带宽的全局令牌桶 + 40ms 首字节延迟发送），Demo 用 `?tilemirror=http://localhost:4330&demmirror=http://127.0.0.1:4330`（矢量与高程分属两个主机，与线上一样各用各的连接数）。

下表横屏 50Mbps 为 2026-10-22 最终代码的复测，地球远景快速段使用 5ms 扫描；横屏 10Mbps 与竖屏 50Mbps 为交接保存的 25ms 快速段策略历史记录，经本次直接解析核对，未在新策略上重跑。ready 包含地图库与样式等待。本次横屏使用现有工具的 `--gc 3`，每隔约 3s 强制 GC 后测一次驻留量，其余两行未开启该选项。

| 画幅 · 带宽 | ready | 库与样式就绪 / 此后开头缓冲 | 缓冲暂停 | 缺瓦片帧 | 遮罩 | 采样堆峰值 | 当前版 GC 驻留峰值 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 横屏 · 50Mbps（本次，--gc 3） | 5.3s | 2.512s / 2.749s | 0 次 / 0ms | 0 / 675 | 0 | 610MB | 566MB |
| 横屏 · 10Mbps（交接，25ms策略） | 7.6s | 6.699s / 0.897s | 2 次 / 7288ms：2972ms@9.85s、4316ms@17.14s | 1 / 790 | 0 | 621MB | 未单独测量 |
| 竖屏 · 50Mbps（交接，25ms策略） | 18.4s | 17.400s / 0.970s | 0 次 / 0ms | 0 / 763 | 0 | 516MB | 未单独测量 |

结果文件：

- `dev/shots/T4/live/live-landscape-mirror-small-50mbps-smoke-fix1-globe.json`
- `dev/shots/T4/live/live-landscape-mirror-small-10mbps.json`
- `dev/shots/T4/live/live-portrait-mirror-small-50mbps.json`

交接 10Mbps 缺帧为 `8.50 openmaptiles/19w66 z6 unplanned`。返工首轮 50Mbps 也在 8.51s 记录同一缺口（`live-landscape-mirror-small-50mbps-smoke-fix1.json`：0 暂停、1/771 缺帧）。`smoke-fix1-scan-wide.log` 定位该瓦片在 8.415s 出现，相邻 8.400 / 8.425s 扫描点均未覆盖；`smoke-fix1-camera.log` 确认该时刻 zoom=5.8993。当前仅将地球远景加密至 5ms，完整复测零缺帧；缺瓦片判定和父瓦片允许层级均未放宽。新旧三条表内记录的瓦片超时均为 0。

“采样堆”取工具顶层 `maxHeapMB`，为每 200ms 读取的 `performance.memory.usedJSHeapSize` 峰值，包含未回收垃圾；不能直接与 GC 后驻留峰值混用。本次 GC 后驻留峰值 566MB 出现在 t=49.57s，末次 t=57.92s 采样为 47MB。横屏 10Mbps 与竖屏 50Mbps 没有单独 GC 驻留测量。

交接横屏 50Mbps 无强制 GC 文件 `live-landscape-mirror-small-50mbps.json` 为 ready 9.1s、0 次暂停、0/775 缺帧、采样堆 654MB。采样和运行条件不同，不作单变量性能改善结论。本次全片墙钟 160.1s，镜像发送 70.1MB / 456 请求；不将软件 GL 的播放速度视为实时帧率保证。

```bash
node dev/shots/T4/tools/live.mjs landscape --mirror --small --mbps 50 --gc 3 --tag smoke-fix1-globe
node dev/shots/T4/tools/livesum.mjs dev/shots/T4/live/live-landscape-mirror-small-50mbps-smoke-fix1-globe.json
```

### 4.2 smoke 与画幅切换诊断

验收使用项目原始 smoke 脚本与全部检查，任务内启动适配器仅给子浏览器添加 `--no-proxy-server`：

```bash
node --import ./dev/shots/T4/codex-direct-browser.mjs scripts/smoke.mjs --only map-pilgrimage --strict-fonts
```

2026-10-22，保持同一份最终代码和适配器，逐次等待前一进程结束后启动下一次；期间没有其他浏览器测试。三次均完整通过，未改变阈值、超时或检查范围：

| 次数 | 日志 | 结果 | 横 / 竖最小字号 | 退出码 |
| --- | --- | --- | --- | --- |
| 1 | `dev/shots/T4/smoke-fix1-1.log` | smoke 1/1 passed | 24px / 36px | 0 |
| 2 | `dev/shots/T4/smoke-fix1-2.log` | smoke 1/1 passed | 24px / 36px | 0 |
| 3 | `dev/shots/T4/smoke-fix1-3.log` | smoke 1/1 passed | 24px / 36px | 0 |

三次完成时间分别为 00:28:36、00:31:35、00:35:44。执行前后的案例源码直接文本比较一致。每次均包含两画幅 seek 0–60s、播放 1.5s 前进大于 0.5s、运行时字号及横竖切换保持时刻检查。

播放检查走 `render=1`。该模式没有实时缓冲计划与缓冲暂停：单浏览器基线两画幅均为 `playing=true`、`stalled=false`、`stallCount=0`、`samples=0`，`tiles=true`。kit 的 RAF 播放循环调用 `draw()` 后直接安排下一帧，不等待 `renderWait()` 返回的 Promise；只有 `seek()` 等待它。每次 RAF 的 `dt` 最多为 0.1s，长帧后的墙钟时间不会全量补进时间轴。

基线横屏两个播放回调之间有 1539ms 空档，首次前进到 0.1s 的通知出现在探针起点后 1640.2ms，最后读到 t=0.2167s。该窗口没有精度读回，说明重复精度测量不是全部掉帧的唯一来源。竖屏基线在 1470.7ms 发起一次 `getBufferSubData()`，同步耗时 448.5ms，对应 484ms 长任务，最后读到 t=0.4668s。这证明软件渲染成本与同步 WebGL 读回都需要处理，不能将失败仅归因于其他并行任务。

串行机制对照（视口横 1280×720 / 竖 720×1280，地图像素比 2/3；每行各一次，非统计均值）：

| 变体 | 横屏前进 | 竖屏前进 | 横 / 竖读回次数与总耗时 |
| --- | --- | --- | --- |
| 基线 | 0.2167s（失败） | 0.4668s（失败） | 0 / 0ms；1 / 448.5ms |
| 仅停止重复精度测量 | 0.6166s | 0.6000s | 均为 0 |
| 仅关闭 MSAA | 0.8000s | 1.1000s | 1 / 152.5ms；1 / 54.3ms |
| 两项同时启用 | 0.7167s | 0.9168s | 均为 0 |

证据为 `dev/shots/T4/smoke-fix1-probe-variants.json` / `.log`，工具为 `smoke-fix1-probe.mjs`。探针使用与 smoke 相同的 sweep → seek(0) → play → 1500ms timer → 读取时间顺序；timer 和 CDP 返回也可能延迟，所以不把前进值换算成精确平均 FPS。`frames` 包含时间轴通知，不是纯 RAF 数；`top` 还包含 sweep 阶段，不用于估算播放窗口占比。冻结变体在 sweep 前直接设置等待间隔，用于机制诊断，实际案例的首测后冻结与最终稳定性另以完整 smoke 验收。

案例实现：

1. `MAP.softGL = softwareGL()` 独立执行，避免 `P.render || ...` 短路软件 GL 检测。
2. `softwarePreview = MAP.softGL && (!P.render || stage.scale < 1)`，软件 GL 实时预览及缩小的 render 预览关闭 MSAA。
3. 从地图 `render` 事件检查 MapLibre 5.6 的首次精度读回；`_lastReadbackFrame >= 0` 后将 `_measureWaitFrames` 设为 `Infinity`，再解绑监听。保留投影更新及首测结果的插值，避免每约 10 帧重复同步读回。
4. 原生尺寸导出 `render=1 && stage.scale=1` 不进入软件预览分支，保留 MSAA 与正常精度测量。缓冲泵、暂停恢复、时间轴和 smoke 检查未改；实时扫描的覆盖修复见 4.1。
5. 舞台 9 个主题 CSS 变量使用已有 `sty()` 缓存，逐时刻仍计算颜色，只在值变化时写入样式。
6. `drawMarkers()` 逐个更新、隐藏节点，仅在首个可见节点出现时测量当帧避让区与文字矩形，避免空镜头也同步读取整页布局。文字避让规则、标签放置顺序与各次 seek 的完整 UI 执行保留。

`dev/shots/T4/smoke-fix1-native.json` 已实际确认横 1920×1080 / 竖 1080×1920 的原生分支均为 `scale=1`、`pixelRatio=1`、`AA=true`、`measureWaitFrames=6`。

轻量窗口探针 `dev/shots/T4/smoke-fix1-probe-lean.json` 不启用 Profiler、不逐帧读取缓冲快照：横屏前进 0.8172s、竖屏 1.0507s，均无同步精度读回或观测到的长任务。两画幅结束快照均为 `samples=0`、`stalled=false`、`blocking=null`、`states={}`。最终稳定性以无探针的完整 smoke 连续验收为准。仅 GPU 侧前两项优化的完整复跑失败证据保存在 `smoke-fix1-attempt1-2.log`，因此没有以单次短窗口通过认定问题解决。

没有采用整段 render 合并，sweep 的中间时刻仍执行渲染逻辑；没有修改地图像素比、隐藏图层或改变检查阈值。临时机制试验和失败记录保存在截图目录与进度文件中。

MapLibre 固定版本源码依据：[读回调度](https://github.com/maplibre/maplibre-gl-js/blob/v5.6.0/src/geo/projection/globe_projection_error_measurement.ts#L124-L139)、[同步读回](https://github.com/maplibre/maplibre-gl-js/blob/v5.6.0/src/geo/projection/globe_projection_error_measurement.ts#L186-L212)。

网络等待是独立问题：默认代理基线在画幅 roundtrip 超时（`smoke-codex-baseline.log`）；该 30s 脚本串行等待三次渲染，镜像诊断总计 8.048s（`smoke-codex-diag-mirror.log`）。直连适配器用于避开本机系统代理，不改变任何检查或阈值；单次直连通过不能替代播放性能修复与连续验收。

### 4.3 节拍点与对齐（渲染模式，镜像）

- 竖屏 24.8 / 41.8 / 57–59.5、横屏 9.5–12 航线新镜头，及修正后的复核帧：`dev/shots/T4/iter8/`（`P.jpg`、`L.jpg`、`F.jpg`、`P2.jpg` 拼图；`z1.png`、`z2.png` 为放大检查）。
- 当前画面与检查口径：
  1. `route.follow` 在屏幕空间跟随飞机：飞机位于终点来向一侧、距终点 (1 − e)·L 像素（e 为缓入缓出，L 横 520 / 竖 400），进度取航线上投影最近的点；单调、只依赖 t（`iter8/F.jpg`）。
  2. `stops.kix.sideP = 0`，竖屏机场标签位于节点正下方，避开飞机来向。
  3. 竖屏奈良标签在节点下方且横向盖住节点时，卡片引线从标签下缘出发。
  4. 收尾竖屏焦点 [500, 1408]、末帧缩放 8.9，仅拉远 0.05 级；`tools/labels.mjs` 交接复核 55.2–60s 横竖标签最大位移 ≤ 15px，无换边。
  5. 伏见稻荷 z14.05–14.3 镜头内，建筑高度在 14→14.15 长出。
  6. 竖屏 18–21s 京都节点按逐字矩形避让「KYOTO · FUSHIMI」，随文字不透明度淡出。
- 最终代表帧：`dev/shots/T4/final/`（横 `L-*.png` 11 张、竖 `P-*.png` 9 张，`L.jpg` / `P.jpg` 拼图）。

### 4.4 声音（`node scripts/render.mjs … --audio-only`）

整段 `dev/shots/T4/audio/full.wav` 的交接测量：60.00s · 48kHz 立体声 · 688 个事件 · 峰值 -1.7 dBFS · RMS -16.5 dBFS · 0 个削波样本（≥ -0.09 dBFS 的样本也为 0）。每 4 秒 RMS（`tools/wavprof.mjs`）：开场 -24 / 航线 -13 / 京都 -15 / 回忆 -18 / 夜 -20 / 奈良 -15 / 意外 -18 / 大阪 -14 / 收尾 -17 dBFS，起伏与能量曲线一致。全屏卡片段配有柔和拨弦（-18.5 dBFS）。

### 4.5 MP4（`render.mjs --fps 30 --from 8 --to 31 --audio --format jpeg`，镜像，渲染模式逐帧等瓦片）

| 文件 | 规格 | 内容 |
| --- | --- | --- |
| `dev/shots/T4/render/landscape-8-31.mp4` | 1920×1080 · 30fps · 690 帧 · 23.0s · H.264 + AAC | 航线跟随推近 → 机窗卡片 → 特急 → 伏见稻荷 → 卡片全屏 → 章节框线 → 回忆 → 分屏盖章 |
| `dev/shots/T4/render/portrait-8-31.mp4` | 1080×1920 · 同上 | 同一段竖屏构图 |

两段的 WAV 交接测量：23.00s · 304 事件 · 峰值 -1.8 dBFS · RMS -15.8 dBFS。ffprobe 确认两段视频均为 30fps、690 帧、23.000s；音轨均为 AAC、48kHz、双声道、23.000s，容器时长也为 23.000s，结果保存于 `dev/shots/T4/ffprobe-codex.json`。音频由同一份乐谱从 8s 起离线渲染。抽帧拼图为 `dev/shots/T4/render/L-contact.jpg`、`P-contact2.jpg`，后者对应含节点文字避让的竖片。原生尺寸导出的 AA、精度测量与镜头内容保持原有设置，两片保留。

### 4.6 预览图与站点

- `node scripts/capture.mjs --only map-pilgrimage`：`previews/cases/map-pilgrimage.jpg`（20.4s 伏见稻荷：标题、卡片、印章、3D 建筑）、`map-pilgrimage-portrait.jpg`（41.8s 奈良：章节胶带、标题、卡片）。
- 现有预览为节点避让修正后生成的图片。软件 GL 缩小预览使用轻量渲染分支，镜头、布局、文字与声音内容未改；预览图片保留。
- 站点详情页 `cases.html#case/map-pilgrimage`（`tools/site.mjs`，1440×900，Demo 直连 OpenFreeMap）：加载中显示“正在预加载资源 25%”与进度条；就绪后横 / 竖切换按钮可见，点竖屏后 Demo 回报 `portrait`、舞台 377×670；声音开关 关 → 开（Demo 内 `audio.state = on`）；0 个控制台错误。截图 `dev/shots/T4/site/site-L-loading.png`、`site-L.png`、`site-L-sound.png`、`site-P.png`。

### 4.7 构建与检查

- `node scripts/build.mjs`：build ok · 9 cases · 38 patterns · 3 files updated，日志 `dev/shots/T4/smoke-fix1-build.log`。
- `node scripts/check.mjs`：check ok · 9 cases · 38 patterns · 99 源文件 · 47 份 kit 副本；42 个旧 Demo 目录有字体告警，map-pilgrimage 无告警。日志 `dev/shots/T4/smoke-fix1-check.log`。

收尾已停止 4330 的瓦片镜像进程，确认端口不再监听；4321 本地服务器 PID 18164 保留，首页 HTTP 200。没有提交、推送或切换分支，未修改 kit、scripts、站点页面或其他案例。

### 4.8 最能代表成果的截图（建议发给用户）

1. `dev/shots/T4/final/L-05.2.png` — 片名「関西周遊」逐字落下 + 地球
2. `dev/shots/T4/iter8/L-10.2.png` — 航线跟随：飞机领路，镜头推近关西机场
3. `dev/shots/T4/final/L-20.4.png` — 伏见稻荷：竖排标题、3D 街区、千本鸟居卡片与引线、两枚印章
4. `dev/shots/T4/final/L-27.2.png` — 回忆：方丈記竖排逐字
5. `dev/shots/T4/final/L-31.0.png` — 分屏对比：明信片 1930s / 实景 2026 + 倾斜时间戳盖章
6. `dev/shots/T4/final/L-46.0.png` — WRONG TRAIN：错误路线画红、REROUTING
7. `dev/shots/T4/final/L-51.6.png` — 道顿堀夜景 + 霓虹竖卡
8. `dev/shots/T4/final/P-41.8.png` — 竖屏奈良：章节胶带、标题、卡片、右侧印章栏
9. `dev/shots/T4/final/P-58.5.png` — 竖屏收尾统计 + 全程鸟瞰

以上 9 张均已确认存在且非空。`final/L.jpg`、`P.jpg` 拼图可整体浏览，但生成早于若干节点避让复拍，最终画面以独立 PNG 为准。

## 五、遗留问题与验证范围

1. **其他缓冲条件**：交接 25ms 策略的横屏 10Mbps 有两次共 7.288s 暂停及一帧计划外 z6；当前地球远景 5ms 策略未复测横屏 10Mbps 或竖屏 50Mbps，不能将本次横屏零暂停、零缺帧结论扩展过去。
2. **网络口径**：镜像控制瓦片带宽与延迟，页面 ready 仍受地图库、样式及本机代理影响。本地 HTTP/1.1 镜像与线上连接模型不同，真实网络端到端表现尚未确认。
3. **驻留与移动端**：本次横屏 50Mbps GC 后驻留峰值为 566MB，采样堆峰值 610MB；横屏 10Mbps 与竖屏 50Mbps 没有单独驻留测量。Safari 的 WebGL 性能与内存上限未验证。
4. **画幅切换成本**：实时模式会重扫缓冲计划，本次横屏扫描 1.621s；实时切换时主线程仍有扫描成本，机器负载会放大耗时。
5. **文字表现**：站名打字时满宽衬底先出现，静帧可能像空框；鸭川近景左下 HUD 在密集 3D 建筑上可读性一般；竖屏道顿堀站名放不下时隐藏，地名仍由标题与卡片给出。
6. **smoke 环境**：验收使用测试浏览器直连；系统代理路径仍可能因远端瓦片等待而超时。软件 GL 预览有专门的性能分支，正常测量不构成任意负载或设备上的实时帧率保证；没有修改检查阈值或跳过任何画幅与字体检查。
7. **范围**：T4b 的 12 个巧思不在本次案例交付范围。
