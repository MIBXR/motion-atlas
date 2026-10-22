$stop-that-shit change -- T5r：smoke 的播放检查先等待 seek / play 完成再计时，然后完成全部剩余验收。

# 决定（批准）

- 修改 `scripts/smoke.mjs` 的播放推进检查：
  1. 先 `await m.seek(0)`；
  2. 再 `await m.play()`；
  3. 然后记录 t0，开始原来的 1500ms 窗口。

  原来的 0.5s 推进门槛、各项超时都不变。
- 对于 seek / play 是同步函数的 Demo，`await` 一个非 Promise 值没有影响。
- 在 `docs/pipeline.md` 的协议说明里补一句：`seek` / `play` 可以返回 Promise；检查脚本会等它完成再计时。
- 除这一处外，不改 smoke 的其他逻辑。

# 剩余验收（照 plan-fix-5 的第 2–8 步）

1. 原样命令 `node scripts/smoke.mjs --only archive-os --strict-fonts --base http://localhost:4323`，连续 3 次通过，日志覆盖 `smoke-{1,2,3}.log`，输出打印硬件 renderer。
2. 全量一次：`node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --strict-fonts --base http://localhost:4323`。这同时验证 smoke 改动对其他 46 个 Demo 没有影响。
3. GPU 环境下的 20×3×2 seek 确定性。
4. 竞态专项 4/4 复测。
5. capture 的 GPU 分支实测：`node scripts/capture.mjs --only archive-os --base http://localhost:4323`，查看两张预览。
6. build、check、build:site。
7. 更新报告与 progress。最终答复列出以上各项结果。

若第 1 步仍失败：定位原因后停下报告。
