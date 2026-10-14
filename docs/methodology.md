# 收录方法

本篇说明一条资料从“看到一个好作品”到“进入库里”经过哪些步骤，以及每一步的证据如何记录。目标是让任何人拿到同一份参考，都能复现我们的观察，或者指出哪里错了。

## 一、四个证据等级

| 等级 | 字段值 | 什么时候用 | 要求 |
| --- | --- | --- | --- |
| 逐帧/源码实测 | `observed` | 拿到了成片文件或开源代码 | 写清取帧方法、帧间隔与时间点；数值误差 ≤ 2 帧 |
| 本地转译 | `adapted` | 参考真实作品的结构与语言，但素材与参数为本库原创 | 写清借鉴了什么、改了什么 |
| 公开资料推断·待核验 | `inferred` | 无法实机录制，只有文章、报道、截图 | 列出全部来源；在研究笔记里写“如何核验” |
| 原创设计 | `original` | 本库原创的设计语言 | 写清设计意图与适用边界 |

一个案例的整体等级取**最弱的那一环**。例如地图巡礼的结构与时间点是逐帧实测，但缓动曲线是拟合的，所以笔记里分别标注，并在数值后写“约”。

## 二、逐帧观察

### 工具

`scripts/frames.mjs` 用本机无头 Edge/Chrome 的 `<video>` 元素 seek 取帧，拼成带时间码的接触表（contact sheet），不需要 ffmpeg 或 Python：

```bash
node scripts/frames.mjs path/to/reference.mp4 --every 2
node scripts/frames.mjs path/to/reference.mp4 --from 55 --to 58 --step 0.25
node scripts/frames.mjs path/to/reference.mp4 --at 5.2,5.5,5.8,6.1 --full
```

输出在 `frames/<视频名>/`（已被 .gitignore 忽略，不会进入仓库）。`--full` 额外按原分辨率保存单帧，用来读 HUD 小字。

### 三遍取帧

1. **全片粗扫**：每 2 秒一帧，看清整体结构：有几种画面模式、各占多长、怎么切换。写出“全片节拍”表。
2. **转场细扫**：在每个模式切换前后 1–2 秒，每 0.25 秒（或 1/帧率）一帧，记录转场从开始到结束的帧数、经过哪些中间状态。
3. **全分辨率读字**：在关键画面读出 HUD 的全部字段、字体、对齐、颜色。

### 记录模板

研究笔记放在 `docs/research/<id>.md`，至少包括：

- 参考来源（标题、链接、作者署名）、素材规格、观察日期、方法、证据等级
- 一句话结构
- 全片节拍表：时间 / 段落 / 画面模式 / 备注
- 分层拆解：世界层、信息层、文字、转场、声音
- 设计判断：为什么有效（这是“巧思”的来源）
- Demo 与原作的差异
- 验证记录：Demo 截图时刻与修改

## 三、从观察到条目

1. **节拍表 → `rhythm.beats`**：每个关键事件一条 `{ t, label, note }`，`t` 用 Demo 的时间。
2. **起伏 → `energy`**：等间隔 0–1 采样。
3. **分层 → `layers` 与 `composition`**：色彩、字体、版式、影像、动效、声音、节奏、整体一致性各一段。
4. **数值 → `tokens.motion`**：只写测得或拟合的数值；拟合值标“约”。
5. **巧思 → `entries/patterns/*.json`**：每个“触发 → 结果”的技巧单独成条，并在案例的 `patternIds` 与巧思的 `sources` 中互相引用（构建会检查这个双向链接）。
6. **Prompt**：按 [Prompt 写法](prompting.md) 写实现、视频与负向三段。
7. **Demo**：零依赖；时间驱动的作品遵守 [render(t) 协议](pipeline.md)；配置与逻辑分离。

## 四、验证

每个 Demo 进库前至少通过：

- `node scripts/smoke.mjs`：从 0 到结尾每 0.2 秒 seek 一次，再实时播放 1.5 秒，不能有运行时错误。
- `node scripts/shot.mjs <url> --t …`：在节拍表的每个关键时刻截图，人工比对是否与笔记描述一致；问题与修改写进研究笔记的“验证记录”。
- `node scripts/check.mjs`：条目完整、引用有效、kit 副本同步、生成物最新、文字不小于 12px、预览图存在。
- 浏览器内检查：桌面与手机宽度、浅色与深色主题、减少动态模式。

## 五、游戏界面怎么核验

P5 式战斗与工业协议控制台目前是 `inferred`。若要升级为 `observed`：

1. 录制 1080p60 实机片段，每类事件（光标移动、确认、命中、切入、结算等）至少 3 次。
2. 用 `scripts/frames.mjs --step 0.0167` 在事件起点前后各 0.5 秒逐帧取样。
3. 记录：从开始变化到稳定的帧数、最大缩放与位移、遮罩覆盖所需帧数、元素错峰间隔。
4. 把实测值写回条目的 `tokens.motion` 与 Demo 的 `config.js`，证据等级改为 `observed`，在研究笔记写明日期与片段来源。

## 六、版权边界

- 仓库里**不放**任何第三方的画面、角色、标志、音乐、字体文件。参考视频只在本地分析，接触表不提交。
- Demo 中的人物、敌人、地点插画均为程序绘制的原创剪影或程序化场景；游戏专有名词替换为原创名称。
- 研究笔记引用他人作品时只描述结构与参数，不转载截图；引用文字不超过一句。
- 开源参考（如 RhineLabUI）遵守其许可证：只借鉴结构与交互思路，不复制源码。

## 七、来源

| 来源 | 用途 |
| --- | --- |
| 哔哩哔哩【眩晕瘫坐 旅游时拍的素材给Opus5.5剪出来是这样】 <https://b23.tv/eBjaN0O> | 地图巡礼：用户提供的本地成片，逐帧实测 |
| 哔哩哔哩 BV1e3Y36gEGr <https://www.bilibili.com/video/BV1e3Y36gEGr> | 档案终端：参考视频 |
| RhineLabUI <https://github.com/LBEILC/RhineLabUI> | 档案终端：开源实现的结构与交互 |
| Mechanics of Magic: Visual Design of Games – Persona 5 <https://mechanicsofmagic.com/2022/04/23/visual-design-of-games-persona-5/> | P5 式战斗：布局与信息层级分析 |
| GameSpot: Persona 5's Menus Continue to Look Stunning <https://www.gamespot.com/articles/persona-5s-menus-continue-to-look-stunning/1100-6439532/> | P5 式战斗：菜单设计报道 |
| DT Next 关于游戏菜单设计的报道 <https://www.dtnext.in/amp/story/edit/exuberant-video-game-menus-designed-with-da-vinci-in-mind-807823> | P5 式战斗：设计访谈转述 |
| 17173 终末地专题 <https://news.17173.com/z/arknights2026/content/01202026/181744280.shtml> | 工业协议控制台：公开资料 |
| GameWith 终末地攻略 <https://gamewith.net/akendfield/72372> | 工业协议控制台：系统与界面说明 |
| OpenFreeMap <https://openfreemap.org/> | 地图巡礼 Demo 的矢量瓦片 |
| MapLibre GL JS <https://maplibre.org/maplibre-gl-js/docs/> | 地图巡礼 Demo 的地图渲染 |
| Design Atlas <https://mibxr-design-atlas.mibxranime.chatgpt.site/> | 姊妹库：P5R 与终末地网页端的静态设计参考 |
