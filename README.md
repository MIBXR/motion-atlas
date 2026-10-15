# Motion Atlas · 多媒体动态视觉参考库

面向**影像视频、交互操作台、交互展示台**的动态设计参考库。每个案例都拆成镜头、信息层、文字、转场与声音轨道，附节拍表、能量曲线、动效 Token、可复用 Prompt，以及可以拖动、跳拍、逐帧渲染成视频的零依赖 Demo。

**在线浏览：[Motion Atlas](https://motion-atlas.mibxranime.chatgpt.site)**

<!-- counts:start -->
**9 个案例**　·　**38 个巧思**　·　**9 个可逐帧渲染的影像 Demo**
<!-- counts:end -->

![地图巡礼 Demo 截图](previews/cases/map-pilgrimage.jpg)

姊妹项目：[Design Atlas](https://github.com/MIBXR/design-atlas)（网页前端设计参考库）。Design Atlas 关心页面的版式与组件；Motion Atlas 关心画面在时间里怎么走：节拍、动势、转场、反馈与收尾。

## 收录内容

### 案例

| 案例 | 载体 | 证据 | 时长 |
| --- | --- | --- | --- |
| [地图巡礼 · 游戏过场式旅行影像](demos/cases/map-pilgrimage/) | 影像视频 / 交互展示台 | 逐帧实测 | 56s |
| [白色档案终端 · 莱茵式 Analysis OS](demos/cases/archive-os/) | 交互操作台 / 交互展示台 | 逐帧/源码实测 | 24s |
| [怪盗动势 · P5 式战斗指令与总攻过场](demos/cases/phantom-battle/) | 交互操作台 / 影像视频 | 公开资料推断·待核验 | 17.5s |
| [工业协议 · 终末地式设施操作台](demos/cases/industrial-protocol/) | 交互操作台 / 交互展示台 | 公开资料推断·待核验 | 17s |
| [赛事转播图形包 · 踩拍的信息层](demos/cases/broadcast-pack/) | 影像视频 / 交互操作台 | 原创 | 24s |
| [节拍动态字幕 · Kinetic Lyric MV](demos/cases/beat-lyric/) | 影像视频 | 原创 | 31.2s |
| [任务指挥台 · 荧光 FUI](demos/cases/mission-fui/) | 交互操作台 / 影像视频 | 原创 | 20s |
| [抽卡揭示舞台 · 期待与释放](demos/cases/gacha-reveal/) | 交互展示台 / 影像视频 | 原创 | 9.5s |
| [水墨长卷展台 · 手卷式浏览](demos/cases/ink-scroll/) | 交互展示台 / 影像视频 | 原创 | 14.5s |

前四个来自用户提供的参考与游戏界面转译，后五个是本库原创的设计语言，用来补齐转播、MV、FUI、揭示与东方长卷这几类常见需求。

### 巧思

从案例里拆出来的单个技巧，每条都有触发、结果、参数、组合关系（骨架 / 支撑 / 点睛）、减少动态策略与独立 Demo：

| 类型 | 数量 | 例子 |
| --- | --- | --- |
| 转场 | 12 | 异形遮罩、色带 Stinger、卡片展开为全屏、昼夜逐层插值、墨晕转场 |
| 节奏与时序 | 11 | 可 seek 时间轴、节拍时钟、蓄力—预示—爆发、空闲呼吸 |
| 交互反馈 | 10 | 长按确认、目标锁定、冲击弹出、印章盖下、翻牌流光 |
| 文字动效 | 9 | 竖排模糊标题、字符解码、滚动数字、拍入大字、剪报字 |
| 画面构成 | 8 | 四角 HUD、章节框线、分屏对比盖章、斜切菜单、切角面板 |
| 信息层 HUD | 7 | 路线描绘、收集计数、下三分之一字幕条、雷达扫描 |
| 质感与后期 | 3 | 胶片颗粒、解码扫描、墨晕 |
| 声音 / 镜头 | 2 / 1 | 打字音、节拍音；路线跟随镜头 |

## 快速开始

需要 Node.js 22+ 与本机的 Edge 或 Chrome（截图、渲染、取帧脚本用），无需安装依赖。

```bash
node scripts/serve.mjs --port 4321
```

打开 <http://localhost:4321/>：

- **案例库 / 巧思库**：筛选、收藏（可导出 JSON 备份）、内嵌 Demo、刻度条与节拍点、三段 Prompt。
- **节奏实验室**：调缓动曲线、时长、错峰与 BPM 吸附，导出 CSS 变量、MotionKit 代码与 Prompt 片段。
- **文档中心**：指南、节奏方法、Prompt 写法、渲染管线、收录方法、9 篇研究笔记与全部 Prompt。
- **Agent 工作流**：资料格式、CLI 与指令生成器。

## 复用

```bash
# 检索、查看、导出
node scripts/atlas.mjs search "转场 地图" --limit 5
node scripts/atlas.mjs show map-pilgrimage --source
node scripts/atlas.mjs export split-compare-stamp --out ../my-demo

# 逐帧渲染（PATH 上有 ffmpeg 时自动合成 MP4）
node scripts/render.mjs demos/cases/beat-lyric/index.html --fps 30
```

每个案例 Demo 的内容都集中在 `config.js`，巧思 Demo 集中在 `index.html` 顶部的 `CONFIG` 块：改文案、配色、时刻表即可迁移，时间结构与动效参数保持不变。

## 目录

```text
entries/            案例与巧思条目（唯一内容源）
demos/              可运行 Demo；时间驱动的 Demo 遵守 render(t) 协议
kit/motion-kit.js   共享运行时：时间轴、缓动 Token、节拍、文字揭示、控制条、合成音效
docs/               指南、方法与研究笔记
prompts/ agent/ data/   由 entries 生成（勿手改）
previews/           Demo 实际截图
scripts/            serve / build / check / smoke / capture / shot / render / frames / atlas
```

## 维护命令

| 命令 | 作用 |
| --- | --- |
| `node scripts/build.mjs` | 校验条目、同步 kit 副本，生成站点数据、Prompt 文档、Agent 资料包与本文件的计数 |
| `npm run build:site` | 生成完整静态站点到 `dist/`，用于 Sites 发布；站点配置见 `.openai/hosting.json` |
| `node scripts/check.mjs` | 只读检查：条目与引用、kit 副本、生成物是否最新、文字 ≥ 12px、预览图 |
| `node scripts/smoke.mjs` | 无头浏览器把每个 Demo 从头 seek 到尾，收集运行时错误 |
| `node scripts/capture.mjs` | 重新截取预览图（需先启动本地服务器） |
| `node scripts/frames.mjs <video>` | 参考视频取帧，生成带时间码的接触表 |

新增条目的流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，给 Agent 的说明见 [AGENT.md](AGENT.md)。

## 证据与版权

- 每条资料标注证据等级：逐帧/源码实测、本地转译、公开资料推断·待核验、原创设计。P5 式与终末地式两个游戏界面案例目前为“推断”，核验方法见 [docs/methodology.md](docs/methodology.md)。
- 仓库不包含任何第三方的画面、角色、标志、音乐或字体文件。Demo 中的人物、地点与插画为程序绘制的原创内容，游戏专有名词已替换为原创名称。品牌与作品权利归各自所有者。
- 地图 Demo 使用 [OpenFreeMap](https://openfreemap.org/) 矢量瓦片与 [MapLibre GL JS](https://maplibre.org/)，地图数据 © OpenStreetMap 贡献者。
- 参考来源与链接列在 [docs/methodology.md](docs/methodology.md#七来源) 与各篇研究笔记中。
