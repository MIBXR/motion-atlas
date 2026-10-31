# 城市之光，1987 · 80 年代赛璐璐动画 · 制作文件

运行画面在`../film/`，字体在`../fonts/`，正式混音在`../audio/film.m4a`。本目录保留原作制作文件与原相对目录。

## 文件

| 文件 | 用途 |
| --- | --- |
| `lines.json` | 旁白文本、声线、速度或逐句配置。 |
| `CREDITS` | 原作素材、声音、字体的来源与署名。 |
| `events.json` | 画面导出的拟音与旁白事件表。 |
| `mix.py` | 合成配乐或拟音，叠加旁白、闪避与混音。 |
| `music/score.json` | 配乐音符、声部、节拍与音效时间数据。 |
| `music/score.py` | 原片配乐的可编辑乐谱与渲染入口。 |
| `test.js` | 原作风格帧、角色模型视图或绘制样张。 |
| `tools/mux.sh` | 原片编码、颗粒和响度合成入口。 |
| `tools/sheet.py` | 原作静帧与接触表制作工具。 |
| `tools/srt.py` | 导出字幕或生成SRT。 |
| `tools/still.mjs` | 原作静帧与接触表制作工具。 |

## 重建

在[上游固定提交](https://github.com/lemomo-ai/lemo-opuscar/tree/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00)的仓库根目录运行，Demo位置为`styles/cel-anime-80s/demo/`。本目录文件对应Demo内同名相对路径，`../film/`对应其绘制代码，字体放回Demo的`fonts/`。

共享制作工具与依赖位于本库[`demos/materials/lemo-opuscar/core/`](../../../materials/lemo-opuscar/core/README.md)：`tts/`制作与识别旁白，`audio/`提供合成、采样和混音，`render/`导出事件、逐帧渲染、字幕和编码。环境和采样取得方式见其中README和`core/audio/INSTRUMENTS.md`。

按下表取得字体并放回Demo的`fonts/`。

顺序命令：`core/tts/tts.py` → `core/tts/asr_check.py` → `music/score.py` → `core/render/events.mjs` → `mix.py` → `core/render/video.mjs --fps 24` → `tools/mux.sh` → `tools/srt.py`，路径参数见[上游DEMO.md](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/cel-anime-80s/DEMO.md#build-notes)。

## 字体与大文件来源

- `DelaGothicOne-Regular.ttf`：[同一家族源文件](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/delagothicone/DelaGothicOne-Regular.ttf)。
- `Kanit-BlackItalic.ttf`：[同一家族源文件](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/kanit/Kanit-BlackItalic.ttf)。
- `Kanit-ExtraBoldItalic.ttf`：[同一家族源文件](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/kanit/Kanit-ExtraBoldItalic.ttf)。
- `Kanit-SemiBoldItalic.ttf`：[同一家族源文件](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/kanit/Kanit-SemiBoldItalic.ttf)。
- `BarlowSemiCondensed-Medium.ttf`：[同一家族源文件](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/barlowsemicondensed/BarlowSemiCondensed-Medium.ttf)。
- `BarlowSemiCondensed-SemiBold.ttf`：[同一家族源文件](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/barlowsemicondensed/BarlowSemiCondensed-SemiBold.ttf)。
- `BarlowSemiCondensed-Bold.ttf`：[同一家族源文件](https://raw.githubusercontent.com/google/fonts/6c1dbe27dcf7d817d4b62cec033ba77fa8e2a5ec/ofl/barlowsemicondensed/BarlowSemiCondensed-Bold.ttf)。

成片：[Release/cel-anime-80s.mp4](https://github.com/lemomo-ai/lemo-opuscar/releases/download/films/cel-anime-80s.mp4)。旁白WAV、采样库、配乐stems与中间视频由制作脚本在上游环境生成；正式音轨在本体中以AAC流保存。所有资源署名见[../audio/CREDITS](../audio/CREDITS)。

制作依赖的大文件包按上游`tools/assets.json`取得：

- `voice`：[voice.tar](https://github.com/lemomo-ai/lemo-opuscar/releases/download/assets/voice.tar)。
