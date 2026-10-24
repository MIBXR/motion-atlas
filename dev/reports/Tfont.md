# Tfont 字号与容器实施

舞台字号按设计决定，不设下限；网站界面 ≥ 12px。地图巡礼案例与 12 个地图巧思使用下列字号。舞台外 Kit 顶部加载提示与浮动控制条保持原样；seekable-timeline 的舞台内控制条使用横 k = 18/13、竖 k = 33/13。

## 实施范围与验证状态

| 项目 | 状态 | 证据 |
|---|---|---|
| 地图案例与 12 巧思字号表 | 静态核对通过，53 个选择器、1365 项横竖字号比对一致 | dev/shots/Tfont/static.json |
| CSS 公共前缀同步 | 12/12 一致，各巧思专用尾部规则保留 | dev/shots/Tfont/static.json |
| 印章整体缩放 | 13/13 创建与每帧 transform 均使用同一系数；底边公式一致 | 案例与 12 巧思 script.js；dev/shots/Tfont/static.json |
| 两个模板 | 26 + 8 条字号声明按横 0.75、竖 11/12 核对通过 | dev/shots/Tfont/static.json |
| JavaScript 语法 | 案例与 12 巧思 script.js 通过 node --check | dev/shots/Tfont/static.json |
| Demo 字号下限与 fontFloor | 字段与 Demo 下限分支已删除；renderer 保留；指定 8 处失效说明已按最终文字替换 | R2 check / smoke 日志 |
| 改前改后并排截图、12 巧思对照图、间距复核 | 38组字号对照与198组巧思对照已逐张查看；竖屏印章按裁定保留右栏，追加6图复验通过 | dev/shots/Tfont/compare/；dev/shots/T4b/parity/ |
| smoke、MP4、capture、build、check、build:site、声音 | 四次规定 smoke 与追加一轮、两 MP4、capture、build/check/build:site、12 WAV 均通过；站点 140/140 通过 | dev/shots/R2/ |

## 字号表实施对照

下表数值与案例、12 个巧思的源码声明一致。竖屏 NOW PLAYING 不单独设置字号，文字保持隐藏。

| 角色 | 选择器 | 横屏 px | 竖屏 px |
|---|---|---:|---:|
| 站名标签英文 / 日文 | `.mk-label .mk-en`、`.mk-label em` | 18 | 33 |
| 照片卡片标题 | `.card .cd-cap b` | 21 | 39 |
| 照片卡片时间 | `.card .cd-cap span` | 18 | 33 |
| 回忆类型标签 | `.fb-tag` | 18 | 33 |
| 回忆竖排主字幕 | `.fb-vtext` | 84 | 78 |
| 回忆英文字幕 | `.fb-en` | 23 | 36 |
| 回忆底部说明 | `.fb-caption` | 20 | 36 |
| 分屏对比标签 | `.cmp-label` | 18 | 33 |
| 分屏时间印记 | `.cmp-stamp` | 31 | 39 |
| 片名竖排大字 | `.it-cjk` | 161 | 133 |
| 片名英文 | `.it-en` | 61 | 61 |
| 片名副标题 | `.it-sub` | 18 | 33 |
| 地点竖排大字 | `.lt-cjk` | 115 | 116 |
| 地点英文标题 | `.lt-en` | 38 | 44 |
| 大号日序 | `.dc-row` | 134 | 133 |
| 日序卡日期 | `.dc-date` | 18 | 33 |
| 章节标签 | `.ct-chip` | 18 | 33 |
| 章节标题 | `.ct-title` | 25 | 42 |
| 警示横幅标题 | `.al-title` | 31 | 44 |
| 警示横幅详情 | `.al-detail` | 18 | 33 |
| 警示改道胶囊 | `.al-chip` | 18 | 33 |
| 通知主行 | `.ts-text` | 18 | 33 |
| 手写便签正文 | `.nt-text` | 33 | 61 |
| 手写便签署名 | `.nt-sign` | 18 | 33 |
| HUD 日序 | `.hd-title` | 29 | 44 |
| HUD 总天数 | `.hd-title small` | 20 | 36 |
| HUD 日期 | `.hd-date` | 18 | 33 |
| HUD 坐标 / 海拔 | `.hud-geo` | 18 | 33 |
| HUD 时钟 | `.hud-clock` | 50 | 72 |
| HUD 时区 | `.hc-tz` | 18 | 33 |
| 步进器站名 | `.st-label` | 18 | 33 |
| 徽章说明 | `.bd-label` | 18 | 33 |
| 徽章计数 | `.bd-n` | 24 | 44 |
| NOW PLAYING | `.np-head` | 18 | 不变，文字隐藏 |
| 曲名 / 作者 | `.np-track` | 21 | 39 |
| 歌词主行 | `.np-lyric` | 29 | 42 |
| 歌词副行 | `.np-sub` | 20 | 36 |
| 署名 | `.attrib` | 18 | 33 |
| 收尾统计数字 | `.ou-stats b` | 92 | 94 |
| 收尾统计标签 | `.ou-stats span` | 18 | 33 |
| 收尾结束语 | `.ou-fin` | 77 | 83 |
| 收尾账号署名 | `.ou-fin small` | 20 | 36 |
| 收尾制作信息 | `.ou-credits` | 18 | 33 |
| 地图同步遮罩提示 | `.veil-tag` | 18 | 33 |
| 路线标签 | `.rt-tag` | 18 | 33 |
| 地点副标题 | `.lt-sub` | 20 | 36 |
| 通知副行 | `.ts-sub` | 18 | 33 |
| 比例尺文字 | `.sc-text` | 18 | 33 |
| 预加载章节标签 / 百分比 | `.ld-k`、`.ld-p` | 18 | 33 |
| 预加载状态主行 | `.ld-t` | 27 | 44 |
| 缓冲提示 | `.buffering` | 18 | 33 |
| Kit 顶部加载提示，舞台外 | `.mk-loading span` | 不变 | 不变 |

印章的 CSS 字号保留横 34px、竖 36px，由 SVG 组整体缩放为横 0.75、竖 0.917；圆环、线宽、图标、汉字、占位字同步缩放。每个印章中心 x 来自原 stampXY(i)。组中心 y 使用 y + r × (1 − k)，因此静止完成态底边为 y + r × (1 − k) + r × k = y + r。

## 容器缩放清单

数值统一按主文字的新字号 ÷ 原字号计算，容器的 px 尺寸四舍五入到 0.5px。固定面板宽度、布局锚点、卡片框、插画尺寸与地图镜头保持原值。显式 px 行高按对应文字比例缩放；em 行高随字号自然变化。

| 容器 | 主文字 | 横系数 | 竖系数 | 缩放项目 |
|---|---|---:|---:|---|
| `.mk-label / .mk-label.is-node` | `.mk-en` | 18/24 | 33/36 | padding、gap、圆角 |
| `.rt-tag` | `.rt-tag` | 18/24 | 33/36 | padding、gap、圆角、SVG 宽高 |
| `.card .cd-cap` | 标题 b | 21/26 | 39/38 | padding、左描边；两行文字各自的 px 行高 |
| `.fb-tag / .cmp-label` | 自身文字 | 18/24 | 33/36 | padding、圆角 |
| `.cmp-stamp` | 时间戳文字 | 31/44 | 39/52 | padding、圆角、描边 |
| `.chapter-tag` | `.ct-title` | 25/30 | 42/40 | 内部 gap |
| `.ct-chip` | `.ct-chip` | 18/24 | 33/36 | padding、圆角 |
| `.al-bar / .al-icon` | `.al-title` | 31/36 | 44/48 | height、padding、gap、图标宽高 |
| `.al-chip` | `.al-chip` | 18/24 | 33/36 | padding、gap、圆角、SVG 宽高 |
| `.toast / .ts-icon` | `.ts-text` | 18/26 | 33/38 | padding、gap、圆角、图标及内部 SVG 宽高 |
| `.note` | `.nt-text` | 33/40 | 61/54 | padding、描边、圆角；正文 px 行高 |
| `.badge / .bd-avatar` | `.bd-n` | 24/30 | 44/40 | height、padding、gap、圆角、头像及内部 SVG 宽高 |
| `.buffering` | `.buffering` | 18/24 | 33/36 | height、padding、gap、圆角、SVG 宽高 |
| `.ld-box / .ld-bar` | `.ld-t` | 27/36 | 44/48 | 内部 gap、进度条高度 |
| 两模板文字 | 每项自身 | 18/24 | 33/36 | 所有文字；标签、印记、结束页内部间距与品牌图标同步 |
| seekable-timeline 控制条 | 13px 原控制条 | 18/13 | 33/13 | 从 Kit 原控制条 CSS 计算整套尺寸，舞台内锚点保留 |

公共容器的横屏规则与竖屏覆盖分别保存，避免公共缩放值流入竖屏。F1 标签宽度测量继续读取渲染后的字体、padding 与 gap。

## 间距失衡清单

38对字号图与198组巧思图逐张查看后，未发现新增的明显容器过松、文字挤出或碰撞。歌词译文与stepper间距偏紧但没有可见重叠，按要求不自行调整。进入/淡出/隐藏角色不据单张图推定字号一致；静态1365项对照与其它可见时刻作为分别记录的证据。

## 改前改后对照图索引

19个案例marker各+0.5s，横竖共38对均已生成并查看。旧源为Git blob 2eb02dffd635722c4ff2c651275673a8b19169da；旧内容时刻按相近角色映射，不能作为同画面像素比较。横图1280×720放大1.5；旧竖图390×844按宽放大1080，新图底部补417px黑pad保持比例。索引和逐图记录：dev/shots/Tfont/compare/index.json、review.json。横屏19/19复用font_plan在服务408前已完成的回报；竖屏19/19有后续分项记录，未因服务故障重新截图。旧竖版部分歌词/坐标或当前NOW PLAYING文字按各自设计隐藏，不能以缺少该角色直接判比例失败。

## 印章布局与追加复验

横屏印章中心 x 对齐对应站点；竖屏保留右侧一列 x = [980,980,980,980]。整体缩放分别为 0.75 / 0.917，组中心 y = 原 y + r × (1 − k)，底边保持原 y + r。Tfont 计划已明确区分横竖要求，案例及 12 巧思现有实现符合此裁定，无需再移动竖屏印章。

案例竖屏 t = 13.8、42.8、52.4；collect-counter 竖屏 t = 2、4.4、5.8，六张原生 1080×1920 截图均已重截并逐张查看。1、3、4 枚已收集章的圆环、汉字完整，无裁切或新增重叠。每张四个中心 x 均为 980，SVG 缩放实测 0.917000055，四个底边分别为 530、634、738、842（浮点误差小于 0.00002px）。几何与视觉复验均为 6/6；索引 dev/shots/R2/closeout/screenshots.json。

网站两组 hero SVG 标签按实际屏幕缩放计算字号，复用既有 resize 更新；仅修改 font-size。1440 / 800 / 390 宽度实测分别为 12.000068 / 12.000148 / 12.000717px，两列表共 6 个视口检查均通过；四张受影响桌面与手机列表截图已查看，无文字裁切或碰撞。

README、guide、archive research、map / archive 条目指定八处均使用“舞台字号按设计决定，不设下限；网站界面 ≥ 12px。”，只替换对应下限/豁免句，其他正文逐文件比对未变。逐处原文与替换结果见 dev/shots/R2/closeout/text-changes.json。

## R2 最终验收

四次规定 smoke 各 25/25；追加同一命令 smoke 25/25。map / 12 巧思最小可见舞台字号横 18 / 竖 33，archive 最小 5.3 仅报告，两个 GPU 条目 renderer 为 Intel Iris Xe / ANGLE D3D11。capture 25/25、14 竖屏预览；MP4 横 1920×1080 / 竖 1080×1920，各 23s / 30fps / 690 帧且 ffprobe 通过；12 WAV、213 事件、132/132 检查通过，无削波、最高 PCM 峰值 −2.231dBFS。本次未改变 Demo 图像或声音，沿用这些已验证证据。

本次站点 16/16 页面组合、140/140 检查通过；build 3 cases · 22 patterns，check、build:site 均退出 0。日志为 dev/shots/R2/closeout-{smoke,site,capture,build,check,build-site}.log，命令与环境见对应 .log.json（build:site 的实际 Bash / node / npm 路径记在日志）。

本次初次截图任务在 Runtime.evaluate 时浏览器连接关闭，没有产出样本；原因未确认。保留 closeout-capture-initial.log，单独重跑截图后 6/6 通过；未修改业务逻辑或降低验收要求。

## 范围外文案待决

另有 12 个地图巧思 entries 的 tokens.type，以及 dev/wip/T4b/tools/scores-entries.mjs，仍写“横屏 ≥24px、竖屏 ≥36px。”。这些不在本次指定八处中，按用户要求保留原文，已询问是否同步替换；尚未修改。
