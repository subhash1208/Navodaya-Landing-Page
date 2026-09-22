---
description: 'Use when coordinating multiple agents, delegating to subagents, deciding whether to run work in parallel or sequentially, or handing off between planner, researcher, implementer, reviewer, scribe, and memory-updater. Covers the delegation contract, batching, parallel fan-out, the review loop, and memory discipline.'
name: 'Agentic Workflow'
---

# Agentic Workflow Doctrine

## The roster

| Agent            | Owns                                                        | Never does                 |
| ---------------- | ----------------------------------------------------------- | -------------------------- |
| `planner`        | Decomposition, spec, and orchestration of every other agent | Write or review code       |
| `researcher`     | One narrow read-only question, cited                        | Modify anything            |
| `implementer`    | Code **and its tests**, self-verified                       | Review its own work        |
| `reviewer`       | All gates + the GREEN/RED verdict                           | Fix what it finds          |
| `scribe`         | Docs, specs, research notes                                 | Write code or run commands |
| `memory-updater` | Knowledge-graph consolidation                               | Touch the filesystem       |
| `debugger`       | Reproduce-first root-cause hunting                          | Build to spec              |

The planner is the only agent that delegates. It is both the decomposer and the orchestrator — splitting those two roles loses the decomposition in the handoff.

## Delegation contract

A subagent has **no memory of the parent conversation**. Every delegation is a cold start. It must carry:

1. **Goal** — one sentence, unambiguous
2. **Context** — the spec and any prior agent reports, pasted, not referenced
3. **Deliverable** — the exact output shape expected back
4. **Boundary** — what the subagent must not touch

A delegation missing any of these produces a subagent that guesses. Guessing is the primary failure mode of multi-agent systems.

## No-pause rule

The pipeline is automatic. Never ask "want me to delegate?", never present findings and wait for permission to act on them. When the reviewer returns RED, the fix goes straight back to the implementer.

Pause ONLY for: missing credentials, a protected-path violation, a destructive action, genuinely ambiguous requirements, or the round cap.

## Batching — stages are not todo items

**Group cohesive work into a SINGLE implementer stage and review ONCE at the end.** Eight related edits must not become eight orchestrations; that multiplies turnaround for zero quality gain.

Split into separate stages ONLY when tasks are genuinely independent and parallelising them buys speed, or when one task is risky enough to warrant isolated review.

A todo item is what the human sees. A stage is how the work runs. They are decoupled — a 10-item todo list is frequently one stage.

## Parallel vs sequential

Fan out in a single batch when tasks share no data dependency:

- Multiple researchers answering different questions — always parallel, one question each
- Independent implementer stages touching disjoint files — parallel
- Code work and doc work on the same feature — `implementer` ∥ `scribe`

Run sequentially when one agent's output is the next one's input. Do not artificially serialise independent work; it is the largest source of wasted wall-clock time.

**Rule:** one question per researcher. Two questions in one prompt produces two shallow answers instead of one deep one.

**Rule:** when two parallel stages share a contract — a type, a server-action payload shape, a design token — the planner defines it in the spec first and pastes it into both delegations. Disjoint files are not the same as independent work. A shared contract inferred twice is the classic parallel integration bug, and it passes both stages' tests before failing at the seam.

## Review loop

```
implementer ──> reviewer ──> VERDICT: GREEN ──> memory-updater ──> commit ──> human
      ▲              │
      └── fixes ◄────┘   rounds 1-4, automatic
                    └──> round 5: ESCALATE to human
```

The cap is 5 rounds and it is not advisory. Five failed rounds means the spec is wrong, not the code. Escalate with: what was tried, what still fails, and the specific decision needed.

`commit` is a stage, not a suggestion. A GREEN pipeline commits its own work locally — Conventional Commits format per `CONTRIBUTING.md`, staged file-by-file, never `git add -A`. The owner's gate is `git push`, which `permissions.ask` enforces independently, so stopping short of the commit only costs a human turn and protects nothing. `.husky/pre-commit` re-runs prettier, eslint and coverage, so a bad commit is caught there; if it fails, the GREEN verdict was wrong and the loop opens another round. `--no-verify` is never the answer.

Pass reviewer findings to the implementer **verbatim**. Summarising a fix list loses the precision that makes it actionable.

### GREEN is a real verdict — do not manufacture findings

A reviewer prompted to find gaps will usually report some, even when the work is sound. That failure mode is symmetrical with missing a bug and costs a full round each time it fires. Two rules keep it honest:

- **Every finding names a concrete failure.** Specific input or state → specific wrong output, crash, or violated gate. "Consider extracting this" and "this could be more robust" are not findings; they are opinions, and they belong in a separate _optional_ list that never blocks GREEN.
- **A clean diff returns GREEN on round 1.** Returning RED to look thorough trains the loop to churn.

Anthropic reached the same conclusion from the other direction: in Claude Code 2.1.274 they replaced `/code-review`'s multi-subagent fan-out with leaner inline review prompts, having found the extra reviewers mostly added noise. Single-pass review here is the deliberate design, not a shortcut.

## Verify, do not recall

This repo runs **Next.js 16 + React 19**, both newer than any current model's training data.

Before any agent uses, reviews, or plans around a framework API: read the relevant guide in `node_modules/next/dist/docs/`, or query `context7`. Do NOT guess at API shapes, package names, or import paths.

**`WebSearch` does not work under the VS Code Agents window.** The host strips it session-wide with `--disallowedTools WebSearch`, even though six agent definitions still grant it — the flag removes the tool at registration time, so no permission rule can give it back. Verified 2026-09-20; see `.github/CONTROL-PLANE-NOTES.md` §12.22.

**The replacement is the `tavily` MCP**, added 2026-09-20 for exactly this gap. MCP tools register under `mcp__tavily__*`, a different namespace from the one that flag filters, so they are unaffected. It runs **without an API key**: `tavily_search` and `tavily_extract` work, and the server's other three tools reply asking for one. `researcher` and `debugger` hold it — the two agents whose work is discovering unknowns. `implementer`, `reviewer` and `planner` deliberately do not: their need is API facts, which `context7` answers version-pinned, and five tool descriptions per holder is not free. If one of them needs an open search, that is a `researcher` delegation. `WebFetch` still works everywhere when you already know the URL.

A confident answer built on a stale API is worse than "I don't know" — it costs a full review round to discover.

This applies to the reviewer too: verify before flagging an API misuse, or you generate false positives.

### Reach for `context7` first — Next.js is not the only thing newer than you

`node_modules/next/dist/docs/` covers **Next.js only**, and only what shipped in the tarball. Seven other things in this stack also postdate your training data: **React 19, Tailwind, GSAP, Motion, Lenis, Vitest and Playwright**. For those, a bare `web` search returns whatever version the top blog post happened to use.

`planner`, `researcher`, `implementer`, `reviewer` and `debugger` hold the **context7** MCP, which returns **version-pinned** docs. Two tools, in this order:

1. `resolve-library-id` — turn a library name into an ID.
2. `query-docs` — ask the question against that ID.

**The names carry hyphens.** `resolve_library_id` and `get_library_docs`, which upstream guides use, **do not exist** — verified against Context7 4.1.1; see `.github/instructions/nextjs.instructions.md`.

**If those two tools are not in your tool list, do not stall and do not guess.** MCP servers bind at session start (§12.13), so a session that predates the server being added holds none of its tools no matter what `.mcp.json` says. Read `node_modules/` directly, `WebFetch` a URL you already know, and **say in your report that context7 was unavailable** — that line is what tells the parent a fresh session would have answered better. The same applies to `tavily`; and do not fall back to `WebSearch`, which the Agents window disables (§12.22).

`scribe` and `memory-updater` do not hold context7, by design — neither writes code against an API, and `memory-updater` has no web access at all. If you are one of those two and need an API fact, say so in your report rather than guessing; the agent that asked for it can verify.

Queries go to third parties — context7 to Upstash, tavily to Tavily. They carry the library name, topic or search terms you ask about — **never repo source**. Keep it that way: do not paste proprietary code into a `query-docs` or `tavily_search` call.

## Memory discipline

- `planner`, `researcher`, `implementer`, `reviewer`, and `scribe` have **read-only** memory access. Only `memory-updater` writes.
- **Never `read_graph`.** It dumps the whole graph and destroys the context window. Retrieve with `search_nodes` and `open_nodes` only.
- **Search with SHORT single keywords** (`gsap`, `contact-form`, `typewriter`). The memory server does whole-string substring matching, not per-word OR — a long natural-language phrase matches nothing and produces a false "the graph is empty" conclusion. If a search comes back empty, retry with a shorter keyword before assuming the fact isn't stored.
- Every pipeline that produced code changes, decisions, or durable findings ends with a `memory-updater` stage.
- When unsure whether a fact is durable, delegate it anyway. The memory-updater is the curator and will discard, merge, or flag it. Skipping delegation is how knowledge is silently lost.

## Context hygiene

- Pass forward findings, not transcripts. A researcher's 250-word report goes to the implementer; its tool calls do not.
- Never re-derive what a prior agent established. If the researcher cited `src/hooks/useTypewriter.ts:14`, the implementer reads that file directly — it does not re-search for it.
- Cite `path:line` everywhere. Uncited claims are unverified.

## Escalate to the human when

- Review round 5 is reached
- A subagent reports scope creep beyond the spec's blast radius
- An architectural choice has no clear precedent in the codebase
- Anything destructive is required (deleting files, force push, schema change)
- A guard hook denies an action the task genuinely requires
- The planner classifies a task as Level 4

## Anti-patterns

| Anti-pattern                                           | Why it fails                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| Planner writing code itself                            | Loses tool isolation; context fills with implementation detail |
| One researcher, many questions                         | Shallow answers, no parallelism gain                           |
| One stage per todo item                                | 8 orchestrations for 8 related edits — pure overhead           |
| Asking permission mid-loop                             | Turns an automatic pipeline into a manual one                  |
| Reviewer fixing what it finds                          | No independent verification of the fix                         |
| Unbounded review rounds                                | Scope drift, budget burn, no human decision point              |
| Recalling a Next.js 16 API instead of reading the docs | Confidently wrong code, costs a full round                     |
| Skipping memory-updater                                | Every session re-learns the same facts from scratch            |
| `read_graph` to "see what we know"                     | Blows the context window in one call                           |
