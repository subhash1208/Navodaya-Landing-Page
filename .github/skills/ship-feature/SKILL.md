---
name: ship-feature
description: >-
  This skill should be used when the user asks to "build", "add", "implement", or "ship"
  a feature, or types /ship-feature. Covers running that request through the full agentic
  pipeline — plan, parallel research, implement with tests, review loop, consolidate to
  memory, and commit locally. Do NOT use it for a change whose shape is already obvious
  and contained: a typo, a copy tweak, a one-line fix, a rename, or anything the user has
  already specified precisely enough to simply do. Six delegated stages have to buy
  decomposition or review that the change genuinely needs. When the code already exists
  and only the verdict is wanted, that is /review-loop; when something is broken and the
  cause is not yet understood, that is /fix-failure.
argument-hint: 'Describe the feature to build'
---

# Ship a feature

Drive the request through the full pipeline. Delegate to the `planner` agent as the first action — it owns decomposition and orchestration. If you are already the Planner, execute the stages yourself.

Execute in order, without pausing between stages:

1. **Plan** — produce the spec: blast radius, complexity level, EARS requirements, and MUST/SHOULD/MUST NOT acceptance criteria. If it is Level 4, stop and report that it must be split into Level ≤3 specs.

2. **Research** — invoke the `researcher` subagent **once per question, all in a single parallel batch**. One narrow question each. Never merge questions into one researcher.

3. **Build** — delegate to `implementer` with the spec plus every research report pasted in full. The implementer writes the code **and its tests**. Group cohesive work into ONE stage; only split when tasks are independent enough that parallelism buys real speed.

   If two parallel stages share a contract — a type, a server-action payload shape, a design token — define it in the spec first and paste it into both delegations.

4. **Review** — delegate to `reviewer`. On `VERDICT: RED`, pass the `## Required Fixes` list verbatim back to `implementer` and re-review immediately. Do not ask first. Hard cap: 5 rounds.

   Round 3 is a decision point. If the reviewer's `## Why this is not converging` diagnosis says the spec is wrong, escalate then — do not burn rounds 4 and 5.

5. **Consolidate** — on `VERDICT: GREEN`, delegate to `memory-updater` with what changed, what was decided, and what was learned.

6. **Commit** — then spawn a final `implementer` stage to `git add` the changed files and `git commit` them in Conventional Commits format. Do not ask first: `permissions.ask` gates `git push` and nothing earlier, so a local commit publishes nothing, and `.husky/pre-commit` re-runs prettier, eslint and coverage as an independent check on the GREEN. If pre-commit fails, the GREEN was wrong: open another RED round rather than reaching for `--no-verify`.

   **This is the one stage where a one-line delegation is wrong.** Stage explicitly — never `git add -A` — and notice what that rule actually demands of the delegation. The commit agent is a cold start with no memory of this pipeline, so "commit the changes" leaves it exactly one source of truth: `git status`. This tree routinely carries unrelated modified files, and nothing in `git status` distinguishes what your implementer just wrote from what was already dirty when the pipeline began. The agent cannot tell, so it guesses — and a guess here commits someone else's half-finished work under your commit message.

   Paste **the explicit list of paths**, taken from the implementer's and scribe's own reports rather than re-derived, and say to stage exactly those and nothing else. A path in `git status` that is not on your list is a finding to report, not a file to include.

   **Check the branch in the same delegation:** `git rev-parse --abbrev-ref HEAD`. `CONTRIBUTING.md` makes `master` PR-only and `develop` merge-from-feature-only, `.husky/pre-commit` enforces neither, and this pipeline commits without pausing — so a run that began on `master` lands a commit there before anyone reads the branch name.

   **If HEAD is `master` or `develop`, branch before committing — do not stop and ask.** An earlier revision of this line said to stop and report, reasoning that naming a branch is the human's call. That is the wrong trade twice over. The owner cut `permissions.ask` from 41 rules to 2 precisely because guards were interrupting ordinary work, and pausing here is an interruption for something that is not `git push`; and the asymmetry runs the other way regardless — a badly-named branch is one `git branch -m`, while an unwanted commit on `master` is a history rewind. `.github/instructions/agentic-workflow.instructions.md` has said "create the branch first" since the same pass that left this line contradicting it.

   The objection that line was reaching for is real, though, and worth keeping: **a cold-start commit agent has no idea what the work was, so it cannot name a branch.** So the pipeline names it, not the commit agent. You hold the spec — derive the name from the table in `CONTRIBUTING.md` (`feature/`, `fix/`, `perf/`, `test/`, `chore/`, lowercase with hyphens) and paste the exact `git switch -c <name>` into the delegation alongside the file list. Name the branch you created in your final report, so a rename stays one command away. On an existing `feature/`, `fix/`, `perf/`, `test/` or `chore/` branch, commit where you are.

If the feature needs documentation, run `scribe` in parallel with `implementer`.

Track stages with a todo list. Report after each stage. **Do not push** — end with the decision you need from the user.
