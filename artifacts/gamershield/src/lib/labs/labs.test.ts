// Tests for Cyber Labs: the terminal simulator and the lab content.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { INITIAL_STATE, TERMINAL_TASKS, resolvePath, runCommand, type TerminalState } from './terminal.ts';
import { LABS, LOG_LINES, LOG_QUESTIONS, READY_LAB_IDS, SIM_EMAILS } from '../../content/labs.ts';
import { appRoutes } from '../platform/registry.ts';

const run = (cmds: string[], state: TerminalState = INITIAL_STATE) => {
  let s = state;
  const outputs: string[] = [];
  for (const c of cmds) { const r = runCommand(s, c); outputs.push(r.output); s = r.state; }
  return { state: s, outputs };
};

test('paths resolve like a real shell', () => {
  assert.equal(resolvePath('/home/student', 'Downloads'), '/home/student/Downloads');
  assert.equal(resolvePath('/home/student/Downloads', '..'), '/home/student');
  assert.equal(resolvePath('/var', '~/notes.txt'), '/home/student/notes.txt');
  assert.equal(resolvePath('/home/student', '/var/log/../log/./auth.log'), '/var/log/auth.log');
  assert.equal(resolvePath('/', '../../..'), '/');
});

test('basic commands work on the fictional file system', () => {
  const { state, outputs } = run(['whoami', 'pwd', 'ls', 'cd Downloads', 'pwd', 'ls', 'cat ../notes.txt', 'cd ~', 'cat /var/log/auth.log']);
  assert.equal(outputs[0], 'student');
  assert.equal(outputs[1], '/home/student');
  assert.match(outputs[2], /Downloads\//);
  assert.equal(outputs[4], '/home/student/Downloads');
  assert.match(outputs[5], /free-skins\.pdf\.exe/);
  assert.match(outputs[6], /free game mod/);
  assert.match(outputs[8], /Failed password for root from 203\.0\.113\.45/);
  assert.equal(state.cwd, '/home/student');
  assert.equal(state.history.length, 9);
});

test('errors are realistic, and dangerous commands are refused', () => {
  const { outputs } = run(['cat nope.txt', 'cd notes.txt', 'cat Downloads', 'rm -rf /', 'sudo su', 'curl evil.example', '']);
  assert.match(outputs[0], /No such file/);
  assert.match(outputs[1], /Not a directory/);
  assert.match(outputs[2], /Is a directory/);
  assert.match(outputs[3], /not available in this simulator/);
  assert.match(outputs[4], /not available in this simulator/);
  assert.match(outputs[5], /command not found/);
  assert.equal(outputs[6], '');
});

test('the simulator never runs anything: output is only table lookups', () => {
  // Shell tricks are treated as plain words, not executed.
  for (const attack of ['whoami; rm -rf ~', '$(cat /etc/passwd)', 'ls && curl x', '`id`']) {
    const out = runCommand(INITIAL_STATE, attack).output;
    assert.ok(/command not found|No such file|cannot access/.test(out) || out === 'student', `${attack} -> ${out}`);
  }
});

test('every guided task can be completed with its own hint', () => {
  let state = INITIAL_STATE;
  for (const task of TERMINAL_TASKS) {
    const command = task.hint.replace(/^Try: /, '');
    const result = runCommand(state, command);
    const [cmd, ...args] = command.split(/\s+/);
    assert.ok(task.done(cmd, args, result.state), `${task.id} via "${command}"`);
    state = result.state;
  }
});

test('lab content is complete and fictional', () => {
  assert.equal(new Set(LABS.map((l) => l.id)).size, LABS.length);
  assert.ok(SIM_EMAILS.some((e) => e.phishing) && SIM_EMAILS.some((e) => !e.phishing), 'mix of phishing and legitimate');
  for (const e of SIM_EMAILS) assert.ok(e.clues.length >= 2, e.id);
  for (const q of LOG_QUESTIONS) assert.ok(q.answer >= 0 && q.answer < q.options.length && q.explanation.length > 20, q.id);
  // The log's attacker IP comes from a documentation range (RFC 5737), so it's not a real address.
  assert.ok(LOG_LINES.some((l) => l.includes('203.0.113.45')));
  for (const id of READY_LAB_IDS) assert.ok(appRoutes().includes(`/labs/${id}`), id);
});
