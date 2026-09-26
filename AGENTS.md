# Navodaya Landing Page — Agent Instructions

Next.js 16 · React 19 · TypeScript · Tailwind · GSAP/Motion/Lenis · Vitest + Playwright

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Commands

```
pnpm dev              pnpm lint             pnpm test
pnpm build            pnpm exec tsc --noEmit         pnpm test:coverage
                                                  pnpm test:e2e
```

This project uses **pnpm**. Never run `npm` or `npx` here — `npm install` would create a competing `package-lock.json` and a flat `node_modules`, breaking pnpm's linked store.

There is no `type-check` script — use `pnpm exec tsc --noEmit`.

## Before handing off any code change

`pnpm lint` → `pnpm exec tsc --noEmit` → `pnpm test` must all be clean. Full gate table is in `.github/instructions/quality-gates.instructions.md`.

## Structure

```
src/app/          routes, layouts, server actions
src/components/   layout/ · sections/ · ui/
src/hooks/        useTypewriter, useIntroFinished, ...
src/constants/    design tokens, content
src/utils/        cn() class merger
src/__tests__/    unit tests, mirrors src/ paths
e2e/              Playwright specs
```

## Non-negotiables

- Server components by default. `'use client'` only when state, effects, browser APIs, or handlers are needed — and pushed as low in the tree as possible.
- Compose classes with `cn()` from `src/utils/cn.ts`. Never template-string concatenation.
- Kill GSAP timelines and ScrollTrigger instances in effect cleanup. Leaked timelines are this repo's most common bug.
- Respect `prefers-reduced-motion` on every new animation.
- No `any`. Shared types go in `src/types/`.
- Never skip, delete, or loosen a failing test to get green. Never use `--no-verify`.
- Any component that gates page content behind client state — loading screens, auth walls, feature flags — must be verified with JavaScript disabled. Check what the server actually sends, not the post-hydration jsdom render. This rule exists because `LoadingScreen` shipped an empty homepage to crawlers while all nine gates were green; see "Why gate 10 exists" in the quality-gates file.
- Corrected twice on the same mistake in one pipeline → propose one failure-derived sentence for the relevant `.github/instructions/` file. One sentence, tied to the observed failure, routed through the normal review path — not a rewrite, not auto-applied.

## Agent team

Specialist agents live in `.github/agents/`. Pick `planner` for anything non-trivial — it orchestrates the rest.

| Agent            | Role                                                                         | Tools                                        |
| ---------------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| `planner`        | Decomposes into a spec, then drives every other agent through the pipeline   | read/execute (read-only terminal) + delegate |
| `researcher`     | Answers ONE narrow codebase question — run several in parallel               | read-only                                    |
| `implementer`    | Writes code **and its tests**, self-verifies with gates 1–5                  | read/edit/execute/**skill**                  |
| `reviewer`       | Runs all gates + security/bundle/a11y audit, returns GREEN or RED + fix list | read/execute/**skill**                       |
| `scribe`         | Docs, specs, ADRs, research notes — never code                               | read/edit docs                               |
| `memory-updater` | Consolidates durable facts into the knowledge graph                          | memory only                                  |
| `debugger`       | Reproduces and root-causes a failure                                         | read/edit/execute/**skill**                  |

Pipeline: `planner → researcher ×N (parallel) → implementer (code + tests) → reviewer ⇄ fix loop (max 5) → memory-updater → commit`

The pipeline ends with a **local commit**, not with a request for one. `permissions.ask` gates `git push` and nothing earlier, so a GREEN run commits its own work in Conventional Commits format and `.husky/pre-commit` re-runs the gates as an independent check. Pushing remains the human's call.

Slash commands (agent skills in `.github/skills/`): `/ship-feature` · `/parallel-research` · `/review-loop` · `/fix-failure` · `/dependency-audit` · `/gsap-framer-scroll-animation` — plus the ten `/speckit-*` lifecycle commands below.

Coordination rules — delegation contract, batching, parallel fan-out, memory discipline, escalation triggers — are in `.github/instructions/agentic-workflow.instructions.md`.

## AI-DLC layer: GitHub Spec Kit

This repo's spec/plan/tasks lifecycle runs on **GitHub Spec Kit** (`github/spec-kit`, MIT), adopted 2026-09-24 to replace ad-hoc "waves" planning. It won over three other candidates evaluated the same day — AWS `awslabs/aidlc-workflows` (MIT-0, closest name match, rejected because its Claude Code file footprint could not be confirmed from its docs against a repo where `.claude/` is wiped on every sync), BMAD-METHOD (rejected: npm-based, and ships its own competing 5-agent roster), and Agent OS (rejected: v3 retired its orchestration phases in favour of Claude's Plan Mode) — for two reasons:

- Its installer (`uv tool install specify-cli` + `specify init`) is Python/`uv`-based and touches **no Node packages**, critical here where `npm`/`npx` are banned (see "Never run `npm` or `npx`" above).
- It is a pure lifecycle/artifact layer — constitution → specify → plan → tasks → implement → converge — with **no competing agent roster**, so it sits on top of the 7 agents below rather than replacing them.

**It supplies the lifecycle and artifacts; it does not replace the pipeline or the gates.** The `planner → researcher ×N → implementer → reviewer ⇄ fix → memory-updater → commit` pipeline and the 10 quality gates in `.github/instructions/quality-gates.instructions.md` remain the sole source of truth for correctness. `.specify/` artifacts are input documents `planner` and `implementer` read, exactly like any other spec — nothing here overrides a gate.

Ten new commands, tracked as `.github/skills/speckit-*/SKILL.md`:

- **Core lifecycle:** `/speckit-constitution` (establish project principles) → `/speckit-specify` (baseline spec) → `/speckit-plan` (implementation plan) → `/speckit-tasks` (actionable tasks) → `/speckit-implement` (execute) → `/speckit-converge` (assess the codebase and append remaining work as tasks).
- **Optional quality steps:** `/speckit-clarify` (structured de-risking questions — run before `/speckit-plan`) · `/speckit-analyze` (cross-artifact consistency report — after `/speckit-tasks`, before `/speckit-implement`) · `/speckit-checklist` (validate requirements completeness — after `/speckit-plan`) · `/speckit-taskstoissues`.

Artifacts live in `.specify/` — **tracked in git**, unlike `aidlc-docs/` above: `memory/constitution.md`, `templates/*.md`, `scripts/powershell/`, `workflows/speckit/`, `integrations/*.json`. Its own `.specify/.gitignore` correctly excludes only the two genuinely machine-local files: `feature.json` (per-checkout pointer to the current feature) and `extensions/*/local-config.yml` (per-machine overrides).

**Standing rule, general to any future tool: anything that installs into `.claude/` must be relocated into `.github/`, or the next `pnpm agents:sync` destroys it.** `specify init --integration claude` installs its skills into `.claude/skills/`, which is generated and gitignored — `sync-claude.mjs` recursively deletes `.claude/agents`, `.claude/skills` and `.claude/rules` on every non-check run and rewrites only what `.github/` sources claim (see "Running under Claude Code" below). The 10 `speckit-*` skill directories were moved into `.github/skills/` for exactly this reason; they use the same `<name>/SKILL.md` shape as the repo's existing skills, so they now regenerate on every sync like everything else. Forensics — including the Prettier-scope and frontmatter-vocabulary side effects this adoption also produced — are in `.github/CONTROL-PLANE-NOTES.md`.

### Two upstream skills worth installing (not vendored)

Anthropic publishes a skill marketplace that carries two skills relevant to this repo — `frontend-design` and `webapp-testing`. They are **deliberately not vendored** into `.github/skills/`: upstream maintains them, and a stale copy here would be worse than no copy.

```
claude plugin marketplace add anthropics/skills
claude plugin install example-skills@anthropic-agent-skills
```

Verified 2026-09-18 against `anthropics/skills`: the marketplace id is `anthropic-agent-skills`, and `frontend-design` / `webapp-testing` live in the **`example-skills`** plugin — not `document-skills`.

**The catch:** plugins install whole. `example-skills` brings all twelve of its skills, including `slack-gif-creator`, `internal-comms`, and `algorithmic-art`, none of which apply here — and every skill description loads into context. Price it before committing:

```
claude plugin details example-skills@anthropic-agent-skills
```

That subcommand reports the projected token cost. If it is not worth twelve descriptions for two skills, copy the two `SKILL.md` files in by hand and record the upstream commit you took them from.

## Guards

> **STANDING OWNER DECISION — 2026-09-19. Do not add permission prompts.**
> `permissions.ask` contains exactly two rules: `Bash(git push:*)` and `PowerShell(git push:*)`. Pushing code is the only thing the owner wants to approve. Everything else Claude must be able to do without stopping.
> On 2026-09-19 `ask` was cut 41 → 2 and 42 `deny` rules were removed, because the guards were interrupting ordinary work. **"Enhance the setup" never means adding rules to `ask`.** New `deny` rules are acceptable only for secret exfiltration or irreversible destruction — those block silently and never prompt. A deny rule whose purpose is to stop Claude editing its own config is precisely what was removed and must not return.
> This overrides every hardening, symmetry and defence-in-depth argument in `permissions.json` and `CONTROL-PLANE-NOTES.md` — much of that text predates the decision and still argues for more rules. Full wording is in `permissions.json` under `//OWNER-DECISION-no-permission-prompts`.

> **COROLLARY — 2026-09-22. `deny` is not an autonomy cost.** On 2026-09-22 `permissions.json` was deleted outright and the `deny` array stripped from the generated mirror, in the belief that both were slowing Claude down. Neither was: `deny` blocks **silently** and only `ask` can ever interrupt a turn, so the deletion bought zero autonomy while surrendering every mechanical block on `rm -rf`, `git reset --hard`, force-push and secret reads. It also broke `pnpm agents:sync` outright (`ENOENT`, exit 1), leaving `.claude/settings.json` a stale orphan that still carried all 122 allow rules — so the live posture had not in fact changed. Rebuilt the same day to 168 `deny` / 132 `allow` / 2 `ask`. The owner decision restricts `ask`; it has never restricted `deny`.
>
> `claude doctor` is the only thing that reports a malformed rule, and it caught three in that rebuild: **`:*` is a prefix marker and must be terminal**, so `Bash(curl:*|*sh)` is silently _skipped_, not enforced. Rules needing an infix wildcard use bare `*` — `Bash(curl * | sh*)`. Run `claude doctor` after every permissions change; a skipped rule looks identical to a working one in the file.

`.github/hooks/scripts/guardrail.py` is a **portable second layer, deliberately not registered.** It implements the exit-2 PreToolUse blocking protocol over the same secret patterns, and `python .github/hooks/scripts/guardrail.py --self-test` runs 22 cases (12 block, 10 allow) covering the false-positive traps — `tokenize.ts`, `useApiKeyForm.tsx`, `env.d.ts` must all pass. Registering it as a command hook on Windows would reintroduce the console-window failure in `CONTROL-PLANE-NOTES.md` §1; the native `deny` rules already cover the same ground in-process. Run the self-test after editing its patterns.

Rules live in `.github/hooks/permissions.json` and are enforced by Claude natively, in-process. **Claude registers no _command_ hooks** — those hang on Windows and leave console windows on screen — but it does register the two **_prompt_** hooks in `agentic-guard.json` under `claudePromptHooks`: a `Stop` condition demanding verbatim gate output, and a `SubagentStop` condition on the reviewer's verdict. Prompt hooks are model-evaluated conditions, not subprocesses. Copilot registers all four command hooks from the same file. Two consequences worth knowing before you fight the guard:

- A shell rule must be written **twice**, as `Bash(...)` and `PowerShell(...)`. One form alone protects nothing on Windows. This is about _correctness_ of a rule that already exists — it is not a licence to add new ones.
- `deny`/`ask` match **any subcommand**, including inside `&&`, a pipe, a subshell or a loop body. If you need a forbidden string as test data, build it by concatenation.

**This workspace is trusted** as of 2026-09-19, so `permissions.allow` (132 rules) and `additionalDirectories` are live. They are the two things trust gates; `deny`, `ask`, the `env` block, the prompt hooks and the MCP servers apply regardless. If you ever see `Ignoring N permissions.allow entries … this workspace has not been trusted` on stderr, trust was lost — the warning names both remedies, and the scriptable one is `projects["D:/Projects/navodaya-landing-page"].hasTrustDialogAccepted: true` in `~/.claude.json` (forward slashes, no trailing separator, and back the file up first — it holds live session state). See `.github/CONTROL-PLANE-NOTES.md` §13.1.

Autonomy lives at **user scope**, not here: `~/.claude/settings.json` carries `permissions.defaultMode: "auto"` plus the `autoMode` classifier rulebook. A project file may not grant those — the binary drops them at load with a `warn` nothing surfaces. Do **not** add `defaultMode` to `permissions.json` to "fix" anything: any value other than `auto` is honoured _and overrides_ the user-scope setting, so it would silently downgrade autonomy. `pnpm agents:sync` now throws rather than let that happen. §12.17.

MCP servers (`context7`, `memory`, `sequential-thinking`, `tavily`) are declared in `.vscode/mcp.json` and must also be named in `enabledMcpjsonServers` — a project-scope server that is declared but not enabled never launches. Do not assume the documented `npx` launcher works here — it does not. Verify with `claude mcp list`.

**`context7` returns version-pinned library docs** and is the answer to this repo's loudest rule, "This is NOT the Next.js you know" — applied to the seven other things in the stack that `node_modules/next/dist/docs/` does not cover. Its two tools are `resolve-library-id` and `query-docs`; the `resolve_library_id` / `get_library_docs` names in upstream guides **do not exist**. Held by `planner`, `researcher`, `implementer`, `reviewer` and `debugger`, deliberately not by `scribe` or `memory-updater`.

**`tavily` is the open-web search that `WebSearch` can no longer be.** The Agents window spawns the binary with `--disallowedTools WebSearch`, stripping that tool at registration time where no permission rule can reach it; MCP tools live in the `mcp__tavily__*` namespace and are untouched. It runs **keyless** — `tavily_search` and `tavily_extract` work with no signup, the other three tools ask for an API key. Held by `researcher` and `debugger` only; the other agents' need is version-pinned API facts, which is `context7`'s job. Same third-party discipline as context7: search terms and public URLs, never repo source.

**MCP servers and agent definitions both load at session start** — see "Running under Claude Code" below.

**Rationale, forensics and every verified correction are in [`.github/CONTROL-PLANE-NOTES.md`](.github/CONTROL-PLANE-NOTES.md).** Read it before changing the control plane.

## Running under Claude Code

`.github/` is the single source of truth, but Claude Code reads different paths. `pnpm agents:sync` generates the translation:

| Generated                               | From                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `.claude/agents/*.md`                   | `.github/agents/*.agent.md`                                                     |
| `.claude/skills/*/`                     | `.github/skills/*/`                                                             |
| `.claude/settings.json`                 | `.github/hooks/agentic-guard.json` + `permissions.json`                         |
| `<dir>/CLAUDE.md` — **gone**, see below | —                                                                               |
| `.claude/rules/*.md`                    | `.github/instructions/*.instructions.md` — `applyTo` becomes `paths:`, verbatim |
| `.mcp.json`                             | `.vscode/mcp.json`                                                              |

**Never edit `.claude/`, `.mcp.json`, or any generated file by hand; the next sync overwrites them.** Edit the `.github/` source and re-run. `pnpm agents:sync:check` exits 1 when the mirror is stale, when a generated file is orphaned by a deleted source, _or_ when a source contradicts itself. Generated files are gitignored — this is local tooling, not product code.

Three of those failures are **not fixed by re-running the sync** — the source file itself is wrong, and the check says which:

| Label     | Means                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| `promise` | An agent's prose tells it to use a tool its `tools:` does not grant. Add the capability or drop the instruction. |
| `dropped` | Source frontmatter declares a key the emitter does not emit. It would read as configured and do nothing.         |
| `claim`   | A string that was already corrected elsewhere has reappeared. The message names the correction.                  |

The `claim` guard exists because corrections here have a habit of landing in one file and stopping — four did in a single day, each leaving the stale wording in the file that actually loads. If your text is legitimately _quoting_ an old claim in order to refute it, add your file to that rule's `allow` list in `sync-claude.mjs`; making that a deliberate edit is the point. Forensics in `.github/CONTROL-PLANE-NOTES.md` §12.16.

**Skills and settings reload in-session; agent definitions do not.** After changing `.github/agents/**`, `pnpm agents:sync` is necessary but not sufficient — subagents spawned in the current session still run the definition loaded at session start. Start a new session before testing an agent change, or you will measure the old one. Skill descriptions and `settings.json`, by contrast, take effect immediately. See `.github/CONTROL-PLANE-NOTES.md` §12.4.

An instruction file with no `applyTo` applies everywhere and must be imported by hand from the root `CLAUDE.md`; the sync prints a reminder listing which ones it found. Ones that **do** carry `applyTo` need no import — they become `.claude/rules/*.md` and load only when a matching file is in play, bare root files like `vitest.config.mts` included. Until 2026-09-18 they were flattened into scattered `<dir>/CLAUDE.md` files instead, which coarsened three globs and dropped two outright; if you find a stray `CLAUDE.md` inside `src/`, it is a leftover and the sync will sweep it. Translation gaps are in `.github/CONTROL-PLANE-NOTES.md` §6, the forensics in §12.14.

## Escalate to the human

Review round 5 · scope creep beyond the spec · architectural choice with no precedent · anything destructive · a guard blocking required work · planner returns Level 4.
