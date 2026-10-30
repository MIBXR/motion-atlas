# video-shotcraft 使用说明

从[素材详情](../../materials.html#material/video-shotcraft)阅读工作流，再打开[主文档](../../demos/materials/video-shotcraft/SKILL.md)。主文档先要求判断三种模式：直接套用 Ink Press 模板、Agent 自主创作、与用户逐阶段共同创作，流程分别在 `template/TEMPLATE.md`、`references/pipeline.md`、`references/guided-free-creation.md`。

只借一个镜头时，在 `references/shots/` 找配方卡，按卡上“参考实现”打开 `demos/` 下对应的 Remotion 组件；卡名与样式名以 `gallery/api/library.json` 为准。配方卡给语义和参数表，组件里是调校过的缓动与时值。声音从 `assets/audio/` 取，类别与找音路径见 `references/sound-design.md`，逐文件来源见 `assets/audio/ATTRIBUTION.md`。素材详情的画廊按类别列出全部 214 个镜头样式的作者预览，标题即配方卡名，可据此在 references/shots/ 找到对应卡片。

Ink Press 模板在本库有可运行的复刻案例 [Ink Press 纸墨宣传片](../../cases.html#case/ink-press)，拖到任一镜头即可对照 `template/src/` 的场景源码。快照不含上游的浏览器后期工作台 `workbench/`，主文档交付收尾一节用到它时，从上游仓库取得。独立取得全部原文的方法见[Agent 取材说明](../agent.md)。
