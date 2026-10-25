# 条目文案对照

基准：a452ea4。字段顺序沿用条目；删除的资料字段一并列出。Demo舞台文字按范围要求保留。

## entries/cases/archive-os.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C283 | showcase | （删除） |
| source · C284 | reference | （删除） |
| evidence · C285 | observed | （删除） |
| capturedAt · C286 | 2026-10-22 | （删除） |
| tags[0] · C287 | RhineLabUI 移植 | RhineLabUI |
| tags[6] · C293 | 原版配乐 | 三轨配乐 |
| summary · C294 | RhineLabUI 的完整移植：白底开场、五列循环档案阵列、对角解密、360° 查看器与结构拆解，原版模型、字体与配乐。 | 白底开场后，五列档案循环展开。读取时对角解密，还能360°查看模型、拆解与重组结构。 |
| focus · C295 | 复用 RhineLabUI 上游 12cc5e4 的源码、两份 GLB、字体、音频与四十份档案内容，仅接入 Motion Atlas 固定画幅、60Hz 虚拟时钟和统一音轨；视觉、排版、文案、交互与动效参数来自上游。来源：vendor/rhinelabui/src/、content/archives.json、UPSTREAM.md。 | 四十份档案按五类排列，阅读、模型与声音共用一条时间轴。两份 GLB 模型分别呈现档案与可拆解结构。画面按 60Hz 时钟播放，支持暂停与定位。 |
| rhythm.beats[0].note · C299 | F=0 为原版白底开场第一帧，内部帧窗为 25fps。来源：vendor/rhinelabui/src/boot-motion.ts。 | 白底开场，逐字输入以25fps呈现。 |
| rhythm.beats[1].note · C302 | 驱动实测视觉阵列阶段在第1320步首次开始，即22.0s；此时应用 mode 仍为 boot。来源：dev/shots/T5r/opening.json、vendor/rhinelabui/src/main.ts。 | 五列档案阵列展开。 |
| rhythm.beats[2].note · C305 | 驱动实测第2100步首次进入 detail，即 A=35.0s，原版自然读取 X-001。来源：dev/shots/T5r/opening.json、vendor/rhinelabui/src/main.ts。 | 自动打开第一份档案 X-001，进入详情页。 |
| rhythm.beats[3].note · C308 | A+7.5s 点击研究记录；之后访问日志、概述按原版 data-tab 派发。来源：vendor/rhinelabui/film/sequence.js、dev/shots/T5r/sequence.json。 | 切换研究记录，再查看访问日志与概述。 |
| rhythm.beats[4].note · C311 | A+14s 打开原版模型查看器。来源：vendor/rhinelabui/film/sequence.js、dev/shots/T5r/sequence.json。 | 打开360°模型查看器。 |
| rhythm.beats[5].note · C314 | A+19.1s 点击原版拆解按钮，六组结构沿原版动画展开。来源：vendor/rhinelabui/film/sequence.js、src/model-viewer.ts、dev/shots/T5r/sequence.json。 | 点击拆解，六组结构展开。 |
| rhythm.beats[6].note · C317 | A+23.35s 点击原版重组按钮。来源：vendor/rhinelabui/film/sequence.js、dev/shots/T5r/sequence.json。 | 点击重组，结构合拢。 |
| rhythm.beats[7].note · C320 | A+25.6s 按 Escape，mode 返回 archive。来源：vendor/rhinelabui/film/sequence.js、dev/shots/T5r/sequence.json。 | 按Escape返回档案阵列。 |
| rhythm.beats[8].note · C323 | B=A+27.6=62.6s 开始固定方向键序列；横竖画幅均实测发生列05→01、01→05与行01→08、08→01循环。来源：vendor/rhinelabui/film/sequence.js、dev/shots/T5r/sequence.json。 | 四向浏览，列05↔01、行01↔08首尾循环。 |
| layers[0].role · C325 | 原版逐字输入、莱茵生命标志、身份接入与权限验证。来源：vendor/rhinelabui/src/boot.ts、boot-motion.ts、boot-lettering.ts。 | 逐字输入后绘出莱茵生命标志，显示身份与权限。 |
| layers[1].role · C327 | Three.js 场景复用 archive-cassette.glb；五类各八份档案保留原版内容与双向循环。来源：vendor/rhinelabui/src/scene.ts、archive-loop.ts、data.ts、content/archives.json。 | 五类各八份档案组成3D阵列，支持双向循环。 |
| layers[2].role · C329 | 原版对角解密与正文同步揭示，保留概述、研究记录、访问日志页签。来源：vendor/rhinelabui/src/main.ts、decryption.ts、document-decryption.ts。 | 对角解密与正文同步揭示，页签分为概述、研究记录、访问日志。 |
| layers[3].role · C331 | 独立 Three.js 查看器复用 archive-assembly.glb，支持清晰、磨砂、旋转、复位、六组结构拆解与重组。来源：vendor/rhinelabui/src/model-viewer.ts。 | 模型可旋转、复位、切换清晰与磨砂，并拆解和重组六组结构。 |
| layers[4].name · C332 | 原版声音 | 声音 |
| layers[4].role · C333 | 三轨程序配乐、交互合成音、开场音与逐字输入采样按胶片时刻离线渲染。来源：vendor/rhinelabui/src/audio.ts、typing-samples.ts、licenses/audio/README.md。 | 三轨配乐、开场音、逐字短音与交互音随时间轴播放。 |
| composition.rhythm · C334 | 原版自然开场的视觉阵列阶段在22.0s开始，mode首次进入detail为A=35.0s；42.5s页签，49s查看器，54.1s拆解，58.35s重组，60.6s返回阵列，B=62.6s四向浏览，77.6s结束。来源：vendor/rhinelabui/film/sequence.js、dev/shots/T5r/opening.json、sequence.json。 | 22.0s展开阵列，35.0s读取档案。42.5s切页签，49s打开查看器。54.1s拆解，58.35s重组。60.6s返回，62.6s四向浏览，77.6s结束。 |
| composition.color · C335 | 背景 #e8e5e1、文字 #080a08、选中标记 #a27849 沿用原版 CSS。来源：vendor/rhinelabui/src/style.css。 | 背景#e8e5e1，文字#080a08，选中标记#a27849。 |
| composition.motion · C336 | 原版轨道与列镜头使用临界阻尼速率 3.7，常规选中抬起使用 4.2；空闲呼吸在交互停止 2.5s 后进入。来源：vendor/rhinelabui/src/scene.ts、motion.ts。数字滚动时长 460ms。来源：vendor/rhinelabui/src/main.ts。 | 轨道与列镜头的临界阻尼速率为3.7。选中抬起速率为4.2。停止交互2.5s后进入空闲呼吸。数字滚动时长460ms。 |
| composition.coherence · C337 | 开场、档案、模型、文字、控制与声音均来自同一上游应用；外层页面只承载舞台、同源 iframe 与 Motion Atlas 协议。来源：vendor/rhinelabui/src/、demos/cases/archive-os/index.html。 | 开场、档案、模型、文字与声音共享同一套界面语言。播放、定位和手动操作都在同一舞台里完成。 |
| composition.imagery · C338 | 原版档案 GLB 与可拆解 GLB 原样复用；档案文本来自 content/archives.json，下载文本来自 app/archives/。来源：vendor/rhinelabui/src/scene.ts、model-viewer.ts、data.ts。 | 档案与可拆解结构使用两份 GLB 模型。四十份档案可阅读，也可下载为文本。 |
| composition.layout · C339 | 横屏舞台 1920×1080，竖屏 1080×1920；iframe 的实际宽高交给原版 viewport-layout 决定桌面或 portrait 布局，portrait 分界为宽高比 &lt; 1.05。来源：vendor/rhinelabui/src/viewport-layout.ts。 | 横屏1920×1080，竖屏1080×1920。宽高比&lt;1.05时切换为竖屏布局。 |
| composition.sound · C340 | 三轨原创配乐与原版音效合成均由上游 audio.ts 调度；逐字输入使用三个 38ms 原 PV 采样。来源：vendor/rhinelabui/src/audio.ts、typing-samples.ts、licenses/audio/README.md。 | 三轨配乐叠加交互合成音。逐字输入使用三个38ms短音轮替。 |
| composition.typography · C341 | 保留原版字号与 MiSans 分片字体，不放大。字体包为 misans-webfont@4.3.1，Version 4.003。来源：vendor/rhinelabui/src/fonts.css、licenses/fonts/NOTICE.txt。舞台字号按设计决定，不设下限；网站界面 ≥ 12px。 | MiSans字体保持清楚的文字层级。字体包为misans-webfont@4.3.1。字体版本为4.003，网站界面文字≥12px。 |
| tokens.motion[0].value · C346 | 25fps 离散帧窗；应用内部时间 0 对应参考 PV 5s。来源：vendor/rhinelabui/src/boot-motion.ts。 | 开场以25fps离散播放。 |
| tokens.motion[1].value · C348 | 临界阻尼速率 3.7。来源：vendor/rhinelabui/src/scene.ts、motion.ts。 | 临界阻尼速率3.7。 |
| tokens.motion[2].value · C350 | 常规选中抬起临界阻尼速率 4.2。来源：vendor/rhinelabui/src/scene.ts。 | 选中抬起的临界阻尼速率4.2。 |
| tokens.motion[3].value · C352 | 滚动时长 460ms。来源：vendor/rhinelabui/src/main.ts。 | 滚动时长460ms。 |
| tokens.motion[4].value · C354 | 交互停止 2.5s 后进入空闲呼吸。来源：vendor/rhinelabui/src/scene.ts。 | 交互停止2.5s后进入空闲呼吸。 |
| tokens.motion[5].value · C356 | 交互解密进度按 (39.56−34.12)/1.5 = 3.6267s 运行。来源：vendor/rhinelabui/src/decryption.ts 的 DECRYPTION_START、DECRYPTION_END、INTERACTIVE_RATE。 | 解密时长为(39.56−34.12)/1.5=3.6267s。 |
| tokens.motion[6].value · C358 | performance / original / high / ultra 四种上游画质预设；默认 original。来源：vendor/rhinelabui/src/render-quality.ts。 | 画质分为performance、original、high、ultra。默认original。 |
| tokens.type | MiSans 分片字体与原版 CSS 字号。来源：vendor/rhinelabui/src/fonts.css、style.css、licenses/fonts/NOTICE.txt。 | MiSans分片字体，文字层级随画面整体缩放。 |
| observations[0].at · C359 | 源码 · content/archives.json / src/data.ts | 档案阵列 |
| observations[0].what · C360 | 原版共四十份档案，工程研究、生命科学、机构档案、能量研究、特别项目五列各八份。 | 工程研究、生命科学、机构档案、能量研究、特别项目五列各八份，共四十份。 |
| observations[1].at · C361 | 源码 · src/motion.ts / src/scene.ts | 选择与镜头 |
| observations[1].what · C362 | 原版 damp() 使用解析临界阻尼步进，列镜头与阵列轨道的常规速率为 3.7，常规选中抬起速率为 4.2。 | 列镜头与阵列轨道的临界阻尼速率为3.7，选中抬起为4.2。 |
| observations[2].at · C363 | 源码 · src/main.ts | 文字滚动 |
| observations[2].what · C364 | 原版数字与标题滚动时长为 460ms；档案阅读、页签、检索、收藏与键盘操作保留在应用内。 | 数字与标题滚动460ms，页签、检索、收藏与键盘操作随时可用。 |
| observations[3].at · C365 | 源码 · src/decryption.ts | 解密 |
| observations[3].what · C366 | 原片解密区间 34.12–39.56s，交互倍率 1.5；对应交互进度时长 3.6267s，属于源码推导值。 | 解密区间34.12–39.56s，倍率1.5，交互时长3.6267s。 |
| observations[4].at · C367 | 源码 · src/viewport-layout.ts | 画幅 |
| observations[4].what · C368 | 宽高比低于 1.05 使用 portrait；外层固定画幅把实际尺寸传给 iframe。 | 宽高比低于1.05时使用竖屏布局，内容随固定画幅缩放。 |
| observations[5].at · C369 | LICENSE / PR15-ATTRIBUTION.md / licenses/audio/README.md | 逐字输入 |
| observations[5].what · C370 | 保留 LBEILC / RhineLabUI 与 PacificSauryMan 的署名；原 PV 的逐字输入采样与第三方字体等遵守各自权利声明。 | 逐字输入配合短音，文字与声音同步出现。 |
| observations[6].at · C371 | 驱动实测 · dev/shots/T5r/opening.json / sequence.json | 浏览节奏 |
| observations[6].what · C372 | 阵列视觉阶段第1320步=22.0s；首次detail第2100步=A35.0s，读取X-001；B62.6s，duration77.6s。横竖画幅固定输入轨迹一致，浏览包含行列双向回绕，两轮序列均无浏览器错误。 | 22.0s阵列；35.0s读取X-001；62.6s浏览，77.6s结束。 |
| observations[7].at · C373 | 音轨实测 · dev/shots/T5r/audio/verification.json / ffprobe.json | 声音 |
| observations[7].what · C374 | 完整原版音轨77.6s、48kHz、双声道Vorbis，三轨配乐；106个发声事件包含10个开场cue、71个逐字输入短音与25个交互音。音轨采样由原版算法与增益声像调度。 | 77.6s/48kHz双声道，106音=10开场+71逐字+25交互。 |
| interaction[0] · C375 | 胶片在 1/60s 网格上步进；向后定位、手动操作后的定位与画幅切换通过重新加载 iframe 重建。来源：vendor/rhinelabui/film/。 | 按1/60s定位；向后跳转或切换画幅时重新载入画面。 |
| interaction[1] · C376 | 暂停后可在 iframe 内使用原版键盘、鼠标与触摸交互；之后播放或定位恢复胶片状态。来源：demos/cases/archive-os/script.js、vendor/rhinelabui/src/main.ts。 | 暂停后可用键盘、鼠标或触摸操作；播放或定位恢复预设演示。 |
| interaction[2] · C377 | 声音通过 MotionKit.audio 乐谱的单个完整音轨事件播放，暂停、跳转与离线导出使用相同音轨。来源：demos/cases/archive-os/script.js、kit/motion-kit.js。 | 暂停、跳转与离线导出使用同一份完整音轨。 |
| constraints[0] · C385 | 忠实复用上游源码、模型、字体、音频与档案内容。上游修改边界及逐文件原因见 vendor/rhinelabui/UPSTREAM.md。 | 模型、字体、音频与四十份档案共同组成完整终端。 |
| constraints[1] · C386 | 舞台字号按设计决定，不设下限；网站界面 ≥ 12px。不调整原版布局与排版。来源：scripts/check.mjs、scripts/smoke.mjs。 | 保持画面布局与排版，网站界面文字≥12px。 |
| constraints[2] · C387 | 《明日方舟》及莱茵生命相关名称、标志、设定、原片和音频采样的权利归各自权利人所有。许可全文与免责声明见 demos/cases/archive-os/LICENSES.md。 | 名称、标志与档案内容围绕莱茵生命展开。 |
| prompt · C388 | 将 LBEILC/RhineLabUI 提交 12cc5e4 忠实移植为 Motion Atlas 案例。源码、两份 GLB、MiSans 字体、三轨配乐、合成音效、逐字输入采样与四十份档案内容原样复用；仅接入固定画幅、60Hz 虚拟时钟、输入胶片与统一音轨。开场自然运行至首次 detail，之后按胶片表演示页签、360° 查看器、六组结构拆解、重组、返回阵列与四向循环浏览。横屏 1920×1080、竖屏 1080×1920，由原版 viewport-layout 排版。保留上游视觉、字号、文案、动效参数、缓动与音量声像。 | 制作莱茵生命档案终端：白底开场、五列循环档案阵列、对角解密、360°查看器与结构拆解。使用两份GLB、MiSans字体、三轨配乐、合成音效、逐字短音与四十份档案。固定画幅，60Hz时钟与统一音轨。开场后自动读取档案，再依次演示页签、360°查看器、六组结构拆解、重组、返回阵列与四向循环浏览。横屏1920×1080、竖屏1080×1920，按画幅排版。保留视觉、字号、文案、动效参数、缓动与音量声像。 |
| videoPrompt · C389 | A faithful port of LBEILC/RhineLabUI at commit 12cc5e4. Preserve the original white opening, Rhine Lab identity, five-column archive array, diagonal decryption, document tabs, 360-degree model viewer, frosted and clear glass, six-part exploded structure and reassembly. Reuse the original models, typefaces, archive texts, music and sound. Use landscape 1920×1080 or portrait 1080×1920 through the original viewport layout. Follow the recorded film inputs without redesigning any visual or motion parameter. | A Rhine Lab archive terminal with a white opening, Rhine Lab identity, a five-column archive array, diagonal decryption, document tabs, a 360-degree model viewer, frosted and clear glass, a six-part exploded structure and reassembly. Include two GLB models, MiSans type, forty archive texts, three music tracks and sound. Use landscape 1920×1080 or portrait 1080×1920 layouts. Show the opening, archive reading, tabs, model viewer, disassembly, reassembly and four-direction browsing in sequence. |
| negativePrompt · C390 | 不要改造原版视觉、布局、字号、文案、动效参数、缓动、模型、字体、档案或声音；不要增添外层 UI、文字与装饰；不要裁剪或加速开场；不要修改胶片动作序列。 | 保持视觉、布局、字号、文案、动效参数、缓动、模型、字体、档案和声音；不要增添外层UI、文字与装饰；不要裁剪或加速开场；保持动作序列。 |
| migration[0].field · C391 | vendor/rhinelabui/src/、content/ | 档案与外观 |
| migration[0].how · C392 | 上游源码与档案内容快照；仅修改 UPSTREAM.md 登记的协议接入点。 | 档案内容、模型、字体与外观组成终端画面。 |
| migration[1].field · C393 | vendor/rhinelabui/film/ | 播放序列 |
| migration[1].how · C394 | 虚拟时钟、输入时间表与原版声音离线渲染。 | 时间表控制输入与声音，支持离线导出。 |
| migration[2].field · C395 | demos/cases/archive-os/app/ | 运行资源 |
| migration[2].how · C396 | Vite 产物与上游 public/ 的全部运行时资源。 | 页面与模型、字体、声音等运行资源。 |
| migration[3].field · C397 | demos/cases/archive-os/script.js | 舞台与控制 |
| migration[3].how · C398 | MotionKit 舞台、时间轴、iframe 胶片重建、手动模式与单事件音轨。 | 舞台、时间轴、定位、手动操作与完整音轨。 |
| research | docs/research/archive-os.md | （删除） |
| sources[0].title · C405 | LBEILC/RhineLabUI · 12cc5e4 | （删除） |
| sources[0].url | https://github.com/LBEILC/RhineLabUI/tree/12cc5e4013acb9408f753ff71de6b8492299b7c8 | （删除） |
| sources[0].note · C406 | 上游代码、模型、字体、声音与档案内容；本地只读来源与改动清单见 vendor/rhinelabui/UPSTREAM.md。 | （删除） |
| sources[0].type · C407 | 一手源码 | （删除） |
| sources[1].title · C408 | RhineLabUI · LICENSE | （删除） |
| sources[1].url | https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/LICENSE | （删除） |
| sources[1].note · C409 | Copyright (c) 2026 LBEILC；MIT 全文保留在案例 LICENSES.md。第三方权利不由 MIT 代为授权。 | （删除） |
| sources[1].type · C410 | 一手资料 · 许可 | （删除） |
| sources[2].title · C411 | RhineLabUI · PR15-ATTRIBUTION.md | （删除） |
| sources[2].url | https://github.com/LBEILC/RhineLabUI/blob/12cc5e4013acb9408f753ff71de6b8492299b7c8/PR15-ATTRIBUTION.md | （删除） |
| sources[2].note · C412 | 保留 LBEILC / RhineLabUI、PacificSauryMan 与原文辅助工具署名。 | （删除） |
| sources[2].type · C413 | 一手资料 · 署名 | （删除） |
| sources[3].title · C414 | 《明日方舟》特别映像「莱茵生命：访问」 | （删除） |
| sources[3].url | https://www.bilibili.com/video/BV1rr4y1b7sz/ | （删除） |
| sources[3].note · C415 | 上游 README 所列参考 PV；本轮移植使用已提供的只读上游源码和对照运行副本。 | （删除） |
| sources[3].type · C416 | 原作参考 | （删除） |
| energy[0] | （删除） | 0.12 |
| energy[1] | （删除） | 0.18 |
| energy[2] | （删除） | 0.22 |
| energy[3] | （删除） | 0.26 |
| energy[4] | （删除） | 0.3 |
| energy[5] | （删除） | 0.32 |
| energy[6] | （删除） | 0.36 |
| energy[7] | （删除） | 0.4 |
| energy[8] | （删除） | 0.44 |
| energy[9] | （删除） | 0.5 |
| energy[10] | （删除） | 0.6 |
| energy[11] | （删除） | 0.82 |
| energy[12] | （删除） | 0.6 |
| energy[13] | （删除） | 0.52 |
| energy[14] | （删除） | 0.5 |
| energy[15] | （删除） | 0.48 |
| energy[16] | （删除） | 0.5 |
| energy[17] | （删除） | 0.7 |
| energy[18] | （删除） | 0.6 |
| energy[19] | （删除） | 0.55 |
| energy[20] | （删除） | 0.5 |
| energy[21] | （删除） | 0.62 |
| energy[22] | （删除） | 0.56 |
| energy[23] | （删除） | 0.54 |
| energy[24] | （删除） | 0.72 |
| energy[25] | （删除） | 0.66 |
| energy[26] | （删除） | 0.64 |
| energy[27] | （删除） | 0.92 |
| energy[28] | （删除） | 0.8 |
| energy[29] | （删除） | 0.84 |
| energy[30] | （删除） | 0.62 |
| energy[31] | （删除） | 0.78 |
| energy[32] | （删除） | 0.72 |
| energy[33] | （删除） | 0.8 |
| energy[34] | （删除） | 0.74 |
| energy[35] | （删除） | 0.8 |
| energy[36] | （删除） | 0.74 |
| energy[37] | （删除） | 0.7 |
| energy[38] | （删除） | 0.55 |

## entries/cases/map-pilgrimage.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| subtitle · C429 | CARTOGRAPHIC PILGRIMAGE / MAP × HUD × MEMORY | CARTOGRAPHIC PILGRIMAGE · MAP / HUD |
| carriers[1] · C431 | showcase | （删除） |
| source · C432 | reference | （删除） |
| evidence · C433 | observed | （删除） |
| capturedAt · C434 | 2026-10-14 | （删除） |
| summary · C443 | 以真实地图为“交互基地”，四角 HUD 记录日序、坐标、时间与音乐；镜头沿关西三日的铁路推进（上海 → 关西机场 → 京都 → 奈良 → 大阪），在照片卡片、全屏实景、插画回忆与分屏对比之间切换，配一段 120 BPM 的原创乐谱，把一段旅行剪成游戏过场。横竖两套构图，地图瓦片像视频一样边播边缓冲。 | 地图串起上海至关西的三日旅程。四角HUD持续报时，照片、回忆与分屏随120 BPM乐谱切换。 |
| focus · C444 | 参考视频 151 秒、1920×1080，由 Agent 用旅行素材自动剪辑，内容正是日本旅行（关西、京都）。它的价值不在某个特效，而在“一个稳定的世界层 + 一套持续更新的信息层 + 有节制的模式切换”：地图永远是底座，HUD 永远在报时，只有高光才允许离开地图。Demo 用原创内容（関西周遊：关西机场 → 伏见稻荷 → 鸭川 → 奈良公园 → 道顿堀，60 秒）完整复现这套结构；日本的 OpenStreetMap 数据（建筑、铁路、水系）完整，3D 建筑与真实铁路几何在每个镜头里都一致。所有时间点写在 config.js 的轨道里，画面与乐谱读同一张时间表。 | 地图是稳定的底座，HUD持续更新，高光时切到全屏。60秒走过关西机场、伏见稻荷、鸭川、奈良公园和道顿堀。OpenStreetMap呈现3D建筑、铁路与水系。画面与乐谱共用一张时间表。 |
| rhythm.beats[0].note · C449 | 夜间地球缓推，星空在地球后方；上海与关西两个标记依次出现（声呐音），左下 NOW PLAYING 已在。 | 夜间地球缓推，上海与关西两个标记依次出现。 |
| rhythm.beats[1].note · C452 | 暗 → 灰 → 亮约 1 秒，底图逐图层插值配色（不是整体反色）；反向渐强 + 上扫呼啸落在钟声上。 | 底图约1秒经暗、灰转亮，呼啸落在钟声上。 |
| rhythm.beats[2].note · C455 | 竖排「関西周遊」逐字模糊落下（160ms 错峰，每字一声键击），横线描出，KANSAI LOOP '26 带模糊前沿打字；7.3s 整体模糊淡出。 | 関西周遊逐字160ms；'26打字；7.3s淡出。 |
| rhythm.beats[3].note · C458 | 底鼓 + 次低频起拍；MU 515 虚线航线随镜头一口气从地球推到关西机场，飞机图标领路，长呼啸与风声。 | MU 515虚线航线带镜头推到关西机场。 |
| rhythm.beats[4].note · C461 | 大号日序 DAY 描边 + 01 实心滚入；机窗照片卡片浮入，计数 ×1、步进器第一站「関空」印章盖下。 | DAY 01滚入，卡片浮入，计数×1并盖章。 |
| rhythm.beats[5].note · C464 | 关西全景，JR HARUKA 发光实线沿真实铁路描出，车头领路，过轨“哐当”按拍；顶部规尺与步进器同步推进。 | JR HARUKA沿铁路描出，车头领路。 |
| rhythm.beats[6].note · C467 | 镜头推到 z14 俯仰 48°，3D 建筑立起；竖排「京都」逐字入场，千本鸟居卡片浮入并以引线连到地图标记。 | z14、俯仰48°，3D建筑与鸟居卡片出现。 |
| rhythm.beats[7].note · C470 | 卡片 0.6s 展开为全屏，HUD 保留并转白字压暗；停 2.2s（Ken Burns 推近）后收回，期间镜头在遮挡下换到鸭川。 | 卡片0.6s展开，停2.2s后收回，HUD保留。 |
| rhythm.beats[8].note · C473 | CHAPTER 01 标签擦出 + 标题打字，强调色换成青色，屏幕四角框线描出、四角方块错峰回弹，钟声 + 三音确认。 | CHAPTER 01打字，青色框线与方块回弹。 |
| rhythm.beats[9].note · C476 | 全屏插画回忆：独立框线、FLASHBACK · 方丈記 1212 标签、竖排「ゆく河の流れは 絶えずして」逐字（每字一声钟）、英文字幕打字、黑胶噪点与颗粒加重。 | 方丈記1212回忆展开，竖排字幕配钟声。 |
| rhythm.beats[10].note · C479 | 实景全屏 → 分割线 0.75s 从左滑到中线露出 1930 年代明信片，倾斜描边时间戳「10.01 · 17:40 JST」回弹盖章。 | 0.75s分屏1930s；10.01·17:40JST盖章。 |
| rhythm.beats[11].note · C482 | 底图逐层入夜；通知条 TRAVEL NOTE 弹出，手写便签（鸟居、河流、月亮涂鸦）落在地图上又收回。 | 地图入夜，通知与手写便签短暂出现。 |
| rhythm.beats[12].note · C485 | 天亮 + DAY 02；JR NARA LINE 实线描出，到奈良站后步行圆点走进奈良公园。 | DAY 02天亮，JR NARA LINE通向奈良。 |
| rhythm.beats[13].note · C488 | CHAPTER 02 换琥珀色，底部斜纹胶带 + 网点装饰；竖排「奈良」，鹿与东大寺卡片，第三枚印章。 | CHAPTER 02换琥珀色，鹿卡片与第三枚印章出现。 |
| rhythm.beats[14].note · C491 | 红色 WRONG TRAIN 通栏从左擦入（错误音 + 警报 + 故障声），错误路线画红并以叉号收尾，黑色 REROUTING 胶囊省略号与“嘀”同拍。 | 红色误乘横幅擦入，错误路线画叉，改道提示闪烁。 |
| rhythm.beats[16].note · C497 | 镜头推到 z15.6 俯仰 58°，夜色 3D 街区；竖排「大阪」，霓虹竖卡（霓虹嗡鸣），收集托盘最后一格点亮。 | z15.6俯仰58°，大阪3D夜景与霓虹卡出现。 |
| rhythm.beats[17].note · C500 | DAY 03 + 天亮，镜头拉远到全线路，所有标记与路线同屏。 | DAY 03天亮，镜头拉远，全线路与标记同屏。 |
| rhythm.beats[18].note · C503 | 数字逐行计数堆叠（320ms 错峰，阳音阶上行），衬线「関西周遊 — fin.」与署名、出处；钟声与终止和弦。 | 统计320ms错峰堆叠，fin.配终止和弦。 |
| layers[0].role · C505 | 真实底图（MapLibre GL 5 + OpenFreeMap positron + AWS Terrain Tiles 山体阴影），镜头关键帧驱动；z14 起 3D 建筑；昼夜按图层类别逐个插值配色；开场为地球投影 + 星空。 | MapLibre GL 5底图含山影与星空，z14起立起3D建筑。 |
| layers[1].role · C507 | 航线虚线、铁路发光实线（line-gradient 按进度截断，几何取自矢量瓦片里的真实铁路）、步行圆点、错误路线红线，全部在 GL 图层内绘制；车头 / 飞机 / 节点用同一个投影函数画在 SVG 上，圆心与线端严格重合。 | 航线、铁路、步行与错误路线共用地图投影，车头与端点重合。 |
| layers[2].role · C509 | 站名标签固定宽度 + 8 个候选位置避让（HUD 保留区与事件文字矩形优先），路线标签沿线多点 + 法线两侧候选避让；引线在标签放好后再画，文字永不压线。 | 站名从8个位置避让HUD与事件文字，放好标签后绘制引线。 |
| layers[3].role · C511 | 照片卡片、全屏实景、插画回忆、分屏对比（scenes.js 程序生成的五个日本场景 × 照片 / 明信片 / 插画三种风格）；同一时间只有一种全屏媒体。 | 五个日本场景各有照片、明信片、插画三种风格，全屏媒体依次切换。 |
| layers[4].role · C513 | 左上日序与日期；右上坐标 / 海拔 / 缩放与 JST 时钟；顶部规尺随旅程进度填充；左下正在播放与双语歌词；右下（竖屏为底部）旅程步进器与车站印章；计数徽章“MIKAN SPOTTED”。 | 四角显示日序、坐标、时钟、歌词、印章与计数，中央留给地图。 |
| layers[5].role · C515 | 片名、地名竖排标题、章节标签与装饰（四角框线 / 斜纹胶带）、警示横幅、通知、便签、大号日序——短暂出现、有明确入出场。 | 片名、地名、章节、警示与便签短暂出现，各有入场和离场。 |
| layers[6].role · C517 | 按时间选位置的颗粒（独立合成层，只平移不重绘，可复现）、暗角、回忆段加重；全屏图片时上下压暗。 | 颗粒随时间平移，回忆段加重；全屏图片上下压暗。 |
| layers[7].role · C519 | 120 BPM 乐谱：空气声与夜间低频持续音、铺底和弦、贝斯、半拍鼓组、日本阳音阶拨弦琶音 + 事件音（声呐、键击、过轨、快门、印章、钟、警报、霓虹嗡鸣）；与画面同一张时间表。 | 120 BPM乐谱叠加环境声、和弦、贝斯、鼓、拨弦与事件音。 |
| layers[8].role · C521 | 播放前扫描全片镜头需要的瓦片，播放中两级缓冲（下载进 HTTP 缓存 45s、解析进地图缓存 10s，内存预算 20MB 原始字节，低内存设备 10MB），前方不足 0.5s 自动暂停并显示 BUFFERING MAP，攒够 4s 继续；渲染模式逐帧等瓦片。 | 缓冲45s/10s，内存20MB/10MB；&lt;0.5s停，4s续。 |
| composition.color · C522 | 白天米白纸色 #f1eee7 + 墨色 #16171a；夜晚深蓝黑 #0b1019；默认朱色强调 #d9562c，章节临时换色（鸭川青 #2a8fae、奈良琥珀 #c98a2a）并同步到路线、卡片描边、框线；警示红 #e23b3b。 | 白天纸色#f1eee7与墨色#16171a。夜晚深蓝黑#0b1019，默认强调朱色#d9562c。鸭川青#2a8fae、奈良琥珀#c98a2a随章节切换。警示使用红色#e23b3b，路线、描边与框线同步换色。 |
| composition.typography · C523 | 竖排汉字用明朝体（Yu Mincho / Noto Serif JP）做片名与地名，英文标题用无衬线（Segoe UI Variable / Helvetica），坐标、时间、标签用等宽（Cascadia Mono / JetBrains Mono）并放宽字距，结尾用衬线营造“落幕”。舞台字号按设计决定，不设下限；网站界面 ≥ 12px。 | 竖排片名与地名用Yu Mincho / Noto Serif JP明朝体。英文标题用Segoe UI Variable / Helvetica。数据用Cascadia Mono / JetBrains Mono等宽字体。数据字距放宽，结尾改用衬线。网站界面文字≥12px。 |
| composition.layout · C524 | 固定画幅、两套构图。横屏 1920×1080：边距 64，顶部规尺 y=116，四角 HUD，卡片靠右（824×464）、地名标题靠左，右下印章与步进器同列。竖屏 1080×1920：HUD 集中在顶部 276px 内，规尺 y=264，印章改为右侧一列（像护照印章栏），卡片放到下半屏通栏（968×544），步进器在底部；镜头焦点 fp 单独为竖屏取景。 | 固定画幅，两套构图。横屏1920×1080，边距64，规尺y=116。卡片靠右，大小824×464，地名靠左。右下印章与步进器同列。竖屏1080×1920，HUD在顶部276px内，规尺y=264。印章在右侧，968×544卡片放到下半屏。步进器在底部，fp单独控制竖屏取景。 |
| composition.imagery · C525 | 程序生成的原创日本场景：机窗（关西机场）、千本鸟居、鸭川三条、奈良鹿与东大寺、道顿堀霓虹；每个场景有照片、旧明信片、插画三种风格，按画幅重绘。正式作品在 config.js 填真实照片即可。 | 场景包括关西机场机窗、千本鸟居、鸭川、奈良鹿与东大寺、道顿堀。每处各有照片、旧明信片、插画三种风格，按画幅重绘。可在config.js填入真实照片。 |
| composition.motion · C526 | 镜头缓入缓出，长距离用“一口气推近”的单段缓动（ease-out）；文字用“模糊 → 清晰”逐字入场；卡片 550ms 浮入、600ms 展开；章节框线 800ms 描出、四角方块错峰回弹；盖章用回弹；结尾计数逐行堆叠。 | 镜头缓入缓出，长距离用单段ease-out推近。文字从模糊逐字变清晰。卡片550ms浮入、600ms展开。章节框线800ms描出，四角方块错峰回弹。盖章带回弹，结尾计数逐行堆叠。 |
| composition.sound · C527 | 默认静音，开启后播放整段乐谱（120 BPM，D 大调 + 日本阳音阶 D E G A B）：环境底（空气声、夜间低频持续音）+ 铺底和弦 / 贝斯 / 半拍鼓组 / 拨弦琶音 + 事件音（标记声呐、片名键击、航线呼啸、铁路过轨“哐当”、卡片快门、计数确认、印章、章节钟声、回忆黑胶与逐字钟、分屏盖章、警报与“嘀”、霓虹嗡鸣、结尾阳音阶上行与终止和弦）。整段离线导出峰值约 -1.7 dBFS、无削波；render.mjs --audio 与画面同步导出。 | 默认静音，开启后播放120 BPM整段乐谱。调式为D大调与日本阳音阶D E G A B。环境底叠加和弦、贝斯、半拍鼓组与拨弦。标记、文字、路线、卡片、印章与章节各配事件音。回忆段有黑胶与逐字钟，夜景配霓虹嗡鸣。结尾阳音阶上行后落到终止和弦。离线音轨峰值约-1.7 dBFS，无削波。导出视频时加--audio同步导出声音。 |
| composition.rhythm · C528 | 120 BPM（1 小节 2 秒），段落起点落在小节线上：约每 4–6 秒一个事件，每 10–15 秒一次地图 ↔ 全屏切换，高光前后留 1–2 秒地图呼吸。 | 120 BPM，1小节2秒，段落落在小节线上。约每4–6秒一个事件，每10–15秒一次地图与全屏切换。高光前后留1–2秒地图呼吸。 |
| composition.coherence · C529 | 所有模式共享同一套 HUD、颗粒与强调色系统，所以全屏、回忆、对比都像同一个“系统”里的不同视图；地图标记、路线端点、车头、引线、标签锚点都来自同一个投影函数。 | 全屏、回忆与对比共享HUD、颗粒和强调色。标记、路线端点、车头、引线与标签共用同一投影。 |
| tokens.motion[0].value · C538 | 550ms outCubic，字间 160ms，模糊 18px → 0，上移 14px → 0（地名标题同参数） | 550ms outCubic，字间160ms。模糊18px→0，上移14px→0。地名标题使用同样参数。 |
| tokens.motion[2].value · C542 | 550ms outCubic 浮入，400ms inCubic 离场；图片持续 Ken Burns | 550ms outCubic浮入，400ms inCubic离场。图片持续Ken Burns推近。 |
| tokens.motion[3].value · C544 | 600ms inOutCubic 展开，停 2.2s（Ken Burns 1.04→1.10），550ms 收回；HUD 转白字 + 上下压暗 | 600ms inOutCubic展开。停2.2s，Ken Burns缩放1.04→1.10。550ms收回，HUD转白字，上下压暗。 |
| tokens.motion[5].value · C548 | 标签 350ms 擦出 + 标题 700ms 打字；框线 800ms inOutCubic 描出，四角方块 120ms 错峰 300ms outBack | 标签350ms擦出，标题700ms打字。框线800ms inOutCubic描出。四角方块120ms错峰，300ms outBack。 |
| tokens.motion[6].value · C550 | 分割线 750ms outQuart 滑到中线；时间戳 360ms outBack 盖章 | 分割线750ms outQuart滑到中线。时间戳360ms outBack盖章。 |
| tokens.motion[9].value · C556 | 前方缓冲 &lt; 0.5s 暂停并显示 BUFFERING MAP xx%，攒够 4s 继续 | 缓冲&lt;0.5s时暂停，显示BUFFERING MAP xx%。攒够4s继续。 |
| observations[0].what · C558 | 深色太空中地球自转推近，首尔与关西标记带英中标签依次出现；左下已在显示 NOW PLAYING。 | 地球在深色太空中推近，首尔与关西标记依次出现，左下持续显示曲名。 |
| observations[2].what · C562 | 竖排「聖地巡礼」逐字模糊入场，横线描出，PILGRIMAGE '26 从左向右打出且前沿模糊。 | 「聖地巡礼」逐字模糊入场，横线描出，PILGRIMAGE '26打字。 |
| observations[4].what · C566 | 照片卡片在地图上切换，地名竖排模糊入场；22.7 秒硬切为全屏实拍，HUD 保留。 | 卡片切换、地名模糊入场；22.7秒硬切全屏，HUD保留。 |
| observations[5].what · C568 | 夜 → 昼的同时出现 DAY 02（DAY 描边、02 实心）；章节主题出现时屏幕四角框线描出、强调色变为该作品的蓝色。 | 夜转昼时DAY 02滚入，DAY描边、02实心；蓝色章节框线描出。 |
| observations[6].what · C570 | 全屏动画回忆：蓝色内框、FLASHBACK · S1 EP05 标签、竖排日文字幕逐字揭示、英文字幕打字、底部场景说明，颗粒明显。 | 蓝框回忆标注S1 EP05，日文逐字、英文打字，底部说明配颗粒。 |
| observations[8].what · C574 | 动画 → 实景经暗场交叉；分割线从左滑到中线，ANIME · 2015 / REAL · 2026 标签，倾斜描边时间戳“10.01 · 18:20 JST”。 | 动画2015/实景2026分屏；10.01·18:20JST斜戳盖章。 |
| observations[9].what · C576 | 红色通栏 ⚠ WRONG TRAIN + 线路说明，黑色 ◀◀ REROUTING… 胶囊；错误路线画红并以叉号收尾。 | WRONG TRAIN红色横幅出现，错误路线打叉，REROUTING胶囊闪烁。 |
| observations[10].what · C578 | 结尾统计堆叠：7 DAYS · 2 COUNTRIES / 5 WORKS VISITED / 3 NOTES LEFT / ×19 SIGHTINGS / 1,159 km，衬线「聖地巡礼 — fin.」与署名、音乐与动画出处。 | 7天2国5作品3笔记，×19目击，1,159km；「聖地巡礼」收尾。 |
| interaction[0] · C579 | 影像模式：空格播放 / 暂停，←/→ 跳 1 秒，Shift+←/→ 跳到上 / 下一个节拍；站内刻度条可拖动并显示节拍与能量曲线；详情页可切换横 / 竖画幅与声音。 | 空格播放暂停；方向键跳1秒，Shift加方向键跳拍；可拖动、切画幅与声音。 |
| interaction[1] · C580 | 实时播放像视频一样缓冲：开头 6 秒的瓦片到位即开播（加载进度报给站点），其余边播边取；网络跟不上时停在当前帧显示 BUFFERING MAP，够了自动继续；拖动到未缓冲的位置同理。 | 开头6秒就绪即播放；缓冲不足停在当前帧，资源到位自动继续。 |
| interaction[2] · C581 | 逐帧渲染：?render=1 关闭自动播放，每次 seek 等待地图瓦片完成再返回，scripts/render.mjs 据此导出帧序列，--audio 同时导出乐谱 WAV 并合成 MP4。 | ?render=1逐帧等瓦片；--audio同时导出WAV与MP4。 |
| interaction[3] · C582 | ?tilemirror=&lt;地址&gt;（与可选的 ?demmirror=）把矢量瓦片与高程瓦片改走自建镜像：离线演示、内网部署、可重复的网络测试。 | ?tilemirror与?demmirror可指定地图镜像，供离线或内网使用。 |
| interaction[4] · C583 | 离线或地图服务不可用时自动退回纸面网格，HUD、路线、卡片与转场保持完整。 | 地图服务不可用时显示纸面网格，HUD、路线、卡片与转场继续呈现。 |
| useCases[5] · C589 | 交互式行程展示台 | 交互式行程展示 |
| constraints[0] · C593 | 参考视频为 B 站公开作品，Demo 只学习结构与节奏，画面、文字、地点、乐谱全部替换为原创或公有领域内容；不使用任何动画作品名称或画面。 | 画面、文字、地点与乐谱共同呈现关西三日旅程。 |
| constraints[1] · C594 | 参考视频中的动画截图与音乐属于各自权利人，本库不收录其帧画面。 | 照片、明信片与插画按画幅绘制。 |
| constraints[2] · C595 | 底图使用 OpenFreeMap（OpenStreetMap 数据）与 AWS Terrain Tiles，必须保留署名；关西各镜头点位已逐级实测（建筑挤出、道路、水系、铁路、地名完整）。 | OpenFreeMap底图与AWS高程显示建筑、铁路、水系和地名。 |
| constraints[3] · C596 | 程序化“照片”只用于示意；正式作品请在 config.js 填入有权使用的真实照片。 | 在config.js填入照片，即可替换程序场景。 |
| constraints[4] · C597 | 固定画幅：横屏 1920×1080、竖屏 1080×1920 两套构图，整体等比缩放；舞台字号按设计决定，不设下限；网站界面 ≥ 12px。 | 横屏1920×1080、竖屏1080×1920等比缩放，网站文字≥12px。 |
| constraints[5] · C598 | 全片瓦片约 730 块 / 130MB（横屏），其中约 290 块 / 66MB 为“必需”；10Mbps 网络下会有 1–2 次数秒的缓冲暂停（实测见研究笔记）。 | 约730块/130MB；约290块/66MB必需。10Mbps缓冲1–2次。 |
| migration[0].how · C603 | 片名（竖排汉字 + 英文）、副标题、时区、总天数、时长与 BPM。 | 设置片名、副标题、时区、总天数、时长与BPM。 |
| migration[1].how · C605 | 每个地点的英文名、日文 / 中文名、经纬度、海拔、最小显示缩放；路线端点会对齐到这里。 | 设置地点名称、经纬度、海拔与最小缩放，路线端点自动对齐。 |
| migration[2].how · C607 | 镜头关键帧：c 中心、z 缩放、p 俯仰、b 方位、f / fp 为地点在横 / 竖屏上的位置、zp 竖屏缩放差、e 缓动。长距离移动用一段 ease-out 一口气推近（快速推拉帧的瓦片会降级，缓冲更省）。 | c中心、z缩放、p俯仰、b方位、f/fp取景、zp竖屏缩放、e缓动。 |
| migration[3].how · C609 | 铁路与步行几何（经纬度数组）。可以从矢量瓦片的 transportation 图层（class = rail）提取，或用任何 GeoJSON 线。 | 设置铁路与步行经纬度，可用rail图层或GeoJSON线。 |
| migration[4].how · C611 | night / clock / day / dayCard / progress / routes / markers / locTitle / cards / counter / stamps / chapter / flashback / compare / toast / note / alert / outro 轨道，改时间即改节奏；画面与乐谱同时跟着变。 | 调整各事件轨道时刻，画面与乐谱同步改变节奏。 |
| migration[5].how · C613 | 章节标签、标题、强调色与装饰（frame 四角框线 / tape 斜纹胶带）；步进器四站与印章文字。 | 设置章节标题、强调色、框线或胶带，以及四站步进器与印章。 |
| migration[6].how · C615 | 和弦、阳音阶与到站提示音；乐谱由 script.js 的 buildScore() 按轨道生成。 | 设置和弦、阳音阶与到站提示音，按轨道生成乐谱。 |
| migration[7].how · C617 | 横 / 竖两套版式几何（规尺、步进器、印章、卡片区域、标签避让区、收尾统计区），舞台像素坐标。 | 分别设置横竖规尺、步进器、印章、卡片、避让区与统计区。 |
| migration[8].how · C619 | 纸色、墨色、夜色与强调色；底图逐图层的白天 / 夜晚配色；底图样式、MapLibre 版本、高程瓦片。 | 设置纸色、墨色、夜色、强调色与地图昼夜配色、样式和高程。 |
| migration[9].how · C621 | 仅在没有真实照片时使用；cards[].media 填图片路径即用真实照片。 | cards[].media填图片路径，即可换成真实照片。 |
| migration[10].how · C623 | 实时缓冲参数：开头门槛 gate、解析窗口 ahead、下载窗口 fetchAhead、内存预算 budgetMB、暂停 / 继续阈值 stall / resume。 | 设置开头门槛、解析与下载范围、内存预算、暂停与继续阈值。 |
| research | docs/research/map-pilgrimage.md | （删除） |
| sources[0].title · C636 | 【眩晕瘫坐 旅游时拍的素材给Opus5.5剪出来是这样】· 哔哩哔哩 | （删除） |
| sources[0].url | https://b23.tv/eBjaN0O | （删除） |
| sources[0].type · C637 | 实例 · 影像 | （删除） |
| sources[0].note · C638 | 用户提供并下载到本地的 151.2 秒 1920×1080 成片；2026-10-14 以 2 秒间隔全片取样，并在 6 处转场以 0.25–0.3 秒间隔逐帧观察。画面署名 @DWTornier。 | （删除） |
| sources[1].title · C639 | OpenFreeMap | （删除） |
| sources[1].url | https://openfreemap.org/ | （删除） |
| sources[1].type · C640 | 资料 · 底图 | （删除） |
| sources[1].note · C641 | 免费、无需密钥的矢量瓦片与样式；参考视频右下角同样标注 OpenStreetMap / OpenFreeMap。 | （删除） |
| sources[2].title · C642 | MapLibre GL JS | （删除） |
| sources[2].url | https://maplibre.org/maplibre-gl-js/docs/ | （删除） |
| sources[2].type · C643 | 资料 · 渲染 | （删除） |
| sources[2].note · C644 | 地球投影、jumpTo + padding、fill-extrusion、line-gradient 线图层、瓦片缓存（SourceCache）与 worker 解析。 | （删除） |
| sources[3].title · C645 | 鴨長明《方丈記》（1212） | （删除） |
| sources[3].type · C646 | 资料 · 公有领域 | （删除） |
| sources[3].note · C647 | Demo 回忆段竖排字幕「ゆく河の流れは 絶えずして」与英译。 | （删除） |
| sources[4].title · C648 | AWS Terrain Tiles（Mapzen terrarium） | （删除） |
| sources[4].url | https://registry.opendata.aws/terrain-tiles/ | （删除） |
| sources[4].type · C649 | 资料 · 高程 | （删除） |
| sources[4].note · C650 | 山体阴影的高程瓦片（z5.5–13 使用）。 | （删除） |

## entries/patterns/alert-reroute.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| mechanism · C852 | 警示横幅、改道胶囊、错误路线与 X、改道路线、该时段标记标签，以及已完成的持续路线。以巧思时间 t 映射到案例时刻 caseT，复制函数 drawAlert、addRouteLayers、updateRoutesGL、drawRoutesSVG、drawMarkers、measureMarkerLabels、cameraAt、project 按 caseT 求值。 | 误乘横幅擦入，错误路线变红并画叉。改道胶囊闪烁，与警报和提示音同步。 |
| timing[4].value · C864 | blip、whoosh、error、glitch、clack、alarm、beep、stamp | blip、whoosh、error、glitch。clack、alarm、beep、stamp。 |
| composition.notes · C875 | 警示横幅、改道胶囊、错误路线与 X、改道路线、该时段标记标签，以及已完成的持续路线。 | 误乘横幅擦入，错误路线变红并画叉。改道胶囊闪烁，与警报和提示音同步。 |
| sources[0].observation · C878 | 坐错车时红色警示横幅压下，错误路线打叉，改道路线重新描画。 | （删除） |
| sources[0].evidence · C879 | observed | （删除） |
| sources[0].locator · C880 | caseT 44.8→50.3 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：blip、whoosh、error、glitch、clack、alarm、beep、stamp。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C899 | 复制的函数 | 动效函数 |
| migration[0].how · C900 | drawAlert、addRouteLayers、updateRoutesGL、drawRoutesSVG、drawMarkers、measureMarkerLabels、cameraAt、project | 配置警示、改道提示、路线与标签。 |
| migration[1].how · C902 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。实时地图使用案例 MapLibre 5.6.0、样式 URL、自定义图层与 tilemirror / demmirror 参数。 | 配置MapLibre 5.6.0、样式、图层与地图镜像。 |
| migration[2].how · C904 | config.js 的 tracks.alert / routes / markers、stops 与 tracks.camera；paths.js 的 wrong / reroute 与已完成路线几何；横竖安全框判断后的固定镜头。 | 设置警示轨道、错误路线、地图与横竖布局。 |
| migration[3].how · C906 | caseT 44.8→50.3 | 44.8→50.3 |
| migration[4].how · C908 | 事件 voice：blip、whoosh、error、glitch、clack、alarm、beep、stamp；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/boot-typing.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[2] · C916 | showcase | （删除） |
| summary · C917 | 白场上逐字输入请求、停顿、黑底闪一下再清空，圆环与标志随后绘出，身份确认三行错峰打字——用“输入的节奏”建立系统的可信度。 | 白场逐字输入后闪黑清空，圆环与标志依次绘出，再打出三行身份确认，用输入节奏营造开机感。 |
| mechanism · C918 | 预先计算每个字符的出现时刻（每字间隔 + 指定字符后的停顿），渲染与音效共用同一份时刻表；行完成时黑底反色闪 180ms 后清空；圆环用 stroke-dashoffset 依次描出，标志笔画随后显现；光标在输入中常亮、完成后闪烁。逐字短音三种音高轮替，并限制最短间隔防止叠音。 | 预先计算字符时刻，渲染与音效共用时刻表。行完成时黑底反色闪180ms后清空。圆环依次描出，标志笔画随后显现。输入中光标常亮，完成后闪烁。短音以三种音高轮替，并限制最短间隔。 |
| useCases[3] · C934 | 展示台待机唤醒 | 待机唤醒 |
| sources[0].observation · C945 | 逐字输入、停顿、清空、闪切固定到原片帧点；标志从右上弧线开始绘制、绕左环再补全右环；身份段 ID CONFIRMED / REQUEST RECEIVED / START PROCESSING；逐字输入音为原片三个 38ms 短音轮替，最短间隔 24ms。 | （删除） |
| sources[0].evidence · C946 | observed | （删除） |
| sources[0].locator · C947 | DESIGN.md · 启动前段逐帧修订 / 原片逐字输入音效复刻 | （删除） |

## entries/patterns/card-expand-fullscreen.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C952 | showcase | （删除） |
| mechanism · C954 | inari 标记、引线、照片卡片、全屏展开与收回。以巧思时间 t 映射到案例时刻 caseT，复制函数 drawCards、drawLeader、drawMarkers、measureMarkerLabels、mountScene、sceneCanvas、paintScene 按 caseT 求值。 | 照片卡片在地图上浮入，引线连接地点。卡片展开占满画面，停留后收回，HUD持续可见。 |
| useCases[1] · C968 | 展示台展品放大 | 陈列界面展品放大 |
| composition.notes · C978 | inari 标记、引线、照片卡片、全屏展开与收回。 | 照片卡片在地图上浮入，引线连接地点。卡片展开占满画面，停留后收回，HUD持续可见。 |
| sources[0].observation · C981 | 照片卡片由引线牵出，展开到全屏停留，再收回原位。 | （删除） |
| sources[0].evidence · C982 | observed | （删除） |
| sources[0].locator · C983 | caseT 18.4→24.6 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：shutter、paper、whoosh、impact。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1002 | 复制的函数 | 动效函数 |
| migration[0].how · C1003 | drawCards、drawLeader、drawMarkers、measureMarkerLabels、mountScene、sceneCanvas、paintScene | 配置卡片、引线、场景绘制与镜头。 |
| migration[1].how · C1005 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。 | 配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。 |
| migration[2].how · C1007 | config.js 的 inari、tracks.cards 与 expand、横竖 layout；20.4s 底图对应的横竖屏幕锚点；scenes.js 的 torii 照片画布。 | 设置20.4s底图锚点、鸟居照片、卡片与展开轨道、横竖布局。 |
| migration[3].how · C1009 | caseT 18.4→24.6 | 18.4→24.6 |
| migration[4].how · C1011 | 事件 voice：shutter、paper、whoosh、impact；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/chapter-frame.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[2] · C1050 | showcase | （删除） |
| mechanism · C1052 | drawChapter 的章节标签、框线、四角方块、胶带与网点。以巧思时间 t 映射到案例时刻 caseT，复制函数 drawChapter、applyStaticLayout 按 caseT 求值。 | 章节标签、标题与四角框线依次出现。框线描出后方块错峰回弹，强调色随章节切换。 |
| useCases[2] · C1067 | 展示台分区 | 陈列界面分区 |
| composition.notes · C1075 | drawChapter 的章节标签、框线、四角方块、胶带与网点。 | 章节标签、标题与四角框线依次出现。框线描出后方块错峰回弹，强调色随章节切换。 |
| sources[0].observation · C1078 | 章节标签配框线或胶带网点入场，为一段旅程划出章节。 | （删除） |
| sources[0].evidence · C1079 | observed | （删除） |
| sources[0].locator · C1080 | caseT 24.2→25.85；caseT 33→33.8；caseT 40.6→44.8 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：bell、confirm。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1099 | 复制的函数 | 动效函数 |
| migration[0].how · C1100 | drawChapter、applyStaticLayout | 配置章节标签、标题、框线与胶带。 |
| migration[1].how · C1102 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。 | 配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。 |
| migration[2].how · C1104 | config.js 的 chapters、tracks.chapter、横竖 layout；案例框线 SVG、胶带 CSS 和半色调画布。 | 设置章节轨道、标题、配色、装饰与横竖布局。 |
| migration[3].how · C1106 | caseT 24.2→25.85；caseT 33→33.8；caseT 40.6→44.8 | 24.2→25.85/33→33.8/40.6→44.8 |
| migration[4].how · C1108 | 事件 voice：bell、confirm；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/collect-counter.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[2] · C1115 | showcase | （删除） |
| mechanism · C1117 | MIKAN 徽章、收集计数、印章托盘与 drawHud 的步进器。以巧思时间 t 映射到案例时刻 caseT，复制函数 drawHud、stepAtX、ruleX、stampXY 按 caseT 求值。 | 计数变化时数字上滚，徽章回弹。角色托盘逐格点亮，与旅程进度一起累积。 |
| useCases[3] · C1137 | 收藏型展示台 | 收藏型陈列界面 |
| composition.notes · C1144 | MIKAN 徽章、收集计数、印章托盘与 drawHud 的步进器。 | 计数变化时数字上滚，徽章回弹。角色托盘逐格点亮，与旅程进度一起累积。 |
| sources[0].observation · C1147 | 每到一站计数滚动加一，印章落进托盘，步进器同步前进。 | （删除） |
| sources[0].evidence · C1148 | observed | （删除） |
| sources[0].locator · C1149 | caseT 8.1→8.9；caseT 12.6→14；caseT 19.2→20.4；caseT 41.8→43；caseT 51.2→52.6 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：confirm、stamp、sparkle。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1176 | 复制的函数 | 动效函数 |
| migration[0].how · C1177 | drawHud、stepAtX、ruleX、stampXY | 配置计数、徽章、角色托盘与回弹。 |
| migration[1].how · C1179 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。 | 配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。 |
| migration[2].how · C1181 | config.js 的 mascot、stepper、tracks.counter / stamps / progress 与横竖 layout。 | 设置计数与角色事件、镜头和横竖布局。 |
| migration[3].how · C1183 | caseT 8.1→8.9；caseT 12.6→14；caseT 19.2→20.4；caseT 41.8→43；caseT 51.2→52.6 | 8.1→8.9/12.6→14/19.2→20.4/41.8→43/51.2→52.6 |
| migration[4].how · C1185 | 事件 voice：confirm、stamp、sparkle；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/corner-hud.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[2] · C1225 | showcase | （删除） |
| mechanism · C1227 | 仅 drawHud 的日序、日期、规尺、指南针、坐标、海拔、缩放、时钟、歌词、步进器、比例尺和署名。以巧思时间 t 映射到案例时刻 caseT，复制函数 drawHud、cameraAt、clockAt、stepAtX、ruleX 按 caseT 求值。 | 日序、日期、规尺、指南针与坐标持续更新。海拔、缩放、时钟、歌词与步进器保持固定位置。比例尺和署名留在边缘，中央呈现地图。 |
| useCases[3] · C1241 | 展示台导览 | 陈列界面导览 |
| composition.notes · C1251 | 仅 drawHud 的日序、日期、规尺、指南针、坐标、海拔、缩放、时钟、歌词、步进器、比例尺和署名。 | 日序、日期、规尺、指南针与坐标持续更新。海拔、缩放、时钟、歌词与步进器保持固定位置。比例尺和署名留在边缘，中央呈现地图。 |
| sources[0].observation · C1254 | 日序、坐标、时钟、歌词与步进器钉在四角，数值随镜头与时间持续更新，中央留给地图。 | （删除） |
| sources[0].evidence · C1255 | observed | （删除） |
| sources[0].locator · C1256 | caseT 7→13.6；caseT 35.8→42.4 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：click、kick、sub。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1271 | 复制的函数 | 动效函数 |
| migration[0].how · C1272 | drawHud、cameraAt、clockAt、stepAtX、ruleX | 配置镜头、时钟、步进器与规尺函数。 |
| migration[1].how · C1274 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。 | 配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。 |
| migration[2].how · C1276 | config.js 的 tracks.camera / clock / day / progress / lyrics、stepper 与横竖 layout。 | 设置日序、日期、进度、歌词、步进器与横竖布局。 |
| migration[3].how · C1278 | caseT 7→13.6；caseT 35.8→42.4 | 7→13.6/35.8→42.4 |
| migration[4].how · C1280 | 事件 voice：click、kick、sub；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/day-night-flip.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[2] · C1287 | showcase | （删除） |
| mechanism · C1289 | 地图、3D 建筑、HUD 与案例暖色 wash；镜头固定为案例 34.5s，HUD 与昼夜值按 caseT 31.3→35.8、36.6→39.1 求值。以巧思时间 t 映射到案例时刻 caseT，复制函数 dayNight、valueAt、cameraAt、drawHud、clockAt、classify、setPaint 按 caseT 求值。 | 地图、3D建筑与HUD逐层切换昼夜，叠加暖色光。镜头固定在34.5s。昼夜与HUD分别播放31.3→35.8、36.6→39.1s。 |
| useCases[2] · C1304 | 展示台主题切换 | 陈列界面主题切换 |
| composition.notes · C1311 | 地图、3D 建筑、HUD 与案例暖色 wash；镜头固定为案例 34.5s，HUD 与昼夜值按 caseT 31.3→35.8、36.6→39.1 求值。 | 地图、3D建筑与HUD逐层切换昼夜，叠加暖色光。镜头固定在34.5s。昼夜与HUD分别播放31.3→35.8、36.6→39.1s。 |
| sources[0].observation · C1314 | 地图配色与 HUD 强调色一起在昼夜之间过渡，交代时间的流逝。 | （删除） |
| sources[0].evidence · C1315 | observed | （删除） |
| sources[0].locator · C1316 | caseT 31.3→35.8；caseT 36.6→39.1；固定镜头 caseT 34.5，全部 HUD 按片段求值 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：whoosh、sub、reverse、chime。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1335 | 复制的函数 | 动效函数 |
| migration[0].how · C1336 | dayNight、valueAt、cameraAt、drawHud、clockAt、classify、setPaint | 配置昼夜配色、镜头、时钟与HUD。 |
| migration[1].how · C1338 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。实时地图使用案例 MapLibre 5.6.0、样式 URL、自定义图层与 tilemirror / demmirror 参数。 | 配置MapLibre 5.6.0、样式、图层与地图镜像。 |
| migration[2].how · C1340 | config.js 的 map / mapPalette、tracks.night / camera / clock、HUD 轨道与横竖 layout；固定镜头为案例 34.5s。 | 设置昼夜、镜头、时钟、HUD；镜头固定在34.5s。 |
| migration[3].how · C1342 | caseT 31.3→35.8；caseT 36.6→39.1；固定镜头 caseT 34.5，全部 HUD 按片段求值 | 31.3→35.8/36.6→39.1/镜头34.5，全部 HUD 按片段求值 |
| migration[4].how · C1344 | 事件 voice：whoosh、sub、reverse、chime；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/decrypt-reveal.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C1350 | showcase | video |
| carriers[2] · C1351 | video | （删除） |
| summary · C1352 | 两条信号色对角线合拢、停留、收束；玻璃盖板自上而下由磨砂变清晰；右侧文档上的黑色遮挡条按阅读顺序依次退开——“读取”被做成一个可以看见的过程。 | 对角线合拢后收束，玻璃自上而下从磨砂转清。正文遮挡条按阅读顺序退开，让读取过程可见。 |
| mechanism · C1353 | 对角线是两条 SVG 路径（vector-effect: non-scaling-stroke），用 dashoffset 从 0 到全长再到负值实现“合拢→收束”；磨砂层是 backdrop-filter: blur 的覆盖层，用 clip-path: inset(p% 0 0 0) 自上而下切掉，并有一条高光边沿跟随；每个文本块内放一条绝对定位的黑色遮挡条，transform-origin 右侧，scaleX 1→0，按 80ms 错峰。 | 两条SVG对角线用dashoffset合拢后收束。路径保持non-scaling-stroke。磨砂层使用backdrop-filter: blur。用clip-path: inset(p% 0 0 0)自上而下切掉。高光边沿跟随切口。正文覆盖黑条，以右侧为原点scaleX 1→0，按80ms错峰。 |
| sources[0].observation · C1375 | 模型与正文同步解密：对角解密线合拢、保持并收束，盖板自上而下由磨砂变清晰；右侧文档的遮挡条随之退开，露出标题、资料字段与正文。 | （删除） |
| sources[0].evidence · C1376 | observed | （删除） |
| sources[0].locator · C1377 | README · 新版效果 | （删除） |

## entries/patterns/film-grain.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C1382 | showcase | console |
| carriers[2] · C1383 | console | （删除） |
| mechanism · C1385 | 地图、kix 照片画布与回忆插画三段全屏底，以及案例颗粒和暗角。以巧思时间 t 映射到案例时刻 caseT，复制函数 render、sceneCanvas、paintScene、grainPass、vignette 按 caseT 求值。 | 地图、机窗照片与回忆插画依次铺满画面。颗粒与暗角叠在各段上，让不同画面保持一致质感。 |
| composition.notes · C1408 | 地图、kix 照片画布与回忆插画三段全屏底，以及案例颗粒和暗角。 | 地图、机窗照片与回忆插画依次铺满画面。颗粒与暗角叠在各段上，让不同画面保持一致质感。 |
| sources[0].observation · C1411 | 动态胶片颗粒与暗角覆盖地图、照片和插画，统一整片的质感。 | （删除） |
| sources[0].evidence · C1412 | observed | （删除） |
| sources[0].locator · C1413 | 地图固定 caseT 10.4；kix 照片画布固定 caseT 13.5；回忆插画画布固定 caseT 27.56 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：vinyl。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1432 | 复制的函数 | 动效函数 |
| migration[0].how · C1433 | render、sceneCanvas、paintScene、grainPass、vignette | 配置场景绘制、颗粒与暗角。 |
| migration[1].how · C1435 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。 | 配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。 |
| migration[2].how · C1437 | 案例舞台颗粒纹理生成与 floor(t×12) 定位代码、grain / vignette CSS；10.4s 地图底图；scenes.js 的 window 照片和 kamo 回忆插画。 | 颗粒按floor(t×12)定位；10.4s地图配机窗照片与回忆。 |
| migration[3].how · C1439 | 地图固定 caseT 10.4；kix 照片画布固定 caseT 13.5；回忆插画画布固定 caseT 27.56 | 地图固定 10.4/kix 照片画布固定 13.5/回忆插画画布固定 27.56 |
| migration[4].how · C1441 | 事件 voice：vinyl；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/idle-breathing.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C1477 | showcase | （删除） |
| summary · C1478 | 停止操作 2.5 秒后，界面元素以两个不成整数比的周期（8s 与 13s）叠加缓慢起伏，相邻元素错相；任何操作立即渐退——界面“活着”，但不打扰。 | 停止操作2.5秒后，8s与13s周期叠加起伏，相邻元素错相。操作时渐退，画面保持轻微呼吸。 |
| mechanism · C1479 | 空闲时长 = t − 最后一次输入；强度 = clamp((空闲 − 2.5) / 1.5)；位移 = 强度 × A × (0.6·sin(2πt/8 + iφ₁) + 0.4·sin(2πt/13 + iφ₂))。两个周期不成整数比，叠加后长时间不重复；相位按元素索引偏移形成“流动”。 | 空闲时长=t−最后一次输入。强度=clamp((空闲−2.5)/1.5)。位移由8s与13s两个正弦周期叠加。权重分别为0.6与0.4，幅度为强度×A。相位分别加iφ₁与iφ₂，让相邻元素错相。 |
| useCases[1] · C1491 | 展示台/壁纸 | 待机陈列/壁纸 |
| sources[0].observation · C1504 | 交互预览停止操作 2.5 秒后渐入呼吸起伏：8 秒与 13 秒周期叠加，最大单向位移约卡片高度的 2.8%，相邻卡片略微错相；切换档案、进入详情或开启减少动态效果时渐退。 | （删除） |
| sources[0].evidence · C1505 | observed | （删除） |
| sources[0].locator · C1506 | DESIGN.md · 最新交互修订 | （删除） |

## entries/patterns/outro-stat-stack.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C1512 | showcase | （删除） |
| mechanism · C1514 | drawOutro 的统计行、数值计数与 fin.。以巧思时间 t 映射到案例时刻 caseT，复制函数 drawOutro、blurIn 按 caseT 求值。 | 统计行依次堆叠，数值逐项计数。fin.随后出现，让旅程在读完结果后结束。 |
| useCases[3] · C1528 | 展示台结束页 | 陈列界面结束页 |
| composition.notes · C1535 | drawOutro 的统计行、数值计数与 fin.。 | 统计行依次堆叠，数值逐项计数。fin.随后出现，让旅程在读完结果后结束。 |
| sources[0].observation · C1538 | 收尾时统计数字逐行堆叠，最后以 fin. 收束。 | （删除） |
| sources[0].evidence · C1539 | observed | （删除） |
| sources[0].locator · C1540 | caseT 55.6→60 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：blip、tick、bell、shimmer、sub。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1555 | 复制的函数 | 动效函数 |
| migration[0].how · C1556 | drawOutro、blurIn | 配置统计行、数值计数与fin.入场。 |
| migration[1].how · C1558 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。 | 配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。 |
| migration[2].how · C1560 | config.js 的 tracks.outro 与横竖 layout；58s 底图包含已完成路线和标记圆点。 | 设置收尾与横竖布局；58s底图显示完成路线和标记。 |
| migration[3].how · C1562 | caseT 55.6→60 | 55.6→60 |
| migration[4].how · C1564 | 事件 voice：blip、tick、bell、shimmer、sub；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/rolling-digits.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C1570 | showcase | video |
| carriers[2] · C1571 | video | （删除） |
| summary · C1572 | 编号、计数、标题与分类在切换时沿输入方向滚动 460ms，带极轻的运动模糊；快速连按只显示“当前运动 → 最新目标”，不为中间值排队。 | 编号与标题沿输入方向滚动460ms，带轻微模糊。快速连按只转向最新目标，不为中间值排队。 |
| mechanism · C1573 | 每个数字位是一个裁切窗口，旧字符与新字符上下排列，按进度 p 平移一格；只有变化的位才滚动。文字（含中文）整行替换：旧行沿方向滚出并淡出，新行从反方向滚入。方向跟随输入（下一项向上滚、上一项向下滚）。连续输入时从上一个目标重新起滚。 | 每个数字位是裁切窗口，旧字符与新字符上下排列。按进度p平移一格，只有变化的位滚动。文字整行替换：旧行滚出淡去，新行从反方向进入。下一项向上滚，上一项向下滚。连续输入从上一个目标重新起滚。 |
| sources[0].observation · C1597 | 主档案标题与编号共享 460ms 滚动配置，固定向上滚动、模糊强度 0.2；连续输入从当前运动接续，只显示可见过渡与最新目标；底部列名、悬停标题与权限标签复用同一滚动。 | （删除） |
| sources[0].evidence · C1598 | observed | （删除） |
| sources[0].locator · C1599 | DESIGN.md · 档案标题滚动 / 档案导航文字与刻度 | （删除） |

## entries/patterns/route-draw-marker.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C1605 | showcase | （删除） |
| mechanism · C1607 | 三个固定镜头中的路线、车头、标记圆点与双语标签；jrNara minZoom=13；镜头间使用案例纸色转场。以巧思时间 t 映射到案例时刻 caseT，复制函数 cameraAt、addRouteLayers、updateRoutesGL、drawRoutesSVG、drawMarkers、measureMarkerLabels、project、routeP、pointAt 按 caseT 求值。 | 三个固定镜头显示路线、车头、标记与双语标签。jrNara从minZoom=13显示。镜头之间以纸色转场，路线与标记始终对齐。 |
| useCases[2] · C1624 | 展示台导览地图 | 陈列界面导览地图 |
| composition.notes · C1632 | 三个固定镜头中的路线、车头、标记圆点与双语标签；jrNara minZoom=13；镜头间使用案例纸色转场。 | 三个固定镜头显示路线、车头、标记与双语标签。jrNara从minZoom=13显示。镜头之间以纸色转场，路线与标记始终对齐。 |
| sources[0].observation · C1635 | 路线按进度描画，车头沿线前进，站点标记弹入并打出双语站名。 | （删除） |
| sources[0].evidence · C1636 | observed | （删除） |
| sources[0].locator · C1637 | kix: caseT 1.5→2.35；haruka: caseT 14.6→17.05；kyoto: caseT 16.6→17.45；naraLine: caseT 37.4→39.85；jrNara: caseT 39.4→40.25；walk1: caseT 39.4→41.25；naraPark: caseT 40.8→41.65 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：sonar、whoosh、clack、blip、chime、tick。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1660 | 复制的函数 | 动效函数 |
| migration[0].how · C1661 | cameraAt、addRouteLayers、updateRoutesGL、drawRoutesSVG、drawMarkers、measureMarkerLabels、project、routeP、pointAt | 配置镜头、路线、标记、引线、投影与标签避让。 |
| migration[1].how · C1663 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。实时地图使用案例 MapLibre 5.6.0、样式 URL、自定义图层与 tilemirror / demmirror 参数。 | 配置MapLibre 5.6.0、样式、图层与地图镜像。 |
| migration[2].how · C1665 | config.js 的 stops、tracks.routes / markers、tracks.camera；paths.js 的 haruka / naraLine / walk1 几何；横竖 S1 / S2 / S3 固定镜头。 | 设置地点、路线、镜头与横竖S1/S2/S3取景。 |
| migration[3].how · C1667 | kix: caseT 1.5→2.35；haruka: caseT 14.6→17.05；kyoto: caseT 16.6→17.45；naraLine: caseT 37.4→39.85；jrNara: caseT 39.4→40.25；walk1: caseT 39.4→41.25；naraPark: caseT 40.8→41.65 | kix: 1.5→2.35/haruka: 14.6→17.05/kyoto: 16.6→17.45/naraLine: 37.4→39.85/jrNara: 39.4→40.25/walk1: 39.4→41.25/naraPark: 40.8→41.65 |
| migration[4].how · C1669 | 事件 voice：sonar、whoosh、clack、blip、chime、tick；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/seekable-timeline.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[2] · C1704 | showcase | （删除） |
| mechanism · C1706 | 顶部 HUD（日序、日期、进度线、指南针、坐标、海拔、缩放与时钟）、kix 卡片与引线、MIKAN 徽章、控制条上方右对齐的署名，以及舞台内随 caseT 更新的复制控制条。以巧思时间 t 映射到案例时刻 caseT，复制函数 render、drawHud、drawCards、drawLeader、cameraAt、clockAt、controls 按 caseT 求值。 | 日序、日期、坐标与时钟随定位持续更新。卡片、引线与MIKAN徽章跟随时间变化。拖动舞台内控制条，可前后查看同一段画面。 |
| useCases[1] · C1722 | 可回放的展示台 | 可回放的陈列界面 |
| composition.notes · C1730 | 顶部 HUD（日序、日期、进度线、指南针、坐标、海拔、缩放与时钟）、kix 卡片与引线、MIKAN 徽章、控制条上方右对齐的署名，以及舞台内随 caseT 更新的复制控制条。 | 日序、日期、坐标与时钟随定位持续更新。卡片、引线与MIKAN徽章跟随时间变化。拖动舞台内控制条，可前后查看同一段画面。 |
| sources[0].observation · C1733 | 所有画面都是时间 t 的函数，拖动、倒退、跳转都能得到同一帧。 | （删除） |
| sources[0].evidence · C1734 | observed | （删除） |
| sources[0].locator · C1735 | caseT 12→14；caseT 14→12.6；caseT 12.6→13.4；caseT 13.4→15.5；caseT 15.5→16.6；caseT 16.6→13；caseT 13→14.4 | （删除） |
| sound.description | MotionKit.audio.attach 挂接卡片、MIKAN 计数、印章与拖动提示事件：shutter、paper、confirm、stamp、sparkle、tick；无独立步进器声音。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1758 | 复制的函数 | 动效函数 |
| migration[0].how · C1759 | render、drawHud、drawCards、drawLeader、cameraAt、clockAt、controls | 配置HUD、卡片、引线、镜头、时钟与控制条。 |
| migration[1].how · C1761 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。 | 配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。 |
| migration[2].how · C1763 | config.js 的顶部 HUD / kix 卡片 / mascot 轨道、tracks.camera 与横竖 layout；13s 底图屏幕锚点；七段拖动曲线和复制的控制条结构 / CSS。 | 设置顶部HUD、kix卡片与MIKAN；13s底图配七段拖动。 |
| migration[3].how · C1765 | caseT 12→14；caseT 14→12.6；caseT 12.6→13.4；caseT 13.4→15.5；caseT 15.5→16.6；caseT 16.6→13；caseT 13→14.4 | 12→14/14→12.6/12.6→13.4/13.4→15.5/15.5→16.6/16.6→13/13→14.4 |
| migration[4].how · C1767 | 事件 voice：shutter、paper、confirm、stamp、sparkle、tick；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/split-compare-stamp.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C1773 | showcase | （删除） |
| mechanism · C1775 | drawCompare 的两侧插画、分割线、边框与时间戳印章。以巧思时间 t 映射到案例时刻 caseT，复制函数 drawCompare、mountScene、sceneCanvas、paintScene 按 caseT 求值。 | 两侧插画以分割线分开，边框组织画面。时间戳以印章动作落下，让两个时刻的景象并排对照。 |
| useCases[3] · C1789 | 展示台复原对比 | 陈列界面复原对比 |
| composition.notes · C1797 | drawCompare 的两侧插画、分割线、边框与时间戳印章。 | 两侧插画以分割线分开，边框组织画面。时间戳以印章动作落下，让两个时刻的景象并排对照。 |
| sources[0].observation · C1800 | 旧明信片与今日实景左右对比，分割线划过后盖上时间戳。 | （删除） |
| sources[0].evidence · C1801 | observed | （删除） |
| sources[0].locator · C1802 | caseT 29→33.4 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：whoosh、stamp、sub。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1817 | 复制的函数 | 动效函数 |
| migration[0].how · C1818 | drawCompare、mountScene、sceneCanvas、paintScene | 配置分屏、两侧场景、边框与印章。 |
| migration[1].how · C1820 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。 | 配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。 |
| migration[2].how · C1822 | config.js 的 tracks.compare 与横竖 layout；scenes.js 的 postcard / photo 两侧画布。 | 设置对比轨道、明信片与照片画布、横竖布局。 |
| migration[3].how · C1824 | caseT 29→33.4 | 29→33.4 |
| migration[4].how · C1826 | 事件 voice：whoosh、stamp、sub；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/vertical-title-blur.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C1865 | showcase | console |
| carriers[2] · C1866 | console | （删除） |
| mechanism · C1868 | 片名、地点标题、全屏回忆插画与竖排字幕，以及 drawOutro 的 fin.。以巧思时间 t 映射到案例时刻 caseT，复制函数 drawIntro、drawLocTitle、drawFlashback、drawOutro、blurIn、typeIn、mountScene、paintScene 按 caseT 求值。 | 片名与地点标题从模糊中逐字显影。回忆插画配竖排字幕，收尾以fin.落幕。各段共用模糊与打字的入场节奏。 |
| useCases[3] · C1886 | 展示台展品名 | 陈列界面展品名 |
| composition.notes · C1895 | 片名、地点标题、全屏回忆插画与竖排字幕，以及 drawOutro 的 fin.。 | 片名与地点标题从模糊中逐字显影。回忆插画配竖排字幕，收尾以fin.落幕。各段共用模糊与打字的入场节奏。 |
| sources[0].observation · C1898 | 竖排大字从模糊中显影，配副标题与逐字打字；片名、地点、回忆字幕与收尾共用一套入场。 | （删除） |
| sources[0].evidence · C1899 | observed | （删除） |
| sources[0].locator · C1900 | caseT 3.8→8；caseT 17.9→21.6；caseT 25.5→29.6；caseT 57.9→60 | （删除） |
| sound.description | MotionKit.audio.attach 挂接事件：key、tick、bell、shimmer、sub。 | 声音随画面事件播放，音色与时刻由乐谱设置。 |
| migration[0].field · C1923 | 复制的函数 | 动效函数 |
| migration[0].how · C1924 | drawIntro、drawLocTitle、drawFlashback、drawOutro、blurIn、typeIn、mountScene、paintScene | 配置片名、地名、回忆、收尾的模糊与打字入场。 |
| migration[1].how · C1926 | MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。 | 配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。 |
| migration[2].how · C1928 | config.js 的 meta、tracks.locTitle / flashback / outro、横竖 layout；scenes.js 的回忆插画。 | 设置片名、地点、回忆字幕、收尾与横竖布局。 |
| migration[3].how · C1930 | caseT 3.8→8；caseT 17.9→21.6；caseT 25.5→29.6；caseT 57.9→60 | 3.8→8/17.9→21.6/25.5→29.6/57.9→60 |
| migration[4].how · C1932 | 事件 voice：key、tick、bell、shimmer、sub；保持 inventory 中全部音色参数，t 映射为巧思时刻。 | 调整声音事件，按巧思时间对齐，保留音色参数。 |

## entries/patterns/wave-array.json

| 字段 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| carriers[1] · C1938 | showcase | （删除） |
| summary · C1939 | 在一整片重复元素中选中一个：它以临界阻尼抬起，同时向四周传出一圈按距离延迟、指数衰减的余波——选择像投入水面的石子。 | 选中块以临界阻尼抬起，余波按距离延迟、衰减，整片阵列随一次选择起伏。 |
| mechanism · C1940 | 每块的高度 = 选中抬起（临界阻尼阶跃，取消选中时以当时高度衰减回落）+ 最近三次选择的余波之和；余波 z = A·sin(ωτ)·e^(−kτ)/(1+f·d)，τ = t − t₀ − delay·d，d = 行距 + 0.8×列距。全部是事件序列在时刻 t 的解析函数，可快速反向、可 seek。 | 块高度由选中抬起与最近三次选择的余波相加。取消选择时，从当前高度衰减回落。余波z=A·sin(ωτ)·e^(−kτ)/(1+f·d)。τ=t−t₀−delay·d，d=行距+0.8×列距。状态由时刻t计算，可反向操作与定位。 |
| timing[1].value · C1946 | A 9–10px · ω 7.5 · k 2.6 · 延迟 70ms/格 · 距离衰减 0.35 | A 9–10px，ω 7.5，k 2.6。延迟70ms/格，距离衰减0.35。 |
| sources[0].observation · C1963 | 选中卡片两侧在回传后继续起伏，按距选中位置的距离延迟并衰减；用户对比后确认采用原始基线：完整正负波谷的选中波浪，选中与波浪同时开始，升降阻尼速率 4.2。 | （删除） |
| sources[0].evidence · C1964 | observed | （删除） |
| sources[0].locator · C1965 | DESIGN.md · 参考与既有规范 / 当前采用：原始基线动效 | （删除） |

## 节奏实验室

| 位置 / 清单id | 原文 | 新文 |
| --- | --- | --- |
| lab.html:7 |   &lt;meta name="description" content="跟着节拍器感受速度、拍号、细分与摇摆；听见事件吸附到网格前后的差别（A/B 对比、量化强度、首拍偏移、打拍录入）；把缓动曲线、时长与错峰对到拍子上；导出 CSS、MotionKit、Prompt 与 WAV。"&gt; |   &lt;meta name="description" content="跟着节拍器感受速度、拍号、细分与摇摆；听见事件吸附到网格前后的差别（A/B 对比、量化强度、首拍偏移、打拍录入）；把缓动曲线、时长与错峰对到拍子上；导出 CSS、JS 代码、Prompt 与 WAV。"&gt; |
| lab.html:18 · C2317 |       &lt;p&gt;节拍与音效是动效的一部分。先跟着节拍器听速度、拍号和细分，再看事件怎样吸附到网格上、听吸附前后的差别，然后把缓动曲线、时长与错峰对到拍子上，最后导出给代码、Prompt 或剪辑软件。&lt;/p&gt; |       &lt;p&gt;先用节拍器听速度、拍号与细分，再比较事件吸附前后的差别。把曲线、时长和错峰对齐拍子，导出代码、Prompt或WAV。&lt;/p&gt; |
| lab.html:147 · C2126 |         &lt;p&gt;曲线决定性格，时长决定重量，错峰决定层次。打开“跟随节拍”后，预览每小节重播一次：选“落点踩重拍”时最后一个元素正好落在重拍上，起步有呼啸声，每个元素落定有一声提示音。&lt;/p&gt;&lt;/div&gt; |         &lt;p&gt;曲线决定性格，时长决定重量，错峰决定层次。开启“跟随节拍”，预览每小节重播。选“落点踩重拍”，最后一个元素在重拍落定。起步有呼啸，每次落定有提示音。&lt;/p&gt;&lt;/div&gt; |
| lab.html:204 · C2039 |         &lt;p&gt;导出内容和上面的全部参数同步：拍号、速度、细分、摇摆、量化强度、首拍偏移、吸附后的事件，以及曲线、时长与错峰。WAV 用和页面同一套合成音色离线渲染当前循环，可以直接拖进剪辑软件对拍。&lt;/p&gt;&lt;/div&gt; |         &lt;p&gt;导出会带上当前节拍、事件、曲线、时长与错峰参数。WAV使用同一套音色，可拖进剪辑软件对拍。&lt;/p&gt;&lt;/div&gt; |
| lab.html:213 · C2044 |           &lt;p class="hint"&gt;渲染内容 = 当前能听到的：节拍器（按三级音量）、事件（按播放方式，A/B 交替时一圈原始、一圈吸附）、循环起点提示音、曲线提示音（跟随节拍时）。从循环起点（第 0 秒）开始，长度为整数圈，方便在剪辑软件里循环。&lt;/p&gt; |           &lt;p class="hint"&gt;WAV包含当前节拍器、事件、循环起点与曲线提示音。节拍器保持三级音量，A/B交替按圈切换。曲线跟随节拍时加入提示音。从第0秒导出整数圈，方便循环使用。&lt;/p&gt; |
| assets/lab.js:919 · C2007, C2008 |       return `// MotionKit（kit/motion-kit.js）· 节奏实验室导出 · ${head}\nconst ease = MotionKit.bezier(${cv});\nconst DUR = ${S.dur / 1000}, STAGGER = ${S.stag / 1000}; // 秒\nconst BPM = ${S.bpm}, OFFSET = ${r3(c.o)}, METER = [${m.n}, ${m.unit}]; // 首拍在 OFFSET 秒\nconst GRID = ${S.div}, SWING = ${swingOn() ? r2(S.swing / 100) : 0}; // 每拍格数；摇摆 0–1（1 = 三连音 shuffle）\nconst beat = MotionKit.beats(BPM, OFFSET);\n// 第 i 个元素在时刻 t 的进度\nconst progress = (t, i) =&gt; ease(MotionKit.clamp((t - i * STAGGER) / DUR, 0, 1));\n// 事件：原始 → 吸附后（${divName(S.div)}网格，强度 ${S.strength}%），单位秒\nconst RAW = [${list.map((e) =&gt; r3(e.t)).join(', ')}];\nconst EVENTS = [${list.map((e) =&gt; r3(e.snap)).join(', ')}];\n// 声音乐谱：节拍器（${KITS[S.kit].name}）+ 事件（${EVOICES[S.evVoice].name}）\nconst SCORE = [\n  MotionKit.audio.pattern({\n    bpm: BPM, offset: OFFSET, div: GRID, swing: SWING,\n    tracks: { ${pt.tracks} },\n    voices: { ${pt.voices} },\n  }),\n  ...EVENTS.map((t) =&gt; ({ t, voice: '${EVOICES[S.evVoice].v}', ${Object.entries(EVOICES[S.evVoice].p).map(([a, b]) =&gt; `${a}: ${typeof b === 'string' ? `'${b}'` : b}`).join(', ')}, gain: ${r2((S.vol / 100) * 0.85)} })),\n];\n// MotionKit.audio.attach(timeline, SCORE);`; |       return `// MotionKit · 节奏实验室导出 · ${head}\nconst ease = MotionKit.bezier(${cv});\nconst DUR = ${S.dur / 1000}, STAGGER = ${S.stag / 1000}; // 秒\nconst BPM = ${S.bpm}, OFFSET = ${r3(c.o)}, METER = [${m.n}, ${m.unit}]; // 首拍在 OFFSET 秒\nconst GRID = ${S.div}, SWING = ${swingOn() ? r2(S.swing / 100) : 0}; // 每拍格数；摇摆 0–1（1 = 三连音 shuffle）\nconst beat = MotionKit.beats(BPM, OFFSET);\n// 第 i 个元素在时刻 t 的进度\nconst progress = (t, i) =&gt; ease(MotionKit.clamp((t - i * STAGGER) / DUR, 0, 1));\n// 事件：原始 → 吸附后（${divName(S.div)}网格，强度 ${S.strength}%），单位秒\nconst RAW = [${list.map((e) =&gt; r3(e.t)).join(', ')}];\nconst EVENTS = [${list.map((e) =&gt; r3(e.snap)).join(', ')}];\n// 声音乐谱：节拍器（${KITS[S.kit].name}）+ 事件（${EVOICES[S.evVoice].name}）\nconst SCORE = [\n  MotionKit.audio.pattern({\n    bpm: BPM, offset: OFFSET, div: GRID, swing: SWING,\n    tracks: { ${pt.tracks} },\n    voices: { ${pt.voices} },\n  }),\n  ...EVENTS.map((t) =&gt; ({ t, voice: '${EVOICES[S.evVoice].v}', ${Object.entries(EVOICES[S.evVoice].p).map(([a, b]) =&gt; `${a}: ${typeof b === 'string' ? `'${b}'` : b}`).join(', ')}, gain: ${r2((S.vol / 100) * 0.85)} })),\n];\n// MotionKit.audio.attach(timeline, SCORE);`; |
| assets/lab.js:921 |     const evText = list.length ? list.map((e) =&gt; `${e.snap.toFixed(2)}s（${e.label} ${KIND[e.kind]}${Math.abs(ms(e.dev)) &gt;= 1 ? `，由 ${e.t.toFixed(2)}s 移动 ${signed(ms(e.dev))}` : ''}）`).join('、') : '（暂无）'; |     const evText = list.length ? list.map((e) =&gt; `${e.snap.toFixed(2)}s（${e.label} ${KIND[e.kind]}${Math.abs(ms(e.dev)) &gt;= 1 ? `，由 ${e.t.toFixed(2)}s 移动 ${signed(ms(e.dev))}` : ''}）`).join('。') : '（暂无）'; |
| assets/lab.js:922 · C2012, C2013, C2014, C2015, C2016, C2017, C2018, C2019, C2020, C2021, C2022, C2023, C2024, C2025, C2026, C2027 |     return `动效节奏约束：${S.meter} 拍，${S.bpm} BPM（1 拍 ${ms(c.spb)}ms，1 小节 ${(c.spb * c.bpb).toFixed(2)}s${m.unit === 8 ? '，按八分音符计拍' : ''}），首拍偏移 ${S.offset}ms（第一个重拍在 ${c.o.toFixed(3)}s）。吸附网格为${divName(S.div)}（每格 ${gridMs}ms）${swingMs ? `，摇摆 ${S.swing}%（反拍推迟 ${swingMs}ms，长短比 ${ratio}:1）` : ''}，量化强度 ${S.strength}%。关键事件：${evText}。小节重拍放最重的动作，次强拍放次要强调，反拍放回弹与细节；不要让主要动作落在离网格只差几十毫秒的位置。主缓动 cubic-bezier(${cv})（${S.preset \|\| '自定义'}），单个元素时长 ${S.dur}ms（约 ${durBeats} 拍），错峰 ${S.stag}ms，${S.count} 个元素总时长 ${totalMs()}ms（约 ${totBeats} 拍），${S.align === 'land' ? '最后一个元素的落点对齐小节重拍' : '在小节重拍处起步'}。声音：节拍底为${KITS[S.kit].name}音色（重拍 / 拍 / 细分三级音量），事件用${EVOICES[S.evVoice].name}音，起步配呼啸、落定配短促提示音。减少动态时取消位移、只保留透明度变化，声音照常。`; |     return `动效节奏：${S.meter}拍，${S.bpm} BPM。1拍${ms(c.spb)}ms，1小节${(c.spb * c.bpb).toFixed(2)}s${m.unit === 8 ? '，按八分音符计拍' : ''}。首拍偏移${S.offset}ms，重拍在${c.o.toFixed(3)}s。网格${divName(S.div)}，每格${gridMs}ms。${swingMs ? `摇摆${S.swing}%，反拍推迟${swingMs}ms。长短比${ratio}:1。` : ''}量化强度${S.strength}%。关键事件：${evText}。小节重拍放主动作，次强拍放次要强调。反拍放回弹与细节，主动作避免偏离网格几十毫秒。缓动cubic-bezier(${cv})。曲线：${S.preset \|\| '自定义'}。单个元素${S.dur}ms，约${durBeats}拍。错峰${S.stag}ms，${S.count}个元素共${totalMs()}ms。总时长约${totBeats}拍。${S.align === 'land' ? '最后一个元素在小节重拍落定' : '在小节重拍起步'}。节拍底用${KITS[S.kit].name}音色，分重拍、拍、细分三级音量。事件用${EVOICES[S.evVoice].name}音。起步配呼啸，落定配短促提示音。减少动态时只保留透明度变化，声音照常。`; |
| assets/lab.js:923 |   } |  |
| assets/lab.js:924 |   $('#exTabs').addEventListener('click', (e) =&gt; { const b = e.target.closest('[data-k]'); if (b) { S.tab = b.dataset.k; save(); paintExport(); } }); |   } |
| assets/lab.js:925 |   $('#exTabs').addEventListener('keydown', (e) =&gt; { |   $('#exTabs').addEventListener('click', (e) =&gt; { const b = e.target.closest('[data-k]'); if (b) { S.tab = b.dataset.k; save(); paintExport(); } }); |
| assets/lab.js:926 |     if (e.key !== 'ArrowLeft' &amp;&amp; e.key !== 'ArrowRight') return; |   $('#exTabs').addEventListener('keydown', (e) =&gt; { |
| assets/lab.js:927 |     const ks = ['css', 'js', 'prompt'], i = (ks.indexOf(S.tab) + (e.key === 'ArrowRight' ? 1 : 2)) % 3; |     if (e.key !== 'ArrowLeft' &amp;&amp; e.key !== 'ArrowRight') return; |
| assets/lab.js:928 |     S.tab = ks[i]; save(); paintExport(); $(`#exTabs [data-k="${S.tab}"]`).focus(); |     const ks = ['css', 'js', 'prompt'], i = (ks.indexOf(S.tab) + (e.key === 'ArrowRight' ? 1 : 2)) % 3; |
| assets/lab.js:929 |   }); |     S.tab = ks[i]; save(); paintExport(); $(`#exTabs [data-k="${S.tab}"]`).focus(); |
| assets/lab.js:930 |   function paintExport() { |   }); |
| assets/lab.js:931 |     $('#exOut').textContent = exportText(S.tab); |   function paintExport() { |
| assets/lab.js:932 |     $$('#exTabs button').forEach((b) =&gt; { const on = b.dataset.k === S.tab; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; }); |     $('#exOut').textContent = exportText(S.tab); |
| assets/lab.js:933 |   } |     $$('#exTabs button').forEach((b) =&gt; { const on = b.dataset.k === S.tab; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; }); |
| assets/lab.js:934 |   $('#copyEx').innerHTML = `${ICONS.copy}复制`; |   } |
| assets/lab.js:935 |   $('#copyEx').addEventListener('click', () =&gt; copy($('#exOut').textContent)); |   $('#copyEx').innerHTML = `${ICONS.copy}复制`; |
| assets/lab.js:936 |   segBuild($('#wavCycles'), [[1, '1 圈'], [2, '2 圈'], [4, '4 圈']]); |   $('#copyEx').addEventListener('click', () =&gt; copy($('#exOut').textContent)); |
| assets/lab.js:937 |   segOn($('#wavCycles'), (v) =&gt; { S.wavCycles = +v; save(); invalidate(); }); |   segBuild($('#wavCycles'), [[1, '1 圈'], [2, '2 圈'], [4, '4 圈']]); |
| assets/lab.js:938 |   $('#wavBtn').innerHTML = `${IC.wave}导出 WAV`; |   segOn($('#wavCycles'), (v) =&gt; { S.wavCycles = +v; save(); invalidate(); }); |
| assets/lab.js:939 |   $('#wavBtn').addEventListener('click', async () =&gt; { |   $('#wavBtn').innerHTML = `${IC.wave}导出 WAV`; |
| assets/lab.js:940 |     const btn = $('#wavBtn'); |   $('#wavBtn').addEventListener('click', async () =&gt; { |
| assets/lab.js:941 |     btn.disabled = true; |     const btn = $('#wavBtn'); |
| assets/lab.js:942 |     $('#wavRes').textContent = '正在离线渲染…'; |     btn.disabled = true; |
| assets/lab.js:943 |     try { |     $('#wavRes').textContent = '正在离线渲染…'; |
| assets/lab.js:944 |       const r = await renderWav(S.wavCycles); |     try { |
| assets/lab.js:945 |       const blob = new Blob([r.wav()], { type: 'audio/wav' }), a = document.createElement('a'); |       const r = await renderWav(S.wavCycles); |
| assets/lab.js:946 |       a.href = URL.createObjectURL(blob); |       const blob = new Blob([r.wav()], { type: 'audio/wav' }), a = document.createElement('a'); |
| assets/lab.js:947 |       a.download = `motion-atlas-rhythm-${S.bpm}bpm-${S.meter.replace('/', '-')}-${S.wavCycles}x.wav`; |       a.href = URL.createObjectURL(blob); |
| assets/lab.js:948 |       a.click(); |       a.download = `motion-atlas-rhythm-${S.bpm}bpm-${S.meter.replace('/', '-')}-${S.wavCycles}x.wav`; |
| assets/lab.js:949 |       setTimeout(() =&gt; URL.revokeObjectURL(a.href), 2000); |       a.click(); |
| assets/lab.js:950 |       $('#wavRes').textContent = `已导出 ${a.download} · ${r.duration.toFixed(2)}s · ${r.events} 个声音事件 · 峰值 ${r.peakDb.toFixed(1)} dBFS · RMS ${r.rmsDb.toFixed(1)} dBFS${r.clipped ? ` · 削波 ${r.clipped}` : ' · 无削波'}`; |       setTimeout(() =&gt; URL.revokeObjectURL(a.href), 2000); |
| assets/lab.js:951 |     } catch (err) { |       $('#wavRes').textContent = `已导出 ${a.download} · ${r.duration.toFixed(2)}s · ${r.events} 个声音事件 · 峰值 ${r.peakDb.toFixed(1)} dBFS · RMS ${r.rmsDb.toFixed(1)} dBFS${r.clipped ? ` · 削波 ${r.clipped}` : ' · 无削波'}`; |
| assets/lab.js:952 |       $('#wavRes').textContent = '导出失败：' + err.message; |     } catch (err) { |
| assets/lab.js:953 |     } finally { btn.disabled = false; } |       $('#wavRes').textContent = '导出失败：' + err.message; |
| assets/lab.js:954 |   }); |     } finally { btn.disabled = false; } |
| assets/lab.js:955 |  |   }); |
| assets/lab.js:956 |   /* ---------- 同步全部控件与静态绘制（合并到下一帧） ---------- */ |  |
| assets/lab.js:957 |   // 'curve'：只影响曲线与导出；'all'：全部静态部分 |   /* ---------- 同步全部控件与静态绘制（合并到下一帧） ---------- */ |
| assets/lab.js:958 |   let dirty = 'all'; |   // 'curve'：只影响曲线与导出；'all'：全部静态部分 |
| assets/lab.js:959 |   function invalidate(part = 'all') { if (dirty !== 'all') dirty = part; } |   let dirty = 'all'; |
| assets/lab.js:960 |   const setHTML = (el, html) =&gt; { if (el._html !== html) { el.innerHTML = html; el._html = html; } }; |   function invalidate(part = 'all') { if (dirty !== 'all') dirty = part; } |
| assets/lab.js:961 |   function syncControls() { |   const setHTML = (el, html) =&gt; { if (el._html !== html) { el.innerHTML = html; el._html = html; } }; |
| assets/lab.js:962 |     const c = clip(); |   function syncControls() { |
| assets/lab.js:963 |     if (document.activeElement !== bpmNum) bpmNum.value = S.bpm; |     const c = clip(); |
| assets/lab.js:964 |     $('#bpm').value = S.bpm; $('#bpmV').textContent = S.bpm; |     if (document.activeElement !== bpmNum) bpmNum.value = S.bpm; |
| assets/lab.js:965 |     $('#vol').value = S.vol; |     $('#bpm').value = S.bpm; $('#bpmV').textContent = S.bpm; |
| assets/lab.js:966 |     segSet($('#meter'), S.meter); |     $('#vol').value = S.vol; |
| assets/lab.js:967 |     const divItems = DIVS.map((d) =&gt; `&lt;button type="button" data-v="${d}"&gt;${divName(d)}&lt;/button&gt;`).join(''); |     segSet($('#meter'), S.meter); |
| assets/lab.js:968 |     $$('[data-bind="div"]').forEach((el) =&gt; { setHTML(el, divItems); segSet(el, S.div); }); |     const divItems = DIVS.map((d) =&gt; `&lt;button type="button" data-v="${d}"&gt;${divName(d)}&lt;/button&gt;`).join(''); |
| assets/lab.js:969 |     $$('input[data-bind="swing"]').forEach((el) =&gt; { el.value = S.swing; el.disabled = !swingOn(); }); |     $$('[data-bind="div"]').forEach((el) =&gt; { setHTML(el, divItems); segSet(el, S.div); }); |
| assets/lab.js:970 |     const swingMs = ((S.swing / 100) * c.spb) / S.div / 3 * 1000; |     $$('input[data-bind="swing"]').forEach((el) =&gt; { el.value = S.swing; el.disabled = !swingOn(); }); |
| assets/lab.js:971 |     $$('[data-out="swing"]').forEach((el) =&gt; { el.textContent = swingOn() ? `${S.swing}%` : '—'; }); |     const swingMs = ((S.swing / 100) * c.spb) / S.div / 3 * 1000; |
| assets/lab.js:972 |     $$('[data-hint="swing"]').forEach((el) =&gt; { el.textContent = swingOn() ? (S.swing ? `反拍推迟 ${Math.round(swingMs)}ms · 长短比 ${r2((1 + S.swing / 300) / (1 - S.swing / 300))} : 1 · 相当于 MPC ${Math.round(((1 + S.swing / 300) / 2) * 100)}%（100% = 三连音 shuffle）` : '0% 为直拍；调高后每对格子的后一个被推迟，100% 时变成三连音 shuffle。') : '摇摆只作用于成对的格子：请选「半拍」或「十六分」细分。'; }); |     $$('[data-out="swing"]').forEach((el) =&gt; { el.textContent = swingOn() ? `${S.swing}%` : '—'; }); |
| assets/lab.js:973 |     segSet($('#kit'), S.kit); |     $$('[data-hint="swing"]').forEach((el) =&gt; { el.textContent = swingOn() ? (S.swing ? `反拍推迟 ${Math.round(swingMs)}ms · 长短比 ${r2((1 + S.swing / 300) / (1 - S.swing / 300))} : 1 · 相当于 MPC ${Math.round(((1 + S.swing / 300) / 2) * 100)}%（100% = 三连音 shuffle）` : '0% 为直拍；调高后每对格子的后一个被推迟，100% 时变成三连音 shuffle。') : '摇摆只作用于成对的格子：请选「半拍」或「十六分」细分。'; }); |
| assets/lab.js:974 |     [['vBar', 'bar'], ['vBeat', 'beat'], ['vSub', 'sub']].forEach(([id, k]) =&gt; { $('#' + id).value = S.lv[k]; $('#' + id + 'V').textContent = `${S.lv[k]}%`; }); |     segSet($('#kit'), S.kit); |
| assets/lab.js:975 |     $('#offset').value = S.offset; $('#offsetV').textContent = `${S.offset}ms`; |     [['vBar', 'bar'], ['vBeat', 'beat'], ['vSub', 'sub']].forEach(([id, k]) =&gt; { $('#' + id).value = S.lv[k]; $('#' + id + 'V').textContent = `${S.lv[k]}%`; }); |
| assets/lab.js:976 |     $('#strength').value = S.strength; $('#strengthV').textContent = `${S.strength}%`; |     $('#offset').value = S.offset; $('#offsetV').textContent = `${S.offset}ms`; |
| assets/lab.js:977 |     segSet($('#bars'), S.bars); |     $('#strength').value = S.strength; $('#strengthV').textContent = `${S.strength}%`; |
| assets/lab.js:978 |     $('#loopLen').textContent = `= ${c.L.toFixed(2)} 秒`; |     segSet($('#bars'), S.bars); |
| assets/lab.js:979 |     segSet($('#mode'), S.mode); |     $('#loopLen').textContent = `= ${c.L.toFixed(2)} 秒`; |
| assets/lab.js:980 |     $('#evVoice').value = S.evVoice; |     segSet($('#mode'), S.mode); |
| assets/lab.js:981 |     $('#startCue').checked = S.startCue; |     $('#evVoice').value = S.evVoice; |
| assets/lab.js:982 |     segSet($('#examples'), S.example); |     $('#startCue').checked = S.startCue; |
| assets/lab.js:983 |     const ex = EXAMPLES[S.example]; |     segSet($('#examples'), S.example); |
| assets/lab.js:984 |     setHTML($('#exHint'), ex ?`&lt;p&gt;&lt;b&gt;${ex.name}&lt;/b&gt;：${ex.desc}${ex.tip}&lt;/p&gt;&lt;div class="tries"&gt;${ex.tries.map(([l], j) =&gt; `&lt;button type="button" class="chip-btn" data-try="${j}"&gt;${l}&lt;/button&gt;`).join('')}&lt;/div&gt;` : `&lt;p&gt;${S.ev.length ? '自定义事件（拖动、键盘或打拍录入得到）。' : '还没有事件：点上方示例、在 A 道空白处点一下，或用打拍录入。'}&lt;/p&gt;`); |     const ex = EXAMPLES[S.example]; |
| assets/lab.js:985 |     if (document.activeElement !== evTa) evTa.value = S.ev.map((t) =&gt; t.toFixed(3)).join(', '); |     setHTML($('#exHint'), ex ?`&lt;p&gt;&lt;b&gt;${ex.name}&lt;/b&gt;：${ex.desc}${ex.tip}&lt;/p&gt;&lt;div class="tries"&gt;${ex.tries.map(([l], j) =&gt; `&lt;button type="button" class="chip-btn" data-try="${j}"&gt;${l}&lt;/button&gt;`).join('')}&lt;/div&gt;` : `&lt;p&gt;${S.ev.length ? '自定义事件（拖动、键盘或打拍录入得到）。' : '还没有事件：点上方示例、在 A 道空白处点一下，或用打拍录入。'}&lt;/p&gt;`); |
| assets/lab.js:986 |     $('#lat').value = S.lat; $('#latV').textContent = signed(S.lat); |     if (document.activeElement !== evTa) evTa.value = S.ev.map((t) =&gt; t.toFixed(3)).join(', '); |
| assets/lab.js:987 |     Object.entries(SLD).forEach(([k, f]) =&gt; { $('#' + k).value = S[k]; $('#' + k + 'V').textContent = f(S[k]); }); |     $('#lat').value = S.lat; $('#latV').textContent = signed(S.lat); |
| assets/lab.js:988 |     $('#sync').checked = S.sync; $('#cue').checked = S.cue; $('#trail').checked = S.trail; $('#ghost').checked = S.ghost; |     Object.entries(SLD).forEach(([k, f]) =&gt; { $('#' + k).value = S[k]; $('#' + k + 'V').textContent = f(S[k]); }); |
| assets/lab.js:989 |     segSet($('#align'), S.align); |     $('#sync').checked = S.sync; $('#cue').checked = S.cue; $('#trail').checked = S.trail; $('#ghost').checked = S.ghost; |
| assets/lab.js:990 |     $$('#align button').forEach((b) =&gt; { b.disabled = !S.sync; }); |     segSet($('#align'), S.align); |
| assets/lab.js:991 |     segSet($('#wavCycles'), S.wavCycles); |     $$('#align button').forEach((b) =&gt; { b.disabled = !S.sync; }); |
| assets/lab.js:992 |   } |     segSet($('#wavCycles'), S.wavCycles); |
| assets/lab.js:993 |   function paintTable() { |   } |
| assets/lab.js:994 |     const list = evs(), c = clip(), inl = list.filter((e) =&gt; e.inLoop), out = list.length - inl.length; |   function paintTable() { |
| assets/lab.js:995 |     $('#qtable').innerHTML = '&lt;thead&gt;&lt;tr&gt;&lt;th&gt;#&lt;/th&gt;&lt;th&gt;原始&lt;/th&gt;&lt;th&gt;吸附到&lt;/th&gt;&lt;th&gt;吸附后&lt;/th&gt;&lt;th&gt;移动&lt;/th&gt;&lt;th&gt;落点&lt;/th&gt;&lt;/tr&gt;&lt;/thead&gt;&lt;tbody&gt;' + inl.map((e, j) =&gt; { |     const list = evs(), c = clip(), inl = list.filter((e) =&gt; e.inLoop), out = list.length - inl.length; |
| assets/lab.js:996 |       const d = ms(e.dev); |     $('#qtable').innerHTML = '&lt;thead&gt;&lt;tr&gt;&lt;th&gt;#&lt;/th&gt;&lt;th&gt;原始&lt;/th&gt;&lt;th&gt;吸附到&lt;/th&gt;&lt;th&gt;吸附后&lt;/th&gt;&lt;th&gt;移动&lt;/th&gt;&lt;th&gt;落点&lt;/th&gt;&lt;/tr&gt;&lt;/thead&gt;&lt;tbody&gt;' + inl.map((e, j) =&gt; { |
| assets/lab.js:997 |       return `&lt;tr&gt;&lt;td&gt;${j + 1}&lt;/td&gt;&lt;td&gt;${e.t.toFixed(3)}s&lt;/td&gt;&lt;td&gt;${e.label}&lt;/td&gt;&lt;td&gt;${e.snap.toFixed(3)}s&lt;/td&gt;&lt;td class="${d &gt; 0 ? 'early' : d &lt; 0 ? 'late' : 'on'}"&gt;${d ? signed(d) : '0'}&lt;/td&gt;&lt;td&gt;${KIND[e.kind]}${e.dup &gt; 1 ? ' · 重叠' : ''}&lt;/td&gt;&lt;/tr&gt;`; |       const d = ms(e.dev); |
| assets/lab.js:998 |     }).join('') + '&lt;/tbody&gt;'; |       return `&lt;tr&gt;&lt;td&gt;${j + 1}&lt;/td&gt;&lt;td&gt;${e.t.toFixed(3)}s&lt;/td&gt;&lt;td&gt;${e.label}&lt;/td&gt;&lt;td&gt;${e.snap.toFixed(3)}s&lt;/td&gt;&lt;td class="${d &gt; 0 ? 'early' : d &lt; 0 ? 'late' : 'on'}"&gt;${d ? signed(d) : '0'}&lt;/td&gt;&lt;td&gt;${KIND[e.kind]}${e.dup &gt; 1 ? ' · 重叠' : ''}&lt;/td&gt;&lt;/tr&gt;`; |
| assets/lab.js:999 |     const abs = inl.map((e) =&gt; Math.abs(ms(e.dev))), max = abs.length ? Math.max(...abs) : 0, dups = new Set(inl.filter((e) =&gt; e.dup &gt; 1).map((e) =&gt; e.full.toFixed(4))).size; |     }).join('') + '&lt;/tbody&gt;'; |
| assets/lab.js:1000 |     $('#qStats').textContent = inl.length ? `${inl.length} 个事件 · 平均移动 ${Math.round(abs.reduce((s, v) =&gt; s + v, 0) / abs.length)}ms · 最大 ${max}ms${dups ? ` · ${dups} 处重叠（多个事件吸到同一点）` : ''}${out ? ` · ${out} 个超出 ${c.L.toFixed(2)}s 循环` : ''}` : (out ? `${out} 个事件超出 ${c.L.toFixed(2)}s 循环` : '没有事件'); |     const abs = inl.map((e) =&gt; Math.abs(ms(e.dev))), max = abs.length ? Math.max(...abs) : 0, dups = new Set(inl.filter((e) =&gt; e.dup &gt; 1).map((e) =&gt; e.full.toFixed(4))).size; |
| assets/lab.js:1001 |   } |     $('#qStats').textContent = inl.length ? `${inl.length} 个事件 · 平均移动 ${Math.round(abs.reduce((s, v) =&gt; s + v, 0) / abs.length)}ms · 最大 ${max}ms${dups ? ` · ${dups} 处重叠（多个事件吸到同一点）` : ''}${out ? ` · ${out} 个超出 ${c.L.toFixed(2)}s 循环` : ''}` : (out ? `${out} 个事件超出 ${c.L.toFixed(2)}s 循环` : '没有事件'); |
| assets/lab.js:1002 |   function paintTotals() { |   } |
| assets/lab.js:1003 |     const c = clip(), tot = totalMs(), bar = c.spb * c.bpb * 1000; |   function paintTotals() { |
| assets/lab.js:1004 |     $('#total').innerHTML = `总时长 &lt;b&gt;${tot}ms&lt;/b&gt; ≈ ${r2(tot / 1000 / c.spb)} 拍 · 时长 ${S.dur}ms ≈ ${r2(S.dur / 1000 / c.spb)} 拍 · 1 小节 ${Math.round(bar)}ms${tot &gt; bar ? ' · &lt;span class="warn"&gt;总时长超过 1 小节，跟随节拍时动画会被下一小节打断&lt;/span&gt;' : ''}`; |     const c = clip(), tot = totalMs(), bar = c.spb * c.bpb * 1000; |
| assets/lab.js:1005 |     const wavC = clip(); |     $('#total').innerHTML = `总时长 &lt;b&gt;${tot}ms&lt;/b&gt; ≈ ${r2(tot / 1000 / c.spb)} 拍 · 时长 ${S.dur}ms ≈ ${r2(S.dur / 1000 / c.spb)} 拍 · 1 小节 ${Math.round(bar)}ms${tot &gt; bar ? ' · &lt;span class="warn"&gt;总时长超过 1 小节，跟随节拍时动画会被下一小节打断&lt;/span&gt;' : ''}`; |
| assets/lab.js:1006 |     $('#wavSum').textContent = `${S.meter} · ${S.bpm} BPM · ${S.bars} 小节一圈（${wavC.L.toFixed(2)}s）× ${S.wavCycles} = ${(wavC.L * S.wavCycles).toFixed(2)}s · 事件 ${MODES.find(([k]) =&gt; k === S.mode)[1]}`; |     const wavC = clip(); |
| assets/lab.js:1007 |   } |     $('#wavSum').textContent = `${S.meter} · ${S.bpm} BPM · ${S.bars} 小节一圈（${wavC.L.toFixed(2)}s）× ${S.wavCycles} = ${(wavC.L * S.wavCycles).toFixed(2)}s · 事件 ${MODES.find(([k]) =&gt; k === S.mode)[1]}`; |
| assets/lab.js:1008 |   function redraw() { |   } |
| assets/lab.js:1009 |     const part = dirty; |   function redraw() { |
| assets/lab.js:1010 |     dirty = false; |     const part = dirty; |
| assets/lab.js:1011 |     if (part === 'curve') { paintExport(); return; } |     dirty = false; |
| assets/lab.js:1012 |     syncControls(); |     if (part === 'curve') { paintExport(); return; } |
| assets/lab.js:1013 |     buildMetro(); |     syncControls(); |
| assets/lab.js:1014 |     drawTL(); |     buildMetro(); |
| assets/lab.js:1015 |     paintTable(); |     drawTL(); |
| assets/lab.js:1016 |     paintTotals(); |     paintTable(); |
| assets/lab.js:1017 |     paintExport(); |     paintTotals(); |
| assets/lab.js:1018 |     drawCurve(); |     paintExport(); |
| assets/lab.js:1019 |     if (pvItems.length !== S.count \|\| !pvItems.length) buildPreview(); |     drawCurve(); |
| assets/lab.js:1020 |   } |     if (pvItems.length !== S.count \|\| !pvItems.length) buildPreview(); |
| assets/lab.js:1021 |  |   } |
| assets/lab.js:1022 |   /* ---------- 帧循环：全部画面由“听到的”音乐位置驱动 ---------- */ |  |
| assets/lab.js:1023 |   const glow = (dt, tau) =&gt; (dt &lt; 0 ? 0 : Math.exp(-dt / tau)); |   /* ---------- 帧循环：全部画面由“听到的”音乐位置驱动 ---------- */ |
| assets/lab.js:1024 |   // 只在数值变化时写样式，避免每帧触发样式重算 |   const glow = (dt, tau) =&gt; (dt &lt; 0 ? 0 : Math.exp(-dt / tau)); |
| assets/lab.js:1025 |   const VARS = new WeakMap(); |   // 只在数值变化时写样式，避免每帧触发样式重算 |
| assets/lab.js:1026 |   function setVar(el, name, v) { |   const VARS = new WeakMap(); |
| assets/lab.js:1027 |     let m = VARS.get(el); |   function setVar(el, name, v) { |
| assets/lab.js:1028 |     if (!m) VARS.set(el, (m = {})); |     let m = VARS.get(el); |
| assets/lab.js:1029 |     const s = typeof v === 'number' ? v.toFixed(3) : v; |     if (!m) VARS.set(el, (m = {})); |
| assets/lab.js:1030 |     if (m[name] !== s) { m[name] = s; if (name === 'transform' \|\| name === 'opacity') el.style[name] = s; else el.style.setProperty(name, s); } |     const s = typeof v === 'number' ? v.toFixed(3) : v; |
| assets/lab.js:1031 |   } |     if (m[name] !== s) { m[name] = s; if (name === 'transform' \|\| name === 'opacity') el.style[name] = s; else el.style.setProperty(name, s); } |
| assets/lab.js:1032 |   const setText = (el, s) =&gt; { if (el.textContent !== s) el.textContent = s; }; |   } |
| assets/lab.js:1033 |   const EL = { pos: $('#pos'), ball: $('#mBall'), count: $('#mCount'), read: $('#mRead'), replay: $('#replay'), abNow: $('#abNow'), cvDot: $('#cvDot'), cvT: $('#cvT') }; |   const setText = (el, s) =&gt; { if (el.textContent !== s) el.textContent = s; }; |
| assets/lab.js:1034 |   let lastAB = ''; |   const EL = { pos: $('#pos'), ball: $('#mBall'), count: $('#mCount'), read: $('#mRead'), replay: $('#replay'), abNow: $('#abNow'), cvDot: $('#cvDot'), cvT: $('#cvT') }; |
| assets/lab.js:1035 |   function frame() { |   let lastAB = ''; |
| assets/lab.js:1036 |     tick(); |   function frame() { |
| assets/lab.js:1037 |     if (dirty) redraw(); |     tick(); |
| assets/lab.js:1038 |     const c = clip(), g = grid(); |     if (dirty) redraw(); |
| assets/lab.js:1039 |     const hT = T.run ? heard() : null, pH = T.run ? beatAt(hT) : null; |     const c = clip(), g = grid(); |
| assets/lab.js:1040 |     T.vis = { heard: hT, beat: pH }; // 最近一帧画面所用的“听到的”时刻与位置（自动化验证用） |     const hT = T.run ? heard() : null, pH = T.run ? beatAt(hT) : null; |
| assets/lab.js:1041 |     const going = pH != null &amp;&amp; pH &gt;= -0.02 - c.bpb * 4; |     T.vis = { heard: hT, beat: pH }; // 最近一帧画面所用的“听到的”时刻与位置（自动化验证用） |
| assets/lab.js:1042 |     // 走带位置、迷你灯、节拍器 |     const going = pH != null &amp;&amp; pH &gt;= -0.02 - c.bpb * 4; |
| assets/lab.js:1043 |     let beatIdx = -1, beatGlow = 0, subK = -1, subGlow = 0, inBar = 0; |     // 走带位置、迷你灯、节拍器 |
| assets/lab.js:1044 |     if (going) { |     let beatIdx = -1, beatGlow = 0, subK = -1, subGlow = 0, inBar = 0; |
| assets/lab.js:1045 |       const rel = pH - T.bar, barN = Math.floor(rel / c.bpb); |     if (going) { |
| assets/lab.js:1046 |       inBar = rel - barN * c.bpb; |       const rel = pH - T.bar, barN = Math.floor(rel / c.bpb); |
| assets/lab.js:1047 |       beatIdx = Math.floor(inBar + 1e-9); |       inBar = rel - barN * c.bpb; |
| assets/lab.js:1048 |       const f = inBar - beatIdx; |       beatIdx = Math.floor(inBar + 1e-9); |
| assets/lab.js:1049 |       let k = 0; |       const f = inBar - beatIdx; |
| assets/lab.js:1050 |       for (let j = 0; j &lt; g.length; j++) if (g[j] &lt;= f + 1e-9) k = j; |       let k = 0; |
| assets/lab.js:1051 |       beatGlow = glow(f * c.spb, 0.16); |       for (let j = 0; j &lt; g.length; j++) if (g[j] &lt;= f + 1e-9) k = j; |
| assets/lab.js:1052 |       subK = k; subGlow = k ? glow((f - g[k]) * c.spb, 0.1) : 0; |       beatGlow = glow(f * c.spb, 0.16); |
| assets/lab.js:1053 |       setText(EL.pos, rel &lt; 0 ? `预备 ${Math.ceil(-rel)}` : `${barN + 1}.${beatIdx + 1}${S.div &gt; 1 ? '.' + (k + 1) : ''}`); |       subK = k; subGlow = k ? glow((f - g[k]) * c.spb, 0.1) : 0; |
| assets/lab.js:1054 |       recStep(clipAbs(pH, c), c); |       setText(EL.pos, rel &lt; 0 ? `预备 ${Math.ceil(-rel)}` : `${barN + 1}.${beatIdx + 1}${S.div &gt; 1 ? '.' + (k + 1) : ''}`); |
| assets/lab.js:1055 |     } else setText(EL.pos, '—'); |       recStep(clipAbs(pH, c), c); |
| assets/lab.js:1056 |     const countIn = going &amp;&amp; pH - T.bar &lt; 0; |     } else setText(EL.pos, '—'); |
| assets/lab.js:1057 |     lightEls.forEach((el, i) =&gt; el.classList.toggle('on', i === beatIdx &amp;&amp; going)); |     const countIn = going &amp;&amp; pH - T.bar &lt; 0; |
| assets/lab.js:1058 |     cellGeo.forEach((cg, i) =&gt; { |     lightEls.forEach((el, i) =&gt; el.classList.toggle('on', i === beatIdx &amp;&amp; going)); |
| assets/lab.js:1059 |       const on = i === beatIdx &amp;&amp; going; |     cellGeo.forEach((cg, i) =&gt; { |
| assets/lab.js:1060 |       cg.el.classList.toggle('on', on); |       const on = i === beatIdx &amp;&amp; going; |
| assets/lab.js:1061 |       cg.el.classList.toggle('pre', on &amp;&amp; countIn); |       cg.el.classList.toggle('on', on); |
| assets/lab.js:1062 |       setVar(cg.el, '--glow', on ? (reduce ? 1 : beatGlow) : 0); |       cg.el.classList.toggle('pre', on &amp;&amp; countIn); |
| assets/lab.js:1063 |       cg.subs.forEach((s, j) =&gt; setVar(s, '--glow', on &amp;&amp; subK === j + 1 ? (reduce ? 1 : subGlow) : 0)); |       setVar(cg.el, '--glow', on ? (reduce ? 1 : beatGlow) : 0); |
| assets/lab.js:1064 |     }); |       cg.subs.forEach((s, j) =&gt; setVar(s, '--glow', on &amp;&amp; subK === j + 1 ? (reduce ? 1 : subGlow) : 0)); |
| assets/lab.js:1065 |     if (going &amp;&amp; cellGeo.length &amp;&amp; !reduce) { |     }); |
| assets/lab.js:1066 |       const cg = cellGeo[clamp(beatIdx, 0, cellGeo.length - 1)], f = inBar - beatIdx; |     if (going &amp;&amp; cellGeo.length &amp;&amp; !reduce) { |
| assets/lab.js:1067 |       setVar(EL.ball, 'opacity', '1'); |       const cg = cellGeo[clamp(beatIdx, 0, cellGeo.length - 1)], f = inBar - beatIdx; |
| assets/lab.js:1068 |       setVar(EL.ball, 'transform', `translate(${(cg.x + f * cg.w).toFixed(1)}px, ${(-Math.sin(Math.PI * f) * 34).toFixed(1)}px)`); |       setVar(EL.ball, 'opacity', '1'); |
| assets/lab.js:1069 |     } else setVar(EL.ball, 'opacity', '0'); |       setVar(EL.ball, 'transform', `translate(${(cg.x + f * cg.w).toFixed(1)}px, ${(-Math.sin(Math.PI * f) * 34).toFixed(1)}px)`); |
| assets/lab.js:1070 |     const cntTxt = !going ? '·' : String(beatIdx + 1); // 预备小节也数拍（灰色） |     } else setVar(EL.ball, 'opacity', '0'); |
| assets/lab.js:1071 |     if (EL.count.textContent !== cntTxt) { EL.count.textContent = cntTxt; EL.count.dataset.lv = countIn \|\| !going ? 'idle' : beatIdx === 0 ? 'bar' : c.acc.has(beatIdx) ? 'acc' : 'beat'; } |     const cntTxt = !going ? '·' : String(beatIdx + 1); // 预备小节也数拍（灰色） |
| assets/lab.js:1072 |     setText(EL.read, `${!going ? '已停止' : countIn ? '预备小节' : `小节 ${Math.floor((pH - T.bar) / c.bpb) + 1}`} · ${S.bpm} BPM · 1 拍 ${ms(c.spb)}ms · 1 小节 ${(c.spb * c.bpb).toFixed(2)}s`); |     if (EL.count.textContent !== cntTxt) { EL.count.textContent = cntTxt; EL.count.dataset.lv = countIn \|\| !going ? 'idle' : beatIdx === 0 ? 'bar' : c.acc.has(beatIdx) ? 'acc' : 'beat'; } |
| assets/lab.js:1073 |     paintTimeline(pH, c); |     setText(EL.read, `${!going ? '已停止' : countIn ? '预备小节' : `小节 ${Math.floor((pH - T.bar) / c.bpb) + 1}`} · ${S.bpm} BPM · 1 拍 ${ms(c.spb)}ms · 1 小节 ${(c.spb * c.bpb).toFixed(2)}s`); |
| assets/lab.js:1074 |     paintBounce(pH, c); |     paintTimeline(pH, c); |
| assets/lab.js:1075 |     paintEase(); |     paintBounce(pH, c); |
| assets/lab.js:1076 |     requestAnimationFrame(frame); |     paintEase(); |
| assets/lab.js:1077 |   } |     requestAnimationFrame(frame); |
| assets/lab.js:1078 |   function abAt(m) { return S.mode === 'ab' ? (mod(m - T.abPhase, 2) ? 'b' : 'a') : S.mode; } |   } |
| assets/lab.js:1079 |   function paintTimeline(pH, c) { |   function abAt(m) { return S.mode === 'ab' ? (mod(m - T.abPhase, 2) ? 'b' : 'a') : S.mode; } |
| assets/lab.js:1080 |     const head = $('#tlHead'); |   function paintTimeline(pH, c) { |
| assets/lab.js:1081 |     if (!head) return; |     const head = $('#tlHead'); |
| assets/lab.js:1082 |     if (pH == null) { setVar(head, 'opacity', '0'); if (lastAB) { EL.abNow.textContent = ''; lastAB = ''; } return; } |     if (!head) return; |
| assets/lab.js:1083 |     const C = clipAbs(pH, c), ct = mod(C, c.L), m = Math.floor(C / c.L); |     if (pH == null) { setVar(head, 'opacity', '0'); if (lastAB) { EL.abNow.textContent = ''; lastAB = ''; } return; } |
| assets/lab.js:1084 |     setVar(head, 'opacity', '1'); |     const C = clipAbs(pH, c), ct = mod(C, c.L), m = Math.floor(C / c.L); |
| assets/lab.js:1085 |     setVar(head, 'transform', `translateX(${tlX(ct, c).toFixed(1)}px)`); |     setVar(head, 'opacity', '1'); |
| assets/lab.js:1086 |     const ab = T.rec ? 'rec' : abAt(m); |     setVar(head, 'transform', `translateX(${tlX(ct, c).toFixed(1)}px)`); |
| assets/lab.js:1087 |     const txt = ab === 'rec' ? '录入中：事件静音，只放节拍器' : ab === 'a' ? '正在播放：A 原始' : ab === 'b' ? '正在播放：B 吸附后' : ab === 'both' ? '正在播放：A（左）+ B（右）' : ''; |     const ab = T.rec ? 'rec' : abAt(m); |
| assets/lab.js:1088 |     if (txt !== lastAB) { EL.abNow.textContent = txt; EL.abNow.dataset.ab = ab; lastAB = txt; } |     const txt = ab === 'rec' ? '录入中：事件静音，只放节拍器' : ab === 'a' ? '正在播放：A 原始' : ab === 'b' ? '正在播放：B 吸附后' : ab === 'both' ? '正在播放：A（左）+ B（右）' : ''; |
| assets/lab.js:1089 |     // 命中闪光：事件在本圈被播放时放大（减少动态时不闪） |     if (txt !== lastAB) { EL.abNow.textContent = txt; EL.abNow.dataset.ab = ab; lastAB = txt; } |
| assets/lab.js:1090 |     if (reduce) return; |     // 命中闪光：事件在本圈被播放时放大（减少动态时不闪） |
| assets/lab.js:1091 |     const em = new Map(evs().map((e) =&gt; [e.i, e])); |     if (reduce) return; |
| assets/lab.js:1092 |     const flash = (map, which) =&gt; map.forEach((el, i) =&gt; { |     const em = new Map(evs().map((e) =&gt; [e.i, e])); |
| assets/lab.js:1093 |       const e = em.get(i); |     const flash = (map, which) =&gt; map.forEach((el, i) =&gt; { |
| assets/lab.js:1094 |       if (!e) return; |       const e = em.get(i); |
| assets/lab.js:1095 |       const t = which === 'a' ? e.t : e.snap, dt = mod(ct - t, c.L), audible = ab === which \|\| ab === 'both'; |       if (!e) return; |
| assets/lab.js:1096 |       setVar(el, '--hit', audible &amp;&amp; dt &lt; 0.35 ? glow(dt, 0.12) : 0); |       const t = which === 'a' ? e.t : e.snap, dt = mod(ct - t, c.L), audible = ab === which \|\| ab === 'both'; |
| assets/lab.js:1097 |     }); |       setVar(el, '--hit', audible &amp;&amp; dt &lt; 0.35 ? glow(dt, 0.12) : 0); |
| assets/lab.js:1098 |     flash(TL.aEls, 'a'); |     }); |
| assets/lab.js:1099 |     flash(TL.bEls, 'b'); |     flash(TL.aEls, 'a'); |
| assets/lab.js:1100 |   } |     flash(TL.bEls, 'b'); |
| assets/lab.js:1101 |   function paintBounce(pH, c) { |   } |
| assets/lab.js:1102 |     if (!BN.lanes) return; |   function paintBounce(pH, c) { |
| assets/lab.js:1103 |     const list = evs().filter((e) =&gt; e.inLoop); |     if (!BN.lanes) return; |
| assets/lab.js:1104 |     const C = pH == null ? null : clipAbs(pH, c), ct = C == null ? 0 : mod(C, c.L), m = C == null ? 0 : Math.floor(C / c.L); |     const list = evs().filter((e) =&gt; e.inLoop); |
| assets/lab.js:1105 |     const ab = T.rec ? 'rec' : abAt(m); |     const C = pH == null ? null : clipAbs(pH, c), ct = C == null ? 0 : mod(C, c.L), m = C == null ? 0 : Math.floor(C / c.L); |
| assets/lab.js:1106 |     const beatF = pH == null ? 1 : mod(pH - T.bar, 1), barBeat = pH == null ? 1 : mod(Math.floor(pH - T.bar), c.bpb); |     const ab = T.rec ? 'rec' : abAt(m); |
| assets/lab.js:1107 |     BN.lanes.forEach((ln) =&gt; { |     const beatF = pH == null ? 1 : mod(pH - T.bar, 1), barBeat = pH == null ? 1 : mod(Math.floor(pH - T.bar), c.bpb); |
| assets/lab.js:1108 |       ln.g.classList.toggle('live', pH != null &amp;&amp; (ab === ln.w \|\| ab === 'both')); |     BN.lanes.forEach((ln) =&gt; { |
| assets/lab.js:1109 |       const lampV = pH == null ? 0 : reduce ? (beatF &lt; 0.25 ? 1 : 0) : glow(beatF * c.spb, 0.12); |       ln.g.classList.toggle('live', pH != null &amp;&amp; (ab === ln.w \|\| ab === 'both')); |
| assets/lab.js:1110 |       setVar(ln.lamp, '--glow', lampV); |       const lampV = pH == null ? 0 : reduce ? (beatF &lt; 0.25 ? 1 : 0) : glow(beatF * c.spb, 0.12); |
| assets/lab.js:1111 |       ln.lamp.classList.toggle('bar', barBeat === 0); |       setVar(ln.lamp, '--glow', lampV); |
| assets/lab.js:1112 |       const ts = list.map((e) =&gt; ({ t: ln.w === 'a' ? e.t : e.snap, e })).sort((x, y) =&gt; x.t - y.t); |       ln.lamp.classList.toggle('bar', barBeat === 0); |
| assets/lab.js:1113 |       if (pH == null \|\| !ts.length) { setVar(ln.ball, 'transform', 'translateY(0px)'); setVar(ln.ring, 'opacity', '0'); return; } |       const ts = list.map((e) =&gt; ({ t: ln.w === 'a' ? e.t : e.snap, e })).sort((x, y) =&gt; x.t - y.t); |
| assets/lab.js:1114 |       // 上一次落地与下一次落地（循环回绕） |       if (pH == null \|\| !ts.length) { setVar(ln.ball, 'transform', 'translateY(0px)'); setVar(ln.ring, 'opacity', '0'); return; } |
| assets/lab.js:1115 |       let prev = null, next = null; |       // 上一次落地与下一次落地（循环回绕） |
| assets/lab.js:1116 |       for (const x of ts) { if (x.t &lt;= ct + 1e-9) prev = x; else if (!next) next = x; } |       let prev = null, next = null; |
| assets/lab.js:1117 |       const pT = prev ? prev.t : ts[ts.length - 1].t - c.L, nx = next \|\| { t: ts[0].t + c.L, e: ts[0].e }, pv = prev \|\| { t: pT, e: ts[ts.length - 1].e }; |       for (const x of ts) { if (x.t &lt;= ct + 1e-9) prev = x; else if (!next) next = x; } |
| assets/lab.js:1118 |       const span = Math.max(0.05, nx.t - pT), u = clamp((ct - pT) / span, 0, 1), hgt = Math.min(1, span / 0.6) * 62; |       const pT = prev ? prev.t : ts[ts.length - 1].t - c.L, nx = next \|\| { t: ts[0].t + c.L, e: ts[0].e }, pv = prev \|\| { t: pT, e: ts[ts.length - 1].e }; |
| assets/lab.js:1119 |       setVar(ln.ball, 'transform', `translateY(${reduce ? 0 : (-Math.sin(Math.PI * u) * hgt).toFixed(1)}px)`); |       const span = Math.max(0.05, nx.t - pT), u = clamp((ct - pT) / span, 0, 1), hgt = Math.min(1, span / 0.6) * 62; |
| assets/lab.js:1120 |       const since = ct - pT; |       setVar(ln.ball, 'transform', `translateY(${reduce ? 0 : (-Math.sin(Math.PI * u) * hgt).toFixed(1)}px)`); |
| assets/lab.js:1121 |       setVar(ln.ring, 'opacity', reduce ? (since &lt; 0.2 ? '1' : '0') : glow(since, 0.14).toFixed(3)); |       const since = ct - pT; |
| assets/lab.js:1122 |       setVar(ln.ring, 'transform', `scale(${(1 + (reduce ? 0 : Math.min(1, since / 0.3) * 0.35)).toFixed(3)})`); |       setVar(ln.ring, 'opacity', reduce ? (since &lt; 0.2 ? '1' : '0') : glow(since, 0.14).toFixed(3)); |
| assets/lab.js:1123 |       if (ln.last !== pv.e.i + ln.w) { |       setVar(ln.ring, 'transform', `scale(${(1 + (reduce ? 0 : Math.min(1, since / 0.3) * 0.35)).toFixed(3)})`); |
| assets/lab.js:1124 |         ln.last = pv.e.i + ln.w; |       if (ln.last !== pv.e.i + ln.w) { |
| assets/lab.js:1125 |         const e = pv.e, d = ms(e.devFull); |         ln.last = pv.e.i + ln.w; |
| assets/lab.js:1126 |         const onBeat = ln.w === 'b' ? e.kind : Math.abs(d) &lt;= 12 ? e.kind : null; |         const e = pv.e, d = ms(e.devFull); |
| assets/lab.js:1127 |         ln.lab.textContent = ln.w === 'a' ? (onBeat ? `${KIND[onBeat]} · 准` : `离网格 ${signed(-d)}`) : KIND[e.kind]; |         const onBeat = ln.w === 'b' ? e.kind : Math.abs(d) &lt;= 12 ? e.kind : null; |
| assets/lab.js:1128 |         ln.pos.textContent = `位置 ${e.label}`; |         ln.lab.textContent = ln.w === 'a' ? (onBeat ? `${KIND[onBeat]} · 准` : `离网格 ${signed(-d)}`) : KIND[e.kind]; |
| assets/lab.js:1129 |         ln.lab.dataset.k = ln.w === 'a' &amp;&amp; !onBeat ? 'miss' : e.kind; |         ln.pos.textContent = `位置 ${e.label}`; |
| assets/lab.js:1130 |       } |         ln.lab.dataset.k = ln.w === 'a' &amp;&amp; !onBeat ? 'miss' : e.kind; |
| assets/lab.js:1131 |     }); |       } |
| assets/lab.js:1132 |   } |     }); |
| assets/lab.js:1133 |   function paintEase() { |   } |
| assets/lab.js:1134 |     const t = easeClock(); |   function paintEase() { |
| assets/lab.js:1135 |     pvItems.forEach((it, i) =&gt; { |     const t = easeClock(); |
| assets/lab.js:1136 |       const pr = reduce ? 1 : clamp((t - i * S.stag) / S.dur, 0, 1); |     pvItems.forEach((it, i) =&gt; { |
| assets/lab.js:1137 |       if (it.box) setVar(it.box, 'transform', `translateX(${(ease(pr) * pvW).toFixed(1)}px)`); |       const pr = reduce ? 1 : clamp((t - i * S.stag) / S.dur, 0, 1); |
| assets/lab.js:1138 |       if (it.ghost) setVar(it.ghost, 'transform', `translateX(${(pr * pvW).toFixed(1)}px)`); |       if (it.box) setVar(it.box, 'transform', `translateX(${(ease(pr) * pvW).toFixed(1)}px)`); |
| assets/lab.js:1139 |     }); |       if (it.ghost) setVar(it.ghost, 'transform', `translateX(${(pr * pvW).toFixed(1)}px)`); |
| assets/lab.js:1140 |     const p = reduce ? 1 : clamp(t / S.dur, 0, 1); |     }); |
| assets/lab.js:1141 |     EL.cvDot.setAttribute('cx', CX(p)); EL.cvDot.setAttribute('cy', CY(ease(p))); |     const p = reduce ? 1 : clamp(t / S.dur, 0, 1); |
| assets/lab.js:1142 |     EL.cvT.setAttribute('x1', CX(p)); EL.cvT.setAttribute('x2', CX(p)); |     EL.cvDot.setAttribute('cx', CX(p)); EL.cvDot.setAttribute('cy', CY(ease(p))); |
| assets/lab.js:1143 |     const dis = T.run &amp;&amp; S.sync; |     EL.cvT.setAttribute('x1', CX(p)); EL.cvT.setAttribute('x2', CX(p)); |
| assets/lab.js:1144 |     if (EL.replay.disabled !== dis) { EL.replay.disabled = dis; EL.replay.title = dis ? '跟随节拍时每小节自动重播' : ''; } |     const dis = T.run &amp;&amp; S.sync; |
| assets/lab.js:1145 |   } |     if (EL.replay.disabled !== dis) { EL.replay.disabled = dis; EL.replay.title = dis ? '跟随节拍时每小节自动重播' : ''; } |
| assets/lab.js:1146 |  |   } |
| assets/lab.js:1147 |   /* ---------- 键盘：输入框里不抢键；按钮 / 链接上的空格交给元素本身 ---------- */ |  |
| assets/lab.js:1148 |   document.addEventListener('keydown', (e) =&gt; { |   /* ---------- 键盘：输入框里不抢键；按钮 / 链接上的空格交给元素本身 ---------- */ |
| assets/lab.js:1149 |     if (e.ctrlKey \|\| e.metaKey \|\| e.altKey) return; |   document.addEventListener('keydown', (e) =&gt; { |
| assets/lab.js:1150 |     const el = e.target, tag = el.tagName; |     if (e.ctrlKey \|\| e.metaKey \|\| e.altKey) return; |
| assets/lab.js:1151 |     const typing = tag === 'TEXTAREA' \|\| tag === 'SELECT' \|\| el.isContentEditable \|\| (tag === 'INPUT' &amp;&amp; !['range', 'checkbox', 'radio'].includes(el.type)); |     const el = e.target, tag = el.tagName; |
| assets/lab.js:1152 |     if (typing) return; |     const typing = tag === 'TEXTAREA' \|\| tag === 'SELECT' \|\| el.isContentEditable \|\| (tag === 'INPUT' &amp;&amp; !['range', 'checkbox', 'radio'].includes(el.type)); |
| assets/lab.js:1153 |     const k = e.key.toLowerCase(); |     if (typing) return; |
| assets/lab.js:1154 |     if (e.key === ' ' \|\| e.code === 'Space') { |     const k = e.key.toLowerCase(); |
| assets/lab.js:1155 |       if (tag === 'BUTTON' \|\| tag === 'A' \|\| tag === 'SUMMARY' \|\| (tag === 'INPUT' &amp;&amp; el.type !== 'range')) return; |     if (e.key === ' ' \|\| e.code === 'Space') { |
| assets/lab.js:1156 |       e.preventDefault(); |       if (tag === 'BUTTON' \|\| tag === 'A' \|\| tag === 'SUMMARY' \|\| (tag === 'INPUT' &amp;&amp; el.type !== 'range')) return; |
| assets/lab.js:1157 |       if (!e.repeat) togglePlay(); |       e.preventDefault(); |
| assets/lab.js:1158 |     } else if (k === 't' &amp;&amp; !e.repeat) { tapTempo(e.timeStamp); } |       if (!e.repeat) togglePlay(); |
| assets/lab.js:1159 |     else if (k === 'j' &amp;&amp; !e.repeat) { e.preventDefault(); padTap(e.timeStamp); } |     } else if (k === 't' &amp;&amp; !e.repeat) { tapTempo(e.timeStamp); } |
| assets/lab.js:1160 |     else if (k === 'r' &amp;&amp; !e.repeat) recToggle(); |     else if (k === 'j' &amp;&amp; !e.repeat) { e.preventDefault(); padTap(e.timeStamp); } |
| assets/lab.js:1161 |     else if (k === 'a' &amp;&amp; !e.repeat) update({ mode: 'a' }); |     else if (k === 'r' &amp;&amp; !e.repeat) recToggle(); |
| assets/lab.js:1162 |     else if (k === 'b' &amp;&amp; !e.repeat) update({ mode: 'b' }); |     else if (k === 'a' &amp;&amp; !e.repeat) update({ mode: 'a' }); |
| assets/lab.js:1163 |     else if (k === 'x' &amp;&amp; !e.repeat) update({ mode: 'ab' }); |     else if (k === 'b' &amp;&amp; !e.repeat) update({ mode: 'b' }); |
| assets/lab.js:1164 |   }); |     else if (k === 'x' &amp;&amp; !e.repeat) update({ mode: 'ab' }); |
| assets/lab.js:1165 |  |   }); |
| assets/lab.js:1166 |   /* ---------- 尺寸、主题、减少动态 ---------- */ |  |
| assets/lab.js:1167 |   const ro = new ResizeObserver(() =&gt; { measureMetro(); drawTL(); drawBounce(); buildPreview(); }); |   /* ---------- 尺寸、主题、减少动态 ---------- */ |
| assets/lab.js:1168 |   [$('#tlBox'), $('#bounce'), $('#mBar'), $('#preview')].forEach((el) =&gt; ro.observe(el)); |   const ro = new ResizeObserver(() =&gt; { measureMetro(); drawTL(); drawBounce(); buildPreview(); }); |
| assets/lab.js:1169 |   mq.addEventListener('change', () =&gt; { reduce = mq.matches; buildPreview(); }); |   [$('#tlBox'), $('#bounce'), $('#mBar'), $('#preview')].forEach((el) =&gt; ro.observe(el)); |
| assets/lab.js:1170 |   document.addEventListener('visibilitychange', () =&gt; { if (!document.hidden) tick(); }); |   mq.addEventListener('change', () =&gt; { reduce = mq.matches; buildPreview(); }); |
| assets/lab.js:1171 |  |   document.addEventListener('visibilitychange', () =&gt; { if (!document.hidden) tick(); }); |
| assets/lab.js:1172 |   // 调试 / 自动化钩子（只读为主；apply 与界面走同一入口） |  |
| assets/lab.js:1173 |   window.__lab = { |   // 调试 / 自动化钩子（只读为主；apply 与界面走同一入口） |
| assets/lab.js:1174 |     S, T, LOG, PROC, clip, grid, snapX, beatAt, timeAt, heard, now, offlineScore, exportText, update, KITS, EVOICES, |   window.__lab = { |
| assets/lab.js:1175 |     evs: () =&gt; evs().map((e) =&gt; ({ i: e.i, t: e.t, snap: e.snap, full: e.full, dev: e.dev, label: e.label, kind: e.kind, dup: e.dup, inLoop: e.inLoop })), |     S, T, LOG, PROC, clip, grid, snapX, beatAt, timeAt, heard, now, offlineScore, exportText, update, KITS, EVOICES, |
| assets/lab.js:1176 |     clock: () =&gt; ({ src: T.src, run: T.run, now: T.run ? now() : null, heard: T.run ? heard() : null, beat: T.run ? beatAt(heard()) : null, bar: T.bar, t0: T.t0, p0: T.p0, abPhase: T.abPhase }), |     evs: () =&gt; evs().map((e) =&gt; ({ i: e.i, t: e.t, snap: e.snap, full: e.full, dev: e.dev, label: e.label, kind: e.kind, dup: e.dup, inLoop: e.inLoop })), |
| assets/lab.js:1177 |     start: (p0) =&gt; startUser(p0), stop, padTap, tapTempo, recToggle, |     clock: () =&gt; ({ src: T.src, run: T.run, now: T.run ? now() : null, heard: T.run ? heard() : null, beat: T.run ? beatAt(heard()) : null, bar: T.bar, t0: T.t0, p0: T.p0, abPhase: T.abPhase }), |
| assets/lab.js:1178 |     async render(cycles) { const r = await renderWav(cycles); return { peakDb: r.peakDb, rmsDb: r.rmsDb, clipped: r.clipped, events: r.events, duration: r.duration, b64: await r.base64() }; }, |     start: (p0) =&gt; startUser(p0), stop, padTap, tapTempo, recToggle, |
| assets/lab.js:1179 |   }; |     async render(cycles) { const r = await renderWav(cycles); return { peakDb: r.peakDb, rmsDb: r.rmsDb, clipped: r.clipped, events: r.events, duration: r.duration, b64: await r.base64() }; }, |
| assets/lab.js:1180 |  |   }; |
| assets/lab.js:1181 |   drawCurve(); fitView(); drawBounce(); redraw(); buildPreview(); paintPlay(); paintSound(); paintHist(); |  |
| assets/lab.js:1182 |   setInterval(tick, 25); |   drawCurve(); fitView(); drawBounce(); redraw(); buildPreview(); paintPlay(); paintSound(); paintHist(); |
| assets/lab.js:1183 |   requestAnimationFrame(frame); |   setInterval(tick, 25); |
| assets/lab.js:1184 | })(); |   requestAnimationFrame(frame); |
| assets/lab.js:1185 |  | })(); |
| assets/lab.js:1186 | （删除） |  |

## 返工 1

本节原文以返工开始时的工作树为基准。参数清单migration[].how按答复保留；舞台字号不设下限，Demo不改。

### entries/cases/archive-os.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| focus | 四十份档案按五类排列，阅读、模型与声音共用一条时间轴。两份 GLB 模型分别呈现档案与可拆解结构。画面按 60Hz 时钟播放，支持暂停与定位。 | 四十份档案按五类排列：可以阅读、查看 3D 模型、拆解再重组结构。画面、声音与操作共用一条时间轴，随时可以暂停和拖动。 |
| observations[0] | {<br>  "at": "档案阵列",<br>  "what": "工程研究、生命科学、机构档案、能量研究、特别项目五列各八份，共四十份。"<br>} | {<br>  "at": "档案阵列",<br>  "what": "五列档案：工程研究、生命科学、机构档案、能量研究、特别项目，每列八份。"<br>} |
| observations[1] | {<br>  "at": "选择与镜头",<br>  "what": "列镜头与阵列轨道的临界阻尼速率为3.7，选中抬起为4.2。"<br>} | {<br>  "at": "选择与镜头",<br>  "what": "选中的档案轻轻抬起，镜头沿阵列平滑跟随，停下时没有回弹。"<br>} |
| observations[2] | {<br>  "at": "文字滚动",<br>  "what": "数字与标题滚动460ms，页签、检索、收藏与键盘操作随时可用。"<br>} | {<br>  "at": "文字滚动",<br>  "what": "编号与标题切换时滚动约 460ms，页签、检索、收藏随时可用。"<br>} |
| observations[3] | {<br>  "at": "解密",<br>  "what": "解密区间34.12–39.56s，倍率1.5，交互时长3.6267s。"<br>} | {<br>  "at": "解密",<br>  "what": "读取档案时正文沿对角线逐块解密，约 3.6 秒完成。"<br>} |
| observations[4] | {<br>  "at": "画幅",<br>  "what": "宽高比低于1.05时使用竖屏布局，内容随固定画幅缩放。"<br>} | {<br>  "at": "画幅",<br>  "what": "横屏 1920×1080，画面整体等比缩放。"<br>} |
| observations[5] | {<br>  "at": "逐字输入",<br>  "what": "逐字输入配合短音，文字与声音同步出现。"<br>} | {<br>  "at": "逐字输入",<br>  "what": "开机文字逐字打出，每个字都配一声短音。"<br>} |
| observations[6] | {<br>  "at": "浏览节奏",<br>  "what": "22.0s阵列；35.0s读取X-001；62.6s浏览，77.6s结束。"<br>} | {<br>  "at": "浏览节奏",<br>  "what": "22 秒展开阵列，35 秒读取第一份档案，62.6 秒起四向循环浏览。"<br>} |
| observations[7] | {<br>  "at": "声音",<br>  "what": "77.6s/48kHz双声道，106音=10开场+71逐字+25交互。"<br>} | {<br>  "at": "声音",<br>  "what": "开机、打字和每一次操作都有对应音效，全片 77.6 秒。"<br>} |

### entries/cases/map-pilgrimage.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| observations[0] | {<br>  "at": "0:00–0:05",<br>  "what": "地球在深色太空中推近，首尔与关西标记依次出现，左下持续显示曲名。"<br>} | {<br>  "at": "0:04.8",<br>  "what": "竖排「関西周遊」从模糊变清，英文逐字打出，每字配键击。"<br>} |
| observations[1] | {<br>  "at": "0:05.2–0:06.1",<br>  "what": "亮度交叉：暗 → 灰 → 亮，约 0.9 秒完成“天亮”。"<br>} | {<br>  "at": "0:13.5",<br>  "what": "左上日序日期，右上坐标海拔缩放时钟；左下曲名歌词，右下步进器印章。"<br>} |
| observations[2] | {<br>  "at": "0:06.4–0:07.0",<br>  "what": "「聖地巡礼」逐字模糊入场，横线描出，PILGRIMAGE '26打字。"<br>} | {<br>  "at": "0:19–0:20",<br>  "what": "鸟居卡片沿引线浮入，MIKAN计数上滚，随后盖下京都印章。"<br>} |
| observations[3] | {<br>  "at": "0:16.5",<br>  "what": "HUD 全貌：DAY 01 / 07、MON · SEP 28 2026、34.4320°N 135.2304°E、ELEV 0 M · Z 10.9、11:33 JST、YUI SPOTTED ×2、NOW PLAYING 曲名 — 艺人、SEOUL–KANSAI–KYOTO–TOKYO 步进器、右下地图署名。"<br>} | {<br>  "at": "0:21–0:24",<br>  "what": "鸟居卡片铺满画面，HUD转白；呼啸后落下低音，再收回地图。"<br>} |
| observations[4] | {<br>  "at": "0:20.6–0:22.7",<br>  "what": "卡片切换、地名模糊入场；22.7秒硬切全屏，HUD保留。"<br>} | {<br>  "at": "0:27.8",<br>  "what": "河畔插画中，「ゆく河の流れは」「絶えずして」竖排显影，逐字配钟声。"<br>} |
| observations[5] | {<br>  "at": "0:38.9–0:41.0",<br>  "what": "夜转昼时DAY 02滚入，DAY描边、02实心；蓝色章节框线描出。"<br>} | {<br>  "at": "0:30.8",<br>  "what": "明信片与实景并排，「10.01·17:40 JST」斜戳配盖章声。"<br>} |
| observations[6] | {<br>  "at": "0:55.2–0:57.9",<br>  "what": "蓝框回忆标注S1 EP05，日文逐字、英文打字，底部说明配颗粒。"<br>} | {<br>  "at": "0:33.8",<br>  "what": "地图逐层转为深蓝黑，HUD变浅色，下扫呼啸接低音。"<br>} |
| observations[7] | {<br>  "at": "1:12–1:20",<br>  "what": "角色收集托盘：四个角色位依次点亮，与计数徽章 ×11 呼应。"<br>} | {<br>  "at": "0:41.8",<br>  "what": "奈良卡片浮入，琥珀色斜纹胶带与网点标出章节。"<br>} |
| observations[8] | {<br>  "at": "1:39.35–1:40.6",<br>  "what": "动画2015/实景2026分屏；10.01·18:20JST斜戳盖章。"<br>} | {<br>  "at": "0:45–0:47",<br>  "what": "红色WRONG TRAIN横幅擦入，REROUTING省略号与蜂鸣同拍。"<br>} |
| observations[9] | {<br>  "at": "2:08.5",<br>  "what": "WRONG TRAIN红色横幅出现，错误路线打叉，REROUTING胶囊闪烁。"<br>} | {<br>  "at": "0:58.8",<br>  "what": "3天4站、4枚印章、×4目击、1次误乘与194km逐行计数，钟声收尾。"<br>} |
| observations[10] | {<br>  "at": "2:30.5",<br>  "what": "7天2国5作品3笔记，×19目击，1,159km；「聖地巡礼」收尾。"<br>} | （删除） |

### entries/patterns/corner-hud.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 旅程开始、需要持续定位时 |
| effect | 日序、坐标、时钟、歌词与步进器钉在四角，数值随镜头与时间持续更新，中央留给地图。 | 观众随时知道走到哪、过了多久。 |
| timing | [<br>  {<br>    "name": "顶部 HUD 入场",<br>    "value": "0s"<br>  },<br>  {<br>    "name": "跨天",<br>    "value": "6.6s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "13.8s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "click、kick、sub"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "13.8s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "click、kick、sub"<br>  }<br>] |

### entries/patterns/vertical-title-blur.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 片名、地名或回忆字幕出现时 |
| effect | 竖排大字从模糊中显影，配副标题与逐字打字；片名、地点、回忆字幕与收尾共用一套入场。 | 地名有登场感，章节更容易记住。 |
| timing | [<br>  {<br>    "name": "片名",<br>    "value": "0s"<br>  },<br>  {<br>    "name": "地点标题",<br>    "value": "4.2s"<br>  },<br>  {<br>    "name": "回忆竖排字幕",<br>    "value": "7.9s"<br>  },<br>  {<br>    "name": "fin.",<br>    "value": "12s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "14.1s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "key、tick、bell、shimmer、sub"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "14.1s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "key、tick、bell、shimmer、sub"<br>  }<br>] |

### entries/patterns/route-draw-marker.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 启程、抵达或切换交通方式时 |
| effect | 路线按进度描画，车头沿线前进，站点标记弹入并打出双语站名。 | 下一站与行进方向一眼可见。 |
| timing | [<br>  {<br>    "name": "机场",<br>    "value": "0s"<br>  },<br>  {<br>    "name": "描画",<br>    "value": "0.6s"<br>  },<br>  {<br>    "name": "第二段",<br>    "value": "4s"<br>  },<br>  {<br>    "name": "步行",<br>    "value": "7.2s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "10.6s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "sonar、whoosh、clack、blip、chime、tick"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "10.6s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "sonar、whoosh、clack、blip、chime、tick"<br>  }<br>] |

### entries/patterns/day-night-flip.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 一天结束、进入夜晚时 |
| mechanism | 地图、3D建筑与HUD逐层切换昼夜，叠加暖色光。镜头固定在34.5s。昼夜与HUD分别播放31.3→35.8、36.6→39.1s。 | 地图、3D建筑与HUD逐层插值昼夜配色，叠加暖色光。 |
| effect | 地图配色与 HUD 强调色一起在昼夜之间过渡，交代时间的流逝。 | 不用字幕也能看出一天过去了。 |
| timing | [<br>  {<br>    "name": "白天",<br>    "value": "0s"<br>  },<br>  {<br>    "name": "入夜",<br>    "value": "1.5s"<br>  },<br>  {<br>    "name": "天亮",<br>    "value": "4.5s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "7s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "whoosh、sub、reverse、chime"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "7s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "whoosh、sub、reverse、chime"<br>  }<br>] |
| composition.notes | 地图、3D建筑与HUD逐层切换昼夜，叠加暖色光。镜头固定在34.5s。昼夜与HUD分别播放31.3→35.8、36.6→39.1s。 | 地图、3D建筑与HUD逐层插值昼夜配色，叠加暖色光。 |

### entries/patterns/card-expand-fullscreen.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 需要停下来细看一处风景时 |
| effect | 照片卡片由引线牵出，展开到全屏停留，再收回原位。 | 从路线总览转向现场细节，再回到旅程。 |
| timing | [<br>  {<br>    "name": "出卡",<br>    "value": "0s"<br>  },<br>  {<br>    "name": "展开",<br>    "value": "2.6s"<br>  },<br>  {<br>    "name": "收回",<br>    "value": "5.4s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "6.6s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "shutter、paper、whoosh、impact"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "6.6s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "shutter、paper、whoosh、impact"<br>  }<br>] |

### entries/patterns/chapter-frame.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 进入新的旅程章节时 |
| effect | 章节标签配框线或胶带网点入场，为一段旅程划出章节。 | 用颜色与边框提示新段落开始。 |
| timing | [<br>  {<br>    "name": "鸭川框线入场",<br>    "value": "0s"<br>  },<br>  {<br>    "name": "框线退场",<br>    "value": "1.65s"<br>  },<br>  {<br>    "name": "奈良胶带与网点",<br>    "value": "2.45s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "7.05s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "bell、confirm"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "7.05s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "bell、confirm"<br>  }<br>] |

### entries/patterns/split-compare-stamp.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 同一地点的今昔需要对照时 |
| effect | 旧明信片与今日实景左右对比，分割线划过后盖上时间戳。 | 同一地点的时间差异一眼可见。 |
| timing | [<br>  {<br>    "name": "分屏",<br>    "value": "0s"<br>  },<br>  {<br>    "name": "盖章",<br>    "value": "1.65s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "4.8s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "whoosh、stamp、sub"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "4.8s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "whoosh、stamp、sub"<br>  }<br>] |

### entries/patterns/collect-counter.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 到站、盖章或发现角色时 |
| effect | 每到一站计数滚动加一，印章落进托盘，步进器同步前进。 | 每次抵达都有积累感，进度看得见。 |
| timing | [<br>  {<br>    "name": "徽章出现",<br>    "value": "0s"<br>  },<br>  {<br>    "name": "×1 + 关空",<br>    "value": "0.8s"<br>  },<br>  {<br>    "name": "×2 + 京都",<br>    "value": "2.2s"<br>  },<br>  {<br>    "name": "×3 + 奈良",<br>    "value": "3.4s"<br>  },<br>  {<br>    "name": "×4 + 大阪",<br>    "value": "4.6s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "6.6s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "confirm、stamp、sparkle"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "6.6s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "confirm、stamp、sparkle"<br>  }<br>] |

### entries/patterns/alert-reroute.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 行程出错、需要改道时 |
| effect | 坐错车时红色警示横幅压下，错误路线打叉，改道路线重新描画。 | 先看出哪里出了错，再跟上新的方向。 |
| timing | [<br>  {<br>    "name": "警示",<br>    "value": "0.2s"<br>  },<br>  {<br>    "name": "错误终点",<br>    "value": "1.5s"<br>  },<br>  {<br>    "name": "改道",<br>    "value": "2.2s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "6.2s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "blip、whoosh、error、glitch。clack、alarm、beep、stamp。"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "6.2s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "blip、whoosh、error、glitch。clack、alarm、beep、stamp。"<br>  }<br>] |

### entries/patterns/outro-stat-stack.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 旅程结束、回顾收获时 |
| effect | 收尾时统计数字逐行堆叠，最后以 fin. 收束。 | 把旅程收获汇成一张能读完的结果页。 |
| timing | [<br>  {<br>    "name": "统计",<br>    "value": "0.65s"<br>  },<br>  {<br>    "name": "fin.",<br>    "value": "2.4s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "5.2s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "blip、tick、bell、shimmer、sub"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "5.2s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "blip、tick、bell、shimmer、sub"<br>  }<br>] |

### entries/patterns/seekable-timeline.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 需要回看或比较某段画面时 |
| effect | 所有画面都是时间 t 的函数，拖动、倒退、跳转都能得到同一帧。 | 观众可按自己的节奏反复看清动作。 |
| timing | [<br>  {<br>    "name": "播放",<br>    "value": "0s"<br>  },<br>  {<br>    "name": "倒拖",<br>    "value": "2s"<br>  },<br>  {<br>    "name": "前跳",<br>    "value": "3.4s"<br>  },<br>  {<br>    "name": "再倒拖",<br>    "value": "5s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "7s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "shutter、paper、confirm、stamp、sparkle、tick"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "7s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "shutter、paper、confirm、stamp、sparkle、tick"<br>  }<br>] |

### entries/patterns/film-grain.json

| 字段 | 原文 | 新文 |
| --- | --- | --- |
| trigger | 播放、暂停或 seek 到巧思时间 t。 | 地图、照片与插画交替出现时 |
| effect | 动态胶片颗粒与暗角覆盖地图、照片和插画，统一整片的质感。 | 不同媒介保持连贯，回忆段更有时间感。 |
| timing | [<br>  {<br>    "name": "地图上的颗粒",<br>    "value": "0s"<br>  },<br>  {<br>    "name": "照片颗粒",<br>    "value": "2.5s"<br>  },<br>  {<br>    "name": "插画颗粒",<br>    "value": "5s"<br>  },<br>  {<br>    "name": "时长",<br>    "value": "7.5s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "vinyl"<br>  }<br>] | [<br>  {<br>    "name": "时长",<br>    "value": "7.5s"<br>  },<br>  {<br>    "name": "声音 voice",<br>    "value": "vinyl"<br>  }<br>] |

### 档案终端的5个巧思

boot-typing、rolling-digits、decrypt-reveal、wave-array、idle-breathing的effect均与各自summary不同，保留原文。
