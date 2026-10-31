# 两条螺旋 · 数据实物化 · 接入与保真说明

完整代码影片，固定版本见[条目JSON](../../../entries/cases/lemo-data-physical.json)。

## 相对原作的删改

| 文件 | 删改内容 | 原因 |
| --- | --- | --- |
| index.html | 按原fps调用原作render(t)，等待iframe load与READY；预载运行资源并挂接成片音轨。 | 接入MotionKit的时间线、定位、播放与减少动态。 |
| film/index.html | 字体与import map定位到本案例fonts/、film/core/与固定three.js子集。 | 接入本地路径。 |
| audio/film.m4a | 由Release公开成片以-c:a copy提取。 | 保留原成片混音。 |
| source/ | 保存上游不参与成品运行的制作文件与原始来源、许可证据；stills留在上游。 | 保留重建所需资料。 |
| film/set.js | /core/assets/polyhaven/改为../assets/；out/cues.json按原export.mjs生成。 | 原纹理、HDRI与字幕路径接入。 |

## 适配层

`MotionKit.load.prepare`预载资源，等待原作`READY`；`MotionKit.mountFilm`使用1920×1080、24fps、39.375000秒，`renderAt(t)`调用并等待`render(round(t×fps)/fps)`。镜头标记取DEMO.md的Shots。

`?embed`隐藏工具栏，`?render`暂停播放与声音，`?t=秒`定位；减少动态时停在37.8秒。音轨为公开成片流复制，默认关闭。画面由原作render(t)直接生成。


## 与原片对照结果

无头Edge使用`--enable-gpu --ignore-gpu-blocklist --font-render-hinting=none --force-color-profile=srgb`，1920×1080、DPR 1；三维与灯台使用Intel Iris Xe / ANGLE Direct3D11。等待`__motion.ready`并按`round(t×fps)/fps`定位。参考PNG从Release成片按相同帧号精确提取。

原始列比较参考PNG与本库PNG；编码链列将本库画面以JPEG95、libx264 medium CRF14 yuv420p，再以slow CRF19编码解码；全部编码在过程目录完成。颗粒取上游build.sh的mux参数：0。颗粒滤镜先推进到原视频帧号，再选择测量帧，保持相同的时间相位。编码参数见source/build.sh和共享core/render/video.mjs、mux.sh。

编码链值使用单帧I帧测量。两张图像均转yuv444p，取ffmpeg SSIM All。左右拼图保存在过程目录renders/<id>/，左为参考、右为本库。


| 视频帧号 | 实际秒 | 原始SSIM All | 编码链SSIM All | 覆盖 |
| --- | --- | --- | --- | --- |
| 0 | 0.000000 | 0.994962 | 0.995424 | 开头 |
| 907 | 37.791667 | 0.985330 | 0.988345 | frame_sec |
| 30 | 1.250000 | 0.989851 | 0.990691 | Shots · 2014年成对堆片中点 |
| 120 | 5.000000 | 0.988983 | 0.988423 | Shots · 成对读数与判断中点 |
| 214 | 8.916667 | 0.993844 | 0.993558 | Shots · 单位片特写中点 |
| 330 | 13.750000 | 0.987096 | 0.990750 | Shots · 沿年份攀升中点 |
| 480 | 20.000000 | 0.971992 | 0.977809 | Shots · 2021年反超中点 |
| 574 | 23.916667 | 0.971459 | 0.981735 | Shots · 后续年份加速中点 |
| 664 | 27.666667 | 0.990453 | 0.992329 | Shots · 2025年新增片中点 |
| 773 | 32.208333 | 0.979210 | 0.986302 | Shots · 拉远成装置中点 |
| 885 | 36.875000 | 0.984964 | 0.987803 | Shots · 黄铜倍数与片尾中点 |
| 921 | 38.375000 | 0.985363 | 0.988549 | 片尾前1秒 |

12帧：原始最低0.971459、最高0.994962；编码链最低0.977809、最高0.995424。

声音：原片与audio/film.m4a解码为48kHz单声道，每10ms取RMS包络，在±500ms内互相关；最佳偏移0ms，相关系数1.000000。
