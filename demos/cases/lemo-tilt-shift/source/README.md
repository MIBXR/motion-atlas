# 玩具城早高峰 · 移轴微缩 · 制作文件

上游固定在[bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00](https://github.com/lemomo-ai/lemo-opuscar/tree/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/tilt-shift/demo)。运行源码与输入数据在`../film/`，字体在`../fonts/`，正式混音在`../audio/film.m4a`。

## 文件

| 文件 | 用途 |
| --- | --- |
| `build.sh` | 按上游目录执行配音、配乐、混音、渲染与合成。 |
| `CREDITS` | 作品、字体、声音与素材署名。 |
| `cues.json` | 旁白字幕时间表。 |
| `events.json` | 画面导出的动作与声音事件。 |
| `lines.json` | 配音文本、声音与语速。 |
| `mix.py` | 合成环境、拟音、配音和配乐并执行闪避。 |
| `music/CREDITS.txt` | 原配乐与采样署名。 |
| `music/cues.json` | 各段配乐提示点。 |
| `music/score.py` | 生成原作采样或合成配乐。 |
| `subs.mjs` | 导出旁白字幕数据。 |
| `voices/words.json` | 配音逐词识别时间。 |

## 重建

在上游目录结构`styles/tilt-shift/demo/`工作：将`../film/`中的作品源码与运行JSON放回demo目录，将本目录制作文件按相对路径覆盖，字体放回demo/fonts/。`film/index.html`的import map和本库素材路径按上游目录入口设置。

共享制作工具在[demos/materials/lemo-opuscar/core/](../../../materials/lemo-opuscar/core/README.md)：`render/`提供事件导出、字幕、逐帧渲染与合成；`tts/`提供Kokoro配音；`audio/`提供拟音、混音与采样乐器。运行中的`core/lib.js`副本在`../film/core/`。

命令从上游根目录按下列顺序执行，Python环境安装上游core/README列出的依赖：

```sh
D=styles/tilt-shift/demo
python core/tts/tts.py $D/lines.json $D/voices
node core/render/events.mjs $D
node $D/subs.mjs
python core/render/srt.py $D/cues.json styles/tilt-shift/tilt-shift.srt
python $D/music/score.py
python $D/mix.py
node core/render/video.mjs $D --fps 24 --workers 3 --q noev --out $D/out/video24.mp4
sh core/render/mux.sh $D/out/video24.mp4 $D/mix.wav styles/tilt-shift/tilt-shift.mp4 24 1
```

## 字体与制作输入

| 字体文件 | 固定来源 |
| --- | --- |
| `Overpass-var.ttf` | [overpass](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/overpass/Overpass%5Bwght%5D.ttf) |
| `OverpassMono-var.ttf` | [overpassmono](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/overpassmono/OverpassMono%5Bwght%5D.ttf) |

字重、格式与拉丁子集按`../fonts/fonts.css`加载；许可原文同目录提供。

采样乐器由共享`core/audio/`的上游取样脚本取得；乐器路径、版本与来源见music/score.py及music/CREDITS.txt。

Kokoro模型与voices-v1.0.bin按共享`core/README.md`取得；生成的单句WAV、分轨、mix.wav、渲染视频由以上制作顺序输出。
