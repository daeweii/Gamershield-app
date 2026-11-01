# Sentrix

A free, privacy-first cybersecurity toolkit and learning platform that runs entirely in the browser. Formerly GamerShield. Live at https://daeweii.github.io/Gamershield-app/

## Run & Operate

- `pnpm --filter @workspace/gamershield run dev` — run the site (Replit sets PORT and BASE_PATH)
- `pnpm --filter @workspace/gamershield run test` — unit tests (Node's built-in runner)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build
- Deployment: GitHub Actions builds and publishes to GitHub Pages on every push to `main`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React 19, Vite 7, wouter, Radix UI, cmdk, lucide-react
- Browser Web Crypto API for all cryptography
- **No backend and no database, by design.** The template's Express API server and Postgres/Drizzle packages were removed. Don't add them back.

## Where things live

- `artifacts/gamershield/src/lib/security/` — security logic (no UI), with tests
- `artifacts/gamershield/src/lib/network/` — IP, subnet, and DNS logic, with tests
- `artifacts/gamershield/src/lib/platform/` — tool registry, search, saved preferences, tips
- `artifacts/gamershield/src/components/tools/` — one component per tool
- `artifacts/gamershield/src/pages/` — pages; routes are in `src/App.tsx`
- `artifacts/gamershield/src/generator/` — standalone offline password generator page (`/generator/`)
- `artifacts/gamershield/src/index.css` — Sentrix design tokens (light and dark)
- `SECURITY.md` — privacy promises and every outside service the site contacts

## Architecture decisions

- Everything runs client-side. Nothing a user types is saved or sent, except three opt-in requests: the HIBP breach check (5-character hash prefix), Cloudflare DNS-over-HTTPS lookups, and api.ipify.org for "show my IP".
- New tools are added in `src/lib/platform/registry.ts` (one entry) plus a component mapped in `src/pages/ToolPage.tsx`.
- Only preferences and tool IDs go in localStorage (keys in `src/lib/platform/storage.ts`), always sanitized on read.
- No custom cryptography; Web Crypto only.

## Product

Password security, cryptography, networking, and security-awareness tools (20 working), with a Learning Center and Cyber Labs planned. See README.md for the roadmap.

## User preferences

- Privacy is the top rule: client-side only, no accounts, no analytics, no tracking.
- Code should be clean and well commented; the owner is a cybersecurity student who explains it in interviews.
- Red, black, and white branding; tools that don't work yet must be labeled as planned, never faked.

## Gotchas

- `pnpm-workspace.yaml` installs Linux build binaries only (Replit), so the dev server and build don't run on Windows without WSL. Tests and typecheck do.
- The `vite.config.ts` requires PORT and BASE_PATH environment variables, even for builds.
