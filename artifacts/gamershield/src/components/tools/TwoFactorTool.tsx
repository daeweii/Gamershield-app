import { useState } from 'react';
import { ExternalLink, Fingerprint } from 'lucide-react';
import { MENUS_CHANGE_NOTE, TWO_FA_GUIDES, type Platform } from '@/lib/security';
import { PlatformPicker, ToolPanel } from './ToolPanel';

export function TwoFactorTool() {
  const [platform, setPlatform] = useState<Platform>('PlayStation');
  const guide = TWO_FA_GUIDES[platform];

  return (
    <ToolPanel id="two-factor" icon={Fingerprint} title="2FA Setup Guides">
      <p className="gs-hint">2FA means a hacker needs your password AND your phone. It stops most account takeovers.</p>
      <PlatformPicker label="Which platform?" value={platform} onChange={setPlatform} />

      <ol className="gs-steps" aria-label={`Steps to turn on 2FA for ${platform}`} data-testid="list-2fa-steps">
        {guide.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>

      <p className="gs-hint">{MENUS_CHANGE_NOTE}</p>
      {/* helpUrl is a fixed official link from guides.ts, never user input, so it's safe to link.
          noopener stops the new tab from controlling this one; noreferrer hides where the visitor came from. */}
      <a className="gs-secondary gs-help-link" href={guide.helpUrl} target="_blank" rel="noopener noreferrer" data-testid="link-2fa-help">
        <ExternalLink size={15} /> Official {platform} help
      </a>
    </ToolPanel>
  );
}
