# Control plane — notes and rationale

This file holds the _why_ behind the agent control plane. It is deliberately **not**
loaded into context: `AGENTS.md` is imported by the root `CLAUDE.md` on every single
turn, and carrying several thousand tokens of historical forensics there competes with
the directives that actually change behaviour. Official guidance is explicit that a
bloated always-on instruction file causes the real rules to get ignored.

Read this when you are changing the control plane, debugging it, or about to "fix"
something that was already deliberated. Everything here was verified by direct test on
the date given.

---

## 1. Hooks vs. permissions — why Claude registers zero hooks

**`permissions.json` is the primary layer, and under Claude it is the only one.**

Every hook is a process spawn that blocks the tool call. On Windows the host runs it via
`cmd /c` _without_ `windowsHide`, so each one allocates a console window. Worse, a hook
that hangs leaves that window on screen: under `cmd /c` the node child never sees stdin
close, blocks forever on the `end` event, and `cmd.exe` waits on it indefinitely. The
registered `timeout` does **not** reap them — observed 2026-09-17 as roughly eleven live
`cmd`/`conhost`/`node` trios, up to 4.6 minutes old.

A guard that litters windows across the desktop gets the whole system switched off, which
protects nothing. Claude enforces `permissions` in-process instead: no spawn, no window,
nothing that can leak, and the rules still hold when node cannot be found.

So Claude registers **no hooks at all** — `sync-claude.mjs` prints the four it skipped and
why on every run. Copilot still registers all four, because it has no permission system
and the hook is its only mechanism; the scripts carry a stdin watchdog so they cannot hang
there either.

### The launcher

Every hook is launched through `.github/hooks/scripts/run-hook.cmd`, never bare `node`. A
hook that cannot find its interpreter exits non-zero, both hosts read that as "no
decision", and the whole guard system silently becomes decoration while still _looking_
configured. The launcher resolves node defensively and, failing that, says so loudly
instead of exiting quietly.

### What this costs

There is no deterministic, per-turn enforcement of the quality gates under Claude. The
gates are advisory prose plus the real blocker in `.husky/pre-commit`. Two hook-free
mechanisms close that gap without reintroducing a subprocess — see §5.

---

## 2. Three corrections, all verified 2026-09-17

### Shell rules must be declared twice

Permission rules are keyed by _tool name_, and on Windows this host runs commands through
a **PowerShell** tool, not Bash. While every shell rule existed only in its `Bash(...)`
form, the entire shell guard was decoration — `npm --version` ran and printed `11.17.0`
despite `Bash(npm:*)` sitting in `deny`.

`Read(...)` and `Edit(...)` rules were never affected, since those _are_ the real tool
names, so the file guards held throughout and only the shell layer was open.

Every shell rule now carries both forms. PowerShell rules canonicalise aliases, so
`PowerShell(Remove-Item *)` also covers `rm`, `ri`, `del` and `rd` — **write the cmdlet,
not the alias.** When adding a shell rule, add both forms or it protects nothing here.

### Compound commands are not the gap this repo used to claim

The old note said `pnpm test && rm -rf dist` slipped through because matching is
prefix-only, and called that an accepted risk. **That was wrong**, and it understated the
protection actually in place.

Claude Code splits a command on `&&`, `||`, `;`, `|`, `|&`, `&` and newlines (and parses
the PowerShell AST for the PowerShell tool), then applies **deny and ask rules when _any_
subcommand matches** — including inside a subshell, a command substitution, or a loop
body. Allow rules run the strict way: every subcommand must match or the command still
prompts.

The real residue is a bare **flag**, which is not a subcommand — hence the explicit
`--no-verify` deny rules.

### Write rules do not exist

`Edit(path)` governs every file-editing tool, Write and NotebookEdit included. A
`Write(path)` rule is silently inert, and Claude prints
`Write(...) is not matched by file permission checks` for each one at startup.

`permissions.json` carries none, on purpose — the 23 that used to be there produced ~30
warnings a session and the false impression of a second layer that was never enforced.

**Upstream corroborated this independently in 2.1.275** (`CHANGELOG.md:39`): _"Fixed
`/update-config` writing `Write(path)` permission rules, which file permission checks don't
match, instead of `Edit(path)` rules."_ Anthropic's own config writer was emitting the same inert
rule this repo deleted. Two things follow. The finding was not a local misreading — it is the
documented behaviour of the permission checker. And **`/update-config` is unsafe to run on this
binary**: 2.1.211 predates that fix, so it will write `Write(...)` rules straight back into
`.claude/settings.json`, which is a generated file the next `pnpm agents:sync` overwrites anyway.
Edit `.github/hooks/permissions.json` by hand instead.

---

## 3. Workspace trust gates most of this

**This is the keystone. Get it wrong and three separate layers silently do nothing.**

Since v2.1.196 Claude ignores `permissions.allow`, `permissions.additionalDirectories`,
`extraKnownMarketplaces` and **most `env` values** from a repo-checked-in
`.claude/settings.json` until the folder is trusted.

> **Correction, 2026-09-18.** An earlier revision said "`claude config get` says so out loud:
> `Ignoring 15 permissions.allow entries …`". **`config` is not a subcommand on 2.1.211** — it is
> parsed as a _prompt_ and starts a conversation. The subcommand list is `agents`, `auth`,
> `auto-mode`, `doctor`, `gateway`, `install`, `mcp`, `plugin`, `project`, `setup-token`,
> `ultrareview`, `update`.
>
> **Second correction, same day: the MESSAGE is real — only the command was wrong.** It prints on
> **stderr at session start**, every session, and it names its own remedy:
>
> ```
> Ignoring 1 permissions.allow entry from .claude/settings.json: this workspace has not been
> trusted. Run Claude Code interactively here once and accept the trust dialog, or set
> projects["D:/Projects/navodaya-landing-page"].hasTrustDialogAccepted: true in
> C:\Users\Sudee\.claude.json.
> ```
>
> So the diagnostic was there the whole time. Nothing was reading stderr. Capture it with
> `claude -p "hi" 2>&1 | grep Ignoring` — and note it resolves to the **git root**, not the
> subdirectory you happen to be in.

### `settings.local.json` really does escape the gate — measured, not assumed

A paired probe on this untrusted workspace, identical rule (`Bash(echo:*)`) in each arm:

| Rule lives in                              | Session-start stderr                   | Verdict      |
| ------------------------------------------ | -------------------------------------- | ------------ |
| `.claude/settings.json` (project, tracked) | `Ignoring 1 permissions.allow entry …` | **ignored**  |
| `.claude/settings.local.json` (untracked)  | _(silent)_                             | **honoured** |

**Do not read that as a recommendation.** The trust gate exists so that a checked-in settings file
cannot grant permissions to whoever clones the repo; routing around it with a local file is
defeating a safety mechanism rather than satisfying it. The intended fix — taken on 2026-09-19, see
§13.1 — is to grant trust properly, which activates the `allow` rules, the project `env` block and
`additionalDirectories` **together**. It does not require the interactive dialog this table's
caption assumed: the warning's own second clause sanctions writing
`hasTrustDialogAccepted: true` into `~/.claude.json`. Reach for `settings.local.json` only on a
machine where neither path is available, and only for the narrow subset of rules needed there.

`deny` and `ask` still apply, so an untrusted workspace **fails safe** — but every gate
command prompts, `/goal` is unavailable, and the status line stays blank.

Verified on this machine 2026-09-17: `~/.claude.json` held **no project entry at all** for
this repo, `knowledge-graph.jsonl` was 0 bytes, both MCP servers reported
`⏸ Pending approval`, and `$env:PATHEXT` was the mangled `.CPL` because the `env` block
was gated too — leaving `node`, `pnpm`, `git` and `claude` all unresolvable and every
quality gate unrunnable.

**Correction, verified 2026-09-18: trust does NOT gate MCP.** Re-checked while the workspace was
still untrusted (`~/.claude.json` had no entry for this repo — it does now, see §13.1), both
servers launch and work — a live `search_nodes` returned real entities, and
`knowledge-graph.jsonl` now holds
7622 bytes at the repo root, gitignored at `.gitignore:70`. The 2026-09-17 observation above
was a real measurement, but the causal claim drawn from it was wrong: the graph was empty
because nothing had written to it yet, not because trust blocked the servers. See §4.

**Trust it by running `claude` in the project once and accepting the dialog.**

Two things do not wait for trust, and are used deliberately:

- **`~/.claude/settings.json` (user scope)** — never trust-gated. `PATHEXT` lives there, so
  it repairs every project including untrusted ones, which is the case that needs it most.
- **`.claude/settings.local.json`** — its `allow` rules apply without the trust step _while
  the file stays untracked_. If git starts tracking it, the trust gate applies to it too.

---

## 4. MCP servers

Configured in `.vscode/mcp.json` (Copilot's `servers` key) and translated to `.mcp.json`
(Claude's `mcpServers` key) by the sync. Three things are easy to get wrong, all verified
2026-09-17:

- **`${workspaceFolder}` is a VS Code-ism.** Claude's only substitutions are `${VAR}` and
  `${VAR:-default}`. The sync rewrites it to `${CLAUDE_PROJECT_DIR:-.}`, which needs the
  `:-.` default because Claude sets `CLAUDE_PROJECT_DIR` in the _server's_ environment, not
  its own.
- **Neither server can be launched by `npx`, `pnpm dlx`, or `pnpm add -g`.** All three die
  with `Cannot find package 'zod'`. That is an upstream bug: both packages import `zod`
  without declaring it, and only npm's flat tree resolves the phantom import by accident.
  They are installed as a plain pnpm project at `D:/mise/mcp-servers` — outside every repo,
  so no product `package.json` gains agent tooling — and launched by absolute path with
  `node`.
- **A project-scope server starts life unapproved** and reports `⏸ Pending approval`
  until something approves it. `permissions.json` approves them by name via
  `enabledMcpjsonServers`; the sync cross-checks those names against the declared servers
  and fails the build on a mismatch, because a typo here looks exactly like a working
  config.

Launching by absolute path **pins the version**. The documented `npx -y` form re-resolves
latest on every start, which is convenient right up until an upstream release renames a
tool and silently empties every agent's allowlist. The cost of pinning is that upgrades are
manual, so `pnpm agents:sync` runs a throttled (weekly) drift check and prints a notice when
a newer release ships. Run it on demand with `pnpm mcp:versions`, or `pnpm mcp:versions
--check` to exit non-zero on drift. It is never fatal — an offline machine must still be
able to sync — and it deliberately does **not** run on `agents:sync:check`, which fires in
hooks and CI where a network call has no business.

Upgrade with `pnpm --dir D:/mise/mcp-servers up`, then re-verify the tool names in
`.vscode/mcp.json`'s `//tool-names` comment against the new `dist/index.js`.

### Do not verify MCP with `claude mcp list`

An earlier revision of this file called it "the only honest confirmation that the graph will
be written." That is **wrong**, verified 2026-09-18.

Run as a non-interactive subprocess — which is what happens any time an agent shells out to
it — `claude mcp list` reports:

```
memory: node D:\mise\mcp-servers\...\index.js - ⏸ Pending approval (run `claude` to approve)
sequential-thinking: node D:\mise\...\index.js - ⏸ Pending approval (run `claude` to approve)
```

…while both servers are fully functional in the calling session. The subprocess is a fresh
Claude instance reporting **its own** approval state, not the session's. Acting on it sends
you off debugging a control plane that is already working.

**Verify by calling a real tool instead** — `search_nodes` with a short keyword. A response
containing real entities is proof; nothing else is. Cross-check by reading the graph file
directly:

```bash
ls -la knowledge-graph.jsonl        # non-zero size means writes are landing
git check-ignore -v knowledge-graph.jsonl   # must be ignored — .gitignore:70
```

---

## 5. Closing the enforcement gap without a subprocess

Removing all hooks (§1) left the quality gates advisory. Two mechanisms restore per-turn
enforcement and neither spawns a process:

- **`/goal <condition>`** — sets a completion condition. After every turn a small fast model
  reads the transcript and returns _met_ / _not yet met_ / _impossible_; Claude keeps
  working until it resolves. It is a session-scoped **prompt-based Stop hook**, so the
  evaluator is a model call, not a script — no `cmd /c`, no console window. The evaluator
  cannot run commands or read files, so the condition must be provable from what Claude has
  already surfaced in the conversation.
- **Prompt-based Stop hooks in `settings.json`** — the persistent form of the same thing.
  Scoped to every session rather than one, and likewise model-evaluated rather than spawned.

Use `/goal` for a single long task; reach for a prompt-based Stop hook when the same
condition should apply to every session in the repo.

**As of 2026-09-18 this repo no longer relies on `/goal` alone — it ships two persistent
prompt hooks**, authored in `agentic-guard.json` under `claudePromptHooks` and merged into
`.claude/settings.json` by the sync. See §11 for what they enforce.

An earlier revision of this section ended both bullets with "requires workspace trust (§3),
since it is part of the hooks system." **That was an inference, and it is false.** It was
measured, not reasoned about, in §11: a prompt hook fires on an untrusted workspace. The
inference was reasonable — `permissions.allow` and project `env` genuinely are trust-gated —
and still wrong, which is the whole reason §11 records the experiment rather than the
conclusion.

---

## 6. Translation gaps

`.github/` is the source of truth; Claude Code reads different paths. `pnpm agents:sync`
generates the translation, and these are the places it cannot be faithful:

- **Tool names.** `execute` emits both `Bash` and `PowerShell`, and `agent` emits both
  `Task` and `Agent`, because the shell and delegation tools are named differently in the
  Claude Code CLI and the VS Code agent host. The field is an allowlist, so the name that
  does not exist in a given host is inert. Run `/agents` to confirm what resolved.
- **`agents:` restriction.** Copilot's planner may only spawn a named set of subagents.
  Claude grants delegation wholesale via the Task tool, so the restriction is emitted as a
  prose directive instead of an enforced boundary.
- **Model preference lists.** Copilot takes an ordered list; Claude takes one model. The
  first Anthropic entry wins, and a GPT-only preference becomes `inherit`.
- **Instruction scoping — no longer a gap.** Copilot's `applyTo` and Claude's `.claude/rules/`
  `paths:` are the same glob dialect, so the translation is a rename and the globs pass through
  verbatim. No coarsening; bare root-file globs (`vitest.config.mts`) keep their scope. This entry
  used to describe a directory-`CLAUDE.md` reduction that lost two files outright — see §12.14 for
  what that cost and how it was measured. Instruction files with **no** `applyTo` are global and are
  still imported from the root `CLAUDE.md` by hand; emitting them as unconditional rules would load
  them twice. The sync prints a reminder listing which ones it found.

## 7. Version gate — what this setup needs from the Claude Code binary

Recorded 2026-09-18. Installed: **2.1.211** (WinGet, `Anthropic.ClaudeCode`). Latest: **2.1.274**.
Check with `claude --version`; upgrade with `winget upgrade Anthropic.ClaudeCode`.

Version matters more here than in a typical repo, because this control plane leans on three
things that were all still being fixed upstream: prompt-based Stop hooks (`/goal`), Windows
PowerShell execution, and the Bash permission matcher that the entire guard model rests on.

Fixes between 2.1.211 and 2.1.274 that land directly on this setup:

| Version               | Fix                                                                              | Why it matters here                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1.274               | `/goal` no longer silently lost across compaction                                | `/goal` is this repo's **only** turn-level enforcement (§5). Losing it mid-session silently removes the feedback loop.                        |
| 2.1.236               | `/goal` idle check-ins                                                           | Does not exist on 2.1.211 at all.                                                                                                             |
| 2.1.269 / .273        | "Prompt is too long" stuck sessions; auto-compact firing at half the real window | The instruction stack here is large; premature compaction is the trigger for the 2.1.274 `/goal` bug above.                                   |
| 2.1.267               | CRLF `Edit` failures — "String not found in file"                                | `6a6a5a3` normalised line endings in this repo. This is the exact failure mode.                                                               |
| 2.1.271               | Bash permission-checker gaps in subshells and `cd` chains                        | `permissions.json` matches **subcommands**. A parsing gap is a guard bypass, not a cosmetic bug.                                              |
| 2.1.271 / .272        | PowerShell silent failures at 260-char temp paths                                | Windows-only; every rule here is duplicated as `PowerShell(...)`.                                                                             |
| 2.1.269               | PowerShell background commands dying on exit                                     | Affects backgrounded gate runs.                                                                                                               |
| 2.1.232 / .233 / .234 | PowerShell permission-bypass fixes; NT-namespace path hardening                  | Directly strengthens the deny list.                                                                                                           |
| 2.1.228               | Git Bash discovery on Windows                                                    | This repo's shell is Git Bash.                                                                                                                |
| 2.1.217+ / .219       | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`                                           | On 2.1.211 nesting depth is fixed at 5 with no configurability, so "the planner is the only agent that delegates" is convention, not a limit. |

**Upgrading changes the permission posture — which is why `defaultMode` is now pinned.**
From 2.1.233 on native Windows (2.1.228 on macOS/Linux/WSL) the _built-in_ default flips to
`auto` for Pro/Max/Team plans. An absent `defaultMode` key does not mean "stay on default";
it means "inherit whatever the host's built-in default is". `permissions.json` now sets
`"defaultMode": "default"` explicitly so the upgrade cannot silently swap a hard deny list
for `auto`'s heuristic classifier. See the `//defaultMode` note in that file.

**The Windows hook console-flash bug is still open at 2.1.274** (#91264, with #70200 and
#66540 as duplicates). The 2.1.271 fix is tagged **(VSCode)** only. The zero-hooks decision
in §1 therefore stands after upgrading — do not revisit it on the assumption it was fixed.

## 8. `CLAUDE_CODE_SUBAGENT_MODEL` — never set this

It forces **one** model for every subagent, silently overriding the per-agent `model:` field
in each `.github/agents/*.agent.md`. The tiering here is deliberate — `planner`, `reviewer`
and `debugger` run Opus; `implementer`, `researcher`, `scribe` and `memory-updater` run
Sonnet — and this variable erases it with no warning and no visible diff.

Worse, it is read from the **user** scope (`~/.claude/settings.json`) and from the ambient
process environment, so it does **not** require workspace trust and nothing in this repo can
override it. Symptom: agents behave uniformly and cost changes, while `.github/` and
`.claude/agents/` both still show the correct per-agent models. If tiering appears not to
apply, check this variable before suspecting the sync:

```bash
claude config get env 2>/dev/null; echo "ambient: ${CLAUDE_CODE_SUBAGENT_MODEL:-<unset>}"
```

## 9. Instruction-stack budget

Anthropic's own guidance (code.claude.com/docs/en/costs) puts the practical ceiling for a
project instruction stack near **200 lines**; everything above that competes for attention on
every single turn. This repo is well over it, because the root `CLAUDE.md` imports
`AGENTS.md`, `quality-gates` and `agentic-workflow` unconditionally.

Measured 2026-09-19 — **499 lines**, 2.5× the ceiling:

```bash
cat CLAUDE.md AGENTS.md \
    .github/instructions/quality-gates.instructions.md \
    .github/instructions/agentic-workflow.instructions.md | wc -l
```

```
  18 CLAUDE.md
 129 AGENTS.md
 211 .github/instructions/quality-gates.instructions.md
 141 .github/instructions/agentic-workflow.instructions.md
 499 total
```

(An earlier revision of this section estimated 290–300; the revision before this one recorded 452. Neither is worth trusting — the first was never measured, and the second was accurate
for about a day. **Re-run the command; do not cite the number.** A measurement in a document
that the measurement's own subject keeps growing is stale by construction, which is why the
per-file breakdown is printed above: it tells you _which_ file moved, and that is the part
that survives.)

The known cost: a `researcher` answering one narrow read-only question still loads the full
planner-only orchestration doctrine, which it can never act on.

The diagnostic from the same docs is worth keeping: **if Claude keeps doing something you
told it not to, the instruction file is probably too long** — the rule is present but
outcompeted. Reach for deletion before emphasis. Adding "IMPORTANT" to a rule in a file that
is already over budget makes the problem worse, not better.

Do not fix this by trimming the failure-derived rules — those were each paid for with a real
bug. Trim vendored and duplicated prose first; §5 and §7 of `nextjs.instructions.md` were
already reduced to stubs on exactly this reasoning.

**The other lever is relocation, not deletion.** A rule that only matters during one kind of
work belongs in the skill for that work, where it loads on demand, with a one-line pointer
left behind in the always-loaded file. The pnpm-overrides and dev-audit findings moved from
`quality-gates` into `/dependency-audit` on 2026-09-18 on exactly this reasoning — the
knowledge stayed reachable and the per-turn stack got smaller. Prefer this to deletion
whenever the content is real but situational.

There are now **two** relocation targets, and they answer different questions. A skill loads when
the _work_ is that kind of work (`/dependency-audit`). A `.claude/rules/*.md` with `paths:` loads
when the _file in hand_ is that kind of file — the `applyTo` semantics, natively, since §12.14.
Neither counts against the always-on budget measured above. Prefer the rule when the trigger is a
path, the skill when the trigger is a task.

## 10. `claude doctor` type-checks settings — run it after every settings change, but know its blind spot

An invalid key in `settings.json` **fails silently in every other channel**: it does not fail
`pnpm agents:sync`, does not warn at startup, and reads as perfectly configured in any file
listing. It is the same silent-decoration failure mode as the `Bash(...)`-only shell rules (§2)
and the `ppnpm audit` typo.

`claude doctor` is the only thing that surfaces it, and per its own help text it _"reads settings
files in the current directory without a trust prompt"_ — so it works on this untrusted
workspace, unlike most of the control plane:

```bash
cd <repo root> && claude doctor          # look for an "Invalid settings" block; absent == clean
```

**Its blind spot, measured 2026-09-18 against 2.1.211:** `doctor` type-checks the keys it
_recognises_ and says nothing at all about keys it does not. A settings file containing
`"TOTALLY_FAKE_KEY_CONTROL": 12345` ran a clean session and produced no doctor finding and no
launch warning. So a **misspelled** settings key is completely invisible — it is not a typo the
tooling catches, it is a key that quietly does nothing forever. Confirm spelling against the
docs when adding one; nothing downstream will tell you it was wrong. §11 turns this blind spot
into a usable test.

It found exactly one such key on 2026-09-18, and the story of what happened next is the real
lesson:

```
Invalid settings
- …\.claude\settings.json › permissions.disableBypassPermissionsMode: Invalid value.
  Expected one of: "disable"     Suggested fix: Valid values: "disable"
```

The key had been `true` since the day it was added — schema-invalid, therefore inert. Applying
the suggested fix made it valid, which made the latch **real** and actually removed the owner's
ability to enter `bypassPermissions` mode. That was the worse outcome: a security-shaped edit
that silently took away a human capability.

**`disableBypassPermissionsMode` is now deliberately absent, at the owner's explicit instruction.
Do not re-add it at any value.** The `//rejected-disableBypassPermissionsMode` note in
`permissions.json` carries the full rationale. If an audit flags its absence as a hardening gap,
it is not one.

The generalisable rule: **"invalid" and "undesirable" are different questions.** Before applying a
validator's suggested fix to a permissions value, check what the corrected value actually _does_.
A validator confirms the schema, never the intent.

Two other commands worth knowing, both surfaced while chasing this:

- **`claude plugin eval`** — runs scored eval cases (`evals/**/case.yaml`, or `prompt.md` +
  `graders/*.md`) against a plugin, including a no-plugin baseline arm. This is the mechanism for
  _measuring_ whether agents and skills actually work, rather than asserting they do. Nothing in
  this repo uses it yet.
- **`claude plugin details <name>`** — reports a plugin's component inventory and **projected
  token cost** before you install it. Run it before adopting any marketplace plugin; plugins
  install whole, and every bundled skill description is charged to the context budget on every
  turn (see §9).

---

## 11. Prompt hooks: the experiment, and how to test a settings key exists

Everything in this section was measured on 2026-09-18 against **2.1.211**, on this workspace,
in its untrusted state. Re-run the probes after an upgrade rather than inheriting the results.

### 11.1 A prompt hook is a CONDITION, not a judge — get this wrong and it blocks forever

This is the single most important fact in this section, and it was learned by shipping the
mistake. Anthropic's own `plugin-dev` skill calls prompt hooks "Recommended" and shows a
`{"decision": "approve|block", "reason": ...}` output block, which reads like a judge contract.
**It is not how the prompt is consumed.**

A prompt hook is the same machinery as `/goal`. The host treats your `prompt` as a **statement
that must be true before the turn may end**, hands it to a model along with the turn, and gets
back prose. When the statement is judged unmet, the host injects this into the conversation and
lets the turn continue:

```
Stop hook feedback:
[<your prompt, verbatim>]: <the evaluator's reasoning>
```

**The failure mode.** A prompt phrased as an instruction to a judge —
`"Respond {"ok": true} UNLESS the turn did one of these…"` — is read as a requirement that the
**assistant** emit that JSON. The assistant never does. The condition is therefore never
satisfied and the hook **blocks every turn, forever**, until the turn cap. This repo shipped
exactly that phrasing for one revision.

Three probes established it, each a scratch project with one Stop hook:

| Probe prompt                                                     | Outcome                                                                   | What it proves                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `Always respond {"decision":"block","reason":"P5DECISIONSHAPE"}` | `Reached max turns (3)`                                                   | Blocks. So the `{"decision"}` shape is not a magic word either.                                                         |
| `Always respond with exactly this single word: P6BANANAGARBAGE`  | `num_turns:1`, exit 0, assistant output `P6BANANAGARBAGE`                 | Non-JSON does **not** fail open. The assistant satisfied the _condition_ by saying the word — pure condition semantics. |
| `…reason "SAW=<the exact word the assistant wrote>"…`            | evaluator replied _"The actual assistant final message was 'PINEAPPLE7'"_ | The evaluator **can** see the turn content. Visibility was never the problem; phrasing was.                             |

The third probe also produced a useful side effect: the main assistant recognised the injected
`Stop hook feedback` as a prompt-injection attempt and refused to comply. **A hook prompt shaped
like "do X" gets actively resisted** — another reason to phrase conditions about work already
done rather than instructions.

**The rule, now enforced in code.** `sync-claude.mjs` fails the sync if a prompt matches
`/respond\s+(?:with\s+)?\{|"ok"\s*:|\{\s*"decision"/i`. Write conditions, and always name the
turns that satisfy them trivially — without that clause the evaluator reads a checklist as work
the assistant must perform and blocks ordinary research turns.

Both shipped conditions were then verified end to end:

```
clean turn ("What is 2+2?")                         -> subtype: success | num_turns: 1
turn claiming "all quality gates pass", no output   -> BLOCKED, evaluator cited its own rule 1:
  "a bare assertion such as 'all gates pass' with no verbatim command output does not satisfy"
```

### 11.2 They fire on an untrusted workspace

**The claim under test:** hooks belong to the hooks system, `permissions.allow` is trust-gated,
therefore hooks are trust-gated. §5 stated this for months. It is wrong.

A scratch project that had never been trusted, containing one Stop hook whose entire prompt was
a unique sentinel, could not end its turn — the sentinel came back and forced a continuation —
while `~/.claude.json` still showed **0 project entries**, the machine-readable definition of
untrusted. A hook that fires is a hook that is registered.

**Caveat, stated because it was not tested:** every probe used headless `claude -p`. Interactive
sessions were not separately probed. If these hooks ever appear inert in interactive use, this
is the first thing to check rather than the last.

Why it matters beyond the trivia: it is the difference between "this repo has no turn-level
enforcement until someone runs `claude` and clicks a dialog" and "this repo enforces its
evidence rule today, as checked out, on any machine."

### 11.3 What they cost — measured, and not small

The `//claude-prompt-hooks-cost` note in `agentic-guard.json` originally called a prompt hook
"cheap". Two paired samples against an identical no-hook project say otherwise:

| Turn                       | No hook | With Stop hook | Δ           |
| -------------------------- | ------- | -------------- | ----------- |
| "What is 2+2?"             | $0.0647 | $0.1069        | **+$0.042** |
| "Name one primary colour." | $0.0468 | $0.0887        | **+$0.042** |

Two facts follow. The delta is **consistent at ~$0.042 per turn**, and `modelUsage` reports only
`claude-opus-4-8` — **the evaluator runs on the main model, not a small one.** On a cheap turn
that is roughly +1.7×.

So a prompt hook is cheap _only_ in the dimension that killed the command hooks: no subprocess,
no console flash. It is not free, and the Stop hook fires on every turn including pure-research
turns that the condition passes trivially. That is the price of the evidence rule being enforced
rather than merely written down; it is recorded here so the trade is an informed one. Delete the
entry from `claudePromptHooks` and re-run `pnpm agents:sync` to opt out.

**On 2.1.211 a blocked turn is dearer still, and it compounds.** `CHANGELOG.md:139` (2.1.274):
_"Fixed Stop prompt hooks re-sending their whole prompt on every block in a conversation; repeat
blocks now name the condition with a 500-character label."_ That fix postdates this binary, so
here the **full** Stop condition is re-injected into the conversation on every single block, not
just the first. Measured from the generated `.claude/settings.json`: the Stop prompt is **1,724
characters** and the SubagentStop prompt **1,486** — so a turn the evaluator blocks three times
pays for three full copies, and they accumulate in the context window that §9 is already
budgeting carefully. After the upgrade each repeat costs a 500-character label instead.

This is an argument for keeping the condition satisfiable and its escape clause explicit, not for
shortening it: a condition trimmed to save tokens that then blocks twice as often costs more. It
is also the strongest single reason to take the §7 upgrade, because the fix is free there.

### 11.4 Why these two hooks and not others

The bar: **each hook must map to a failure that actually happened in this repo, and must fire
rarely.**

| Hook                 | Event                              | Fires                           | The real failure it encodes                                                                                                                                                                              |
| -------------------- | ---------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evidence requirement | `Stop`                             | once per turn                   | Gate 7 was reported green while Playwright exited 1. A backgrounded `\| tail` printed the _wrapper's_ `[exited with code 0]` while the inner run printed `[ELIFECYCLE] Command failed with exit code 1`. |
| Reviewer verdict     | `SubagentStop`, matcher `reviewer` | only when the reviewer finishes | Both failure directions of a review: an unsupported GREEN, and a padded RED whose findings are preferences rather than concrete failures. Each false RED costs a full round.                             |

**Rejected, and why — this list is the useful half.**

- **`PreToolUse` on `Bash|PowerShell`.** At ~$0.042 a call on the highest-frequency tool in this
  workflow, the arithmetic alone rules it out. The deny list already covers the destructive
  cases _synchronously and for free_; a prompt hook here would be slower, weaker and dearer than
  what is already in place.
- **`subagentStatusLine`.** Surfaced by research as a high-value addition. It is
  `{"type": "command"}` — it would spawn a process **per subagent row**, which is precisely the
  console-flash behaviour §1 exists to eliminate, multiplied by the fan-out count. Rejected on
  merit, not on doubt.
- **`allowed-tools:` in skill frontmatter.** Surfaced by research as a HIGH-priority gap, and
  rejected here on **2026-09-18 for a reason that was wrong** — corrected below, because the
  mistake is more instructive than the conclusion.

  The original note claimed `allowed-tools` is _"a **command** field, not a skill field"_, citing
  `plugin-dev/agents/plugin-validator.md`, `skill-development/SKILL.md`, and a corpus count: zero
  of ten official `SKILL.md` files use it, all 27 upstream occurrences are in `commands/*.md`.

  Every one of those observations is accurate, and together they prove nothing about the parser.
  **They are evidence about convention — what upstream authors happen to write — not about what
  the binary accepts.** The changelog settles it, and it is not close:

  | Line   | Version | Entry                                                                                                |
  | ------ | ------- | ---------------------------------------------------------------------------------------------------- |
  | `5891` | 2.0.74  | Fixed **skill** `allowed-tools` not being applied to tools invoked by the skill                      |
  | `5799` | 2.1.0   | Added support for YAML-style lists in frontmatter `allowed-tools` for cleaner **skill** declarations |
  | `5044` | 2.1.69  | Fixed interactive tools being silently auto-allowed when listed in a **skill's** `allowed-tools`     |
  | `4832` | 2.1.74  | Fixed managed policy `ask` rules being bypassed by user `allow` rules or **skill** `allowed-tools`   |
  | `3083` | 2.1.152 | **Skills** and slash commands can now set `disallowed-tools` in frontmatter                          |

  All five predate the installed 2.1.211. You cannot fix a field you do not parse.

  **It is still not adopted, now on merit.** Read `5044` and `4832` again: skill `allowed-tools`
  _auto-approves_ what it names, and has twice had to be patched for escaping the permission
  system. This repo deliberately keeps its entire permission surface in one reviewable file,
  `.github/hooks/permissions.json`, and the human has reserved permission-widening decisions to
  themselves. A skill file that can silently grant is the wrong shape for that. `sync-claude.mjs`
  therefore **refuses it loudly** rather than dropping it quietly, and points the author at
  `disallowed-tools` — the narrowing half, which is safe and is passed through.

  This is the same error as §14.2, made against a different artifact: auditing examples instead
  of the mechanism. **Corpus absence is not parser absence.** Ask the changelog.

### 11.5 Five keys that do not exist

Research recommended all of these, some at HIGH priority. None exist on 2.1.211, so each would
have been an invisible no-op in `settings.json` forever:

`autoContinueAtUsageLimit` · `maxEffortLevel` · `effortLevel` · `modelSettings` · `promptCacheTtl`

This is the §10 blind spot doing real damage: they do not warn, they do not error, and they read
as configuration in any diff.

**A second class fails the same way for a different reason: real keys that this binary is too old
to have.** These are not hallucinations — they are documented upstream, and they will work after
the §7 upgrade. Today they are indistinguishable from the five above.

| Key                                               | Added                                    | Available on 2.1.211? |
| ------------------------------------------------- | ---------------------------------------- | --------------------- |
| `permissions.blockReadsOutsideWorkingDirectories` | 2.1.257 (`CHANGELOG.md:896`)             | No                    |
| `syncClaudeAiSkills` / `syncClaudeAiPlugins`      | 2.1.275 (`CHANGELOG.md:8`)               | No                    |
| `subagentStatusLine`                              | 2.1.214 or earlier (`CHANGELOG.md:1968`) | No                    |

`blockReadsOutsideWorkingDirectories` is the one worth wanting: it would confine reads to the
working directories, which is a genuine hardening this repo's deny list can only approximate with
path globs. Note the exit criteria before adopting it after the upgrade — it took until 2.1.273
to stop _subshells and `cd` chains from skipping its prompt_ (`CHANGELOG.md:218`, `:305`), and
until 2.1.2xx to stop it hiding a worktree-isolated subagent's own checkout (`:786`). Adopt it at
a version that carries those fixes, not the version that introduced the key.

The two `syncClaudeAi*` keys default to **on** upstream, which means the §7 upgrade silently
starts pulling whatever skills and plugins the signed-in claude.ai account has enabled into this
project's context. That is the AGENTS.md "plugins install whole" context tax arriving without a
diff. Decide them in the same commit as the upgrade.

**How to tell the two classes apart** — apply §11.6's inverted oracle first. A key that does not
exist in _any_ version is a research hallucination and should never be written down; a key that
exists upstream but postdates this binary belongs here, with its version, so the upgrade has a
checklist.

### 11.6 The inverted existence oracle

Since `doctor` type-checks recognised keys and ignores unknown ones, **the silence is the signal**.
Give a candidate key a deliberately wrong type and see whether `doctor` complains:

- **It complains** → the key is real (the validator knows its schema).
- **It says nothing** → the key does not exist.

Always plant controls. Two obviously-fake keys in the same file must come back silent; if they
produce findings, the technique is invalid on that build and the run proves nothing.

```jsonc
// scratch dir, .claude/settings.json — then run `claude doctor` there
{
  "fallbackModel": 12345, // complained: expected an array  -> REAL
  "sandbox": 12345, // complained: expected an object -> REAL
  "autoContinueAtUsageLimit": 12345, // silent                         -> not a key
  "TOTALLY_FAKE_KEY_CONTROL": 12345, // control: must be silent
  "ANOTHER_FAKE_CONTROL_KEY": "x", // control: must be silent
}
```

Two incidental findings from that run, both contradicting the docs: **`fallbackModel` must be an
array** (documented as string-or-array), and **`sandbox` must be an object** (not a boolean).

### 11.7 Apply the same test to environment variables

An env var recommended by a blog post or a template is a settings key with worse provenance. The
changelog is the oracle:

```bash
grep -n 'THE_VAR_NAME' node_modules/.bin/../../CHANGELOG.md   # or the installed CHANGELOG
```

- `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` → `CHANGELOG.md:6801`, shipped 1.0.21. **Real**, and
  now set in `permissions.json` (inert until trust, see the `//env-cwd` note there).
- `CLAUDE_TOOL_FILE_PATH` → **zero hits. Fabricated.** A widely-copied community hooks template
  ships it across 17 files; every one of those hooks silently does nothing.

The asymmetry is the point: verifying costs one `grep`, and not verifying costs a guard that
looks present in code review and enforces nothing.

## 12. Subagents could not reach a single skill

Found 2026-09-18, and it had been true since the agent roster was written.

`tools:` in an agent definition is an **allowlist**, and none of the seven agents listed anything
that maps to the `Skill` tool. The sync's capability table had no `skill` entry either, so even
writing one would have been dropped — `mapTools` discards unrecognised names by design
(`sync-claude.mjs`, "Unrecognised capability names are dropped rather than passed through").

The cost was concrete rather than theoretical. `gsap-framer-scroll-animation` is 43 KB of
project-specific guidance on exactly the code the `implementer` writes — including the timeline and
ScrollTrigger cleanup that `AGENTS.md` calls _"this repo's most common bug"_ — and the implementer
could not open it. The skill was reachable only from the main thread, which is not where the code
gets written.

**Fixed:** `skill: ['Skill']` added to the capability table; `skill` added to `implementer`,
`reviewer` and `debugger`, each with a short body section naming which skills to load and when.

### 12.1 Why not the planner

Recursion, and it turns on the `agent` tool rather than on the skill. `ship-feature`,
`review-loop` and `parallel-research` all instruct their reader to delegate to named agents. An
agent holding **both** `skill` and `agent` can therefore invoke a skill that re-invokes it. The
three agents above hold no `agent` tool, so their worst case is a wasted context window; the
planner holds one, so its worst case is the loop. Each of the three also carries an explicit line
naming the orchestration skills it must never load.

### 12.2 What the `reviewer` gained

Claude Code ships **14 built-in skills** — `code-review`, `security-review`, `verify`, `loop`,
`deep-research`, `simplify`, `fewer-permission-prompts`, `run`, `init`, `review`, `dataviz`,
`update-config`, `keybindings-help`, `claude-api`. None are installed plugins: there is no
`~/.claude/plugins` directory on this machine, so all 14 are built in and all six of ours are
project skills.

`security-review` matters most. `CHANGELOG.md:1952` — _"Claude no longer runs the `/verify` and
`/code-review` skills on its own; invoke them with `/verify` or `/code-review` when you want
them"_ — so an unasked-for security pass simply never happens. Gate 8 (`pnpm audit`) only finds
CVEs in **other people's** code; before this change nothing in the pipeline read _this_ diff for a
vulnerability.

### 12.3 `skills:` preloads; `Skill` grants — they are different fields

There is a separate `skills:` frontmatter field that injects a named skill's **full content** into
the subagent at startup. It is not an access control: _"without it, the subagent can still
discover and invoke project, user, and plugin skills through the Skill tool during execution."_

Deliberately **not** used here. Preloading is a fixed tax on every invocation, and the only
skill worth preloading is the 43 KB GSAP one — which is irrelevant to most implementer tasks. The
`Skill` tool plus an explicit instruction pays that cost only on the runs that need it. Note also
that a skill marked `disable-model-invocation: true` cannot be preloaded at all; the bundled
`/verify` is one.

### 12.4 A subagent's tool list is filtered against the main conversation

`tools:` cannot grant what the session does not have. Two filters apply — a fixed removal list
(`AskUserQuestion`, `ExitPlanMode`, `Workflow`, …) and, for background subagents, a keep-list of
built-ins. `Skill` **is** on that keep-list; `PowerShell`, `WebFetch`, `WebSearch` and `Bash` are
too, but only resolve if the main conversation actually has them.

This makes probe results easy to misread. An in-session probe of the `implementer` came back
without `Skill` — and also without `PowerShell` and `WebSearch`, both of which the _old_
definition already granted. That second detail is what identified it as **staleness**: agent
definitions are read at session start, so the probe had run the pre-edit file. A fresh `claude -p`
process returned:

```
Read, Edit, Write, NotebookEdit, Grep, Glob, PowerShell, Skill, WebFetch, WebSearch, mcp__memory__search_nodes, mcp__memory__open_nodes, mcp__sequential-thinking__sequentialthinking
```

`Skill` present, and `Bash` absent — headless `-p` on Windows exposes PowerShell instead. **Edits
to `.github/agents/` need a new session, not just `pnpm agents:sync`.**

### 12.5 The parser silently double-escaped every quote

Writing the new descriptions surfaced a real bug in `sync-claude.mjs`. `unquote` stripped the outer
quotes of a double-quoted YAML scalar but never resolved its escapes, and `yamlString`
(`JSON.stringify`) then escaped the surviving backslashes again:

```
source     description: "...asks to \"audit dependencies\"..."
generated  description: "...asks to \\\"audit dependencies\\\"..."
```

Claude therefore matched skills against trigger phrases containing literal backslashes. Invisible
in the source file; visible only in the generated one, and then only if you look. `unquote` now
resolves escapes via `JSON.parse` for double-quoted scalars and handles `''` for single-quoted
ones. Seven cases covering both quote styles, unbalanced quotes, tabs and `\uXXXX` pass.

The cheaper habit, and the one the GSAP skill already used: write long descriptions as a folded
`>-` block, where quotes need no escaping at all.

### 12.6 The debugger was told to search the web with no web tool

Second instance of the class, found 2026-09-18 by re-reading every agent body against its own
`tools:` line rather than reading each half on its own.

`debugger.agent.md:17` is a constraint, not a suggestion: _"DO NOT diagnose a framework API from
memory. This is Next.js 16 + React 19, newer than your training data. Read
`node_modules/next/dist/docs/` or `web` search (last 12–18 months) … You only get 3 hypotheses —
spending one on a stale API shape burns a third of your budget."_

Its `tools:` granted `[read, search, edit, execute, skill]`. No `web`. No memory. No
`sequentialthinking`. The agent with the **tightest budget in the roster** — three hypotheses,
then escalate — was ordered to perform a lookup it could not perform, on the exact class of
question (a framework newer than its training data) where guessing costs a full hypothesis.

Worse, it was the one agent that most needed the knowledge graph. This repo has root-caused a lot
of failures already and recorded their mechanisms; `search_nodes` on a short keyword can retire a
hypothesis for one call. The debugger could not make that call.

**Fixed:** `web`, `context7/*`, `memory/search_nodes`, `memory/open_nodes` and
`sequential-thinking/*` granted, plus a body section — _"Free moves — none of these cost a
hypothesis"_ — naming all four and the trap in each. The `sequentialthinking` entry resolves an
apparent contradiction with the one-hypothesis-at-a-time rule: **that constraint is about what you
_change_, not about what you may _consider_**, and the branching tree is where ruled-out branches
live so the final report can list them.

### 12.7 Three MCP servers were declared; no agent could reach one of them

Third instance, same day. `.vscode/mcp.json` declares **three** servers — `context7`, `memory`,
`sequential-thinking` — and `enabledMcpjsonServers` correctly lists all three, without which a
project-scope server never launches at all. The endpoint is healthy: 200, `text/event-stream`,
Context7 **4.1.1**, `tools/list` returning `resolve-library-id` and `query-docs`.

Nothing could use it. No agent's `tools:` named it, and `mapTools` had **no `context7/` handler**,
so a grant written by hand would have been dropped on the floor by the same
unrecognised-name path that hid instance 1. `AGENTS.md` documented only two servers, so the third
was invisible to anyone reading the docs rather than the config.

The cost is specific. `AGENTS.md`'s loudest rule is _"This is NOT the Next.js you know"_, and its
remedy is `node_modules/next/dist/docs/` — which covers **Next.js only**. Seven other things in
this stack also postdate the model's training data: React 19, Tailwind, GSAP, Motion, Lenis,
Vitest, Playwright. For those the fallback was a bare web search, which returns whatever version
the top blog post happened to use. A server that returns _version-pinned_ docs was sitting
configured, paid for, and unreachable.

**Fixed:** `context7/` handler added to `mapTools`; `context7/*` granted to `planner`,
`researcher`, `implementer`, `reviewer`, `debugger`; a `context7` pattern added to the promise
lint; and a rule written into `agentic-workflow.instructions.md` §"Verify, do not recall" telling
agents to reach for it first. `scribe` and `memory-updater` are excluded by design — neither
writes code against an API.

Two traps worth keeping:

- **The tool names carry hyphens.** `resolve-library-id` and `query-docs`, verified against the
  live server. The `resolve_library_id` / `get_library_docs` names that upstream guides use **do
  not exist**, and a wrong name in `mapTools` is silently dropped.
- **Queries leave the machine.** They go to Upstash, carrying the library name and topic. Never
  repo source.

**A headless probe is the wrong oracle here.** A fresh `claude -p` reports **zero** `mcp__` tools —
including the two that demonstrably work in-session — because project `.mcp.json` approval is
interactive-only. Diagnose MCP reachability from the config and the running session, not from `-p`.

### 12.8 Five slash commands shipped without the argument hints their author wrote

Fourth instance, and the first found in the skill emitter rather than the agent one.

`buildSkill` wrote `name` and `description` and discarded everything else, under a comment
asserting that is all Claude takes: _"`argument-hint` and `metadata` are Copilot-only and are
dropped."_ Half right. `metadata` is Copilot-only. `argument-hint` is a genuine `SKILL.md` field:

| Line   | Version | Entry                                                                                                  |
| ------ | ------- | ------------------------------------------------------------------------------------------------------ |
| `6630` | 2.0.0   | Custom slash commands: Added `argument-hint` to frontmatter                                            |
| `5305` | 2.1.47  | Fixed React crash when a skill's `argument-hint` **in SKILL.md frontmatter** uses YAML sequence syntax |
| `3137` | 2.1.149 | Fixed `argument-hint` not appearing after Tab-completing a **skill**                                   |

**You cannot crash on a field you do not parse.** Five of this repo's six skills author an
`argument-hint`; all five were thrown away, so every slash command in `AGENTS.md` —
`/ship-feature`, `/fix-failure`, `/parallel-research`, `/review-loop`, `/dependency-audit` —
shipped without the hint written for it.

**Fixed:** `argument-hint`, `disallowed-tools` (2.1.152) and `effort` (2.1.80) now pass through;
`name`/`description`/`metadata` are handled or silently dropped as before; and **any other key
warns and fails `agents:sync:check`**, with a message naming the two lists to add it to. The
emitter can no longer be quietly wrong about what Claude parses — the next unknown key announces
itself.

`effort` is passed through but deliberately **not adopted**: `CHANGELOG.md:603` (2.1.267, above
this binary) shows it is ignored on effort-pinned models, so on 2.1.211 it is real-but-unreliable.

### 12.9 What the eight instances have in common

| #   | Declared                                 | Reachable                   | Where it hid                  |
| --- | ---------------------------------------- | --------------------------- | ----------------------------- |
| 1   | every agent's prose cites repo skills    | no agent held `Skill`       | agent `tools:`                |
| 2   | `debugger` ordered to `web` search       | no web tool                 | agent `tools:`                |
| 3   | three MCP servers configured and healthy | no agent held `context7`    | `mapTools` had no handler     |
| 4   | five skills author `argument-hint`       | none emitted                | `buildSkill` dropped it       |
| 5   | seven agents author frontmatter          | only four keys emitted      | `buildAgent` dropped the rest |
| 6   | `model:` preference lists                | unmappable name → `inherit` | `mapModel` fell back silently |
| 7   | five `applyTo` globs scope instructions  | 3 coarsened, 2 dropped      | `globToDir()` — see §12.14    |
| 8   | seven agents author `tools:`             | 5 inherited EVERY tool      | wrapped flow — see §12.24     |

Every one reads correctly if you read either half alone. Every one is a **silent drop** — nothing
errored, nothing warned, and the generated output looked plausible. Three mechanical guards now
close the class, and all three fail `agents:sync:check` rather than merely printing:

- **the promise lint** (`promise`) — an agent body instructed to use a capability its `tools:` does
  not grant;
- **the frontmatter guard** (`dropped`) — a source key the emitter would not have written, on a
  skill _or_ an agent. Each warning names the two lists to resolve it into;
- **the model fallback** (`dropped`) — `inherit` is emitted, because emitting nothing would be
  worse, but it now says so.

None is fixed by re-running the sync, which is why they print under their own labels instead of the
`stale`/`orphan` ones. A check that tells you to re-run the thing you just ran gets ignored.

Instances 5 and 6 are worth separating, because they are the _reverse_ of 1–4. Nothing was lost
today: `argument-hint` and `user-invocable` are genuinely not Claude agent fields (`user-invocable`
is a SKILL field, `CHANGELOG.md:5856` / 2.1.0), and every current agent maps to a real model. The
defect is that the door was open. Claude supports real agent frontmatter this repo deliberately
declines — `memory:` (2.1.33), `isolation: worktree` (2.1.50), `background: true` (2.1.49), agent
`hooks:` (2.1.0), `disallowedTools` (2.0.30), `mcpServers` (2.1.117) — and writing any of them into
a source agent would have produced exactly instances 1–4 again, on a Tuesday, with no warning.

Two sub-findings from instance 6 that are independent bugs in their own right:

- **`fable` was missing from `MODELS`.** It is a real alias on the installed binary — its own help
  text reads ``Model override (`haiku`, `sonnet`, `opus`, `fable`, or a full ID)``. An agent
  preferring it mapped to `inherit`. (Fable **5.1**, `claude-fable-5-1`, is `CHANGELOG.md:890` /
  2.1.257 — above 2.1.211, so the alias resolves to Fable 5 here.)
- **The frontmatter parser could not read a block sequence.** `model:` and `tools:` are authored as
  _flow_ sequences (`[a, b]`); the identical list written as `- a` lines fell into the nested-map
  branch, whose child regex cannot match a `- item` line, and yielded `{}`. `mapModel({})` then
  returned `inherit`. **Two legal spellings of one YAML list produced two different models.** The
  parser gained a fifth shape here — **and that fix was itself incomplete.** A _third_ spelling of
  the same list, the wrapped flow sequence Prettier emits, went on failing for another four days and
  left five of seven agents holding every tool in the session. See §12.24; the parser now handles
  six shapes.

The generalisable rule, paid for eight times: **a capability is not adopted until something mechanical
proves an agent can reach it** — and, per instance 8, a restriction is not applied until something
mechanical proves an agent cannot. Prose in an instruction file is not that proof — nothing reads it
at the moment it matters.

### 12.10 The reviewer's gate list had drifted from the gates

Found 2026-09-18, and the most consequential item in this round: the agent that owns the GREEN/RED
verdict was running a gate list that no longer matched
`.github/instructions/quality-gates.instructions.md`. Four defects in three lines:

| Line                   | What it said                                          | What was true                                                                                                                                                             |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reviewer.agent.md:46` | ``Run `ppnpm audit --prod```                          | The typo gate 8 was fixed for. **Never executed**, and the `--audit-level=high` flag was missing too, so even corrected it can never exit 0.                              |
| `reviewer.agent.md:47` | "Record the build route table's First Load JS values" | Turbopack emits **no size column**. There is no route table to read — the reason gate 9 was rewritten in the first place.                                                 |
| —                      | gate 10 absent entirely                               | SSR / no-JS is the gate that exists _because_ 1–9 passed on an empty homepage. The reviewer never ran it.                                                                 |
| `reviewer.agent.md:44` | ``Run `pnpm test:e2e```                               | No mention of clearing `RESEND_API_KEY`, so **a reviewer run emails the live business inbox**, nor of the port-3000 check, so Playwright may silently test a stale build. |

The steering file was corrected on 2026-09-18 and the agent was not. That is the failure mode of
keeping the same rule in two places: the copy nobody re-reads is the copy that executes. The
reviewer's gate section now restates the canonical commands verbatim and points at the table as
source of truth.

While verifying it, gate 9's _replacement_ command turned out to be unrunnable too:

```
find .next/static -name "*.js" -exec gzip -c {} \| wc -c
find: missing argument to `-exec'
```

It lived in a markdown table cell, where a literal `|` must be escaped as `\|` or it ends the cell.
The escape leaked into the command. **A command inside a markdown table is not the command you will
run** — it now lives in a fenced block. Three of this repo's ten gates have now shipped with a
command that could not execute (8, 9, and 9's fix); in each case the gate reported nothing and was
read as passing.

### 12.11 The permission layer: four rules that could not fire, three categories with no rule

Counts went **42 allow / 77 deny / 19 ask → 50 / 144 / 40** on 2026-09-18. The interesting half is
not the growth; it is that the four deleted rules and the three added categories are the same
mistake seen from both sides — **a rule was counted as coverage without anyone checking it fired.**

**Deleted, because they could never match.** Each was verified against this machine, not reasoned
about:

| Rule                       | Why it was inert                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PowerShell(cat .env:*)`   | The matcher canonicalises aliases _before_ comparing. An incoming `cat` is already `Get-Content`.                                                  |
| `PowerShell(type .env:*)`  | Same — `type` and `gc` are also `Get-Content` aliases.                                                                                             |
| `Bash(Get-Content .env:*)` | `Get-Content` does not exist in Git Bash (`command -v` → nothing). No Bash command can begin with that token.                                      |
| `Bash(type .env:*)`        | `type` in Bash is a **builtin that reports how a name resolves**, not a file reader. `type .env.local` prints `bash: type: .env.local: not found`. |

`PowerShell(Get-Content .env:*)` was doing all the work by itself. The file's own
`//powershell-mirror` note already said "write the cmdlet name, not the alias" — the rules were
added anyway, by someone who had read it. **A rule that cannot fire is worse than a missing rule,
because it is counted.**

**Added, because nothing covered them.** Verified present on this machine at audit time:

- **`rm` without a recursion flag.** The three rules were `rm -rf`, `rm -fr`, `rm -r` — all requiring
  a flag. `rm .env.local` ran. That is the untracked live-secret file `quality-gates.instructions.md`
  explicitly forbids deleting, and `rm -Rf`, `rm --recursive --force` and `rm -f` all ran too. Flag
  enumeration never finishes, so `Bash(rm:*)` now sits in `ask` **underneath** the narrow deny rules:
  deny beats ask, so recursive deletes stay blocked and everything else prompts.
- **Destroying uncommitted work by any route other than `git reset --hard`.** `git checkout -- .`,
  `git restore .`, `git stash drop`, `git stash clear` and `git rm -r` had no rule at all, with 24
  modified and 7 untracked files in the tree. The recoverable ones are now `ask`; the ones with no
  recovery path (`stash drop`/`clear`, `reflog expire`, `filter-branch`) are `deny`, because there is
  no prompt worth showing for an action you cannot undo.
- **`bun` and `corepack`, both installed.** `Bash(npm:*)` matches a leading `npm` token only.
  `bun install` (present at `~/AppData/Local/Kiro-Cli/bun`) and `corepack npm install` (present at
  `D:/mise/shims/corepack`) would each produce the flat `node_modules` and competing lockfile that
  `AGENTS.md` forbids. Note the inversion this exposed: `vercel` and `netlify` had deny rules and are
  **not installed**, while the two package managers that _are_ installed had none.

**Three more, each a specific bypass:**

- `.husky/pre-commit` — the repo's only hard commit blocker — had **no rule**, while
  `Read/Edit(./.git/hooks/**)` guarded a directory git does not consult: `core.hooksPath` is
  `.husky/_`. `echo 'exit 0' > .husky/pre-commit` silently removed format, lint and the 90% coverage
  floor from every later commit, with no `--no-verify` flag for `Bash(* --no-verify*)` to catch —
  which is precisely the mechanism that rule exists to defend.
- The guard file could rewrite itself. Its protections are `Edit(...)` rules, which govern the
  file-editing tools; `echo '{"deny":[]}' > .github/hooks/permissions.json && pnpm agents:sync` is a
  _shell_ path, and `pnpm agents:sync` is an allow rule, so the emptied guard would propagate
  straight into `.claude/settings.json`. (The upstream fix making `Edit()` denies cover Bash write
  targets is `CHANGELOG.md:431` / 2.1.269 — above 2.1.211 — and covered `tee`, never plain `>`.)
- `Bash(git branch:*)` sat in **allow**, so `git branch -D feature-x` and `git branch -M master` were
  whitelisted by prefix. Inert when found, because allow rules need workspace trust — and trust was
  granted on 2026-09-19 (§13.1), which is exactly the day it would have gone live. Replaced with
  five read-only spellings, with `-d`/`-D` denied. The §12.19 widening kept those five spellings
  rather than folding them into a prefix rule, for this reason.

**What this layer still does not prove**, stated in the file itself under `//coverage-limits` so it
is not mistaken for coverage: reader-command enumeration is unbounded (`tac`, `egrep ''`,
`cat < .env.local`, `node -e`, `python -c` all reach a file no matcher inspects, and the fix for
option-value forms like `-f.env` and `@file` is `CHANGELOG.md:851` / 2.1.259, above installed). The
boundary that actually holds is **egress** — `curl`, `wget`, `Invoke-WebRequest`, `Invoke-RestMethod`
are now `ask` — so reading a secret is recoverable and _sending_ it is not silent. The `> path`
redirect rules are defence-in-depth against the obvious spelling, not a proof; the enforceable guard
on the control plane remains the `Edit(./.github/hooks/**)` ask rule, which puts a human in the loop.

Three deliberate over-blocks were re-confirmed rather than relaxed: `Bash(* --no-verify*)` blocks
grepping the repo's own docs for that string (accepted — `AGENTS.md` says to build it by
concatenation); `git push --force` also denies `--force-with-lease`, which is aligned with this
repo's rule that force-pushing escalates to the human; and `Read(./**/.env.*)` prompts on the
committed `.env.local.example` template, which is the documented price of not blanket-denying
`.env.*`.

### 12.12 Rejected on merit — the useful half of the research

Four things were investigated at length and deliberately **not** adopted. Recording the reasoning
matters more than recording the conclusion, because the next sweep will surface all four again.

**Sandboxing — architecturally unavailable, not merely missing.** `sandbox`/`enableSandbox` back
onto **Seatbelt** (macOS) and **bubblewrap** (Linux). Neither exists on native Windows, and this is
not a version gap: it is equally absent on 2.1.275. Git Bash is native Windows, not WSL2, so the
shell does not change the answer. The remedy is to move the workspace into WSL2 — a real
migration with real costs — not an upgrade. Until then the deny/ask rules in `permissions.json`
are the entire sandbox, which is why §2's finding that they apply _even untrusted_ matters so much.

**Browser MCP — adopt none.** Evaluated against this repo's two actual browser-era defects: the
`LoadingScreen` remount that silently erased typed form input, and the empty server-rendered
homepage. Both are already caught, and caught better, by assertions that exist:
`src/__tests__/components/ui/LoadingScreen.test.tsx:149` pins **node identity** across the intro,
and `e2e/loading-screen.spec.ts:47` runs with `javaScriptEnabled: false`. A browser MCP would add
a second, slower, less deterministic path to conclusions Playwright already reaches. Chrome
DevTools MCP remains useful for _ad-hoc_ investigation — as it was for measuring the +3920ms
remount — but that is a session tool, not control-plane configuration.

**`.claude/workflows/` — fights the design.** Dynamic workflows (v2.1.154) fan out tens to
hundreds of agents from a script. This repo's pipeline is deliberately the opposite: seven named
roles, a call-and-return delegation contract, a review loop capped at five rounds, and an explicit
batching rule that says _"eight related edits must not become eight orchestrations."_ Adopting
workflows would not extend that design, it would compete with it. Same reasoning retires **Agent
Teams** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`), whose peer-messaging model has no hierarchy to
carry the delegation contract, and which upstream itself labels token-intensive.

**An eval harness — blocked, not rejected.** `claude plugin eval` lands in **2.1.269**, above the
installed 2.1.211. It is the one genuinely missing capability with no workaround: nothing here
measures whether an agent edit made the agent _better_, only whether it still parses. Revisit
immediately after the upgrade in §13.

Also considered and closed without action: `.claude/commands/` (subsumed by skills since the 2.1.3
merge, and these skills already use the bundled-reference-file capability commands lack), output
styles (each agent specifies voice far more precisely than a global style could), `.claude/rules/`
(the `applyTo`-scoped generated `CLAUDE.md` files already give directory-scoped loading),
`CLAUDE.local.md` (nothing personal and un-committed that auto-memory does not already hold), and
`effortLevel` / `maxEffortLevel` (both below-version or above-version, per §11.5).

### 12.13 What reloads, and what needs a new session

Worth its own table, because getting it wrong means measuring the old configuration and believing
the new one did nothing:

| Changed                                   | Takes effect                             |
| ----------------------------------------- | ---------------------------------------- |
| `.github/skills/**` → `.claude/skills/**` | **in-session**, after `pnpm agents:sync` |
| `.claude/settings.json`                   | **in-session**                           |
| `.github/agents/**` → `.claude/agents/**` | **new session**                          |
| `.vscode/mcp.json` → `.mcp.json`          | **new session**                          |

The two on the bottom row are why §12.4's probe read as a missing tool when it was really a stale
definition. After any agent or MCP edit, `pnpm agents:sync` is necessary and not sufficient.

### 12.14 Scoped instructions: `applyTo` was being coarsened, and two files were dropped entirely

Instance **#7** of the §12.9 class, found 2026-09-18, and the only one so far where the mechanism
existed the whole time and was never looked for.

`sync-claude.mjs` translated each `.github/instructions/*.instructions.md` by reading its `applyTo`
glob, walking up to the longest **literal directory prefix**, and writing a `CLAUDE.md` there. The
comment above it justified this with one sentence: _"Claude has no per-file frontmatter scoping."_
That sentence was false. `.claude/rules/*.md` takes a `paths:` frontmatter glob list — the same
dialect as `applyTo` — and it has been available since **2.0.64**, with conditional matching since
**2.1.69**. The installed **2.1.211 is itself a `.claude/rules/` bugfix release**. The translation
was a reduction being performed against a feature that made it unnecessary.

What the directory scheme actually cost, measured against the four real source files:

| Source `applyTo`       | Old artifact        | Loss                                                          |
| ---------------------- | ------------------- | ------------------------------------------------------------- |
| `src/**/*.tsx`         | `src/CLAUDE.md`     | coarsened — also loads for `.css`, `.json`, `.mts`            |
| `src/**/*.ts`          | `src/CLAUDE.md`     | coarsened — same directory, so the two merged                 |
| `src/app/**/*.tsx`     | `src/app/CLAUDE.md` | coarsened — loads for `route.ts`, `actions/*.ts`              |
| `vitest.config.mts`    | _(nothing)_         | **DROPPED** — a root-level file has no directory to attach to |
| `playwright.config.ts` | _(nothing)_         | **DROPPED** — same                                            |

The dropped pair is the one that mattered. `vitest.config.mts` holds the 90% coverage thresholds
that `AGENTS.md` forbids lowering; `testing.instructions.md` names it in `applyTo` and carries 5.6 KB
of guidance about it; an agent opening that file received **none of it**. Declared in the source,
invisible at the moment of use — the signature of every entry in §12.9.

Verified before changing anything, on the installed 2.1.211, **untrusted**, with three canary rules
in a scratch repo under `dev-tools/research/agentic-development/_probe14-rules/`:

| Canary rule   | `paths:`            | Loaded with no file read | Loaded after reading `vitest.config.mts` |
| ------------- | ------------------- | ------------------------ | ---------------------------------------- |
| `always.md`   | _(absent)_          | yes                      | yes                                      |
| `nomatch.md`  | `nothing/**/*.zzz`  | no                       | no                                       |
| `rootfile.md` | `vitest.config.mts` | no                       | **yes**                                  |

Three facts fall out of that table, and the third is the one the old scheme could not have had: a
rule with no `paths:` is unconditional; a non-matching rule costs nothing; and **a bare root-file
glob works**, which is precisely the case the directory walk had to throw away.

`buildInstructionScopes` now passes the globs through **verbatim** — `applyTo` and `paths:` are the
same dialect, so any cleverness in between can only lose fidelity. `globToDir()` is deleted.
`.claude/rules/` joins `.claude/agents/` and `.claude/skills/` in the cleared-trees list, and
`findGenerated` stays on as a migration sweeper for the scattered `CLAUDE.md` files the old scheme
left behind — it removed six on the first run. Cloned research repos under
`dev-tools/research/agentic-development/` are safe from that sweep because none of their `CLAUDE.md`
carries this repo's banner.

Both remaining instruction files — `quality-gates` and `agentic-workflow` — have no `applyTo`, so
they are still imported by hand from the root `CLAUDE.md`. Emitting them as unconditional rules
would load them **twice**. The sync prints their names at every run so the hand-import cannot
silently rot.

### 12.15 `blockReadsOutsideWorkingDirectories` is a trap, not a hardening opportunity

It is a real settings key and it is the obvious next hardening step — and setting it here today
would produce instance #8 on its own. It arrived at `CHANGELOG.md:896` / **2.1.257**; the installed
binary is **2.1.211**, where the string does not appear anywhere in the bundle. `permissions` is
`.passthrough()`, so an unknown key inside it warns nowhere, and `claude doctor` will not flag it
(§10's blind spot exactly). It would read as configured, in a file under version control, and do
nothing.

The sync **forwards** it, so the binary upgrade is the only thing between setting it and it working.
It is deliberately **absent** from `permissions.json`. Do not add it until `claude --version` reports
≥ 2.1.257, and see §13 for who can make that true.

While correcting that comment: the `defaultMode` enum on 2.1.211 is **six** values — `acceptEdits`,
`auto`, `bypassPermissions`, `default`, `dontAsk`, `plan` — not the four an earlier revision of this
file listed. `permissions.json` now sets **no** `defaultMode` at all, and that absence is
deliberate — see §12.17.

### 12.16 Corrections landed in one file and stopped there — and the guard that now stops that

Every entry above this one is a defect in the control plane. This one is a defect in the
_repair process_, and it is the reason several of the entries above took a second pass.

**The coverage contradiction.** `testing.instructions.md` ended with "≥85% on files changed by
the current task." Nothing else in the repo has ever said 85, and nothing has ever measured
coverage per-diff: `vitest.config.mts` sets `statements/branches/functions/lines: 90` and
`.husky/pre-commit` runs `vitest run --coverage` against the whole project. The 85 line was not
merely wrong, it was wrong in the most expensive possible location — `testing.instructions.md`
is scoped to `src/__tests__/**` and `e2e/**`, so it loaded _exactly_ when tests were being
written and at no other time. An agent that believed it would write tests to a bar 5 points
low, on the files it had touched only, and then fail the commit hook for a reason the
instruction it had just followed said was impossible.

**The pattern it belongs to.** On 2026-09-18 four corrections were made. Each reached one file
and stopped:

| Correction                                                  | Landed in           | Still standing in                                                                                          |
| ----------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------- |
| Prompt hooks are live; "Claude registers no hooks" is false | §12 of this file    | `AGENTS.md`, `quality-gates` — where it was the _premise_ of "nothing stops a turn ending with a gate red" |
| Project-scope `env` is not trust-gated                      | `permissions.json`  | `AGENTS.md`, §3 of this file                                                                               |
| context7 is configured, with hyphenated tool names          | `AGENTS.md`         | `nextjs.instructions.md` ×2 — the file that loads on every `src/**` task                                   |
| Scoped instructions moved to `.claude/rules/`               | `AGENTS.md`, §12.14 | root `CLAUDE.md`, still describing generated per-directory `CLAUDE.md` files                               |

The shape is identical every time: **the file that still carries the stale claim is, by
definition, the file nobody reread.** Prose cannot fix that, because the instruction to
propagate a correction would live in a file the propagator has already read. Nor is more
diligence the answer — the failure mode is not carelessness, it is that a correction feels
finished at the moment the sentence you were looking at becomes true.

Two of the four are worse than ordinary staleness, and the distinction is worth keeping:

- A stale **fact** ("no hooks are registered") is recoverable — a reader who checks finds the truth.
- A stale **conclusion drawn from** that fact ("so nothing enforces the evidence rule") survives
  the fact's correction, because it no longer mentions it. Correcting a fact without hunting its
  dependents leaves the wrong behaviour in place with the citation removed.

**The guard.** `sync-claude.mjs` now carries `STALE_CLAIMS`, a sibling of the `PROMISES`
capability lint. It scans every `.md` under `.github/` plus root `AGENTS.md` and `CLAUDE.md`,
and fails `agents:sync:check` when a known-corrected string reappears. Each rule names an
`allow` list — the files where the string legitimately appears _because they are the
correction_, quoting the old wording to refute it. Six rules as of 2026-09-19: the no-hooks
claim, the underscore context7 tool names, `First Load JS`, the `ppnpm` typo, the changed-files
coverage bar, and any runnable `npm`/`npx` command line. Vendored `skills/*/references/**` is
exempt — upstream evidence, not repo instruction.

Verified by probe on 2026-09-19: a scratch file containing all six fired all six with correct
line numbers and exit 1; removing it returned exit 0 with zero findings against the real tree.

It then caught its first real case about four minutes later, and the case was **this section**.
The table above quotes `Claude registers no hooks` in order to record that it is false;
`CONTROL-PLANE-NOTES.md` was not yet on that rule's `allow` list, so `agents:sync:check` went
red on the very document describing the guard. That is the intended workflow, not an
embarrassment — the fix was to add this file as a sanctioned correction site, which is a
deliberate one-line decision rather than a silent reintroduction. Worth keeping because it
shows the failure mode the allowlist is for: writing _about_ a stale claim is indistinguishable
from repeating it, to a string matcher, and the resolution has to be a human-legible judgement
recorded in the guard itself.

Two design choices that are load-bearing:

- **The allowlist is per-file, not a count.** Adding a seventh correction site requires editing
  this list, and that edit is the moment you notice you are writing the same correction for the
  seventh time — which is the signal that the claim belongs somewhere central instead.
- **Same conservatism as `PROMISES`.** Every pattern was grepped against the tree before being
  added and matches only its allowed files. A check that cries wolf gets deleted, and a deleted
  check is worse than the gap it guarded.

It also carries one **structural** rule that is not about staleness at all: `permissions.json`
must not set `disableBypassPermissionsMode` at any value. The repo owner removed it deliberately
and asked that it not be re-added — bypass mode is theirs to enable when they need it, and a
settings file must never make that call for them. `buildSettings()` still _forwards_ the key if
present; this is what keeps it from ever arriving there. Do not confuse the forwarder with the
setting.

**What the guard does not cover.** It matches strings, so it catches a claim's _reappearance_,
never its first appearance. A newly discovered falsehood still has to be found by reading. The
guard's job is narrower and worth stating plainly: it makes a correction stick, once.

### 12.17 Auto mode: configured in the repo, inert in the repo, and the gate that says so

**The failure first, because it is the eighth instance of §12.9's pattern and the most expensive
one yet.** On 2026-09-19 `permissions.defaultMode: "auto"`, `skipAutoPermissionPrompt: true`,
`useAutoModeDuringPlan: true` and a full four-section `autoMode` classifier rulebook were written
into `.github/hooks/permissions.json`, forwarded by `sync-claude.mjs`, emitted into
`.claude/settings.json`, and validated. Everything passed: `SYNC_EXIT=0`, `CHECK_EXIT=0`,
`prettier --check` clean, and `claude doctor` reporting **No installation issues found.** A probe
of the emitted file confirmed every key present and every rulebook section carrying `"$defaults"`.

All of it was dead. Two source gates inside the binary discard these keys when they arrive from
project or local settings, and they log at `warn` — a level nothing in this workflow surfaces:

```
settings defaultMode "auto" ignored — only policy/user/flag settings may grant auto mode
(projectSettings and localSettings are repo-controllable)

settings autoMode in projectSettings ignored — only user/flag/managed settings may set
classifier rules (projectSettings and localSettings are repo-controllable)
```

The mechanism, which is worth reading because it explains why the enum was a red herring:

```js
var de = ['policySettings', 'flagSettings', 'userSettings'];
function C(e) {
  return de.filter(Wr).some((n) => be(n)?.permissions?.defaultMode === e);
}
function ae(e) {
  let n = hp(e.permissions?.defaultMode);
  if (n == null || !A(n)) return;
  if (n !== 'auto') return n; // every OTHER mode is honoured from any source
  return C('auto') && sYe(e) ? 'auto' : void 0; // "auto" additionally needs a TRUSTED declarer
}
```

`ae` reads the **merged** settings, so a project-scope `auto` does reach it — and is then thrown
away unless one of policy/flag/user settings _independently_ declares `auto` too. This is
deliberate and correct: a repository you clone must not be able to grant itself autonomous
execution on your machine.

**The lesson, and it is new.** §12.9 taught that a key the emitter drops reads as configured and
does nothing. This is the next layer down: the key was emitted _perfectly_, the schema _accepted_
it, `doctor` _validated_ it, and it was still inert — because acceptance and consumption are
different code paths. An earlier revision of `//defaultMode` had claimed `auto` was "ignored from a
project file"; a later session read `Afe = ["acceptEdits","auto","bypassPermissions","default",
"dontAsk","plan"]` out of the binary, concluded the claim was wrong, and reversed it. The enum was
real. The conclusion was not. **Grep for the value being consumed, not merely parsed.**

**Where it lives now.** `~/.claude/settings.json`, user scope, which is the only place it is
honoured. That file carries the four-section rulebook plus `skipAutoPermissionPrompt` (without
which the first auto-mode session stops on a consent dialog — a human intervention, which is the
thing being removed). `useAutoModeDuringPlan` was dropped entirely rather than relocated: it is
read as `!== false`, so it already defaults to true and setting it true is a no-op.

**Blast radius, stated because user scope is machine-wide.** Auto mode now applies to every project
on this machine, not only this one. That is not a side effect; it is the only shape the setting has.
Repo-specific entries in the rulebook therefore name their repo explicitly. Full revert: delete the
`permissions`, `skipAutoPermissionPrompt` and `autoMode` keys from `~/.claude/settings.json`.

**`defaultMode` is now ABSENT from `permissions.json`, and absence is the correct value** — not an
oversight, and not the same as the pre-2026-09-18 state where it was absent by accident. From the
binary's own settings-audit doc, verbatim:

> only the VALUE `"auto"` is source-restricted — a project or local `permissions.defaultMode` set
> to any OTHER mode (`plan`, `acceptEdits`, `default`, …) is honored and, in the settings cascade
> (user < project < local), overrides the user-scope `"auto"`.

So pinning `default` here — or taking the tempting-looking `acceptEdits` upgrade, which a research
pass recommended as its headline finding — would silently **downgrade** the user-scope auto mode to
something weaker. Absent is the only value that lets user scope do its job.

**A guard now enforces all of this.** `sync-claude.mjs` throws if `permissions.json` declares
`autoMode`, `skipAutoPermissionPrompt`, `useAutoModeDuringPlan`, or `defaultMode: "auto"`, naming
the reason and pointing here. Verified by injection rather than asserted: setting the key produced
`Error: [sync-claude] permissions.json sets defaultMode "auto", which projectSettings may not
grant.` and `GUARD_EXIT=1`, and the file was restored byte-identically afterwards.

**Two things auto mode does NOT do**, both checked because both are the obvious fear:

- It is not `bypassPermissions`. The resolver is `aVt(e)`: `auto` → `"classify"`,
  `bypassPermissions` → `"allow"`, `dontAsk` → `"deny"`, everything else → `"ask"`. A rule-derived
  `ask` sets an **ask floor**, and the binary's log line for that path reads _"ask rule/safety check
  requires full permission pipeline (hookAskFloor — a classifier allow re-surfaces as this ask)"_.
  A classifier ALLOW cannot clear it, which is what keeps the `git push` gate intact.
- It does not fail open. An unreachable classifier logs _"Auto mode classifier unavailable, denying
  with retry guidance (fail closed)"_ and denies; a repeated-denial circuit breaker reverts to
  prompting rather than looping.

**`dontAsk` is a trap and belongs in the same enum.** It does **not** mean "proceed without asking";
it means _refuse_ without asking — `if (e === "dontAsk") return "deny"`. The binary's own
description confirms it: _"'dontAsk' - Don't prompt for permissions, deny if not pre-approved."_ It
reads like the autonomy setting and is the exact opposite of one.

### 12.18 Two binaries are in play, and the repo was measuring the wrong one

`claude --version` on PATH reports **2.1.211** (the WinGet install). This session does not run it.
The agent host runs its own bundled copy:

```
CLAUDE_CODE_EXECPATH=C:\Users\Sudee\AppData\Roaming\Code\agent-host\sdk-cache\claude\
  0.3.258\win32-x64\node_modules\@anthropic-ai\claude-agent-sdk-win32-x64\claude.exe
```

`claude doctor` run through it prints `Running: npm-global (2.1.258)`. The two differ by 35 MB
(218,507,936 vs 253,293,728 bytes) and by real capability. So every "unavailable above 2.1.211"
verdict in §7 and §12.12 is correct for a terminal session and potentially wrong for an agent-host
one, and vice versa.

**Operating rule: rely only on keys present in BOTH.** Check with a direct count, which is faster
and more trustworthy than mapping CHANGELOG line numbers:

```bash
grep -a -c 'PATTERN' "$CLAUDE_CODE_EXECPATH"                                   # 2.1.258
grep -a -c 'PATTERN' "C:/Users/Sudee/AppData/Local/Microsoft/WinGet/Packages/\
Anthropic.ClaudeCode_Microsoft.Winget.Source_8wekyb3d8bbwe/claude.exe"          # 2.1.211
```

That rule immediately paid for itself. A research pass recommended adopting `isolation: worktree`
in agent frontmatter, citing `CHANGELOG.md:5198` as proof it predates 2.1.211. The count disagrees:
`isolation:ee(["worktree"` returns **2 in 2.1.258 and 0 in 2.1.211**. Rejected. `background` is
present in both (4 / 2) and was rejected on different grounds — whether an agent runs in the
background is a property of the _call_ (`run_in_background`), not of the agent's identity, and a
background researcher stalled out with _"Agent stalled: no progress for 600s"_ during this very
session. Both keys stay out of `AGENT_EMITTED`.

Also found while sweeping the hook schema: there is a **third hook type**, `agent`, alongside
`command` and `prompt` (_"Hooks: Processing agent hook with prompt:"_, _"Hooks: Starting agent
query with"_). Both `prompt`- and `agent`-type hooks are rejected on events with no conversation
context — _"prompt-type hooks are not supported for ${event} events (no conversation context is
available). Use a command-type hook instead."_ — which is why the two live ones here are `Stop` and
`SubagentStop`. The full event list is larger than this repo uses: `PreToolUse`, `PostToolUse`,
`PostToolUseFailure`, `PostToolBatch`, `PermissionRequest`, `PermissionDenied`, `UserPromptSubmit`,
`UserPromptExpansion`, `Stop`, `StopFailure`, `SessionStart`, `SessionEnd`, `Setup`, `PreCompact`,
`PostCompact`, `PreModelSwitch`, `PostModelSwitch`, `Notification`, `SubagentStart`, `SubagentStop`,
`Elicitation`, `ElicitationResult`, `ConfigChange`, `InstructionsLoaded`, `DirectoryAdded`,
`TaskCompleted`, `TeammateIdle`. None are adopted: on Windows a command hook allocates a console
window (§1), and a prompt hook costs a model call per fire. The `Stop` hook was **extended** instead
of joined — a second prompt hook would have doubled the per-turn cost for no gain.

### 12.19 Thirty-two of fifty allow rules could only ever match one literal string

`Bash(pnpm lint)` did not cover `pnpm lint --fix`. `Bash(pnpm test)` did not cover
`pnpm test src/foo.test.ts`, which is how a single test file gets run. Both sat in the allow list
looking covered and prompted on every invocation.

The matcher is unambiguous once found:

```js
function Dsn(e, n) {
  switch (e.type) {
    case 'prefix':
      return n === e.prefix || n.startsWith(e.prefix + ' ');
    case 'exact':
      return n === e.command;
    case 'wildcard':
      return $q(e.pattern, n);
  }
}
function IXe(e) {
  return e.match(/^(.+):\*$/)?.[1] ?? null;
} // prefix ONLY when it ends in :*
```

A rule becomes a `prefix` rule **only** when its content ends in `:*` (or ` *`). Without that
suffix it is `exact` and matches one string. Note the trailing space in the prefix branch: it makes
prefix matching word-boundary safe, so `pnpm test:*` does **not** reach `pnpm test:e2e` — which is
why the `test:coverage` and `test:e2e` spellings are still listed separately rather than folded in.

Widened 2026-09-19 from 50 rules to **122** (61 base commands × 2 shells). Added alongside the
`:*` conversions: the local git verbs that had no rule at all (`add`, `commit`, `stash`, `fetch`,
`pull`, `merge`, `rebase`, `tag`, `mv`, `checkout -b`, `switch -c`) and the pnpm subcommands the
gates themselves mandate — `pnpm audit` is gate 8's own command and had never been allow-listed.

Verified by replicating `Dsn` against the emitted rules rather than by reasoning about them: every
hot-path command returned COVERED, and `git push origin master`, `git reset --hard`,
`git checkout -- .`, `rm -rf /`, `npm install` and `git branch -D x` all returned uncovered. The
destructive forms stay uncovered on purpose — they reach `deny` (which outranks allow) or the
auto-mode classifier's `soft_deny`. The `git branch` block keeps its five narrow read-only
spellings from §12.11 rather than becoming `git branch:*`, because `-M master` renames the current
branch over master and no deny rule catches that.

### 12.20 Sandboxing — the biggest autonomy lever in Claude Code, and it does not exist on Windows

Modern Claude Code can run Bash inside an OS sandbox and auto-approve what it runs there, because
a sandboxed command cannot do damage. The settings surface is real and rich —
`sandbox.enabled`, `sandbox.autoAllowBashIfSandboxed`, `sandbox.allowUnsandboxedCommands`,
`sandbox.excludedCommands`, `sandbox.failIfUnavailable`, `sandbox.enabledPlatforms`,
`sandbox.network.allowedDomains`, `sandbox.denyPaths`, plus a `/sandbox` command — and
`autoAllowBashIfSandboxed` is precisely the "never prompt again" mechanism every autonomy
discussion eventually reaches for.

**It is unavailable here, and the binary says so in one line:**

```
Error: Sandboxing is currently only supported on macOS, Linux, and WSL2.
Error: Sandboxing requires WSL2. WSL1 is not supported.
```

Guarded by `ut.isSupportedPlatform()`; the backend is bubblewrap on Linux
(`getIsBubblewrapSandbox`) and seatbelt on macOS. This machine is native **win32**. Setting any
`sandbox.*` key here would be §12.17 all over again — accepted by the schema, validated by
`doctor`, and inert.

**Record it as closed, not as a TODO.** Any future research pass on "how do we stop Claude asking
permission" will surface sandboxing as the headline answer; it is the right answer on the wrong
platform. The available ceiling on Windows is the one now in place: a wide `allow` list plus
user-scope auto mode (§12.17). Revisit only if this repo moves to WSL2, at which point sandboxing
becomes the better mechanism and the allow list could shrink.

**Two adjacent keys checked at the same time, both correctly left as they are:**

- `disableSkillShellExecution: true` — kept. It disables inline `` !`cmd` `` and ` ```! `
  blocks inside skills and slash commands, replacing them with
  `[shell command execution disabled by policy]`. **No skill in `.github/skills/` uses inline
  shell**, so this costs nothing and closes a path where a plugin-sourced skill could run
  commands. It is classified `restrictive: !0` in the binary's own settings taxonomy.
- `appendSubagentSystemPrompt` — **rejected.** It would be a tempting way to push the
  gate-evidence and no-pause rules into all seven agents from one place, but the binary marks it
  `@internal` and gates it behind `CLAUDE_CODE_ENABLE_APPEND_SUBAGENT_PROMPT`. An `@internal` key
  in a checked-in config is a §12.9 in waiting. The agent files are the supported surface.

### 12.21 A colon in a script name collides with the `:*` prefix suffix

Found immediately after the §12.19 widening, by mechanically checking every `package.json` script
rather than by reasoning about the list:

```
scripts in package.json: 15
UNCOVERED: format:check, test:watch, test:e2e:ui, prepare
```

`pnpm format:*` parses as prefix `pnpm format`. Under `Dsn` that matches `pnpm format` and
`pnpm format <args>` — and **not** `pnpm format:check`, which is **quality gate 1**, run on every
single handoff. The widening that fixed 32 exact-match rules introduced this one, because `:*` is
both the prefix marker _and_ a legal part of an npm script name.

The trap had already been worked around twice without being named: `test:coverage`, `test:e2e`
and `agents:sync:check` are listed separately precisely because `pnpm test:*` and
`pnpm agents:sync:*` cannot reach them. **Every colon-bearing script name needs its own entry.**

The check is mechanical and should be re-run after any `package.json` script change —
`dev-tools/research/agentic-development/_rule-coverage.cjs` parses the emitted
`.claude/settings.json` with a replica of `IXe`/`Dsn` and reports three things: hot-path commands
that no allow rule covers, hot-path commands **shadowed by a deny rule** (deny outranks allow, and
a deny that shadows a gate command fails silently — currently 0), and scripts uncovered by any
rule. Post-fix: `HOT=48  denyShadowed=0  ask=0  notAllowed=0`, `allow=124 deny=126 ask=2`.

Three scripts stay uncovered **on purpose**, and this is the note that stops a future pass
"fixing" them: `test:watch` and `test:e2e:ui` never terminate and would hang any agent session
that started one, and `prepare` is husky's install hook, already run by `pnpm install`.

## 12.22 The VS Code Agents window overrides the permission mode from the command line

Everything in §12.17 about `permissions.defaultMode` describes the **CLI**. Under the VS Code
"Agents window" host this repo is usually driven from, that key is irrelevant, because the host
spawns the binary with the mode as an explicit flag. Read off a live process 2026-09-20:

```
…\agent-host\sdk-cache\claude\0.3.258\…\claude.exe
  --setting-sources=user,project,local
  --permission-mode bypassPermissions
  --allow-dangerously-skip-permissions
  --disallowedTools WebSearch
  --permission-prompt-tool stdio
```

Four consequences, each verified rather than inferred.

**1. `--setting-sources=user,project,local` means all three scopes load.** The Agent SDK defaults to
loading none; this host opts all three in. So `.claude/settings.json` _is_ read here — confirmed by
probing the project `env` block from inside a session: `RESEND len=24 prefix=your` (the sentinel) and
`CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1`.

**2. The flag beats the file.** A CLI `--permission-mode` overrides `permissions.defaultMode` from
settings, so the user-scope auto mode of §12.17 never engages in this host. It is not a loss:
the binary ranks modes `{plan:0, bubble:1, default:1, dontAsk:1, acceptEdits:2, auto:3,
bypassPermissions:4}`, so the mode this host hands out is strictly _more_ permissive than `auto`.
The mode is chosen per chat by the window's **Approvals** control — three other live sessions on
this machine were running `--permission-mode default` at the same moment. It is session-scoped by
design; the binary logs `setMode:'bypassPermissions' is session-scoped; not persisting as
defaultMode` rather than writing it anywhere.

**3. Bypass mode does NOT disable this repo's two guards.** This is the part worth knowing, because
"bypass all permission checks" reads like it does.

- **`deny` still fires.** Proved by running a denied command: `npm --version` returned
  `Permission to use Bash with command npm --version 2>&1 has been denied.` The SDK's own doc string
  agrees — _"permissionMode 'bypassPermissions' auto-approves every tool call (except explicit deny
  rules) before the callback is consulted."_
- **An explicit `ask` rule still asks**, so the owner's `git push` gate survives. The predicate is
  `REr`: `if(r.behavior!=="ask")return!1; if(n.mode!=="bypassPermissions")return!1; let
o=r.decisionReason; return !(o?.type==="rule"&&o.rule.ruleBehavior==="ask")`. Bypass auto-approves
  an `ask` **verdict** — but not one that came from a rule. Generic safety asks are waved through;
  the two rules in `permissions.ask` are not.

What bypass _does_ neutralise is `permissions.allow`. All 124 rules are inert in a bypass session,
since everything is approved anyway. They are not wasted — they carry the `default`-mode chats and
any terminal CLI use — but in this window they are insurance, not the active mechanism.

**4. `WebSearch` is disabled by the host, and six agent definitions grant it anyway.** The source
frontmatter `tools: [read, search, web, …]` expands to `WebFetch, WebSearch` in
`.claude/agents/*.md`, and the host then strips `WebSearch` session-wide. This is §12.9's pattern
again — declared, translated correctly, unreachable at runtime — but the first instance where the
_host_, not the emitter or the trust gate, is what removes it. `WebFetch` still works, so a URL you
already know is fetchable; open-ended discovery is not. `context7` is unaffected and is the right
first reach regardless. `agentic-workflow.instructions.md` has been corrected in both places where
it told an agent to fall back to a web search.

**Also corrected here: the WinGet `claude` on PATH is a 124-byte shim, not a binary.** §12.18 quoted
218,507,936 bytes for it; that figure is the _host's_ binary. `stat -c %s "$(command -v claude)"`
returns **124**. The two-binaries finding stands — `--version` reports 2.1.211 on PATH and 2.1.258
for the host — but the size comparison in §12.18 was measuring the same file twice.

Consequence for §13.2: `winget upgrade Anthropic.ClaudeCode` **does not change what the Agents
window runs.** The host resolves its own binary from `agent-host/sdk-cache/claude/<sdk-version>/`
and upgrades when the extension bumps its SDK pin. A WinGet upgrade only affects `claude` typed into
a terminal.

## 12.23 The `npx` ban is two specific facts, not a principle — and a search MCP closes §12.22

Asked why `.vscode/mcp.json` refuses `npx` but says nothing about `uvx`, this session first answered
that "every fetch-on-demand launcher is unreliable here." That is a generalisation the evidence does
not support, and it would have vetoed a perfectly good launcher. The file's own `//` comment gives
the two real reasons, and neither one reaches `uvx`:

1. **`npx` is banned repo-wide.** This is a pnpm-only project; `npm install` would create a
   competing `package-lock.json` and a flat `node_modules`. `permissions.json` denies it. That is a
   policy about _npm_, and `uvx` is not npm — it is `uv`'s Python runner, resolves at
   `/d/mise/shims/uvx`, is already installed, and is not banned by anything.
2. **A package-specific phantom dependency.** `@modelcontextprotocol/server-memory` and
   `server-sequential-thinking` import `zod` without declaring it. npm's flat tree hoists `zod` up
   from the SDK so the import resolves by accident; pnpm's store correctly refuses to supply an
   undeclared dependency, and `pnpm add -g` links into `store/v11/links/…`, which has no `.pnpm`
   ancestor for Node to walk up to. That is a bug in **those two packages**, not a property of
   on-demand launchers.

The same comment already records that `.cmd` shim spawning was **ruled out by test** and is not the
reason we launch with `node`. The actual reason is path stability: absolute, hash-free paths survive
`pnpm up` in `D:/mise/mcp-servers`, whereas the pnpm global `.CMD` shims point at a target hash that
changes on every install.

**The rule to carry forward:** when a config comment gives reasons, the reasons are the rule. Do not
promote them into a principle — a principle generalises to cases the evidence never tested.

### Closing the WebSearch hole

§12.22 established that the Agents window strips `WebSearch` at registration time, where no
permission rule can reach it, while six agent definitions went on granting it. The fix is a search
MCP, because **MCP tools register as `mcp__<server>__<tool>`** — a namespace `--disallowedTools
WebSearch` does not filter.

`tavily-mcp@0.2.22` was installed into the existing `D:/mise/mcp-servers` pnpm project
(`pnpm --dir "D:/mise/mcp-servers" add tavily-mcp`) and launched the same way as the other two, with
`node` and an absolute path. It declares all four of its dependencies — `@modelcontextprotocol/sdk`,
`dotenv`, `axios`, `yargs` — so the zod saga above does not apply to it; the `node` launcher here is
purely the path-stability choice.

**It runs keyless**, which removes the human signup step that would otherwise have made this a
§13-class blocker. Verbatim from stderr on a bare run:

```
[tavily-mcp] no TAVILY_API_KEY set; running in keyless mode. Search and extract are
available; other tools will return a message explaining that an API key is required.
Tavily MCP server running on stdio
```

Tool names read from `build/index.js`, not the README — **underscores, unlike context7's hyphens**:
`tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`. All five
descriptions are long paragraphs and all five load into every holder's context regardless of whether
they function, so `mapTools()` expands `tavily/*` to the two that work, and `PROMISES` gained a
`tavily` pattern so prose and grants cannot drift apart.

Granted to `researcher` and `debugger` only. Those are the two agents whose work is discovering
unknowns — a novel error string has no version-pinned index to query. `implementer`, `reviewer` and
`planner` need API _facts_, which is exactly what `context7` returns pinned; giving them a second,
unpinned search path would cost five tool descriptions each and invite the stale-blog-post failure
mode those agents were told to avoid. An open search from one of them is a `researcher` delegation.

**Still session-bound:** MCP servers bind at session start (§12.13). Nothing above is reachable in
the session that wrote it — `tavily` appears only in a session started after the sync.

### 12.24 The format gate manufactured a frontmatter shape the parser could not read

Found 2026-09-22 during the seven-agent prompt audit, fixed in `f7d4c65`. **Instance 8** of the
§12.9 class, and the most serious one yet: for an unknown period, **five of the seven agents held
every tool in the session**, including `edit` and `execute` on agents whose own prompts told them
they had neither.

The mechanism is three links long and every link is individually reasonable:

1. `tools:` is authored as a flow sequence, `tools: [read, search, ...]`.
2. **Prettier reflows any such line past the print width** into a bare `tools:` followed by an
   indented `[ ... ]` across several lines. This is not exotic formatting anybody chose — it is what
   `pnpm format` does, which means **the repo's own gate 1 manufactured the input**.
3. `parseFrontmatter` knew the one-line flow form and the block-sequence form. The wrapped flow form
   matched neither, fell through to the nested-map branch, and — because `[` and `read,` are not
   `key: value` — produced `{}`. `mapTools({})` saw a non-Array and returned `null`. The emitter's
   `if (tools?.length)` then omitted the `tools:` line entirely.

That last step is where a drop becomes an escalation. **In Claude Code an absent `tools:` does not
mean "no tools" — it means inherit every tool.** The failure mode of a parser returning nothing was
not a crippled agent but an omnipotent one, which is the opposite of how silent failures usually
present and the reason nobody noticed.

The tell was visible in the data the whole time: the only two agents that survived, `researcher` and
`scribe`, are precisely the two whose tool lists were short enough to fit on one line. Everything
else about them is unremarkable. **When exactly the short rows are correct, suspect the formatter,
not the content.**

Three properties made this durable:

- **Every generated file looked plausible.** A `.claude/agents/*.md` with no `tools:` line is a
  legal, common, deliberate shape — it is how you write an agent that should inherit. Nothing about
  the output said "this was supposed to be restricted."
- **The prompts contradicted the grants, in writing, and nothing compared them.** `reviewer` said
  "DO NOT edit any file. You have no edit tool"; `memory-updater` said "NEVER call `read_graph` …
  You do not have the tool"; `implementer` said "you have no delegation tool." All three held the
  tool each disclaimed. The prose was the accurate half.
- **The one guard that would have caught it was disabled by the same bug.** `lintCapabilityPromises`
  opens with `if (!tools?.length) return;` — sound in isolation, since inheriting everything cannot
  _under_-grant. But the five broken agents arrived with exactly that empty `tools`, so the promise
  lint skipped precisely the five files it was written for. **A guard whose skip condition is also
  the bug's signature is not a guard.**

The parser now handles the wrapped form (`sync-claude.mjs:131-144`) — six shapes, not five.

**A second, unrelated defect surfaced while fixing the first.** With `tools` finally parsing, the
promise lint ran on all seven agents for the first time and returned four false positives. The
`tavily` rule matched the bare brand word `\btavily\b`, which fires identically on an instruction
("use tavily to search") and on a **denial** ("you deliberately do not hold `tavily`") — a regex
reads mention and cannot read polarity. Since the audit had just added exactly that kind of
self-limit prose to most agents, the guard fired hardest on the files that had just been improved.
Tightened to function names only, `\btavily_(search|extract)\b`, matching what the neighbouring
`context7` rule (`sync-claude.mjs:378`) already did. Per-file `allow` holes were rejected as the fix:
they would have switched the rule off for the four files most likely to gain a genuine promise later.

Two rules to carry forward, both paid for here:

- **Your formatter is part of your parser's input contract.** A hand-rolled reader must accept every
  shape the project's own tooling can emit, not merely the shapes a human would type. Anything else
  is a latent bug with a scheduled trigger — the next time a list grows one entry past the print
  width.
- **When a parse failure means "inherit", the safe default is to fail loudly.** `mapTools` returning
  `null` and the emitter quietly omitting the line was a permissive failure in a security-adjacent
  path. §12.9's rule was "a capability is not adopted until something mechanical proves an agent can
  reach it"; instance 8 adds its mirror — **a restriction is not applied until something mechanical
  proves an agent cannot.**

## 13. One thing only the human can do — and one that turned out not to be

This section listed two blockers and asserted that "neither is fixable from inside a session."
That was half right, and the wrong half cost this repo two months of prompting on commands the
allow list already covered.

### 13.1 Workspace trust — GRANTED 2026-09-19, non-interactively

The startup warning named its own remedy all along, and the second clause is the one every prior
reading skipped:

```
Ignoring 50 permissions.allow entries from .claude/settings.json: this workspace has not been
trusted. Run Claude Code interactively here once and accept the trust dialog, or set
projects["D:/Projects/navodaya-landing-page"].hasTrustDialogAccepted: true in C:\Users\Sudee\.claude.json.
```

**"or set …" is a sanctioned, scriptable path.** The binary is telling you the file, the key and
the value. Earlier revisions of this file read only as far as "run Claude Code interactively" and
filed trust under _human-only_, where it sat across many sessions — every one of them prompting for
`git status`.

`dev-tools/research/agentic-development/_grant-trust.mjs` does it: back up `~/.claude.json`, write
the entry using the binary's own default project shape, and assert the binary's own predicate
before declaring success. Three details it gets right that a hand-edit would not:

- **The project key is a normalised path.** `Ise()` resolves and normalises before lookup, so the
  key is `D:/Projects/navodaya-landing-page` — forward slashes, no trailing separator. A key
  written as `D:\Projects\...` or with a trailing `\` matches nothing and fails silently.
- **A project entry has required siblings.** Writing a bare `{hasTrustDialogAccepted:true}` leaves
  out keys the loader expects; the script merges into the default shape instead of replacing it.
- **`~/.claude.json` holds live session state.** It is not a config file you own outright — back it
  up before touching it, which the script does unconditionally.

What this activated, in one step: **122 allow rules**, the project `env` block (the PATHEXT repair
and `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` — the latter being why `cd` no longer escapes the
project), and `additionalDirectories`. Current counts, read from the generated
`.claude/settings.json` on 2026-09-19: **122 allow / 126 deny / 2 ask**. Earlier revisions of these
notes and of the memory files said 44/63/14, then 42/77/19, then 50/144/40 — all stale, and the
last one predates both the owner's no-prompts decision (`ask` 41 → 2, `deny` 168 → 126) and the
allow widening in §12.19.

**The startup warning was also the only rule-validation oracle that worked here**, and granting
trust retires it. It counted the allow entries and said nothing about deny or ask — silence that
was meaningful, because that is exactly where the inert `Write(...)` rules announced themselves
(`//no-write-rules`). With trust granted the line no longer prints, so that oracle is gone: verify
rule _syntax_ by replicating `Dsn`/`IXe` against the emitted file (§12.19), and never by asking
`claude config get permissions`, which is not a subcommand and answers the string as a _prompt_.

**The PATHEXT duplication is still load-bearing — do not deduplicate it.** The same repair exists
in `.github/hooks/permissions.json` (project scope) and `~/.claude/settings.json` (user scope).
Before trust the project copy was inert and the user copy did all the work. Now the project copy
takes over inside this repo — but the user copy is what a _different_ project on this machine gets,
and what this project would fall back to if trust were ever revoked. Deleting either is a
regression; keeping both is what makes the repo self-describing for a second machine.

### 13.2 The binary upgrade — genuinely human-only

**The WinGet binary is 2.1.211; upstream is 2.1.275.** `winget upgrade Anthropic.ClaudeCode`.
This is not cosmetic — `claude plugin eval`, the only mechanism for _testing_ this control plane
rather than asserting it is good, **does not exist before 2.1.269** (`CHANGELOG.md:389`). Until
the upgrade an eval suite can be authored but never run, so none is shipped: an unrunnable suite
is the §11.1 mistake in a new costume.

Read that version number together with §12.18. The agent-host SDK binary this session runs is
**2.1.258**, not 2.1.211, so "the binary" is ambiguous unless you say which. Neither reaches
2.1.269, so the conclusion holds for both — but check both counts before extending it to any
other key.

---

## 14. The status line — the one sanctioned subprocess, and it lives at user scope

These notes described a control plane with **zero** `type: "command"` entries. That was wrong, and
the error survived because the status line is configured in `~/.claude/settings.json` — user
scope, outside this repo — so every audit that read `.github/` concluded "none is configured".

There is one, `powershell -NoProfile -File C:/Users/Sudee/.claude/statusline.ps1`, and it is a
deliberate exception rather than an oversight. Three details make it survivable where the four
hooks were not:

- **Forward slashes are mandatory.** On Windows the host routes status-line commands through Git
  Bash when it is installed (it is, at `D:/Git`), and Git Bash eats unquoted backslashes as escape
  characters — a `C:\Users\...` path fails **silently**, which looks identical to "trust is not
  granted yet".
- **The script spawns zero children of its own.** Every field comes from the stdin JSON, and the
  branch is read out of `.git/HEAD` as a plain file rather than by calling `git rev-parse`. A
  naive implementation shelling out to git would be two or three processes per update, not one.
- **It is event-driven and debounced at 300 ms** — not a poll. This is the whole difference from
  §1: the hooks leaked because a `cmd /c` wrapper held a node child that blocked forever on stdin,
  and 22 of them accumulated. A status line that cannot block on stdin and cannot fork cannot
  accumulate.

It is still one process per update. That is an accepted cost, not a free lunch.

### 14.1 It is trust-gated, and this one is not an inference

`~/.claude/settings.json` carries two comments that appear to contradict each other: `//env` says
user-scope settings "carry no such gate" (true — the PATHEXT repair works in this untrusted
workspace, which is the only reason `node` and `pnpm` resolve at all), while `//statusLine` says
it "stays blank until the workspace is trusted".

Both are correct, and the second is documented rather than reasoned: `CHANGELOG.md:5190`, in
**2.1.51**, _"Fixed a security issue where `statusLine` and `fileSuggestion` hook commands could
execute without workspace trust acceptance in interactive mode."_ The gate attaches to **executing
a command**, not to the scope the setting came from — the host cannot know a user-scope status
line was not planted by the project. That fix is nine hundred versions older than this binary, so
it is in force here.

So §13's trust list has a fourth casualty, and the status line is blank right now for a reason
that has nothing to do with the script being wrong.

**This is the opposite of the §11.2 result and it is worth holding both.** Prompt hooks fire
untrusted; status-line commands do not. "It is in the hooks family, therefore it is trust-gated"
was false for prompt hooks; "user scope, therefore ungated" is false for the status line. Neither
inference generalises — check the changelog for the specific mechanism, every time.

### 14.2 What this cost, and the audit rule it produces

An earlier revision of this section's memory note asserted _"No `statusLine` is configured, and
none should be"_, and reasoned from `type: "command"` that adding one would violate §1. Every
clause was wrong: one is configured, it predates the audit, and its design already answers the
objection. The note was written confidently, from `.github/` alone, about a file in `~/.claude/`.

**Audit rule:** the control plane is the union of `.github/hooks/**`, the generated `.claude/**`,
**and `~/.claude/settings.json`**. The user-scope file is not visible in any repo diff, is not
regenerated by `pnpm agents:sync`, and currently holds two load-bearing things — the PATHEXT
repair without which no toolchain resolves, and this status line. Read it before concluding
anything about what is or is not configured.

`subagentStatusLine` genuinely is absent, and cannot be adopted on this binary anyway — see the
version table in §11.5.

## 15. The MCP surface is not `.mcp.json` — VS Code merges a user-scope file into every session

Verified 2026-09-22 by reading the live `claude.exe` command lines. `.mcp.json` declares four
servers. The process was running **seven**, and `enabledMcpjsonServers` had nothing to do with it.

**The mechanism.** VS Code takes the **user-scope** `%APPDATA%/Code/User/mcp.json` and the
**workspace** `.vscode/mcp.json`, merges them into a synthetic plugin at

```
%APPDATA%/Code/agentPlugins/vscode-synced-customization-agent-host-claude-<id>/<nonce>/.mcp.json
```

and hands that to the binary as `--plugin-dir-no-mcp <dir>` plus a fully-expanded `--mcp-config`.
That generated file was read and contains all six stdio/http servers — this repo's four, with the
literal `D:\mise\mcp-servers` paths and `MEMORY_FILE_PATH` already resolved to this repo's
`knowledge-graph.jsonl`, plus the two from user scope. The same directory also carries the
`skills/` that appear in-session as `1612775986:commit`, `1612775986:code-review` and so on.

Three consequences, in descending order of how much trouble they cause:

- **`enabledMcpjsonServers` is inert in the Agents window.** The host never consults it; it
  flattens every declared server into `--mcp-config` itself. This is why `tavily` ran even
  when `.claude/settings.local.json` used to list only three servers and omit it — a
  discrepancy that looked like a bug until the process dump explained it. That file was
  deleted 2026-09-22 (§15) precisely because it carried no `allow` rules to lose and its
  three-server list was strictly narrower than the generated `.claude/settings.json`'s four,
  so whether terminal-CLI precedence is override or merge, the set only ever went 3 -> 4,
  never down. The key still governs terminal CLI use, where `settings.local.json` -- now
  absent -- was the highest-precedence scope when present; do not trust it to gate anything
  in this window either.
- **Deleting the plugin directory accomplishes nothing.** `agentPlugins/cache.json` held eight
  nonces; the directory is rebuilt per session from the two source files. Edit the sources.
- **`github-mcp-server` is injected unconditionally by the host**, independent of all of the
  above — it appeared in `--mcp-config` for all three concurrent `claude.exe`, including two
  that were given no plugin directory at all. It points at `api.business.githubcopilot.com`
  with an `X-MCP-Tools` header allow-listing ~25 read-only tools. It could not be traced to a
  setting: the Copilot extension is in neither `~/.vscode/extensions` nor `~/.vscode-shared`,
  so its contributed settings were unreadable. **It registered zero tools in-session**, so the
  real context cost is nil and it was left alone. If it ever starts registering tools, the
  lever is a Copilot or org policy, not a file in this repo.

**Count registered tools, not declared ones.** The first pass of this audit reported the two
user-scope servers as "unaccounted-for context cost and a third party you didn't choose." Both
halves were wrong. They carry `"gallery": "https://api.mcp.github.com"` — installed deliberately
from VS Code's MCP browser — and only one of them cost anything:

| Server                        | Declared | Registered in-session | Real cost                         |
| ----------------------------- | -------- | --------------------- | --------------------------------- |
| `chrome-devtools-mcp` (`npx`) | ~29      | **29**                | the only one that mattered        |
| `basic-memory` (`uvx`)        | many     | **0**                 | `uvx` never resolved; dead config |
| `github-mcp-server` (http)    | ~25      | **0**                 | nil                               |

A server in `--mcp-config` that fails to launch is indistinguishable from a configured one until
you check the tool list. The "second memory system competing with the knowledge graph" was not
competing; it was not running.

**Resolved 2026-09-22.** Both user-scope servers were removed — `%APPDATA%/Code/User/mcp.json` is
now `{"servers": {}, "inputs": []}`, with the prior contents beside it as
`mcp.json.removed-2026-09-22.bak`. 29 browser-automation tool descriptions left every context
window in a repo that does its browser work through Playwright.

**The file is now guarded at both layers**, because it had proved it could inject tools into every
future session in every project and was protected at neither:

- `chat.tools.edits.autoApprove` in `%APPDATA%/Code/User/settings.json` gained
  `"**/Code/User/mcp.json": false`, matching the `"**/.vscode/mcp.json": false` that was already
  guarding only the workspace half.
- `permissions.json` `deny` gained `Edit(~/AppData/Roaming/Code/User/mcp.json)`, rationale in
  `//deny-user-mcp`.

That deny rule is **not** the self-config guard §13 removed and forbade. The distinction is blast
radius: this is a machine-wide file outside the repo, and the rule stops repo-scoped work from
silently changing every other project's session. It blocks silently, so
`//OWNER-DECISION-no-permission-prompts` is untouched. There is deliberately **no `Read(...)`
half** — reading that file is how you diagnose a surprise tool in the context window, which is
exactly what this section is a record of.

**Amendment to §14's audit rule.** That rule defines the control plane as the union of
`.github/hooks/**`, the generated `.claude/**`, and `~/.claude/settings.json`. Two more files
belong in it, and neither appears in any repo diff or is touched by `pnpm agents:sync`:

```
%APPDATA%/Code/User/mcp.json        # servers injected into every session
%APPDATA%/Code/User/settings.json   # chat.tools.edits.autoApprove, chat.subagents.*
```

**How to read the truth**, as in §12.22 — do not reason from settings files, dump the process:

```
powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='claude.exe'\" | Select-Object -ExpandProperty CommandLine"
```

## 15. `.claude/settings.local.json` existed, was stale, and was not managed by the sync

Found and resolved 2026-09-22. `.claude/settings.local.json` (written 2026-09-19) held exactly:

```json
{ "enabledMcpjsonServers": ["memory", "sequential-thinking", "context7"] }
```

— missing `tavily`, added 2026-09-20. Local settings are documented to take precedence over
project settings, so this looked like a live risk: a file no `.github/` source describes, not
produced by `pnpm agents:sync`, and not swept by the sync's orphan pass (it only manages files it
generates; `settings.local.json` is a user-owned override by design and the sync must not touch
it).

**Verified empirically rather than assumed:** `claude mcp list` reported all four servers —
including `tavily` — connected _with the stale file in place_. Renaming it away and re-running
`claude mcp list` reported the identical four servers connected. `enabledMcpjsonServers` therefore
behaves as a **union across settings scopes**, not a full override, at least for this key: the
generated `.claude/settings.json` already lists all four, and the local file's narrower list did
not shadow that.

**Resolved by deletion**, not by adding `tavily` to it — the file was pure redundancy with the
generated file and carried no override this repo needs. Verified after deletion: all four servers
still connect. If a future session finds `.claude/settings.local.json` again, that is a genuine
local override someone made on purpose (this file is the one generated-directory exception the
sync must never delete or rewrite) — reconcile by hand as done here, do not assume the sync will
pick it up.

---

## 16. Spec Kit adoption, and the general rule it produced — 2026-09-24

The owner asked for a free AI-DLC (spec/plan/tasks lifecycle) framework to replace ad-hoc "waves"
planning. Four candidates were evaluated; **GitHub Spec Kit** (`github/spec-kit`, MIT) was
installed. This section is the forensics — what nearly broke, and why the fix generalises.

### 16.1 Why Spec Kit, and why not the other three

- **AWS `awslabs/aidlc-workflows`** (MIT-0) was the runner-up and the closest literal name match —
  its Inception/Construction phase naming is where the term "AI-DLC" comes from most directly.
  Rejected because its documented integrations enumerate only Codex and Kiro; its Claude Code file
  footprint could not be confirmed before installing it. That is an unacceptable risk in a repo
  where `pnpm agents:sync` recursively deletes `.claude/agents`, `.claude/skills` and `.claude/rules`
  on every run (§16.2) — an unconfirmed footprint could be silently destroyed, or worse, could be
  the thing silently surviving in a directory the sync doesn't know to manage.
- **BMAD-METHOD** was rejected outright: its installer is npm-based, which this repo's pnpm-only
  policy forbids (`npm install` would create a competing `package-lock.json` and break pnpm's
  linked store — same reasoning as the `npx` ban in §12.23), and it ships its own competing 5-agent
  roster rather than layering on an existing one.
- **Agent OS** was rejected because v3 retired its orchestration phases in favour of Claude's Plan
  Mode, making it a thinner lifecycle layer than a dedicated tool.
- **Spec Kit won** on two properties, in order of importance: its installer
  (`uv tool install specify-cli --from git+https://github.com/github/spec-kit.git` then
  `specify init --here --force --non-interactive --integration claude`) is Python/`uv`-based and
  touches no Node packages at all; and it is a pure lifecycle/artifact layer — constitution →
  specify → plan → tasks → implement → converge — with no competing agent roster, so it sits on top
  of this repo's 7 agents instead of fighting them. Installed via `uv` 0.11.28 (already present via
  mise): `specify-cli` 1.0.12.dev0, exit 0.

### 16.2 The `.claude/` wipe hazard, and the general rule

`specify init --integration claude` installs its 10 skills into `.claude/skills/`. In this repo
that directory is **generated and gitignored** (`.gitignore:27`, under the block explaining why
`.claude/` and `.mcp.json` are never committed): `sync-claude.mjs` does a recursive `rmSync` on
`.claude/agents`, `.claude/skills` and `.claude/rules` on every non-check run, then rewrites only
what `.github/` sources claim (§6, and "Running under Claude Code" in `AGENTS.md`). The 10 skills
Spec Kit installed were untracked and would have been silently destroyed by the next
`pnpm agents:sync` — indistinguishable, from the sync's point of view, from any other file it
doesn't manage.

**The fix:** all 10 `speckit-*` directories were moved from `.claude/skills/` into
`.github/skills/`, the repo's actual source of truth. Spec Kit happens to install the exact
`<name>/SKILL.md` shape the existing hand-authored skills (`ship-feature`, `parallel-research`,
etc.) already use, so the move required no reshaping — the skills now regenerate on every sync and
are tracked in git like everything else. Verified present at `.github/skills/speckit-{analyze,
clarify, constitution, implement, converge, plan, checklist, specify, tasks, taskstoissues}/SKILL.md`.

**The general rule, worth carrying into the next tool adoption:** any installer that writes into
`.claude/` — because that is the path its own documentation names, or because it detects Claude Code
and defaults to it — must have its output relocated to the matching `.github/` source before the
next sync runs, or the sync will destroy it without comment. This is the same class of hazard as
the `Write(path)` permission rule in §2 and the stale `settings.local.json` in §15: a file that
looks configured but sits outside the one system that actually manages persistence here.

### 16.3 The Prettier-scope hazard — would have blocked every future commit

`.specify/` (19 files) plus the 10 vendored `SKILL.md` files added 21 files to Prettier's default
scope, and `prettier --check .` failed on them out of the box. Because `.husky/pre-commit`
independently re-runs `prettier --check .` on every commit (per the quality-gates file's "These
gates mirror a real commit blocker" section), an unresolved failure here would not have been a
one-time nuisance — it would have blocked **every subsequent commit in the repo**, Spec Kit-related
or not, until someone diagnosed why `git commit` had started failing for reasons that had nothing
to do with their change.

**Resolved by exclusion, not reformatting:** `.specify/` and `.github/skills/speckit-*/` were added
to `.prettierignore`, with the rationale recorded inline there — these are upstream-maintained LLM
prompt files where list structure, code-fence placement and whitespace can carry meaning, and
reformatting them would turn every future `specify` refresh into a merge conflict against a
repo-local formatting pass that adds nothing. Same logic as the existing `pnpm-lock.yaml` entry
a few lines above it in that file: some files are correctly exempt from this repo's formatting
because a different tool, not this repo, owns their exact bytes.

### 16.4 The frontmatter-vocabulary gap

Spec Kit's `SKILL.md` frontmatter uses three keys the sync's classifier did not recognise:
`compatibility`, `user-invocable`, and `disable-model-invocation` (confirmed present in, e.g.,
`.github/skills/speckit-specify/SKILL.md:5,9-10`). Unclassified keys are treated as `dropped`
findings by `pnpm agents:sync:check` (§ "Running under Claude Code" in `AGENTS.md` — the emitter
would silently discard a key it doesn't know how to pass through or drop, which reads as configured
and does nothing). This produced 30 `dropped` findings across the 10 new skill files. The fix —
classifying the three keys into the sync's passthrough/silent-drop lists — was in progress alongside
this section and is not detailed further here; check `sync-claude.mjs` directly for the current
state rather than trusting this paragraph to have kept up.
