# Security

GamerShield is built so that nothing you type leaves your device. This file
explains how that works, for the whole site and in detail for the password
generator page (`/generator/`).

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

## Rest of the site
- The Password Check hashes the password with SHA-1 in the browser and sends
  only the first 5 hex characters to Have I Been Pwned (k-anonymity), with
  response padding on. The password and full hash never leave the device.
- The link and message checkers read input as text and never open links.
- User input is always rendered as text by React, never as HTML.

## Known limitations
- The Replit template includes an unused Express server (`artifacts/api-server`)
  and database package (`lib/db`). The site doesn't use them; they should be
  removed before public deployment.
- The Content Security Policy is set with a `<meta>` tag, so it can't include
  `frame-ancestors`. Set real HTTP headers if the host allows it.

## Reporting a problem
Open an issue on the GitHub repository. Please don't include real passwords.
