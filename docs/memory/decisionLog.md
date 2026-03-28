# Decision log

**Key decisions** inferred from **implemented behavior** in this repo (not historical meeting notes). For layered architecture of the editor, see **`systemPatterns.md`**.

---

## Platform and tooling

- **Yarn 1 workspaces** — Single install and cross-package scripts; root `package.json` `packageManager` / `workspaces`.
- **Vite for the app and examples; esbuild for library packages** — Root scripts delegate to `yarn --cwd ./excalidraw-app` and `packages/*/build:esm`-style builds.
- **Vitest + jsdom** for tests — Root `devDependencies` and `vitest.config` usage across `packages/excalidraw/tests`.

---

## Editor architecture (summary)

- **Class-based `App` as controller** — `packages/excalidraw/components/App.tsx`: `AppState` in React state, elements on `Scene`, undo via `Store`/`History`, `syncActionResult` as the main bridge (detailed in `systemPatterns.md`).
- **Jotai scoped per editor** — `EditorJotaiProvider` + `createIsolation()` so atom state does not leak between embeds (`packages/excalidraw/editor-jotai.ts`, `index.tsx`).
- **Throttled rendering** — `window.EXCALIDRAW_THROTTLE_RENDER = true` set in `excalidraw-app/App.tsx` before mounting.

---

## Hosted app: data and security

- **Scene JSON and app state in localStorage; binary files separate** — `initializeScene` comment and keys: `STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS` / `LOCAL_STORAGE_APP_STATE`; files loaded via `LocalData.fileStorage` or Firebase (`App.tsx` `loadImages`).
- **Encrypted / versioned backend payloads** — `excalidraw-app/data/index.ts` uses `compressData` / `decompressData` (with `encryptionKey` option) from `@excalidraw/excalidraw/data/encode` and `decryptData` / `generateEncryptionKey` from `@excalidraw/excalidraw/data/encryption`; `BACKEND_V2_GET` / `BACKEND_V2_POST` env URLs.
- **Firebase path separation** — `FIREBASE_STORAGE_PREFIXES.shareLinkFiles` vs `collabFiles` in `app_constants.ts`.
- **Collaboration room ids** — `ROOM_ID_BYTES` (10) + `crypto.getRandomValues` in `data/index.ts` `generateRoomId`.

---

## Sync and performance constants

- **Debounced local save** — `SAVE_TO_LOCAL_STORAGE_TIMEOUT = 300` ms (`app_constants.ts`).
- **Full scene sync interval** — `SYNC_FULL_SCENE_INTERVAL_MS = 20000` ms.
- **Cursor sync** — `CURSOR_SYNC_TIMEOUT = 33` ms (~30 fps).
- **Deleted element retention for sync** — `DELETED_ELEMENT_TIMEOUT` 24h before elements drop out of sync filter (`isSyncableElement` in `data/index.ts`).
- **Upload size cap** — `FILE_UPLOAD_MAX_BYTES` 4 MiB, aligned with editor limits (`app_constants.ts`).

---

## UX / product behavior

- **Overwrite confirm** when opening shareable/backend scene over non-empty local canvas — `openConfirmModal(shareableLinkConfirmDialog)` branches in `initializeScene` (`App.tsx`); collab links skip override of local storage (same function).
- **Hash change re-initializes scene** — Listener stops collab when leaving collab URL, sets loading, re-runs `initializeScene` (`App.tsx` `useEffect`).
- **Collaboration disabled in iframe** — `isCollabDisabled = isRunningInIframe()` prevents collab UI/API wiring (`ExcalidrawWrapper` in `App.tsx`).
- **Same-origin self-embed blocked** — `isSelfEmbedding` shows static “I'm not a pretzel!” UI (`App.tsx`).
- **Export waits for pending images** — Custom `onExport` async generator polls `FileStatusStore` (`App.tsx`).
- **Hosted app scroll detection** — `detectScroll={false}` on `<Excalidraw />` (app controls layout/scroll; `App.tsx`).

---

## Observability and ops

- **Sentry in production builds** — Docker build sets `VITE_APP_DISABLE_SENTRY=true` for `build:app:docker` (`excalidraw-app/package.json`); default app build enables tracking flag.
- **Vercel** — `vercel.json` sets `outputDirectory` to `excalidraw-app/build`, security headers, selected redirects.

---

## Documentation split

- **`systemPatterns.md`** — Deep dive: directories, contexts, Jotai atoms, renderer flow.
- **`projectbrief.md`** — High-level monorepo overview and stack table.
- **`productContext.md`** — UX goals and user scenarios.
- **`progress.md`** — What is implemented and where.
- **`activeContext.md`** — Current focus for maintainers/agents.

---

## Undocumented Behavior

Behavior that exists in code but is **not described in any documentation**. An AI assistant unaware of these patterns may suggest changes that silently break critical flows.

---

### UB-1. Element change → full canvas re-render

- **File**: `packages/excalidraw/components/App.tsx`, `packages/element/src/Scene.ts`
- **What the code does**: On `componentDidMount`, `App` subscribes to scene updates via `this.scene.onUpdate(this.triggerRender)`. Any call to `Scene.mutateElement()` (if the version changed) or `Scene.replaceAllElements()` invokes `triggerUpdate()`, which bumps a random `sceneNonce` and fires all registered callbacks. The `triggerRender` callback calls `this.setState({})`, which triggers a full React re-render of `App` including both `StaticCanvas` and `InteractiveCanvas`. The new `sceneNonce` is passed as a prop so canvas components always re-paint.
- **What is documented**: Nothing. The render cycle is entirely implicit.
- **Risk**: An AI may try to "optimize" renders by memoizing canvas props or debouncing `setState({})`, breaking the real-time rendering pipeline. Any element mutation that skips `Scene.mutateElement` will silently fail to update the canvas.

---

### UB-2. `syncActionResult` forces a scene refresh even when nothing changed

- **File**: `packages/excalidraw/components/App.tsx` (lines ~2735–2816)
- **What the code does**: After processing an action result, if neither `elements` nor `appState` updated (`!didUpdate`), the method still calls `this.scene.triggerUpdate()`. This guarantees a canvas repaint even for "no-op" actions.
- **What is documented**: Nowhere. The fallback `triggerUpdate()` is a silent safety net.
- **Risk**: Removing the trailing `triggerUpdate()` as "dead code" would cause certain actions (e.g., toolbar clicks that only affect transient state) to stop refreshing the UI.

---

### UB-3. `componentDidUpdate` cascading state machine

- **File**: `packages/excalidraw/components/App.tsx` (lines ~3424–3507)
- **What the code does**: `componentDidUpdate` contains an implicit state machine with multiple conditional `setState` calls that enforce invariants: eraser + selection → force selection tool; leaving view mode → re-register all event listeners + deselect; opening/closing element link dialog → deselect + clear `hoveredElementIds`; linear editor losing its element → deferred `actionFinalize` via `setTimeout`; deleted text element being edited → clear `editingTextElement`.
- **What is documented**: None of these transitions are documented. They exist only as imperative guards in `componentDidUpdate`.
- **Risk**: Rewriting `App` as a functional component, or reordering these guards, will break tool/mode transitions in ways that only manifest at runtime with specific interaction sequences.

---

### UB-4. `Store.commit` — `EVENTUALLY` does not advance the snapshot

- **File**: `packages/element/src/store.ts` (lines ~376–384)
- **What the code does**: The `Store.commit()` method processes three capture modes: `IMMEDIATELY`, `NEVER`, and `EVENTUALLY`. Only `IMMEDIATELY` and `NEVER` update `this.snapshot` to the next state. `EVENTUALLY` intentionally leaves the snapshot unchanged so the same logical change is not re-recorded on every render cycle. It emits an ephemeral increment but does not persist the baseline.
- **What is documented**: The code has no external documentation; only inline comments explain the intent.
- **Risk**: An AI may assume all three modes advance the snapshot symmetrically, or "fix" the missing snapshot update for `EVENTUALLY`, creating duplicate undo entries and corrupting history.

---

### UB-5. Raw `mutateElement` vs `Scene.mutateElement` — two different contracts

- **File**: `packages/element/src/mutateElement.ts`, `packages/element/src/Scene.ts`
- **What the code does**: The standalone `mutateElement()` function mutates an element in place (bumps version, clears `ShapeCache`, handles elbow-arrow routing) but **does not trigger React updates or scene notifications**. `Scene.mutateElement()` wraps it and only calls `triggerUpdate()` if the element is in the scene, its version changed, and `informMutation` is true. Some callers (e.g., the eraser in `App.tsx` line ~11376) intentionally use raw `mutateElement` to avoid history/multiplayer side effects, then manually call `replaceAllElements` and `store.scheduleCapture()`.
- **What is documented**: Only a JSDoc warning on the raw function. The dual-path contract is not documented anywhere.
- **Risk**: Replacing raw `mutateElement` calls with `Scene.mutateElement` (or vice versa) will either create unwanted history entries or fail to update the UI.

---

### UB-6. Elbow-arrow mutation silently rewrites geometry and forces `angle: 0`

- **File**: `packages/element/src/mutateElement.ts` (lines ~53–72)
- **What the code does**: When `mutateElement` is called on an elbow arrow with updates to `points` or `fixedSegments` (or even with an empty update object for normalization), it forces `angle: 0` and runs `updateElbowArrowPoints()`, which can completely rewrite the arrow's geometry, position, and routing.
- **What is documented**: Not documented outside the code itself.
- **Risk**: An AI rotating an elbow arrow or updating its points may not expect the angle to be forcibly reset and the entire path to be recalculated.

---

### UB-7. Binding is two-way bookkeeping with cascading mutations

- **File**: `packages/element/src/binding.ts`
- **What the code does**: `bindBindingElement` mutates **both** the arrow (`startBinding`/`endBinding`) **and** the target shape (`boundElements` array). `unbindBindingElement` does the reverse, with a special case when both ends bind the same element. `updateBoundElements` re-routes arrow points when a bound shape moves and may also trigger `handleBindTextResize` for bound labels. Dragging an arrow past a threshold auto-unbinds ends whose bound shapes are not co-selected.
- **What is documented**: None of this cascading behavior is documented.
- **Risk**: Deleting an element without cleaning up its `boundElements` references, or moving a shape without calling `updateBoundElements`, will leave orphaned bindings and mispositioned arrows.

---

### UB-8. Initialization order: `updateDOMRect` gates `initializeScene`

- **File**: `packages/excalidraw/components/App.tsx` (lines ~12701–12738)
- **What the code does**: In `componentDidMount`, `initializeScene` is passed as a callback to `updateDOMRect`. The scene is not initialized until the container's `getBoundingClientRect()` dimensions are applied to state. If dimensions have not changed, the callback runs synchronously; otherwise it waits for `setState` to complete.
- **What is documented**: Not documented.
- **Risk**: Calling `initializeScene` directly (bypassing `updateDOMRect`) will initialize the scene with incorrect width/height/offsets, producing a broken first paint.

---

### UB-9. `onChange` is suppressed while `isLoading` is true

- **File**: `packages/excalidraw/components/App.tsx` (lines ~3511–3518)
- **What the code does**: In `componentDidUpdate`, the `onChange` callback (which notifies the host application) is gated by `!this.state.isLoading`. This prevents an unfocused tab during init from emitting empty elements, which would overwrite valid localStorage data.
- **What is documented**: Only an inline comment. Not in any external doc.
- **Risk**: An AI may try to call `onChange` during initialization or remove the guard, causing data loss when the app starts in an unfocused tab.

---

### UB-10. Module-level side effects at import time

- **File**: `packages/excalidraw/index.tsx`, `excalidraw-app/App.tsx`, `excalidraw-app/index.tsx`
- **What the code does**: Several modules execute side effects when imported:
  - `polyfill()` mutates `Array.prototype` / `Element.prototype` globally.
  - `window.EXCALIDRAW_THROTTLE_RENDER = true` is set before the React tree mounts.
  - `createTestHook()` defines `window.h` getters/setters in dev/test.
  - `Sentry.init()` runs at import in `excalidraw-app/index.tsx`.
  - `window.addEventListener('beforeinstallprompt', ...)` is registered at module load with a comment that it "may need to subscribe early to catch the event."
- **What is documented**: `window.EXCALIDRAW_THROTTLE_RENDER` is mentioned in `decisionLog.md` above; the rest is undocumented.
- **Risk**: Lazy-loading or reordering module imports can cause polyfills to be missing, throttle rendering to not work, or the PWA install prompt to be lost.

---

### UB-11. Frame insertion affects z-order positioning

- **File**: `packages/element/src/Scene.ts` (lines ~381–398)
- **What the code does**: When inserting an element that has a `frameId`, the element is inserted at the **frame's index** in the z-order array, not at the end. This ensures frame children are visually stacked near their parent frame.
- **What is documented**: Not documented.
- **Risk**: An AI adding elements to a frame by appending to the array end will break z-ordering; elements will render above/below their frame incorrectly.

---

### UB-12. Dragging a frame implicitly drags all its children

- **File**: `packages/element/src/dragElements.ts` (lines ~69–85)
- **What the code does**: `dragSelectedElements` scans all non-deleted elements and adds any element whose `frameId` matches a selected frame to the update set, even if those children are not explicitly selected. A comment warns this is a safeguard for a bug where frame + children can be co-selected.
- **What is documented**: Not documented beyond the inline comment.
- **Risk**: An AI implementing custom drag logic without this frame-child gathering will leave frame children behind when the frame moves.

---

### UB-13. `addEventListeners` short-circuits in view mode

- **File**: `packages/excalidraw/components/App.tsx` (lines ~3229–3306)
- **What the code does**: `addEventListeners()` first removes all listeners, then registers a subset. If `viewModeEnabled` is true, it **returns early** — edit-only listeners (paste, cut, resize, drag/drop, etc.) are never registered. Toggling view mode in `componentDidUpdate` re-calls `addEventListeners()`.
- **What is documented**: Not documented.
- **Risk**: An AI adding a new event listener to `addEventListeners` after the view-mode return guard will find it never fires in view mode — a subtle, hard-to-debug omission.

---

## HACK / FIXME / TODO comments (selected high-risk items)

| Tag | File | Description |
|-----|------|-------------|
| HACK | `packages/excalidraw/components/App.tsx` | Mobile UX: transform handles for linear elements disabled until a better UI exists |
| HACK | `packages/excalidraw/components/App.tsx` | Touch vs pointer events are not unified; authors want a single code path |
| HACK | `packages/utils/src/export.ts` | PNG serialization passes uncloned elements to keep IDs stable due to "Scene hack" |
| HACK | `packages/excalidraw/scene/export.ts` | Frame labels synthesized as text elements instead of proper canvas rendering |
| HACK | `packages/excalidraw/renderer/staticSvgScene.ts` | Compositing order shortcut to avoid a deeper rendering issue |
| FIXME | `packages/utils/tests/export.test.ts` | SVG export no longer filters deleted elements — regression documented in test |
| FIXME | `packages/excalidraw/wysiwyg/textWysiwyg.test.tsx` | Flaky test: "No one knows why" |
| FIXME | `packages/common/src/colors.ts` | `pick` function can't be in `utils.ts` due to circular dependency |
| FIXME | `packages/element/src/selection.ts` | Selection helper holds state; should move into editor instance |
| FIXME | `packages/element/tests/zindex.test.tsx` | Known-wrong z-order test expectation |
| TODO | `packages/excalidraw/data/restore.ts` | Restore path breaks sync/versioning — deletions not recorded for delta sync |
| TODO | `packages/element/src/frame.ts` | Frame processing is a huge bottleneck for large scenes |
| TODO | `packages/element/src/delta.ts` | Issue #7348: need semantic/syntactic validation of changed elements for data integrity |
| TODO | `packages/element/src/store.ts` | "Suspicious that this is called so many places. Seems error-prone." |
| TODO | `packages/element/src/sizeHelpers.ts` | Invisible elements should be stripped consistently across store/export/collab |

---

## Changelog for this file

- **2026-03-29** — Added Undocumented Behavior section (UB-1 through UB-13) and HACK/FIXME/TODO table.
- **2026-03-28** — Replaced prior content (long `App` lifecycle dump) with decision-style entries; lifecycle detail remains in `systemPatterns.md`.

---

## Details

For detailed architecture → see `docs/technical/architecture.md`.

For domain glossary → see `docs/product/domain-glossary.md`.
