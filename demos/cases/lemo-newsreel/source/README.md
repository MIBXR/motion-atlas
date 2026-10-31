# 膝盖警报 · 1920s 新闻影片 · 制作文件

运行画面在`../film/`，字体在`../fonts/`，原片音轨在`../audio/film.m4a`。本目录保存固定提交的制作文件。

| 文件 | 用途 |
| --- | --- |
| `audio/mix.py` | 原作配乐、自然声、唱片和旁白混音。 |
| `build.sh` | 整片重建入口。 |
| `CREDITS` | 上游作者、素材、字体与声音署名。 |
| `events.json` | 原作画面与声音事件。 |
| `FACTS.md` | 原片事实、数据与测量方法。 |
| `SOURCES.jsonl` | 素材逐项原始记录。 |
| `SOURCES.md` | 第三方素材、许可、原地址和使用片段。 |
| `tools/cues.py` | 生成字幕时刻。 |
| `tools/fetch_sources.py` | 下载原片素材与字体。 |
| `tools/final_asr.py` | 上游制作辅助工具：final_asr。 |
| `tools/footage.py` | 上游制作辅助工具：footage。 |
| `tools/prep.py` | 原图裁切、调色、蒙版、分层或影像片段生成。 |
| `tools/subcheck.mjs` | 上游制作辅助工具：subcheck。 |
| `tools/timeline.py` | 上游制作辅助工具：timeline。 |
| `tools/voice.py` | Kokoro混合声线旁白与实长生成。 |
| `voice/lines.json` | 旁白文字与声线、语速。 |

## 重建

1. 在库外新建原作demo目录，合入本目录；把`../film/`中的作品文件放回原作根目录，恢复入口、core、素材和字体的原相对URL。接入改动见[保真说明](../fidelity.md)。
2. 保持`assets/`；原片素材下载到制作目录`raw/`，书页只读取leaf 0007与0034。
3. `python tools/fetch_sources.py` → `python tools/timeline.py` → `python tools/prep.py` → `python tools/voice.py voice/lines.json voice/out` → `python tools/cues.py`。
4. 设置`LIB`为上游工具根目录，运行`sh build.sh`完成原作的画面、声音与封装。

共用工具在[lemo-opuscar/core/](../../../materials/lemo-opuscar/core/README.md)：`render/`负责逐帧与封装，`audio/`提供采样与合成，`tts/`提供旁白。three.js案例使用固定r170，运行子集位于本案例vendor/。

## 库外输入

| 输入 | 取得位置 |
| --- | --- |
| 完整NARA视频、书页ZIP与唱片 | SOURCES.jsonl逐项url；视频起点见timeline.json的clips，书页为leaf 0007/0034。 |
