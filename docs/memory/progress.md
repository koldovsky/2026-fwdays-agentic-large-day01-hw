# Progress

Snapshot of **documentation and workshop-style deliverables** in this repository. It does not track product roadmap—only what exists in `docs/` and related artifacts. Last meaningful doc pass: **Memory Bank bonus files** added under `docs/memory/` (see [`decisionLog.md`](./decisionLog.md) for structural choices).

## Details

Workshop checklist reference: [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md).

UX memory and scenarios → [`productContext.md`](./productContext.md). Session handoff → [`activeContext.md`](./activeContext.md). Rationale trail → [`decisionLog.md`](./decisionLog.md).

Technical architecture → [`docs/technical/architecture.md`](../technical/architecture.md). Onboarding → [`docs/technical/dev-setup.md`](../technical/dev-setup.md). Product spec → [`docs/product/PRD.md`](../product/PRD.md).

---

## Required checklist items (Day 1)

| Item | Status | Notes |
|------|--------|--------|
| `.cursorignore` at repo root | Present | Verify patterns still match large-monorepo needs when dependencies change. |
| `docs/memory/projectbrief.md` | Present | Core Memory Bank. |
| `docs/memory/techContext.md` | Present | Core Memory Bank. |
| `docs/memory/systemPatterns.md` | Present | Core Memory Bank. |
| `docs/technical/architecture.md` | Present | Includes high-level diagram, data flow, rendering, packages. |
| `docs/product/domain-glossary.md` | Present | Domain terms with code-aligned definitions. |
| `docs/product/PRD.md` | Present | Reverse-engineered PRD for library + app. |

---

## Bonus checklist items

| Item | Status | Notes |
|------|--------|--------|
| `docs/memory/productContext.md` | Present | UX goals and scenarios (this wave). |
| `docs/memory/activeContext.md` | Present | Session handoff (this wave). |
| `docs/memory/progress.md` | Present | This file. |
| `docs/memory/decisionLog.md` | Present | Key decisions log (this wave). |
| `docs/technical/dev-setup.md` | Present | Onboarding-oriented technical doc in repo. |
| 3+ undocumented behaviors documented | **Not evidenced** | Reproducible check: `rg -n -i 'undocumented behavior' docs/ --glob '*.md'` — hits [`progress.md`](./progress.md) (this row + suggested actions) and [`activeContext.md`](./activeContext.md) (workshop open question); no `docs/findings/` or `docs/technical/` note enumerating three concrete behaviors with file references. Open if grading requires that artifact. |

---

## Supporting discovery notes

| Path | Role |
|------|------|
| [`docs/findings/project-overview.md`](../findings/project-overview.md) | Scale and layout overview. |
| [`docs/findings/excalidraw-package-architecture.md`](../findings/excalidraw-package-architecture.md) | Editor package map. |
| [`docs/findings/element-package-architecture.md`](../findings/element-package-architecture.md) | Scene / element domain. |
| [`docs/findings/common-package-architecture.md`](../findings/common-package-architecture.md) | Shared constants and helpers. |
| [`docs/findings/math-package-architecture.md`](../findings/math-package-architecture.md) | Geometry layer. |

---

## Suggested next documentation actions

1. If course rubric requires **undocumented behaviors**, add a short `docs/findings/` or `docs/technical/` note listing three concrete behaviors with file references.
2. Keep **Memory Bank** files under **200 lines** each to satisfy CodeRabbit `docs/memory/*.md` guidance.
3. When upgrading dependencies, refresh [`techContext.md`](./techContext.md) and [`decisionLog.md`](./decisionLog.md) in a follow-up change (outside “additive only” tasks).
