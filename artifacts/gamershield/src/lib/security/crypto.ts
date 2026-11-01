// ---------------------------------------------------------------
// CRYPTOGRAPHY TOOLS
// Hashing, Base64, and AES-GCM encryption, all built on the browser's
// Web Crypto API (crypto.subtle). No custom cryptography: these are the
// same audited primitives browsers use for HTTPS.
// Everything runs on this device. Nothing is sent or stored.
// ---------------------------------------------------------------

export const HASH_ALGORITHMS = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1'] as const;
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

/** Hex length of each algorithm's output, used to guess an algorithm from a pasted hash. */
export const HASH_HEX_LENGTH: Record<HashAlgorithm, number> = { 'SHA-1': 40, 'SHA-256': 64, 'SHA-384': 96, 'SHA-512': 128 };

const toHex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('');

export async function hashBytes(algorithm: HashAlgorithm, data: ArrayBuffer | Uint8Array): Promise<string> {
  return toHex(await crypto.subtle.digest(algorithm, data as BufferSource));
}

/** Hash text as UTF-8 bytes, which is what tools like sha256sum do with a text file. */
export function hashText(algorithm: HashAlgorithm, text: string): Promise<string> {
  return hashBytes(algorithm, new TextEncoder().encode(text));
}

/** Clean up a pasted hash: trim, drop spaces and a leading "sha256:"-style label, lowercase. */
export function normalizeHash(input: string): string {
  return input.trim().replace(/^[a-z0-9-]+:/i, '').replace(/\s+/g, '').toLowerCase();
}

export function guessAlgorithm(hash: string): HashAlgorithm | null {
  const clean = normalizeHash(hash);
  if (!/^[0-9a-f]+$/.test(clean)) return null;
  return HASH_ALGORITHMS.find((a) => HASH_HEX_LENGTH[a] === clean.length) ?? null;
}

/**
 * Compare two hashes. Every character is checked even after a mismatch
 * (a constant-time habit; for public file checksums timing doesn't matter,
 * but it's the right pattern to learn).
 */
export function hashesMatch(a: string, b: string): boolean {
  const x = normalizeHash(a);
  const y = normalizeHash(b);
  if (x.length !== y.length || !x.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

// ---------------------------------------------------------------
// BASE64 (encoding, NOT encryption: anyone can decode it)
// ---------------------------------------------------------------

export function base64Encode(text: string, urlSafe = false): string {
  // TextEncoder first, so emoji and accented letters work (plain btoa() only handles Latin-1).
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const encoded = btoa(binary);
  return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded;
}

export type Base64Error = 'empty' | 'invalid-characters' | 'invalid-length' | 'not-text';
export type Base64Result = { ok: true; text: string } | { ok: false; error: Base64Error; detail?: string };

export function base64Decode(input: string): Base64Result {
  const compact = input.replace(/\s+/g, '');
  if (!compact) return { ok: false, error: 'empty' };
  const bad = compact.match(/[^A-Za-z0-9+/=_-]/);
  if (bad) return { ok: false, error: 'invalid-characters', detail: bad[0] };
  // Accept URL-safe Base64 and missing padding, then validate the shape.
  let standard = compact.replace(/-/g, '+').replace(/_/g, '/');
  if (/=[^=]/.test(standard) || (standard.match(/=/g)?.length ?? 0) > 2) return { ok: false, error: 'invalid-characters', detail: '=' };
  standard = standard.replace(/=+$/, '');
  if (standard.length % 4 === 1) return { ok: false, error: 'invalid-length' };
  standard += '='.repeat((4 - (standard.length % 4)) % 4);
  let binary: string;
  try {
    binary = atob(standard);
  } catch {
    return { ok: false, error: 'invalid-length' };
  }
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  try {
    // fatal: true refuses to guess, so binary data is reported instead of shown as garbage.
    return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, error: 'not-text' };
  }
}

// ---------------------------------------------------------------
// AES-GCM ENCRYPTION WITH A PASSPHRASE
//
// 1. A random 16-byte salt and the passphrase go through PBKDF2-SHA-256
//    (600,000 iterations, the OWASP recommendation) to make a 256-bit key.
//    The salt stops precomputed attacks; the iterations slow down guessing.
// 2. AES-256-GCM encrypts the text with a random 12-byte IV. GCM also
//    authenticates: any change to the ciphertext makes decryption fail.
// 3. Output: "SNTX1." + Base64(salt | iv | ciphertext+tag). The salt and IV
//    aren't secret; they just have to travel with the ciphertext.
// ---------------------------------------------------------------

export const ENCRYPTION_PREFIX = 'SNTX1.';
export const DEFAULT_PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false, // the key can't be exported out of Web Crypto
    ['encrypt', 'decrypt'],
  );
}

export async function encryptText(plaintext: string, passphrase: string, iterations = DEFAULT_PBKDF2_ITERATIONS): Promise<string> {
  if (!passphrase) throw new Error('A passphrase is required.');
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt, iterations);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext)));
  const packed = new Uint8Array(SALT_BYTES + IV_BYTES + ciphertext.length);
  packed.set(salt, 0);
  packed.set(iv, SALT_BYTES);
  packed.set(ciphertext, SALT_BYTES + IV_BYTES);
  return ENCRYPTION_PREFIX + bytesToBase64(packed);
}

export type DecryptError = 'not-sentrix-format' | 'damaged' | 'wrong-passphrase-or-tampered';
export type DecryptResult = { ok: true; text: string } | { ok: false; error: DecryptError };

export async function decryptText(packedText: string, passphrase: string, iterations = DEFAULT_PBKDF2_ITERATIONS): Promise<DecryptResult> {
  const trimmed = packedText.trim();
  if (!trimmed.startsWith(ENCRYPTION_PREFIX)) return { ok: false, error: 'not-sentrix-format' };
  let packed: Uint8Array;
  try {
    packed = Uint8Array.from(atob(trimmed.slice(ENCRYPTION_PREFIX.length)), (c) => c.charCodeAt(0));
  } catch {
    return { ok: false, error: 'damaged' };
  }
  // Salt + IV + at least the 16-byte authentication tag.
  if (packed.length < SALT_BYTES + IV_BYTES + 16) return { ok: false, error: 'damaged' };
  const salt = packed.slice(0, SALT_BYTES);
  const iv = packed.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const ciphertext = packed.slice(SALT_BYTES + IV_BYTES);
  try {
    const key = await deriveKey(passphrase, salt, iterations);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return { ok: true, text: new TextDecoder().decode(plain) };
  } catch {
    // GCM can't tell a wrong passphrase from tampering: both fail authentication.
    return { ok: false, error: 'wrong-passphrase-or-tampered' };
  }
}
