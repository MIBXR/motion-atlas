# 像素冒险复刻说明

保留固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c` 的原作画面代码、时刻表与素材，仅改写引用路径并接入 Motion Atlas 播放适配层。

## 原作文件

`audio.py`、`cues.json`、`film.js`、`index.html` 按原相对路径复制；字体为官方完整原始文件；配乐从原片无损抽取。

## 路径改写

| 文件 | 原文 | 新文 |
| --- | --- | --- |
| `index.html` | `href="/assets/fonts/fonts.css"` | `href="fonts/fonts.css"` |
| `index.html` | `import('/demos/20-pixel/film.js')` | `import('./film.js')` |
| `film.js` | `fetch('/demos/20-pixel/cues.json')` | `fetch('./cues.json')` |
| `fonts/fonts.css`，Fusion Pixel 12 块 | `url('/assets/fonts/cjk/fusionpixel/fusion-pixel-12px-proportional-zh_hans.ttf')` | `url('fusion-pixel-12px-proportional-zh_hans.ttf')` |
| `fonts/fonts.css`，Press Start 2P 块 | `url('/assets/fonts/latin/pressstart2p/PressStart2P-Regular.ttf')` | `url('PressStart2P-Regular.ttf')` |

`fonts/fonts.css` 只保留原作使用的两个 `@font-face` 块，其余声明照抄参考仓库 `assets/fonts/fonts.css`。

## 入口接入

`index.html` 在原有 `window.__ready = true;` 后新增 `await import('./motion-adapter.js');`，原作初始化顺序与绘制函数保持不变。

## 适配层

- 通过 `MotionKit.timeline` 调用原作 `window.renderAt(t)` 并返回原 Promise；时长、尺寸、帧率读取 `window.DEMO`。
- 通过 `MotionKit.stage` 固定原作 1920×1080 画布，只提供横屏；舞台根节点以 CSS `translate + scale` 等比缩放居中，窗口其余部分为黑色，原 Canvas 内部像素保持不变。
- 通过 `MotionKit.expose`、`MotionKit.controls`、`MotionKit.start` 接入自动播放、暂停、拖动、`?embed`、`?render`、`?t=秒` 与减少动态偏好；控制条和速度选项使用中文。
- 时间轴标记读取 `cues.json` 的事件节点与调色板节点，名称译成不超过八字的中文。
- 声音默认关闭，开启后播放 `audio/film.m4a`；播放、暂停、跳转、结束与变速均同步音轨，播放中偏差超过 80 毫秒时重新对齐。
- 音轨先读取为 `audio/mp4` 类型的 Blob，再交给 Audio 并等待元数据加载，支持静态服务下的时间定位。
- 减少动态偏好下显示 9.5 秒落版并暂停；偏好在播放中开启时暂停。

## 预览时刻

`previewAt` 为 9.5 秒：片名、中文副标题和开始提示已经出现，主角举起水晶，开箱后的夜景与光池构图完整。

## 与原片对照

参考 MP4 用 ffmpeg 取帧，本页用 `scripts/shot.mjs` 在 1920×1080 定位截图，左右对照图保存在本批工作区 `compare/`。

| 时刻 | 逐张结论 |
| --- | --- |
| 1.0 秒 | 分数、金币数量、主角、瀑布、山林、桥与色板一致。 |
| 3.0 秒 | 主角过桥位置、三枚金币、宝箱、瀑布与分数一致。 |
| 5.0 秒 | 夕阳、对话框、宝箱与主角位置一致；「欢迎来」笔画略粗（见下）。 |
| 7.5 秒 | 英文片名、开箱光芒、金币、水晶与主角姿态一致。 |
| 9.5 秒 | 夜景、片名、水晶光池与开始提示一致；「像素冒险」笔画略粗（见下）。 |

字体为 Fusion Pixel 2026.10.25 官方发布的完整文件；它与原片发布前的 2026.09.25 版字形完全相同。中文笔画比原片多出约 10% 像素（「欢迎来」133→157），来自系统文字栅格化：原片在 macOS 渲染，同一字体在 Windows 上笔画更粗。

浏览器验收使用 Edge，服务端口 4328。案例页和独立 Demo 自动播放；拖动可定位，`?t=5&autoplay=0` 停在 5 秒；声音默认关闭，开关与 1.5 倍速播放有效，播放中音轨与画面时刻差约 5ms，播放中暂停后音画时刻一致。
