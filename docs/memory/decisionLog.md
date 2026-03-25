# Decision Log (Condensed, Verified)

## Context
The condensed log below summarizes architectural and risk-related observations directly grounded in the existing implementation in `packages/excalidraw/components/App.tsx`, `packages/excalidraw/index.tsx`, and collaboration modules under `excalidraw-app/`.

## Finding 1: `App.tsx` acts as the editor engine/orchestrator
- `App.tsx` constructs and owns the core model/controller objects in its constructor:
  - `this.scene = new Scene()`
  - `this.renderer = new Renderer(this.scene)`
  - `this.store = new Store(this)`
  - `this.history = new History(this.store)` (assigned twice in the constructor)
  - `this.actionManager = new ActionManager(this.syncActionResult, ...)`
  - `this.actionManager.registerAll(actions)`
  - `this.actionManager.registerAction(createUndoAction(this.history))`
  - `this.actionManager.registerAction(createRedoAction(this.history))`

## Finding 2: Action results are funneled through a single mutation bridge
- `public syncActionResult = withBatchedUpdates((actionResult: ActionResult) => { ... })`
- Inside `syncActionResult`, the update order is:
  - if `this.unmounted` or `actionResult === false`, return early
  - schedule store capture:
    - `this.store.scheduleAction(actionResult.captureUpdate)`
  - if `actionResult.elements` exists:
    - `this.scene.replaceAllElements(actionResult.elements)`
  - if `actionResult.files` exists:
    - `this.addMissingFiles(...)`
    - `this.addNewImagesToImageCache()`
  - if appState (or editing text / context menu) exists:
    - compute `viewModeEnabled`, `zenModeEnabled`, `theme`, `name`, `errorMessage`
    - set `contextMenu: null`
    - normalize `editingTextElement` to point to the latest element instance when replacements happen
    - `this.setState(...)` merges updated fields
  - if nothing else updated:
    - force redraw via `this.scene.triggerUpdate()`

## Finding 3: Lifecycle establishes and then invalidates host-facing API
- `componentDidMount` responsibilities (verified):
  - `this.unmounted = false`
  - `this.api = this.createExcalidrawAPI()`
  - sets container ref: `this.excalidrawContainerValue.container = this.excalidrawContainerRef.current`
  - subscribes to history recording:
    - `this.store.onDurableIncrementEmitter.on((increment) => this.history.record(increment.delta))`
  - connects scene updates to React updates:
    - `this.scene.onUpdate(this.triggerRender)`
  - calls `this.addEventListeners()`
  - initializes from URL search params:
    - if `web-share-target` exists: `this.restoreFileFromShare()`
    - else: `this.updateDOMRect(this.initializeScene)`
  - emits mount lifecycle events and calls host callbacks (`props.onMount`, `props.onExcalidrawAPI`)
- `componentWillUnmount` responsibilities (verified):
  - marks API as destroyed: `this.api = { ...this.api, isDestroyed: true }`
  - overwrites `get*`, `onStateChange`, `onEvent` methods to throw after unmount
  - destroys and recreates core objects:
    - `this.renderer.destroy()`, `this.scene.destroy()`
    - `this.scene = new Scene()`, `this.fonts = new Fonts(...)`, `this.renderer = new Renderer(...)`
  - clears caches and resources:
    - `this.files = {}`, `this.imageCache.clear()`, `this.resizeObserver?.disconnect()`
    - clears emitters and calls `ShapeCache.destroy()`, `SnapCache.destroy()`
    - stops trails and clears timeouts (`clearTimeout(touchTimeout)`)
  - resets overscroll behavior:
    - `document.documentElement.style.overscrollBehaviorX = ""`

## Finding 4: Module-scope variables exist (shared within the module)
- `App.tsx` defines multiple variables outside the `App` class (module scope), including:
  - `didTapTwice`, `tappedTwiceTimer`, `firstTapPosition`
  - `YOUTUBE_VIDEO_STATES` (a module-level `Map`)
  - `IS_PLAIN_PASTE`, `IS_PLAIN_PASTE_TIMER`, `PLAIN_PASTE_TOAST_SHOWN`
  - shared gesture tracking object `gesture`

## Finding 5: Shortcut/gesture state is represented with module-scope flags
- In the keyboard handler inside `App.tsx`, when the user presses Ctrl/Cmd+V with `event.shiftKey`:
  - `IS_PLAIN_PASTE = event.shiftKey`
  - clears/sets `IS_PLAIN_PASTE_TIMER`
  - resets `IS_PLAIN_PASTE` after 100ms

## Finding 6: YouTube/Vimeo embed messages update module-scope state
- `onWindowMessage(event: MessageEvent)`:
  - filters by `event.origin` for:
    - `https://player.vimeo.com`
    - `https://www.youtube.com`
  - parses `event.data` as JSON
  - for YouTube messages:
    - checks `data.event === "infoDelivery"`, verifies `data.info.playerState` is numeric
    - writes player state into `YOUTUBE_VIDEO_STATES` using `data.id`

## Finding 7: Event listeners are managed through an indirection layer
- `addEventListeners` begins by calling `this.removeEventListeners()` to avoid duplication.
- `removeEventListeners` triggers a cleanup emitter (`this.onRemoveEventListenersEmitter.trigger()`).
- `addEventListeners` registers DOM/global handlers using `this.onRemoveEventListenersEmitter.once(addEventListener(...))`.

## Finding 8: Collaboration persistence uses Firebase + encrypted socket transport
- `excalidraw-app/data/firebase.ts`:
  - initializes Firebase (`initializeApp(FIREBASE_CONFIG)`)
  - uses Firestore (`getFirestore`, `doc`, `runTransaction`)
  - uses Storage (`getStorage`, `uploadBytes`)
  - encrypts elements with a `roomKey` via `encryptData` / `decryptData`
- `excalidraw-app/collab/Portal.tsx`:
  - keeps `socket`, `roomId`, `roomKey`
  - encrypts outbound socket updates with `encryptData(this.roomKey!, encoded)`
  - emits updates using `this.socket.emit(...)`.

---

## Key design decisions (derived directly from verified implementation)
1. Use a centralized “single bridge” for editor mutations.
   - Actions compute an `ActionResult`.
   - `App.syncActionResult` then applies it to `Store`/`Scene` and merges the relevant fields into React `AppState`.
2. Split state into two planes: editor model (`AppState` in React) vs. UI atoms (Jotai).
   - `packages/excalidraw/index.tsx` wraps the editor with `EditorJotaiProvider`.
   - `packages/excalidraw/components/App.tsx` reads editor UI atoms during render (example: Jotai store lookup for panel visibility).
3. Invalidate host-facing API on unmount to prevent stale subscriptions.
   - `componentWillUnmount` sets `api.isDestroyed = true` and replaces `get*`/`onStateChange`/`onEvent` functions with throwing stubs.
4. Prevent duplicate DOM/global event registrations via an explicit add/remove indirection.
   - `addEventListeners` begins by calling `removeEventListeners` and registers handlers using `onRemoveEventListenersEmitter.once(...)`.
5. Treat collaboration as encrypted transport + encrypted persistence.
   - Outbound collab updates are encrypted before emitting over the socket.
   - Scene contents are encrypted before storing in Firestore.
6. Support “plain paste” as a distinct input mode.
   - A module-scope flag (`IS_PLAIN_PASTE`) is set in the keyboard handler for `Ctrl/Cmd+V` when `shiftKey` is held.
   - Paste handling uses this flag to decide whether pasted content should be interpreted as embeds vs. plain text.

--
 
## links:

### undocumented behavior

  see: docs/technical/code-notes.md
  look through it every time you make changes to related code and features