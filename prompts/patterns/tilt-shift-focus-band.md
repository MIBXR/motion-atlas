# 移轴焦带

## 实现 Prompt

调用来源案例原作render(t)重放“移轴焦带”。以主体的屏幕投影高度定位一条清晰窄带，带外距离产生有符号散焦并与物理景深组合；带宽与追踪目标一起引导注意。 参数：film/main.js:tiltCenter追踪薇伦、广景固定.34/.36；film/post_ts.js:tiltAmt=17、tiltW=.075、tiltF=.3，与物理散焦取有符号合成。 film/main.js:cam的band.follow投影到.25–.75；鸭群半宽.05，释放起.035→.07；film/post.js:cb=sign(dy)·amp·pow(max(0,abs(dy)−w)/.5,pow)，与cp按mix混合。 使用index.html的segments映射原片时刻，复用来源素材、字体与同区间音轨，声音默认关闭。

## 参数

- **原片重放区间**：lemo-hd-2d 5.500000–10.000000秒；lemo-tilt-shift 0.000000–5.000000秒；lemo-tilt-shift 22.500000–25.200000秒；1倍速，总时长12.200000秒。

[打开 Demo](../../demos/patterns/tilt-shift-focus-band/index.html) · [在库中查看](../../patterns.html#pattern/tilt-shift-focus-band)
