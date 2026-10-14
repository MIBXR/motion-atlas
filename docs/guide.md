# 使用指南

Motion Atlas 是一个面向**影像视频、交互操作台、交互展示台**的动态视觉参考库。它和 Design Atlas（网页前端设计参考库）是姊妹项目：Design Atlas 关心页面的版式与组件，Motion Atlas 关心画面在时间里怎么走——节拍、动势、转场、反馈与收尾。

每一条资料都同时给出三样东西：

1. **拆解**：镜头、信息层、文字、事件、声音分轨描述，附节拍表、能量曲线与动效 Token。
2. **Prompt**：可直接复用的实现 Prompt（给代码模型）、视频生成 Prompt（给视频模型）与负向约束。
3. **Demo**：零依赖的 HTML/CSS/JS，改 `config.js` 或文件顶部的 `CONFIG` 就能迁移；时间驱动的 Demo 还能逐帧渲染成视频。

## 站点结构

| 页面 | 用途 |
| --- | --- |
| [首页](../index.html) | 概览、载体入口、案例与巧思类型入口 |
| [案例库](../cases.html) | 9 个完整作品：可按载体、来源、证据等级筛选；详情页内嵌 Demo、刻度条、节拍表与 Prompt |
| [巧思库](../patterns.html) | 从案例里拆出来的单个技巧：触发、结果、参数、组合关系、减少动态策略 |
| [节奏实验室](../lab.html) | 调缓动曲线、时长、错峰与 BPM 吸附，导出 CSS 变量、MotionKit 代码与 Prompt 片段 |
| 文档中心 | 本页所在处：指南、方法、研究笔记与全部 Prompt |
| [Agent 工作流](../agent.html) | 给编码 Agent 的结构化索引、资料包与 CLI |

## 三种载体

- **影像视频（video）**：最终产物是一段视频。所有元素写在时间轴上，`render(t)` 只依赖时间 `t`，可以拖动刻度、跳到节拍、逐帧导出。代表：地图巡礼、赛事转播包、节拍字幕 MV。
- **交互操作台（console）**：用户在界面上做选择、锁定、确认。重点是**输入 → 反馈 → 余波 → 回程**这条链，以及空闲时界面如何“呼吸”。代表：档案终端、怪盗战斗指令、工业协议控制台、任务指挥台。
- **交互展示台（showcase）**：把一组展品依次揭示给观众。重点是**期待 → 揭示 → 停留 → 收尾**。代表：抽卡舞台、水墨长卷、档案阵列。

一个案例可以同时属于多种载体：例如“档案终端”既能作为可操作的界面，也能被自动驾驶的时间轴录成视频。

## 怎么用这份资料

### 想做一支视频

1. 在案例库按“影像视频”筛选，挑一个节奏接近的案例，先看**节拍表**和**能量曲线**，确认起伏结构是你要的。
2. 复制“视频生成 Prompt”，把主题、地点、配色换成你的内容；保留时长、节拍与镜头语言部分。
3. 如果要用代码出片：复制 Demo 文件夹，改 `config.js` 里的文案、颜色、时刻表，然后用 `node scripts/render.mjs <demo>/index.html --fps 30` 渲染成帧序列（装有 ffmpeg 时自动合成 MP4）。详见 [渲染管线](pipeline.md)。

### 想做一个可操作的界面

1. 在案例库按“交互操作台”筛选，读“交互”一栏：每个输入对应的反馈与时长。
2. 去巧思库挑骨架（foundation）、支撑（support）与点睛（accent）三类巧思组合，一般 **1 个骨架 + 2–4 个支撑 + 1–2 个点睛** 就够了，更多会互相抢戏。
3. 把巧思的实现 Prompt 拼进你的需求描述里，或直接把巧思 Demo 的 `CONFIG` 块与核心函数搬进项目。

### 想调手感

去 [节奏实验室](../lab.html)：拖曲线、改时长与错峰，打开节拍器听 BPM，把事件时刻吸附到拍点，然后导出。方法论见 [节奏方法](rhythm.md)。

## 证据等级

每个案例和巧思来源都标注证据等级，读的时候请留意：

| 等级 | 含义 |
| --- | --- |
| 逐帧/源码实测 | 对视频逐帧取样或读开源代码得到的数值，误差在 1–2 帧内 |
| 本地转译 | 参考了真实作品的结构与语言，但素材、文字、参数为本库原创 |
| 公开资料推断·待核验 | 本会话无法实机录制，依据设计分析文章、媒体报道与通用观察整理；数值为拟合 |
| 原创设计 | 本库原创的设计语言，不对应特定作品 |

游戏界面（P5 式战斗、工业协议控制台）目前是“推断”等级；核验步骤写在各自的研究笔记与 [收录方法](methodology.md) 里。

## 本地运行

需要 Node.js 18 以上（推荐 22），无需安装依赖。

```bash
node scripts/serve.mjs --port 4321
```

然后打开 `http://localhost:4321/`。直接双击 HTML 也能看大部分页面，但地图 Demo 与刻度条需要通过本地服务器访问。

常用命令：

| 命令 | 作用 |
| --- | --- |
| `node scripts/build.mjs` | 校验条目、同步 kit 副本，生成站点数据、Prompt 文档与 Agent 资料包 |
| `node scripts/check.mjs` | 只检查不写入：条目、kit 副本、生成物是否最新、字号下限、预览图 |
| `node scripts/smoke.mjs` | 用无头浏览器把每个 Demo 从头 seek 到尾，收集运行时错误 |
| `node scripts/capture.mjs` | 按条目里的 `previewAt` 重新截取预览图 |
| `node scripts/render.mjs <url或路径>` | 逐帧渲染时间驱动的 Demo |
| `node scripts/atlas.mjs search <关键词>` | 命令行检索；`show`、`export` 见 [Agent 工作流](../agent.html) |

## 目录

```text
entries/cases/*.json      案例条目（唯一内容源）
entries/patterns/*.json   巧思条目
demos/cases/<id>/         案例 Demo：index.html、style.css、script.js、config.js、motion-kit.js
demos/patterns/<id>/      巧思 Demo：单文件 index.html + motion-kit.js
kit/motion-kit.js         共享运行时（Demo 内为同步副本）
docs/                     指南、方法与研究笔记
prompts/                  由条目生成的 Prompt 文档
agent/                    由条目生成的 Agent 索引与资料包
data/                     由条目生成的站点数据
previews/                 Demo 实际截图
scripts/                  服务器、构建、检查、截图、渲染与 CLI
```

`prompts/`、`agent/`、`data/` 都是生成物，请改 `entries/` 后运行构建，不要手改。
