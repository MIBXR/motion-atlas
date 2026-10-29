# 乱数跳变落定

## 实现 Prompt

通过 MotionKit.replay 以 1 倍速依次重放mg-hud 原片 2.2–9.7 秒；总时长 7.5 秒。等宽数字按字符与帧种子快速跳变数帧后落定真实读数，标点保持原位。参数保持原作数值：export function roll(t, t0, final, id = 0, nFrames = 4) {
  if (f >= nFrames) return final;
    s += /[0-9]/.test(c) ? DIG[Math.floor(hash(id, i, f + 7) * 10)] : c;
  const v = base + amp * (1 - (ey - y) / h);
直接调用来源案例 renderAt(t)，沿用画面、字体和同区间成品音轨，声音默认关闭。使用 1920×1080 横屏、30fps，支持播放、暂停、时间定位与减少动态偏好。

## 参数

- **原片重放区间**：mg-hud 原片 2.2–9.7 秒；1 倍速，总时长 7.5 秒。
- **乱数跳变落定参数**：export function roll(t, t0, final, id = 0, nFrames = 4) {
  if (f >= nFrames) return final;
    s += /[0-9]/.test(c) ? DIG[Math.floor(hash(id, i, f + 7) * 10)] : c;
  const v = base + amp * (1 - (ey - y) / h);

## 迁移

- `index.html 内联配置 → segments / markers`：调整来源片段与中文节点，画面和声音使用同一时刻映射。

[打开 Demo](../../demos/patterns/seeded-digit-scramble-settle/index.html) · [在库中查看](../../patterns.html#pattern/seeded-digit-scramble-settle)
