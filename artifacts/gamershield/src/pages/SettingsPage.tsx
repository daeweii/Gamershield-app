import { useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { THEME_PREFERENCES, type ThemePreference } from '@/lib/platform/storage';
import { sentrix, useSentrix } from '@/hooks/use-sentrix';
import { toast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/sentrix/ToolCard';

const THEME_LABELS: Record<ThemePreference, { label: string; icon: typeof Sun }> = {
  light: { label: 'Light', icon: Sun },
  dark: { label: 'Dark', icon: Moon },
  system: { label: 'Match device', icon: Monitor },
};

export function SettingsPage() {
  const { theme, favorites, recent } = useSentrix();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <>
      <PageHeader icon="settings" title="Settings" summary="Appearance, saved data, and privacy controls." />

      <div className="sx-stack" style={{ maxWidth: 820 }}>
        <section className="sx-card" aria-labelledby="appearance-heading">
          <h2 id="appearance-heading" style={{ fontSize: 18, marginBottom: 6 }}>Appearance</h2>
          <div className="sx-settings-row">
            <div>
              <h3 id="theme-label">Theme</h3>
              <p>Your choice is remembered in this browser and also applies to the Password Generator.</p>
            </div>
            <fieldset className="sx-segmented" aria-labelledby="theme-label">
              {THEME_PREFERENCES.map((option) => {
                const { label, icon: ThemeIcon } = THEME_LABELS[option];
                return (
                  <label key={option}>
                    <input type="radio" name="theme" value={option} checked={theme === option} onChange={() => sentrix.setTheme(option)} data-testid={`radio-theme-${option}`} />
                    <span><ThemeIcon size={15} aria-hidden="true" />{label}</span>
                  </label>
                );
              })}
            </fieldset>
          </div>
        </section>

        <section className="sx-card" aria-labelledby="data-heading">
          <h2 id="data-heading" style={{ fontSize: 18, marginBottom: 6 }}>Your data</h2>
          <p className="sx-muted" style={{ lineHeight: 1.65, marginBottom: 6 }}>
            Sentrix has no accounts and no server. It saves only these preferences in this browser’s local storage.
            It never saves passwords, messages, links, or anything else you type into a tool.
          </p>
          <div className="sx-settings-row">
            <div><h3>Favorites</h3><p>{favorites.length} saved tool {favorites.length === 1 ? 'ID' : 'IDs'}.</p></div>
            <button type="button" className="sx-btn" disabled={!favorites.length} onClick={() => { sentrix.clearFavorites(); toast({ title: 'Favorites cleared' }); }} data-testid="button-clear-favorites">Clear favorites</button>
          </div>
          <div className="sx-settings-row">
            <div><h3>Recently used</h3><p>{recent.length} tool {recent.length === 1 ? 'ID' : 'IDs'}, newest first.</p></div>
            <button type="button" className="sx-btn" disabled={!recent.length} onClick={() => { sentrix.clearRecent(); toast({ title: 'Recently used cleared' }); }} data-testid="button-clear-recent">Clear history</button>
          </div>
          <div className="sx-settings-row">
            <div>
              <h3>Reset everything</h3>
              <p>Removes all Sentrix preferences from this browser: favorites, history, theme, sidebar, and Password Generator settings.</p>
            </div>
            {confirmReset ? (
              <span style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="sx-btn sx-btn-danger" onClick={() => { sentrix.resetAll(); setConfirmReset(false); toast({ title: 'Everything reset', description: 'Sentrix data was removed from this browser.' }); }} data-testid="button-confirm-reset">Yes, reset</button>
                <button type="button" className="sx-btn sx-btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
              </span>
            ) : (
              <button type="button" className="sx-btn sx-btn-danger" onClick={() => setConfirmReset(true)} data-testid="button-reset-all">Reset…</button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
