// Long-form guides. Original writing for Sentrix, aligned with NIST SP 800-63B
// (passwords) and common file-safety practice.

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const PASSWORD_GUIDE: readonly GuideSection[] = [
  {
    heading: 'What makes a password strong',
    paragraphs: ['Strength is about how many guesses an attacker needs. Length matters most: every extra character multiplies the possibilities. Current NIST guidance asks sites to require at least 15 characters when a password is the only login step, to allow at least 64, and to stop forcing mixes of symbols and numbers.'],
    bullets: [
      'Aim for 15+ characters, or a passphrase of 5–6 random words.',
      'Random beats clever. “P@ssw0rd!” follows patterns every cracking tool knows.',
      'Avoid names, birthdays, teams, games, and keyboard patterns like qwerty.',
    ],
  },
  {
    heading: 'Why password reuse is the biggest risk',
    paragraphs: ['Sites get breached all the time, and their password lists end up for sale. Attackers then try those email-and-password pairs on every other site. This is called credential stuffing, and it’s how most gaming and email accounts are taken over.'],
    bullets: [
      'Use a different password for every account that matters.',
      'If one site is breached, only that account is at risk.',
      'Check old passwords with the Password Strength Checker’s breach lookup.',
    ],
  },
  {
    heading: 'Multifactor authentication (MFA)',
    paragraphs: ['MFA means a login needs two kinds of proof: something you know (password) plus something you have (phone or security key) or are (fingerprint). A stolen password alone is no longer enough.'],
    bullets: [
      'Best: a hardware security key or passkey. Phishing can’t steal these.',
      'Very good: an authenticator app (codes change every 30 seconds).',
      'OK: text messages. Better than nothing, but SIM-swap attacks can intercept them.',
      'Never share an MFA code. Real support staff never ask for it.',
      'Save your backup codes offline in case you lose your phone.',
    ],
  },
  {
    heading: 'Password managers',
    paragraphs: ['A password manager remembers a unique, random password for every site, so you only remember one strong master password. It also protects against phishing: it won’t autofill on a fake site, because the domain doesn’t match.'],
    bullets: [
      'Reputable options include Bitwarden (free, open source), 1Password, and the managers built into Apple, Google, and Microsoft accounts.',
      'Make the master password a long passphrase, and turn on MFA for the manager itself.',
      'Start with your most important accounts: email, banking, then gaming and social.',
    ],
  },
  {
    heading: 'Passkeys: the future of logging in',
    paragraphs: ['Passkeys replace passwords with a cryptographic key pair stored on your device. The site only ever gets the public half, so there’s nothing to leak or phish. Many big platforms already support them; turn them on where you can.'],
  },
];

export const FILE_SAFETY_GUIDE: readonly GuideSection[] = [
  {
    heading: 'Why files are dangerous',
    paragraphs: ['Opening a file can run code. Malware often arrives as an attachment, a “free” game mod or cheat, a cracked program, or a file sent by a friend whose account was hacked.'],
  },
  {
    heading: 'Read the real file extension',
    paragraphs: ['The extension (the part after the last dot) decides what opens the file. Windows hides known extensions by default, so “invoice.pdf.exe” can appear as “invoice.pdf”. Turn on File name extensions in File Explorer’s View menu.'],
    bullets: [
      'Run code: .exe, .msi, .bat, .cmd, .ps1, .vbs, .js, .jar, .scr, .com, .lnk, .hta',
      'Can contain macros or scripts: .docm, .xlsm, .pptm, .html, .svg',
      'Containers that hide what’s inside: .zip, .rar, .7z, .iso, .img',
      'Usually safer: .txt, .png, .jpg, .mp3, .mp4, and .pdf opened in an up-to-date reader',
      'Double extensions like photo.jpg.exe are a classic trick. Trust the last one.',
    ],
  },
  {
    heading: 'Safe handling habits',
    bullets: [
      'Download software only from the official site or app store.',
      'Be suspicious of any file you didn’t ask for, even from a friend. Confirm with them another way.',
      'Never enable macros in a document someone sent you.',
      'Keep your antivirus (like Microsoft Defender) on and updated, and scan downloads before opening.',
      'Game cheats, “free Robux” tools, and cracked software are the most common way gamers get infected.',
    ],
  },
  {
    heading: 'Verify downloads with a hash',
    paragraphs: ['Many publishers list a SHA-256 hash next to their download. The hash is like a fingerprint: if even one byte of the file changes, the hash changes completely. Use the File Hash Checker to compare. A match proves you have the exact file the publisher hashed; a mismatch means don’t open it.'],
    bullets: [
      'Get the expected hash from the official site over HTTPS, not from the same mirror you downloaded from.',
      'A matching hash proves the file wasn’t changed. It doesn’t prove the publisher is trustworthy.',
      'Signed installers (a verified publisher in Windows’ prompt) add a second layer of proof.',
    ],
  },
];

/** Fictional scam messages for practicing with the Scam Message Checker. */
export const SAMPLE_MESSAGES: readonly { label: string; text: string }[] = [
  { label: 'Accidental report', text: 'yo sorry i accidentally reported your account, staff said you have to verify your account or it gets banned in 24h. add the mod Discord_Safety#0001 and send me your login code so they can fix it' },
  { label: 'Free Nitro', text: 'Discord is giving away free nitro for 3 months!! claim it here before it runs out: dlscord-gift.xyz/claim' },
  { label: 'Steam gift', text: 'Hey man I sent you a steam gift by mistake, can you log in here and send it back? steamcommunlty.com/tradeoffer' },
  { label: 'Robux generator', text: 'FREE ROBUX GENERATOR working 2026!!! just enter your username and password and get 10,000 robux instantly' },
  { label: 'Normal message', text: 'gg last night, want to run ranked again tomorrow around 7?' },
];
