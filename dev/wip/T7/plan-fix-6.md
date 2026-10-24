$stop-that-shit change -- T7：GPU 探针支持 Canvas 2D / DOM 页面；竖屏 Zz 移到设施中心图标右上；然后完成交付。

决定如下。

1. **GPU 探针（批准修改 `scripts/smoke.mjs`、`scripts/capture.mjs`，只改这一处）**：
   - 页面中找不到 WebGL canvas 时，在页面里临时创建一个 1×1 离屏 canvas，取 `webgl` 上下文；
   - 读取 `WEBGL_debug_renderer_info` 的 `UNMASKED_RENDERER_WEBGL`，然后 `loseContext()` 并移除这个 canvas；
   - 软件渲染的判定规则不变（四个关键词）。
   - 改完后对 archive-os、day-night-flip 各跑一次 smoke，确认原有 GPU 条目不受影响。
2. **竖屏 Zz**：放在设施中心图标的右上方，即相对设施中心 (x +28, y −36)，字号保持 0.8 倍。横屏不变。
   - 竖屏 S1、S2 全部截图重新检查，Zz 与任何名牌、设施框都不得相交；
   - 若仍相交，停下报告实测矩形。

# 验收

照 plan-fix-5 的验收 1–5 完成：

1. 原命令连续 3 次通过，打印硬件 renderer；
2. 两段全长 MP4，ffprobe，抽 6 帧；
3. capture；
4. build、check、build:site；
5. 更新报告。

最终答复列出：探针改动、两项 GPU 条目复测、3 次 smoke 结果、Zz 检查结论、MP4 路径与规格、构建结果。
