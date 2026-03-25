# Active development context (inferred from code)

## Current Focus

- **Core editor orchestration is concentrated in `packages/excalidraw/components/App.tsx`**
  - Central controller for:
    - canvas/layer composition (`LayerUI`, `StaticCanvas`, `NewElementCanvas`, `InteractiveCanvas`)
    - event listener registration for edit mode (see `addEventListener` blocks in `App.tsx`)
    - initialization + lifecycle ordering (`componentDidUpdate` emits `editor:initialize` and flushes `appStateObserver` before other side effects)
    - hosting integration via callbacks (`onInitialize`, `onChange`, `onScrollChange`, etc.)
  - Evidence of active refactoring/iteration:
    - TODO about unifying touch and pointer events + consolidating double-click logic (`lastPointerUpIsDoubleClick` comment in `App.tsx`)
    - HACK for UX on mobile: disabling transform handles for linear elements until a “better way” is found (`HACK: Disable transform handles…` in `App.tsx`)

- **Interaction lifecycle and cleanup are an active risk area**
  - `packages/excalidraw/tests/selection.test.tsx` explicitly notes a gap:
    - `// TODO: There is a memory leak if pointer up is not triggered`

- **State/update plumbing is complex and has flagged “error-prone” areas**
  - Undo/redo and update capture semantics are managed by element-layer `Store` + `History`
  - Evidence of active concern:
    - `packages/element/src/store.ts` has a TODO stating `scheduleCapture` is “suspicious” and “error-prone” because it is called from many places
    - `packages/element/src/delta.ts` has TODO `#7348` about empty undo/redo potentially still occurring due to assumptions about deleted element references (especially for remote updates)

- **Rendering pipeline is split into static vs interactive layers**
  - Static drawing: `StaticCanvas` calls `renderStaticScene(...)` from `packages/excalidraw/renderer/staticScene.ts`
  - In-progress drawing: `NewElementCanvas` calls `renderNewElementScene(...)`
  - Interactive overlays + collaboration cursors: `InteractiveCanvas` calls `renderInteractiveScene(...)` and builds render params from `appState.collaborators`

- **Feature surfaces that drive current user journeys**
  - Empty-canvas onboarding: `App.tsx` sets `showWelcomeScreen: true` when there are no elements (and `LayerUI` renders `WelcomeScreen`)
  - Export flows: export dialogs are part of `LayerUI` and export interception is supported via `ExcalidrawProps.onExport`
  - Collaboration UI: collaboration mode is tied to `isCollaborating`, and remote cursors are rendered from `appState.collaborators` in `InteractiveCanvas`
  - Text-to-Diagram / Mermaid conversion:
    - `LayerUI` renders `TTDDialog` when `appState.openDialog?.name === "ttd"`
    - `packages/excalidraw/components/TTDDialog/*` includes Mermaid conversion UI (`MermaidToExcalidraw`, `TextToDiagram`)
  - Library UI:
    - sidebar library uses `LibraryMenu` / `LibraryMenuItems` and persists via the `Library` class (`packages/excalidraw/data/library.ts`)
  - Search/command entry:
    - `CommandPalette` exists as a component and is wired through app state (e.g. `openDialog: { name: "commandPalette" }` in default items)

## Known Gaps & Risks

- **Event cleanup fragility / potential memory leaks**
  - `selection.test.tsx` TODO states a memory leak occurs if `pointer up` isn’t triggered.

- **Undo/redo correctness under remote updates**
  - `delta.ts` TODO `#7348` notes potential empty undo/redo due to assumptions about deleted element references, with a specific mention that cleanup during remote updates may differ from local history cleanup.

- **Store scheduling complexity**
  - `packages/element/src/store.ts` TODO: `scheduleCapture` is “suspicious” due to being called from many places; micro/macro scheduling invariants are enforced, but the call graph risk is flagged.

- **Restore/import may break sync/versioning invariants**
  - `packages/excalidraw/data/restore.ts` TODO:
    - marking empty text as deleted “breaks sync / versioning” when exchanging/applying deltas and restoring elements (because deletion isn’t recorded in that path).

- **Export semantics regression risk**
  - `packages/utils/tests/export.test.ts` FIXME:
    - `utils.exportToSvg` “no longer filters out deleted elements”.
    - The test is currently marked `.skip(...)`, which indicates a known failing/changed behavior.

- **Text editing WYSIWYG update coupling to theme**
  - `packages/excalidraw/wysiwyg/textWysiwyg.tsx` FIXME:
    - “after we start emitting updates from Store for appState.theme” it can change how subscriptions happen (implying current update mechanism is not the ideal source of truth).

- **UI correctness on mobile**
  - `App.tsx` HACK: transform handles for linear elements are disabled on mobile until a better approach is found.

- **Initialization order assumptions**
  - `App.tsx` `componentDidUpdate` comment explicitly says it must update before state change listeners are triggered below, and it also gates `onChange` behind `!this.state.isLoading` to avoid overriding persisted state during init.
  - This is a high coupling point: small reordering risks side effects for consumers of `onInitialize` / `onChange`.

## Next Likely Steps

- **Stabilize interaction lifecycle**
  - Address the pointer-up cleanup gap (test TODO explicitly calls out a leak scenario).

- **Reduce hacks and consolidate event-model inconsistencies**
  - Replace the mobile linear transform-handle suppression with a tested UX solution (remove HACK).
  - Unify touch and pointer event handling and consolidate double-click logic (TODO in `App.tsx`).

- **Harden update capture and undo/redo for remote scenarios**
  - Investigate and mitigate the `#7348` empty undo/redo risk in `delta.ts` under remote updates.
  - Re-evaluate `scheduleCapture` call sites (TODO in `store.ts`).

- **Fix restore/delete semantics for sync correctness**
  - Revisit `restore.ts` logic that marks empty text deleted because it breaks sync/versioning (TODO in `restore.ts`).

- **Restore export correctness**
  - Re-enable and fix the skipped `exportToSvg` test for deleted elements (currently `.skip` due to FIXME behavior).

- **Improve WYSIWYG update source**
  - Remove or simplify the WYSIWYG theme subscription workaround once Store emits appState.theme updates as expected (FIXME in `textWysiwyg.tsx`).

- **Add/enable missing test coverage for correctness regressions**
  - There are multiple TODOs in tests around enabling currently skipped coverage (e.g. selection/flip/frame-related tests), which suggests test stabilization work is part of the next cycle.

## Evidence Index

- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/tests/selection.test.tsx`
- `packages/element/src/store.ts`
- `packages/element/src/delta.ts`
- `packages/excalidraw/renderer/staticScene.ts`
- `packages/excalidraw/renderer/renderNewElementScene.ts`
- `packages/excalidraw/renderer/interactiveScene.ts`
- `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`
- `packages/excalidraw/data/restore.ts`
- `packages/utils/tests/export.test.ts`
- `packages/excalidraw/wysiwyg/textWysiwyg.tsx`

## Cross-doc Links

- For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
- For developer setup → see [docs/technical/dev-setup.md](../technical/dev-setup.md)
- For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
- For product requirements (PRD) → see [docs/product/PRD.md](../product/PRD.md)
