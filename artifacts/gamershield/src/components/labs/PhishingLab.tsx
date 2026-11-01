import { useState } from 'react';
import { CheckCircle2, Mail, XCircle } from 'lucide-react';
import { SIM_EMAILS } from '@/content/labs';
import { completeLab } from '@/hooks/use-labs';

type Verdict = 'phishing' | 'legit';

export function PhishingLab() {
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const answered = Object.keys(verdicts).length;
  const correct = SIM_EMAILS.filter((e) => verdicts[e.id] === (e.phishing ? 'phishing' : 'legit')).length;
  const finished = answered === SIM_EMAILS.length;

  function decide(id: string, verdict: Verdict) {
    const next = { ...verdicts, [id]: verdict };
    setVerdicts(next);
    if (Object.keys(next).length === SIM_EMAILS.length) completeLab('phishing-simulation');
  }

  return (
    <div className="sx-stack">
      <p className="sx-badge sx-badge-red" style={{ justifySelf: 'start' }}>Simulation · all emails are fictional</p>
      {SIM_EMAILS.map((email, i) => {
        const verdict = verdicts[email.id];
        const right = verdict && verdict === (email.phishing ? 'phishing' : 'legit');
        return (
          <article key={email.id} className="sx-card sx-email" data-testid={`email-${email.id}`} aria-labelledby={`email-${email.id}-subject`}>
            <p className="sx-email-meta"><Mail size={15} aria-hidden="true" /> Email {i + 1} of {SIM_EMAILS.length}</p>
            <dl className="gs-kv" style={{ marginTop: 8 }}>
              <div><dt>From</dt><dd>{email.from}</dd></div>
              <div><dt>Subject</dt><dd id={`email-${email.id}-subject`}>{email.subject}</dd></div>
            </dl>
            <p className="sx-email-body">{email.body}</p>
            {email.link && (
              <p className="sx-email-link">
                Link text: <span className="sx-fake-link">{email.link.text}</span> → really goes to <code>{email.link.href}</code>
              </p>
            )}
            {!verdict ? (
              <div className="gs-actions">
                <button type="button" className="gs-breach" onClick={() => decide(email.id, 'phishing')} data-testid={`verdict-${email.id}-phishing`}>Phishing</button>
                <button type="button" className="gs-secondary" onClick={() => decide(email.id, 'legit')} data-testid={`verdict-${email.id}-legit`}>Legitimate</button>
              </div>
            ) : (
              <div className={`gs-result${right ? '' : ' alert'}`} role="status">
                <strong>{right ? <CheckCircle2 size={15} aria-hidden="true" /> : <XCircle size={15} aria-hidden="true" />} {right ? 'Correct' : 'Not quite'}: this is {email.phishing ? 'phishing' : 'legitimate'}.</strong>
                <ul>{email.clues.map((c) => <li key={c}>{c}</li>)}</ul>
              </div>
            )}
          </article>
        );
      })}
      <div aria-live="polite">
        {finished && (
          <div className="gs-result" data-testid="phishing-score">
            <strong>You scored {correct} of {SIM_EMAILS.length}. Lab complete.</strong>
            The habit that beats nearly every phish: check the sender’s real domain and the link’s real destination, and never give a password or code to a message.
          </div>
        )}
      </div>
    </div>
  );
}
