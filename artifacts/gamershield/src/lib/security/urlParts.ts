// ---------------------------------------------------------------
// URL DISSECTION (for the URL Safety Inspector)
// Splits a link into its parts so people can see which site it really
// goes to. Read as text only: the link is never opened.
//
// "Registrable domain" (the part a person or company actually owns, like
// example.co.uk) is approximated with a short list of common two-part
// endings. The full Public Suffix List has thousands of entries, so the
// UI labels this as a best guess.
// ---------------------------------------------------------------

const TWO_PART_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'me.uk', 'com.au', 'net.au', 'org.au', 'edu.au', 'co.nz', 'org.nz',
  'co.jp', 'ne.jp', 'or.jp', 'com.br', 'com.mx', 'co.in', 'co.za', 'com.cn', 'com.tr', 'com.sg', 'co.kr', 'com.ar',
]);

export interface UrlParts {
  scheme: string;
  /** Text before an "@" in the address. Browsers treat it as a login, not the site. */
  credentials?: string;
  hostname: string;
  isIpAddress: boolean;
  /** Labels that start with xn-- (look-alike letters from another alphabet). */
  punycodeLabels: string[];
  registrableDomain: string;
  subdomain: string;
  topLevelDomain: string;
  port?: string;
  path: string;
  query: [string, string][];
  fragment?: string;
}

export function dissectUrl(input: string): UrlParts | null {
  const raw = input.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.includes('://') ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (!url.hostname) return null;

  const hostname = url.hostname.toLowerCase();
  const isIpAddress = /^[\d.]+$/.test(hostname) || hostname.startsWith('[');
  const labels = hostname.split('.');
  let registrableDomain = hostname;
  let subdomain = '';
  if (!isIpAddress && labels.length >= 2) {
    const lastTwo = labels.slice(-2).join('.');
    const take = TWO_PART_SUFFIXES.has(lastTwo) && labels.length >= 3 ? 3 : 2;
    registrableDomain = labels.slice(-take).join('.');
    subdomain = labels.slice(0, -take).join('.');
  }

  return {
    scheme: url.protocol.replace(/:$/, ''),
    credentials: url.username || url.password ? decodeURIComponent(url.username + (url.password ? `:${url.password}` : '')) : undefined,
    hostname,
    isIpAddress,
    punycodeLabels: labels.filter((l) => l.startsWith('xn--')),
    registrableDomain,
    subdomain,
    topLevelDomain: isIpAddress ? '' : labels[labels.length - 1],
    port: url.port || undefined,
    path: url.pathname,
    query: [...url.searchParams.entries()],
    fragment: url.hash ? url.hash.slice(1) : undefined,
  };
}
