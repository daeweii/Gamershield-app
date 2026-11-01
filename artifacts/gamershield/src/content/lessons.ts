// Learning Center lessons. Original material written for Sentrix.
// Lessons are data: add one here and it gets a page, a route, and progress tracking.

import type { QuizQuestion } from '../lib/learning/progress.ts';

export interface LessonSection {
  heading: string;
  paragraphs: string[];
}

export interface Lesson {
  id: string;
  path: PathId;
  title: string;
  summary: string;
  minutes: number;
  sections: LessonSection[];
  /** Flashcards: tap to flip from term to definition. */
  keyTerms: { term: string; definition: string }[];
  quiz: QuizQuestion[];
  /** Sentrix tools to try after the lesson. */
  tryTools: string[];
}

export type PathId = 'beginner' | 'intermediate' | 'advanced';

export interface LearningPath {
  id: PathId;
  name: string;
  summary: string;
  /** Planned paths list their upcoming topics instead of lessons. */
  plannedTopics?: string[];
}

export const PATHS: readonly LearningPath[] = [
  { id: 'beginner', name: 'Beginner', summary: 'The core ideas everyone needs: what attackers want, how to protect accounts, and how to spot scams.' },
  {
    id: 'intermediate', name: 'Intermediate', summary: 'How systems work under the hood, and how defenders find trouble.',
    plannedTopics: ['Cryptography fundamentals', 'Operating system security', 'Threat identification', 'Security principles (least privilege, defense in depth)'],
  },
  {
    id: 'advanced', name: 'Advanced', summary: 'Responding to incidents and preparing for certification.',
    plannedTopics: ['Incident response fundamentals', 'Social engineering in depth', 'Security+ preparation, organized by exam objective (original material)'],
  },
];

export const LESSONS: readonly Lesson[] = [
  {
    id: 'intro-to-cybersecurity', path: 'beginner', title: 'Introduction to Cybersecurity', minutes: 6,
    summary: 'What cybersecurity protects, the CIA triad, and why attackers target ordinary people.',
    sections: [
      { heading: 'What cybersecurity protects', paragraphs: [
        'Cybersecurity is protecting information and the systems that hold it from people who shouldn’t have it, change it, or break it. That includes your accounts, devices, files, and the services you rely on.',
        'Security professionals describe the goal with the CIA triad: Confidentiality (only the right people can see data), Integrity (data isn’t changed without permission), and Availability (systems work when you need them).',
      ] },
      { heading: 'Why attackers target regular people', paragraphs: [
        'Most attacks aren’t personal. Attackers automate: they try leaked passwords on millions of accounts and send the same scam to thousands of people, then profit from whoever falls for it.',
        'Gaming accounts are valuable because skins, currency, and rare items can be resold, and a hacked account can be used to scam your friends.',
      ] },
      { heading: 'Threats, vulnerabilities, and risk', paragraphs: [
        'A threat is something that could cause harm (a scammer). A vulnerability is a weakness it could use (a reused password). Risk is how likely and how bad the harm would be. Defense is mostly about removing vulnerabilities so threats have nothing to grab.',
      ] },
    ],
    keyTerms: [
      { term: 'Confidentiality', definition: 'Only authorized people can access the information.' },
      { term: 'Integrity', definition: 'Information stays accurate and isn’t changed without permission.' },
      { term: 'Availability', definition: 'Systems and data are usable when they’re needed.' },
      { term: 'Vulnerability', definition: 'A weakness an attacker could exploit, like a reused password or unpatched software.' },
    ],
    quiz: [
      { id: 'q1', question: 'A ransomware attack locks a school’s files so nobody can open them. Which part of the CIA triad is mainly hit?', options: ['Confidentiality', 'Integrity', 'Availability', 'Authentication'], answer: 2, explanation: 'Locked files can’t be used, so availability is lost. (If the attackers also steal and leak the files, confidentiality is hit too.)' },
      { id: 'q2', question: 'Someone secretly changes the grade in a school database. Which property did they break?', options: ['Availability', 'Integrity', 'Confidentiality', 'Non-repudiation'], answer: 1, explanation: 'Integrity means data isn’t changed without permission. A secretly edited grade is a classic integrity violation.' },
      { id: 'q3', question: 'Why do attackers go after ordinary gamers instead of only big companies?', options: ['Gamers are required to share passwords', 'Automated attacks make targeting many people cheap and profitable', 'Game companies pay attackers', 'Gaming accounts can’t have 2FA'], answer: 1, explanation: 'Attackers automate. Trying leaked passwords or sending scams to thousands of people costs almost nothing, and resellable items make it pay.' },
      { id: 'q4', question: 'Using the same password on every site is best described as a…', options: ['Threat', 'Vulnerability', 'Firewall', 'Patch'], answer: 1, explanation: 'Reuse is a weakness (vulnerability). The threat is the attacker who tries that leaked password everywhere.' },
    ],
    tryTools: ['account-checkup', 'security-checklist'],
  },
  {
    id: 'passwords-and-mfa', path: 'beginner', title: 'Passwords and Multifactor Authentication', minutes: 7,
    summary: 'What makes a password strong, why reuse is dangerous, and how MFA stops most takeovers.',
    sections: [
      { heading: 'Strength is about guesses', paragraphs: [
        'A password’s strength is how many guesses an attacker needs. Length matters most: each extra character multiplies the possibilities. “P@ssw0rd!” looks complex but follows patterns that cracking tools try first.',
        'Good options: a random password from a password manager, or a passphrase of 5–6 random words. NIST guidance asks sites to allow long passwords and stop forcing symbol rules.',
      ] },
      { heading: 'Credential stuffing', paragraphs: [
        'When a site is breached, its email-and-password list gets sold. Attackers then try those pairs on other sites. This is credential stuffing, and it’s why one leak can cost you many accounts. Unique passwords stop it cold.',
      ] },
      { heading: 'Multifactor authentication', paragraphs: [
        'MFA requires two different kinds of proof: something you know (password), something you have (phone, security key), or something you are (fingerprint). A stolen password alone stops working.',
        'Security keys and passkeys are strongest because phishing sites can’t use them. Authenticator apps are very good. Text-message codes are better than nothing but can be stolen by SIM swapping.',
      ] },
    ],
    keyTerms: [
      { term: 'Credential stuffing', definition: 'Trying usernames and passwords leaked from one site on many other sites.' },
      { term: 'MFA', definition: 'Multifactor authentication: logging in needs two or more different kinds of proof.' },
      { term: 'Passphrase', definition: 'A password made of several random words; long, strong, and easier to remember.' },
      { term: 'SIM swapping', definition: 'Tricking a phone carrier into moving your number to an attacker’s SIM to receive your text codes.' },
    ],
    quiz: [
      { id: 'q1', question: 'Which is usually the strongest choice?', options: ['P@ssw0rd2026!', 'Your pet’s name plus your birth year', 'Five random words like “cedar-orbit-mango-river-quill”', 'An 8-character password with every symbol type'], answer: 2, explanation: 'Length from random words beats short “complex” passwords. P@ssw0rd-style substitutions are among the first things cracking tools try.' },
      { id: 'q2', question: 'A site you used in 2019 was breached. Why does that put your new gaming account at risk?', options: ['Breaches spread viruses', 'Attackers try leaked passwords on other sites (credential stuffing)', 'Game companies share databases', 'It doesn’t, if the old site was small'], answer: 1, explanation: 'If you reused the password, attackers can simply log in elsewhere with it. Unique passwords per site prevent this.' },
      { id: 'q3', question: 'Which MFA method resists phishing best?', options: ['Text message code', 'Email code', 'Hardware security key or passkey', 'Security question'], answer: 2, explanation: 'Keys and passkeys check the real website’s identity, so a fake site can’t use them. Codes can be typed into a fake page.' },
      { id: 'q4', question: 'Is a password plus a PIN multifactor authentication?', options: ['Yes, it’s two factors', 'No, both are “something you know”', 'Yes, if the PIN is 6 digits', 'Only on mobile'], answer: 1, explanation: 'MFA needs different kinds of proof. A password and a PIN are both knowledge, so it’s just two passwords.' },
    ],
    tryTools: ['strength-checker', 'password-generator', 'two-factor-guides'],
  },
  {
    id: 'phishing-and-social-engineering', path: 'beginner', title: 'Phishing and Social Engineering', minutes: 7,
    summary: 'How scammers manipulate people, the red flags in messages and links, and what to do instead.',
    sections: [
      { heading: 'Hacking the human', paragraphs: [
        'Social engineering tricks people into doing what the attacker wants: sharing a code, clicking a link, or handing over a login. Phishing is social engineering through messages (email, DMs, texts).',
        'It works by triggering emotions: urgency (“your account will be banned in 24 hours”), excitement (“free Nitro”), fear, or wanting to help a friend.',
      ] },
      { heading: 'Red flags', paragraphs: [
        'Watch for pressure to act fast, requests for codes or passwords, too-good-to-be-true offers, and links whose real domain doesn’t match the brand. In discord.com.free-nitro.ru, the real site is free-nitro.ru.',
        'A message from a friend can still be a scam: their account may have been taken over and used to target their contacts.',
      ] },
      { heading: 'What to do instead', paragraphs: [
        'Don’t click. Go to the site or app yourself. Never share login codes: real staff never need them. Verify unusual requests from friends another way (text them, call them). Report the message on the platform.',
      ] },
    ],
    keyTerms: [
      { term: 'Phishing', definition: 'A fake message designed to trick you into revealing information or clicking something harmful.' },
      { term: 'Social engineering', definition: 'Manipulating people, rather than computers, into giving up access or information.' },
      { term: 'Pretexting', definition: 'Inventing a believable story (“I’m from support”) to get you to cooperate.' },
      { term: 'Registered domain', definition: 'The part of a web address right before the ending (example.com) that shows who really controls the site.' },
    ],
    quiz: [
      { id: 'q1', question: 'A friend DMs: “I accidentally reported you, send me the code you just got so staff can fix it.” What’s happening?', options: ['A normal support process', 'A scam to steal your 2FA code and account', 'A glitch in the game', 'Your friend is being helpful'], answer: 1, explanation: 'This is a well-known scam. The “code” is your login or 2FA code. Real support never asks for it, and your friend’s account may be hacked.' },
      { id: 'q2', question: 'Which link really goes to Steam?', options: ['steamcommunity.com.trade-offer.ru', 'store.steampowered.com', 'steamcommunlty.com', 'steam-gift.xyz'], answer: 1, explanation: 'Read the registered domain: steampowered.com is real. The others are a subdomain trick, a misspelling, and a look-alike.' },
      { id: 'q3', question: 'What emotion is “Your account will be deleted in 1 hour unless you verify” trying to trigger?', options: ['Curiosity', 'Urgency and fear', 'Trust', 'Boredom'], answer: 1, explanation: 'Urgency and fear rush you past careful thinking. Real platforms warn you inside the app, not with countdown threats in DMs.' },
      { id: 'q4', question: 'The safest response to a suspicious login link is to…', options: ['Click it to see what happens', 'Reply asking if it’s real', 'Open the official app or type the address yourself', 'Forward it to friends to warn them'], answer: 2, explanation: 'Going to the real site yourself means a fake link can’t send you to a lookalike page.' },
    ],
    tryTools: ['message-checker', 'link-checker', 'url-inspector'],
  },
  {
    id: 'networking-basics', path: 'beginner', title: 'Networking Basics', minutes: 8,
    summary: 'IP addresses, DNS, ports, and how data finds its way across the internet.',
    sections: [
      { heading: 'Addresses', paragraphs: [
        'Every device on a network has an IP address. At home, your devices get private addresses (like 192.168.1.20) from your router, which shares one public address with the internet through NAT.',
        'Websites see your public address, not your device’s private one. An IP reveals roughly your provider and region, not your name.',
      ] },
      { heading: 'DNS: names to numbers', paragraphs: [
        'People use names like example.com; computers use IP addresses. DNS (the Domain Name System) translates between them. Your device asks a resolver, which finds the domain’s official name servers and returns the address.',
        'Because DNS decides where you connect, attackers abuse it with look-alike domains and, on bad networks, by tampering with answers.',
      ] },
      { heading: 'Ports and protocols', paragraphs: [
        'One IP can run many services, each on a numbered port: 443 for HTTPS websites, 22 for SSH, 53 for DNS. Firewalls allow or block traffic by port. TCP delivers data reliably and in order; UDP is faster but makes no guarantees.',
      ] },
    ],
    keyTerms: [
      { term: 'IP address', definition: 'A device’s address on a network, like 192.168.1.20 (IPv4) or 2606:4700::1111 (IPv6).' },
      { term: 'DNS', definition: 'The system that turns domain names into IP addresses.' },
      { term: 'Port', definition: 'A number that identifies a specific service on a device, like 443 for HTTPS.' },
      { term: 'NAT', definition: 'Lets many devices with private addresses share one public IP address.' },
    ],
    quiz: [
      { id: 'q1', question: 'Which address is private (only works inside a local network)?', options: ['8.8.8.8', '192.168.0.15', '1.1.1.1', '142.250.72.14'], answer: 1, explanation: '192.168.0.0/16 is a private range (RFC 1918), along with 10.0.0.0/8 and 172.16.0.0/12.' },
      { id: 'q2', question: 'What does DNS do?', options: ['Encrypts web traffic', 'Turns domain names into IP addresses', 'Blocks viruses', 'Assigns MAC addresses'], answer: 1, explanation: 'DNS is the internet’s phone book: it looks up the IP address for a name like example.com.' },
      { id: 'q3', question: 'Secure websites (HTTPS) normally use which port?', options: ['21', '80', '443', '3389'], answer: 2, explanation: 'HTTPS uses 443. Port 80 is plain HTTP, 21 is FTP, and 3389 is Windows Remote Desktop.' },
      { id: 'q4', question: 'A voice chat app favors speed over perfect delivery. Which protocol fits?', options: ['TCP', 'UDP', 'FTP', 'SMTP'], answer: 1, explanation: 'UDP skips handshakes and resending, so it’s faster. A dropped audio packet is better than a delayed one.' },
    ],
    tryTools: ['ip-info', 'dns-lookup', 'subnet-calculator', 'network-terms'],
  },
  {
    id: 'hashing-vs-encryption', path: 'beginner', title: 'Hashing vs. Encryption vs. Encoding', minutes: 7,
    summary: 'Three ideas people mix up constantly, and when each one is the right tool.',
    sections: [
      { heading: 'Encoding: changing the format', paragraphs: [
        'Encoding (like Base64) rewrites data in a different format so it can travel safely through text-only systems. There’s no key and no secret: anyone can decode it instantly. It never protects anything.',
      ] },
      { heading: 'Encryption: locking with a key', paragraphs: [
        'Encryption scrambles data so only someone with the key can unscramble it. It’s two-way by design. AES is the standard symmetric cipher; HTTPS uses encryption to protect data in transit.',
        'Good encryption depends on a strong key and well-tested algorithms. Never invent your own encryption scheme.',
      ] },
      { heading: 'Hashing: a one-way fingerprint', paragraphs: [
        'A hash function turns any input into a fixed-length fingerprint. The same input always gives the same hash, and you can’t reverse it. Change one character and the whole hash changes.',
        'Uses: checking downloads weren’t altered (compare SHA-256 hashes) and storing passwords. Sites should store password hashes made with slow, salted algorithms like Argon2 or bcrypt, never the passwords themselves.',
      ] },
    ],
    keyTerms: [
      { term: 'Encoding', definition: 'Changing data’s format (like Base64). Reversible by anyone; provides no security.' },
      { term: 'Encryption', definition: 'Scrambling data so only someone with the key can read it. Two-way.' },
      { term: 'Hash', definition: 'A fixed-length, one-way fingerprint of data. Can’t be reversed.' },
      { term: 'Salt', definition: 'Random data added to a password before hashing so identical passwords get different hashes.' },
    ],
    quiz: [
      { id: 'q1', question: 'A website stores passwords as Base64. Is that secure?', options: ['Yes, Base64 is encryption', 'No, Base64 is encoding and anyone can decode it', 'Yes, if the site uses HTTPS', 'Only for short passwords'], answer: 1, explanation: 'Base64 is just a format change with no key. Anyone who gets the database can decode every password instantly.' },
      { id: 'q2', question: 'How should a site store passwords?', options: ['Encrypted with AES', 'As plain text in a secure folder', 'As salted hashes from a slow algorithm like bcrypt or Argon2', 'Encoded with Base64'], answer: 2, explanation: 'Hashes can’t be reversed, salts stop precomputed attacks, and slow algorithms make each guess expensive. Encrypted passwords can be decrypted if the key leaks.' },
      { id: 'q3', question: 'You download an installer and its SHA-256 doesn’t match the publisher’s. What does that mean?', options: ['The file is fine; hashes often differ', 'The file is different from what the publisher hashed. Don’t run it', 'Your internet is slow', 'You need to encrypt it first'], answer: 1, explanation: 'Even a one-byte change gives a completely different hash. A mismatch means corrupted, a different version, or tampered with.' },
      { id: 'q4', question: 'Which can be reversed by someone who has the key?', options: ['Hashing', 'Encryption', 'Both', 'Neither'], answer: 1, explanation: 'Encryption is designed to be reversed with the key. Hashing is one-way: you can only check data against a hash.' },
    ],
    tryTools: ['hash-generator', 'base64', 'encryption', 'file-hash'],
  },
];

export const LESSON_IDS = new Set(LESSONS.map((l) => l.id));
export const findLesson = (id: string) => LESSONS.find((l) => l.id === id);
export const lessonsIn = (path: PathId) => LESSONS.filter((l) => l.path === path);
