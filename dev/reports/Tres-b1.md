# 资源库第二阶段 B1 执行报告

**当前状态：B1 未达到全部验收条件。GPU smoke：smoke 23/24 passed；smoke 23/24 passed；四时刻成片比较 24/24，未成像 0，最大 MAD > 12 共 4 片。**

主任务已决定由其提交时对固定的 84 个字体执行 git add -f。本工作树保留上游 .gitignore 原字节，未暂存或提交；忽略检查使用“恰好等于这 84 项”的新规则。

## 验证结果行

```text
build ok · 3 cases · 22 patterns · 1 files updated
check ok · 3 cases · 22 patterns · 22 source files scanned · kit copies 25
build:site · exit 0 · static site ready · dist/
dist exists dist/resources/lemo-opuscar/
dist exists dist/demos/styles/player/
dist exists dist/scripts/lemo-status.json
dist exists dist/core/lib.js
ignored · 84/84 · extra 0 · missing 0 · upstream .gitignore unchanged
byte comparison · git 2126 · pack 84 · mismatches 0
smoke 25/25 passed
GPU run 1 · smoke 23/24 passed · exit 1 · ready-timeout 180s
GPU run 2 · smoke 23/24 passed · exit 1 · ready-timeout 180s
core copy · 46 files · mismatches 0 · HTTP 5/5 bytes matched
fidelity · 24/24 films · 96/96 frame pairs · viewed 24 · max MAD > 12: 4
audio swiss-motion · video h264 · audio aac · 8.000s · reused unchanged inputs
audio pixel-rpg · video h264 · audio aac · 8.000s · reused unchanged inputs
check-pages · 66/66 passed
screenshots · 22 generated · 22 viewed
```

## 逐节核对

| 方案 | 项目 | 状态 | 实际证据 / 限制 |
| --- | --- | --- | --- |
| 0 | 指定工作树、只读参考、无 commit / push / 分支切换 | 已做 | 当前 feat/resources @ 5a4f287；暂存文件 0；受保护目录改动 0；未 commit / push / 切分支。 |
| 1.1 | 59 个 slug、排序、状态映射与 city-symphony | 已做 | 59 个 slug，状态 24 / 17 / 18；films / web 字段无 null；check 通过。 |
| 1.1 | films / web 资产映射与 null 清单 | 已做 | 59 个 slug，状态 24 / 17 / 18；films / web 字段无 null；check 通过。 |
| 1.2 | vendor CLI、根文件与四个指定目录、excluded | 已做 | vendor 清单 2266 项；独立字节核对 git 2126 / pack 84，不一致 0；许可与来源字段已写。 |
| 1.2 | ready 的同源 2xx 依赖、仅补克隆缺少部分 | 已做 | vendor 清单 2266 项；独立字节核对 git 2126 / pack 84，不一致 0；许可与来源字段已写。 |
| 1.2 | 解包前 tar -tf 与绝对路径 / .. 拒绝 | 已做 | vendor 清单 2266 项；独立字节核对 git 2126 / pack 84，不一致 0；许可与来源字段已写。 |
| 1.2 | UPSTREAM origin、license、notice | 已做 | vendor 清单 2266 项；独立字节核对 git 2126 / pack 84，不一致 0；许可与来源字段已写。 |
| 1.3 | 仅下载 web Release 的 59 个样片 | 已做 | 59 个 web 成片；56 条音轨、三个配音例外；59 片时长比对的绝对差均不超过 0.1 秒。 |
| 1.3 | 规定参数提取音轨，排除三段配音 | 已做 | 59 个 web 成片；56 条音轨、三个配音例外；59 片时长比对的绝对差均不超过 0.1 秒。 |
| 1.3 | ffprobe 时长与 style.json.dur 比对 | 已做 | 59 个 web 成片；56 条音轨、三个配音例外；59 片时长比对的绝对差均不超过 0.1 秒。 |
| 1.3a | 根 ignore 的 renders / frames 锚定与四条例外 | 已做 | 根规则修改保持方案指定内容，未加入额外 TTF 例外。 |
| 1.3a | 忽略输出恰好等于固定的 84 项清单 | 已做 | 按主任务决定改为固定 84 项：actual=84，extra=0，missing=0；上游 .gitignore 逐字节不变。 |
| 1.4 | 绝对路径执行 vendor，输出分组体积 | 已做 | vendor 已按绝对路径执行，输出 git / pack / film-audio 文件数与字节。 |
| 2.1 | 三个播放器文件、加载顺序与两份元数据 fetch | 已做 | 播放器已实现；GPU smoke：smoke 23/24 passed；smoke 23/24 passed；24 片取得 frameSec 截图，0 片无法成像；音轨两段导出通过。 |
| 2.1 | 无效 style 提示、无 __motion、固定 landscape 舞台 | 已做 | 播放器已实现；GPU smoke：smoke 23/24 passed；smoke 23/24 passed；24 片取得 frameSec 截图，0 片无法成像；音轨两段导出通过。 |
| 2.1 | dist/scripts 仅复制 lemo-status.json | 已做 | 播放器已实现；GPU smoke：smoke 23/24 passed；smoke 23/24 passed；24 片取得 frameSec 截图，0 片无法成像；音轨两段导出通过。 |
| 2.2 | 无参数上游 iframe、100 ms READY 轮询、180 秒预加载 | 已做 | 播放器已实现；GPU smoke：smoke 23/24 passed；smoke 23/24 passed；24 片取得 frameSec 截图，0 片无法成像；音轨两段导出通过。 |
| 2.2 | DUR / style.dur 回退与 cn · en 标题 | 已做 | 播放器已实现；GPU smoke：smoke 23/24 passed；smoke 23/24 passed；24 片取得 frameSec 截图，0 片无法成像；音轨两段导出通过。 |
| 2.3 | render 串行化、保留最新帧、seek 完成语义 | 已做 | 播放器已实现；GPU smoke：smoke 23/24 passed；smoke 23/24 passed；24 片取得 frameSec 截图，0 片无法成像；音轨两段导出通过。 |
| 2.4 | 音频 fetch / decode / attach、404 静音 | 已做 | 播放器已实现；GPU smoke：smoke 23/24 passed；smoke 23/24 passed；24 片取得 frameSec 截图，0 片无法成像；音轨两段导出通过。 |
| 2.5 | smoke 仅新增 --gpu 对 URL 任务的 renderer | 已做 | 播放器已实现；GPU smoke：smoke 23/24 passed；smoke 23/24 passed；24 片取得 frameSec 截图，0 片无法成像；音轨两段导出通过。 |
| 3 | buildResources 的 styles schema 与 num 排序 | 已做 | 构建已生成 styles 59 / ready 24、data/resources.js、README 计数和 agent/catalog.json；check 通过。 |
| 3 | README 计数块与 agent/catalog.json styles | 已做 | 构建已生成 styles 59 / ready 24、data/resources.js、README 计数和 agent/catalog.json；check 通过。 |
| 3 | data/resources.js 与其他构建生成物 | 已做 | 构建已生成 styles 59 / ready 24、data/resources.js、README 计数和 agent/catalog.json；check 通过。 |
| 4 | R1 / R2 覆盖 lemo | 已做 | R1 / R2 / R6 / R7 / R8 已执行，scripts/check.mjs 退出 0。 |
| 4 | R6 状态键集合与 24 / 17 / 18 | 已做 | R1 / R2 / R6 / R7 / R8 已执行，scripts/check.mjs 退出 0。 |
| 4 | R7 音轨存在与三个例外 | 已做 | R1 / R2 / R6 / R7 / R8 已执行，scripts/check.mjs 退出 0。 |
| 4 | R8 精简 ready 请求清单及存在检查 | 已做 | R1 / R2 / R6 / R7 / R8 已执行，scripts/check.mjs 退出 0。 |
| 5.1 | 三段资源切换与顺序 | 已做 | check-pages (a)–(l) 及附加交互、字号断言通过；页面截图已逐张查看。 |
| 5.2 | 类别 / 状态侧栏、来源文字、查询路由 | 已做 | check-pages (a)–(l) 及附加交互、字号断言通过；页面截图已逐张查看。 |
| 5.2 | 搜索五字段、编号 / 中文名排序、结果行 | 已做 | check-pages (a)–(l) 及附加交互、字号断言通过；页面截图已逐张查看。 |
| 5.2 | 海报、索引、cn / en / lineCn 与 chips 卡片 | 已做 | check-pages (a)–(l) 及附加交互、字号断言通过；页面截图已逐张查看。 |
| 5.3.1–5 | 详情返回、eyebrow、标题、介绍与三个操作 | 已做 | check-pages (a)–(l) 及附加交互、字号断言通过；页面截图已逐张查看。 |
| 5.3.6 | ready 播放区、44px 控制条、加载进度和首帧 | 偏离（原因） | 瑞士样片的加载、首帧、播放、拖动与声音检查通过；全 24 片运行验收未通过，见 GPU smoke 与根路径阻碍。 |
| 5.3.6 | 播放 / 暂停 / seek / time / sound 消息 | 偏离（原因） | 瑞士样片的加载、首帧、播放、拖动与声音检查通过；全 24 片运行验收未通过，见 GPU smoke 与根路径阻碍。 |
| 5.3.6 | 非 ready 海报和两类提示 | 已做 | check-pages (a)–(l) 及附加交互、字号断言通过；页面截图已逐张查看。 |
| 5.3.7–8 | 文档 chips、Markdown 链接、CREDITS、doc-path | 已做 | check-pages (a)–(l) 及附加交互、字号断言通过；页面截图已逐张查看。 |
| 5.3.9 | LemoLab 署名与音轨例外文案 | 已做 | check-pages (a)–(l) 及附加交互、字号断言通过；页面截图已逐张查看。 |
| 5.4 | 移动端侧栏、390px 时间格式、range 最小 120px | 已做 | check-pages (a)–(l) 及附加交互、字号断言通过；页面截图已逐张查看。 |
| 6 | docs/resources.md 三个指定位置 | 已做 | 只在指定位置更新 docs/resources.md、README 资源行；计数块由构建生成。 |
| 6 | README 外部资源表格指定行 | 已做 | 只在指定位置更新 docs/resources.md、README 资源行；计数块由构建生成。 |
| 7.1 | build → check → build:site 与三个 dist 路径 | 已做 | build / check / build:site 均退出 0；dist/core/lib.js 与原三个目标存在，core 共 46 个文件原字节一致；dist/scripts 仅有 lemo-status.json。 |
| 7.2 | git 与 tar 条目全量逐字节独立核对 | 已做 | 收录输入未变，复用 git 2126 / pack 84 独立逐字节比较，不一致 0；本轮 check 已重验收录清单。 |
| 7.3 | 4328 静态服务 | 已做 | 已停止旧 4328 服务，再按原命令启动；/core/ 通用映射已生效，抽查五个不同类型与层级的 URI 均 200 且字节一致。 |
| 7.4 | 既有条目 smoke 一次，必须 25/25 | 偏离（原因） | 首次 smoke 11/25 passed，GPU 软件渲染与后续连接失效；原命令不变重跑为 smoke 25/25 passed，未确认底层失效原因。 |
| 7.5 | 24 样片 GPU smoke 连续两次 24/24 | 偏离（原因） | 第 1 次：smoke 23/24 passed；第 2 次：smoke 23/24 passed |
| 7.6 | 四时刻与 web 成片忠实度比较 | 已做 | 24 片各四个时刻与 web 成片比较，共 96 组有效帧；24 张四行对照图已查看；最大 MAD > 12 为 4 片，已记录观察，不修画面。 |
| 7.7 | 两段带声音 MP4、ffprobe 与波形拼图 | 已做 | swiss-motion / pixel-rpg 两段 0–8s MP4 均含视频与音频；波形对照已生成并查看。 |
| 7.8 | check-pages (a)–(l) | 已做 | 页面断言 66/66；剪贴板 CRLF 还原为 LF 后严格比较。 |
| 7.9 | 九张页面截图与逐张查看 | 已做 | 指定 B1 九张、既有脚本附带图和新增 crayon-book / urban-sketch 就绪截图均已生成；已查看 22 张。 |
| 7.10 | 总字节、三类字节与前十大文件 | 已做 | 目录总字节、三类来源和前十大文件见体积表。 |
| 7.11 | 本报告及待决定 | 已做 | 本报告已写入当前测量值、截图索引与待决定事项。 |
| 8 | 允许修改范围与 Git 边界 | 已做 | 当前 feat/resources @ 5a4f287；暂存文件 0；受保护目录改动 0；未 commit / push / 切分支。 |
| 返工 1 | /core/ 通用回退映射、整目录静态复制与文档 | 已做 | 保留站点根原文件优先；复制前检查 dist/core/ 不存在；46 文件逐字节一致；已重启 4328。 |
| 返工 2 | --ready-timeout | 已做 | 默认 60 秒，同时用于发现 __motion 与等待 ready；播放器两次命令均传 180 秒，其他阈值和 GPU 检查未改。 |
| 返工 3 | 成片同一时刻比较 | 已做 | frameSec / DUR×25% / 50% / 75%；参考帧 -ss 在 -i 后；四行对照左侧标 t；最大 MAD > 12 已观察，不修。 |

## 收录与逐字节核对

收录输入未变化，复用独立读取本地文件与参考克隆 / tar 原条目的字节比较：git 2126，pack 84，不一致 0；本轮 check 已重新核对收录清单。原字节核对不包含派生音轨；派生来源与转码参数记录在 UPSTREAM.json 与页面署名。

忽略集合比对：期望 84，实际 84，新增 0，缺少 0；上游 .gitignore 原字节一致。验证脚本为 `dev/wip/Tres/tools/check-lemo-ignored.mjs`。该比对针对本次尚未暂存字体的工作树状态。

[字节核对 JSON](../wip/Tres/evidence/lemo-verification.json) · [忽略集合比对](../wip/Tres/evidence/lemo-ignored-comparison.json) · [固定 84 项](../wip/Tres/evidence/lemo-ignored-files.txt)

## Smoke

既有条目首次原命令为 smoke 11/25 passed：alert-reroute 被检测为 SwiftShader，随后测试浏览器连接失败；此前同轮 GPU 案例为 Intel D3D11。保留失败日志，在参数与代码不变的情况下完整重跑，最终为 smoke 25/25 passed。这段记录证明一次软件渲染与连接失效，未确认其底层原因。

24 个 ready URL 以 --gpu --ready-timeout 180 连续执行两次。默认就绪超时为 60 秒；发现 __motion 与等待 ready 使用相同的参数值，时间推进阈值、GPU 参数与软件渲染拒绝规则不变。播放器只支持 landscape，portrait 按 smoke 原逻辑跳过。

```text
smoke 25/25 passed
run 1: smoke 23/24 passed
run 2: smoke 23/24 passed
```

[既有条目最终日志](../wip/Tres/evidence/smoke-existing-complete.log) · [既有条目首次失败日志](../wip/Tres/evidence/smoke-existing-attempt-1.log) · [GPU 第一次](../wip/Tres/evidence/style-smoke-1.log) · [GPU 第二次](../wip/Tres/evidence/style-smoke-2.log) · [逐片汇总](../wip/Tres/evidence/style-smoke-summary.json)

| slug | GPU 第一次 | GPU 第二次 |
| --- | --- | --- |
| art-deco | 通过 | 通过 |
| ascii-crt | 通过 | 通过 |
| blueprint | 通过 | 通过 |
| cel-anime-80s | 通过 | 通过 |
| crayon-book | 通过 | 通过 |
| dataviz | 通过 | 通过 |
| ink-wash | 通过 | 通过 |
| iso-infographic | 通过 | 通过 |
| living-screencast | 通过 | 通过 |
| microgame | 通过 | 通过 |
| one-line | 通过 | 通过 |
| papercut-red | 通过 | 通过 |
| pictogram-motion | 通过 | 通过 |
| pixel-rpg | 通过 | 通过 |
| risograph | 通过 | 通过 |
| rubber-hose | 通过 | 通过 |
| shadow-puppet | 通过 | 通过 |
| silent-film | 通过 | 通过 |
| spy-titles | 通过 | 通过 |
| stained-glass | 播放 1.5 秒后时间只从 0 走到 0.1 | 播放 1.5 秒后时间只从 0 走到 0.11669999999999983 |
| swiss-motion | 通过 | 通过 |
| urban-sketch | 通过 | 通过 |
| whiteboard | 通过 | 通过 |
| woodcut | 通过 | 通过 |

## 忠实度 MAD 与逐张观察

旧的 poster 对比因参考错了而作废。

使用 GPU 启动参数，在 1920×1080 舞台依次 await seek(frameSec / DUR×0.25 / DUR×0.5 / DUR×0.75) 后截图。DUR 取播放器运行时长；参考是主工作区 films-web 的 web Release 成片，以 ffmpeg -i <mp4> -ss <t> 精确定位。两边均缩放到 480×270，以 RGB 全通道绝对差均值计算 MAD（0–255）。每张对照图四行，左侧标时刻，每行左为播放器、右为成片。表格每格为“时刻 / MAD”。

| slug | frameSec：t / MAD | 25%：t / MAD | 50%：t / MAD | 75%：t / MAD | 最大 MAD | 对照图 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| crayon-book | 43.680s / 3.603 | 13.000s / 2.210 | 26.000s / 4.189 | 39.000s / 4.218 | 4.218 | [查看](../shots/Tres/fidelity/crayon-book.jpg) |
| ink-wash | 34.560s / 1.840 | 12.000s / 0.979 | 24.000s / 1.465 | 36.000s / 1.360 | 1.840 | [查看](../shots/Tres/fidelity/ink-wash.jpg) |
| one-line | 39.900s / 2.461 | 11.875s / 0.906 | 23.750s / 1.013 | 35.625s / 0.920 | 2.461 | [查看](../shots/Tres/fidelity/one-line.jpg) |
| whiteboard | 55.500s / 0.949 | 27.750s / 0.860 | 55.500s / 0.949 | 83.250s / 0.767 | 0.949 | [查看](../shots/Tres/fidelity/whiteboard.jpg) |
| shadow-puppet | 21.760s / 6.663 | 13.600s / 2.227 | 27.200s / 1.511 | 40.800s / 2.699 | 6.663 | [查看](../shots/Tres/fidelity/shadow-puppet.jpg) |
| papercut-red | 35.280s / 3.487 | 12.250s / 1.612 | 24.500s / 1.328 | 36.750s / 2.420 | 3.487 | [查看](../shots/Tres/fidelity/papercut-red.jpg) |
| risograph | 28.800s / 6.989 | 10.000s / 8.097 | 20.000s / 11.981 | 30.000s / 8.085 | 11.981 | [查看](../shots/Tres/fidelity/risograph.jpg) |
| woodcut | 49.140s / 20.740 | 14.625s / 3.062 | 29.250s / 1.580 | 43.875s / 2.658 | 20.740 | [查看](../shots/Tres/fidelity/woodcut.jpg) |
| swiss-motion | 31.680s / 0.820 | 11.000s / 1.977 | 22.000s / 0.688 | 33.000s / 0.969 | 1.977 | [查看](../shots/Tres/fidelity/swiss-motion.jpg) |
| spy-titles | 26.460s / 8.048 | 11.023s / 18.961 | 22.045s / 2.735 | 33.068s / 3.445 | 18.961 | [查看](../shots/Tres/fidelity/spy-titles.jpg) |
| art-deco | 17.520s / 3.146 | 14.591s / 1.850 | 29.181s / 22.132 | 43.772s / 3.188 | 22.132 | [查看](../shots/Tres/fidelity/art-deco.jpg) |
| blueprint | 33.620s / 1.987 | 11.667s / 1.371 | 23.333s / 1.675 | 35.000s / 1.809 | 1.987 | [查看](../shots/Tres/fidelity/blueprint.jpg) |
| stained-glass | 40.680s / 2.932 | 14.125s / 2.379 | 28.250s / 1.559 | 42.375s / 2.975 | 2.975 | [查看](../shots/Tres/fidelity/stained-glass.jpg) |
| pictogram-motion | 65.440s / 2.308 | 40.400s / 2.245 | 80.800s / 1.815 | 121.200s / 2.451 | 2.451 | [查看](../shots/Tres/fidelity/pictogram-motion.jpg) |
| ascii-crt | 50.230s / 1.697 | 14.950s / 1.665 | 29.900s / 4.056 | 44.850s / 1.410 | 4.056 | [查看](../shots/Tres/fidelity/ascii-crt.jpg) |
| dataviz | 42.000s / 1.331 | 12.500s / 1.218 | 25.000s / 1.190 | 37.500s / 1.223 | 1.331 | [查看](../shots/Tres/fidelity/dataviz.jpg) |
| iso-infographic | 35.280s / 1.770 | 14.700s / 1.497 | 29.400s / 1.997 | 44.100s / 1.191 | 1.997 | [查看](../shots/Tres/fidelity/iso-infographic.jpg) |
| rubber-hose | 30.000s / 0.974 | 12.500s / 1.133 | 25.000s / 0.922 | 37.500s / 1.085 | 1.133 | [查看](../shots/Tres/fidelity/rubber-hose.jpg) |
| cel-anime-80s | 17.700s / 7.427 | 14.750s / 3.405 | 29.500s / 1.655 | 44.250s / 1.995 | 7.427 | [查看](../shots/Tres/fidelity/cel-anime-80s.jpg) |
| pixel-rpg | 27.250s / 2.849 | 13.625s / 0.959 | 27.250s / 2.849 | 40.875s / 0.965 | 2.849 | [查看](../shots/Tres/fidelity/pixel-rpg.jpg) |
| microgame | 23.920s / 4.332 | 14.957s / 1.240 | 29.913s / 0.995 | 44.870s / 7.004 | 7.004 | [查看](../shots/Tres/fidelity/microgame.jpg) |
| silent-film | 39.020s / 2.202 | 13.554s / 1.168 | 27.108s / 1.908 | 40.662s / 4.680 | 4.680 | [查看](../shots/Tres/fidelity/silent-film.jpg) |
| urban-sketch | 16.200s / 2.797 | 8.100s / 16.015 | 16.200s / 2.797 | 24.300s / 5.860 | 16.015 | [查看](../shots/Tres/fidelity/urban-sketch.jpg) |
| living-screencast | 5.940s / 1.010 | 14.850s / 1.630 | 29.700s / 0.625 | 44.550s / 0.764 | 1.630 | [查看](../shots/Tres/fidelity/living-screencast.jpg) |

最大 MAD > 12 的目视观察（按要求只记录，不修）：

| slug | 最大 MAD | 看图后的观察 |
| --- | ---: | --- |
| woodcut | 20.740 | 49.140s 的山体、塔身密集刻线有轻微位置错位，后三个时刻的主要构图更接近。 |
| spy-titles | 18.961 | 11.023s 的巨型标题字母有水平位置差异，部分时刻的追逐人物和钥匙姿态也不同。 |
| art-deco | 22.132 | 29.181s 的黑白棋盘格地面对位有偏移，人物动作和道具角度也有细微差异。 |
| urban-sketch | 16.015 | 8.100s 的野餐毯、人物和上色区域存在可见位置偏移，另外三个时刻的构图更接近。 |

[原始测量](../wip/Tres/evidence/fidelity.json) · [逐张查看记录](../wip/Tres/evidence/fidelity-review.json)

低于阈值但可见的文字差异：pictogram-motion，构图和动作对应，但播放器主标签为中文（手球、铁饼、冲浪），成片对应位置为日文。 最大 MAD 为 2.451；收录源码保持原字节，未按成片改写。

stained-glass 起始帧补测：独立 1280×720 GPU 页面 readyMs=910；t=0s 的 await seek 耗时 27.70ms；t=0.1s 的 await seek 耗时 25.70ms。同片的 1920×1080 四时刻测量见 fidelity.json。两组都是单次测量，未确认 smoke 时间推进失败的底层原因。

[起始帧耗时](../wip/Tres/evidence/stained-glass-timing.json)

## 音轨时长差值

差值 = web 成片时长 − style.json.dur；59 片绝对差 > 0.1 秒的为 0。56 条 Ogg Opus 音轨不裁剪、不平移；三个配音例外未收录。该测量的输入未变化，复用已取得结果。

| slug | style dur（秒） | web 时长（秒） | 差值（秒） | 音轨 |
| --- | ---: | ---: | ---: | --- |
| archive-lighttable | 40.000 | 40.000 | 0.000 | 已收录 |
| art-deco | 58.400 | 58.375 | -0.025 | 已收录 |
| ascii-crt | 59.800 | 59.792 | -0.008 | 已收录 |
| backrooms | 59.700 | 59.712 | 0.012 | 已收录 |
| blueprint | 46.700 | 46.667 | -0.033 | 已收录 |
| brick-toy | 54.000 | 54.016 | 0.016 | 已收录 |
| briefing-board | 40.000 | 40.000 | 0.000 | 已收录 |
| caption-news | 59.500 | 59.520 | 0.020 | 已收录 |
| cel-anime-80s | 59.000 | 59.008 | 0.008 | 已收录 |
| city-symphony | 52.000 | 52.010 | 0.010 | 已收录 |
| countdown | 59.500 | 59.520 | 0.020 | 已收录 |
| crayon-book | 52.000 | 52.010 | 0.010 | 已收录 |
| dark-keynote | 42.000 | 42.005 | 0.005 | 已收录 |
| data-physical | 39.400 | 39.381 | -0.019 | 已收录 |
| dataviz | 50.000 | 50.005 | 0.005 | 已收录 |
| engraving | 40.000 | 40.000 | 0.000 | 已收录 |
| game-show | 148.800 | 148.800 | 0.000 | 未收录（配音例外） |
| glass-product | 32.000 | 32.000 | 0.000 | 已收录 |
| halftone-dossier | 30.000 | 30.016 | 0.016 | 已收录 |
| hd-2d | 76.500 | 76.501 | 0.001 | 已收录 |
| hologram-hud | 39.000 | 39.018 | 0.018 | 已收录 |
| impasto | 39.700 | 39.667 | -0.033 | 已收录 |
| ink-wash | 48.000 | 48.000 | 0.000 | 已收录 |
| iso-infographic | 58.800 | 58.792 | -0.008 | 已收录 |
| kino-montage | 60.000 | 60.000 | 0.000 | 已收录 |
| lidar-survey | 40.000 | 40.000 | 0.000 | 已收录 |
| living-screencast | 59.400 | 59.400 | 0.000 | 已收录 |
| lowpoly-island | 53.000 | 53.013 | 0.013 | 已收录 |
| microgame | 59.800 | 59.833 | 0.033 | 已收录 |
| microscope | 39.500 | 39.509 | 0.009 | 已收录 |
| midcentury-toon | 40.000 | 40.000 | 0.000 | 已收录 |
| news-package | 53.500 | 53.504 | 0.004 | 未收录（配音例外） |
| newsreel | 54.600 | 54.583 | -0.017 | 已收录 |
| one-line | 47.500 | 47.500 | 0.000 | 已收录 |
| paper-lantern | 121.800 | 121.767 | -0.033 | 未收录（配音例外） |
| paper-popup | 133.000 | 133.013 | 0.013 | 已收录 |
| papercut-red | 49.000 | 49.002 | 0.002 | 已收录 |
| pictogram-motion | 163.600 | 163.605 | 0.005 | 已收录 |
| pixel-rpg | 54.500 | 54.506 | 0.006 | 已收录 |
| risograph | 40.000 | 40.000 | 0.000 | 已收录 |
| rubber-hose | 50.000 | 50.005 | 0.005 | 已收录 |
| satellite-briefing | 37.800 | 37.792 | -0.008 | 已收录 |
| scifi-toon | 57.500 | 57.514 | 0.014 | 已收录 |
| shadow-puppet | 54.400 | 54.400 | 0.000 | 已收录 |
| silent-film | 54.200 | 54.208 | 0.008 | 已收录 |
| silkscreen-poster | 38.400 | 38.417 | 0.017 | 已收录 |
| spy-titles | 44.100 | 44.083 | -0.017 | 已收录 |
| stained-glass | 56.500 | 56.512 | 0.012 | 已收录 |
| swiss-motion | 44.000 | 44.000 | 0.000 | 已收录 |
| teardown | 38.800 | 38.750 | -0.050 | 已收录 |
| telestrator | 54.400 | 54.400 | 0.000 | 已收录 |
| tilt-shift | 38.000 | 38.016 | 0.016 | 已收录 |
| ukiyoe | 44.000 | 44.010 | 0.010 | 已收录 |
| urban-sketch | 32.400 | 32.405 | 0.005 | 已收录 |
| visual-investigation | 60.000 | 60.010 | 0.010 | 已收录 |
| watercolor | 113.600 | 113.600 | 0.000 | 已收录 |
| white-model | 40.000 | 40.000 | 0.000 | 已收录 |
| whiteboard | 111.000 | 111.018 | 0.018 | 已收录 |
| woodcut | 58.500 | 58.517 | 0.017 | 已收录 |

## 音画对齐抽查

两段均使用 scripts/render.mjs 逐帧输出 0–8 秒、30fps、1920×1080，并由时间轴导出音频后合成 MP4。波形拼图上半部为上游 web 成片、下半部为渲染的 MP4。此项输入与播放器音频逻辑未变化，复用已通过的两段成品、ffprobe 与波形检查。

| slug | 视频 | 音频 | 时长（秒） | 波形观察 |
| --- | --- | --- | ---: | --- |
| swiss-motion | h264 1920×1080 | aac 2ch 48000Hz | 8.000 | 主要瞬态与语音包络的起止位置对应，未见明显整体平移；振幅有差异。 |
| pixel-rpg | h264 1920×1080 | aac 2ch 48000Hz | 8.000 | 主包络和后半段语音段的位置对应，未见明显累计漂移；起始瞬态形状及振幅有差异。 |

- swiss-motion：[MP4](../shots/Tres/audio/swiss-motion.mp4) · [波形对照](../shots/Tres/audio/swiss-motion.png)
- pixel-rpg：[MP4](../shots/Tres/audio/pixel-rpg.mp4) · [波形对照](../shots/Tres/audio/pixel-rpg.png)

[ffprobe 汇总](../wip/Tres/evidence/audio-check.json)

## Check-pages (a)–(l)

| 断言 | 结果 | 证据 |
| --- | --- | --- |
| (a) 视频列表无控制台错误 | 通过 | [] |
| (a) 共 703 条 | 通过 |  |
| (a) 首屏 48 张卡 | 通过 |  |
| (b) cat=3d | 通过 | {"actual":117,"expected":117} |
| (b) tag=shader | 通过 | {"actual":33,"expected":33} |
| (b) full=post | 通过 | {"actual":23,"expected":23} |
| (c) 703 份提示词文件全部 200 | 通过 | {"count":703,"failed":[]} |
| (d) 0xcodez-474136 · Prompt h2 / 代码块 | 通过 |  |
| (d) 0xcodez-474136 · 复制原文 | 通过 | {"originalLength":700,"copiedLength":708,"equalAfterCRLFToLF":true} |
| (d) charliie-334026 · Prompt h2 / 代码块 | 通过 |  |
| (d) charliie-334026 · 复制原文 | 通过 | {"originalLength":35,"copiedLength":35,"equalAfterCRLFToLF":true} |
| (d) 0xlangeai-597929 · Prompt h2 / 代码块 | 通过 |  |
| (d) 0xlangeai-597929 · 复制原文 | 通过 | {"originalLength":106,"copiedLength":110,"equalAfterCRLFToLF":true} |
| (d) ajith-io-615243 · Prompt h2 / 代码块 | 通过 |  |
| (d) ajith-io-615243 · 复制原文 | 通过 | {"originalLength":319,"copiedLength":322,"equalAfterCRLFToLF":true} |
| (d) 0xlangeai-178533 · Prompt h2 / 代码块 | 通过 |  |
| (d) 0xlangeai-178533 · 复制原文 | 通过 | {"originalLength":22,"copiedLength":24,"equalAfterCRLFToLF":true} |
| (e) 所有 Skill Markdown 阅读视图与站内链接/图片 | 通过 | {"skills":7,"markdownCount":242,"linkCount":353,"uniqueURLs":253,"known404":3,"unexpected404":[]} |
| (f) Markdown 提取前后 guide · 1440×900 | 通过 | {"differingPixels":0,"documentHTMLIdentical":true} |
| (f) Markdown 提取前后 pipeline · 1440×900 | 通过 | {"differingPixels":0,"documentHTMLIdentical":true} |
| (f) Markdown 提取前后 archive-os · 1440×900 | 通过 | {"differingPixels":0,"documentHTMLIdentical":true} |
| (g) 390×844 #videos | 通过 | {"scrollWidth":390} |
| (g) 390×844 #video/0xcodez-474136 | 通过 | {"scrollWidth":390} |
| (g) 390×844 #skill/motion-showreel | 通过 | {"scrollWidth":390} |
| 分页追加 48 张 | 通过 |  |
| 详情返回恢复筛选、分页与滚动位置 | 通过 | {"saved":{"hash":"#videos","scroll":620,"cards":96,"detail":"#video/0xcodez-474136"},"restored":{"hash":"#videos","scroll":620,"cards":96}} |
| 移动端筛选按钮展开侧栏 | 通过 |  |
| 筛选变化重置为 48 张 | 通过 |  |
| 搜索、作者排序与 replaceState 筛选 URL | 通过 | {"expected":3,"actual":3,"ordered":true,"hash":"#videos?cat=3d&q=shader&sort=author"} |
| Skill 来源 agent-anime-skill | 通过 |  |
| Skill 来源 garden-skills | 通过 |  |
| (h) 风格列表共 59 种 | 通过 |  |
| (h) 可逐帧播放 24 种 | 通过 |  |
| (h) 风格搜索与中文名称排序 | 通过 | {"expected":2,"actual":2,"ordered":true} |
| (h) 风格类别筛选 | 通过 |  |
| (i) 初始画面定位 frameSec，时间文本对应 | 通过 | {"time":31.68,"text":"0:31.7 / 0:44.0","frameSec":31.68,"expectedTime":"0:31.7"} |
| (i) 播放 2 秒时间增加至少 1.5 秒 | 通过 | {"before":31.68,"after":33.69739999999997} |
| (i) 拖动条 50% 定位误差不超过 0.05 秒 | 通过 | {"time":22,"duration":44} |
| (i) 声音默认关闭 | 通过 |  |
| (i) iframe 声音回报更新按钮 | 通过 |  |
| (j) backrooms 海报与待构建说明 | 通过 |  |
| (k) 59 个风格 STYLE.md / DEMO.md 全部 200 | 通过 | {"count":118,"failed":[]} |
| (l) 390×844 #styles | 通过 | {"scrollWidth":390} |
| (l) 390×844 #style/swiss-motion | 通过 | {"scrollWidth":390} |
| (l) 移动端时间为 m:ss，拖动条至少 120px | 通过 | {"time":"0:31 / 0:44","rangeWidth":173.203125} |
| 界面字号 1440 #videos | 通过 | {"minFontPx":12} |
| 界面字号 1440 #videos?cat=3d | 通过 | {"minFontPx":12} |
| 界面字号 1440 #video/0xcodez-474136 | 通过 | {"minFontPx":12} |
| 界面字号 1440 #video/0xlangeai-597929 | 通过 | {"minFontPx":12} |
| 界面字号 1440 #skills | 通过 | {"minFontPx":12} |
| 界面字号 1440 #skill/motion-showreel | 通过 | {"minFontPx":12} |
| 界面字号 1440 #skill/ai-handdrawn-video | 通过 | {"minFontPx":12} |
| 界面字号 1440 #skill/web-video-presentation/references/CHAPTER-CRAFT.md | 通过 | {"minFontPx":12} |
| 界面字号 390 #videos | 通过 | {"minFontPx":12} |
| 界面字号 390 #video/0xcodez-474136 | 通过 | {"minFontPx":12} |
| 界面字号 390 #skill/motion-showreel | 通过 | {"minFontPx":12} |
| 界面字号 1440 #styles | 通过 | {"minFontPx":12} |
| 界面字号 1440 #styles?status=ready | 通过 | {"minFontPx":12} |
| 界面字号 1440 #style/swiss-motion | 通过 | {"minFontPx":12} |
| 界面字号 1440 #style/pictogram-motion | 通过 | {"minFontPx":12} |
| 界面字号 1440 #style/backrooms | 通过 | {"minFontPx":12} |
| 界面字号 1440 #style/swiss-motion/DEMO.md | 通过 | {"minFontPx":12} |
| 界面字号 1440 #style/swiss-motion/demo/CREDITS | 通过 | {"minFontPx":12} |
| 界面字号 390 #styles | 通过 | {"minFontPx":12} |
| 界面字号 390 #style/swiss-motion | 通过 | {"minFontPx":12} |
| 资源页全程无 JavaScript 控制台错误 | 通过 | [] |

上游已知缺失链接 3 项，新增未知缺失 0 项，完整来源见 check-pages.json。剪贴板只将回读的 CRLF 还原为 LF，再与原 prompt 严格比较。

[页面检查原始结果](../wip/Tres/evidence/check-pages.json) · [本轮日志](../wip/Tres/evidence/check-pages-b1.log)

(f) 复核第一阶段保留的三组 before / after 截图与 HTML，均一致；本轮没有重新拍摄这三组提取前后的历史对照。

## 截图索引

B1 规定的九张、既有脚本附带截图与新增 crayon-book / urban-sketch 就绪截图均已生成并逐张查看。字号测量针对资源库原生页面文字；上游样片画面按原代码与固定舞台等比缩放。

| 视口 | 路由 | 最小文字字号 | 截图 | 目视 |
| --- | --- | ---: | --- | --- |
| 1440×900 | #videos | 12 | [查看](../shots/Tres/1440-videos.png) | 已查看 |
| 1440×900 | #videos?cat=3d | 12 | [查看](../shots/Tres/1440-videos-3d.png) | 已查看 |
| 1440×900 | #video/0xcodez-474136 | 12 | [查看](../shots/Tres/1440-video-title.png) | 已查看 |
| 1440×900 | #video/0xlangeai-597929 | 12 | [查看](../shots/Tres/1440-video-post.png) | 已查看 |
| 1440×900 | #skills | 12 | [查看](../shots/Tres/1440-skills.png) | 已查看 |
| 1440×900 | #skill/motion-showreel | 12 | [查看](../shots/Tres/1440-skill-motion-showreel.png) | 已查看 |
| 1440×900 | #skill/ai-handdrawn-video | 12 | [查看](../shots/Tres/1440-skill-ai-handdrawn-video.png) | 已查看 |
| 1440×900 | #skill/web-video-presentation/references/CHAPTER-CRAFT.md | 12 | [查看](../shots/Tres/1440-skill-chapter-craft.png) | 已查看 |
| 390×844 | #videos | 12 | [查看](../shots/Tres/390-videos.png) | 已查看 |
| 390×844 | #video/0xcodez-474136 | 12 | [查看](../shots/Tres/390-video-title.png) | 已查看 |
| 390×844 | #skill/motion-showreel | 12 | [查看](../shots/Tres/390-skill-motion-showreel.png) | 已查看 |
| 1440×900 | #styles | 12 | [查看](../shots/Tres/1440-styles.png) | 已查看 |
| 1440×900 | #styles?status=ready | 12 | [查看](../shots/Tres/1440-styles-ready.png) | 已查看 |
| 1440×900 | #style/swiss-motion | 12 | [查看](../shots/Tres/1440-style-swiss-motion.png) | 已查看 |
| 1440×900 | #style/pictogram-motion | 12 | [查看](../shots/Tres/1440-style-pictogram-motion.png) | 已查看 |
| 1440×900 | #style/backrooms | 12 | [查看](../shots/Tres/1440-style-backrooms.png) | 已查看 |
| 1440×900 | #style/swiss-motion/DEMO.md | 12 | [查看](../shots/Tres/1440-style-swiss-demo.png) | 已查看 |
| 1440×900 | #style/swiss-motion/demo/CREDITS | 12 | [查看](../shots/Tres/1440-style-swiss-credits.png) | 已查看 |
| 390×844 | #styles | 12 | [查看](../shots/Tres/390-styles.png) | 已查看 |
| 390×844 | #style/swiss-motion | 12 | [查看](../shots/Tres/390-style-swiss-motion.png) | 已查看 |
| 1440×900 | #style/crayon-book | 12 | [查看](../shots/Tres/1440-style-crayon-book.png) | 已查看 |
| 1440×900 | #style/urban-sketch | 12 | [查看](../shots/Tres/1440-style-urban-sketch.png) | 已查看 |

## 体积

| 来源 | 文件数 | 字节 |
| --- | ---: | ---: |
| git | 2126 | 89216570 |
| pack | 84 | 72446464 |
| film-audio | 56 | 50948665 |
| 收录内容小计 | 2266 | 212611699 |
| UPSTREAM.json | 1 | 445804 |
| 实际目录合计 | 2267 | 213057503 |

| 前 10 大文件（相对 resources/lemo-opuscar/） | 字节 | origin |
| --- | ---: | --- |
| styles/pictogram-motion/demo/fonts/NotoSansSCwght.ttf | 17772300 | pack:demo-pictogram-motion.tar |
| styles/pictogram-motion/demo/fonts/NotoSansJPwght.ttf | 9589900 | pack:demo-pictogram-motion.tar |
| styles/ink-wash/demo/fonts/MaShanZheng-Regular.ttf | 5857936 | pack:demo-ink-wash.tar |
| styles/papercut-red/demo/fonts/MaShanZheng-Regular.ttf | 5857052 | pack:demo-papercut-red.tar |
| styles/shadow-puppet/demo/fonts/MaShanZheng-Regular.ttf | 5857052 | pack:demo-shadow-puppet.tar |
| styles/crayon-book/demo/fonts/gaegu_Gaegu-Regular.ttf | 3165816 | pack:demo-crayon-book.tar |
| styles/crayon-book/demo/fonts/gaegu_Gaegu-Bold.ttf | 2962664 | pack:demo-crayon-book.tar |
| audio/pictogram-motion.ogg | 2930777 | film-audio:web/pictogram-motion.mp4 |
| core/assets/polyhaven/walnut_rough.jpg | 2865130 | git |
| styles/cel-anime-80s/demo/fonts/DelaGothicOne-Regular.ttf | 2508848 | pack:demo-cel-anime-80s.tar |

[本轮实际体积测量](../wip/Tres/evidence/lemo-size-final.json)

## 阻碍与处理结果

- 上游 .gitignore 的 84 个字体忽略项：主任务已决定提交时范围限定 git add -f；本轮精确集合比对通过，上游文件不改。
- web 下载时的连接中断：已补齐；本轮复用未变化的 59 个成片和时长测量。
- 根路径 /core/ 兼容：按主任务决定加入整个前缀的回退映射，静态构建复制整个目录；46 个原文件字节一致，服务已重启。
- 慢启动：smoke 已提供默认 60 秒的 --ready-timeout，播放器两次均用 180 秒；发现 __motion 与等待 ready 使用同一值。实测启动与单帧耗时保留在 fidelity.json。
- 既有 smoke 首次 smoke 11/25 passed；GPU 软件渲染与后续连接失败均保留原日志，原命令未改参数重跑为 smoke 25/25 passed。没有放宽软件渲染拒绝规则；未确认底层失效原因。
- 拖动条暂停回调会覆盖输入值：在暂停前保存目标值，50% 拖动断言验证最终行为。
- 音轨登记在预加载完成前执行，kit 就绪事件与离线导出均可读取乐谱；GPU smoke 和两段 MP4 验证。
- 剪贴板 CRLF：按主任务认可的规则还原 LF 后严格比较。

- 页面检查的路径预期格式与当前 .doc-path 不一致：已统一为 repo / 相对文件路径，并完整重跑，242 份 Skill Markdown 通过。
- 文档截图的同页 hash 导航不触发 Page.loadEventFired：采集脚本已改用 hash 路由等待，DEMO / CREDITS 正文图已完成并查看。

## 已知显示限制

既有 MAMarkdown.inline 先切开行内代码片段，因此 Swiss DEMO.md 中标签内含代码的目录链接显示为 Markdown 字面量，截图中可见。普通链接路径规则、原始文件入口与样片源码按钮仍可用；主任务明确本轮不修改共享渲染器，保留记录。

## 待决定

- stained-glass 实时播放验收处理方式：第 1 次：播放 1.5 秒后时间只从 0 走到 0.1；第 2 次：播放 1.5 秒后时间只从 0 走到 0.11669999999999983。1920×1080 忠实度页面 readyMs=2016，四个取样帧 await seek 耗时：40.680s → 70.60ms；14.125s → 105.20ms；28.250s → 9.20ms；42.375s → 92.30ms。独立 1280×720 起始帧补测 readyMs=910，0s → 27.70ms；0.1s → 25.70ms。这些是 await seek 调用耗时，未确认它与实际播放失败之间的因果；保留原时间推进阈值，未修上游或播放器性能。

## 当前交付状态

分支 feat/resources，HEAD 5a4f287199794be06eec42769f06d88ae98dac77；暂存文件 0；禁止修改目录的已跟踪差异 0。构建产物已刷新到最终页面与播放器源文件。35 个非 ready 样片保持海报 / 成片入口，素材与构建补齐属于 B2 / B3。
