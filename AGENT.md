# AGENT.md · 给编码 Agent 的说明

这份文件写给在本仓库里工作、或把本库当作参考资料使用的 Agent。

## 用本库做参考

1. **检索**：读 `agent/catalog.json`（摘要、标签、关联、资料包路径与哈希），或运行
   `node scripts/atlas.mjs search "<关键词>" --json`。可用 `--kind cases|patterns`、`--carrier video|console|showcase`、`--type <巧思类型>` 缩小范围。
   `agent/catalog.json` 的 `resources` 字段列出资源库的视频提示词数据与 Skill 路径（外部收录，许可各异，使用前看对应 `UPSTREAM.json`）。
2. **读取**：打开 `agent/cases/<id>.json` 或 `agent/patterns/<id>.json`。资料包里有完整条目（`entry` / `pattern`）、Prompt 文档（`documents.prompt`）、研究笔记（`documents.research`）、入口（`entrypoint`）与文件清单（`files[]`，含 sha256）。`catalog.json` 的 `bundleSha256` 变化即代表资料包内容变化。
3. **注意证据等级**：`observed` 可以当作实测数值使用；`inferred` 是推断，复刻原作时必须提示用户核验；`original` 是本库原创。
4. **组合**：巧思的 `composition.role` 为 `foundation`（骨架，一个作品通常只有一个）、`support`（支撑）、`accent`（点睛，同一时刻不超过两个）。检查 `pairsWellWith` 与 `conflicts`。
5. **导出**：`node scripts/atlas.mjs export <id> --out <目录>` 得到可运行 Demo、`PROMPT.md`、`README.md` 与 `entry.json`。迁移时只改 `config.js`（案例）或 `index.html` 顶部的 `CONFIG`（巧思）。
6. **出片**：时间驱动的 Demo 暴露 `window.__motion`；`node scripts/render.mjs <入口> --fps 30` 逐帧渲染。

## 在本仓库里修改

- **唯一内容源是 `entries/`**。`data/`、`prompts/`、`agent/` 与 README 计数块由 `node scripts/build.mjs` 生成，不要手改。
- **共享运行时只改 `kit/motion-kit.js`**。Demo 内的 `motion-kit.js` 是构建时同步的副本。
- 时间驱动的 Demo 必须遵守 render(t) 协议：画面只依赖 `t`；随机数用 `MotionKit.rng(seed)` 并按 `t` 派生；异步资源让 render 返回 Promise。见 `docs/pipeline.md`。
- 可交互 Demo 用“事件列表推导状态 + 自动驾驶时间轴”：真实输入切到实时时钟，外部 seek/play 回到自动驾驶。
- 所有可见文字 ≥ 12px（含 Canvas 与 SVG 缩放后的字号）；功能图标用内联 SVG，不用 Emoji 或字符图标；遵守 `prefers-reduced-motion`；声音默认关闭。
- 不提交任何第三方画面、角色、标志、音乐、字体文件或参考视频的取帧结果（`frames/`、`renders/` 已被忽略）。

## 提交前

```bash
node scripts/build.mjs
node scripts/check.mjs
node scripts/smoke.mjs        # 需要本机 Edge/Chrome
```

新增或修改了 Demo 画面时，再运行 `node scripts/capture.mjs --only <id>` 更新预览图（需先启动 `node scripts/serve.mjs`），并用 `node scripts/shot.mjs <url> --t <秒>` 在节拍表的关键时刻截图核对。
