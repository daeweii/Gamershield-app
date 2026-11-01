// ---------------------------------------------------------------
// TERMINAL SIMULATOR ENGINE
// A pretend Linux shell for practice. It only knows the commands listed
// below and answers from a small fictional file system written in this
// file. Nothing typed here is ever executed, sent, or saved: it is
// matched against this table and turned into canned text output.
// ---------------------------------------------------------------

type FsNode = { type: 'dir'; children: Record<string, FsNode> } | { type: 'file'; content: string };

const dir = (children: Record<string, FsNode>): FsNode => ({ type: 'dir', children });
const file = (content: string): FsNode => ({ type: 'file', content });

/** The fictional machine. */
const ROOT: FsNode = dir({
  home: dir({
    student: dir({
      'notes.txt': file('TODO: ask IT why the laptop got slow after installing that free game mod.\nAlso: never reuse the school password.'),
      Downloads: dir({
        'game-mod-installer.exe': file('[binary file: Windows program]'),
        'free-skins.pdf.exe': file('[binary file: Windows program disguised as a PDF]'),
        'homework.pdf': file('[PDF document]'),
      }),
      Documents: dir({
        'passwords.txt': file('steam: hunter2\nemail: hunter2\n(Storing passwords in a plain text file is a bad idea. Use a password manager.)'),
      }),
    }),
  }),
  var: dir({
    log: dir({
      'auth.log': file([
        'Nov  3 02:14:07 lab sshd[811]: Failed password for root from 203.0.113.45 port 51122',
        'Nov  3 02:14:09 lab sshd[811]: Failed password for root from 203.0.113.45 port 51124',
        'Nov  3 02:14:11 lab sshd[811]: Failed password for admin from 203.0.113.45 port 51130',
        'Nov  3 08:30:02 lab sshd[902]: Accepted password for student from 192.168.1.20 port 50211',
      ].join('\n')),
    }),
  }),
  etc: dir({ hostname: file('lab-machine') }),
});

const HOME = '/home/student';

export interface TerminalState {
  cwd: string;
  history: string[];
}

export const INITIAL_STATE: TerminalState = { cwd: HOME, history: [] };

/** Turn "../Downloads" or "~/x" into an absolute path. */
export function resolvePath(cwd: string, input = '.'): string {
  const raw = input.startsWith('~') ? HOME + input.slice(1) : input;
  const parts = (raw.startsWith('/') ? raw : `${cwd}/${raw}`).split('/');
  const out: string[] = [];
  for (const p of parts) {
    if (!p || p === '.') continue;
    if (p === '..') out.pop();
    else out.push(p);
  }
  return `/${out.join('/')}`;
}

function lookup(path: string): FsNode | null {
  let node: FsNode = ROOT;
  for (const part of path.split('/').filter(Boolean)) {
    if (node.type !== 'dir' || !(part in node.children)) return null;
    node = node.children[part];
  }
  return node;
}

/** Fake but realistic outputs for network/process commands. */
const PROCESS_TABLE = [
  '  PID USER     COMMAND',
  '    1 root     /sbin/init',
  '  811 root     /usr/sbin/sshd',
  ' 1337 student  /home/student/Downloads/game-mod-installer.exe --hidden',
  ' 1402 student  bash',
].join('\n');

const NETSTAT = [
  'Proto Local Address        Foreign Address       State        PID/Program',
  'tcp   0.0.0.0:22           0.0.0.0:*             LISTEN       811/sshd',
  'tcp   192.168.1.20:50211   198.51.100.77:4444    ESTABLISHED  1337/game-mod-installer.exe',
].join('\n');

/** What each command does, shown by "help" and "explain <cmd>". */
export const COMMAND_HELP: Record<string, string> = {
  help: 'List the commands this simulator understands.',
  pwd: 'Print working directory: shows which folder you are in.',
  ls: 'List the files in a folder. Try: ls, ls Downloads, ls /var/log',
  cd: 'Change directory. Try: cd Downloads, cd .., cd ~',
  cat: 'Print a file’s contents. Try: cat notes.txt',
  whoami: 'Show which user account you are logged in as.',
  hostname: 'Show this computer’s name.',
  ps: 'List running processes (programs). Attackers’ malware often shows up here.',
  netstat: 'Show network connections and which program owns each one.',
  ping: 'Check whether a host answers on the network. Try: ping example.com',
  history: 'Show the commands you have typed.',
  explain: 'Explain a command. Try: explain netstat',
  clear: 'Clear the screen.',
};

export interface CommandResult {
  output: string;
  state: TerminalState;
  clear?: boolean;
}

export function runCommand(state: TerminalState, input: string): CommandResult {
  const line = input.trim();
  const history = line ? [...state.history, line].slice(-50) : state.history;
  const next = { ...state, history };
  if (!line) return { output: '', state: next };
  const [cmd, ...args] = line.split(/\s+/);
  const arg = args[0];

  switch (cmd) {
    case 'help':
      return { output: Object.entries(COMMAND_HELP).map(([c, h]) => `${c.padEnd(9)} ${h}`).join('\n'), state: next };
    case 'explain':
      return { output: arg && COMMAND_HELP[arg] ? `${arg}: ${COMMAND_HELP[arg]}` : 'Usage: explain <command>. Type help to see commands.', state: next };
    case 'clear':
      return { output: '', state: next, clear: true };
    case 'pwd':
      return { output: state.cwd, state: next };
    case 'whoami':
      return { output: 'student', state: next };
    case 'hostname':
      return { output: 'lab-machine', state: next };
    case 'history':
      return { output: history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n'), state: next };
    case 'ls': {
      const path = resolvePath(state.cwd, arg);
      const node = lookup(path);
      if (!node) return { output: `ls: cannot access '${arg}': No such file or directory`, state: next };
      if (node.type === 'file') return { output: path.split('/').pop()!, state: next };
      return { output: Object.entries(node.children).map(([n, c]) => (c.type === 'dir' ? `${n}/` : n)).join('  ') || '(empty)', state: next };
    }
    case 'cd': {
      const path = resolvePath(state.cwd, arg ?? '~');
      const node = lookup(path);
      if (!node) return { output: `cd: ${arg}: No such file or directory`, state: next };
      if (node.type !== 'dir') return { output: `cd: ${arg}: Not a directory`, state: next };
      return { output: '', state: { ...next, cwd: path } };
    }
    case 'cat': {
      if (!arg) return { output: 'Usage: cat <file>', state: next };
      const node = lookup(resolvePath(state.cwd, arg));
      if (!node) return { output: `cat: ${arg}: No such file or directory`, state: next };
      if (node.type === 'dir') return { output: `cat: ${arg}: Is a directory`, state: next };
      return { output: node.content, state: next };
    }
    case 'ps':
      return { output: PROCESS_TABLE, state: next };
    case 'netstat':
      return { output: NETSTAT, state: next };
    case 'ping':
      return { output: arg ? `PING ${arg}: 3 packets sent, 3 received, 0% loss (simulated, no real network traffic)` : 'Usage: ping <host>', state: next };
    case 'sudo':
    case 'rm':
      return { output: `${cmd}: not available in this simulator. It's a safe practice space and nothing can be changed or deleted.`, state: next };
    default:
      return { output: `${cmd}: command not found. Type help to see what this simulator understands.`, state: next };
  }
}

/** Guided tasks. Each one is done when its check passes after a command. */
export interface TerminalTask {
  id: string;
  prompt: string;
  hint: string;
  done: (cmd: string, args: string[], state: TerminalState) => boolean;
  lesson: string;
}

export const TERMINAL_TASKS: readonly TerminalTask[] = [
  { id: 'who', prompt: 'Find out which user you are logged in as.', hint: 'Try: whoami', done: (c) => c === 'whoami',
    lesson: 'Knowing which account you’re using matters: attackers who get a shell often check whoami first to see what they can access.' },
  { id: 'downloads', prompt: 'List the files in the Downloads folder. Is anything suspicious?', hint: 'Try: ls Downloads', done: (c, _a, s) => c === 'ls' && (s.cwd.endsWith('/Downloads') || _a.some((x) => /downloads/i.test(x))),
    lesson: 'free-skins.pdf.exe has a double extension: it looks like a PDF but is really a program (.exe). That’s a classic malware trick.' },
  { id: 'processes', prompt: 'Check the running processes. Which one looks wrong?', hint: 'Try: ps', done: (c) => c === 'ps',
    lesson: 'game-mod-installer.exe is running with a --hidden flag. A “mod installer” that stays running and hides itself deserves a closer look.' },
  { id: 'network', prompt: 'See what that process is connected to on the network.', hint: 'Try: netstat', done: (c) => c === 'netstat',
    lesson: 'It has an open connection to 198.51.100.77 on port 4444, a port often used by remote-access malware. This machine is likely compromised.' },
  { id: 'logs', prompt: 'Read the login log in /var/log to see if anyone tried to break in.', hint: 'Try: cat /var/log/auth.log', done: (c, a) => c === 'cat' && a.some((x) => x.endsWith('auth.log')),
    lesson: 'Repeated “Failed password” lines from 203.0.113.45 for root and admin are a brute-force attempt. They failed, but the source should be blocked.' },
];
