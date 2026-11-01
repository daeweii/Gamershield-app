import { useEffect, useState } from 'react';
import { Download, HelpCircle, RotateCcw } from 'lucide-react';
import { strings } from './strings';

type OfflineState = 'ready' | 'pending' | 'dev' | 'unsupported';

// Chrome/Edge fire this when the page can be installed. Not in TypeScript's DOM types.
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function currentOfflineState(): OfflineState {
  if (!('serviceWorker' in navigator)) return 'unsupported';
  if (!import.meta.env.PROD) return 'dev';
  return navigator.serviceWorker.controller ? 'ready' : 'pending';
}

let deferredInstall: InstallPromptEvent | null = null;
const installListeners = new Set<() => void>();
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstall = event as InstallPromptEvent;
  installListeners.forEach((notify) => notify());
});

export function PrivacySection({ onResetPrefs, onReplayTour }: { onResetPrefs: () => void; onReplayTour: () => void }) {
  const [offline, setOffline] = useState<OfflineState>(currentOfflineState);
  const [canInstall, setCanInstall] = useState(deferredInstall !== null);

  useEffect(() => {
    const update = () => setOffline(currentOfflineState());
    navigator.serviceWorker?.addEventListener('controllerchange', update);
    const onInstallable = () => setCanInstall(true);
    installListeners.add(onInstallable);
    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', update);
      installListeners.delete(onInstallable);
    };
  }, []);

  async function install() {
    if (!deferredInstall) return;
    await deferredInstall.prompt();
    deferredInstall = null;
    setCanInstall(false);
  }

  const p = strings.privacy;
  return (
    <section aria-labelledby="privacy-heading">
      <div className="pg-section-head"><h2 id="privacy-heading">{p.heading}</h2></div>

      <div className="pg-columns">
        <div>
          <h3>{p.madeHeading}</h3>
          <ul className="pg-list">{p.made.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
        <div>
          <h3>{p.leavesHeading}</h3>
          <ul className="pg-list">{p.leaves.map((line) => <li key={line}>{line}</li>)}</ul>
          <p className="pg-notice">{p.clipboard}</p>
        </div>
      </div>

      <div className="pg-columns">
        <div>
          <h3>{p.savedHeading}</h3>
          <p>{p.saved}</p>
          <button type="button" className="pg-button" onClick={onResetPrefs} data-testid="button-reset-prefs">
            <RotateCcw size={16} aria-hidden="true" /> {p.reset}
          </button>
        </div>
        <div>
          <h3>{p.offlineHeading}</h3>
          <p data-testid="text-offline-status">{p.offline[offline]}</p>
          {canInstall && (
            <button type="button" className="pg-button" onClick={install} data-testid="button-install">
              <Download size={16} aria-hidden="true" /> {p.install}
            </button>
          )}
          <h3>{p.tourHeading}</h3>
          <button type="button" className="pg-button" onClick={onReplayTour} data-testid="button-replay-tour">
            <HelpCircle size={16} aria-hidden="true" /> {p.replay}
          </button>
        </div>
      </div>
    </section>
  );
}
