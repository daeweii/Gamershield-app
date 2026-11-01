// Tests for the cryptography tools and URL dissection.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ENCRYPTION_PREFIX, base64Decode, base64Encode, decryptText, encryptText,
  guessAlgorithm, hashBytes, hashText, hashesMatch, normalizeHash,
} from './crypto.ts';
import { dissectUrl } from './urlParts.ts';

// Fast iteration count for tests only; the app uses 600,000.
const FAST = 1_000;

// ---------------- hashing ----------------

test('hashes match published test vectors', async () => {
  // FIPS 180 / NIST examples for "abc"
  assert.equal(await hashText('SHA-256', 'abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(await hashText('SHA-1', 'abc'), 'a9993e364706816aba3e25717850c26c9cd0d89d');
  assert.equal((await hashText('SHA-512', 'abc')).slice(0, 16), 'ddaf35a193617aba');
  assert.equal(await hashText('SHA-256', ''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

test('text is hashed as UTF-8, and bytes hash the same as equal text', async () => {
  assert.equal(await hashText('SHA-256', 'é'), await hashBytes('SHA-256', new Uint8Array([0xc3, 0xa9])));
  assert.notEqual(await hashText('SHA-256', 'abc'), await hashText('SHA-256', 'abc '));
});

test('pasted hashes are normalized, guessed, and compared', () => {
  const h = 'BA7816BF 8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD';
  assert.equal(normalizeHash(`sha256:${h}`), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(guessAlgorithm(h), 'SHA-256');
  assert.equal(guessAlgorithm('a'.repeat(40)), 'SHA-1');
  assert.equal(guessAlgorithm('xyz'), null);
  assert.ok(hashesMatch(h, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'));
  assert.ok(!hashesMatch(h, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ae'));
  assert.ok(!hashesMatch('', ''));
  assert.ok(!hashesMatch('abc', 'abcd'));
});

// ---------------- Base64 ----------------

test('Base64 round-trips text, including emoji', () => {
  for (const text of ['hello', 'Sentrix 🔐 ñ', '', 'a'.repeat(1000)]) {
    if (!text) continue;
    const decoded = base64Decode(base64Encode(text));
    assert.ok(decoded.ok && decoded.text === text, text);
  }
  assert.equal(base64Encode('hello'), 'aGVsbG8=');
  assert.equal(base64Encode('??>', true), 'Pz8-');
});

test('Base64 decoding accepts URL-safe and unpadded input', () => {
  assert.deepEqual(base64Decode('aGVsbG8'), { ok: true, text: 'hello' });
  assert.deepEqual(base64Decode('Pz8-'), { ok: true, text: '??>' });
  assert.deepEqual(base64Decode(' aGVs\nbG8= '), { ok: true, text: 'hello' });
});

test('Base64 decoding explains bad input', () => {
  assert.deepEqual(base64Decode('   '), { ok: false, error: 'empty' });
  assert.deepEqual(base64Decode('abc$'), { ok: false, error: 'invalid-characters', detail: '$' });
  assert.equal((base64Decode('a') as { error: string }).error, 'invalid-length');
  assert.equal((base64Decode('ab=c') as { error: string }).error, 'invalid-characters');
  assert.equal((base64Decode('/w==') as { error: string }).error, 'not-text'); // byte 0xFF isn't valid UTF-8
});

// ---------------- AES-GCM ----------------

test('encryption round-trips and produces a different ciphertext every time', async () => {
  const a = await encryptText('meet at 7 🔒', 'correct horse', FAST);
  const b = await encryptText('meet at 7 🔒', 'correct horse', FAST);
  assert.ok(a.startsWith(ENCRYPTION_PREFIX));
  assert.notEqual(a, b, 'random salt and IV mean identical inputs encrypt differently');
  assert.deepEqual(await decryptText(a, 'correct horse', FAST), { ok: true, text: 'meet at 7 🔒' });
});

test('wrong passphrase and tampering are both rejected', async () => {
  const packed = await encryptText('secret', 'right', FAST);
  assert.deepEqual(await decryptText(packed, 'wrong', FAST), { ok: false, error: 'wrong-passphrase-or-tampered' });
  // Flip one character in the ciphertext body.
  const body = packed.slice(ENCRYPTION_PREFIX.length);
  const i = body.length - 6;
  const tampered = ENCRYPTION_PREFIX + body.slice(0, i) + (body[i] === 'A' ? 'B' : 'A') + body.slice(i + 1);
  assert.deepEqual(await decryptText(tampered, 'right', FAST), { ok: false, error: 'wrong-passphrase-or-tampered' });
});

test('decryption explains malformed input', async () => {
  assert.equal(((await decryptText('hello', 'x', FAST)) as { error: string }).error, 'not-sentrix-format');
  assert.equal(((await decryptText(`${ENCRYPTION_PREFIX}@@@`, 'x', FAST)) as { error: string }).error, 'damaged');
  assert.equal(((await decryptText(`${ENCRYPTION_PREFIX}AAAA`, 'x', FAST)) as { error: string }).error, 'damaged');
  await assert.rejects(encryptText('x', ''));
});

// ---------------- URL dissection ----------------

test('URL dissection finds the real site behind subdomain tricks', () => {
  const parts = dissectUrl('https://discord.com.free-nitro.ru/claim?code=123#top')!;
  assert.equal(parts.registrableDomain, 'free-nitro.ru');
  assert.equal(parts.subdomain, 'discord.com');
  assert.equal(parts.topLevelDomain, 'ru');
  assert.deepEqual(parts.query, [['code', '123']]);
  assert.equal(parts.fragment, 'top');
});

test('URL dissection exposes @ tricks, punycode, IPs, ports, and two-part endings', () => {
  const at = dissectUrl('https://steamcommunity.com@evil.example/login')!;
  assert.equal(at.credentials, 'steamcommunity.com');
  assert.equal(at.hostname, 'evil.example');
  assert.deepEqual(dissectUrl('dіscord.com')!.punycodeLabels.length, 1);
  assert.ok(dissectUrl('http://192.168.1.5:8080/x')!.isIpAddress);
  assert.equal(dissectUrl('http://192.168.1.5:8080/x')!.port, '8080');
  assert.equal(dissectUrl('shop.example.co.uk')!.registrableDomain, 'example.co.uk');
  assert.equal(dissectUrl('not a url'), null);
});
