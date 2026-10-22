$stop-that-shit change -- T5r：撤回着色器预热，引入条目级“需要 GPU”的测试声明，然后完成验收。

你停得对，测量也很清楚。主任务重新权衡后的决定如下。

# 决定

“默认软件 GL 必须通过”是主任务自己加的条件，用户没有要求过。原版是完整的 3D 应用，SwiftShader 无法以可用速度运行它；为了凑这个环境做的预热，反而改变了画面（F23.28 阴影变深），还让硬件 ready 从 1.2s 变成 14.4s。所以：

1. **撤回着色器预热的全部改动**：
   - 包括 1×1 离屏绘制、隐藏查看器预热、`shaders` 进度项及相关登记；
   - 恢复到预热之前的行为与画面。
   - **保留**：pause / seek 取消待启动播放的竞态修复，以及软件 GL 自动用 performance 的降级。
   - 在 `UPSTREAM.md` 里删除预热条目，竞态修复条目保留。
2. **条目级 GPU 声明**：
   - 在 `entries/cases/archive-os.json` 加 `"renderer": "gpu"`。
   - `scripts/smoke.mjs` 与 `scripts/capture.mjs`：遇到该字段的条目，单独为它启动浏览器，加上 `--enable-gpu --use-angle=d3d11 --ignore-gpu-blocklist`（与 `dev/wip/T5r/tools/hardware-browser.mjs` 相同），其余条目照旧。
   - 该条目的输出行打印实际的 WebGL renderer 字符串。
   - 若该浏览器里的 renderer 仍是软件（判定字符串同 §1 的四个关键词），该条目判**失败**，信息为“需要 GPU，当前为软件渲染：<renderer>”。不要跳过。
   - 改动只限这一项。在 `docs/pipeline.md` 的检查说明里补一句该字段的含义。
   - `hardware-browser.mjs` 继续只用于 MP4 导出。

# 验证

1. 撤回后先确认画面复原：在硬件 original 下取 F23.28、F36、F50 三个时刻，与预热之前的版本比较（用本轮之前保存的基准，或在撤回后与现有的 `parity-aligned` 同时刻对照），缩略 MAD 回到之前的水平。
2. 规定的命令，原样不加任何 `--import`：`node scripts/smoke.mjs --only archive-os --strict-fonts --base http://localhost:4323`。连续 3 次通过，日志覆盖 `smoke-{1,2,3}.log`，并确认输出里打印的是硬件 renderer。
3. 全量一次：`node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --strict-fonts --base http://localhost:4323`。
4. seek 确定性 20×3×2：在条目声明的 GPU 环境下跑。
5. 竞态专项 4/4 再跑一次。
6. build、check、build:site。
7. MP4：若第 1 步确认画面与现有 MP4 渲染时的版本一致（现有 MP4 是预热之前的版本），就不重渲，并写明理由；否则重渲。
8. 更新报告：
   - 写明“验收环境由默认软件 GL 改为条目声明的 GPU 环境”是主任务的决定，并附原因；
   - 预热的尝试与撤回，以及测量表，都保留在报告中。

若第 2 步仍失败：测出失败点的原因，停下来报告。
