# Active Context

## Current Focus Areas (as of codebase inspection)

### 1. CRDT History and Collaboration Synchronization

The largest test file in the suite is `history.test.tsx` (5,231 lines, 63 tests), with a dedicated `"multiplayer undo/redo"` section. The presence of `StoreDelta`, `ElementsDelta`, `AppStateDelta`, `CaptureUpdateAction`, and the `DurableIncrement`/`EphemeralIncrement` split suggests active investment in making undo/redo conflict-free across collaborative sessions. See the [Store and History deep-dive in the Technical Architecture](../technical/architecture.md) for the full state-container model.

**Key files**: `packages/excalidraw/store.ts`, `packages/excalidraw/history.ts`, `packages/element/src/delta.ts`, `excalidraw-app/tests/collab.test.tsx`

### 2. Elbow Arrow Routing

`packages/element/src/elbowArrow.ts` implements A\* pathfinding on a dynamically constructed sparse grid, with `fixedSegments`, heading-based exit routing, and a segment renormalization pass. The complexity and scope of this file indicates a recently completed or still-evolving feature. The `handleSegmentRenormalization()` function merges collinear segments and updates `fixedSegments` indices — a non-trivial piece of work.

**Key files**: `packages/element/src/elbowArrow.ts`, `packages/element/src/binding.ts`, `packages/element/src/heading.ts`

### 3. Image Cropping

`AppState` has dedicated fields: `isCropping: boolean`, `croppingElementId: string | null`. The `ImageCrop` field on `ExcalidrawImageElement` enables non-destructive cropping. A dedicated action `actionCropEditor.tsx` exists in `packages/excalidraw/actions/`.

**Key files**: `packages/element/src/cropElement.ts`, `packages/excalidraw/actions/actionCropEditor.tsx`, `packages/element/src/types.ts` (`ImageCrop`)

### 4. AI / Text-to-Diagram (TTD)

`TTDDialog`, `TTDDialogTrigger`, `TTDStreamFetch`, and `DiagramToCodePlugin` are exported from the library. `excalidraw-app` has `AIComponents` and a `MagicFrame` element type. `TTDStorage.ts` (app-level) persists TTD chat to IndexedDB. The `aiEnabled` prop on `ExcalidrawProps` controls visibility. This is an active area based on the component surface. See [PRD §4.6](../product/PRD.md) for the product scenario and [PRD §5.10](../product/PRD.md) for the TTD feature specification.

**Key files**: `packages/excalidraw/components/TTDDialog/`, `excalidraw-app/components/AIComponents.tsx`, `excalidraw-app/data/TTDStorage.ts`, `packages/excalidraw/types.ts` (`aiEnabled` prop)

### 5. Frame-Based Export and Organization

`ExcalidrawFrameElement` and `ExcalidrawMagicFrameElement` are first-class element types. Frames clip their contents during rendering (using `context.clip()`), have names, and act as export boundaries. `actionFrame.ts` handles frame-specific actions. `MagicFrame` (used with AI features) is a separate type.

**Key files**: `packages/element/src/frame.ts`, `packages/excalidraw/actions/actionFrame.ts`, `packages/excalidraw/renderer/staticScene.ts` (frame clipping logic)

### 6. Fine-Grained AppState Subscription API

`AppStateObserver.ts` was added to support `onStateChange(selector, cb)` in the imperative API and the `useExcalidrawStateValue()` hook. This allows host-app components to subscribe to a specific subset of AppState without causing full re-renders — a performance-oriented embedding feature.

**Key files**: `packages/excalidraw/AppStateObserver.ts`, `packages/excalidraw/types.ts` (`ExcalidrawImperativeAPI.onStateChange`), `packages/excalidraw/index.tsx` (`useExcalidrawStateValue`, `useOnExcalidrawStateChange`)

---

## Recently Emphasized Code Areas (Inference)

_Inferred from code organization complexity, test density, and feature flags present in types._

- **`packages/element/src/elbowArrow.ts`**: Very high complexity (A\*, heading system, fixedSegments management). Likely added in a recent major version.
- **`packages/excalidraw/components/App.tsx`** (12,800 lines): The sheer size and the breadth of `AppState` (~200 fields) suggest ongoing feature additions without structural refactoring.
- **`excalidraw-app/collab/Collab.tsx`** (1,049 lines): The `UserVisibleSceneBounds` follow-mode messages and the `IDLE_STATUS` system appear to be additions layered on top of the core socket infrastructure.
- **`packages/excalidraw/data/` `encode.ts`** / **`encryption.ts`**: These are used in both sharing and collaboration flows — changes here could affect both features simultaneously.

---

## Hotspots for New Contributors

| File/Directory | Why |
| --- | --- |
| `packages/excalidraw/components/App.tsx` | Central editor class; any new editor feature likely touches this. Very large (12,800 lines). |
| `packages/element/src/types.ts` | Adding a new element type requires changes here first (all typing flows from this). |
| `packages/element/src/renderElement.ts` + `shape.ts` | Rendering and shape generation for any element type change. |
| `excalidraw-app/collab/Collab.tsx` | Any collaboration feature change — socket messages, sync strategy, follow-mode. |
| `excalidraw-app/data/firebase.ts` | Persistence for collaborative sessions — transaction logic, encryption, file storage. |
| `packages/excalidraw/actions/actionProperties.tsx` | The largest action file; handles all style property changes. Style-related bugs or additions likely start here. |
| `packages/element/src/elbowArrow.ts` | Arrow routing; geometrically complex. PRs touching arrows frequently also touch this file. |
| `packages/excalidraw/data/reconcile.ts` | Collaboration merge logic; subtle bugs here can cause data loss. |
| `packages/excalidraw/history.ts` + `store.ts` | Undo/redo stack and CRDT increments; heavily tested but complex interaction with collaboration. |

---

## Related Docs

- [Technical Architecture](../technical/architecture.md) — CRDT delta system (Store, History, DurableIncrement), rendering pipeline, collaboration data flow
- [Product Requirements (PRD)](../product/PRD.md) — AI/TTD scenario (§4.6, §5.10), elbow arrow requirement (FR-6), frame export (§5.1)
- [Progress](./progress.md) — implementation status of the features currently in focus

## Source Evidence

- `packages/excalidraw/tests/history.test.tsx` — 63 tests including multiplayer section
- `excalidraw-app/tests/collab.test.tsx` — force-delete undo/redo tests
- `packages/element/src/elbowArrow.ts` — A\* routing implementation
- `packages/element/src/types.ts` — `isCropping`, `croppingElementId`, `ImageCrop`, `MagicFrameElement`, `aiEnabled`
- `packages/excalidraw/index.tsx` — `TTDDialog`, `TTDDialogTrigger`, `DiagramToCodePlugin` exports
- `packages/excalidraw/AppStateObserver.ts` (referenced in `types.ts` and `index.tsx`)
- `packages/excalidraw/components/App.tsx` — `AppState` interface size, `EditorLifecycleEvents`, `appStateObserver` instance variable
- `excalidraw-app/data/TTDStorage.ts` — TTD chat persistence
- `packages/excalidraw/actions/actionCropEditor.tsx` — crop editor action
