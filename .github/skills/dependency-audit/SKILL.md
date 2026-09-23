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

**There is a second cause of "won't move", it looks identical, and it expires on its own.**
pnpm 11 turned on supply-chain defaults: `minimumReleaseAge` now defaults to **1440 minutes**,
so pnpm refuses to resolve any version published in the last 24 hours. Worse for diagnosis,
`minimumReleaseAgeStrict` defaults to **`false`** when you have not set `minimumReleaseAge`
yourself — so pnpm does not fail. It **silently falls back** to an older version that clears
the age gate and reports success. Verified against pnpm 11.27.1 and the pnpm 11.0 release
notes; this repo sets neither key, so the silent-fallback path is the live behaviour right now.

That collides head-on with the work this skill exists for: **the fix for a fresh advisory is a
fresh publish by definition.** The most urgent patch you will ever apply is the one most likely
to be under a day old. Read as the range problem above, it sends you to §5's override — a
permanent forced version — for a condition that clears itself by tomorrow, leaving behind
exactly the undated override this section warns against, whose removal condition was already
met before anyone read it.

**Check the publish date before concluding anything:**

```bash
pnpm view <pkg> time --json     # or: pnpm view <pkg> time.<version>
```

If the version you want is under 24 hours old, the honest options are to **wait**, or to set
`minimumReleaseAge` explicitly in `pnpm-workspace.yaml`. Note what the second one does: setting
the key at all flips `minimumReleaseAgeStrict` to `true`, so pnpm starts **failing** resolution
instead of silently downgrading. That is a strictly better failure mode for an audit — loud
beats silent — but it is a tree-wide behaviour change, so make it a deliberate, separately
reported decision rather than a side effect of chasing one package. Never reach for an override
on a package whose only problem is that it is new.

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
  (`netstat -ano | grep -E ':3000\s+.*LISTENING'` — bash only; pwsh has no `grep`, and the
  measured `Get-NetTCPConnection` form is in `.github/instructions/quality-gates.instructions.md`).
  Then prove Playwright actually built, and **do not prove it by looking for build output** —
  Turbopack's compile detail never crosses Playwright's `webServer` pipe, so grepping for
  `Compiled successfully` returns 0 on a perfectly valid run and will have you voiding a green
  one. The only marker that crosses is the echoed command:

  ```bash
  grep -c '\[WebServer\] \$ next build' out.txt   # expect 1; 0 means a server was reused
  ```

**Gate 9 has a third trap, and it is the one a dependency audit is uniquely placed to spring.**
The bundle gate compares against a _recorded_ number —
`.github/instructions/quality-gates.instructions.md` carries it as **310.6 KB gzipped across 24
files, `next@16.3.5`, 2026-09-18** — and that instruction says to update it "in the same commit
as any deliberate change". A framework bump is the most deliberate bundle change there is. The
failure mode is quiet: your bump grows the bundle, you justify the growth correctly, gate 9
passes, and the baseline is now wrong by that amount for **every future audit**, which measures
its own growth from a floor that silently moved. Two bumps later nobody can tell which one
spent the budget.

So if a dependency change moves the emitted bundle, **update the recorded baseline in the same
commit as the bump**, and say in your report what it moved from and to. If it does not move,
say that too — an unchanged baseline confirmed is worth more than an unmentioned one.

## 7. Record the residual

Report: what was critical/high before, what is left, what pins each leftover, and the exact
condition that would clear it.

**"No known vulnerabilities found" is not a finish line — it is the literal meaning of the
words.** An advisory database answers one question: has someone published a CVE against a
version you depend on. It cannot answer the one that dominates current npm incidents — whether
a maintainer account was compromised and a hostile version published under a legitimate name.
In that case there is no advisory to find, because the package _is_ the real package; the new
version simply carries code nobody has classified yet. `pnpm audit` returns clean and is not
malfunctioning. It was never looking.

So write the residual with the scope attached — "no **known** advisories at high or above,
`--prod` and unfiltered, as of `<date>`" — not "clean". The difference matters the day someone
reads your report to decide whether a compromise could have entered through this tree.

**pnpm 11 ships two defences for exactly this, and neither is an audit.** Both are resolution
settings, so they act before a bad version is ever written to the lockfile:

- **`minimumReleaseAge`** (default 1440 min) — quarantines brand-new publishes, which is where
  a compromised release is caught and pulled. This is the same default that causes the
  "won't move" symptom in §5; it is a feature, and that section is about diagnosing it, not
  defeating it.
- **`trustPolicy: no-downgrade`** — fails the install when a package's trust evidence gets
  _weaker_ than it was, for example a package that had a trusted publisher arriving with only
  provenance or with none. A maintainer-account compromise frequently shows up here first,
  because the attacker cannot reproduce the original publishing identity. `trustPolicyExclude`
  takes `pkg@version` entries for legitimate CI migrations.

Neither is set in this repo's `pnpm-workspace.yaml` today, so `minimumReleaseAge` runs on its
non-strict default and `trustPolicy` is off. **Enabling them is a tree-wide change with real
failure modes — propose it, do not apply it mid-audit.** Note it as a recommendation in the
residual and let the human decide; an audit that silently changes resolution policy is doing
something other than what was asked.

## Constraints

- `pnpm` only. Never `npm` or `npx` — `npm install` creates a competing `package-lock.json`
  and a flat `node_modules`, breaking pnpm's linked store.
- Never suppress a finding to make a gate green.
- Never bump a major version to clear a `low` without asking first.
- Back up `package.json` and `pnpm-lock.yaml` before a framework bump so a bad upgrade is one
  `cp` from reverted.
