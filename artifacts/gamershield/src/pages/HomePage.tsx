import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Lightbulb, Search } from 'lucide-react';
import { CATEGORIES, READY_TOOLS, SECTIONS, findTool, toolHref, type Tool } from '@/lib/platform/registry';
import { tipForDate } from '@/lib/platform/tips';
import { useSentrix } from '@/hooks/use-sentrix';
import { Icon } from '@/components/sentrix/Icon';
import { SearchDialog } from '@/components/sentrix/SearchDialog';
import { ToolCard } from '@/components/sentrix/ToolCard';

// A short, mixed starter set keeps the home page uncluttered; categories and search reach the rest.
const FEATURED = ['strength-checker', 'password-generator', 'link-checker', 'hash-generator', 'dns-lookup', 'subnet-calculator'];

function ToolChip({ tool }: { tool: Tool }) {
  const href = toolHref(tool);
  const body = <><Icon name={tool.icon} size={16} />{tool.name}</>;
  return tool.standalonePath
    ? <a className="sx-chip-link" href={`${import.meta.env.BASE_URL}${href}`}>{body}</a>
    : <Link className="sx-chip-link" href={href}>{body}</Link>;
}

export function HomePage() {
  const { favorites, recent } = useSentrix();
  const [searchOpen, setSearchOpen] = useState(false);
  const tip = tipForDate(new Date());
  const favoriteTools = favorites.map(findTool).filter((t): t is Tool => !!t && t.status === 'ready');
  const recentTools = recent.map(findTool).filter((t): t is Tool => !!t && t.status === 'ready');
  const upcoming = SECTIONS.filter((s) => s.plannedPhase);

  return (
    <>
      <section className="sx-hero" aria-labelledby="home-title">
        <p className="sx-eyebrow">Your cybersecurity command center</p>
        <h1 id="home-title">Learn security. <em>Use it.</em> Stay protected.</h1>
        <p>
          Sentrix brings practical security tools, short lessons, and hands-on labs into one place.
          Everything runs in your browser, so what you type stays on your device.
        </p>
        <button type="button" className="sx-hero-search" onClick={() => setSearchOpen(true)} data-testid="button-hero-search">
          <Search size={19} aria-hidden="true" />
          <span>Search for a tool, like “password” or “phishing”</span>
          <kbd className="sx-kbd">Ctrl K</kbd>
        </button>
        <div className="sx-hero-actions">
          <Link className="sx-btn sx-btn-primary" href="/password-security/strength-checker">Check a password <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link className="sx-btn" href="/dashboard">Open your dashboard</Link>
        </div>
      </section>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {(favoriteTools.length > 0 || recentTools.length > 0) && (
        <div className="sx-grid-2 sx-section">
          {favoriteTools.length > 0 && (
            <section className="sx-card" aria-labelledby="fav-heading">
              <h2 id="fav-heading" style={{ fontSize: 17, marginBottom: 14 }}>Favorites</h2>
              <div className="sx-chip-row">{favoriteTools.map((tool) => <ToolChip key={tool.id} tool={tool} />)}</div>
            </section>
          )}
          {recentTools.length > 0 && (
            <section className="sx-card" aria-labelledby="recent-heading">
              <h2 id="recent-heading" style={{ fontSize: 17, marginBottom: 14 }}>Recently used</h2>
              <div className="sx-chip-row">{recentTools.map((tool) => <ToolChip key={tool.id} tool={tool} />)}</div>
            </section>
          )}
        </div>
      )}

      <section className="sx-section" aria-labelledby="quick-heading">
        <div className="sx-section-head">
          <h2 id="quick-heading">Quick access</h2>
          <p>{READY_TOOLS.length} tools in all. Star one to pin it to your favorites.</p>
        </div>
        <div className="sx-grid">{FEATURED.map(findTool).filter((t): t is Tool => !!t).map((tool) => <ToolCard key={tool.id} tool={tool} showCategory />)}</div>
      </section>

      <div className="sx-grid-2 sx-section">
        <section className="sx-card sx-tip" aria-labelledby="tip-heading">
          <p className="sx-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Lightbulb size={16} aria-hidden="true" /> Tip of the day
          </p>
          <h2 id="tip-heading" style={{ fontSize: 19 }}>{tip.title}</h2>
          <p>{tip.body}</p>
        </section>
        <section className="sx-card" aria-labelledby="browse-heading">
          <h2 id="browse-heading" style={{ fontSize: 17, marginBottom: 14 }}>Browse by category</h2>
          <div className="sx-chip-row">
            {CATEGORIES.map((c) => (
              <Link key={c.id} className="sx-chip-link" href={`/${c.id}`}><Icon name={c.icon} size={16} />{c.name}</Link>
            ))}
          </div>
        </section>
      </div>

      {upcoming.length > 0 && <section className="sx-section" aria-labelledby="next-heading">
        <div className="sx-section-head">
          <h2 id="next-heading">Coming next</h2>
          <p>Sentrix is built in phases. These sections aren’t ready yet.</p>
        </div>
        <div className="sx-grid">
          {upcoming.map((s) => (
            <Link key={s.id} href={s.path} className="sx-tool-card is-planned" style={{ textDecoration: 'none' }}>
              <span className="sx-tool-icon"><Icon name={s.icon} size={20} /></span>
              <h3>{s.name}</h3>
              <p>{s.summary}</p>
              <span className="sx-tool-meta"><span className="sx-badge">Planned · Phase {s.plannedPhase}</span></span>
            </Link>
          ))}
        </div>
      </section>}
    </>
  );
}
