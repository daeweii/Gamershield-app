// Tests for IP analysis, the subnet calculator, and the DNS client.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { analyzeIp, formatIPv6, parseIPv4, parseIPv6 } from './ip.ts';
import { calculateSubnet, maskToPrefix } from './subnet.ts';
import { buildDohUrl, fetchMyPublicIp, lookupDns, normalizeDomain, parseDohResponse } from './dns.ts';

// ---------------- IP parsing and classification ----------------

test('IPv4 parsing is strict', () => {
  assert.deepEqual(parseIPv4('192.168.1.1'), [192, 168, 1, 1]);
  for (const bad of ['256.1.1.1', '1.2.3', '1.2.3.4.5', '01.2.3.4', '1.2.3.a', ' ', '1..2.3']) assert.equal(parseIPv4(bad), null, bad);
});

test('IPv4 addresses are classified by IANA special-purpose ranges', () => {
  const kind = (ip: string) => analyzeIp(ip)?.kind;
  assert.equal(kind('8.8.8.8'), 'public');
  assert.equal(kind('10.0.0.5'), 'private');
  assert.equal(kind('172.16.0.1'), 'private');
  assert.equal(kind('172.32.0.1'), 'public');
  assert.equal(kind('192.168.50.1'), 'private');
  assert.equal(kind('127.0.0.1'), 'loopback');
  assert.equal(kind('169.254.1.1'), 'link-local');
  assert.equal(kind('100.64.0.1'), 'cgnat');
  assert.equal(kind('203.0.113.9'), 'documentation');
  assert.equal(kind('224.0.0.251'), 'multicast');
  assert.equal(kind('255.255.255.255'), 'broadcast');
  assert.equal(kind('0.0.0.0'), 'unspecified');
  assert.equal(analyzeIp('192.168.1.1')!.binary, '11000000.10101000.00000001.00000001');
  assert.equal(analyzeIp('8.8.8.8')!.routable, true);
  assert.equal(analyzeIp('10.0.0.1')!.routable, false);
});

test('IPv6 parses "::", embedded IPv4, and brackets, and formats per RFC 5952', () => {
  assert.deepEqual(parseIPv6('::1'), [0, 0, 0, 0, 0, 0, 0, 1]);
  assert.deepEqual(parseIPv6('::ffff:192.0.2.1'), [0, 0, 0, 0, 0, 0xffff, 0xc000, 0x0201]);
  assert.deepEqual(parseIPv6('[2001:db8::1]'), [0x2001, 0xdb8, 0, 0, 0, 0, 0, 1]);
  assert.equal(formatIPv6(parseIPv6('2001:0DB8:0000:0000:0001:0000:0000:0001')!), '2001:db8::1:0:0:1');
  assert.equal(formatIPv6(parseIPv6('2001:db8:0:1:1:1:1:1')!), '2001:db8:0:1:1:1:1:1');
  for (const bad of ['1::2::3', '12345::', 'gggg::', '1:2:3:4:5:6:7:8:9', ':::', 'fe80::1%eth0']) assert.equal(parseIPv6(bad), null, bad);
});

test('IPv6 addresses are classified', () => {
  const kind = (ip: string) => analyzeIp(ip)?.kind;
  assert.equal(kind('2606:4700:4700::1111'), 'public');
  assert.equal(kind('::1'), 'loopback');
  assert.equal(kind('fe80::1'), 'link-local');
  assert.equal(kind('fd12:3456::1'), 'unique-local');
  assert.equal(kind('ff02::1'), 'multicast');
  assert.equal(kind('2001:db8::5'), 'documentation');
  assert.equal(kind('::ffff:10.0.0.1'), 'ipv4-mapped');
  assert.equal(analyzeIp('2001:db8::1')!.expanded, '2001:0db8:0000:0000:0000:0000:0000:0001');
  assert.equal(analyzeIp('hello'), null);
});

// ---------------- subnet calculator ----------------

test('subnet calculator: a typical /24', () => {
  const r = calculateSubnet('192.168.1.130/24');
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.result.network, '192.168.1.0');
  assert.equal(r.result.broadcast, '192.168.1.255');
  assert.equal(r.result.firstHost, '192.168.1.1');
  assert.equal(r.result.lastHost, '192.168.1.254');
  assert.equal(r.result.usableHosts, 254);
  assert.equal(r.result.mask, '255.255.255.0');
  assert.equal(r.result.wildcard, '0.0.0.255');
  assert.equal(r.result.addressBinarySplit, '110000001010100000000001|10000010');
});

test('subnet calculator: odd prefixes, masks, and edge cases', () => {
  const r26 = calculateSubnet('10.20.30.77', '255.255.255.192');
  assert.ok(r26.ok && r26.result.prefix === 26 && r26.result.network === '10.20.30.64' && r26.result.broadcast === '10.20.30.127' && r26.result.usableHosts === 62);
  const r20 = calculateSubnet('172.16.45.9 /20');
  assert.ok(r20.ok && r20.result.network === '172.16.32.0' && r20.result.broadcast === '172.16.47.255' && r20.result.usableHosts === 4094);
  const r31 = calculateSubnet('10.0.0.0/31');
  assert.ok(r31.ok && r31.result.usableHosts === 2 && r31.result.note === 'point-to-point');
  const r32 = calculateSubnet('10.0.0.9/32');
  assert.ok(r32.ok && r32.result.usableHosts === 1 && r32.result.firstHost === '10.0.0.9');
  const r0 = calculateSubnet('8.8.8.8/0');
  assert.ok(r0.ok && r0.result.network === '0.0.0.0' && r0.result.totalAddresses === 2 ** 32);
});

test('subnet calculator: errors are explained', () => {
  assert.deepEqual(calculateSubnet('300.1.1.1/24'), { ok: false, error: 'bad-address' });
  assert.deepEqual(calculateSubnet('10.0.0.1/33'), { ok: false, error: 'bad-prefix' });
  assert.deepEqual(calculateSubnet('10.0.0.1'), { ok: false, error: 'bad-prefix' });
  assert.deepEqual(calculateSubnet('10.0.0.1', '255.0.255.0'), { ok: false, error: 'non-contiguous-mask' });
  assert.equal(maskToPrefix('255.255.252.0'), 22);
  assert.equal(maskToPrefix('0.0.0.0'), 0);
});

// ---------------- DNS ----------------

test('domains are normalized and validated before any lookup', () => {
  assert.deepEqual(normalizeDomain('https://WWW.Example.com/path?q=1'), { ok: true, domain: 'www.example.com' });
  assert.deepEqual(normalizeDomain('example.com.'), { ok: true, domain: 'example.com' });
  assert.deepEqual(normalizeDomain('_dmarc.example.com'), { ok: true, domain: '_dmarc.example.com' });
  assert.equal((normalizeDomain('bücher.de') as { domain: string }).domain, 'xn--bcher-kva.de');
  assert.deepEqual(normalizeDomain(''), { ok: false, error: 'empty' });
  assert.deepEqual(normalizeDomain('8.8.8.8'), { ok: false, error: 'ip-address' });
  assert.deepEqual(normalizeDomain('localhost'), { ok: false, error: 'invalid' });
  assert.deepEqual(normalizeDomain('bad_domain.com'), { ok: false, error: 'invalid' });
});

test('DoH URL encodes the name and type', () => {
  assert.equal(buildDohUrl('example.com', 'MX'), 'https://cloudflare-dns.com/dns-query?name=example.com&type=MX');
});

test('DoH responses are parsed defensively', () => {
  const parsed = parseDohResponse({ Status: 0, AD: true, Answer: [{ name: 'example.com.', type: 15, TTL: 300, data: '0 .' }, null, 'junk'] });
  assert.deepEqual(parsed, { status: 'NOERROR', dnssecValidated: true, answers: [{ name: 'example.com', type: 'MX', ttl: 300, data: '0 .' }] });
  assert.equal(parseDohResponse({ Status: 3 }).status, 'NXDOMAIN');
  assert.deepEqual(parseDohResponse('garbage').answers, []);
});

test('lookupDns and fetchMyPublicIp send only what they should', async () => {
  let seen = '';
  const fake = (async (url: string, init: RequestInit) => {
    seen = `${url} ${JSON.stringify(init)}`;
    return new Response(JSON.stringify(url.includes('ipify') ? { ip: '203.0.113.7' } : { Status: 0, Answer: [{ name: 'a.com', type: 1, TTL: 60, data: '93.184.216.34' }] }));
  }) as unknown as typeof fetch;
  const result = await lookupDns('a.com', 'A', fake);
  assert.equal(result.answers[0].data, '93.184.216.34');
  assert.ok(seen.includes('"credentials":"omit"') && seen.includes('no-referrer'));
  assert.equal(await fetchMyPublicIp(fake), '203.0.113.7');
  const broken = (async () => new Response('', { status: 500 })) as unknown as typeof fetch;
  await assert.rejects(lookupDns('a.com', 'A', broken));
});
