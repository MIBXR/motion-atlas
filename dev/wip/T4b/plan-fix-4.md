$stop-that-shit change -- T4b：三项决定，加上 plan-fix-3 的署名与竖屏断行，然后在默认路径下完成验收。

你把三处问题都单列出来，做得对。决定如下。

# 决定 1：smoke 运行路径（不接受 D3D11 作为验收路径）

验收路径只允许 `node --import ./dev/wip/T4a/tools/direct-browser.mjs …`。这个适配器只关代理，不改 GL 后端。`hardware-browser.mjs` 只可用于 MP4 导出和对照诊断。

要让三个实时地图巡礼巧思（route-draw-marker、alert-reroute、day-night-flip）在软件 GL 下通过：

1. 先读地图巡礼案例在软件 GL 下的全部降级措施（T4a 报告与 `dev/wip/T4a/progress.md` 中的记录：MSAA 关闭、颗粒层作为合成层、未出场路线隐藏、精度测量处理等），找到它们在 `script.js` 里的代码。
2. 把同样的检测与降级原样复制到这三个巧思，用同样的判定条件；硬件 GL 下行为不变。
3. 若仍未通过：测量这三个巧思在 SwiftShader 下的单帧耗时构成（瓦片绘制、3D 建筑、覆盖层、颗粒），写进报告，然后停下来问我。不要改 smoke、不要换 GL 后端、不要删减画面内容。

# 决定 2：route-draw-marker S1 标签避让（允许例外）

只在这个巧思里：标签避让不再保留已隐藏的 HUD 区域，只避开舞台边缘（沿用源规则的边距）与其他标签 / 标记。其余避让逻辑与候选框顺序不变。完成后 KIX、Kyoto 的双语标签在 S1 全程可见（入场窗口之后）。

# 决定 3：alert-reroute 竖屏标签淡入（允许例外）

只在这个巧思里：TAKANOHARA、YAMATO-SAIDAIJI 两个标签取消 `minZoom` 带来的透明度衰减；入场动画与其他规则不变。横屏不受影响。

另外，在报告的遗留问题里记一条：案例本身竖屏 caseT≈46.5 时这两个标签也可能同样很淡。用一张案例竖屏截图确认并附上路径，**不要改案例**。

# 然后执行 `dev/wip/T4b/plan-fix-3.md`（地图署名、竖屏片名副标题断行、分隔符行首检查），全部条目照做。

# 最终验收（全部在默认路径下）

1. 12 项 smoke 连续 3 次，日志覆盖 `smoke-{1,2,3}.log`，`.log.json` 里记录完整命令与 `NODE_OPTIONS`（应为空或只含 direct-browser）。
2. 全量 smoke 一次。
3. 案例 smoke 连续 2 次（plan-fix-3 改了案例）。
4. 受影响巧思重截对照并逐张查看；案例 MP4 重渲（MP4 可用 hardware-browser），ffprobe。
5. capture（默认路径），build、check。
6. 更新报告：在逐条对照表中，把此前用 D3D11 跑的 smoke / capture 标为“已纠正的偏离”。

最终答复列出：降级措施清单与效果、三轮 smoke、全量、案例 smoke、两项例外的效果截图路径、plan-fix-3 的结果、行首分隔符检查清单、MP4 是否重渲。
