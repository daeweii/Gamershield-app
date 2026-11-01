# Sentrix architecture

Sentrix is a static, client-side React app. There is no backend: GitHub Pages
serves built files, and everything runs in the visitor's browser.

## Layers

```
src/
  lib/            Pure logic, no React. Every module here has tests.
    security/     Password checks, generator rules, crypto (Web Crypto), link/message/URL analysis
    network/      IP classification, subnet math, DNS-over-HTTPS client
    learning/     Quiz scoring and learning progress
    labs/         Terminal simulator engine, password and hash analysis for labs
    platform/     Tool registry, search, saved preferences, tips, theme
  content/        Data: lessons, labs, guides, checklist, glossary, help text
  hooks/          Small stores that connect saved data to React (useSentrix, useLearning, useLabs)
  components/     UI: app shell, sidebar, search, tool screens, lab screens
  pages/          One component per route
  generator/      Standalone offline password generator page (its own entry and CSP)
```

UI code never calls `fetch` or `localStorage` directly; it goes through `lib/`
and `hooks/`, which keeps security-sensitive code in one reviewable place.

## Key decisions

- **One registry drives everything.** `lib/platform/registry.ts` lists every
  section and tool. Navigation, search, category pages, favorites, and the
  build's route pages all read from it. Lessons and labs are data in `content/`.
- **Privacy by construction.** Tools run locally. Only three opt-in features
  contact a service (HIBP, Cloudflare DoH, ipify), and the Content Security
  Policy (`vite.config.ts`) blocks every other destination.
- **Untrusted storage.** Anything read from `localStorage` is validated against
  known IDs and types before use. Only preferences and progress IDs are stored.
- **No custom cryptography.** All hashing, encryption, and randomness use the
  browser's Web Crypto API.
- **Static hosting with real routes.** The build writes an `index.html` for
  every route so deep links return 200; `404.html` handles unknown paths.

## Testing

`pnpm --filter @workspace/gamershield run test` runs the unit tests in
`src/lib/**/*.test.ts` with Node's built-in runner (no test dependencies).
CI (`.github/workflows/pages.yml`) runs a dependency audit, typecheck, tests,
and build on every push and pull request, and deploys `main` only if all pass.

Manual checks before each release: click through every tool and lab in a
production build, check phone width (375px) for overflow, and confirm the
browser console shows no CSP violations.

## Adding things

- **A tool:** add an entry to `TOOLS` in `registry.ts`, write the logic in
  `lib/` with tests, build the screen in `components/tools/`, and map it in
  `pages/ToolPage.tsx`. It gets search, a route page, and favorites automatically.
- **A lesson:** add an object to `LESSONS` in `content/lessons.ts`. Tests check
  that every quiz answer is valid and explained.
- **A lab:** add it to `LABS` in `content/labs.ts`, build its component in
  `components/labs/`, and map it in `pages/LabsPage.tsx`.
