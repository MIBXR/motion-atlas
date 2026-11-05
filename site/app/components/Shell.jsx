import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Database,
  ExternalLink,
  Menu,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerTrigger,
  SegmentedControl,
} from './ui';
import { IconAction } from './actions';
import { usePreferences } from '../state/preferences';
import { project } from '../project';
const navigation = [
  ['index', '首页'],
  ['cases', '案例库'],
  ['patterns', '巧思库'],
  ['materials', '素材库'],
  ['lab', project.labName],
  ['docs', '文档中心'],
  ['agent', 'Agent 工作流'],
];
const themeLabels = { system: '跟随系统', dark: '深色', light: '浅色' };
const themeIcons = { system: Monitor, dark: Moon, light: Sun };
function Brand() {
  return (
    <a
      className="site-brand"
      href="index.html"
      aria-label={project.name + ' 首页'}
    >
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <path fill="currentColor" fillRule="evenodd" d={project.mark} />
      </svg>
      <span>
        <strong>{project.wordmark}</strong>
        <small>{project.tagline}</small>
      </span>
    </a>
  );
}
function Navigation({ page, onNavigate }) {
  return (
    <nav className="site-navigation" aria-label="主导航">
      {navigation.map(([key, label]) => (
        <a
          key={key}
          href={`${key}.html`}
          aria-current={page === key ? 'page' : void 0}
          onClick={onNavigate}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
function AssetCache() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [working, setWorking] = useState(false);
  async function show() {
    setStatus(await window[project.cacheAPI].status());
  }
  async function clear() {
    setWorking(true);
    setStatus(await window[project.cacheAPI].clear());
    setWorking(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <IconAction
          label="管理已下载的素材"
          aria-haspopup="dialog"
          onClick={show}
        >
          <Database size={18} />
        </IconAction>
      </DialogTrigger>
      <DialogContent
        title="已下载的素材"
        description="已下载素材供再次访问时复用，清理不会删除收藏。"
      >
        {status ? (
          <p className="cache-status">
            {status.available
              ? `${status.files || 0} 个文件 · ${((status.bytes || 0) / 1024 / 1024).toFixed(1)} MB`
              : '当前浏览器暂不能保存素材。'}
          </p>
        ) : (
          <p className="cache-status">正在读取…</p>
        )}
        <Button
          variant="secondary"
          onClick={clear}
          disabled={!status?.available}
          loading={working}
        >
          清理已下载素材
        </Button>
      </DialogContent>
    </Dialog>
  );
}
export function Shell({
  page,
  directory,
  children,
  className = '',
  mainClassName = '',
  menuRequest = 0,
  onMenuOpen,
}) {
  const { theme, selectTheme } = usePreferences();
  const [compact, setCompact] = useState(
    () => matchMedia('(max-width:800px)').matches,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState('page');
  const [scrolled, setScrolled] = useState(false);
  const [hiddenHeader, setHiddenHeader] = useState(false);
  const previousY = useRef(0);
  const ThemeIcon = themeIcons[theme];
  const modes = project.themeOrder;
  const nextTheme = modes[(modes.indexOf(theme) + 1) % modes.length];
  useEffect(() => {
    const media = matchMedia('(max-width:800px)');
    const change = () => {
      setCompact(media.matches);
      setMenuOpen(false);
    };
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (menuRequest) {
      setMenuView('page');
      setMenuOpen(true);
    }
  }, [menuRequest]);
  useEffect(() => {
    const scroll = () => {
      const y = scrollY;
      setScrolled(y > innerHeight);
      setHiddenHeader(y > 180 && y > previousY.current + 3);
      previousY.current = y;
    };
    window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  return (
    <div
      className={`atlas-app ${className}`}
      data-page={page}
      style={{
        '--atlas-visible-header':
          hiddenHeader && !menuOpen ? '0px' : 'var(--atlas-header)',
      }}
    >
      <a className="skip-link" href="#main">
        跳到内容
      </a>
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <header className="site-header" data-hidden={hiddenHeader && !menuOpen}>
          <Brand />
          <div className="desktop-navigation">
            <Navigation page={page} />
          </div>
          <div className="header-actions">
            <div className="mobile-menu-button">
              <DrawerTrigger asChild>
                <Button
                  variant="secondary"
                  onClick={() => {
                    onMenuOpen?.();
                    setMenuView(directory ? 'page' : 'site');
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={menuOpen}
                >
                  <Menu size={17} />
                  <span>菜单</span>
                </Button>
              </DrawerTrigger>
            </div>
            <AssetCache />
            <IconAction
              label={`显示主题：${themeLabels[theme]}；点击切换为${themeLabels[nextTheme]}`}
              onClick={() => selectTheme(nextTheme)}
            >
              <ThemeIcon size={18} />
            </IconAction>
          </div>
        </header>
        <DrawerContent side="top" title="菜单" className="site-menu-drawer">
          {directory && (
            <SegmentedControl
              label="菜单范围"
              value={menuView}
              onValueChange={setMenuView}
              options={
                directory
                  ? [
                      { value: 'page', label: '本页目录' },
                      { value: 'site', label: '全站导航' },
                    ]
                  : [{ value: 'site', label: '全站导航' }]
              }
            />
          )}
          <div
            className="mobile-menu-content"
            onClick={(event) => {
              if (event.target.closest('a,[data-close-directory]'))
                setMenuOpen(false);
            }}
          >
            {menuView === 'page' && compact ? (
              directory
            ) : (
              <Navigation page={page} onNavigate={() => setMenuOpen(false)} />
            )}
          </div>
        </DrawerContent>
      </Drawer>
      <div className={`atlas-layout ${directory ? 'with-directory' : ''}`}>
        {directory && !compact && (
          <aside className="page-directory" aria-label="本页目录">
            {directory}
          </aside>
        )}
        <main id="main" className={mainClassName}>
          {children}
        </main>
      </div>
      <footer className="site-footer">
        <div>
          <Brand />
          <p>{project.footerDescription}</p>
          <small>MIBXR · {project.name}</small>
        </div>
        <div className="footer-links">
          <p>探索 Atlas</p>
          {navigation.map(([key, label]) => (
            <a key={key} href={`${key}.html`}>
              {label}
            </a>
          ))}
        </div>
        <div className="footer-links">
          <p>项目资料</p>
          <a href={project.documentURL('docs/guide.md')}>使用与维护</a>
          <a href={project.documentURL(project.methodologyDocument)}>
            调研方法
          </a>
          <a
            href={'https://github.com/' + project.repository}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={14} />
            项目 GitHub
          </a>
        </div>
      </footer>
      {scrolled && (
        <IconAction
          label="回到顶部"
          className="back-to-top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: matchMedia('(prefers-reduced-motion:reduce)').matches
                ? 'instant'
                : 'smooth',
            })
          }
        >
          <ArrowUp size={18} />
        </IconAction>
      )}
    </div>
  );
}
