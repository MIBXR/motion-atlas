# 可复现的胶片颗粒与暗角

## 实现 Prompt

动态胶片颗粒与暗角覆盖地图、照片和插画，统一整片的质感。复用地图巡礼的 render、sceneCanvas、paintScene、grainPass、vignette 与对应 CSS。地图、kix 照片画布与回忆插画三段全屏底，以及案例颗粒和暗角。片段：地图固定 caseT 10.4；kix 照片画布固定 caseT 13.5；回忆插画画布固定 caseT 27.56；时长 7.5s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定地图底图与给定 caseT 的程序画布，声音由 score.json 挂接。

## 参数

- **时长**：7.5s
- **声音 voice**：vinyl

## 动效 Token

- **地图上的颗粒**：0s
- **照片颗粒**：2.5s
- **插画颗粒**：5s
- **时长**：7.5s

## 迁移

- `动效函数`：配置场景绘制、颗粒与暗角。
- `依赖`：配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。
- `需要的数据`：颗粒按floor(t×12)定位；10.4s地图配机窗照片与回忆。
- `config.js → segments / markers`：地图固定 10.4/kix 照片画布固定 13.5/回忆插画画布固定 27.56
- `score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/film-grain/index.html) · [在库中查看](../../patterns.html#pattern/film-grain)
