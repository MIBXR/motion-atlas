# 四角信息 HUD · 复用 Prompt

由 [结构化条目](../../entries/patterns/corner-hud.json) 自动生成。

## 实现 Prompt

为【影像/操作台】加一套四角 HUD：左上“DAY 01 / 03”（日序数字用强调色，变化时 460ms 从下方滚入）+ 12px 等宽日期；右上 12px 等宽纬经度与“ELEV · Z”缩放，旁边 26–44px 等宽大号时钟 + 时区角标；左下 NOW PLAYING（均衡器小图标）+ 曲名 — 艺人 + 一行加粗歌词与一行灰色译文（打字推进）；右下 4 站旅程步进器（节点实心表示已到达，连线按进度填充）；顶部贯穿一条 1px 细线，按旅程进度填充 3px 强调色。所有数值由时间轨道驱动、可 seek；中央完全留空给画面。所有文字 ≥12px。

## 参数

- **日序滚入**：460ms outCubic
- **歌词打字**：700ms 线性，副行延迟 400ms 淡入
- **进度细线**：与步进器共用同一进度值，inOutCubic
- **字号**：标签 12px 等宽、时钟 26–44px、日序 16–24px

[打开 Demo](../../demos/patterns/corner-hud/index.html) · [在库中查看](../../patterns.html#pattern/corner-hud)
