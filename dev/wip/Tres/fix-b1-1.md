$stop-that-shit change hash=allow -- 继续资源库 B1：84 个被上游 .gitignore 忽略的字体由主任务在提交时 git add -f，继续完成构建与全部验证。

决定（主任务）：

- 被忽略的 84 个字体就是 `dev/wip/Tres/evidence/lemo-ignored-files.txt` 里的那些。上游 `resources/lemo-opuscar/.gitignore` 保持原字节，不改。
- 主任务在提交时会对这 84 个文件执行 `git add -f`，你**不要**暂存或提交。
- plan-b1 第 1.3a 节的“输出必须为空”改为：输出必须**恰好等于**这 84 个文件的清单，不能多也不能少。请把这个比对写进验证。

接下来照 `dev/wip/Tres/plan-b1.md` 从第 7 节开始，按顺序把全部验证做完：

1. build、check、build:site，以及 dist 存在性检查；
2. 逐字节核对；
3. 启动服务器 4328；如果端口已被占用，直接复用现有服务器；
4. 现有条目 smoke 跑 1 次，要求 25/25；
5. 24 个播放器 smoke 连续跑 2 次；
6. 忠实度 MAD，并逐张看对照图；
7. 音画对齐抽查；
8. check-pages (a)–(l)；
9. 截图并逐张查看；
10. 统计体积；
11. 把报告 `dev/reports/Tres-b1.md` 更新为最终状态。

剪贴板回读的 CRLF 已由主任务认可：把回读结果里的 CRLF 还原为 LF 后再严格比较，算通过。

不 commit、不 push、不切分支。

最终答复列出：

- 各项验证的结果行；
- MAD 表；
- MAD > 12 的样片，以及看图后的观察；
- 待决定事项。
