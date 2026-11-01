import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronsLeft, ChevronsRight, Menu, Moon, Search, ShieldCheck, Sun, X } from 'lucide-react';
import { SECTIONS, type Section } from '@/lib/platform/registry';
import { resolveTheme } from '@/lib/platform/storage';
import { sentrix, useSentrix } from '@/hooks/use-sentrix';
import { Icon } from './Icon';
import { SearchDialog } from './SearchDialog';

// Sidebar groups. Everything comes from the registry's SECTIONS list.
const GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Overview', ids: ['home', 'dashboard'] },
  { label: 'Toolkit', ids: ['password-security', 'cryptography', 'networking', 'security-awareness'] },
  { label: 'Learn', ids: ['learning', 'labs'] },
  { label: 'Sentrix', ids: ['settings', 'about'] },
];

function isActive(section: Section, location: string) {
  return section.path === '/' ? location === '/' : location === section.path || location.startsWith(`${section.path}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { sidebarCollapsed, theme } = useSentrix();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isDark = resolveTheme(theme, window.matchMedia('(prefers-color-scheme: dark)').matches) === 'dark';

  // Ctrl/Cmd+K or "/" opens search from anywhere (except while typing in a field).
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const typing = event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]');
      if ((event.key === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // New page: close the mobile drawer, scroll to top, and move focus to the page heading
  // so screen-reader users hear where they landed.
  const firstRender = useRef(true);
  useEffect(() => {
    setDrawerOpen(false);
    if (firstRender.current) { firstRender.current = false; return; }
    window.scrollTo({ top: 0 });
    const heading = mainRef.current?.querySelector<HTMLElement>('h1');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }, [location]);

  const byId = new Map(SECTIONS.map((s) => [s.id, s]));

  return (
    <div className="sx-app" data-collapsed={sidebarCollapsed} data-drawer={drawerOpen ? 'open' : 'closed'}>
      <a className="sx-skip" href="#sx-main">Skip to content</a>

      <aside className="sx-sidebar" aria-label="Sidebar" id="sx-sidebar">
        <Link href="/" className="sx-brand" aria-label="Sentrix home">
          <span className="sx-mark"><ShieldCheck size={21} strokeWidth={2.4} aria-hidden="true" /></span>
          <span className="sx-brand-name sx-hide-collapsed">Sentri<span>x</span></span>
        </Link>
        <nav aria-label="Main">
          {GROUPS.map((group) => (
            <div key={group.label}>
              <p className="sx-nav-group sx-hide-collapsed">{group.label}</p>
              <ul className="sx-nav">
                {group.ids.map((id) => {
                  const section = byId.get(id)!;
                  const active = isActive(section, location);
                  return (
                    <li key={id}>
                      <Link
                        href={section.path}
                        className="sx-nav-link"
                        aria-current={active ? 'page' : undefined}
                        title={sidebarCollapsed ? section.name : undefined}
                        data-testid={`nav-${id}`}
                      >
                        <Icon name={section.icon} size={19} />
                        <span className="sx-hide-collapsed">{section.name}</span>
                        {section.plannedPhase && <span className="sx-nav-soon sx-hide-collapsed">Soon</span>}
                        {sidebarCollapsed && <span className="sx-sr-only">{section.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="sx-sidebar-foot">
          <button
            type="button"
            className="sx-collapse-btn"
            onClick={() => sentrix.setSidebarCollapsed(!sidebarCollapsed)}
            aria-expanded={!sidebarCollapsed}
            aria-controls="sx-sidebar"
            data-testid="button-collapse-sidebar"
          >
            {sidebarCollapsed ? <ChevronsRight size={19} aria-hidden="true" /> : <ChevronsLeft size={19} aria-hidden="true" />}
            <span className="sx-hide-collapsed">Collapse sidebar</span>
            {sidebarCollapsed && <span className="sx-sr-only">Expand sidebar</span>}
          </button>
        </div>
      </aside>
      <div className="sx-overlay" onClick={() => setDrawerOpen(false)} aria-hidden="true" />

      <div className="sx-main-col">
        <header className="sx-topbar">
          <button
            ref={menuButtonRef}
            type="button"
            className="sx-icon-btn sx-menu-btn"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-expanded={drawerOpen}
            aria-controls="sx-sidebar"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            data-testid="button-menu"
          >
            {drawerOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          <button type="button" className="sx-search-btn" onClick={() => setSearchOpen(true)} data-testid="button-search">
            <Search size={17} aria-hidden="true" />
            <span>Search tools…</span>
            <kbd className="sx-kbd">Ctrl K</kbd>
          </button>
          <div className="sx-topbar-actions">
            <button
              type="button"
              className="sx-icon-btn"
              onClick={() => sentrix.setTheme(isDark ? 'light' : 'dark')}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
              data-testid="button-theme"
            >
              {isDark ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
            </button>
          </div>
        </header>

        <main id="sx-main" ref={mainRef} className="sx-main" tabIndex={-1}>
          <div className="sx-page" key={location}>{children}</div>
        </main>

        <footer className="sx-footer">
          <span><strong>Sentrix</strong> · Built by Sidney Nelms, Cybersecurity, South Carolina State University</span>
          <span>Privacy-first: what you type stays on your device.</span>
        </footer>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
