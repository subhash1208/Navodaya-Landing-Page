---
name: dependency-audit
description: >-
  This skill should be used when the user asks to "audit dependencies", "check for
  vulnerabilities", "fix a CVE", "run pnpm audit", "upgrade a vulnerable package", or
  types /dependency-audit — and before any release or scheduled security sweep. Covers
  triaging advisories by what actually pins each package and fixing within existing
  semver ranges before reaching for overrides or a major bump.
argument-hint: 'Optional: a package name to focus on'
---

# Dependency audit

This repo shipped **two unauthenticated RCEs** — `GHSA-p293-qw3h-jr36` (Windows-hosted
servers) and `GHSA-2xp9-vwfh-vxw4` (Image Optimization API via AVIF) — undetected for its
entire history, because gate 8 was written as `ppnpm audit --prod` and the typo meant the
command never ran. Assume nothing about a gate that has never produced output.

## 1. Get a real signal

```bash
pnpm audit --prod --audit-level=high   # exit 0 == gate 8 green
```

Bare `pnpm audit` exits non-zero for **any** severity including `low`, so it can never go
green and gets ignored. `--audit-level=high` makes the exit code mean the pass criterion.

Use `--prod` for the gate — devDependencies do not ship. But **run the unfiltered command too
and actually read it**; the two scopes tell materially different stories. On 2026-09-18 the
gate was green while the wider scan held **14 high** advisories:

```bash
pnpm audit --audit-level=high          # no --prod
```

Every one was a transitive dev dependency already patchable inside its parent's range —
`undici` → 7.29.1, `js-yaml` → 4.3.2, `brace-expansion` → 1.1.21 / 5.0.12, `vite` → 8.3.0.
Dev dependencies do not ship, but they execute on your machine and in CI, so they are still a
supply-chain surface. Fix what `pnpm update` can reach; do not block the gate on the rest.

## 2. Triage by what pins it, not by name

Get the machine-readable form and group by dependency path:

```bash
pnpm audit --prod --json > .tmp-audit.json
```

Then for each advisory, record `module_name`, `patched_versions`, and the **path**. The path
is the entire point: `.>tailwindcss>postcss>nanoid` is a different problem from a direct
dependency, and is fixed differently.

`pnpm why <pkg> --prod` confirms who actually pins a transitive package.

Sort findings into three buckets:

| Bucket                       | Signal                                                    | Fix                               |
| ---------------------------- | --------------------------------------------------------- | --------------------------------- |
| **Direct**                   | the vulnerable package is in `package.json`               | bump it directly                  |
| **Transitive, in range**     | the patched version satisfies the parent's declared range | `pnpm update`, no manifest change |
| **Transitive, out of range** | the parent pins below the patched version                 | last resort — see step 5          |

## 3. Fix direct dependencies first

One bump often collapses most of the list, because a framework re-pins its own tree. Bumping
`next` 16.2.4 → 16.3.5 here took the count from **2 critical / 19 high / 12 moderate / 4 low**
to **5 high** in a single step, carrying `sharp` 0.35.4 along with it.

Prefer the lowest version that clears every advisory, then take the current stable patch on
that line. Read `patched_versions` — it differs per advisory, and the **highest** floor across
all of them is the one that matters.

## 4. Then un-pin stale transitives

Most remaining findings are not "the ecosystem is behind" — they are a lockfile pinned older
than the declared ranges already permit. Check before assuming you need an override:

```bash
node -e "const p=require('<parent>/package.json'); console.log(p.dependencies['<child>'])"
```

If the patched version satisfies that range, a targeted update is enough and **no manifest
change is needed**:

```bash
pnpm update postcss nanoid browserslist --recursive
```

This is how the last 5 highs and both remaining lows were cleared here — zero `package.json`
edits, zero overrides.

## 5. Overrides are a last resort — and on pnpm 11 they are not where you think

Reach for one only when `pnpm update` will not move the package. That happens more often than
it should: **pnpm will not re-resolve a transitive that already satisfies its parent's range**,
even when a patched version sits well inside that range. It reports `Already up to date` and
leaves the vulnerable version pinned forever. `vite` 8.0.14 here accepted `^6 || ^7 || ^8` from
`vitest` and still would not move to 8.0.16 under `pnpm update vite@^8.0.16 --depth Infinity`.

**`pnpm.overrides` in `package.json` no longer works.** pnpm 11 prints a warning and then
`pnpm install` **exits 0** — the override is silently dropped and the audit stays red, which
reads exactly like "the override didn't help":

```
[WARN] The "pnpm" field in package.json is no longer read by pnpm.
       The following keys were ignored: "pnpm.overrides".
```

Overrides belong in `pnpm-workspace.yaml` as a top-level key:

```yaml
overrides:
  # GHSA-xxxx: one-line description, severity, fixed in <version>.
  # Why this is safe: which ranges it stays inside.
  # Remove when: the condition that retires it.
  vite: ^8.0.16
```

Comment every override with the advisory ID and the condition for removal — an undated
override outlives its reason and silently holds the tree back.

**Never confirm an override by exit code.** Read the lockfile:

```bash
grep -oE "vite@[0-9]+\.[0-9]+\.[0-9]+" pnpm-lock.yaml | sort -u
```

If the only fix is a major upgrade of an unrelated package, **stop and report it** rather than
starting a migration. Remaining `low` findings that require a major bump are an acceptable
documented residual — say so explicitly instead of leaving them unmentioned.

## 6. Prove the upgrade through the gates

A dependency change is a code change. Run the full table from
`.github/instructions/quality-gates.instructions.md`, not just the audit:

1–5 (format, lint, types, tests, coverage) → 6 (build: **zero new warnings**, same route
topology) → 7 (e2e) → 8 (audit) → 9 (bundle vs. the recorded baseline) → 10 (SSR).

Two traps that have already fired here:

- **Gate 1 fails on the lockfile** if `pnpm-lock.yaml` ever falls out of `.prettierignore`.
  Restore the ignore entry; never format a generated lockfile.
- **Gate 7 silently reuses a stale server.** Confirm nothing holds port 3000 first
  (`netstat -ano | grep -E ':3000\s+.*LISTENING'`). Absent build output at the top of a
  Playwright run means the run is void.

## 7. Record the residual

Report: what was critical/high before, what is left, what pins each leftover, and the exact
condition that would clear it. "No known vulnerabilities found" is the only finish line that
needs no caveat.

## Constraints

- `pnpm` only. Never `npm` or `npx` — `npm install` creates a competing `package-lock.json`
  and a flat `node_modules`, breaking pnpm's linked store.
- Never suppress a finding to make a gate green.
- Never bump a major version to clear a `low` without asking first.
- Back up `package.json` and `pnpm-lock.yaml` before a framework bump so a bad upgrade is one
  `cp` from reverted.
