# 许可与出处

原作《液态动效 · drop. — It All Starts with a Drop》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；原目录为 `demos/07-liquid/`。代码、提示词、文档与成片采用 MIT 许可，许可原文见 [LICENSE](film/LICENSE)。

## 字体

| 完整文件与版本 | 官方来源 | 许可原文 |
| --- | --- | --- |
| `Fraunces[SOFT,WONK,opsz,wght].ttf`，Version 1.000;[b76b70a41] | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/4024282d9b0cffcdb8e3024560862746178d741f/ofl/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/fraunces-OFL.txt) |
| `NotoSerifSC[wght].ttf`，Version 2.003-H1;hotconv 1.1.1;makeotfexe 2.6.0 | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/notoserifsc-OFL.txt) |
| `Inter[opsz,wght].ttf`，Version 4.001;git-66647c0bb | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/0b58fb370093f9a9f4ff785d94405710b79de67c/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/inter-OFL.txt) |

`Fraunces-Liquid-72-900-Soft.ttf` 由上述完整 Fraunces 可变字体在 `opsz=72 wght=900 SOFT=50 WONK=1` 实例化，保留原作文件名；`Soft` 对应字体 STAT 命名表的 50，`WONK=1` 为可变字体默认值。完整可变原文件一并保留；命令见 [fidelity.md](fidelity.md)。

本案例没有 vendor 包。

本案例的画面贴图由运行代码生成，没有共享贴图文件。

## 配乐

`audio/film.m4a` 从固定提交的 `videos/07-liquid.mp4` 以 `ffmpeg -vn -c:a copy` 抽取 AAC 音轨，保留原片混音；成片与自制音频采用原作 MIT 许可。配乐生成过程原样保存在 `source/audio.py`，使用原作 `lib/audio/mgaudio` 的配乐与音效合成器。
