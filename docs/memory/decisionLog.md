# Decision Log: `packages/excalidraw/components/App.tsx`

> **Related docs:** [Architecture](../technical/architecture.md) · [System Patterns](./systemPatterns.md) · [PRD § Technical Limitations](../product/PRD.md#4-technical-limitations) · [Domain Glossary](../product/domain-glossary.md)

## State Management Architecture

### Three Separate State Containers

```
this.state     — React class state (AppState, ~200 props)
this.scene     — Scene class, owns all elements
this.store     — snapshot + delta computation, feeds this.history
```

These are never merged — joined only at render time and in the Store snapshot.

### Single Update Funnel: `syncActionResult` (App.tsx:2735)

Every action (keyboard, toolbar, API) routes through one method:

```
ActionResult
  → this.store.scheduleAction(captureUpdate)   // tell Store what to record
  → this.scene.replaceAllElements(elements)    // update element container
  → this.setState({ ...appState })             // trigger React re-render
```

If neither changed: `this.scene.triggerUpdate()` forces canvas repaint without React re-render.

### Batching Strategy

- `syncActionResult` is wrapped in `withBatchedUpdates` — collapses multiple `setState` calls per render cycle.
- Three hot paths use `flushSync` (lines 974, 1090, 1220) where immediate DOM synchrony is required.

### Props → State Sync

`viewModeEnabled`, `zenModeEnabled`, `theme`, `langCode` props are mirrored into `this.state` inside `componentDidUpdate` on every diff that detects a change.

### Jotai Integration

`editorJotaiStore` (scoped/isolated via `jotai-scope`) holds ephemeral UI state. `App` writes imperatively via `updateEditorAtom()` (line 854):

```ts
editorJotaiStore.set(atom, ...args)
this.triggerRender()
```

### `triggerRender()` (line 4614)

- `force=true` → `scene.triggerUpdate()` — canvas repaint, no React re-render
- No force → `this.setState({})` — React re-render, updates canvas props

---

## Component Lifecycle

### `constructor` (line 787)

Creates every subsystem in strict dependency order:

```
getDefaultAppState() → this.state
new Library(this)
new ActionManager(this.syncActionResult, ...)
new Scene()
new Renderer(this.scene)
new Store(this)
new History(this.store)
new Fonts(this.scene)
actionManager.registerAll(actions)    // ~90 actions + undo/redo
createExcalidrawAPI()                 // builds this.api
```

Also pre-creates the `canvas` DOM element, `RoughCanvas`, and all `Emitter` instances.

### `componentDidMount` (line 3057) — async

1. **Recreates `this.api`** — React 18 StrictMode double-invokes constructors; the constructor-built API may reference a stale closure.
2. **Wires Store → History:** `store.onDurableIncrementEmitter.on(delta => history.record(delta))` — the only way history entries are created.
3. **Wires Scene → render:** `scene.onUpdate(this.triggerRender)` — element mutations automatically trigger canvas repaint.
4. **`addEventListeners()`** — registers all DOM event listeners.
5. **`ResizeObserver`** — watches the container; calls `refreshEditorInterface()` + `updateDOMRect()` on resize.
6. **`initializeScene()`** — async; restores elements/state from `props.initialData`, share link, or Web Share Target. Calls `syncActionResult` with restored data and resets history.
7. **Emits `"editor:mount"`**, calls `props.onMount?.()` and `props.onExcalidrawAPI?.(this.api)`.

### `componentDidUpdate` (line 3358) — reactive diff engine

Runs after every React render. Key reactions:

| Condition | Action |
|---|---|
| First render where `isLoading` became false | `_initialized = true`, emit `"editor:initialize"` |
| Every render | `appStateObserver.flush(prevState)` — fires fine-grained subscriptions |
| Every render | `updateEmbeddables()` — syncs iFrame visibility |
| Every render | `store.commit(elementsMap, this.state)` — snapshot for delta computation |
| `!isLoading` | Fire `props.onChange?.()` and `onChangeEmitter.trigger()` |
| scroll/zoom changed | Fire `onScrollChangeEmitter.trigger()` |
| `userToFollow` changed | Fire `onUserFollowEmitter.trigger(FOLLOW/UNFOLLOW)` |
| `viewModeEnabled` changed | Re-run `addEventListeners()` (edit-mode listeners are conditional) |
| `theme` prop changed | `setState({ theme })` |
| `langCode` prop changed | `updateLanguage()` |
| eraser deactivated | `eraserTrail.endPath()` |
| linear element editing but deselected | Deferred `actionManager.executeAction(actionFinalize)` |
| editing a deleted text element | `setState({ editingTextElement: null })` |

### `componentWillUnmount` (line 3150)

Full teardown in order:
1. Marks `this.api.isDestroyed = true`; overwrites `get*` / subscription methods with error-throwers.
2. Emits `"editor:unmount"`, calls `props.onUnmount?.()`, `props.onExcalidrawAPI?.(null)`.
3. Destroys `scene`, `renderer`, `library`, `fonts`.
4. Disconnects `ResizeObserver`.
5. Removes all DOM event listeners via `onRemoveEventListenersEmitter.trigger()`.
6. Stops animation trails (`laserTrails.stop()`, `eraserTrail.stop()`).
7. Clears all emitters (`onChangeEmitter`, store emitters, `appStateObserver`, `editorLifecycleEvents`).
8. Destroys `ShapeCache`, `SnapCache`, memoized function caches.
9. Resets `overscrollBehaviorX` on `<html>`.

---

## Side Effects

| Side Effect | Registered in | Removed in |
|---|---|---|
| `keydown` / `keyup` | `addEventListeners` | `removeEventListeners` |
| `pointermove`, `pointerup` | `addEventListeners` | `removeEventListeners` |
| `wheel` on container | `addEventListeners` | `removeEventListeners` |
| `resize` on window | `addEventListeners` (edit mode only) | `removeEventListeners` |
| `copy`, `cut`, `paste` | `addEventListeners` (edit mode only) | `removeEventListeners` |
| `blur`, `focus`, `unload` | `addEventListeners` (edit mode only) | `removeEventListeners` |
| `fullscreenchange` | `addEventListeners` (edit mode only) | `removeEventListeners` |
| `message` (YouTube/Vimeo iframes) | `addEventListeners` | `removeEventListeners` |
| `document.fonts loadingdone` | `addEventListeners` | `removeEventListeners` |
| Safari gesture events | `addEventListeners` | `removeEventListeners` |
| `scroll` on nearest scrollable | `addEventListeners` (if `detectScroll` prop) | `removeEventListeners` |
| `ResizeObserver` on container | `componentDidMount` | `componentWillUnmount` |
| Store → History subscription | `componentDidMount` | `store.onDurableIncrementEmitter.clear()` |
| Scene → triggerRender subscription | `componentDidMount` | `scene.destroy()` |
| RAF animation loops (trails) | On tool activation | `stop()` / `endPath()` in unmount / CDU |

### Event Listener Pattern

Uses `onRemoveEventListenersEmitter` — `addEventListener()` returns an unsubscribe function registered on the emitter. `removeEventListeners()` triggers all cleanup atomically. This allows `addEventListeners()` to be called multiple times safely (it always removes first) — which happens when `viewModeEnabled` toggles.

---

## Key Line Reference

| Item | Line |
|---|---|
| `constructor` | 787 |
| `createExcalidrawAPI()` | 743 |
| `updateEditorAtom()` | 854 |
| `syncActionResult()` | 2735 |
| `componentDidMount` | 3057 |
| `addEventListeners()` | 3229 |
| `removeEventListeners()` | 3225 |
| `componentWillUnmount` | 3150 |
| `componentDidUpdate` | 3358 |
| `triggerRender()` | 4614 |
| `initializeScene()` | 2860 |

---

## Undocumented Behaviors

### #1 — `mutateElement` does NOT trigger re-render
- **File**: `packages/element/src/mutateElement.ts:34-35`
- **What happens**: `mutateElement()` mutates the element in-place but skips React re-render, history, and multiplayer sync. `scene.mutateElement()` does all three. Using the wrong one is a silent bug.
- **Where documented**: JSDoc WARNING comment on `mutateElement` only
- **Risk**: AI may call the low-level form for edits that require history/sync

### #2 — Collab broadcast version must be set before `updateScene`
- **File**: `excalidraw-app/collab/Collab.tsx:780-783`
- **What happens**: `setLastBroadcastedOrReceivedSceneVersion()` must be called **before** `updateScene()`. `updateScene` synchronously calls render which reads the version; wrong order causes the received scene to be immediately rebroadcast.
- **Where documented**: Single inline NOTE comment
- **Risk**: Refactoring these two lines' order triggers a broadcast storm

### #3 — Snap cache must be synchronously populated before first drag
- **File**: `packages/excalidraw/components/App.tsx:9924-9928`
- **What happens**: `maybeCacheVisibleGaps` and `maybeCacheReferenceSnapPoints` must run synchronously before the first drag event. Moving them async causes a visible position jump on drag start.
- **Where documented**: Inline comment only
- **Risk**: Making cache population async/lazy breaks snapping on first drag

### #4 — Binding state machine: `unbindAffected` must precede `rebindAffected`
- **File**: `packages/element/src/binding.ts:2232`, `binding.ts:2344`
- **What happens**: `rebindAffected()` assumes callers have already called `unbindAffected()` on the same elements. Skipping unbind leaves stale `boundElements` references.
- **Where documented**: NOTE comments on both methods only
- **Risk**: AI implementing a new move/transform operation may call only `rebindAffected`, creating duplicate binding entries

### #5 — Store macro/micro action ordering is implicit
- **File**: `packages/element/src/store.ts:109-111`
- **What happens**: Micro-actions drain **before** the scheduled macro action commits. `scheduleCapture()` (macro) is flagged as "called too many places, error-prone" — adding another call site can silently merge intermediate mutations into one undo step.
- **Where documented**: TODO comment only
- **Risk**: AI adding `scheduleCapture()` calls breaks undo granularity

### #6 — Empty text element deletion in `restore.ts` bypasses delta tracking
- **File**: `packages/excalidraw/data/restore.ts:407-409`
- **What happens**: Empty text elements are marked `isDeleted: true` imperatively during restore without recording a delta. Collaborators exchanging only deltas will never see this deletion.
- **Where documented**: TODO comment only
- **Risk**: AI implementing sync paths may assume `isDeleted` is always delta-tracked

### #7 — Invisibly-small elements remain in state, store, and broadcast
- **File**: `packages/element/src/sizeHelpers.ts:27-29`
- **What happens**: Elements passing `isInvisiblySmallElement()` are filtered from render/export but still exist in the elements array, store snapshots, and are broadcast to collaborators.
- **Where documented**: TODO comment only
- **Risk**: AI may assume non-rendering elements are absent from state

### #8 — Color array order maps to UI grid position
- **File**: `packages/common/src/colors.ts:183`, `192`, `201`, `228`
- **What happens**: Array/object insertion order directly determines cell position in the color picker UI. Sorting or deduplicating these arrays shifts colors visually.
- **Where documented**: "ORDER matters" inline comments only
- **Risk**: AI refactoring colors alphabetically shuffles the picker UI

### #9 — `positionElementsOnGrid` is self-described as "vibe-coded"
- **File**: `packages/element/src/positionElementsOnGrid.ts:6`
- **What happens**: Column count uses `Math.ceil(Math.sqrt(numUnits))` — an approximation. Row centering drifts for non-uniform element heights. No spec or tests.
- **Where documented**: `// TODO rewrite (mostly vibe-coded)` only
- **Risk**: AI asked to fix layout issues may rely on this function being correct

### #10 — `isElementInFrame` is an unoptimized O(n) bottleneck
- **File**: `packages/element/src/frame.ts:752`
- **What happens**: `isElementInFrame()` iterates `allElementsMap` on each call with no caching. Called per-element for every frame operation — explicitly flagged as a "huge bottleneck for large scenes."
- **Where documented**: TODO comment only
- **Risk**: Any new frame-related feature that calls this in a loop will make large scenes unusable
