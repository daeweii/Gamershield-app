import { useState } from 'react';
import { Eye, EyeOff, Lock, LockOpen } from 'lucide-react';
import { decryptText, encryptText, type DecryptError } from '@/lib/security/crypto';
import { ToolPanel } from './ToolPanel';
import { CopyButton, ModeSwitch, Notice } from './shared';

const ERRORS: Record<DecryptError, string> = {
  'not-sentrix-format': 'This isn’t text encrypted by Sentrix. Encrypted text starts with “SNTX1.”',
  'damaged': 'The encrypted text looks cut off or damaged. Make sure you copied all of it.',
  'wrong-passphrase-or-tampered': 'Wrong passphrase, or the encrypted text was changed. AES-GCM can’t tell these apart, and both are rejected for safety.',
};

export function EncryptionTool() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [input, setInput] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<{ ok: true; text: string } | { ok: false; error: DecryptError } | null>(null);

  function switchMode(next: 'encrypt' | 'decrypt') {
    setMode(next);
    // Hand the result over, so you can encrypt, switch, and decrypt right away.
    if (output?.ok) setInput(output.text);
    setOutput(null);
  }

  async function run() {
    if (!input || !passphrase || busy) return;
    setBusy(true);
    try {
      setOutput(mode === 'encrypt' ? { ok: true, text: await encryptText(input, passphrase) } : await decryptText(input, passphrase));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPanel id="encryption" icon={Lock} title="Encryption & Decryption">
      <ModeSwitch name="encmode" label="Encrypt or decrypt" value={mode} onChange={switchMode}
        options={[{ value: 'encrypt', label: 'Encrypt' }, { value: 'decrypt', label: 'Decrypt' }]} />
      <Notice tone="warn" title="Educational tool">
        This uses real, standard encryption (AES-256-GCM through your browser’s Web Crypto API), but it’s for learning.
        For real secrets, use an established app like a password manager or Signal. There is no recovery: lose the passphrase and the text is gone.
      </Notice>
      <form onSubmit={(e) => { e.preventDefault(); run(); }}>
        <label className="gs-input-label" htmlFor="enc-input">{mode === 'encrypt' ? 'Message to encrypt' : 'Encrypted text (starts with SNTX1.)'}</label>
        <textarea id="enc-input" className="gs-textarea" value={input} onChange={(e) => { setInput(e.target.value); setOutput(null); }} spellCheck={false} data-testid="input-encryption" />
        <label className="gs-input-label" htmlFor="enc-pass">Passphrase</label>
        <div className="gs-password-wrap">
          <input id="enc-pass" type={showPass ? 'text' : 'password'} value={passphrase} onChange={(e) => { setPassphrase(e.target.value); setOutput(null); }}
            autoComplete="off" spellCheck={false} placeholder="Use a long passphrase" data-testid="input-passphrase" />
          <button type="button" className="gs-show" onClick={() => setShowPass(!showPass)} aria-pressed={showPass} aria-label={showPass ? 'Hide passphrase' : 'Show passphrase'}>
            {showPass ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}{showPass ? 'Hide' : 'Show'}
          </button>
        </div>
        <button type="submit" className="gs-breach" disabled={!input || !passphrase || busy} data-testid="button-run-encryption">
          {mode === 'encrypt' ? <Lock size={16} aria-hidden="true" /> : <LockOpen size={16} aria-hidden="true" />}
          {busy ? 'Deriving key…' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </button>
      </form>
      <div aria-live="polite">
        {output && (output.ok ? (
          <>
            <p className="gs-input-label">{mode === 'encrypt' ? 'Encrypted text (safe to share; useless without the passphrase)' : 'Decrypted message'}</p>
            <output className="gs-code" data-testid="text-encryption-output">{output.text}</output>
            <div className="gs-actions"><CopyButton text={output.text} what={mode === 'encrypt' ? 'Encrypted text' : 'Message'} testId="button-copy-encryption" /></div>
          </>
        ) : <Notice tone="bad" title="Couldn’t decrypt">{ERRORS[output.error]}</Notice>)}
      </div>
    </ToolPanel>
  );
}
