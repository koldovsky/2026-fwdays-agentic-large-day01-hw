# System Patterns (Excalidraw Verified Memory)

## Scope

- Editor engine orchestration inside `packages/excalidraw/components/App.tsx`
- Public React entrypoint and providers in `packages/excalidraw/index.tsx`
- Hosted collaboration/persistence integration in `excalidraw-app/collab/*` and `excalidraw-app/data/firebase.ts`

## 1) Integration Surface: React + imperative API

- `packages/excalidraw/index.tsx` exports:
  - `ExcalidrawAPIProvider`, which provides `ExcalidrawAPIContext` and `ExcalidrawAPISetContext` so host code can access the imperative API.
  - `Excalidraw` (memoized wrapper) that renders the internal editor `<App />`.
- The editor engine defines multiple React contexts in `packages/excalidraw/components/App.tsx`, including:
  - `ExcalidrawAPIContext` / `ExcalidrawAPISetContext`
  - `ExcalidrawAppStateContext` / `ExcalidrawSetAppStateContext`
  - `ExcalidrawActionManagerContext`

## 2) Two-state-plane model

- Editor model state:
  - `packages/excalidraw/components/App.tsx` maintains the main editor model in `this.state` (type `AppState`).
- UI atom state:
  - `packages/excalidraw/index.tsx` wraps the editor with `EditorJotaiProvider`.
  - `App.tsx` reads Jotai-backed atoms during rendering (example: `showShapeSwitchPanel` reads `convertElementTypePopupAtom` via `editorJotaiStore.get(...)`).

## 3) Controller Architecture: ActionManager + syncActionResult bridge

- `App.tsx` constructs the core orchestration objects in its constructor:
  - `this.scene = new Scene()`
  - `this.renderer = new Renderer(this.scene)`
  - `this.store = new Store(this)`
  - `this.history = new History(this.store)` (note: assigned twice in the constructor)
  - `this.actionManager = new ActionManager(this.syncActionResult, ...)`
  - `this.actionManager.registerAll(actions)`
  - `this.actionManager.registerAction(createUndoAction(this.history))`
  - `this.actionManager.registerAction(createRedoAction(this.history))`
- The action-to-model integration point is `public syncActionResult`:
  - Runs inside `withBatchedUpdates(...)`
  - Schedules store capture: `this.store.scheduleAction(actionResult.captureUpdate)`
  - Applies element changes: `this.scene.replaceAllElements(actionResult.elements)`
  - Applies file changes: `this.addMissingFiles(...)` and then `this.addNewImagesToImageCache()`
  - Applies appState changes via `this.setState(...)`, including:
    - `contextMenu: null`
    - `editingTextElement` normalization (including mapping to the latest element instance when replacement happens)
  - If nothing else updated, triggers canvas redraw via `this.scene.triggerUpdate()`

## 4) Rendering Pipeline (render() -> renderer.getRenderableElements)

- `App.tsx` render derives viewport-filtered renderables by calling:
  - `this.renderer.getRenderableElements({ sceneNonce, zoom, offsetLeft, offsetTop, scrollX, scrollY, height, width, editingTextElement, newElementId })`
- It also stores `this.visibleElements = visibleElements` for use by downstream logic.

## 5) Lifecycle and resource management

- `componentDidMount` in `App.tsx`:
  - marks `this.unmounted = false`
  - creates `this.api` via `this.createExcalidrawAPI()`
  - sets `this.excalidrawContainerValue.container = this.excalidrawContainerRef.current`
  - (test/dev) exposes debug hooks on `window.h` using `Object.defineProperties`
  - subscribes to store durable increments: `this.history.record(increment.delta)`
  - subscribes scene updates: `this.scene.onUpdate(this.triggerRender)`
  - calls `this.addEventListeners()`
  - initializes based on URL search params:
    - if `web-share-target` exists: `this.restoreFileFromShare()`
    - else: `this.updateDOMRect(this.initializeScene)`
  - emits mount lifecycle events and calls host callbacks (`props.onMount`, `props.onExcalidrawAPI`)
- `componentWillUnmount` in `App.tsx`:
  - marks API destroyed and invalidates `get*` methods plus `onStateChange` / `onEvent` by overwriting functions that throw
  - calls lifecycle emitters and host callbacks (`props.onUnmount`, `props.onExcalidrawAPI(null)`)
  - destroys and recreates core view-model objects (`renderer.destroy()`, `scene.destroy()`, then `new Scene()`, `new Fonts(...)`, `new Renderer(...)`)
  - clears caches and clears event emitters
  - resets `document.documentElement.style.overscrollBehaviorX = ""`

## 6) Event listener strategy

- `addEventListeners` removes previously registered listeners first, via `this.removeEventListeners()`.
- It registers global and container events using `this.onRemoveEventListenersEmitter.once(addEventListener(...))`.

## 7) Module-scope state (shared within the module)

- `App.tsx` defines several module-level variables outside the `App` class (examples):
  - `didTapTwice`, `tappedTwiceTimer`, `firstTapPosition`
  - `YOUTUBE_VIDEO_STATES` (a `Map` used by `onWindowMessage`)
  - `IS_PLAIN_PASTE`, `IS_PLAIN_PASTE_TIMER`, `PLAIN_PASTE_TOAST_SHOWN`
  - shared gesture tracking (`gesture: { pointers: new Map(), ... }`)
- Keyboard shortcut handling updates module-scope plain-paste state:
  - in `onKeyDown`, `Ctrl/Cmd + V` with `event.shiftKey` sets `IS_PLAIN_PASTE = true`, clears/sets `IS_PLAIN_PASTE_TIMER`, and resets it after 100ms.
- Window message handling updates YouTube state:
  - `onWindowMessage` filters by `event.origin` (YouTube/Vimeo), parses JSON, and writes to `YOUTUBE_VIDEO_STATES` when `data.event === "infoDelivery"` and `data.info.playerState` is numeric and in `YOUTUBE_STATES`.

## 8) Collaboration boundary: encrypted socket updates + Firebase persistence

- `excalidraw-app/data/firebase.ts` provides persistence helpers that:
  - initialize Firebase (`initializeApp`) and build Firestore / Storage clients
  - encrypt scene elements using a `roomKey` (`encryptData` / `decryptData`)
  - save to Firestore via transactions (`runTransaction` + `doc(...)`)
  - upload files via Storage (`uploadBytes`)
- `excalidraw-app/collab/Portal.tsx` provides the runtime collaboration transport:
  - maintains `socket`, `roomId`, and `roomKey`
  - on `open(socket, id, key)`:
    - listens for `init-room`, `new-user`, and `room-user-change`
    - emits `join-room` on `init-room`
  - `broadcastScene(...)`:
    - encrypts outbound payloads with `encryptData(this.roomKey!, encoded)`
    - emits encrypted bytes to the server via `this.socket.emit(...)` (payload includes encryptedBuffer and iv)

## Details

For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md

## Related Documentation

- [`../technical/architecture.md`](../technical/architecture.md)
- [`../technical/code-notes.md`](../technical/code-notes.md)
- [`../technical/dev-setup.md`](../technical/dev-setup.md)
- [`../product/PRD.md`](../product/PRD.md)
- [`../product/domain-glossary.md`](../product/domain-glossary.md)