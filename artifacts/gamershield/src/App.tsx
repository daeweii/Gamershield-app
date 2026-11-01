import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/sentrix/AppShell';
import { PageHeader } from '@/components/sentrix/ToolCard';
import { SECTIONS, findCategory, findTool } from '@/lib/platform/registry';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ToolPage, hasToolPage } from '@/pages/ToolPage';
import { PlannedSectionPage } from '@/pages/PlannedSectionPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AboutPage } from '@/pages/AboutPage';

const queryClient = new QueryClient();
const section = (id: string) => SECTIONS.find((s) => s.id === id)!;

function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" summary="That page doesn’t exist. It may have moved when GamerShield became Sentrix." />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link className="sx-btn sx-btn-primary" href="/">Go home</Link>
        <Link className="sx-btn" href="/dashboard">Open dashboard</Link>
      </div>
    </>
  );
}

function Routes() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/learning">{() => <PlannedSectionPage section={section('learning')} />}</Route>
      <Route path="/labs">{() => <PlannedSectionPage section={section('labs')} />}</Route>
      <Route path="/settings" component={SettingsPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/:category">
        {({ category }) => {
          const found = findCategory(category);
          return found ? <CategoryPage category={found} /> : <NotFound />;
        }}
      </Route>
      <Route path="/:category/:tool">
        {({ category, tool }) => {
          const found = findTool(tool);
          // Only real, ready tools in the matching category get a page.
          return found && found.category === category && found.status === 'ready' && hasToolPage(found.id)
            ? <ToolPage tool={found} />
            : <NotFound />;
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AppShell>
            {/* The shell stays outside the boundary so navigation survives a page crash. */}
            <RoutedErrorBoundary>
              <Routes />
            </RoutedErrorBoundary>
          </AppShell>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
