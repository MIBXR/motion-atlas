# 许可与出处

原作《赛博朋克 HUD · KESTREL-9 · Target Acquired》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；原目录为 `demos/22-hud/`。代码、提示词、文档与成片采用 MIT 许可，许可原文见 [LICENSE](film/LICENSE)。

## 字体

| 完整文件与版本 | 官方来源 | 许可原文 |
| --- | --- | --- |
| `JetBrainsMono[wght].ttf`，Version 2.211 | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/6e4b84c976cadb3c49a40fd9a1c203e4f7fcf2da/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/jetbrainsmono-OFL.txt) |
| `Rajdhani-SemiBold.ttf`，Version 1.201;PS 1.0;hotconv 1.0.78;makeotf.lib2.5.61930; ttfautohint (v1.1) -l 7 -r 28 -G 50 -x 13 -D latn -f deva -w G | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/8772f86137e17678cbd3584ca9a3c9486c3e7e50/ofl/rajdhani/Rajdhani-SemiBold.ttf) | [SIL OFL 1.1 原文](fonts/rajdhani-OFL.txt) |
| `Rajdhani-Bold.ttf`，Version 1.201;PS 1.0;hotconv 1.0.78;makeotf.lib2.5.61930; ttfautohint (v1.1) -l 7 -r 28 -G 50 -x 13 -D latn -f deva -w G | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/8772f86137e17678cbd3584ca9a3c9486c3e7e50/ofl/rajdhani/Rajdhani-Bold.ttf) | [SIL OFL 1.1 原文](fonts/rajdhani-OFL.txt) |
| `ChakraPetch-SemiBold.ttf`，Version 1.000; ttfautohint (v1.6) | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/a4c8c2a0f77efa06765d596d64d077af1d7f0dae/ofl/chakrapetch/ChakraPetch-SemiBold.ttf) | [SIL OFL 1.1 原文](fonts/chakrapetch-OFL.txt) |
| `HarmonyOS_Sans_SC_Regular.ttf`，Version 1.0 | [华为官方完整归档](https://developer.huawei.com/images/download/general/HarmonyOS-Sans.zip) | [HarmonyOS Sans Fonts License Agreement 原文](fonts/HarmonyOS-Sans-LICENSE.txt) |
| `HarmonyOS_Sans_SC_Medium.ttf`，Version 1.0 | [华为官方完整归档](https://developer.huawei.com/images/download/general/HarmonyOS-Sans.zip) | [HarmonyOS Sans Fonts License Agreement 原文](fonts/HarmonyOS-Sans-LICENSE.txt) |
| `HarmonyOS_Sans_SC_Bold.ttf`，Version 1.0 | [华为官方完整归档](https://developer.huawei.com/images/download/general/HarmonyOS-Sans.zip) | [HarmonyOS Sans Fonts License Agreement 原文](fonts/HarmonyOS-Sans-LICENSE.txt) |
| `HarmonyOS_Sans_SC_Black.ttf`，Version 1.0 | [华为官方完整归档](https://developer.huawei.com/images/download/general/HarmonyOS-Sans.zip) | [HarmonyOS Sans Fonts License Agreement 原文](fonts/HarmonyOS-Sans-LICENSE.txt) |

## 第三方库

| 包与固定版本 | 来源 | 许可原文 |
| --- | --- | --- |
| `three@0.186.1` | [npm registry 原版 tarball](https://registry.npmjs.org/three/-/three-0.186.1.tgz) | [MIT 原文](vendor/three@0.186.1/LICENSE) |
| `d3@7.9.0` | [npm registry 原版 tarball](https://registry.npmjs.org/d3/-/d3-7.9.0.tgz) | [ISC 原文](vendor/d3@7.9.0/LICENSE) |
| `topojson-client@3.1.0` | [npm registry 原版 tarball](https://registry.npmjs.org/topojson-client/-/topojson-client-3.1.0.tgz) | [ISC 原文](vendor/topojson-client@3.1.0/LICENSE) |

仅保存作品直接引用的文件及其运行依赖与许可证。

## 地图数据

`assets/land-50m.json` 原样取自原作固定提交的 `demos/22-hud/assets/land-50m.json`，内容为 Natural Earth 1:50m 陆地 TopoJSON。原始数据来自 [Natural Earth 1:50m land](https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-land/)，[Natural Earth 使用条款](https://www.naturalearthdata.com/about/terms-of-use/)将其栅格与矢量地图数据置于公有领域。Three.js 读取海岸线，D3 与 topojson-client 生成陆地遮罩。

## 配乐

`audio/film.m4a` 从固定提交的 `videos/22-hud.mp4` 以 `ffmpeg -vn -c:a copy` 抽取 AAC 音轨，保留原片混音；成片与自制音频采用原作 MIT 许可。配乐生成过程原样保存在 `source/audio.py`，使用原作 `lib/audio/mgaudio` 的配乐与音效合成器。
