# 阵列选择波浪

## 实现 Prompt

实现阵列选择波浪：CSS 3D（perspective 1500px，rotateX 58° rotateZ -36°）排列 7×9 块（顶/正/侧三面），每块 translateZ 由解析函数计算：选中块 z += L·(1 − (1 + wτ)e^(−wτ))（w=4.2，L=26px），取消选中后以当时高度按 (1 + wτ)e^(−wτ) 回落；对最近 3 次选择，其他块 z += 10·sin(7.5τ)·e^(−2.6τ)/(1 + 0.35d)，τ = t − t₀ − 0.07d，d = |Δ行| + 0.8|Δ列|。方向键与点击产生选择事件；整个状态由事件序列在时刻 t 推导，可 seek。透明度不要加在 preserve-3d 容器上。

## 参数

- **抬起**：临界阻尼速率 4.2，26px
- **余波**：A 9–10px，ω 7.5，k 2.6。延迟70ms/格，距离衰减0.35。
- **叠加**：只叠加最近 3 次选择，避免长期累积

[打开 Demo](../../demos/patterns/wave-array/index.html) · [在库中查看](../../patterns.html#pattern/wave-array)
