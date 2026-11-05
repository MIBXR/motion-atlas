import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, List } from 'lucide-react';
import documentData from 'atlas:documents';
import {
  Accordion,
  CodeBlock,
  Drawer,
  DrawerContent,
  DrawerTrigger,
  SearchField,
} from '../components/ui';
import { ActionLink, IconAction } from '../components/actions';
import { Shell } from '../components/Shell';
import { navigate, useLocation } from '../state/location';
import { prepareMarkdown } from '../domain/markdown';
import { project } from '../project';
import '../styles/documents.css';
function DocumentDirectory({
  documents,
  file,
  query,
  setQuery,
  openGroups,
  setOpenGroups,
  searchRef,
}) {
  const groups = [...new Set(documents.map((item) => item.group))];
  const terms = query.toLowerCase().trim();
  const matches = documents.filter((item) =>
    (item.title + ' ' + item.path).toLowerCase().includes(terms),
  );
  return (
    <div className="document-directory">
      <div className="document-directory-search">
        <SearchField
          ref={searchRef}
          label="搜索文档标题"
          placeholder="搜索文档标题…"
          value={query}
          onValueChange={setQuery}
        />
      </div>
      {groups.map((group) => {
        const items = matches.filter((item) => item.group === group);
        const open = openGroups.has(group);
        return (
          items.length > 0 && (
            <section className="document-directory-group" key={group}>
              <Accordion
                open={open ? 0 : null}
                onOpenChange={(value) =>
                  setOpenGroups((previous) => {
                    const next = new Set(previous);
                    value === null ? next.delete(group) : next.add(group);
                    return next;
                  })
                }
                items={[
                  {
                    title: group,
                    content: (
                      <nav aria-label={group}>
                        {items.map((item) => (
                          <a
                            key={item.path}
                            href={project.documentURL(item.path)}
                            aria-current={item.path === file ? 'page' : void 0}
                            data-close-directory
                            onClick={(event) => {
                              if (
                                event.metaKey ||
                                event.ctrlKey ||
                                event.shiftKey
                              )
                                return;
                              event.preventDefault();
                              navigate(event.currentTarget.href);
                            }}
                          >
                            {item.title}
                          </a>
                        ))}
                      </nav>
                    ),
                  },
                ]}
              />
            </section>
          )
        );
      })}
      {matches.length === 0 && (
        <p className="support-text">没有匹配的文档标题。</p>
      )}
    </div>
  );
}
export default function DocsPage() {
  const url = useLocation();
  const { file, anchor } = project.documentLocation(url);
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState(
    () =>
      /* @__PURE__ */ new Set([
        documentData.documents.find((item) => item.path === file)?.group,
      ]),
  );
  const [documentState, setDocumentState] = useState({ loading: true });
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [menuRequest, setMenuRequest] = useState(0);
  const [activeHeading, setActiveHeading] = useState(null);
  const [codeTargets, setCodeTargets] = useState([]);
  const contentRef = useRef(null);
  const searchRef = useRef(null);
  const previousGroup = useRef(
    documentData.documents.find((item) => item.path === file)?.group,
  );
  const savedGroups = useRef(null);
  function updateQuery(value) {
    if (value && !query) savedGroups.current = openGroups;
    if (value)
      setOpenGroups(
        new Set(
          documentData.documents
            .filter(
              (item) =>
                !item.hidden &&
                (item.title + ' ' + item.path)
                  .toLowerCase()
                  .includes(value.toLowerCase()),
            )
            .map((item) => item.group),
        ),
      );
    else if (savedGroups.current) {
      setOpenGroups(savedGroups.current);
      savedGroups.current = null;
    }
    setQuery(value);
  }
  useEffect(() => {
    const request = new AbortController();
    setDocumentState({ loading: true });
    const group = documentData.documents.find(
      (item) => item.path === file,
    )?.group;
    if (group !== previousGroup.current) {
      setOpenGroups(
        (previous) => /* @__PURE__ */ new Set([...previous, group]),
      );
      savedGroups.current?.add(group);
      previousGroup.current = group;
    }
    async function read() {
      try {
        const target = new URL(file, document.baseURI);
        if (
          target.origin !== location.origin ||
          !target.pathname.endsWith('.md')
        )
          throw new Error('请选择本站已公开的 Markdown 文档。');
        let text = documentData.documents.find(
          (item) => item.path === file,
        )?.content;
        if (text === void 0) {
          const response = await fetch(target, { signal: request.signal });
          if (!response.ok)
            throw new Error(`文档读取失败（${response.status}）。`);
          text = new TextDecoder('utf-8', { fatal: true }).decode(
            await response.arrayBuffer(),
          );
        }
        const rendered = prepareMarkdown(text, file, request.signal);
        setDocumentState({ ...rendered, loading: false });
        document.title = `${rendered.title} · ${project.name}`;
      } catch (error) {
        if (!request.signal.aborted)
          setDocumentState({ loading: false, error: error.message });
      }
    }
    read();
    return () => request.abort();
  }, [file]);
  useLayoutEffect(() => {
    setCodeTargets(
      contentRef.current
        ? [...contentRef.current.querySelectorAll('[data-arc-code]')]
        : [],
    );
  }, [documentState.html]);
  useEffect(() => {
    if (!documentState.headings) return;
    let frame;
    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const current =
          documentState.headings.findLast(
            (heading) =>
              document.getElementById(heading.id)?.getBoundingClientRect()
                .top <= 110,
          ) || documentState.headings[0];
        if (!current) return;
        setActiveHeading(current.id);
      });
    };
    window.addEventListener('scroll', scroll, { passive: true });
    scroll();
    return () => {
      window.removeEventListener('scroll', scroll);
      cancelAnimationFrame(frame);
    };
  }, [documentState.headings]);
  useEffect(() => {
    if (documentState.loading) return;
    requestAnimationFrame(() => {
      const target = anchor
        ? document.getElementById(anchor)
        : document.getElementById('main');
      target?.scrollIntoView({ block: 'start' });
    });
  }, [file, anchor, documentState.loading]);
  useEffect(() => {
    const keyboard = (event) => {
      if (
        event.key !== '/' ||
        event.target.closest('input,textarea,select,[contenteditable]')
      )
        return;
      event.preventDefault();
      setOutlineOpen(false);
      if (matchMedia('(max-width:800px)').matches)
        setMenuRequest((previous) => previous + 1);
      requestAnimationFrame(() => searchRef.current?.focus());
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);
  useEffect(() => {
    const media = matchMedia('(max-width:800px)');
    const close = () => {
      if (!media.matches) setOutlineOpen(false);
    };
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  function internalLink(event) {
    if (
      event.defaultPrevented ||
      event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = event.target.closest('a[href]');
    if (!link || link.target || link.download) return;
    const next = new URL(link.href, document.baseURI);
    if (
      next.origin === location.origin &&
      next.pathname.endsWith('/docs.html')
    ) {
      event.preventDefault();
      navigate(next);
    }
  }
  const directory = (
    <DocumentDirectory
      documents={documentData.documents.filter((item) => !item.hidden)}
      file={file}
      query={query}
      setQuery={updateQuery}
      openGroups={openGroups}
      setOpenGroups={setOpenGroups}
      searchRef={searchRef}
    />
  );
  const outline = (
    <nav className="document-outline-links" aria-label="本文目录">
      {documentState.headings?.map((heading) => (
        <a
          key={heading.id}
          href={project.documentURL(file, heading.id)}
          aria-current={activeHeading === heading.id ? 'location' : void 0}
          className={`outline-level-${heading.level}`}
          onClick={(event) => {
            event.preventDefault();
            navigate(project.documentURL(file, heading.id));
            setOutlineOpen(false);
          }}
        >
          {heading.title}
        </a>
      ))}
    </nav>
  );
  return (
    <Shell
      page="docs"
      directory={directory}
      className="documents-page"
      menuRequest={menuRequest}
      onMenuOpen={() => setOutlineOpen(false)}
    >
      <div className="document-layout">
        <article className="document-article">
          <header className="document-header">
            <p className="eyebrow">
              {documentData.documents.find((item) => item.path === file)
                ?.group || '条目资料'}{' '}
              / {file}
            </p>
            <h1 id={documentState.titleAnchor}>
              {documentState.title || '文档中心'}
            </h1>
            {!documentState.loading && !documentState.error && (
              <ActionLink href={file} download={file.split('/').pop()}>
                <Download size={15} />
                下载原文
              </ActionLink>
            )}
          </header>
          {documentState.loading ? (
            <p role="status">正在读取文档…</p>
          ) : documentState.error ? (
            <p role="alert">{documentState.error}</p>
          ) : (
            <>
              <div
                ref={contentRef}
                className="markdown-content"
                onClick={internalLink}
                dangerouslySetInnerHTML={{ __html: documentState.html }}
              />
              {codeTargets.map((target, index) =>
                createPortal(
                  <CodeBlock
                    {...documentState.codeBlocks[
                      Number(target.dataset.arcCode)
                    ]}
                  />,
                  target,
                  String(index),
                ),
              )}
            </>
          )}
        </article>
        <aside className="document-outline">
          <p>本文目录</p>
          {outline}
        </aside>
      </div>
      {documentState.headings?.length > 0 && (
        <Drawer open={outlineOpen} onOpenChange={setOutlineOpen}>
          <div className="mobile-outline-toggle">
            <DrawerTrigger asChild>
              <IconAction label="打开本文目录">
                <List size={19} />
              </IconAction>
            </DrawerTrigger>
          </div>
          <DrawerContent title="本文目录" side="right">
            {outline}
          </DrawerContent>
        </Drawer>
      )}
    </Shell>
  );
}
