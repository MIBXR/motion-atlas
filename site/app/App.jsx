import { lazy, Suspense } from 'react';
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const pages = {
  index: lazy(() => import('./pages/HomePage')),
  lab: lazy(() => import('./pages/LabPage')),
  docs: lazy(() => import('./pages/DocsPage')),
  agent: lazy(() => import('./pages/AgentPage')),
};
export function App() {
  const page =
    location.pathname
      .split('/')
      .filter(Boolean)
      .pop()
      ?.replace(/\.html$/, '') || 'index';
  const collection = ['cases', 'patterns', 'materials'].includes(page);
  const Page = pages[page] || pages.index;
  return (
    <Suspense
      fallback={
        <p className="app-loading" role="status">
          正在载入…
        </p>
      }
    >
      {collection ? <CatalogPage kind={page} /> : <Page />}
    </Suspense>
  );
}
