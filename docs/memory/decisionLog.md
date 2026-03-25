# Decision Log

> **See also**: [projectbrief](projectbrief.md) | [techContext](techContext.md) | [systemPatterns](systemPatterns.md) | [productContext](productContext.md) | [activeContext](activeContext.md) | [progress](progress.md)
> **Technical docs**: [Architecture](../technical/architecture.md) | [Dev Setup](../technical/dev-setup.md)
> **Product docs**: [PRD](../product/PRD.md) | [Domain Glossary](../product/domain-glossary.md)

Key architectural and technical decisions with rationale derived from the source code.

## 1. Class Component for Main App

- **Choice**: `App extends React.Component<AppProps, AppState>` in `packages/excalidraw/components/App.tsx`
- **Rationale**: Complex lifecycle management, direct canvas ref control, imperative DOM manipulation for dual-canvas architecture; functional component with hooks would require excessive `useEffect` dependencies for this scale of component

## 2. Jotai with Two Scoped Stores

- **Choice**: Jotai over Redux/Zustand; two stores — `editorJotaiStore` (per-instance) and `appJotaiStore` (global)
- **Evidence**: `excalidraw-app/app-jotai.ts`, `packages/excalidraw/editor-jotai.ts`; ESLint rule enforces "Do not import from 'jotai' directly"
- **Rationale**: Lightweight, fine-grained reactivity; `editorJotaiStore` uses `createIsolation()` to allow multiple independent editor instances; `appJotaiStore` holds global atoms (collaboration, language, theme)

## 3. rough.js for Hand-Drawn Rendering

- **Choice**: rough.js 4.6.4 for sketch-like visual style
- **Evidence**: `RoughGenerator` usage in `packages/element/src/shape.ts`, `rc.draw()` calls in `packages/element/src/renderElement.ts`
- **Rationale**: Core product differentiator — hand-drawn aesthetic with configurable roughness, fill patterns (hachure, zigzag), stroke variations (dashed, dotted)

## 4. Fractional Indexing for Z-Order

- **Choice**: `fractional-indexing` library, branded `FractionalIndex` type
- **Evidence**: `packages/element/src/types.ts` — `type FractionalIndex = string & { _brand: "franctionalIndex" }`; `packages/element/src/fractionalIndex.ts` — `generateNKeysBetween()`
- **Rationale**: Enables element insertion between existing elements without renumbering the entire z-stack — critical for multiplayer reconciliation

## 5. Client-Side AES-GCM Encryption

- **Choice**: `window.crypto.subtle.encrypt()` with AES-GCM; room key transmitted in URL fragment only
- **Evidence**: `packages/excalidraw/data/encryption.ts` — 12-byte IV per message, AEAD authentication
- **Rationale**: Server (Firebase) never has access to plaintext; URL fragment (`#key=...`) is never sent to server; true end-to-end encryption for collaborative sessions

## 6. Monorepo with Four Core Packages

- **Choice**: Yarn workspaces — `common`, `math`, `element`, `excalidraw` + `utils`
- **Evidence**: Root `package.json` workspaces: `["excalidraw-app", "packages/*", "examples/*"]`
- **Rationale**: Clear separation of concerns; `math` and `common` are dependency-free; `element` depends on `math`+`common`; `excalidraw` depends on all — enables independent publishing and reuse

## 7. Canvas 2D Over SVG for Main Rendering

- **Choice**: HTML Canvas 2D (`CanvasRenderingContext2D`) for live rendering; SVG for export only
- **Evidence**: `StaticCanvas.tsx`, `InteractiveCanvas.tsx` — both use `<canvas>` elements
- **Rationale**: Canvas handles thousands of elements efficiently; DOM-based SVG would create per-element nodes causing layout thrashing at scale

## 8. Dual Canvas Architecture

- **Choice**: Two overlapping canvases — `StaticCanvas` (elements) + `InteractiveCanvas` (UI overlays)
- **Evidence**: `packages/excalidraw/renderer/staticScene.ts`, `packages/excalidraw/renderer/interactiveScene.ts`
- **Rationale**: Static canvas re-renders only when elements change (tracked via `sceneNonce`); interactive canvas re-renders every frame for cursors, selection boxes, drag handles — avoids full scene redraw on pointer movement

## 9. Immutable Elements with Version/Nonce Tracking

- **Choice**: `Readonly<{...}>` wrapper on all element types; `version: number` + `versionNonce: number` fields
- **Evidence**: `packages/element/src/types.ts` — `_ExcalidrawElementBase = Readonly<{...}>`
- **Rationale**: `version` increments sequentially on each change; `versionNonce` is a random integer for deterministic conflict resolution when versions match — essential for multiplayer reconciliation

## 10. Firebase + Socket.io Dual Sync

- **Choice**: Firebase Firestore for persistence, socket.io for real-time ephemeral updates
- **Evidence**: `excalidraw-app/collab/Portal.tsx` — socket.io `emit(WS_EVENTS.SERVER_VOLATILE, ...)`; `excalidraw-app/data/firebase.ts` — `saveToFirebase()`, `loadFromFirebase()`
- **Rationale**: Socket.io for low-latency cursor positions and element deltas (volatile); Firebase for durable scene state and binary file storage (source of truth after reconnection)

## 11. WeakMap Shape Cache

- **Choice**: `WeakMap<ExcalidrawElement, { shape, theme }>` for rough.js shape cache
- **Evidence**: `packages/element/src/shape.ts` — `ShapeCache` class; `packages/element/src/renderElement.ts` — `elementWithCanvasCache`
- **Rationale**: WeakMap entries are garbage collected when element references are dropped — no manual eviction; key is element reference, so new immutable element objects naturally invalidate the cache

## 12. Delta-Based Undo/Redo

- **Choice**: `StoreDelta` / `HistoryDelta` captures only changed properties, not full snapshots
- **Evidence**: `packages/excalidraw/history.ts` — `HistoryDelta.applyTo()`; explicitly excludes `version`, `versionNonce` from undo
- **Rationale**: Lower memory footprint; collaboration-safe — undo creates new version/versionNonce so local undo doesn't corrupt remote state

## 13. Branded Types for Type Safety

- **Choice**: TypeScript intersection types with `_brand` field — `Radians`, `Degrees`, `FractionalIndex`, `FileId`
- **Evidence**: `packages/math/src/types.ts` — `type Radians = number & { _brand: "excalimath__radian" }`
- **Rationale**: Prevents accidental mixing of semantically different primitives (e.g., passing degrees where radians expected) at zero runtime cost

## 14. Vite Over Webpack/CRA

- **Choice**: Vite 5.0.12 with extensive plugin ecosystem
- **Evidence**: `excalidraw-app/vite.config.mts` — plugins: `@vitejs/plugin-react`, `vite-plugin-svgr`, `vite-plugin-pwa`, `vite-plugin-checker`, custom `woff2BrowserPlugin`
- **Rationale**: esbuild-powered dev server is 10–100x faster than webpack; manual chunk splitting for locales, CodeMirror, mermaid; built-in PWA/SEO plugin support

## 15. React 19

- **Choice**: React 19.0.0 as primary version
- **Evidence**: `excalidraw-app/package.json` — `"react": "19.0.0"`
- **Rationale**: Latest stable React; `"use client"` directive used in Next.js example for SSR boundary; standard hooks-based architecture outside of the main App class component

---

# Undocumented Behavior

Code behaviors that are implicit, non-obvious, or rely on undocumented ordering and side effects. Each entry describes what the code does vs what a reader would expect.

## UB-1. Implicit Pointer Event State Machine

- **Location**: `packages/excalidraw/components/App.tsx` — module-level globals (lines ~592–620) + `onCanvasPointerDown` (line ~7692)
- **What you'd expect**: A well-defined state machine for pointer interactions (idle → dragging → resizing → panning)
- **What actually happens**: State is fragmented across 9+ module-level mutable variables (`didTapTwice`, `isPanning`, `isDraggingScrollBar`, `isHoldingSpace`, `invalidateContextMenu`, `touchTimeout`, etc.) plus `gesture` object tracking multi-touch, plus App instance fields (`lastPointerDownEvent`, `lastPointerUpIsDoubleClick`, `lastPointerMoveCoords`). These combine to form an **implicit** state machine with no single source of truth. Multiple flags can be true simultaneously with implicit priority (scrollbar drag blocks other handlers, panning overrides selection).
- **HACK comment** (line ~689): `"TODO this is a hack and we should ideally unify touch and pointer events and implement our own double click handling end-to-end"`
- **Risk**: Adding a new pointer interaction requires understanding all flag combinations; double-click behavior differs between desktop (native) and touch (manual timer-based)

## UB-2. Store.commit() Side-Effect Cascade

- **Location**: `packages/element/src/store.ts` — `commit()` method (line ~200)
- **What you'd expect**: `commit()` saves the current state snapshot
- **What actually happens**: A multi-step cascade:
  1. Flushes queued micro-actions (unbuffered side effects)
  2. Selects highest-priority macro action using **non-FIFO priority** (`IMMEDIATELY` > `NEVER` > `EVENTUALLY`)
  3. Calculates a diff (delta) between current and previous snapshot
  4. Emits to `onDurableIncrementEmitter` (history) AND `onStoreIncrementEmitter` (all subscribers)
  5. History listener may **clear the entire redo stack** if elements changed
  6. Conditionally updates snapshot — `EVENTUALLY` actions **do NOT update the snapshot**, meaning subsequent diffs still compare against older state
  7. Finally clears all scheduled macro actions (but **not** micro actions)
- **Risk**: `EVENTUALLY` semantic is especially confusing — changes are emitted but snapshot is stale, so next `IMMEDIATELY` action produces a delta that includes the `EVENTUALLY` changes again

## UB-3. Scene.replaceAllElements() Silent Callback Storm

- **Location**: `packages/element/src/Scene.ts` — `replaceAllElements()` (line ~250) → `triggerUpdate()` (line ~306)
- **What you'd expect**: Replaces the element array and updates internal maps
- **What actually happens**: Six sequential side effects:
  1. Validates fractional indices (throttled, can throw in dev)
  2. Calls `syncInvalidIndices()` which **mutates** the input array
  3. Clears and rebuilds `elementsMap` (O(n))
  4. Recomputes `nonDeletedElements`, `frames`, `nonDeletedFramesLikes` (new arrays each time)
  5. Generates a new `sceneNonce` (random integer) — invalidates renderer cache
  6. Fires **all registered callbacks** in insertion order — subscribers include App (triggers re-render), Collab (may broadcast), store (may record delta)
- **Risk**: Callbacks can call `mutateElement()` or `replaceAllElements()` recursively. The `Array.from(this.callbacks)` copy prevents iterator invalidation but does not prevent re-entrant updates

## UB-4. Collaboration Connection — Split State Across Atoms and Instance Variables

- **Location**: `excalidraw-app/collab/Collab.tsx` (lines ~280–590)
- **What you'd expect**: A single collaborative connection state (disconnected → connecting → connected → syncing)
- **What actually happens**: State is split across:
  - Jotai atom: `isCollaboratingAtom` (boolean)
  - Instance fields: `portal.socket` (Socket | null), `portal.socketInitialized` (boolean), `portal.roomId`, `portal.roomKey`
  - Scalar: `lastBroadcastedOrReceivedSceneVersion` (-1 means "never synced")
- **Transient inconsistencies**: `isCollaboratingAtom` can be `true` while `socket` is still `null` during `startCollaboration()`. The code handles initialization failure via a dual-path fallback: either a `SCENE_INIT` socket message arrives, OR a timeout fires `fallbackInitializationHandler` which loads from Firebase instead. `portal.socketInitialized` is set inside `Portal.handleSceneInit()`, not in `Collab.tsx`
- **Risk**: Checking `isCollaborating` alone is insufficient to know if the socket is ready

## UB-5. Linear Element [0,0] First-Point Invariant

- **Location**: `packages/element/src/linearElementEditor.ts` (line ~1585)
- **What you'd expect**: Moving the first point of a line moves the point
- **What actually happens**: The first point of a linear element is **always** at `[0,0]`. When the user drags the start point, the code moves **all other points** in the opposite direction and shifts `element.x/y` to compensate. This maintains the invariant while appearing transparent to the user
- **HACK comment** (line ~1585): `"this hacks are completely transparent to the user"`
- **Risk**: Any code that manipulates linear element points must know about this invariant. Directly setting `points[0]` to non-zero breaks position calculations

## UB-6. ShapeCache Theme-Based Invalidation

- **Location**: `packages/element/src/shape.ts` — `ShapeCache` class (line ~73)
- **What you'd expect**: Shape cache invalidates when element geometry changes
- **What actually happens**: Cache stores `{ shape, theme }` tuples. Switching light↔dark mode invalidates **all shape caches** even if shapes haven't changed, because the cache hit requires `cached.theme === requestedTheme`. Additionally, export mode **always bypasses cache** (`renderConfig?.isExporting ? undefined : ShapeCache.get(...)`) to ensure freshest visual state
- **Risk**: A theme toggle in a large scene forces full regeneration of all rough.js shapes — expensive operation

## UB-7. Font Loading Order Dependency and Static Cache Race

- **Location**: `packages/excalidraw/fonts/Fonts.ts` (lines ~60–74, ~150–180, ~362–383)
- **What you'd expect**: Fonts are loaded independently, order doesn't matter
- **What actually happens**: Lazy initialization with registration order dependency:
  1. First access triggers `Fonts.init()` which registers base fonts in fixed order
  2. If a host app registers fonts **before** lazy init, host fonts **override** base fonts via Map merge: `new Map([...Fonts.init().entries(), ...Fonts._registered.entries()])`
  3. Font load completion triggers `onLoaded()` which: updates a **static** `loadedFontsCache` (shared across all instances), calls `ShapeCache.delete()` for every text element, calls `charWidth.clearCache()` clearing fallback font metrics, and triggers a full scene re-render
- **Risk**: Two Excalidraw instances on the same page share `Fonts.loadedFontsCache` — loading a font in one triggers cache invalidation in both

## UB-8. actionFinalize Invisible Element Cleanup

- **Location**: `packages/excalidraw/actions/actionFinalize.tsx` (lines ~45–200)
- **What you'd expect**: Finalizes the current drawing operation, selects the new element
- **What actually happens**: Multiple implicit state resets:
  1. Elements that are `isInvisiblySmallElement()` (near-zero dimensions) are silently marked `isDeleted: true` — not removed from array, just flagged
  2. Invalid polygons are auto-converted back to lines via `scene.mutateElement(element, { polygon: false })`
  3. Resets `cursorButton`, `selectedLinearElement`, `selectionElement`
  4. If tool is locked (`activeTool.locked`), behavior differs: `selectedLinearElement` stays null
  5. Does **not** explicitly set `captureUpdate` — relies on the action framework to determine history capture level
- **Risk**: Invisible elements accumulate in the elements array as deleted ghosts; polygon → line downgrade is silent

## UB-9. Elbow Arrow `disableSideHack` Geometry Workaround

- **Location**: `packages/element/src/elbowArrow.ts` (line ~1674)
- **What you'd expect**: Elbow arrow routing calculates optimal waypoints
- **What actually happens**: A `disableSideHack` boolean parameter controls an undocumented optimization for overlapping bounds. When enabled (default), the code inserts intermediate control points to balance arrow paths when endpoints are close together. Uses floating-point epsilon (`0.00000000001`) for precision. When `boundsOverlap` is true (line ~1362), `disableSideHack` is forced to `true`, disabling the optimization
- **Risk**: The epsilon comparison can produce different results across platforms with different floating-point implementations

## UB-10. reconcileElements Edit-in-Progress Override

- **Location**: `packages/excalidraw/data/reconcile.ts` (lines ~30–113)
- **What you'd expect**: Remote element updates always win if they have a higher version
- **What actually happens**: Three override rules apply **before** version comparison:
  1. If the local element is **being edited** (`editingTextElement`, `resizingElement`, or `newElement`), the local version **always wins** regardless of remote version
  2. On version tie, **lowest `versionNonce` wins** (deterministic tiebreaker)
  3. After merge, elements are re-sorted by `orderByFractionalIndex()` and indices validated via `syncInvalidIndices()` — but index validation is **throttled to once per 60 seconds** and only warns in dev/test
- **Risk**: A user editing an element for a long time can block remote updates to that element indefinitely; stale local state could override newer remote changes upon edit completion

## UB-11. Popover StrictMode Double-Position Hack

- **Location**: `packages/excalidraw/components/Popover.tsx` (line ~98)
- **HACK comment**: `"hack for StrictMode so this effect only runs once for the same top/left position, otherwise we'd potentionally reposition twice"`
- **What you'd expect**: Popover renders at the specified position
- **What actually happens**: React StrictMode double-invokes effects. Without the guard, popover positions first for viewport overflow adjustment, then again for the actual position — causing a visual jump. The code caches `lastInitializedPosRef` and skips if position hasn't changed
- **Risk**: StrictMode-only issue; may mask real positioning bugs in development

## UB-12. Clipboard Firefox/HTTPS Restriction

- **Location**: `packages/excalidraw/clipboard.ts` (line ~623)
- **NOTE comment**: `"doesn't work on FF on non-HTTPS domains, or when document not focused"`
- **What you'd expect**: Copy/paste works in all browsers
- **What actually happens**: `navigator.clipboard.writeText()` silently fails on Firefox over HTTP and when the document loses focus. The code falls through to a legacy `document.execCommand("copy")` fallback, but this path also has restrictions. No user-visible error is shown — the operation just silently fails
- **Risk**: Development on `localhost:3001` (HTTP) may have broken clipboard on Firefox with no indication of why
