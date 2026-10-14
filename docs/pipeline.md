# 渲染管线：render(t) 协议

本库所有时间驱动的 Demo 都遵守同一个约定：**画面是时间的纯函数**。同一份代码可以实时播放、被站点刻度条拖动、被脚本逐帧渲染成视频，结果完全一致。

## 一、约定

1. 把画面写成 `render(t)`：给定时刻 `t`（秒），把 DOM / Canvas / SVG 设置成那一刻的样子。**不要**在 render 里读 `Date.now()`、`performance.now()` 或累加状态。
2. 随机数用 `MotionKit.rng(seed)` 生成，并在 render 内按 `t` 派生（例如 `rng(seed + Math.floor(t * 24))`），保证同一时刻结果一致。
3. 用 `MotionKit.timeline({ duration, render, markers })` 包装，再 `MotionKit.expose(tl)` 暴露为 `window.__motion`。
4. 需要异步资源（地图瓦片、字体、图片）时，render 可以返回 Promise；`seek(t)` 会等待它完成。

```js
const tl = MotionKit.timeline({
  duration: 24,
  markers: [{ t: 0, label: '开场' }, { t: 6, label: '转场' }],
  render(t) {
    const p = MotionKit.seg(t, 0.5, 0.6, MotionKit.ease.emphasized);
    title.style.transform = `translateY(${(1 - p) * 40}px)`;
    title.style.opacity = p;
  },
});
MotionKit.expose(tl);
MotionKit.controls(tl);           // 控制条（?embed / ?render 时自动不创建）
const q = MotionKit.params();
if (q.t != null) tl.seek(q.t); else if (q.autoplay) tl.play();
```

## 二、`window.__motion`

| 成员 | 说明 |
| --- | --- |
| `duration` | 总时长（秒），运行时可修改（例如改 BPM 后重算） |
| `markers` | `[{ t, label }]`，站点刻度条显示为节拍点，控制条 Shift+←/→ 在它们之间跳转 |
| `seek(t)` | 跳到 `t` 并渲染，返回 Promise |
| `play()` / `pause()` / `toggle()` | 播放控制 |
| `on(fn)` | 订阅每次渲染：`fn(t, playing)`，返回取消函数 |
| `time` / `playing` | 只读状态 |

## 三、URL 参数

| 参数 | 作用 |
| --- | --- |
| `?embed` | 站点内嵌：隐藏 Demo 自带的控制条 |
| `?render` | 逐帧渲染：不自动播放；地图等异步 Demo 在 seek 时等待资源空闲 |
| `?t=12.5` | 打开时定位到 12.5 秒 |
| `?autoplay=0` | 不自动播放 |

## 四、可交互 Demo 的双时钟

操作台类 Demo（档案终端、工业协议、任务指挥台）既要能被操作，又要能被录制。做法：

- 界面状态由**事件列表**推导：`state = derive(events.filter(e => e.t <= t))`。
- 自动驾驶：预设一份事件表，时间轴播放时按 `t` 取事件，演示完整流程。
- 用户一旦有真实输入，切换到**实时时钟**，把输入作为新事件追加；外部 `seek` / `play` 时回到自动驾驶。

这样逐帧渲染得到的永远是那份预设演示，而用户在页面上可以随意操作。

## 五、逐帧渲染成视频

`scripts/render.mjs` 用本机的 Edge 或 Chrome（无头模式，通过 DevTools 协议控制，无需安装依赖）打开 Demo，按帧率逐帧 `seek` 并截图：

```bash
node scripts/render.mjs demos/cases/beat-lyric/index.html --fps 30
```

| 选项 | 默认 | 说明 |
| --- | --- | --- |
| `--fps` | 30 | 帧率 |
| `--w` / `--h` | 1920 / 1080 | 画面尺寸 |
| `--from` / `--to` | 0 / duration | 渲染区间（秒） |
| `--out` | `renders/<demo名>` | 输出目录：`frame-00001.png` … |
| `--format` | png | `png` 或 `jpeg` |
| `--port` | 4321 | 传入相对路径时，脚本会自动在该端口起本地服务器 |
| `--no-encode` | | 不调用 ffmpeg |

如果 `ffmpeg` 在 PATH 上，渲染结束后自动合成 `<out>.mp4`（H.264、yuv420p、CRF 18）。没有 ffmpeg 时，可以把帧序列导入任何剪辑软件，或稍后手动运行：

```bash
ffmpeg -framerate 30 -i renders/beat-lyric/frame-%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 beat-lyric.mp4
```

### 声音

Demo 内的声音由 WebAudio 实时合成，默认关闭，逐帧渲染**不会**录到声音。出片时建议：用 Demo 的节拍表（`entry.rhythm.beats` 或 `config.js`）在剪辑软件里对齐真正的音乐与音效；或用实验室导出的 BPM 与拍点作为配乐的节拍网格。

### 性能提示

- 1920×1080、30fps、30 秒约 900 帧，PNG 序列约 1–2GB；用 `--format jpeg` 可显著减小体积。
- 地图类 Demo 每帧需要等瓦片空闲，渲染较慢；先用 `--fps 12` 预览节奏，再出正式版本。
- 渲染时页面不会播放，所以“播放中才出现”的效果（例如运动模糊残影）需要在 render(t) 里用 `t` 计算，而不是依赖上一帧。

## 六、MotionKit 速查

| 函数 | 用途 |
| --- | --- |
| `clamp / lerp / invLerp` | 基础插值 |
| `bezier(x1, y1, x2, y2)` | CSS cubic-bezier 的 JS 实现 |
| `ease.*` | 常用缓动与命名 Token（snap、glide、emphasized、exit、anticipate） |
| `seg(t, start, dur, ease)` | 片段进度 0→1 |
| `env(t, a, b, inDur, outDur)` | 入—停—出包络 |
| `keyframes(frames, t)` | 多值关键帧插值 |
| `rng(seed)` | 可复现随机数 |
| `typeText / scramble / count / pad` | 打字、解码、数字滚动、补零 |
| `beats(bpm, offset)` | 拍点：`at`、`beatOf`、`pulse`、`quantize` |
| `timeline / expose / controls / params` | 时间轴、协议暴露、控制条、URL 参数 |
| `sound()` | 可选合成音效：`tone`、`noise`，需用户开启 |
| `tween / follow` | 非时间轴场景的补间与临界阻尼跟随 |

完整注释见 `kit/motion-kit.js`。各 Demo 文件夹内的 `motion-kit.js` 是构建时同步的副本，改动请只改 `kit/` 下的源文件。
