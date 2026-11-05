# 制作资料

`analysis/` 保存视频分析档案和测量结果，`scripts/extraction/` 保存提取脚本。原片、取帧、全景图片、字体候选和对照输出放在制作工作区。Canvas 绘制代码使用 `film/data/` 中的数据生成运行画面。

脚本中的“工作区”包含 `analysis/case/`、`audio/case.mp4`、`audio/song/butterfly.mp3`；“仓库”为 Motion Atlas 根目录。下面的相对路径以本例目录为起点。

```bash
uv run --no-project --with numpy --with pillow --with opencv-python-headless python source/scripts/refine-data.py <工作区> <仓库>
uv run --no-project --with numpy --with pillow --with opencv-python-headless python source/scripts/measure-motion.py <工作区> <仓库>
bash source/scripts/build-audio.sh <butterfly.mp3路径>
```

`scripts/rework/` 中的 Python 脚本也接收 `<工作区> <仓库>` 两个参数，以分析档案、既有运行数据和工作区 `codex/case-impl/` 内的测量缓存为输入，将测量文件输出到该工作区；`apply_*.py` 将测量结果写入 `film/data/`。文字栅格脚本接收同样两个参数，并使用端口 4362 上的本例页面和仓库的 Edge CDP 工具。

```bash
uv run --no-project --with numpy --with pillow --with opencv-python-headless python source/scripts/rework/measure_counters_round2.py <工作区> <仓库>
node source/scripts/rework/raster-words.mjs <工作区> <仓库>
```

| 数据 | 制作脚本 |
| --- | --- |
| 行名位置、透明度与活跃短杠 | `measure_rows.py`、`refine_rows.py`、`round3-markers.py` |
| 巨型标题字体与逐字变换 | `compare_title_fonts.py`、`refit_titles.py`、`round3-titles.py`、`round3-title-heads.py` |
| 字幕、图标、三态颜色与厚度 | `fit_caption_transitions.py`、`measure_icons.py`、`sample_frame_colors.py`、`measure_frame_release.py`、`refit_note_states.py` |
| 音符端点、间隙和叠置声部 | `refine_rectangles_round2.py`、`compile_rectangles_round2.py`、`audit_deleted_rectangles_round2.py`、`apply_round2_core.py`、`apply_residual_data_round2.py` |
| 小节和拍号 | `measure_counters_round2.py` |
| 聚焦与 Cym. 楔形 | `measure_focus_b.py`、`measure_b_vertical_round2.py`、`measure_cym_tapers.py`、`fit_focus_note_overrides_round2.py`、`apply_focus_overrides_round2.py` |
| 转调虚线和文字 | `scan_modulations_round2.py`、`measure_mod_widths_round2.py`、`refine_modulation_paint_round2.py` |
| Hp. 滑奏与 Vln. I 曲线 | `measure_hp_paths.py`、`scan_hp_full_round2.py`、`finish_hp_round2.py`、`measure_hp_dots_round2.py`、`measure_leggiero.py` |
| 力度、动机文字、括号和楔形 | `scan_dynamics.py`、`fill_dynamics.py`、`refine_annotations.py`、`raster-words.mjs`、`fit_words_round2.py`、`sample_annotations_round2.py`、`measure_outlines_round2.py`、`apply_measured_tracks_round2.py` |
| 场次标题与梯子连接线 | `measure_header_tracks_round2.py`、`measure_small_layers_round2.py` |
| 片头辅助文字、英文、标志和竖栏 | `raster-intro-round2.mjs`、`measure_intro_round2.py`、`apply_intro_round2.py`、`raster-intro-words-round2.mjs`、`measure_intro_elements_round2.py`、`apply_intro_elements_round2.py` |
| 音符三态中位数、候选归属与重复长条 | `round3-source.py`、`round3-notes.py`、`round3-duplicates.py`、`round3-samples.py`、`round3-colors.mjs`、`round3-state-medians.py`、`round3-physical-states.py`、`apply-physical-states.py` |
| 辅助竖排长音符、力度楔形尾段 | `round3-other.py` |
| 裁切后的文字、片头假名、动机括号和片尾保持 | `restore_missing_elements.py` |

`analysis/rework/` 保存文字描述、音符测量输入、聚焦矩形观测、片头假名观测、25 个删除候选和三态测量证据。`state-input/` 为三态脚本的固定输入；脚本直接从本例读取。字体栅格、模板、逐帧采样和中间 JSON 由测量脚本写入工作区。

三态数据的制作顺序为 `round3-source.py` → `round3-markers.py` → `round3-titles.py` → `round3-other.py` → `round3-title-heads.py` → `round3-notes.py` → `round3-duplicates.py` → `round3-samples.py` → `round3-colors.mjs` → `round3-state-medians.py` → `apply-physical-states.py`。颜色采样需要端口 4362 上的本例页面。每个音符存储两种背景下未来、发声、已过三个透明度中位数，并乘所在行的透明度；运行数据不使用逐两帧透明度曲线。`round3-samples.py` 使用 `fit_words_round2.py` 生成的文字模板，排除文字、播放头和叠置声部遮挡。`round3-physical-states.py` 用工作区的原片矩形内部色、Canvas 中位色和逐事件归属记录测量状态与结束衰减，`apply-physical-states.py` 应用 `analysis/rework/round3-physical-state-evidence.json` 中的固定测量结果。

素材提取结果位于工作区 `analysis/case/assets/`；图标状态测量读取本例 `assets/*-black.png`。

`analysis/rowStates.json` 为每两帧测量后按 0.5px、0.02 误差简化的行位置与透明度曲线；`analysis/title-font-comparison.json` 保存六个固定版本候选的逐字叠加得分。
