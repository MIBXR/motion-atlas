import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import catalog from 'atlas:catalog';
import { Shell } from '../components/Shell';
import { ActionLink } from '../components/actions';
import { CodeBlock } from '../components/ui';
import { EntryCard } from '../components/EntryCard';
import { motionTokens } from '../arc/lib/motion-tokens';
import '../styles/library.css';
import '../styles/home.css';
const tracks = [
  [
    'CAM',
    [
      [0, 34, 'var(--line-2)'],
      [36, 62, 'var(--line-2)'],
    ],
    [10, 48, 80],
  ],
  ['HUD', [[8, 96, 'var(--accent-4)']], []],
  [
    'TYPE',
    [
      [14, 30, 'var(--ink-2)'],
      [52, 66, 'var(--ink-2)'],
      [78, 92, 'var(--ink-2)'],
    ],
    [],
  ],
  [
    'FX',
    [
      [30, 36, 'var(--accent-1)'],
      [62, 68, 'var(--accent-1)'],
    ],
    [33, 65],
  ],
  ['SFX', [], [6, 18, 30, 42, 54, 66, 78, 90]],
];
const carrierCopy = {
  video: [
    '只能看的影像：转场、HUD、字幕与镜头都按时间轴编排，可以逐帧导出成视频。',
    '地图巡礼',
  ],
  console: [
    '可操作的界面：选择、确认和翻页都有明确反馈，随时可以暂停。',
    '档案终端',
  ],
};
const steps = [
  ['逐帧观察', '逐帧看画面，记下每个转场、每层信息出现和消失的时刻。'],
  [
    '拆成轨道',
    '镜头、信息层、文字、事件和声音各用一条轨道，整理成节拍表与能量曲线。',
  ],
  [
    '抽出巧思',
    '将每个可复用的手法单独整理成巧思，说明触发方式、效果、参数和可搭配的巧思。',
  ],
  [
    'Prompt + Demo',
    '提供实现 Prompt、视频生成 Prompt 和负向约束，配套 Demo 可修改配置后复用。',
  ],
  ['渲染与迁移', '同一份代码可以实时播放、拖动定位，也能逐帧导出成视频。'],
];
const commands = `node scripts/atlas.mjs search "转场 地图" --limit 5
node scripts/atlas.mjs show map-pilgrimage --source
node scripts/atlas.mjs export split-compare-stamp --out ../my-demo
node scripts/render.mjs demos/cases/map-pilgrimage/index.html --fps 30`;
function Timecode() {
  const [time, setTime] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    let frame;
    const update = (now) => {
      setTime((now - start) / 1e3);
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);
  const pad = (value) => String(Math.floor(value)).padStart(2, '0');
  return (
    <span className="monitor-time">
      00:{pad(time / 60)}:{pad(time % 60)}:{pad((time % 1) * 24)}
    </span>
  );
}
const entries = catalog.cases.filter((entry) => entry.preview);
function Monitor() {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(entries[0]);
  const reduced = useReducedMotion();
  const first = useRef(true);
  useEffect(() => {
    let active = true;
    const image = new Image();
    image.src = entries[index].preview;
    image.decode().then(
      () => {
        if (active) {
          setDisplay(entries[index]);
          first.current = false;
        }
      },
      () => {
        if (active) setIndex((value) => (value + 1) % entries.length);
      },
    );
    return () => {
      active = false;
    };
  }, [index]);
  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(
      () => setIndex((value) => (value + 1) % entries.length),
      3200,
    );
    return () => clearInterval(interval);
  }, [reduced, entries.length]);
  return (
    <div className="home-editor" aria-label="作品预览与时间轴示意">
      <a className="home-monitor" href={`cases.html#case/${display.id}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={display.id}
            src={display.preview}
            alt={`${display.title} Demo 截图`}
            initial={reduced || first.current ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? void 0 : { opacity: 0 }}
            transition={{
              duration: reduced ? 0 : motionTokens.duration.standard,
            }}
          />
        </AnimatePresence>
        <span className="monitor-tag">
          {String(entries.indexOf(display) + 1).padStart(2, '0')} ·{' '}
          {display.title}
        </span>
        <Timecode />
      </a>
      <div className="home-tracks" aria-hidden="true">
        {tracks.map(([name, clips, keys]) => (
          <div className="home-track" key={name}>
            <b>{name}</b>
            <div className="home-track-lane">
              {clips.map(([start, end, color]) => (
                <i
                  className="track-clip"
                  key={start}
                  style={{
                    left: start + '%',
                    width: end - start + '%',
                    background: color,
                  }}
                />
              ))}
              {keys.map((key) => (
                <i
                  className="track-key"
                  key={key}
                  style={{ left: key + '%' }}
                />
              ))}
            </div>
          </div>
        ))}
        <motion.i
          className="home-playhead"
          initial={false}
          animate={reduced ? { left: '48%' } : { left: ['76px', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
export default function HomePage() {
  const taxonomy = catalog.taxonomy;
  return (
    <Shell page="index" className="motion-home">
      <div className="home-content">
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="eyebrow">MOTION ATLAS · 影像与操作台参考库</p>
            <h1>
              让画面有<em>节拍</em>，<br />
              让界面会呼吸。
            </h1>
            <p className="home-lead">
              拆解影像与界面中的动态设计：每个案例都附有节拍表、动效参数和可复用
              Prompt，并提供可拖动时间轴、逐帧播放的 Demo。
            </p>
            <div className="home-cta">
              <ActionLink variant="primary" href="cases.html">
                浏览案例库
              </ActionLink>
              <ActionLink href="patterns.html">打开巧思库</ActionLink>
              <ActionLink href="materials.html">打开素材库</ActionLink>
              <ActionLink href="lab.html">节奏实验室</ActionLink>
            </div>
            <p className="home-stats">
              {catalog.cases.length} 个完整案例 · {catalog.patterns.length}{' '}
              个独立巧思 · {catalog.materials.length} 个创作素材 ·{' '}
              {catalog.cases.filter((entry) => entry.timeline).length}{' '}
              个可逐帧渲染的 Demo
            </p>
          </div>
          <Monitor />
        </section>
        <section className="home-band">
          <header>
            <p className="eyebrow">TWO CARRIERS</p>
            <h2>两种载体，一套节奏语言</h2>
          </header>
          <div className="home-carriers">
            {Object.entries(taxonomy.carriers).map(([key, label]) => (
              <a
                href={'cases.html?carrier=' + key}
                className="home-carrier"
                key={key}
              >
                <span className="carrier-count">
                  {String(
                    catalog.cases.filter((entry) =>
                      entry.carriers.includes(key),
                    ).length,
                  ).padStart(2, '0')}
                </span>
                <h3>{label}</h3>
                <p>{carrierCopy[key][0]}</p>
                <span className="carrier-example">{carrierCopy[key][1]}</span>
              </a>
            ))}
          </div>
        </section>
        <section className="home-band">
          <header>
            <p className="eyebrow">HOW A CASE IS BUILT</p>
            <h2>一个案例怎么拆</h2>
          </header>
          <ol className="home-steps">
            {steps.map(([title, description], index) => (
              <li key={title}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="home-band">
          <header className="home-section-row">
            <div>
              <p className="eyebrow">CASES</p>
              <h2>完整案例</h2>
            </div>
            <a href="cases.html">全部案例</a>
          </header>
          <div className="entry-grid">
            {catalog.cases.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                kind="cases"
                href={`cases.html#case/${entry.id}`}
                showIndex={index + 1}
              />
            ))}
          </div>
        </section>
        <section className="home-band">
          <header className="home-section-row">
            <div>
              <p className="eyebrow">PATTERNS</p>
              <h2>按体验类型拿巧思</h2>
            </div>
            <a href="patterns.html">全部巧思</a>
          </header>
          <div className="home-types">
            {Object.entries(taxonomy.types).map(([key, label]) => {
              const count = catalog.patterns.filter((entry) =>
                entry.types.includes(key),
              ).length;
              return (
                count > 0 && (
                  <a href={'patterns.html?type=' + key} key={key}>
                    <span>
                      {label}
                      <small>{key}</small>
                    </span>
                    <b>{String(count).padStart(2, '0')}</b>
                  </a>
                )
              );
            })}
          </div>
        </section>
        <section className="home-band home-agent">
          <div>
            <p className="eyebrow">FOR AGENTS</p>
            <h2>给 Agent 的同一套资料</h2>
            <p>
              提供结构化索引、每个条目的完整资料包和命令行工具，用于检索、读取和导出可运行的
              Demo。
            </p>
            <ActionLink href="agent.html">Agent 工作流</ActionLink>
          </div>
          <CodeBlock code={commands} language="shell" />
        </section>
      </div>
    </Shell>
  );
}
