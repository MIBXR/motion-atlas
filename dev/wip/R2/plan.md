$stop-that-shit change -- 第二轮收尾：day-night 两项决定 → 删除 6 个案例与 16 个巧思 → 字号回调 → 一次完整验收。

# 0. 现状

- 本分支 `feat/patterns-t4b-t5` 已提交 T4b 的进行中工作（4e2382a），并合并了 `feat/polish-round-1`（7a84101），后者带来 T5r 档案终端移植。合并带来的机制：
  - 条目字段 `"renderer": "gpu"`：smoke / capture 为该条目单独启动 GPU 浏览器，打印 renderer，软件渲染时判失败；
  - smoke 的播放检查会先等待 seek / play 完成；
  - kit 的 `dsp.sample` 与可恢复的函数音色。
- 按顺序执行下面四步。每一步内部若遇到本说明没覆盖、必须做选择的情况：停下来报告，不要自己定。
- 不 commit / push / 切分支。服务器用 4322；不要碰 4321、4323、4324。

# 1. day-night-flip 的两项决定

1. **MAD 比较改为镜头相同的时刻**：巧思 t = 3.2（映射到 caseT 34.5，与巧思固定镜头相同），对比案例 caseT 34.5。地图区域的缩略 MAD 必须 < 4/255。遮罩与口径同上一轮。
2. **HUD 配色只按巧思实际显示的覆盖层计算**：在这个巧思里，把影响 HUD 配色的“覆盖层上下文”（`over` 等）设为“无对比分屏 / 无回忆”，即只考虑实际显示的地图与 HUD。其他巧思不受影响。

   完成后 t = 0.5、2.0、5.0 横竖六张图的 HUD 文字要清晰可读；重截这六张，自己查看。

# 2. 删除

按 `dev/wip/Tdel/plan.md` 全部执行，那里列有删除清单与需要修改的引用。

# 3. 字号回调

按 `dev/wip/Tfont/plan.md` 全部执行：

- 字号表；
- 印章缩放；
- 容器跟随缩放；
- 检查脚本与文档（取消下限）；
- 模板；
- 12 个巧思同步。

补充：

- `entries/cases/archive-os.json` 的 `fontFloor` 字段删除，`renderer: gpu` 保留。
- `scripts/smoke.mjs` 里 `fontFloor` 的特判删除后，archive-os 的输出照常打印最小字号即可。

# 4. 完整验收（一次做完）

## 4.1 对照与效果

- 12 个巧思按 `dev/wip/T4b/plan.md` 5.1 重截全部对照图（巧思 vs 案例同 caseT），逐张查看。
- 案例改前 / 改后字号对照：按 Tfont 第 6.1 节。
- 署名专项：所有带地图的巧思，在每个片段都检查署名可见、不被遮挡（film B/C 与 vertical C 例外）。

## 4.2 smoke

| 对象 | 命令 / 路径 | 次数 |
|---|---|---|
| 22 个保留巧思 + 3 个案例 | `node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4322`（day-night-flip 与 archive-os 由条目声明自动走 GPU；不要另加任何适配器或 `NODE_OPTIONS`） | 连续 3 次 |
| 全量 | 同一命令 | 1 次 |

日志存 `dev/shots/R2/smoke-{1,2,3}.log`，UTF-8；`.log.json` 记录完整命令与环境。

## 4.3 媒体与构建

- 地图巡礼两段 MP4：8–31 秒片段，横竖各一段，可用硬件适配器，重渲后用 ffprobe 确认。
- `node scripts/capture.mjs --base http://localhost:4322`：全部保留的案例与巧思，GPU 条目自动分流。
- `node scripts/build.mjs`：应为 3 cases · 22 patterns。
- `check`、`build:site`。
- 声音：12 个地图巧思用 `renderWav` 导出，检查不削波、峰值 ≤ −1 dBFS。

## 4.4 报告

- 更新 `dev/reports/T4b.md`：逐条执行对照，day-night 的两项结果。
- 新建 `dev/reports/Tfont.md`：按 Tfont 第 6.4 节。
- 新建 `dev/reports/Tdel.md`：删除清单、引用修改清单、`grep` 结果、站点走查结果。
- `dev/wip/*/progress.md` 追加记录。

# 5. 最终答复

列出：

- 四步各自的逐条执行摘要，偏离项单列；
- day-night 的 MAD 与六张图结论；
- 删除后的 build 计数；
- 字号表实施情况与间距失衡清单；
- 三轮 smoke 与全量 smoke 结果，注明哪些条目走了 GPU 及其 renderer；
- 地图巡礼 MP4 与 ffprobe 结果；
- capture、check、build:site 结果；
- 代表性截图路径：每个保留案例横竖各 1 张，加 4 个巧思横竖各 1 张；
- 需要我决定的问题。
