# 章节主题：标签、强调色与四角框线

## 实现 Prompt

章节标签配框线或胶带网点入场，为一段旅程划出章节。复用地图巡礼的 drawChapter、applyStaticLayout 与对应 CSS。drawChapter 的章节标签、框线、四角方块、胶带与网点。片段：caseT 24.2→25.85；caseT 33→33.8；caseT 40.6→44.8；重放总时长 9.45s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 mechanism/config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 mechanism/score.json 挂接。 在原有 7.05 秒之后依次重放mg-hud 原片 0–2.4 秒；全部重放总时长 9.45 秒。HUD 的边框、外环、刻度、面板和地球按开机节点错时描出，日志按同一层级依次上线。参数沿用：  "boot": {
    "frame": 0.12,
    "ring_outer": 0.4,
    "ring_ticks": 0.55,
    "ring_inner": 0.7,
    "panel_left": 0.9,
    "panel_right": 1.15,
    "hex": 1.2,
    "globe": 1.4,
    "log_lines": [
      0.4,
      0.9,
      1.4,
      1.9
  const p1 = E.outC(prog(t, K.boot.ring_outer, 0.5));
  v.uT.value = t; v.uFrame.value = f; v.uOpen.value = E.outC(prog(t, 0.0, 0.3)); v.uGlitch.value = glitch(t);
原有段的画面和时序保持原样，新增段沿用同区间原片音轨，声音默认关闭。

## 参数

- **时长**：9.45 秒
- **声音 voice**：bell、confirm
- **分层描线开机参数**：  "boot": {
    "frame": 0.12,
    "ring_outer": 0.4,
    "ring_ticks": 0.55,
    "ring_inner": 0.7,
    "panel_left": 0.9,
    "panel_right": 1.15,
    "hex": 1.2,
    "globe": 1.4,
    "log_lines": [
      0.4,
      0.9,
      1.4,
      1.9
  const p1 = E.outC(prog(t, K.boot.ring_outer, 0.5));
  v.uT.value = t; v.uFrame.value = f; v.uOpen.value = E.outC(prog(t, 0.0, 0.3)); v.uGlitch.value = glitch(t);

## 动效 Token

- **鸭川框线入场**：0s
- **框线退场**：1.65s
- **奈良胶带与网点**：2.45s
- **时长**：7.05s

## 迁移

- `../../cases/map-pilgrimage/film/script.js → drawChapter`：修改章节标签、标题、框线与胶带的实现。
- `mechanism/scene.html → script 与样式加载；../../cases/map-pilgrimage/film/script.js → layout、startPattern`：入口加载 MotionKit、来源案例的 ../../cases/map-pilgrimage/film/config.js、../../cases/map-pilgrimage/film/paths.js、../../cases/map-pilgrimage/film/scenes.js，以及本巧思配置；地图依赖地址在 ../../cases/map-pilgrimage/film/config.js → map，初始化在 ../../cases/map-pilgrimage/film/script.js → initMap。
- `../../cases/map-pilgrimage/film/config.js → chapters；tracks.chapter、layout`：修改章节标签、标题、强调色、框线与胶带。
- `mechanism/replay.js → config.segments / markers；mechanism/config.js → segments / markers`：mechanism/replay.js 设置地图与追加案例的重放区间、顺序和标记；mechanism/config.js 设置 mechanism/scene.html 地图片段。地图来源时刻：24.2→25.85/33→33.8/40.6→44.8。
- `mechanism/score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/chapter-frame/index.html) · [在库中查看](../../patterns.html#pattern/chapter-frame)
