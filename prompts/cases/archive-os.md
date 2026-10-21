# 白色档案终端 · 循环档案 · 复用 Prompt

由 [结构化条目](../../entries/cases/archive-os.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/archive-os.md)。

## 实现 Prompt

用零依赖 HTML/CSS/JS 制作 64 秒的白色循环档案终端。使用 MotionKit.stage()，横屏 1920×1080 与竖屏 1080×1920 分别构图，文字至少 24px / 36px。竖屏头部 y=0–240，阵列框 y=260、高 820（42.7%），内部 SVG y=314、高 700（36.5%），行列导航 y=1096、高 64，档案卡 y=1176、高 644。编号与标题并排；摘要保留不超过 37 字的完整首句，最多两行均衡折行，避免孤字行；三项指标并排，批注保留两行；读取按钮放在分类行右侧。竖屏隐藏独立英文档名行与 ARCHIVE OS 副行，英文字段保留在横屏和 inspectionId。解密视窗高 700px，保持几何原比例，不挤压。数据曲线横屏 744×64、竖屏 952×56，viewBox 与实际绘图区相同，网格覆盖整个栏宽，首尾标记外缘与栏边相齐且保持完整，随画幅切换重画。纸色 #eae5e1、墨色 #171713、杏铜 #c8742f。原创 FIELDWORK 品牌，五列各八份完整原创档案，每份含编号、分级、时间、作者、摘要、批注、三指标与十二点数据。启动按 25fps 帧窗组织：访问请求、自绘同心弧加点无线信号、身份确认、授权扫描、欢迎，21.92s 进入阵列。实体轨道与逻辑循环索引分离，上下循环行、左右循环列，各列记忆行；整片阵列共用纵向轨道，切列寻找记忆行的最近循环位置。轨道临界阻尼速率 3.7，抬起 4.2，距离延迟余波，空闲 2.5s 后呼吸。数字遇 Up/Left 向下滚动、Down/Right 向上，标题、列名与分类统一向上；使用原版 49 点临界阻尼采样曲线，460ms 后强制到达终点。实体四向位移跟随输入。25s 上、27s 下、29/31/33/35/37s 右、39/41/43/45/47s 左，行首尾回绕、两次列循环回到起点。50s 读取，镜头与块到位后约 3.63s 解密，对角线、盖板清晰化和正文遮挡条协同揭示；57s 返回，60–64s 收尾。方向键与按钮、Enter/Escape 驱动独立手动事件序列，更新乐谱并共用时间轴时钟；宿主或控制条 seek 恢复自动演示。所有图标 SVG 自绘，全部状态从 t 和事件表推导，任意 seek 确定。用 MotionKit.preload() 等待字体，用 MotionKit.audio 乐谱写音乐、环境、开场、四向切换与解密，ready 声明 sound:true，--audio 导出带音轨。

## 视频生成 Prompt

A 64-second pale archive terminal, FIELDWORK original research brand. Two independently composed fixed frames: 1920×1080 landscape and 1080×1920 portrait. Warm paper, thin near-black rules, restrained copper-orange signals, clear large typography. A typed access request is followed by a hand-drawn wireless icon: concentric open arcs and a dot illuminate in discrete 25fps steps. Identity processing, orbital authorization scan and a masked welcome occupy the opening 21.92 seconds. Five columns of eight translucent archive slabs form continuous circular tracks. One shared vertical orbit moves the whole array; column changes target the nearest occurrence of each column's remembered row. An upward selection wraps from first to last row; a downward selection returns to the first. Five rightward column moves complete a loop, then five leftward moves complete the reverse loop. Each physical movement has directional continuity, a critically damped lift and distance-delayed ripples. Numbers roll downward for Up/Left and upward for Down/Right; titles, column names and categories always roll upward. All rolls use the original 49-sample critically damped spring curve and snap to their exact endpoint after 460ms. Return to the original record. At 50 seconds, open a detailed file with original charts, measured-looking values, timestamp, author, abstract and note: diagonal lines converge, frosted glass clears and text masks retract over a 3.63-second decryption. Return at 57 seconds and close with a calm archive summary from 60 to 64 seconds. Original synthesized ambient music and precisely synchronized direction cues. No external artwork or audio.

## 负向约束

不要把无线信号画成两个闭合圆圈；不要省略行列首尾回绕或四向实体过渡；不要为四个方向另加原版没有的扫描线或字符故障；不要把数字与标题的滚动方向混为一谈，也不要用 outCubic 替代原版临界阻尼采样曲线；不要用简单缩放代替竖屏构图；不要让文本低于横屏24px或竖屏36px；不要复制参考的品牌标志、游戏文字、美术、字体与音频；不要依赖实时随机数或累计帧状态。

## 动效 Token

- **boot-window**：25fps 离散帧窗；标志窗口 4.16s，授权 14.48s，欢迎 17.76s，启动结束 21.92s
- **orbit**：临界阻尼速率 3.7；整片阵列共用纵向轨道，连续坐标与循环索引分离，切列寻找记忆行的最近循环位置
- **select-lift**：临界阻尼速率 4.2；选中抬起、距离延迟余波与空闲呼吸分别计算
- **roll**：数字：Up/Left 向下、Down/Right 向上；标题、列名与分类统一向上。采用原版 49 点临界阻尼采样曲线，460ms 后强制到达终点
- **idle**：停止操作 2.5s 后渐入空闲呼吸，新的输入重置空闲时间
- **decrypt**：详情到位后约 3.63s；对角线、磨砂清晰化与正文遮挡条协同揭示
- **frame**：横 1920×1080 / 竖 1080×1920；字号至少 24px / 36px，舞台整体等比缩放

## 制作约束

- 参考源代码为 LBEILC/RhineLabUI，Copyright (c) 2026 LBEILC，MIT 许可；完整许可与移植边界见研究文档。
- 本版品牌、四十份档案、数值与文案均为原创演示内容；所有 SVG 自绘，不复制 art/ 图片、立绘、标志、字体或原作文本。
- 无线信号图形为用户指定的补充，沿用参考启动标志的帧窗，不声称参考源码本来就有 Wi-Fi 图标。
- 实体阵列用 CSS 与程序几何改写；不复现参考的物理透射、景深、阴影、360° 拆解、检索收藏、设置、PWA 或壁纸工作台。手动交互使用方向键与按钮、Enter/Escape，直接点选档案、滚轮与拖拽未纳入。
- 横屏 1920×1080 与竖屏 1080×1920 分别构图，舞台字号至少 24px 与 36px。竖屏摘要保留不超过 37 字的完整首句，最多两行均衡折行，避免孤字行；独立英文档名行与 ARCHIVE OS 品牌副行隐藏，英文字段仍保留于横屏和 inspectionId；数据源保留完整摘要。声音使用本库合成引擎，无外部素材。

## 迁移

- `config.js → brand / columns`：原创品牌、操作员、五类中英标题与短码。
- `config.js → files`：每列恰好八份完整档案：id、title、en、level、timestamp、author、abstract、note、三项 metrics 和十二点 series。
- `config.js → timing`：启动结束、轨道与抬起阻尼、文字滚动和空闲阈值；解密曲线在 script.js 的测量节点中。
- `config.js → events / outro`：自动演示方向键、读取、返回的绝对秒点与收尾时刻；画面和乐谱共同读取。
- `style.css → landscape / portrait`：横竖两套舞台的独立几何与排版，字号下限分别 24px 和 36px；竖屏头部、820px 阵列框、64px 导航、644px 档案卡分区布局，阵列与解密 SVG 均为 700px 高，编号与标题并排、指标三列。
- `script.js → render / score`：统一纵向轨道、记忆行的最近循环位置、49点临界阻尼滚动、帧窗、抬起、余波、详情解密与乐谱；手动事件与乐谱共用时间轴，seek恢复自动演示。曲线随画幅按 744×64 / 952×56 重建 viewBox、网格与十二点完整横域；竖屏摘要保留不超过 37 字的完整首句，使用 text-wrap: balance 均衡折行。

[打开 Demo](../../demos/cases/archive-os/index.html) · [在库中查看](../../cases.html#case/archive-os)
