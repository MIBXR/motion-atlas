$stop-that-shit change hash=allow -- 继续资源库第一阶段：允许方案要求的逐文件 SHA256 生成（UPSTREAM.json.files）、R2 检查和上游逐字节核对。

照 `dev/wip/Tres/plan-a.md` 把未完成的部分做完，不改已完成部分的方案：

1. 第 1.2 节：vendor 脚本补完 SHA256，并运行三次收录（提交号、`--fetched 2026-10-24` 照方案）。
2. 第 3 节 R2 检查补完。
3. 第 6 节验证全部按顺序重做：
   - build、check（必须退出 0）、build:site，并做 dist 文件数核对；
   - 逐字节核对；
   - smoke 连续 2 次，要在收录完成之后重跑，才算有效；
   - check-pages 断言 (a)–(g) 全部执行；
   - 11 张截图，每张打开查看。
4. 更新 `dev/reports/Tres-a.md`：核对表改成最终状态，删掉“阻碍”一节中已经解决的项。

档案终端最小字号 5.3px 是既有情况，不用处理。

不 commit、不 push、不切分支。最终答复列出：check-pages 每条断言的结果、逐字节核对数、两次 smoke 结果行、截图路径、待决定事项。
