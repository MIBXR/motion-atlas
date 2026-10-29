# 许可与出处

原作《3D 渲染 · soft. — Soft Landing》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`；原目录为 `demos/04-3d-render/`。代码、提示词、文档与成片采用 MIT 许可，原文见 [LICENSE](film/LICENSE)。

## 字体

| 完整文件与版本 | 官方来源 | 许可原文 |
| --- | --- | --- |
| `DMSans[opsz,wght].ttf`，Version 4.004;gftools[0.9.30] | [官方完整文件或归档](https://raw.githubusercontent.com/google/fonts/9862abc066c9b83bf84c3e8ed1fc2d8d48f9bbf0/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/DMSans-OFL.txt) |
| `Fredoka[wdth,wght].ttf`，Version 2.001 | [官方完整文件或归档](https://raw.githubusercontent.com/google/fonts/9862abc066c9b83bf84c3e8ed1fc2d8d48f9bbf0/ofl/fredoka/Fredoka%5Bwdth%2Cwght%5D.ttf) | [SIL OFL 1.1 原文](fonts/Fredoka-OFL.txt) |
| `NotoSansSC-VF.ttf`，Version 2.004;hotconv 1.0.118;makeotfexe 2.5.65603 | [官方完整文件或归档](https://raw.githubusercontent.com/notofonts/noto-cjk/f8d157532fbfaeda587e826d4cd5b21a49186f7c/Sans/Variable/TTF/Subset/NotoSansSC-VF.ttf) | [SIL OFL 1.1 原文](fonts/NotoSansSC-OFL.txt) |

字体声明取自原作 `assets/fonts/fonts.css`，仅保留实际使用的家族与字重并改写 URL。

`source/assets/mesh/glyph_*.ply` 与 `glyphs.json` 是原作从 Fredoka 700 提取的字形网格，沿用 Fredoka 的 SIL OFL 1.1；完整可变字体与许可同附于 `fonts/`。

## 共享素材

- `assets/textures/grain/grain_fine_2048.png`：[固定提交中的程序化颗粒](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/assets/textures/grain/grain_fine_2048.png)，原作 MIT 许可。
- `source/assets/hdri/studio_small_09_2k.hdr`：[Poly Haven Studio Small 09](https://polyhaven.com/a/studio_small_09)，[CC0](https://polyhaven.com/license)。
- `assets/frames/0000.webp` 至 `0239.webp`：本机 Blender 5.1.2 CPU 按原作 `blender/render.py` 设置渲染，再以 WebP q95 存储；画面沿用原作 MIT 许可，所含 Fredoka 字形和 HDRI 保留上述许可。

本案例没有 vendor 包。

## 配乐

`audio/film.m4a` 从固定提交的 `videos/04-3d-render.mp4` 以 `ffmpeg -vn -c:a copy` 无损抽取 AAC 音轨，保留原片混音；成片与原作自制音频采用 MIT 许可。配乐生成脚本原样保存在 `source/audio.py`，使用 [VCSL 乐器采样](https://github.com/sgossner/VCSL)（CC0）与原作合成器。
