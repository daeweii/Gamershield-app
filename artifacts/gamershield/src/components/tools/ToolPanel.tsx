import type { ComponentType, ReactNode } from 'react';
import { PLATFORMS, type Platform } from '@/lib/security';

interface ToolPanelProps {
  id: string;
  icon: ComponentType<{ size?: number }>;
  title: string;
  children: ReactNode;
}

/** The console-style frame every tool sits in, matching the Password Check panel. */
export function ToolPanel({ id, icon: Icon, title, children }: ToolPanelProps) {
  return (
    <section className="gs-console gs-tool-panel" aria-labelledby={`${id}-heading`} data-testid={`panel-${id}`}>
      <span className="gs-shield-pattern" aria-hidden="true" />
      <div className="gs-console-head">
        <div className="gs-console-title"><Icon size={19} /><h3 id={`${id}-heading`}>{title}</h3></div>
        <span className="gs-console-tag">ON-DEVICE</span>
      </div>
      {children}
    </section>
  );
}

/** Row of platform buttons, shared by the checkup and the 2FA guides. */
export function PlatformPicker({ label, value, onChange }: { label: string; value: Platform; onChange: (platform: Platform) => void }) {
  return (
    <div role="group" aria-label={label}>
      <span className="gs-input-label">{label}</span>
      <div className="gs-chips">
        {PLATFORMS.map((platform) => (
          <button
            key={platform}
            type="button"
            className="gs-chip"
            aria-pressed={platform === value}
            onClick={() => onChange(platform)}
            data-testid={`button-platform-${platform.toLowerCase().replace(' ', '-')}`}
          >
            {platform}
          </button>
        ))}
      </div>
    </div>
  );
}
