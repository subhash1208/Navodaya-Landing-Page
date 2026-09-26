# Contributing Guidelines

## Branch Naming

| Branch           | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `master`         | Production (deployed to Vercel)                             |
| `develop`        | Integration branch (all features merge here first)          |
| `feature/<name>` | New features (e.g., `feature/testimonials-section`)         |
| `fix/<name>`     | Bug fixes (e.g., `fix/mobile-nav-pointer-events`)           |
| `perf/<name>`    | Performance improvements (e.g., `perf/gsap-dynamic-import`) |
| `test/<name>`    | Test additions/fixes (e.g., `test/coverage-90-percent`)     |
| `chore/<name>`   | Tooling/config (e.g., `chore/husky-pre-commit`)             |

**Rules:**

- Never push directly to `master` — always via PR from `develop`
- Never push directly to `develop` from `master`
- Feature branches merge into `develop` via PR
- Use lowercase with hyphens: `feature/add-faq-section` (not `Feature/AddFAQSection`)

## Commit Messages (Conventional Commits)

Format: `<type>(<scope>): <description>`

### Types

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature or functionality                            |
| `fix`      | Bug fix                                                 |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or fixing tests                                  |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style`    | Formatting, whitespace (no logic change)                |
| `chore`    | Build process, tooling, dependencies                    |
| `docs`     | Documentation only                                      |

### Examples

```
feat(hero): add keyboard accessibility to graph panel
fix(contact): reset form state after successful submission
perf(gsap): dynamic import in all animation components
test(coverage): add tests for dynamic import branches
chore(hooks): add husky pre-commit with lint+test+coverage
```

### Rules

- Keep subject line under 70 characters
- Use imperative mood: "add" not "added" or "adds"
- No period at the end of the subject line
- Scope is optional but recommended (component/file name)
- No `Co-Authored-By` trailer — enforced by `includeCoAuthoredBy: false` in the generated settings

## Package Manager

This project uses **pnpm**. Never run `npm` or `npx` here — `npm install` would create a
competing `package-lock.json` and a flat `node_modules`, breaking pnpm's linked store.
Toolchain versions are pinned in `mise.toml`.

## Pre-Commit Checks

`.husky/pre-commit` runs, on every commit:

1. **Prettier** — format check (run `pnpm format` to fix)
2. **ESLint** — lint check
3. **Vitest** — all tests + 90% coverage threshold

If any check fails, the commit is blocked. Fix the issue and try again — never use
`--no-verify`, and never lower the threshold in `vitest.config.mts` to get green.

The coverage threshold is **project-wide, not changed-files-only**. Adding an untested
file lowers the global number and blocks the commit even when your own diff is fully
covered.

## Commands

```bash
pnpm format           # Auto-fix formatting
pnpm format:check     # Check formatting, no writes
pnpm lint             # Run ESLint
pnpm exec tsc --noEmit # Typecheck (there is no `type-check` script)
pnpm test             # Run tests
pnpm test:coverage    # Run tests with coverage report
pnpm test:e2e         # Run Playwright E2E tests
```

E2E needs browser binaries: `pnpm exec playwright install`. The full gate table lives in
`.github/instructions/quality-gates.instructions.md`.
