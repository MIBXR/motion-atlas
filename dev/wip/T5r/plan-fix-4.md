$stop-that-shit change -- T5r：修 pause/play 竞态，把全部着色器预热移入加载阶段，然后用默认命令完成验收。

你停下来问是对的。批准以下两项，其余约束不变（performance 预设、smoke 超时、浏览器参数都不改）。

# 1. 修竞态（批准）

- `pause()` 必须取消所有尚未开始的播放请求，包括异步重建之后挂上的 `then(startPlay)`。做法：用递增的请求序号或 AbortController，启动前核对。
- `seek()` 同样取消待启动的播放。
- 加一个专项测试：在重建进行中依次调用 play、pause；重建完成后，确认没有开始播放，胶片时刻停在 pause 时的位置。横竖都测。

# 2. 着色器预热移入加载阶段（批准）

目标：胶片里会用到的每一个 WebGL 程序，都在 ready 之前编译并链接完成；第一次绘制时不再出现 `getProgramParameter` / `getProgramInfoLog` 的长阻塞。

- 在 film 的预加载流程里，用**当前实际画质预设**的最终材质状态（包括 transmission、透明度、磨砂 / 清晰两种玻璃状态，以及拆解时会出现的材质）做预热：
  1. 对主场景：所有会出现的档案实体与 `Optical_Diffuser` 等材质，调用 `renderer.compile(scene, camera)`。
  2. 对查看器场景：同样调用一次。若查看器场景要到打开时才创建，就在预加载阶段离屏创建一次（不显示），编译后释放或保留复用。
  3. 编译之后，在一个 1×1 的离屏渲染目标上，对每类材质各绘制一次，强制完成链接与首次使用检查；完成后恢复原状态，不留下可见副作用。
- 预加载进度里把这一步单列为 “shaders”，报告耗时。
- 不改材质、算法、画质参数或上游视觉。改动登记进 UPSTREAM.md（属于 §3.3 / §4.2 的 film 预加载）。

## 测量（写进报告）

- 软件 GL（默认无头）与硬件 GL（只用于测量，可以用 hardware-browser 适配器）下的 ready 时间；
- 预热前后，`seek(23.28)`、`seek(A+1)`、`seek(A+15)`（查看器）各自的耗时；
- 预热后的长任务中，`WebGLProgram` 首次使用检查的累计耗时。目标：ready 之后为 0 或接近 0。

# 3. 验收（默认命令，不加任何 `--import`，不设 `NODE_OPTIONS`）

1. `node scripts/smoke.mjs --only archive-os --strict-fonts --base http://localhost:4323` 连续 3 次通过，日志覆盖 `smoke-{1,2,3}.log`。
2. `node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --strict-fonts --base http://localhost:4323` 全量一次。
3. 默认软件 GL 下的 20×3×2 seek 确定性。
4. build、check、build:site。
5. 若预热改变了画面：重渲 MP4（硬件适配器只用于 MP4），并重截对照中受影响的帧。
6. 若用默认命令仍然失败：测出失败点的耗时与原因，停下来报告，不要继续改。

最终答复列出：竞态测试结果、预热前后的测量表、3 次 smoke、全量 smoke、确定性、build/check、是否重渲。
