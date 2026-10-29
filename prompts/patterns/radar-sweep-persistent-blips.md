# 雷达扫掠显点

## 实现 Prompt

通过 MotionKit.replay 以 1 倍速依次重放mg-hud 原片 2.2–6.6 秒；总时长 4.4 秒。扫描扇区转过目标方位时，目标点发亮并按最近扫过的时间衰减，列表读数随首次扫过上线。参数保持原作数值：    const a = (K.radar_theta0_deg + 180 * (t - K.radar_start) - 90) * DEG, tr = 0.6 * Math.PI, f = tr / (2 * Math.PI);
    const since = (((brg - b.brg) % 360) + 360) % 360 / 180, age = t - K.radar_start - (((b.brg - K.radar_theta0_deg) % 360 + 360) % 360) / 180;
  "radar_period": 2.0,
  "radar_theta0_deg": 52,
直接调用来源案例 renderAt(t)，沿用画面、字体和同区间成品音轨，声音默认关闭。使用 1920×1080 横屏、30fps，支持播放、暂停、时间定位与减少动态偏好。

## 参数

- **原片重放区间**：mg-hud 原片 2.2–6.6 秒；1 倍速，总时长 4.4 秒。
- **雷达扫掠显点参数**：    const a = (K.radar_theta0_deg + 180 * (t - K.radar_start) - 90) * DEG, tr = 0.6 * Math.PI, f = tr / (2 * Math.PI);
    const since = (((brg - b.brg) % 360) + 360) % 360 / 180, age = t - K.radar_start - (((b.brg - K.radar_theta0_deg) % 360 + 360) % 360) / 180;
  "radar_period": 2.0,
  "radar_theta0_deg": 52,

## 迁移

- `index.html 内联配置 → segments / markers`：调整来源片段与中文节点，画面和声音使用同一时刻映射。

[打开 Demo](../../demos/patterns/radar-sweep-persistent-blips/index.html) · [在库中查看](../../patterns.html#pattern/radar-sweep-persistent-blips)
