# Domain Glossary

> Verified from source: `packages/element/src/types.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/common/src/constants.ts`, `packages/element/src/store.ts`, `packages/excalidraw/data/reconcile.ts`, `packages/excalidraw/history.ts`

## Related Docs
- [PRD — product features these terms describe](PRD.md)
- [System Patterns — architecture context](../memory/systemPatterns.md)
- [Architecture — technical implementation](../technical/architecture.md)

---

## Element Appearance

| Term | Type / Location | Meaning |
|------|-----------------|---------|
| **FillStyle** | `element/src/types.ts:19` | `"hachure" \| "cross-hatch" \| "solid" \| "zigzag"` — fill pattern inside a shape |
| **StrokeStyle** | `element/src/types.ts:28` | `"solid" \| "dashed" \| "dotted"` — border pattern |
| **StrokeRoundness** | `element/src/types.ts:26` | `"round" \| "sharp"` — corner style for strokes |
| **ROUGHNESS** | `common/src/constants.ts` | `architect: 0`, `artist: 1`, `cartoonist: 2` — intensity of hand-drawn distortion via Rough.js |
| **ROUNDNESS** | `common/src/constants.ts` | `LEGACY=1`, `PROPORTIONAL_RADIUS=2`, `ADAPTIVE_RADIUS=3` — algorithm used to compute element corner radius |
| **RoundnessType** | `element/src/types.ts:27` | Integer enum mapped to ROUNDNESS constants above |
| **currentItem\*** | `appState.ts:30–43` | AppState fields like `currentItemBackgroundColor`, `currentItemFillStyle` — style applied to the next new element drawn |

---

## Drawing Tools

**`TOOL_TYPE`** (`common/src/constants.ts`) — all valid tool values:

| Value | Description |
|-------|-------------|
| `selection` | Click/drag to select and move elements |
| `lasso` | Free-form selection area |
| `rectangle` / `diamond` / `ellipse` | Shape tools |
| `arrow` | Directional connector (3 sub-types: sharp, round, elbow) |
| `line` | Straight/curved line, can close into polygon |
| `freedraw` | Freehand pen |
| `text` | Text label, can bind to container |
| `image` | Raster image with crop/scale |
| `eraser` | Remove elements |
| `hand` | Pan canvas (no draw) |
| `frame` | Named container group |
| `magicframe` | AI wireframe-to-code (Excalidraw+) |
| `embeddable` | YouTube, Figma, custom iframes |
| `laser` | Presentation pointer — visible to collaborators, not persisted |

**`ARROW_TYPE`** (`common/src/constants.ts`): `sharp`, `round`, `elbow` — visual style of arrow lines.

---

## Element Structure

| Term | Type / Location | Meaning |
|------|-----------------|---------|
| **ExcalidrawElement** | `element/src/types.ts` | Base type for all canvas objects. Fields: `id`, `x`, `y`, `width`, `height`, `angle`, `version`, `versionNonce`, `index`, `isDeleted`, `groupIds`, `frameId`, `boundElements` |
| **NonDeletedExcalidrawElement** | `element/src/types.ts` | Helper: `ExcalidrawElement & { isDeleted: false }` |
| **OrderedExcalidrawElement** | `element/src/types.ts:227` | `ExcalidrawElement & { index: FractionalIndex }` — element with explicit ordering position |
| **FractionalIndex** | `element/src/types.ts:33` | Branded string. Uses the `fractional-indexing` algorithm to allow inserting elements between any two others without renumbering — critical for multiplayer consistency |
| **SceneElementsMap** | `element/src/types.ts:420` | `Map<id, OrderedExcalidrawElement>` branded type — **all** elements in scene including deleted |
| **NonDeletedSceneElementsMap** | `element/src/types.ts:430` | `Map<id, NonDeletedExcalidrawElement>` — only live elements |
| **BinaryFileData** | `excalidraw/types.ts:113` | `{ mimeType, id, dataURL, created, lastRetrieved, version }` — image data attached to an element |
| **BinaryFiles** | `excalidraw/types.ts:141` | `Record<element_id, BinaryFileData>` — all images in the scene |
| **DataURL** | `excalidraw/types.ts:111` | Branded string — base64-encoded image (`data:image/png;base64,...`) |

---

## Element Binding (Arrows ↔ Shapes)

| Term | Type / Location | Meaning |
|------|-----------------|---------|
| **boundElements** | `element/src/types.ts:76` | `Array<{ id, type }>` on a shape — lists arrows and text bound to it |
| **BoundElement** | `element/src/types.ts:35` | `{ id: string, type: "arrow" \| "text" }` — reference from shape to its bound element |
| **ExcalidrawBindableElement** | `element/src/types.ts:259` | Union of shapes that arrows can bind to: rectangle, diamond, ellipse, image, iframe, embeddable, frame, magicframe, uncontained text |
| **FixedPointBinding** | `element/src/types.ts:284` | `{ elementId, fixedPoint: [0–1, 0–1], mode: BindMode }` — where exactly on a shape an arrow endpoint is attached |
| **startBinding / endBinding** | `element/src/types.ts:337–338` | `FixedPointBinding \| null` — where arrow's start/end connects to a shape |
| **BindMode** | `element/src/types.ts:282` | `"orbit"` (default — arrow stays outside), `"inside"` (arrow connects to fixed point inside shape), `"skip"` (bypass binding) |
| **isBindingElement()** | `element/src/typeChecks.ts:160` | Returns true if element is an arrow that can bind to shapes |
| **isBindableElement()** | `element/src/typeChecks.ts:177` | Returns true if element can receive bindings (shapes + uncontained text) |

---

## Versioning & Collaboration

| Term | Type / Location | Meaning |
|------|-----------------|---------|
| **version** | `element/src/types.ts:60` | Integer incremented on every `mutateElement()` call. Used to determine which client has the newer copy of an element during collab sync |
| **versionNonce** | `element/src/types.ts:64` | Random integer regenerated on every change. **Tiebreaker** when two clients have identical `version` — the element with the **lower** nonce wins. Never use directly; always via `reconcileElements()` |
| **ReconciledExcalidrawElement** | `excalidraw/data/reconcile.ts:17` | Branded `OrderedExcalidrawElement` — output of `reconcileElements()`, safe to apply to scene |
| **RemoteExcalidrawElement** | `excalidraw/data/reconcile.ts:20` | Branded `OrderedExcalidrawElement` — element received from a remote collaborator |
| **reconcileElements()** | `excalidraw/data/reconcile.ts:73` | Merges local + remote arrays. Discards remote if: (1) local is actively being edited, (2) local.version > remote.version, (3) equal version + local.versionNonce ≤ remote.versionNonce |
| **shouldDiscardRemoteElement()** | `excalidraw/data/reconcile.ts:23` | Pure function encoding the conflict resolution rules above |
| **SocketId** | `excalidraw/types.ts:68` | Branded string — unique identifier for a collaborator's WebSocket connection |
| **Collaborator** | `excalidraw/types.ts:70` | `{ pointer, selectedElementIds, username, avatarUrl, socketId, isCurrentUser, userState }` |

---

## Store & History

| Term | Type / Location | Meaning |
|------|-----------------|---------|
| **CaptureUpdateAction** | `element/src/store.ts:38` | Controls undo/redo recording: `IMMEDIATELY` (record now), `NEVER` (don't record — remote changes), `EVENTUALLY` (defer — async ops) |
| **StoreSnapshot** | `element/src/store.ts:643` | Immutable point-in-time capture of `{ elements: SceneElementsMap, appState: ObservedAppState }`. Diffed to calculate deltas |
| **ObservedAppState** | `excalidraw/types.ts` | Subset of `AppState` that participates in history: `name`, `selectedElementIds`, `selectedGroupIds`, `selectedLinearElement`, `viewBackgroundColor`, `editingGroupId`, `croppingElementId`, `activeLockedId` |
| **StoreDelta** | `element/src/store.ts:497` | Diff between two snapshots: `{ elements: ElementsDelta, appState: AppStateDelta }`. Can be inverted (for undo), squashed (batching), or applied |
| **StoreChange** | `element/src/store.ts:432` | Which specific elements and appState fields changed — used for change detection |
| **DurableIncrement** | `element/src/store.ts:476` | `StoreIncrement` with a `StoreDelta` — represents a change that goes into undo/redo history and is broadcast to collaborators |
| **EphemeralIncrement** | `element/src/store.ts:488` | `StoreIncrement` without delta — transient change (e.g. mid-drag preview) not recorded in history |
| **HistoryDelta** | `excalidraw/history.ts:15` | Extends `StoreDelta`. Its `applyTo()` excludes `version`/`versionNonce` so undo/redo always creates a fresh version — enabling correct collab reconciliation after undo |

---

## App State (Key Fields)

| Term | Location | Meaning |
|------|----------|---------|
| **activeTool** | `appState.ts:50` | `{ type, locked, fromSelection, lastActiveTool }` — current drawing tool + whether it's locked |
| **selectedElementIds** | `appState.ts:92` | `Record<id, true>` — currently selected elements |
| **editingTextElement** | `appState.ts` | Element currently being text-edited (inline WYSIWYG) |
| **newElement** | `appState.ts` | Element being drawn (preview before pointer up) |
| **selectedLinearElement** | `appState.ts` | `LinearElementEditor` state — active arrow/line being point-edited |
| **viewModeEnabled** | `appState.ts` | Read-only mode — no drawing or editing |
| **zenModeEnabled** | `appState.ts` | Hides all UI chrome, canvas only |
| **bindMode** | `appState.ts:130` | Current arrow binding mode: `"orbit" \| "inside" \| "skip"` |
| **userToFollow** | `appState.ts` | `{ socketId, username }` — whose viewport is being followed in collab |

---

## Rendering

| Term | Type / Location | Meaning |
|------|-----------------|---------|
| **RenderableElementsMap** | `excalidraw/scene/types.ts:24` | Branded `NonDeletedElementsMap` — elements passed to the canvas renderer |
| **ElementShape** | `excalidraw/scene/types.ts:155` | Rough.js `Drawable`, `Path2D`, or SVG path string — the pre-computed render shape for an element |
| **ShapeCache** | `packages/element/src/` | Global cache from element → `ElementShape`. Invalidated on element change or zoom reset |
| **sceneNonce** | `Scene` class | Random integer bumped on every `triggerUpdate()` — used by renderer to detect when a redraw is needed |

---

## Font Constants

**`FONT_FAMILY`** (`common/src/constants.ts`) — numeric IDs used in `currentItemFontFamily`:

| ID | Font |
|----|------|
| 1 | Virgil (default hand-drawn) |
| 2 | Helvetica |
| 3 | Cascadia (monospace) |
| 5 | Excalifont |
| 6 | Nunito |
| 7 | Lilita One |
| 8 | Comic Shanns |
| 9 | Liberation Sans |
| 10 | Assistant (CJK support) |
