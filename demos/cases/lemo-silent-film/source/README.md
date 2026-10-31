# 逃跑的面包 · 1920s 默片 · 制作源文件

运行画面在 `../film/`，字体在 `../fonts/`，成片原混音在 `../audio/film.m4a`。本目录保留上游制作脚本与输入数据，相对目录结构保持原样。

## 文件

| 文件 | 用途 |
| --- | --- |
| `build.sh` | 按顺序取得素材、制作声音、渲染并合成成片。 |
| `CREDITS` | 作品、声音、字体和素材的上游署名与许可。 |
| `frames.js` | 上游人物、字卡和重绘示范图入口。 |
| `mix.py` | 合成声音、剪辑旁白并混合成片音轨。 |
| `music/CREDITS_music.txt` | 原作配乐的音色来源与署名。 |
| `music/score.json` | 原作配乐音符、乐句与段落。 |
| `music/score.py` | 按段落与画面事件合成原作配乐。 |
| `scenes/market.js` | 上游市场场景制作文件。 |
| `sheets.js` | 上游角色与布景示范图。 |
| `timeline.json` | 原作分段、节拍与时间节点。 |
| `tools/cuecheck.py` | 上游画音节点对照工具。 |
| `tools/dump_timeline.mjs` | 从时间表导出分段数据。 |
| `tools/subs.py` | 生成字幕时间段。 |

## 重建顺序

在固定提交 `bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00` 的完整上游目录中，将本目录文件与 `../film/` 合为原 `demo/` 结构，入口使用固定上游的 `index.html`；字体放回 `fonts/`。`<demo>` 指该目录，`<core>` 指上游共享运行与制作代码。

```sh
node tools/dump_timeline.mjs
python music/score.py
python mix.py
python tools/subs.py
node <core>/render/video.mjs <demo> --fps 24 --workers 3 --out out/video.mp4
sh <core>/render/mux.sh out/video.mp4 mix.wav silent-film.mp4 24 1
```

共享依赖见 [`demos/materials/lemo-opuscar/core/`](../../../materials/lemo-opuscar/core/) 的 `render/`、`audio/`、`tts/`。原作完整命令与声音工具调用顺序见 `build.sh`。

重绘示范输入来自 [DiagonalCrosswalkYongeDundas.webm](https://commons.wikimedia.org/wiki/File:DiagonalCrosswalkYongeDundas.webm)，Raysonho，CC0；frames.js的redrawSample使用其中一帧作为assets/redraw_src.jpg。

默片在最终mux后再用 `ffmpeg -i master.mp4 -c:v libx264 -preset slow -crf 25 -tune grain -c:a copy silent-film.mp4` 编码。

## 素材与大文件来源

- [固定上游源码](https://github.com/lemomo-ai/lemo-opuscar/tree/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/silent-film)。
- [原片音轨来源](https://github.com/lemomo-ai/lemo-opuscar/releases/download/films/silent-film.mp4)：从MP4以 `ffmpeg -i silent-film.mp4 -vn -c:a copy film.m4a` 取得。
- [乐器采样](https://github.com/lemomo-ai/lemo-opuscar/releases/tag/assets)：FreePats、VSCO2 CE与VCSL按CREDITS取得；语音模型、原始声音与制作缓存保留在工作区。
