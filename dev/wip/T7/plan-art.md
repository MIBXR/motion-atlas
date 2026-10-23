$stop-that-shit change -- T7 生图升级：用 Codex 的图像生成能力，为工业协议生成位图素材，替换部分代码绘制的图形；构图、时间轴与交互不变。

# 0. 原则

- 先确认你在本环境里有可用的图像生成工具：说明是什么工具、生成的文件落在哪里。没有的话，停下报告，不要改用其他途径。
- 只生成**原创**画面：
  - 不模仿、不复制《明日方舟：终末地》或任何现有游戏的具体角色、logo、图标或截图；
  - 风格可以参考“近未来工业 / 白灰色面板 / 柠檬黄点缀”这类通用美术方向。
- 生成的图片保存到 `demos/cases/industrial-protocol/assets/gen/`，用 PNG（带透明通道的素材）或 WebP（背景）。在 `assets/gen/SOURCES.md` 中逐张记录：文件名、用途、完整提示词、生成工具、尺寸。
- 构图、坐标、尺寸、时间轴、交互一律不改。素材按现有设施 / 地面 / 人物的矩形放进去。代码绘制的状态灯、角标、名牌、Zz、旋转环、传送带纹样保留，叠在位图上方。

# 1. 要生成的素材与提示词（原样使用，可以加尺寸、透明背景之类的技术参数）

1. **地面贴图**：`ground.webp`，2048×2048，可无缝平铺。

   > Top-down orthographic view of a grassy industrial construction site on an alien plateau, short green grass with subtle variation, a few bare dirt patches and small grey stones, soft overcast daylight, no shadows from large objects, no buildings, no text, seamless tileable texture, realistic game environment texture

2. **设施俯视图**：每张 512×512，透明背景，正交俯视，光线统一来自左上方。

   公共前缀：

   > Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame,

   各台的后缀：

   | 文件 | 后缀 |
   |---|---|
   | `core.png` | a large square protocol core with a white triangular truss frame on top and a glowing pale core in the center |
   | `refinery.png` | a refinery furnace with a circular glowing orange furnace opening in the middle and vent grilles on both sides |
   | `assembler.png` | an assembler machine with a round mechanical gear housing in the middle and horizontal vent slats above and below |
   | `crusher.png` | a crusher with two round side-by-side grinding rollers in the middle |
   | `storage.png` | a storage container with a 2x2 grid of hatches on top |
   | `planter.png` | a planter unit with three rows of small green seedlings under a transparent cover |
   | `pylon.png` | a power pylon with a thin vertical mast and a diamond-shaped emitter on top, cables around the base |

3. **干员立绘**：`operator.png`，1024×1536，透明背景，全身站姿正面。

   > Original anime-style full-body character illustration, a young field engineer standing front-facing in a relaxed pose, short dark hair, wearing a long grey technical coat over a light hoodie with small lemon-yellow accent straps, a visor pushed up on the head, clean cel shading, neutral expression, transparent background, no text, no logo, not based on any existing character

   放进 S4 的人物矩形，替换剪影。原来剪影的轻微摆动改为整体 ±1° 的呼吸式缩放与倾斜，周期 4s。

4. **背包物品图标**：每张 128×128，透明背景，共 6 张：`item-crystal.png`、`item-part.png`、`item-canister.png`、`item-module.png`、`item-ore.png`、`item-plate.png`。

   > Game inventory icon, isometric 3/4 view of a single [purple energy crystal | small machined metal part | sealed white canister | compact electronic module | rough grey ore chunk | flat alloy plate], clean soft shading, subtle rim light, transparent background, no text

   方括号内依次取一项。用于 S3 背包网格与输入 / 输出槽，替换现有的几何图标。

# 2. 接入与验证

1. **地面**：`ground.webp` 用作静态地面层，保留现有缓存机制。建造区斜纹边框照旧叠加。
2. **设施**：设施方块的底座 / 面板改为对应 PNG。黄色角标、状态灯、名牌、Zz、旋转环、精炼炉炉口呼吸、粉碎机对辊旋转仍用代码叠加；对辊旋转做在位图上方的透明叠层上。
3. **蓝图虚影**：继续用线框，不用位图。
4. **预加载**：所有位图都经 `MotionKit.preload` 预加载，ready 之后再开始。
5. **验证**：
   - 横竖各场景截图，逐张查看：素材边缘干净、没有明显 AI 瑕疵（多余肢体、文字乱码、扭曲）。有问题的单张重新生成，最多 3 次；仍不行就停下报告。
   - smoke 原命令连续 3 次；
   - 重渲两段全长 MP4，ffprobe，抽 6 帧；
   - capture；
   - build、check、build:site。
6. **报告**：在 `dev/reports/T7.md` 中加“生图素材”一节：清单、提示词、替换前后对照图（S1、S3、S4 横屏各一组）。

最终答复列出：
- 生图工具与产物清单；
- 前后对照图路径；
- 有问题的素材与重生成记录；
- smoke、MP4、构建结果。
