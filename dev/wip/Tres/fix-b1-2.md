$stop-that-shit change hash=allow -- 资源库 B1 返工：根路径 /core/ 映射、smoke 就绪超时参数、忠实度改为与成片同时刻比较，然后重跑播放器验证。

主任务的决定如下，照做即可。

# 1. 根路径 `/core/`

上游的样片以仓库根为站点根，用 `/core/...` 绝对路径引用公共库。处理方式不改上游文件：

- `scripts/serve.mjs`：请求路径以 `/core/` 开头、且站点根下没有对应文件时，改为读 `resources/lemo-opuscar` + 请求路径。
  - 这是对整个 `/core/` 前缀的通用映射，不要只列两个文件。
  - 其他路径的行为不变。
- `scripts/build-static.mjs`：把 `resources/lemo-opuscar/core/` 整个目录按原字节复制到 `dist/core/`。
  - 复制前确认 dist 中原本没有 `core/`；如果已有，就停下报告。
- `docs/resources.md` 的「代码片风格的播放与音轨」一节末尾追加一句：

  ```
  上游样片用 `/core/...` 绝对路径引用公共库：本地服务器把 `/core/` 映射到 `resources/lemo-opuscar/core/`，静态构建把该目录复制到站点根的 `core/`。
  ```

- 改完后重启 4328 上的服务器（先停掉旧进程，再按原命令启动）。

# 2. smoke 的 `--ready-timeout`

- `scripts/smoke.mjs` 新增参数 `--ready-timeout <秒>`，默认 60，只替换等待 `__motion.ready` 的超时时间。
- 发现 `__motion` 那一步的等待时间也一起延长到同一个值。
- 其他行为不变。上游渲染器本身就等 180 秒，所以播放器 smoke 一律加 `--ready-timeout 180`。

# 3. 忠实度：改为与成片同时刻比较

`frame_sec` 是上游 README 从成片里取缩略图的时刻，不是 `poster.jpg` 的时刻（见上游 `styleboard/build.py:60-66`）。因此改为与成片比较。

- **参考帧**：`dev/shots/Tnew/films-web/<web 文件>`，即上游渲染的成片。
- **比较时刻**：t ∈ {frameSec, DUR×0.25, DUR×0.5, DUR×0.75}。
- **取参考帧**：

  ```
  ffmpeg -v error -i <mp4> -ss <t> -frames:v 1 -vf scale=480:270 <png>
  ```

  `-ss` 放在 `-i` 之后，做精确定位。
- **取播放器帧**：用 `demos/styles/player/?style=<slug>&render=1` 以 GPU 启动参数打开，`await seek(t)` 后截取 1920×1080 舞台，缩放到 480×270。
- **计算**：每个时刻算 MAD（0–255）。对照图 `dev/shots/Tres/fidelity/<slug>.jpg` 改为 4 行，每行是“播放器 | 成片”，左侧标出 t。
- **报告**：表格每片一行，列出 4 个时刻的 MAD 与最大值。
  - 最大值 > 12 的，看图后写一句观察；不要修。
  - 删除旧的 poster 对比表，保留一句说明：旧对比因参考错了而作废。
- 24 片都要做。

# 4. 重跑

按顺序执行：

1. `node scripts/build.mjs`
2. `node scripts/check.mjs`（退出 0）
3. `npm run build:site`
4. 确认 `dist/core/lib.js` 存在。
5. 现有条目 smoke 跑 1 次（原命令，要求 25/25）。
6. 播放器 smoke 连续跑 2 次，命令同 plan-b1 第 7.5 节，另加 `--ready-timeout 180`，要求 24/24。
7. 忠实度（第 3 节）。
8. check-pages 全部断言。
9. 新增截图：
   - `#style/crayon-book`（播放器就绪后）
   - `#style/urban-sketch`（就绪后）

   逐张查看。
10. 更新报告 `dev/reports/Tres-b1.md`。

# 5. 不处理的事

`MAMarkdown` 中行内代码链接显示为字面量，这是共享渲染器原有的限制，本轮不改，只在报告里保留记录。

# 允许修改

plan-b1 第 8 节的清单，另加：

- `scripts/serve.mjs`：只做第 1 节
- `scripts/smoke.mjs`：只加 `--ready-timeout`

不 commit、不 push、不切分支，也不暂存 84 个字体。

最终答复列出：

- 各项结果行；
- 忠实度表；
- 最大 MAD > 12 的观察；
- 待决定事项。
