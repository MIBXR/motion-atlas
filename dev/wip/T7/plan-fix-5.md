$stop-that-shit change -- T7：条目声明 renderer: gpu，竖屏 Zz 移入设施框内，然后完成 smoke、MP4 与构建交付。

测量做得很清楚：`render(t)` 只要约 0.5ms，瓶颈在无头软件合成，不在计算。决定如下。

1. **GPU 声明**：在 `entries/cases/industrial-protocol.json` 加 `"renderer": "gpu"`。这与 archive-os、day-night-flip 的处理一致；本分支的 smoke / capture 已支持该字段。本轮的性能优化保留。
2. **竖屏 Zz**：竖屏下所有待机设施的 `Zz` 改放在设施框**内部**右上角：相对右上角 x −40、y +10，字号为原来的 0.8 倍。横屏保持 (+8, −28) 不变。完成后检查竖屏 S1、S2 截图，确认没有任何 Zz 与名牌或其他设施相交。

# 验收

1. 原命令原样不变（不加参数、不设环境变量）：
   `node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --only industrial-protocol --base http://localhost:4325`
   连续 3 次通过；输出中应打印硬件 renderer。若失败，停下报告。
2. 用最新源码重渲横竖两段全长 MP4（60s、30fps、带音轨），ffprobe 确认，解码抽 6 帧查看。
3. `capture --only industrial-protocol`（GPU 条目会自动分流）。
4. build、check（只允许字号类旧报错）、build:site。
5. 更新报告。

最终答复列出：
- smoke 结果（含 renderer）；
- 竖屏 Zz 检查结论与截图路径；
- 两段 MP4 路径与规格；
- 构建结果。
