// ---------------------------------------------------------------
// SCAM LINK CHECKER
// The link is only read as text. It is never opened, fetched, or sent anywhere.
// ---------------------------------------------------------------

export const REAL_SITES: readonly string[] = [
  'discord.com', 'discord.gg', 'discordapp.com', 'steamcommunity.com',
  'steampowered.com', 'playstation.com', 'xbox.com', 'microsoft.com',
  'epicgames.com', 'fortnite.com', 'roblox.com', 'twitch.tv',
  'riotgames.com', 'ea.com',
];

const BRAND_NAMES = ['discord', 'steam', 'playstation', 'xbox', 'epic', 'fortnite', 'roblox', 'nitro', 'robux'];

const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'rb.gy', 'cutt.ly', 'is.gd'];

const RISKY_ENDINGS = ['.ru', '.xyz', '.tk', '.top', '.gift', '.click', '.zip', '.cf', '.ga'];

const SCAM_WORDS = ['free', 'nitro', 'gift', 'giveaway', 'claim', 'verify', 'login',
  'skins', 'vbucks', 'robux'];

// The longest a real domain name can be (DNS rule).
const MAX_DOMAIN_LENGTH = 253;

/**
 * How alike two strings are, from 0 (nothing shared) to 1 (identical).
 *
 * Same algorithm as Python's difflib.SequenceMatcher.ratio() (Ratcliff/Obershelp):
 * find the longest shared chunk, then repeat on the pieces to its left and
 * right. ratio = 2 x matched characters / total length.
 */
export function similarity(a: string, b: string): number {
  if (!a.length && !b.length) return 1;
  return (2 * matchingCharacters(a, b)) / (a.length + b.length);
}

function matchingCharacters(a: string, b: string): number {
  let best = 0;
  let startA = 0;
  let startB = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      let k = 0;
      while (i + k < a.length && j + k < b.length && a[i + k] === b[j + k]) k++;
      if (k > best) [best, startA, startB] = [k, i, j];
    }
  }
  if (best === 0) return 0;
  return best
    + matchingCharacters(a.slice(0, startA), b.slice(0, startB))
    + matchingCharacters(a.slice(startA + best), b.slice(startB + best));
}

/** Look for red flags in a link. Returns a list of warnings; an empty list means it's an official site. */
export function checkLink(input: string): string[] {
  let link = input.trim();
  const typedScheme = link.includes('://');
  if (!typedScheme) link = `https://${link}`;

  // The browser's URL parser does the job of Python's urlparse. Bonus: it turns
  // look-alike Unicode letters into "punycode" (xn--...), exposing homograph
  // tricks like a Cyrillic "і" in "dіscord.com".
  let parsed: URL;
  try {
    parsed = new URL(link);
  } catch {
    return ['That doesn’t look like a real link.'];
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return ['That’s not a normal web link. Don’t open it.'];
  }

  let domain = parsed.hostname.toLowerCase();
  if (domain.startsWith('www.')) domain = domain.slice(4);
  const isIPv6 = domain.startsWith('[');
  if (!domain || (!domain.includes('.') && !isIPv6)) {
    return ['That doesn’t look like a real link.'];
  }
  if (domain.length > MAX_DOMAIN_LENGTH) {
    return ['That’s too long to be a real website name.'];
  }

  // Exact match to a real site (or one of its subdomains) is good news.
  // Checking "." + real matters: plain endsWith('discord.com') would also
  // accept evildiscord.com.
  if (REAL_SITES.some((real) => domain === real || domain.endsWith(`.${real}`))) {
    return [];
  }

  const warnings: string[] = [];

  // Look-alike letters from another alphabet (the Python version missed these)
  if (domain.split('.').some((part) => part.startsWith('xn--'))) {
    warnings.push('Uses look-alike letters from another alphabet to imitate a real name.');
  }

  // Lookalike: very close to a real site but not the same (steamcommunlty.com)
  const lookalike = REAL_SITES.find((real) => similarity(domain, real) >= 0.8);
  if (lookalike) {
    warnings.push(`Looks like a FAKE copy of ${lookalike}. Real sites never misspell their own name.`);
  } else {
    // Real brand name hidden inside a different site (discord-nitro-gift.xyz)
    const brand = BRAND_NAMES.find((name) => domain.includes(name));
    if (brand) warnings.push(`Uses the name '${brand}' but it is NOT the official site.`);
  }

  if (SHORTENERS.includes(domain)) {
    warnings.push('It’s a shortened link. You can’t see where it really goes.');
  }
  if (RISKY_ENDINGS.some((ending) => domain.endsWith(ending))) {
    warnings.push('Ends in a domain type scammers use a lot.');
  }
  if (/^[\d.]+$/.test(domain) || isIPv6) {
    warnings.push('It’s a raw IP address instead of a website name. Big red flag.');
  }
  if (typedScheme && parsed.protocol === 'http:') {
    warnings.push('Not secure (http, not https). Never log in on a page like this.');
  }
  if (SCAM_WORDS.some((word) => link.toLowerCase().includes(word))) {
    warnings.push('Contains bait words like ‘free’, ‘gift’, ‘robux’, or ‘verify’.');
  }
  if (link.includes('@')) {
    warnings.push('Has an @ symbol, a trick to hide the real destination.');
  }

  return warnings;
}
