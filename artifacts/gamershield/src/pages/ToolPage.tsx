import { lazy, Suspense, useEffect, type ComponentType, type LazyExoticComponent } from 'react';
import { ShieldCheck } from 'lucide-react';
import { findCategory, type Tool } from '@/lib/platform/registry';
import { sentrix } from '@/hooks/use-sentrix';
import { FavoriteButton, PageHeader } from '@/components/sentrix/ToolCard';
import { Loading } from '@/components/sentrix/Loading';
import { TOOL_HELP } from '@/content/toolHelp';

// Each tool loads only when its page opens, which keeps the first page load small.
const TOOL_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  'strength-checker': lazy(() => import('@/components/tools/PasswordCheckTool').then((m) => ({ default: m.PasswordCheckTool }))),
  'two-factor-guides': lazy(() => import('@/components/tools/TwoFactorTool').then((m) => ({ default: m.TwoFactorTool }))),
  'link-checker': lazy(() => import('@/components/tools/LinkTool').then((m) => ({ default: m.LinkTool }))),
  'message-checker': lazy(() => import('@/components/tools/MessageTool').then((m) => ({ default: m.MessageTool }))),
  'account-checkup': lazy(() => import('@/components/tools/CheckupTool').then((m) => ({ default: m.CheckupTool }))),
};

export const hasToolPage = (id: string) => id in TOOL_COMPONENTS;

export function ToolPage({ tool }: { tool: Tool }) {
  const Component = TOOL_COMPONENTS[tool.id];
  const category = findCategory(tool.category)!;
  const help = TOOL_HELP[tool.id];

  // Remember the visit for "Recently used". Only the tool's ID is stored.
  useEffect(() => sentrix.recordVisit(tool.id), [tool.id]);

  return (
    <>
      <PageHeader
        icon={tool.icon}
        title={tool.name}
        summary={tool.summary}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: category.name, href: `/${category.id}` }]}
        actions={<FavoriteButton tool={tool} className="sx-icon-btn" />}
      />
      <div className="sx-grid-2" style={{ alignItems: 'start' }}>
        <Suspense fallback={<Loading label={`Loading ${tool.name}…`} />}>
          <Component />
        </Suspense>
        {help && (
          <aside className="sx-card sx-help" aria-labelledby="help-heading">
            <h2 id="help-heading">How it works</h2>
            {help.howItWorks.map((line) => <p key={line}>{line}</p>)}
            <h2>Privacy</h2>
            <p className="sx-muted" style={{ display: 'flex', gap: 8 }}>
              <ShieldCheck size={18} aria-hidden="true" style={{ flex: 'none', marginTop: 3, color: 'var(--sx-good)' }} />
              <span>{help.privacy}</span>
            </p>
          </aside>
        )}
      </div>
    </>
  );
}
