import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ExternalLink,
  Maximize,
  Minimize,
  Minus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import catalog from 'atlas:catalog';
import {
  Button,
  CodeBlock,
  CopyButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
} from './ui';
import { ActionLink, FavoriteAction, IconAction } from './actions';
import { MotionPlayer } from './MotionPlayer';
import { navigate } from '../state/location';
import { formatTime } from '../domain/motion-data';
import { project } from '../project';
import '../styles/detail.css';
const taxonomy = catalog.taxonomy;
const prefixes = { cases: 'case', patterns: 'pattern', materials: 'material' };
const libraryNames = {
  cases: '案例库',
  patterns: '巧思库',
  materials: '素材库',
};
const headingId = (title) => 'detail-' + encodeURIComponent(title);
const lookup = (kind, id) => catalog[kind].find((entry) => entry.id === id);
function Section({ title, children }) {
  return (
    <section>
      <h2 id={headingId(title)}>{title}</h2>
      {children}
    </section>
  );
}
function List({ values = [], ordered = false }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    values.length > 0 && (
      <Tag>
        {values.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </Tag>
    )
  );
}
function Definitions({ values }) {
  return (
    <dl className="composition-map">
      {values
        .filter(([, value]) => value)
        .map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </div>
        ))}
    </dl>
  );
}
function Parameters({ values }) {
  return (
    values.length > 0 && (
      <div className="parameters-scroll">
        <table className="parameter-table">
          <tbody>
            {values.map((value, index) => (
              <tr key={index}>
                <th scope="row">{value.name || value.field}</th>
                <td>
                  {value.value || value.how || value.role}
                  {(value.note || value.source) && (
                    <p className="support-text">
                      {[value.note, value.source].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  );
}
function SourceLink({ href, children, base }) {
  if (!href) return children;
  const url = new URL(href, base || location.href);
  const external = url.origin !== location.origin;
  const target =
    !external && url.pathname.endsWith('.md')
      ? project.documentURL(
          decodeURIComponent(url.pathname.slice(1)),
          decodeURIComponent(url.hash.slice(1)),
        )
      : url.href;
  return (
    <a
      href={target}
      target={external ? '_blank' : void 0}
      rel={external ? 'noreferrer' : void 0}
    >
      {children}
      {external && <ExternalLink size={13} aria-hidden="true" />}
    </a>
  );
}
function InlineText({ text, base }) {
  return text
    .split(/(`[^`]+`|\[[^\]]+\]\([^)\s]+\)|<https?:\/\/[^>]+>)/)
    .map((part, index) => {
      if (part.startsWith('`'))
        return <code key={index}>{part.slice(1, -1)}</code>;
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link)
        return (
          <SourceLink key={index} href={link[2]} base={base}>
            {link[1]}
          </SourceLink>
        );
      if (/^<https?:/.test(part))
        return (
          <SourceLink key={index} href={part.slice(1, -1)} base={base}>
            {part.slice(1, -1)}
          </SourceLink>
        );
      return part;
    });
}
function Documents({ entry }) {
  const links = [
    ['research', '阅读说明与研究'],
    ['fidelity', '复刻对照'],
    ['licenses', '许可原文索引'],
  ].filter(([key]) => entry[key]);
  return (
    links.length > 0 && (
      <Section title="相关文档">
        <ul>
          {links.map(([key, label]) => (
            <li key={key}>
              <a href={project.documentURL(entry[key])}>{label}</a>
            </li>
          ))}
        </ul>
      </Section>
    )
  );
}
function Related({ entry }) {
  return (
    entry.relatedEntries?.length > 0 && (
      <ul>
        {entry.relatedEntries.map((relation) => {
          const kind =
            { case: 'cases', pattern: 'patterns', material: 'materials' }[
              relation.kind
            ] || relation.kind;
          return (
            <li key={kind + relation.id}>
              <a href={`${kind}.html#${prefixes[kind]}/${relation.id}`}>
                {lookup(kind, relation.id).title}
              </a>
              ：{relation.note}
            </li>
          );
        })}
      </ul>
    )
  );
}
function Prompt({ entry }) {
  const tabs = [
    { value: 'impl', label: '实现 Prompt', text: entry.prompt },
    ...(entry.videoPrompt
      ? [{ value: 'video', label: '视频生成 Prompt', text: entry.videoPrompt }]
      : []),
    ...(entry.negativePrompt
      ? [{ value: 'neg', label: '负向约束', text: entry.negativePrompt }]
      : []),
  ];
  return (
    <Tabs defaultValue="impl">
      <TabsList aria-label="Prompt 类型">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <CodeBlock code={tab.text} language="text" maxLines={14} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
function CaseSources({ entry }) {
  const scopes = entry.attribution.some((item) => item.scope === '制作来源')
    ? ['制作来源']
    : ['作品', '作品代码', '原作', '参考'];
  const credits = entry.attribution.filter((item) =>
    scopes.includes(item.scope),
  );
  const notes = credits.map((item) => item.notes).join('\n');
  const sources = (entry.sources || []).filter(
    (source) => !notes.includes(source.url),
  );
  const base = new URL(entry.demo, location.href).href;
  return (
    (credits.length > 0 || sources.length > 0) && (
      <Section title="许可与来源">
        <Definitions
          values={credits.map((item) => [
            item.scope,
            item.notes.split(/\n\s*\n/).map((text, index) => (
              <p key={index}>
                <InlineText text={text} base={base} />
              </p>
            )),
          ])}
        />
        {entry.upstream?.version && !notes.includes(entry.upstream.version) && (
          <p>
            上游版本：
            <SourceLink
              href={`https://github.com/${entry.upstream.repository}/commit/${entry.upstream.commit}`}
            >
              {entry.upstream.version}
            </SourceLink>
          </p>
        )}
        {sources.length > 0 && (
          <ul>
            {sources.map((source, index) => (
              <li key={index}>
                <SourceLink href={source.url} base={base}>
                  {source.label || source.title}
                </SourceLink>
              </li>
            ))}
          </ul>
        )}
      </Section>
    )
  );
}
function Fit({ entry }) {
  return (
    (entry.useCases?.length > 0 ||
      entry.avoid?.length > 0 ||
      entry.constraints?.length > 0) && (
      <Section title="适用与边界">
        <Definitions
          values={[
            ['适用', entry.useCases?.join('、')],
            ['避免', entry.avoid?.join('、')],
          ]}
        />
        <List values={entry.constraints} />
      </Section>
    )
  );
}
function CaseNotes({ entry, onSeek }) {
  const composition = entry.composition || {};
  const fields = [
    ['色彩', composition.color],
    ['字体', composition.typography],
    ['版式', composition.layout],
    ['图像', composition.imagery],
    ['动效', composition.motion],
    ['交互', composition.interaction],
    ['声音', composition.sound],
    ['节奏', composition.rhythm],
    ['协调', composition.coherence],
  ].filter(([, value]) => value);
  return (
    <>
      <Section title="概述">
        <p>{entry.summary}</p>
        {entry.focus && <p>{entry.focus}</p>}
      </Section>
      {entry.rhythm?.beats?.length > 0 && (
        <Section title="节奏结构">
          <div className="parameters-scroll">
            <table className="parameter-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>节拍</th>
                  <th>发生了什么</th>
                </tr>
              </thead>
              <tbody>
                {entry.rhythm.beats.map((beat, index) => (
                  <tr key={index}>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSeek(beat.t)}
                      >
                        {formatTime(beat.t).replace(/^00:/, '')}
                      </Button>
                    </td>
                    <td>{beat.label}</td>
                    <td>{beat.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {entry.energyNote && <p>{entry.energyNote}</p>}
        </Section>
      )}
      {(fields.length > 0 || entry.tokens?.palette?.length > 0) && (
        <Section title="构成">
          {entry.tokens?.palette?.length > 0 && (
            <div className="palette-swatches">
              {entry.tokens.palette.map((color) => (
                <span key={color}>
                  <i style={{ background: color }} />
                  {color}
                </span>
              ))}
            </div>
          )}
          <Definitions values={fields} />
        </Section>
      )}
      {entry.tokens?.motion?.length > 0 && (
        <Section title="动效 Token">
          <Parameters values={entry.tokens.motion} />
        </Section>
      )}
      {entry.layers?.length > 0 && (
        <Section title="画面分层">
          <Parameters values={entry.layers} />
        </Section>
      )}
      {entry.observations?.length > 0 && (
        <Section title="画面细节">
          <ul>
            {entry.observations.map((observation, index) => (
              <li key={index}>
                {typeof observation === 'string' ? (
                  observation
                ) : (
                  <>
                    {observation.at && <strong>{observation.at}：</strong>}
                    {observation.what}
                  </>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Section title="可复用 Prompt">
        <Prompt entry={entry} />
      </Section>
      {entry.migration?.length > 0 && (
        <Section title="迁移指南">
          <Parameters values={entry.migration} />
        </Section>
      )}
      <Fit entry={entry} />
      {entry.patternIds?.length > 0 && (
        <Section title="关联巧思">
          <ul>
            {entry.patternIds.map((id) => (
              <li key={id}>
                <a href={'patterns.html#pattern/' + id}>
                  {lookup('patterns', id).title}
                </a>
                <p>{lookup('patterns', id).summary}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {entry.relatedEntries?.some(
        (relation) => relation.kind === 'material',
      ) && (
        <Section title="关联素材">
          <Related
            entry={{
              relatedEntries: entry.relatedEntries.filter(
                (relation) => relation.kind === 'material',
              ),
            }}
          />
        </Section>
      )}
      <CaseSources entry={entry} />
      <Documents entry={entry} />
    </>
  );
}
function PatternNotes({ entry }) {
  const composition = entry.composition || {};
  const parameters = [...entry.timing, ...(entry.parameters || [])];
  const relations = [
    ['搭配', composition.pairsWellWith],
    ['冲突', composition.conflicts],
  ].filter(([, ids]) => ids?.length);
  return (
    <>
      <Section title="机制">
        <p>{entry.mechanism}</p>
        <Definitions
          values={[
            ['触发', entry.trigger],
            ['结果', entry.effect],
          ]}
        />
      </Section>
      {parameters.length > 0 && (
        <Section title="参数">
          <Parameters values={parameters} />
        </Section>
      )}
      <Section title="可复用 Prompt">
        <CodeBlock code={entry.prompt} language="text" maxLines={14} />
      </Section>
      <Fit entry={entry} />
      {(composition.role || composition.notes || relations.length > 0) && (
        <Section title="组合">
          <Definitions
            values={[
              ['职责', taxonomy.roles[composition.role] || composition.role],
              ...relations.map(([key, ids]) => [
                key,
                ids.map((id, index) => (
                  <span key={id}>
                    {index > 0 ? '、' : ''}
                    <a
                      href={
                        'patterns.html' + location.search + '#pattern/' + id
                      }
                    >
                      {lookup('patterns', id).title}
                    </a>
                  </span>
                )),
              ]),
            ]}
          />
          {composition.notes && <p>{composition.notes}</p>}
        </Section>
      )}
      {entry.sources.length > 0 && (
        <Section title="来源案例">
          <ul>
            {entry.sources.map((source) => (
              <li key={source.caseId}>
                <a href={'cases.html#case/' + source.caseId}>
                  {lookup('cases', source.caseId).title}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Documents entry={entry} />
    </>
  );
}
function SnapshotLinks({ entry }) {
  const references = [
    ['README.zh-CN.md', '中文说明'],
    ['README.md', '原版说明'],
  ];
  if (entry.type === 'prompt-kit')
    references.push(
      ['template.md', '提示词模板'],
      ['rubric.md', '评审量表'],
      ['lib/audio/README.md', 'mgaudio 配乐说明'],
      ...entry.snapshotFiles
        .filter(
          (file) =>
            file.startsWith(entry.snapshotPath + 'prompts/') &&
            file.endsWith('.md'),
        )
        .map((file) => [file.slice(entry.snapshotPath.length), '风格提示词']),
    );
  return (
    <ul>
      <li>
        <a href={project.documentURL(entry.snapshotPath + entry.snapshotEntry)}>
          {entry.type === 'agent-skill' ? '技能原文' : '素材原文'}（
          {entry.snapshotEntry}）
        </a>
      </li>
      {references
        .filter(
          ([file]) =>
            entry.snapshotFiles.includes(entry.snapshotPath + file) &&
            file !== entry.snapshotEntry,
        )
        .map(([file, label]) => (
          <li key={file}>
            <a href={project.documentURL(entry.snapshotPath + file)}>
              {label}（{file}）
            </a>
          </li>
        ))}
    </ul>
  );
}
function MaterialPreview({ entry }) {
  const panel = useRef(null);
  const frame = useRef(null);
  const [sound, setSound] = useState(true);
  const [pseudo, setPseudo] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  function postSound() {
    frame.current?.contentWindow?.postMessage(
      { type: 'motion:sound', on: sound },
      location.origin,
    );
  }
  useEffect(() => {
    postSound();
  }, [sound]);
  useEffect(() => {
    const change = () =>
      setFullscreen(document.fullscreenElement === panel.current);
    const escape = (event) => {
      if (event.key === 'Escape') setPseudo(false);
    };
    document.addEventListener('fullscreenchange', change);
    window.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('fullscreenchange', change);
      window.removeEventListener('keydown', escape);
    };
  }, []);
  useEffect(() => {
    if (!pseudo) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [pseudo]);
  async function toggleFullscreen() {
    if (fullscreen || pseudo) {
      if (document.fullscreenElement) await document.exitFullscreen();
      setPseudo(false);
    } else {
      try {
        if (!panel.current.requestFullscreen) {
          setPseudo(true);
          return;
        }
        await panel.current.requestFullscreen();
      } catch {
        setPseudo(true);
      }
    }
  }
  return (
    <section
      className={`material-preview-panel ${pseudo ? 'pseudo-fullscreen' : ''}`}
      ref={panel}
      aria-label="素材预览"
    >
      {entry.demo && (
        <div className="preview-toolbar">
          <div className="preview-actions">
            {entry.type === 'sound' && (
              <Button
                variant="secondary"
                aria-pressed={sound}
                aria-label={'声音：' + (sound ? '开' : '关')}
                onClick={() => setSound(!sound)}
              >
                {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
                {sound ? '开' : '关'}
              </Button>
            )}
            <IconAction label="全屏查看" onClick={toggleFullscreen}>
              {fullscreen || pseudo ? (
                <Minimize size={17} />
              ) : (
                <Maximize size={17} />
              )}
            </IconAction>
            <ActionLink href={entry.demo} target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              独立打开
            </ActionLink>
          </div>
        </div>
      )}
      {entry.demo ? (
        <div className="material-iframe">
          <iframe
            ref={frame}
            src={entry.demo}
            title={entry.title}
            allow="autoplay; fullscreen"
            onLoad={postSound}
          />
        </div>
      ) : entry.skillGuide ? (
        <>
          {entry.skillGuide.map((group) => (
            <Section title={group.title} key={group.title}>
              <div className="skill-guide-list">
                {group.skills.map((skill) => (
                  <a
                    key={skill.id}
                    href={project.documentURL(
                      entry.snapshotPath + 'skills/' + skill.id + '/SKILL.md',
                    )}
                  >
                    <strong>{skill.title}</strong>
                    <code>/{skill.id}</code>
                    <span>{skill.description}</span>
                  </a>
                ))}
              </div>
            </Section>
          ))}
          <Section title="从计划到成片">
            <List values={entry.workflow} ordered />
          </Section>
        </>
      ) : (
        <>
          {entry.gallery?.length > 0 && (
            <Section title="效果图画廊">
              <div className="material-gallery">
                {entry.gallery.map((image, index) => (
                  <figure key={image.path + index}>
                    <a
                      href={image.path}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={'查看原图：' + image.caption}
                    >
                      <img
                        src={image.path}
                        alt={image.caption}
                        loading="lazy"
                      />
                    </a>
                    <figcaption>
                      <span className="entry-tag accent-tag">
                        {
                          {
                            style: '风格样张',
                            work: '作品节选',
                            theme: '主题预览',
                          }[image.kind]
                        }
                      </span>
                      <p>{image.caption}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Section>
          )}
          {entry.snapshotPath && (
            <Section
              title={
                entry.type === 'agent-skill' ? 'skill 原文入口' : '素材原文入口'
              }
            >
              <SnapshotLinks entry={entry} />
            </Section>
          )}
        </>
      )}
    </section>
  );
}
function MaterialNotes({ entry }) {
  return (
    <>
      <Section title="说明">
        <p>{entry.summary}</p>
      </Section>
      {entry.workflow?.length > 0 && !entry.skillGuide && (
        <Section title="工作流">
          <List values={entry.workflow} ordered />
        </Section>
      )}
      <Section title="适合与避用">
        {entry.useCases?.length > 0 && (
          <>
            <h3>适合</h3>
            <List values={entry.useCases} />
          </>
        )}
        {entry.avoid?.length > 0 && (
          <>
            <h3>避用</h3>
            <List values={entry.avoid} />
          </>
        )}
      </Section>
      {entry.relatedEntries?.length > 0 && (
        <Section title="关联条目">
          <Related entry={entry} />
        </Section>
      )}
      {entry.install && (
        <Section title="安装方式">
          <CodeBlock code={entry.install} language="text" maxLines={14} />
        </Section>
      )}
      <Section title="许可与来源">
        <Definitions
          values={[
            [
              entry.upstream.repository ? '上游仓库' : '原始出处',
              <SourceLink href={entry.upstream.url}>
                {entry.upstream.repository || entry.upstream.url}
              </SourceLink>,
            ],
            ['固定提交', entry.upstream.commit],
            ['上游版本', entry.upstream.version],
            [
              entry.type === 'agent-skill' ? '技能许可' : '素材许可',
              <SourceLink href={entry.license.url}>
                {entry.license.name}
              </SourceLink>,
            ],
          ]}
        />
        {entry.license.notes && <p>{entry.license.notes}</p>}
        {entry.snapshotPath &&
          entry.snapshotFiles.includes(entry.snapshotPath + 'LICENSE') &&
          entry.license.url !== entry.snapshotPath + 'LICENSE' && (
            <p>
              <a href={entry.snapshotPath + 'LICENSE'}>快照附带许可原文</a>
            </p>
          )}
        <ul>
          {entry.sources.map((source, index) => (
            <li key={index}>
              <SourceLink href={source.url}>
                {source.title || source.label}
              </SourceLink>
            </li>
          ))}
        </ul>
      </Section>
      <Documents entry={entry} />
    </>
  );
}
export function MotionDetail({ kind, entry, listHref }) {
  const actionsRef = useRef(null);
  const notesRef = useRef(null);
  const contentRef = useRef(null);
  const player = useRef(null);
  const [toc, setToc] = useState([]);
  const [active, setActive] = useState(null);
  const [metrics, setMetrics] = useState({
    top: 0,
    actionsHeight: 0,
    notesSticky: false,
  });
  useEffect(() => {
    document.title = `${entry.title} · Motion Atlas`;
    const headings = [...notesRef.current.querySelectorAll('h1,h2')];
    setToc(headings.map((node) => ({ id: node.id, title: node.textContent })));
    let frame;
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setActive(
          (
            headings.findLast(
              (node) => node.getBoundingClientRect().top <= metrics.top + 8,
            ) || headings[0]
          ).id,
        ),
      );
    };
    window.addEventListener('scroll', scroll, { passive: true });
    scroll();
    return () => {
      window.removeEventListener('scroll', scroll);
      cancelAnimationFrame(frame);
    };
  }, [entry, metrics.top]);
  useLayoutEffect(() => {
    const update = () => {
      const top =
        document.querySelector('.site-header').offsetHeight +
        actionsRef.current.offsetHeight +
        24;
      const available = innerHeight - top - 24;
      setMetrics({
        top,
        actionsHeight: actionsRef.current.offsetHeight,
        notesSticky:
          innerWidth >= 1160 && notesRef.current.offsetHeight <= available,
      });
    };
    const observer = new ResizeObserver(update);
    [actionsRef.current, notesRef.current, contentRef.current].forEach((node) =>
      observer.observe(node),
    );
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);
  function back(event) {
    if (
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    if (history.state?.depth) history.go(-history.state.depth);
    else navigate(listHref);
  }
  function detailLink(event) {
    if (
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = event.target.closest('a[href]');
    if (!link || link.target || link.download) return;
    const target = new URL(link.href, location.href);
    if (
      target.pathname === location.pathname &&
      target.hash.startsWith('#' + prefixes[kind] + '/')
    ) {
      event.preventDefault();
      navigate(target, { state: { depth: (history.state?.depth || 0) + 1 } });
    }
  }
  const tags =
    kind === 'materials'
      ? [taxonomy.materialTypes[entry.type]]
      : kind === 'cases'
        ? [
            taxonomy.styles[entry.style],
            ...entry.carriers.map((value) => taxonomy.carriers[value]),
            taxonomy.purposes[entry.purpose],
            ...entry.tech.map((value) => taxonomy.techs[value]),
            ...(entry.tags || []),
          ]
        : [
            ...entry.types.map((value) => taxonomy.types[value]),
            ...entry.carriers.map((value) => taxonomy.carriers[value]),
          ];
  return (
    <article
      className="detail-page motion-detail"
      style={{
        '--detail-sticky-top': `calc(var(--atlas-visible-header) + ${metrics.actionsHeight + 24}px)`,
      }}
    >
      <div className="detail-actions" ref={actionsRef}>
        <ActionLink href={listHref} onClick={back}>
          返回{libraryNames[kind]}
        </ActionLink>
        <div>
          <FavoriteAction kind={kind} entry={entry} />
          <ActionLink
            href={`agent/${kind}/${entry.id}.json`}
            download
            aria-label="下载资料包 JSON"
          >
            资料包 JSON
          </ActionLink>
          {kind !== 'materials' && (
            <CopyButton
              label="复制 Prompt"
              variant="filled"
              value={entry.prompt}
            />
          )}
        </div>
      </div>
      <div className="detail-columns" ref={contentRef}>
        {kind === 'materials' ? (
          <MaterialPreview entry={entry} />
        ) : (
          <MotionPlayer ref={player} entry={entry} actionsRef={actionsRef} />
        )}
        <div
          className="detail-notes"
          ref={notesRef}
          style={
            metrics.notesSticky
              ? { position: 'sticky', top: 'var(--detail-sticky-top)' }
              : void 0
          }
          onClick={detailLink}
        >
          <header className="detail-heading">
            <p className="eyebrow">
              {String(catalog[kind].indexOf(entry) + 1).padStart(2, '0')} /{' '}
              {kind === 'cases'
                ? 'CASE'
                : kind === 'patterns'
                  ? 'PATTERN'
                  : '素材'}{' '}
              · {entry.id}
            </p>
            <h1 id={headingId(entry.title)}>{entry.title}</h1>
            {entry.subtitle && <p>{entry.subtitle}</p>}
            <div className="entry-tags">
              {tags.map((tag, index) => (
                <span className="entry-tag" key={tag + index}>
                  {tag}
                </span>
              ))}
            </div>
          </header>
          {kind === 'cases' ? (
            <CaseNotes
              entry={entry}
              onSeek={(time) => player.current.seek(time)}
            />
          ) : kind === 'patterns' ? (
            <PatternNotes entry={entry} />
          ) : (
            <MaterialNotes entry={entry} />
          )}
        </div>
      </div>
      <nav className="floating-detail-toc" aria-label="详情目录">
        {toc.map((heading) => (
          <Tooltip key={heading.id} content={heading.title} side="left">
            <Button
              variant="ghost"
              className="toc-marker"
              aria-label={heading.title}
              aria-current={active === heading.id ? 'location' : void 0}
              onClick={() => {
                const node = document.getElementById(heading.id);
                window.scrollTo({
                  top: scrollY + node.getBoundingClientRect().top - metrics.top,
                  behavior: matchMedia('(prefers-reduced-motion:reduce)')
                    .matches
                    ? 'instant'
                    : 'smooth',
                });
              }}
            >
              <Minus size={22} />
            </Button>
          </Tooltip>
        ))}
      </nav>
    </article>
  );
}
