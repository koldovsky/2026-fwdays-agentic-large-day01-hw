# Memory Bank

Structured, long-lived context for humans and AI assistants (core files + decision log).

---

## Files

| File | Role |
|------|------|
| [`projectbrief.md`](./projectbrief.md) | What the repo is, layout, goals, embed constraints |
| [`productContext.md`](./productContext.md) | Product problems, positioning, audiences, UX principles (source-backed) |
| [`systemPatterns.md`](./systemPatterns.md) | Architecture, builds, dev vs publish, patterns |
| [`techContext.md`](./techContext.md) | Stack, versions, commands |
| [`activeContext.md`](./activeContext.md) | **Current** focus — update often |
| [`progress.md`](./progress.md) | Milestones / backlog for docs and optional follow-ups |
| [`decisionLog.md`](./decisionLog.md) | **Append-only** log of significant decisions (context, alternatives, consequences) |

---

## Extended documentation

These files live outside the Memory Bank and provide deeper detail. Load them via `@file` when needed.

| Document | Path | Scope |
|----------|------|-------|
| Architecture | [`docs/technical/architecture.md`](../technical/architecture.md) | High-level diagrams, data flow, state management, rendering pipeline, package dependencies |
| Domain glossary | [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Codebase-specific term definitions (Element, Scene, AppState, Action, Store, …) |
| Dev setup | [`docs/technical/dev-setup.md`](../technical/dev-setup.md) | Onboarding: clone → install → dev server → tests → lint → first PR |
| PRD | [`docs/product/PRD.md`](../product/PRD.md) | Reverse-engineered product requirements: tools, elements, collab, I/O, PWA, API |

---

## Overlap (how to use them)

- **brief** = scope and structure; **productContext** = why/for whom; **techContext** = how we build; **systemPatterns** = where code fits.
- **activeContext** = now; **progress** = arc and checklist; **decisionLog** = *why we chose* X over Y (durable history).

---

## Maintenance

- Refresh **`activeContext.md`** when tasks or branches change.
- After major technical shifts, update **`techContext.md`** / **`systemPatterns.md`**, and add a **`decisionLog.md`** entry when the choice is non-obvious.
- Keep factual claims **verifiable** from the repo (see `Source verification` sections in each file).

---

## Optional follow-ups

- Link this folder from **`README.md`** (repo root) or **Cursor rules** if you want faster discovery.
