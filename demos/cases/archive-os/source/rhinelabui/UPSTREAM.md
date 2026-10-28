# RhineLabUI 上游快照

- 上游仓库：<https://github.com/LBEILC/RhineLabUI>
- 上游提交：`12cc5e4013acb9408f753ff71de6b8492299b7c8`（`12cc5e4`）
- 复制日期：2026-10-22
- 只读来源：`C:/Users/mibxr/AppData/Local/Temp/mmref/RhineLabUI`
- 许可：见[LICENSE](LICENSE)、[PR15-ATTRIBUTION.md](PR15-ATTRIBUTION.md)和[README.md](README.md)的第三方说明。

本目录是固定上游提交的源码快照与Motion Atlas胶片接入层。上游视觉、CSS、档案文本、动效参数、模型、字体和音频资源保留原版内容；上游源码的接入修改使用 `// MOTION-ATLAS:` 标记。

## 上游文件改动清单

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

## 新增接入文件

| 文件 | 要求条目 | 当前接入及必要性 |
| --- | --- | --- |
| `film/clock-shim.js` | §3.1、§4.2及同钟对照授权 | film模式安装60Hz驱动/实时虚拟时钟、固定日期、mulberry32随机数及Web Animations/CSS动画采样。显式opt-in `__filmClockRequested` / `__filmClockStartFrame` 供只读原版CDP使用相同F0/60Hz时钟对齐；正常film起点仍为0，不改变其行为。 |
| `film/app.ts` | §3.3、§4.2 | ready、字体/双GLB/首帧进度、原rhine.stats与页签/查看器状态及失败传播，不添加UI。 |
| `film/sequence.js` | §4.3、§4.4 | 提供自然开场后的A/B动作、九个标记、键盘/点击/拖拽派发及状态快照；横竖使用相同动作时刻。仅有film时钟时临时使programmatic focus附focusVisible:false，避免合成指针继承键盘焦点外框；cancel进入手动时恢复原生focus，不修改原CSS或事件处理器。 |
| `film/render-audio.mjs` | §6.1 | 驱动完整胶片，在注入的OfflineAudioContext渲染48kHz双声道WAV，并以libvorbis q=6编码完整OGG音轨。 |
| `build.mjs` | §3.5、§5 | 清理上次Vite index与带哈希JS/CSS，保留原public资源；--sync-assets同步全部运行时资源；构建后将产物CSS的/fonts/解析为../fonts/，复制clock/sequence并输出产物清单及大小。上游src/fonts.css保持原样。 |
| `scripts/patch-rolling-number.mjs` | §5必要补充 | 按上游原字节复制package.json既有postinstall调用的安装脚本，使npm ci完成与上游一致的依赖补丁。 |
| `UPSTREAM.md` | §2、§3 | 记录固定上游来源、快照边界与当前逐文件接入清单。 |

## 资源与许可位置

上游 `public/` 的全部运行时资源仅存放在 `demos/cases/archive-os/film/app/`，不在vendor中重复保存。以下许可文件单独保留供源码快照查阅：

| 快照位置 | 上游来源 |
| --- | --- |
| `licenses/fonts/MiSans-license.pdf` | `public/fonts/MiSans-license.pdf` |
| `licenses/fonts/NOTICE.txt` | `public/fonts/NOTICE.txt` |
| `licenses/licenses/rolling-number.txt` | `public/licenses/rolling-number.txt` |
| `licenses/audio/README.md` | `public/audio/README.md` |

快照包含上游README、LICENSE、PR15署名、index、package文件、TypeScript/Vite配置、src、content、两份音频生成脚本，以及postinstall所需的原版rolling-number补丁脚本。`art/`、`docs/`、`reference/`、`verification/`、`wallpaper/`和部署配置不属于快照；node_modules由上游lockfile安装并被Git忽略。

## 构建与胶片锚点

`node vendor/rhinelabui/build.mjs --sync-assets` 同步资源并构建；后续 `npm run build:archive` 复用app中的资源。app构建产物入库，`npm run build:site`直接复制部署目录，vendor不进入dist。

胶片零点对应原版白底开场第一帧。阵列视觉阶段第1320步=22.0s，首次detail第2100步=A35.0s；B=A+27.6=62.6s，duration=A+42.6=77.6s。自然读取X-001，之后按 `film/sequence.js` 派发固定动作。

外层以原生performance.now和独立墙钟累加器维护胶片时间，timeline的render、seek、play、pause、on(fn)与setRate读取统一时间。播放每个host RAF取target=floor(wall*60)，完整更新全部中间状态步并跳过中间GPU绘制，只绘制目标步；不设30步推进上限。pause冻结当前实际frame/60并清除播放队列。seek与离线render路径保持原固定步重建和目标帧绘制，seek的Promise等待目标步完成。

外层script.js使用递增播放请求序号：pause与seek取消尚未开始的播放，异步重建后的startPlay仅执行最新且未取消的请求。软件GL且URL未指定quality时选择原版performance；显式quality优先。
