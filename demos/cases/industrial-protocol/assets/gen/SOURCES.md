# 生图素材来源

生成工具：内置 image_gen.imagegen。生成日期：2026-10-23 至 2026-10-24。没有使用任何游戏截图、角色、图标或 logo 作为输入参考。所有图片均由下列完整提示词独立生成。

本目录保存 15 张最终素材。FFmpeg 仅执行 Lanczos 尺寸缩放及 PNG/WebP 格式转换；地面为 2048×2048 无损 WebP，设施为 512×512 RGBA PNG，物品为 128×128 RGBA PNG，人物为 1024×1536 RGBA PNG。未裁切、补绘或合成画面。14 张 PNG 均经解码确认同时存在完全透明像素与可见像素；地面保持不透明。地面 WebP 解码像素与缩放后输入完全相同，人物解码像素与原生尺寸输入完全相同。人物原图及成品的 Alpha 最大值均为 254。

原生输出（含全部重生成版本）保留在 C:/Users/mibxr/.codex/generated_images/01a166b2-12c7-75b0-ad08-94bf09822c6a/。下列提示词逐字记录每次生成输入；尺寸要求与实际原生尺寸分别列示。core 重生成 1 次，选用第 2 次生成；pylon 重生成 2 次，选用第 3 次生成；其余素材重生成 0 次。

| 最终文件 | 用途 | 原生尺寸 | 最终尺寸 | 最终像素格式 | 透明像素数 | 重生成次数 |
| --- | --- | --- | --- | --- | ---: | ---: |
| ground.webp | 静态地面贴图 | 1254×1254 | 2048×2048 | argb | 0 | 0 |
| core.png | 协议核心 | 1254×1254 | 512×512 | rgba | 62240 | 1 |
| refinery.png | 精炼炉 | 1254×1254 | 512×512 | rgba | 59637 | 0 |
| assembler.png | 配件机A/B | 1254×1254 | 512×512 | rgba | 65486 | 0 |
| crusher.png | 粉碎机 | 1254×1254 | 512×512 | rgba | 75911 | 0 |
| storage.png | 仓储箱 | 1254×1254 | 512×512 | rgba | 41266 | 0 |
| planter.png | 种植机 | 1254×1254 | 512×512 | rgba | 69214 | 0 |
| pylon.png | 供电桩 | 1254×1254 | 512×512 | rgba | 71441 | 2 |
| operator.png | S4原创人物 | 1024×1536 | 1024×1536 | rgba | 977344 | 0 |
| item-crystal.png | 背包/输入晶体 | 1254×1254 | 128×128 | rgba | 10530 | 0 |
| item-part.png | 背包/输出配件 | 1254×1254 | 128×128 | rgba | 9374 | 0 |
| item-canister.png | 背包罐 | 1254×1254 | 128×128 | rgba | 9325 | 0 |
| item-module.png | 背包模块 | 1254×1254 | 128×128 | rgba | 9339 | 0 |
| item-ore.png | 背包矿石 | 1254×1254 | 128×128 | rgba | 9187 | 0 |
| item-plate.png | 背包合金板 | 1254×1254 | 128×128 | rgba | 10914 | 0 |

## ground.webp

- 用途：静态地面贴图
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgb24
- 最终尺寸：2048×2048，argb
- 处理：FFmpeg Lanczos 缩放，libwebp 无损编码（lossless=1）
- Alpha 实测：最小 255，最大 255；完全透明 0 像素，半透明 0 像素，完全不透明 4194304 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-990e4f7a-15ca-406c-88d4-7d3b1b76d027.png

完整提示词（含技术参数）：

~~~text
Top-down orthographic view of a grassy industrial construction site on an alien plateau, short green grass with subtle variation, a few bare dirt patches and small grey stones, soft overcast daylight, no shadows from large objects, no buildings, no text, seamless tileable texture, realistic game environment texture

Technical output: 2048×2048 pixels, square texture, seamless along both axes.
~~~

## core.png

- 用途：协议核心
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：512×512，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 62240 像素，半透明 198603 像素，完全不透明 1301 像素
- 选定版本：第 2 次生成；重生成 1 次

### 第 1 次生成

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-26c8c23a-b280-4ac2-97f6-89b0adeba72a.png

完整提示词（含技术参数）：

~~~text
Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame, a large square protocol core with a white triangular truss frame on top and a glowing pale core in the center

Technical output: 512×512 pixels, PNG with a real transparent alpha channel.
~~~

### 第 2 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-03199a53-87b5-4400-ac73-71a82d5d2193.png

完整提示词（含技术参数）：

~~~text
Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame, a large square protocol core with a white triangular truss frame on top and a glowing pale core in the center

Technical output: 512×512 pixels, PNG with a real transparent alpha channel. Geometric requirement: the top white truss is a single three-sided triangular frame with exactly three corners, enclosing the glowing core. Camera points straight down at 90 degrees.
~~~

## refinery.png

- 用途：精炼炉
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：512×512，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 59637 像素，半透明 201220 像素，完全不透明 1287 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-1e248fb7-8243-4ea7-a34e-7b2e01eb0361.png

完整提示词（含技术参数）：

~~~text
Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame, a refinery furnace with a circular glowing orange furnace opening in the middle and vent grilles on both sides

Technical output: 512×512 pixels, PNG with a real transparent alpha channel.
~~~

## assembler.png

- 用途：配件机A/B
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：512×512，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 65486 像素，半透明 195174 像素，完全不透明 1484 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-a523e065-1ec7-44f7-901b-c770eeafd65c.png

完整提示词（含技术参数）：

~~~text
Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame, an assembler machine with a round mechanical gear housing in the middle and horizontal vent slats above and below

Technical output: 512×512 pixels, PNG with a real transparent alpha channel.
~~~

## crusher.png

- 用途：粉碎机
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：512×512，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 75911 像素，半透明 185107 像素，完全不透明 1126 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-34554555-2277-4a27-b1ae-4a9456d37d2f.png

完整提示词（含技术参数）：

~~~text
Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame, a crusher with two round side-by-side grinding rollers in the middle

Technical output: 512×512 pixels, PNG with a real transparent alpha channel.
~~~

## storage.png

- 用途：仓储箱
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：512×512，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 41266 像素，半透明 219497 像素，完全不透明 1381 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-44171663-2b6e-41c3-bc30-859afc97d9be.png

完整提示词（含技术参数）：

~~~text
Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame, a storage container with a 2x2 grid of hatches on top

Technical output: 512×512 pixels, PNG with a real transparent alpha channel.
~~~

## planter.png

- 用途：种植机
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：512×512，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 69214 像素，半透明 191722 像素，完全不透明 1208 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-d40386f7-c7ad-41ad-9ab2-c7c19b6919f3.png

完整提示词（含技术参数）：

~~~text
Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame, a planter unit with three rows of small green seedlings under a transparent cover

Technical output: 512×512 pixels, PNG with a real transparent alpha channel.
~~~

## pylon.png

- 用途：供电桩
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：512×512，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 71441 像素，半透明 189287 像素，完全不透明 1416 像素
- 选定版本：第 3 次生成；重生成 2 次

### 第 1 次生成

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-5c97077d-d78f-40e4-9433-65e6acf0fb69.png

完整提示词（含技术参数）：

~~~text
Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame, a power pylon with a thin vertical mast and a diamond-shaped emitter on top, cables around the base

Technical output: 512×512 pixels, PNG with a real transparent alpha channel.
~~~

### 第 2 次生成

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-c192b4de-b30f-429b-9026-38ef1ad8826c.png

完整提示词（含技术参数）：

~~~text
Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame, a power pylon with a thin vertical mast and a diamond-shaped emitter on top, cables around the base

Technical output: 512×512 pixels, PNG with a real transparent alpha channel. Camera geometry: strict overhead plan view, optical axis points vertically down at the ground from directly above the mast, no isometric tilt or front elevation. The mast and emitter project over the center of the base.
~~~

### 第 3 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-fa69c416-3d5b-4d16-8f1a-fecdf691e480.png

完整提示词（含技术参数）：

~~~text
Orthographic top-down view of a compact futuristic industrial machine for a factory-building game, white and light grey panels with dark grey recessed areas, small lemon-yellow accent stripes, clean sci-fi industrial design, soft top-left lighting, transparent background, no text, no logos, centered, fills 90% of the frame, a power pylon with a thin vertical mast and a diamond-shaped emitter on top, cables around the base

Technical output: 512×512 pixels, PNG with a real transparent alpha channel. Camera projection: exact 90-degree overhead floor-plan sprite; the optical axis points straight down along the mast's vertical world axis. Only top-facing surfaces are visible. The mast projects as a central cross-section, with the diamond emitter directly centered over the square base. The shaft has no visible length in this overhead projection.
~~~

## operator.png

- 用途：S4原创人物
- 生成工具：image_gen.imagegen
- 原生尺寸：1024×1536，rgba
- 最终尺寸：1024×1536，rgba
- 处理：FFmpeg 原生尺寸 RGBA PNG 编码，解码像素保持相同
- Alpha 实测：最小 0，最大 254；完全透明 977344 像素，半透明 595520 像素，完全不透明 0 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-bc28270d-604c-42d6-805c-037d2670bf6d.png

完整提示词（含技术参数）：

~~~text
Original anime-style full-body character illustration, a young field engineer standing front-facing in a relaxed pose, short dark hair, wearing a long grey technical coat over a light hoodie with small lemon-yellow accent straps, a visor pushed up on the head, clean cel shading, neutral expression, transparent background, no text, no logo, not based on any existing character

Technical output: 1024×1536 pixels, portrait 2:3, PNG with a real transparent alpha channel. Include the entire standing body, head, hands, and feet within the frame.
~~~

## item-crystal.png

- 用途：背包/输入晶体
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：128×128，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 10530 像素，半透明 5620 像素，完全不透明 234 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-4ef9ab76-a60f-4592-9cef-c63a47c9bd9a.png

完整提示词（含技术参数）：

~~~text
Game inventory icon, isometric 3/4 view of a single purple energy crystal, clean soft shading, subtle rim light, transparent background, no text

Technical output: 128×128 pixels, square PNG with a real transparent alpha channel.
~~~

## item-part.png

- 用途：背包/输出配件
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：128×128，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 9374 像素，半透明 6661 像素，完全不透明 349 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-73d16f72-ff18-43ed-912d-085ed8adb4f5.png

完整提示词（含技术参数）：

~~~text
Game inventory icon, isometric 3/4 view of a single small machined metal part, clean soft shading, subtle rim light, transparent background, no text

Technical output: 128×128 pixels, square PNG with a real transparent alpha channel.
~~~

## item-canister.png

- 用途：背包罐
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：128×128，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 9325 像素，半透明 6766 像素，完全不透明 293 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-25e51663-182f-4012-8991-c1cd94e9e771.png

完整提示词（含技术参数）：

~~~text
Game inventory icon, isometric 3/4 view of a single sealed white canister, clean soft shading, subtle rim light, transparent background, no text

Technical output: 128×128 pixels, square PNG with a real transparent alpha channel.
~~~

## item-module.png

- 用途：背包模块
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：128×128，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 9339 像素，半透明 6780 像素，完全不透明 265 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-7154658d-025f-4810-98c6-875f5b7dc67c.png

完整提示词（含技术参数）：

~~~text
Game inventory icon, isometric 3/4 view of a single compact electronic module, clean soft shading, subtle rim light, transparent background, no text

Technical output: 128×128 pixels, square PNG with a real transparent alpha channel.
~~~

## item-ore.png

- 用途：背包矿石
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：128×128，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 9187 像素，半透明 6966 像素，完全不透明 231 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-28116fc8-bfe9-4d2e-b666-36e9eea5bd38.png

完整提示词（含技术参数）：

~~~text
Game inventory icon, isometric 3/4 view of a single rough grey ore chunk, clean soft shading, subtle rim light, transparent background, no text

Technical output: 128×128 pixels, square PNG with a real transparent alpha channel.
~~~

## item-plate.png

- 用途：背包合金板
- 生成工具：image_gen.imagegen
- 原生尺寸：1254×1254，rgba
- 最终尺寸：128×128，rgba
- 处理：FFmpeg Lanczos 缩放，RGBA PNG 编码
- Alpha 实测：最小 0，最大 255；完全透明 10914 像素，半透明 5244 像素，完全不透明 226 像素
- 选定版本：第 1 次生成；重生成 0 次

### 第 1 次生成（选定）

原图：C:\Users\mibxr\.codex\generated_images\01a166b2-12c7-75b0-ad08-94bf09822c6a\exec-368be520-a3e7-401f-aff8-7bb06b49f02e.png

完整提示词（含技术参数）：

~~~text
Game inventory icon, isometric 3/4 view of a single flat alloy plate, clean soft shading, subtle rim light, transparent background, no text

Technical output: 128×128 pixels, square PNG with a real transparent alpha channel.
~~~
