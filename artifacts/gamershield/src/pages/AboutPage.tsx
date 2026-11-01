import { CheckCircle2, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/sentrix/ToolCard';

const PRINCIPLES = [
  'Everything runs in your browser. There are no accounts, no tracking, and no analytics.',
  'Nothing you type into a tool is saved or sent to Sentrix. The only outside request is the optional password breach check, which sends a 5-character hash prefix to Have I Been Pwned.',
  'Only well-tested browser cryptography is used (Web Crypto). Sentrix never invents its own encryption.',
  'Simulations and labs are clearly labeled and use fictional data.',
  'The code is public, so anyone can check these promises.',
];

export function AboutPage() {
  return (
    <>
      <PageHeader icon="info" title="About Sentrix" summary="A free, privacy-first cybersecurity toolkit and learning platform." />
      <div className="sx-grid-2" style={{ alignItems: 'start' }}>
        <section className="sx-card" aria-labelledby="story-heading">
          <p className="sx-eyebrow">Why I built this</p>
          <h2 id="story-heading" style={{ fontSize: 22, marginBottom: 14 }}>The tool I wish I’d had</h2>
          <div className="sx-prose">
            <p>I got hacked on PlayStation in middle school, and nobody helped me figure out what happened or how to stop it. That experience got me into cybersecurity.</p>
            <p>Sentrix started as GamerShield, a small tool to help gamers protect their accounts. It’s growing into a place where anyone can use practical security tools and learn how they work.</p>
          </div>
          <p style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--sx-border)' }}>
            <strong>Sidney Nelms</strong><br />
            <span className="sx-muted">Cybersecurity major, South Carolina State University</span>
          </p>
        </section>
        <section className="sx-card" aria-labelledby="principles-heading">
          <h2 id="principles-heading" style={{ fontSize: 18, marginBottom: 14 }}>Privacy and security principles</h2>
          <ul className="sx-list">
            {PRINCIPLES.map((p) => <li key={p}><CheckCircle2 size={17} aria-hidden="true" />{p}</li>)}
          </ul>
          <a className="sx-btn" style={{ marginTop: 18 }} href="https://github.com/daeweii/Sentrix" target="_blank" rel="noopener noreferrer">
            View the code on GitHub <ExternalLink size={15} aria-hidden="true" />
          </a>
        </section>
      </div>
    </>
  );
}
