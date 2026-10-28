# 许可与来源

## 原作

- 作品：popwise — One Dot。
- 作者：Vincentwei1021。
- 仓库：https://github.com/Vincentwei1021/mg-styles-15 。
- 固定提交：`49052d80bfaf9fa8412cc9710530e5e95a3b8d8c`。
- 原目录：`demos/01-flat-vector/`。
- 在线作品：https://vincentwei1021.github.io/mg-styles-15/#01-flat-vector 。
- 代码、提示词与成片采用 MIT 许可，原文副本见 [LICENSE](LICENSE)。

## 字体

| 字体 | 完整文件 | 官方下载来源 | 许可原文 |
| --- | --- | --- | --- |
| Fredoka，600、700 字重 | `fonts/Fredoka[wdth,wght].ttf` | [Google Fonts](https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/Fredoka%5Bwdth%2Cwght%5D.ttf) | SIL OFL 1.1，[本地原文](fonts/Fredoka-OFL.txt)，[官方原文](https://raw.githubusercontent.com/google/fonts/main/ofl/fredoka/OFL.txt) |
| Resource Han Rounded CN Bold，700 字重 | `fonts/ResourceHanRoundedCN-Bold.ttf` | [字体作者官方 v0.990 发布归档](https://github.com/CyanoHao/Resource-Han-Rounded/releases/download/v0.990/RHR-CN-0.990.7z)，取归档内同名文件 | SIL OFL 1.1，[本地原文](fonts/ResourceHanRounded-OFL.txt)，[官方原文](https://raw.githubusercontent.com/CyanoHao/Resource-Han-Rounded/v0.990/LICENSE.txt) |

字体保留完整原文件及官方文件名；字体声明取自原作 `assets/fonts/fonts.css`。

## 配乐

配乐由原作 `audio.py` 使用 [VCSL 乐器采样](https://github.com/sgossner/VCSL)（CC0）合成。`audio/film.m4a` 从固定提交的 `videos/01-flat-vector.mp4` 无损抽取 AAC 音轨，保留原片混音。

```bash
ffmpeg -i ../../sources/mg-styles-15/videos/01-flat-vector.mp4 -vn -c:a copy demos/cases/mg-flat-vector/audio/film.m4a
```
