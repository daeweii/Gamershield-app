import { Link } from 'wouter';
import { CATEGORIES, READY_TOOLS, findTool, type Tool } from '@/lib/platform/registry';
import { useSentrix } from '@/hooks/use-sentrix';
import { EmptyState, PageHeader, ToolCard } from '@/components/sentrix/ToolCard';

export function DashboardPage() {
  const { favorites, recent } = useSentrix();
  const favoriteTools = favorites.map(findTool).filter((t): t is Tool => !!t && t.status === 'ready');
  const recentTools = recent.map(findTool).filter((t): t is Tool => !!t && t.status === 'ready');

  return (
    <>
      <PageHeader icon="dashboard" title="Dashboard" summary="Your favorite tools, what you used recently, and your progress. Saved only in this browser." />

      <div className="sx-stats" role="list" aria-label="Your stats">
        <div className="sx-stat" role="listitem"><b>{READY_TOOLS.length}</b><span>Tools ready to use</span></div>
        <div className="sx-stat" role="listitem"><b>{favoriteTools.length}</b><span>Favorites</span></div>
        <div className="sx-stat" role="listitem"><b>{recentTools.length}</b><span>Recently used</span></div>
        <div className="sx-stat" role="listitem"><b>{CATEGORIES.length}</b><span>Toolkit categories</span></div>
      </div>

      <section className="sx-section" aria-labelledby="dash-fav">
        <div className="sx-section-head"><h2 id="dash-fav">Favorites</h2></div>
        {favoriteTools.length
          ? <div className="sx-grid">{favoriteTools.map((tool) => <ToolCard key={tool.id} tool={tool} showCategory />)}</div>
          : <EmptyState title="No favorites yet">Tap the star on any tool card to pin it here and on the home page.</EmptyState>}
      </section>

      <section className="sx-section" aria-labelledby="dash-recent">
        <div className="sx-section-head"><h2 id="dash-recent">Recently used</h2></div>
        {recentTools.length
          ? <div className="sx-grid">{recentTools.map((tool) => <ToolCard key={tool.id} tool={tool} showCategory />)}</div>
          : <EmptyState title="Nothing here yet">Tools you open will show up here, newest first.</EmptyState>}
      </section>

      <section className="sx-section" aria-labelledby="dash-progress">
        <div className="sx-section-head"><h2 id="dash-progress">Learning progress</h2></div>
        <EmptyState title="Starts with the Learning Center (Phase 3)">
          Lessons, quizzes, labs, and achievements will track your progress here once they’re built.
          <Link href="/learning" className="sx-btn" style={{ marginTop: 6 }}>See what’s planned</Link>
        </EmptyState>
      </section>
    </>
  );
}
