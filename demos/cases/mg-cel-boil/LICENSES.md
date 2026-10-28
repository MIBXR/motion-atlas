# 来源与许可

## 原作

- 作者：Vincentwei1021。
- 仓库：[mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)。
- 固定提交：`49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`。
- 原目录：`demos/05-cel-boil/`；原片：`videos/05-cel-boil.mp4`。
- 在线页：[mg-styles-15](https://vincentwei1021.github.io/mg-styles-15/)。
- 代码、Prompt、文档与原片采用 MIT 许可，原文副本见 [LICENSE](film/LICENSE)。

## 字体

| 字体与版本 | 本地完整文件 | 官方来源 | 许可 |
| --- | --- | --- | --- |
| LXGW Marker Gothic 1.004，400 字重 | `fonts/LXGWMarkerGothic-Regular.ttf` | [作者官方 v1.004 发布归档](https://github.com/lxgw/LxgwMarkerGothic/releases/download/v1.004/LxgwMarkerGothic-v1.004.zip)，取 `fonts/ttf/LXGWMarkerGothic-Regular.ttf` | SIL OFL 1.1，[本地原文](fonts/LXGWMarkerGothic-OFL.txt) |
| Caveat 2.000，500、600、700 字重 | `fonts/Caveat[wght].ttf` | [Google Fonts 官方完整可变字体](https://raw.githubusercontent.com/google/fonts/a85fc09e44c70c7159761adfdc9d5dd007792c15/ofl/caveat/Caveat%5Bwght%5D.ttf)，固定提交 `a85fc09e44c70c7159761adfdc9d5dd007792c15` | SIL OFL 1.1，[本地原文](fonts/Caveat-OFL.txt) |
| Long Cang 2.001，400 字重 | `fonts/LongCang-Regular.ttf` | [Google Fonts 官方完整字体](https://raw.githubusercontent.com/google/fonts/20da2e7644bac5325abbc9f30848ae3162bfc974/ofl/longcang/LongCang-Regular.ttf)，固定提交 `20da2e7644bac5325abbc9f30848ae3162bfc974` | SIL OFL 1.1，[本地原文](fonts/Longcang-OFL.txt) |

字体保留完整原文件与官方文件名；声明取自原作 `assets/fonts/fonts.css`。

## 固定版本库

| 包 | 本地文件 | 来源 | 许可 |
| --- | --- | --- | --- |
| opentype.js 2.0.0 | `vendor/opentype.js@2.0.0/dist/opentype.mjs` | [npm 2.0.0 tarball](https://registry.npmjs.org/opentype.js/-/opentype.js-2.0.0.tgz) | MIT，[本地原文](vendor/opentype.js@2.0.0/LICENSE) |
| simplex-noise 4.0.3 | `vendor/simplex-noise@4.0.3/dist/esm/simplex-noise.js` | [npm 4.0.3 tarball](https://registry.npmjs.org/simplex-noise/-/simplex-noise-4.0.3.tgz) | MIT，[本地原文](vendor/simplex-noise@4.0.3/LICENSE) |

## 纸纹与尘点

`assets/paper_base.jpg` 与 `assets/paper_tooth.png` 由保存在 `source/gen_paper.py` 的原作脚本从 [ambientCG Paper001](https://ambientcg.com/view?id=Paper001) 生成，原始纹理采用 [CC0](https://docs.ambientcg.com/license/)。`assets/dust_ink_01.png` 至 `dust_ink_04.png` 由 `source/gen_dust.py` 生成，脚本原文将共享程序化尘点标注为 CC0。六张衍生纹理直接复制原作文件。

## 配乐

配乐由保存在 `source/audio.py` 的原作脚本使用 [VCSL 乐器采样](https://github.com/sgossner/VCSL)（CC0）合成。`audio/film.m4a` 从固定提交的 `videos/05-cel-boil.mp4` 无损抽取 AAC 音轨，保留原片混音。

```bash
ffmpeg -i ../../sources/mg-styles-15/videos/05-cel-boil.mp4 -vn -c:a copy demos/cases/mg-cel-boil/audio/film.m4a
```

