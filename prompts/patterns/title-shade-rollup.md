# 片头卷帘揭景

## 实现 Prompt

用来源案例lemo-rubber-hose的原作render(t)重放“片头卷帘揭景”。旋转旭日纹上的标题字母按拍点错相跳动；厨房已画在底下，整张片头卡向上移出，底沿的圆柱卷轴同步上升露出布景。保留参数：film/scenes.js:shotTitle：24瓣旭日纹旋转t×.22；角色时间q(t)为12fps；hopL(i)以相位i×.12产生26px跳动。；film/story.js:K.roll=[bar(3,4),bar(4)]=4.583333–5秒；shotTitle的lift=eio×1180，卷轴位于1080−lift，宽1476、高58。。按index.html中的segments映射时间，复用原作素材、字体和同区间音轨，声音默认关闭。

## 参数

- **原片重放区间**：0.000000–5.200000秒；1倍速，总时长5.200000秒。

[打开 Demo](../../demos/patterns/title-shade-rollup/index.html) · [在库中查看](../../patterns.html#pattern/title-shade-rollup)
