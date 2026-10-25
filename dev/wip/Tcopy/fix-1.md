# Tcopy 返工 1

规则仍以 `dev/wip/Tcopy/plan.md` 为准，下面是主任务对“待决定”的答复和验收后提出的修改。改完后在 `content-diff.md` 中追加“返工 1”一节，写明原文与新文。

## 1. 待决定的答复

1. **参数清单不受字数限制**：`migration[].how` 本身就是参数清单，不受 40 字上限约束，保留现状。`map-pilgrimage` 的 `observations[3]` 按第 3 节处理。
2. **地图巡礼的画面细节**：按 Demo 重写，见第 3 节。
3. **同步 AGENT.md 与 CONTRIBUTING.md**：把其中关于载体的说明改为只有 video 和 console 两种，删除 showcase 的示例和速查项。
4. **档案终端 5.3px**：舞台字号不设下限（这是用户此前的决定），不处理。

## 2. 档案终端：focus 与 observations 定稿

`entries/cases/archive-os.json` 的 `focus` 改为：

```
四十份档案按五类排列：可以阅读、查看 3D 模型、拆解再重组结构。画面、声音与操作共用一条时间轴，随时可以暂停和拖动。
```

`observations` 整体替换为以下 8 条（`at` | `what`），顺序照此：

| at | what |
|---|---|
| 档案阵列 | 五列档案：工程研究、生命科学、机构档案、能量研究、特别项目，每列八份。 |
| 选择与镜头 | 选中的档案轻轻抬起，镜头沿阵列平滑跟随，停下时没有回弹。 |
| 文字滚动 | 编号与标题切换时滚动约 460ms，页签、检索、收藏随时可用。 |
| 解密 | 读取档案时正文沿对角线逐块解密，约 3.6 秒完成。 |
| 画幅 | 横屏 1920×1080，画面整体等比缩放。 |
| 逐字输入 | 开机文字逐字打出，每个字都配一声短音。 |
| 浏览节奏 | 22 秒展开阵列，35 秒读取第一份档案，62.6 秒起四向循环浏览。 |
| 声音 | 开机、打字和每一次操作都有对应音效，全片 77.6 秒。 |

## 3. 地图巡礼：observations 按 Demo 重写

现在的 observations 描述的是另一支视频，时刻超过 60 秒，内容（首尔、YUI、聖地巡礼、S1 EP05、动画 2015）也不在 Demo 里。

重写要求：

- **依据**：只用 `demos/cases/map-pilgrimage/` 的 `scenes.js`、`config.js`、`script.js`，以及该条目的 `rhythm.beats`。可以打开 Demo 截图来核对，但不得引入 Demo 里没有的内容。
- **数量**：共 8–10 条，按时间排序。
- **`at`**：Demo 时刻，格式 `0:mm.s` 或区间 `0:mm–0:mm`，全部在 0–60 秒内。
- **`what`**：≤ 40 字，写访客在该时刻看到、听到了什么。
  - 可以用 Demo 里实际出现的文字，例如 HUD 字段、地名、`DAY 01`。
  - 不要和 `rhythm.beats` 的 note 逐字重复，要补充细节：HUD 字段、字体与颜色、卡片如何出入、声音与画面的对应。
- **必须覆盖的内容**：
  - HUD 全貌（四角各显示什么）；
  - 一次卡片展开到全屏；
  - 回忆段的竖排字幕；
  - 分屏对比的印章；
  - 误乘改道横幅；
  - 结尾统计。

## 4. 地图派生的 12 个巧思

巧思 id：corner-hud、vertical-title-blur、route-draw-marker、day-night-flip、card-expand-fullscreen、chapter-frame、split-compare-stamp、collect-counter、alert-reroute、outro-stat-stack、seekable-timeline、film-grain。

对这 12 个巧思逐个修改：

1. **`trigger`**：不要再写“播放、暂停或 seek 到巧思时间 t”。改写为设计上的触发时机，即故事里什么时候用它，≤ 20 字。
   - 例：`day-night-flip` →“一天结束、进入夜晚时”；`alert-reroute` →“行程出错、需要改道时”。
   - 依据该巧思所在的案例片段和它的 summary。
2. **`mechanism`**：删除 Demo 内部的时间映射，包括：
   - 案例时间，如“镜头固定在 34.5s”“分别播放 31.3→35.8、36.6→39.1s”；
   - “caseT”“片段重放”这类说法。

   保留做法本身，例如逐层插值、叠加暖色光。
3. **`effect`**：不能和 `summary` 相同。改写为这个效果给观众带来的感受或信息，≤ 30 字。
   - 例：`day-night-flip` →“不用字幕也能看出一天过去了”。
4. **`timing`**：
   - 项名与数值保留；
   - 删除只描述 Demo 片段编排的项，例如“白天=0s”“入夜=1.5s”这类巧思 Demo 内部的时刻，同时保留时长；
   - 不确定的项保留，并列进报告。

另外，档案终端派生的 5 个巧思（boot-typing、rolling-digits、decrypt-reveal、wave-array、idle-breathing）只检查第 3 条：effect 与 summary 相同的，按同样规则改写。

## 5. 验证

按 `plan.md` 第 8 节全部重做，包括：

- build、check、build:site；
- smoke 两次；
- banned；
- check-filters；
- 截图：与 `plan.md` 一致，另加 `map-pilgrimage` 案例详情滚动到“画面细节”一节的截图。

更新 `dev/reports/Tcopy.md`，在最后加上“返工 1”核对表。不 commit、不 push。
