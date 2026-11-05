import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Download, Filter, Upload } from 'lucide-react';
import catalog from 'atlas:catalog';
import {
  Accordion,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  SearchField,
  useToastStack,
} from '../components/ui';
import { Choice, IconAction } from '../components/actions';
import { EntryCard } from '../components/EntryCard';
import { Shell } from '../components/Shell';
import { MotionDetail } from '../components/MotionDetail';
import { navigate, useLocation } from '../state/location';
import { usePreferences } from '../state/preferences';
import '../styles/library.css';
const labels = { cases: '案例库', patterns: '巧思库', materials: '素材库' };
const prefixes = { cases: 'case', patterns: 'pattern', materials: 'material' };
const taxonomy = catalog.taxonomy;
const options = (values, all) => [
  { value: 'all', label: all },
  ...Object.entries(values).map(([value, label]) => ({ value, label })),
];
function DirectoryItem({ label, count, icon, ...props }) {
  return (
    <div className="directory-item">
      <Button
        variant="ghost"
        {...props}
        aria-label={count === void 0 ? label : `${label} ${count}`}
      >
        {label}
      </Button>
      <span className="directory-item-end" aria-hidden="true">
        {icon ||
          (count === void 0 ? null : (
            <b className="directory-count">{String(count).padStart(2, '0')}</b>
          ))}
      </span>
    </div>
  );
}
function LibraryHero({ kind }) {
  const copy =
    kind === 'cases'
      ? {
          eyebrow: 'CASE COLLECTION · RHYTHM / MOTION / HUD',
          title: (
            <>
              先看懂节拍，
              <br />
              再拿走<em>动势</em>。
            </>
          ),
          description:
            '节拍表、动效参数、可复用 Prompt，以及可拖动时间轴逐帧查看的 Demo。',
        }
      : kind === 'patterns'
        ? {
            eyebrow: 'PATTERN COLLECTION · ATOMIC MECHANISMS',
            title: (
              <>
                一个触发，
                <br />
                一种<em>可借用</em>的结果。
              </>
            ),
            description:
              '每个巧思都有触发方式、效果、参数、可复制的 Prompt 和独立 Demo。',
          }
        : {
            eyebrow: '素材库 · 工作流与实现手段',
            title: (
              <>
                找到<em>实现手段</em>，<br />
                让想法走向成片。
              </>
            ),
            description: '工作流、适用场景、作者效果图与固定版本的技能原文。',
          };
  return (
    <header className="library-hero">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="hero-description" title={copy.description}>
          {copy.description}
        </p>
      </div>
      <svg className="motion-hero-art" viewBox="0 0 380 220" aria-hidden="true">
        <g fontFamily="var(--atlas-mono)" fontSize="12" fill="var(--muted)">
          <text x="0" y="34">
            cam
          </text>
          <text x="0" y="84">
            hud
          </text>
          <text x="0" y="134">
            type
          </text>
          <text x="0" y="184">
            sfx
          </text>
        </g>
        <g stroke="var(--line-2)">
          <path d="M50 30H380M50 80H380M50 130H380M50 180H380" />
        </g>
        <g fill="var(--ink)">
          <path d="M90 30l7-7 7 7-7 7zM190 30l7-7 7 7-7 7zM320 30l7-7 7 7-7 7z" />
          <rect x="120" y="74" width="120" height="12" rx="3" opacity=".85" />
          <rect x="260" y="74" width="80" height="12" rx="3" opacity=".4" />
          <path
            d="M70 130l7-7 7 7-7 7zM100 130l7-7 7 7-7 7zM130 130l7-7 7 7-7 7z"
            opacity=".6"
          />
        </g>
        <g fill="var(--accent-1)">
          <circle cx="150" cy="180" r="5" />
          <circle cx="210" cy="180" r="5" />
          <circle cx="270" cy="180" r="5" />
          <circle cx="330" cy="180" r="5" />
        </g>
        <path
          d="M50 214C100 214 120 196 160 186S240 150 280 160 340 206 380 200"
          fill="none"
          stroke="var(--accent-1)"
          strokeWidth="2"
        />
        <g className="hero-playhead">
          <rect x="236" y="8" width="2" height="212" fill="var(--accent-1)" />
          <path d="M231 4h12l-6 8z" fill="var(--accent-1)" />
        </g>
      </svg>
    </header>
  );
}
export default function CatalogPage({ kind }) {
  const url = useLocation();
  const params = url.searchParams;
  const route = decodeURIComponent(url.hash.slice(1).split('?')[0]);
  const id = route.startsWith(prefixes[kind] + '/')
    ? route.slice(prefixes[kind].length + 1)
    : null;
  const entry = id && catalog[kind].find((item) => item.id === id);
  const { favorites, exportFavorites, importFavorites } = usePreferences();
  const { toast } = useToastStack();
  const search = useRef(null);
  const importer = useRef(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const previousDetail = useRef(false);
  const group = kind === 'cases' ? 'style' : 'type';
  const groups =
    kind === 'cases'
      ? taxonomy.styles
      : kind === 'patterns'
        ? taxonomy.types
        : Object.fromEntries(
            Object.entries(taxonomy.materialTypes).filter(([value]) =>
              catalog.materials.some((item) => item.type === value),
            ),
          );
  const state = {
    carrier: params.get('carrier') || 'all',
    style: params.get('style') || 'all',
    purpose: params.get('purpose') || 'all',
    tech: params.get('tech') || 'all',
    type: params.get('type') || 'all',
    caseId: params.get('case') || 'all',
    fav: params.get('fav') === '1',
    query: params.get('q') || '',
    sort: params.get('sort') === 'title' ? 'title' : 'order',
    dir: params.get('dir') === 'desc' ? 'desc' : 'asc',
  };
  const listHref = kind + '.html' + url.search;
  useEffect(() => {
    history.scrollRestoration = 'manual';
    if (id) window.scrollTo({ top: 0, behavior: 'instant' });
    else if (previousDetail.current)
      requestAnimationFrame(() =>
        window.scrollTo({
          top: history.state?.listScroll || 0,
          behavior: 'instant',
        }),
      );
    previousDetail.current = Boolean(id);
    return () => {
      history.scrollRestoration = 'auto';
    };
  }, [id]);
  useEffect(() => {
    const keyboard = (event) => {
      if (
        event.key !== '/' ||
        event.target.closest('input,textarea,select,[contenteditable]') ||
        document.querySelector('[role="dialog"]')
      )
        return;
      event.preventDefault();
      if (id) navigate(listHref);
      requestAnimationFrame(() => search.current?.focus());
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [id, listHref]);
  useEffect(() => {
    const media = matchMedia('(max-width:800px)');
    const close = () => {
      if (!media.matches) setFiltersOpen(false);
    };
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  function update(patch, replace = false) {
    const next = new URL(kind + '.html' + url.search, location.href);
    for (const [key, value] of Object.entries(patch))
      value === null || value === 'all' || value === ''
        ? next.searchParams.delete(key)
        : next.searchParams.set(key, value);
    navigate(next, { replace });
  }
  function clear() {
    const next = new URL(kind + '.html', location.href);
    if (state.sort !== 'order') next.searchParams.set('sort', state.sort);
    if (state.dir !== 'asc') next.searchParams.set('dir', state.dir);
    navigate(next);
  }
  function filtered(filters2 = state) {
    const words = filters2.query.toLowerCase().split(/\s+/).filter(Boolean);
    const haystack = (item) =>
      [
        item.id,
        item.title,
        item.subtitle,
        item.summary,
        ...(item.tags || []),
        ...(item.useCases || []),
        item.mechanism,
        item.trigger,
        item.effect,
        ...(item.workflow || []),
        ...(item.avoid || []),
        taxonomy.materialTypes[item.type],
        ...(item.carriers || []).map((value) => taxonomy.carriers[value]),
        ...(item.types || []).map((value) => taxonomy.types[value]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    const result = catalog[kind].filter((item) => {
      if (
        filters2.carrier !== 'all' &&
        !item.carriers?.includes(filters2.carrier)
      )
        return false;
      if (
        kind === 'cases' &&
        ((filters2.style !== 'all' && item.style !== filters2.style) ||
          (filters2.purpose !== 'all' && item.purpose !== filters2.purpose) ||
          (filters2.tech !== 'all' && !item.tech.includes(filters2.tech)))
      )
        return false;
      if (
        kind === 'patterns' &&
        ((filters2.type !== 'all' && !item.types.includes(filters2.type)) ||
          (filters2.caseId !== 'all' &&
            !item.sources.some((source) => source.caseId === filters2.caseId)))
      )
        return false;
      if (
        kind === 'materials' &&
        filters2.type !== 'all' &&
        item.type !== filters2.type
      )
        return false;
      if (filters2.fav && !favorites[kind].includes(item.id)) return false;
      return words.every((word) => haystack(item).includes(word));
    });
    if (filters2.sort === 'title')
      result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
    if (filters2.dir === 'desc') result.reverse();
    return result;
  }
  const results = filtered();
  const categoryItems = (
    <div className="directory-items">
      {options(groups, kind === 'cases' ? '全部' : '全部类型').map((option) => (
        <DirectoryItem
          key={option.value}
          label={option.label}
          count={
            filtered({ ...state, fav: false, [group]: option.value }).length
          }
          aria-pressed={!state.fav && state[group] === option.value}
          data-close-directory
          onClick={() => update({ [group]: option.value, fav: null })}
        />
      ))}
    </div>
  );
  const tools = (
    <div className="directory-items">
      <DirectoryItem
        label="我的收藏"
        count={favorites[kind].length}
        aria-pressed={state.fav}
        data-close-directory
        onClick={() => update({ fav: '1', [group]: null })}
      />
      <DirectoryItem
        label="导出收藏"
        icon={<Download size={15} />}
        onClick={exportFavorites}
      />
      <DirectoryItem
        label="导入收藏"
        icon={<Upload size={15} />}
        onClick={() => importer.current.click()}
      />
    </div>
  );
  const directory = (
    <>
      <section className="directory-group">
        <Accordion
          items={[
            {
              title: kind === 'cases' ? '画面风格' : '类型',
              content: categoryItems,
            },
          ]}
        />
      </section>
      <section className="directory-group">
        <Accordion items={[{ title: '收藏', content: tools }]} />
        <input
          ref={importer}
          type="file"
          accept="application/json"
          hidden
          onChange={async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            try {
              await importFavorites(file);
            } catch (error) {
              toast({ title: error.message, type: 'error' });
            }
            event.target.value = '';
          }}
        />
      </section>
    </>
  );
  const filters = [];
  if (state.fav)
    filters.push({
      key: group,
      label: kind === 'cases' ? '画面风格' : '类型',
      options: options(
        Object.fromEntries(
          Object.entries(groups).filter(([value]) =>
            catalog[kind].some(
              (item) =>
                favorites[kind].includes(item.id) &&
                (kind === 'cases'
                  ? item.style === value
                  : kind === 'patterns'
                    ? item.types.includes(value)
                    : item.type === value),
            ),
          ),
        ),
        '全部类型',
      ),
    });
  if (kind !== 'materials')
    filters.push({
      key: 'carrier',
      label: '载体',
      options: options(taxonomy.carriers, '全部载体'),
    });
  if (kind === 'cases')
    filters.push(
      {
        key: 'purpose',
        label: '用途',
        options: options(taxonomy.purposes, '全部用途'),
      },
      {
        key: 'tech',
        label: '技术',
        options: options(taxonomy.techs, '全部技术'),
      },
    );
  if (kind === 'patterns')
    filters.push({
      key: 'case',
      label: '所属案例',
      options: [
        { value: 'all', label: '全部案例' },
        ...catalog.cases.map((item) => ({ value: item.id, label: item.title })),
      ],
    });
  const filterFields = filters.map((filter) => (
    <Choice
      key={filter.key}
      label={filter.label}
      value={params.get(filter.key) || 'all'}
      options={filter.options}
      onValueChange={(value) => update({ [filter.key]: value })}
    />
  ));
  const count = filters.filter((filter) => params.has(filter.key)).length;
  const hasFilters =
    ['carrier', 'style', 'purpose', 'tech', 'type', 'caseId'].some(
      (key) => state[key] !== 'all',
    ) ||
    state.query ||
    state.fav;
  function open(event, item) {
    if (
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    history.replaceState({ ...history.state, listScroll: scrollY }, '');
    navigate(
      kind + '.html' + url.search + '#' + prefixes[kind] + '/' + item.id,
      { state: { depth: 1 } },
    );
  }
  return (
    <Shell
      page={kind}
      directory={id ? null : directory}
      className={`library-page ${kind}-page`}
    >
      {id ? (
        entry ? (
          <MotionDetail
            key={entry.id}
            kind={kind}
            entry={entry}
            listHref={listHref}
          />
        ) : (
          <div className="empty-state">
            <h1>没有找到对应条目</h1>
            <a href={listHref}>返回{labels[kind]}</a>
          </div>
        )
      ) : (
        <>
          <LibraryHero kind={kind} />
          <div className="collection-toolbar">
            <div className="toolbar-search">
              <SearchField
                ref={search}
                label={'搜索' + labels[kind]}
                placeholder={
                  kind === 'cases'
                    ? '搜索案例、节奏、转场、HUD…'
                    : kind === 'materials'
                      ? '搜索素材、工作流、适用场景…'
                      : '搜索巧思、触发、转场、参数…'
                }
                value={state.query}
                onValueChange={(value) => update({ q: value }, true)}
              />
            </div>
            <div className="desktop-filters">{filterFields}</div>
            <div className="mobile-filter-trigger">
              <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <Filter size={16} />
                    筛选{count ? ' · ' + count : ''}
                  </Button>
                </DialogTrigger>
                <DialogContent title="筛选">
                  <div className="filter-dialog-fields">{filterFields}</div>
                  <div className="filter-dialog-actions">
                    <Button variant="ghost" onClick={clear}>
                      清除
                    </Button>
                    <Button onClick={() => setFiltersOpen(false)}>完成</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="sort-control">
              <Choice
                label="排序方式"
                options={[
                  { value: 'order', label: '按编号' },
                  { value: 'title', label: '按名称' },
                ]}
                value={state.sort}
                onValueChange={(value) =>
                  update({ sort: value === 'order' ? null : value }, true)
                }
              />
            </div>
            <IconAction
              label={state.dir === 'asc' ? '正序' : '反序'}
              aria-pressed={state.dir === 'desc'}
              onClick={() =>
                update({ dir: state.dir === 'asc' ? 'desc' : null }, true)
              }
            >
              {state.dir === 'asc' ? (
                <ArrowUp size={17} />
              ) : (
                <ArrowDown size={17} />
              )}
            </IconAction>
          </div>
          <div className="collection-caption">
            <span role="status">
              {state.fav ? '我的收藏' : '当前筛选'} / {results.length} 个条目
            </span>
            {hasFilters ? (
              <Button variant="ghost" size="sm" onClick={clear}>
                清除筛选
              </Button>
            ) : (
              <span>
                {kind === 'cases'
                  ? '每个案例都能拖动时间轴'
                  : kind === 'patterns'
                    ? '每个巧思都有独立 Demo'
                    : ''}
              </span>
            )}
          </div>
          {results.length > 0 ? (
            <div className="entry-grid">
              {results.map((item) => (
                <EntryCard
                  key={item.id}
                  kind={kind}
                  entry={item}
                  href={
                    kind +
                    '.html' +
                    url.search +
                    '#' +
                    prefixes[kind] +
                    '/' +
                    item.id
                  }
                  onOpen={(event) => open(event, item)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2>没有找到对应条目</h2>
              <p>
                {state.fav
                  ? '收藏里没有符合当前条件的条目。'
                  : '调整关键词或筛选条件后再试。'}
              </p>
              <Button onClick={clear}>
                {state.fav ? '查看全部' : '清除筛选'}
              </Button>
            </div>
          )}
        </>
      )}
    </Shell>
  );
}
