# 外部资源

资源库收录外部仓库的内容，原样保存在 `resources/`，不改写、不翻译。每个目录下的 `UPSTREAM.json` 记录上游地址、提交、收录日期、许可与逐文件 SHA256；`node scripts/check.mjs` 会核对文件与清单一致。

| 目录 | 上游 | 内容 | 许可 |
| --- | --- | --- | --- |
| `resources/opus-videos/` | [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | 703 条 Claude Opus 5.5 视频的提示词，附原帖与复刻链接 | 列表 MIT；视频与提示词归各作者 |
| `resources/lemo-opuscar/` | [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 59 种代码片风格：风格规范、样片说明、样片源码与素材；24 个样片可在站内逐帧播放 | 代码与文档 MIT；成片与静帧 CC BY 4.0（LemoLab）；三段配音不可复用 |
| `resources/skills/garden-skills/` | [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills) | 6 个 Skill，含用代码做短片的 motion-showreel 与网页视频演示 web-video-presentation（未收录上游宣传站点 `website/`） | MIT |
| `resources/skills/agent-anime-skill/` | [waterpro/agent-anime-skill](https://github.com/waterpro/agent-anime-skill) | ai-handdrawn-video：AI 手书 / PV 的分阶段制作流程 | 未声明许可；上游注明仅供个人娱乐、请勿商业用途 |

## 更新

用上游的新克隆重新收录（会清空目标目录后重写）：

```
node scripts/vendor-resources.mjs opus-videos <克隆目录> --commit <sha>
node scripts/vendor-resources.mjs garden-skills <克隆目录> --commit <sha>
node scripts/vendor-resources.mjs agent-anime-skill <克隆目录> --commit <sha>
node scripts/vendor-resources.mjs lemo-opuscar <克隆目录> --commit 3961ddb3d24d8876e0e2754f7790d66908acee51 --packs <demo 包目录> --web <web 成片目录> --fetched 2026-10-24
```

然后运行 `node scripts/build.mjs` 与 `node scripts/check.mjs`。

## 代码片风格的播放与音轨

可运行的样片由 `demos/styles/player/` 载入：播放器在 iframe 里打开上游的 `demo/index.html`，等待 `window.READY`，再按时间调用上游的 `window.render(t)`，所以画面就是上游代码画出的画面。上游的成片音轨由离线混音生成、不在仓库里，资源库从上游 web Release 的成片中提取音轨（Ogg Opus 128 kbps）挂到时间轴上；game-show、paper-lantern、news-package 的音轨含有上游声明不可复用的配音，未收录。状态表在 `scripts/lemo-status.json`：ready 为可运行，needs-assets 缺上游构建时下载的字体或素材，needs-build 依赖上游预处理。

上游样片用 `/core/...` 绝对路径引用公共库：本地服务器把 `/core/` 映射到 `resources/lemo-opuscar/core/`，静态构建把该目录复制到站点根的 `core/`。

`scripts/lemo-status.json` 中标了 `"heavy": true` 的样片（目前是 stained-glass）每帧的 GPU 计算量很大：在集成显卡上一帧要数百毫秒，实时播放跟不上，但逐帧拖动与离线渲染不受影响。播放器 smoke 的实时推进检查对它不适用，验收时单独记录。

## 署名

视频与提示词的版权属于各自作者，资源库在每条详情页标明作者与原帖。若作者希望修改或移除条目，请到上游仓库提出。
