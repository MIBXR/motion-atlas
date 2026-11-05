import { createContext, useContext, useEffect, useState } from 'react';
import { useToastStack } from '../components/ui';
import { project } from '../project';
import entryIDs from 'atlas:entry-ids';
const Preferences = createContext(null);
const kinds = ['cases', 'patterns', 'materials'];
const valid = Object.fromEntries(
  kinds.map((kind) => [kind, new Set(entryIDs[kind])]),
);
const emptyFavorites = () => ({ cases: [], patterns: [], materials: [] });
const clean = (values) =>
  Object.fromEntries(
    kinds.map((kind) => [
      kind,
      [...new Set((values[kind] || []).filter((id) => valid[kind].has(id)))],
    ]),
  );
function savedTheme() {
  try {
    const saved = localStorage.getItem(project.themeKey);
    const value =
      project.themeJSON && saved !== null ? JSON.parse(saved) : saved;
    return project.themeOrder.includes(value) ? value : 'system';
  } catch {
    return 'system';
  }
}
function savedFavorites() {
  try {
    const value = localStorage.getItem(project.favoriteKey);
    return {
      values:
        value === null
          ? emptyFavorites()
          : clean(project.readStoredFavorites(JSON.parse(value))),
      error: null,
    };
  } catch {
    return {
      values: emptyFavorites(),
      error: '无法读取本地收藏，可导入备份恢复。',
    };
  }
}
export function PreferencesProvider({ children }) {
  const { toast } = useToastStack();
  const [theme, setTheme] = useState(savedTheme);
  const [snapshot, setSnapshot] = useState(savedFavorites);
  const [systemDark, setSystemDark] = useState(
    () => matchMedia('(prefers-color-scheme:dark)').matches,
  );
  const favorites = snapshot.values;
  useEffect(() => {
    if (snapshot.error) toast({ title: snapshot.error, type: 'warning' });
  }, [snapshot.error, toast]);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme:dark)');
    const change = () => setSystemDark(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    const resolved =
      theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
    document.documentElement.dataset.atlasTheme = resolved;
    document.documentElement.dataset.atlasThemeChoice = theme;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }, [theme, systemDark]);
  useEffect(() => {
    const storage = (event) => {
      if (event.key === project.themeKey || event.key === null)
        setTheme(savedTheme());
      if (event.key === project.favoriteKey || event.key === null) {
        const next = savedFavorites();
        setSnapshot((previous) =>
          next.error
            ? {
                values: previous.values,
                error: '无法读取另一页面的收藏更新，当前收藏仍保留。',
              }
            : next,
        );
      }
    };
    window.addEventListener('storage', storage);
    return () => window.removeEventListener('storage', storage);
  }, []);
  function selectTheme(value) {
    setTheme(value);
    try {
      localStorage.setItem(
        project.themeKey,
        project.themeJSON ? JSON.stringify(value) : value,
      );
    } catch {
      toast({ title: '主题偏好未能保存，本次页面仍可使用。', type: 'warning' });
    }
  }
  function saveFavorites(values) {
    let error = null;
    try {
      localStorage.setItem(
        project.favoriteKey,
        JSON.stringify(project.favoriteStorage(values)),
      );
    } catch {
      error = '未能完整保存本地收藏，本次修改保留在当前页面。请导出备份。';
    }
    setSnapshot({ values, error });
  }
  function toggleFavorite(kind, id) {
    const ids = favorites[kind];
    saveFavorites({
      ...favorites,
      [kind]: ids.includes(id)
        ? ids.filter((value) => value !== id)
        : [...ids, id],
    });
  }
  function exportFavorites() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(project.favoriteBackup(favorites), null, 2)], {
        type: 'application/json',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = project.favoriteFilename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  }
  async function importFavorites(file) {
    const incoming = clean(
      project.readFavoriteBackup(JSON.parse(await file.text())),
    );
    saveFavorites(
      Object.fromEntries(
        kinds.map((kind) => [
          kind,
          [.../* @__PURE__ */ new Set([...favorites[kind], ...incoming[kind]])],
        ]),
      ),
    );
    toast({ title: '收藏已导入并合并', type: 'success' });
  }
  return (
    <Preferences.Provider
      value={{
        theme,
        selectTheme,
        favorites,
        toggleFavorite,
        exportFavorites,
        importFavorites,
      }}
    >
      {children}
    </Preferences.Provider>
  );
}
export function usePreferences() {
  return useContext(Preferences);
}
