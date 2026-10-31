# 长曝光光轨

## 实现 Prompt

调用来源案例原作render(t)重放“长曝光光轨”。在世界空间按车辆过去的位置生成白色头灯与红色尾灯条带，沿历史方向衰减并以加色混合留在路面上，焦带和镜头继续独立运动。 参数：film/main.js:275–304，黎明主车14个历史位置铺成弯曲光轨；普通车根据曝光时间取首尾位置。 film/traffic.js:202–239，K=14、HEAD=[1,.86,.62]、TAIL=[1,.08,.04]；fade=t^1.6·I，AdditiveBlending、depthWrite=false、fog=false。 使用index.html的segments映射原片时刻，复用来源素材、字体与同区间音轨，声音默认关闭。

## 参数

- **原片重放区间**：lemo-tilt-shift 0.000000–5.000000秒；1倍速，总时长5.000000秒。

[打开 Demo](../../demos/patterns/long-exposure-light-trail/index.html) · [在库中查看](../../patterns.html#pattern/long-exposure-light-trail)
