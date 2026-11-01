# Sentrix

**A free, privacy-first cybersecurity toolkit and learning platform that runs entirely in your browser.**

**Live site:** https://daeweii.github.io/Gamershield-app/

Sentrix started as GamerShield, a tool to help gamers protect their accounts after I was hacked on PlayStation in middle school. It's growing into an all-in-one platform for practical security tools, lessons, and hands-on labs.

## Features (working today)

| Category | Tool | What it does |
|---|---|---|
| Password Security | Password Strength Checker | Local strength estimate plus an optional Have I Been Pwned breach check using k-anonymity (only a 5-character hash prefix is sent) |
| Password Security | Password Generator | Random passwords, passphrases, PINs, and site-specific rules; copy as text, JSON, or `.env`; works offline |
| Password Security | 2FA Setup Guides | Step-by-step 2FA for PlayStation, Xbox, Discord, Steam, Epic Games, and Roblox |
| Security Awareness | Scam Link Checker | Flags look-alike domains (including punycode homographs), shorteners, raw IPs, and bait words without opening the link |
| Security Awareness | Scam Message Checker | Spots common scam and phishing phrases in DMs |
| Security Awareness | Account Security Checkup | Seven questions, a score, and a prioritized fix list |

Plus: global search (Ctrl+K), favorites, recently used tools, a daily security tip, light and dark themes, and a collapsible sidebar that becomes a drawer on phones.

## Privacy

- No accounts, no server, no analytics, no tracking.
- Nothing typed into a tool is saved or sent anywhere, except the optional breach check's 5-character hash prefix.
- Only preferences (favorite tool IDs, theme, and similar) are saved in your browser, and Settings can erase them.

Details: [SECURITY.md](SECURITY.md).

## Tech stack

React 19, TypeScript, Vite, and wouter, with Radix UI and cmdk for accessible dialogs and search. Security features use the browser's Web Crypto API. Hosted on GitHub Pages and deployed by GitHub Actions.

## Project structure

```
artifacts/gamershield/
  src/lib/security/     Security logic (no UI), with tests
  src/lib/platform/     Tool registry, search, saved preferences, tips, with tests
  src/components/       Shell, sidebar, search, cards, and tool UIs
  src/pages/            One page per section and tool
  src/generator/        Standalone offline password generator page
.github/workflows/      Typecheck, test, build, and deploy
```

## Run it locally

Requires Node.js 24 and pnpm 10, on Linux or macOS (or Replit). The workspace config installs Linux build binaries only, so on Windows the tests and typecheck work, but the dev server and build need WSL.

```bash
pnpm install
pnpm --filter @workspace/gamershield run test
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/gamershield run dev
```

## Testing

50 unit tests run on Node's built-in test runner, with no extra dependencies. They cover the password generator, strength scoring, the breach-check request (only the hash prefix is sent), link and message checks, the site-rules engine, copy-format escaping, search, saved-data sanitizing, and the tip of the day. Every push to `main` runs the typecheck, tests, and build before deploying.

## Roadmap

| Phase | Focus | Status |
|---|---|---|
| 1 | Foundation: design system, themes, sidebar, routing, search, dashboard | Done |
| 2 | Core tools: hashing, Base64, AES encryption, file hashes, subnet calculator, DNS and IP info, guides | Next |
| 3 | Learning Center: lessons, quizzes, flashcards, progress | Planned |
| 4 | Cyber Labs: log analysis, phishing, crypto, networking, safe terminal simulator | Planned |
| 5 | Personalization: profiles, achievements, dashboard customization | Planned |
| 6 | Launch: security review, dependency audit, full documentation | Planned |

## Author

Sidney Nelms, Cybersecurity major at South Carolina State University.
