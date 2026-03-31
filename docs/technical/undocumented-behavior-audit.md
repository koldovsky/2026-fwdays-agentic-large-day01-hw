# Undocumented Behavior Audit

- Review date: 2026-04-01
- Scope: production-path code in `excalidraw-app/` and core runtime in `packages/excalidraw/`, with supporting findings from `packages/element/`, `packages/common/`, `packages/math/`, and `packages/utils/`
- Audit type: source-only audit of undocumented behavior, implicit state, hidden side effects, initialization-order dependencies, and explicit technical-debt markers

## Summary

The main concentration of undocumented behavior is not in isolated helpers but in runtime orchestration boundaries:

1. collaboration lifecycle in `excalidraw-app/collab/Collab.tsx` and `excalidraw-app/collab/Portal.tsx`
2. scene bootstrap and re-bootstrap in `excalidraw-app/App.tsx`
3. persistence coupling across `LocalData`, Firebase, tab sync, and file-status tracking
4. editor readiness and lifecycle ordering in `packages/excalidraw/components/App.tsx`
5. global DOM/listener orchestration in `packages/excalidraw/wysiwyg/textWysiwyg.tsx`

The codebase is functional and internally consistent in many places, but several important behaviors are encoded as combinations of flags, timers, nullable fields, top-level module side effects, and event ordering instead of a single explicit model.

## Method

Reviewed:

- `docs/technical/architecture.md`
- root `package.json`
- app and editor entrypoints
- collaboration, persistence, Firebase, bootstrap, and WYSIWYG hot paths
- explicit `HACK` / `FIXME` / `TODO` markers in workspace packages

Focus was on production-path behavior first. Test-only markers are included only when they expose architectural smells or lifecycle fragility.

## Priority Findings

### P1 — Collaboration lifecycle is an implicit state machine

**Files**

- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/collab/Portal.tsx`

**Evidence**

- `isCollaboratingAtom` is managed separately from socket/session readiness
- `Portal` keeps `socket`, `socketInitialized`, `roomId`, `roomKey`, and `broadcastedElementVersions`
- `Collab.startCollaboration()` sets collaboration mode before full socket initialization
- `Collab.initializeRoom()` independently flips `portal.socketInitialized = true`
- save/broadcast behavior is gated by `portal.socketInitialized`

**Why this is undocumented behavior**

The collaboration lifecycle is distributed across booleans, nullable fields, timers, and event handlers instead of an explicit state model such as `idle -> connecting -> joined -> initialized -> active -> stopping -> stopped`.

**Observed state carriers**

- `isCollaboratingAtom`
- `portal.socket`
- `portal.socketInitialized`
- `activeRoomLink`
- `lastBroadcastedOrReceivedSceneVersion`
- `socketInitializationTimer`
- `activeIntervalId` / `idleTimeoutId`

**Risk**

- hard-to-reason-about intermediate states
- race sensitivity around room join / initial scene sync
- brittle future changes in save/broadcast behavior

**Recommended follow-up**

- document an explicit collaboration state diagram
- centralize readiness conditions behind one derived runtime state
- document event ordering for `connect_error`, `first-in-room`, `client-broadcast`, timeout fallback, and teardown

### P1 — Scene bootstrap and hash-driven reinitialization are order-sensitive

**File**

- `excalidraw-app/App.tsx`

**Evidence**

- `initializeScene()` merges multiple inputs: URL params, hash, local storage, collaboration link, backend import, and document visibility
- hidden-tab handling defers initialization until `focus`
- `hashchange` can stop collaboration, set `isLoading`, re-run initialization, restore scene state, and push the result back through `excalidrawAPI.updateScene(...)`
- bootstrap mutates browser history via `window.history.replaceState(...)` / `pushState(...)`

**Why this is undocumented behavior**

The effective startup state depends on a combination of:

- `window.location.search`
- `window.location.hash`
- local browser state
- collaboration state
- confirmation modal result
- `document.hidden`

This is effectively a state machine, but it is encoded procedurally.

**Risk**

- difficult-to-predict boot behavior across tabs and deep links
- regressions when changing import/share/collab entrypoints
- hidden coupling between routing state and persistence state

**Recommended follow-up**

- document a bootstrap decision table
- isolate hash/url interpretation from scene-loading side effects
- separate “decide source of truth” from “apply scene to editor”

### P1 — Persistence behavior is spread across local storage, IndexedDB, Firebase, and visibility state

**Files**

- `excalidraw-app/data/LocalData.ts`
- `excalidraw-app/data/firebase.ts`
- `excalidraw-app/data/fileStatusStore.ts`
- `excalidraw-app/App.tsx`

**Evidence**

- `LocalData.isSavePaused()` depends on `document.hidden` and a `Locker`
- collaboration pauses local save via `LocalData.pauseSave("collaboration")`
- local save writes to `localStorage`, IndexedDB, and browser-state version keys
- Firebase scene persistence and image-file persistence use separate flows
- export waits on a separate `FileStatusStore` snapshot pipeline rather than a single editor-owned file readiness model

**Why this is undocumented behavior**

The persistence model is correct only if several subsystems remain in sync:

- local scene save
- local file save
- browser tab versioning
- collab save pause/resume
- Firebase room save
- file loading status snapshots

No single contract describes how these layers interact.

**Risk**

- hidden data-loss edge cases
- unclear ownership of file readiness
- coupling between visibility lifecycle and persistence correctness

**Recommended follow-up**

- document persistence ownership by data type: scene, app state, library, files, room state
- define which layer is authoritative for file readiness
- document pause/resume semantics and expected behavior during collaboration

### P2 — Editor readiness contract depends on lifecycle ordering

**File**

- `packages/excalidraw/components/App.tsx`

**Evidence**

- editor API is created before full initialization
- `componentDidMount()` emits mount-related hooks
- `componentDidUpdate()` emits `editor:initialize` / `onInitialize` only when `_initialized` is false and `state.isLoading` becomes false
- initial data loading and state restoration are handled asynchronously in `initializeScene()`

**Why this is undocumented behavior**

There is an important distinction between:

- mounted editor container
- available API object
- initialized editor state

That distinction is real in code, but easy for integrators to miss.

**Risk**

- host integrations using API too early
- confusion between `onMount` and `onInitialize`
- subtle bugs when consumers assume scene is ready at first API exposure

**Recommended follow-up**

- explicitly document the lifecycle contract for integrators
- define what is safe in `onMount` vs `onInitialize`
- expose a clearer readiness signal if needed

### P2 — WYSIWYG text editor has heavy global side effects and cleanup sensitivity

**File**

- `packages/excalidraw/wysiwyg/textWysiwyg.tsx`

**Evidence**

- manual `window` listeners for `pointerdown`, `pointerup`, `blur`, `beforeunload`, `resize`
- `ResizeObserver` lifecycle is manually managed
- DOM node is appended and removed imperatively
- focus is manipulated manually
- code comments already mention late-firing events and flaky behavior

**Why this is undocumented behavior**

This subsystem behaves like a mini-runtime with its own lifecycle rules outside ordinary React component structure.

**Risk**

- memory leaks
- event timing regressions
- test flakiness and cross-browser differences

**Recommended follow-up**

- document the lifecycle of the text editor overlay
- reduce global listener surface where possible
- explicitly define cleanup guarantees and failure modes

### P2 — Import-time module side effects create initialization-order dependencies

**Files**

- `excalidraw-app/index.tsx`
- `excalidraw-app/App.tsx`
- `packages/excalidraw/index.tsx`
- `excalidraw-app/sentry.ts`
- `excalidraw-app/data/firebase.ts`

**Evidence**

- service worker registration at entrypoint
- top-level `polyfill()` calls
- top-level `beforeinstallprompt` listener
- top-level Sentry initialization
- Firebase config parsing and lazy module singletons

**Why this is undocumented behavior**

Importing a module is not a neutral action in several runtime-critical places. Behavior depends on modules having been loaded in the expected order and environment.

**Risk**

- surprising side effects in tests and alternate embeds
- harder future refactoring toward SSR or multi-host contexts
- hidden global state surviving across test/runtime boundaries

**Recommended follow-up**

- document all module-scope initialization with side effects
- minimize import-time behavior where it is not strictly required
- group bootstrap side effects into explicit startup layers

## Explicit Technical-Debt Markers

### Runtime / production-path markers

- `excalidraw-app/App.tsx:417` — `TODO maybe remove this in several months`
- `excalidraw-app/collab/Collab.tsx:499` — `TODO: ImportedDataState type here seems abused`
- `packages/excalidraw/index.tsx:105` — `FIXME normalize/set defaults in parent component...`
- `packages/excalidraw/wysiwyg/textWysiwyg.tsx:964` — `FIXME after we start emitting updates from Store for appState.theme`
- `packages/excalidraw/components/App.tsx:7126` — `HACK: Disable transform handles for linear elements on mobile...`
- `packages/excalidraw/components/LayerUI.tsx:111` — `FIXME`
- `packages/excalidraw/components/LayerUI.tsx:113` — `FIXME`
- `packages/excalidraw/components/EyeDropper.tsx:105` — `FIXME swap offset when the preview gets outside viewport`
- `packages/excalidraw/actions/actionCanvas.tsx:73` — `FIXME move me...`
- `packages/element/src/selection.ts:138` — `FIXME move this into the editor instance to keep utility methods stateless`
- `packages/element/src/store.ts:109` — `TODO: Suspicious that this is called so many places. Seems error-prone.`
- `packages/element/src/store.ts:434` — `TODO` on making store increments closer to `onChange`
- `packages/element/src/sizeHelpers.ts:27` — `TODO` about removing invisible elements consistently across persistence/broadcast/export
- `packages/element/src/frame.ts:752` — `TODO: this a huge bottleneck for large scenes, optimise`
- `packages/element/src/positionElementsOnGrid.ts:6` — `TODO rewrite (mostly vibe-coded)`
- `packages/common/src/colors.ts:116` — `FIXME can't put to utils.ts rn because of circular dependency`
- `packages/common/src/points.ts:67` — `TODO` on point rounding shake during free draw
- `packages/math/src/types.ts:42` — `TODO` migrate toward `Point` tuples
- `packages/math/src/types.ts:60` — `TODO` migrate toward `Point` tuples
- `packages/math/src/point.ts:26` — `TODO remove the overload once we migrate to using Point tuples everywhere`
- `packages/math/src/point.ts:30` — `TODO remove the overload once we migrate to using Point tuples everywhere`
- `packages/math/src/point.ts:169` — `TODO` formalize global/local coordinate translation
- `packages/utils/src/shape.ts:361` — `TODO: Replace with final rounded rectangle code`

### Test-only markers that expose runtime smells

- `packages/excalidraw/tests/selection.test.tsx:250` — `TODO: There is a memory leak if pointer up is not triggered`
- `packages/excalidraw/tests/selection.test.tsx:273` — `TODO: There is a memory leak if pointer up is not triggered`
- `packages/excalidraw/wysiwyg/textWysiwyg.test.tsx:335` — `FIXME too flaky. No one knows why.`
- `packages/utils/tests/export.test.ts:94` — `FIXME the utils.exportToSvg no longer filters out deleted elements.`
- `packages/element/tests/frame.test.tsx:336` — `FIXME failing in tests...`
- `packages/element/tests/zindex.test.tsx:1322` — `FIXME incorrect, should put F1_1 after R3`
- `packages/element/tests/zindex.test.tsx:1325` — `FIXME should be noop from previous step after it's fixed`

### Notes on `WORKAROUND`

A literal `WORKAROUND` marker did not surface in the inspected paths, but workaround-style behavior does exist, notably:

- `excalidraw-app/collab/Collab.tsx:380-382` — browser-state reset hack during collaboration stop
- `packages/excalidraw/wysiwyg/textWysiwyg.tsx:948-950` — test-environment-specific hack commentary
- `excalidraw-app/App.tsx:174-187` — intentionally early global listener registration for PWA install prompt capture

## Concrete Examples of Hidden Coupling

### Collaboration toggles local persistence policy

`Collab.startCollaboration()` pauses local save, and `destroySocketClient()` resumes it. This means collaboration mode is not only a transport concern; it also mutates browser persistence semantics.

### File export depends on out-of-band file status tracking

Export readiness is determined through `FileStatusStore` snapshots rather than a single editor-owned readiness model. This introduces a second state channel that must remain consistent with scene/file reality.

### Utility code is not always stateless

`packages/element/src/selection.ts` contains memoized module-local cache in `isSomeElementSelected`, and the file itself acknowledges this should move into editor instance state. This is a small but explicit example of hidden shared state.

## Recommended Next Actions

### Fix or document now

- collaboration lifecycle contract
- bootstrap decision flow for scene sources
- persistence ownership and pause/resume semantics
- host integration contract for `onMount` vs `onInitialize`

### Schedule for targeted refactor

- WYSIWYG lifecycle isolation
- reduction of import-time side effects
- explicit readiness model for file loading/export
- store capture call graph around `scheduleCapture()`

### Keep visible as technical debt

- circular-dependency workaround in `packages/common/src/colors.ts`
- statelessness violation in `packages/element/src/selection.ts`
- math tuple migration notes in `packages/math/`
- performance hotspots in `packages/element/src/frame.ts`

## Suggested Follow-up Docs

If this audit is kept, the next useful docs would be:

1. `docs/technical/collaboration-lifecycle.md`
2. `docs/technical/scene-bootstrap-flow.md`
3. `docs/technical/persistence-ownership.md`
4. `docs/technical/editor-lifecycle-contract.md`

## Audit Confidence

Medium-high.

The findings are based on direct source inspection of the hottest runtime paths and explicit debt markers, but not on runtime tracing, integration test execution, or production telemetry review.

