# 条目结构

案例描述一个完整作品，巧思描述一种“触发 → 效果”的手法。两者都配有参数、Prompt和可运行的Demo。

## 案例

| 内容 | 字段 | 页面位置与用途 |
| --- | --- | --- |
| 名称与简介 | `title`、`subtitle`、`summary` | 列表卡片和详情页开头，说明作品是什么 |
| 载体与标签 | `carriers`、`tags` | 工具栏筛选与详情标签，区分影像视频和交互操作台 |
| 设计重点 | `focus` | 概述，说明画面如何组织 |
| 节拍与能量 | `rhythm.beats`、`energy`、`energySegments`、`energyNote` | 节奏结构与舞台刻度条，定位事件、查看起伏与数值来源 |
| 视觉与声音 | `composition`、`tokens` | 构成与动效参数，查看颜色、字体、版式、时长和缓动 |
| 画面分层 | `layers` | 画面分层，理解镜头、信息、文字与声音如何叠加 |
| 画面细节 | `observations` | 画面细节，按时刻或内容查看具体变化 |
| 操作与状态 | `interaction` | 交互与状态，了解播放、暂停、定位和手动操作 |
| Prompt | `prompt`、`videoPrompt`、`negativePrompt` | Prompt标签，可复制实现指令、视频指令与负向约束 |
| 复用设置 | `migration` | 迁移指南，了解可调整的内容与参数 |
| 适用范围 | `useCases`、`avoid`、`constraints` | 适用与边界，判断是否适合自己的作品 |
| 关联巧思 | `patternIds` | 关联巧思，打开各手法的说明和独立Demo |

节拍包含时间`t`、名称`label`与画面说明`note`。点击节拍时间，可在Demo中定位到相应画面。能量曲线使用0–1的数值：`energy`按等间隔采样，铺满作品时长；`energySegments`按`{ t0, t1, from, to, label }`记录各段实际起止秒数与起止能量，段内线性插值，交界可跳变，同时存在时优先显示分段曲线。`energyNote`说明数值来源，在节奏结构中显示。

## 巧思

| 内容 | 字段 | 页面位置与用途 |
| --- | --- | --- |
| 名称与简介 | `title`、`summary` | 列表卡片与详情标题，快速认识手法 |
| 类型与载体 | `types`、`carriers` | 工具栏筛选和详情标签 |
| 机制、触发与效果 | `mechanism`、`trigger`、`effect` | 机制，说明怎么开始、画面怎么变化 |
| 动效参数 | `timing` | 参数表，查看时长、缓动、错峰和幅度 |
| 实现指令 | `prompt` | 可复用Prompt，复制后替换内容与品牌 |
| 组合 | `composition` | 组合，查看骨架、支撑、点睛职责及搭配关系 |
| 可访问性 | `accessibility` | 可访问性，了解减少动态与键盘操作 |
| 所属案例 | `sources[].caseId` | 详情末尾的案例标题链接，打开完整作品 |

巧思的`sources`只存`caseId`。对应案例的`patternIds`包含该巧思，形成双向关联。

## Demo与Prompt

详情页上方是Demo舞台、播放按钮、刻度条和节拍点。拖动定位，或用播放与跳拍查看动作。详情正文列出参数，文档中心则将指令分为“案例Prompt”和“巧思Prompt”。

使用方法见[使用指南](guide.md)，节拍与曲线见[节奏方法](rhythm.md)，指令写法见[Prompt写法](prompting.md)，视频导出见[渲染管线](pipeline.md)。
