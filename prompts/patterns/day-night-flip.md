# 昼夜翻转：逐层插值

## 实现 Prompt

地图配色与 HUD 强调色一起在昼夜之间过渡，交代时间的流逝。复用地图巡礼的 dayNight、valueAt、cameraAt、drawHud、clockAt、classify、setPaint 与对应 CSS。地图、3D 建筑、HUD 与案例暖色 wash；镜头固定为案例 34.5s，HUD 与昼夜值按 caseT 31.3→35.8、36.6→39.1 求值。片段：caseT 31.3→35.8；caseT 36.6→39.1；固定镜头 caseT 34.5，全部 HUD 按片段求值；时长 7s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定镜头的实时地图，声音由 score.json 挂接。

## 参数

- **时长**：7s
- **声音 voice**：whoosh、sub、reverse、chime

## 动效 Token

- **白天**：0s
- **入夜**：1.5s
- **天亮**：4.5s
- **时长**：7s

## 迁移

- `动效函数`：配置昼夜配色、镜头、时钟与HUD。
- `依赖`：配置MapLibre 5.6.0、样式、图层与地图镜像。
- `需要的数据`：设置昼夜、镜头、时钟、HUD；镜头固定在34.5s。
- `config.js → segments / markers`：31.3→35.8/36.6→39.1/镜头34.5，全部 HUD 按片段求值
- `score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/day-night-flip/index.html) · [在库中查看](../../patterns.html#pattern/day-night-flip)
