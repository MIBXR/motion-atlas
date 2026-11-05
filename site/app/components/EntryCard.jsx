import catalog from 'atlas:catalog';
import { FavoriteAction } from './actions';
import { energyPath } from '../domain/motion-data';
export function EnergyCurve({ entry }) {
  const path = energyPath(entry);
  return (
    path && (
      <svg
        className="energy-curve"
        viewBox="0 0 100 26"
        preserveAspectRatio="none"
        role="img"
        aria-label="能量曲线"
      >
        <path className="energy-fill" d={path + 'L100 26L0 26Z'} />
        <path
          className="energy-line"
          d={path}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  );
}
export function EntryCard({ kind, entry, href, onOpen, showIndex }) {
  const taxonomy = catalog.taxonomy;
  const tags =
    kind === 'materials'
      ? [taxonomy.materialTypes[entry.type]]
      : kind === 'cases'
        ? [
            taxonomy.styles[entry.style],
            ...entry.carriers.map((carrier) => taxonomy.carriers[carrier]),
          ]
        : [
            ...entry.types.map((type) => taxonomy.types[type]),
            ...entry.carriers.map((carrier) => taxonomy.carriers[carrier]),
          ];
  return (
    <article className="entry-card">
      <a
        className="entry-preview"
        href={href}
        onClick={onOpen}
        aria-label={'查看' + entry.title}
      >
        {entry.preview ? (
          <img
            src={entry.preview}
            alt={`${entry.title}${kind === 'materials' ? '' : ' Demo 实际截图'}`}
            loading="lazy"
          />
        ) : (
          <span className="preview-placeholder">预览图</span>
        )}
        {showIndex && (
          <span className="entry-index">
            {String(showIndex).padStart(2, '0')} /{' '}
            {taxonomy.carriers[entry.carriers[0]]}
          </span>
        )}
      </a>
      <div className="entry-card-body">
        <div className="entry-card-title">
          <h2>
            <a href={href} onClick={onOpen}>
              {entry.title}
            </a>
          </h2>
          <FavoriteAction kind={kind} entry={entry} />
        </div>
        <p className="entry-summary">{entry.summary}</p>
        {kind === 'cases' && !showIndex && <EnergyCurve entry={entry} />}
        <div className="entry-tags">
          {tags.map((tag, index) => (
            <span
              className={`entry-tag ${index === 0 ? 'accent-tag' : ''}`}
              key={tag + index}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
