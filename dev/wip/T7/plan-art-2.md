$stop-that-shit change -- T7 生图第二版：全部素材改为风格化（与平面界面一致），干员改为贴近原作的女性管理员；接入后完成验收。

# 用户反馈

1. 现在的素材太写实，和整体风格不搭。
2. 干员要用女角色，尽可能贴合原作。

# 风格总则（所有素材共用，写在每条提示词末尾）

> clean stylized game asset, flat shading with subtle soft gradients, simplified shapes, bold clean silhouette, limited palette of white, light grey, charcoal and lemon yellow (#ffe400) accents, crisp edges, no photorealistic textures, no grime, no noise, consistent soft top-left light, matches a minimal sci-fi mobile game UI

# 重新生成（文件名不变，覆盖旧版；旧版移到 `assets/gen/_v1/`，不入库）

1. **地面** `ground.webp`：
   > top-down stylized grassland for a factory-building game, soft flat green color fields with gentle tonal variation, a few simple flat dirt patches and small rounded grey stones, painterly but clean, seamless tileable, no realistic grass blades

   加上风格总则。
2. **7 台设施**：沿用 plan-art.md 的各台后缀与公共前缀，把公共前缀里的 `clean sci-fi industrial design` 换成风格总则。设施保持正交俯视、透明背景、占画面 90%。
3. **干员** `operator.png`，1024×1536，透明背景，全身站姿正面：
   > Anime-style full-body illustration of a young woman, the Endministrator of Endfield Industries from Arknights: Endfield, short dark bob haircut with a tech visor, long grey technical coat with lemon-yellow strap accents over a light grey hoodie, dark fitted pants and boots, calm composed expression, standing front-facing with a relaxed pose, clean cel shading, flat colors with soft gradients, transparent background, no text, no logo

   用户要求贴合原作，这一条按原作角色的外观特征生成。不要使用、描摹任何官方立绘或截图作为输入。
4. **6 个物品图标**：沿用原提示词，把渲染相关描述换成风格总则（isometric 3/4 view 保留）。

# 检查与接入

- 每张都检查：
  - 风格一致：同一组素材并排看，不能有的写实、有的扁平；
  - 无 AI 瑕疵；
  - 人物手指、五官、服装对称性正常。

  不合格就重生成，最多 3 次，仍不行就停下报告。
- 生成新的素材总览图 `dev/shots/T7/imagegen/assets-review-v2.png`。
- 尺寸归一化、预加载、叠加层都同上一轮。
- 横屏 S1、S3、S4 新旧对照图（v1 vs v2），存 `dev/shots/T7/imagegen/compare-v2/`。
- 原命令 smoke 连续 3 次；重渲两段全长 MP4，ffprobe，抽 6 帧；capture；build、check、build:site。
- 更新 `SOURCES.md` 与报告。

最终答复列出：
- 总览图路径；
- 三组对照图；
- 重生成记录；
- smoke、MP4、构建结果。
