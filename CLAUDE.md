@AGENTS.md

<!--
  The two instruction files below carry no `applyTo` glob, so they apply
  everywhere and are imported here by hand. The scoped ones are NOT imported:
  `pnpm agents:sync` emits them as `.claude/rules/*.md`, copying each `applyTo`
  glob verbatim into `paths:`, so they load only when a matching file is in play
  — `vitest.config.mts` and other bare root files included. Importing one here
  would load it twice.

  Adding a new unscoped instruction file? Add its import here; the sync prints a
  reminder listing which ones it found. A stray generated `CLAUDE.md` inside
  `src/` is a leftover of the pre-2026-09-18 directory scheme — the sync sweeps
  it. See `.github/CONTROL-PLANE-NOTES.md` §12.14.
-->

@.github/instructions/quality-gates.instructions.md
@.github/instructions/agentic-workflow.instructions.md

<!--
  Branch naming, Conventional Commits format and the PR rules live in
  CONTRIBUTING.md and are not derivable from the code. They were absent from
  the always-loaded context until 2026-09-22, so a pipeline that reached its
  commit stage had to guess the format the repo already specified. Imported
  here rather than copied, so there is one source.
-->

@CONTRIBUTING.md
