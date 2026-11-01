import { CircleDashed } from 'lucide-react';
import type { Section } from '@/lib/platform/registry';
import { PageHeader } from '@/components/sentrix/ToolCard';

// What each upcoming section will contain, from the project roadmap.
const PLANS: Record<string, { intro: string; items: string[] }> = {
  learning: {
    intro: 'Short lessons with quizzes, flashcards, and knowledge checks, in Beginner, Intermediate, and Advanced paths. Progress will be saved on your device.',
    items: [
      'Introduction to Cybersecurity', 'Networking Fundamentals', 'Password and Authentication Security',
      'Cryptography Fundamentals', 'Operating System Security', 'Threat Identification',
      'Phishing and Social Engineering Awareness', 'Incident Response Fundamentals', 'Security Principles',
      'Security+ Preparation (original material organized by exam objectives)',
    ],
  },
  labs: {
    intro: 'Hands-on practice in safe simulations. Every lab uses fictional, built-in data, and nothing touches your real system.',
    items: [
      'Password Security Lab', 'Log Analysis Lab', 'Phishing Simulation Lab', 'Cryptography Lab',
      'Network Fundamentals Lab', 'Incident Response Lab', 'Interactive Terminal Simulator (predefined safe commands only)',
    ],
  },
};

/** An honest page for a section that isn't built yet: what's coming, and when. Nothing pretends to work. */
export function PlannedSectionPage({ section }: { section: Section }) {
  const plan = PLANS[section.id];
  return (
    <>
      <PageHeader icon={section.icon} title={section.name} summary={section.summary} eyebrow={`Coming in Phase ${section.plannedPhase}`} breadcrumb={[{ label: 'Home', href: '/' }]} />
      <div className="sx-card" style={{ maxWidth: 780 }}>
        <span className="sx-badge sx-badge-red">Planned · Phase {section.plannedPhase}</span>
        <p className="sx-prose" style={{ margin: '14px 0 18px' }}>{plan?.intro}</p>
        <h2 style={{ fontSize: 17, marginBottom: 12 }}>What’s planned</h2>
        <ul className="sx-list">
          {plan?.items.map((item) => <li key={item}><CircleDashed size={16} aria-hidden="true" />{item}</li>)}
        </ul>
      </div>
    </>
  );
}
