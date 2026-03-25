> Last updated: 2026-03-25 (session 4)
> Related: [activeContext.md](activeContext.md) | [decisionLog.md](decisionLog.md) | [PRD](../product/PRD.md) | [dev-setup](../technical/dev-setup.md)

## Completion snapshot

Workshop PR deliverables: PRD done, `.cursorignore` remaining. Memory Bank fully audited (3 passes). Implementation work not yet started.
Status: On track

---

## Done

**Memory Bank — core docs**
- [x] `CLAUDE.md` — commands, monorepo structure (incl. `packages/utils/`), import rules, test thresholds, Memory Bank index; `decisionLog.md` moved to reference docs list
- [x] `docs/memory/projectbrief.md` — project purpose, package hierarchy, key features
- [x] `docs/memory/techContext.md` — versions, dev commands, build system, ESLint rules, test infra
- [x] `docs/memory/systemPatterns.md` — state management layers, mutation pattern, action system, rendering pipeline (5 layers)
- [x] `docs/memory/productContext.md` — WHY/WHO/WHAT, UX intent, success signals, anti-goals, constraints
- [x] `docs/memory/activeContext.md` — session state, open questions, next steps
- [x] `docs/memory/progress.md` — this file

**Reference docs**
- [x] `docs/memory/decisionLog.md` — 17 entries (chronological): 11 architectural decisions + 6 undocumented-behavior entries (ShapeCache WeakMap keying, EVENTUALLY stale snapshot, undo version exclusion, uninitialized image delta skip, triggerUpdate nonce unconditional, Object.assign binding bypass)
- [x] `docs/technical/architecture.md` — Mermaid dependency graph, data-flow sequence diagrams, state management, rendering pipeline, package deps (304 lines)
- [x] `docs/technical/dev-setup.md` — full onboarding guide: prerequisites, env config, verification checklist, troubleshooting
- [x] `docs/product/domain-glossary.md` — 20 domain terms: Element, Scene, AppState, Tool/ActiveTool, Action/ActionResult/ActionName, Store/StoreSnapshot/StoreDelta/CaptureUpdateAction, History/Delta, Binding/BoundElement, Group/GroupId, Frame/MagicFrame, Library/LibraryItem, Collaboration/Collaborator, BinaryFiles/BinaryFileData, ShapeCache, FractionalIndex, Renderer, ViewMode/ZenMode/GridMode, EditorInterface, ExcalidrawImperativeAPI, Tunnel
- [x] `docs/technical/undocumented-behavior.md` — 14 findings across HACK/FIXME, flushSync, StrictMode, initialization order, implicit state machines, magic numbers, non-obvious side effects
- [x] `docs/product/PRD.md` — reverse-engineered PRD of Excalidraw v0.1 (In Review); 5 goals, 12 requirements (P0/P1/P2), metrics with baselines, user journeys, risks, 3-phase launch plan, 4 open questions with owners; see Q-4 for scope clarification needed

---

## In progress

- [-] Implementation work — 0% — no feature tasks started; awaiting user direction on first task.

---

## Not started

- [ ] `.cursorignore` — create in repo root (required main checklist item in `.github/PULL_REQUEST_TEMPLATE.md`)
- [ ] Workshop PR — open PR with template filled; gate: `.cursorignore` done
- [ ] First implementation task — TBD; needs user direction
- [ ] `docs/memory/progress.md` updates as implementation milestones are hit
- [ ] `docs/memory/activeContext.md` rewrite at end of each session

---

## Blocked

*(nothing blocked)*

---

## Discovered work

- [!] `yarn.lock` has an unstaged modification (`M yarn.lock` in git status, multiple sessions) — severity: **low** — investigate before adding dependencies; root cause not yet confirmed.
- [!] `frame.test.tsx` — frame element detection passes in browser, fails in jsdom, root cause unknown — severity: **medium** — do not attempt to fix without a reproducible root cause; avoid working around it silently.
- [!] `textWysiwyg.test.tsx:335` — arrow label version-bump test is non-deterministically flaky, acknowledged in code with no known cause — severity: **low** — do not mark as fixed without a reproducible root cause.
- [!] `isSomeElementSelected` in `packages/element/src/selection.ts` uses module-level memoization shared across all `Scene` instances — severity: **medium** — breaks multi-editor setups; marked as FIXME but no fix is in progress.
- [!] Theme detection in `packages/excalidraw/wysiwyg/textWysiwyg.tsx:964` uses `onChangeEmitter` watching elements instead of a dedicated Store theme emitter — severity: **low** — pending Store refactor, acknowledged with FIXME.
- [!] `UIOptions` normalization inside `Excalidraw` component (`packages/excalidraw/index.tsx:105`) defeats `React.memo` — severity: **low** — creates a new object every render; acknowledged with FIXME.
- [!] Minimum supported browser version not confirmed — severity: **low** — resolution path: check `excalidraw-app/vite.config.ts` `build.target`; tracked as Q-1 in `docs/product/PRD.md`.

---

## Milestones

- `Memory Bank setup` — **Done** — All orientation docs created, audited (3 passes), and cross-referenced; AI can onboard to this repo without verbal re-orientation.
- `PRD v0.1` — **Done** — Reverse-engineered PRD of Excalidraw created; In Review status; scope clarification (Q-4) still needed.
- `Workshop PR complete` — **Not started** — Remaining gate: `.cursorignore` created, PR opened with template filled.
- `First implementation task` — **Not started** — Scope TBD; no code changed yet.
- `Test coverage baseline` — **Not started** — Run `yarn test:all` to confirm current pass/fail state before any changes.
- `Feature implementation` — **Not started** — Depends on: first task defined, test baseline confirmed.
- `CI green` — **Not started** — All thresholds met: lines 60%, branches 70%, functions 63%, statements 60%.
