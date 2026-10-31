# 叮之前 · 桌面穿梭

## 实现 Prompt

制作《叮之前 · 桌面穿梭》这样的代码影片：一张猫照片从自己的手机出发，经压缩卡片、服务器和通知铃铛抵达朋友手机；镜头跟着照片飞越桌面，片尾拉远显出整场接力。照片既是贯穿全片的主角，也是解释数据流转的实体；镜头与焦点始终跟随同一物件，桌上四站构成可见的工作流。Three.js 体素猫、手机界面、应用卡片、纸垫、木桌和服务器均由原作代码绘制。Instrument Sans 400–700、IBM Plex Mono 500/600、Noto Sans SC 可变字重子集；英文与中文双行字幕。相机沿 shots.js 关键帧跟随照片和铃铛；20次子帧积累、Halton 抖动与随镜头速度变化的快门。原片中文 Microsoft edge-tts 晓晓旁白，120 BPM D大调马林巴、拨弦、钟琴与按事件合成的拟音。实现使用demos\cases\lemo-desktop-flythrough\film\src\film.js, demos\cases\lemo-desktop-flythrough\film\src\shots.js, demos\cases\lemo-desktop-flythrough\film\src\vo.js。

## 动效 Token

- **主体与场景**：film/src/film.js:build；照片、压缩卡、服务器、铃铛和两台手机共用桌面坐标。
- **镜头与快门**：film/src/main.js:FPS=30、SHUTTER=.3、accum.N=20；shutterAt 将高速拖影控制在约8px；film/src/camera.js:makeRig 读取 shots.js 的 KEYS。

## 制作约束

- 画面由上游render(t)直接绘制，按原作帧率定位。
- 修改字幕或场景文案后按source中的字体流程重建相同字重和字符子集。
- 声音使用原片混音，修改事件时同步更新声音制作文件。

## 迁移

- `film/src/film.js`：按原作数据与函数修改故事内容、画面和物件。
- `film/src/shots.js`：按原作数据与函数修改时间表、镜头和节拍。

[打开 Demo](../../demos/cases/lemo-desktop-flythrough/index.html) · [在库中查看](../../cases.html#case/lemo-desktop-flythrough)
