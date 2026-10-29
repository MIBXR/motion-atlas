# Motion Atlas 维护

## 在本仓库里修改

- **唯一内容源是 `entries/`**。`data/`、`prompts/`、`agent/` 与 README 计数块由 `node scripts/build.mjs` 生成，不要手改。
- **共享运行时只改 `kit/motion-kit.js`**。Demo 内的 `motion-kit.js` 是构建时同步的副本。
- 接入二选一：画面只取决于时刻 t 的作品提供 `renderAt(t)` 与时长、尺寸，调用 `MotionKit.mountFilm`；有自己时钟、状态或交互的作品自己接 MotionKit 并提供 `window.__motion`。
- 时间驱动的 Demo 必须遵守 render(t) 协议：画面只依赖 `t`；随机数用 `MotionKit.rng(seed)` 并按 `t` 派生；异步资源让 render 返回 Promise。见 `docs/pipeline.md`。
- 可交互 Demo 用“事件列表推导状态 + 自动驾驶时间轴”：真实输入切到实时时钟，外部 seek/play 回到自动驾驶。
- 普通网页文字最终渲染字号 ≥ 12px；案例、巧思、嵌入 Demo 和画面内文字按设计需要决定字号。功能图标用内联 SVG；遵守 `prefers-reduced-motion`；声音默认关闭。
- 第三方画面、字体、音乐与库附许可证后可以提交，出处写进案例的 `LICENSES.md`；库按固定版本放进案例的 `vendor/<库>@<版本>/`。参考视频的取帧结果不提交（`frames/`、`renders/` 已被忽略）。素材库的原文快照与作者效果图须注明固定来源与许可，并标注未复刻。

## 维护方式

本库以视觉样例展示为主，效果按实际页面体验判断。未经用户明确同意，不新增测试、自动验收或检查脚本，也不新增哈希字段、摘要清单或比对逻辑。

更新内容后生成资料：

```bash
node scripts/build.mjs
```

需要更新预览图时，运行 `node scripts/capture.mjs --only <id>`（需先启动 `node scripts/serve.mjs`）；单张截图使用 `node scripts/shot.mjs <url> --t <秒>`。
