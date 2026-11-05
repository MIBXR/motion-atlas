function favoriteValues(data) {
  for (const kind of ['cases', 'patterns', 'materials'])
    if (data[kind] !== undefined && !Array.isArray(data[kind]))
      throw new Error('请选择导出的收藏 JSON 文件。');
  return data;
}

export const project = {
  name: 'Motion Atlas',
  wordmark: 'MOTION ATLAS',
  tagline: '节拍 · 动势 · 审美',
  repository: 'MIBXR/motion-atlas',
  mark: 'M8 48a28 28 0 1 0 56 0a28 28 0 1 0-56 0Z M32 48a28 28 0 1 0 56 0a28 28 0 1 0-56 0Z',
  labName: '节奏实验室',
  themeKey: 'ma-theme',
  themeJSON: true,
  themeOrder: ['system', 'light', 'dark'],
  favoriteKey: 'ma-favorites',
  readStoredFavorites: favoriteValues,
  readFavoriteBackup: (data) => favoriteValues(data.favorites || data),
  favoriteStorage: (values) => values,
  favoriteBackup: (values) => ({
    app: 'motion-atlas',
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites: values,
  }),
  favoriteFilename: 'motion-atlas-favorites.json',
  assetAPI: 'MotionAtlasAssets',
  cacheAPI: 'AtlasAssetCache',
  footerDescription: '按时间线拆解影像与操作台。',
  methodologyDocument: 'docs/methodology.md',
  documentURL: (file, anchor = '') =>
    'docs.html#doc/' + file + (anchor ? '::' + encodeURIComponent(anchor) : ''),
  documentLocation: (url) => {
    if (!url.hash.startsWith('#doc/'))
      return {
        file: url.searchParams.get('file') || 'docs/guide.md',
        anchor: decodeURIComponent(url.hash.slice(1)),
      };
    const [file, anchor = ''] = decodeURIComponent(url.hash.slice(5)).split(
      '::',
    );
    return { file: file || 'docs/guide.md', anchor };
  },
  documentTocLevels: [2, 3],
};
