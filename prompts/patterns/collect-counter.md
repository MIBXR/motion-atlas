# 收集计数徽章与图鉴托盘 · 复用 Prompt

由 [结构化条目](../../entries/patterns/collect-counter.json) 自动生成。

## 实现 Prompt

每到一站计数滚动加一，印章落进托盘，步进器同步前进。复用地图巡礼的 drawHud、stepAtX、ruleX、stampXY 与对应 CSS。MIKAN 徽章、收集计数、印章托盘与 drawHud 的步进器。片段：caseT 8.1→8.9；caseT 12.6→14；caseT 19.2→20.4；caseT 41.8→43；caseT 51.2→52.6；时长 6.6s。使用横屏 1920×1080 与竖屏 1080×1920 的案例布局；按 config.js 的 segments / markers 重放，使用固定底图与屏幕锚点，声音由 score.json 挂接。

## 参数

- **徽章出现**：0s
- **×1 + 关空**：0.8s
- **×2 + 京都**：2.2s
- **×3 + 奈良**：3.4s
- **×4 + 大阪**：4.6s
- **时长**：6.6s
- **声音 voice**：confirm、stamp、sparkle

## 动效 Token

- **徽章出现**：0s
- **×1 + 关空**：0.8s
- **×2 + 京都**：2.2s
- **×3 + 奈良**：3.4s
- **×4 + 大阪**：4.6s
- **时长**：6.6s

## 迁移

- `复制的函数`：drawHud、stepAtX、ruleX、stampXY
- `依赖`：MotionKit.stage / timeline / expose / preload / audio；案例 CSS 变量、横竖选择器、颗粒与暗角。
- `需要的数据`：config.js 的 mascot、stepper、tracks.counter / stamps / progress 与横竖 layout。
- `config.js → segments / markers`：caseT 8.1→8.9；caseT 12.6→14；caseT 19.2→20.4；caseT 41.8→43；caseT 51.2→52.6
- `score.json`：事件 voice：confirm、stamp、sparkle；保持 inventory 中全部音色参数，t 映射为巧思时刻。

[打开 Demo](../../demos/patterns/collect-counter/index.html) · [在库中查看](../../patterns.html#pattern/collect-counter)
