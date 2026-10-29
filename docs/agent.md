# Agent 取材说明

这份文件写给把本库当作参考资料使用的 Agent。修改本仓库的规则见根目录 `AGENTS.md`。

本库收录以时间线为载体的作品：作品掌握节奏，按时间线播放；即使可以交互，也是在时间线上分支。网站与网页应用，包括其中的页面动效和微交互，不在本库范围内。

## 用本库做参考

1. **检索**：读 `agent/catalog.json`（摘要、标签、关联与资料包路径），或运行
   `node scripts/atlas.mjs search "<关键词>" --json`。可用 `--kind cases|patterns|materials`、`--carrier video|console`、`--type <巧思类型>` 缩小范围。
2. **读取**：打开 `agent/cases/<id>.json` 或 `agent/patterns/<id>.json`。资料包里有完整条目（`entry` / `pattern`）、Prompt 文档（`documents.prompt`）、入口（`entrypoint`）与文件清单（`files[]`，含路径和字节数）。
3. **素材**：读 `agent/materials.json` 获取素材摘要与资料包路径，再打开 `agent/materials/<id>.json`。素材库收录用于制作视频的 skill 与工具；资料包包含完整条目（`material`）、工作流、文档原文（`documents`）及文件清单。选用前读工作流、适用边界、原文与许可；`agent-skills/<id>/` 是固定提交的原样快照，效果图是作者产出，未复刻。
4. **组合**：巧思的 `composition.role` 为 `foundation`（骨架，一个作品通常只有一个）、`support`（支撑）、`accent`（点睛，同一时刻不超过两个）。检查 `pairsWellWith` 与 `conflicts`。
5. **导出**：`node scripts/atlas.mjs export <id> --out <目录>` 保留仓库相对树，入口见导出目录的 `README.md`；巧思连同来源案例导出，并附 `PROMPT.md` 与 `entry.json`。
6. **出片**：时间驱动的 Demo 暴露 `window.__motion`；`node scripts/render.mjs <入口> --fps 30` 逐帧渲染。

