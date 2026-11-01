// Security tip of the day. Everyone sees the same tip on the same (UTC) day.

export interface Tip {
  title: string;
  body: string;
}

export const TIPS: readonly Tip[] = [
  { title: 'Length beats complexity', body: 'A long passphrase is usually stronger and easier to remember than a short password full of symbols. Aim for 15 characters or more.' },
  { title: 'One account, one password', body: 'When one site leaks, attackers try that password everywhere else. A password manager makes unique passwords painless.' },
  { title: 'Protect your email first', body: 'Whoever controls your email can reset almost every other account. Give it your strongest password and 2FA.' },
  { title: 'Prefer an authenticator app', body: 'App-based 2FA codes are harder to steal than text messages, which can be hijacked with SIM swapping.' },
  { title: 'Save your backup codes', body: 'When you turn on 2FA, store the backup codes somewhere safe and offline, so losing your phone doesn’t lock you out.' },
  { title: 'Never share a login code', body: 'No real support agent, friend, or game moderator needs the code sent to your phone. Sharing it hands over your account.' },
  { title: 'Type the address yourself', body: 'Instead of clicking a link in a message, type the site’s address or use a bookmark. Fake login pages can look perfect.' },
  { title: 'Read the whole domain', body: 'The real site is the part right before the first single slash. In discord.com.gift-claim.ru, the real site is gift-claim.ru.' },
  { title: 'Urgency is a red flag', body: '“Act now or lose your account” is a classic pressure trick. Slow down and check through the official app or site.' },
  { title: 'Free currency is bait', body: 'Free Robux, V-Bucks, Nitro, or skins in a DM are almost always scams that steal accounts.' },
  { title: 'Update promptly', body: 'Most attacks use flaws that already have fixes. Turn on automatic updates for your OS, browser, and apps.' },
  { title: 'Check your logged-in devices', body: 'Most platforms list where you’re signed in. Sign out anything you don’t recognize, then change your password.' },
  { title: 'Back up with 3-2-1', body: 'Keep 3 copies of important files, on 2 kinds of storage, with 1 copy offsite or offline. Ransomware can’t encrypt what it can’t reach.' },
  { title: 'Lock your devices', body: 'A screen lock with a PIN or biometric stops anyone who picks up your phone or laptop from walking into your accounts.' },
  { title: 'Hashing isn’t encryption', body: 'Encryption can be reversed with a key. A hash is one-way: you can check data against it, but you can’t turn it back into the data.' },
  { title: 'Base64 hides nothing', body: 'Base64 just re-encodes data as text. Anyone can decode it instantly, so it never protects secrets.' },
  { title: 'Verify downloads', body: 'Compare a file’s SHA-256 hash with the one the publisher lists. A mismatch means the file changed or isn’t the real one.' },
  { title: 'Public Wi-Fi caution', body: 'On public networks, stick to HTTPS sites and avoid signing into sensitive accounts unless you trust the connection.' },
  { title: 'Watch for QR login scams', body: 'Scanning a QR code someone sends you can log them into your account. Only scan login QR codes you started yourself.' },
  { title: 'Least privilege', body: 'Give apps and people only the access they need. When connecting a service, choose “only this repo” or “only these files” when offered.' },
  { title: 'Recovery info matters', body: 'Keep your recovery email and phone current. Old recovery details are a common way people lose accounts for good.' },
  { title: 'Check breached passwords', body: 'If a password appears in a known breach, attackers already have it on their lists. Change it everywhere it was used.' },
  { title: 'Beware look-alike letters', body: 'Attackers use characters from other alphabets to fake names, like a Cyrillic “і” in discord. Browsers may show these as xn-- addresses.' },
  { title: 'Report, don’t engage', body: 'If a message feels off, don’t reply or click. Report it on the platform and warn friends if it came from a hacked account.' },
];

/** The tip for a date: the day number since 1970 (UTC), wrapped around the list. */
export function tipForDate(date: Date): Tip {
  const day = Math.floor(date.getTime() / 86_400_000);
  return TIPS[((day % TIPS.length) + TIPS.length) % TIPS.length];
}
