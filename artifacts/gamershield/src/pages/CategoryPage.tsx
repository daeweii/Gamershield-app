import { toolsIn, type Category } from '@/lib/platform/registry';
import { PageHeader, ToolCard } from '@/components/sentrix/ToolCard';

/** A category's tools. Working tools come first; planned ones are labeled with their phase. */
export function CategoryPage({ category }: { category: Category }) {
  const tools = toolsIn(category.id);
  const ready = tools.filter((t) => t.status === 'ready');
  const planned = tools.filter((t) => t.status === 'planned');

  return (
    <>
      <PageHeader icon={category.icon} title={category.name} summary={category.summary} eyebrow="Toolkit" breadcrumb={[{ label: 'Home', href: '/' }]} />
      {ready.length > 0 && (
        <section className="sx-section" aria-labelledby="ready-heading" style={{ marginTop: 0 }}>
          <div className="sx-section-head"><h2 id="ready-heading">Tools</h2><p>{ready.length} ready to use</p></div>
          <div className="sx-grid">{ready.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
        </section>
      )}
      {planned.length > 0 && (
        <section className="sx-section" aria-labelledby="planned-heading">
          <div className="sx-section-head">
            <h2 id="planned-heading">On the roadmap</h2>
            <p>Not built yet. These are shown so you know what’s coming.</p>
          </div>
          <div className="sx-grid">{planned.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
        </section>
      )}
    </>
  );
}
