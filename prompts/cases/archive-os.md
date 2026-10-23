# 莱茵生命档案终端 · 复用 Prompt

由 [结构化条目](../../entries/cases/archive-os.json) 自动生成。观察与边界见 [研究笔记](../../docs/research/archive-os.md)。

## 实现 Prompt

将 LBEILC/RhineLabUI 提交 12cc5e4 忠实移植为 Motion Atlas 案例。源码、两份 GLB、MiSans 字体、三轨配乐、合成音效、逐字输入采样与四十份档案内容原样复用；仅接入固定画幅、60Hz 虚拟时钟、输入胶片与统一音轨。开场自然运行至首次 detail，之后按胶片表演示页签、360° 查看器、六组结构拆解、重组、返回阵列与四向循环浏览。横屏 1920×1080、竖屏 1080×1920，由原版 viewport-layout 排版。保留上游视觉、字号、文案、动效参数、缓动与音量声像。

## 视频生成 Prompt

A faithful port of LBEILC/RhineLabUI at commit 12cc5e4. Preserve the original white opening, Rhine Lab identity, five-column archive array, diagonal decryption, document tabs, 360-degree model viewer, frosted and clear glass, six-part exploded structure and reassembly. Reuse the original models, typefaces, archive texts, music and sound. Use landscape 1920×1080 or portrait 1080×1920 through the original viewport layout. Follow the recorded film inputs without redesigning any visual or motion parameter.

## 负向约束

不要改造原版视觉、布局、字号、文案、动效参数、缓动、模型、字体、档案或声音；不要增添外层 UI、文字与装饰；不要裁剪或加速开场；不要修改胶片动作序列。

## 动效 Token

- **boot-window**：25fps 离散帧窗；应用内部时间 0 对应参考 PV 5s。来源：vendor/rhinelabui/src/boot-motion.ts。
- **orbit**：临界阻尼速率 3.7。来源：vendor/rhinelabui/src/scene.ts、motion.ts。
- **select-lift**：常规选中抬起临界阻尼速率 4.2。来源：vendor/rhinelabui/src/scene.ts。
- **roll**：滚动时长 460ms。来源：vendor/rhinelabui/src/main.ts。
- **idle**：交互停止 2.5s 后进入空闲呼吸。来源：vendor/rhinelabui/src/scene.ts。
- **decrypt**：交互解密进度按 (39.56−34.12)/1.5 = 3.6267s 运行。来源：vendor/rhinelabui/src/decryption.ts 的 DECRYPTION_START、DECRYPTION_END、INTERACTIVE_RATE。
- **quality**：performance / original / high / ultra 四种上游画质预设；默认 original。来源：vendor/rhinelabui/src/render-quality.ts。

## 制作约束

- 忠实复用上游源码、模型、字体、音频与档案内容。上游修改边界及逐文件原因见 vendor/rhinelabui/UPSTREAM.md。
- 舞台字号按设计决定，不设下限；网站界面 ≥ 12px。不调整原版布局与排版。来源：scripts/check.mjs、scripts/smoke.mjs。
- 《明日方舟》及莱茵生命相关名称、标志、设定、原片和音频采样的权利归各自权利人所有。许可全文与免责声明见 demos/cases/archive-os/LICENSES.md。

## 迁移

- `vendor/rhinelabui/src/、content/`：上游源码与档案内容快照；仅修改 UPSTREAM.md 登记的协议接入点。
- `vendor/rhinelabui/film/`：虚拟时钟、输入时间表与原版声音离线渲染。
- `demos/cases/archive-os/app/`：Vite 产物与上游 public/ 的全部运行时资源。
- `demos/cases/archive-os/script.js`：MotionKit 舞台、时间轴、iframe 胶片重建、手动模式与单事件音轨。

[打开 Demo](../../demos/cases/archive-os/index.html) · [在库中查看](../../cases.html#case/archive-os)
