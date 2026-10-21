import { useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { GeneratorTool } from '@/components/tools/GeneratorTool';
import { LinkTool } from '@/components/tools/LinkTool';
import { MessageTool } from '@/components/tools/MessageTool';
import { CheckupTool } from '@/components/tools/CheckupTool';
import { TwoFactorTool } from '@/components/tools/TwoFactorTool';
import { AlertTriangle, Check, ClipboardCheck, Eye, EyeOff, Fingerprint, Gamepad2, KeyRound, Link2, LockKeyhole, MessageSquareWarning, ShieldCheck } from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

const riskyTerms = [
  'password', '123456', 'qwerty', 'letmein', 'gamer', 'fortnite',
  'minecraft', 'playstation', 'xbox', 'admin', 'roblox', 'valorant',
];

type BreachState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'found'; count: number }
  | { kind: 'clear' }
  | { kind: 'unavailable' }
  | { kind: 'error' };

type ToolId = 'generator' | 'link-check' | 'message-check' | 'checkup' | 'two-factor';

interface ToolCard {
  id: ToolId | 'password-check';
  title: string;
  description: string;
  icon: ComponentType<{ size?: number }>;
}

const TOOL_CARDS: ToolCard[] = [
  { id: 'password-check', title: 'Password Check', description: 'Estimate strength and optionally check known breach data.', icon: ShieldCheck },
  { id: 'generator', title: 'Password Generator', description: 'Create a strong password or an easy-to-remember passphrase.', icon: KeyRound },
  { id: 'link-check', title: 'Scam Link Checker', description: 'Look for suspicious domains and common gaming bait.', icon: Link2 },
  { id: 'message-check', title: 'Scam Message Checker', description: 'Spot pressure tactics and common scam messages.', icon: MessageSquareWarning },
  { id: 'checkup', title: 'Account Security Checkup', description: 'Get a score and prioritized steps to protect an account.', icon: ClipboardCheck },
  { id: 'two-factor', title: '2FA Setup Guides', description: 'Follow platform-specific steps to add another layer of security.', icon: Fingerprint },
];

const TOOL_PANELS: Record<ToolId, ComponentType> = {
  'generator': GeneratorTool,
  'link-check': LinkTool,
  'message-check': MessageTool,
  'checkup': CheckupTool,
  'two-factor': TwoFactorTool,
};

function Home() {
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [breach, setBreach] = useState<BreachState>({ kind: 'idle' });
  const [activeTool, setActiveTool] = useState<ToolId>('generator');
  const panelRef = useRef<HTMLDivElement>(null);

  function openTool(id: ToolId) {
    setActiveTool(id);
    // On phones the panel is below six stacked cards, so bring it into view.
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  const ActivePanel = TOOL_PANELS[activeTool];

  // This score is a local estimate only. It does not predict every attack.
  const assessment = useMemo(() => {
    let score = 0;
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9\s]/.test(password)) score += 1;
    const containsRiskyTerm = riskyTerms.some((term) => password.toLowerCase().includes(term));
    if (containsRiskyTerm) score -= 2;
    score = Math.max(0, Math.min(6, score));
    const level = score <= 2 ? 'WEAK' : score <= 4 ? 'OKAY' : 'STRONG';
    const tips: string[] = [];
    if (password.length < 12) tips.push('Use 12 or more characters.');
    if (!/[a-z]/.test(password)) tips.push('Add a lowercase letter.');
    if (!/[A-Z]/.test(password)) tips.push('Add an uppercase letter.');
    if (!/[0-9]/.test(password)) tips.push('Add a number.');
    if (!/[^A-Za-z0-9\s]/.test(password)) tips.push('Add a symbol, like ! or #.');
    if (containsRiskyTerm) tips.push('Avoid common words and game names.');
    if (tips.length === 0) tips.push('Good mix. Keep it unique to this account.');
    return { score, level, tips, containsRiskyTerm };
  }, [password]);

  async function checkBreachDatabase() {
    if (!password || breach.kind === 'loading') return;
    if (!globalThis.crypto?.subtle || typeof TextEncoder === 'undefined') {
      setBreach({ kind: 'unavailable' });
      return;
    }

    setBreach({ kind: 'loading' });
    try {
      // Hash inside this browser, then send only the first five SHA-1 characters.
      const bytes = new TextEncoder().encode(password);
      const digest = await crypto.subtle.digest('SHA-1', bytes);
      const fullHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
      const prefix = fullHash.slice(0, 5);
      const suffix = fullHash.slice(5);
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        credentials: 'omit',
        headers: { 'Add-Padding': 'true' },
      });
      if (!response.ok) throw new Error('Breach lookup was unavailable.');

      const matches = (await response.text()).split(/\r?\n/);
      let count = 0;
      for (const line of matches) {
        const [candidate, rawCount] = line.trim().split(':');
        const parsedCount = Number(rawCount);
        // HIBP padding entries use a count of zero and are not real matches.
        if (candidate?.toUpperCase() === suffix && parsedCount > 0) count = parsedCount;
      }
      setBreach(count > 0 ? { kind: 'found', count } : { kind: 'clear' });
    } catch {
      setBreach({ kind: 'error' });
    }
  }

  function updatePassword(value: string) {
    setPassword(value);
    setBreach({ kind: 'idle' });
  }

  const scoreClass = assessment.level.toLowerCase();

  return (
    <main className="gs-shell">
      <div className="gs-container">
        <header className="gs-topbar">
          <a href="#top" className="gs-brand" aria-label="GamerShield home" data-testid="link-home">
            <span className="gs-mark"><ShieldCheck size={19} strokeWidth={2.5} /></span>
            <span>GamerShield</span>
          </a>
          <nav className="gs-nav" aria-label="Main navigation">
            <a href="#tools" data-testid="link-tools">Tools</a>
            <a href="#about" data-testid="link-about">Our story</a>
            <a className="gs-nav-cta" href="#password-check" data-testid="link-check-password">Check a password</a>
          </nav>
        </header>

        <section className="gs-hero" id="top" aria-labelledby="hero-title">
          <div>
            <div className="gs-kicker">Account safety for gamers</div>
            <h1 id="hero-title">Keep your game.<br />Protect your <em>account.</em></h1>
            <p className="gs-lede">A safer account starts with small steps. Check a password here, on your device, and get a clear next move.</p>
            <div className="gs-proof">
              <span className="gs-proof-icon"><LockKeyhole size={14} /></span>
              <span>Free to use. No account. No password stored.</span>
            </div>
          </div>

          <section className="gs-console" id="password-check" aria-labelledby="checker-heading" data-testid="panel-password-check">
            <span className="gs-shield-pattern" aria-hidden="true" />
            <div className="gs-console-head">
              <div className="gs-console-title"><Gamepad2 size={19} /><span id="checker-heading">Password Check</span></div>
              <span className="gs-console-tag">ON-DEVICE</span>
            </div>
            <label className="gs-input-label" htmlFor="password-input">Try a password or a made-up example</label>
            <form className="gs-password-wrap" autoComplete="off" onSubmit={(event) => event.preventDefault()}>
              <input
                id="password-input"
                type={visible ? 'text' : 'password'}
                value={password}
                onChange={(event) => updatePassword(event.target.value)}
                placeholder="Type a password to check"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="privacy-note"
                data-testid="input-password"
              />
              <button
                type="button"
                className="gs-show"
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                aria-pressed={visible}
                data-testid="button-toggle-password"
              >
                {visible ? <><EyeOff size={15} /> Hide</> : <><Eye size={15} /> Show</>}
              </button>
            </form>
            <div className="gs-scoreline">
              <span className="gs-score-label">Strength estimate</span>
              <span className="gs-score" aria-live="polite" data-testid="status-password-strength">
                <em>{password ? `${assessment.score}/6` : '—/6'}</em>
                <b className={password ? scoreClass : ''}>{password ? assessment.level : 'WAITING'}</b>
              </span>
            </div>
            <div className="gs-meter" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={6} aria-valuenow={password ? assessment.score : 0} aria-valuetext={password ? `${assessment.level}, ${assessment.score} out of 6` : 'Waiting for a password'} data-testid="meter-password-strength">
              {Array.from({ length: 6 }, (_, index) => (
                <span key={index} className={password && index < assessment.score ? `filled ${scoreClass}` : ''} />
              ))}
            </div>
            <div className="gs-meter-caption"><span>WEAK</span><span>OKAY</span><span>STRONG</span></div>
            <div className="gs-tips" data-testid="text-password-tips">
              <strong>{password ? (assessment.containsRiskyTerm ? 'One thing to change' : 'Try this next') : 'A quick note'}</strong>
              <ul>{assessment.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
            </div>
            <button
              type="button"
              className="gs-breach"
              onClick={checkBreachDatabase}
              disabled={!password || breach.kind === 'loading'}
              data-testid="button-check-breach"
            >
              {breach.kind === 'loading' ? <><span aria-hidden="true">Checking…</span></> : <><AlertTriangle size={16} /> Check breach database</>}
            </button>
            <p className="gs-privacy" id="privacy-note">
              <LockKeyhole size={13} />
              <span>Everything you type stays on your device. We never see or save it. The optional breach check sends only the first five hash characters to HIBP, not to GamerShield.</span>
            </p>
            <div className="gs-result" role="status" aria-live="polite" data-testid="status-breach-result">
              {breach.kind === 'idle' && <><strong>Optional breach check</strong>It is your choice. Nothing is checked unless you press the button.</>}
              {breach.kind === 'loading' && <><strong>Checking HIBP…</strong>Your password stays in this browser while the hash prefix is checked.</>}
              {breach.kind === 'found' && <div className="gs-result alert"><strong>Found in known breaches</strong>This password appeared {breach.count.toLocaleString()} times in known breach data. Change it anywhere you use it. Do not reuse it.</div>}
              {breach.kind === 'clear' && <><strong>No match found</strong>HIBP did not find this password in its available breach data. That does not guarantee it is safe or private.</>}
              {breach.kind === 'unavailable' && <div className="gs-result notice"><strong>Secure check not available</strong>This browser cannot run the required SHA-1 operation. No request was made.</div>}
              {breach.kind === 'error' && <div className="gs-result notice"><strong>Could not complete the check</strong>The breach service may be unavailable or blocked. Your password was not sent, but the five-character hash prefix was requested.</div>}
            </div>
            <p className="gs-privacy">
              <Check size={13} />
              <span><b style={{ color: '#c7d5ce' }}>How it stays private:</b> HIBP uses k-anonymity. Your browser sends the first 5 characters of a SHA-1 hash. HIBP returns possible matches, and your browser checks the rest. The password and full hash are never sent.</span>
            </p>
          </section>
        </section>

        <section className="gs-section" id="tools" aria-labelledby="tools-title">
          <div className="gs-section-top">
            <div><div className="gs-kicker">More account safety</div><h2 id="tools-title">Small tools. Clear answers.</h2></div>
            <p className="gs-section-intro">Pick a tool. All six run right here on your device, and nothing you type is saved or sent to GamerShield.</p>
          </div>
          <div className="gs-tools">
            {TOOL_CARDS.map(({ id, title, description, icon: Icon }, index) => {
              const body = (
                <>
                  <span className="gs-tool-icon"><Icon size={17} /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="gs-coming">{id === activeTool ? 'Open below' : 'Open tool'}</span>
                </>
              );
              // Password Check already lives in the hero, so its card just links up there.
              return id === 'password-check'
                ? <a className="gs-tool" href="#password-check" key={id} data-testid={`card-tool-${index + 1}`}>{body}</a>
                : (
                  <button
                    type="button"
                    className="gs-tool"
                    key={id}
                    aria-pressed={id === activeTool}
                    aria-controls="tool-panel"
                    onClick={() => openTool(id)}
                    data-testid={`card-tool-${index + 1}`}
                  >
                    {body}
                  </button>
                );
            })}
          </div>
          <div id="tool-panel" ref={panelRef} className="gs-tool-panel-wrap">
            <ActivePanel />
          </div>
        </section>

        <section className="gs-section" id="about" aria-labelledby="about-title">
          <div className="gs-about">
            <div className="gs-about-mark">
              <span id="about-title">Why I built this</span>
              <strong>Every player deserves a fair shot at staying safe.</strong>
            </div>
            <div>
              <p className="gs-story">I got hacked on PlayStation in middle school, and nobody helped me figure out what happened or how to stop it. That experience got me into cybersecurity. Now I’m studying it, and GamerShield is the tool I wish I’d had back then.</p>
              <div className="gs-signature">
                <strong>Sidney Nelms</strong>
                <span>Cybersecurity Major, South Carolina State University</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="gs-footer">
          <span className="gs-footer-brand">GamerShield</span>
          <span>Built for players and the people who look out for them.</span>
          <span>Free. Privacy-first. No account needed.</span>
        </footer>
      </div>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
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
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
