# AGENT.md · 给编码 Agent 的说明

这份文件写给在本仓库里工作、或把本库当作参考资料使用的 Agent。

本库收录以时间线为载体的作品：作品掌握节奏，按时间线播放；即使可以交互，也是在时间线上分支。网站与网页应用，包括其中的页面动效和微交互，不在本库范围内。

## 用本库做参考

1. **检索**：读 `agent/catalog.json`（摘要、标签、关联与资料包路径），或运行
   `node scripts/atlas.mjs search "<关键词>" --json`。可用 `--kind cases|patterns`、`--carrier video|console`、`--type <巧思类型>` 缩小范围。
2. **读取**：打开 `agent/cases/<id>.json` 或 `agent/patterns/<id>.json`。资料包里有完整条目（`entry` / `pattern`）、Prompt 文档（`documents.prompt`）、入口（`entrypoint`）与文件清单（`files[]`，含路径和字节数）。
3. **资源**：读 `agent/resources.json` 获取资源摘要与资料包路径，再打开 `agent/resources/<id>.json`。资源库收录用于制作视频的 skill 与工具；资料包包含完整条目（`resource`）、工作流、文档原文（`documents`）及文件清单。选用前读工作流、适用边界、原文与许可；`agent-skills/<id>/` 是固定提交的原样快照，效果图是作者产出，未复刻。
4. **组合**：巧思的 `composition.role` 为 `foundation`（骨架，一个作品通常只有一个）、`support`（支撑）、`accent`（点睛，同一时刻不超过两个）。检查 `pairsWellWith` 与 `conflicts`。
5. **导出**：`node scripts/atlas.mjs export <id> --out <目录>` 保留仓库相对树，入口见导出目录的 `README.md`；巧思连同来源案例导出，并附 `PROMPT.md` 与 `entry.json`。
6. **出片**：时间驱动的 Demo 暴露 `window.__motion`；`node scripts/render.mjs <入口> --fps 30` 逐帧渲染。

## 在本仓库里修改

- **唯一内容源是 `entries/`**。`data/`、`prompts/`、`agent/` 与 README 计数块由 `node scripts/build.mjs` 生成，不要手改。
- **共享运行时只改 `kit/motion-kit.js`**。Demo 内的 `motion-kit.js` 是构建时同步的副本。
- 接入二选一：画面只取决于时刻 t 的作品提供 `renderAt(t)` 与时长、尺寸，调用 `MotionKit.mountFilm`；有自己时钟、状态或交互的作品自己接 MotionKit 并提供 `window.__motion`。
- 时间驱动的 Demo 必须遵守 render(t) 协议：画面只依赖 `t`；随机数用 `MotionKit.rng(seed)` 并按 `t` 派生；异步资源让 render 返回 Promise。见 `docs/pipeline.md`。
- 可交互 Demo 用“事件列表推导状态 + 自动驾驶时间轴”：真实输入切到实时时钟，外部 seek/play 回到自动驾驶。
- 普通网页文字最终渲染字号 ≥ 12px；案例、巧思、嵌入 Demo 和画面内文字按设计需要决定字号。功能图标用内联 SVG；遵守 `prefers-reduced-motion`；声音默认关闭。
- 第三方画面、字体、音乐与库附许可证后可以提交，出处写进案例的 `LICENSES.md`；库按固定版本放进案例的 `vendor/<库>@<版本>/`。参考视频的取帧结果不提交（`frames/`、`renders/` 已被忽略）。资源库的原文快照与作者效果图须注明固定来源与许可，并标注未复刻。

## 维护方式

本库以视觉样例展示为主，效果按实际页面体验判断。未经用户明确同意，不新增测试、自动验收或检查脚本，也不新增哈希字段、摘要清单或比对逻辑。

更新内容后生成资料：

```bash
node scripts/build.mjs
```

需要更新预览图时，运行 `node scripts/capture.mjs --only <id>`（需先启动 `node scripts/serve.mjs`）；单张截图使用 `node scripts/shot.mjs <url> --t <秒>`。
