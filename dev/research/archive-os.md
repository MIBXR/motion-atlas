# 莱茵生命档案终端：接入说明

本案例复用 [LBEILC / RhineLabUI](https://github.com/LBEILC/RhineLabUI) 提交 `12cc5e4013acb9408f753ff71de6b8492299b7c8` 的源码、模型、字体、音频和档案内容。Motion Atlas 提供固定舞台、时间轴、预加载与统一音频协议；原版视觉、排版、字号、文案、动效参数与交互由上游实现负责。

源码快照及接入边界见 [UPSTREAM.md](../../vendor/rhinelabui/UPSTREAM.md)，许可见 [LICENSES.md](../../demos/cases/archive-os/LICENSES.md)。运行资源保存在 `demos/cases/archive-os/app/`，vendor 不进入站点发布包。

## 文件职责

| 位置 | 职责 |
| --- | --- |
| `vendor/rhinelabui/src/` | 开场、档案场景、解密、模型查看器、布局、画质和声音 |
| `vendor/rhinelabui/content/archives.json` | 五列各八份、共四十份档案的内容 |
| `vendor/rhinelabui/film/` | 虚拟时钟、输入时间表和离线音频 |
| `vendor/rhinelabui/build.mjs` | 构建相对路径 Vite 页面并复用 app 中的资源 |
| `demos/cases/archive-os/` | MotionKit 舞台、同源 iframe、时间轴、预加载、手动模式和完整音轨 |

## 舞台与播放

舞台有横屏 1920×1080 和竖屏 1080×1920 两套画幅；iframe 尺寸与舞台相同。上游按宽高比选择布局，低于 1.05 时使用 portrait。外层通过 `app/index.html?film=1&quality=<q>` 加载应用，默认画质为 original；软件 GL 且未显式指定 quality 时使用 performance。

预加载包括字体、两份 GLB、白底首帧与完整音轨，沿用 MotionKit 的进度和 ready 协议。虚拟时钟以 60Hz 推进，输入和动画按同一时钟执行。播放跳过中间 GPU 绘制并保留状态更新；向后定位或手动操作后的定位会重新加载 iframe，从零推进到目标时刻。

暂停时的真实键盘、鼠标或触摸输入切到手动模式。再次播放或定位恢复预设演示。画幅切换重新加载另一尺寸的 iframe，并恢复当前时刻。

## 演示节拍

| 时刻 | 画面 |
| --- | --- |
| 0s | 白底开场、逐字输入 |
| 22s | 档案阵列展开 |
| 35s | 自动读取第一份档案 |
| 42.5s | 切换页签 |
| 49s | 360° 模型查看器 |
| 54.1s | 拆解 |
| 58.35s | 重组 |
| 60.6s | 返回阵列 |
| 62.6s | 四向循环浏览 |
| 77.6s | 结束 |

在仓库根目录运行 `npm run build:archive` 更新 app 构建产物，运行 `npm run build:site` 打包站点。完整音轨通过同一个 WebAudio 采样声部供播放、暂停、定位和视频导出使用。
