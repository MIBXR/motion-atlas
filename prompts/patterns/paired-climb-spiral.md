# 双螺旋并行攀升

## 实现 Prompt

用来源案例的原作render(t)实现“双螺旋并行攀升”。同年的风电和太阳能装机量分别堆成亚克力与铝片，两组沿表盘的内外螺旋逐年推进，比较同年堆叠高度读出反超。保留参数：film/set.js:PAIRS / th / rS / rW：STEP=.4817，rS=2.25+.03i、rW=rS−.6；两组有独立半径和固定年份位置。；film/data.js:GW_PER_SHEET=10、BRASS_EVERY=10；set.js:TH=.0125，一片10 GW，每100 GW一片黄铜。；film/set.js:BUILD与SHEETS，太阳能比风电晚半个BEAT；2021的四个读数在film.js:pairLabels完成后，21.875秒显示反超。。按index.html内联segments定位原片，复用原作素材、字体与同区间音轨，声音默认关闭。

## 参数

- **原片重放区间**：lemo-data-physical：10–25.3秒；1倍速，总时长15.300000秒。

[打开 Demo](../../demos/patterns/paired-climb-spiral/index.html) · [在库中查看](../../patterns.html#pattern/paired-climb-spiral)
