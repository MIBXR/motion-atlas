# 新闻片字卡与划变

## 实现 Prompt

用来源案例的原作render(t)实现“新闻片字卡与划变”。十二条百叶按错相翻转露出装饰艺术字卡，双线框与标题依次落位，下一段以光圈展开；地图段用亮边斜向硬划变。保留参数：film/index.html:sceneCard，双框在.35秒内画出，Limelight英文与Noto Serif SC中文按decoTitle入场，镜头缓推。；film/index.html:TR / composeScene，blinds用12条横向条片，abs(cos(vπ))缩放并按v<.5切换新旧图；21秒转为irisopen。；film/index.html:composeScene的wipe分支，以四边形裁切由左至右展开新镜，斜边6px亮线。。按index.html内联segments定位原片，复用原作素材、字体与同区间音轨，声音默认关闭。

## 参数

- **原片重放区间**：lemo-newsreel：17.7–21.5秒；lemo-newsreel：8.25–9.2秒；1倍速，总时长4.750000秒。

[打开 Demo](../../demos/patterns/newsreel-intertitle-wipe/index.html) · [在库中查看](../../patterns.html#pattern/newsreel-intertitle-wipe)
