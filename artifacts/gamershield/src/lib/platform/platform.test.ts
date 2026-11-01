// Tests for the Sentrix platform layer: registry, search, saved data, tips, themes,
// and the password check that moved out of App.tsx. Node's built-in runner.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { CATEGORIES, READY_TOOLS, SECTIONS, TOOLS, findTool, toolHref, toolsIn } from './registry.ts';
import { searchPlatform } from './search.ts';
import { MAX_RECENT, parseTheme, parseToolIds, pushRecent, resolveTheme, toggleFavorite } from './storage.ts';
import { TIPS, tipForDate } from './tips.ts';
import { assessPassword, countBreaches, sha1Hex } from '../security/passwordCheck.ts';

// ---------------- registry ----------------

test('every tool and section has a unique id and path', () => {
  assert.equal(new Set(TOOLS.map((t) => t.id)).size, TOOLS.length);
  assert.equal(new Set(SECTIONS.map((s) => s.id)).size, SECTIONS.length);
  assert.equal(new Set(SECTIONS.map((s) => s.path)).size, SECTIONS.length);
  assert.equal(new Set(TOOLS.map(toolHref)).size, TOOLS.length);
});

test('sidebar has the ten sections in the planned order', () => {
  assert.deepEqual(SECTIONS.map((s) => s.name), [
    'Home', 'Dashboard', 'Password Security', 'Cryptography', 'Networking',
    'Security Awareness', 'Learning Center', 'Cyber Labs', 'Settings', 'About',
  ]);
});

test('every tool belongs to a real category, and every category lists something', () => {
  for (const tool of TOOLS) assert.ok(CATEGORIES.some((c) => c.id === tool.category), tool.id);
  for (const category of CATEGORIES) assert.ok(toolsIn(category.id).length > 0, category.id);
});

test('planned tools say which phase brings them; ready tools do not', () => {
  for (const tool of TOOLS) {
    if (tool.status === 'planned') assert.ok(tool.plannedPhase, tool.id);
    else assert.equal(tool.plannedPhase, undefined, tool.id);
  }
});

test('all existing GamerShield tools are still available', () => {
  for (const id of ['strength-checker', 'password-generator', 'two-factor-guides', 'link-checker', 'message-checker', 'account-checkup']) {
    assert.equal(findTool(id)?.status, 'ready', id);
  }
  assert.equal(toolHref(findTool('password-generator')!), 'generator/');
  assert.equal(toolHref(findTool('link-checker')!), '/security-awareness/link-checker');
});

// ---------------- search ----------------

test('search finds tools by name, keyword, and category', () => {
  assert.equal(searchPlatform('link')[0].item.id, 'link-checker');
  assert.equal(searchPlatform('2fa')[0].item.id, 'two-factor-guides');
  assert.ok(searchPlatform('passphrase').some((r) => r.item.id === 'password-generator'));
  assert.ok(searchPlatform('hibp').some((r) => r.item.id === 'strength-checker'));
  assert.ok(searchPlatform('awareness').some((r) => r.item.id === 'message-checker'));
});

test('search finds sections and requires every word to match', () => {
  assert.equal(searchPlatform('settings')[0].item.id, 'settings');
  assert.ok(searchPlatform('scam message').every((r) => r.item.id === 'message-checker'));
  assert.deepEqual(searchPlatform('zzzz nothing'), []);
  assert.deepEqual(searchPlatform('   '), []);
});

test('search never returns planned tools', () => {
  for (const tool of TOOLS) {
    assert.ok(!searchPlatform(tool.name).some((r) => r.kind === 'tool' && r.item.status !== 'ready'), tool.id);
  }
});

test('search finds the Phase 2 tools', () => {
  assert.equal(searchPlatform('sha256')[0].item.id, 'hash-generator');
  assert.equal(searchPlatform('subnet')[0].item.id, 'subnet-calculator');
  assert.equal(searchPlatform('base64')[0].item.id, 'base64');
  assert.ok(searchPlatform('aes').some((r) => r.item.id === 'encryption'));
  assert.ok(searchPlatform('mx').some((r) => r.item.id === 'dns-lookup'));
  assert.ok(searchPlatform('checksum').some((r) => r.item.id === 'file-hash'));
  assert.ok(searchPlatform('passphrase').some((r) => r.item.id === 'passphrase-generator'));
});

// ---------------- saved data ----------------

test('saved tool lists drop junk, unknown ids, and duplicates', () => {
  assert.deepEqual(parseToolIds(null), []);
  assert.deepEqual(parseToolIds('not json'), []);
  assert.deepEqual(parseToolIds('{"a":1}'), []);
  assert.deepEqual(parseToolIds('["link-checker", "evil", 42, "link-checker", "<script>"]'), ['link-checker']);
  assert.equal(parseToolIds(JSON.stringify(READY_TOOLS.map((t) => t.id)), 2).length, 2);
});

test('favorites toggle on and off', () => {
  assert.deepEqual(toggleFavorite([], 'link-checker'), ['link-checker']);
  assert.deepEqual(toggleFavorite(['link-checker', 'account-checkup'], 'link-checker'), ['account-checkup']);
});

test('recent tools: newest first, no duplicates, capped', () => {
  let recent: string[] = [];
  for (const tool of READY_TOOLS) recent = pushRecent(recent, tool.id);
  recent = pushRecent(recent, READY_TOOLS[0].id);
  assert.equal(recent[0], READY_TOOLS[0].id);
  assert.equal(new Set(recent).size, recent.length);
  assert.ok(recent.length <= MAX_RECENT);
});

test('theme preference parses safely and resolves "system"', () => {
  assert.equal(parseTheme('dark'), 'dark');
  assert.equal(parseTheme('purple'), 'system');
  assert.equal(parseTheme(null), 'system');
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('light', true), 'light');
});

// ---------------- tips ----------------

test('tip of the day is stable within a day and changes the next day', () => {
  const morning = new Date('2026-11-01T01:00:00Z');
  const night = new Date('2026-11-01T23:00:00Z');
  const tomorrow = new Date('2026-11-02T01:00:00Z');
  assert.equal(tipForDate(morning), tipForDate(night));
  assert.notEqual(tipForDate(morning), tipForDate(tomorrow));
  assert.ok(TIPS.every((t) => t.title && t.body));
});

// ---------------- password check (moved from App.tsx) ----------------

test('password assessment matches the original scoring', () => {
  assert.deepEqual([assessPassword('password').level, assessPassword('password').score], ['WEAK', 0]);
  assert.equal(assessPassword('Password123!').level, 'OKAY');
  assert.equal(assessPassword('Tr0ub4dor&3xyz').level, 'STRONG');
  assert.ok(assessPassword('roblox').containsRiskyTerm);
  assert.deepEqual(assessPassword('Tr0ub4dor&3xyz').tips, ['Good mix. Keep it unique to this account.']);
});

test('breach check sends only the 5-character hash prefix and reads the count', async () => {
  const hash = await sha1Hex('password');
  assert.equal(hash, '5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8');
  let requestedUrl = '';
  const fakeFetch = (async (url: string) => {
    requestedUrl = url;
    return new Response(`0000000000000000000000000000000000A:0\r\n${hash.slice(5)}:52372427\r\n`);
  }) as unknown as typeof fetch;
  assert.equal(await countBreaches('password', fakeFetch), 52372427);
  assert.equal(requestedUrl, 'https://api.pwnedpasswords.com/range/5BAA6');
  assert.ok(!requestedUrl.includes(hash.slice(5)), 'the rest of the hash never leaves the device');
});

test('breach check ignores padding rows and reports failures', async () => {
  const padded = (async () => new Response(`${(await sha1Hex('x')).slice(5)}:0`)) as unknown as typeof fetch;
  assert.equal(await countBreaches('x', padded), 0);
  const down = (async () => new Response('', { status: 503 })) as unknown as typeof fetch;
  await assert.rejects(countBreaches('x', down));
});
