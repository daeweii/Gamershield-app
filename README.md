# Sentrix

**A free, privacy-first cybersecurity toolkit and learning platform that runs entirely in your browser.**

**Live site:** https://daeweii.github.io/Sentrix/

Sentrix started as GamerShield, a tool to help gamers protect their accounts after I was hacked on PlayStation in middle school. It's growing into an all-in-one platform for practical security tools, lessons, and hands-on labs.

## Features (working today)

| Category | Tools |
|---|---|
| Password Security | Password Strength Checker (with k-anonymity breach check), Password Generator (offline), Passphrase Generator, 2FA Setup Guides, Password Security Guide |
| Cryptography | Hash Generator (SHA-256/384/512/1), Text Encoder & Decoder (Base64), Encryption & Decryption (AES-256-GCM + PBKDF2), File Hash Checker |
| Networking | IP Information (IPv4/IPv6 classification, opt-in "my IP"), DNS Lookup (DNS-over-HTTPS), Subnet Calculator, Network Terminology & common ports |
| Security Awareness | Scam Link Checker, Scam Message Checker (with practice samples), URL Safety Inspector, Account Security Checkup, Security Checklist, File Safety Guide |

**Learning Center:** a Beginner path of 5 lessons (intro to cybersecurity, passwords and MFA, phishing, networking, hashing vs. encryption), each with flashcards and a quiz that explains every answer. Progress is saved on your device and shown on the Dashboard.

**Cyber Labs:** three hands-on simulations with fictional data: a Phishing Simulation (sort emails and see the clues), a Log Analysis investigation (trace a brute-force attack to a compromised account), and a Terminal Simulator (a safe pretend Linux shell with guided tasks; nothing is ever executed).

Plus: global search (Ctrl+K), favorites, recently used tools, a daily security tip, light and dark themes, and a collapsible sidebar that becomes a drawer on phones.

## Privacy

- No accounts, no server, no analytics, no tracking.
- Nothing typed into a tool is saved. Only three opt-in buttons contact outside services (the breach check, DNS lookups, and "show my IP"), and each says exactly what it sends.
- Only preferences (favorite tool IDs, theme, and similar) are saved in your browser, and Settings can erase them.
- A strict Content Security Policy limits every page to Sentrix's own code and the three services above.
- Zero known vulnerabilities in dependencies; CI audits every change and Dependabot proposes updates.

Details: [SECURITY.md](SECURITY.md).

## Tech stack

React 19, TypeScript, Vite, and wouter, with Radix UI and cmdk for accessible dialogs and search. Security features use the browser's Web Crypto API. Hosted on GitHub Pages and deployed by GitHub Actions.

## Project structure

```
artifacts/gamershield/
  src/lib/security/     Security logic (no UI), with tests
  src/lib/platform/     Tool registry, search, saved preferences, tips, with tests
  src/lib/network/      IP analysis, subnet math, and the DNS client, with tests
  src/content/          Guides, checklists, glossary, and help text
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

85 unit tests run on Node's built-in test runner, with no extra dependencies. They cover the password generator, strength scoring, the breach-check request (only the hash prefix is sent), hashing against NIST test vectors, Base64, AES-GCM round-trips and tamper detection, IPv4/IPv6 classification, subnet math, the DNS client, URL dissection, link and message checks, the site-rules engine, copy-format escaping, search, and saved-data sanitizing. Every push and pull request runs a dependency audit, the typecheck, the tests, and the build; `main` deploys only if all pass.

## Roadmap

| Phase | Focus | Status |
|---|---|---|
| 1 | Foundation: design system, themes, sidebar, routing, search, dashboard | Done |
| 2 | Core tools: hashing, Base64, AES encryption, file hashes, subnet calculator, DNS and IP info, guides | Done |
| 3 | Learning Center: lessons, quizzes, flashcards, progress | Beginner path done; Intermediate and Advanced next |
| 4 | Cyber Labs: log analysis, phishing, crypto, networking, safe terminal simulator | 3 labs done; 4 more planned |
| 5 | Personalization: profiles, achievements, dashboard customization | Planned |
| 6 | Launch: security review, dependency audit, full documentation | In progress (CSP, audits, Dependabot done) |

## Author

Sidney Nelms, Cybersecurity major at South Carolina State University.
