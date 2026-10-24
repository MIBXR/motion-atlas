# 用本机 Codex CLI 作为子任务执行者

> 内部工作文档。做法已提升为全局配置，所有 Claude 会话通用；本文件只记录与本仓库相关的约定。

- 全局规则：`~/.claude/CLAUDE.md`（“Codex CLI 作为执行者”一节）。
- 完整做法：`~/.claude/skills/codex-worker/SKILL.md`；派发脚本 `~/.claude/skills/codex-worker/scripts/codex-run.mjs`。
- 子 Agent 类型：`codex-worker`（`~/.claude/agents/codex-worker.md`），负责写任务说明、派发、验收、返工。

## 本仓库的约定

- 任务说明放 `dev/shots/<任务>/codex-task.md`，Codex 的日志、最终答复与 `session.txt` 也在同一目录（已被 git 忽略）。
- 交付报告写 `dev/reports/<任务>.md`（入库）。
- 说明里必须引用 `dev/polish-round-1.md` 第二节的全局约定（固定画幅、舞台字号下限、对齐与遮挡、声音、预加载），以及 `docs/pipeline.md` 的舞台／声音／预加载 API。
- 只改任务范围内的文件；kit/、scripts/、站点页面只在明确授权时改；不 commit、不 push、不切分支（主任务审核后提交）。
- 验收命令：`node scripts/smoke.mjs --only <id> --strict-fonts`、`node scripts/shot.mjs <url> --orient landscape|portrait --t …`、`node scripts/render.mjs <demo> --orient … --audio`、`node scripts/capture.mjs --only <id>`、`node scripts/build.mjs`、`node scripts/check.mjs`。
