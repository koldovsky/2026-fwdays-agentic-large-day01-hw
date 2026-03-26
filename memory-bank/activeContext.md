# Active Context

## Current Task
Building the **memory bank** documentation for the Excalidraw codebase as part of the FWDays 2026 Agentic IDE workshop (Day 1 homework).

## Recent Changes (git log)
- **4451b1e** — Added `.coderabbit.yaml` (AI review config) and `.github/PULL_REQUEST_TEMPLATE.md`
- **da795d2** — Minor CodeRabbit config fix
- **5247322** — Initial CodeRabbit setup (235-line grading rubric)
- **a345399** — Initial commit (full Excalidraw codebase)

## Workshop Assignment Deliverables

### Required (per PR template checklist)
1. `.cursorignore` — Cursor IDE ignore patterns — **not started**
2. `docs/memory/projectbrief.md` — Project description — **not started** (exists in `memory-bank/` instead)
3. `docs/memory/techContext.md` — Tech stack and commands — **not started**
4. `docs/memory/systemPatterns.md` — Architecture and patterns — **not started**
5. `docs/technical/architecture.md` — Detailed architecture doc — **not started**
6. `docs/product/domain-glossary.md` — Domain terminology — **not started**
7. `docs/product/PRD.md` — Reverse-engineered PRD — **not started**

### Optional Bonus
- Additional memory bank files (productContext, activeContext, progress, decisionLog)
- Development setup guide
- Undocumented behavior discovery

## Current Memory Bank Status (memory-bank/ directory)
- `projectbrief.md` — **complete** (50 lines)
- `productContext.md` — **complete**
- `systemPatterns.md` — **complete**
- `techContext.md` — **complete**
- `activeContext.md` — **complete** (this file)
- `progress.md` — **complete**

## Open Questions
- Should memory bank files also be duplicated under `docs/memory/` to match the PR template checklist paths?
- Which additional docs (`architecture.md`, `domain-glossary.md`, `PRD.md`) should be tackled next?

## Known Challenges
- The codebase is large (Excalidraw monorepo) — navigating and summarizing architecture requires significant exploration.
- `App.tsx` alone is ~407KB, making it one of the largest single files to analyze.
- No TODOs/FIXMEs found in the codebase — it's a clean snapshot.
