// Tests for the security logic. Run with: pnpm --filter @workspace/gamershield run test
// Uses Node's built-in test runner, so no extra packages are needed.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CHECKUP_QUESTIONS, PLATFORMS, TWO_FA_GUIDES,
  checkLink, checkMessage, describeBits, generatePassphrase, generatePassword,
  passphraseBits, passwordBits, scoreCheckup, similarity,
} from './index.ts';
import { WORDS } from './wordlist.ts';
import {
  AMBIGUOUS_CHARACTERS, CHARACTER_SETS, DEFAULT_SETTINGS, PRESETS,
  applyPreset, estimateStrength, findProblems, formatForCopy, generateBatch, isValidEnvName, sanitizeSettings,
  type GeneratorSettings,
} from './passwordRules.ts';

// ---------------- generator ----------------

test('generated passwords have the right length and every character type', () => {
  for (let i = 0; i < 200; i++) {
    const password = generatePassword();
    assert.equal(password.length, 16);
    assert.match(password, /[a-z]/);
    assert.match(password, /[A-Z]/);
    assert.match(password, /[0-9]/);
    assert.match(password, /[!@#$%^&*]/);
    assert.match(password, /^[A-Za-z0-9!@#$%^&*]+$/);
  }
});

test('generated passwords do not repeat', () => {
  const seen = new Set(Array.from({ length: 1000 }, () => generatePassword()));
  assert.equal(seen.size, 1000);
});

test('generatePassword rejects lengths too short to fit every character type', () => {
  assert.throws(() => generatePassword(3), RangeError);
  assert.throws(() => generatePassword(10.5), RangeError);
});

test('passphrases use distinct words from the list plus a 2-digit number', () => {
  const lowerWords = new Set(WORDS);
  for (let i = 0; i < 200; i++) {
    const parts = generatePassphrase().split('-');
    assert.equal(parts.length, 7);
    const number = Number(parts.pop());
    assert.ok(number >= 10 && number <= 99);
    assert.equal(new Set(parts).size, 6, 'words should not repeat');
    for (const word of parts) {
      assert.ok(lowerWords.has(word.toLowerCase()), `${word} is not in the word list`);
      assert.equal(word[0], word[0].toUpperCase());
    }
  }
});

test('word list has no duplicates', () => {
  assert.equal(new Set(WORDS).size, WORDS.length);
});

test('entropy: passphrases reach about 60 bits, random passwords about 98', () => {
  assert.ok(passphraseBits() >= 59, `passphrase is only ${passphraseBits()} bits`);
  assert.ok(Math.abs(passwordBits() - 98.1) < 0.1);
  assert.equal(describeBits(24).verdict, 'WEAK');
  assert.equal(describeBits(50).verdict, 'OKAY');
  assert.equal(describeBits(passphraseBits()).verdict, 'STRONG');
});

// ---------------- link checker ----------------

test('similarity matches Python difflib.SequenceMatcher.ratio()', () => {
  // Expected values computed with Python's difflib.
  assert.equal(similarity('steamcommunlty.com', 'steamcommunity.com'), 34 / 36);
  assert.equal(similarity('abc', 'abc'), 1);
  assert.equal(similarity('abc', 'xyz'), 0);
});

test('official sites and their subdomains pass', () => {
  for (const link of ['discord.com', 'https://www.roblox.com/home', 'store.steampowered.com', 'HTTPS://DISCORD.GG/abc']) {
    assert.deepEqual(checkLink(link), [], link);
  }
});

test('lookalike domains are caught', () => {
  assert.match(checkLink('steamcommunlty.com')[0], /FAKE copy of steamcommunity\.com/);
  assert.match(checkLink('dlscord.gg')[0], /FAKE copy of discord\.gg/);
});

test('brand name on another site is caught, including subdomain tricks', () => {
  assert.match(checkLink('discord-nitro-gift.xyz').join(' '), /name 'discord'/);
  assert.match(checkLink('discord.com.evil.ru').join(' '), /name 'discord'/);
  assert.notDeepEqual(checkLink('evildiscord.com'), []);
});

test('@ trick resolves to the real destination', () => {
  const warnings = checkLink('https://discord.com@evil.ru/x');
  assert.ok(warnings.some((w) => w.includes('@ symbol')));
  assert.ok(warnings.some((w) => w.includes('domain type scammers')));
});

test('punycode homographs are caught (missed by the Python version)', () => {
  assert.match(checkLink('xn--dscord-6ya.com').join(' '), /another alphabet/);
  // A Cyrillic "і" pasted directly gets converted to punycode by the URL parser.
  assert.match(checkLink('dіscord.com').join(' '), /another alphabet/);
});

test('IP addresses, shorteners, and http are flagged', () => {
  const ip = checkLink('http://192.168.1.5/login').join(' ');
  assert.match(ip, /raw IP address/);
  assert.match(ip, /Not secure/);
  assert.match(checkLink('http://[::1]/').join(' '), /raw IP address/);
  assert.match(checkLink('bit.ly/abc').join(' '), /shortened link/);
});

test('non-web and junk input is rejected without crashing', () => {
  assert.match(checkLink('javascript:alert(1)')[0], /not a normal web link|real link/);
  assert.match(checkLink('')[0], /real link/);
  assert.match(checkLink('not a link')[0], /real link/);
  assert.match(checkLink(`${'a'.repeat(300)}.com`)[0], /too long/);
});

// ---------------- message checker ----------------

test('classic "accidentally reported" scam matches several patterns', () => {
  const hits = checkMessage('hey i accidentally reported you, send me your login code urgent');
  assert.equal(hits.length, 3);
});

test('matching is case-insensitive and reasons are not repeated', () => {
  const hits = checkMessage('FREE V-BUCKS and free vbucks!!');
  assert.deepEqual(hits, ['Free V-Bucks don’t exist. This is a scam.']);
});

test('a normal message has no hits', () => {
  assert.deepEqual(checkMessage('gg, want to queue again tomorrow?'), []);
});

// ---------------- checkup ----------------

test('checkup scores and grades match the Python version', () => {
  const all = CHECKUP_QUESTIONS.map(() => true);
  assert.deepEqual(scoreCheckup(all), { percent: 100, grade: 'SOLID', fixes: [] });

  const sixOfSeven = [...all];
  sixOfSeven[0] = false;
  const result = scoreCheckup(sixOfSeven);
  assert.equal(result.percent, 86);
  assert.equal(result.grade, 'SOLID');
  assert.deepEqual(result.fixes, [CHECKUP_QUESTIONS[0].fix]);

  assert.equal(scoreCheckup([true, true, true, true, false, false, false]).grade, 'AT RISK');
  assert.equal(scoreCheckup(CHECKUP_QUESTIONS.map(() => false)).grade, 'HIGH RISK');
});

test('checkup refuses the wrong number of answers', () => {
  assert.throws(() => scoreCheckup([true]), RangeError);
});

// ---------------- 2FA guides ----------------

test('every platform has steps and an https help link', () => {
  assert.equal(PLATFORMS.length, 6);
  for (const platform of PLATFORMS) {
    const guide = TWO_FA_GUIDES[platform];
    assert.ok(guide.steps.length >= 4, platform);
    assert.equal(new URL(guide.helpUrl).protocol, 'https:', platform);
  }
});

// ---------------- password rules engine (generator page) ----------------

const withRandom = (patch: Partial<GeneratorSettings['random']>): GeneratorSettings =>
  ({ ...DEFAULT_SETTINGS, mode: 'random', random: { ...DEFAULT_SETTINGS.random, ...patch } });
const withSite = (patch: Partial<GeneratorSettings['site']>): GeneratorSettings =>
  ({ ...DEFAULT_SETTINGS, mode: 'site', site: { ...DEFAULT_SETTINGS.site, ...patch } });
const batchOf = (settings: GeneratorSettings, count = 5) => {
  const result = generateBatch(settings, count);
  assert.ok(result.ok, JSON.stringify(!result.ok && result.problems));
  return result.passwords;
};
const NO_TYPES = { lower: false, upper: false, digits: false, symbols: false };

test('default settings make a batch of distinct 20-character passwords', () => {
  const passwords = batchOf(DEFAULT_SETTINGS);
  assert.equal(passwords.length, 5);
  assert.equal(new Set(passwords).size, 5);
  for (const p of passwords) assert.equal(p.length, 20);
});

test('batch size is held between 3 and 5', () => {
  assert.equal(batchOf(DEFAULT_SETTINGS, 1).length, 3);
  assert.equal(batchOf(DEFAULT_SETTINGS, 99).length, 5);
});

test('random mode supports 64+ characters and only uses chosen types', () => {
  for (const p of batchOf(withRandom({ length: 128, types: { ...NO_TYPES, lower: true, digits: true } }))) {
    assert.equal(p.length, 128);
    assert.match(p, /^[a-z0-9]+$/);
  }
});

test('exclude ambiguous removes look-alike characters', () => {
  for (let i = 0; i < 20; i++) {
    for (const p of batchOf(withRandom({ length: 64, excludeAmbiguous: true }))) {
      for (const c of AMBIGUOUS_CHARACTERS) assert.ok(!p.includes(c), `${c} in ${p}`);
    }
  }
});

test('character-type requirements are off by default and work when turned on', () => {
  assert.equal(DEFAULT_SETTINGS.random.requireEachType, false);
  for (let i = 0; i < 50; i++) {
    for (const p of batchOf(withRandom({ length: 8, requireEachType: true }))) {
      assert.match(p, /[a-z]/);
      assert.match(p, /[A-Z]/);
      assert.match(p, /[0-9]/);
      assert.match(p, /[!@#$%^&*\-_=+?]/);
    }
  }
});

test('random-mode conflicts are reported, not silently fixed', () => {
  assert.deepEqual(findProblems(withRandom({ types: NO_TYPES })).map((p) => p.code), ['random-no-types']);
  assert.equal(findProblems(withRandom({ length: 7 }))[0].code, 'length-out-of-range');
  assert.equal(generateBatch(withRandom({ types: NO_TYPES }), 3).ok, false);
});

test('passphrase mode uses the word count, separator, and number settings', () => {
  const settings: GeneratorSettings = { ...DEFAULT_SETTINGS, mode: 'passphrase', passphrase: { wordCount: 12, separator: '.', capitalize: false, addNumber: false } };
  for (const p of batchOf(settings)) {
    const words = p.split('.');
    assert.equal(words.length, 12);
    for (const w of words) assert.ok(WORDS.includes(w), w);
    assert.ok(p.length >= 64, `long passphrases reach 64+ characters (${p.length})`);
  }
  for (const p of batchOf({ ...settings, passphrase: { ...settings.passphrase, wordCount: 3, addNumber: true, separator: ' ' } })) {
    assert.match(p, / \d{2}$/);
  }
});

test('PIN mode makes digits only, and short PINs still differ within a batch', () => {
  const settings: GeneratorSettings = { ...DEFAULT_SETTINGS, mode: 'pin', pin: { length: 4 } };
  for (let i = 0; i < 50; i++) {
    const pins = batchOf(settings);
    assert.equal(new Set(pins).size, pins.length);
    for (const p of pins) assert.match(p, /^\d{4}$/);
  }
});

test('site rules: lengths, allowed symbols, required types, and exclusions are all obeyed', () => {
  const settings = withSite({
    minLength: 10, maxLength: 12, length: 12,
    allowedSymbols: '!#',
    required: { lower: true, upper: false, digits: true, symbols: true },
    excluded: 'aeiou0',
  });
  for (let i = 0; i < 30; i++) {
    for (const p of batchOf(settings)) {
      assert.equal(p.length, 12);
      assert.match(p, /^[A-Za-z0-9!#]+$/);
      assert.doesNotMatch(p, /[aeiou0]/);
      assert.match(p, /[a-z]/);
      assert.match(p, /[0-9]/);
      assert.match(p, /[!#]/);
    }
  }
});

test('site rule conflicts each explain themselves', () => {
  const codes = (patch: Partial<GeneratorSettings['site']>) => findProblems(withSite(patch)).map((p) => p.code);
  assert.deepEqual(codes({ minLength: 20, maxLength: 10 }), ['site-min-over-max']);
  assert.deepEqual(codes({ length: 70 }), ['site-length-outside-limits']);
  assert.deepEqual(codes({ allowed: { lower: true, upper: true, digits: true, symbols: false }, required: { ...NO_TYPES, symbols: true } }), ['site-required-not-allowed']);
  assert.deepEqual(codes({ required: { ...NO_TYPES, digits: true }, excluded: CHARACTER_SETS.digits }), ['site-required-all-excluded']);
  assert.deepEqual(codes({ allowed: NO_TYPES }), ['site-no-allowed-types']);
  assert.deepEqual(codes({ allowedSymbols: '!a ' }), ['site-symbols-invalid']);
  assert.deepEqual(codes({ allowed: { ...NO_TYPES, digits: true }, excluded: CHARACTER_SETS.digits }), ['site-everything-excluded']);
  assert.deepEqual(codes({ minLength: 1, length: 2, required: { lower: true, upper: true, digits: true, symbols: false } }), ['too-short-for-required']);
});

test('strength estimate counts exactly, including required types', () => {
  assert.equal(estimateStrength({ ...DEFAULT_SETTINGS, mode: 'pin', pin: { length: 6 } })!.bits, 6 * Math.log2(10));
  // A tiny case checked by hand: length 3 over a-z0-9 (36 chars), requiring a digit.
  const tiny = withSite({ minLength: 3, maxLength: 3, length: 3, allowed: { ...NO_TYPES, lower: true, digits: true }, required: { ...NO_TYPES, digits: true } });
  assert.ok(Math.abs(estimateStrength(tiny)!.bits - Math.log2(36 ** 3 - 26 ** 3)) < 1e-9);
  assert.equal(estimateStrength(withRandom({ types: NO_TYPES })), null);
  assert.ok(estimateStrength(withRandom({ length: 128 }))!.bits > 700);
});

test('copy formats escape correctly', () => {
  const tricky = 'a"b\\c$d`e';
  assert.equal(formatForCopy(tricky, 'plain'), tricky);
  assert.equal(JSON.parse(formatForCopy(tricky, 'json')), tricky);
  assert.equal(formatForCopy(tricky, 'env'), 'PASSWORD="a\\"b\\\\c\\$d\\`e"');
  assert.equal(formatForCopy('x', 'env', 'DB_PASS'), 'DB_PASS="x"');
  assert.ok(isValidEnvName('_A1') && !isValidEnvName('1A') && !isValidEnvName('A-B') && !isValidEnvName(''));
  assert.throws(() => formatForCopy('x', 'env', 'bad name'));
});

test('presets switch to their mode and produce valid settings', () => {
  for (const presets of Object.values(PRESETS)) {
    for (const preset of presets) assert.deepEqual(findProblems(applyPreset(DEFAULT_SETTINGS, preset)), [], preset);
  }
  assert.equal(applyPreset(DEFAULT_SETTINGS, 'random-max').random.length, 64);
});

test('saved settings are sanitized: junk falls back to defaults', () => {
  assert.deepEqual(sanitizeSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(sanitizeSettings('{"mode":"random"}'), DEFAULT_SETTINGS);
  const junk = { mode: 'evil', random: { length: 1e9, types: { lower: 'yes' } }, passphrase: { separator: '<script>' }, site: { excluded: 42 } };
  assert.deepEqual(sanitizeSettings(junk), DEFAULT_SETTINGS);
  const kept = sanitizeSettings({ mode: 'pin', pin: { length: 8 } });
  assert.equal(kept.mode, 'pin');
  assert.equal(kept.pin.length, 8);
});
