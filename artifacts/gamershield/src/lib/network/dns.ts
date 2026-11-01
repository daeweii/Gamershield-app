// ---------------------------------------------------------------
// DNS LOOKUP via Cloudflare DNS-over-HTTPS (JSON API)
//
// Browsers can't send raw DNS packets, so lookups go over HTTPS to
// cloudflare-dns.com. Cloudflare sees the domain being looked up and the
// visitor's IP address; nothing else is sent. A lookup only happens when the
// user presses the button. Docs: developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/
// ---------------------------------------------------------------

export const DOH_ENDPOINT = 'https://cloudflare-dns.com/dns-query';

export const RECORD_TYPES = {
  A: 1, AAAA: 28, CNAME: 5, MX: 15, TXT: 16, NS: 2, SOA: 6, CAA: 257,
} as const;
export type RecordType = keyof typeof RECORD_TYPES;
export const RECORD_TYPE_NAMES = Object.keys(RECORD_TYPES) as RecordType[];

const TYPE_BY_NUMBER = new Map<number, string>(Object.entries(RECORD_TYPES).map(([name, n]) => [n, name]));

// DNS response codes (RCODE) the JSON API reports in "Status".
const STATUS: Record<number, string> = {
  0: 'NOERROR', 1: 'FORMERR', 2: 'SERVFAIL', 3: 'NXDOMAIN', 4: 'NOTIMP', 5: 'REFUSED',
};

export type DomainCheck = { ok: true; domain: string } | { ok: false; error: 'empty' | 'invalid' | 'ip-address' };

/**
 * Accept "example.com", "https://www.example.com/path", or an internationalized
 * name, and return just the hostname in ASCII (punycode) form.
 */
export function normalizeDomain(input: string): DomainCheck {
  const raw = input.trim();
  if (!raw) return { ok: false, error: 'empty' };
  let host: string;
  try {
    host = new URL(raw.includes('://') ? raw : `https://${raw}`).hostname;
  } catch {
    return { ok: false, error: 'invalid' };
  }
  host = host.replace(/\.$/, '').toLowerCase();
  if (/^[\d.]+$/.test(host) || host.startsWith('[')) return { ok: false, error: 'ip-address' };
  const labels = host.split('.');
  const validLabel = (l: string) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(l) || /^_[a-z0-9-]{1,62}$/.test(l);
  if (host.length > 253 || labels.length < 2 || !labels.every(validLabel)) return { ok: false, error: 'invalid' };
  return { ok: true, domain: host };
}

export function buildDohUrl(domain: string, type: RecordType): string {
  return `${DOH_ENDPOINT}?name=${encodeURIComponent(domain)}&type=${type}`;
}

export interface DnsAnswer {
  name: string;
  type: string;
  ttl: number;
  data: string;
}

export interface DnsResult {
  status: string;
  /** True when the resolver validated DNSSEC signatures. */
  dnssecValidated: boolean;
  answers: DnsAnswer[];
}

/** Parse Cloudflare's application/dns-json response, defensively. */
export function parseDohResponse(json: unknown): DnsResult {
  const body = (json && typeof json === 'object' ? json : {}) as Record<string, unknown>;
  const answers = Array.isArray(body.Answer) ? body.Answer : [];
  return {
    status: STATUS[Number(body.Status)] ?? `RCODE ${String(body.Status)}`,
    dnssecValidated: body.AD === true,
    answers: answers
      .filter((a): a is Record<string, unknown> => !!a && typeof a === 'object')
      .map((a) => ({
        name: String(a.name ?? '').replace(/\.$/, ''),
        type: TYPE_BY_NUMBER.get(Number(a.type)) ?? `TYPE${String(a.type)}`,
        ttl: Number(a.TTL) || 0,
        data: String(a.data ?? ''),
      })),
  };
}

export async function lookupDns(domain: string, type: RecordType, fetchImpl: typeof fetch = fetch): Promise<DnsResult> {
  const response = await fetchImpl(buildDohUrl(domain, type), {
    headers: { accept: 'application/dns-json' },
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  });
  if (!response.ok) throw new Error(`DNS service replied ${response.status}`);
  return parseDohResponse(await response.json());
}

// ---------------------------------------------------------------
// "Show my public IP" via api.ipify.org (opt-in)
// Returns only the IP address: no location, no account, no tracking ID.
// ---------------------------------------------------------------

export const MY_IP_ENDPOINT = 'https://api.ipify.org?format=json';

export async function fetchMyPublicIp(fetchImpl: typeof fetch = fetch): Promise<string> {
  const response = await fetchImpl(MY_IP_ENDPOINT, { credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
  if (!response.ok) throw new Error(`IP service replied ${response.status}`);
  const body = (await response.json()) as { ip?: unknown };
  if (typeof body.ip !== 'string') throw new Error('Unexpected response');
  return body.ip;
}
