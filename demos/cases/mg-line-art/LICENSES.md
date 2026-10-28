# 许可与出处

原作《ATELIER LINEA — One Line（一笔画）》来自 [Vincentwei1021/mg-styles-15](https://github.com/Vincentwei1021/mg-styles-15)，作者 Vincentwei1021，固定提交 `49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`。代码、提示词、文档和成片按 MIT 许可发布，许可原文见 [LICENSE](film/LICENSE)。

## 字体

| 字体与字重 | 官方完整文件与版本 | 许可原文 |
| --- | --- | --- |
| Cormorant Garamond，可变字重 300–700，画面使用 500 | [Google Fonts：CormorantGaramond[wght].ttf](https://raw.githubusercontent.com/google/fonts/3dd78844021e948ceb633d1dcee3f7885561b5d9/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf)，来源提交 `3dd78844021e948ceb633d1dcee3f7885561b5d9`，保存为 `fonts/CormorantGaramond[wght].ttf` | SIL OFL 1.1，[CormorantGaramond-OFL.txt](fonts/CormorantGaramond-OFL.txt) |
| Noto Serif SC，可变字重 200–900，画面使用 300 | [Noto CJK 官方仓库：NotoSerifSC-VF.ttf](https://raw.githubusercontent.com/notofonts/noto-cjk/9b0f1436e455d902de067a2501422e5dc71ad16b/Serif/Variable/TTF/Subset/NotoSerifSC-VF.ttf)，来源提交 `9b0f1436e455d902de067a2501422e5dc71ad16b` | SIL OFL 1.1，[NotoSerifSC-OFL.txt](fonts/NotoSerifSC-OFL.txt) |

字体保留官方完整原文件，`fonts/fonts.css` 取自原作对应家族的声明，仅改资源 URL。

## 共享纹理

`assets/textures/grain/grain_fine_2048.png` 原样取自上述固定提交的 `assets/textures/grain/`。根据原仓库 [README 的许可一节](https://github.com/Vincentwei1021/mg-styles-15/blob/49052d80bfaf9fa8412cc9710530e5e95a3b8d8c/README.md#license)，项目自制文件按 MIT 许可提供。

## 配乐

配乐由保存在 `source/audio.py` 的原作脚本使用 [VCSL 乐器采样](https://github.com/sgossner/VCSL)（CC0）合成。`audio/film.m4a` 从固定提交的 `videos/02-line-art.mp4` 无损抽取 AAC 音轨，保留原片混音。原片及其自制音频采用上述 MIT 许可。

```bash
ffmpeg -i ../../sources/mg-styles-15/videos/02-line-art.mp4 -vn -c:a copy demos/cases/mg-line-art/audio/film.m4a
```

本案例没有 vendor 包。
