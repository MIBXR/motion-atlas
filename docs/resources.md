# 外部资源

资源库收录外部仓库的内容，原样保存在 `resources/`，不改写、不翻译。每个目录下的 `UPSTREAM.json` 记录上游地址、提交、收录日期、许可与逐文件 SHA256；`node scripts/check.mjs` 会核对文件与清单一致。

| 目录 | 上游 | 内容 | 许可 |
| --- | --- | --- | --- |
| `resources/opus-videos/` | [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | 703 条 Claude Opus 5.5 视频的提示词，附原帖与复刻链接 | 列表 MIT；视频与提示词归各作者 |
| `resources/skills/garden-skills/` | [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills) | 6 个 Skill，含用代码做短片的 motion-showreel 与网页视频演示 web-video-presentation（未收录上游宣传站点 `website/`） | MIT |
| `resources/skills/agent-anime-skill/` | [waterpro/agent-anime-skill](https://github.com/waterpro/agent-anime-skill) | ai-handdrawn-video：AI 手书 / PV 的分阶段制作流程 | 未声明许可；上游注明仅供个人娱乐、请勿商业用途 |

## 更新

用上游的新克隆重新收录（会清空目标目录后重写）：

```
node scripts/vendor-resources.mjs opus-videos <克隆目录> --commit <sha>
node scripts/vendor-resources.mjs garden-skills <克隆目录> --commit <sha>
node scripts/vendor-resources.mjs agent-anime-skill <克隆目录> --commit <sha>
```

然后运行 `node scripts/build.mjs` 与 `node scripts/check.mjs`。

## 署名

视频与提示词的版权属于各自作者，资源库在每条详情页标明作者与原帖。若作者希望修改或移除条目，请到上游仓库提出。
