import { useEffect, useState } from 'react';
import { Hash } from 'lucide-react';
import { HASH_ALGORITHMS, guessAlgorithm, hashText, hashesMatch, normalizeHash, type HashAlgorithm } from '@/lib/security/crypto';
import { ToolPanel } from './ToolPanel';
import { CopyButton, ModeSwitch, Notice } from './shared';

export function HashTool() {
  const [text, setText] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [hash, setHash] = useState('');
  const [expected, setExpected] = useState('');

  // Hash as you type. The "cancelled" flag ignores results from older keystrokes.
  useEffect(() => {
    let cancelled = false;
    hashText(algorithm, text).then((h) => { if (!cancelled) setHash(h); });
    return () => { cancelled = true; };
  }, [text, algorithm]);

  const expectedClean = normalizeHash(expected);
  const guessed = expectedClean ? guessAlgorithm(expectedClean) : null;

  return (
    <ToolPanel id="hash" icon={Hash} title="Hash Generator">
      <ModeSwitch<HashAlgorithm> name="algorithm" label="Hash algorithm" value={algorithm} onChange={setAlgorithm}
        options={HASH_ALGORITHMS.map((a) => ({ value: a, label: a }))} />
      {algorithm === 'SHA-1' && (
        <p className="gs-hint">SHA-1 is broken for security uses like signatures (collisions have been found). It’s here because older systems and the Have I Been Pwned API still use it.</p>
      )}
      <label className="gs-input-label" htmlFor="hash-input">Text to hash</label>
      <textarea id="hash-input" className="gs-textarea" value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Type anything. Even one changed letter gives a completely different hash." spellCheck={false} data-testid="input-hash" />
      <p className="gs-input-label" id="hash-output-label">{algorithm} hash {text ? '' : '(of empty text)'}</p>
      <output className="gs-code" aria-labelledby="hash-output-label" data-testid="text-hash">{hash}</output>
      <div className="gs-actions"><CopyButton text={hash} what="Hash" label="Copy hash" testId="button-copy-hash" /></div>

      <label className="gs-input-label" htmlFor="hash-expected">Compare with an expected hash (optional)</label>
      <input id="hash-expected" className="gs-input" value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="Paste a hash to compare" spellCheck={false} autoComplete="off" data-testid="input-hash-expected" />
      {expectedClean && (hashesMatch(expected, hash)
        ? <Notice tone="good" title="Match">The text produces exactly this {algorithm} hash.</Notice>
        : <Notice tone="bad" title="No match">
            The hashes are different.
            {guessed && guessed !== algorithm ? ` Its length suggests it’s ${guessed}. Try switching the algorithm above.` : ' Even a single different character or an extra space changes the whole hash.'}
          </Notice>)}
    </ToolPanel>
  );
}
