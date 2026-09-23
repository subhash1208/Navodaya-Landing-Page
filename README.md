# Navodaya Industries — Landing Page

Marketing site and product catalogue for Navodaya Industries, a B2B supplier of hygiene,
hospitality, and care-kit products based in Gandhi Nagar, Hyderabad.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · GSAP / Motion / Lenis
· Vitest · Playwright

## Prerequisites

This project uses **pnpm**. Do not run `npm` or `npx` here — `npm install` would create a
competing `package-lock.json` and a flat `node_modules`, breaking pnpm's linked store.

Toolchain versions are pinned in `mise.toml` (node 26.5.0, pnpm 11.12.0). With
[mise](https://mise.jdx.dev) installed, `mise install` gets you the right versions.

```bash
pnpm install
pnpm exec playwright install   # browser binaries, needed for pnpm test:e2e
```

## Getting Started

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Entry point is `src/app/page.tsx`.

## Commands

```bash
pnpm dev              # dev server
pnpm build            # production build
pnpm start            # serve the production build

pnpm format           # auto-fix formatting
pnpm format:check     # check formatting, no writes
pnpm lint             # eslint
pnpm exec tsc --noEmit  # typecheck (there is no `type-check` script)

pnpm test             # unit tests, once
pnpm test:watch       # unit tests, watch mode
pnpm test:coverage    # unit tests with coverage (90% threshold, enforced)
pnpm test:e2e         # Playwright e2e
pnpm test:e2e:ui      # Playwright in UI mode
```

## Structure

```
src/app/          routes, layouts, server actions
src/components/   layout/ · sections/ · ui/
src/hooks/        useTypewriter, useMagneticHover, ...
src/constants/    design tokens, content
src/utils/        cn() class merger
src/types/        shared TypeScript types
src/__tests__/    unit tests, mirroring src/ paths
e2e/              Playwright specs
```

## Environment

The contact form uses [Resend](https://resend.com) via a server action
(`src/app/actions/contact.ts`). No environment file is committed; without
`RESEND_API_KEY` set the action short-circuits to a success response and logs the
payload instead of sending mail, which is what keeps the e2e suite hermetic.

> Do not set `RESEND_API_KEY` in an environment where you run `pnpm test:e2e` — the
> contact-form spec submits a real enquiry, which would email the live business inbox.

## Before you commit

`.husky/pre-commit` independently runs `prettier --check .`, `eslint .`, and
`vitest run --coverage`. A commit is blocked if any fails. The 90% coverage threshold in
`vitest.config.mts` is **project-wide**, so adding an untested file can block a commit
even when your own diff is fully covered.

Never use `--no-verify`. Full gate table: `.github/instructions/quality-gates.instructions.md`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). If you are an AI agent working in this repo,
start with [AGENTS.md](AGENTS.md).
