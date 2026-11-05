import { marked, Renderer } from '../../vendor/marked.umd.js';
import DOMPurify from '../../vendor/purify.min.js';
import { documentContent } from './document-title.mjs';
import { project } from '../project';
import documentData from 'atlas:documents';

function localPath(url) {
  const base = new URL('.', document.baseURI);
  return url.origin === base.origin && url.pathname.startsWith(base.pathname)
    ? decodeURIComponent(url.pathname.slice(base.pathname.length))
    : null;
}

function upstreamDocument(base) {
  const entry = documentData.links.entries.find(
    (item) =>
      base.startsWith(item.root) ||
      base === `prompts/${item.kind}/${item.id}.md`,
  );
  if (!entry) return null;
  let pin = entry.upstream;
  let sourceDirectory = '';
  if (!pin) {
    for (const source of [
      ...(entry.sources || []),
      ...(entry.attribution || []).filter(
        (item) => item.scope === '作品' || item.scope === '原作',
      ),
    ]) {
      const text = [source.url, source.notes].filter(Boolean).join('\n');
      const repository =
        source.repository ||
        text.match(/https:\/\/github\.com\/([\w.-]+\/[\w.-]+)/)?.[1];
      const commit =
        source.commit ||
        text.match(
          /github\.com\/[^/]+\/[^/]+\/(?:tree|blob)\/([a-f\d]{7,40})/i,
        )?.[1] ||
        text.match(/(?:固定提交|上游提交)[^`]*`([a-f\d]{7,40})`/i)?.[1];
      if (!repository || !commit) continue;
      pin = { repository, commit };
      sourceDirectory =
        text.match(/(?:原目录为|源码目录[：:])\s*`([^`]+)`/)?.[1] || '';
      break;
    }
  }
  if (!pin?.repository || !pin.commit) return null;
  if (base.startsWith('prompts/')) {
    const original = entry.promptSource && upstreamDocument(entry.promptSource);
    return original ? { ...pin, path: original.path } : null;
  }
  if (entry.kind === 'materials') {
    const prefix = pin.url.match(/\/(?:tree|blob)\/[^/]+\/?(.*)$/)[1];
    return {
      ...pin,
      path: (prefix ? prefix + '/' : '') + base.slice(entry.root.length),
    };
  }
  const repositoryRoot =
    entry.root + 'source/' + pin.repository.split('/')[1] + '/';
  if (base.toLowerCase().startsWith(repositoryRoot.toLowerCase()))
    return { ...pin, path: base.slice(repositoryRoot.length) };
  if (sourceDirectory)
    return {
      ...pin,
      path:
        sourceDirectory +
        base.slice(entry.root.length).replace(/^source\//, ''),
    };
  return null;
}

const knownDocuments = new Set(documentData.documents.map((item) => item.path));
const localFiles = new Set(documentData.links.files);

export function prepareMarkdown(text, file, signal) {
  const { title, body } = documentContent(text, file);
  const codeBlocks = [];
  const renderer = new Renderer();
  const headingIDs = new Set();
  renderer.heading = function ({ text, depth, tokens }) {
    let id =
      text
        .toLowerCase()
        .replace(/<[^>]+>|[`*_[\]()]/g, '')
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .trim()
        .replace(/\s/g, '-') || `h-${headingIDs.size}`;
    while (headingIDs.has(id)) id += '-1';
    headingIDs.add(id);
    return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>`;
  };
  renderer.code = ({ text, lang }) => {
    const index =
      codeBlocks.push({
        code: text,
        language: lang?.split(/\s+/)[0] || 'text',
      }) - 1;
    return `<div data-arc-code="${index}"></div>`;
  };
  const fragment = DOMPurify.sanitize(
    marked.parse(body, { gfm: true, async: false, renderer }),
    {
      USE_PROFILES: { html: true },
      RETURN_DOM_FRAGMENT: true,
      FORBID_TAGS: ['style', 'iframe', 'form'],
      FORBID_ATTR: ['style'],
    },
  );
  const reserved = new Set(['app', 'main']);
  for (const heading of fragment.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
    const base =
      heading.id ||
      heading.textContent
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}_\s-]/gu, '')
        .replace(/[\s-]+/g, '-') ||
      'section';
    let id = base;
    let suffix = 2;
    while (reserved.has(id)) id = base + '-' + suffix++;
    reserved.add(id);
    heading.id = id;
  }
  const firstHeading = fragment.querySelector('h1');
  const titleAnchor = firstHeading?.id || 'document-title';
  const headings = [
    { id: titleAnchor, title, level: 1 },
    ...[...fragment.querySelectorAll('h1,h2,h3')]
      .filter((heading) => heading !== firstHeading)
      .map((heading) => ({
        id: heading.id,
        title: heading.textContent,
        level: Number(heading.tagName.slice(1)),
      })),
  ].filter((heading) => project.documentTocLevels.includes(heading.level));
  firstHeading?.remove();
  const sourceURL = new URL(file, document.baseURI);
  fragment.querySelectorAll('a[href],img[src]').forEach((node) => {
    const image = node.tagName === 'IMG';
    const reference = node.getAttribute(image ? 'src' : 'href');
    const url = new URL(reference, sourceURL);
    const path = localPath(url);
    if (!image && knownDocuments.has(path)) {
      node.href = project.documentURL(
        path,
        decodeURIComponent(url.hash.slice(1)),
      );
      return;
    }
    if (
      !image &&
      path?.startsWith('demos/') &&
      /^demos\/(?:cases|materials)\/[A-Za-z0-9_-]+\/?$/.test(path)
    )
      url.pathname = url.pathname.replace(/\/?$/, '/index.html');
    const asset = window[project.assetAPI].resolve(url.href);
    let upstream;
    if (
      !image &&
      path !== null &&
      asset === url.href &&
      !localFiles.has(path)
    ) {
      const original = upstreamDocument(file);
      if (!original) {
        node.replaceWith(document.createTextNode(node.textContent));
        return;
      }
      const target = new URL(reference, `https://atlas.local/${original.path}`);
      upstream = `https://github.com/${original.repository}/${target.pathname.endsWith('/') ? 'tree' : 'blob'}/${original.commit}${target.pathname}${target.search}${target.hash}`;
    }
    if (image) {
      node.src = upstream || asset;
      node.loading = 'lazy';
      node.decoding = 'async';
    } else {
      node.href = upstream || asset;
      if (new URL(node.href, document.baseURI).origin !== location.origin) {
        node.target = '_blank';
        node.rel = 'noreferrer';
      }
    }
  });
  for (const table of fragment.querySelectorAll('table')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'markdown-table-scroll';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', '表格');
    table.replaceWith(wrapper);
    wrapper.append(table);
  }
  signal.throwIfAborted();
  const container = document.createElement('div');
  container.append(fragment);
  return {
    title,
    titleAnchor,
    headings,
    codeBlocks,
    html: container.innerHTML,
  };
}
