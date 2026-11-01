# Security

Sentrix (formerly GamerShield) is built so that nothing you type leaves your
device. This file explains how that works, for the whole site and in detail
for the password generator page (`/generator/`).

## Password generator

### Random source
Every character, word, and digit comes from the browser's cryptographically
secure random number generator, `crypto.getRandomValues()`
([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)).
`Math.random()` is never used.

Mapping random numbers to characters is unbiased. `randomBelow()` in
`artifacts/gamershield/src/lib/security/generator.ts` uses rejection sampling:
32-bit values that would make some characters slightly more likely are thrown
away and drawn again. When a rule requires certain character types, whole
passwords that miss them are discarded and regenerated, so every valid
password is equally likely.

### Do passwords leave the device?
No. The generator makes no network requests with passwords or settings: no
analytics, no tracking, no accounts. Generated passwords exist only in the
page's memory (React state) for the current batch. They are not saved, logged,
or kept as history. Generating again, reloading, or closing the page discards
them.

In the production build, the page sets a Content Security Policy
(`vite.config.ts`, `generatorSecurityHeaders`) that only allows the site's own
scripts and styles and only same-origin connections. Even injected code could
not send a password to another site.

Copying puts a password on the system clipboard. Some systems keep clipboard
history or sync it to other devices; the page warns about this.

### What is saved
Only preferences, in `localStorage` under `gamershield.generator.prefs.v1`:
mode, lengths, character choices, passphrase options, site rules, batch size,
copy format, `.env` variable name, and whether the walkthrough has been seen.
Passwords are never saved. Saved values are treated as untrusted and
sanitized on load (`sanitizeSettings()`). **Privacy & How It Works → Reset
preferences** deletes them. If storage is blocked, the page still works and
simply doesn't remember settings.

### Offline use
Supported in the built, published site (not the development server). After
the first visit, a service worker (`public/generator/sw.js`) saves the page's
own files (HTML, JS, CSS, icons) so the generator works without internet.
The service worker is scoped to `/generator/`, never handles passwords, and
loads the page network-first, so updates arrive when online. Offline use was
verified by building the site, loading it once, stopping the server, and
reloading: the page loaded and generated passwords with no server running.

The page also has a web app manifest and icons, so browsers that support
installing web apps (such as Chrome and Edge) can offer to install it. The
"Install as an app" button only appears when the browser says installing is
possible. The install prompt itself has not been tested yet.

### Strength estimate: what it does and doesn't mean
The estimate counts how many passwords the chosen settings could produce and
shows it in bits (log2 of that count). It considers length, the size of the
character pool, required character types (counted exactly with
inclusion-exclusion), passphrase word count and list size, and the optional
number. It assumes an attacker knows your settings, which is the honest worst
case.

It is an estimate of the method, not of a typed password. It does not give a
"time to crack", because that depends on how each website stores passwords.
It also cannot account for reuse, phishing, or how a password is stored. The
page follows [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html)
guidance: length over composition rules, so character-type requirements are
off by default.

### Copy formats
- **Plain text:** the password as is.
- **JSON string:** `JSON.stringify()`, which escapes quotes, backslashes, and
  control characters.
- **.env line:** `NAME="value"` with shell-style double-quote escaping of
  `\`, `"`, `$`, and `` ` ``. Shells, Docker Compose, and python-dotenv read
  this back exactly; some other `.env` parsers handle escapes differently.

## What the main app saves
Only preferences, in `localStorage`, never anything typed into a tool:

| Key | Contents |
|---|---|
| `sentrix.favorites.v1` | IDs of starred tools |
| `sentrix.recent.v1` | IDs of the last 6 tools opened |
| `sentrix.theme.v1` | `light`, `dark`, or `system` |
| `sentrix.sidebar.v1` | `collapsed` or `expanded` |
| `sentrix.checklist.v1` | IDs of ticked Security Checklist items |
| `sentrix.learning.v1` | Completed lesson IDs and best quiz scores (never quiz answers) |
| `sentrix.labs.v1` | IDs of completed Cyber Labs |

The Terminal Simulator never executes anything: commands are matched against a fixed table and answered from a fictional file system defined in code (`src/lib/labs/terminal.ts`), and tests confirm shell tricks like `;`, `&&`, and `$(...)` are treated as plain text.

Saved values are treated as untrusted on read: unknown tool IDs, duplicates,
and malformed data are dropped (`parseToolIds()` in
`src/lib/platform/storage.ts`, covered by tests). **Settings → Reset
everything** removes all of these plus the generator's preferences.

## Outside services
Sentrix has no backend. Three tools contact a public service, each only when
the user presses a button, and each tool says so next to that button:

| Tool | Service | What is sent | What the service sees |
|---|---|---|---|
| Password Strength Checker (breach check) | `api.pwnedpasswords.com` | First 5 hex characters of the password's SHA-1 hash | That prefix and your IP. Never the password or full hash (k-anonymity, with response padding). |
| DNS Lookup | `cloudflare-dns.com` (DNS-over-HTTPS) | The domain name and record type | The domain and your IP, like any DNS resolver |
| IP Information ("Show my public IP") | `api.ipify.org` | An empty request | Your IP (which it echoes back). No location lookup. |

All three requests omit cookies (`credentials: 'omit'`) and the DNS and IP requests
send no referrer. Every other tool runs entirely on the device: hashing, Base64,
encryption, file hashing, subnet math, IP analysis, URL inspection, and the
link and message checkers.

## Encryption tool
The Encryption & Decryption tool is educational but uses real, standard
cryptography through Web Crypto: PBKDF2-SHA-256 with 600,000 iterations
(OWASP's recommendation) and a random 16-byte salt derives a non-extractable
AES-256 key; AES-GCM with a random 12-byte IV encrypts and authenticates the
text. Output is `SNTX1.` + Base64(salt, IV, ciphertext + tag). Limits: security
depends on passphrase strength, there is no recovery, and the key exists in
browser memory while the page is open. No custom cryptography is used anywhere.

## File hashing
Files are read with the File API and hashed in memory; they are never
uploaded. Files over 1 GB are refused to avoid freezing the tab.

## Rest of the site
- The Password Check hashes the password with SHA-1 in the browser and sends
  only the first 5 hex characters to Have I Been Pwned (k-anonymity), with
  response padding on. The password and full hash never leave the device.
- The link and message checkers read input as text and never open links.
- User input is always rendered as text by React, never as HTML.

## Content Security Policy
Every built page carries a Content Security Policy (`securityHeaders()` in
`artifacts/gamershield/vite.config.ts`):

- **Main site:** scripts only from Sentrix itself; network connections only to
  Sentrix plus `api.pwnedpasswords.com`, `cloudflare-dns.com`, and
  `api.ipify.org`; no plugins, no `<base>` changes, no form submissions.
  `style-src` allows inline styles because Radix dialogs inject a small style
  tag to lock scrolling; inline styles can't run code.
- **Password generator:** stricter still: no outside connections at all.

Verified in a browser: every tool works with zero violations, and a test
request to an unlisted site was blocked.

## Dependency security
- `pnpm audit` reports no known vulnerabilities in shipped or build-time
  dependencies (as of this change).
- CI runs `pnpm audit --prod` on every push and pull request and refuses to
  deploy if a shipped dependency has a known vulnerability. The full audit
  (including build tools) is reported but doesn't block.
- Dependabot opens weekly update pull requests (with a 7-day cooldown on new
  releases) and monthly updates for the pinned GitHub Actions. Each runs the
  full CI checks before it can be merged.
- `pnpm-workspace.yaml` refuses packages published less than a day ago, and
  only allow-listed packages may run install scripts.
- The unused template server, database packages, `zod`, and the
  `@tailwindcss/typography` plugin were removed to shrink the attack surface.

## Known limitations
- The Content Security Policy is set with a `<meta>` tag, so it can't include
  `frame-ancestors`. Set real HTTP headers if the host allows it.

## Security review (Phase 6)
A source review of `artifacts/gamershield/src` found:
- No HTML injection sinks: no `innerHTML`, `dangerouslySetInnerHTML`, or `document.write`. All user input renders as text through React.
- No dynamic code execution: no `eval`, `new Function`, or string timers.
- Every `target="_blank"` link uses `rel="noopener noreferrer"`.
- Randomness only from `crypto.getRandomValues`; `Math.random` is never used.
- No logging of user data.
- All `localStorage` access goes through sanitizing helpers.
- Network calls only to the three documented services, matching the CSP.
- The Terminal Simulator executes nothing; tests cover shell-injection strings.
- `pnpm audit`: no known vulnerabilities in shipped or build dependencies.

## Reporting a problem
Open an issue on the GitHub repository. Please don't include real passwords.
