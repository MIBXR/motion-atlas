$stop-that-shit change -- T5r 返工：默认 smoke（不加任何适配器）在软件 GL 下必须通过；实现方案 §9.4 规定的软件 GL 自动降级。

# 验收发现（偏离方案）

方案 §9.4 规定的命令是 `node scripts/smoke.mjs --only archive-os --strict-fonts --base http://localhost:4323`，不加任何适配器；并且规定：若无头软件渲染太慢导致失败，实时预览在检测到软件 GL 时自动用 `quality=performance`。

你的三次 smoke 却通过 `NODE_OPTIONS --import dev/wip/T5r/tools/hardware-browser.mjs` 注入了硬件 GPU 参数。这一点报告里没有作为偏离单列，而且软件 GL 降级没有实现。

我用规定的命令复跑，连续两次失败：

```
✗ archive-os
    脚本执行超时：window.__motion.seek(23.28)
smoke 0/1 passed
```

（约 39s，失败在阵列第一次 3D 绘制附近。）

# 要做

1. **实现软件 GL 检测与自动降级**，放在外层 `demos/cases/archive-os/script.js` 决定 iframe 的 quality 参数之前：
   - 用一个临时 canvas 取 WebGL 的 `UNMASKED_RENDERER_WEBGL`（`WEBGL_debug_renderer_info`）；
   - 字符串中含 `SwiftShader`、`llvmpipe`、`Software`、`Microsoft Basic Render` 中任意一个（不区分大小写），即判定为软件 GL；
   - 判定为软件 GL、且 URL 没有显式给出 `quality` 时，用 `quality=performance`。URL 显式给出的 quality 一律优先；MP4 导出脚本显式传 `quality=original`，不受影响；
   - 在 `__motion` 上暴露只读的 `quality` 与 `softwareGL`，便于测试读取。
2. 用规定的命令（**不加任何 `--import`、不改 `NODE_OPTIONS`**）跑 smoke。
   - 若 performance 画质下仍超时：测量 `seek(23.28)`（以及失败的其他 seek）在 performance 画质下的耗时，找出耗时在哪一步（着色器编译、AO、阴影、首帧绘制），写进报告，然后停下来问我。
   - 不要放宽 smoke 超时，也不要再换浏览器参数。
3. 通过后：
   - 用规定的命令连续 3 次通过，日志覆盖 `dev/shots/T5r/smoke-{1,2,3}.log`；
   - 再用 `node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --strict-fonts --base http://localhost:4323` 跑一次全量（这个适配器只关代理，方案允许）。
4. 报告：
   - 在逐条执行表里把“smoke 用了硬件适配器”列为已纠正的偏离；
   - `dev/wip/T5r/smoke-series.mjs` 改成不注入适配器；
   - `hardware-browser.mjs` 只保留给 MP4 渲染使用（方案 §9.8 允许），并写明用途。
5. 若降级逻辑影响到 seek 确定性测试（20 × 3 × 2）的设置，在默认环境下重跑一次，结果写进报告。

# 约束

- 同前：不 commit / push / 切分支；只改 `demos/cases/archive-os/script.js`、`dev/wip/T5r/`、`dev/reports/T5r.md`、`docs/research/archive-os.md`（补一句降级说明）。
- 注意：另一个工作树里有浏览器测试在跑。若怀疑超时由机器负载造成，先运行 `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'headless' }` 记录同时运行的无头浏览器数量，再在报告里写明。但不能以负载为理由跳过第 1 项。
