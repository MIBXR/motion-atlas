# 接入与保真说明

复刻以公开默认成片为准，作品来源与固定版本见[条目 JSON](../../../entries/cases/mg-hud.json)。

## 相对原作的删改

| 文件 | 删改内容 | 原因 |
| --- | --- | --- |
| 原 `index.html` → `film/main.js`、`film/style.css`、`film/setup.js`、`index.html` | 拆分作品代码、样式与舞台挂载；案例入口加载字体、固定 vendor 与 MotionKit。 | 路径改写 |
| 原 `js/v5.js`；`film/main.js`、`film/js/hud.js`、`film/js/util.js` | 删除 `V5`、`REEL`、`NOLINK`、另一版样式名标题、品红改色、南极目标、珊瑚信号点、专用标题层与 `linksV5`；保留默认目标、橙色警报和 TARGET LOCKED 标题。 | 另一版剪辑分支 |
| `film/main.js`、`index.html`、`fonts/fonts.css` | cues、地图、字体与 npm 库改为案例内相对路径；地图位于 `assets/land-50m.json`。 | 路径改写 |
| `audio.py` → `source/audio.py` | 原样保存配乐与音效生成脚本。 | 移至 source |

声音以 `ffmpeg -i videos/22-hud.mp4 -vn -c:a copy audio/film.m4a` 从公开成片抽取，未转码；来源与许可见 [LICENSES.md](LICENSES.md)。

## 接入

`MotionKit.mountFilm` 以原作 `renderAt(t)` 接入 1920×1080、30fps、10 秒横屏舞台；中文 markers 从 `film/cues.json` 换算。种子随机数接入 `MotionKit.rng`，保留原始种子与时间推导。声音默认关闭，开启后音轨与时间轴同步；`?embed`、`?render`、`?t=秒` 与减少动态偏好由共享运行时处理。

`previewAt: 9.5`：目标锁定标题、坐标、解析后的地图与侧栏数据已完整显示，数据回传段已结束，尚未进入 9.7667 秒关机。减少动态时在同一时刻暂停。

## 已接受差异

原片生成阶段的 `harness/render.mjs` 子帧平均运动模糊属于已接受差异；作品代码内的解析拖影与片内时间采样保留。整理后的作品文本使用 UTF-8、LF；原样保存的配乐脚本与第三方文件保留原字节。

## 与原片对照结果

对照图位于工作区 `compare/mg-hud/`，左侧为原片 ffmpeg 取帧，右侧为 `shot.mjs` 在 1920×1080 的同刻截图。

| 时刻 | 逐张结论 | 拼图 |
| --- | --- | --- |
| 1.0 秒 | 开机外环、内环、刻度、中央准星、顶栏、左侧日志与导航面板的位置、文字和展开进度对应。 | `compare-1.0.png` |
| 3.0 秒 | 线框地球、点阵陆地、雷达扇区、同心刻度、数据读数与三栏布局对应；运动中的扫描边缘和地球轮廓保留原片子帧平均模糊差异。 | `compare-3.0.png` |
| 5.0 秒 | 地球转向、卫星引线、候选目标、信号状态、遥测和波形读数对应；旋转中的海岸线在原片中受子帧平均而更模糊。 | `compare-5.0.png` |
| 7.5 秒 | 橙色锁定标题带、括号、坐标逐字进度、城市标记和侧栏读数对应；外环与海岸的运动边缘保留原片子帧平均差异。 | `compare-7.5.png` |
| 9.5 秒 | 目标锁定标题、完整坐标、沿海地图、城市与船迹、数据侧栏及 SENT 回传状态对应；构图、字形、位置和数值对应。 | `compare-9.5.png` |

无头浏览器中，独立 Demo 和站点案例页的自动播放、暂停、实际指针拖动、`?t=5` 定位、声音开关与拖动后声音同步均通过。四次播放／拖动后的声画采样差为 42.5ms / 38.5ms / 44.3ms / 52.1ms；暂停时媒体同步暂停。定位截图及明细位于工作区 `compare/mg-hud/browser-standalone.png`、`browser-site.png` 与 `browser-results.json`。
