# 许可与出处

原作《80 年代合成波 · NEON DRIVE — Midnight 1986》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；原目录为 `demos/10-synthwave/`。代码、提示词、文档与成片采用 MIT 许可，许可原文见 [LICENSE](film/LICENSE)。

## 字体

| 完整文件与版本 | 官方来源 | 许可原文 |
| --- | --- | --- |
| `Archivo-Italic[wdth,wght].ttf`，Version 2.001 | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/95f4904fc8bcf26d3420fe315560c96417c6dec7/ofl/archivo/Archivo-Italic%5Bwdth%2Cwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/archivo-OFL.txt) |
| `MrDafoe-Regular.ttf`，Version 1.000 | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/a99fe31b6b2cbcb0481ad633abe5d996a9399344/ofl/mrdafoe/MrDafoe-Regular.ttf) | [SIL OFL 1.1 原文](fonts/mrdafoe-OFL.txt) |
| `Michroma-Regular.ttf`，Version 1.100; ttfautohint (v1.8.4.7-5d5b);gftools[0.9.29] | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/michroma/Michroma-Regular.ttf) | [SIL OFL 1.1 原文](fonts/michroma-OFL.txt) |
| `VT323-Regular.ttf`，Version 2.000 | [Google Fonts 官方完整文件](https://raw.githubusercontent.com/google/fonts/2da41909d08a7bfeab32cfc163edb7be0c34395d/ofl/vt323/VT323-Regular.ttf) | [SIL OFL 1.1 原文](fonts/vt323-OFL.txt) |

## 第三方库

| 包与固定版本 | 来源 | 许可原文 |
| --- | --- | --- |
| `three@0.186.1` | [npm registry 原版 tarball](https://registry.npmjs.org/three/-/three-0.186.1.tgz) | [MIT 原文](vendor/three@0.186.1/LICENSE) |
| `simplex-noise@4.0.3` | [npm registry 原版 tarball](https://registry.npmjs.org/simplex-noise/-/simplex-noise-4.0.3.tgz) | [MIT 原文](vendor/simplex-noise@4.0.3/LICENSE) |
| `opentype.js@2.0.0` | [npm registry 原版 tarball](https://registry.npmjs.org/opentype.js/-/opentype.js-2.0.0.tgz) | [MIT 原文](vendor/opentype.js@2.0.0/LICENSE) |

仅保存作品直接引用的文件及其运行依赖与许可证。

本案例的画面贴图由运行代码生成，没有共享贴图文件。

## 配乐

`audio/film.m4a` 从固定提交的 `videos/10-synthwave.mp4` 以 `ffmpeg -vn -c:a copy` 抽取 AAC 音轨，保留原片混音；成片与自制音频采用原作 MIT 许可。配乐生成过程原样保存在 `source/audio.py`，使用原作 `lib/audio/mgaudio` 的配乐与音效合成器。
