# 贡献指南

## 仓库定位

本库是个人设计参考库，不是作品画廊。它保存三类内容：可参考的案例范本、从范本中拆出的巧思、可直接取用的素材。

案例范本有两个用途：

1. **参考**：遇到真实需求时，从范本出发修改、增减、拼接，做出新的作品。
2. **验证**：检验某个来源的制作思路、工作流或 skill 能否在本库的条件下真正生效。

范本的价值在于制作过程可读、内容可改，成片只是这个过程的检验结果。复刻他人作品与本库原创的案例按同一标准对待。

## 收录边界

本库收录以时间线为载体的作品：作品掌握节奏，按时间线播放；交互在时间线上分支，时间驱动的 Demo 可以逐帧渲染成视频。

收录影像视频（片头、宣传片、旅行影像、数据短片等）、带自动驾驶时间轴的交互操作台与展示台，以及能单独借用的转场、节奏、文字动效、画面构成、信息层、质感、声音和镜头巧思。网站与网页应用及其页面动效、微交互属于 Web Atlas。

1. 最终形态是视频，或带时间轴、按时间线播放的操作台／展示台，归入本库，即使它运行在浏览器里。
2. 最终形态是网站或网页应用，归入 Web Atlas。
3. 难以判断时，设想逐帧导出视频：核心价值仍在，归入本库；价值依赖重排、滚动阅读和观看者自己的节奏，归入 Web Atlas。
4. 同一来源在两种载体上都有价值时，本库只收时间线部分，条目本身保持完整。
5. 主题相同、表现形式不同的作品可分别进入两个库，各自独立、互不引用。
6. 画幅大小与固定画幅都不是判据，判据冲突时以“谁掌握时间”为准。完全由观看者拖拽、没有时间线的网页光照演示属于 Web Atlas。

## 收录原则

- **案例驱动**：案例以真实 Demo 或作品为对象。skill 或教程中有作品时忠实复刻；只有可实践的方法时，实际制作一个完整作品作为案例。用于制作时间线作品的工具、skill 与提示词作为素材收录。
- **忠实复刻**：忠实复刻是验证过程，不是目的：检验在给定的素材、工作流与工具下能否复现参考作品；能 1:1 复现，说明这套过程正确、可复现。
  - **验收以 1:1 为准**：有明确参考或源码的，与原作在相同视口并排对照一致，差异写明原因；没有源码，或源码、制作过程不完整的，尽力复现，无法复现的差异写明原因。按文档分工记录本次对照结果。
  - **素材可直接取用，成片不能替代实现**：图形、人物形象、图片、字体、音乐、音效、视频等组成画面的素材可以直接取自原作，以后也可以替换；画面的构成、动效、交互与时间线由本库代码实现，不把原作渲染好的成片画面当作复刻结果。原作的品牌内容与文案照用。
  - **实现范围与影像转译**：时间线作品按任务确定的范围实现，删减及原因写入 `fidelity.md`；只有压缩打包代码时，按参考作品自行实现并记录实现范围。官方影像的网页转译以官方影像为素材，整帧画面可作为素材。
  - **生成类素材**：原作由脚本生成的素材（抠图、贴纸、纸纹、渲染帧等）直接使用原作已生成的版本，生成脚本及其输入保留在条目本体的 `source/`；本库自己重新生成并验证过的版本也可以保留。
  - **有可用源码的作品，原作代码保持原样**：不为“易改”重组原作代码结构，改动只限接入本库与去掉与成品无关的内容（其他剪辑分支、调试代码、无人读取的中间文件）。原作缺数据或源码与公开成品不符时，以公开成品为准补全。
- **可修改**：修改范本时直接读改源码，不要求把内容抽成配置。案例、巧思与素材的迁移指南（`migration`）均为可选；有可提炼的常改内容（路线、图片、文案、节拍、配色、素材）时，写明在哪个文件、哪一段。
- **保留制作依赖**：收录是为了日后参考、学习和复现制作。成品运行所需之外，制作该作品必需的工具与依赖一并保留：配乐合成库与采样、素材生成脚本、模拟与渲染场景，以及这些脚本读取的数据。条目专属的放在条目本体的 `source/`；多个条目共用的作为素材收录在 `demos/materials/<id>/`，由条目引用。与本库已有工具完全等价的可以不收，在条目说明中写明对应关系。 要求是工具与依赖在库里取得到、写明怎么用，不要求每个案例都验证一键重跑。
- **方法与决策记录**：有研究价值时，在 `docs/cases/<id>.md` 记录参考与来源、采用的工作流／skill／提示词、关键决定与理由、怎么改；验证结论链接到本体的 `fidelity.md`。不强制每个案例都写，避免把范本框死在固定格式里。
- **语言**：站点说明使用中文；被复刻作品自身的原文、素材收录的 skill 与 prompt 原文保留原语言。
- **声音**：原创作品采用非 AI 合成的连续公开音乐打底，在 3–4 个关键节点加入低于音乐音量的短音效，例如 Kevin MacLeod 的 CC BY 4.0 音乐、Kenney 的 CC0 音效；复刻作品沿用原作声音。
- **第三方资源**：画面、字体、音乐、贴图与库保留完整素材、原字节、许可原文与署名，许可入口列在条目本体的 `LICENSES.md`。文字素材快照仅含上游原文文件与许可原文，保留原语言与原字节。第三方库按固定版本保存于 `vendor/<库>@<版本>/`；地图案例的 MapLibre 使用固定版本 CDN。
- **作者效果图**：标注“作者产出，未复刻”，逐图在条目 JSON 中记录原 URL、许可与静态／动态属性。
- **界面**：站点正文、导航、标签、辅助信息和控件的最终字号至少 12px；案例、巧思、嵌入 Demo 及画面内文字按设计需要确定。功能图标使用内联 SVG，遵守 `prefers-reduced-motion`，声音默认关闭。

## 三类组织规范

内容分为案例 `cases`、巧思 `patterns`、素材 `materials`，同一 id 在各目录中对齐。只建立实际用到的目录。

| 一级目录 | 角色 | 组织 |
| --- | --- | --- |
| `entries/` | 内容源：条目 | `{cases,patterns,materials}/<id>.json` |
| `demos/` | 内容源：条目本体 | `{cases,patterns,materials}/<id>/` |
| `docs/` | 内容源：给人读的文档 | 根目录放通用文档；`{cases,patterns,materials}/<id>.md` 放单条文档；`readme/` 放 README 配图 |
| `prompts/` | 生成 | `{cases,patterns,materials}/<id>.md`，条目有 prompt 才生成 |
| `agent/` | 生成 | 根目录仅 `catalog.json`；各类目录含 `index.json` 与 `<id>.json` 资料包 |
| `previews/` | 生成或截图 | `{cases,patterns,materials}/<id>.<ext>`；变体后缀 `-portrait`、`-mobile`、`-reference`；作者效果图放 `materials/<id>/` |
| `data/` | 生成：站点运行时数据 | 按用途平铺 `cases.js`、`patterns.js`、`materials.js`、`docs.js`、`asset-sources.js` |
| `site/` | 站点代码 | `shared/`、`pages/<页>/`、`runtime/`、`icons/` |
| `kit/` | Demo 运行时 | `motion-kit.js` |
| `scripts/` | 工具与制作模板 | 构建、播放、截图、渲染、取帧与 CLI；`templates/` 放条目模板 |
| 根目录 | 页面与说明 | `index.html`、`cases.html`、`patterns.html`、`materials.html`、`lab.html`、`agent.html`、`docs.html`、`README.md`、`CONTRIBUTING.md`、`AGENTS.md`、`package.json`、`.gitattributes`、`.gitignore`、`.openai/` |

### 条目本体

案例在 `demos/cases/<id>/` 中组织：

| 路径 | 内容 |
| --- | --- |
| `index.html` | 可运行入口 |
| `film/` | 作品代码、样式及作品许可原文 |
| `assets/`、`fonts/`、`audio/` | 运行素材、完整字体及音轨与各自许可 |
| `vendor/<库>@<版本>/` | 固定版本第三方库及许可 |
| `motion-kit.js` | 运行时副本 |
| `source/` | 制作脚本、输入数据、上游源码与使用说明 |
| `fidelity.md` | 复刻对照，内容见文档分工 |
| `LICENSES.md` | 许可索引 |

巧思在 `demos/patterns/<id>/` 中组织：

| 路径 | 内容 |
| --- | --- |
| `index.html` | 入口；重放型仅内联 `MotionKit.replay` 配置，拆分型加载 `mechanism/` |
| `motion-kit.js` | 由构建同步的运行时副本 |
| `mechanism/` | 拆分型的机制代码、配置、样式与子页面 |
| `assets/` | 本巧思独有的素材；来源案例素材直接引用 |
| `source/` | 机制的可编辑源码与制作资料 |
| `LICENSES.md` | 许可索引 |

重放型仅包含入口与运行时副本；带有本地实现的为拆分型。技术接入与时间协议见[渲染管线](docs/pipeline.md#mountfilm-与-replay)。

可运行素材在 `demos/materials/<id>/` 中组织：

| 路径 | 内容 |
| --- | --- |
| `index.html` | 样例入口，可用 `?demo=` 切换样例 |
| `demo/` | 样例代码、样式与各样例子目录 |
| `vendor/<库>@<版本>/` | 固定版本运行库与各自许可原文 |
| `fonts/` | 字体与许可原文 |
| `source/` | 重建入口、依赖锁、source map、上游源码与 provenance 等制作资料 |
| `fidelity.md` | 复刻型素材的对照结果（如有） |
| `LICENSES.md` | 许可索引 |

可运行素材的用法写入 `docs/materials/<id>.md`，本体内不放 README。文字素材保存固定提交的原文快照；入口字段见“素材”。

素材类型及站点名称统一为：

| `type` | 名称 |
| --- | --- |
| `component-library` | 组件库 |
| `image` | 图像 |
| `sound` | 声音 |
| `font` | 字体 |
| `poster` | 海报 |
| `agent-skill` | Agent Skill |
| `prompt-kit` | 提示词套件 |

类型决定展示，目录角色决定文件收集。快照按 `snapshotPath` 收集完整原文；可运行内容按 `demo` 所在目录收集。巧思连同 `sources` 指定的来源案例收集，资料包与导出保留仓库相对路径。

### docs 分工与唯一位置

`docs/` 根目录放使用指南、方法、渲染管线、Prompt 写法、Agent 取材说明与跨案例研究。单个案例的研究放 `docs/cases/<id>.md`，案例索引 `docs/cases/README.md` 由构建生成。素材中文使用说明放 `docs/materials/<id>.md`，总览放 `docs/materials/README.md`；说明采用叙述性用法，结构化事实留在条目中。只有存在单条巧思文档时才建立 `docs/patterns/`。

| 信息 | 唯一位置 |
| --- | --- |
| 来源、版本、许可、用途、适用／避用等结构化事实 | 条目 JSON |
| 研究分析、机制观察 | `docs/<类>/<id>.md` |
| 复刻删改、已接受差异、对照结果 | 条目本体的 `fidelity.md` |
| 第三方许可原文与索引 | 条目本体内的许可原文与 `LICENSES.md` |
| Prompt 文档、Agent 资料包、站点数据、案例索引 | 构建生成 |

文档中心收录 docs/**、prompts/** 与根目录 README、CONTRIBUTING、AGENTS 的 Markdown；站内指向仓库 Markdown 的链接一律在文档中心打开。条目本体的 `fidelity.md`、`LICENSES.md` 由条目详情与资料包提供。

`README.md` 介绍项目并提供入口；本文件集中收录规则、目录规范、新增流程与字段说明；`AGENTS.md` 规定仓库修改操作。

## 新增流程

复制模板后运行构建，由构建生成条目内的 `motion-kit.js` 副本。

### 案例

1. 按收录边界确定完整作品，保存来源、固定版本与许可到 `entries/cases/<id>.json`。
2. 在 `demos/cases/<id>/` 制作作品，按本体约定放置运行文件、素材与制作资料。模板位于 `scripts/templates/case-film/`、`scripts/templates/case-native/`。
3. 在条目中填写节拍、构成、分层、参数、实现 Prompt 与关联巧思；按文档分工记录研究与本次对照结果，按第三方资源规则保存文件。
4. 运行构建（见[“构建与检查”](#构建与检查)）。

### 巧思

1. 在 `entries/patterns/<id>.json` 说明机制、触发、结果、参数、组合职责及可访问性，`sources` 仅保存 `{ caseId }`，并把该 id 加入来源案例的 `patternIds`。
2. 在 `demos/patterns/<id>/` 创建入口。模板位于 `scripts/templates/pattern-replay/` 与 `scripts/templates/pattern-split/`；复用来源案例的素材和上游源码。
3. 有单条研究时写入 `docs/patterns/<id>.md`。
4. 运行构建（见[“构建与检查”](#构建与检查)）。

### 素材

1. 在 `entries/materials/<id>.json` 填写类型、来源、版本、许可、用途、适用／避用、工作流、安装方式与盘点证据。有真实案例时通过 `relatedEntries` 关联，暂无案例时填空数组。
2. 把可运行样例或完整原文快照放入 `demos/materials/<id>/`，可运行样例使用 `scripts/templates/material-demo/`。按第三方资源规则保存文件。
3. 叙述性中文用法写入 `docs/materials/<id>.md`，在 `docs/materials/README.md` 增加入口；作者效果图放入 `previews/materials/<id>/`，逐图事实写入 `gallery`。
4. 运行构建（见[“构建与检查”](#构建与检查)）。

## 构建与检查

在仓库根目录运行；需要更新预览时，静态服务单独保持运行：

```bash
node scripts/build.mjs
node scripts/serve.mjs --port 4321
node scripts/capture.mjs --only <id>
node scripts/build.mjs
```

可运行 Demo 按上述顺序更新预览；文字快照直接打开主文档并核对资料包与导出。运行文件随条目入库，检查被忽略的文件：

```bash
git ls-files --others --ignored --exclude-standard
```

完整本地分发使用 `node scripts/build-static.mjs`，发布包使用 `node scripts/build-static.mjs --site`，均输出到 `dist/`。发布使用已通过 PR 合并并推送的源提交，站点配置见 `.openai/hosting.json`，素材地址处理见[渲染管线](docs/pipeline.md#十三发布素材地址)。参考视频取帧使用 `node scripts/frames.mjs <video>`，生成带时间码的接触表。

## 条目字段

### 通用与路径

| 字段 | 说明 |
| --- | --- |
| `id`、`title`、`summary` | 与文件名一致的 id、中文标题与摘要 |
| `order`、`tags`、`subtitle` | 排序、检索标签与副标题 |
| `demo` | `demos/<类>/<id>/index.html` 可运行入口 |
| `research`、`fidelity` | 单条文档与复刻对照文件路径 |
| `sourceFiles`、`locator` | 源文件路径与机制定位，引用来源案例时指向该案例 |
| `preview`、`previewPortrait` | 构建按同 id 的预览文件生成；条目可指定素材预览 |
| `previewAt`、`previewAtPortrait` | 横屏／竖屏预览时刻；竖屏缺省同横屏 |
| `prompt` | 实现 Prompt，填写后生成同类 Prompt 文档 |
| `videoPrompt`、`negativePrompt` | 可选的视频生成 Prompt 与负向约束 |
| `upstream`、`license`、`sources` | 素材的上游仓库、固定提交、版本、许可与来源证据；案例可记录来源事实，巧思的 `sources` 为案例指针 |
| `attribution` | 按 `scope` 归类的来源、资源、版本与许可说明，`notes` 保留对应事实 |

### 案例

案例必填 `id`、`title`、`carriers`、`summary`、`prompt`、`demo`、`composition`。

| 字段 | 说明 |
| --- | --- |
| `carriers` | `video` 影像视频、`console` 交互操作台，可多选 |
| `timeline` | 是否暴露 `window.__motion` |
| `rhythm` | `{ duration, bpm?, beats: [{ t, label, note }] }`，时刻单位为秒 |
| `energy` | 覆盖作品时长的 0–1 等距能量采样 |
| `energySegments`、`energyNote` | `{ t0, t1, from, to, label }` 分段线性插值与数值来源；同时有等距采样时优先显示分段 |
| `focus`、`observations` | 设计重点与画面观察 |
| `composition`、`layers` | 视觉、声音构成与画面分层 |
| `tokens` | `{ palette: [], type: '', motion: [{ name, value }] }` |
| `interaction` | 操作与状态 |
| `migration` | 可选，`[{ field, how }]`：常改内容的位置与修改方法 |
| `useCases`、`avoid`、`constraints` | 适用范围、避用与制作约束 |
| `patternIds` | 关联巧思 id |
| `renderer` | `gpu` 表示截图需要 GPU |

### 巧思

巧思填写 `types`、`carriers`、`mechanism`、`trigger`、`effect`、`timing`、`accessibility`、`sources`、`demo` 与 `prompt`。`types` 使用 `composition`、`type-motion`、`transition`、`camera`、`feedback`、`rhythm`、`hud`、`texture`、`sound`，可多选。`parameters` 可附参数数值及源码定位。

`composition.role` 为 `foundation`（骨架）、`support`（支撑）或 `accent`（点睛）；`pairsWellWith`、`conflicts` 保存搭配和冲突的巧思 id，`notes` 说明组合条件。

### 素材

素材填写 `type`、`carrierNote`、`workflow`、`useCases`、`avoid`、`upstream`、`license`、`install`、`relatedEntries` 与来源证据 `sources`。`relatedEntries` 为 `{ kind, id, note }[]`，`kind` 使用 `case`、`pattern`、`material`，`id` 指向本库条目。

`snapshotPath` 指向本体目录，`snapshotEntry` 是该目录内的主文档相对路径，Agent Skill 的主文档为 `SKILL.md`；可运行素材填写 `demo`。`gallery` 保存 `{ path, caption, kind, replicated, sourceUrl, license }`，作者效果图的 `replicated` 为 `false`。`gallery.kind` 区分 `work`、`style`、`theme`；`caption` 写明图像或动画的展示形式，`sourceUrl` 和 `license` 保存逐图来源与许可。

## 验收与交付

- 复刻作品与公开原作在相同视口、相同时刻并排对照，操作与声音同步复核，按文档分工记录本次对照结果。
- 在干净副本中复验本地服务、详情、独立 Demo、资料包和导出，运行文件全部入库，运行依赖可由固定版本取得。
- 运行“构建与检查”中的命令；构建检查本体和快照路径，实际页面检查播放、定位、画幅、键盘、声音与减少动态。被忽略的文件中应无运行必需文件。
- 提交内容包括条目、本体、文档、许可和生成物。截图分析、参考取帧、渲染输出与过程报告留在工作区；参考取帧和渲染输出分别使用 `frames/`、`renders/`。
