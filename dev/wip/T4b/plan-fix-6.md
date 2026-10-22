$stop-that-shit change -- T4b：day-night-flip 改为条目声明需要 GPU；完成行首分隔符检查与 plan-fix-5 的四处修改，再做验收。

你停得对，成本测量也清楚。决定与接下来的步骤如下。

# 决定：day-night-flip 声明需要 GPU

- 不再追 SwiftShader 下的播放速度。已做的软件 GL 措施全部保留，不回退。
- 在 `entries/patterns/day-night-flip.json` 加 `"renderer": "gpu"`。
- 对应的 smoke / capture 机制（遇到该字段就用 GPU 浏览器测，并打印 renderer；软件渲染时判失败）正在另一个分支 `feat/archive-os-port` 里实现。主任务会在那边验收后合并到本分支。**本分支不要自己实现这个机制，也不要改 `scripts/`。**
- 在合并之前：day-night-flip 的 smoke 用 `--import ./dev/wip/T5r/tools/hardware-browser.mjs` 的等价适配器跑，结果标为“临时：待 GPU 机制合并后复验”。如果本工作树里没有这个文件，就照它的内容在 `dev/wip/T4b/tools/` 下建一个同名适配器。其余 11 个巧思一律走默认路径（只允许 direct-browser）。

# 步骤

1. **行首分隔符检查**：运行你已经准备好的 `portrait-line-starts-plan.json`。若发现竖屏行首出现 `·` 或 `→`，**只列出来**（页面、时刻、文字、截图路径），不要修改，然后继续后面的步骤；最终答复里单列。
2. **执行 `dev/wip/T4b/plan-fix-5.md` 的四处修改**：
   - route S3 构图与标签避开路线；
   - seekable-timeline 底部布局；
   - day-night-flip 的分段映射与夜景色调；
   - film-grain 的 cover 铺满。

   全部条目照做。其中“上移后与卡片重叠就停下”的条件仍然有效。
3. **验证**：
   - 受影响巧思重截全部对照（含 plan-fix-3、plan-fix-5 影响的帧），逐张查看；
   - 11 个巧思（除 day-night-flip）用默认路径 smoke 连续 3 次；day-night-flip 用临时 GPU 适配器跑 3 次；
   - 案例 smoke 连续 2 次（plan-fix-3 改了案例）；案例两段 MP4 重渲（可用硬件适配器），ffprobe；
   - capture（day-night-flip 用临时 GPU 适配器，其余默认）、build、check；
   - 署名专项：所有带地图的巧思在每个片段都检查署名可见、不被遮挡。film B/C 与 vertical C 例外。
4. **报告**：逐条对照表；把 day-night-flip 标为“GPU 声明，待机制合并后复验”。

最终答复列出：行首分隔符清单、四处修改的效果截图路径、各项 smoke 结果（注明路径与适配器）、案例 MP4、署名专项、capture / build / check。
