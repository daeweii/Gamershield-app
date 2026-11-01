// The Security Checklist: everyday protections, grouped by area.
// Item IDs are what gets saved (only which boxes are ticked), so keep them stable.

export interface ChecklistItem {
  id: string;
  text: string;
  why: string;
}

export interface ChecklistGroup {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export const CHECKLIST: readonly ChecklistGroup[] = [
  {
    id: 'passwords', title: 'Passwords', items: [
      { id: 'pw-unique', text: 'Every important account has its own password', why: 'One leaked password can’t unlock your other accounts.' },
      { id: 'pw-manager', text: 'I use a password manager', why: 'It makes long, unique passwords easy, and it won’t autofill on fake sites.' },
      { id: 'pw-long', text: 'Important passwords are 15+ characters or a passphrase', why: 'Length is the biggest factor in how hard a password is to guess.' },
      { id: 'pw-breached', text: 'I’ve checked my main passwords against known breaches', why: 'Breached passwords are already on attackers’ guessing lists.' },
    ],
  },
  {
    id: 'mfa', title: 'Multifactor authentication', items: [
      { id: 'mfa-email', text: '2FA is on for my main email', why: 'Your email can reset almost everything else.' },
      { id: 'mfa-key-accounts', text: '2FA is on for banking, social, and gaming accounts', why: 'A stolen password alone is no longer enough.' },
      { id: 'mfa-app', text: 'I use an authenticator app or security key, not just SMS', why: 'SMS codes can be stolen through SIM swapping.' },
      { id: 'mfa-backup', text: 'My backup codes are saved somewhere safe and offline', why: 'Losing your phone shouldn’t lock you out.' },
    ],
  },
  {
    id: 'updates', title: 'Software updates', items: [
      { id: 'up-os', text: 'Automatic updates are on for my computer and phone', why: 'Most attacks use flaws that already have fixes.' },
      { id: 'up-browser', text: 'My browser updates itself and I restart it regularly', why: 'Browser updates often fix actively exploited bugs.' },
      { id: 'up-apps', text: 'I remove apps and extensions I no longer use', why: 'Less software means fewer ways in.' },
    ],
  },
  {
    id: 'accounts', title: 'Account security', items: [
      { id: 'acct-recovery', text: 'Recovery email and phone are up to date', why: 'Old recovery details are a common way to lose an account for good.' },
      { id: 'acct-sessions', text: 'I’ve reviewed logged-in devices and connected apps this month', why: 'Unknown sessions are a sign someone else got in.' },
      { id: 'acct-alerts', text: 'Login alerts are turned on where available', why: 'You hear about a break-in right away.' },
    ],
  },
  {
    id: 'devices', title: 'Device security', items: [
      { id: 'dev-lock', text: 'My phone and computer lock with a PIN, password, or biometric', why: 'Stops anyone who picks up your device.' },
      { id: 'dev-encryption', text: 'Disk encryption is on (FileVault, BitLocker, or phone default)', why: 'A lost or stolen device doesn’t expose your files.' },
      { id: 'dev-find', text: '“Find my device” is set up', why: 'Lets you locate or wipe a lost device.' },
      { id: 'dev-wifi', text: 'My home Wi-Fi uses WPA2 or WPA3 with a strong password', why: 'Keeps strangers off your network.' },
    ],
  },
  {
    id: 'backups', title: 'Backups', items: [
      { id: 'bk-321', text: 'Important files follow 3-2-1: 3 copies, 2 kinds of storage, 1 offsite', why: 'Protects against hardware failure, theft, and ransomware.' },
      { id: 'bk-tested', text: 'I’ve tested restoring from my backup', why: 'A backup that won’t restore isn’t a backup.' },
    ],
  },
];

export const CHECKLIST_IDS = new Set(CHECKLIST.flatMap((g) => g.items.map((i) => i.id)));
