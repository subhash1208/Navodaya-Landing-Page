---
name: parallel-research
description: >-
  This skill should be used when the user asks to "investigate", "explore", "research",
  "look into", or "understand how X works" in the codebase before implementing, or types
  /parallel-research. Covers fanning researchers out across several angles at once and
  consolidating their findings into one brief. Read-only.
argument-hint: 'Topic or area to investigate'
---

# Parallel research

Investigate the topic from multiple angles simultaneously. Delegate to the `planner` agent, which holds the subagent tool. Everything below is the `planner`'s procedure — hand it over and stop. If you are already the `planner`, execute it yourself.

Decompose the topic into **as many narrow, non-overlapping questions as it actually needs — typically 2 to 4**. Never pad to hit a number; an invented question wastes a researcher and returns noise.

Useful decomposition axes:

- **Structure** — what exists today and how it is wired
- **Convention** — what pattern the codebase already uses for this
- **Integration** — what consumes it, what it consumes, what breaks if it changes
- **Verification** — how this area is currently tested, and what coverage exists

Invoke the `researcher` subagent **once per question in a single parallel batch**. Each researcher receives exactly one question and no others.

When all return, produce a consolidated brief:

```markdown
## Research brief: <topic>

### What exists

<synthesis, with path:line citations>

### Pattern to follow

<the convention an implementer should copy>

### Blast radius

<what changes if we touch this>

### Test coverage today

<what is covered, what is not>

### Contradictions

<where researchers disagreed — flag, do not silently pick one>

### Open questions for you

<anything needing a human decision, or "none">
```

Do not write or modify any code. This is a read-only investigation.
