/*
 * 白色档案终端 · 迁移入口
 * 改品牌、分类与档案内容即可复用；timing 控制启动序列、阵列波浪、呼吸与解密节奏。
 * autopilot：自动演示的按键脚本（秒）。任何真实按键/点击会切到实时交互。
 */
window.CONFIG = {
  brand: { line1: 'LUMEN LAB', line2: 'SYNTHESIZE INFORMATION', line3a: 'ANALYSIS', line3b: 'OS', operator: 'OPERATOR · K. ARLEN', powered: 'LUMEN LAB' },
  palette: { paper: '#eae5e1', panel: '#edebe4', ink: '#171713', muted: '#77756d', line: '#bdb8ad', accent: '#c8742f', glass: '#f4f1ec' },
  columns: [
    { name: '工程研究', en: 'ENGINEERING' },
    { name: '生命科学', en: 'LIFE SCIENCE' },
    { name: '机构档案', en: 'INSTITUTION' },
    { name: '能量研究', en: 'ENERGY' },
    { name: '特别项目', en: 'SPECIAL PROJECTS' },
  ],
  // 每列 8 份档案（标题、科室、编目、相关人、状态、摘要）；不足时自动生成编号占位
  files: {
    0: [
      { title: '光学腔体 · 第三代', dept: '结构工程科', collection: '跨期资料汇编', related: 'M. Ide / R. Sato', status: '已归档 · 可读取', abstract: '第三代光学腔体把双环折射组封装在磨砂盖板与基板之间，减少了 37% 的杂散光，同时保留可拆卸的检修结构。' },
      { title: '低温回路校准', dept: '热力学组', collection: '实验记录', related: 'A. Varga', status: '复核中', abstract: '回路在 −40°C 下的漂移来自连接带的形变，而非传感器本身；改用阶梯截面后漂移下降到原来的四分之一。' },
      { title: '模块化框架 B-7', dept: '结构工程科', collection: '设计规范', related: 'L. Okafor', status: '已归档 · 可读取', abstract: '六组部件沿厚度方向分层，任何一层都能在不拆卸其他层的情况下单独更换。' },
    ],
    1: [
      { title: '共生菌群观察', dept: '生态研究科', collection: '长期观察', related: 'H. Brandt', status: '进行中', abstract: '在恒定光照下，菌群的分层结构会在第 11 天出现周期性重组，周期与温度无关。' },
      { title: '细胞培养舱 · 维护日志', dept: '培养中心', collection: '访问日志', related: 'S. Lindqvist', status: '已归档 · 可读取', abstract: '维护窗口从每周两次调整为每周一次，污染事件没有增加。' },
    ],
    2: [
      { title: 'LUMEN LAB, LLC.', dept: '总辖构件科', collection: '跨期资料汇编', related: 'K. Arlen / M. Ide', status: '已归档 · 可读取', abstract: '研究所从一间临时实验室发展而来，聚集着研究生命、能源与未知技术的人；理解它，需要同时阅读它的实验记录和研究者的选择。' },
      { title: '访客通行规程', dept: '安全管理科', collection: '设计规范', related: '—', status: '已归档 · 可读取', abstract: '所有访客路线以白色地面标线区分，橙色标线仅供应急通道使用。' },
    ],
    3: [
      { title: '共振电池 · 原型 4', dept: '能源实验组', collection: '实验记录', related: 'P. Moreau', status: '保密 · 需授权', abstract: '原型 4 在满载 72 小时后仍保持 96% 容量；外壳温升集中在顶部压槽附近。' },
    ],
    4: [
      { title: '项目 · 静默海', dept: '特别项目办公室', collection: '保密档案', related: '—', status: '保密 · 需授权', abstract: '本档案正文需要二级授权；当前终端仅显示摘要。' },
    ],
  },
  timing: {
    bootEnd: 7.6,     // 启动序列结束（秒）
    rowsVisible: 16,  // 每列显示的档案块数量
    previewLift: 26,  // 选中预览抬起（px）
    detailLift: 150,  // 进入详情抬起（px）
    liftRate: 4.2,    // 临界阻尼速率
    waveAmp: 9, waveFreq: 7.5, waveDecay: 2.6, waveDelay: 0.07, // 选中波浪
    roll: 0.46,       // 编号/标题滚动时长
    idleAfter: 2.5, breathe: [8, 13], breatheAmp: 4, // 空闲呼吸
    decrypt: 1.6,     // 解密时长
  },
  autopilot: [
    { t: 9.4, key: 'ArrowRight' }, { t: 10.6, key: 'ArrowDown' }, { t: 11.4, key: 'ArrowDown' },
    { t: 12.6, key: 'ArrowLeft' }, { t: 13.8, key: 'Enter' }, { t: 19.2, key: 'Escape' },
    { t: 20.6, key: 'ArrowRight' }, { t: 21.6, key: 'ArrowUp' },
  ],
  duration: 24,
};
