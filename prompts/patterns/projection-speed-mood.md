# 放映速度表情绪

## 实现 Prompt

用来源案例的原作render(t)实现“放映速度表情绪”。追逐与连锁喜剧按18fps取动作并提高放映闪烁速度、损伤强度；温情段回到16fps抽样和较干净、偏暖的胶片，让速度感与老化共同表达情绪。参数：film/film.js:LOOK/renderFilm，CHASE/MARKET fps=18，其余16；ta=floor(t×look.fps)/look.fps，胶片frame=floor(t×24)。；film/film.js:LOOK：CHASE crank=1.35/str=.85/sepia=.1，MARKET crank=1.3，TENDER str=.32/sepia=.34；film/engine/film.js消费crank。。复用来源字体、素材和同区间音轨，声音默认关闭。

## 参数

- **原片重放区间**：lemo-silent-film：14.375000–45.882576秒，1倍速，总时长31.507576秒。

[打开 Demo](../../demos/patterns/projection-speed-mood/index.html) · [在库中查看](../../patterns.html#pattern/projection-speed-mood)
