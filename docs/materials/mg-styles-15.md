# mg-styles-15 使用说明

从[素材详情](../../materials.html#material/mg-styles-15)选择风格，打开对应提示词，把「提示词」整段交给能够写代码、运行命令的 AI。套件把导演输入、制作约束和独立评审分开：`prompts/` 提供完整范例，`template.md` 用于写新风格，`rubric.md` 用于审片，`lib/audio/` 负责配乐与音效。

填写模板时，先用 Style 命名风格，再填写四段导演输入。Output 写画幅、帧率、时长与声音规格；Suggested technical route 选择画面实现手段；Creative seed 把故事写成有秒数的钩子、升级、高潮和落版，同时交代色彩、字体与声音；Signature features 把风格辨识度落到可观察的视觉特征和可执行技法。角色设定、How to work、Rules、Craft checklist、自评和 Deliver 等通用部分从现有提示词照抄。

评审时，将成片与 `rubric.md` 一起交给另一个 AI，让它按量表看片、给出分项评价，再把具体修改意见交回制作 AI。修改时保留画面和声音共用的时间点，使视觉事件、音乐段落和音效瞬态一起调整。

配乐从[模块说明](../../demos/materials/mg-styles-15/lib/audio/README.md)进入：按风格选 recipe，设置高潮、落版、速度与调性，再将音效放到画面事件上；需要自定义配器时使用 synth、drums、samples 和 seq。原案例的 `source/audio.py` 是完整编曲入口，采样与合成模块通过同一份 `lib/audio` 取得。

在仓库外准备复现目录，把素材快照的 `lib/audio` 放到根目录的 `lib/audio`，把案例 `source/` 内容放到 `demos/<原 slug>/`，然后在该案例目录运行配乐脚本。额外图片、纹理、字体和场景的映射见各案例 `fidelity.md`；这种组装保留脚本原有的相对路径。

画面采用给定时刻绘制一帧的协议。上游的 `harness/render.mjs` 对应本库的 `scripts/render.mjs`：原作 `window.renderAt(t)` 由 MotionKit 接到 `window.__motion.seek(t)`，先导出画面，再用 ffmpeg 将配乐 WAV 与画面合成。三维画面先由 Blender 输出帧序列，再由案例页面叠加文字和颗粒，页面仍通过同一个逐帧入口导出。具体命令见[渲染管线](../pipeline.md)。
