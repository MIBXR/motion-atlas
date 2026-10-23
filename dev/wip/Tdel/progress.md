# Tdel 进度

- 2026-10-23：依据 `plan.md` 与 `../R2/plan-fix-1.md`，删除 6 个案例、16 个巧思，共 112 个源码 / 条目 / 研究 / 预览文件；`git rm` 仅暂存这些明确删除项，未提交、推送或切分支。
- 2026-10-23：完成用户七项最终文字、既定引用清理、示例路径与计数更新；`node scripts/build.mjs` 输出 `3 cases · 22 patterns · 18 files updated`，并自动清理 44 个过期生成物。
- 2026-10-23：排除 `dev/` 的删除 ID 与旧计数扫描均零匹配；普通与暂存 diff 空白检查通过。报告 `dev/reports/Tdel.md` 已写明删除清单、引用范围、build / grep 证据及现有排版限制；站点走查、`check`、`build:site` 留到 R2 第 4 步统一验收。
- 2026-10-23：第 4 步站点脚本 `site.mjs` 完成桌面 / 手机各 8 页，共 16 页、136/140 检查；console.error / 未捕获异常 / HTTP 错误 / 失败请求均为 0，数据 3/22、首页 3/22/3、列表 3/22、外层无横溢通过。四项失败均为列表 hero SVG 的实际字号（桌面 11.823px、手机 11.305px），未改业务源或放宽阈值。
- 2026-10-23：已逐张查看 16 张当前站点截图。记录首页默认平滑滚动导致的 CDP 超时（自动走查改用 instant 后完成）、地图初始非零 t 时预载不消失（正常从 0 启动并 ready 后 seek 的横竖两页均 10/10）、工业协议旧 Demo 手机 iframe 主体不在可视区。证据、当前结果与保留限制见 `dev/shots/Tdel/site/verification.json`、初次失败记录及 `dev/reports/Tdel.md`；`check` / `build:site` 由 R2 主任务补充。
- 2026-10-23T02:49:03.215Z：R2最终build/check/build:site通过，3 cases·22 patterns；dist 1146文件中被删ID路径/内容均0。站点16组合136/140，4项hero SVG缩放字号不足12px待用户决定；报告已更新当前结果。
- 2026-10-23T08:35:09.403Z：R2 三项裁定已落实：竖屏章 x980 右栏 / 0.917 / 底边不变，Tfont 计划已更正；两组 SVG 仅按实际缩放调整字号；指定八处说明按原句替换。站点 140/140；案例与 collect-counter 六张竖屏图重截、几何和逐图审阅 6/6；追加 smoke 25/25（archive-os、day-night-flip 自动 GPU，Intel Iris Xe / D3D11）；build 3/22、check、build:site 通过。首次截图浏览器连接关闭，独立重跑通过，失败日志保留。另有 12 个地图巧思 entries 的 tokens.type，以及 dev/wip/T4b/tools/scores-entries.mjs，仍写“横屏 ≥24px、竖屏 ≥36px。”。这些不在本次指定八处中，按用户要求保留原文，已询问是否同步替换；尚未修改。 完整文件清单 dev/shots/R2/closeout/changed-files.md。
