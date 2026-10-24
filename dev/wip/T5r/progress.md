# T5r 移植进度

- 2026-10-22：核实 feat/archive-os-port / cb2249c、上游 12cc5e4；读取规定接口，保留现有 plan.md，未提交、推送或切换分支。
- 2026-10-22：按 §2 复制源码、content 与许可至 vendor；全部 public 运行资源只复制到 app，未复制被排除目录。
- 2026-10-22：核实普通 Web 开场内部 35s 自然进入 detail，未自然进入 archive；依 §0 停止依赖 E 的入口、胶片及音轨实现，待用户决定开场落点。
- 2026-10-22：完成 §6.3 两处 kit 改动与真实 OfflineAudioContext 验证，sample 双声道 0.125、函数 resume offset=1；完成 47 份 kit 副本同步与 48 份派生文件更新。
- 2026-10-22：完成 §7 检查器 reference 支持（条目尚未启用）与 §8.1 许可汇总，原文逐项核对一致；检查器语法检查通过。
- 2026-10-22：4331 只读原版实跑，trace 仅 boot/detail，首次 detail 观察在启动后 33.9663s；boot 中真实 ArrowDown 被忽略，Escape 后进入 archive；原版服务与诊断浏览器已关闭。
- 2026-10-22：逐字节核对 89 个上游源码文件、822 个 public 文件、4 个许可副本，差异均为 0；资源共 35,299,556 字节。
- 2026-10-22：node scripts/build.mjs 通过；checkpoint 的 check 因 app/update.html 三处上游字号失败，reference 条目开关待 iframe 接入；全量 smoke 回归进行中。
- 2026-10-22：全量严格 smoke 47/47 通过，耗时 526.007s；静态构建脚本通过，耗时 28.287s，dist 包含 app 资源且不含 vendor，但尚无 app/index.html；语法检查及 git diff --check 通过。
- 2026-10-22：报告 dev/reports/T5r.md 已完成；已关闭本次全部服务与浏览器，4323/4331 无监听，保留原 4321/4322。停在 E 决策点：用户选定完整开场后追加 Escape，或明确授权阵列入场时转 archive 后，再从 §3 继续实现与验收。
- 2026-10-22：用户给定新的自然开场 A/B 时间表，继续完成 §3–§10；保留全部自动选择、抽取与 detail，不派发 Enter 读取。
- 2026-10-22：完成原版 film 入口、跳绘制门控、资源预加载、虚拟时钟与统一输入序列；npm ci 因缺上游 postinstall 脚本失败，原样补入 patch-rolling-number.mjs 后 npm ci 成功。
- 2026-10-22：固定步实测 array 第1320步=22.0s、detail第2100步=A35.0s，B62.6s、duration77.6s；Intel Iris Xe Direct3D11 硬件 GPU 已确认，opening.json 无运行时异常。
- 2026-10-22：横竖完整序列通过，实际初始X-001，05→01横循环与01→08→01纵循环均出现；修复document键盘派发的目标元素语义，未改原键盘处理器，sequence.json 两种画幅均无异常。
- 2026-10-22：整片原版音轨生成及事件验收通过，77.6s/48kHz/双声道Vorbis q6；三轨配乐与106声音事件匹配，遗漏0、额外0，OGG为1,333,228字节，WAV与验收记录位于dev/shots/T5r/audio/。
- 2026-10-22：外层替换完成，真实ready后可seek到开场、阵列、页签、查看器/拆解/重组及返回；静态build/check通过。手动测试发现未取消胶片timer会干扰真实交互，已限定取消胶片输入并释放虚拟拖拽，保留应用timer；正在复核声音开关与恢复。
- 2026-10-22：真实键鼠手动验收通过，X-006读取自然解密至clear后打开查看器；原三轨有声、站点静音双偏好false/上下文挂起、开启恢复三轨，play重建回X-001；外层单事件及renderWav、offset接续、pause/seek静音均通过，manual-audio/result.json无失败/异常。
- 2026-10-22：横屏20时刻×3来源确定性通过，DOM60/60、像素60/60，最大MAD0.031684/255；首次性能回跳超6s。经CPU采样确认不可见初始3D预绘耗时，改为1×1离屏着色器预热后恢复原始尺寸，横屏回跳30s实测4.035s、前进12.449倍、首次ready5.329s，后续像素回归进行中。
- 2026-10-22：条目、research、UPSTREAM及报告底稿已同步A/B锚点、14次实际选中与逐文件接入清单；参考冷采集受首次GPU编译及同步截图阻塞，保留失败证据，改为原版同文档暖场后原生实时PNG screencast采样，未改参考源码或F0后输入表。
2026-10-22T03:33:14.806Z：完成最终compile-only准备与film焦点方案的文档同步：UPSTREAM/research记录仅预载GLB+renderer.compile，保留21.9s真实首绘与frame0白底ready；sequence仅film临时focusVisible:false、手动cancel恢复原生focus；报告记主模型诊断由0恢复10533/ref10528且不改材质，旧性能证据降为中间记录，等待最终横竖性能/确定性/parity复测。
2026-10-22T04:26:39.586Z：最终刷新竖屏17/17拼图已全部重新view_image实看并更新visual-review-portrait.json（same7/different10）；主模型内部结构及额外焦点框已恢复，动态相位/可见选中差异保留；research完成原生墙钟累加器稳态说明。entry、UPSTREAM、research此步冻结，可执行最终catalog/check/site构建。

- 2026-10-22：最终墙钟版确定性120次采样全部通过，横最大MAD0.037037/255、竖0；三次严格smoke及全量47/47通过，范围与822资源字节审计通过。
- 2026-10-22：横竖original带音MP4完成并分别解码检查6帧，规格均77.6s/30fps/2328帧/AAC48k双声道；耗时1052.7285s与921.3413s，产物位于dev/shots/T5r/render/。
- 2026-10-22：最终独占GPU前进12.4064x/24.3076x，片尾回F30为2.151830s/1.787273s；build/check/npm run build:site通过，dist含827个app文件、822原public全同且不含vendor。
- 2026-10-22：现场停在用户决定点：original逐步GPU绘制下应用状态落后墙钟4.033333s；真实时间parity仍14同/20不同。未自行跳过play追赶中间GPU或注入参考时钟。下一步按用户选择实施追赶策略／补充对照；报告dev/reports/T5r.md，全部证据与复验工具保留。
- 2026-10-22：已停本次4323/PID37328及全部测试浏览器；4331无监听；保留用户4321/PID23008和4322/PID22476；未commit、push或切分支。
- 2026-10-22：长期交付1055文件已暂存；完整cached空白检查49处均在上游/生成文件，自有文件定向检查0。用户计划与临时诊断未暂存；最终报告已统一更新，未提交或推送。
2026-10-22T05:43:08.220Z：主代理确认用户新决定已批准，进入外层play/clock标志实现与新对齐图、六组实时同步复验阶段。文档代理仅准备report/research同步与smoke/build收尾，复用既有许可和8源/822public审计证据；等待主代理给出精确授权边界、实际源码变更和最终结果后更新通过状态，不改产品、不启动GPU任务。
- 2026-10-22：按新批准接入每RAF目标追赶：所有60Hz步保留，中间GPU跳绘、目标步绘制；pause冻结实际帧并清目标队列。首轮6同步组与650ms追赶共6/7通过，唯一portrait21.5页面停止timer晚244.6ms导致推进5.2167s，保留并进行定向profile/CDP独立计时核对。
- 2026-10-22：共享clock增加仅测试使用的__filmClockRequested与__filmClockStartFrame，正常film仍从0开始；原版对照将经-37至0的进入页准备后，用同字节clock与同动作表对齐，不改原版源文件。

- 2026-10-22：正式独立Node/CDP五秒计时7/7通过，推进294–300帧、outer与iframe差0、暂停重建MAD最大0.0043403/255；650ms追赶连续跳绘38步且无丢步。页面timer首次失败及GPU阻塞profile均保留。对齐对照34张完成，新增补回原post-entry focus；F2/6/14 MAD归零，主场景微小残差继续定位。

- 2026-10-22：本轮三次strict smoke连续通过（27.918/27.386/27.622s），capture更新横竖；build/check/build:site全exit0，dist827文件36,973,660B与app全同、822 public原资源全同、无vendor。修复后120次seek确定性全部通过，横最大MAD0.037037/255、竖0。新横竖original MP4正在导出。

- 2026-10-22：34张同钟对照已逐张实际查看，布局/文字/选中/模型/查看器一致；16张MAD0、18张主场景采样纹理差最大0.480613/255。已定位Three dev初始化比production多4个UUID共16次random；原版未改源码production与film的96核输入及296噪声生成输入逐项同，见ssao-conclusion.json。横屏MP4重渲及ffprobe/六帧查看完成，竖屏进行中。
2026-10-22T08:15:52.887Z：aligned竖屏17/17拼图已view_image逐张审阅并落盘（可见尺度same17，不声明逐像素完全相同）；UPSTREAM/research同步当前开场同目标focus、CDP显式同钟opt-in及hostRAF追赶只绘目标帧、pause冻结实际帧并清队列机制；未改runtime/报告，稳态文档此步完成。

- 2026-10-22：两段original带音MP4重渲完成并ffprobe确认77.6s/30fps/2328帧/AAC48k双声道，12张解码帧已逐张查看。独占GPU回跳F30横1.977s/竖1.802s，前进12.416x/24.837x；文档冻结后的build/check/build:site全过。已停4323/PID13684，4331无监听、任务CDP浏览器0；保留4321/PID23008与4322/PID18064。

- 2026-10-22：最终报告已同步7组实时表、34张同钟表/SSAO源码与数组证据、新MP4与性能。最终1056项暂存路径越界0，用户三份计划与6个临时诊断脚本未暂存；报告128个链接无缺失。完整cached空白检查49处均为上游/生成格式，自有文件0；无待决定项，未commit/push/切分支，任务服务和浏览器均已停。

- 2026-10-22：软件GL识别前移至首个iframe加载前，匹配四类renderer，未显式quality时performance；__motion只读quality/softwareGL。默认SwiftShader、显式original/performance三项验证通过，NODE_OPTIONS未设置/execArgv空。
- 2026-10-22：smoke-series及regression-capture移除硬件注入，hardware-browser仅供MP4。默认命令首轮仍seek23.28超时，已记录为执行偏离纠正但验收未过，按本次第2条未跑第2/3轮、全量及默认确定性。
- 2026-10-22：诊断软件performance，smoke顺序seek23.28耗时44.926s并漂移到外层F68.1667/iframeF65.5167；独立暂停两次18.402s/13.469s，后者13.351s阻塞于材质程序状态日志读取，Optical_Diffuser占12.623s，AO/DOF均0。发现pause未取消异步seek后startPlay的竞态，未越过停止条件修复，待用户决定。
- 2026-10-22：报告已补偏离、耗时/进程快照及停止点；已停本轮4323/PID34296与诊断浏览器，保留4321/4322及其他工作树进程；下一步等待是否授权仅修待启动play取消竞态，再执行默认三次smoke/指定全量/默认确定性。

- 2026-10-22：按批准实现playRequest递增取消，真实重建中pause/seek横竖红4/4复现late start，修复后绿4/4，pause保持F0/帧0，seek取消保持F1/帧60，无延迟启动。
- 2026-10-22：新增film/warm-renderer与主场景/隐藏viewer四状态预热，shaders阶段计原生耗时，UPSTREAM/research登记。archive Vite构建成功；软件ready9.420s/shaders6.505s、硬件original ready14.436s/shaders12.633s，指定三点ready后长程序检查0。
- 2026-10-22：默认smoke首轮seek49仍超30s，按用户§3.6停止实现。忠实诊断51.544s；最后DOM定位56.638s，其中canvas.width=240原生setter56.091s，非focus/layout或已测程序查询。播放前缀重建约7.5s、1500ms后仅F0.05，亦未满足smoke。
- 2026-10-22：前后6组图已拼接，软件三点/硬件36与50 MAD0，硬件23.28 MAD8.450087/255且阴影变深；SSAO投影缓存恢复为源码支持疑点，实际uniform未采。未继续修、未重渲未通过版MP4、未跑后2次smoke/全量/默认120次/根build-check-site。
- 2026-10-22：现场待决定继续处理viewer resize阻塞、AO缓存恢复和播放重建等待；报告/源码已保存。已停4323/PID8456及所有本轮测试，其他工作树headless与用户端口未动；无commit/push/切分支。

- 2026-10-22：按主任务决定撤回全部着色器预热（1×1绘制/隐藏viewer/compile预加载/shaders进度与metrics），保留playRequest取消与软件GL降级。新增entry renderer:gpu，检查说明补字段含义；UPSTREAM/research恢复稳态登记，尝试及测量保留报告。
- 2026-10-22：撤回后GPU original实际Iris Xe/D3D11，ready1.3668s；F23.28/36/50三组与预热前baseline缩略MAD均0，已逐张看图确认阴影/详情/查看器复原。现有MP4来自同一预热前画面版本，按验证7条件复用，无需重渲。

- 2026-10-22：条目GPU声明smoke原命令无import/NODE_OPTIONS，第1次通过28.795s，第2次43.062s失败，实际横竖renderer均Iris Xe D3D11；错误为播放1500ms仅推进0.166667，非软件渲染或seek超时。按停止条件第3次/全量/声明GPU确定性/竞态复测/根构建检查未继续。
- 2026-10-22：仅诊断播放调用时序：smoke不await seek0/play就启动1500ms窗口，实际play需等重建。独立GPU两画幅测启动等待570.3/678.0ms，推进0.9333/0.8333；失败轮未采原生trace，约1.33s启动等待只是按getter公式推导，不作实测。未改测试时序或重跑验收求通过。
- 2026-10-22：当前等待是否允许smoke先await异步seek0/play再按原窗口/门槛检查；报告保留主任务环境决定、预热尝试/撤回和测量。已停本轮4323/PID11108与所有测试浏览器，用户4321/4322及其他工作树进程未动，未commit/push/切分支。

- 2026-10-22：按批准的 plan-fix-6，仅将 smoke 播放检查改为依次 await seek(0)、play() 后读取 t0；1500ms、0.5s 门槛和超时不变，pipeline 同步 Promise 协议说明。开始原样命令三次验收，NODE_OPTIONS 未设置。
- 2026-10-22：原样单项 strict-fonts smoke 连续3/3通过（30.972s、29.691s、32.343s），横竖均打印实际 Intel Iris Xe D3D11；日志已覆盖 smoke-{1,2,3}.log，未注入 import、未设置 NODE_OPTIONS。
- 2026-10-22：按规定仅 --import direct-browser（关闭代理）运行全量 strict-fonts smoke，47/47通过；archive-os独立GPU，其他46条目默认配置，播放等待顺序改动通过回归。
- 2026-10-23：条目GPU/original下完成20×3×2=120条seek到达路径，40组DOM及80次缩略比较通过，横最大MAD0.0360243/255、竖0，浏览器异常0；回跳F30横2.363s/竖1.927s，前进11.189×/20.836×。证据determinism-gpu-final/results.json。
- 2026-10-23：条目GPU环境真实iframe重建中的play→pause与play→seek取消专项横竖4/4通过，readyDelay=0；pause保持F0/frame0，seek保持F1/frame60，重建完成后均未自动播放。
- 2026-10-23：原样capture命令GPU分支实测成功（1/1，横1280×720、竖720×1280，Iris Xe D3D11），两张F14预览均实际打开检查，无空白、裁切或错帧；预览已更新。
- 2026-10-23：build/check/build:site全部exit0；同步4份生成数据，dist含app827文件/36,973,475B，822份原public逐字节一致、音轨与许可齐全、无vendor。check保留41个旧Demo目录字号警告，无错误。
- 2026-10-23：报告已更新最终三次smoke、47/47全量、120条确定性、竞态4/4、GPU capture与构建结果；预热尝试/撤回测量保留。原MP4因撤回三帧MAD0且本轮仅改检查时序而复用。已关闭本轮4323/PID14056及测试浏览器，未动4321/4322或其他工作树。剩余仅最终文件范围/格式核对，无待决定事项。
- 2026-10-23：最终文件范围核对通过，分支/HEAD未变，无越界暂存项；自有文件空白检查exit0，完整暂存49处上游/生成格式报告保持原样。全部剩余验收与报告完成，无待决定事项；本轮服务和浏览器已关闭，未commit/push/切分支。
