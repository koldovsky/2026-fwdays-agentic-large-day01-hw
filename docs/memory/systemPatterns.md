# System Patterns (Excalidraw Verified Memory)

## Summary
- Implementation-level architecture patterns verified in current source.
- Focuses on orchestration, state flow, lifecycle, and collaboration boundaries.

## Current State

- Editor orchestration in `packages/excalidraw/components/App.tsx`
- Public React entrypoint and providers in `packages/excalidraw/index.tsx`
- Hosted collaboration and persistence integration in `excalidraw-app/collab/*` and `excalidraw-app/data/firebase.ts`

### 1) Integration Surface: React + Imperative API

- `packages/excalidraw/index.tsx` exports:
  - `ExcalidrawAPIProvider`, which provides `ExcalidrawAPIContext` and `ExcalidrawAPISetContext` for host-side imperative access
  - `Excalidraw`, a memoized wrapper that renders internal `<App />`
- `packages/excalidraw/components/App.tsx` defines React contexts including:
  - `ExcalidrawAPIContext` and `ExcalidrawAPISetContext`
  - `ExcalidrawAppStateContext` and `ExcalidrawSetAppStateContext`
  - `ExcalidrawActionManagerContext` (internal only; external use goes through `useExcalidrawActionManager()`)

### 2) Two-State-Plane Model

- Editor model state:
  - `App.tsx` keeps core editor model state in `this.state` (`AppState`)
- UI atom state:
  - `packages/excalidraw/index.tsx` wraps the editor with `EditorJotaiProvider`
  - `App.tsx` reads Jotai-backed atoms during render, for example `convertElementTypePopupAtom` via `editorJotaiStore.get(...)`

### 3) Controller Architecture: `ActionManager` + `syncActionResult`

- In the `App.tsx` constructor, the editor creates:
  - `this.scene = new Scene()`
  - `this.renderer = new Renderer(this.scene)`
  - `this.store = new Store(this)`
  - `this.history = new History(this.store)` (assigned twice in constructor)
  - `this.actionManager = new ActionManager(this.syncActionResult, ...)`
  - action registrations via `registerAll(actions)`, `createUndoAction(this.history)`, and `createRedoAction(this.history)`
- The action-to-model bridge is `public syncActionResult`:
  - executes in `withBatchedUpdates(...)`
  - schedules store capture via `this.store.scheduleAction(actionResult.captureUpdate)`
  - applies element updates with `this.scene.replaceAllElements(actionResult.elements)`
  - applies file updates via `this.addMissingFiles(...)` and `this.addNewImagesToImageCache()`
  - applies app state updates via `this.setState(...)` (including `contextMenu: null` and `editingTextElement` normalization)
  - triggers redraw with `this.scene.triggerUpdate()` when no other update path does

### 4) Rendering Pipeline (`render()` -> `renderer.getRenderableElements`)

- `App.tsx` computes viewport-filtered renderables by calling:
  - `this.renderer.getRenderableElements({ sceneNonce, zoom, offsetLeft, offsetTop, scrollX, scrollY, height, width, editingTextElement, newElementId })`
- The result is also stored as `this.visibleElements` for downstream logic.

### 5) Lifecycle and Resource Management

- `componentDidMount` in `App.tsx`:
  - sets `this.unmounted = false`
  - creates `this.api` via `this.createExcalidrawAPI()`
  - sets `this.excalidrawContainerValue.container = this.excalidrawContainerRef.current`
  - exposes debug hooks on `window.h` (test/dev path)
  - subscribes store durable increments with `this.history.record(increment.delta)`
  - subscribes scene updates with `this.scene.onUpdate(this.triggerRender)`
  - registers events via `this.addEventListeners()`
  - initializes from URL params:
    - if `web-share-target` exists: `this.restoreFileFromShare()`
    - otherwise: `this.updateDOMRect(this.initializeScene)`
  - emits mount lifecycle events and host callbacks (`props.onMount`, `props.onExcalidrawAPI`)
- `componentWillUnmount` in `App.tsx`:
  - marks API destroyed and invalidates `get*`, `onStateChange`, and `onEvent` methods by replacing them with throwing functions
  - emits unmount lifecycle events and host callbacks (`props.onUnmount`, `props.onExcalidrawAPI(null)`)
  - destroys and recreates core view-model objects (`renderer`, `scene`, `Fonts`, `Renderer`)
  - clears caches and event emitters
  - resets `document.documentElement.style.overscrollBehaviorX = ""`

### 6) Event Listener Strategy

- `addEventListeners` first removes existing listeners via `this.removeEventListeners()`.
- It registers global and container listeners through `this.onRemoveEventListenersEmitter.once(addEventListener(...))`.

### 7) Module-Scope State (Shared Within Module)

- `App.tsx` keeps several module-level variables outside the class, including:
  - touch state: `didTapTwice`, `tappedTwiceTimer`, `firstTapPosition`
  - media state: `YOUTUBE_VIDEO_STATES` (`Map` used by `onWindowMessage`)
  - paste state: `IS_PLAIN_PASTE`, `IS_PLAIN_PASTE_TIMER`, `PLAIN_PASTE_TOAST_SHOWN`
  - gesture state: `gesture` with shared pointer map
- Keyboard shortcuts update plain-paste module state:
  - in `onKeyDown`, `Ctrl/Cmd + V` with `event.shiftKey` sets `IS_PLAIN_PASTE = true`, resets the timer, then clears after 100ms
- `onWindowMessage` updates video state:
  - filters `event.origin` (YouTube/Vimeo), parses message JSON, and updates `YOUTUBE_VIDEO_STATES` when `data.event === "infoDelivery"` and `data.info.playerState` is numeric and in `YOUTUBE_STATES`

### 8) Collaboration Boundary: Encrypted Socket Updates + Firebase Persistence

- `excalidraw-app/data/firebase.ts` provides persistence helpers that:
  - initialize Firebase (`initializeApp`) and create Firestore/Storage clients
  - encrypt scene elements with a `roomKey` (`encryptData` and `decryptData`)
  - write scene updates through Firestore transactions (`runTransaction` + `doc(...)`)
  - upload files via Storage (`uploadBytes`)
- `excalidraw-app/collab/Portal.tsx` provides collaboration transport that:
  - stores `socket`, `roomId`, and `roomKey`
  - on `open(socket, id, key)`, listens for `init-room`, `new-user`, and `room-user-change`, then emits `join-room` on `init-room`
  - in `broadcastScene(...)`, encrypts payloads with `encryptData(this.roomKey!, encoded)` and emits encrypted buffers (`encryptedBuffer` and `iv`) through `this.socket.emit(...)`

## Actions
- Keep this file as the canonical architecture behavior map.
- Refresh patterns when state flow, lifecycle, or collaboration transport changes.

## Source Checkpoints
- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/index.tsx`
- `excalidraw-app/collab/Portal.tsx`
- `excalidraw-app/data/firebase.ts`

## Related Documentation

- [`../technical/architecture.md`](../technical/architecture.md)
- [`../technical/code-notes.md`](../technical/code-notes.md)
- [`../technical/dev-setup.md`](../technical/dev-setup.md)
- [`../product/PRD.md`](../product/PRD.md)
- [`../product/domain-glossary.md`](../product/domain-glossary.md)