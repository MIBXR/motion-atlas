# 五项同步加速

## 实现 Prompt

调用来源案例原作render(t)重放“五项同步加速”。BPM、普通关时长、舞台停留、口令驻留和角色更新频率随轮次加快；Boss把前面各关的媒介拼成同一幅降落画面。 参数：film/timeline.js:120→140→160 BPM；普通关4→18/7秒，常规舞台2→6/7秒；G7另含两拍回放，Boss32拍=12秒。 film/film.js:R2 / tvInDur / tvOutDur / hold，口令.75→.64秒，Boss回到.75秒；g_crayon/g_ink/g_ascii/g_riso用8fps，g_pixel/g_blue/g_swiss用12fps，g_boss主体用连续lt，局部保留12fps线稿。 使用index.html的segments映射原片时刻，复用来源素材、字体与同区间音轨，声音默认关闭。

## 参数

- **原片重放区间**：lemo-microgame 0.000000–4.400000秒；lemo-microgame 25.500000–31.280000秒；lemo-microgame 39.850000–43.200000秒；1倍速，总时长13.530000秒。

[打开 Demo](../../demos/patterns/speed-up-ladder/index.html) · [在库中查看](../../patterns.html#pattern/speed-up-ladder)
