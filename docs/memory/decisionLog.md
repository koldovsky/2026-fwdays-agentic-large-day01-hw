# Decision log

**Key decisions** from **implemented behavior** in this repo (not meeting notes). Layered editor architecture → **`systemPatterns.md`**.

---

## Platform and tooling

- **Yarn 1 workspaces** — Root `packageManager` / `workspaces`; single install, cross-package scripts.
- **Vite** (app + examples); **esbuild** (library `build:esm`-style). Root scripts delegate via `yarn --cwd ./excalidraw-app`, `packages/*`.
- **Vitest + jsdom** — Root `devDependencies`; `vitest.config` in `packages/excalidraw/tests`.

---

## Editor architecture (summary)

- **Class `App` as controller** — `AppState` in React, elements on `Scene`, undo via `Store`/`History`; `syncActionResult` is the main bridge (`packages/excalidraw/components/App.tsx`; detail in `systemPatterns.md`).
- **Jotai per editor** — `EditorJotaiProvider` + `createIsolation()` (`editor-jotai.ts`, `index.tsx`).
- **Throttled rendering** — `window.EXCALIDRAW_THROTTLE_RENDER = true` in `excalidraw-app/App.tsx` before mount.

---

## Hosted app: data and security

- **localStorage** — Scene JSON + app state (`STORAGE_KEYS.LOCAL_STORAGE_*`); binary files via `LocalData.fileStorage` or Firebase (`loadImages` in `App.tsx`).
- **Backend payloads** — `compressData` / `decompressData` (+ optional `encryptionKey`), `decryptData` / `generateEncryptionKey` (`excalidraw-app/data/index.ts`); `BACKEND_V2_GET` / `BACKEND_V2_POST`.
- **Firebase** — `shareLinkFiles` vs `collabFiles` (`app_constants.ts`).
- **Room ids** — `ROOM_ID_BYTES` (10) + `crypto.getRandomValues` (`generateRoomId`).

---

## Sync and performance constants

(`app_constants.ts` / `data/index.ts` unless noted)

- `SAVE_TO_LOCAL_STORAGE_TIMEOUT` 300 ms · `SYNC_FULL_SCENE_INTERVAL_MS` 20_000 ms · `CURSOR_SYNC_TIMEOUT` ~33 ms · `DELETED_ELEMENT_TIMEOUT` 24h (sync filter) · `FILE_UPLOAD_MAX_BYTES` 4 MiB.

---

## UX / product behavior

- **Overwrite confirm** — Shareable/backend over non-empty canvas (`openConfirmModal` / `initializeScene`); collab links skip local override.
- **Hash change** — Stops collab, loading, re-`initializeScene` (`App.tsx` `useEffect`).
- **Collab off in iframe** — `isCollabDisabled = isRunningInIframe()` (`ExcalidrawWrapper`).
- **Same-origin self-embed** — `isSelfEmbedding` → static “pretzel” UI.
- **Export** — Async `onExport` waits on `FileStatusStore`.
- **Hosted scroll** — `detectScroll={false}` on `<Excalidraw />`.

---

## Observability and ops

- **Sentry** — Docker `build:app:docker` sets `VITE_APP_DISABLE_SENTRY=true` (`excalidraw-app/package.json`); default build enables tracking.
- **Vercel** — `vercel.json`: `outputDirectory` → `excalidraw-app/build`, headers, redirects.

---

## Documentation split

| File | Role |
|------|------|
| `systemPatterns.md` | Directories, contexts, Jotai, renderer flow |
| `projectbrief.md` | Monorepo + stack |
| `productContext.md` | UX goals, scenarios |
| `progress.md` | What exists where |
| `activeContext.md` | Current focus |

---

## Undocumented behavior

In code but **not** in other docs — agents may “optimize” and break flows.

### UB-1. Element change → full canvas re-render

**Where:** `packages/excalidraw/components/App.tsx`, `packages/element/src/Scene.ts`. **Behavior:** Mount subscribes `scene.onUpdate(triggerRender)`; `mutateElement` / `replaceAllElements` → `triggerUpdate` → `sceneNonce` + `setState({})` → full `App` + both canvases repaint. **Doc:** none. **Risk:** Memo/debounce `setState` or bypassing `Scene.mutateElement` breaks updates.

### UB-2. `syncActionResult` repaints on no-op

**Where:** `packages/excalidraw/components/App.tsx` (~2735–2816). **Behavior:** Even when `!didUpdate`, calls `scene.triggerUpdate()` so toolbar / transient-only actions still refresh. **Doc:** none. **Risk:** Removing it looks like dead code; UI stops updating for some actions.

### UB-3. `componentDidUpdate` state machine

**Where:** `packages/excalidraw/components/App.tsx` (~3424–3507). **Behavior:** Guards: eraser+selection → selection tool; exit view mode → re-register listeners + deselect; link dialog → deselect + clear hovers; linear editor orphan → deferred `actionFinalize`; deleted text while editing → clear `editingTextElement`. **Doc:** none. **Risk:** FC rewrite or reorder breaks tool/mode transitions.

### UB-4. `Store.commit` + `EVENTUALLY`

**Where:** `packages/element/src/store.ts` (~376–384). **Behavior:** Only `IMMEDIATELY` / `NEVER` advance `snapshot`; `EVENTUALLY` does not (avoids re-recording same logical change each render). **Doc:** inline only. **Risk:** “Fixing” snapshot for `EVENTUALLY` duplicates undo / corrupts history.

### UB-5. Raw `mutateElement` vs `Scene.mutateElement`

**Where:** `packages/element/src/mutateElement.ts`, `packages/element/src/Scene.ts`. **Behavior:** Raw mutates in place, no scene/React notify; `Scene.mutateElement` calls `triggerUpdate()` when version changes + `informMutation`. Some paths use raw then `replaceAllElements` + `scheduleCapture()` (e.g. eraser ~11376). **Doc:** JSDoc on raw only. **Risk:** Swapping paths → wrong history or no UI update.

### UB-6. Elbow-arrow `mutateElement`

**Where:** `packages/element/src/mutateElement.ts` (~53–72). **Behavior:** Updates to `points` / `fixedSegments` (or empty normalize) force `angle: 0` and `updateElbowArrowPoints()` — geometry can fully rewrite. **Doc:** code only. **Risk:** Unexpected reset when rotating / editing points.

### UB-7. Binding two-way + cascade

**Where:** `packages/element/src/binding.ts`. **Behavior:** `bindBindingElement` / `unbindBindingElement` mutate arrow + target `boundElements`; `updateBoundElements` on move; drag past threshold auto-unbinds; label resize hooks. **Doc:** none. **Risk:** Orphan bindings / wrong arrows if cleanup or updates skipped.

### UB-8. `updateDOMRect` before `initializeScene`

**Where:** `packages/excalidraw/components/App.tsx` (~12701–12738). **Behavior:** `initializeScene` passed into `updateDOMRect` so rect is in state first; sync if unchanged, else after `setState`. **Doc:** none. **Risk:** Direct `initializeScene` → wrong dimensions / broken first paint.

### UB-9. `onChange` gated by `isLoading`

**Where:** `packages/excalidraw/components/App.tsx` (~3511–3518). **Behavior:** `componentDidUpdate` only fires `onChange` when `!isLoading` (avoids unfocused tab emitting empty scene → clobbering localStorage). **Doc:** comment only. **Risk:** Removing guard → data loss on startup.

### UB-10. Import-time side effects

**Where:** `packages/excalidraw/index.tsx`, `excalidraw-app/App.tsx`, `excalidraw-app/index.tsx`. **Behavior:** `polyfill()` on prototypes; `EXCALIDRAW_THROTTLE_RENDER`; dev `window.h`; `Sentry.init`; early `beforeinstallprompt` listener. **Doc:** throttle noted above; rest not. **Risk:** Lazy/reordered imports → missing polyfills, throttle, or PWA prompt.

### UB-11. Frame insert + z-order

**Where:** `packages/element/src/Scene.ts` (~381–398). **Behavior:** Element with `frameId` inserts at **frame index**, not array end. **Doc:** none. **Risk:** Appending children breaks stacking vs frame.

### UB-12. Drag frame drags children

**Where:** `packages/element/src/dragElements.ts` (~69–85). **Behavior:** `dragSelectedElements` adds non-selected children sharing `frameId` with selected frame. **Doc:** inline comment. **Risk:** Custom drag without this leaves children behind.

### UB-13. `addEventListeners` + view mode

**Where:** `packages/excalidraw/components/App.tsx` (~3229–3306). **Behavior:** Removes all, re-adds subset; if `viewModeEnabled`, **returns early** — no paste/cut/resize/dnd, etc. **Doc:** none. **Risk:** Listeners registered after the early return never run in view mode.

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
