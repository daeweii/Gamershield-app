import type { ComponentType } from 'react';
import { Link } from 'wouter';
import { CheckCircle2, Clock } from 'lucide-react';
import { LABS, type Lab } from '@/content/labs';
import { useCompletedLabs } from '@/hooks/use-labs';
import { PageHeader } from '@/components/sentrix/ToolCard';
import { PhishingLab } from '@/components/labs/PhishingLab';
import { LogLab } from '@/components/labs/LogLab';
import { TerminalLab } from '@/components/labs/TerminalLab';

const LAB_COMPONENTS: Record<string, ComponentType> = {
  'phishing-simulation': PhishingLab,
  'log-analysis': LogLab,
  'terminal': TerminalLab,
};

export const hasLabPage = (id: string) => id in LAB_COMPONENTS;

export function LabsPage() {
  const completed = useCompletedLabs();
  const ready = LABS.filter((l) => l.status === 'ready');
  const planned = LABS.filter((l) => l.status === 'planned');
  return (
    <>
      <PageHeader icon="flask" title="Cyber Labs" eyebrow="Learn"
        summary="Hands-on practice in safe simulations. Every lab uses fictional data, and nothing touches your real computer or network."
        breadcrumb={[{ label: 'Home', href: '/' }]} />
      <section aria-labelledby="labs-ready">
        <div className="sx-section-head"><h2 id="labs-ready">Labs</h2><p>{completed.length} of {ready.length} completed</p></div>
        <div className="sx-grid">
          {ready.map((lab) => (
            <Link key={lab.id} href={`/labs/${lab.id}`} className="sx-tool-card" data-testid={`lab-${lab.id}`}>
              <span className="sx-tool-icon"><Clock size={20} aria-hidden="true" /></span>
              <h3>{lab.title}</h3>
              <p>{lab.summary}</p>
              <span className="sx-tool-meta">
                <span className="sx-badge">{lab.minutes} min</span>
                {completed.includes(lab.id) && <span className="sx-badge sx-badge-good"><CheckCircle2 size={12} aria-hidden="true" />Completed</span>}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="sx-section" aria-labelledby="labs-planned">
        <div className="sx-section-head"><h2 id="labs-planned">On the roadmap</h2><p>Not built yet.</p></div>
        <div className="sx-grid">
          {planned.map((lab) => (
            <div key={lab.id} className="sx-tool-card is-planned">
              <h3>{lab.title}</h3><p>{lab.summary}</p>
              <span className="sx-tool-meta"><span className="sx-badge">Planned</span></span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function LabPage({ lab }: { lab: Lab }) {
  const Component = LAB_COMPONENTS[lab.id];
  const completed = useCompletedLabs().includes(lab.id);
  return (
    <>
      <PageHeader icon="flask" title={lab.title} summary={lab.summary} eyebrow={`Cyber Lab · ${lab.minutes} min${completed ? ' · Completed' : ''}`}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Cyber Labs', href: '/labs' }]} />
      <Component />
    </>
  );
}
