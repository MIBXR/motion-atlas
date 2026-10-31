# 叮之前 · 桌面穿梭 · 制作源文件

运行画面在 `../film/`，字体在 `../fonts/`，成片原混音在 `../audio/film.m4a`。本目录保留上游制作脚本与输入数据，相对目录结构保持原样。

## 文件

| 文件 | 用途 |
| --- | --- |
| `audio/compose.py` | 从和声和画面事件编排配乐。 |
| `audio/foley.py` | 按画面事件与相机速度合成拟音。 |
| `audio/mix.py` | 合成声音、剪辑旁白并混合成片音轨。 |
| `audio/vo_timeline.py` | 从语音时长生成旁白时间表。 |
| `build.sh` | 按顺序取得素材、制作声音、渲染并合成成片。 |
| `CREDITS` | 作品、声音、字体和素材的上游署名与许可。 |
| `FACTS.md` | 画面数字、叙事事实和逐项来源。 |
| `music/harmony.json` | 和声、调性与乐句输入。 |
| `tools/camspeed.mjs` | 采样相机速度供呼啸音效使用。 |
| `tools/chars.txt` | 字体子集的画面字符。 |
| `tools/subset.py` | 从原字体提取全部画面字符。 |
| `vo/dur.json` | 逐句旁白时长。 |
| `vo/lines.json` | 语音文案、角色与语速。 |
| `vo/lines_en.json` | 英语版本旁白文案。 |
| `vo/timeline.json` | 原作分段、节拍与时间节点。 |
| `vo/words.json` | 逐词语音时间戳。 |

## 重建顺序

在固定提交 `bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00` 的完整上游目录中，将本目录文件与 `../film/` 合为原 `demo/` 结构，入口使用固定上游的 `index.html`；字体放回 `fonts/`。`<demo>` 指该目录，`<core>` 指上游共享运行与制作代码。

```sh
python tools/subset.py
python <core>/tts/tts_zh.py vo/lines.json vo --voice zh-CN-XiaoxiaoNeural --rate +15%
python audio/vo_timeline.py
node <core>/render/events.mjs <demo> --out out/events.json
node tools/camspeed.mjs out/camspeed.json
python audio/compose.py
python audio/foley.py out/events.json out/camspeed.json music/harmony.json out/sfx.wav
python audio/mix.py music/score.wav out/sfx.wav out/mix_zh.wav -4
node <core>/render/video.mjs <demo> --fps 30 --workers 3 --out out/video.mp4
sh <core>/render/mux.sh out/video.mp4 out/mix_zh.wav desktop-flythrough.mp4 30 0
```

共享依赖见 [`demos/materials/lemo-opuscar/core/`](../../../materials/lemo-opuscar/core/) 的 `render/`、`audio/`、`tts/`；运行用的共享代码同时保存在 `../film/core/`。原作完整命令与声音工具调用顺序见 `build.sh`。

## 素材与大文件来源

- [固定上游源码](https://github.com/lemomo-ai/lemo-opuscar/tree/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/desktop-flythrough)。
- [原片音轨来源](https://github.com/lemomo-ai/lemo-opuscar/releases/download/films/desktop-flythrough.mp4)：从MP4以 `ffmpeg -i desktop-flythrough.mp4 -vn -c:a copy film.m4a` 取得。
- [乐器采样](https://github.com/lemomo-ai/lemo-opuscar/releases/tag/assets)：FreePats、VSCO2 CE与VCSL按CREDITS取得；语音模型、原始声音与制作缓存保留在工作区。
- 字体取Google Fonts的Instrument Sans、IBM Plex Mono和Noto Sans SC；`tools/subset.py`按 `src/*.js` 与 `index.html` 提取179个字符。旁白使用Microsoft在线语音，中文晓晓、英文Ava，当前收录中文成片混音。
