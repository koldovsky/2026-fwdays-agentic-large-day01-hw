# Architecture
This document summarizes the project architecture from workspace source code only.
Scope rules used for this document:
- Source files were taken from `excalidraw-app`, `packages/*`, root workspace manifests, and workspace TypeScript configuration.
- Files listed in `.cursorignore` were excluded from the research set.
- Statements below describe code paths, imports, manifests, and runtime behavior visible in the repository.
Primary source groups:
- `package.json`
- `tsconfig.json`
- `excalidraw-app/index.tsx`
- `excalidraw-app/App.tsx`
- `excalidraw-app/app-jotai.ts`
- `excalidraw-app/data/LocalData.ts`
- `excalidraw-app/collab/Collab.tsx`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/appState.ts`
- `packages/excalidraw/actions/manager.tsx`
- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/components/canvases/*`
- `packages/excalidraw/renderer/*`
- `packages/excalidraw/scene/Renderer.ts`
- `packages/excalidraw/history.ts`
- `packages/element/src/Scene.ts`
- `packages/element/src/store.ts`
- `packages/element/src/mutateElement.ts`
- `packages/element/src/index.ts`
- `packages/utils/src/index.ts`
- `packages/*/package.json`
## High-level Architecture
The root workspace is a Yarn workspaces monorepo.
Root `package.json` declares these workspaces:
- `excalidraw-app`
- `packages/*`
- `examples/*`
Root `tsconfig.json` maps internal package names directly to workspace source files:
- `@excalidraw/common` -> `packages/common/src/index.ts`
- `@excalidraw/excalidraw` -> `packages/excalidraw/index.tsx`
- `@excalidraw/element` -> `packages/element/src/index.ts`
- `@excalidraw/math` -> `packages/math/src/index.ts`
- `@excalidraw/utils` -> `packages/utils/src/index.ts`
The browser entry for the application is `excalidraw-app/index.tsx`.
`excalidraw-app/index.tsx` does the following:
- imports `../excalidraw-app/sentry`
- sets `window.__EXCALIDRAW_SHA__`
- registers the PWA service worker through `registerSW()`
- creates a React root with `createRoot()`
- renders `<ExcalidrawApp />` inside `StrictMode`
`excalidraw-app/App.tsx` is the host application layer around the reusable editor package.
`excalidraw-app/App.tsx` imports the main editor API from `@excalidraw/excalidraw`:
- `Excalidraw`
- `ExcalidrawAPIProvider`
- `useExcalidrawAPI`
- `useEditorInterface`
- `CaptureUpdateAction`
- `reconcileElements`
The reusable editor package entry is `packages/excalidraw/index.tsx`.
`packages/excalidraw/index.tsx`:
- exports the `Excalidraw` React component
- wraps the internal class-based `App` component in `EditorJotaiProvider`
- provides `ExcalidrawAPIProvider`
- re-exports many functions from `@excalidraw/common`, `@excalidraw/element`, and `@excalidraw/utils`
The internal editor runtime is centered in `packages/excalidraw/components/App.tsx`.
The class constructor in `packages/excalidraw/components/App.tsx` creates these core runtime objects:
- `this.library = new Library(this)`
- `this.actionManager = new ActionManager(...)`
- `this.scene = new Scene()`
- `this.canvas = document.createElement("canvas")`
- `this.rc = rough.canvas(this.canvas)`
- `this.renderer = new Renderer(this.scene)`
- `this.store = new Store(this)`
- `this.history = new History(this.store)`
- `this.fonts = new Fonts(this.scene)`
The runtime responsibilities are split across packages:
- `excalidraw-app` hosts product-specific UI, persistence adapters, collaboration adapters, share/export flows, and app-level Jotai atoms.
- `packages/excalidraw` contains the editor component, actions, renderer orchestration, history, export logic, and React canvas wrappers.
- `packages/element` contains scene data structures, element mutation, selection helpers, rendering primitives, deltas, and store snapshot logic.
- `packages/common` contains shared constants, utilities, events, and helpers used across packages.
- `packages/math` contains geometry and numeric helpers used by common, element, and editor rendering logic.
- `packages/utils` exports utility helpers and also re-exports `getCommonBounds` from `@excalidraw/element`.
```mermaid
flowchart TD
    Browser[Browser]
    Entry[excalidraw-app/index.tsx]
    Host[excalidraw-app/App.tsx]
    EditorPkg[packages/excalidraw/index.tsx]
    EditorApp[packages/excalidraw/components/App.tsx]
    Scene[packages/element/src/Scene.ts]
    Store[packages/element/src/store.ts]
    History[packages/excalidraw/history.ts]
    Renderer[packages/excalidraw/scene/Renderer.ts]
    StaticCanvas[StaticCanvas]
    DraftCanvas[NewElementCanvas]
    InteractiveCanvas[InteractiveCanvas]
    LocalData[excalidraw-app/data/LocalData.ts]
    Firebase[excalidraw-app/data/firebase.ts]
    Backend[excalidraw-app/data/index.ts]
    Collab[excalidraw-app/collab/Collab.tsx]
    Common[@excalidraw/common]
    Element[@excalidraw/element]
    Math[@excalidraw/math]
    Utils[@excalidraw/utils]
    Browser --> Entry
    Entry --> Host
    Host --> EditorPkg
    Host --> LocalData
    Host --> Firebase
    Host --> Backend
    Host --> Collab
    EditorPkg --> EditorApp
    EditorApp --> Scene
    EditorApp --> Store
    EditorApp --> History
    EditorApp --> Renderer
    EditorApp --> StaticCanvas
    EditorApp --> DraftCanvas
    EditorApp --> InteractiveCanvas
    EditorPkg --> Common
    EditorPkg --> Element
    EditorPkg --> Math
    EditorPkg --> Utils
    Element --> Common
    Element --> Math
    Math --> Common
    Utils --> Element
```
## Data Flow: how data moves across ecosystem
### Startup and scene selection
`initializeScene()` in `excalidraw-app/App.tsx` is the main scene bootstrap function.
It reads these inputs from the browser URL and storage:
- query param `id`
- hash `#json=...`
- hash `#url=...`
- collaboration link data from `getCollaborationLinkData(window.location.href)`
- browser data from `importFromLocalStorage()`
The initial local scene is built from local storage data by:
- `restoreElements(localDataState?.elements, null, { repairBindings: true, deleteInvisibleElements: true })`
- `restoreAppState(localDataState?.appState, null)`
When a share-link backend hash is present:
- `importFromBackend()` loads the remote scene
- `restoreElements()` reconstructs elements
- `bumpElementVersions()` compares imported elements against local elements
- `restoreAppState(imported.appState, localDataState?.appState)` preserves local user settings that are not persisted on the server
When an external URL hash is present:
- `fetch()` downloads the referenced blob
- `loadFromBlob()` parses the downloaded scene payload
When a collaboration link is present and `collabAPI` exists:
- `collabAPI.startCollaboration(roomLinkData)` loads the room scene
- `restoreAppState()` merges remote app state with the current editor state
- `reconcileElements()` merges remote elements with current scene elements from the imperative API
### Image and file loading
`loadImages()` in `excalidraw-app/App.tsx` collects image file IDs from scene elements.
The file source depends on where the scene came from:
- external shared scenes use `loadFilesFromFirebase()` with `FIREBASE_STORAGE_PREFIXES.shareLinkFiles`
- initial local scenes use `LocalData.fileStorage.getFiles(fileIds)`
- collaboration scenes use `collabAPI.fetchImageFilesFromFirebase(...)`
Loaded files flow back into the editor through:
- `excalidrawAPI.addFiles(loadedFiles)`
Stale or failed image statuses are reconciled through:
- `updateStaleImageStatuses(...)`
- `FileStatusStore.updateStatuses(...)`
### Cross-tab synchronization
`syncData()` in `excalidraw-app/App.tsx` is debounced with `SYNC_BROWSER_TABS_TIMEOUT`.
It runs on focus and visibility events when the app is not actively collaborating.
For scene state sync:
- `isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_DATA_STATE)` checks whether browser storage is newer
- `importFromLocalStorage()` reloads the stored data
- `excalidrawAPI.updateScene({ ...localDataState, captureUpdate: CaptureUpdateAction.NEVER })` applies it without adding an undoable capture
For file sync:
- `isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_FILES)` checks file storage freshness
- `LocalData.fileStorage.getFiles(fileIds)` loads missing files from local file storage
- `excalidrawAPI.addFiles(loadedFiles)` attaches the loaded files to the current editor state
### Local persistence
The application-level `onChange()` handler in `excalidraw-app/App.tsx` receives:
- `elements`
- `appState`
- `files`
If collaboration is active, `onChange()` forwards elements to the collaboration layer:
- `collabAPI.syncElements(elements)`
If local save is not paused, `onChange()` persists locally through:
- `LocalData.save(elements, appState, files, onFilesSaved)`
`LocalData.save()` in `excalidraw-app/data/LocalData.ts`:
- checks `LocalData.isSavePaused()` synchronously
- delegates to a debounced private `_save()`
The debounced `_save()` does two things:
- `saveDataStateToLocalStorage(elements, appState)` writes JSON into `localStorage`
- `this.fileStorage.saveFiles({ elements, files })` persists binary files through the local file manager
`saveDataStateToLocalStorage()`:
- uses `clearAppStateForLocalStorage(appState)`
- writes non-deleted elements to `STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS`
- writes filtered app state to `STORAGE_KEYS.LOCAL_STORAGE_APP_STATE`
- updates the browser state version with `updateBrowserStateVersion(STORAGE_KEYS.VERSION_DATA_STATE)`
The local file manager is backed by `idb-keyval`:
- `createStore("files-db", "files-store")` creates the storage pair
- `getMany()`, `set()`, `setMany()`, `get()`, `del()`, and `entries()` are used in the implementation
### Save pausing and unload handling
`LocalData` owns a `Locker` and exposes:
- `pauseSave(lockType)`
- `resumeSave(lockType)`
- `isSavePaused()`
`LocalData.isSavePaused()` returns `true` when:
- `document.hidden`
- the locker is locked
`collab/Collab.tsx` uses this pause/resume API with the `"collaboration"` lock type.
`excalidraw-app/App.tsx` flushes pending local saves on:
- `unload`
- `blur`
- `visibilitychange`
- `beforeunload`
### Export and share-link flow
`onExportToBackend()` in `excalidraw-app/App.tsx` calls `exportToBackend(...)`.
When that call returns a URL:
- `setLatestShareableLink(url)` stores the latest generated link in React state
Inside `packages/excalidraw/data/index.ts`:
- `prepareElementsForExport()` filters the export set
- `exportCanvas()` routes to `exportToSvg()` or `exportToCanvas()` depending on export type
- PNG export can embed scene JSON metadata through `encodePngMetadata()` when `appState.exportEmbedScene` is enabled
## State Management: detailed summary (appState, elements, actionManager)
### appState
`packages/excalidraw/appState.ts` defines `getDefaultAppState()`.
The default app state includes editor UI state such as:
- theme
- active tool
- current item styling defaults
- zoom
- scroll offsets
- selection state
- sidebar and dialog state
- frame rendering settings
- export settings
- collaboration-related fields such as `collaborators`, `userToFollow`, and `followedBy`
`packages/excalidraw/appState.ts` also defines `APP_STATE_STORAGE_CONF`.
That configuration marks each `AppState` key for three storage/export targets:
- `browser`
- `export`
- `server`
The helper functions use that configuration:
- `clearAppStateForLocalStorage(appState)`
- `cleanAppStateForExport(appState)`
- `clearAppStateForDatabase(appState)`
This means full runtime `AppState` is larger than the subsets persisted to local storage or exported to files/server payloads.
`packages/element/src/store.ts` defines a smaller `ObservedAppState` projection used by the element store snapshot layer.
`getObservedAppState()` keeps only these app-state fields:
- `name`
- `editingGroupId`
- `viewBackgroundColor`
- `selectedElementIds`
- `selectedGroupIds`
- `croppingElementId`
- `activeLockedId`
- `lockedMultiSelections`
- `selectedLinearElement`, reduced to `elementId` and `isEditing`
The store uses this smaller projection when computing store changes and deltas.
### elements and scene
`packages/element/src/Scene.ts` owns the element collections for the current scene.
The `Scene` class keeps:
- all elements including deleted elements
- non-deleted elements array
- element maps for all elements and non-deleted elements
- cached frame arrays
- a selected-elements cache
- a `sceneNonce` used as a renderer cache invalidation nonce
`replaceAllElements()` in `Scene`:
- normalizes indices through `syncInvalidIndices()`
- rebuilds element maps
- rebuilds frame caches
- calls `triggerUpdate()`
`triggerUpdate()`:
- assigns a new random integer to `sceneNonce`
- calls every registered scene callback
`Scene.getSelectedElements()` caches selected-element results by:
- the current non-deleted elements collection
- the `selectedElementIds` object reference
- option flags for bound text and frame inclusion
`Scene.mutateElement()` is the scene-level mutation entry point for element updates.
It delegates to `mutateElement()` from `packages/element/src/mutateElement.ts`.
`mutateElement()`:
- updates the element in place
- normalizes elbow-arrow updates through `updateElbowArrowPoints()` when needed
- recalculates width and height from `points` updates when needed
- clears `ShapeCache` when size, file ID, or points change
- increments `version` unless an explicit version is supplied
- assigns a new `versionNonce` unless one is supplied
- updates the `updated` timestamp
`newElementWith()` creates an immutable copy with the same versioning and timestamp update behavior.
### store and history
`packages/element/src/store.ts` implements the editor store that emits change increments.
The store supports three capture modes:
- `CaptureUpdateAction.IMMEDIATELY`
- `CaptureUpdateAction.NEVER`
- `CaptureUpdateAction.EVENTUALLY`
The store maintains:
- a current `StoreSnapshot`
- scheduled macro actions
- scheduled micro actions
- `onDurableIncrementEmitter`
- `onStoreIncrementEmitter`
`Store.commit(elements, appState)`:
- flushes scheduled micro actions first
- chooses one macro action according to precedence
- processes the action into a new snapshot
- emits either a durable or ephemeral increment
`Store.getScheduledMacroAction()` applies this precedence order:
- `IMMEDIATELY` first
- `NEVER` second
- `EVENTUALLY` as the default
`StoreSnapshot`:
- stores a cloned element map and an observed app-state snapshot
- detects changed elements by added, removed, or higher-version elements
- ignores updates to uninitialized image elements when computing changed elements
- hashes changed elements and observed app state to suppress repeated `EVENTUALLY` notifications for identical content
`packages/excalidraw/components/App.tsx` subscribes history to the durable increment emitter:
- `this.store.onDurableIncrementEmitter.on((increment) => { this.history.record(increment.delta); })`
`packages/excalidraw/history.ts` then manages:
- `undoStack`
- `redoStack`
- conversion of store deltas into history deltas
- replay of undo and redo through `store.scheduleMicroAction(...)`
### actionManager
`packages/excalidraw/actions/manager.tsx` defines `ActionManager`.
The constructor is wired with:
- an updater function
- a getter for current app state
- a getter for elements including deleted elements
- the owning app instance
The manager stores actions in `actions: Record<ActionName, Action>`.
`registerAction()` stores one action by name.
`registerAll()` registers an array of actions.
`handleKeyDown()`:
- sorts actions by `keyPriority`
- filters by `UIOptions.canvasActions`
- runs each action's `keyTest(...)`
- rejects ambiguous shortcuts when more than one action matches
- blocks non-view-mode actions when `viewModeEnabled` is true
- calls `action.perform(...)` through the updater
`executeAction()`:
- reads current elements and app state
- tracks the action source
- calls `action.perform(...)`
- forwards the result through the updater
`renderAction()`:
- renders `PanelComponent` for actions that expose one
- passes `elements`, `appState`, `updateData`, `appProps`, `app`, `data`, and `renderAction`
In `packages/excalidraw/components/App.tsx`, the constructor creates the manager and then:
- `registerAll(actions)`
- registers `createUndoAction(this.history)`
- registers `createRedoAction(this.history)`
## Rendering Pipeline: starting from React component to canvas
The top-level browser render path is:
- `excalidraw-app/index.tsx` renders `<ExcalidrawApp />`
- `excalidraw-app/App.tsx` renders the host application around the reusable editor package
- `packages/excalidraw/index.tsx` renders `ExcalidrawBase`
- `ExcalidrawBase` renders the internal class-based `App` inside `EditorJotaiProvider` and `InitializeApp`
Inside `packages/excalidraw/components/App.tsx`, `render()` starts by deriving scene data for the current frame.
`render()` computes:
- `selectedElements = this.scene.getSelectedElements(this.state)`
- `sceneNonce = this.scene.getSceneNonce()`
- `{ elementsMap, visibleElements } = this.renderer.getRenderableElements(...)`
- `allElementsMap = this.scene.getNonDeletedElementsMap()`
`packages/excalidraw/scene/Renderer.ts` computes renderable elements in two steps:
- filters current scene elements into an `elementsMap` that excludes the currently edited text element and the current `newElement`
- filters those elements by viewport using `isElementInViewport(...)` to produce `visibleElements`
The React tree then mounts three canvas layers:
- `<StaticCanvas />`
- `<NewElementCanvas />` when `this.state.newElement` exists
- `<InteractiveCanvas />`
### Static canvas path
`packages/excalidraw/components/canvases/StaticCanvas.tsx`:
- sizes the backing canvas to `appState.width * scale` and `appState.height * scale`
- inserts the owned canvas element into a wrapper div on first mount
- calls `renderStaticScene(...)` on each render effect
- memoizes with `React.memo()` and a custom comparison that checks scene nonce, scale, element-map identity, visible elements identity, selected app-state fields, and render config
`packages/excalidraw/renderer/staticScene.ts` performs the canvas drawing.
Its flow is:
- normalize canvas dimensions
- call `bootstrapCanvas(...)`
- apply zoom with `context.scale(appState.zoom.value, appState.zoom.value)`
- optionally draw the grid through `strokeGrid(...)`
- paint visible non-iframe elements with `renderElement(...)`
- paint bound text elements with `renderElement(...)`
- render link icons when not exporting
- paint iframe-like and embeddable elements last
### New-element canvas path
`packages/excalidraw/components/canvases/NewElementCanvas.tsx` calls `renderNewElementScene(...)` in an effect.
`packages/excalidraw/renderer/renderNewElementScene.ts`:
- bootstraps a canvas context
- applies zoom
- skips invisibly small new elements
- optionally clips drawing to a frame
- calls `renderElement(...)` for the in-progress element
- clears the canvas when there is no drawable new element
### Interactive canvas path
`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`:
- builds render config for collaborators, remote selections, usernames, and remote pointer viewport coordinates
- stores the latest renderer params in a ref
- starts an animation loop through `AnimationController.start(...)`
- calls `renderInteractiveScene(...)` on each animation tick
`packages/excalidraw/renderer/interactiveScene.ts` draws editor-only overlays and interaction affordances.
The interactive renderer includes code paths for:
- selection rectangle rendering
- reset-auto-resize handle rendering
- text editing box rendering
- binding highlight rendering
- frame highlight rendering
- selected element borders
- transform handles
- crop handles
- search-match highlighting
- snap lines
- remote cursors
- scrollbars
`renderInteractiveScene(...)` returns:
- `scrollBars`
- `atLeastOneVisibleElement`
- `elementsMap`
- `animationState`
It also immediately invokes `renderConfig.callback(ret)`.
`packages/excalidraw/components/App.tsx` provides that callback as `this.renderInteractiveSceneCallback`.
That callback:
- updates the current scrollbar cache when scrollbars are returned
- computes whether the user has scrolled outside the visible scene
- updates `this.state.scrolledOutside` when needed
- schedules image refresh
### Commit after render-time reconciliation
Later in the same app component, `this.store.commit(elementsMap, this.state)` commits the latest scene map and app state into the store snapshot pipeline.
If the app is not loading, the component then notifies external listeners through:
- `this.props.onChange?.(elements, this.state, this.files)`
- `this.onChangeEmitter.trigger(elements, this.state, this.files)`
This means the canvas render path and the store/history path both consume the same scene and app-state sources owned by the editor `App` instance.
## Package Dependencies: connections between packages
### Declared workspace package edges from manifests
Root workspace configuration:
- root `package.json` defines Yarn workspaces for `excalidraw-app`, `packages/*`, and `examples/*`
Declared internal dependencies in package manifests:
- `packages/excalidraw/package.json` depends on `@excalidraw/common`
- `packages/excalidraw/package.json` depends on `@excalidraw/element`
- `packages/excalidraw/package.json` depends on `@excalidraw/math`
- `packages/element/package.json` depends on `@excalidraw/common`
- `packages/element/package.json` depends on `@excalidraw/math`
- `packages/math/package.json` depends on `@excalidraw/common`
- `examples/with-script-in-browser/package.json` depends on `@excalidraw/excalidraw`
### Source-level connections visible in imports and re-exports
`packages/excalidraw/index.tsx` re-exports API from other internal packages:
- exports scene/version helpers from `@excalidraw/element`
- exports canvas export helpers from `@excalidraw/utils/export`
- exports constants and helpers from `@excalidraw/common`
- exports mutation helpers and `CaptureUpdateAction` from `@excalidraw/element`
`packages/element/src/index.ts` re-exports many internal modules and publishes:
- scene utilities
- mutation helpers
- render helpers
- selection helpers
- store and delta helpers
`packages/utils/src/index.ts`:
- exports from `./export`
- exports from `./withinBounds`
- exports from `./bbox`
- re-exports `getCommonBounds` from `@excalidraw/element`
Source imports show these additional package-to-package edges:
- `packages/common/src/colors.ts` imports from `@excalidraw/math`
- `packages/common/src/points.ts` imports from `@excalidraw/math`
- `packages/element/src/linearElementEditor.ts` imports from `@excalidraw/utils/shape`
- `packages/element/src/bounds.ts` imports from `@excalidraw/utils/shape`
- `packages/element/src/frame.ts` imports from `@excalidraw/utils/bbox` and `@excalidraw/utils/withinBounds`
- `packages/excalidraw/hooks/useLibraryItemSvg.ts` imports from `@excalidraw/utils/export`
- `packages/excalidraw/components/ImageExportDialog.tsx` imports from `@excalidraw/utils/export`
- `packages/excalidraw/components/PublishLibrary.tsx` imports from `@excalidraw/utils/export`
### Effective package layering visible from source
The following layering is directly visible from manifests, path aliases, imports, or re-exports:
- `excalidraw-app` consumes `@excalidraw/excalidraw` and app-local data/collaboration modules.
- `@excalidraw/excalidraw` is the main editor-facing package and composes runtime editor behavior.
- `@excalidraw/element` provides the core scene, element, delta, and store primitives used by the editor package.
- `@excalidraw/common` and `@excalidraw/math` provide shared low-level helpers.
- `@excalidraw/utils` exposes export and geometry utilities and also re-exports an element helper.
### Package dependency summary
From the code inspected, the internal package network is centered on the reusable editor package:
- `excalidraw-app` hosts the product application
- `@excalidraw/excalidraw` hosts the editor runtime
- `@excalidraw/element` hosts scene and element state primitives
- `@excalidraw/common` and `@excalidraw/math` sit underneath multiple packages
- `@excalidraw/utils` provides utility exports that are consumed by both `@excalidraw/excalidraw` and `@excalidraw/element` source files
