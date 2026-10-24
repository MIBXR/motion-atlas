# 地图巡礼 · 游戏过场式旅行影像 · 复用 Prompt

由 [结构化条目](../../entries/cases/map-pilgrimage.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/map-pilgrimage.md)。

## 实现 Prompt

用 HTML/CSS/JS 制作一支 60 秒、可逐帧定位的“地图巡礼”影像，固定画幅两套构图：横屏 1920×1080 与竖屏 1080×1920（舞台像素坐标，整体等比缩放）。舞台字号按设计决定，不设下限；网站界面 ≥ 12px。内容：关西三日（上海 → 关西机场 → 京都伏见稻荷 → 鸭川 → 奈良公园 → 道顿堀），只用真实地名。①世界层：MapLibre GL + OpenFreeMap positron，隐藏全部文字标注，z14 起 3D 建筑，加 AWS Terrain Tiles 山体阴影（z5.5–13）；镜头关键帧 {t, center, zoom, pitch, bearing, 焦点位置 f / 竖屏 fp}，用 padding 把地点放到指定的屏幕位置；开场地球投影 + 星空；长距离用一段 ease-out 一口气推近。②昼夜：按图层类别逐个插值白天与夜晚配色，约 1 秒、中途经过去饱和的灰，不整体反色。③路线：航线虚线 + 飞机、铁路发光实线（line-gradient 按进度截断；几何从矢量瓦片里的 rail 线最短路提取）+ 车头、步行圆点、错误路线红线打叉；所有点位由同一个投影函数计算，端点与圆心严格重合。④HUD：左上 DAY 01 / 03 + 日期，右上坐标 / ELEV·Z / JST 时钟，顶部规尺按旅程进度填充，左下 NOW PLAYING + 双语歌词打字，右下步进器与车站印章（竖屏改为顶部 HUD + 右侧印章栏 + 底部步进器），计数徽章变化时上滚回弹。⑤事件：竖排汉字逐字模糊入场（550ms，字间 160ms）+ 英文模糊前沿打字；照片卡片浮入并用引线连到地图标记；卡片展开为全屏、HUD 保留并压暗；章节换强调色并描出四角框线 / 斜纹胶带；全屏插画回忆（独立框、档案标签、竖排字幕逐字）；分屏对比（分割线滑到中线 + 倾斜时间戳盖章）；红色 WRONG TRAIN 通栏 + REROUTING 胶囊；大号日序；结尾统计逐行计数 + 衬线 fin.。⑥标签避让：站名固定宽度 + 多个候选位置，避开 HUD 保留区与事件文字；文字永不压线。⑦声音：WebAudio 合成 120 BPM 乐谱（环境底、和弦、贝斯、鼓、阳音阶拨弦 + 每个事件的音），默认静音，可离线渲染 WAV。⑧工程：render(t) 纯函数，时间全部写进 config 轨道；window.__motion = {duration, seek(t)→Promise, play, pause, on}；?render=1 时 seek 等待瓦片；实时播放先扫描全片镜头需要的瓦片，再按时间顺序两级缓冲（下载 / 解析，内存预算，快速推拉帧的低价值瓦片降级），前方不足就暂停显示缓冲提示；颗粒用独立合成层平移；离线退回网格底图。

## 视频生成 Prompt

60-second travel cutscene in the style of a video-game map interface, delivered in two fixed frames (1920×1080 landscape and 1080×1920 portrait with its own layout). A pale paper-colored 3D map of Japan's Kansai region (warm light-grey land, blue-grey water, white roads, thin grey railway lines, extruded white buildings in the city close-ups) is the persistent world; the camera glides with slow ease-in-out moves and gentle pitch. Fixed HUD: top-left 'DAY 01 / 03' with a monospace date, top-right latitude/longitude, 'ELEV 38 M · Z 14.1' and a large clock with a 'JST' superscript, a thin progress rule across the top, bottom-left 'NOW PLAYING' with an equalizer icon and bilingual lyric lines, bottom-right a four-stop stepper (KIX, KYOTO, NARA, OSAKA) with red station stamps. Beats: a night globe with stars → the map turns to day through grey → large vertical Japanese title characters '関西周遊' blur in one by one while 'KANSAI LOOP '26' types in → a dashed flight arc with a small plane sweeps from Shanghai and the camera dives straight into Kansai Airport → a glowing vermilion rail line draws along the real railway to Kyoto → close-up of Fushimi Inari with 3D buildings, a photo card of torii gates floats in with a thin leader line, then expands to full screen while the HUD stays on top → a teal chapter frame draws around the screen corners over the Kamo River → an illustrated flashback with its own frame and vertical Japanese subtitles revealing character by character → split screen: a divider slides to center revealing a 1930s sepia postcard against the modern river, a tilted timestamp stamps down → night falls on the map layer by layer, a handwritten note card drops in → day two: rail to Nara, deer park card with an amber tape decoration → a red 'WRONG TRAIN' banner wipes in, the wrong route turns red and ends with an X, a black 'REROUTING…' capsule blinks → night arrival at Dotonbori with neon and tall 3D blocks → the camera pulls back over the whole loop → stacked statistics count up and a serif 'fin.'. Clean, restrained, game-UI precision, subtle film grain, rhythmic edits on a 120 BPM beat, no camera shake.

## 负向约束

不要整体反色做夜景；不要让多个全屏模式叠在一起；不要把 HUD 做成满屏发光科幻风；不要用卡通贴纸替代信息层；不要在高缩放时保留地图文字标注抢走注意力；不要让镜头连续快速甩动；不要让文字压在路线或标记上；不要横竖画幅共用一套自适应排版；不要使用动画作品名称、截图或无授权的照片与音乐；不要在地图没加载完时露白（缓冲时停在当前帧并提示）。

## 动效 Token

- **blur-in 逐字**：550ms outCubic，字间 160ms，模糊 18px → 0，上移 14px → 0（地名标题同参数）
- **type-in 打字**：按字符推进，前沿字符带 7px 模糊
- **card-in**：550ms outCubic 浮入，400ms inCubic 离场；图片持续 Ken Burns
- **card-expand**：600ms inOutCubic 展开，停 2.2s（Ken Burns 1.04→1.10），550ms 收回；HUD 转白字 + 上下压暗
- **day-night**：约 1s，逐图层插值；中途经过去饱和的灰，不整体反色
- **chapter-frame**：标签 350ms 擦出 + 标题 700ms 打字；框线 800ms inOutCubic 描出，四角方块 120ms 错峰 300ms outBack
- **split-compare**：分割线 750ms outQuart 滑到中线；时间戳 360ms outBack 盖章
- **stamp**：车站印章与步进器同列，按到达依次盖下（回弹 + 印章音）
- **stat-stack**：每行 320ms 错峰计数，衬线 fin. 在 2s 后
- **buffering**：前方缓冲 < 0.5s 暂停并显示 BUFFERING MAP xx%，攒够 4s 继续

## 制作约束

- 参考视频为 B 站公开作品，Demo 只学习结构与节奏，画面、文字、地点、乐谱全部替换为原创或公有领域内容；不使用任何动画作品名称或画面。
- 参考视频中的动画截图与音乐属于各自权利人，本库不收录其帧画面。
- 底图使用 OpenFreeMap（OpenStreetMap 数据）与 AWS Terrain Tiles，必须保留署名；关西各镜头点位已逐级实测（建筑挤出、道路、水系、铁路、地名完整）。
- 程序化“照片”只用于示意；正式作品请在 config.js 填入有权使用的真实照片。
- 固定画幅：横屏 1920×1080、竖屏 1080×1920 两套构图，整体等比缩放；舞台字号按设计决定，不设下限；网站界面 ≥ 12px。
- 全片瓦片约 730 块 / 130MB（横屏），其中约 290 块 / 66MB 为“必需”；10Mbps 网络下会有 1–2 次数秒的缓冲暂停（实测见研究笔记）。

## 迁移

- `config.js → meta`：片名（竖排汉字 + 英文）、副标题、时区、总天数、时长与 BPM。
- `config.js → stops`：每个地点的英文名、日文 / 中文名、经纬度、海拔、最小显示缩放；路线端点会对齐到这里。
- `config.js → tracks.camera`：镜头关键帧：c 中心、z 缩放、p 俯仰、b 方位、f / fp 为地点在横 / 竖屏上的位置、zp 竖屏缩放差、e 缓动。长距离移动用一段 ease-out 一口气推近（快速推拉帧的瓦片会降级，缓冲更省）。
- `paths.js`：铁路与步行几何（经纬度数组）。可以从矢量瓦片的 transportation 图层（class = rail）提取，或用任何 GeoJSON 线。
- `config.js → tracks.*`：night / clock / day / dayCard / progress / routes / markers / locTitle / cards / counter / stamps / chapter / flashback / compare / toast / note / alert / outro 轨道，改时间即改节奏；画面与乐谱同时跟着变。
- `config.js → chapters / stepper`：章节标签、标题、强调色与装饰（frame 四角框线 / tape 斜纹胶带）；步进器四站与印章文字。
- `config.js → sound`：和弦、阳音阶与到站提示音；乐谱由 script.js 的 buildScore() 按轨道生成。
- `config.js → layout`：横 / 竖两套版式几何（规尺、步进器、印章、卡片区域、标签避让区、收尾统计区），舞台像素坐标。
- `config.js → palette / mapPalette / map`：纸色、墨色、夜色与强调色；底图逐图层的白天 / 夜晚配色；底图样式、MapLibre 版本、高程瓦片。
- `scenes.js`：仅在没有真实照片时使用；cards[].media 填图片路径即用真实照片。
- `script.js → BUF_CFG`：实时缓冲参数：开头门槛 gate、解析窗口 ahead、下载窗口 fetchAhead、内存预算 budgetMB、暂停 / 继续阈值 stall / resume。

[打开 Demo](../../demos/cases/map-pilgrimage/index.html) · [在库中查看](../../cases.html#case/map-pilgrimage)
