import { useEffect, useState } from 'react';
import { CRYPTO_LAB_QUIZ } from '@/content/labs';
import { base64Encode, encryptText, hashText } from '@/lib/security/crypto';
import { differingBits } from '@/lib/labs/analysis';
import { completeLab } from '@/hooks/use-labs';
import { QuizBlock } from './QuizBlock';

// A lab-only passphrase so the demo works instantly. Real secrets need a strong passphrase you choose.
const DEMO_PASSPHRASE = 'sentrix-lab-demo';
// Fewer key-derivation rounds than the real tool, so typing stays responsive. Demo only.
const DEMO_ITERATIONS = 10_000;

export function CryptoLab() {
  const [text, setText] = useState('Meet me at 7');
  const [compare, setCompare] = useState('Meet me at 8');
  const [out, setOut] = useState({ b64: '', hash: '', hash2: '', enc: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [hash, hash2, enc] = await Promise.all([hashText('SHA-256', text), hashText('SHA-256', compare), encryptText(text || ' ', DEMO_PASSPHRASE, DEMO_ITERATIONS)]);
      if (!cancelled) setOut({ b64: base64Encode(text), hash, hash2, enc });
    })();
    return () => { cancelled = true; };
  }, [text, compare]);

  const changed = out.hash && out.hash2 ? differingBits(out.hash, out.hash2) : 0;

  return (
    <div className="sx-stack">
      <section className="sx-card" aria-labelledby="crypto-lab-heading">
        <h2 id="crypto-lab-heading" style={{ fontSize: 18, marginBottom: 8 }}>One input, three transformations</h2>
        <input className="gs-input" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} aria-label="Input text" data-testid="input-crypto-lab" />
        <dl className="gs-kv" data-testid="crypto-outputs">
          <div><dt>Base64 (encoding)</dt><dd>{out.b64}</dd></div>
          <div><dt>SHA-256 (hash)</dt><dd>{out.hash}</dd></div>
          <div><dt>AES-256-GCM (encryption)</dt><dd>{out.enc}</dd></div>
        </dl>
        <p className="gs-hint">Edit the text: Base64 changes a little, the hash changes completely, and the encryption changes every time, even for the same text, because of the random salt and IV.</p>
      </section>
      <section className="sx-card" aria-labelledby="avalanche-heading">
        <h2 id="avalanche-heading" style={{ fontSize: 18, marginBottom: 8 }}>The avalanche effect</h2>
        <p className="gs-hint" style={{ marginTop: 0 }}>Change one character below and compare the two SHA-256 hashes.</p>
        <input className="gs-input" value={compare} onChange={(e) => setCompare(e.target.value)} spellCheck={false} aria-label="Comparison text" data-testid="input-crypto-compare" />
        <p className="gs-input-label" data-testid="avalanche-result">{changed} of 256 bits differ ({Math.round((changed / 256) * 100)}%)</p>
        <div className="gs-progress" aria-hidden="true"><span style={{ width: `${(changed / 256) * 100}%` }} /></div>
        <p className="gs-hint">A good hash flips about half the bits for any change, so similar inputs never produce similar hashes.</p>
      </section>
      <QuizBlock id="cryptolab" title="Knowledge check" questions={CRYPTO_LAB_QUIZ} onPass={() => completeLab('crypto-lab')} />
    </div>
  );
}
