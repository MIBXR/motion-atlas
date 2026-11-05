import { useSyncExternalStore } from 'react';

function subscribe(listener) {
  window.addEventListener('popstate', listener);
  window.addEventListener('hashchange', listener);
  window.addEventListener('atlas:navigate', listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener('hashchange', listener);
    window.removeEventListener('atlas:navigate', listener);
  };
}

export function navigate(url, { replace = false, state = null } = {}) {
  const next = new URL(url, location.href);
  history[replace ? 'replaceState' : 'pushState'](state, '', next);
  window.dispatchEvent(new Event('atlas:navigate'));
}

export function useLocation() {
  return new URL(useSyncExternalStore(subscribe, () => location.href));
}
