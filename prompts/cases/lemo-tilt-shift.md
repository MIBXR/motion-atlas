# 玩具城早高峰 · 移轴微缩

## 实现 Prompt

制作玩具城从黎明车灯光轨加速到早高峰，拥堵最密时俯冲到一群过路鸭子并降为实时，随后释放车流，升到城市电路板般的纹样。 交通系统的延时密度与一件微小事件相撞；焦带沿车和鸭子投影移动，长曝光车灯在世界空间画出行进路径。 延时车流按8Hz取样，×2–×6时12Hz，低于×2连续；22.5–24秒由×40降到×1，30–30.6秒释放回×40。 Three.js程序城市、交通、车站、列车、鸭群、云与世界空间光轨。 字体：Overpass 100–900、Overpass Mono 300–700。 声音：120 BPM原创采样马林巴配乐，VSCO CE与VCSL采样CC0；Kokoro am_adam，代码生成交通、鸭鸣与步声，降速采用磁带停转。 实现沿用lemo-tilt-shift的film/源码、素材与时间表。

## 动效 Token

- **降速**：film/story.js:jamRate / T.rampDown=[22.5,24]、rampUp=[30,30.6]；film/main.js:stepped / jamCam。
- **焦带与光轨**：film/post.js:cocShader与dof.band；film/main.js:band.follow；film/traffic.js:makeTrails，14段顶点、白色头灯与红色尾灯加色条带。

## 迁移

- `film/story.js → WINDOWS / T / SHOTS`：修改城市时钟、延时倍率、俯冲与鸭子事件。
- `film/main.js → cam / jamCam；film/post.js → band`：修改追踪主体、焦带、俯冲和拉高路线。

[打开 Demo](../../demos/cases/lemo-tilt-shift/index.html) · [在库中查看](../../cases.html#case/lemo-tilt-shift)
