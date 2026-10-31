# 一物飞越应用卡片

## 实现 Prompt

用来源案例的原作render(t)实现“一物飞越应用卡片”。同一张照片在桌面应用卡片之间连续跳跃，相机以主体位置为目标跟随；经过压缩、云端存储、通知和取图后落入另一台手机。参数：film/src/film.js:build与ctx.subj；16×16猫在10.5秒受压，8×8副本从压缩卡继续接力。；film/src/camera.js:makeRig、film/src/shots.js:KEYS；film/src/main.js:applyAt以rig.target更新相机、太阳和景深焦平面。。复用来源字体、素材和同区间音轨，声音默认关闭。

## 参数

- **原片重放区间**：lemo-desktop-flythrough：7.600000–20.300000秒，1倍速，总时长12.700000秒。

[打开 Demo](../../demos/patterns/object-flythrough-apps/index.html) · [在库中查看](../../patterns.html#pattern/object-flythrough-apps)
