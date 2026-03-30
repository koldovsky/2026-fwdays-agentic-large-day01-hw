# Decision log

**Purpose:** Append-only record of **significant** technical and product decisions (what was chosen, why, what was rejected, and consequences). This complements **`systemPatterns.md`** (current architecture snapshot) and **`progress.md`** (milestones).

**When to add an entry:** After choices that affect structure, stack, workflows, or integrations — not every small commit.

**Format:** Copy the template below for each new decision (newest entries at the **top**).

---

## Template (copy for new entries)

```markdown
## [Short title] — YYYY-MM-DD

### Context
What problem or question triggered this?

### Decision
What we chose.

### Alternatives considered
- Option A — why not
- Option B — why not

### Consequences
- Expected impact, follow-up work, or risks.
```

---

## Memory Bank layout under `docs/memory/` — 2026-03-27

### Context

The team wanted persistent, structured context for humans and AI assistants without overloading a single README. Community patterns (e.g. Memory Bank) define multiple files (`projectbrief`, `productContext`, `techContext`, `systemPatterns`, `activeContext`, `progress`).

### Decision

Maintain the Memory Bank in **`docs/memory/`** with those core files, **English** only, structured sections, and claims **verified** against the repository where factual. Add **`decisionLog.md`** (this file) for ADR-style decisions, aligned with common Memory Bank MCP specs (e.g. `log_decision` fields: context, decision, alternatives, consequences).

### Alternatives considered

- **Single `README.md` only** — rejected: too little structure for large-context tooling.
- **Rely on upstream Excalidraw docs only** — rejected: this fork still needs local monorepo and workflow context.
- **Skip `decisionLog.md`** — rejected: architectural choices were already split across `systemPatterns.md`; a separate log improves traceability of *when* and *why* we chose something.

### Consequences

- Contributors update **`activeContext.md`** for session focus; **`decisionLog.md`** for durable decisions worth revisiting in reviews or onboarding.
- **`systemPatterns.md`** remains the “as-built” picture; this file is the **history of choices**.

---

*Newest decisions first. Older entries stay below.*
