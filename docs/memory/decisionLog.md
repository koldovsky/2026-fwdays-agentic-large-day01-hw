# Decision Log

## Purpose

- Capture key decisions visible in the project’s evolution via commits to `master`.
- Focus on durable product and architecture directions, not only one-off bug fixes.

## Key decisions (chronological)

## 2026-02 to 2026-03: Make arrow behavior configurable and reliable

- **Decision**: Treat arrow-binding and midpoint/snapping behavior as explicit preferences with strong correctness guarantees.
- **Why**: Arrow interactions are central to diagram UX and were a recurring source of edge-case regressions.
- **Impact**:
  - users get predictable arrow behavior with configurable preferences;
  - reduced ambiguity in binding/snap states;
  - improved trust in diagram editing precision.
- **Evidence in commits**:
  - `437595f` — feat: Arrow binding is a preference;
  - `47c2542` — disable snap-to-midpoint menu item when arrow-binding disabled;
  - `2874f9e`, `0b3a5e7`, `75789f6`, `d6f0f34`, `987173b` — arrow/midpoint correctness fixes.

## 2026-02 to 2026-03: Expand diagram language support (Mermaid/ERD/charts)

- **Decision**: Invest in richer diagram-generation/editor capabilities (Mermaid, ERD, chart breadth).
- **Why**: Excalidraw is evolving from freeform sketching into broader structured-diagram workflows.
- **Impact**:
  - stronger support for technical/architecture documentation use cases;
  - higher adoption potential in engineering-heavy contexts.
- **Evidence in commits**:
  - `c1dbbdf` — mermaid code editor & parsing improvements;
  - `816c81c` — ERD arrowheads and diagrams;
  - `c108292` — support mermaid state diagrams;
  - `60b2758` — radar chart and multi-series chart support;
  - `c9ba7f8` — bump `@excalidraw/mermaid-to-excalidraw`.

## 2026-03: Strengthen package API and integration surface

- **Decision**: Expose more library-level APIs/helpers and improve lifecycle/state hooks for host apps.
- **Why**: Integrators need stable, expressive extension points without depending on internals.
- **Impact**:
  - better embeddability and host-app control;
  - lower integration friction for advanced use cases.
- **Evidence in commits**:
  - `21dd1cf` — state tracking, API hooks, and related package work;
  - `92d2544` — expose more API around state and lifecycle;
  - `fa1f7d9` — export `throttleRAF`;
  - `a9ca16e` — export `Fonts` helper class;
  - `e73a5b0` — README docs improvements for package usage.

## 2026-03: Prioritize text editing quality as a first-class UX pillar

- **Decision**: Allocate sustained effort to text interaction fidelity (caret, wrapping, placement, editing flow).
- **Why**: Text behavior strongly influences perceived editor quality and is a high-frequency workflow.
- **Impact**:
  - fewer interruptions during editing;
  - better precision when modifying text-heavy diagrams.
- **Evidence in commits**:
  - `81ab857` — various text-related improvements;
  - `e8b4620` — caret placement at pointer coordinates;
  - `4a5c9e9` — ensure font picker names are not quoted.

## 2026-02: Improve view-mode and laser-pointer interaction model

- **Decision**: Expand non-edit interaction capabilities (laser pointing, clickable links/embeds in view mode).
- **Why**: Presentation/review sessions need lightweight interaction without full edit mode.
- **Impact**:
  - better collaboration and walkthrough UX;
  - improved read-only usage in meetings/demos.
- **Evidence in commits**:
  - `eb95912` — allow laser-pointing in view mode;
  - `4c3d037` — allow clicking links/embeds with laser tool;
  - `cae9d2b` — hand tool/view-mode state consistency fix.

## 2026-03: Tighten performance and event semantics in hot paths

- **Decision**: Refine throttling and event behavior where it affects responsiveness and correctness.
- **Why**: Editor interactions are highly latency-sensitive; subtle timing bugs cascade into UX issues.
- **Impact**:
  - smoother pointer/movement interactions;
  - fewer race-condition-like UI inconsistencies.
- **Evidence in commits**:
  - `757dfeb` — call `throttleRAF` with last args, remove trailing mode;
  - `a0e93b6` — sync export theme with UI theme (behavior consistency);
  - `2b0e4c9` — remove debug code path from editor flow.

## 2026-03: Improve keyboard/accessibility ergonomics

- **Decision**: Increase keyboard-driven control and intuitive quick actions.
- **Why**: Power users and accessibility-focused workflows depend on dependable keyboard semantics.
- **Impact**:
  - faster expert workflows;
  - clearer behavior in focused editing sessions.
- **Evidence in commits**:
  - `c09e170` — deselect on `Esc`.

## Cross-cutting evolution trend

- Decision-making has shifted from adding broad features only to balancing:
  - **capability expansion** (Mermaid/ERD/charts, API surface),
  - **interaction correctness** (arrows/snapping/text),
  - **integration maturity** (package exports/docs),
  - **operational polish** (performance semantics and view-mode UX).

## How to use this log

- For roadmap planning: prioritize items that reinforce existing decision trajectories.
- For code reviews: verify whether changes align with current direction (API stability, UX correctness, editor reliability).
- For release notes: group updates by decision themes rather than isolated bug IDs.

## Undocumented Behavior #1
- **File**: `c:/Projects/AI/2026-fwdays-agentic-large-day01-hw/packages/element/src/store.ts`
- **Behaviour**: The store behaves as an implicit three-state machine (`IMMEDIATELY` / `NEVER` / `EVENTUALLY`) with hidden precedence rules that decide capture and snapshot semantics.
- **Documented**: none
- **Risks**: {Developers may schedule incompatible actions and accidentally lose history entries, produce empty undo/redo steps, or introduce non-obvious state divergence between snapshot and rendered state.}

## Undocumented Behavior #2
- **File**: `c:/Projects/AI/2026-fwdays-agentic-large-day01-hw/packages/element/src/mutateElement.ts`
- **Behaviour**: Updating an element triggers side effects beyond field mutation: shape cache invalidation, version bump, nonce regeneration, and timestamp update.
- **Documented**: none
- **Risks**: {Callers that assume a pure update can break memoization, trigger unexpected full redraw costs, or create subtle consistency bugs in history/collaboration flows.}

## Undocumented Behavior #3
- **File**: `c:/Projects/AI/2026-fwdays-agentic-large-day01-hw/packages/excalidraw/components/App.tsx`
- **Behaviour**: Initialization correctness depends on execution order inside `componentDidUpdate`: editor initialization must happen before state observer flushing.
- **Documented**: none
- **Risks**: {Small refactors may invert this order and cause listeners to run before the API is fully initialized, resulting in race-like startup regressions.}

## Undocumented Behavior #4
- **File**: `c:/Projects/AI/2026-fwdays-agentic-large-day01-hw/packages/excalidraw/components/App.tsx`
- **Behaviour**: Mobile linear-element transform handles are conditionally disabled through a hardcoded HACK branch.
- **Documented**: none
- **Risks**: {Platform-specific editing behavior becomes inconsistent and hard to reason about, increasing QA surface and risk of interaction regressions for mobile users.}

## Undocumented Behavior #5
- **File**: `c:/Projects/AI/2026-fwdays-agentic-large-day01-hw/packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- **Behaviour**: WYSIWYG theme synchronization relies on `onChangeEmitter` because theme updates are not emitted by `Store`, creating an indirect side-effect coupling.
- **Documented**: none
- **Risks**: {Theme and editor UI can drift out of sync, and future cleanup of emitters can silently break text editor styling updates.}

## Undocumented Behavior #6
- **File**: `c:/Projects/AI/2026-fwdays-agentic-large-day01-hw/packages/excalidraw/data/restore.ts`
- **Behaviour**: Restore flow may mark empty text elements as deleted and bump versions, despite a TODO noting this can break delta sync/version semantics.
- **Documented**: none
- **Risks**: {Collaboration and incremental sync may diverge from expected deletion/version history, causing hard-to-debug data integrity issues.}

## Sources

- Master commit history: [https://github.com/excalidraw/excalidraw/commits/master/](https://github.com/excalidraw/excalidraw/commits/master/)
- Supporting context from existing Memory Bank docs:
  - `docs/memory/projectbrief.md`
  - `docs/memory/techContext.md`
  - `docs/memory/systemPatterns.md`
  - `docs/memory/productContext.md`
  - `docs/memory/activeContext.md`
  - `docs/memory/progress.md`
