import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { INITIAL_STATE, TERMINAL_TASKS, runCommand, type TerminalState } from '@/lib/labs/terminal';
import { completeLab } from '@/hooks/use-labs';

interface Entry { prompt: string; input: string; output: string }

const promptFor = (s: TerminalState) => `student@lab-machine:${s.cwd.replace('/home/student', '~')}$`;

export function TerminalLab() {
  const [state, setState] = useState<TerminalState>(INITIAL_STATE);
  const [entries, setEntries] = useState<Entry[]>([{ prompt: '', input: '', output: 'Sentrix practice terminal. This is a simulation: commands are never run on your computer.\nType help to see commands. Complete the tasks on the right.' }]);
  const [input, setInput] = useState('');
  const [done, setDone] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight }); }, [entries]);

  function submit() {
    const result = runCommand(state, input);
    const [cmd = '', ...args] = input.trim().split(/\s+/);
    const finished = TERMINAL_TASKS.filter((t) => !done.includes(t.id) && t.done(cmd, args, result.state)).map((t) => t.id);
    const nextDone = [...done, ...finished];
    setDone(nextDone);
    if (nextDone.length === TERMINAL_TASKS.length) completeLab('terminal');
    setEntries(result.clear ? [] : [...entries, { prompt: promptFor(state), input, output: result.output }]);
    setState(result.state);
    setInput('');
    setHistoryIndex(null);
  }

  // Up/Down arrows walk through earlier commands, like a real shell.
  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const h = state.history;
    if (!h.length) return;
    const i = historyIndex === null ? h.length : historyIndex;
    const next = e.key === 'ArrowUp' ? Math.max(0, i - 1) : Math.min(h.length, i + 1);
    setHistoryIndex(next);
    setInput(next === h.length ? '' : h[next]);
  }

  return (
    <div className="sx-terminal-layout">
      <section aria-label="Terminal">
        <div className="sx-terminal" ref={screenRef} onClick={() => inputRef.current?.focus()} role="log" aria-live="polite" data-testid="terminal-screen">
          {entries.map((e, i) => (
            <div key={i}>
              {e.prompt && <div><span className="sx-term-prompt">{e.prompt}</span> {e.input}</div>}
              {e.output && <pre>{e.output}</pre>}
            </div>
          ))}
          <form onSubmit={(ev) => { ev.preventDefault(); submit(); }} className="sx-term-input">
            <label htmlFor="term-input" className="sx-term-prompt">{promptFor(state)}</label>
            <input id="term-input" ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown}
              autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Command" data-testid="terminal-input" />
          </form>
        </div>
      </section>
      <aside className="sx-card" aria-labelledby="tasks-heading">
        <h2 id="tasks-heading" style={{ fontSize: 17, marginBottom: 6 }}>Investigate this machine</h2>
        <p className="sx-muted" style={{ fontSize: 13, marginBottom: 12 }}>{done.length} of {TERMINAL_TASKS.length} tasks done</p>
        <ol className="sx-task-list">
          {TERMINAL_TASKS.map((task) => {
            const isDone = done.includes(task.id);
            return (
              <li key={task.id} className={isDone ? 'done' : ''} data-testid={`task-${task.id}`}>
                {isDone ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={17} aria-hidden="true" />}
                <div>
                  <strong>{task.prompt}</strong>
                  <span>{isDone ? task.lesson : task.hint}</span>
                </div>
              </li>
            );
          })}
        </ol>
        {done.length === TERMINAL_TASKS.length && (
          <div className="gs-result" style={{ marginTop: 12 }} data-testid="terminal-complete">
            <strong>Lab complete.</strong> You found a disguised program, a hidden process, its suspicious connection, and a brute-force attempt in the logs.
          </div>
        )}
      </aside>
    </div>
  );
}
