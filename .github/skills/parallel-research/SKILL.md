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

When all return, produce a consolidated brief.

**Two of its sections are yours, not theirs — and the brief must say which.** Each researcher answered one question and cited it. `What exists` and `Test coverage today` are those findings forwarded. `Pattern to follow` and `Blast radius` are **your inference on top**: nobody was asked "is this the convention?" or "what breaks?", they were asked what one file does. Written in the same voice, carrying the same `path:line`, that inference reaches the implementer indistinguishable from a verified finding — and the citation travels to a claim it was never attached to.

Anthropic's production research system runs a **separate citation pass after synthesis** for precisely this reason: attribution is what breaks when one agent writes prose over another's condensed findings. You get no such pass, so do it inline as you write:

- **A `path:line` may appear only on a sentence a researcher actually supported.** Generalising from one cited example to a repo-wide convention is fine — say "one instance, at `path:line`". A bare citation on that sentence reads as a survey nobody ran.
- **Do not fill a section nobody researched.** If you asked two questions and neither covered integration, `### Blast radius` reads "not researched — no question covered this". The template is a checklist of what to report, not a quota of paragraphs to produce. An empty section is a cheap gap; a plausible invented one costs a review round to disprove.
- **"Not found" is a finding, not an omission.** "Nobody established whether X exists" and "X does not exist" are different claims, and an implementer acts differently on each. Forward the first as the first.

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
