# Motion Atlas 维护

- 修改内容前阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。新增目录、条目或内容类型前，先确认符合其中的三类组织规范；收录、字段、新增流程与验收规则以该文件为准。
- 内容源为 `entries/`、`demos/`、`docs/`。修改共享运行时只改 `kit/motion-kit.js`；Demo 内的副本由构建同步。
- `prompts/`、`agent/`、`data/`、`previews/` 中截图以外的生成文件、`docs/cases/README.md` 和 README 计数块由构建生成，不手改。预览截图使用 `scripts/capture.mjs`。
- 内容更新后运行 `node scripts/build.mjs`。需要更新预览时，先运行 `node scripts/serve.mjs`，再运行 `node scripts/capture.mjs --only <id>`，随后重新构建。
- 按 [CONTRIBUTING 的验收与交付要求](CONTRIBUTING.md#验收与交付)完成当前任务授权的检查。提交最终交付与长期维护文件；过程产物留在工作区。
