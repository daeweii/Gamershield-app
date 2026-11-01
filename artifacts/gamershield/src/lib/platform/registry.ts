// ---------------------------------------------------------------
// SENTRIX REGISTRY
// The single list of sections, categories, and tools. Navigation, search,
// the home page, and favorites all read from here, so adding a tool is
// one entry. Icons are names (strings) so this file has no UI imports.
// ---------------------------------------------------------------

export type CategoryId = 'password-security' | 'cryptography' | 'networking' | 'security-awareness';

export type IconName =
  | 'home' | 'dashboard' | 'key' | 'lock' | 'network' | 'alert' | 'book' | 'flask' | 'settings' | 'info'
  | 'shield' | 'wand' | 'fingerprint' | 'link' | 'message' | 'clipboard' | 'hash' | 'binary' | 'file'
  | 'globe' | 'server' | 'calculator' | 'list' | 'mail';

export interface Category {
  id: CategoryId;
  name: string;
  summary: string;
  icon: IconName;
}

export interface Tool {
  id: string;
  name: string;
  summary: string;
  category: CategoryId;
  icon: IconName;
  /** Extra words people might search for. */
  keywords: string[];
  /** 'planned' tools are shown honestly as upcoming, never as working. */
  status: 'ready' | 'planned';
  plannedPhase?: number;
  /** Opens a standalone page (e.g. the offline-capable generator) instead of an in-app route. */
  standalonePath?: string;
}

/** Top-level pages in the sidebar, in order. */
export interface Section {
  id: string;
  name: string;
  path: string;
  icon: IconName;
  summary: string;
  plannedPhase?: number;
}

export const CATEGORIES: readonly Category[] = [
  { id: 'password-security', name: 'Password Security', icon: 'key', summary: 'Check, create, and protect passwords and logins.' },
  { id: 'cryptography', name: 'Cryptography', icon: 'lock', summary: 'Hashing, encoding, and encryption, explained and hands-on.' },
  { id: 'networking', name: 'Networking', icon: 'network', summary: 'IP addresses, DNS, subnets, and the language of networks.' },
  { id: 'security-awareness', name: 'Security Awareness', icon: 'alert', summary: 'Spot scams, phishing, and risky links before they get you.' },
];

export const TOOLS: readonly Tool[] = [
  // Password Security
  { id: 'strength-checker', name: 'Password Strength Checker', category: 'password-security', icon: 'shield', status: 'ready',
    summary: 'Estimate strength on your device and optionally check known breaches with k-anonymity.',
    keywords: ['password', 'strength', 'breach', 'pwned', 'hibp', 'leak', 'check'] },
  { id: 'password-generator', name: 'Password Generator', category: 'password-security', icon: 'wand', status: 'ready',
    summary: 'Random passwords, passphrases, PINs, and site rules. Works offline.',
    keywords: ['password', 'generator', 'passphrase', 'pin', 'random', 'create', 'offline'],
    standalonePath: 'generator/' },
  { id: 'two-factor-guides', name: '2FA Setup Guides', category: 'password-security', icon: 'fingerprint', status: 'ready',
    summary: 'Step-by-step 2FA for PlayStation, Xbox, Discord, Steam, Epic Games, and Roblox.',
    keywords: ['2fa', 'mfa', 'two-factor', 'multifactor', 'authenticator', 'playstation', 'xbox', 'discord', 'steam', 'epic', 'roblox'] },
  { id: 'password-guide', name: 'Password Security Guide', category: 'password-security', icon: 'book', status: 'planned', plannedPhase: 2,
    summary: 'Best practices, password reuse, MFA, and password managers.', keywords: ['guide', 'manager', 'reuse'] },

  // Cryptography
  { id: 'hash-generator', name: 'Hash Generator', category: 'cryptography', icon: 'hash', status: 'planned', plannedPhase: 2,
    summary: 'SHA-256 and more, with hashing vs. encryption explained.', keywords: ['sha', 'hash'] },
  { id: 'base64', name: 'Text Encoder & Decoder', category: 'cryptography', icon: 'binary', status: 'planned', plannedPhase: 2,
    summary: 'Base64 encoding and decoding, and why it is not encryption.', keywords: ['base64', 'encode', 'decode'] },
  { id: 'encryption', name: 'Encryption & Decryption', category: 'cryptography', icon: 'lock', status: 'planned', plannedPhase: 2,
    summary: 'AES-GCM with the browser’s Web Crypto API, with limits explained.', keywords: ['aes', 'encrypt', 'decrypt'] },
  { id: 'file-hash', name: 'File Hash Checker', category: 'cryptography', icon: 'file', status: 'planned', plannedPhase: 2,
    summary: 'Hash a file locally and compare it to an expected value.', keywords: ['checksum', 'file', 'verify'] },

  // Networking
  { id: 'ip-info', name: 'IP Information', category: 'networking', icon: 'globe', status: 'planned', plannedPhase: 2,
    summary: 'Public vs. private IPs and what an IP reveals.', keywords: ['ip', 'address'] },
  { id: 'dns-lookup', name: 'DNS Lookup', category: 'networking', icon: 'server', status: 'planned', plannedPhase: 2,
    summary: 'A, AAAA, MX, TXT, and other records, explained.', keywords: ['dns', 'mx', 'txt', 'records'] },
  { id: 'subnet-calculator', name: 'Subnet Calculator', category: 'networking', icon: 'calculator', status: 'planned', plannedPhase: 2,
    summary: 'Network, broadcast, and usable host ranges.', keywords: ['subnet', 'cidr', 'mask'] },
  { id: 'network-terms', name: 'Network Terminology', category: 'networking', icon: 'list', status: 'planned', plannedPhase: 2,
    summary: 'IP, MAC, DNS, DHCP, TCP, UDP, ports, and more.', keywords: ['tcp', 'udp', 'ports', 'glossary'] },

  // Security Awareness
  { id: 'link-checker', name: 'Scam Link Checker', category: 'security-awareness', icon: 'link', status: 'ready',
    summary: 'Read a link as text and flag fake domains, look-alikes, and bait. Never opens it.',
    keywords: ['url', 'link', 'phishing', 'domain', 'fake', 'discord', 'steam', 'punycode'] },
  { id: 'message-checker', name: 'Scam Message Checker', category: 'security-awareness', icon: 'message', status: 'ready',
    summary: 'Paste a DM and spot common scam and phishing phrases.',
    keywords: ['phishing', 'scam', 'dm', 'message', 'social engineering', 'nitro', 'robux'] },
  { id: 'account-checkup', name: 'Account Security Checkup', category: 'security-awareness', icon: 'clipboard', status: 'ready',
    summary: 'Seven questions, a score, and a prioritized fix list.',
    keywords: ['checklist', 'audit', 'score', 'account', 'recovery'] },
  { id: 'file-safety', name: 'File Safety Guide', category: 'security-awareness', icon: 'file', status: 'planned', plannedPhase: 2,
    summary: 'File extensions, safe handling, and verifying downloads.', keywords: ['file', 'extension', 'download'] },
];

export const SECTIONS: readonly Section[] = [
  { id: 'home', name: 'Home', path: '/', icon: 'home', summary: 'Your starting point: search, quick tools, and a daily tip.' },
  { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: 'dashboard', summary: 'Your favorites, recent tools, and progress.' },
  ...CATEGORIES.map((c) => ({ id: c.id, name: c.name, path: `/${c.id}`, icon: c.icon, summary: c.summary })),
  { id: 'learning', name: 'Learning Center', path: '/learning', icon: 'book', summary: 'Lessons, quizzes, and flashcards from beginner to Security+.', plannedPhase: 3 },
  { id: 'labs', name: 'Cyber Labs', path: '/labs', icon: 'flask', summary: 'Hands-on simulated labs: logs, phishing, crypto, networking, and a safe terminal.', plannedPhase: 4 },
  { id: 'settings', name: 'Settings', path: '/settings', icon: 'settings', summary: 'Theme, saved data, and privacy controls.' },
  { id: 'about', name: 'About', path: '/about', icon: 'info', summary: 'Why Sentrix exists and how it protects your privacy.' },
];

export const READY_TOOLS = TOOLS.filter((t) => t.status === 'ready');
export const TOOL_IDS = new Set(TOOLS.map((t) => t.id));

export const findTool = (id: string) => TOOLS.find((t) => t.id === id);
export const findCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
export const toolsIn = (category: CategoryId) => TOOLS.filter((t) => t.category === category);

/** In-app route for a tool, relative to the site base. Standalone tools use their own page path. */
export function toolHref(tool: Tool): string {
  return tool.standalonePath ? tool.standalonePath : `/${tool.category}/${tool.id}`;
}
