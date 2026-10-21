# T4a 进度日志（防中断）

## 已完成
- 调研：参考视频全片粗扫 / 9 段转场细扫 / 21 张全分辨率帧（dev/shots/T4/ref）；旧 Demo 17 个节拍点截图（dev/shots/T4/before）。
- 日本路线：A 关西环线 / B 东京→镰仓→京都→大阪 / C 东京湾 三个候选 + 旧中国路线对照，瓦片实测（dev/shots/T4/tiles，results.jsonl，sheet-*.jpg）；选 A。
- 铁路几何：从矢量瓦片提取 rail 线 + 最短路（tiles/rails.mjs → rails.json → mkpaths.mjs → demos/.../paths.js）。
- 实现：config.js（60s / 120BPM 节拍表、横竖 layout）、index.html、style.css（两套构图）、script.js（stage、MapLibre、line-gradient 路线、同源对齐、HUD SVG、乐谱 + 自定义音色）、scenes.js（window/torii/kamo/deer/neon 五个场景 × photo/postcard/illustration）。
- 迭代截图 iter1–iter4（横屏）、iter5p（竖屏）。

## 进行中（2026-10-16）
- 实时模式预取：三步（扫描 → HTTP 预热 → 装载）。扫描 604 块瓦片 / 100MB；下载 24s；装载阶段很慢（每个采样点 5–24s），正在排查（HTTP 缓存是否命中、低缩放矢量瓦片 1MB 解析慢）。

## 待办
- 预取装载提速 + 播放中瓦片未就绪统计（tools/live.mjs）。
- 竖屏修正后复拍；横屏全节拍复拍；放大检查对齐。
- 声音离线 WAV 检查；smoke（两种画幅 strict-fonts）；render.mjs 横竖各 20s 片段 + MP4；capture 预览；站点详情页截图。
- 条目 JSON、研究笔记、build、check、报告 dev/reports/T4a.md。

## 2026-10-16 预取提速
- 发现：MapLibre 5 默认只有 1 个 worker；改图层后数据源处于暂停态，扫描前要先渲染一帧并等空闲。
- 新三步：扫描（stub loadTile，拿 MapLibre 自己算的瓦片清单）→ HTTP 并发预热 → 暂停数据源 + _addTile 全部瓦片并行解析（不渲染）→ 恢复，多余瓦片进缓存。
- 结果（横屏，无头 Edge）：604 块 / 100.6MB；扫描 6s、下载 29s、解析 11s，ready 55s；播放仅航线段（8.4–10.6s）有未就绪帧 → 加密采样（0.25 级缩放 / 300px 平移）。
- 低内存设备（deviceMemory ≤ 4）只做 HTTP 预热。
- 再改：扫描时每个采样点同步 redraw（地球/平面投影过渡状态才对）；未就绪统计只看底图数据源（路线 GeoJSON 描线时本来就在加载）。
- 结果：实时全程 0 帧缺瓦片（live/live-landscape.json）。内存：3D 建筑只建在 z14、平面建筑止于 z14、高俯仰降到 ≤60 → JS 堆 1.88GB → 1.38GB。
- 下一步：横竖全节拍复拍 → 声音 WAV → smoke → render MP4 → capture → 站点 → 文档与报告。
- iter6（横屏全节拍）检查后修：路线标签互相重叠 → 沿线多点 + 法线两侧候选避让；站名标签固定宽度；片名与收尾镜头焦点右移；KIX→京都全景镜头重新取景。
- 声音：整段离线 WAV 60s / 676 事件 / 峰值 -1.7 / RMS -16.5 / 0 削波（audio/full.wav，tools/wavprof.mjs 有每 2 秒响度曲线）；全屏卡片段补了柔和拨弦。下一步 smoke。

## 2026-10-16 主任务要求：改为渐进预取（视频缓冲式）
- 已定位 smoke 失败（播放 1.5s 只走 0.1–0.3s）：无头软件渲染下 GPU 交换慢；拉伸的颗粒 canvas 是主要成本 → 已改为平铺噪点背景（不用 mix-blend-mode）。仍需复测。
- 新预取设计：scan（只在 ready 前、选择性 redraw）→ 后台“缓冲泵”按时间顺序直接 loadTile 进 MapLibre 瓦片缓存（DEM 手工 backfill）→ 主动淘汰已播过的瓦片 → bufferedUntil；播放中前方缓冲不足就暂停 + 舞台内缓冲提示，够了自动继续；ready 门槛 = 开头 6 秒。
- 渐进缓冲已实现（buffer 模块），修正：扫描须在第一帧之后（之前扫描清单错）；DEM 按图层缩放范围；过渡帧接受上级瓦片；被淘汰的瓦片重新排队。下一步：冷缓存 / 10Mbps 实测。
- 本机浏览器经系统代理(127.0.0.1:7897)访问 OpenFreeMap 极慢且不稳（32 块 z14 用了 268s；node 直连 4.5s）。新增 tools/tileproxy.mjs（磁盘缓存 + 带宽/延迟模拟）与 Demo 的 ?tilemirror= 参数，用于可重复的冷缓存实测。
- 镜像缓存已填充（127MB 磁盘）。横屏全程计划 647 块 / 109MB，其中航线段 z2–z5 世界瓦片 ~35MB：去掉 9.6s 的 z4.7 停留关键帧（一口气推近），仅快速推拉帧用到的瓦片最低优先级。

## 2026-10-17 暂停现场
### 已完成
- 调研全部完成（ref/、before/、tiles/：日本三条候选路线 + 中国对照实测，选关西环线；铁路几何从矢量瓦片提取 → paths.js）。
- 实现：config.js（60s/120BPM、横竖 layout、镜头关键帧 f/fp）、index.html、style.css（两套构图，含缓冲胶囊 .buffering）、script.js、scenes.js（5 个日本场景 × 3 风格、横竖自适应、旅伴“蜜柑”）、paths.js。语法检查全部通过，文件处于可运行状态。
- 对齐/避让：站名标签固定宽度 + 8 个候选位置 + HUD 保留区 + 事件文字矩形（事件文字先画）；路线标签沿线多点避让；引线在标签放好后画。iter6（横屏 25 个节拍点）、iter7（横 6 / 竖 14 个点）已检查，剩余问题已修但未复拍：竖屏 Kamo 标签（加居中候选 + fp 改 [600,880]）、标签衬底 box-sizing。
- 声音：整段离线 WAV 60s / 676 事件 / 峰值 -1.7 dBFS / RMS -16.5 / 0 削波（audio/full.wav；全屏卡片段后来补了柔和拨弦，未重导）。
- 渐进缓冲（主任务要求）：script.js 的“缓冲（实时模式）”一节——扫描（第一帧之后，手动同步地球/平面投影状态，约 0.7s）→ 缓冲泵按时间顺序直接 loadTile 进 MapLibre 缓存（并发 矢量10/DEM6，60s 超时重试，跳过 MapLibre 正在加载的瓦片，DEM 手工 backfill）→ 主动淘汰播过的瓦片 → bufferedUntil；不足 0.5s 自动暂停 + 舞台胶囊“BUFFERING MAP xx%”，攒够 4s 继续；ready 门槛 = 开头 6s（gate 前只取 gate 内瓦片）；进度分 7 个 preload 任务报给站点；切换画幅时 replan。window.__buffer / __bufDebug（urls、states、blocking、near、live、unplanned、scan1）供验证。
- 其他提速：地图库/样式/tilejson 并行下载 + index.html preload；等 style.load 不等 load；山体阴影只在 z5.5–13；3D 建筑只建在 z14、平面建筑止于 z14；颗粒改成平铺噪点背景（不用 canvas 拉伸和 mix-blend-mode，无头下这是每帧几百毫秒的元凶）；地图像素比按显示尺寸（0.5–2）。
- 测试工具（dev/shots/T4/tools/）：beats.mjs（节拍截图）、sheet.mjs（拼图）、live.mjs（实时全程：--mirror --small --mbps）、tileproxy.mjs（瓦片镜像 + 带宽/延迟模拟，缓存在 dev/shots/T4/tilecache，已填充横竖两套 127MB）、playrate/trace/cpuprof/netwatch/dbg/dbg2/plog/wavprof。Demo 新增 ?tilemirror=<镜像地址>。

### 刚才在做
- 用镜像（50Mbps / 40ms，640×360 视口）跑横屏冷缓存实测：ready 约 2.7s 地图样式 + 4.3s 开头缓冲；未就绪帧 0、降级遮罩 0、JS 堆峰值 589MB；但 7.88s（航线开始）出现一次 63.6s 的缓冲暂停——**未解决，恢复后第一步查这里**（`__bufDebug.blocking()` 看是哪些瓦片挡住；怀疑：去掉 9.6s 关键帧后 7.8–11.6s 采样的 fast 判定、或 KIX z10–11 瓦片被 fastOnly 低优先级/淘汰反复）。结果文件 live/live-landscape-mirror-small.json。
- 计划体量：横屏全程 661 块 / 124.5MB（z14 占 49.8MB，z2–z5 世界瓦片 34MB 只在快速推拉帧用到 → 最低优先级）；俯仰压到 48° 只省 7.5MB，不采用。

### 已知问题
1. 上面的 7.88s 长暂停。
2. smoke：字号两种画幅都通过（横 24 / 竖 36），但“播放 1.5s 前进 > 0.5s”失败（无头软件渲染慢；颗粒改法后需复测）。
3. 本机浏览器经系统代理访问 OpenFreeMap 极慢（直连 node 4.5s 的 32 块瓦片，浏览器 268s），所以实测一律走 tileproxy 镜像并在报告里说明。
4. 后台进程：本地服务器 4321（serve.mjs）、瓦片镜像 4330（tileproxy.mjs）可能仍在运行。

### 恢复后顺序
1. 启动 `node scripts/serve.mjs --port 4321` 与 `node dev/shots/T4/tools/tileproxy.mjs --port 4330 --mbps 50 --latency 40`；用 live.mjs（--mirror --small）复现 7.88s 暂停并修复；再测 10Mbps（`curl localhost:4330/__set?mbps=10`）与竖屏。
2. smoke 两种画幅 → 复拍需要检查的节拍点（竖屏 24.8 / 41.8 / 57–59.5，横屏 9.5–12 航线新镜头）→ 重导 WAV。
3. render.mjs 横竖各 20s 片段（含 --audio，合成 MP4）→ capture.mjs 预览 → 站点详情页横竖截图。
4. entries/cases/map-pilgrimage.json、docs/research/map-pilgrimage.md → build → check → dev/reports/T4a.md。

## 2026-10-21 恢复（新执行者）
### 阶段 1a：缓冲卡死根因 + 渲染成本（已改，待全程实测）
- 复现：live.mjs 增加 --mirror / --small / --tag，缓冲暂停时每 2s 记 `__bufDebug.blocking()`。冷缓存横屏卡在 t=20.02（等 17.8s 采样点的两块 z? 瓦片，state=pending）永不恢复。
- 根因：采样点代表 [t, 下一个采样点) 一整段，但瓦片 tLast 只记采样时刻 s.t。镜头静止的长段里播放头一过 s.t+0.5s，
  这些瓦片既被泵跳过（e.tLast < T-0.5）又被 evict 淘汰（tLast < T-behind），computeBuffered 却仍要求它们 → 永久卡死。
  之前的 7.88s / 63.6s 暂停是同一机制（航线开始前静止镜头）。修：planBuffer 里 tLast = 下一采样点时刻（末段 = DUR）。
- 播放慢（无头 1280×720 每秒 1–3 帧，live 小视口约 1 帧/秒，smoke 失败的真正原因）——逐层排查（tools/gpucost.mjs、frametimes.mjs、smokeplay.mjs）：
  1. 颗粒：每步改 background-image/position → 整层重栅格。改为比舞台大一个周期的合成层，只改 transform（style.css .grain + script.js）。
  2. MSAA：软件 GL（SwiftShader 等）实时播放时 antialias 关闭（softwareGL() 检测；渲染模式始终开）。
  3. 路线图层：8 条未出场路线即使全透明 / 空数据，每帧仍算覆盖瓦片、切 GeoJSON（地球视角尤其贵）→ 出场前 0.6s 以前 visibility:none（setVis）。
  结果：t=0 稳态 3 fps → 约 19–20 fps；smoke 后“seek(0)→播放 1.5s”≈0.73s（第一帧跳转约 770ms，之后约 13fps）。
- smoke（--strict-fonts，两种画幅）：通过。
### 阶段 1b：缓冲策略重做（已改）
- tools/bitrate.mjs：缓冲计划 × 镜像磁盘缓存文件大小 → 码率曲线。横屏 661 块 / 124.5MB；航线 6–10s 首次用到 55MB（48MB 只在快速推拉帧用到，z2–z5 世界瓦片），京都 16s 20.5MB，大阪 48s 27MB。
- tools/tileprobe.mjs：已解析瓦片在主线程堆上约为 pbf 原始字节的 8–10 倍（清空缓存前后 GC 对比）。
- 新设计（script.js 缓冲一节）：两级——下载（fetch 进 HTTP 缓存，fetchAhead 45s）+ 解析（MapLibre 缓存，ahead 10s）；不在画面的已解析瓦片按原始字节预算 budgetMB 20（超出只解析 resume+1 秒内，淘汰窗口收紧到 [T-0.5, T+5]）；
  静态分级“可选瓦片”（只在快速帧用到、3 级内有必需上级且上级到时仍在缓存）；带宽三档：近期必需解析 > 远处必需下载 > 可选（soon 20s 内必需全到手后）。
- 其他修正：?demmirror=（高程镜像单独主机，否则单主机 6 连接把高程请求饿死，镜像实测失真）；快速推拉段每 0.025s 采样（之前漏 8.28s 的 z5 瓦片 → 1 帧缺瓦片）；liveDegrade 记录缺的是哪块（__mapStats.missTiles）。
- 实测（镜像，640×360，冷缓存）：50Mbps 横屏 ready 3.1s · 0 暂停 · 0 缺瓦片帧 · 堆峰值 593MB（GC 后驻留峰值约 500MB）。10Mbps（改分级与三档前）2 次 / 9.1s。
### 阶段 1c：缓冲细节（已改）
- MapLibre 自己为画面发出的“可选”瓦片请求：带宽紧张且播放中时推迟（installDefer，__deferred 标记，泵仍可自己加载）。
- 采样加密：阈值减半（缩放 0.12 / 平移 150px / 俯仰 2.5° / 方位 3°）+ 静止缓慢段最多 0.2s 一次 + 快速段 0.01s + 跨整数缩放的那 0.01s 再细分 4 份
  （之前漏掉：17.8s 后缓慢漂移里进出画面的一块 z14、8.28s 地球跨级一瞬间的 z5）。扫描约 0.75s / 1160 个采样点。
- upLevels：世界尺度 z≤5 允许 4 级上级瓦片顶替（只在快速帧 / 缺瓦片判定），航线必需字节 18.7 → 15.5MB。
- 实测（镜像 640×360 冷缓存）：横屏 10Mbps ready 4.2s · 2 次暂停 5.0s@8.94 + 2.1s@17.22 · 0 缺瓦片帧 · 无遮罩；
  横屏 50Mbps / 竖屏 50Mbps 待用最终代码复测。sampled 堆峰值含未回收垃圾（t=59 时 sampled ~600MB 而 GC 后 ~50MB），报告用 GC 后驻留峰值。
### 阶段 1 完成 · 阶段 2–3（smoke、节拍复拍）
- 最终缓冲实测（镜像，640×360 冷缓存）：横 50Mbps ready 4.3s · 0 暂停 · 0/779 缺瓦片帧 · 采样堆 637MB（GC 后驻留峰值 519MB @18.3s）；横 10Mbps ready 4.2s · 2 次 7.1s（5.0s@8.94 航线、2.1s@17.22 伏见稻荷）· 0/825；竖 50Mbps ready 4.2s · 0 · 0/749 · 516MB。
- smoke --strict-fonts 两种画幅通过（改颗粒 / 软件 GL 关 MSAA / 未出场路线不可见之后）。
- 复拍 iter8：发现并修复——①航线 9.5–11s 画面里没有飞机（镜头 3.8s 推近 9 级，匀速飞机被甩出画面）→ route.follow 屏幕空间跟随（followP）；②竖屏 KIX 标签在航线来向一侧挡住飞机 → stops.kix.sideP=0（竖屏放节点下方）；③竖屏奈良卡片引线穿过居中标签 → 引线从标签下缘出发；④收尾鸟瞰标签中途换边（镜头漂移跨过避让阈值）→ 竖屏焦点 fp [500,1408]、末帧缩放 8.9（只拉远 0.05 级），横竖 55.2–60s 标签位置稳定（tools/labels.mjs）。
- 新工具：gpucost / frametimes / smokeplay / bitrate / tileprobe / scanprobe / scanwhen / labels / site / livesum。
- 下一步：WAV → render MP4 横竖 → capture → 站点截图 → build/check → 报告。条目 JSON 与研究笔记已改（研究笔记已含缓冲实测表）。
### 阶段 4–5（WAV、MP4、预览图）
- 整段 WAV（render.mjs --audio-only）：60.00s · 688 事件 · 峰值 -1.7 dBFS · RMS -16.5 dBFS · 0 削波（dev/shots/T4/audio/full.wav；每 4s 响度 -25…-13 dBFS）。
- 预览图检查后再修：伏见稻荷一镜（z14.05–14.3）建筑几乎看不见——平面建筑止于 z14、3D 高度 14→14.5 才长出 → 改为 14→14.15；previewAt 18.6（标签正在打字）→ 20.4。
- render.mjs 8–31s（23s，航线 / 卡片 / 全屏 / 章节 / 回忆 / 分屏）横竖各 690 帧（镜像，渲染模式逐帧等瓦片），各约 46–56 分钟（两路并行）：
  dev/shots/T4/render/landscape-8-31.mp4、portrait-8-31.mp4（含音频；竖屏 WAV 23s · 304 事件 · 峰值 -1.8 dBFS）。
- capture.mjs：previews/cases/map-pilgrimage.jpg（20.4s）+ map-pilgrimage-portrait.jpg（41.8s），最新代码生成。
- 代表截图：dev/shots/T4/final/（横 9 张、竖 6 张，含 L.jpg / P.jpg 拼图）。
- 下一步：站点详情页横竖截图 → smoke 复跑（代码有改动）→ build / check → 报告。

### 阶段 6（站点、构建）
- 竖屏 MP4 重渲（17:3x 起）：成片检查发现竖屏 18–21s 京都站节点压在「KYOTO · FUSHIMI」标题字上 → 节点按逐字矩形避让事件文字（被压住时随文字不透明度淡出）。横屏 8–31s 不受影响（无节点落在字形 16px 内），横屏 MP4 保留。
- 站点详情页（dev/shots/T4/site/，tools/site.mjs）：加载进度显示（25%…）、横 / 竖切换按钮可用且 Demo 回报一致、声音开关 关 → 开（audio on）、0 错误。注意：与后台渲染并行时机器极慢（扫描 33s、ready 55–78s），截图需在渲染结束后重拍。
- build ok；check ok（只有旧 Demo 字号警告，map-pilgrimage 无告警）。
- 工具同步到 dev/wip/T4a/tools/。
- 剩余：等竖屏渲染完 → smoke 复跑 → 站点重拍 → capture 复跑 → 报告。
- 报告 dev/reports/T4a.md 已写（待补：竖屏重渲完成后的抽帧、smoke 最终复跑、站点截图重拍、capture 复跑）。

## 2026-10-21 交接 Codex

### 环境
- 仍在运行：本地服务器 `node scripts/serve.mjs --port 4321`（保留）、瓦片镜像 `node dev/shots/T4/tools/tileproxy.mjs --port 4330 --mbps 50 --latency 40`（收尾时停掉）。镜像带宽可改：`curl "localhost:4330/__set?mbps=10"`。
- Demo 走镜像：`?tilemirror=http://localhost:4330&demmirror=http://127.0.0.1:4330`（矢量 / 高程分两个主机）。工具在 `dev/shots/T4/tools/`（已同步到 `dev/wip/T4a/tools/`，最后几处小改动——site.mjs 不 await seek、cpuprof.mjs 的 SWEEP/WHO——需再同步一次）。
- `dev/codex-worker.md` 是未跟踪文件，不是 T4a 产物，别动。

### 已完成
- 代码（`demos/cases/map-pilgrimage/script.js`、`config.js`、`style.css`）：
  - 缓冲：tLast 改为下一采样点时刻（修 63.6s / 永久卡死）；两级缓冲（fetch 进 HTTP 缓存 45s + 解析 10s）、静态分级可选瓦片（upLevels：z≤5 允许 4 级顶替）、带宽三档、内存预算 budgetMB 20（deviceMemory≤4 时 10）、推迟 MapLibre 自己的可选请求（installDefer）、`?demmirror=`；采样：阈值减半 + 静止段最多 0.2s + 快速段 0.025s + 跨整数缩放那一格细分 6 份（约 820 个采样点，扫描约 0.5–0.6s）。
  - 渲染成本：颗粒改合成层只改 transform；软件 GL 关 MSAA（`MAP.softGL = softwareGL()`）；未出场路线 visibility:none（setVis）；软件 GL 下地球“精度误差测量”首测后冻结（liveDegrade 开头，`_measureWaitFrames = 1e9`）——**这是最后一处改动，改完后 smoke 出现 seek 超时，见未完成第 1 条**。
  - 画面：航线屏幕空间跟随（followP，route.follow）；`stops.kix.sideP=0`；竖屏引线从标签下缘出发；收尾竖屏焦点 [500,1408]、末帧 z8.9；3D 建筑高度 14→14.15；节点压在事件文字字形上时随文字淡出（textRects）；调试钩子 `__bufDebug.plan()`、`__labelDebug()`、`__mapStats.missTiles`。
- 缓冲实测（镜像，640×360 冷缓存，`tools/live.mjs <orient> --mirror --small --mbps N`，摘要 `tools/livesum.mjs`）：
  - 最终代码（820 采样点）：横 50Mbps ready 9.1s（其中 unpkg 地图库经系统代理 8.1s，地图就绪→开头 6s 1.0s）· 0 暂停 · 0/775 缺瓦片帧 · 采样堆 654MB；竖 50Mbps ready 18.4s（地图库 17.4s）· 0 · 0/763 · 516MB；横 10Mbps ready 7.6s · 2 次共 7.3s（3.0s@9.85、4.3s@17.14）· 1/790（8.50s 一块计划外 z6 `19w66`，无遮罩）· 621MB。
  - 上一版（1288 采样点）：横 50 ready 4.3s · 0 · 0/779 · 637MB；横 10 · 2 次 7.1s · 0/825；竖 50 · 0 · 0/749；GC 后驻留峰值 519MB（`live-landscape-mirror-small-50mbps-gc.json`，--gc 3）。
- 整段 WAV：`dev/shots/T4/audio/full.wav` 60s · 688 事件 · 峰值 -1.7 dBFS · RMS -16.5 · 0 削波。
- MP4（`node scripts/render.mjs "http://localhost:4321/demos/cases/map-pilgrimage/index.html?tilemirror=http://localhost:4330&demmirror=http://127.0.0.1:4330" --orient <o> --fps 30 --from 8 --to 31 --audio --format jpeg --out dev/shots/T4/render/<o>-8-31`）：
  - `dev/shots/T4/render/landscape-8-31.mp4`：1920×1080 · 30fps · 690 帧 · 23.0s · H.264+AAC（WAV 304 事件 · -1.8 dBFS · RMS -15.8）；渲染于“节点避让文字”之前，但横屏 8–31s 无节点受影响，可用。
  - `dev/shots/T4/render/portrait-8-31.mp4`：1080×1920 · 同参数，含节点避让修正（18:24 完成）。抽帧 `render/L-contact.jpg`、`P-contact2.jpg`。
  - 之后的改动（误差测量冻结、采样减少）只影响实时模式，不影响渲染模式输出，MP4 不必重渲。
- 截图：`dev/shots/T4/final/`（横 L-*.png 11 张、竖 P-*.png 9 张、L.jpg / P.jpg 拼图）；`iter8/`（航线跟随、标签修正复核）；站点 `dev/shots/T4/site/`（site-L-loading / site-L / site-L-sound / site-P，build 之后重拍，正常）。
- 预览图：`previews/cases/map-pilgrimage.jpg`（20.4s）、`map-pilgrimage-portrait.jpg`（41.8s），节点避让修正后重拍。
- 资料：`entries/cases/map-pilgrimage.json`（60s/120BPM 19 个节拍、energy 30 值、layers/composition.sound/tokens/interaction/prompt/videoPrompt/negativePrompt/migration/sources，previewAt 20.4 / previewAtPortrait 41.8，patternIds 未动）；`docs/research/map-pilgrimage.md`（复看补充、瓦片实测、缓冲设计与实测、无头播放成本、验证记录）。build ok、check ok（在最后两处代码改动之前跑的）。
- 报告草稿 `dev/reports/T4a.md` 已写，但部分内容过时（见未完成第 3 条）。

### 未完成（逐条）
1. **smoke**：`node scripts/smoke.mjs --only map-pilgrimage --strict-fonts` 目前失败。最近一次：横屏“脚本执行超时：await m.seek(30.000)…”（smoke 第 149 行的画幅切换步骤，30s 超时）；此前几次是“播放 1.5 秒后时间只从 0 走到 0.12–0.5”。先排查：①去掉 liveDegrade 开头的误差测量冻结块重跑，看超时是否消失；②切换画幅会 replan（全量扫描 + clearTiles），测 `setOrient` 耗时。验收：两种画幅通过；若“播放 1.5s”仍因无头软件渲染失败，用 `tools/frametimes.mjs`（全程 seek 后逐帧耗时）、`gpucost.mjs`、`trace.mjs` 给出证据写进报告（已知：t=0 地球视角稳态约 8–10 帧/秒，GPU 进程 RealSwapBuffers 占主导，模板 Demo 同机 40+ 帧/秒）。
2. 研究笔记 `docs/research/map-pilgrimage.md`：采样描述改为“0.025s + 跨级细分 6 份，约 820 个采样点，扫描约 0.5s”；实测表换成最终代码的数字（或注明两版）；补一句软件 GL 下冻结地球误差测量。
3. 报告 `dev/reports/T4a.md`：同步上面两条；4.1 实测表、4.2 smoke 结论、4.7 build/check 结果按最终状态改；保留“最能代表成果的截图”列表（final/L-05.2、iter8/L-10.2、final/L-20.4、L-27.2、L-31.0、L-46.0、L-51.6、P-41.8、P-58.5、L.jpg/P.jpg）与两段 MP4 路径。
4. `node scripts/build.mjs` 与 `node scripts/check.mjs` 在最终代码上重跑（验收：build ok；check ok，map-pilgrimage 无告警）。
5. 把 `dev/shots/T4/tools/*.mjs` 再同步到 `dev/wip/T4a/tools/`。
6. 收尾停掉 4330 镜像进程（保留 4321）。

### 已知问题
- 10Mbps 仍有 2 次数秒暂停（航线起飞、伏见稻荷，内容本身的突发码率；理论不停顿需约 9s 起播等待）；偶发 1 帧计划外过渡瓦片（无遮罩）。
- 切换画幅会全量重扫（约 0.5s，负载高时更久），主线程短暂卡住；可预先缓存缓冲计划。
- 站名标签打字时固定宽度衬底先出现（静帧像空框）；鸭川近景左下 HUD 小字压在密集 3D 建筑上可读性一般；竖屏道顿堀站名标签放不下时隐藏。
- 本机经系统代理访问 OpenFreeMap / unpkg 很慢且不稳（ready 受地图库下载影响 3–18s），实测一律走镜像。
- 移动端 Safari 未验证；GC 后驻留峰值约 520MB（伏见稻荷高俯仰）。

- 2026-10-21 Codex：完成交接与范围核对；原始 smoke 复现画幅 roundtrip 超时（smoke-codex-baseline.log），镜像诊断 8.048s 完成且瓦片完整；已撤销 liveDegrade 的软件 GL 精度测量冻结块，渲染模式不执行此块，代理与播放性能继续分开验证。
- 2026-10-21 Codex：ffprobe 已复核两段既有 MP4：横 1920×1080 / 竖 1080×1920，均 30fps、690 帧、23.000s，H.264 + AAC 48kHz 双声道；当前撤销只在 !render 的 liveDegrade 路径，MP4 与预览图保留（ffprobe-codex.json）。
- 2026-10-21 Codex：最终代码首次 build/check 均通过（build：9 cases / 38 patterns；check：99 source files、47 kit copies，map-pilgrimage 无告警；42 个未迁移旧 Demo 目录保留字号告警）；日志 dev/shots/T4/build-codex.log 与 check-codex.log。
- 2026-10-21 Codex：完整 smoke 在测试浏览器禁用系统代理（临时启动适配器 codex-direct-browser.mjs 仅加 --no-proxy-server）后通过：横 24px / 竖 36px，全程 seek、播放与画幅切换检查未改，smoke 1/1；日志 smoke-codex-direct-baseline.log。原始系统代理基线超时；镜像并行测试曾播放不足，保留为软件 GL 负载敏感限制，不增加渲染改动。
- 2026-10-21 Codex：横 50Mbps / 40ms 冷缓存复测完成（640×360，--gc 3）：ready 6.2s，0 次暂停 / 0ms，0/748 缺瓦片帧，0 遮罩、0 超时；采样堆峰值 552MB、GC 后驻留峰值 528MB，819 点 / 720 瓦片、扫描 526ms；JSON dev/shots/T4/live/live-landscape-mirror-small-50mbps-codex-final.json。
- 2026-10-21 Codex：完成报告与研究笔记同步：当前横屏复测 / 交接横10与竖50分清来源，9张代表截图、两段MP4及ffprobe结果已列明；未同步dev/wip/T4a/tools（不在本次白名单），未重拍预览/MP4（渲染路径未改）。
- 2026-10-21 Codex：资料更新后的最终 build/check 再次通过：9 cases / 38 patterns、99源文件、47份kit，map-pilgrimage无告警；4330镜像PID37800已停止并确认端口不监听，4321服务器PID18164保留且HTTP200。未commit/push/切换分支。
- 2026-10-21 Codex：一次服务器一致性哈希比较被hash=deny拒绝，已改用全文直接比较，确认4321提供的script.js与工作区一致；没有变更Guard规则或系统代理。

## 2026-10-21 smoke 播放返工
- 已复现基线横0.2167s / 竖0.4668s不足；render=1、stalled=false、stallCount=0、samples=0，横首个前进帧1640.2ms，竖一次getBufferSubData阻塞448.5ms。串行变量对照见 dev/shots/T4/smoke-fix1-probe-variants.json；已在案例内独立检测软件GL，软件预览关MSAA并从地图render事件在首测后停止重复精度测量，原生尺寸导出保留正常设置；待完整三连跑。
- 案例修复后完整 smoke 第1次通过（退出码0，横24px / 竖36px）；输出 dev/shots/T4/smoke-fix1-1.log。第2、3次正在同一命令下串行执行，期间不启动其他浏览器测试。
- 首次完整连跑第2次失败（前进0.2168s，退出码1），第三次未启动；首两次输出保留为smoke-fix1-attempt1-{1,2}.log。仅关预览MSAA与冻结精度读回仍不足以稳定通过，继续单变量验证软件预览地图像素比上限0.5。
- 整段render合并会削弱中间时刻sweep覆盖，已排除并撤回；路线GeoJSON微任务合并、地图像素比0.5均未解决失败，已撤回/未采用。补充DOM路径：仅可见节点读取避让几何；舞台9个主题CSS变量复用sty缓存，避免值不变仍反复写样式。轻量窗口探针（无Profiler、无逐帧缓冲快照）横0.8172s / 竖1.0507s、无长任务/读回，blocking=null、states={}。证据smoke-fix1-probe-lean.json。开始对当前固定代码重新完整三连跑。
- 2026-10-22 当前固定代码三连验收第1次通过（00:02:06，退出码0，横24px / 竖36px）；第2次串行运行。smoke-fix1-1.log为当前代码结果，早期失败另存attempt1/attempt2日志。
- 2026-10-22 最终固定代码完整 smoke 连续3次全部通过，退出码均0；完成时间00:02:06 / 00:07:47 / 00:08:51，横最小24px / 竖36px，原命令、阈值与超时未改；日志 dev/shots/T4/smoke-fix1-{1,2,3}.log。
- 2026-10-22 原生导出分支实测通过：横1920×1080 / 竖1080×1920均scale=1、pixelRatio=1、AA=true、measureWaitFrames=6；证据smoke-fix1-native.json。已启动4330镜像（50Mbps/40ms），开始横屏冷缓存--gc3复测。
- 2026-10-22 首轮实时复测0暂停但1/771缺帧（8.51s，openmaptiles/19w66 z6 unplanned），证据live-landscape-mirror-small-50mbps-smoke-fix1.json。5ms扫描定位该瓦片只在8.415s出现，原相邻采样8.400/8.425均漏；已仅将实时快速段扫描加密到5ms，其他策略与render路径不变。原smoke三连证据仍覆盖未变的render分支；开始最终冷缓存复测。
- 2026-10-22 全快速段5ms实测0暂停/0of670缺帧，但扫描4.508s；进一步定位漏点zoom=5.8993（smoke-fix1-camera.log），已把5ms加密范围缩到现有地球远景定义zoom<6，其余快速段仍25ms，以保留原扫描成本。开始缩窄版最终冷缓存复测；结束后对同一最终文件再完成三连smoke。
- 2026-10-22 地球远景加密最终冷缓存复测通过：ready5.3s，0暂停/0ms，0of675缺帧，0遮罩/0超时，采样堆610MB、GC驻留峰值566MB；932点/725瓦片，扫描1621ms；证据live-landscape-mirror-small-50mbps-smoke-fix1-globe.json。4330已停止，4321保留；最终文件开始第二轮完整三连，上一组三连另存render-only-{1,2,3}.log。
- 2026-10-22 最终整份源码三连smoke完成：00:28:36 / 00:31:35 / 00:35:44，三次均1of1 passed、退出0、横24px/竖36px；与开始前snapshot直接文本比较一致。
- 2026-10-22 最终build/check通过（9cases/38patterns，99source files，47kitcopies，map-pilgrimage无告警；42旧Demo目录字体告警保留）；日志smoke-fix1-build.log / smoke-fix1-check.log。报告与研究笔记已同步最终数据、版本口径及遗留限制。4330不监听，4321 PID18164保留且HTTP200；仍在feat/polish-round-1，未commit/push/切分支。
- 2026-10-22 独立证据复核完成：三连日志、源码副本、最终缓冲/GC及build/check一致；已修正报告中瓦片规划与优化适用范围两处表述，使其与5ms实时采样和全模式DOM去重相符。
