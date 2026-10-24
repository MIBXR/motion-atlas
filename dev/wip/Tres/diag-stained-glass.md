$stop-that-shit change -- 诊断 stained-glass 实时播放时时间几乎不前进的原因（只测量、不改源码）。

# 现象

- 播放器 smoke（`--gpu --ready-timeout 180`）连续两次失败：播放 1.5 秒后，`__motion.time` 只到 0.10 / 0.117 秒。
- 单帧 `await seek(t)` 耗时只有 9–105 ms。
- kit 每个 rAF 的时间步上限是 0.1 秒（`kit/motion-kit.js` 约第 205 行）。所以这意味着 1.5 秒内只跑了 1–2 个 rAF，主线程被长时间占用。

# 要做的测量

脚本放 `dev/wip/Tres/tools/diag-sg.mjs`。

1. **环境**：浏览器启动方式与 smoke 的 GPU 任务完全相同（同一 `launch` 参数，视口 1280×720）。打开 `http://localhost:4328/demos/styles/player/?style=stained-glass&render=1&orient=landscape`，等待 `__motion.ready`。
2. **复现 smoke 的顺序**：
   - `pause`；
   - 以 step 0.2 从 0 到 D 依次 `seek`，**不 await**，和 smoke 一样；
   - `seek(D)`；
   - `await seek(0)`；
   - `play()`；
   - 等待 1.5 秒后读 `time`；
   - `pause`。
3. **在第 2 步的播放阶段采集以下数据**：
   - 父页面与 iframe 各自的 rAF 时间戳序列；
   - 用 `PerformanceObserver({type: 'longtask'})` 在父页面与 iframe 中各自记录长任务（起点、时长）；
   - 每次 `contentWindow.render(t)` 的开始、结束与 t：在父页面里包装 `frame.contentWindow.render`，只用于测量，不改文件；
   - 用 CDP 的 `Tracing` 或 `Profiler` 采样主线程，输出耗时最多的前 10 个函数，以及所在的文件与行。
4. **对照实验**，每项单独运行并记录 1.5 秒后的 time：
   - (a) 不做第 2 步的 seek 扫描，直接 `seek(0)` 后 play；
   - (b) 做扫描，但每次 seek 都 await；
   - (c) 视口 1920×1080；
   - (d) 不加 `render=1`。
5. **同样的测量也做在 `swiss-motion` 上**，作为正常基线。

# 产物

- `dev/wip/Tres/diag-stained-glass.md` 末尾追加“结果”一节，内容包括：
  - 每个实验 1.5 秒后的 time；
  - 长任务列表（前 10 个）；
  - render 调用时序摘要；
  - 热点函数前 10（文件:行）；
  - 你根据数据得出的直接原因，用一句话写，并附证据位置。
- 不改任何源码，不提方案，不 commit。

# 结果

测量日期：2026-10-24（Asia/Taipei）。测量脚本为 [tools/diag-sg.mjs](tools/diag-sg.mjs)，以下十组各使用独立的全新浏览器实例、单次运行。

**直接原因（由测量数据推断）：stained-glass 在 GPU 进程侧的长耗时渲染任务使 rAF 帧供给稀疏，时间轴又将每帧步长截到 0.1 秒，因此约 1.5 秒墙钟时间仅累计 0–0.244 秒动画时间。** 证据位置：原始组 [数据](evidence/diag-sg/stained-glass-smoke.json) 的 `parent.raf`、`iframe.raf`、`renders.calls`、`profile`，同组 [trace](evidence/diag-sg/stained-glass-smoke.trace.json) 的 `GPUTask` / `RunTask`，以及 `kit/motion-kit.js:203–205`。

**环境与测量口径**

浏览器为 `Edg/155.0.4283.62`，可执行文件为 `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`；Node 为 `v22.14.0`。WebGL 探针结果为 `ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A0) Direct3D11 vs_5_0 ps_5_0, D3D11)`。使用 smoke 相同的 `scripts/lib/cdp.mjs`，调用 `launch({ width: 1280, height: 720, args: ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist'] })`，并导入 smoke 同样使用的 `dev/wip/T4a/tools/direct-browser.mjs` 添加 `--no-proxy-server`；(c) 组将 width/height 改为 1920/1080。所有组实际 iframe 视口均为 1920×1080，页面可见状态均为 `visible`。

入口为 `http://localhost:4328/demos/styles/player/?style=<style>&render=1&orient=landscape`；(d) 仅省略 `render=1`。本地服务来自当前 `feat/resources` 工作树，HEAD 为 `5a4f287`，包含任务开始前已有的未提交内容。当前 HTTP 返回的 kit、player 和两个样片入口与工作树文件逐字节相同，见 [environment.json](evidence/diag-sg/environment.json)。

每组均等待 `__motion.ready`（上限 180 秒），执行 pause → 指定扫描 → `await seek(0)` → play → 页面内 `setTimeout(1500)` → 读取 time → pause；原始组与 (c)/(d) 的扫描步长为 0.2、每次 seek 不 await，随后另调用一次 `seek(D)`；(a) 省略扫描，(b) 扫描中每次 seek 均 await。stained-glass 的 D=56.5 秒，swiss-motion 的 D=44 秒。扫描单独允许 600 秒，扫描与归零耗时不计入播放窗口。

父页与 iframe 各自运行 rAF 探针与 `PerformanceObserver({type:'longtask'})`；iframe 时钟按 `performance.timeOrigin` 换算到父页坐标。父页包装 `frame.contentWindow.render`，保留原函数返回值，记录调用起止和 t。CDP Profiler 采样间隔为 1000 µs，同时采集浏览器 trace；CPU 汇总按 `diag-sg-play-start` / `diag-sg-play-end` 裁剪，仅统计播放窗口。所有测量只使用运行时注入，被测文件未写入。

运行全部实验：

```powershell
node dev/wip/Tres/tools/diag-sg.mjs
```

也可用 `--style stained-glass` 或 `--style swiss-motion`，配合 `--case smoke,a-no-scan,b-await-scan,c-1920,d-no-render` 选择单组或子集。

**1.5 秒后的动画时间**

| 实验 | stained-glass time（s） | swiss-motion time（s） | 实际播放窗口 SG / SW（ms） | SG rAF 父 / 子 | SW rAF 父 / 子 |
| --- | --- | --- | --- | --- | --- |
| 原始 smoke 顺序 | [0.200000](evidence/diag-sg/stained-glass-smoke.json) | [1.490300](evidence/diag-sg/swiss-motion-smoke.json) | 1514.0 / 1503.3 | 2 / 2 | 90 / 90 |
| (a) 不扫描 | [0.243900](evidence/diag-sg/stained-glass-a-no-scan.json) | [1.491800](evidence/diag-sg/swiss-motion-a-no-scan.json) | 1508.7 / 1506.5 | 3 / 3 | 90 / 90 |
| (b) 每次 seek 都 await | [0.000000](evidence/diag-sg/stained-glass-b-await-scan.json) | [1.497900](evidence/diag-sg/swiss-motion-b-await-scan.json) | 1505.7 / 1505.1 | 0 / 0 | 90 / 90 |
| (c) 1920×1080 | [0.200000](evidence/diag-sg/stained-glass-c-1920.json) | [1.501300](evidence/diag-sg/swiss-motion-c-1920.json) | 1505.4 / 1504.3 | 2 / 2 | 91 / 91 |
| (d) 不带 render=1 | [0.200000](evidence/diag-sg/stained-glass-d-no-render.json) | [1.491000](evidence/diag-sg/swiss-motion-d-no-render.json) | 1506.1 / 1504.8 | 2 / 2 | 90 / 90 |

十组播放起点 time 均为 0。按 smoke 现有的 `t1 > t0 + 0.5` 判定，stained-glass 五组全部失败，swiss-motion 五组全部通过；十组捕获到的未处理异常与 `console.error` 均为 0。上表实际窗口为 play 到读值的墙钟时长，不将定时器设为 1500 ms 等同于实际恰好等待 1500 ms。

**rAF 时序**

| 样片 / 实验 | 首 / 末父页 rAF 回调（ms） | 父页最大相邻 rAF 时间戳间隔（ms） | iframe 最大间隔（ms） |
| --- | --- | --- | --- |
| stained-glass · 原始 smoke 顺序 | 204.300 / 1075.100 | 867.400 | 867.400 |
| stained-glass · (a) 不扫描 | 47.000 / 1288.700 | 817.700 | 817.700 |
| stained-glass · (b) 每次 seek 都 await | — / — | — | — |
| stained-glass · (c) 1920×1080 | 186.200 / 984.900 | 800.800 | 800.800 |
| stained-glass · (d) 不带 render=1 | 127.600 / 961.300 | 834.000 | 833.900 |
| swiss-motion · 原始 smoke 顺序 | 6.400 / 1490.800 | 16.900 | 17.000 |
| swiss-motion · (a) 不扫描 | 7.800 / 1492.600 | 16.900 | 16.900 |
| swiss-motion · (b) 每次 seek 都 await | 13.900 / 1498.700 | 17.000 | 17.000 |
| swiss-motion · (c) 1920×1080 | 0.300 / 1499.400 | 17.200 | 17.000 |
| swiss-motion · (d) 不带 render=1 | 6.900 / 1491.400 | 17.000 | 16.900 |

stained-glass 原始组的完整父页 rAF 时间戳为 [194.600, 1062.000] ms，对应回调执行时刻为 [204.300, 1075.100] ms；iframe 时间戳为 [194.100, 1061.500] ms，对应回调执行时刻为 [241.000, 1158.900] ms。(b) 组的两组序列均为空。swiss-motion 原始组有 90 次 rAF，最大相邻间隔 16.900 ms。十组完整序列分别保存在各数据文件的 `parent.raf` / `iframe.raf`，不是仅保留计数。

**长任务列表（各组最多前 10 个）**

十组的父页与 iframe 均支持 longtask 观察类型，但各自的 `PerformanceObserver` 记录列表均为空（0 条），没有可列出的 API 前 10 条；完整空列表保留在各数据文件的 `parent.longtasks` / `iframe.longtasks`。这与 CDP trace 的任务时长存在差异，因此不以 API 空列表推断主线程没有超过 50 ms 的任务。

以下是 CDP trace 中页面 `CrRendererMain` 的 `RunTask ≥ 50 ms`，每组按时长取最多 10 个，实际共 6 个；它们作为 trace 证据单独列出，不冒充 PerformanceObserver 的条目。起点相对于 play。

| 样片 / 实验 | 任务 | 起点（ms） | 时长（ms） | trace pid / tid |
| --- | --- | --- | --- | --- |
| stained-glass · 原始 smoke 顺序 | RunTask | 1074.971 | 84.424 | 25908 / 28608 |
| stained-glass · (a) 不扫描 | RunTask | 1288.633 | 100.645 | 21828 / 19532 |
| stained-glass · (a) 不扫描 | RunTask | 461.694 | 80.073 | 21828 / 19532 |
| stained-glass · (c) 1920×1080 | RunTask | 984.837 | 88.729 | 7292 / 14820 |
| stained-glass · (d) 不带 render=1 | RunTask | 127.719 | 110.058 | 38488 / 36116 |
| stained-glass · (d) 不带 render=1 | RunTask | 961.442 | 96.812 | 38488 / 36116 |

stained-glass (b) 与 swiss-motion 五组的 trace 均没有达到 50 ms 的页面主线程 RunTask。

**render 调用时序摘要**

| 样片 / 实验 | 播放期调用数 | 同步总时长（ms） | 最小 / 中位 / 最大（ms） | pause/扫描阶段实际调用数 |
| --- | --- | --- | --- | --- |
| stained-glass · 原始 smoke 顺序 | 2 | 119.900 | 36.300 / 83.600 / 83.600 | 1 |
| stained-glass · (a) 不扫描 | 3 | 217.200 | 38.300 / 79.400 / 99.500 | 1 |
| stained-glass · (b) 每次 seek 都 await | 0 | 0.000 | — / — / — | 284 |
| stained-glass · (c) 1920×1080 | 2 | 121.800 | 33.700 / 88.100 / 88.100 | 1 |
| stained-glass · (d) 不带 render=1 | 2 | 204.300 | 95.800 / 108.500 / 108.500 | 2 |
| swiss-motion · 原始 smoke 顺序 | 90 | 11.900 | 0.000 / 0.100 / 0.400 | 1 |
| swiss-motion · (a) 不扫描 | 90 | 12.900 | 0.000 / 0.100 / 0.700 | 1 |
| swiss-motion · (b) 每次 seek 都 await | 90 | 10.000 | 0.000 / 0.100 / 0.400 | 221 |
| swiss-motion · (c) 1920×1080 | 91 | 11.500 | 0.000 / 0.100 / 0.400 | 1 |
| swiss-motion · (d) 不带 render=1 | 90 | 10.700 | 0.000 / 0.100 / 0.500 | 1 |

下表列出 stained-glass 播放窗口内的全部 render 调用，start/end 相对于 play；这些调用均同步返回。swiss-motion 的每组 90–91 次调用全量保存在 `renders.calls`，包含 t、start、returned、end，报告上表给出分布摘要。

| stained-glass 实验 | t（s） | start（ms） | end（ms） | 同步时长（ms） |
| --- | --- | --- | --- | --- |
| 原始 smoke 顺序 | 0.100000 | 204.500 | 240.800 | 36.300 |
| 原始 smoke 顺序 | 0.200000 | 1075.200 | 1158.800 | 83.600 |
| (a) 不扫描 | 0.043900 | 47.300 | 85.600 | 38.300 |
| (a) 不扫描 | 0.143900 | 461.800 | 541.200 | 79.400 |
| (a) 不扫描 | 0.243900 | 1288.700 | 1388.200 | 99.500 |
| (c) 1920×1080 | 0.100000 | 186.600 | 220.300 | 33.700 |
| (c) 1920×1080 | 0.200000 | 984.900 | 1073.000 | 88.100 |
| (d) 不带 render=1 | 0.100000 | 128.100 | 236.600 | 108.500 |
| (d) 不带 render=1 | 0.200000 | 961.400 | 1057.200 | 95.800 |

原始 stained-glass 扫描发出 284 次 seek，实际 iframe render 只有 1 次（t=56.5）；随后 seek(0) 的 render 用时 27.000 ms。实际合并逻辑位于 `demos/styles/player/player.js:48–58`，原始所有阶段记录见 `renders.allPhases`。因此本次原始扫描没有形成 284 次未完成的 iframe render。

(b) 组 stained-glass 扫描实际执行 284 次 render，耗时 275251.200 ms，随后归零耗时 1037.500 ms；进入播放窗口后没有 render 调用，time 保持 0。swiss-motion 的 (b) 扫描实际执行 221 次 render，用时 71.200 ms。

**页面主线程与 GPU 进程任务的对应关系**

| 样片 / 实验 | 页面 RunTask 总覆盖（ms） | Profiler idle 估计（ms） | 最长完整 GPUTask 的 dur / tdur（ms） | 该 GPUTask 起点（ms） |
| --- | --- | --- | --- | --- |
| stained-glass · 原始 smoke 顺序 | 125.560 | 1380.039 | 703.265 / 694.451 | 220.075 |
| stained-glass · (a) 不扫描 | 223.234 | 1285.296 | 675.462 / 668.078 | 462.711 |
| stained-glass · (b) 每次 seek 都 await | 1.807 | 1503.371 | 618.070 / 611.759 | 153.606 |
| stained-glass · (c) 1920×1080 | 126.906 | 1377.919 | 635.501 / 619.134 | 201.801 |
| stained-glass · (d) 不带 render=1 | 209.466 | 1293.629 | 698.262 / 688.248 | 129.181 |
| swiss-motion · 原始 smoke 顺序 | 85.588 | 1386.783 | 0.782 / 0.753 | 975.864 |
| swiss-motion · (a) 不扫描 | 93.944 | 1386.156 | 0.859 / 0.759 | 756.092 |
| swiss-motion · (b) 每次 seek 都 await | 86.689 | 1386.823 | 0.757 / 0.671 | 283.220 |
| swiss-motion · (c) 1920×1080 | 80.521 | 1395.964 | 0.882 / 0.806 | 758.390 |
| swiss-motion · (d) 不带 render=1 | 91.995 | 1381.227 | 1.813 / 1.807 | 737.344 |

GPUTask 仅取 `args.data.renderer_pid` 等于被测页面 renderer pid 的记录；trace 元数据将这些线程标为 GPU 进程的 `CrGpuMain`。`dur` / `tdur` 为 trace 的原始时长字段，以上保留为毫秒。最长任务的调度调用点为 `gpu/command_buffer/service/scheduler.cc:654` 的 `RunNextTask`；这是 trace 返回的浏览器内部位置。

原始 stained-glass 中，首个 render 在 240.800 ms 返回，第二个到 1075.200 ms 才开始；中间 834.400 ms 区间，页面主线程 RunTask 总覆盖仅 2.344 ms，同页 GPUTask 覆盖 827.350 ms。原始组整个播放窗口的页面 RunTask 约 125.560 ms，Profiler idle 约 1380.039 ms；这支持将约 0.8 秒的主要帧空档定位到 GPU 进程侧，而不是把整个空档归为页面 JS 执行。

原始 stained-glass 与 swiss-motion 的完整 GPUTask 前 10 项如下；跨越 trace 结束点而未结束的任务只保留在原始 trace 中，不将其当成完整任务来排名。

| 样片 | 排名 | 起点（ms） | dur（ms） | tdur（ms） | GPU pid / tid |
| --- | --- | --- | --- | --- | --- |
| stained-glass | 1 | 220.075 | 703.265 | 694.451 | 25044 / 17844 |
| stained-glass | 2 | 927.478 | 143.602 | 140.676 | 25044 / 17844 |
| stained-glass | 3 | 153.554 | 26.981 | 3.340 | 25044 / 17844 |
| stained-glass | 4 | 181.080 | 19.878 | 2.126 | 25044 / 17844 |
| stained-glass | 5 | 206.155 | 13.486 | 13.151 | 25044 / 17844 |
| stained-glass | 6 | 201.136 | 0.898 | 0.442 | 25044 / 17844 |
| stained-glass | 7 | 219.702 | 0.355 | 0.356 | 25044 / 17844 |
| stained-glass | 8 | 180.760 | 0.306 | 0.307 | 25044 / 17844 |
| stained-glass | 9 | 1071.533 | 0.164 | 0.164 | 25044 / 17844 |
| stained-glass | 10 | 202.075 | 0.121 | 0.120 | 25044 / 17844 |
| swiss-motion | 1 | 975.864 | 0.782 | 0.753 | 32796 / 12448 |
| swiss-motion | 2 | 1142.715 | 0.543 | 0.499 | 32796 / 12448 |
| swiss-motion | 3 | 759.900 | 0.532 | 0.499 | 32796 / 12448 |
| swiss-motion | 4 | 992.539 | 0.512 | 0.507 | 32796 / 12448 |
| swiss-motion | 5 | 392.260 | 0.494 | 0.493 | 32796 / 12448 |
| swiss-motion | 6 | 825.805 | 0.494 | 0.408 | 32796 / 12448 |
| swiss-motion | 7 | 474.373 | 0.492 | 0.483 | 32796 / 12448 |
| swiss-motion | 8 | 459.256 | 0.478 | 0.478 | 32796 / 12448 |
| swiss-motion | 9 | 1342.806 | 0.478 | 0.358 | 32796 / 12448 |
| swiss-motion | 10 | 1359.200 | 0.475 | 0.365 | 32796 / 12448 |

**主线程热点函数前 10 项（文件:行）**

以下每组按含子调用采样耗时（inclusive）排序，保留 self 以区分函数自身与调用链；父子行不能相加。采样结果为时间估计，短函数可能没有命中样本，源码行号为 CDP callFrame 的一基定义行。`SG/` 代表 `resources/lemo-opuscar/styles/stained-glass/demo/`，`SW/` 代表 `resources/lemo-opuscar/styles/swiss-motion/demo/`；原生 API 没有 JS 文件行号，空 URL 但有源码行的记录标为运行时注入。

**stained-glass · 原始 smoke 顺序**（[原始 CPU profile](evidence/diag-sg/stained-glass-smoke.profile.json)）

| 排名 | 函数 | 文件:行 | self（ms） | inclusive（ms） |
| --- | --- | --- | --- | --- |
| 1 | `window.render` | `SG/main.js:19` | 0.000 | 114.571 |
| 2 | `frame.contentWindow.render` | `运行时注入:26` | 0.000 | 114.571 |
| 3 | `(anonymous)` | `demos/styles/player/player.js:50` | 0.000 | 114.571 |
| 4 | `renderScene` | `SG/scene.js:21` | 0.000 | 114.158 |
| 5 | `drawLancet` | `SG/window.js:233` | 1.605 | 94.943 |
| 6 | `piece` | `SG/glass.js:110` | 27.379 | 91.735 |
| 7 | `mosaic` | `SG/window.js:168` | 1.603 | 67.745 |
| 8 | `render` | `SG/comp.js:157` | 3.210 | 18.017 |
| 9 | `up` | `SG/comp.js:152` | 1.671 | 14.807 |
| 10 | `brush` | `SG/glass.js:61` | 8.128 | 13.569 |

**stained-glass · (a) 不扫描**（[原始 CPU profile](evidence/diag-sg/stained-glass-a-no-scan.profile.json)）

| 排名 | 函数 | 文件:行 | self（ms） | inclusive（ms） |
| --- | --- | --- | --- | --- |
| 1 | `frame.contentWindow.render` | `运行时注入:26` | 1.280 | 204.290 |
| 2 | `(anonymous)` | `demos/styles/player/player.js:50` | 0.000 | 204.290 |
| 3 | `renderScene` | `SG/scene.js:21` | 0.000 | 203.010 |
| 4 | `window.render` | `SG/main.js:19` | 0.000 | 203.010 |
| 5 | `drawLancet` | `SG/window.js:233` | 0.000 | 159.918 |
| 6 | `piece` | `SG/glass.js:110` | 30.235 | 147.522 |
| 7 | `mosaic` | `SG/window.js:168` | 2.949 | 109.951 |
| 8 | `render` | `SG/comp.js:157` | 1.592 | 41.949 |
| 9 | `texImage2D` | `V8 / 浏览器原生（无 JS 行号）` | 40.357 | 40.357 |
| 10 | `up` | `SG/comp.js:152` | 0.000 | 40.357 |

**stained-glass · (b) 每次 seek 都 await**（[原始 CPU profile](evidence/diag-sg/stained-glass-b-await-scan.profile.json)）

| 排名 | 函数 | 文件:行 | self（ms） | inclusive（ms） |
| --- | --- | --- | --- | --- |
| 1 | `mark` | `V8 / 浏览器原生（无 JS 行号）` | 1.057 | 1.057 |
| 2 | `(anonymous)` | `运行时注入:1` | 0.000 | 1.057 |
| 3 | `(anonymous)` | `运行时注入:1` | 0.000 | 1.057 |

本组只采样到 3 项非 idle/program 记录，播放窗口没有执行样片 render，不补造其余条目。

**stained-glass · (c) 1920×1080**（[原始 CPU profile](evidence/diag-sg/stained-glass-c-1920.profile.json)）

| 排名 | 函数 | 文件:行 | self（ms） | inclusive（ms） |
| --- | --- | --- | --- | --- |
| 1 | `renderScene` | `SG/scene.js:21` | 0.000 | 112.555 |
| 2 | `window.render` | `SG/main.js:19` | 0.000 | 112.555 |
| 3 | `frame.contentWindow.render` | `运行时注入:26` | 0.000 | 112.555 |
| 4 | `(anonymous)` | `demos/styles/player/player.js:50` | 0.000 | 112.555 |
| 5 | `drawLancet` | `SG/window.js:233` | 1.658 | 96.651 |
| 6 | `piece` | `SG/glass.js:110` | 13.102 | 88.341 |
| 7 | `mosaic` | `SG/window.js:168` | 2.734 | 67.840 |
| 8 | `vineCurl` | `SG/window.js:49` | 4.825 | 18.833 |
| 9 | `paint` | `SG/window.js:181` | 0.000 | 18.833 |
| 10 | `fill` | `V8 / 浏览器原生（无 JS 行号）` | 18.736 | 18.736 |

**stained-glass · (d) 不带 render=1**（[原始 CPU profile](evidence/diag-sg/stained-glass-d-no-render.profile.json)）

| 排名 | 函数 | 文件:行 | self（ms） | inclusive（ms） |
| --- | --- | --- | --- | --- |
| 1 | `renderScene` | `SG/scene.js:21` | 0.000 | 198.017 |
| 2 | `window.render` | `SG/main.js:19` | 0.000 | 198.017 |
| 3 | `frame.contentWindow.render` | `运行时注入:26` | 0.000 | 198.017 |
| 4 | `(anonymous)` | `demos/styles/player/player.js:50` | 0.000 | 198.017 |
| 5 | `drawLancet` | `SG/window.js:233` | 0.000 | 173.903 |
| 6 | `piece` | `SG/glass.js:110` | 37.180 | 167.365 |
| 7 | `mosaic` | `SG/window.js:168` | 3.345 | 123.976 |
| 8 | `brush` | `SG/glass.js:61` | 22.734 | 34.088 |
| 9 | `fill` | `V8 / 浏览器原生（无 JS 行号）` | 29.050 | 29.050 |
| 10 | `vineCurl` | `SG/window.js:49` | 2.968 | 26.858 |

**swiss-motion · 原始 smoke 顺序**（[原始 CPU profile](evidence/diag-sg/swiss-motion-smoke.profile.json)）

| 排名 | 函数 | 文件:行 | self（ms） | inclusive（ms） |
| --- | --- | --- | --- | --- |
| 1 | `window.render` | `SW/main.js:14` | 0.302 | 1.963 |
| 2 | `frame.contentWindow.render` | `运行时注入:26` | 0.000 | 1.963 |
| 3 | `(anonymous)` | `demos/styles/player/player.js:50` | 0.000 | 1.963 |
| 4 | `renderFilm` | `SW/film.js:395` | 0.371 | 1.661 |
| 5 | `measureText` | `V8 / 浏览器原生（无 JS 行号）` | 0.754 | 0.754 |
| 6 | `textW` | `SW/film.js:44` | 0.000 | 0.754 |
| 7 | `(anonymous)` | `SW/film.js:308` | 0.000 | 0.754 |
| 8 | `drawOpening` | `SW/film.js:296` | 0.000 | 0.754 |
| 9 | `save` | `V8 / 浏览器原生（无 JS 行号）` | 0.274 | 0.274 |
| 10 | `mark` | `V8 / 浏览器原生（无 JS 行号）` | 0.264 | 0.264 |

**swiss-motion · (a) 不扫描**（[原始 CPU profile](evidence/diag-sg/swiss-motion-a-no-scan.profile.json)）

| 排名 | 函数 | 文件:行 | self（ms） | inclusive（ms） |
| --- | --- | --- | --- | --- |
| 1 | `(anonymous)` | `demos/styles/player/player.js:50` | 0.096 | 1.518 |
| 2 | `renderFilm` | `SW/film.js:395` | 0.000 | 1.422 |
| 3 | `window.render` | `SW/main.js:14` | 0.000 | 1.422 |
| 4 | `frame.contentWindow.render` | `运行时注入:26` | 0.000 | 1.422 |
| 5 | `drawOpening` | `SW/film.js:296` | 0.000 | 0.956 |
| 6 | `(anonymous)` | `SW/ease.js:9` | 0.299 | 0.625 |
| 7 | `snap` | `SW/ease.js:21` | 0.000 | 0.625 |
| 8 | `save` | `V8 / 浏览器原生（无 JS 行号）` | 0.394 | 0.394 |
| 9 | `textW` | `SW/film.js:44` | 0.094 | 0.331 |
| 10 | `by` | `SW/ease.js:8` | 0.326 | 0.326 |

**swiss-motion · (b) 每次 seek 都 await**（[原始 CPU profile](evidence/diag-sg/swiss-motion-b-await-scan.profile.json)）

| 排名 | 函数 | 文件:行 | self（ms） | inclusive（ms） |
| --- | --- | --- | --- | --- |
| 1 | `mark` | `V8 / 浏览器原生（无 JS 行号）` | 0.823 | 0.823 |
| 2 | `(anonymous)` | `运行时注入:1` | 0.000 | 0.823 |
| 3 | `(anonymous)` | `运行时注入:1` | 0.000 | 0.823 |
| 4 | `frame.contentWindow.render` | `运行时注入:26` | 0.396 | 0.674 |
| 5 | `(anonymous)` | `demos/styles/player/player.js:50` | 0.000 | 0.674 |
| 6 | `requestAnimationFrame` | `V8 / 浏览器原生（无 JS 行号）` | 0.589 | 0.589 |
| 7 | `frame` | `kit/motion-kit.js:203` | 0.000 | 0.467 |
| 8 | `tick` | `运行时注入:10` | 0.049 | 0.307 |
| 9 | `renderFilm` | `SW/film.js:395` | 0.110 | 0.278 |
| 10 | `window.render` | `SW/main.js:14` | 0.000 | 0.278 |

**swiss-motion · (c) 1920×1080**（[原始 CPU profile](evidence/diag-sg/swiss-motion-c-1920.profile.json)）

| 排名 | 函数 | 文件:行 | self（ms） | inclusive（ms） |
| --- | --- | --- | --- | --- |
| 1 | `(anonymous)` | `demos/styles/player/player.js:50` | 0.525 | 2.376 |
| 2 | `frame.contentWindow.render` | `运行时注入:26` | 0.128 | 1.851 |
| 3 | `renderFilm` | `SW/film.js:395` | 0.136 | 1.723 |
| 4 | `window.render` | `SW/main.js:14` | 0.000 | 1.587 |
| 5 | `drawOpening` | `SW/film.js:296` | 0.000 | 1.451 |
| 6 | `font` | `SW/film.js:40` | 0.741 | 0.741 |
| 7 | `(anonymous)` | `运行时注入:1` | 0.087 | 0.485 |
| 8 | `(anonymous)` | `运行时注入:1` | 0.000 | 0.485 |
| 9 | `measureText` | `V8 / 浏览器原生（无 JS 行号）` | 0.408 | 0.408 |
| 10 | `textW` | `SW/film.js:44` | 0.000 | 0.408 |

**swiss-motion · (d) 不带 render=1**（[原始 CPU profile](evidence/diag-sg/swiss-motion-d-no-render.profile.json)）

| 排名 | 函数 | 文件:行 | self（ms） | inclusive（ms） |
| --- | --- | --- | --- | --- |
| 1 | `(garbage collector)` | `V8 / 浏览器原生（无 JS 行号）` | 6.674 | 6.674 |
| 2 | `(anonymous)` | `demos/styles/player/player.js:50` | 0.241 | 1.178 |
| 3 | `frame.contentWindow.render` | `运行时注入:26` | 0.098 | 0.937 |
| 4 | `window.render` | `SW/main.js:14` | 0.216 | 0.839 |
| 5 | `renderFilm` | `SW/film.js:395` | 0.067 | 0.623 |
| 6 | `mark` | `V8 / 浏览器原生（无 JS 行号）` | 0.439 | 0.439 |
| 7 | `(anonymous)` | `运行时注入:1` | 0.000 | 0.439 |
| 8 | `(anonymous)` | `运行时注入:1` | 0.000 | 0.439 |
| 9 | `drawOpening` | `SW/film.js:296` | 0.000 | 0.360 |
| 10 | `measureText` | `V8 / 浏览器原生（无 JS 行号）` | 0.268 | 0.268 |

原始两组的 self 排名前 10 项也列在下表；`(idle)`、`(program)`、`(garbage collector)` 为 V8 伪帧。其他八组的同类排名见各数据文件的 `profile.top10Self`。

| 样片 | 排名 | 函数 | 文件:行 | self（ms） |
| --- | --- | --- | --- | --- |
| stained-glass | 1 | `(idle)` | `V8 / 浏览器原生（无 JS 行号）` | 1380.039 |
| stained-glass | 2 | `piece` | `SG/glass.js:110` | 27.379 |
| stained-glass | 3 | `(program)` | `V8 / 浏览器原生（无 JS 行号）` | 12.919 |
| stained-glass | 4 | `fill` | `V8 / 浏览器原生（无 JS 行号）` | 11.621 |
| stained-glass | 5 | `texImage2D` | `V8 / 浏览器原生（无 JS 行号）` | 11.386 |
| stained-glass | 6 | `clip` | `V8 / 浏览器原生（无 JS 行号）` | 8.876 |
| stained-glass | 7 | `brush` | `SG/glass.js:61` | 8.128 |
| stained-glass | 8 | `(garbage collector)` | `V8 / 浏览器原生（无 JS 行号）` | 5.998 |
| stained-glass | 9 | `lead` | `SG/glass.js:154` | 4.852 |
| stained-glass | 10 | `save` | `V8 / 浏览器原生（无 JS 行号）` | 4.835 |
| swiss-motion | 1 | `(idle)` | `V8 / 浏览器原生（无 JS 行号）` | 1386.783 |
| swiss-motion | 2 | `(program)` | `V8 / 浏览器原生（无 JS 行号）` | 114.197 |
| swiss-motion | 3 | `measureText` | `V8 / 浏览器原生（无 JS 行号）` | 0.754 |
| swiss-motion | 4 | `renderFilm` | `SW/film.js:395` | 0.371 |
| swiss-motion | 5 | `window.render` | `SW/main.js:14` | 0.302 |
| swiss-motion | 6 | `save` | `V8 / 浏览器原生（无 JS 行号）` | 0.274 |
| swiss-motion | 7 | `mark` | `V8 / 浏览器原生（无 JS 行号）` | 0.264 |
| swiss-motion | 8 | `fillRect` | `V8 / 浏览器原生（无 JS 行号）` | 0.262 |
| swiss-motion | 9 | `(garbage collector)` | `V8 / 浏览器原生（无 JS 行号）` | 0.236 |
| swiss-motion | 10 | `requestAnimationFrame` | `V8 / 浏览器原生（无 JS 行号）` | 0.168 |

stained-glass 的 JS 调用链热点集中于 `main.js:19 → scene.js:21 → window.js:233 / window.js:168 → glass.js:110`，WebGL 提交调用位于 `comp.js:157` / `comp.js:152`；它们的采样和 render 计时均覆盖几十到百余毫秒，没有覆盖主要的约 0.8 秒帧间空档。单次 await seek 的返回时间不能代表 GPU 进程已完成相应工作：尤其 (b) 在播放窗口无新 render 的情况下，仍记录到约 618 ms 的同页 GPUTask。

**证据文件与结论边界**

| 样片 / 实验 | 完整测量数据 | 原始 CPU 采样 | 原始 trace |
| --- | --- | --- | --- |
| stained-glass · 原始 smoke 顺序 | [JSON](evidence/diag-sg/stained-glass-smoke.json) | [profile](evidence/diag-sg/stained-glass-smoke.profile.json) | [trace](evidence/diag-sg/stained-glass-smoke.trace.json) |
| stained-glass · (a) 不扫描 | [JSON](evidence/diag-sg/stained-glass-a-no-scan.json) | [profile](evidence/diag-sg/stained-glass-a-no-scan.profile.json) | [trace](evidence/diag-sg/stained-glass-a-no-scan.trace.json) |
| stained-glass · (b) 每次 seek 都 await | [JSON](evidence/diag-sg/stained-glass-b-await-scan.json) | [profile](evidence/diag-sg/stained-glass-b-await-scan.profile.json) | [trace](evidence/diag-sg/stained-glass-b-await-scan.trace.json) |
| stained-glass · (c) 1920×1080 | [JSON](evidence/diag-sg/stained-glass-c-1920.json) | [profile](evidence/diag-sg/stained-glass-c-1920.profile.json) | [trace](evidence/diag-sg/stained-glass-c-1920.trace.json) |
| stained-glass · (d) 不带 render=1 | [JSON](evidence/diag-sg/stained-glass-d-no-render.json) | [profile](evidence/diag-sg/stained-glass-d-no-render.profile.json) | [trace](evidence/diag-sg/stained-glass-d-no-render.trace.json) |
| swiss-motion · 原始 smoke 顺序 | [JSON](evidence/diag-sg/swiss-motion-smoke.json) | [profile](evidence/diag-sg/swiss-motion-smoke.profile.json) | [trace](evidence/diag-sg/swiss-motion-smoke.trace.json) |
| swiss-motion · (a) 不扫描 | [JSON](evidence/diag-sg/swiss-motion-a-no-scan.json) | [profile](evidence/diag-sg/swiss-motion-a-no-scan.profile.json) | [trace](evidence/diag-sg/swiss-motion-a-no-scan.trace.json) |
| swiss-motion · (b) 每次 seek 都 await | [JSON](evidence/diag-sg/swiss-motion-b-await-scan.json) | [profile](evidence/diag-sg/swiss-motion-b-await-scan.profile.json) | [trace](evidence/diag-sg/swiss-motion-b-await-scan.trace.json) |
| swiss-motion · (c) 1920×1080 | [JSON](evidence/diag-sg/swiss-motion-c-1920.json) | [profile](evidence/diag-sg/swiss-motion-c-1920.profile.json) | [trace](evidence/diag-sg/swiss-motion-c-1920.trace.json) |
| swiss-motion · (d) 不带 render=1 | [JSON](evidence/diag-sg/swiss-motion-d-no-render.json) | [profile](evidence/diag-sg/swiss-motion-d-no-render.profile.json) | [trace](evidence/diag-sg/swiss-motion-d-no-render.trace.json) |

完整数据中的 `parent` / `iframe` 保存两侧 rAF 和 longtask 序列，`renders` 保存每次调用与 timeline time 记录，`profile` 保存播放期前 10 项汇总，原始 profile/trace 可按 play 标记复查时间窗口。各组结果只代表本机本次启用采样的独立运行，不是重复测量的统计分布。

已验证的是 GPU 进程侧的长任务、稀疏 rAF、页面主线程大部分空闲、0.1 秒步长上限以及五组对照结果；“GPU 渲染链路拖慢帧供给”是这些数据支持的直接因果推断。当前 trace/页面 CPU profile 没有进一步定位到具体原生栅格函数、shader 或驱动调用，也没有测量 GPU 硬件利用率。longtask API 与 trace 的差异保留为本次测量限制。

