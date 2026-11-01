// ---------------------------------------------------------------
// IP ADDRESS ANALYSIS (fully local)
// Parses IPv4 and IPv6 and explains what kind of address it is,
// using the IANA special-purpose address registries.
// ---------------------------------------------------------------

export type IpKind =
  | 'public' | 'private' | 'loopback' | 'link-local' | 'multicast' | 'cgnat'
  | 'documentation' | 'unspecified' | 'broadcast' | 'reserved' | 'unique-local' | 'ipv4-mapped';

export interface IpInfo {
  version: 4 | 6;
  /** Canonical text form (IPv6 compressed per RFC 5952). */
  normalized: string;
  kind: IpKind;
  /** The special-purpose range it falls in, e.g. "192.168.0.0/16". */
  range?: string;
  /** IPv4 only: the four octets in binary. */
  binary?: string;
  /** IPv6 only: all eight groups written out in full. */
  expanded?: string;
  /** Whether it can be reached across the public internet. */
  routable: boolean;
}

export function parseIPv4(text: string): number[] | null {
  const parts = text.trim().split('.');
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    // No leading zeros: "010" is ambiguous (some systems read it as octal).
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    octets.push(n);
  }
  return octets;
}

/** Parse IPv6 into 8 sixteen-bit groups. Supports "::" and an embedded IPv4 tail. */
export function parseIPv6(text: string): number[] | null {
  let input = text.trim().toLowerCase();
  if (input.startsWith('[') && input.endsWith(']')) input = input.slice(1, -1);
  if (input.includes('%')) return null; // zone IDs aren't supported
  if (!/^[0-9a-f:.]+$/.test(input) || !input.includes(':')) return null;

  // An IPv4 tail like ::ffff:192.0.2.1 becomes two groups.
  const lastColon = input.lastIndexOf(':');
  const tail = input.slice(lastColon + 1);
  if (tail.includes('.')) {
    const v4 = parseIPv4(tail);
    if (!v4) return null;
    input = `${input.slice(0, lastColon + 1)}${((v4[0] << 8) | v4[1]).toString(16)}:${((v4[2] << 8) | v4[3]).toString(16)}`;
  }

  const halves = input.split('::');
  if (halves.length > 2) return null;
  const toGroups = (s: string) => (s ? s.split(':') : []);
  const head = toGroups(halves[0]);
  const rest = halves.length === 2 ? toGroups(halves[1]) : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 ? head.length !== 8 : missing < 1) return null;
  const all = [...head, ...Array(halves.length === 2 ? missing : 0).fill('0'), ...rest];
  const groups: number[] = [];
  for (const g of all) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    groups.push(parseInt(g, 16));
  }
  return groups.length === 8 ? groups : null;
}

/** RFC 5952 text form: lowercase, leading zeros dropped, longest zero run (2+) as "::". */
export function formatIPv6(groups: number[]): string {
  let bestStart = -1, bestLen = 0;
  for (let i = 0; i < 8;) {
    if (groups[i] !== 0) { i++; continue; }
    let j = i;
    while (j < 8 && groups[j] === 0) j++;
    if (j - i > bestLen && j - i >= 2) { bestStart = i; bestLen = j - i; }
    i = j;
  }
  const hex = groups.map((g) => g.toString(16));
  if (bestStart < 0) return hex.join(':');
  return `${hex.slice(0, bestStart).join(':')}::${hex.slice(bestStart + bestLen).join(':')}`;
}

export const ipv4ToInt = (o: number[]) => ((o[0] << 24) >>> 0) + (o[1] << 16) + (o[2] << 8) + o[3];
export const intToIPv4 = (n: number) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

function inV4(address: number, base: string, prefix: number): boolean {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return ((address & mask) >>> 0) === ((ipv4ToInt(parseIPv4(base)!) & mask) >>> 0);
}

// Order matters: the first matching range wins.
const V4_RANGES: { base: string; prefix: number; kind: IpKind }[] = [
  { base: '0.0.0.0', prefix: 32, kind: 'unspecified' },
  { base: '255.255.255.255', prefix: 32, kind: 'broadcast' },
  { base: '0.0.0.0', prefix: 8, kind: 'reserved' },
  { base: '10.0.0.0', prefix: 8, kind: 'private' },
  { base: '100.64.0.0', prefix: 10, kind: 'cgnat' },
  { base: '127.0.0.0', prefix: 8, kind: 'loopback' },
  { base: '169.254.0.0', prefix: 16, kind: 'link-local' },
  { base: '172.16.0.0', prefix: 12, kind: 'private' },
  { base: '192.0.2.0', prefix: 24, kind: 'documentation' },
  { base: '192.168.0.0', prefix: 16, kind: 'private' },
  { base: '198.18.0.0', prefix: 15, kind: 'reserved' },
  { base: '198.51.100.0', prefix: 24, kind: 'documentation' },
  { base: '203.0.113.0', prefix: 24, kind: 'documentation' },
  { base: '224.0.0.0', prefix: 4, kind: 'multicast' },
  { base: '240.0.0.0', prefix: 4, kind: 'reserved' },
];

function classifyV4(octets: number[]): IpInfo {
  const n = ipv4ToInt(octets);
  const match = V4_RANGES.find((r) => inV4(n, r.base, r.prefix));
  const kind = match?.kind ?? 'public';
  return {
    version: 4,
    normalized: octets.join('.'),
    kind,
    range: match ? `${match.base}/${match.prefix}` : undefined,
    binary: octets.map((o) => o.toString(2).padStart(8, '0')).join('.'),
    routable: kind === 'public',
  };
}

function classifyV6(groups: number[]): IpInfo {
  const normalized = formatIPv6(groups);
  const expanded = groups.map((g) => g.toString(16).padStart(4, '0')).join(':');
  const base = { version: 6 as const, normalized, expanded };
  const allZeroUntil = (n: number) => groups.slice(0, n).every((g) => g === 0);
  if (groups.every((g) => g === 0)) return { ...base, kind: 'unspecified', range: '::/128', routable: false };
  if (allZeroUntil(7) && groups[7] === 1) return { ...base, kind: 'loopback', range: '::1/128', routable: false };
  if (allZeroUntil(5) && groups[5] === 0xffff) return { ...base, kind: 'ipv4-mapped', range: '::ffff:0:0/96', routable: false };
  if ((groups[0] & 0xffc0) === 0xfe80) return { ...base, kind: 'link-local', range: 'fe80::/10', routable: false };
  if ((groups[0] & 0xfe00) === 0xfc00) return { ...base, kind: 'unique-local', range: 'fc00::/7', routable: false };
  if ((groups[0] & 0xff00) === 0xff00) return { ...base, kind: 'multicast', range: 'ff00::/8', routable: false };
  if (groups[0] === 0x2001 && groups[1] === 0x0db8) return { ...base, kind: 'documentation', range: '2001:db8::/32', routable: false };
  if ((groups[0] & 0xe000) === 0x2000) return { ...base, kind: 'public', routable: true };
  return { ...base, kind: 'reserved', routable: false };
}

export function analyzeIp(text: string): IpInfo | null {
  const v4 = parseIPv4(text);
  if (v4) return classifyV4(v4);
  const v6 = parseIPv6(text);
  return v6 ? classifyV6(v6) : null;
}
