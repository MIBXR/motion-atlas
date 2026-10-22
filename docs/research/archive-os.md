# 莱茵生命档案终端：RhineLabUI 移植记录

本案例复用 [LBEILC / RhineLabUI](https://github.com/LBEILC/RhineLabUI) 提交 `12cc5e4013acb9408f753ff71de6b8492299b7c8` 的源码、模型、字体、音频和档案内容。移植边界是 Motion Atlas 的舞台、时间轴、预加载与统一音频协议；原版视觉、排版、字号、文案、动效参数、缓动和交互行为由上游实现负责。

上游来源为只读目录 `C:/Users/mibxr/AppData/Local/Temp/mmref/RhineLabUI`；对照运行副本位于本任务指定的 `reference-runtime`。源码快照、许可与逐文件接入登记见 [UPSTREAM.md](../../vendor/rhinelabui/UPSTREAM.md)，运行时资源集中存放在 `demos/cases/archive-os/app/`。上游 `public/` 不在 vendor 中重复保存；`art/`、`docs/`、`reference/`、`verification/`、`wallpaper/` 和部署配置不属于本案例快照。

## 上游架构

| 来源文件 | 当前职责 |
| --- | --- |
| `src/main.ts` | 应用模式、档案阅读、页签、检索、收藏、偏好与键盘操作。 |
| `src/boot.ts`、`src/boot-motion.ts`、`src/boot-lettering.ts` | 白底开场、文字输入、品牌标志、身份接入、权限验证与开场帧窗。 |
| `src/scene.ts`、`src/archive-loop.ts`、`src/motion.ts` | Three.js 档案场景、循环位置、选中抬起、抽取、归位、波形与阻尼。 |
| `src/decryption.ts`、`src/document-decryption.ts` | 模型对角解密与正文同步揭示。 |
| `src/model-viewer.ts` | 独立模型查看器、玻璃状态、旋转、平移、缩放、复位、六组结构拆解与重组。 |
| `src/viewport-layout.ts` | 根据真实视口选择 desktop、compact 或 portrait 布局及模型取景。 |
| `src/render-quality.ts`、`src/quality-renderer.ts` | performance、original、high、ultra 预设及渲染管线。 |
| `src/audio.ts`、`src/typing-samples.ts` | 三轨配乐、交互合成音、开场音与逐字输入采样。 |
| `content/archives.json`、`src/data.ts` | 页面档案数据与阵列位置映射。五列分别为工程研究、生命科学、机构档案、能量研究、特别项目，各八份，共四十份档案。 |

开场的离散视觉帧窗为 25fps，应用内部时间 0 对应参考 PV 的 5s，来源为 `src/boot-motion.ts`。列镜头与阵列轨道在常规选择过渡中使用临界阻尼速率 3.7，常规选中抬起使用 4.2；交互停止 2.5s 后进入空闲呼吸，来源为 `src/scene.ts` 与 `src/motion.ts`。数字滚动时长为 460ms，来源为 `src/main.ts`。交互解密的源码进度时长为 `(39.56 - 34.12) / 1.5 = 3.6267s`，来源为 `src/decryption.ts`；该值是源码推导值。

## 接入边界与文件

上游文件的每处接入修改使用 `// MOTION-ATLAS:` 标记；逐文件清单、原因和原任务条目号统一登记在 [UPSTREAM.md](../../vendor/rhinelabui/UPSTREAM.md)。接入范围为虚拟时钟、仅跳过 GPU 绘制的门控、胶片模式入口、可注入的音频上下文与时间源、相对资源路径和 URL 画质映射。CSS、档案数据、模型、字体和上游音频资源保持原版内容。

| 接入位置 | 职责 |
| --- | --- |
| `vendor/rhinelabui/film/` | 虚拟时钟、胶片输入时间表与原版声音离线渲染。 |
| `vendor/rhinelabui/build.mjs` | 构建相对路径 Vite 产物；`--sync-assets` 将只读上游 public 资源同步至 app。 |
| `demos/cases/archive-os/index.html`、`script.js`、`config.js`、`style.css` | MotionKit 舞台、同源 iframe、时间轴协议、预加载、手动模式与完整音轨事件。外层不添加 UI、文字或装饰。 |
| `kit/motion-kit.js` | `audio.dsp.sample()` 登记采样声部；`sustainedAt` 对带 `resume:true` 和 `dur` 的函数音色提供 offset 接续。 |
| `scripts/check.mjs`、`scripts/smoke.mjs` | 读取条目 `fontFloor:reference`，保留上游字号；运行时最小字号来自 iframe 可见文本计算字号乘舞台缩放比。 |
| `scripts/smoke.mjs`、`scripts/capture.mjs` | 读取条目 `renderer:gpu`，独立启动GPU浏览器并核验实际renderer；smoke等待seek/play完成后开始原播放计时窗口。 |

逐文件接入清单与 UPSTREAM.md 一致；文件名以下均相对 `vendor/rhinelabui/`：

| 文件 | 要求条目 | 当前接入及必要性 |
| --- | --- | --- |
| `src/main.ts` | §3.3、§3.6、§4.2、§6.1 | film入口、白底F0、原版post-entry focus、quality映射及离线声音；字体与双GLB完成后，frame(0)结束才ready。非film沿用原入口。 |
| `src/scene.ts` | §3.2、§4.2 | 共享assembly GLB Promise以供film资源加载；查看器仍在打开时克隆原模型；GPU门控位于状态更新之后，跳绘时使绘制缓存失效。 |
| `src/model-viewer.ts` | §3.2 | 仅门控composer/renderer绘制，保留原查看器创建、分组、生命周期、控制与状态更新。 |
| `src/shared-depth.ts` | §3.2 | 为AO、深度override和Bokeh三个只绘制的pass添加GPU门控。 |
| `src/wallpaper.ts` | §3.3 | film=1时isWallpaper为false，不启用壁纸宿主。 |
| `src/audio.ts` | §3.3、§3.4、§6.1、§6.5 | 音频统一通过原发声入口，注入BaseAudioContext和now()；film自动播放不创建实时输出，手动模式按宿主开关恢复；OfflineAudioContext使用原合成、三轨配乐、增益、声像和采样排程；暴露离线渲染及实际声部事件记录。 |
| `index.html` | §3.1、§3.5 | 在应用包之前同步加载clock-shim.js；manifest、图标使用相对public路径。 |
| `vite.config.ts` | §3.5、§5 | base为./、publicDir为false、outDir指向app、emptyOutDir为false；模型映射使用原public文件名，Novecento存在性从app资源目录判断，保证运行资源只存一份。 |

新增文件：

| 文件 | 要求条目 | 当前接入及必要性 |
| --- | --- | --- |
| `film/clock-shim.js` | §3.1、§4.2及同钟对照授权 | film模式安装60Hz驱动/实时虚拟时钟、固定日期、mulberry32随机数及Web Animations/CSS动画采样。显式opt-in `__filmClockRequested` / `__filmClockStartFrame` 供只读原版CDP使用相同F0/60Hz时钟对齐；正常film起点仍为0，不改变其行为。 |
| `film/app.ts` | §3.3、§4.2 | ready、字体/双GLB/首帧进度、原rhine.stats与页签/查看器状态及失败传播，不添加UI。 |
| `film/sequence.js` | §4.3、§4.4 | 提供自然开场后的A/B动作、九个标记、键盘/点击/拖拽派发及状态快照；横竖使用相同动作时刻。仅有film时钟时临时使programmatic focus附focusVisible:false，避免合成指针继承键盘焦点外框；cancel进入手动时恢复原生focus，不修改原CSS或事件处理器。 |
| `film/render-audio.mjs` | §6.1 | 驱动完整胶片，在注入的OfflineAudioContext渲染48kHz双声道WAV，并以libvorbis q=6编码完整OGG音轨。 |
| `build.mjs` | §3.5、§5 | 清理上次Vite index与带哈希JS/CSS，保留原public资源；--sync-assets同步全部运行时资源；构建后将产物CSS的/fonts/解析为../fonts/，复制clock/sequence并输出产物清单及大小。上游src/fonts.css保持原样。 |
| `scripts/patch-rolling-number.mjs` | §5必要补充 | 按上游原字节复制package.json既有postinstall调用的安装脚本，使npm ci完成与上游一致的依赖补丁。 |
| `UPSTREAM.md` | §2、§3 | 记录固定上游来源、快照边界与当前逐文件接入清单。 |

依赖在 `vendor/rhinelabui/` 中由上游 package-lock 锁定。`npm run build:archive` 生成 app 构建产物；站点构建直接使用入库产物，不依赖重新构建上游应用。静态站点部署目录包含 app，源码快照 vendor 不进入 dist。

## 胶片驱动

舞台支持横屏 1920×1080 与竖屏 1080×1920，iframe 的实际宽高恰好等于舞台尺寸。原版 `viewport-layout.ts` 根据宽高比选择布局：低于 1.05 为 portrait。外层通过 `app/index.html?film=1&quality=<q>` 加载应用；quality 对应上游已有四档预设，默认 original。

外层在首次iframe加载前以临时WebGL canvas识别SwiftShader、llvmpipe、Software或Microsoft Basic Render；软件GL且URL未显式指定quality时使用原版performance预设，显式quality始终优先，__motion提供只读quality与softwareGL供验证。

加载阶段完成字体、双GLB与白底首帧；WebGL程序按原版首次绘制路径创建，查看器在打开时创建。条目renderer:gpu声明smoke/capture使用独立GPU浏览器，核验并打印实际renderer，实际软件渲染判失败；其他条目保持默认环境。

外层以原生performance.now和独立墙钟累加器维护胶片时间，timeline的render、seek、play、pause、on(fn)与setRate读取统一时间。播放每个host RAF取target=floor(wall*60)，完整更新全部中间状态步并跳过中间GPU绘制，只绘制目标步；不设30步推进上限。pause冻结当前实际frame/60并清除播放队列；pause与seek递增播放请求序号，异步重建后仅最新且未取消的请求能够startPlay。seek与离线render路径保持原固定步重建和目标帧绘制，seek的Promise等待目标步完成。

seek/play可以返回Promise；smoke等待seek(0)和play()完成后，再记录起始时刻并执行原1500ms播放窗口与0.5s推进门槛。

胶片时刻以 1/60s 为固定网格，输入目标量化为 `round(t*60)`。虚拟时钟在每步中先按到期顺序执行定时器，再执行一轮 RAF。日期纪元为 2026-01-01T00:00:00Z，随机数使用种子 0x5EED 的 mulberry32。前进定位跳过中间 GPU 绘制并保留所有状态更新，在目标步绘制；后退或手动操作后的定位重新加载 iframe 并从零步进。连续 seek 合并为最后一个目标，加载期间报告 `motion:loading`。

胶片输入期间，仅当iframe存在film虚拟时钟时，对原有programmatic focus临时附加focusVisible:false，使合成指针不会继承键盘可见焦点样式；原CSS和事件处理器保持不变。退出胶片输入时恢复原生focus。

暂停时的真实键盘、鼠标或触摸输入进入手动状态，应用时钟跟随真实时间，交互保留原版功能。下一次播放或定位重建胶片。画幅切换以另一尺寸重新加载 iframe 并恢复当前时刻。

开场从白底第一帧自然运行，不发送输入，不跳过，不加速。A 为驱动模式中应用首次进入 detail 的固定步时刻，向上取整至 0.1s；B=A+27.6s，整部 duration=A+42.6s。实测 A=35.0s（第2100步），阵列视觉阶段在22.0s（第1320步）开始；B=62.6s，duration=77.6s。来源：[opening.json](../../dev/shots/T5r/opening.json)。阵列视觉阶段开始时 mode 仍为 boot，首次 detail 自然读取 X-001。

| 相对时刻 | 输入 |
| --- | --- |
| A+7.5s / +10s / +12.5s | 研究记录 / 访问日志 / 概述页签。 |
| A+14s / +15.7s / +17.4s | 打开查看器 / 磨砂 / 清晰。 |
| A+19.1s | 拆解档案。 |
| A+20.9s 至 +21.9s | 从查看器画布中心拖拽，40 步，每步 25ms；每步位移 x=舞台宽×6/1600、y=舞台高×1/900。 |
| A+22.5s / +23.35s / +25.15s | 复位 / 重组 / 关闭查看器。 |
| A+25.6s | Escape 返回阵列。 |
| B / +1s | ArrowDown 两次。 |
| B+2s / +3s / +4s | ArrowRight 三次。 |
| B+5s / +6s / +7s / +8s | ArrowUp、ArrowUp、ArrowDown、ArrowDown。 |
| B+9s / +9.35s / +10.4s / +11.4s / +12.4s | ArrowLeft 三次，再 ArrowUp 两次。 |
| B+15s | 胶片结束。 |

标记为开场、档案阵列、自动读取、页签、360° 查看器、拆解、重组、返回阵列、四向浏览。各标记绝对时刻为0、22.0、35.0、42.5、49.0、54.1、58.35、60.6、62.6s，来源为 `film/sequence.js` 与实测 `opening.json`。


横竖画幅的浏览轨迹一致，实际结果见 [sequence.json](../../dev/shots/T5r/sequence.json)。表中列与行使用原版界面的一基编号：

| 胶片时刻 F | 输入 | 实际选中 | 列 / 行 |
| --- | --- | --- | --- |
| 62.6s | ArrowDown | X-006 | 03 / 02 |
| 63.6s | ArrowDown | X-013 | 03 / 03 |
| 64.6s | ArrowRight | X-004 | 04 / 01 |
| 65.6s | ArrowRight | X-008 | 05 / 01 |
| 66.6s | ArrowRight | X-002 | 01 / 01 |
| 67.6s | ArrowUp | X-022 | 01 / 08 |
| 68.6s | ArrowUp | X-021 | 01 / 07 |
| 69.6s | ArrowDown | X-022 | 01 / 08 |
| 70.6s | ArrowDown | X-002 | 01 / 01 |
| 71.6s | ArrowLeft | X-008 | 05 / 01 |
| 71.95s | ArrowLeft | X-004 | 04 / 01 |
| 73s | ArrowLeft | X-013 | 03 / 03 |
| 74s | ArrowUp | X-006 | 03 / 02 |
| 75s | ArrowUp | X-001 | 03 / 01 |

66.6s 的右移完成列05→01，71.6s 的左移完成列01→05；67.6s 的上移完成行01→08，70.6s 的下移完成行08→01。73.0s 返回第03列时恢复该列记忆的 X-013，75.0s 回到 X-001。两种画幅均记录到上述循环，浏览器错误均为0。

## 声音生成与播放

`film/render-audio.mjs` 通过无头浏览器加载 `?film=1&audio=offline`，向上游音频注入长度为整部 duration 的 OfflineAudioContext。音频 now() 返回胶片时刻；驱动器以固定步完成全部动作，中间跳过 GPU 绘制，所有声音按胶片时刻排程。随后 startRendering() 输出 48kHz 双声道 WAV，由 ffmpeg 的 libvorbis、q=6 编码为 `demos/cases/archive-os/film-audio.ogg`。配乐、合成算法、采样、音量和声像均来自上游 `audio.ts`。

外层通过 `MotionKit.audio.attach` 挂单个完整音轨事件，事件带 duration、`resume:true` 与 music 总线。函数音色使用 `dsp.sample` 和 offset 播放同一解码音轨；播放、暂停、跳转与 `renderWav` 走 kit 的统一链路，主链路保留 -1dBFS 天花板。站点关闭声音时 kit 静音，手动状态同时关闭应用自身 sound 与 music 偏好，打开时恢复。

入库音轨为77.6s、48kHz、双声道Vorbis，libvorbis q=6，文件大小1,333,228字节。已核对106个发声事件，其中10个开场cue、71个逐字输入短音、25个交互音；三轨配乐与声像核对见 [verification.json](../../dev/shots/T5r/audio/verification.json)，编码规格见 [ffprobe.json](../../dev/shots/T5r/audio/ffprobe.json)。

三轨配乐为上游原创程序编配，逐字输入使用原 PV 约 6.864–6.986s 的三个 38ms 短音。原音与衍生片段不属于原创配乐的 MIT 授权范围，来源见 `vendor/rhinelabui/licenses/audio/README.md`。

## 许可与署名

上游作者创作且有权授权的内容采用 MIT，署名为 Copyright (c) 2026 LBEILC；PR15 署名保留 LBEILC / RhineLabUI、PacificSauryMan 及原文辅助工具说明。MiSans、Rolling Number 等第三方资源遵守各自许可证。

MIT、PR15、MiSans NOTICE、Rolling Number、音频来源及上游 README 的第三方权利原文集中在 [LICENSES.md](../../demos/cases/archive-os/LICENSES.md)。MiSans PDF 位于 [app/fonts/MiSans-license.pdf](../../demos/cases/archive-os/app/fonts/MiSans-license.pdf)。

本案例为 RhineLabUI 的移植，属非官方作品；《明日方舟》及莱茵生命相关名称、标志、设定、原片与原片音频采样的权利归各自权利人所有。

## 验证记录

本记录的源码事实已由本地只读上游与 vendor 快照核对；档案数据核实为四十份、五列各八份。驱动使用真实 Intel Iris Xe / ANGLE D3D11；22.0s阵列视觉阶段、35.0s首次detail、横竖双向循环及浏览器错误0的证据分别保存在 `opening.json` 与 `sequence.json`。LICENSES.md 的 MIT、MiSans NOTICE、Rolling Number、PR15 与 README 两段第三方说明已与只读上游原文比对一致。

驱动实测的 A、阵列视觉阶段时刻、duration、选中项、34 张逐拍对照、seek 确定性、性能、ready/download、三次专用 smoke、全量 smoke、构建、预览、MP4、音频和手动模式，统一以 [T5r 报告](../../dev/reports/T5r.md) 的实际结果与证据路径为准。本文件不将尚未执行的验收项记为通过。
