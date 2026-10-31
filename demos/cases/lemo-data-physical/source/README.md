# 两条螺旋 · 数据实物化 · 制作文件

运行画面在`../film/`，字体在`../fonts/`，原片音轨在`../audio/film.m4a`。本目录保存固定提交的制作文件。

| 文件 | 用途 |
| --- | --- |
| `build.sh` | 整片重建入口。 |
| `CREDITS` | 上游作者、素材、字体与声音署名。 |
| `data/owid_solar_capacity.metadata.json` | 数据集原始元数据与许可。 |
| `data/owid_wind_capacity.metadata.json` | 数据集原始元数据与许可。 |
| `events.json` | 原作画面与声音事件。 |
| `FACTS.md` | 原片事实、数据与测量方法。 |
| `mix.py` | 原作配乐、拟音、旁白混音。 |
| `tools/export.mjs` | 从时间线与旁白实长生成字幕和制作数据。 |
| `tools/fonts.mjs` | 按时间线文字下载字体子集。 |
| `tools/holdcheck.py` | 上游制作辅助工具：holdcheck。 |
| `tools/srt.mjs` | 上游制作辅助工具：srt。 |
| `tools/subcheck.mjs` | 上游制作辅助工具：subcheck。 |
| `voice/lines.json` | 旁白文字与声线、语速。 |
| `voice/out/dur.json` | 原旁白逐句实长。 |
| `voice/out/words.json` | 原旁白词级时刻。 |
| `PolyHaven-SOURCES.md` | Poly Haven纹理与HDRI原始来源记录。 |

## 重建

1. 在库外新建原作demo目录，合入本目录；把`../film/`中的作品文件放回原作根目录，恢复入口、core、素材和字体的原相对URL。接入改动见[保真说明](../fidelity.md)。
2. 将`assets/data/*.csv`与`source/data/`合入制作目录的`data/`，`fonts/fonts.css`放回根目录并把字体URL恢复为`fonts/`；胡桃木纹和HDRI放入共享core/assets/polyhaven/。
3. `node tools/fonts.mjs <demo>` → `node tools/export.mjs <demo>`。
4. 设置`LIB`为上游工具根目录，运行`sh build.sh`完成原作的画面、声音与封装。

共用工具在[lemo-opuscar/core/](../../../materials/lemo-opuscar/core/README.md)：`render/`负责逐帧与封装，`audio/`提供采样与合成，`tts/`提供旁白。three.js案例使用固定r170，运行子集位于本案例vendor/。

## 库外输入

| 输入 | 取得位置 |
| --- | --- |
| 采样库与Kokoro模型 | 共享core/README.md与tools/fetch.sh的Release资产。 |
