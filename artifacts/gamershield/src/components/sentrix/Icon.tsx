import {
  AlertTriangle, BookOpen, Calculator, ClipboardCheck, Binary, FileText, Fingerprint, FlaskConical, Globe,
  Hash, Home, Info, KeyRound, LayoutDashboard, Link2, List, Lock, Mail, MessageSquareWarning, Network,
  Server, Settings, ShieldCheck, WandSparkles, type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { IconName } from '@/lib/platform/registry';

// One icon set (Lucide) everywhere, mapped from the registry's icon names.
const ICONS: Record<IconName, ComponentType<LucideProps>> = {
  home: Home, dashboard: LayoutDashboard, key: KeyRound, lock: Lock, network: Network, alert: AlertTriangle,
  book: BookOpen, flask: FlaskConical, settings: Settings, info: Info, shield: ShieldCheck, wand: WandSparkles,
  fingerprint: Fingerprint, link: Link2, message: MessageSquareWarning, clipboard: ClipboardCheck, hash: Hash,
  binary: Binary, file: FileText, globe: Globe, server: Server, calculator: Calculator, list: List, mail: Mail,
};

export function Icon({ name, size = 18, ...props }: { name: IconName } & LucideProps) {
  const Component = ICONS[name];
  return <Component size={size} aria-hidden="true" {...props} />;
}
