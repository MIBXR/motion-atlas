# 印章落下 · 复用 Prompt

由 [结构化条目](../../entries/patterns/seal-stamp.json) 自动生成。

## 实现 Prompt

实现印章落下：点击位置为落点；落下前 350ms 印章以 1.5 倍、半透明出现在上方，下方投影放大模糊；按下时 260ms outBack 从 scale 1.35 落到 1、rotate −6°→−2°，投影迅速变小消失；100ms 后一圈 3px 印泥色描边环 0.8s 扩大到 16 倍并淡出；纸面 translate 微震 6px·e^(−14t)；声音 90Hz 下滑正弦 + 80ms 低通噪声。纸面可聚焦，回车在中心盖章。

## 参数

- **抬起**：350ms outCubic
- **按下**：260ms outBack，1.35→1
- **扩散环**：0.8s
- **微震**：6px·e^(−14t)

[打开 Demo](../../demos/patterns/seal-stamp/index.html) · [在库中查看](../../patterns.html#pattern/seal-stamp)
