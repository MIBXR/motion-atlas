# 地图巡礼 · 游戏过场式旅行影像 · 复用 Prompt

由 [结构化条目](../../entries/cases/map-pilgrimage.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/map-pilgrimage.md)。

## 实现 Prompt

用 HTML/CSS/JS 制作一支 50–60 秒、可逐帧定位的“地图巡礼”影像（1920×1080，同时适配窄屏）。结构：①世界层：MapLibre + OpenFreeMap positron 底图，隐藏全部文字标注，增加 3D 建筑；镜头用关键帧 {t, center, zoom, pitch, bearing} 缓入缓出，长距离移动中途降低缩放形成弧线飞行；开场用地球投影。②昼夜：按图层类别（背景/水/绿地/道路/建筑/3D 建筑）逐个插值白天与夜晚配色，过渡约 1 秒、中途经过灰阶，不要整体反色。③路线：航线虚线、地面实线（白色描边+强调色）、错误路线红线，放进 GL 图层绘制，按进度截断并带头部圆点。④HUD 四角常驻：左上“DAY 01 / 03”与等宽日期，右上纬经度、ELEV·Z 缩放与大号时钟+时区角标，右侧胶囊计数徽章（变化时数字上滚+回弹），左下 NOW PLAYING + 双语歌词（打字），右下旅程步进器与收集托盘；顶部细线随旅程进度填充强调色。⑤事件：竖排粗黑汉字逐字模糊入场（500ms，字间 140ms）+ 英文带模糊前沿打字；照片卡片 550ms 浮入并用虚线连到地图标记；卡片 600ms 展开为全屏实景、HUD 保留并加上下压暗层；章节主题出现时替换强调色并描出屏幕四角框线；全屏插画回忆带独立框线、档案标签、竖排字幕逐字；分屏对比先实景全屏、分割线 700ms 从左滑至中线露出旧明信片，倾斜描边时间戳以回弹盖章；红色警示横幅从左擦入 + 黑色 REROUTING 胶囊；大号日序 DAY 描边 + 数字实心滚入；结尾统计逐行计数堆叠 + 衬线 fin.。⑥节奏：每 4–6 秒一个事件，每 10–15 秒一次地图↔全屏切换，高光前后留 1–2 秒地图呼吸。⑦工程：画面写成 render(t) 纯函数，所有时间写进一个 config 轨道对象；暴露 window.__motion = {duration, seek(t)→Promise, play, pause, on}；?render=1 时 seek 等待地图 idle；颗粒按时间选帧以便复现；声音默认关闭；prefers-reduced-motion 时不自动播放并停在一帧完整构图；离线退回网格底图。所有文字 ≥12px。

## 视频生成 Prompt

1920×1080 travel cutscene in the style of a video-game map interface, 55 seconds. A pale paper-colored 3D map (light warm grey land, blue-grey water, white roads, extruded white buildings) is the persistent world; the camera glides along a route with slow ease-in-out moves and gentle pitch. Fixed HUD in four corners: top-left 'DAY 01 / 03' with a small date in monospace, top-right latitude/longitude, 'ELEV 7 M · Z 11.2' and a large digital clock with 'CST' superscript, bottom-left 'NOW PLAYING' with an equalizer icon and bilingual lyric lines, bottom-right a 4-stop journey progress stepper. Beats: dark night globe → brightness flips to day through grey → giant vertical Chinese title characters blur in one by one with an English title typing in → a dashed flight arc draws across the map → arrival: a vertical Chinese place name blurs in, a photo card floats in on the right with a thin dashed leader line to the map pin → the card expands to full screen while the HUD stays on top → a chapter tag appears and an accent-colored frame draws around the screen edges with square corner caps → an anime-style flashback with its own frame and vertical subtitles revealing character by character → split-screen comparison: a divider slides from the left edge to center revealing an old sepia postcard against a modern photo, a tilted outlined timestamp stamps down → night falls on the map layer by layer → a red 'WRONG TRAIN' banner wipes in, the wrong route turns red and ends with an X → ends with stacked statistics counting up and a serif 'fin.'. Clean, restrained, game-UI precision, subtle film grain, no camera shake.

## 负向约束

不要整体反色做夜景；不要让多个全屏模式叠在一起；不要把 HUD 做成满屏发光科幻风；不要用卡通贴纸替代信息层；不要在高缩放时保留地图文字标注抢走注意力；不要让镜头连续快速甩动；不要使用无授权的照片、动画截图与音乐。

## 动效 Token

- **blur-in 逐字**：500ms outCubic，字间 140–160ms，模糊 14px → 0，上移 10px → 0
- **type-in 打字**：按字符推进，前沿 2 个字符带 6px 模糊
- **card-in**：550ms outCubic：透明 0→1、上移 26px→0、缩放 0.965→1
- **card-expand**：600ms inOutCubic 展开，停 3s，550ms 收回；停留期 Ken Burns 1→1.07
- **day-night**：约 0.9–1.2s，逐图层插值；中间经过灰阶
- **frame-draw**：800ms inOutCubic 描边；四角方块 120ms 错峰回弹
- **stamp**：380ms outBack，缩放 1.45→1，旋转 -4°
- **stat-stack**：每行 320ms 错峰，计数 900ms outQuart

## 制作约束

- 参考视频为 B 站公开作品，Demo 只学习结构与节奏，画面、文字、地点与音乐全部替换为原创或公有领域内容。
- 参考视频中的动画截图与音乐属于各自权利人，本库不收录其帧画面。
- 底图使用 OpenFreeMap（OpenStreetMap 数据），必须保留署名；高缩放下的 3D 建筑依赖 render_height 数据，各城市覆盖不同。
- 程序化“照片”只用于示意；正式作品请在 config.js 填入有权使用的真实照片。
- 所有文字最终字号 ≥ 12px；成片 1920×1080 下的 HUD 小字为 12px，缩放预览时属于视频画面。

## 迁移

- `config.js → meta`：片名（竖排汉字 + 英文）、副标题、时区、总天数、总时长。
- `config.js → stops`：每个地点的名称、代码、汉字、经纬度、海拔、默认场景；填 media 即用真实照片。
- `config.js → tracks.camera`：镜头关键帧；长距离移动在中途加一个低缩放关键帧，形成“飞越”。
- `config.js → tracks.*`：night / clock / day / routes / cards / chapter / flashback / compare / alert / outro 等轨道，改时间即改节奏。
- `config.js → chapters`：每个主题的标签、标题、强调色；会同步到路线、卡片描边与四角框线。
- `config.js → palette / map`：纸色、墨色、夜色与默认强调色；底图样式与 MapLibre 版本。
- `scenes.js`：仅在没有真实照片时使用，可删除；或按示例增加新的程序化场景。

[打开 Demo](../../demos/cases/map-pilgrimage/index.html) · [在库中查看](../../cases.html#case/map-pilgrimage)
