# 线条艺术接入与保真说明

复刻以公开成片为准，保留 `mg-styles-15` 固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c` 默认版本的连续路径、画面数值、时刻表、素材、字体与原片音轨。

## 相对原作的删改

| 文件 | 删改内容 | 原因 |
| --- | --- | --- |
| `film/film.js` | 删除 `V5`、`NOLINK`、`linkAt`、`TT`、`TITLE`、独占字形载入、标题轮廓与笔尖绘制函数；保留默认 10 秒时长、末段推镜 clamp 上限 1、3px 线宽及原有调用顺序。 | 另一版剪辑分支 |
| `film/film.js` | 删除另一 reel 使用的 `?lw` 参数；保留 `?t` 定位及默认 3px 线宽。 | 另一版剪辑分支 |
| `tools/retime.py`、`tools/dump_timing.mjs`、`film/film.js` 的 `window.__timing` | 删除重排时刻与导出路径速度、转角数据的开发工具；页面绘制继续读取现有 `film/cues.json`。 | 开发工具 |
| `out/timing.json` | 删除路径时序的中间导出文件，成片播放使用现有 `audio/film.m4a`。 | 过程文件 |
| `index.html` | 字体表改为 `fonts/fonts.css`，原作模块改为 `./film/film.js`，加载 `motion-kit.js` 后调用 `MotionKit.mountFilm`。 | 路径改写 |
| `film/film.js` | 时刻表改为 `./film/cues.json`，颗粒改为 `assets/textures/grain/grain_fine_2048.png`。 | 路径改写 |
| `fonts/fonts.css` | 保留 Cormorant Garamond 与 Noto Serif SC 的原作声明，分别使用同目录官方完整文件 `CormorantGaramond[wght].ttf`、`NotoSerifSC-VF.ttf`。 | 路径改写 |
| `audio.py` → `source/audio.py` | 配乐制作脚本原样保存，内部路径保持原文，播放使用原片无损抽取音轨。 | 移至 source |

v5 分支属于另一版剪辑，已删除。

## 适配层说明

`index.html` 中的 `MotionKit.mountFilm` 等待原作模块初始化结束、`window.__ready = true` 后接管。尺寸、时长、帧率读取 `window.DEMO`：1920×1080、10 秒、30fps。`MotionKit.timeline` 的 `render(t)` 直接调用并返回 `window.renderAt(t)` 的 Promise，使用 `MotionKit.expose`、`MotionKit.controls` 与 `MotionKit.start` 接入站点。

原作 Canvas 保持 1920×1080 内部像素，`MotionKit.stage` 对根 Canvas 作 `translate() scale()`，在窗口中等比缩放居中，四周黑边；仅提供横屏。控制条使用中文名称与速度选择。支持 `?embed`、`?render`、`?t=秒`；减少动态时默认显示 9.75 秒并暂停，运行中启用减少动态会暂停。节点取自原作 `film/cues.json` 的全部连续描绘节点、卷须形变、填面、往返光脉、海报拉远、字标、标语与细线签章，标签译成中文。

声音默认关闭，开启后播放从参考视频无损抽取的 `audio/film.m4a`；播放、暂停、跳转、变速跟随时间轴，播放中以 80ms 阈值校正音轨偏移。浏览器阻止自动发声时等待页面内手势恢复。`?render` 禁止声音。

音轨先以完整原始字节加载为 `audio/mp4` Blob，再交给 Audio，并在元数据就绪后启动时间轴，使静态服务下的音轨跳转可用。

`previewAt` 取 9.75 秒：7.8–9.0 秒海报拉远已经完成，字标与标语完成入场，9.25–9.6 秒两侧细线签章已画完；徽章、天际线与完整文字同时保留，金属扫光与轻微推镜继续。

## 已接受差异

原作 `film/film.js` 设置 30fps、`motionBlur.samples: 4`、`shutter: 0.5`，即半帧曝光约 16.67ms；`harness/render.mjs` 按每帧四个子帧平均产生运动模糊。页面实时播放与 `?render` 单帧均直接调用原 `renderAt(t)`，没有该外部运动模糊。

## 与原片对照结果

参考 MP4 用 ffmpeg 取帧，本页用 `scripts/shot.mjs` 在 1920×1080 定位截图；左侧原片、右侧复刻的拼图保存在本批工作区 `compare/mg-line-art/compare-{1,3,5,7.5,9.5}.png`。

| 时刻 | 逐张结论 |
| --- | --- |
| 1.0 秒 | 种子、茎叶、底色与元素位置一致。 |
| 3.0 秒 | 屋梁、笔尖与植物位置一致；原片运动笔尖边缘稍柔。 |
| 5.0 秒 | 天际建筑、路径与颜色一致；原片运动笔尖边缘稍柔。 |
| 7.5 秒 | 圆环拱门与天际构图一致；原片镜头运动使城市和叶片出现重影，对应原作四子帧、`shutter: 0.5` 的外部运动模糊。 |
| 9.5 秒 | 金章、字标、中文、城市线条位置与字形一致；运动边缘有轻微差异。 |

浏览器验收使用 Edge，服务端口 4331。案例页自动播放，拖动停在 4.9429 秒；独立 Demo 的 `?t=5&autoplay=0` 精确停在 5 秒，声音默认关闭。声音开关与 1.5 倍速播放有效；播放绘制帧抽样音轨为 0.622156 秒、时间轴为 0.70155 秒，相差约 79.4ms，低于适配层 80ms 的偏移校正阈值。暂停样本中音轨与时间轴均为 0.2751 秒并同步停止。
