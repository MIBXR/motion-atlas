# 买咖啡 · 科幻情景喜剧卡通

## 实现 Prompt

制作厌世天才与紧张搭档为买咖啡穿过果冻、杯子、牙齿、鸽子与克隆宇宙，回家后发现带回的是无咖啡因咖啡。 传送门把世界切换变成同一动作；每个宇宙独立配色、怪物与音乐，反应特写和突然静默组织笑点。 人物、口型与沸腾线稿按12fps取样；镜头、传送门与旋涡按24fps更新，吐出角色时先拉长、着地后衰减压扁。 Canvas2D程序绘制角色、怪物、道具、平涂色块和传送门。 字体：Baloo 2 400–800、Titan One 400、Bungee 400、VT323 400；Google Fonts 拉丁子集。 声音：原创代码合成配乐与拟音；Kokoro am_onyx、am_eric、af_sky（升7半音），荒诞揭示与冷场处切断音乐。 实现沿用lemo-scifi-toon的film/源码、素材与时间表。

## 动效 Token

- **传送门**：film/story.js:WIPES的中心时刻12.85、20.9、28.4、29.4、30.4、31.4、36.05秒，半宽.12–.2秒；film/main.js:renderWipe。
- **落地形变**：film/main.js:landSq / sucked / spit；落地sq=1−.22·exp(−9u)·cos(30u)，持续.5秒；飞出sq从1.25回到1。

## 迁移

- `film/story.js → SHOTS / WIPES / VO`：修改镜头、宇宙交接和对白起点。
- `film/worlds.js / chars.js`：修改每个世界与角色造型、配色和姿势。

[打开 Demo](../../demos/cases/lemo-scifi-toon/index.html) · [在库中查看](../../cases.html#case/lemo-scifi-toon)
