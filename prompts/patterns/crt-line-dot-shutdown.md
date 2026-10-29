# 显像管线点收屏

## 实现 Prompt

通过 MotionKit.replay 以 1 倍速依次重放mg-synthwave 原片 9.467–9.966666667 秒；mg-hud 原片 9.5667–9.966666667 秒；总时长 0.899633333 秒。整幅画面先沿纵向压成水平亮线，再沿横向缩成磷光点并熄灭。参数保持原作数值：  if (fr >= st) return CUES.stop + (Math.floor(fr / 2) * 2 - st) / FPS * .5;           // STOP: tape winds down
const CRT = { 295: [1, .30, .25, 0], 296: [1, .0019, 1, .030], 297: [.26, .0019, 1.1, .022], 298: [.0073, .013, 1.3, .036], 299: [.0055, .010, .35, .012] };
    col += vec3(1., .92, .98) * uCrtG * exp(-ly*ly / 1.1) * exp(-lx*lx / 5.);                 // the hot line / dot
  bloom.radius = 0.45 - (t >= LOCK ? 0.2 * Math.exp(-(t - LOCK) * 4) : 0); v.uClose.value = prog(t, 9.7667, 0.2);
  float cz = uClose, csy = 1.0, csx = 1.0;
  if (cz > 0.0) { csy = max(pow(1.0 - min(cz / 0.6, 1.0), 2.2), 0.003); csx = cz > 0.6 ? max(1.0 - (cz - 0.6) / 0.4, 0.0) : 1.0; }
  vec2 uv = cz > 0.0 ? vec2(0.5 + (vUv.x - 0.5) / max(csx, 1e-3), 0.5 + (vUv.y - 0.5) / csy) : vUv; float g = uGlitch;
  // micro-glitch: horizontal slice displacement (seeded per frame)
  float bnd = floor(uv.y * 54.0), hb = h11(bnd * 1.7 + uFrame * 13.1);
  float sl = step(1.0 - 0.22 * g, hb);
直接调用来源案例 renderAt(t)，沿用画面、字体和同区间成品音轨，声音默认关闭。使用 1920×1080 横屏、30fps，支持播放、暂停、时间定位与减少动态偏好。

## 参数

- **原片重放区间**：mg-synthwave 原片 9.467–9.966666667 秒；mg-hud 原片 9.5667–9.966666667 秒；1 倍速，总时长 0.899633333 秒。
- **显像管线点收屏参数**：  if (fr >= st) return CUES.stop + (Math.floor(fr / 2) * 2 - st) / FPS * .5;           // STOP: tape winds down
const CRT = { 295: [1, .30, .25, 0], 296: [1, .0019, 1, .030], 297: [.26, .0019, 1.1, .022], 298: [.0073, .013, 1.3, .036], 299: [.0055, .010, .35, .012] };
    col += vec3(1., .92, .98) * uCrtG * exp(-ly*ly / 1.1) * exp(-lx*lx / 5.);                 // the hot line / dot
- **全息屏线点关机参数**：  bloom.radius = 0.45 - (t >= LOCK ? 0.2 * Math.exp(-(t - LOCK) * 4) : 0); v.uClose.value = prog(t, 9.7667, 0.2);
  float cz = uClose, csy = 1.0, csx = 1.0;
  if (cz > 0.0) { csy = max(pow(1.0 - min(cz / 0.6, 1.0), 2.2), 0.003); csx = cz > 0.6 ? max(1.0 - (cz - 0.6) / 0.4, 0.0) : 1.0; }
  vec2 uv = cz > 0.0 ? vec2(0.5 + (vUv.x - 0.5) / max(csx, 1e-3), 0.5 + (vUv.y - 0.5) / csy) : vUv; float g = uGlitch;
  // micro-glitch: horizontal slice displacement (seeded per frame)
  float bnd = floor(uv.y * 54.0), hb = h11(bnd * 1.7 + uFrame * 13.1);
  float sl = step(1.0 - 0.22 * g, hb);

## 迁移

- `index.html 内联配置 → segments / markers`：调整来源片段与中文节点，画面和声音使用同一时刻映射。

[打开 Demo](../../demos/patterns/crt-line-dot-shutdown/index.html) · [在库中查看](../../patterns.html#pattern/crt-line-dot-shutdown)
