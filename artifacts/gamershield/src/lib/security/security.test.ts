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
