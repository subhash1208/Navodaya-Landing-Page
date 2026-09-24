---
description: 'Use when verifying code before handoff, merge, or ship — the exact quality gate commands for this repo, their pass criteria, and what to do when one fails. Covers lint, typecheck, unit tests, build, e2e, and audit.'
name: 'Quality Gates'
---

# Quality Gates

Run in order. Stop at the first failure and fix before advancing — a later gate's output is meaningless if an earlier one failed.

| #   | Gate         | Command                                                | Pass criteria                                                  | Owner       |
| --- | ------------ | ------------------------------------------------------ | -------------------------------------------------------------- | ----------- |
| 1   | Format       | `pnpm format:check`                                    | zero diffs                                                     | implementer |
| 2   | Lint         | `pnpm lint`                                            | zero errors                                                    | implementer |
| 3   | Types        | `pnpm exec tsc --noEmit`                               | zero errors                                                    | implementer |
| 4   | Unit tests   | `pnpm test`                                            | all pass                                                       | implementer |
| 5   | Coverage     | `pnpm test:coverage`                                   | **≥90%** statements, branches, functions, lines — project-wide | implementer |
| 6   | Build        | `pnpm build`                                           | succeeds, no new warnings                                      | reviewer    |
| 7   | E2E          | `pnpm test:e2e`                                        | all pass                                                       | reviewer    |
| 8   | Dependencies | `pnpm audit --prod --audit-level=high`                 | exits 0                                                        | reviewer    |
| 9   | Bundle       | gzipped `.next/static` — command below (after gate 6)  | no unjustified growth vs. the baseline below                   | reviewer    |
| 10  | SSR / no-JS  | `pnpm exec playwright test e2e/loading-screen.spec.ts` | server HTML contains the page's `<h1>` and its links           | reviewer    |

There is no `type-check` script — use `pnpm exec tsc --noEmit` directly.

Gate 7 runs only when routing, forms, navigation, or user-visible flows changed. Playwright config is at `playwright.config.ts`.

Gate 10 runs whenever a component that wraps page content is touched. It exists because gates 1–9 all passed while the homepage server-rendered an empty div — see "Why gate 10 exists" below.

## "Not applicable" is a verdict; "skipped" is not

Gates 7 and 10 carry scope notes above. Gates 6, 8 and 9 do not, which leaves the table reading as though a one-line change to a markdown file must produce a production build, a full Playwright run and a bundle measurement. It must not, and pretending otherwise is corrosive in both directions: it burns minutes on a diff that cannot move any of those numbers, and it quietly trains you to skip gates — which is the one thing the Never list below forbids outright.

Applicability is part of a gate's definition, not a licence to duck it. The test is mechanical: **could this diff change what this gate measures?**

| Diff touches                                                           | Gates that can move                                                         |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Only `.md` / `.github/` instructions, agents, skills                   | 1, 2. Nothing else has an input.                                            |
| `package.json` / `pnpm-lock.yaml`                                      | All ten — 8 and 9 especially; see the `/dependency-audit` skill.            |
| `src/**` or `e2e/**`                                                   | All ten, subject to the gate 7 and 10 scope notes above.                    |
| Config (`vitest.config.mts`, `playwright.config.ts`, `next.config.ts`) | All ten. A config change can move a gate without touching a line of `src/`. |

**Say which gates you ruled out and why, in the transcript, naming each one.** The evidence requirement below is about not claiming a green you did not observe; it is equally about not silently dropping a gate. "Gates 3–10 N/A: diff is `.github/instructions/*.md` only, no input to typecheck, tests, build or bundle" is a complete and honest report. Listing nothing is not.

When in doubt, run it. The asymmetry is heavily one-sided — a needless `pnpm build` costs a minute, and a wrongly-skipped one is how gates 8 and 9 sat green and unrunnable for their entire existence.

## Gate 7 used to send real email — a settings key now stops it

`.env.local` exists on this machine and holds a live 36-character Resend key. `e2e/contact-form.spec.ts` submits the contact form for real, and `src/app/actions/contact.ts:31-38` only short-circuits to the mock path when `RESEND_API_KEY` is falsy **or equal to the sentinel `your_resend_api_key_here`**. With the live key loaded, running gate 7 emailed the business inbox in `BRAND.EMAIL`.

**This is now a hard control, not an instruction.** `.github/hooks/permissions.json` pins `env.RESEND_API_KEY` to that sentinel, and `pnpm agents:sync` carries it into `.claude/settings.json`, so every shell Claude Code spawns already has it. Project-scope `env` is **not** trust-gated — it applied even before this workspace was trusted, which is why it was chosen. Verified 2026-09-18 against the `@next/env@16.3.5` that `next@16.3.5` links:

```
before=[your_resend_api_key_here]
after_len=24 prefix=your
SENTINEL_SURVIVED= true
```

**CORRECTED 2026-09-22:** "not trust-gated" above is wrong. Current official docs (`code.claude.com/docs/en/settings` and `settings-reference`) say workspace trust gates `permissions.allow`, `permissions.additionalDirectories`, and **most `env` values** — project/local `env` applies only once the workspace is trusted (or at startup in `-p` mode), with a narrow carve-out for variables classified as safe (model selection, timeouts/limits, feature toggles, telemetry). `RESEND_API_KEY` is not on that safe list, so this control **depends on workspace trust, not on being exempt from it**. Trust in this workspace was granted 2026-09-19 and remains current — re-verified live, 2026-09-22: a Bash tool call reports `len=24 prefix=your SENTINEL_ACTIVE=true` — which is why the sentinel is applying right now. **If trust is ever lost, this sentinel stops applying and gate 7 would email the real business inbox again.** Do not treat this section as a permanent guarantee independent of trust state; see `//env-cwd` and `//env-resend` in `.github/hooks/permissions.json` for the full correction.

`.env.local` does **not** overwrite an already-present key, so the sentinel wins and the action logs instead of sending — no per-run step required, and no way to forget it, **as long as workspace trust holds**.

Two things follow that are easy to get wrong:

- **Do not rely on a separate `export RESEND_API_KEY=` step.** Shell state does not survive between tool calls, so an `export` in one call and `pnpm test:e2e` in the next runs with a fresh environment. If you ever need to clear it manually — outside a Claude session, or under Copilot, which gets no `env` block — put it in the _same_ command: `RESEND_API_KEY= pnpm test:e2e`. That form is bash-only; `export` and `${PIPESTATUS[0]}` do not exist in PowerShell.
- **Do not delete the key from `.env.local`.** That is a destructive edit to an untracked secret file, and it is now unnecessary.

**PowerShell has no inline `VAR=val cmd` prefix form at all.** Verified in pwsh 7.6.6 — `AUDIT_PROBE_VAR=hello pnpm --version` fails with `The term 'AUDIT_PROBE_VAR=hello' is not recognized as a name of a cmdlet, function, script file, or executable program.` pwsh parses the assignment as the _command name_. Two working replacements, both verified with a throwaway `$env:AUDIT_PROBE_VAR`:

```powershell
# BEST — a child pwsh. The env change dies with the child process, exactly like
# bash's prefix form. Verified: child saw [], parent still held PARENT_VALUE.
pwsh -NoProfile -Command '$env:RESEND_API_KEY = ""; pnpm test:e2e'

# ALTERNATIVE — same shell, restore in finally.
$saved = $env:RESEND_API_KEY
try {
  $env:RESEND_API_KEY = ''
  pnpm test:e2e
} finally {
  $env:RESEND_API_KEY = $saved
}
```

**Do not reach for `& { $env:X = ''; ... }`.** A scriptblock scopes PowerShell variables but **not** environment variables — those are process-wide. Verified: after `& { $env:AUDIT_PROBE_VAR = 'INNER_VALUE' }` the parent shell read back `INNER_VALUE`. It looks scoped and silently is not, which on `RESEND_API_KEY` would leave the key cleared for the rest of your session.

Known cost, accepted: a human who starts `pnpm dev` from inside a Claude session inherits the sentinel and silently gets the mock send path. Start the dev server from an ordinary terminal when testing real email.

## Gates 8 and 9 were unrunnable as originally written

Both were fixed on 2026-09-18, and both had been silently passing for their entire existence:

- **Gate 8** read `ppnpm audit --prod` — a typo, so the command never executed. The first real run found **2 critical and 19 high** advisories, including _unauthenticated RCE on Windows-hosted servers_ and _unauthenticated RCE in the Image Optimization API via AVIF_, both fixed only in `next` ≥ 16.3.3 while this repo sat on 16.2.4. Note the flag: bare `pnpm audit` exits non-zero for **any** severity including `low`, so it can never go green and gets ignored. `--audit-level=high` makes the exit code mean what the pass criterion says.
- **Gate 9** read "build route table" as its command. Turbopack's build output contains **no size column at all**, so there was nothing to compare. Measure the emitted bundle instead — and note that the replacement command was itself unrunnable until 2026-09-18, for a reason worth internalising. It lived in the table cell above, where a literal `|` must be escaped as `\|` to avoid ending the cell. The escape leaked into the command, giving `-exec gzip -c {} \| wc -c`, and `find` answers that with `find: missing argument to \`-exec'`. **A command inside a markdown table is not the command you will run.** It now lives in a fenced block, where nothing rewrites it:

```bash
pnpm build
find .next/static -name "*.js" -exec gzip -c {} \; | wc -c
```

`-exec` needs a `\;` (or `+`) terminator; the pipe comes after it, not inside it.

**PowerShell equivalent.** pwsh has no `find`, no `gzip`, and no `wc`. Verified against this tree in pwsh 7.6.6 — `Get-ChildItem -Recurse -Filter *.js -File` selects the same 24 files `find` does, and this form returned `318067 bytes (310.6 KB gzipped)`, **byte-identical** to the bash form:

```powershell
pnpm build
$gzip = (Get-Command gzip).Source
$tmp = "$env:TEMP\gzslice.bin"
$total = 0
foreach ($f in Get-ChildItem .next/static -Recurse -Filter *.js -File) {
  Start-Process -FilePath $gzip -ArgumentList '-c', "`"$($f.FullName)`"" `
    -RedirectStandardOutput $tmp -NoNewWindow -Wait
  $total += (Get-Item $tmp).Length
}
Remove-Item $tmp
"$total bytes  ($([math]::Round($total/1KB,1)) KB gzipped)"
```

It shells out to the `gzip.exe` that ships with Git for Windows — `Get-Command gzip` resolved it from pwsh at `D:\Git\usr\bin\gzip.exe`. That indirection is the whole point: it is the only form measured to reproduce the baseline exactly.

**Do not substitute .NET `GZipStream`, and do not pipe `gzip` output into `Measure-Object`.** Both were measured on this tree and both are wrong against the recorded baseline:

| Method                                            | Total  | vs. GNU `gzip` 1.14    |
| ------------------------------------------------- | ------ | ---------------------- |
| `find … -exec gzip -c` (bash)                     | 318067 | —                      |
| `Start-Process gzip -RedirectStandardOutput`      | 318067 | **0**                  |
| .NET `GZipStream` `SmallestSize`                  | 318200 | +133 (+0.04%)          |
| .NET `GZipStream` `Optimal`                       | 320660 | **+2593 (+0.82%)**     |
| `gzip -c` piped into `Measure-Object` (see below) | 315628 | −2439, **meaningless** |

`GZipStream` is deterministic (re-ran `Optimal`, same 320660) but it is a _different compressor at a different level_, so **a .NET-measured number compared against the GNU-measured 310.6 KB baseline shows a phantom 0.8% regression that no code change caused.** If you ever deliberately switch to `GZipStream`, it needs its own separately recorded baseline — never compare across methods.

The last row fails for a different reason, and the form is written here rather than in the table above because this document's own rule applies — a literal `|` inside a table cell must be escaped and the escape leaks into what you copy:

```powershell
# WRONG — counts 315628, not 318067. pwsh decodes a native command's stdout as
# TEXT when it crosses a pipeline, corrupting the binary before anything counts it.
$total += (gzip -c $f.FullName | Measure-Object -Property Length -Sum).Sum
```

Redirecting to a file and reading `.Length` is what avoids that, which is why the verified form uses `Start-Process -RedirectStandardOutput`.

**Bundle baseline, `next@16.3.5`, 2026-09-24:** 960.1 KB raw (983192 B) across 24 files, **309.6 KB gzipped** (317082 B). Compare against this, and update it in the same commit as any deliberate change. (Prior 2026-09-24, before the SEALED palette migration: 963.0 KB raw, 310.7 KB / 318180 B gzipped — moving off the dark-navy/gradient/glass system to `ink`/`paper` took **−1098 B**, −0.35%, the first decrease recorded here. `AuroraBackground.tsx` was deleted outright, several inline style objects and gradient/blur CSS rules went with it, and no new runtime import was added; the file count held at 24 because the deletion removed markup from an existing chunk rather than a chunk of its own. Prior 2026-09-24, before the category specimen plates: 962.4 KB raw, 310.4 KB / 317896 B gzipped — swapping the emoji category icons for `next/image` panels moved it **+284 B**, +0.09%, and the file count held at 24 because `next/image` was **already** bundled by `Header.tsx`, `HeroSection.tsx` and `LoadingScreen.tsx`, so no new runtime entered; the delta is the three `PLATE_ALT` string literals, ~335 chars, plus the new JSX props. Prior 2026-09-18: 963.0 KB raw, 310.6 KB / 318067 B gzipped — the SEALED design waves' `geist` fonts and `extendTailwindMerge` moved it **−171 B**, effectively flat, because font assets are not `.js` and never enter this measurement.)

## Gate 6's "no new warnings" has the same hole gate 9 had

Gate 9 was unusable until someone wrote a number down. Gate 6's pass criterion is **"succeeds, no new warnings"** — and **new** is relative to a baseline this document has never recorded. Without one there are only two ways to read a warning, and both are wrong:

- treat everything as new → RED on a warning that predates the diff, costing a review round on nothing;
- treat everything as pre-existing → GREEN while a warning your change actually introduced scrolls past. That is the dangerous direction, and it is the default, because "it was probably already there" is the comfortable assumption.

Give it the same treatment gate 9 got. **Capture the warning set on the next build that runs for any other reason, record it here with the `next` version and the date, and update it in the same commit as any deliberate change** — identical discipline to the bundle number above, for the identical reason.

```bash
pnpm build 2>&1 | sed 's/\x1b\[[0-9;]*[A-Za-z]//g' > build.txt
echo "EXIT=${PIPESTATUS[0]}"
grep -iE '\bwarn(ing)?\b' build.txt
```

`PIPESTATUS[0]` rather than `$?` for the reason given below — the `sed` is what `$?` would describe. Strip ANSI before grepping, same as for Playwright and Vitest.

**Warning baseline, `next@16.3.5`, 2026-09-24: zero.** `grep -icE '\bwarn(ing)?\b'` over a stripped `pnpm build` log returns `0`, confirmed on two consecutive builds and re-confirmed 2026-09-24 after the SEALED palette migration. So gate 6's verdict is now mechanical: any non-zero count is a new warning and the diff owns it. Update this number in the same commit as any deliberate change, exactly as for the bundle baseline above.

Gate 8's `--prod` scope is correct for the gate but hides dev-dependency advisories — the wider `pnpm audit --audit-level=high` found 14 more on 2026-09-18. That, the reason `pnpm update` silently refuses to move some transitives, and the fact that **pnpm 11 ignores `pnpm.overrides` in `package.json`** are all in the `/dependency-audit` skill. Read it before touching a dependency; it is not loaded here because it is only relevant during dependency work.

## Evidence requirement

**A gate counts as passed only when its literal output appears in the transcript.** Paste the real line — `Tests  339 passed (339)`, `47 passed (2.1m)`, `✓ Compiled successfully`. A gate asserted green without matching verbatim output is RED by default.

This is not ceremony. Gate 7 was reported green in this repo while Playwright was exiting 1: a backgrounded `pnpm test:e2e | tail` printed `[exited with code 0]` from the _wrapper_ while the inner run printed `[ELIFECYCLE] Command failed with exit code 1`. Capture the real status rather than trusting a pipeline's last stage, and strip ANSI (`sed 's/\x1b\[[0-9;]*[A-Za-z]//g'`) before grepping Playwright or Vitest output — the escape codes silently defeat naive pattern matches.

### `$?` after a pipeline is the wrong exit code

Stripping ANSI means piping, and the moment you pipe, `$?` stops describing the command you care about:

```bash
# WRONG — $? is sed's status (or the redirect's). Always 0. Reported G7_EXIT=0
# while 30 of 50 Playwright tests were failing.
pnpm test:e2e 2>&1 | sed 's/\x1b\[[0-9;]*[A-Za-z]//g' > out.txt
echo "EXIT=$?"

# RIGHT — PIPESTATUS[0] is the first command's status. Read it on the very next
# line; any intervening command overwrites the array.
pnpm test:e2e 2>&1 | sed 's/\x1b\[[0-9;]*[A-Za-z]//g' > out.txt
echo "EXIT=${PIPESTATUS[0]}"
```

Cross-check the exit code against a counted result (`50 passed`, `Tests  339 passed`). When the number and the code disagree, believe the number.

**In PowerShell, `$LASTEXITCODE` survives the pipeline** — this is the one place pwsh is genuinely better than bash, and there is no `PIPESTATUS` array to reach for because none is needed. Verified in pwsh 7.6.6 with a command whose exit code was controlled: `pnpm exec node -e "process.exit(3)"` piped through `ForEach-Object | Set-Content` still reported `LASTEXITCODE=3`, and an exit-0 control in the same pipeline reported `LASTEXITCODE=0`.

```powershell
# `e is the escape character in pwsh 6+; "$_" forces the ErrorRecord objects that
# 2>&1 produces for native stderr back to strings before -replace sees them.
pnpm test:e2e 2>&1 |
  ForEach-Object { "$_" -replace "`e\[[0-9;]*[A-Za-z]", '' } |
  Set-Content out.txt
"EXIT=$LASTEXITCODE"
```

Verified end to end against a stand-in that printed a green `50 passed (2.1m)` to stdout, a red line to stderr, and exited 7: the run reported `EXIT=7`, both streams reached `out.txt`, and the file contained no byte 27. The strip itself round-trips — `` `e `` is char 27, and a raw `ESC[32m50 passed ESC[39m ESC[0m (2.1m)` came back as `50 passed (2.1m)`, with `-match '^50 passed'` returning `False` on the raw string and `True` on the stripped one. That is the same silent-defeat failure the bash note describes.

**One caveat, and it is the mirror of bash's "read it on the very next line".** `$LASTEXITCODE` is only overwritten by _native_ commands, not by cmdlets — an intervening `Write-Host` left it at 3, but an intervening `pnpm exec node -e "process.exit(0)"` reset it to 0 and the 3 was lost. So cmdlets between the run and the read are safe; any second native command is not. Prefer `$LASTEXITCODE` over `$?`, which is a pass/fail boolean rather than a code.

### Gate 7 will silently test a stale build

`playwright.config.ts` sets `reuseExistingServer: !process.env.CI`. If **anything** is already answering on `http://localhost:3000`, Playwright skips `pnpm build && pnpm start` entirely and tests whatever that process is serving — which may be a months-old build of code you just changed. Nothing in the output says it did this; the build logs are simply absent.

This produced a 30-of-50 failure run against a `next start` orphaned from a previous session. It is equally capable of producing a **false green**, which is the dangerous direction.

Before every gate-7 run, confirm the port is free and kill anything holding it:

```bash
netstat -ano | grep -E ':3000\s+.*LISTENING'   # expect no rows
```

PowerShell has no `grep`, and there is no need to column-parse `netstat` because the owning PID is a real field:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalPort, State, OwningProcess   # expect no rows
```

**`-ErrorAction SilentlyContinue` is load-bearing, not tidiness.** Verified in pwsh 7.6.6 with port 3000 free: without it the cmdlet emits a red `Get-NetTCPConnection: No matching MSFT_NetTCPConnection objects found by CIM query … Verify query parameters and retry.` That is a _non-terminating_ error meaning "the port is free" — the good case — and it is not catchable with `try`/`catch`. Read as a failure it will have you hunting a phantom problem. With the flag, a free port produces silence and `$null`. The cmdlet was confirmed to return rows for a port that _is_ listening, so the empty result is a real answer and not a broken query.

Afterwards, prove Playwright actually built. The marker is the **`[WebServer]` command echo**, not build output:

```bash
grep -c '\[WebServer\] \$ next build' out.txt   # expect 1; 0 means a server was reused
```

```powershell
@(Select-String -Path out.txt -SimpleMatch -Pattern '[WebServer] $ next build').Count
```

**`-SimpleMatch` is mandatory here.** `Select-String` defaults to regex, and both `[` and `$` in that marker are metacharacters — `[WebServer]` becomes a character class and `$` an end-anchor, so the pattern cannot match the literal line. Verified against a fixture whose second line was exactly `[WebServer] $ next build`: the default regex form returned **0**, `-SimpleMatch` returned **1**, and `[regex]::Escape(...)` also returned 1. Against a fixture with no marker, `-SimpleMatch` correctly returned 0. A regex-form 0 is indistinguishable from a reused server, so this mistake voids green runs in exactly the way the next paragraph warns about.

Do **not** grep for `Compiled successfully` or `Creating an optimized production build`. Turbopack's build detail never crosses Playwright's `webServer` pipe — only the echoed command does. Grepping for compile output reports 0 on a perfectly valid run and will have you voiding green runs.

## Why gate 10 exists

`src/components/ui/LoadingScreen.tsx` wraps the entire homepage. It returned only an empty `aria-hidden` overlay while its state was `null` — the state during server render — so the server-rendered HTML contained no `<h1>`, no copy, and no links.

Nothing in gates 1–9 could catch it:

- Unit tests run in jsdom **after** effects, so they only ever see post-hydration DOM.
- `src/__tests__/app/page.test.tsx` mocks `LoadingScreen` into a passthrough, so it cannot exercise the branch at all.
- The e2e specs let hydration finish before asserting, so they passed with the bug present.
- Coverage was 97.47%. Coverage measures which lines executed in jsdom — not what the server sent.

The lesson generalises: **a passing gate proves the checks you have, never the absence of defects.** When a change gates page content behind client state — loading screens, auth walls, feature flags — verify what the server actually sends, not what jsdom renders.

## Two rules for any component that wraps page content

Both were learned from real defects in `LoadingScreen.tsx`, and neither is caught by gates 1–10 unless you assert for it specifically.

### 1. Keep the returned fragment's SHAPE fixed

React reconciles fragment children **by position**, not by identity. A component that returns differently-shaped fragments from different branches will destroy and remount whole subtrees when a child slides between indices and lands on a different element type.

`LoadingScreen` returned three shapes — `[<div>, children]` while undecided, `[<AnimatePresence>, children]` while showing, `[children]` once done. When the overlay lifted, `children` moved from index 1 to index 0, collided with the overlay's type, and **React tore down and rebuilt the entire homepage.** Measured in Chrome: the `<form>` and `<h1>` nodes were both replaced at +3920ms, and anything a visitor had typed into the contact form during the first four seconds was silently erased. Two Playwright specs failed on it; both looked like flaky-form bugs.

Collapse conditional returns into one return with stable slots:

```tsx
return (
  <>
    {condition ? <Overlay /> : null} {/* slot 0 — may be null, never a different child */}
    {children} {/* slot 1 — never moves */}
  </>
);
```

**How to test it:** a remount is invisible to any assertion that reads rendered text — the text is identical before and after. Only two things catch it:

```tsx
const before = screen.getByTestId('probe');
before.value = 'typed during the intro'; // uncontrolled input: value dies with the node
act(() => vi.advanceTimersByTime(10000));
expect(screen.getByTestId('probe')).toBe(before); // node identity
expect(screen.getByTestId('probe').value).toBe('typed…'); // survived state
expect(mountCounter).toHaveBeenCalledTimes(1); // effect ran once
```

### 2. Never let `motion` SSR an `initial` prop

`motion` serialises `initial` into inline styles during server render, so `initial={{ opacity: 0 }}` ships `style="opacity:0"` in the HTML. Without JS — or before hydration — that content is invisible, which is the same class of defect gate 10 exists for.

The primitive is `initial={false}` plus a state-driven `animate`: render visible, then wind back to hidden in a `useIsomorphicLayoutEffect` **before the first paint**, and let a trigger re-reveal it.

Related: an `exit` prop only runs if `AnimatePresence` is still mounted around the element being removed. If the same render unmounts both, `exit` and its `transition` are dead code that has never executed. Deleting them changes nothing; adding a real exit means hoisting `AnimatePresence` above the branch.

## These gates mirror a real commit blocker

`.husky/pre-commit` independently runs `prettier --check .`, `eslint .`, and `vitest run --coverage`. The 90% threshold is enforced by `vitest.config.mts` and is **project-wide, not changed-files-only** — adding an untested file lowers the global number and blocks the commit even if your own diff is fully covered.

Gates 1, 2 and 5 exist to catch that before commit time rather than after. Never propose loosening the threshold in `vitest.config.mts` to get green.

`src/components/ui/ProductCategoryGraph.tsx` is excluded from coverage in the config — do not add exclusions to make a number pass.

`pnpm-lock.yaml` is in `.prettierignore` as of 2026-09-18. It was not before: the npm → pnpm migration (`8fac64f`) ignored `package-lock.json` and never added the lockfile the repo actually uses, so **every dependency change failed gate 1 and the pre-commit hook** on a file pnpm rewrites from scratch on the next install. If you see a lockfile in `prettier --check` output again, the ignore entry has been lost — restore it rather than formatting the lockfile.

## On failure

1. Read the **actual** error output. Never act on a paraphrase.
2. Fix the root cause, not the symptom.
3. Re-run that gate, then continue from gate 1 — a fix can break an earlier gate.
4. Same gate failing twice on the same root cause → hand to the debugger agent.
5. Third failure → escalate to the human.

## Never

- Skip a gate to save time
- Use `--no-verify` to bypass hooks
- Delete, skip, or loosen a failing test to get green
- Lower a coverage threshold to meet it
- Commit with a failing gate

## Quick sequence

```bash
pnpm format:check && pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm test:coverage
```

```powershell
pnpm format:check && pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm test:coverage
```

Identical in both shells — pwsh 7 has the `&&` pipeline chain operator, verified here: `pnpm exec node -e "process.exit(5)" && Write-Host "SHOULD-NOT-PRINT"` printed nothing.

**`&&`, not `;`, and the difference is the whole point of this file.** An earlier revision of this block read `pnpm format:check; pnpm lint; pnpm exec tsc --noEmit; pnpm test` — four gates separated by `;`, which is the exact opposite of the instruction this document opens with ("Run in order. Stop at the first failure … a later gate's output is meaningless if an earlier one failed"). Measured in both shells: after a command exiting 5, the next one ran anyway, and the **final status read 0** — `LASTEXITCODE=0` in pwsh, `EXIT=0` in bash. So a gate-2 failure scrolls off the top while a green `Tests 339 passed` sits at the bottom, which is the false-green shape the evidence requirement above exists to prevent, handed to you pre-assembled by this file's own copy-paste block.

It also stopped at gate 4. Gate 5 is the one `.husky/pre-commit` independently blocks on, and coverage is **project-wide** — a new uncovered `catch` in an existing file moves the global number just as a new file does. A "quick sequence" that omits the gate most likely to reject the commit is quick in the wrong direction.

The five gates above are exactly the implementer's ownership column in the table at the top. Gates 6–10 belong to the reviewer and are not in this block on purpose.

## What already enforces this, and the `/goal` escalation

**A persistent prompt-based `Stop` hook is live in this repo** and checks every turn for the verbatim gate output demanded above, alongside a `SubagentStop` hook on the reviewer's verdict. Both are authored in `.github/hooks/agentic-guard.json` under `claudePromptHooks`. They are **model-evaluated conditions, not subprocesses** — no console window, which is why they are permitted here when script hooks are not. An earlier revision of this section claimed "Claude registers no hooks, so nothing stops a turn ending with a gate red." That is false for _prompt_ hooks and was drawing an operational conclusion from it: the evidence rule above is enforced, not advisory. Claude registers no **command** hooks; that part still holds. `.husky/pre-commit` remains the only blocker at commit time.

For a multi-turn change you can add a task-specific condition on top:

```
/goal pnpm lint, pnpm exec tsc --noEmit and pnpm test all exit 0, with the output shown in the transcript. Do not modify vitest.config.mts thresholds or skip any test.
```

After every turn a separate fast model reads the transcript and returns _met_, _not yet met_, or _impossible_; Claude keeps working until it resolves. Same mechanism as the two standing hooks, scoped to one task.

The evaluator cannot run commands or read files. It only sees what Claude has already surfaced, so the condition must name the command _and_ require its output in the transcript. `/goal clear` cancels; `/goal` alone shows status.

Requires workspace trust, like all hooks.
