// ---------------------------------------------------------------
// IPv4 SUBNET CALCULATOR (fully local)
// ---------------------------------------------------------------

import { intToIPv4, ipv4ToInt, parseIPv4 } from './ip.ts';

export interface SubnetResult {
  address: string;
  prefix: number;
  mask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  totalAddresses: number;
  usableHosts: number;
  /** The mask in binary, e.g. 11111111.11111111.11111111.00000000 */
  maskBinary: string;
  /** The address in binary with a "|" where the network part ends. */
  addressBinarySplit: string;
  note?: 'point-to-point' | 'single-host';
}

export type SubnetError = 'bad-address' | 'bad-prefix' | 'bad-mask' | 'non-contiguous-mask';
export type SubnetParse = { ok: true; result: SubnetResult } | { ok: false; error: SubnetError };

const toBinary = (n: number) => [24, 16, 8, 0].map((s) => ((n >>> s) & 255).toString(2).padStart(8, '0')).join('.');
const prefixToMask = (prefix: number) => (prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0);

/** Turn "255.255.255.0" into 24. Rejects masks with gaps like 255.0.255.0. */
export function maskToPrefix(mask: string): number | 'bad-mask' | 'non-contiguous-mask' {
  const octets = parseIPv4(mask);
  if (!octets) return 'bad-mask';
  const n = ipv4ToInt(octets);
  const inverted = (~n) >>> 0;
  // A valid mask is ones then zeros, so its inverse + 1 is a power of two.
  if ((inverted & (inverted + 1)) !== 0) return 'non-contiguous-mask';
  return 32 - Math.log2(inverted + 1);
}

/**
 * Accepts "192.168.1.10/24", "192.168.1.10 255.255.255.0", or an address
 * plus a separate prefix or mask.
 */
export function calculateSubnet(addressInput: string, prefixOrMask?: string): SubnetParse {
  let address = addressInput.trim();
  let suffix = prefixOrMask?.trim() ?? '';
  const inline = address.match(/^(\S+?)\s*(?:\/|\s)\s*(\S+)$/);
  if (inline && !suffix) [, address, suffix] = inline;
  suffix = suffix.replace(/^\//, '');

  const octets = parseIPv4(address);
  if (!octets) return { ok: false, error: 'bad-address' };

  let prefix: number;
  if (/^\d{1,2}$/.test(suffix)) {
    prefix = Number(suffix);
    if (prefix > 32) return { ok: false, error: 'bad-prefix' };
  } else if (suffix.includes('.')) {
    const parsed = maskToPrefix(suffix);
    if (typeof parsed !== 'number') return { ok: false, error: parsed };
    prefix = parsed;
  } else {
    return { ok: false, error: 'bad-prefix' };
  }

  const ip = ipv4ToInt(octets);
  const mask = prefixToMask(prefix);
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - prefix);

  // /31 (RFC 3021) links use both addresses; /32 is a single host.
  let first = network + 1, last = broadcast - 1, usable = total - 2;
  let note: SubnetResult['note'];
  if (prefix === 31) { first = network; last = broadcast; usable = 2; note = 'point-to-point'; }
  if (prefix === 32) { first = network; last = network; usable = 1; note = 'single-host'; }

  const bits = toBinary(ip).replace(/\./g, '');
  const split = `${bits.slice(0, prefix)}|${bits.slice(prefix)}`;

  return {
    ok: true,
    result: {
      address: octets.join('.'),
      prefix,
      mask: intToIPv4(mask),
      wildcard: intToIPv4((~mask) >>> 0),
      network: intToIPv4(network),
      broadcast: intToIPv4(broadcast),
      firstHost: intToIPv4(first),
      lastHost: intToIPv4(last),
      totalAddresses: total,
      usableHosts: usable,
      maskBinary: toBinary(mask),
      addressBinarySplit: split,
      note,
    },
  };
}
