# GamerShield security logic

The rules behind every GamerShield tool live here, separate from the UI.
UI components import these functions and only handle how results look.

**Privacy rule:** nothing in this folder makes network requests, saves data, or
logs input. Keep it that way. (The HIBP breach check lives in `App.tsx` and
sends only a 5-character hash prefix.)

## What's here

| File | Use it for | Main exports |
|---|---|---|
| `generator.ts` | Password Generator | `generatePassword()`, `generatePassphrase()`, `passwordBits()`, `passphraseBits()`, `describeBits(bits)` |
| `links.ts` | Scam Link Checker | `checkLink(text)` returns a list of warnings; empty list = official site |
| `messages.ts` | Scam Message Checker | `checkMessage(text)` returns a list of reasons; empty list = no scam phrases |
| `checkup.ts` | Account Security Checkup | `CHECKUP_QUESTIONS`, `scoreCheckup(answers)` returns `{ percent, grade, fixes }` |
| `guides.ts` | 2FA Setup Guides | `PLATFORMS`, `TWO_FA_GUIDES[platform]` gives `{ steps, helpUrl }`, `MENUS_CHANGE_NOTE` |
| `passwordRules.ts` | Full generator page (`/generator/`) | `generateBatch(settings, n)`, `findProblems(settings)`, `estimateStrength(settings)`, `formatForCopy(pw, format)`, `applyPreset()`, `sanitizeSettings()` |
| `wordlist.ts` | Passphrase words | `WORDS` (493 unique words, about 60 bits for 6 words) |

Import everything from the folder:

```ts
import { checkLink, generatePassphrase, scoreCheckup } from '@/lib/security';
```

## Examples

```ts
checkLink('steamcommunlty.com');
// ['Looks like a FAKE copy of steamcommunity.com. Real sites never misspell their own name.']

checkMessage('i accidentally reported you, send me your login code');
// ["The 'I accidentally reported you' scam...", 'Never share a login code with anyone.']

scoreCheckup([true, true, true, true, false, false, false]);
// { percent: 57, grade: 'AT RISK', fixes: [3 fixes, most important first] }

const bits = passphraseBits();      // about 60.1
describeBits(bits);                 // { verdict: 'STRONG', explanation: '...' }
```

## Rules for UI code

- Show user input and results as text in JSX (`{warning}`). Never use
  `dangerouslySetInnerHTML`. React escapes text, which blocks XSS.
- Never turn a pasted link into a clickable `<a href>`. The checker reads links
  as text; the page should never open them.
- 2FA `helpUrl`s are fixed official links, so they are safe to render as links
  with `target="_blank" rel="noopener noreferrer"`.
- For copy-to-clipboard on generated passwords, use `navigator.clipboard.writeText()`.

## Tests

```bash
pnpm --filter @workspace/gamershield run test
```

Uses Node's built-in test runner, so there are no extra dependencies.
