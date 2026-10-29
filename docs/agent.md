# Agent 取材说明

这份说明面向从本库取得参考资料的 Agent；修改仓库时阅读 [AGENTS.md](../AGENTS.md)。

## 检索与读取

从 `agent/catalog.json` 取得三类摘要、协议与单类索引地址，或运行：

```bash
node scripts/atlas.mjs search "<关键词>" --json
```

使用 `--kind cases|patterns|materials`、`--carrier video|console`、`--type <巧思类型>` 缩小范围。各类索引是 `agent/cases/index.json`、`agent/patterns/index.json`、`agent/materials/index.json`。

| 资料包 | 内容 |
| --- | --- |
| `agent/cases/<id>.json` | 完整 `entry`、Prompt、单条研究与复刻／许可文档、入口和文件清单 |
| `agent/patterns/<id>.json` | 完整 `pattern`、`sourceCases`、Prompt、文档、入口和文件清单 |
| `agent/materials/<id>.json` | 完整 `material`、使用说明、快照主文档与附属 Markdown、入口和文件清单 |

`files[]` 提供仓库相对路径和字节数。读取 `entrypoint` 打开 Demo 或快照主文档；`documents` 提供可直接阅读的原文，`research`、`fidelity`、`licenses` 在对应文件存在时提供。

## 组合与导出

依据巧思的职责、搭配与冲突选择组合，数值和机制以条目为准，组织整体时间结构的方法见[Prompt 写法](prompting.md#五组合巧思)。

```bash
node scripts/atlas.mjs show <id> --source
node scripts/atlas.mjs export <id> --out <目录>
```

导出保留仓库相对树与全部文件，巧思带上来源案例。导出根目录的 `README.md` 提供入口，`entry.json` 保存条目；有 Prompt 时另附 `PROMPT.md`。素材使用说明和原文快照随文件清单取得。

逐帧视频与声音导出见[渲染管线](pipeline.md#九逐帧渲染成视频)，素材阅读入口见[素材总览](materials/README.md)。
