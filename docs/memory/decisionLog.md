# Decision Log: Excalidraw

## Architectural Decisions

### AD-1: Monorepo with Yarn Workspaces
**Decision**: Use a monorepo structure with Yarn Classic (v1) workspaces.
**Rationale**: Enables shared TypeScript config, consistent tooling, and atomic cross-package changes while publishing packages independently to npm.
**Trade-offs**: Yarn Classic lacks some modern features (PnP, workspaces protocol), but provides stability and wide ecosystem compatibility.

### AD-2: Jotai for State Management
**Decision**: Use Jotai (atomic state management) instead of Redux or Zustand.
**Rationale**: Atomic state model aligns well with Excalidraw's element-centric architecture. Individual atoms can be subscribed to independently, reducing unnecessary re-renders.
**Trade-offs**: Less tooling/devtools compared to Redux, but simpler mental model.

### AD-3: Canvas 2D + RoughJS for Rendering
**Decision**: Render all elements on HTML5 Canvas using RoughJS for hand-drawn aesthetic.
**Rationale**: Canvas provides superior performance for large numbers of elements compared to SVG/DOM. RoughJS creates the signature sketch-like look.
**Trade-offs**: No DOM accessibility for drawn content; custom hit-testing required.

### AD-4: Version + Nonce Conflict Resolution
**Decision**: Use element `version` number + `versionNonce` for deterministic conflict resolution in collaboration.
**Rationale**: Avoids the need for a centralized authority or CRDTs. Simple, predictable, and works offline.
**Trade-offs**: In rare simultaneous edits, the "lower nonce wins" — arbitrary but consistent.

### AD-5: Soft Delete with 24h TTL
**Decision**: Deleted elements are soft-deleted (`isDeleted: true`) and retained for 24 hours.
**Rationale**: Allows collaboration sync to propagate deletions to offline users. Without retention, reconnecting users would "resurrect" deleted elements.
**Trade-offs**: Increases sync payload size; requires periodic cleanup.

---

## Undocumented Behaviors

### UB-1: Collaboration Conflict Resolution Uses versionNonce Tiebreaker

**File**: `packages/excalidraw/data/reconcile.ts` (lines 23-44)

**What the code does**: When two users edit the same element simultaneously and both reach the same `version` number, the conflict is resolved by comparing `versionNonce` values. The element with the **lower or equal** `versionNonce` wins. Additionally, elements currently being edited locally (text editing, resizing, or creation mode) **always override remote changes** regardless of version numbers (lines 31-33).

**What's documented**: The reconciliation function exists but the tiebreaker logic and the "active editing always wins" behavior are not documented anywhere — neither in code comments nor external docs.

### UB-2: Auto-Save Silently Pauses During Collaboration and Tab Hidden

**File**: `excalidraw-app/data/LocalData.ts` (lines 118-165)

**What the code does**: LocalStorage auto-save is debounced by 300ms. When collaboration mode starts, local save is **paused** via `LocalData.pauseSave("collaboration")`. When `document.hidden` is true (tab not visible), saves are also paused. On tab blur, a `flushSave()` fires immediately to ensure data is persisted before the tab potentially closes. This creates a complex state machine: `active → paused(collab) → paused(hidden) → flushed(blur)`.

**What's documented**: The auto-save feature is mentioned in the UI, but the pause/resume behavior tied to collaboration state and tab visibility is completely internal with no user-facing documentation or code comments explaining the state machine.

### UB-3: Deleted Elements and Unused Images Auto-Purge After 24 Hours

**Files**:
- `excalidraw-app/app_constants.ts` (line 9): `DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000`
- `packages/excalidraw/data/index.ts` (lines 46-56): syncable element filtering
- `excalidraw-app/data/LocalData.ts` (lines 54-70): image cleanup

**What the code does**:
1. Deleted elements are filtered out of collaboration sync after 24 hours, meaning they permanently disappear from the shared state.
2. Images stored in IndexedDB track a `lastRetrieved` timestamp (updated on every access, not just creation). Images not accessed for 24 hours are **silently deleted** from local storage.
3. "Invisibly small" elements (near-zero dimensions) are also filtered from sync without notification.

**What's documented**: No user-facing documentation mentions the 24-hour cleanup window. Users collaborating offline for >24 hours may find deleted elements re-appear or images missing.

### UB-4: Grid Lines Silently Disappear at Low Zoom Levels

**File**: `packages/excalidraw/renderer/staticScene.ts` (lines 69-93)

**What the code does**: Grid lines are not rendered if the computed grid size on screen would be less than 10 pixels. This means when zooming out significantly, the grid **silently disappears** without any visual indicator. Additionally, crisp 1px grid lines (via 0.5px offset) only apply at exactly 100% zoom.

**What's documented**: Grid mode is documented as a toggle (on/off), but the zoom-dependent visibility threshold is not mentioned in any UI tooltip or documentation.

### UB-5: Snap Distance Is Zoom-Aware but Rotated Elements Don't Snap During Resize

**File**: `packages/excalidraw/snapping.ts` (lines 41, 1122)

**What the code does**: The snap distance threshold is 8 pixels, adjusted for zoom level. However, when resizing a single element that has been **rotated** (angle ≠ 0), snapping is completely disabled. The check `areRoughlyEqual(selectedElements[0].angle, 0)` with hardcoded 0.01 precision silently prevents snap behavior. Users rotating then resizing an element will notice snapping stops working with no feedback.

**What's documented**: Snapping is documented as a general feature, but the rotation exclusion is not mentioned anywhere.

### UB-6: Editor Initialization Depends on `isLoading` Transition Order

**Files**:
- `packages/excalidraw/components/App.tsx` (lines 2860-2979): `initializeScene()`
- `packages/excalidraw/components/App.tsx` (lines 3130-3147): mount flow
- `packages/excalidraw/components/App.tsx` (lines 3358-3364): `editor:initialize`

**What the code does**: The public lifecycle is effectively a multi-step state machine. On mount, the editor emits `editor:mount` immediately, but `editor:initialize` is emitted later only after `initializeScene()` finishes, `isLoading` becomes `false`, and `componentDidUpdate()` runs. The code comment explicitly requires this to happen before state change listeners flush. Consumers therefore depend on a specific ordering of DOM measurement, scene restoration, state update, and event emission.

**What's documented**: The existence of lifecycle events is visible from the API surface, but the ordering dependency between `editor:mount`, `initializeScene()`, `isLoading`, and `editor:initialize` is not documented.

### UB-7: Image Insertion Uses Placeholder Elements and Late In-Place Repair

**Files**:
- `packages/excalidraw/components/App.tsx` (lines 11448-11588): `initializeImage()`
- `packages/excalidraw/components/App.tsx` (lines 11776-11830): `insertImages()`
- `packages/element/src/store.ts` (lines 938-942): uninitialized image updates ignored

**What the code does**: Image insertion is not a single atomic update. The editor first inserts placeholder image elements into the scene, then asynchronously generates file IDs, populates file storage, updates image cache, re-fetches the latest placeholder from the scene, and finally mutates dimensions based on the loaded image. In parallel, the store intentionally ignores updates for uninitialized image elements. This is a hidden protocol between scene state, file cache, and store diffing.

**What's documented**: Image support is documented as a feature, but the placeholder lifecycle, ignored store updates, and late replacement/repair behavior are not described anywhere.

### UB-8: Collaboration Socket Broadcasts Are Gated by a Hidden Initialization Flag

**Files**:
- `excalidraw-app/collab/Portal.tsx` (lines 25-28, 76-101)
- `excalidraw-app/collab/Collab.tsx` (lines 708-752, 778-784)

**What the code does**: Collaboration readiness is controlled by `socketInitialized`, separate from whether a socket object, room ID, and room key already exist. `initializeRoom()` may reset the local scene, try Firebase bootstrap, and only in `finally` mark the socket as initialized. Until then, `_broadcastSocketData()` silently refuses to send anything because `Portal.isOpen()` stays false. The same flow also relies on setting the last received scene version before scene update so remote data is not immediately re-broadcast.

**What's documented**: Collaboration is documented at a feature level, but the hidden init gate and ordering-sensitive anti-echo behavior are not documented.

### UB-9: Binding Cleanup During Erase Uses Raw Mutations That Bypass Normal Pipelines

**File**: `packages/excalidraw/components/App.tsx` (lines 11394-11445)

**What the code does**: During erase/delete flows, the editor directly calls `mutateElement()` on related arrows and bindable elements to remove bindings, with comments stating this intentionally avoids history entries and multiplayer updates. Only afterwards does it mark elements deleted and schedule a capture. As a result, binding consistency depends on side effects that bypass the normal update pipeline.

**What's documented**: Element deletion and bindings are documented independently, but this side-effect-heavy cleanup path is not documented.

### UB-10: StrictMode and Host/Fallback Rendering Depend on Internal Render Guards

**Files**:
- `packages/excalidraw/components/hoc/withInternalFallback.tsx` (lines 22-68)
- `packages/excalidraw/components/Popover.tsx` (lines 98-108)

**What the code does**: Some UI correctness depends on internal render-order guards rather than declarative state. `withInternalFallback()` tracks a local counter and `preferHost` flag to prevent host and fallback versions from rendering at the same time. `Popover` has a StrictMode-specific guard to avoid double repositioning for the same coordinates. Both are implicit state machines driven by React mount/effect timing.

**What's documented**: These rendering constraints are only hinted at in code comments and are absent from architecture or contributor docs.

## Related Documentation

- [System Patterns](systemPatterns.md)
- [Active Context](activeContext.md)
- [Progress](progress.md)
- [Architecture](../technical/architecture.md)
- [Development Setup](../technical/dev-setup.md)
- [Product Requirements](../product/PRD.md)
- [Domain Glossary](../product/domain-glossary.md)
