# Undocumented behavior

This document catalogs non-obvious behaviors discovered through code analysis — implicit state machines, hidden side effects, and initialization-order dependencies. Each example cites the source files and relevant `HACK`/`FIXME`/`TODO` comments left by contributors.

---

## 1. Implicit state machines

### 1a. Pointer-interaction mode (`App.tsx` + `PointerDownState`)

The editor has no single `InteractionPhase` enum. Whether the user is resizing, rotating, cropping, dragging a selection, creating a new element, or box-selecting is determined by **combining** disjoint boolean and nullable flags that live in two separate layers:

| Layer | Fields |
|-------|--------|
| **React `AppState`** | `resizingElement`, `isResizing`, `isRotating`, `isCropping`, `croppingElementId`, `selectionElement`, `newElement`, `selectedElementsAreBeingDragged`, `editingTextElement`, `selectedLinearElement` (incl. `isEditing`) |
| **`PointerDownState`** (local to a gesture) | `resize.handleType`, `resize.isResizing`, `drag.hasOccurred`, `boxSelection.hasOccurred`, `drag.blockDragging` |

Two sources of truth co-exist for "am I in a resize?": `pointerDownState.resize.isResizing` (set when `handleType` is truthy, ~line 8348) and `this.state.isResizing` (set in `maybeHandleResize`, ~line 12346). They are updated at different lifecycle points and mean subtly different things.

A naming TODO acknowledges the confusion:

```
// TODO: rename this state field to "isScaling" to distinguish
// it from the generic "isResizing" which includes scaling and
// rotating
```
— `packages/excalidraw/components/App.tsx` ~12347

The derived policy `shouldBlockPointerEvents` (~line 2087) depends on `selectionElement`, `newElement`, `selectedElementsAreBeingDragged`, `resizingElement`, `activeTool.type === "laser"`, and `cursorButton === "down"`. Any new interaction mode must be manually added here or subtle hit-testing bugs appear.

### 1b. Store capture-phase machine (`store.ts`)

`CaptureUpdateAction` defines three modes — `IMMEDIATELY`, `NEVER`, `EVENTUALLY` — but their interaction is governed by implicit precedence, not an explicit state chart.

**How it works:**

- Multiple actions can be scheduled in one frame via `scheduleAction` into a `Set<CaptureUpdateActionType>`.
- `getScheduledMacroAction` collapses the set with fixed priority: `IMMEDIATELY > NEVER > EVENTUALLY` (~line 394).
- `commit` flushes micro-actions, processes one macro via the collapsed action, then clears the set.
- `EVENTUALLY` deliberately does **not** advance the store snapshot — it defers that to a future `IMMEDIATELY`/`NEVER`. This two-phase model is not visible from the type alone.

A TODO flags the coupling risk:

```
// TODO: Suspicious that this is called so many places. Seems error-prone.
```
— `packages/element/src/store.ts` ~109

### 1c. History undo/redo stacks (`history.ts`)

`History` maintains `undoStack` and `redoStack` of `HistoryDelta[]`. The redo stack is **only** cleared when a new undo entry has non-empty element changes (~line 127). Pure app-state changes preserve redo availability — a policy that is invisible unless you read the implementation.

The `perform` loop pops entries until `containsVisibleChange` is true, silently skipping no-op deltas. Understanding history requires reading **both** `history.ts` and `store.ts` together because history application feeds back through `CaptureUpdateAction.IMMEDIATELY` and `scheduleMicroAction`.

---

## 2. Non-obvious side effects

### 2a. `syncActionResult` always schedules capture and may clear context menu

`App.syncActionResult` (~line 2735) runs `store.scheduleAction(actionResult.captureUpdate)` on **every** successful call, before element or state handling. This means applying any action result is always tied into the undo/redo/increment pipeline — even when nothing changed.

Additionally, the `setState` branch forces `contextMenu: null` whenever `actionResult.appState`, `editingTextElement`, or `this.state.contextMenu` is truthy (~line 2797). The comment notes this **prevents** opening the context menu from an action or host — a behavioral coupling easy to overlook.

If neither elements nor state changed, the code still calls `this.scene.triggerUpdate()` (~line 2813) so subscribers run anyway.

### 2b. `Scene.replaceAllElements` mutates its input

`replaceAllElements` calls `syncInvalidIndices(_nextElements)` (~line 285) which **mutates** elements in the caller-owned array to fix fractional indices. A `WARN` in `fractionalIndex.ts` notes edge cases can touch elements that "weren't moved." Callers who assume their array is unchanged after the call will be surprised.

After rebuilding internal maps, the method calls `triggerUpdate()` which sets a new `sceneNonce` (renderer cache invalidation) and invokes **all** registered callbacks synchronously — including `App.triggerRender` which calls `setState({})`, scheduling a full React re-render.

### 2c. `componentDidUpdate` cascade

A single React update in `App.componentDidUpdate` (~line 3358) triggers a chain:

1. `appStateObserver.flush(prevState)` — runs all `onStateChange` listeners
2. `updateEmbeddables()` — may call `scene.triggerUpdate()` again, feeding back into `triggerRender → setState`
3. Multiple conditional `setState` calls (welcome screen, export dark mode, eraser/tool/theme/view mode/zen/hyperlink cleanup)
4. `store.commit(elementsMap, this.state)` — flushes micro-actions, processes scheduled macro capture, updates snapshot
5. `onChange` / `onChangeEmitter` — notifies the host (skipped while `isLoading` to avoid overwriting localStorage on unfocused tab)

Order matters; rearranging steps can break undo history, collaboration sync, or host callbacks.

### 2d. `restore.ts` silently deletes and mutates elements

With `deleteInvisibleElements: true`, `restoreElements` marks empty-text elements as `isDeleted: true` and bumps their version — but this is not recorded as a proper delta:

```
// TODO: we should not do this since it breaks sync / versioning
// when we exchange / apply just deltas and restore the elements
// (deletion isn't recorded)
```
— `packages/excalidraw/data/restore.ts` ~408

The repair pass (`repairBindings: true`) mutates elements in-place: clearing stale `startBinding`/`endBinding`, reassigning frame membership. Duplicate IDs are silently replaced with `randomId()`.

---

## 3. Initialization order dependencies

### 3a. `App` constructor: deferred closures hide temporal coupling

The `App` constructor (~line 787) builds subsystems in a specific order:

```
this.library     = new Library(this);
this.actionManager = new ActionManager(
  this.syncActionResult,
  () => this.state,
  () => this.scene.getElementsIncludingDeleted(),   // ← scene not yet created
  this,
);
this.scene       = new Scene();
this.renderer    = new Renderer(this.scene);
this.store       = new Store(this);
this.history     = new History(this.store);
this.fonts       = new Fonts(this.scene);
```

`ActionManager` receives a closure over `this.scene` **before** `this.scene` is assigned. This works because `ActionManager` stores the function without calling it during construction. If any constructor started eagerly calling its dependencies, the app would crash with a `TypeError: Cannot read properties of undefined`.

The same pattern applies to `Library(this)`, `Store(this)`, and class field initializers like `LaserTrails(this.animationFrameHandler, this)` (~line 704) — all store `this` before it is fully constructed.

`this.history` is assigned **twice** (lines ~833 and ~841) — the second is redundant.

A comment explains why `this.api` is still built in the constructor despite StrictMode concerns:

```
// in case internal editor APIs call this early, otherwise we need
// to construct this in componentDidMount because componentWillUnmount
// will invalidate it
```
— `packages/excalidraw/components/App.tsx` ~847

### 3b. Package build order must match the dependency DAG

The `build:packages` script enforces a strict sequential build:

```
yarn build:common && yarn build:math && yarn build:element && yarn build:excalidraw
```

This mirrors the declared `dependencies` in each `package.json`: `common` has no workspace deps; `math` depends on `common`; `element` depends on `common` + `math`; `excalidraw` depends on all three. Building out of order fails type generation.

### 3c. Provider nesting and polyfill order (`index.tsx`)

`polyfill()` runs at **module load time** (line 39) — before any component tree exists. The component tree enforces:

```
EditorJotaiProvider (Jotai store)
  └─ InitializeApp (blocks until i18n ready)
       └─ App (editor)
```

`InitializeApp` renders `<LoadingMessage />` instead of `<App>` until `await setLanguage(...)` resolves. The editor is **not mounted** until i18n is ready — code that assumes `App` mounts on first paint would be wrong.

### 3d. Global Jotai store and Library lifecycle

`editorJotaiStore` is created at **import time** via `createStore()` in `editor-jotai.ts`. `Library` reads/writes atoms on this global store. A TODO in `Library.destroy` (~line 253) highlights the problem:

```
// TODO uncomment after/if we make jotai store scoped to each excal instance
```

Until scoped stores are implemented, multiple `<Excalidraw>` roots share the same `libraryItemsAtom` and SVG cache. Unmounting one instance resets the cache globally.

### 3e. Circular dependency: `pick` in `colors.ts`

A FIXME in `packages/common/src/colors.ts` (~line 116) explains why a generic `pick` utility is duplicated instead of imported:

```
// FIXME can't put to utils.ts rn because of circular dependency
```

Moving it would create an import cycle between `colors.ts` and `utils.ts`, causing load-order or undefined-export issues at runtime.

---

## Appendix: notable HACK / FIXME / TODO markers

| Marker | File | Line | Description |
|--------|------|------|-------------|
| `HACK` | `App.tsx` | ~7126 | Disable transform handles for linear elements on mobile |
| `FIXME` | `App.tsx` | ~8758 | Bare FIXME near text-binding container lookup |
| `FIXME` | `store.ts` | ~109 | `scheduleCapture` called in too many places |
| `FIXME` | `restore.ts` | ~408 | Silent deletion breaks sync/versioning |
| `FIXME` | `colors.ts` | ~116 | Circular dependency prevents moving `pick` to utils |
| `FIXME` | `LayerUI.tsx` | ~111 | Should test capability inside the menu item itself |
| `FIXME` | `EyeDropper.tsx` | ~105 | Swap offset when preview escapes viewport |
| `FIXME` | `actionCanvas.tsx` | ~73 | Color picker should live in DefaultItems.tsx |
| `FIXME` | `zindex.test.tsx` | ~1322 | Incorrect frame ordering after bring-forward |
| `FIXME` | `textWysiwyg.test.tsx` | ~335 | Flaky test — "No one knows why" |
| `TODO` | `App.tsx` | ~689 | Unify touch and pointer events |
| `TODO` | `App.tsx` | ~12347 | Rename `isResizing` to `isScaling` |
| `TODO` | `App.tsx` | ~5737 | Consolidate state updates with finalize action |
| `TODO` | `history.test.tsx` | ~2369 | GroupId ordering after undo/redo |
| `TODO` | `restore.ts` | ~502 | Separate arrow from linear element |
| `TODO` | `library.ts` | ~253 | Scope Jotai store per Excalidraw instance |
| `TODO` | `types.ts` | ~189–191 | Move selection/frame state to interactive canvas |
| `TODO` | `snapping.ts` | ~44 | Increase or remove gap computation limit |
| `TODO` | `math/types.ts` | ~42, ~60 | Remove coord types after Point-tuple migration |

---

## Related references

- Architecture overview: `docs/technical/architecture.md`
- Project brief: `docs/memory/projectbrief.md`
