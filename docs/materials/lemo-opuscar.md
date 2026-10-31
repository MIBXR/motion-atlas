# lemo-opuscar

Lemomo（[@lemomo-ai](https://github.com/lemomo-ai)）的代码影片风格库，包含66种风格、每种的示范短片、导演和技术指南，以及串起98部奥斯卡最佳影片的长片 OPUSCAR 98。本库原文快照固定在 [`f17136060781a0068a7951245a3aa7835a7230de`](https://github.com/lemomo-ai/lemo-opuscar/tree/f17136060781a0068a7951245a3aa7835a7230de)；代码与文档为 MIT，示范成片和静帧为 CC BY 4.0，第三方资源与配音例外见[素材条目的许可](../../materials.html#material/lemo-opuscar)。

## 组成

| 文件 | 提供的内容 |
| --- | --- |
| DIRECTOR.md | 故事、声音、节奏、运镜、表演和交付自检的导演方法。 |
| TECHNIQUE.md | 环境、逐帧页面、旁白、配乐、混音与合成。 |
| styles/&lt;slug&gt;/STYLE.md | 风格的外观、配色、字体、动作、镜头语法、声音与原生招式。 |
| styles/&lt;slug&gt;/DEMO.md | 对应示范片的故事、镜头、配乐结构、道具、参数与制作说明。 |
| MY-STYLES.md | 改造库内风格或从空白制作并保存个人风格的五步流程。 |
| core/ | 渲染、TTS、语音识别、采样乐器、拟音、混音，以及基础随机、缓动与 Three.js 后期工具。 |

## 用法

在终端安装插件后，可以从任意文件夹开始：

```sh
claude plugin marketplace add lemomo-ai/lemo-opuscar
claude plugin install lemo-opuscar@lemolab
```

也可克隆仓库，在库内运行 Claude：

```sh
git clone https://github.com/lemomo-ai/lemo-opuscar.git
cd lemo-opuscar
claude
```

直接说想要的主题、时长和风格。上游 README 的两个示例：

> Make a 45-second film in the **watercolor** style about the coffee farm my family runs. Warm female narrator.

> Make a 40-second **LiDAR Survey** film about the old quarry in the hills behind our town, from public laser-scan data.

Agent 先一次询问三件事：主题中需要用户决定的事实；用户自己的声音、音乐或其他素材；是否先审阅分镜。语言由请求确定，默认与用户使用的语言相同。安装插件后空调用 `/lemo-opuscar:lemo-opuscar` 可先选语言，再选制作影片、改风格或使用已保存风格。

## 风格目录

### 剪辑与纪实 · Edit & Documentary

- 字幕新闻 · Caption News
- 1920s 新闻影片 · 1920s Newsreel
- 实时倒计时分屏 · Live Countdown Split-screen
- 延时交响 · Time-lapse Symphony
- 视觉调查 · Visual Investigation
- 构成主义蒙太奇 · Constructivist Montage
- 体育战术板 · Sports Telestrator
- 电视新闻包装 · Broadcast News Package

### 实证影像 · Evidence Films

- 卫星简报 · Satellite Briefing
- 工程简报板 · Engineering Briefing Board
- 点云测绘 · LiDAR Survey（[本库案例](../../cases.html#case/lemo-lidar-survey)）
- 白模投影 · Projection on White Model
- 数据实物化 · Data Physicalization
- 产品拆解 · Exploded Teardown
- 显微叙事 · Microscope Story
- 档案灯台 · Archive Light Table

### 手绘与绘画 · Hand-drawn & Painting

- 蜡笔儿童绘本 · Crayon Picture Book
- 水彩笔刷 · Watercolor Brush（[本库案例](../../cases.html#case/lemo-watercolor)）
- 中国水墨 · Chinese Ink Wash（已复刻，[本库案例](../../cases.html#case/lemo-ink-wash)）
- 油画厚涂 · Impasto Oil Painting
- 一笔画 · One-line Drawing
- 白板讲解 · Whiteboard Explainer
- 钢笔淡彩 · Urban Sketch · Pen & Wash
- 黑板粉笔 · Chalkboard

### 东方传统 · East Asian Traditions

- 皮影戏 · Shadow Puppetry
- 浮世绘 · Ukiyo-e
- 红色窗花剪纸 · Red Paper-cut
- 纸雕灯影 · Paper-cut Lightbox

### 印刷与版画 · Print & Printmaking

- Risograph 孔版印刷 · Risograph Print
- 复古半调案卷 · Halftone Dossier
- 木刻版画 · Woodcut Print（已复刻，[本库案例](../../cases.html#case/lemo-woodcut)）
- 铜版画 · Copperplate Engraving
- 丝印旅行海报 · Silkscreen Travel Poster
- 印刷长镜头 · Printed Long Take

### 图形与排版 · Graphic & Type

- 瑞士动态排版 · Swiss Motion Graphics（[本库案例](../../cases.html#case/lemo-swiss-motion)）
- 60s 间谍片头 · 60s Spy Title Sequence（已复刻，[本库案例](../../cases.html#case/lemo-spy-titles)）
- 装饰艺术 · Art Deco
- 蓝图 / 工程制图 · Blueprint
- 彩色玻璃窗 · Stained Glass
- 象形运动图形 · Pictogram Motion
- ASCII / CRT 终端 · ASCII / CRT Terminal

### 信息与发布 · Information & Keynote

- 数据叙事 · Data Storytelling
- 等距信息图 · Isometric Infographic
- 暗色科技发布 · Dark Tech Keynote
- 活体实机录屏 · Living Screencast
- 科幻全息界面 · Sci-fi Hologram HUD
- 地铁线路图 · Transit Map
- 等距绘本 · Isometric Picture Book
- 电路板 · Circuit Board

### 卡通与动画 · Cartoon & Anime

- 1930s 橡皮管卡通 · 1930s Rubber Hose Cartoon
- 80 年代赛璐璐动画 · 80s Cel Anime
- 科幻情景喜剧卡通 · Sci-Fi Sitcom Toon
- 50s 扁平卡通 · Mid-century Cartoon

### 游戏 · Games

- 16-bit 像素 RPG · 16-bit Pixel RPG
- HD-2D · HD-2D
- 微游戏快闪 · Microgame Frenzy
- 综艺节奏扁平 · Game Show Flat

### 电影与时代 · Cinema & Eras

- 1920s 默片 · 1920s Silent Film
- 后室 / 新怪谈 · Liminal Found Footage

### 材质与 3D · Materials & 3D

- 积木玩具 · Brick Toy
- 纸片立体书 · Paper Pop-up Book（已复刻，[本库案例](../../cases.html#case/lemo-paper-popup)）
- 移轴微缩 · Tilt-Shift Miniature
- 低多边形等距 · Low-poly Isometric Island
- 玻璃质感产品 · Glass Product Render
- 孟菲斯微缩景观 · Memphis Diorama（[本库案例](../../cases.html#case/lemo-memphis-diorama)）
- 桌面穿梭 · Desktop Flythrough

## 改成我的风格

1. 选择库内风格或从空白描述外观，逐题确定用途、平台、品牌、改动方向与名称，每轮最多五项改动。
2. 审阅每项前后状态及其代价，确认摘要后再写入。
3. 用实际代码先绘风格帧，改库内风格时将原版置左、个人版置右比较。
4. 制作15–30秒、有音乐和音效的示范短片，让每项改动都在画面中出现。
5. 确认满意后保存到 `~/lemo-my-styles/<name>/`，同时保留风格提示词、改动说明、成片和源码，以名称复用。

## 本库收录

原文快照包含根目录指南和许可、`plugin/skills/lemo-opuscar/`、`.claude-plugin/marketplace.json`、`styles/README.md`、`styles/_template/`、全部66个风格的 `STYLE.md` / `DEMO.md` / `style.json`，以及 `core/` 的代码与文字。快照不含 `core/assets/`、字体二进制、各风格的 `demo/` 代码和成片。

八个案例各自保留运行画面、字体、成片音轨和 `source/` 制作文件：

- [跟着雨走 · 水彩笔刷](../../cases.html#case/lemo-watercolor)：制作文件见 [source/README.md](../../demos/cases/lemo-watercolor/source/README.md)。
- [海报五则 · 瑞士动态排版](../../cases.html#case/lemo-swiss-motion)：制作文件见 [source/README.md](../../demos/cases/lemo-swiss-motion/source/README.md)。
- [林下的田 · 点云测绘](../../cases.html#case/lemo-lidar-survey)：制作文件见 [source/README.md](../../demos/cases/lemo-lidar-survey/source/README.md)。
- [柚子城的四季 · 孟菲斯微缩景](../../cases.html#case/lemo-memphis-diorama)：制作文件见 [source/README.md](../../demos/cases/lemo-memphis-diorama/source/README.md)。

- [剑客渡江 · 中国水墨](../../cases.html#case/lemo-ink-wash)：制作文件见 [source/README.md](../../demos/cases/lemo-ink-wash/source/README.md)。
- [铸钟人 · 木刻版画](../../cases.html#case/lemo-woodcut)：制作文件见 [source/README.md](../../demos/cases/lemo-woodcut/source/README.md)。
- [天鹅绒密码 · 60s 间谍片头](../../cases.html#case/lemo-spy-titles)：制作文件见 [source/README.md](../../demos/cases/lemo-spy-titles/source/README.md)。
- [小精灵冒险记 · 纸片立体书](../../cases.html#case/lemo-paper-popup)：制作文件见 [source/README.md](../../demos/cases/lemo-paper-popup/source/README.md)。

八个 `source/` 共用的上游工具在[本快照的 core/](../../demos/materials/lemo-opuscar/core/README.md)。68项作者画廊保留公开成片链接，并以4秒无声循环动画展示。
