import { Link } from 'wouter';
import { READY_TOOLS, findTool, type Tool } from '@/lib/platform/registry';
import { useSentrix } from '@/hooks/use-sentrix';
import { useLearning } from '@/hooks/use-learning';
import { useCompletedLabs } from '@/hooks/use-labs';
import { READY_LAB_IDS } from '@/content/labs';
import { LESSONS } from '@/content/lessons';
import { pathPercent } from '@/lib/learning/progress';
import { EmptyState, PageHeader, ToolCard } from '@/components/sentrix/ToolCard';

export function DashboardPage() {
  const { favorites, recent } = useSentrix();
  const learning = useLearning();
  const labsDone = useCompletedLabs().length;
  const learnedPercent = pathPercent(learning, LESSONS.map((l) => l.id));
  const nextLesson = LESSONS.find((l) => !learning.completed.includes(l.id));
  const favoriteTools = favorites.map(findTool).filter((t): t is Tool => !!t && t.status === 'ready');
  const recentTools = recent.map(findTool).filter((t): t is Tool => !!t && t.status === 'ready');

  return (
    <>
      <PageHeader icon="dashboard" title="Dashboard" summary="Your favorite tools, what you used recently, and your progress. Saved only in this browser." />

      <div className="sx-stats" role="list" aria-label="Your stats">
        <div className="sx-stat" role="listitem"><b>{READY_TOOLS.length}</b><span>Tools ready to use</span></div>
        <div className="sx-stat" role="listitem"><b>{favoriteTools.length}</b><span>Favorites</span></div>
        <div className="sx-stat" role="listitem"><b>{recentTools.length}</b><span>Recently used</span></div>
        <div className="sx-stat" role="listitem"><b>{learning.completed.length}/{LESSONS.length}</b><span>Lessons completed</span></div>
        <div className="sx-stat" role="listitem"><b>{labsDone}/{READY_LAB_IDS.size}</b><span>Labs completed</span></div>
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
        <div className="sx-card">
          <p className="gs-input-label" id="dash-learn-label" style={{ marginTop: 0 }}>{learning.completed.length} of {LESSONS.length} lessons completed ({learnedPercent}%)</p>
          <div className="gs-progress" role="progressbar" aria-labelledby="dash-learn-label" aria-valuemin={0} aria-valuemax={100} aria-valuenow={learnedPercent}>
            <span style={{ width: `${learnedPercent}%` }} />
          </div>
          {nextLesson
            ? <Link href={`/learning/${nextLesson.id}`} className="sx-btn sx-btn-primary" style={{ marginTop: 16 }} data-testid="link-next-lesson">{learning.completed.length ? 'Continue' : 'Start'}: {nextLesson.title}</Link>
            : <p style={{ marginTop: 12 }}>You’ve finished the Beginner path. More paths are coming.</p>}
        </div>
      </section>
    </>
  );
}
