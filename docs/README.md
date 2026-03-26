# Documentation index

**Start here.** This folder is the hub for product specs, technical notes, and the Memory Bank (living context). Cross-links between files assume you begin from one of the entry paths below.

## Where to start (pick one)

| You want to… | Open first | Then |
| --- | --- | --- |
| **Understand the repo in plain language** | [`memory/projectbrief.md`](memory/projectbrief.md) | [`technical/architecture.md`](technical/architecture.md), [`product/PRD.md`](product/PRD.md) |
| **Run and change code locally** | [`technical/dev-setup.md`](technical/dev-setup.md) | [`technical/architecture.md`](technical/architecture.md), [`memory/techContext.md`](memory/techContext.md) |
| **Learn product terms and scope** | [`product/PRD.md`](product/PRD.md) | [`product/domain-glossary.md`](product/domain-glossary.md) |
| **See “what we’re working on” style context** | [`memory/activeContext.md`](memory/activeContext.md) | [`memory/progress.md`](memory/progress.md) |

Default path for a **new contributor**: **project brief → dev setup → architecture**.

## Contents by area

### Product (`docs/product/`)

| Document | Purpose |
| --- | --- |
| [`PRD.md`](product/PRD.md) | Requirements, scope, behavior-oriented product definition |
| [`domain-glossary.md`](product/domain-glossary.md) | Domain vocabulary aligned with code (Scene, AppState, …) |

### Technical (`docs/technical/`)

| Document | Purpose |
| --- | --- |
| [`architecture.md`](technical/architecture.md) | Layers, data flow, state, packages |
| [`dev-setup.md`](technical/dev-setup.md) | Install, run, scripts, CI, Docker |
| [`decisionLog.md`](technical/decisionLog.md) | Fragile behavior, FIXME/HACK/TODO-style notes from code |

### Memory Bank (`docs/memory/`)

Curated, cross-linked context (not a wiki—stable narrative plus pointers into `docs/product/` and `docs/technical/`).

| Document | Purpose |
| --- | --- |
| [`projectbrief.md`](memory/projectbrief.md) | What the monorepo is, goals, non-goals, success criteria |
| [`productContext.md`](memory/productContext.md) | Product-oriented narrative and links |
| [`techContext.md`](memory/techContext.md) | Stack, tooling, build/deploy notes |
| [`systemPatterns.md`](memory/systemPatterns.md) | Recurring structural patterns |
| [`activeContext.md`](memory/activeContext.md) | Current focus, hotspots, recent signals |
| [`progress.md`](memory/progress.md) | What works, what’s open, known gaps |
| [`decisionLog.md`](memory/decisionLog.md) | Product/engineering decisions (Memory Bank view) |

## Two decision logs

- **[`technical/decisionLog.md`](technical/decisionLog.md)** — code-adjacent fragility and markers.
- **[`memory/decisionLog.md`](memory/decisionLog.md)** — higher-level decisions; links to technical log where useful.

---

_Open this file from the repo: `docs/README.md`._
