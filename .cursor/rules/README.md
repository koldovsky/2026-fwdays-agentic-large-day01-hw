# Cursor Rules — Project Policy

This directory defines how AI agents operate in this repository.

The goal is not just code generation, but **safe, consistent work in a large, evolving codebase**.

---

# Core Principle

The agent must operate as part of a **knowledge-driven workflow**, not as a stateless code generator.

All work follows this loop:

code → investigation → understanding → change → documentation → reusable pattern

---

# System Layers

## 1. Memory Bank (always loaded)

Location: `docs/memory/`

Purpose:
- compact, always-available project knowledge
- navigation layer for deeper docs
- operational constraints and system behavior

Key files:
- `projectbrief.md` — goals and scope
- `productContext.md` — domain and UX
- `techContext.md` — tooling, versions, commands
- `systemPatterns.md` — architecture and behavior
- `activeContext.md` — current focus and policy
- `progress.md` — status and backlog
- `decisionLog.md` — decisions index

---

## 2. Technical Docs (on demand)

Location: `docs/technical/`

Purpose:
- deep system knowledge
- architecture details
- undocumented behaviors
- analysis patterns

Examples:
- `architecture.md`
- `undocumented-behaviors.md`
- `code-archaeology-patterns.md`

---

## 3. Product Docs (on demand)

Location: `docs/product/`

Purpose:
- domain language
- features
- UX behavior

---

## 4. Decisions (ADR)

Location: `docs/decisions/`

Purpose:
- intentional changes in behavior or architecture
- long-term reasoning

---

# Required Workflow

## Before making changes

The agent must:

1. Read relevant Memory Bank files:
   - `systemPatterns.md`
   - `activeContext.md`
2. Identify:
   - system constraints
   - risky areas (state, timing, side effects)
3. Load additional docs if needed:
   - `docs/technical/*`
   - `docs/product/*`

---

## During investigation

The agent must:

- perform code archaeology when behavior is unclear
- look for:
  - state machines
  - side effects
  - initialization order
  - timing constraints
  - caches
  - workarounds

---

## When finding undocumented behavior

The agent must:

1. Explain:
   - what the behavior is
   - where it is encoded
   - why it is not obvious
2. Assess:
   - what could break it
   - impact severity
3. Decide:
   - whether it should be documented

If yes:
- add to `docs/technical/undocumented-behaviors.md`
- add summary to `docs/memory/systemPatterns.md`
- optionally extract a reusable pattern to `docs/technical/code-archaeology-patterns.md`

---

## When making changes

The agent must:

- preserve existing behavior unless explicitly changing it
- prefer small, controlled edits
- avoid rewriting large subsystems
- explain assumptions

---

## After completing work

The agent must:

- update docs if new knowledge was discovered
- ensure no “knowledge leak” remains only in chat

---

# Documentation Rules

## Memory vs Technical

- Memory (`docs/memory/`) → short, operational knowledge
- Technical (`docs/technical/`) → detailed explanations

Do not mix them.

---

## Source of truth

- system behavior → `systemPatterns.md`
- deep behavior → `undocumented-behaviors.md`
- analysis heuristics → `code-archaeology-patterns.md`

---

## Documentation is part of the task

If the agent discovers something important:
→ it must be written to docs

---

# Safety Rules

The agent must NOT:

- assume architecture from partial context
- simplify stateful logic without verification
- ignore timing or ordering constraints
- remove workarounds without understanding them
- introduce silent behavior changes
- leave important findings undocumented

---

# Output Style

For non-trivial tasks, responses must include:

1. Understanding
2. Findings
3. Plan
4. Changes
5. Validation
6. Follow-up

---

# Goal

The system should evolve toward:

- stable knowledge
- predictable behavior
- safe refactoring
- reusable investigation patterns

This is not just AI-assisted coding.

This is a **knowledge-driven development system**.