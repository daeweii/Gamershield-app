import { useMemo, useState } from 'react';
import { Binary } from 'lucide-react';
import { base64Decode, base64Encode, type Base64Error } from '@/lib/security/crypto';
import { ToolPanel } from './ToolPanel';
import { CopyButton, ModeSwitch, Notice } from './shared';

const ERRORS: Record<Base64Error, string> = {
  'empty': 'Paste some Base64 to decode.',
  'invalid-characters': 'That contains characters Base64 never uses. Base64 only uses A–Z, a–z, 0–9, + and / (or - and _ in the URL-safe form), with = padding at the end.',
  'invalid-length': 'The length doesn’t work for Base64. Part of it may be missing or cut off.',
  'not-text': 'This decodes to binary data (like an image or a file), not readable text, so it can’t be shown here.',
};

export function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);

  const result = useMemo(() => {
    if (!input) return null;
    return mode === 'encode' ? { ok: true as const, text: base64Encode(input, urlSafe) } : base64Decode(input);
  }, [input, mode, urlSafe]);

  return (
    <ToolPanel id="base64" icon={Binary} title="Text Encoder & Decoder">
      <ModeSwitch name="b64mode" label="Encode or decode" value={mode} onChange={(m) => { setMode(m); setInput(result?.ok ? result.text : ''); }}
        options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]} />
      <Notice tone="warn" title="Base64 is encoding, not encryption">Anyone can decode it instantly, with no key. Never use it to hide passwords or secrets.</Notice>
      <label className="gs-input-label" htmlFor="b64-input">{mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}</label>
      <textarea id="b64-input" className="gs-textarea" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
        placeholder={mode === 'encode' ? 'Hello, Sentrix!' : 'SGVsbG8sIFNlbnRyaXgh'} data-testid="input-base64" />
      {mode === 'encode' && (
        <label className="gs-hint" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} data-testid="check-urlsafe" />
          URL-safe (uses - and _ instead of + and /, no padding)
        </label>
      )}
      {result && (result.ok ? (
        <>
          <p className="gs-input-label">{mode === 'encode' ? 'Base64' : 'Decoded text'}</p>
          <output className="gs-code" data-testid="text-base64-output">{result.text}</output>
          <div className="gs-actions"><CopyButton text={result.text} what="Result" testId="button-copy-base64" /></div>
        </>
      ) : (
        <Notice tone="bad" title="Can’t decode this">{ERRORS[result.error]}{result.detail ? ` (found “${result.detail}”)` : ''}</Notice>
      ))}
    </ToolPanel>
  );
}
