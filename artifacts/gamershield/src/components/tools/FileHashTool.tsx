import { useState, type DragEvent } from 'react';
import { FileCheck2, Upload } from 'lucide-react';
import { HASH_ALGORITHMS, guessAlgorithm, hashBytes, hashesMatch, normalizeHash, type HashAlgorithm } from '@/lib/security/crypto';
import { ToolPanel } from './ToolPanel';
import { CopyButton, ModeSwitch, Notice, ResultTable } from './shared';

// Web Crypto hashes a whole file in memory, so very large files could freeze the tab.
const MAX_BYTES = 1024 * 1024 * 1024; // 1 GB

const formatSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} bytes` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : bytes < 1024 ** 3 ? `${(bytes / 1024 ** 2).toFixed(1)} MB` : `${(bytes / 1024 ** 3).toFixed(2)} GB`;

export function FileHashTool() {
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expected, setExpected] = useState('');
  const [dragging, setDragging] = useState(false);

  async function hashFile(selected: File, algo = algorithm) {
    setFile(selected);
    setHash('');
    setError('');
    if (selected.size > MAX_BYTES) {
      setError(`This file is ${formatSize(selected.size)}. Files over 1 GB are too big to hash safely in a browser tab. Use a command-line tool like sha256sum or certutil instead.`);
      return;
    }
    setBusy(true);
    try {
      // The file is read into memory on this device. It is never uploaded.
      setHash(await hashBytes(algo, await selected.arrayBuffer()));
    } catch {
      setError('Couldn’t read that file. It may have been moved or blocked by the browser.');
    } finally {
      setBusy(false);
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) hashFile(dropped);
  }

  const expectedClean = normalizeHash(expected);
  const guessed = expectedClean ? guessAlgorithm(expectedClean) : null;

  return (
    <ToolPanel id="file-hash" icon={FileCheck2} title="File Hash Checker">
      <ModeSwitch name="filealgo" label="Hash algorithm" value={algorithm}
        onChange={(a) => { setAlgorithm(a); if (file) hashFile(file, a); }}
        options={HASH_ALGORITHMS.map((a) => ({ value: a, label: a }))} />
      <label className="gs-dropzone" data-dragging={dragging}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <Upload size={26} aria-hidden="true" />
        <strong>Choose a file or drop it here</strong>
        <span>It stays on your device. Nothing is uploaded.</span>
        <input type="file" className="sx-sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) hashFile(f); e.target.value = ''; }} data-testid="input-file" />
      </label>

      <div aria-live="polite">
        {busy && <p className="gs-hint">Hashing {file?.name}…</p>}
        {error && <Notice tone="bad" title="Can’t hash this file">{error}</Notice>}
        {file && hash && (
          <>
            <ResultTable caption="File details" rows={[['File', file.name], ['Size', formatSize(file.size)], [algorithm, hash]]} />
            <div className="gs-actions"><CopyButton text={hash} what="Hash" label="Copy hash" testId="button-copy-file-hash" /></div>
          </>
        )}
      </div>

      <label className="gs-input-label" htmlFor="file-expected">Expected hash from the publisher (optional)</label>
      <input id="file-expected" className="gs-input" value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="Paste the hash listed on the download page" spellCheck={false} autoComplete="off" data-testid="input-file-expected" />
      {expectedClean && hash && (hashesMatch(expected, hash)
        ? <Notice tone="good" title="Match: this is the exact file the publisher hashed">Not a single byte is different. If the hash came from the official site over HTTPS, the download wasn’t corrupted or swapped.</Notice>
        : <Notice tone="bad" title="No match: don’t open this file yet">
            The file is different from what the publisher listed. It may be corrupted, a different version, or tampered with.
            {guessed && guessed !== algorithm ? ` Note: the expected hash looks like ${guessed}, so switch the algorithm above and check again.` : ' Download it again from the official site and recheck.'}
          </Notice>)}
    </ToolPanel>
  );
}
