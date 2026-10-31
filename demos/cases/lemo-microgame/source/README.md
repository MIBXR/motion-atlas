# 五秒宇航员 · 微游戏快闪 · 制作文件

上游固定在[bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00](https://github.com/lemomo-ai/lemo-opuscar/tree/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/microgame/demo)。运行源码与输入数据在`../film/`，字体在`../fonts/`，正式混音在`../audio/film.m4a`。

## 文件

| 文件 | 用途 |
| --- | --- |
| `build.sh` | 按上游目录执行配音、配乐、混音、渲染与合成。 |
| `CREDITS` | 作品、字体、声音与素材署名。 |
| `events.json` | 画面导出的动作与声音事件。 |
| `frames.js` | 角色与七种媒介的制作样式表。 |
| `lines.json.asr.json` | 裁切口令后的语音识别文本。 |
| `mix.py` | 合成环境、拟音、配音和配乐并执行闪避。 |
| `music/CREDITS_music.txt` | 乐器与采样署名。 |
| `music/score.json` | 配乐导出的节拍与末击时间。 |
| `music/score.py` | 生成原作采样或合成配乐。 |
| `timeline.json` | 由timeline.js导出的音乐、画面共用关卡表。 |
| `tools/cuecheck.py` | 上游音画事件与节拍对齐工具。 |
| `tools/dump_timeline.mjs` | 导出关卡时间线JSON。 |
| `tools/final_asr.py` | 识别原成片中的配音。 |
| `tools/mux.sh` | 按CRF参数合成画面与混音。 |
| `tools/review.sh` | 输出成片接触表。 |
| `tools/subs.py` | 从对白生成字幕时间表。 |
| `tools/trim_cmd.py` | 按识别时间裁切一词口令的尾音。 |
| `voices/words.json` | 配音逐词识别时间。 |

## 重建

在上游目录结构`styles/microgame/demo/`工作：将`../film/`中的作品源码与运行JSON放回demo目录，将本目录制作文件按相对路径覆盖，字体放回demo/fonts/。`film/index.html`的import map和本库素材路径按上游目录入口设置。

共享制作工具在[demos/materials/lemo-opuscar/core/](../../../materials/lemo-opuscar/core/README.md)：`render/`提供事件导出、字幕、逐帧渲染与合成；`tts/`提供Kokoro配音；`audio/`提供拟音、混音与采样乐器。运行中的`core/lib.js`副本在`../film/core/`。

命令从上游根目录按下列顺序执行，Python环境安装上游core/README列出的依赖：

```sh
D=styles/microgame/demo
node $D/tools/dump_timeline.mjs
python core/tts/tts.py $D/lines.json $D/voices
python $D/tools/trim_cmd.py $D/lines.json $D/voices
python $D/music/score.py
node core/render/events.mjs $D
python $D/mix.py
python $D/tools/subs.py
python core/render/srt.py $D/out/srt.json styles/microgame/microgame.srt
node core/render/video.mjs $D --fps 24 --workers 3 --out $D/out/video24.mp4
CRF=20 sh $D/tools/mux.sh $D/out/video24.mp4 $D/mix.wav styles/microgame/microgame.mp4 24 0
```

## 字体与制作输入

| 字体文件 | 固定来源 |
| --- | --- |
| `TitanOne-Regular.ttf` | [titanone](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/titanone/TitanOne-Regular.ttf) |
| `LilitaOne-Regular.ttf` | [lilitaone](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/lilitaone/LilitaOne-Regular.ttf) |
| `VT323-Regular.ttf` | [vt323](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/vt323/VT323-Regular.ttf) |
| `ArchitectsDaughter-Regular.ttf` | [architectsdaughter](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/architectsdaughter/ArchitectsDaughter-Regular.ttf) |
| `GochiHand-Regular.ttf` | [gochihand](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/gochihand/GochiHand-Regular.ttf) |
| `Silkscreen-Regular.ttf` | [silkscreen](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/silkscreen/Silkscreen-Regular.ttf) |
| `Silkscreen-Bold.ttf` | [silkscreen](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/silkscreen/Silkscreen-Bold.ttf) |
| `Inter.ttf` | [inter](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf) |

字重、格式与拉丁子集按`../fonts/fonts.css`加载；许可原文同目录提供。

采样乐器由共享`core/audio/`的上游取样脚本取得；乐器路径、版本与来源见music/score.py及music/CREDITS_music.txt。

Kokoro模型与voices-v1.0.bin按共享`core/README.md`取得；生成的单句WAV、分轨、mix.wav、渲染视频由以上制作顺序输出。
