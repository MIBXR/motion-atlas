(() => {
  let choice = 'system';
  try {
    choice = JSON.parse(localStorage.getItem('ma-theme') || '"system"');
  } catch {
    choice = 'system';
  }
  if (!['system', 'light', 'dark'].includes(choice)) choice = 'system';
  const resolved =
    choice === 'system'
      ? matchMedia('(prefers-color-scheme:dark)').matches
        ? 'dark'
        : 'light'
      : choice;
  document.documentElement.dataset.atlasTheme = resolved;
  document.documentElement.dataset.atlasThemeChoice = choice;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
})();
