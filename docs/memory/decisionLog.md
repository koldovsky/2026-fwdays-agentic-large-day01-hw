# Decision Log

## Purpose

This log captures key project decisions and their rationale, so future work can align with existing architecture and avoid re-litigating foundational choices.

---

## D-001: Monorepo with Yarn workspaces

### Decision

Use a Yarn workspaces monorepo with separate app, packages, and examples.

### Why

- Shared editor logic is reused across app and publishable packages.
- Consistent dependency/tooling management across all parts of the project.
- Easier coordinated refactoring across package boundaries.

### Implications

- Workspace-aware scripts and build ordering are required.
- Dependency management and CI must account for multiple package targets.

---

## D-002: Excalidraw delivered as embeddable React package

### Decision

Primary editor functionality is implemented in `@excalidraw/excalidraw` and consumed by `excalidraw-app` and external host apps.

### Why

- Supports both first-party app experience and third-party embedding.
- Keeps core editor logic decoupled from app-shell concerns.

### Implications

- Public API stability matters (exports, hooks, behavior contracts).
- App-only behavior should not leak into package internals.

---

## D-003: Central orchestrator in `components/App.tsx`

### Decision

Use a central orchestrator component that wires scene/store/renderer/history/actions and lifecycle.

### Why

- Editor behavior has high coupling between input handling, rendering, persistence, and history.
- Single orchestration point simplifies sequencing and control over side effects.

### Implications

- `App.tsx` is powerful but large; changes require careful scoping and testing.
- Feature additions should preserve existing flow boundaries.

---

## D-004: Action/command-driven mutation pipeline

### Decision

User operations are represented as actions executed by `ActionManager`, yielding normalized `ActionResult` objects.

### Why

- Unifies keyboard/UI/API behavior through one execution model.
- Makes analytics, guards, and state transition behavior easier to centralize.

### Implications

- New editing features should prefer action integration over ad-hoc mutation.
- Action output contracts (`elements`, `appState`, `files`, `captureUpdate`) should remain consistent.

---

## D-005: Hybrid state strategy

### Decision

Use multiple coordinated state channels:

- React `AppState` for UI/editor mode state,
- scene/store snapshot/delta model for element changes,
- history stacks for undo/redo,
- localized Jotai atoms for scoped editor state.

### Why

- No single state system cleanly covers all editor concerns (durability, render triggers, transient UI).
- Balances performance and maintainability.

### Implications

- Contributors must understand state ownership boundaries before modifying behavior.
- Regressions often come from crossing channels incorrectly (for example, bypassing capture semantics).

---

## D-006: Layered canvas rendering (static + interactive)

### Decision

Split rendering into static scene and interactive overlay canvases.

### Why

- Reduces expensive full-scene redraws during pointer interaction.
- Supports high-frequency interaction visuals without destabilizing base rendering.

### Implications

- Render bugs may originate from either layer or their synchronization.
- Performance tuning should consider layer responsibilities separately.

---

## D-007: Collaboration via external services

### Decision

Use `socket.io-client` and Firebase integrations rather than building a dedicated in-repo backend service.

### Why

- Keeps repository focused on editor/product layers.
- Leverages managed services for real-time and persistence concerns.

### Implications

- Local behavior can differ when external integrations are unavailable/misconfigured.
- Integration contracts must be documented and monitored.

---

## D-008: Persistence portability (local + cloud + export/import)

### Decision

Support multiple persistence targets:

- local browser storage (IndexedDB),
- cloud/database-oriented flows,
- file export/import JSON.

### Why

- Users need both reliability and portability in different contexts.
- Enables solo, collaborative, and embedded workflows.

### Implications

- App state must be filtered/normalized differently per target.
- Migration/restore and reconciliation paths are critical quality areas.

---

## D-009: Documentation-first Memory Bank setup (current phase)

### Decision

Establish and maintain `docs/memory/` as a durable context layer before deeper feature changes.

### Why

- Speeds up onboarding and reduces context loss between sessions.
- Provides a shared baseline for architecture, product intent, and operational workflow.

### Implications

- Memory docs should be updated as implementation reality evolves.
- Future sessions should treat these files as living artifacts, not one-time notes.

---

## Review cadence

- Revisit decisions when architecture-affecting changes are introduced.
- Add a new decision entry for material changes in:
  - state management ownership,
  - rendering pipeline,
  - collaboration/persistence integration strategy,
  - package/app boundaries.

---

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md


## Undocumented behaviour

## Undocumented Behavior #1
- **File**: `packages/excalidraw/components/App.tsx`
- **What**: Double-click detection relies on a mixed touch + pointer model and manual flags (`lastPointerUpIsDoubleClick`, click history), while code comment says this is a hack and not unified.
- **Where documented**: Inline TODO/HACK comment only.
- **Risk**: Refactoring one event path (touch or pointer) can silently break double-click semantics and tool behavior.

## Undocumented Behavior #2
- **File**: `packages/excalidraw/components/App.tsx`
- **What**: Text submit path uses `flushSync` to force selection state update before `finalize` action; comment states ordering dependency between state update and finalize.
- **Where documented**: Inline TODO comment near keyboard submit flow.
- **Risk**: Removing `flushSync` or reordering actions can cause wrong selected element, finalize inconsistencies, and history/capture anomalies.

## Undocumented Behavior #3
- **File**: `packages/excalidraw/components/App.tsx`
- **What**: `shouldHandleBrowserCanvasDoubleClick()` is temporary logic intended to be removed after consolidating double-click handling.
- **Where documented**: Inline TODO comment.
- **Risk**: Browser/native double-click and internal click history can diverge, producing inconsistent edit/open actions across pointer types.

## Undocumented Behavior #4
- **File**: `packages/excalidraw/components/App.tsx`
- **What**: Transform handles for linear elements are intentionally disabled on mobile as a temporary HACK.
- **Where documented**: Inline HACK comment.
- **Risk**: UX and edit capabilities differ by device/form factor; optimization or cleanup can unintentionally re-enable unstable behavior.

## Undocumented Behavior #5
- **File**: `packages/excalidraw/components/App.tsx`
- **What**: Text-container resolution path contains unresolved `// FIXME` before selecting bindable container for text editing.
- **Where documented**: Inline FIXME only.
- **Risk**: Edits around text insertion/binding can break container targeting, causing misplaced text or incorrect binding behavior.

## Undocumented Behavior #6
- **File**: `packages/excalidraw/components/App.tsx`
- **What**: State field `isResizing` currently conflates scaling and rotating; comment explicitly says it should be renamed to distinguish scaling.
- **Where documented**: Inline TODO comment.
- **Risk**: Logic that treats `isResizing` as pure resize can regress rotation/scaling side effects and cursor/handle state.

## Undocumented Behavior #7
- **File**: `packages/excalidraw/components/App.tsx`
- **What**: API object is created in constructor due to early internal API calls, but comment says it also needs recreation in mount/unmount lifecycle because unmount invalidates API in StrictMode.
- **Where documented**: Inline lifecycle comment.
- **Risk**: Changing API creation timing can break host integrations and hooks expecting valid API during specific lifecycle windows.

## Undocumented Behavior #8
- **File**: `packages/excalidraw/data/restore.ts`
- **What**: Restore path marks empty text elements as deleted when `deleteInvisibleElements` is enabled, but comment says this breaks sync/versioning because deletion is not recorded in delta exchange.
- **Where documented**: Inline TODO comment.
- **Risk**: Import/restore can produce state that diverges from collaborative delta model, leading to reconciliation/version drift.

## Undocumented Behavior #9
- **File**: `packages/element/src/store.ts`
- **What**: `scheduleCapture()` is used broadly; code comment marks this as suspicious/error-prone for durable increment scheduling.
- **Where documented**: Inline TODO comment.
- **Risk**: Incorrect capture scheduling can create unintended undo/redo entries, missed history, or noisy durable increments.

## Undocumented Behavior #10
- **File**: `packages/element/src/selection.ts`
- **What**: `isSomeElementSelected` uses closure-level cached state (`lastElements`, `lastSelectedElementIds`) and comment says it should move into editor instance for stateless utility behavior.
- **Where documented**: Inline FIXME comment.
- **Risk**: Hidden cache coupling can leak state across contexts and produce stale selection checks after lifecycle/boundary changes.

## Undocumented Behavior #11
- **File**: `packages/excalidraw/types.ts`
- **What**: `editingGroupId`, `selectedElementIds`, and `frameToHighlight` are still part of common/static canvas app-state subset with TODO saying they should move to interactive canvas if possible.
- **Where documented**: Inline TODO comments.
- **Risk**: Static/interactive render state boundary is blurred, so render optimization can accidentally break highlight/selection logic.

## Undocumented Behavior #12
- **File**: `packages/excalidraw/data/library.ts`
- **What**: On library destroy, reset of `libraryItemsAtom` is commented out with TODO noting it depends on store scoping per Excalidraw instance.
- **Where documented**: Inline TODO comment.
- **Risk**: Multi-instance or repeated mount/unmount scenarios may retain stale library UI/state data across editor instances.
