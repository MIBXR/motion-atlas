# 几何包豪斯接入与保真说明

复刻保留 `mg-styles-15` 固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c` 的原作文件与原始画面计算，只改资源路径并新增 Motion Atlas 适配层。

## 原作文件与路径改写

原目录的全部四个已提交文件 `index.html`、`film.js`、`cues.json`、`audio.py` 按原相对路径复制；原作 `cues.json` 与 `audio.py` 内容不变。共享纹理保持原字节，字体从官方来源下载完整原始文件，许可见 [LICENSES.md](LICENSES.md)。

| 文件 | 原文 | 新文 |
| --- | --- | --- |
| `index.html` | `/assets/fonts/fonts.css` | `fonts/fonts.css` |
| `index.html` | `/demos/09-bauhaus/film.js` | `./film.js` |
| `film.js` | `const BASE = '/demos/09-bauhaus/';` | `const BASE = './';` |
| `film.js` | `/assets/textures/paper/Paper001_4K_color.jpg` | `shared/assets/textures/paper/Paper001_4K_color.jpg` |
| `film.js` | `/assets/textures/grain/grain_fine_2048.png` | `shared/assets/textures/grain/grain_fine_2048.png` |
| `fonts/fonts.css`，Noto Sans SC | `/assets/fonts/cjk/notosanssc/NotoSansSC-VF.ttf` | `NotoSansSC-VF.ttf` |
| `fonts/fonts.css`，Poppins 900 | `/assets/fonts/latin/poppins/Poppins-Black.ttf` | `Poppins-Black.ttf` |
| `fonts/fonts.css`，Poppins 600 | `/assets/fonts/latin/poppins/Poppins-SemiBold.ttf` | `Poppins-SemiBold.ttf` |

`index.html` 在 `</body>` 前新增 `<script src="motion-kit.js"></script>` 与 `<script type="module" src="motion-adapter.js"></script>`，原作模块入口仍然加载 `film.js`。

## 适配层

`motion-adapter.js` 等待原作模块初始化结束、`window.__ready = true` 后接管。尺寸、时长、帧率读取 `window.DEMO`：1920×1080、10 秒、30fps。`MotionKit.timeline` 的 `render(t)` 直接调用并返回 `window.renderAt(t)` 的 Promise，使用 `MotionKit.expose`、`MotionKit.controls` 与 `MotionKit.start` 接入站点。

原作 Canvas 保持 1920×1080 内部像素，`MotionKit.stage` 对根 Canvas 作 `translate() scale()`，在窗口中等比缩放居中，四周黑边；仅提供横屏。控制条使用中文名称与速度选择。支持 `?embed`、`?render`、`?t=秒`；减少动态时默认显示 9.75 秒并暂停，运行中启用减少动态会暂停。节点取自原作 `cues.json` 的网格起点、全部事件与四次级联波，标签译成中文。

声音默认关闭，开启后播放从参考视频无损抽取的 `audio/film.m4a`；播放、暂停、跳转、变速跟随时间轴，播放中以 80ms 阈值校正音轨偏移。浏览器阻止自动发声时等待页面内手势恢复。`?render` 禁止声音。

音轨先以完整原始字节加载为 `audio/mp4` Blob，再交给 Audio，并在元数据就绪后启动时间轴，使静态服务下的音轨跳转可用。

原作默认版本的字体为 Poppins 900、600 与 Noto Sans SC 700。原作 `?v5=1` 分支采用的 Alimama ShuHeiTi 不属于本片默认画面。

## 预览时刻与对照

`previewAt` 取 9.75 秒：原作 9.5 秒的套印锁定与随后两帧纸张位移均已结束，竖排 BAUHAUS、几何构成、小字和拍数完整保留。

参考 MP4 用 ffmpeg 取帧，本页用 `scripts/shot.mjs` 在 1920×1080 定位截图，左右对照图保存在本批工作区 `compare/`。

| 时刻 | 逐张结论 |
| --- | --- |
| 1.0 秒 | 网格、圆形、文字与构图一致；原片黑色横条右缘有拖影，本页边缘清晰。 |
| 3.0 秒 | 圆形、三角形、蓝块、横条、轴心与文字的位置、配色一致。 |
| 5.0 秒 | 圆形、三角形、半圆、竖条与网格的构图和颜色一致。 |
| 7.5 秒 | 三原色图形、黑底、双色标签与几何位置一致。 |
| 9.5 秒 | 竖排字标、中德文字形、几何构成与网格落点一致。 |

原作 `film.js` 设置 30fps、`motionBlur.samples: 8`、`shutter: 0.5`，即半帧曝光约 16.67ms；`harness/render.mjs` 按每帧八个子帧平均产生运动模糊。页面实时播放与 `?render` 单帧均直接调用原 `renderAt(t)`，没有该外部运动模糊。

浏览器验收使用 Edge，服务端口 4328。案例页和独立 Demo 自动播放；拖动可定位，`?t=5&autoplay=0` 停在 5 秒；声音默认关闭，开关与 1.5 倍速播放有效，播放中音轨与画面时刻差约 5ms，暂停同步停止。
