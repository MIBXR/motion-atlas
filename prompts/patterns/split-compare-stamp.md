# 分屏对比与时间戳盖章

## 实现 Prompt

旧明信片与今日实景在横屏左右、竖屏上下对比，分割线划过后盖上时间戳。复用地图巡礼的 drawCompare、mountScene、sceneCanvas、paintScene 与对应 CSS。drawCompare 的两侧插画、分割线、边框与时间戳印章。片段：caseT 29→33.4；时长 6.133s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。 按 index.html 内联 segments 在原有 4.8 秒之后重放mg-hanazi 原片 8.167–9.5 秒，总时长 6.133 秒。综艺片的认证印章从 2.5 倍缩到落点，旋转回弹并带动相框镜震。画面与音轨沿用同一映射，声音默认关闭。

## 参数

- **时长**：6.133s
- **声音 voice**：whoosh、stamp、sub
- **追加原片区间**：mg-hanazi 原片 8.167–9.5 秒；s = lerp(2.5, 1, E.inQuad(k)); o = clamp(k * 2.2);
s = 1 - .09 * Math.exp(-w * 16) * Math.cos(w * 44);
kick(t, C.stamp, 14, 10, 13)

## 动效 Token

- **分屏**：0s
- **盖章**：1.65s
- **时长**：4.8s

## 迁移

- `动效函数`：配置分屏、两侧场景、边框与印章。
- `依赖`：配置舞台、时间轴、预加载、声音、横竖布局、颗粒与暗角。
- `需要的数据`：设置对比轨道、明信片与照片画布、横竖布局。
- `mechanism/config.js → segments / markers`：29→33.4
- `mechanism/score.json`：调整声音事件，按巧思时间对齐，保留音色参数。

[打开 Demo](../../demos/patterns/split-compare-stamp/index.html) · [在库中查看](../../patterns.html#pattern/split-compare-stamp)
