---
description: 'Best practices for building Next.js (App Router) apps with modern caching, tooling, and server/client boundaries (aligned with Next.js 16.1.1).'
applyTo: 'src/**/*.tsx, src/**/*.ts, next.config.ts'
---

<!--
  Vendored from github/awesome-copilot (MIT) — instructions/nextjs.instructions.md
  Local edits: applyTo narrowed to src/ TS only; repo overrides added below; §5 (API
  Routes) and §7 (Cache Components) reduced to stubs, and the Jest/Cache-Components
  lines in §6 corrected, because this file loads on EVERY src/**/*.ts(x) task and those
  sections describe surfaces this repo does not have. Later passes also corrected the
  two "co-locate tests" claims in §1 and §3 in place (the overrides table alone was not
  enough — testing.instructions.md does not load on these paths), added a §2.1 note that
  bare option-less dynamic() is deliberate here, and added the RESEND_API_KEY sentinel to
  §6. Section numbering is preserved so the overrides table's §-references still resolve.
  No longer byte-diffable against upstream — that tradeoff was made deliberately; see the
  overrides table.
-->

## Repo overrides — these win over anything below

This project is Next.js **16.3.5**; the guide below targets 16.1.1. Where they disagree, `node_modules/next/dist/docs/` is authoritative — it ships with the installed version, so it cannot go stale the way this line can. Check `node_modules/next/package.json` if the number here looks wrong.

| Guide says                                              | This repo does instead                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Co-locate tests with components (`UserCard.test.tsx`)" | Tests live in `src/__tests__/`, mirroring `src/` paths. **Never** co-locate. This correction matters more than a duplicate normally would: `testing.instructions.md` is scoped to `src/__tests__/**`, so it is **not loaded** while you are writing the component and deciding where its test goes. In that moment this file is the only one in context, and the upstream body below says "co-locate" twice. Both occurrences are corrected in place — §1 and §3. |
| "Use Jest, React Testing Library"                       | **Vitest** + Testing Library. Never add Jest.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Top-level `lib/`, `contexts/`, `styles/`                | `src/utils/`, `src/constants/`, `src/types/`. Do not create `lib/`.                                                                                                                                                                                                                                                                                                                                                                                               |
| "Store secrets in `.env.local`" (§6)                    | True in general, incomplete here. Settings-injected `env` **beats** `.env.local`, and `RESEND_API_KEY` is deliberately pinned to a sentinel so gate 7 cannot email the real business inbox. Never delete either one. Detail in §6.                                                                                                                                                                                                                                |
| §5 API Routes                                           | Stubbed out — no route handlers exist here. If you add the first one, read the installed Next docs and pick a validator deliberately.                                                                                                                                                                                                                                                                                                                             |
| §7 Cache Components                                     | Stubbed out — `cacheComponents` is not enabled and `next.config.ts` sets only `images.remotePatterns`. Do not turn it on to satisfy a guide.                                                                                                                                                                                                                                                                                                                      |
| `resolve_library_id` / `get_library_docs` (§10)         | **Those tool names do not exist.** Context7's real tools are `resolve-library-id` and `query-docs` — hyphens, not underscores. The server **is** configured and enabled here. Use it for the parts of this stack the Next.js docs do not cover (React 19, Tailwind, GSAP, Motion, Lenis, Vitest, Playwright); use `node_modules/next/dist/docs/` for Next.js itself.                                                                                              |

Also still binding: compose classes with `cn()`, kill GSAP/ScrollTrigger in effect cleanup, respect `prefers-reduced-motion`, no `any`, pnpm only.

**`next.config.ts` is in this file's `applyTo` on purpose, and was not until now.** The glob read `src/**/*.tsx, src/**/*.ts`, which excludes the repo root — so the two sections here that govern nothing _but_ that file were unreachable from it. §7 says "do not enable `cacheComponents` to satisfy this section" and §8 says to configure Turbopack through the top-level `turbopack` field rather than the removed `experimental.turbo`; the single moment either could change a decision is while `next.config.ts` is open, which was the one moment neither loaded. Bare root filenames are a supported `applyTo` entry — `testing.instructions.md` already lists `vitest.config.mts` and `playwright.config.ts` the same way.

---

# Next.js Best Practices for LLMs (2026)

_Last updated: January 2026 (aligned to Next.js 16.1.1)_

This document summarizes the latest, authoritative best practices for building, structuring, and maintaining Next.js applications. It is intended for use by LLMs and developers to ensure code quality, maintainability, and scalability.

---

## 1. Project Structure & Organization

- **Use the `app/` directory** (App Router) for all new projects. Prefer it over the legacy `pages/` directory.
- **Top-level folders:**
  - `app/` — Routing, layouts, pages, and route handlers
  - `public/` — Static assets (images, fonts, etc.)
  - `lib/` — Shared utilities, API clients, and logic
  - `components/` — Reusable UI components
  - `contexts/` — React context providers
  - `styles/` — Global and modular stylesheets
  - `hooks/` — Custom React hooks
  - `types/` — TypeScript type definitions
- **Colocation:** Place components near where they are used, but avoid deeply nested structures. **Tests are the exception here** — they are never co-located; see §3.
- **Route Groups:** Use parentheses (e.g., `(admin)`) to group routes without affecting the URL path.
- **Private Folders:** Prefix with `_` (e.g., `_internal`) to opt out of routing and signal implementation details.
- **Feature Folders:** For large apps, group by feature (e.g., `app/dashboard/`, `app/auth/`).
- **Use `src/`** (optional): Place all source code in `src/` to separate from config files.

## 2. Next.js 16+ App Router Best Practices

### 2.1. Server and Client Component Integration (App Router)

**Never use `next/dynamic` with `{ ssr: false }` inside a Server Component.** This is not supported and will cause a build/runtime error.

**Correct Approach:**

- If you need to use a Client Component (e.g., a component that uses hooks, browser APIs, or client-only libraries) inside a Server Component, you must:
  1. Move all client-only logic/UI into a dedicated Client Component (with `'use client'` at the top).
  2. Import and use that Client Component directly in the Server Component (no need for `next/dynamic`).
  3. If you need to compose multiple client-only elements (e.g., a navbar with a profile dropdown), create a single Client Component that contains all of them.

**Example:**

```tsx
// Server Component
import DashboardNavbar from '@/components/DashboardNavbar';

export default async function DashboardPage() {
  // ...server logic...
  return (
    <>
      <DashboardNavbar /> {/* This is a Client Component */}
      {/* ...rest of server-rendered page... */}
    </>
  );
}
```

**Why:**

- Server Components cannot use client-only features or dynamic imports with SSR disabled.
- Client Components can be rendered inside Server Components, but not the other way around.

**Summary:**
Always move client-only UI into a Client Component and import it directly in your Server Component. Never use `next/dynamic` with `{ ssr: false }` in a Server Component.

**Repo note — `dynamic()` without options is a different thing, and this repo depends on it.** The rule above is about `{ ssr: false }` specifically. A bare `dynamic(() => import(...))` with **no options object** keeps SSR on; it only splits the chunk, and it is legal in a Server Component. `src/app/page.tsx:6-16` is a Server Component that does exactly this five times — every below-fold section is a `dynamic()` import.

Do not "simplify" those into static imports on the strength of the sentence above ("no need for `next/dynamic`"). That sentence is answering the client-boundary question, not the code-splitting one, and collapsing the five would fold their chunks into the initial bundle — moving the gate 9 bundle baseline for no functional gain. The current figure is recorded in `.github/instructions/quality-gates.instructions.md` and is not repeated here, so this note cannot go stale the way a copied number would. It would also break the timing assumption `e2e/visual-regression.spec.ts` is written around; see `.github/instructions/testing.instructions.md` under "Visual regression on this page is timing-sensitive".

### 2.2. Next.js 16+ async request APIs (App Router)

- **Assume request-bound data is async in Server Components and Route Handlers.** In Next.js 16, APIs like `cookies()`, `headers()`, and `draftMode()` are async in the App Router.
- **Be careful with route props:** `params` / `searchParams` may be Promises in Server Components. Prefer `await`ing them instead of treating them as plain objects.
- **Avoid dynamic rendering by accident:** Accessing request data (cookies/headers/searchParams) opts the route into dynamic behavior. Read them intentionally and isolate dynamic parts behind `Suspense` boundaries when appropriate.

---

## 3. Component Best Practices

- **Component Types:**
  - **Server Components** (default): For data fetching, heavy logic, and non-interactive UI.
  - **Client Components:** Add `'use client'` at the top. Use for interactivity, state, or browser APIs.
- **When to Create a Component:**
  - If a UI pattern is reused more than once.
  - If a section of a page is complex or self-contained.
  - If it improves readability or testability.
- **Naming Conventions:**
  - Use `PascalCase` for component files and exports (e.g., `UserCard.tsx`).
  - Use `camelCase` for hooks (e.g., `useUser.ts`).
  - Use `snake_case` or `kebab-case` for static assets (e.g., `logo_dark.svg`).
  - Name context providers as `XyzProvider` (e.g., `ThemeProvider`).
- **File Naming:**
  - Match the component name to the file name.
  - For single-export files, default export the component.
  - For multiple related components, use an `index.ts` barrel file.
- **Component Location:**
  - Place shared components in `components/`.
  - Place route-specific components inside the relevant route folder.
- **Props:**
  - Use TypeScript interfaces for props.
  - Prefer explicit prop types and default values.
- **Testing:**
  - **Corrected for this repo — do not co-locate.** Upstream says to put `UserCard.test.tsx` beside `UserCard.tsx`. Tests here mirror the source path under `src/__tests__/`: `src/components/sections/AboutSection.tsx` → `src/__tests__/components/sections/AboutSection.test.tsx`. Nothing mechanical catches a misplaced test — it runs, it counts toward coverage, and it passes every gate — so the wrong convention ships silently and is only found by the next person looking for it. Conventions for what to assert and what not to mock are in `.github/instructions/testing.instructions.md`, which does **not** load on this file's paths; read it before writing the spec.

## 4. Naming Conventions (General)

- **Folders:** `kebab-case` (e.g., `user-profile/`)
- **Files:** `PascalCase` for components, `camelCase` for utilities/hooks, `kebab-case` for static assets
- **Variables/Functions:** `camelCase`
- **Types/Interfaces:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`

## 5. API Routes (Route Handlers)

**Does not apply to this repo.** `src/app/**/route.ts` matches nothing — there are no route handlers, and neither `zod` nor `yup` is a dependency. The upstream body of this section (placement, HTTP-verb exports, validation libraries, auth middleware) was removed because it loads on every `src/**/*.ts(x)` task and describes a surface this codebase does not have.

If you are adding the first route handler, read `node_modules/next/dist/docs/` for the current API and choose a validator deliberately — not because a vendored guide recommended one. Shared logic belongs in `src/utils/`, never a new `lib/`.

## 6. General Best Practices

- **TypeScript:** Use TypeScript for all code. Enable `strict` mode in `tsconfig.json`.
- **ESLint & Prettier:** Enforce code style and linting. Use the official Next.js ESLint config. In Next.js 16, prefer running ESLint via the ESLint CLI (not `next lint`).
- **Environment Variables:** Store secrets in `.env.local`. Never commit secrets to version control.
  - **`.env.local` is not the last word in this repo, and the difference has emailed a real customer.** Claude Code injects `env` from settings into every shell it spawns, and `@next/env` **does not overwrite an already-present variable** — so a value in the environment beats the same key in `.env.local`. `RESEND_API_KEY` is pinned there to the sentinel `your_resend_api_key_here` on purpose: `e2e/contact-form.spec.ts` submits the contact form for real, and `src/app/actions/contact.ts` only takes the mock path when the key is falsy or equal to that sentinel. If you put a live key in `.env.local` and wonder why it is not applying, that is the control working. **Do not delete the sentinel and do not delete the key from `.env.local`** — the first re-arms gate 7 to email the business inbox, the second is a destructive edit to an untracked file. Full mechanism, including its dependence on workspace trust, is in `.github/instructions/quality-gates.instructions.md`.
  - In Next.js 16, `serverRuntimeConfig` / `publicRuntimeConfig` are removed. Use environment variables instead.
  - `NEXT_PUBLIC_` variables are **inlined at build time** (changing them after build won’t affect a deployed build).
  - If you truly need runtime evaluation of env in a dynamic context, follow Next.js guidance (e.g., call `connection()` before reading `process.env`).
- **Testing:** **Vitest** + Testing Library for unit tests, Playwright for e2e. Never add Jest — see the overrides table. Write tests for all critical logic and components.
- **Accessibility:** Use semantic HTML and ARIA attributes. Test with screen readers.
- **Performance:**
  - Use built-in Image and Font optimization.
  - Use Suspense and loading states for async data.
  - Avoid large client bundles; keep most logic in Server Components.
- **Security:**
  - Sanitize all user input.
  - Use HTTPS in production.
  - Set secure HTTP headers.
  - Prefer server-side authorization for Server Actions and Route Handlers; never trust client input.
- **Documentation:**
  - Write clear README and code comments.
  - Document public APIs and components.

## 7. Caching & Revalidation (Next.js 16 Cache Components)

**Does not apply to this repo.** `cacheComponents` is not enabled — `next.config.ts` sets only `images.remotePatterns`. The upstream body (`use cache`, `cacheTag`, `cacheLife`, `revalidateTag`, `updateTag`) was removed because none of it is reachable here and it loads on every `src/**/*.ts(x)` task.

Do not enable `cacheComponents` to satisfy this section. If caching becomes a real requirement, read `node_modules/next/dist/docs/` first — this repo runs a 16.3.x and the API has moved since the 16.1.1 guide this file was vendored from.

## 8. Tooling updates (Next.js 16)

- **Turbopack is the default dev bundler.** Configure via the top-level `turbopack` field in `next.config.*` (do not use the removed `experimental.turbo`).
- **Typed routes are stable** via `typedRoutes` (TypeScript required).

## 9. Avoid Unnecessary Example Files

Do not create example/demo files (like ModalExample.tsx) in the main codebase unless the user specifically requests a live example, Storybook story, or explicit documentation component. Keep the repository clean and production-focused by default.

## 10. Always Use the Latest Documentation and Guides

- For every Next.js related request, begin with the **installed** docs: `node_modules/next/dist/docs/`. They match whatever version this repo actually runs and need no network.
- Do not rely on recalled API shapes. Next.js 16 and React 19 are both newer than current model training data; a confident answer built on a stale API costs a full review round.
- The Context7 MCP server configured here exposes `resolve-library-id` and `query-docs`. The names `resolve_library_id` / `get_library_docs` that upstream versions of this guide use **do not exist** — verified against `@upstash/context7-mcp` 4.1.1. Reach for it whenever the question is not about Next.js, since `node_modules/next/dist/docs/` covers nothing else in this stack. Never paste repo source into a `query-docs` call — it leaves the machine.
