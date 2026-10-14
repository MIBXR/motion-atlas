# 白色档案终端 · 莱茵式 Analysis OS · 复用 Prompt

由 [结构化条目](../../entries/cases/archive-os.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/archive-os.md)。

## 实现 Prompt

用 HTML/CSS/JS（零依赖）实现一个“白色档案终端”：暖灰白底 #eae5e1、墨色 #171713、唯一信号色杏铜 #c8742f，几何无衬线字体。①启动序列（约 7.6s，可跳过、可 seek）：白场上逐字输入“ACCESS REQUEST : ANALYSIS OS”（每字 45ms，冒号后停 350ms，完成后黑底闪一次再清空）→ 两个圆环 900ms 依次绕行描出、标志笔画补全并左移 → 三行身份确认错峰打字 → 黑白双环从画面外收拢、橙色节点绕行、中心方块四帧缩放跳变 → 黑底公司名横向擦出、INTERNAL DATABASE 闪现 → 启动层缩小 4%、模糊 8px 并轻微色偏退场，阵列从左侧滑入、镜头从 74° 抬到 58°。②阵列：CSS 3D（perspective 1700px；rotateX 58° rotateZ -38°）5 列 × 16 块档案（顶/正/侧三个面，正面带标签框与螺丝点），选中块顶边用信号色。③选择：←/→ 切列（记住每列选择）、↑/↓ 前后档案；选中块以临界阻尼（速率 4.2）抬起 26px，其余块收到正弦余波：z += 9·sin(7.5τ)·e^(−2.6τ)/(1+0.35d)，τ = t − t₀ − 0.07·d，d 为行距 + 0.8×列距；编号 X-001、标题、列名、01/08 计数同向滚动 460ms 并带 0.35px 运动模糊，连续输入只显示当前运动到最新目标。④空闲：停止操作 2.5s 后 1.5s 渐入呼吸，8s 与 13s 周期按 0.6/0.4 叠加、幅度 4px、相邻块错相，任何输入立即渐退。⑤读取（Enter）：选中块升至 150px，阵列淡出并拉近左移；左侧玻璃检视窗（内构：双环、铜色环、连接带、标签）入场，两条对角线 450ms 合拢、停留后收束，磨砂层 1.3s 自上而下转清（clip-path），右侧文档的标题、分类、四项元数据、摘要上的黑色遮挡条以 80ms 错峰 420ms 退开；Esc 250ms 退出。⑥HUD：左上品牌三行（800/700/300 字重），右上 ARCHIVE INDEX / SAVED / 声音，中右悬停信息（分类、FILE NUMBER、带方点的细线、标题、ACCESS FILE →），左下 ARCHIVE / SELECT 大号计数，中下行刻度与列导航，右下 POWERED BY，底部 SESSION AUTHORIZED、操作员与时钟。⑦工程：所有状态由“按键事件序列在时刻 t 的推导”得到并写成解析函数，暴露 window.__motion 供 seek；真实输入切换为实时时钟；opacity 加在 3D 面上而不是 preserve-3d 容器；声音默认关闭；减少动态时关闭呼吸；文字 ≥12px。

## 视频生成 Prompt

Clinical white sci-fi archive terminal, 1920×1080, 20 seconds. Warm off-white background (#eae5e1), near-black thin typography, a single copper-orange signal color. Opening: on a white screen a monospace-like line types character by character, flashes black, then two thick black rings draw themselves in sequence forming an infinity-like logo; identity lines type in; black and white double rings converge from outside the frame with an orange node orbiting; a black bar sweeps in revealing the company name. The boot layer shrinks, blurs and dissolves into a vast isometric array of translucent ivory archive slabs standing in rows like files in a drawer, filling the frame and fading at the edges. One slab lifts smoothly and a gentle wave ripples outward through neighboring slabs with distance-delayed, damped oscillation; a file number rolls up digit by digit. Then the selected slab rises high, the array fades, a frosted glass panel appears and two diagonal copper lines converge across it; the frosted glass clears from top to bottom revealing double rings inside, while black redaction bars on a document retract one by one. Calm, precise, weighty motion; soft studio light; no lens flares; no neon.

## 负向约束

不要深色赛博朋克配色或霓虹发光；不要多种强调色；不要让波浪幅度大到块互相穿插；不要每次输入都排队播放所有中间编号；不要无质量的线性动画；不要使用《明日方舟》或莱茵生命的标志与名称。

## 动效 Token

- **type-tick**：每字 45ms（身份行 30–32ms），冒号后停 250–350ms；最短音间隔 24ms
- **ring-draw**：900ms inOutCubic，第二环延迟 450ms
- **select-lift**：临界阻尼速率 4.2，预览抬起 26px，读取抬起 150px
- **wave**：幅度 9px · 角频 7.5 · 衰减 2.6 · 距离延迟 70ms/格 · 距离衰减 1/(1+0.35d)
- **roll**：编号/标题/列名 460ms outCubic，0.35px 运动模糊，方向跟随输入
- **breathe**：空闲 2.5s 后 1.5s 渐入；8s 与 13s 周期以 0.6/0.4 叠加，幅度 4px，相邻块错相
- **decrypt**：对角线 450ms 合拢，停留后 350ms 收束；盖板 1.3s 自上而下转清；遮挡条 420ms、错峰 80ms
- **modal**：入 300–400ms、位移 12px；出 200–250ms、位移 8px，可中途反向

## 制作约束

- 参考为开源项目 LBEILC/RhineLabUI（MIT）及其 README、DESIGN.md 与截图；《明日方舟》与莱茵生命相关设定权利归鹰角网络，Demo 不使用其标志与名称。
- 原项目为 Three.js 实时渲染的透射玻璃模型；Demo 用 CSS 3D 方块近似，无物理透射、景深与阴影。
- 原项目的解密与镜头联动、360° 拆解查看器、画质设置、PWA 与壁纸工作台未复现。
- MiSans 字体未随 Demo 分发，按系统字体回退；所有文字 ≥12px。

## 迁移

- `config.js → brand`：品牌三行、操作员、署名。
- `config.js → columns / files`：列名（中英）与每列档案：标题、科室、编目、相关人、状态、摘要；缺省自动生成占位。
- `config.js → palette`：纸色、面板、墨色、灰、细线与唯一信号色。
- `config.js → timing`：启动时长、抬起高度、阻尼速率、波浪参数、滚动时长、呼吸周期与幅度、解密时长。
- `config.js → autopilot`：自动演示的按键脚本（秒）；也是站点刻度条上的节拍。
- `style.css → .plate`：档案块的面色、标签与螺丝装饰；换成产品卡、唱片或展品即可。

[打开 Demo](../../demos/cases/archive-os/index.html) · [在库中查看](../../cases.html#case/archive-os)
