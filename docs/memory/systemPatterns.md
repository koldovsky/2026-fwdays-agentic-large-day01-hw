# System Patterns

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

Verified against `packages/excalidraw/components/App.tsx`, `packages/excalidraw/actions/types.ts`, and `packages/element/src/store.ts`.

---

## Orchestrator (`App` class)

- **Location**: `packages/excalidraw/components/App.tsx` — central **class component** coordinating editor lifecycle, scene, undo/redo, pointer/keyboard routing, and public API.
- **Responsibilities**: holds **React state** (`AppState`), **scene** (`Scene` — elements + non-React scene concerns), **Store** / **History**, **ActionManager**, renderer and font subsystems, and exposes **context** + **imperative API** (`ExcalidrawAPI`).

---

## Action → result pipeline

- **Action contract** (`packages/excalidraw/actions/types.ts`): an action returns `ActionResult` = `{ elements?, appState?, files?, captureUpdate, ... } | false`.
- **ActionManager** dispatches actions; **`syncActionResult`** in `App.tsx` (wrapped in **`withBatchedUpdates`**) applies results: updates scene elements, merges `appState`, handles files, and forwards **`captureUpdate`** to the **Store** (`store.scheduleAction` / increment pipeline).
- **Comments in code** (`App.tsx` ~4540+): `CaptureUpdateAction.IMMEDIATELY` = undoable now; `NEVER` = remote/init; `EVENTUALLY` = batched into a later increment.

---

## Store & undo/redo

- **`CaptureUpdateAction`** is an exported object in `packages/element/src/store.ts` (alongside the **`Store`** class; values `IMMEDIATELY` | `EVENTUALLY` | `NEVER`). `Store` consumes it when scheduling captures.
- **Store** schedules capture kinds and emits **increments** consumed by **History** for undo/redo (`history.record` subscribed from durable increments in `App` mount path — see `componentDidMount` in `App.tsx`).
- **`store.commit`** runs after updates so store view matches scene + `AppState` (`componentDidUpdate` in `App.tsx`).

---

## Two layers of state

- **`this.state` (`AppState`)**: UI + editor flags (tool, selection, dialogs, theme, zoom, …).
- **`this.scene`**: authoritative **element graph** and scene-level structures; not everything maps 1:1 to React state — actions often return new `elements` applied to the scene.

---

## Rendering: layered canvases

- **StaticCanvas** — base scene draw.
- **NewElementCanvas** — in-progress creation / transient draw.
- **InteractiveCanvas** — selection handles, hover, interaction overlays.
- Shell UI: **LayerUI** and feature areas (menus, dialogs, stats, command palette, TTD, …).

---

## React context surface (`App.tsx`)

Contexts include (non-exhaustive): **ExcalidrawElementsContext**, **ExcalidrawAppStateContext**, **ExcalidrawSetAppStateContext**, **ExcalidrawActionManagerContext**, **ExcalidrawAPIContext**, **ExcalidrawAPISetContext**, **ExcalidrawContainerContext** — used to avoid prop drilling for hooks and child components.

---

## Supplemental UI state (Jotai)

- **`editor-jotai.ts`**: isolated Jotai store for **narrow UI atoms** (not the core scene pipeline); `jotai` / `jotai-scope` appear in `packages/excalidraw/package.json`.

---

## Domain modules (library package)

- **`actions/`** — user intents, keybindings, context menu.
- **`data/`** — load/save, serialization, library, restore/reconcile.
- **`scene/`** — visibility, export prep, scrollbars.
- **`renderer/`** — static vs interactive rendering passes.

---

## Public API entry

- **`packages/excalidraw/index.tsx`** exports `<Excalidraw />`, hooks, and utilities; types in **`packages/excalidraw/types.ts`**.

---

## Related (avoid duplicating)

- **User scenarios & UX goals** — [`productContext.md`](productContext.md).
- **Layered UI / command UX (product-facing)** — [`../product/ux-patterns.md`](../product/ux-patterns.md).
- **Versions & commands** — [`techContext.md`](techContext.md).

---

## Undocumented Behaviors

### Capture snapshot update state machine

- **Location**:
  - `packages/element/src/store.ts`
  - integration in `packages/excalidraw/components/App.tsx`
- **Verified behavior**:
  - `IMMEDIATELY` emits a durable increment and advances the snapshot.
  - `NEVER` emits an ephemeral increment and still advances the snapshot.
  - `EVENTUALLY` emits an ephemeral increment and intentionally does not advance the snapshot.
  - macro scheduling has precedence `IMMEDIATELY > NEVER > EVENTUALLY`.
  - `updateScene()` uses micro scheduling against live scene/state, which is semantically different from macro scheduling.
  - deleted elements may remain in the snapshot because history and diff fallback depend on the preserved baseline.
- **Evidence**:
  - `packages/element/src/store.ts` implements different emit/update policies per action and hash dedupe for stale-baseline `EVENTUALLY`.
  - `packages/excalidraw/history.ts` uses the local snapshot as fallback when applying history deltas.
  - `excalidraw-app/tests/collab.test.tsx` verifies that deleted elements remain in snapshot for correct diff calculation.
- **Risk**:
  - simplifying this into direct updates, boolean capture flags, or unified scheduling can break history, collaboration diffing, and repeated-commit behavior.
- **Safe refactor boundary**:
  - it is safe to extract explicit helpers, comments, and tests.
  - it is not safe to change snapshot-advance rules, precedence, stale-baseline dedupe, or micro-vs-macro comparison semantics without intentional behavioral design.
- **Follow-up opportunities**:
  - add targeted tests for precedence and snapshot-advance policy.
  - extract an explicit internal semantics table before broader refactoring.
- **Related details**: `../technical/undocumented-behaviors.md#capture-snapshot-update-state-machine`

### Clipboard paste timing constraint

- **Location**:
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/components/textWysiwyg.tsx`
- **Behavior**: paste handling must happen in the same browser frame/tick; delayed execution may cause clipboard data loss.
- **Why it matters**: this is a browser/runtime constraint, not visible in normal API or type contracts.
- **Refactoring risk**: async refactoring or deferred handlers may silently break paste behavior.
- **Related details**: `../technical/undocumented-behaviors.md#clipboard-paste-timing-constraint`

---

## Guidance

When changing lifecycle, event flow, synchronization, caching, or update timing:

- check undocumented behaviors first
- avoid simplifying logic without tracing runtime effects
- preserve ordering and timing assumptions
- treat browser/event timing constraints as behavioral contracts
- load technical details before refactoring fragile paths
