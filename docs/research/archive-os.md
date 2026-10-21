# 档案终端：RhineLabUI 行为研究与案例映射

本研究服务于 `demos/cases/archive-os/`。参考为 [LBEILC/RhineLabUI](https://github.com/LBEILC/RhineLabUI)，本地只读检出位于 `C:/Users/mibxr/AppData/Local/Temp/mmref/RhineLabUI`，核对提交为 `12cc5e4013acb9408f753ff71de6b8492299b7c8`。源码、运行截图与产品改写分开记录；截图没有用于案例背景或预览素材。

## 来源与许可

- 代码及作者有权授权的原创内容采用 MIT，版权为 **Copyright (c) 2026 LBEILC**。许可允许使用、复制、修改和再分发，要求保留版权声明与许可。作者在 README 中明确将自行创作的模型、建模脚本、原创音效和配乐也纳入授权。[LICENSE](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/LICENSE)、[README 许可说明](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/README.md#开源许可)
- 此 MIT 授权不覆盖第三方游戏名称、标志、设定、原宣传片、原片视觉设计、原片声音采样及衍生片段。MiSans、Novecento、Rolling Number 与其他依赖沿各自许可。三个逐字输入短音各约 38ms，来自原片，明确排除在原创配乐的 MIT 声明之外。[README](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/README.md)、[音频来源](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/public/audio/README.md)
- PR #15 的优化提取另保留 **PacificSauryMan** 的贡献，以及原 PR 对 **OpenAI Codex** 的协助署名；原创视觉、场景、模型、动画和环境声音仍署 **LBEILC / RhineLabUI**。这些是渲染优化归属，不代表新增资产授权。[PR15-ATTRIBUTION.md](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/PR15-ATTRIBUTION.md)
- 本案例仅改写可移植的行为与数学逻辑。档案盒、无线图标、图表、界面符号全部自行绘制 SVG；标题、分类、档案内容与批注为原创中性文本；声音通过 `MotionKit.audio` 原创合成。案例不含参考库的 `art/`、GLB、图片、Logo、字体文件、音频样本或游戏文本。MIT 署名和许可说明同时保留在案例源码文件头。

## 实际运行与证据边界

参考库本身没有 `node_modules` 或 `dist`。为保持其只读，将必要源码和锁文件复制到被 Git 忽略的 `dev/shots/T5/reference-runtime/`，在副本中运行 `npm ci --ignore-scripts`，再执行参考库自己的 Rolling Number 补丁。`public` 为指向参考库资源目录的只读用途 junction，未向该目录写入。Vite 监听 `127.0.0.1:4322`；参考库运行前后 `git status --porcelain` 均为空。

截图脚本为 `dev/shots/T5/reference-capture.mjs`，使用项目现有 CDP 客户端和隔离的 Edge 配置。最初的 SwiftShader 原始画质在三维截图阶段停滞，停止该浏览器后改用 D3D11，并在隔离浏览器中启用原版自带的 `superPerformance` 选项完成采集。这个选项降低渲染分辨率、AO、阴影、景深及透射开销，保留运动；截图用于核对结构和行为，不认证默认最高画质。

证据目录 `dev/shots/T5/reference/` 有 21 张运行 PNG 和 `observations.json`。开场通过原版 `review=1&freeze=1` 协议取样；四向切换用真实 CDP 按键触发，之后切到详情。`transition-*-022.png` 表示按键后等待 220ms 再请求截图，截图与随后读取状态并非严格同帧，不能据此反推精确时长。时长、阻尼与插值以源码为依据。

| 运行证据 | 观察 |
| --- | --- |
| `boot-access.png` | 白底中央逐字接入文字，没有标准无线图标 |
| `boot-logo.png`、`boot-identity.png` | 连续绘制的双叶商标及身份文字；该商标不移植 |
| `boot-scan-wide.png`、`boot-scan-core.png` | 黑白同心弧收拢，内弧、橙点与中心节点；后段两侧小弧自转补全 |
| `boot-welcome.png`、`boot-array-entry.png` | 欢迎文字横向黑条扫入，然后白场接阵列 |
| `transition-{up,down,left,right}-022.png` | 上下切同列档案、左右切列；实体沿各自物理轴移动，伴随抬起和连续肩部波浪 |
| `archive-horizontal-loop.png`、`archive-vertical-loop.png` | 两轴跨首尾后仍覆盖画面，并回到相同档案内容 |
| `detail-scan.png`、`detail-reveal.png` | 详情对角扫描及遮条退场；它是读取步骤，四向切档不逐次执行完整解密 |

README 的现有图像与 GIF 说明也已核对：这些素材于 2026-09-09 从应用采集，运行提交为 `e0cb75ffcc1bf7d1fb5e2458b3c35fa0f6f336da`；GIF 不含声音，不能拿 GIF 判断听感。[docs/media/README.md](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/docs/media/README.md)

## 开场：形状与节奏

参考源码用原片 **25fps**；`bootMotion(appTime)` 内部以 `sourceTime = appTime + 5` 换算。正常启动从源片 6.76s 的白场开始，因此以下同时列出两种时间。离散闪变取整到源片帧，位移与半径使用连续时间。[boot-motion.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/boot-motion.ts)、[逐帧复核](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/verification/BOOT-MOTION.md)

| 阶段 | appTime / 源片时间 | 原版行为 |
| --- | --- | --- |
| 接入 | 1.76–4.12s / 6.76–9.12s | f170–187（6.80–7.48s）逐字；f226 透明度降至 0.25，再清空 |
| 标志 | 4.16–6.12s / 9.16–11.12s | 从右上笔画绕左环再补右环，绘制约 1.08s；后段移向左侧 |
| 身份与请求 | 6.12–14.48s / 11.12–19.48s | 三行品牌 f278/280/282 错开两帧入场；身份确认、请求与处理三段输入、停顿和清空 |
| 权限扫描 | 14.48–17.76s / 19.48–22.76s | 黑白大弧由画外收拢，内弧反向运动；f525/526/528/529 放大至 1.94 倍、透明度 0.32、模糊 2.2px |
| 中心节点 | 16.84–17.72s / 21.84–22.72s | 两侧小弧绕自身圆心反向转动；中心点按帧闪大，六颗卫星点每三帧出现一颗 |
| 欢迎 | 17.76–21.92s / 22.76–26.92s | 黑白七帧闪切；18.52s 出名称横扫；20.04s 内部数据库文字闪入；21.16–21.92s 缩小、模糊、退入白场 |

大弧半径并非简单 ease：源片 f500/510/520/530 外环约 895.5/492/320.5/270px，白环约 619/374/272/246px；通过保持单调的三次 Hermite 插值连接测量点，避免每个采样点停顿。两侧小弧 f544 约 3°，到 f568 约 332°/339°，左弧顺时针、右弧逆时针，后段减速；中心闪变点为 f546/547/549/550。[boot-tracks.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/boot-tracks.ts)、[boot-orbit-tracks.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/boot-orbit-tracks.ts)

**无线符号的证据区别：**本次运行的本地提交，在接入阶段只有逐字文字；其扫描阶段是同心弧、中心点和侧边自转弧，品牌是双叶商标。没有找到标准 WiFi「点 + 三条向上同心弧」图标，运行截图也不支持把它称作原版精确形状。用户明确要求的无线信号在本案例中采用原创 SVG：点与三弧逐格点亮、配合扫描，沿用 25fps 量化及原版阶段节奏；不复制商标，也不把原创图形表述为像素级还原。

## 档案顺序、双轴循环与列内记忆

原版五列，每列八份，共 40 份。内容索引和物理坐标分离：`lane mod 5` 选列，`(row - 12) mod 8` 选档；每次方向输入只把相应物理坐标加减 1。跨首尾时坐标继续向同一方向增长或减小，不跳回有限队列的另一端。左右切列恢复目标列记忆的档案，并选取附近的周期位置。[archive-loop.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/archive-loop.ts)、[main.ts 的 stepFile / stepColumn](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/main.ts)、[DESIGN.md 循环档案阵列](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/DESIGN.md#循环档案阵列)

世界坐标为 `x=(lane-2)×5.2`、`y=-4.6`、`z=(row-15.5)×0.62`。原版交互背景维护镜头附近 9×32 个位置，周期复用；抽出卡片只升降，轨道与镜头承担构图。方向语义对应物理阵列的两条轴，投影后带透视斜度，不是把整页沿屏幕边缘推走。[scene.ts 的 cellPosition / update](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/scene.ts)

本次真实按键记录如下，编号仅用于核对原版行为，案例正文不用这些名称和内容：

| 输入 | 物理位置 | 运行结果 |
| --- | --- | --- |
| 起点 | (2,12) | X-001 |
| 上 | (2,11) | 直接环到同列第八份 X-018 |
| 下 | (2,12) | 回第一份 X-001 |
| 左、右 | (1,12)、(2,12) | X-003、X-001 |
| 从起点连续右五次 | lane 3→4→5→6→7 | X-004→X-008→X-002→X-003→X-001 |
| 再连续下八次 | row 13→14→15→16→17→18→19→20 | X-006→X-013→X-014→X-015→X-016→X-017→X-018→X-001 |

这证明运行实例的两轴内容都首尾相接，跨界方向未反转；列内记忆的具体算法由源码确认。本次未把长时间惯性拖动与数千次坐标重置重新跑为验收项，原库自己的测试记录另见 [LOOPING-ARCHIVE.md](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/verification/LOOPING-ARCHIVE.md)。

## 四向切换：轨道、抬起、波浪与文字

| 方向 | 原版目标变化 | 实体过渡 | 同步文字与声音 |
| --- | --- | --- | --- |
| 上 | `row -= 1`，同列上一档 | 纵深轨道朝前一位置连续运动，旧卡归位、新卡抬起，波浪同启 | 标题固定向上滚；数字沿导航方向滚；玻璃 tick |
| 下 | `row += 1`，同列下一档 | 纵深轨道反向移动一格，保留当前速度；边界继续同方向 | 标题固定向上滚；数字向上；玻璃 tick |
| 左 | `lane -= 1`，上一列记忆档 | 横向轨道连续移至相邻列，镜头附近阵列补位 | 标题固定向上滚；数字按负方向；column 玻璃双击，声像 -0.45 |
| 右 | `lane += 1`，下一列记忆档 | 横向轨道反向移动一列；第五列接第一列仍连续前进 | 标题固定向上滚；数字按正方向；column 双击，声像 +0.45 |

原版没有为四个方向各配一套页面扫描遮罩或随机字符解码。选择的核心是同一连续运动系统作用于两个相反方向的物理轴，加上局部波浪、编号滚动、标题滚动和玻璃音色。完整对角线与正文遮条属于进入详情的读取操作。[main.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/main.ts)、[motion.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/motion.ts)

精确参数与缓动：

- 两条轨道临界阻尼 rate **3.7**；行肩部 rate **5**、列聚焦 rate **4**；选中升降 rate **4.2**。原版 `damp()` 保留当前速度，离散更新是二阶系统的精确解，不是固定时长 tween。静止起点单次阶跃的归一化响应为 `1-(1+3.7a)×exp(-3.7a)`：0.46s 达 50.74%，1s 达 88.38%，1.5s 达 97.45%，2s 达 99.49%。这些百分比由源码公式计算，不是截图测量。
- 浅预览抬高 **0.4** 世界单位；交互详情升高 **4.05**；旧卡返回先保持高度转正，再下降。卡片本身不因进入详情横向或向前抽移。
- 基线波浪与选择同时开始：幅度 **0.8**，**0.2s** smooth 起势，`exp(-1.15×age)` 衰减，传播 **8 行/s**，余弦角系数 **0.58**，高斯宽度 **3.4**，有效年龄 **0–3.2s**；保留负向波谷。列距折算进波距时系数 **2.2**。smooth 使用五次式 `p³(10-15p+6p²)`。
- 标题、分类、权限和编号配置 **460ms**，`direct`、无逐字 stagger；文字固定向上滚动，标题模糊 **0.2**。数字随导航方向滚动。460ms 是文字配置，不是实体轨道的固定结束时刻。[main.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/main.ts)、[ROLLING-TITLE.md](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/verification/ROLLING-TITLE.md)
- 已安装的 Rolling Number 0.4.1 在 `dist/chunk-vm1v7ncb.js` 的 `spring()` 中，先以 `D=duration/1000`、`delta=from-target`、`v=clamp(velocity, ±max(abs(delta),1)×12/D)×D` 归一化，再采样 `target+(delta+(v+10×delta)×u)×exp(-10u)`；`u=k/48`，共49点，最后一点强制为 target。静止0→1即 `1-(1+10u)×exp(-10u)`；使用 CSS `linear()` 或49个线性 keyframe 播放，不是 cubic-bezier。
- 停止操作 **2.5s** 后渐入呼吸，周期 **8s** 与 **13s**，幅度 **0.075** 和 **0.027**，总最大单向位移约 **0.102**；相邻错相，切换和详情时渐退。[motion.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/motion.ts)

## 详情扫描与正文揭示

源片时间 **34.12–39.56s**，总长 **5.44s**；交互在模型可读后以 **1.5 倍**推进，对应约 **3.6267s**，不包含模型抬起等待。对角线从两端向中心接合、保持，然后向中心收束；线收完后玻璃从上至下变清晰，正文遮条随之退出。[decryption.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/decryption.ts)

| 源片时间 | 行为 |
| --- | --- |
| 34.24–36.04s | 对角线两端合拢，单调三次 Hermite 连接测量值 |
| 36.04–37.72s | 完整线保持 |
| 37.72–38.84s | 线向中心收束 |
| 38.84–39.56s | 清晰度 0→1，顶到底揭示；39.00s 约 51% |

正文在 `clarity>0` 时启动 **0.95s** 揭示；按行顺序延迟 0–22%，各行剩余 78% 时间退开遮条。单行前 20% 二次加速至 40% 位移，后 80% 以 `16/3` 次幂减速，最终移出 101% 宽度。详情层进出 **180ms**；页签正文 **150ms**、下划线 **180ms**。面板进入曲线为 `cubic-bezier(0.22,1,0.36,1)`，退出为 `cubic-bezier(0.4,0,1,1)`。[document-decryption.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/document-decryption.ts)、[ui-transitions.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/ui-transitions.ts)

## 输入与声音

参考支持方向键、对应界面按钮、滚轮列内翻阅，以及鼠标/触摸拖动阵列；Enter 读取，Esc 返回，启动时可跳过开场。拖动是自由平面双轴运动，释放后连续惯性减速并吸附。[README 操作说明](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/README.md#操作说明)、[archive-drag.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/archive-drag.ts)

声音按原版源码确认：三个同步循环声部 `atmosphere / motif / pulse`，循环 **160/3 = 53.333…s**；切场景只调配比，不重启音乐。玻璃共鸣频率比例为 **1 / 1.47 / 2.09 / 2.73 / 3.86**，高频模态更快衰减。列内切换基频 **1680Hz**、衰减 **0.24s**；切列 **1280Hz / 0.32s**，另在 **45ms** 后叠 **2050Hz / 0.18s**。扫描是噪声扫频加四个 **760Hz** 短音，间隔 **0.19s**。品牌、确认、欢迎、进入阵列、详情各有独立提示。[audio.ts](https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/src/audio.ts)

本次参考运行在首次方向键后，实际状态变为 `audio.state="running"`、`tracks=3`、`loaded=true`、`error=""`，确认音频引擎与三声部资源加载。采集浏览器使用 `--mute-audio`，因此这不包含主观听感验收；音色描述与时序取自源码和作者说明。案例不使用三个原片采样，也不分发原库音乐，用 `MotionKit.audio` 乐谱合成环境层、逐字/扫描/四向切换与数据揭示提示，渲染导出共用同一乐谱。

## 本案例的实现映射

| 参考机制 | 本案例做法 | 取舍依据 |
| --- | --- | --- |
| 白场逐字、品牌绘制、身份、权限、欢迎五段 | 保留阶段节奏与25fps离散节拍，图标替换为原创点与同心弧无线信号 | 满足无线形态要求，避开第三方商标与原片文字 |
| 五列八档、物理坐标与内容周期分离、列内记忆 | 五列×八档的原创中性档案；两轴首尾循环并恢复列内位置 | 保留参考最重要的连续导航能力 |
| Three.js、GLB、物理透射、动态镜头 | 自绘 SVG 等轴档案实体、原创面板及数据图 | 不复制模型或美术资源；固定画幅内精确控制文字与遮挡 |
| 四向轨道rate3.7、抬起与波浪同启 | 以时间t和有序事件求闭式轨道响应，四方向沿相应等轴物理轴推进，波浪同启 | 任意seek正反序均确定，不依赖逐帧积分 |
| 标题向上460ms、数字沿导航方向 | 原创文本滚动及编号更新，与实体切换共同发生 | 保留参考区分文本与实体的运动逻辑 |
| 详情对角扫描与正文遮条 | 在演示读取/揭示阶段使用原创扫描线、按行退出遮条与数据显现 | 完整解密不伪装成四向切换自带的原版效果 |
| 三轨循环配乐、玻璃切换、源片逐字采样 | `MotionKit.audio` 原创环境声部与事件乐谱，方向采用可辨音高/声像 | 无原片采样或外部音频资产；可离线导出 |
| 自适应网页与原版字体 | `MotionKit.stage()` 固定1920×1080 / 1080×1920，两套单独构图；系统字体经预加载后ready | 遵循Motion Atlas横≥24px、竖≥36px与预加载协议 |
| 检索、收藏、导出、360°拆组、PWA、画质设置、宿主/手柄扩展 | 不纳入本案例 | 本轮范围为档案终端演示与循环/四向切换，相关patterns保持不动 |

研究中的原版最高画质、移动设备性能与主观音色未重新认证；本案例实际交付的 smoke、固定画幅、音轨与视觉检查结果以 `dev/reports/T5.md` 为准。

## 上游 MIT 许可全文

```text
MIT License

Copyright (c) 2026 LBEILC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
