# 可复现的胶片颗粒与暗角

## 实现 Prompt

动态胶片颗粒与暗角覆盖地图、照片和插画，统一整片的质感。复用地图巡礼的 render、sceneCanvas、paintScene、grainPass、vignette 与对应 CSS。地图、kix 照片画布与回忆插画三段全屏底，以及案例颗粒和暗角。片段：地图固定 caseT 10.4；kix 照片画布固定 caseT 13.5；回忆插画画布固定 caseT 27.56；时长 27.5s：原有三段 7.5s，之后接几何包豪斯全片 10s，再接线条艺术全片 10s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定地图底图与给定 caseT 的程序画布，声音由 score.json 挂接。线条艺术段沿用原作固定种子 mulberry(f * 7919 + 13)，2048像素颗粒贴图逐帧偏移，overlay透明度0.1，与H * 0.35至W * 0.66的径向暗角共同覆盖金线画面；同区间原片音轨随时间轴播放，声音默认关闭。

## 参数

- **时长**：27.5s
- **声音 voice**：vinyl
- **线条片颗粒**：原片0–10秒，巧思17.5–27.5秒；const f = Math.floor(t * FPS + 1e-4), r = mulberry(f * 7919 + 13); const ox = Math.floor(r() * 2048), oy = Math.floor(r() * 2048); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.1；径向暗角H * 0.35、W * 0.66。

## 动效 Token

- **地图上的颗粒**：0s
- **照片颗粒**：2.5s
- **插画颗粒**：5s
- **时长**：27.5s

## 迁移

- `动效函数`：配置场景绘制、颗粒与暗角。
- `依赖`：配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。
- `需要的数据`：颗粒按floor(t×12)定位；10.4s地图配机窗照片与回忆。
- `config.js → segments / markers`：地图固定 10.4/kix 照片画布固定 13.5/回忆插画画布固定 27.56
- `score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/film-grain/index.html) · [在库中查看](../../patterns.html#pattern/film-grain)
