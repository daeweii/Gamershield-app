import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { Star } from 'lucide-react';
import { findCategory, toolHref, type IconName, type Tool } from '@/lib/platform/registry';
import { sentrix, useSentrix } from '@/hooks/use-sentrix';
import { toast } from '@/hooks/use-toast';
import { Icon } from './Icon';

export function FavoriteButton({ tool, className = 'sx-fav-btn' }: { tool: Tool; className?: string }) {
  const { favorites } = useSentrix();
  const on = favorites.includes(tool.id);
  return (
    <button
      type="button"
      className={className}
      aria-pressed={on}
      aria-label={on ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
      title={on ? 'Remove from favorites' : 'Add to favorites'}
      onClick={() => {
        sentrix.toggleFavorite(tool.id);
        toast({ title: on ? 'Removed from favorites' : 'Added to favorites', description: tool.name });
      }}
      data-testid={`button-favorite-${tool.id}`}
    >
      <Star size={18} aria-hidden="true" />
    </button>
  );
}

/** A clickable tool card. Planned tools render as a plain, clearly labeled card with no link. */
export function ToolCard({ tool, showCategory = false }: { tool: Tool; showCategory?: boolean }) {
  const category = findCategory(tool.category);
  const body = (
    <>
      <span className="sx-tool-icon"><Icon name={tool.icon} size={20} /></span>
      <h3>{tool.name}</h3>
      <p>{tool.summary}</p>
      <span className="sx-tool-meta">
        {tool.status === 'planned' && <span className="sx-badge">Planned · Phase {tool.plannedPhase}</span>}
        {showCategory && category && <span className="sx-badge">{category.name}</span>}
        {tool.standalonePath && <span className="sx-badge sx-badge-good">Works offline</span>}
      </span>
    </>
  );

  if (tool.status === 'planned') {
    return <div className="sx-tool-card is-planned" data-testid={`card-${tool.id}`}>{body}</div>;
  }
  const href = toolHref(tool);
  return (
    <div className="sx-tool-card-wrap">
      {tool.standalonePath
        ? <a className="sx-tool-card" href={`${import.meta.env.BASE_URL}${href}`} data-testid={`card-${tool.id}`}>{body}</a>
        : <Link className="sx-tool-card" href={href} data-testid={`card-${tool.id}`}>{body}</Link>}
      <FavoriteButton tool={tool} />
    </div>
  );
}

export function PageHeader({ icon, title, summary, eyebrow, actions, breadcrumb }: {
  icon?: IconName; title: string; summary?: string; eyebrow?: string; actions?: ReactNode;
  breadcrumb?: { label: string; href: string }[];
}) {
  return (
    <>
      {breadcrumb && (
        <nav aria-label="Breadcrumb">
          <ol className="sx-breadcrumb">
            {breadcrumb.map((crumb) => (
              <li key={crumb.href}><Link href={crumb.href}>{crumb.label}</Link> <span aria-hidden="true">/</span></li>
            ))}
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
      )}
      <div className="sx-page-head">
        {icon && <span className="sx-page-icon"><Icon name={icon} size={26} /></span>}
        <div className="sx-page-titles">
          {eyebrow && <p className="sx-eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {summary && <p>{summary}</p>}
        </div>
        {actions}
      </div>
    </>
  );
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="sx-empty"><strong>{title}</strong>{children}</div>;
}
