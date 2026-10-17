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
