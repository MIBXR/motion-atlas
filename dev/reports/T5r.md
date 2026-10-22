# T5r：RhineLabUI 移植与验收报告

**本轮剩余验收全部完成：原样单项smoke连续3/3、全量47/47、GPU确定性120条路径、竞态4/4、GPU capture及build/check/build:site均通过。** smoke仅在播放推进检查中依次await seek(0)、play()后读取t0；1500ms窗口、0.5s推进门槛及全部超时不变。预热已全部撤回，画面复原；条目GPU声明及软件GL自动performance选择保留。

完整音轨、许可、原original同钟34图及两段MP4保留。撤回后的三帧与预热前同版本基准缩略MAD均0；按本轮MP4复用条件无需重渲。历史的无声明硬件适配器smoke不能替代本轮由条目声明选择GPU的测试。

采用用户替换后的完整自然开场：阵列视觉阶段 **22.0s**；首次进入 detail **A=35.0s**；**B=62.6s**；**duration=77.6s**。开场到 A 没有派发输入，没有新增 Enter 读取拍。

工作树为 `feat/archive-os-port`，HEAD 保持 `cb2249cc468d081b5c2d5891387e45d381e6ac86`，未 commit、push 或切分支。上游固定为 `12cc5e4013acb9408f753ff71de6b8492299b7c8`。只读原版和参考副本均未修改。本次4323服务及测试浏览器已关闭；未操作4321、4322或其他工作树进程。

## 当前决定：撤回预热，条目声明GPU

“验收环境由默认软件GL改为条目声明的GPU环境”是主任务本轮重新权衡后的决定：默认软件GL必须通过是主任务加的条件，完整3D应用在SwiftShader下速度不足；预热反而改变了F23.28阴影，并让硬件ready从约1.2s增至14.4s。本轮依此撤回全部预热，保留pause/seek请求取消和软件GL无显式quality时的performance降级。下节保留预热尝试、前后测量与撤回依据，不保留为运行时方案。

已删除film/warm-renderer.ts、1×1绘制、隐藏viewer创建/缓存、全部预加载compile、shaders进度/metrics及UPSTREAM登记；viewer恢复原版按打开时创建与分组，仅保留GPU跳绘门控。entry增加renderer:gpu；smoke/capture为此条目独立启动指定GPU参数浏览器，普通条目配置不变。输出实际UNMASKED_RENDERER_WEBGL，若四类软件关键词匹配则明确失败，不跳过。docs/pipeline已补字段说明；hardware-browser仅用于MP4。

### 画面与MP4复原确认

声明GPU环境下实际Iris Xe D3D11、quality original，ready1366.804ms，shaders metrics为空；F23.28/F36/F50与预热前baseline的64×36 RGB MAD均0。三张拼图均实际打开检查，早期阴影、detail和viewer对应。见[撤回测量](../shots/T5r/shader-after-rollback-gpu/result.json)、[对照索引](../shots/T5r/shader-rollback-parity/results.json)。现有MP4由预热前版本渲染，本轮仅撤回该副作用、保留非渲染的请求取消与测试声明；按验证7复用原MP4，不重渲。

### 原样smoke：等待异步启动后连续三次通过

执行子进程命令原样为node scripts/smoke.mjs --only archive-os --strict-fonts --base http://localhost:4323，没有--import，NODE_OPTIONS未设置；GPU参数由entry声明在smoke内部追加。

| 轮次 | 结果 | 耗时 | 实际renderer |
| --- | --- | ---: | --- |
| 1 | 1/1通过 | 30.972s | 横竖均为ANGLE Intel Iris Xe Direct3D11 |
| 2 | 1/1通过 | 29.691s | 横竖均为ANGLE Intel Iris Xe Direct3D11 |
| 3 | 1/1通过 | 32.343s | 横竖均为ANGLE Intel Iris Xe Direct3D11 |

三份UTF-8日志均已覆盖为本轮通过结果，实际renderer字符串为 `ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x0000A7A0) Direct3D11 vs_5_0 ps_5_0, D3D11)`。见[执行清单](../shots/T5r/smoke-series.json)、[完整运行日志](../shots/T5r/await-smoke-series.log)、[第1次](../shots/T5r/smoke-1.log)、[第2次](../shots/T5r/smoke-2.log)、[第3次](../shots/T5r/smoke-3.log)。

前轮失败机制位于当时的smoke.mjs:116–120：sweep连发seek后，117行同时发出seek(0)、play()但不await它们，118行立即开始1500ms计时。外层script.js:122–127则在异步重建完成后才设playStarted并实际play，因此重建占用了检测窗口。独立单次诊断保持同样参数、浏览器与调用顺序，测到横屏request→play570.3ms、窗口推进0.933333s；竖屏等待678.0ms、推进0.833333s。两者均实测Iris Xe/original。见[gpu-play-timing/result.json](../shots/T5r/gpu-play-timing/result.json)。这轮诊断没有复现0.1667数值，不作为验收重跑；它直接验证启动等待消耗窗口。失败轮没有事件级trace；根据time getter从实际playStarted计时的公式，0.1667读数意味着该轮实际播放仅约0.167s，约1.33s的启动等待是推导值，不冒称直接测量。

上述时序问题已按plan-fix-6批准修正：smoke的播放检查只改为依次await seek(0)、await play()后读取t0，随后才开始原1500ms窗口；0.5s推进门槛与全部timeout未变。同步函数返回非Promise值时同样可await。docs/pipeline已说明该协议。前轮第1次28.795s通过、第2次43.062s推进0.1667s失败的记录保留在[gpu-declaration-smoke-series.log](../shots/T5r/gpu-declaration-smoke-series.log)，不以已覆盖的smoke-{1,2,3}.log作为旧失败证据。

### 本轮最终验收

| 验收项 | 实测结果 | 证据 |
| --- | --- | --- |
| 原样单项smoke | 3/3，横竖均Iris Xe D3D11 | smoke-{1,2,3}.log、smoke-series.json |
| 规定全量smoke | 47/47，另46条目保持默认配置 | full-regression.log |
| GPU seek确定性 | 120/120路径、40/40 DOM组、80/80图像比较；横最大0.0360243/255、竖0 | determinism-gpu-final/results.json |
| 取消竞态 | 横竖play→pause、play→seek共4/4；readyDelay=0，真实重建 | play-cancel/gpu-green.json |
| GPU capture | 1/1，两张F14预览实际查看，实际Iris Xe D3D11 | capture.log、capture-visual-review.json |
| build/check/build:site | 全部exit0；check输出41个旧Demo目录的字号警告，无错误 | catalog-build-final.log、check-final.log、build-site-final.log |
| dist | 当前app827文件/36,973,475B、822原public字节一致，音轨/许可齐全，无vendor | dist-verification.json |

当前app为index-BlM3wgKX.js；生成数据与dist均已同步。没有待决定事项。现有original MP4复用依据及预热尝试测量按要求保留。

## 已撤回的着色器预热尝试与测量（竞态修复保留）

外层pause与seek递增playRequest，startPlay核验请求序号且尚未播放；内部重建完成后的旧then不再启动。专项测试在真实iframe文档替换且ready未完成时取消，readyDelay=0、无硬件适配器。红测4/4复现late start；修复后横竖pause均保持time0/frame0/playing=false，横竖seek取消后均保持time1/frame60/playing=false，4/4通过、异常0。见[红测](../shots/T5r/play-cancel/red.json)、[绿测](../shots/T5r/play-cancel/green.json)。

已撤回的预热尝试使用对应预设的主场景材质，覆盖阵列/详情、磨砂/清晰，查看器覆盖clear/frosted×assembled/exploded；compile后在1×1离屏目标上绘制，并以program.getUniforms/getAttributes完成首次使用检查，screen输出变体另行compile。它恢复材质、目标、尺寸、buffer角色、可见性及count，使主场景渲染/阴影缓存失效；viewer临时source保留program引用，实际source首次绘制后释放。shaders进度在两场景完成后报告，metrics以原生Performance mark/measure记录。以下保留该尝试的实测证据；运行时已删除这些预热流程及UPSTREAM登记。

该次测量的预热前基线为index-8mfBGjSM.js，预热版为index-DoYx7tyv.js；两者outer均已修竞态。软件测量使用默认CDP/auto实际performance；硬件测量由该轮用户§2明确授权使用适配器，实际Iris Xe D3D11/original，适配器没有用于该轮smoke。

三点测量工具在ready及各点后有截图，可能等待GPU队列；下表seek计时不包含截图等待，不能替代不截图的默认smoke性能。后面的忠实smoke顺序诊断已去掉所有截图，单独记录其阻塞。

| 环境 | ready前／后 | 预热版shaders耗时 | F23.28前／后 | F36前／后 | F50前／后 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 软件SwiftShader/performance | 2.764s／9.420s | 6.505s | 4.105s／0.818s | 0.988s／0.883s | 2.212s／0.626s |
| 硬件Iris Xe/original | 1.230s／14.436s | 12.633s | 3.556s／1.624s | 0.864s／1.714s | 3.186s／1.128s |

长程序调用阈值1000/60ms，测量getProgramInfoLog/getShaderInfoLog/getProgramParameter及首次useProgram：软件三点累计从3305.0/156.9/1659.7ms降为0/0/0，硬件从2922.6/334.4/2757.9ms降为0/0/0；加载阶段分别记录31/62次长检查。预热版被测程序检查在ready后三点的累计耗时在时钟分辨率下为0ms；这只证明这些程序检查不再阻塞，不等同于GPU工作已全部完成。证据：[测量汇总](../shots/T5r/shader-warm-comparison.json)、[软件](../shots/T5r/shader-warm-post-software/result.json)、[硬件](../shots/T5r/shader-warm-post-hardware/result.json)。

### 预热版默认命令失败的诊断

该轮无import、NODE_OPTIONS未设置的smoke首轮在seek49超时，按停止条件未执行后两轮。没有改performance预设、smoke门限或默认浏览器参数。失败输出保留在[预热版smoke归档日志](../shots/T5r/shader-warm-smoke-series.log)，不以供最终验收覆盖的smoke-1/2/3.log指代该轮证据。

忠实诊断不截图、不gl.finish，复现同样sweep/play/pause和字号采样顺序：seek49实际51.544s，frame2940单步50.987s，其余中间步最大14.4ms，最终time49/frame2940/playing=false。程序查询/日志及已包装GL绘制/上传调用均无长阻塞。见[无截图复现](../shots/T5r/shader-warm-failure-49-no-capture/summary.json)。

最后一次仅增加原生DOM/canvas计时，seek49实际56.638s，其中HTMLCanvasElement.width=240阻塞56.091s，height=120紧接着仅0.8ms；focus最大0.7ms、getBoundingClientRect最大0.3ms、getComputedStyle最大0.1ms。因此直接定位到canvas尺寸setter，而非已测shader首次使用检查。按源码，model-viewer.ts:262/627的open→resize→resizeQuality，在quality-renderer.ts:54调用setPixelRatio，Three WebGLRenderer.js:625再调用setSize，662行赋canvas.width。未抓JS stack，调用链属于源码核对，56.091s原生setter阻塞是实测事实；底层等待原因尚未证明。见[DOM定位](../shots/T5r/shader-warm-failure-49-dom/summary.json)。

该轮播放前缀还有一项未通过事实：回零重建约7.5s，play请求后的1500ms计时结束时ready=false/playing=false/time0，随后独立读到time0.05，未满足smoke推进0.5s标准。专项取消测试覆盖取消请求，不覆盖检查脚本把异步启动等待计入播放窗口的问题。

一轮诊断曾在49之前插截图，截图等待约65.347s，随后49仅0.254s；该额外等待扰动了队列，不作为忠实复现。现场保留于[受扰动诊断](../shots/T5r/shader-warm-failure-49/summary.json)。后两轮无截图诊断分别确认51.544s与56.638s，未重跑smoke求通过。进程快照初次测试前无headless浏览器root，该轮未以其他工作树负载解释失败、未终止其他工作树进程。

### 预热副作用与撤回依据

预热前后软件三个时刻的64×36 MAD均0；硬件F36/F50均0，硬件F23.28为8.450087/255，逐张查看确认预热版阵列阴影更深，stats字段却全部相同。见[六组前后对照](../shots/T5r/shader-warm-parity/results.json)及[可见差异](../shots/T5r/shader-warm-parity/hardware-23.28.png)。这超出既有微小纹理差，因此该预热版不记为视觉一致；撤回后三点MAD均0的复原证据见报告前部。

该预热版的首要源码疑点是warm composer resize重写SSAO缓存投影矩阵uniform而未保存恢复：对应版本scene.ts:165相机初始FOV34，316改fov字段为6.15；resize在879/886–889先改composer/AO尺寸，901–902才更新相机投影。SSAOPass.js:189–190/366–367复制projection/inverse，render不重写；已删除的warm-renderer.ts:39–40/53–54再次触发pass.setSize。因此可能把上游旧缓存矩阵改为相机现有矩阵。这与软件AO0无差、original早期有差吻合，但两组实际uniform值未采集，仍是源码支持的疑点。DOF没有同等证据，不归因给它。

该轮按§3.6停止：三次默认smoke未完成，指定全量、默认软件GL20×3×2及根目录build/check/build:site未执行；完成了archive Vite build及上述专项/测量。未将有副作用的预热版重渲为交付MP4，也未覆盖原正式34图。现有MP4来自预热前版本。

主任务随后决定完整撤回预热并采用条目级GPU声明，而不继续修补这条预热路径。报告前部记录该决定、画面复原证据和最终验收；此处保留尝试与失败测量，不列为当前待决定事项。

## 逐条执行对照

| 条目 | 实际执行及状态 | 证据 |
| --- | --- | --- |
| §0 | 原版源码/资源与14份CSS保持；预热副作用已撤回，三组original对照MAD0。播放检查等待异步seek/play后，原样单项三次及全量通过。 | UPSTREAM.md、shader-rollback-parity/results.json、await-smoke-series.log |
| §1 | 已读指定的上游许可、main/scene/audio/boot/model-viewer/viewport-layout/capture-readme，以及本库 pipeline、Kit 与构建验证脚本。 | [移植记录](../../docs/research/archive-os.md)、[progress.md](../wip/T5r/progress.md) |
| §2 | vendor 快照、content、指定配置／脚本／许可；public 仅放 app。未复制排除目录。补入上游原样 postinstall 必需脚本。 | [UPSTREAM.md](../../vendor/rhinelabui/UPSTREAM.md)、scope-audit.json |
| §3.1 | 60Hz driven/realtime 时钟；Date 纪元固定；mulberry32 种子 0x5EED；timer/RAF/原 Web Animations 同步。 | [clock-shim.js](../../vendor/rhinelabui/film/clock-shim.js)、[确定性](../shots/T5r/determinism-gpu-final/results.json) |
| §3.2 | scene/viewer/AO/depth/Bokeh 的 GPU 门控保留状态更新。 | 上游改动清单；120 条到达路径一致 |
| §3.3 | 仅加载字体/双GLB/白底首帧；没有预热compile、离屏绘制、隐藏viewer或shaders进度。原入口、音频和PWA隔离保持。 | main.ts、scene.ts、model-viewer.ts、film/app.ts |
| §3.4 | 原声音统一入口接受 context 与 now 注入；原算法、增益、声像、采样保持。 | [音轨核验](../shots/T5r/audio/verification.json)、scope-audit.json |
| §3.5 | Vite base='./'，保留原 public 资源名；产物字体 URL 相对化，src/fonts.css 未改。 | vite.config.ts、build.mjs、[dist 核验](../shots/T5r/dist-verification.json) |
| §3.6 | 首次iframe前临时canvas读取unmasked renderer，识别四种软件GL字符串；无显式quality时选performance，显式值优先。__motion只读quality/softwareGL已测。 | script.js、software-gl/selection.json |
| §4.1 | MotionKit 舞台 + 同尺寸 iframe；1920×1080／1080×1920；外层无自有可见 UI。 | 两种画幅全部截图、MP4、smoke |
| §4.2 | 请求序号取消修复保留；本轮GPU真实重建中的pause/seek横竖4/4复测通过，未发生延迟启动。smoke等待异步seek/play后开始计时。 | play-cancel/gpu-green.json、smoke-series.json |
| §4.3 | document keydown/keyup、data 选择器 pointerdown/up/click；40 步等比拖拽。film 焦点模态稳定，cancel 恢复原生 focus。 | [sequence.js](../../vendor/rhinelabui/film/sequence.js)、[sequence.json](../shots/T5r/sequence.json) |
| §4.4 | 完整自然开场、A/B 动作及九标记；横竖均出现横／纵循环，动作序列未变。 | opening.json、sequence.json、本报告动作表 |
| §5 | npm ci 成功；Vite 构建完成，--sync-assets 保留全量资源；清旧 hash JS/CSS/index，不删运行资源；build:archive 已加，站点构建不依赖它。 | [archive-build-final.log](../shots/T5r/archive-build-final.log)、build.mjs |
| §6.1–6.2 | OfflineAudioContext 完整驱动，48kHz 双声道 WAV → libvorbis q=6 OGG；三轨配乐及 106 声音事件。 | audio/film-audio.json、audio/verification.json、audio/ffprobe.json |
| §6.3 | Kit仍仅两处原接入，本轮未改；规定命令全量47/47通过，另46条目保持默认浏览器配置。 | audio-kit-check.json、scope-audit.json、full-regression.log |
| §6.4 | 单个 t=0、dur=77.6、resume=true、music 总线函数采样事件；offset、pause、renderWav 与 Kit 主链路通过。 | script.js、manual-audio/result.json、两段 MP4/WAV |
| §6.5 | 手动时站点静音同时关闭原 sound/music，开启恢复三轨与非零输出；自动胶片走 Kit。 | manual-audio/result.json |
| §7 | fontFloor='reference'；check 输出指定说明；smoke 实测 iframe 可见文字 × stage.scale；严格模式豁免。 | check-final.log、smoke-1/2/3.log，N=5.3px |
| §8.1 | MIT 全文、PR15、MiSans PDF/NOTICE、Rolling Number、README 指定两段及指定免责声明完整。 | [LICENSES.md](../../demos/cases/archive-os/LICENSES.md)、UPSTREAM.md |
| §8.2 | title/en/简介、四个来源、A/B 节拍及带源文件的技术事实已替换；无 FIELDWORK 条目文案。 | [archive-os.json](../../entries/cases/archive-os.json) |
| §8.3 | research 全文为架构、接入、胶片、音频、许可与验证记录。 | [research](../../docs/research/archive-os.md) |
| §9.1 | 旧34实时/34同钟图保留；本轮撤回后的F23.28/36/50与预热前基准均MAD0并逐张看图。 | shader-rollback-parity/results.json |
| §9.2 | 声明GPU/original环境20×3×2=120路径通过，40组DOM一致，80次图像比较通过；横最大MAD0.0360243/255、竖0。 | determinism-gpu-final/results.json |
| §9.3 | 最终独占GPU测量：前进11.1887×/20.8362×；回跳F30横2.363s/竖1.927s，均≤6s；ready和下载量见性能表。 | determinism-gpu-final/results.json |
| §9.4 | 原CLI、无import、NODE_OPTIONS未设置，连续3/3通过，30.972s/29.691s/32.343s；横竖实际Iris Xe D3D11。 | smoke-1/2/3.log、await-smoke-series.log |
| §9.4偏离：已纠正执行方式 | 此前smoke经NODE_OPTIONS注入hardware-browser，偏离默认命令；已删除smoke-series及regression-capture的注入，仅继承环境。本轮NODE_OPTIONS未设置、execArgv为空。原通过数字不替代本轮结果。 | smoke-series.mjs、regression-capture.mjs、software-gl/selection.json |
| §9.5 | 仅用direct-browser关闭代理的规定全量命令47/47通过；GPU按条目独立选择。 | full-regression.log |
| §9.6 | 根build/check/build:site全部exit0；dist与当前app827文件一致、822原public一致，且无vendor。 | catalog-build-final.log、check-final.log、build-site-final.log、dist-verification.json |
| §9.7 | 原样capture命令验证GPU分支，横竖F14预览均实际查看，布局正常，无空白或裁切。 | capture.log、capture-visual-review.json、两张previews/cases/archive-os*.jpg |
| §9.8 | 本轮三帧确认恢复到现有MP4版本画面，按验证7复用，不重渲。原规格/12帧查看证据保持。 | shader-rollback-parity/results.json、原render/results.json |
| §9.9 | 真实键盘切档／Enter 解密、真实点击查看器、声音开关、play 回胶片通过。 | manual-audio/result.json，failures/errors 均0 |
| §10 | 本报告区分最终通过、历史失败、实测与推断，保留预热撤回测量；最终验收完成，无待决定项。 | 本文件 |
| §11 | 撤回vendor预热；entry renderer字段、smoke/capture条目GPU分支及pipeline说明保留。本轮smoke仅增加await seek/play，再计时；Kit、lib/cdp、预设、门槛及超时未改。 | 当前文件清单及cleanup |
| §12 | 最终答复据本报告给出摘要、文件、锚点、数字、六张代表对照、两段 MP4 及需决定的问题。 | 本报告各项索引 |

## 上游与文件清单

[UPSTREAM.md](../../vendor/rhinelabui/UPSTREAM.md) 是逐文件清单。90 个原文件中 82 个工作树字节完全相同，仅以下 8 个文件有接入改动；全部改动使用 MOTION-ATLAS 标记。14 份上游 CSS 均保持原样。

| 文件 | 接入原因／要求 |
| --- | --- |
| src/main.ts | film入口、F0/post-entry focus、字体/双GLB/首帧ready、离线声音及quality映射；§3.3/3.6/4.2/6.1 |
| src/scene.ts | GPU门控、共享assembly Promise供资源加载，查看器仍按原版打开时克隆模型；§3.2/4.2 |
| src/model-viewer.ts | 仅门控GPU绘制，原版创建、分组与交互生命周期；§3.2 |
| src/shared-depth.ts | AO、深度 override、Bokeh GPU 门控；§3.2 |
| src/wallpaper.ts | film 不启壁纸宿主；§3.3 |
| src/audio.ts | context/now 注入、原发声统一入口、离线与手动输出开关；§3.3/3.4/6 |
| index.html | 首个同步 clock 脚本、相对 public URL；§3.1/3.5 |
| vite.config.ts | 相对 base、固定 outDir、publicDir=false、emptyOutDir=false、原 public 资源映射；§3.5/5 |

新增接入为vendor下build.mjs、UPSTREAM.md、film/{clock-shim.js,app.ts,sequence.js,render-audio.mjs}和指定四份许可证副本。warm-renderer.ts已删除；上游patch-rolling-number安装脚本原样保留，没有改依赖或锁文件。

交付文件范围：

- vendor/rhinelabui/：固定源码快照与构建／胶片接入。
- demos/cases/archive-os/：index/config/script/style、同步 Kit、app 827 文件、film-audio.ogg、LICENSES.md。822 份 public 原资源共35,299,556B逐字节一致；app 共36,973,475B，仅两份原 GLB。
- entries/cases/archive-os.json、docs/research/archive-os.md、两张 previews/cases/archive-os*.jpg。
- kit/motion-kit.js 仅两处；scripts/check.mjs 处理参考字号，smoke.mjs 另接入条目GPU声明并等待seek/play完成后计时，capture.mjs接入条目GPU声明；docs/pipeline.md说明GPU字段与异步协议；package.json仅build:archive。
- build 生成的 data/、agent/、prompts/ 及47个 Demo Kit副本。
- dev/reports/T5r.md、dev/wip/T5r/progress.md 与必要复验工具；dev/shots/T5r/为本地证据。原用户 plan 保留，临时检查脚本、缓存、逐帧 PNG 与日志不混入长期源码。

## 实测锚点、动作与循环

[opening.json](../shots/T5r/opening.json)：array 首次开始第1320步=22.0s；mode 首次 detail 第2100步=35.0s，向上取整仍为 A35.0。B=A+27.6=62.6，结束77.6s。原实时观察约33.97s未用来替代固定步测量。

A 前无输入。A 后7.5s等待完整抽取／对角解密／正文揭示，再按指定 notes→history→overview、viewer、frosted→clear→explode、40步拖拽、reset→assemble→close、Escape。横屏拖拽总位移288px/48px；竖屏162px/85.333px，起点均为对应画布中心，40步名义间隔25ms，由60Hz时钟派发。A+25.6=60.6s Escape，B开始方向键。

以下是两种画幅共同的实测选中；编号、列、行来自每次派发后的原应用状态，完整记录见 [sequence.json](../shots/T5r/sequence.json)。

| F | 相对 B | 动作 | 实际 ID | 列／行 | 循环或记忆 |
| --- | --- | --- | --- | --- | --- |
| 62.6前 | — | 自然读取后返回 | X-001 | 03／01 | 起点 |
| 62.6 | 0 | ArrowDown | X-006 | 03／02 | — |
| 63.6 | 1 | ArrowDown | X-013 | 03／03 | — |
| 64.6 | 2 | ArrowRight | X-004 | 04／01 | — |
| 65.6 | 3 | ArrowRight | X-008 | 05／01 | — |
| 66.6 | 4 | ArrowRight | X-002 | 01／01 | 横05→01 |
| 67.6 | 5 | ArrowUp | X-022 | 01／08 | 纵01→08 |
| 68.6 | 6 | ArrowUp | X-021 | 01／07 | — |
| 69.6 | 7 | ArrowDown | X-022 | 01／08 | — |
| 70.6 | 8 | ArrowDown | X-002 | 01／01 | 纵08→01 |
| 71.6 | 9 | ArrowLeft | X-008 | 05／01 | 横01→05 |
| 71.95 | 9.35 | ArrowLeft | X-004 | 04／01 | 快速连按 |
| 73.0 | 10.4 | ArrowLeft | X-013 | 03／03 | 起始列记忆 |
| 74.0 | 11.4 | ArrowUp | X-006 | 03／02 | — |
| 75.0 | 12.4 | ArrowUp | X-001 | 03／01 | 回起点 |

九标记依次为0开场、22档案阵列、35自动读取、42.5页签、49「360° 查看器」、54.1拆解、58.35重组、60.6返回阵列、62.6四向浏览；label与新表一致。

## 声音与手动模式

全片原始混音为77.6s/48kHz/2ch；OGG为libvorbis q=6、1,333,228B。三个配乐声部，106个声音事件=10开场+71逐字+25交互；67个输入动作与生成时记录逐字段一致，增益／声像核验通过，额外事件0。原混音峰值−14.058993dBFS、RMS−32.143453dBFS。原合成函数、前置常量及辅助段与上游相同。

外层仅一个完整采样事件挂 music，总线与−1dBFS主链路照常生效；两段完整导出记录峰值约−16.0dBFS、RMS约−34.1dBFS。30–32s的renderWav切片为48k/2ch/2s，峰值−23.146597dBFS，RMS−34.242991dBFS，clipped=0。offset30/32、暂停淡出后active=0和meter=0已验证。

最终手动记录 failures/errors 均0：真实ArrowDown由X-001到X-006、真实Enter后等待clear、真实点击viewer.ready；原版三轨有非零输出，关闭站点声音令sound/music均false、context suspended、tracks0，开启恢复running/三轨。再次play重建回clean X-001，耗时2,610.370ms。该通过结论不替代下面的实时推进同步检查。

证据：[audio/verification.json](../shots/T5r/audio/verification.json)、[manual-audio/result.json](../shots/T5r/manual-audio/result.json)、[音轨元数据](../shots/T5r/audio/film-audio.json)。

## 确定性、性能和回归

验收环境按主任务决定采用条目声明的GPU环境，original画质；最终确定性和性能结果见本节后部。软件GL默认performance的选择机制已验证；下列软件诊断与撤回测量保留为已解决阻碍的证据，不作为当前验收环境。

### 前轮软件GL诊断（预热前，竞态现已修复）

外层在创建并加载iframe之前，用临时canvas读取WEBGL_debug_renderer_info的UNMASKED_RENDERER_WEBGL；不区分大小写匹配SwiftShader、llvmpipe、Software、Microsoft Basic Render。检测后释放临时上下文。URL未给quality且为软件GL时，首个iframe URL即quality=performance；显式quality优先。__motion上的quality/softwareGL只有getter、没有setter。

[selection.json](../shots/T5r/software-gl/selection.json)使用仓库默认浏览器参数、NODE_OPTIONS未设置、execArgv为空，三项均通过：SwiftShader默认performance、显式original保持original、显式performance保持performance，两个属性均不能被Reflect.set改写。没有调整scripts/lib/cdp.mjs或smoke阈值。

预热前该轮规定命令由smoke-series以原样参数启动，不加import、不指定env覆盖：

```text
node scripts/smoke.mjs --only archive-os --strict-fonts --base http://localhost:4323
```

预热前该轮首轮exit1：window.__motion.seek(23.28)超时，smoke 0/1 passed；原始输出保留在[软件GL smoke归档日志](../shots/T5r/software-gl-smoke-series.log)，不以供最终验收覆盖的smoke-1/2/3.log指代该轮失败。

performance实测渲染设置为1536×864、ratio0.8、AA off、AO samples0、DOF0、shadows1024、transmission0.5。预设来源render-quality.ts:16–26；映射在scene.ts:660–673。该轮被测版本的prepareFilmResources在scene.ts:522–526调用compile，最终目标步的composer绘制在1814–1827；当前加载路径已不包含预热compile。

| 诊断路径 | seek(22) | seek(23.28) | 返回状态 |
| --- | ---: | ---: | --- |
| 复现smoke的sweep→seek0/play→1500ms pause→字号采样顺序 | 5.516s | 44.926s | 23.28请求后外层F68.166667、iframe第3931步/F65.516667，实际仍在推进 |
| 从未play、始终暂停，初次计时 | 1.449s | 18.402s | playing=false，第1397步/F23.283333 |
| 从未play、始终暂停，补齐着色器日志调用计时 | 5.090s | 13.469s | playing=false，第1397步/F23.283333 |

独立暂停的细分定位：最后一步占13,386.9ms，整个seek13,468.95ms；getProgramInfoLog/getShaderInfoLog共阻塞13,350.5ms，其中Optical_Diffuser的program日志读取11,243.9ms、shader日志读取1,378.8ms，合计12,622.7ms。compileShader/linkProgram提交本身约0.1ms，不能据此断言编译免费。Three的WebGLProgram.js:855–862在onFirstUse读取这些日志，等待程序初始化/编译链接完成；主要等待发生在目标帧首次使用材质程序，不是AO或DOF。没有用GPU timer单独测阴影执行时间，不声称阴影成本为0。

smoke顺序路径的另一项观察是时刻漂移：seek7.76返回时外层F7.916667；seek22返回F27.5；seek23.28返回F68.166667。结合该轮script.js:120–124中异步seek(...).then(startPlay)及113–117中的pause不取消待启动请求，可以定位到pause在重建完成前执行后，延迟的startPlay仍会启动的竞态。该轮诊断按停止条件未继续修复；已有7组同步测试只覆盖已进入playing的情况，未覆盖这个路径。该竞态现已通过playRequest取消机制修复。

该轮证据直接确认着色器初始化等待和暂停后继续推进两类问题，不能据此推断只修竞态即可满足软件GL的默认smoke时限。随后软件GL预热尝试仍失败，最终验收环境按主任务决定改为条目声明的GPU环境。

该轮进程负载按用户要求运行Get-CimInstance/CommandLine匹配headless并区分浏览器root与conhost/查询shell。复现顺序及初次暂停诊断开始时有1个外部headless浏览器root，诊断期间共2个；细分诊断开始0个、期间1个（该轮测试）、结束0个。细分诊断独占浏览器时仍有13.469s着色器初始化等待，未把失败归咎于其他工作树负载，也未终止其他工作树进程。

证据：[smoke日志](../shots/T5r/software-gl-smoke-series.log)、[复现路径](../shots/T5r/software-gl/seek-profile.json)、[初次暂停计时](../shots/T5r/software-gl/seek-paused-profile-initial.json)、[细分暂停计时](../shots/T5r/software-gl/seek-paused-profile.json)。诊断工具通过CDP临时包装计时，原调用及参数照常执行；单独等待执行完成用于测量，没有改变smoke的30s门限。一次诊断工具曾在iframe重载中读取尚未安装的clock而报错，已修正为可观察加载状态，失败记录保留为seek-profile-harness-error.json。

该轮停止点已由后续授权解除；pause/seek取消竞态已修并保留，预热版F49 canvas resize阻塞与早期AO差异随整条预热路径撤回而不再作为当前实现的待修项。最终GPU验收结果见报告前部。

最终确定性在条目声明的GPU环境、original画质、Intel Iris Xe D3D11执行：20目标×零点/片尾/固定种子随机来源×两画幅=120次采样；40组DOM状态一致，80次相对零点基准比较通过。横屏最大MAD0.0360243056/255，竖屏0；要求为<2/255。包括mode、选中、页签、viewer状态和整幅合成画面。浏览器异常0，失败0。证据：[determinism-gpu-final/results.json](../shots/T5r/determinism-gpu-final/results.json)、[运行日志](../shots/T5r/determinism-gpu-final.log)。

本轮确定性与性能均独占运行，没有与其他T5r GPU检查或视频导出并行。

| 最终独占测量 | 横1920×1080 | 竖1080×1920 |
| --- | ---: | ---: |
| 首次ready | 1,160.178ms | 746.262ms |
| 首次ready下载总量 | 13,368,555B | 13,368,357B |
| 0→77.6s前进耗时 | 6,935.584ms | 3,724.291ms |
| 前进／实时倍率 | 11.1887× | 20.8362× |
| 片尾→F30 | 2,362.922ms | 1,927.213ms |
| ≤6s要求 | 通过 | 通过 |

下载量为Network.loadingFinished.encodedDataLength累计，包括HTTP传输；是首次ready实际请求量，并非全部35.3MB资源库的大小。最终数字见[本轮结果](../shots/T5r/determinism-gpu-final/results.json)；[performance.json](../shots/T5r/performance.json)保留为前轮独占测量。

最终三次单项smoke使用原样CLI、无import、NODE_OPTIONS未设置，3/3通过；耗时30.9723775s、29.6911330s、32.3430087s。三份日志均包含横竖真实Iris Xe D3D11与参考字号最小5.3px。证据：[执行清单](../shots/T5r/smoke-series.json)、[第1次](../shots/T5r/smoke-1.log)、[第2次](../shots/T5r/smoke-2.log)、[第3次](../shots/T5r/smoke-3.log)。

随后实际执行的全量命令为：

```text
node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --strict-fonts --base http://localhost:4323
```

本轮[full-regression.log](../shots/T5r/full-regression.log)为上述规定命令的47/47通过结果，0条失败。direct-browser仅增加no-proxy-server；archive-os按entry声明独立GPU，其他46条目保持默认配置。历史全局NODE_OPTIONS硬件注入属于已纠正偏离，不以那轮47/47作为本轮通过依据。smoke-series/regression-capture均不再注入硬件；hardware-browser仅供§9.8的MP4导出。

本轮build/check/build:site均exit0，build同步4份生成数据（agent/cases/archive-os.json、agent/catalog.json、data/catalog.js、data/docs.js）。dist与当前app的827文件共36,973,475B逐字节一致，822份原public资源逐字节一致，包含音轨和LICENSES.md且无vendor。check输出archive-os参考字号说明，并保留41个旧Demo目录的字号警告，无错误。日志：[build](../shots/T5r/catalog-build-final.log)、[check](../shots/T5r/check-final.log)、[site](../shots/T5r/build-site-final.log)、[dist](../shots/T5r/dist-verification.json)。

## 34张相同时钟对照

原版仅通过CDP addScriptToEvaluateOnNewDocument注入与film实际加载文件完全相同的clock-shim.js，URL为 `/?quality=original`，没有film=1，也没有改原版源码。两端使用60Hz、2026-01-01T00:00:00Z纪元和mulberry32种子0x5EED；同一动作表在同一步号执行。证据：[parity-aligned/results.json](../shots/T5r/parity-aligned/results.json)。

原版进入页的真实点击放在F0之前：虚拟frame=-37（−616.666667ms）时点击，36步完成原版600ms加载层移除；在frame=-1调用原版公开rhine.seek(-1/60)，再走一步到frame=0，使bootStart=0、内部bootTime=5、白底开场第一帧与film相同。准备偏移为37步，不计入胶片；没有预先进入阵列、详情、查看器或replay。所有17个采样点均在精确目标步冻结后截图，采样步偏移为0；F64.1的毫秒差约7.3e−12，来自浮点表示。

对齐检查定位并修复了film入口漏掉的原版post-entry focus：上游main.ts的600ms完成回调会聚焦可见skip或mobile-entry，film分支在frame(0)后执行同样的target选择及focus。原版源文件未改、CSS未改。修复前F2/6/14可见细焦点框不同，修复后的横竖开场五个时刻MAD均为0。诊断保留在parity-aligned-probe及parity-aligned-probe-focus。

下表数值为64×36 RGB area缩略MAD，单位/255。34/34逻辑DOM、选中项、模型位置、相机位置、selectedCell与Web Animations状态相同；浏览器错误0。16张MAD严格为0，18张有非零主场景像素残差；不把逻辑相等冒充逐像素相等。

| F | 横屏对齐图／MAD | 竖屏对齐图／MAD |
| --- | --- | --- |
| 2 | [图](../shots/T5r/parity-aligned/landscape-2.png) 0 | [图](../shots/T5r/parity-aligned/portrait-2.png) 0 |
| 6 | [图](../shots/T5r/parity-aligned/landscape-6.png) 0 | [图](../shots/T5r/parity-aligned/portrait-6.png) 0 |
| 10 | [图](../shots/T5r/parity-aligned/landscape-10.png) 0 | [图](../shots/T5r/parity-aligned/portrait-10.png) 0 |
| 14 | [图](../shots/T5r/parity-aligned/landscape-14.png) 0 | [图](../shots/T5r/parity-aligned/portrait-14.png) 0 |
| 18 | [图](../shots/T5r/parity-aligned/landscape-18.png) 0 | [图](../shots/T5r/parity-aligned/portrait-18.png) 0 |
| 22.5 | [图](../shots/T5r/parity-aligned/landscape-22.5.png) 0.385272 | [图](../shots/T5r/parity-aligned/portrait-22.5.png) 0.480613 |
| 33 | [图](../shots/T5r/parity-aligned/landscape-33.png) 0.025318 | [图](../shots/T5r/parity-aligned/portrait-33.png) 0.057870 |
| 36 | [图](../shots/T5r/parity-aligned/landscape-36.png) 0.045862 | [图](../shots/T5r/parity-aligned/portrait-36.png) 0.014178 |
| 40 | [图](../shots/T5r/parity-aligned/landscape-40.png) 0.035012 | [图](../shots/T5r/parity-aligned/portrait-40.png) 0.010417 |
| 44 | [图](../shots/T5r/parity-aligned/landscape-44.png) 0.036024 | [图](../shots/T5r/parity-aligned/portrait-44.png) 0.010417 |
| 50 | [图](../shots/T5r/parity-aligned/landscape-50.png) 0 | [图](../shots/T5r/parity-aligned/portrait-50.png) 0 |
| 55 | [图](../shots/T5r/parity-aligned/landscape-55.png) 0 | [图](../shots/T5r/parity-aligned/portrait-55.png) 0 |
| 59 | [图](../shots/T5r/parity-aligned/landscape-59.png) 0 | [图](../shots/T5r/parity-aligned/portrait-59.png) 0 |
| 64.1 | [图](../shots/T5r/parity-aligned/landscape-64.1.png) 0.409578 | [图](../shots/T5r/parity-aligned/portrait-64.1.png) 0.163628 |
| 67.1 | [图](../shots/T5r/parity-aligned/landscape-67.1.png) 0.398293 | [图](../shots/T5r/parity-aligned/portrait-67.1.png) 0.161458 |
| 72.1 | [图](../shots/T5r/parity-aligned/landscape-72.1.png) 0.403356 | [图](../shots/T5r/parity-aligned/portrait-72.1.png) 0.158709 |
| 75.6 | [图](../shots/T5r/parity-aligned/landscape-75.6.png) 0.416522 | [图](../shots/T5r/parity-aligned/portrait-75.6.png) 0.162182 |

横屏平均0.126779、最大0.416522；竖屏平均0.071734、最大0.480613。逐张视觉审阅与主场景像素残差的代码定位见本节补充证据。

18张非零残差的共同原因已做代码层隔离：`src/scene.ts:320`构造SharedDepthAO，继承Three的SSAOPass；依赖内`examples/jsm/postprocessing/SSAOPass.js:436`的核生成在443–445行读Math.random，463行创建SimplexNoise，470–471行继续生成噪声；`three/src/math/MathUtils.js:21`起每个UUID消耗四个Math.random值。只读记录包装观察到主核实际上传的96个Float32分量不同，首向量为dev参考[-0.08937918,-0.03679786,0.02563744]、film[-0.05145004,-0.02930215,0.08058707]，而非模型位置不同。

两次独立原版dev加载的kernel/noise原始随机数组彼此逐项相同，两次film也各自逐项相同；dev主核从第533次随机调用开始，film从517开始，noise分别629与613。分流发生在首次AO构造、进入页和预加载前，来自dev ESM保留的四个Three UUID初始化，合计16次。**这是开发／生产构建环境的确定性差异，不把它描述成异步解码或随机漂移。**

四个UUID的具体来源为Three的`src/objects/BatchedMesh.js:90`顶层纯new Mesh()所创建的默认BufferGeometry（`core/BufferGeometry.js:81`）、默认MeshBasicMaterial（`materials/Material.js:50`）和Mesh自身Object3D（`core/Object3D.js:97`），以及`src/helpers/CameraHelper.js:11`顶层纯new Camera()的Object3D。生产构建移除这两个未使用类的纯顶层辅助对象；原版dev缓存调用栈和原production对照共同确认该分流。

进一步以未改源码的原版标准Vite生产构建核对：原版production与film均从第517次开始生成96个核随机值、从613次开始生成296个noise生成调用输入，数组逐项完全相同，浏览器错误0。296包含Simplex初始化及纹理UUID的随机调用，不是4×4纹理的16个像素值。故没有为匹配dev采样纹理修改原SSAO算法、种子、画质、材质或视觉参数。保留的是原任务允许的噪声纹理差；这18张不能称为零像素差。查看器走`src/quality-renderer.ts:77`的RenderPass/SMAA/OutputPass管线，没有主场景SSAO，F50/55/59六图MAD均0。

直接证据：[定位结论](../shots/T5r/ssao-conclusion.json)、[实际上传](../shots/T5r/ssao-probe/results.json)、[独立加载1](../shots/T5r/ssao-random-1/results.json)、[独立加载2](../shots/T5r/ssao-random-2/results.json)、[原版production核对](../shots/T5r/ssao-random-production-verified/results.json)。这些探针不改变随机返回值，不改原版源文件，测试缓存及构建产物位于T5r证据目录。production首次探针的辅助字体准备曾fetch未发布的/content/archives.json失败，后由测试表达式嵌入同一只读JSON；没有替换应用模块或改变RNG调用。

production构建与preview均显式configFile:false，cacheDir/outDir置于T5r；不调用Vite配置loader，不在参考副本node_modules/.vite-temp写入配置缓存。调用见`dev/wip/T5r/parity.mjs:234`。

## 34张实时参考，存在相位差

此组保留为“实时参考，存在相位差”。参考侧只读副本在4331真实时钟运行；F0校准后原生RAF／timer执行相同动作，无虚拟时钟注入。用原版公开操作暖机／replay后采集PNG screencast窗口；未改源文件、曲线、画质或动作。film侧为original、固定步seek。原34张reference、film及拼图保留，不用本轮对齐结果覆盖，也不将它们作为同一步号像素一致的证据。

原图102张（34reference、34film、34拼图）的尺寸均核对：横拼图3840×1080，竖2160×1920。团队将刷新后的34张拼图全部实际打开检查：横7同/10不同，竖7同/10不同，无无法判断整图。可见尺度的“同”不等于逐像素完全相等；逻辑DOM34/34一致也没有用来覆盖画面差异。

| F | 横图／MAD(/255) | 竖图／MAD(/255) | 最终可见判断 |
| --- | --- | --- | --- |
| 2 | [图](../shots/T5r/parity/landscape-2.png) 0.005208 | [图](../shots/T5r/parity/portrait-2.png) 0.028935 | 逐字进度不同 |
| 6 | [图](../shots/T5r/parity/landscape-6.png) 0.362847 | [图](../shots/T5r/parity/portrait-6.png) 0.301071 | 标志及布局对应 |
| 10 | [图](../shots/T5r/parity/landscape-10.png) 0.007089 | [图](../shots/T5r/parity/portrait-10.png) 0.028356 | 逐字进度不同 |
| 14 | [图](../shots/T5r/parity/landscape-14.png) 0.027633 | [图](../shots/T5r/parity/portrait-14.png) 0.048466 | 标志／START PROCESSING对应 |
| 18 | [图](../shots/T5r/parity/landscape-18.png) 0.228877 | [图](../shots/T5r/parity/portrait-18.png) 13.156105 | 欢迎文字闪烁相位不同 |
| 22.5 | [图](../shots/T5r/parity/landscape-22.5.png) 31.135417 | [图](../shots/T5r/parity/portrait-22.5.png) 24.356771 | 阵列入场位置不同 |
| 33 | [图](../shots/T5r/parity/landscape-33.png) 2.870226 | [图](../shots/T5r/parity/portrait-33.png) 4.858362 | 解密线／标签／虚化相位不同 |
| 36 | [图](../shots/T5r/parity/landscape-36.png) 2.150608 | [图](../shots/T5r/parity/portrait-36.png) 0.769097 | 提起姿态不同 |
| 40 | [图](../shots/T5r/parity/landscape-40.png) 0.085648 | [图](../shots/T5r/parity/portrait-40.png) 0.031973 | 透明模型／概述对应 |
| 44 | [图](../shots/T5r/parity/landscape-44.png) 0.083912 | [图](../shots/T5r/parity/portrait-44.png) 0.029369 | 研究记录／透明模型对应 |
| 50 | [图](../shots/T5r/parity/landscape-50.png) 0 | [图](../shots/T5r/parity/portrait-50.png) 0 | 查看器相同 |
| 55 | [图](../shots/T5r/parity/landscape-55.png) 0.036603 | [图](../shots/T5r/parity/portrait-55.png) 0.015046 | 六组拆解对应 |
| 59 | [图](../shots/T5r/parity/landscape-59.png) 0.029514 | [图](../shots/T5r/parity/portrait-59.png) 0.002894 | 重组对应 |
| 64.1 | [图](../shots/T5r/parity/landscape-64.1.png) 11.572193 | [图](../shots/T5r/parity/portrait-64.1.png) 3.648438 | X-013对应，阵列位置不同 |
| 67.1 | [图](../shots/T5r/parity/landscape-67.1.png) 9.823640 | [图](../shots/T5r/parity/portrait-67.1.png) 3.773727 | X-002对应，阵列位置不同 |
| 72.1 | [图](../shots/T5r/parity/landscape-72.1.png) 10.480469 | [图](../shots/T5r/parity/portrait-72.1.png) 3.393374 | 可见编号／列／标题及阵列状态不同 |
| 75.6 | [图](../shots/T5r/parity/landscape-75.6.png) 9.746672 | [图](../shots/T5r/parity/portrait-75.6.png) 3.059172 | X-001对应，阵列位置不同 |

64×36 RGB area缩略MAD：横均4.626268/255、最大31.135417；竖均3.382421、最大24.356771。最终源数据：[parity/results.json](../shots/T5r/parity/results.json)；实际评阅：[横](../shots/T5r/parity/visual-review-landscape.json)、[竖](../shots/T5r/parity/visual-review-portrait.json)。

F72.1横图仍可读到左X-006、右X-005的滚动显示差；竖图左为05特别项目／边界之外，右为04能量研究／能量转换，右编号末位正在滚动，不可靠地当作稳定ID读取。配对的隐藏DOM值相同不证明这些可见帧一致。

实测参考主场景约横12–15fps／竖10–13fps，参考图片采样偏移约−71.5至+43.5ms；nearest RAF状态与compositor PNG不保证同一显示帧。source/scene.ts保留dt上限0.05、damping与绝对time的idleWave，固定60Hz与原生可变RAF也可能产生相位／积分差异。**这些是依据源码、FPS、采样边界作出的解释性推断，不是剩余20图等价的证明**。不能把它们都归入时钟数字／噪点／景深随机纹理豁免。

## 实时播放同步测量

批准后的实现位于外层 `demos/cases/archive-os/script.js`：每个宿主RAF以墙钟累计量计算目标步，先以GPU跳绘推进所有中间状态步，再正常绘制目标步。没有30步上限，没有丢弃输入或状态步。pause同步读取当前iframe实际frame，以frame/60冻结外层时刻，并将追赶目标改为当前步。seek、render模式的帧网格和输出协议保持一致。

正式测量由Node独立等待五秒后经CDP调用pause，避开页面自身timer与WebGL调用共用事件循环的计时误差。使用original画质、Intel Iris Xe / ANGLE D3D11；每组pause后记录两边时钟，重新seek 0重建，再seek回该暂停时刻比较DOM、输入日志与64×36缩略图。证据：[wall-play-cdp-final/result.json](../shots/T5r/wall-play-cdp-final/result.json)。

下列是此前获准的硬件同步测量命令，其结果用于实时播放同步要求；本轮smoke和确定性使用条目声明的GPU环境，当前hardware-browser仅供MP4导出。

```text
node --import ./dev/wip/T5r/tools/hardware-browser.mjs dev/wip/T5r/wall-play-grid-check.mjs --timer cdp --out dev/shots/T5r/wall-play-cdp-final
```

| 画幅／起点 | 推进帧／秒 | 暂停外层／iframe F | pause前Node等待 | pause请求往返 | 重建DOM／输入 |
| --- | ---: | --- | ---: | ---: | --- |
| 横 F21.5 | 295／4.916667s | 26.416667／26.416667 | 5.007805s | 482.50ms | 一致 |
| 横 F40 | 299／4.983333s | 44.983333／44.983333 | 5.009012s | 2.94ms | 一致 |
| 横 F60 | 300／5.000000s | 65／65 | 5.016746s | 16.06ms | 一致 |
| 横 F60，强制RAF延期 | 300／5.000000s | 65／65 | 5.003816s | 18.05ms | 一致 |
| 竖 F21.5 | 294／4.900000s | 26.4／26.4 | 5.000320s | 198.07ms | 一致 |
| 竖 F40 | 299／4.983333s | 44.983333／44.983333 | 5.002651s | 8.67ms | 一致 |
| 竖 F60 | 297／4.950000s | 64.95／64.95 | 5.013300s | 6.43ms | 一致 |

7/7满足推进4.9–5.1s及两时钟差≤1/60s；重建MAD最大0.0043403/255，要求<2/255；浏览器异常0。额外长停顿实测664.2ms，连续中间跳绘38步，300状态步完整执行。4.9s下界按294个60Hz整数步判断，避免JS的26.4−21.5得到4.899999999999999；原浮点评判数据另存result-floating-boundary.json，没有重跑或放宽标准。

计时阻碍与请求延迟均保留：首轮页面setTimeout五秒停止的竖F21.5推进5.216667s，失败；定向profile重现页面timer在5.6258s才执行，推进5.566667s，GPU绘制单步最长1949.1ms而跳绘模拟最长10.6ms。独立Node/CDP profile在5.011566s发pause，往返494.05ms，冻结推进4.916667s。正式七组的Node请求时间及browser进入／返回时间均公开。运行时pause一旦执行立即冻结，但长同步WebGL调用期间浏览器不能处理新输入；上表最长482.50ms为实际观察到的请求响应延迟，未把它记成零。原失败证据：[首轮](../shots/T5r/wall-play-final/result.json)、[页面profile](../shots/T5r/wall-play-portrait-profile/result.json)、[CDP profile](../shots/T5r/wall-play-portrait-cdp-profile/result.json)。

此前逐步GPU绘制落后4.033333s的记录仍在[wall-play/result.json](../shots/T5r/wall-play/result.json)，属于获批方案实施前的失败证据，不代表当前播放结果。本测量读取逻辑时钟与浏览器截图，没有测量物理显示器scanout延迟。

## 预热前MP4与解码检查

使用 [hardware-browser.mjs](../wip/T5r/tools/hardware-browser.mjs) 添加 --enable-gpu --use-angle=d3d11 --ignore-gpu-blocklist，并确认renderer为ANGLE Intel Iris Xe Direct3D11后导出，未使用软件回退。开场focus修复后两段均已重新渲染。两段均为original、77.6s、30fps、2328帧、H.264/yuv420p、AAC/48kHz/2ch；均含声音。

| 成片 | 大小 | 完整渲染／编码／核验耗时 | ffprobe |
| --- | ---: | ---: | --- |
| [landscape.mp4](../shots/T5r/render/landscape.mp4) 1920×1080 | 24,703,468B | 1,091.4492s | [规格](../shots/T5r/render/landscape-ffprobe.json) |
| [portrait.mp4](../shots/T5r/render/portrait.mp4) 1080×1920 | 19,741,434B | 1,007.9578s | [规格](../shots/T5r/render/portrait-ffprobe.json) |

每段从MP4解码F2、14、22.5、40、55、75.6六帧，Root实际逐张打开全部12张：开场、阵列、透明X-001、六组拆解和返回X-001均有画面，无空帧／裁切错误。时间／文件／命令记录见[render/results.json](../shots/T5r/render/results.json)，评阅见[visual-review.json](../shots/T5r/render/visual-review.json)。离线成片按固定帧推进，未将实时落后写进视频时长。

## 已解决的阻碍与必要补充

| 问题 | 处理与当前状态 |
| --- | --- |
| 原方案要求mode首次archive，但自然开场会直接到detail | 用户明确完整自然开场A/B新表后实施；无Enter重复读取。 |
| npm ci缺postinstall所需上游脚本 | 原样补入patch-rolling-number.mjs后成功；无依赖升级。 |
| PowerShell npm.ps1受执行策略阻止 | 使用已验证Git Bash／Node入口，未改系统执行策略。 |
| document合成键盘事件target不是HTMLElement | 输入适配层保留document派发并令target对应activeElement；未改原键盘逻辑。 |
| 合成pointer不能取得真实pointer capture | 仅派发期间适配capture，随后还原；拖拽40步与手动原交互通过。 |
| 手动状态仍执行胶片输入timer | cancel只清胶片timer、释放虚拟拖拽并恢复native focus；原应用timer保留。 |
| 额外GPU预绘及预热改变画面 | 全部预热已撤回；F23.28/F36/F50与预热前original基准的缩略MAD均0，阴影、详情与查看器复原。预热版8.450087/255差异保留为撤回依据。 |
| 继承键盘模态出现额外焦点框 | film专用focusVisible:false，manual cancel还原原生；34刷新图确认额外框消失。 |
| 参考窗口客户区尺寸与同步截图阻塞 | 实测客户区校准和原生PNG screencast采集，最终全部尺寸正确，保留采样时间和相位限制。 |
| 0字号元素撑大容器被误算为可见glyph | Text Range高度0证实；仅reference probe排除font-size<=0，最终三次N5.3px。 |
| 初版回跳超6s／预热改法有视觉污染 | 保留历史独占GPU回跳1.977/1.802s测量；当前实现没有预热compile或离屏绘制，性能以最终验收记录为准。 |
| 原Kit播放RAF截断及每步GPU绘制落后 | 外层保留独立墙钟；按用户批准在每宿主RAF只绘制目标步，pause冻结当前实际步，7/7正式同步及长停顿无丢步通过。 |
| film漏掉post-entry焦点 | 在film frame(0)后补回原版相同target选择与focus；同钟开场五个时刻横竖MAD均0。 |
| 同钟主场景仍有非零MAD | 已证明dev ESM比标准production多4个Three UUID初始化，SSAO随机调用相差16；未改源码的原版production与film核／noise输入逐项相同，保留细微采样纹理差。 |
| 页面五秒timer被GPU长绘制延迟 | 首轮失败与profile保留；正式用Node独立五秒后CDP pause，7/7达到原标准；报告公开最长482.5ms请求延迟。 |
| smoke计时窗口包括异步seek/play重建 | 按plan-fix-6仅增加依次await后读取t0，保持原1500ms/0.5s/全部timeout；原样三次及全量47/47通过。 |

## 许可与收尾

MIT全文（Copyright (c) 2026 LBEILC）、PR15署名、MiSans许可／NOTICE、Rolling Number、上游音频README及指定第三方两段原文均已核对。版权与非官方声明见[LICENSES.md](../../demos/cases/archive-os/LICENSES.md)；本报告不扩张其授权范围。

[本轮cleanup](../shots/T5r/await-acceptance-cleanup.json)：核对4323所有者为本轮PID14056的serve.mjs后关闭；本轮所有测试命令已退出，快照中无无头浏览器root。4322/PID13636未动，4321/4331无监听；未操作其他工作树进程。NODE_OPTIONS仍未设置。未部署、未commit/push/切分支；旧cleanup保留为前轮记录。

当前源码、UPSTREAM登记、条目GPU声明、脚本、生成数据和文档已保存并暂存；用户计划与临时诊断脚本不暂存。shader-warm-check只作历史/撤回复验测量，不再是运行时预热；gpu-play-timing为临时诊断不暂存。暂存不是提交；验收依据为本轮日志和结果文件。

已执行完整git diff --cached --check：退出2，共49处格式报告，分布在生成Three.js着色器字符串21处、Vite生成index的混合换行26处，以及原package.json/workbench.ts各1处末尾空行；保留原上游／生成内容。排除vendor和app产物的自有文件检查退出0，无空白问题。证据：[final-git-check.json](../shots/T5r/final-git-check.json)、[本轮完整日志](../shots/T5r/await-acceptance-diff-check.log)、[本轮自有文件日志](../shots/T5r/await-acceptance-owned-diff-check.log)。这项格式报告没有写成全仓库零告警，也未清理原版代码或着色器字符串来制造通过。

原34张实时参考、34张同钟对照、原资源及现有MP4保留。全部预热已撤回且三帧MAD0，竞态修复保留；本轮仅修正smoke等待顺序，3次单项、全量47/47、120路径确定性、竞态4/4、capture及构建全部通过，无未完成验收或需用户决定的问题。已知限制为GPU验收声明、开发/生产SSAO纹理的18张非零微小MAD、旧Demo字号警告及同步WebGL调用期间的输入响应延迟，证据和边界均已在对应章节列明。
