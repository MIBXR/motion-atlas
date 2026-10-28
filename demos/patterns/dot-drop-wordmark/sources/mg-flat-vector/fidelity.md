# 扁平矢量接入与保真说明

保留固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c` 的原作文件，仅改写资源路径并加载独立适配层，画面由原作 `window.renderAt(t)` 绘制。

## 原作文件

原目录 `demos/01-flat-vector/` 已提交的全部文件为 `index.html`、`audio.py`、`cues.json`，均按原相对路径复制。原作 MIT 许可见 [LICENSE](LICENSE)，字体与音轨来源见 [LICENSES.md](LICENSES.md)。

## 路径改写与入口

| 文件 | 原文 | 新文 |
| --- | --- | --- |
| `index.html` | `href="/assets/fonts/fonts.css"` | `href="fonts/fonts.css"` |
| `index.html` | `fetch('/demos/01-flat-vector/cues.json')` | `fetch('./cues.json')` |
| `fonts/fonts.css`，Resource Han Rounded 700 声明 | `url('/assets/fonts/cjk/resourcehanrounded/ResourceHanRoundedCN-Bold.ttf')` | `url('ResourceHanRoundedCN-Bold.ttf')` |
| `fonts/fonts.css`，Fredoka 声明 | `url('/assets/fonts/latin/fredoka/Fredoka-VF.ttf')` | `url('Fredoka[wdth,wght].ttf')` |

`fonts/fonts.css` 保留原作默认片用到的 Resource Han Rounded 700 与 Fredoka 两个 `@font-face` 块，仅改写 URL。完整 Fredoka 可变字体保留官方文件名 `Fredoka[wdth,wght].ttf`。

`index.html` 在原作脚本之后、`</body>` 之前新增：

```html
<script src="motion-kit.js"></script>
<script type="module" src="motion-adapter.js"></script>
```

## 适配层

`motion-adapter.js` 等待原作 `window.__ready === true` 后接入。尺寸、帧率与时长取 `window.DEMO`：1920×1080、30fps、10 秒。`MotionKit.timeline` 的 `render(t)` 返回原作 `window.renderAt(t)` 的 Promise，并使用 `MotionKit.expose`、`MotionKit.controls`、`MotionKit.start` 接入本库。

`MotionKit.stage` 固定原 SVG 的内部像素尺寸，仅通过根节点的 `translate` 与等比 `scale` 居中适配窗口，四周黑边；SVG 背景保留原作群青色。只提供 `landscape` 画幅。

markers 与条目节拍取 `cues.json` 的画面帧节点及 `build`、`drop`、`outro` 阶段，label 译成不超过八字的中文。`bldStagger` 与 `bldCount` 分别是错峰帧数与建筑数量，作为原作参数保留。

控制条支持播放、暂停、重播、拖动、中文倍速选择与声音开关。声音默认关闭，开启后播放 `audio/film.m4a`；seek、暂停与变速同步音轨，播放时校正超过 0.1 秒的偏移。浏览器阻止声音时回报待启用状态，在页面内点击或按键后继续。

音轨原始字节加载为 `audio/mp4` Blob，等待媒体元数据就绪后启动时间轴，以支持静态服务下的音轨 seek。

`?embed` 与 `?render` 隐藏控制条，`?render` 关闭自动播放与音轨；`?t=秒` 指定时刻。减少动态偏好下默认显示 9.5 秒并暂停，运行中启用该偏好会暂停。

## 预览时刻

`previewAt: 9.5`。此时 popwise、中文标语和英文标语均已入场，图形完成汇合，落版构图完整。

## 与原片对照

参考 MP4 用 ffmpeg 取帧，本页用 `scripts/shot.mjs` 在 1920×1080 定位截图，左右对照图保存在本批工作区 `compare/`。

| 时刻 | 逐张结论 |
| --- | --- |
| 1.0 秒 | 圆点、冲击环、地平线、背景图形与配色一致，边缘差异来自视频压缩。 |
| 3.0 秒 | 太阳、九栋建筑、云树与主角窗口的构图和位置一致。 |
| 5.0 秒 | 人物、手机、气泡、窗框与挂画的位置和形状一致。 |
| 7.5 秒 | 四象限图形、配色与标签字形、字重和位置一致。 |
| 9.5 秒 | 字标、中英文标语的字形、间距、基线及四色点一致。 |

浏览器验收使用 Edge，服务端口 4328。案例页和独立 Demo 自动播放；拖动可定位，`?t=5&autoplay=0` 停在 5 秒；声音默认关闭，开关与 1.5 倍速播放有效，播放中音轨与画面时刻差约 5ms，暂停和结束同步停止。
