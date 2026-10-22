$stop-that-shit change -- 精简案例库：删除 6 个案例与它们名下的 16 个巧思，只保留地图巡礼、莱茵生命档案终端、终末地工业协议。

# 0. 背景

用户 2026-10-23 决定：案例库只保留 3 个案例：map-pilgrimage、archive-os、industrial-protocol。其余 6 个案例及只属于它们的 16 个巧思全部删除。主任务已核对：这 16 个巧思的 sources 都只指向被删案例，没有和保留案例交叉。

## 删除清单

- 案例（6）：phantom-battle、broadcast-pack、beat-lyric、mission-fui、gacha-reveal、ink-scroll
- 巧思（16）：alert-state、beat-clock、card-flip-sheen、charge-release、cutin-slash、impact-pop、ink-bleed、lower-third、radar-sweep、ransom-type、seal-stamp、shape-wipe、skew-menu、stinger-bars、target-lock、word-slam

## 保留

- 案例：map-pilgrimage、archive-os、industrial-protocol
- 巧思（22）：
  - map-pilgrimage 名下 12 个；
  - archive-os 名下 5 个：boot-typing、decrypt-reveal、idle-breathing、rolling-digits、wave-array；
  - industrial-protocol 名下 5 个：chamfer-panel、conveyor-flow、hold-confirm、scanline-wipe、text-scramble。

# 1. 删除文件（`git rm`）

- `demos/cases/<6 个>/`、`demos/patterns/<16 个>/`
- `entries/cases/<6 个>.json`、`entries/patterns/<16 个>.json`
- `previews/cases/<6 个>*.jpg`、`previews/patterns/<16 个>*.jpg`
- `docs/research/<6 个案例>.md`
- 生成物：先跑 `node scripts/build.mjs`。若 build 没有清理掉 `agent/cases|patterns/<id>.json` 与 `prompts/cases|patterns/<id>.md` 里属于删除清单的文件，就手动删除。

# 2. 修改引用（逐条照做）

- `README.md`：
  - 案例表删掉这 6 行；
  - 所有“9 个案例 / 38 个巧思”之类的计数改为“3 个案例 / 22 个巧思”；
  - 若有巧思列表，同步删掉。
- 渲染命令的示例路径，把 `demos/cases/beat-lyric/index.html` 改成 `demos/cases/map-pilgrimage/index.html`，`renders/beat-lyric` 改成 `renders/map-pilgrimage`。涉及：
  - `index.html`、`agent.html`；
  - `scripts/render.mjs` 的用法提示；
  - `docs/pipeline.md` 第 305 与 327 行附近。
- `docs/rhythm.md` 第 109 行：把“长按确认（hold-confirm）、蓄力释放（charge-release）这类巧思”改为“长按确认（hold-confirm）这类巧思”，句子其余部分不变。
- 用 `git grep -n -E "<删除清单里的 6 个案例 id 与 16 个巧思 id，用 | 连接>"` 全仓检查，除 `dev/` 下的历史记录（reports、plans、wip）外不得再有引用。网站页面、`assets/`、`docs/`、`kit/`、`scripts/` 都要干净。若某处删除后句子或列表需要改写，而本方案没有给出文字：停下，列出位置和原文问我。
- 再搜一遍计数字样（`9 个案例`、`38 个巧思`、`九个`、`38 patterns` 等），全部改成新数字。
- `dev/polish-round-1.md`：
  - 在第三节末尾加一条：“**范围调整（用户 2026-10-23）**：案例库只保留地图巡礼、莱茵生命档案终端、终末地工业协议；删除其余 6 个案例及其 16 个巧思。T6、T8–T12 取消；T7（工业协议）改为参照终末地真实界面重做，另行规划。”
  - 进度表中 T6、T8–T12 各行的状态改为“已删除”。
- `dev/` 下其他历史文件不改。

# 3. 验证

- `node scripts/build.mjs`：输出应为 3 cases · 22 patterns。
- `node scripts/check.mjs` 通过。
- 站点走查：首页、案例列表、巧思列表、实验室、三个案例详情页、任一巧思详情页，控制台无报错，网络请求无 404。可参照 `dev/wip/T13/site.mjs`；它引用了 gacha-reveal，复制一份到 `dev/wip/Tdel/` 改为用保留的案例。
- `npm run build:site`：通过；dist 中没有被删 id 的任何文件。
