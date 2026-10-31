# 买咖啡 · 科幻情景喜剧卡通 · 制作文件

上游固定在[bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00](https://github.com/lemomo-ai/lemo-opuscar/tree/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/scifi-toon/demo)。运行源码与输入数据在`../film/`，字体在`../fonts/`，正式混音在`../audio/film.m4a`。

## 文件

| 文件 | 用途 |
| --- | --- |
| `asr.py` | 带静音填充的逐条对白识别。 |
| `build.sh` | 按上游目录执行配音、配乐、混音、渲染与合成。 |
| `CREDITS` | 作品、字体、声音与素材署名。 |
| `events.json` | 画面导出的动作与声音事件。 |
| `levels.py` | 读取并显示声音分轨电平。 |
| `mix.py` | 合成环境、拟音、配音和配乐并执行闪避。 |
| `music/score.py` | 生成原作采样或合成配乐。 |
| `sheet.sh` | 按时间输出镜头接触表。 |
| `srt.mjs` | 由原片对白时刻导出字幕。 |
| `strip.sh` | 按连续帧输出动作条。 |
| `voice.py` | 处理角色声音、打断和口型包络。 |
| `voices/words.json` | 配音逐词识别时间。 |

## 重建

在上游目录结构`styles/scifi-toon/demo/`工作：将`../film/`中的作品源码与运行JSON放回demo目录，将本目录制作文件按相对路径覆盖，字体放回demo/fonts/。`film/index.html`的import map和本库素材路径按上游目录入口设置。

共享制作工具在[demos/materials/lemo-opuscar/core/](../../../materials/lemo-opuscar/core/README.md)：`render/`提供事件导出、字幕、逐帧渲染与合成；`tts/`提供Kokoro配音；`audio/`提供拟音、混音与采样乐器。运行中的`core/lib.js`副本在`../film/core/`。

命令从上游根目录按下列顺序执行，Python环境安装上游core/README列出的依赖：

```sh
D=styles/scifi-toon/demo
python core/tts/tts.py $D/lines.json $D/out/raw
python $D/voice.py
node core/render/events.mjs $D
python $D/music/score.py
python $D/mix.py
node $D/srt.mjs
node core/render/video.mjs $D --fps 24 --workers 4 --out $D/out/video24.mp4
sh core/render/mux.sh $D/out/video24.mp4 $D/mix.wav styles/scifi-toon/scifi-toon.mp4 24
```

## 字体与制作输入

| 字体文件 | 固定来源 |
| --- | --- |
| `baloo2.woff2` | [baloo2](https://fonts.gstatic.com/s/baloo2/v23/wXKrE3kTposypRyd51jcAM4olXc.woff2) |
| `titanone.woff2` | [titanone](https://fonts.gstatic.com/s/titanone/v17/mFTzWbsGxbbS_J5cQcjClDgm-khykw.woff2) |
| `bungee.woff2` | [bungee](https://fonts.gstatic.com/s/bungee/v17/N0bU2SZBIuF2PU_0DXR1C9zfmQ.woff2) |
| `vt323.woff2` | [vt323](https://fonts.gstatic.com/s/vt323/v18/pxiKyp0ihIEF2isfFJXUdVNF.woff2) |

字重、格式与拉丁子集按`../fonts/fonts.css`加载；许可原文同目录提供。

Kokoro模型与voices-v1.0.bin按共享`core/README.md`取得；生成的单句WAV、分轨、mix.wav、渲染视频由以上制作顺序输出。
