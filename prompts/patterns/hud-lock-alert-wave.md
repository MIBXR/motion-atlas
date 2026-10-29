# 锁定括号警报波

## 实现 Prompt

通过 MotionKit.replay 以 1 倍速依次重放mg-hud 原片 5.7–8.1 秒；总时长 2.4 秒。四角括号收拢吸附并蓄势，锁定主拍弹定标题、闪白并从目标发出改色波，警报脉冲随后衰减。参数保持原作数值：  "bracket_travel": [
    5.9,
    6.1667
  ]
  u.uWave.value = t >= LOCK ? E.outC(prog(t, LOCK, K.wave_dur)) * 1350 : -1;
  float inside = uWave < 0.0 ? 0.0 : 1.0 - smoothstep(uWave - 110.0, uWave, dw);
  float ann = uWave < 0.0 ? 0.0 : exp(-pow((dw - uWave + 22.0) / 40.0, 2.0)) * (1.0 - smoothstep(900.0, 1300.0, uWave));   // re-ink glow = 40 px annulus, not a disc
  // titles: LOCKED + 目标锁定 land clean on the impact frame (scale 1.15 → 1 over 3 frames, first frame white-hot); only the small lines scramble
直接调用来源案例 renderAt(t)，沿用画面、字体和同区间成品音轨，声音默认关闭。使用 1920×1080 横屏、30fps，支持播放、暂停、时间定位与减少动态偏好。

## 参数

- **原片重放区间**：mg-hud 原片 5.7–8.1 秒；1 倍速，总时长 2.4 秒。
- **锁定括号警报波参数**：  "bracket_travel": [
    5.9,
    6.1667
  ]
  u.uWave.value = t >= LOCK ? E.outC(prog(t, LOCK, K.wave_dur)) * 1350 : -1;
  float inside = uWave < 0.0 ? 0.0 : 1.0 - smoothstep(uWave - 110.0, uWave, dw);
  float ann = uWave < 0.0 ? 0.0 : exp(-pow((dw - uWave + 22.0) / 40.0, 2.0)) * (1.0 - smoothstep(900.0, 1300.0, uWave));   // re-ink glow = 40 px annulus, not a disc
  // titles: LOCKED + 目标锁定 land clean on the impact frame (scale 1.15 → 1 over 3 frames, first frame white-hot); only the small lines scramble

## 迁移

- `index.html 内联配置 → segments / markers`：调整来源片段与中文节点，画面和声音使用同一时刻映射。

[打开 Demo](../../demos/patterns/hud-lock-alert-wave/index.html) · [在库中查看](../../patterns.html#pattern/hud-lock-alert-wave)
