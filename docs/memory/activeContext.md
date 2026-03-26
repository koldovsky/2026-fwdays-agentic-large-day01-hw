# Active Context

## Details

### Technical Docs
For architecture, APIs, setup and infrastructure:
- ../technical/architecture.md
- ../technical/api-reference.md
- ../technical/dev-setup.md
- ../technical/infrastructure.md

Use when:
- modifying system structure
- adding or integrating services
- checking setup, contracts, or dependencies

---

### Product Docs
For domain concepts, features and UX behavior:
- ../product/domain-glossary.md
- ../product/feature-catalog.md
- ../product/ux-patterns.md

Use when:
- working with business logic
- naming entities
- validating product/UX rules

---

## Current Focus (2026-03)

- **Memory Bank**
  - roles split across `docs/memory/*` (see `README.md`)
  - `techContext` → versions, tooling, commands
  - `systemPatterns` → architecture, behavior, constraints
  - removed duplicated version tables from `projectbrief.md`

- **Documentation discipline**
  - product intent → `productContext.md` + `../product/`
  - system behavior → `systemPatterns.md`
  - technical details → `../technical/`

- **Undocumented behavior extraction**
  - identifying hidden runtime contracts (state machines, timing, side effects)
  - documenting high-risk behaviors in `../technical/undocumented-behaviors.md`
  - linking summaries into `systemPatterns.md`

---

## Where to Put Updates (maintenance policy)

When investigation establishes **new shared truth** about the repo, update **docs in the same effort** (not only chat).

| Kind of change | Update |
|----------------|--------|
| Dependency versions, scripts, toolchain, env quirks | `techContext.md` and `../technical/dev-setup.md` |
| Architecture: actions, store, history, canvases, contexts | `systemPatterns.md`; update `../technical/architecture.md` if high-level story changes |
| User scenarios, UX goals, product boundaries | `productContext.md` and/or `../product/` |
| Undocumented behavior / hidden contracts | `../technical/undocumented-behaviors.md` + summary in `systemPatterns.md` |
| Reusable analysis patterns | `../technical/code-archaeology-patterns.md` |
| Current status / backlog | `progress.md` |
| Intentional behavior change | `../decisions/` (ADR) + entry in `decisionLog.md` |
| Graph-backed traces (CodeGraphContext) | `../reference/codegraphcontext.md`; fix docs if contradictions found |

**Rule**:
- exploratory work that defines system behavior → must update docs
- trivial edits → optional

---

## Active Investigation

Current high-value areas to verify and document:

- snapshot update behavior (`CaptureUpdateAction`) as implicit state machine
- clipboard/paste timing constraints (same-tick requirement)
- global caches and side effects (hit-test, bounds)
- initialization order dependencies (mount vs initialize)
- async gaps and ignored updates (e.g. image elements)

---

## Next Steps (recurring)

- verify top undocumented behavior candidates before formalizing
- promote validated findings to:
  - `../technical/undocumented-behaviors.md`
  - `systemPatterns.md`
- extract reusable patterns into:
  - `../technical/code-archaeology-patterns.md`

- regenerate or populate:
  - `../reference/openapi.yaml`
  - `../reference/graphql-schema.graphql`

- add ADRs in `../decisions/` when behavior changes
- link all decisions in `decisionLog.md`