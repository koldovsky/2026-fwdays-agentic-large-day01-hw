# Product Requirements Document (reverse-engineered)

This document describes **Excalidraw** as implemented in this repository. Statements are tied to **source modules**; marketing claims and roadmap items are omitted unless reflected in code.

---

## 1. Product overview

### 1.1 What the product does

The workspace ships two coupled surfaces:

| Surface | Role (evidence) |
|--------|------------------|
| **`@excalidraw/excalidraw` package** (`packages/excalidraw/`) | Embeddable React editor: canvas drawing, element model, actions, history, export helpers, optional collaboration hooks via props (`isCollaborating`, `LiveCollaborationTrigger`). Entry: `packages/excalidraw/index.tsx` → internal `App` (`packages/excalidraw/components/App.tsx`). |
| **Hosted web app** (`excalidraw-app/`) | Full product shell: local persistence, optional real-time collaboration (Socket.IO + encryption), Firebase-backed room/scene and image storage, share-link export/import against configurable HTTP backends, Excalidraw+ / AI integrations gated by env and cookies, Sentry (`excalidraw-app/sentry.ts`). |

The editor maintains a **vector scene** (`ExcalidrawElement` union in `packages/element/src/types.ts`) rendered with **Canvas 2D** and **rough.js** (see `packages/excalidraw/components/App.tsx` / `Renderer`). Users create and edit shapes (rectangles, ellipses, arrows, text, freehand, images, frames, embeddables, etc.), manage a **shape library**, run **command palette** / **search**, and export to **JSON**, **PNG/SVG**, and (hosted) **encrypted share URLs**.

### 1.2 Core value proposition (from implementation)

- **Hand-drawn, infinite canvas** with structured, **JSON-serializable** elements suitable for **sharing, embedding, and reconciliation** (`packages/element/src/types.ts` comments; `packages/excalidraw/data/reconcile.ts` usage in collab).
- **Dual packaging**: same core usable **inside host apps** (imperative `ExcalidrawImperativeAPI`, callbacks) or as the **standalone app** with **browser persistence** and **multiplayer**.
- **Privacy-oriented sharing options in code**: end-to-end style flows use **client-generated keys** (`generateEncryptionKey`, `encryptData` / `decryptData` in `packages/excalidraw/data/encryption.ts`; `excalidraw-app/data/index.ts` for share links and collab payloads).

---

## 2. Target users (inferred from code only)

| User signal | Evidence |
|-------------|----------|
| **Integrators / product engineers** | Public `Excalidraw` component, `ExcalidrawAPIProvider`, `onChange`, `initialData`, `UIOptions`, `renderTopLeftUI` / `renderTopRightUI`, `examples/with-nextjs`, `examples/with-script-in-browser`. |
| **Collaborative teams** | `Collab` + `Portal` (`excalidraw-app/collab/`), `AppState.collaborators`, laser/pointer payloads (`WS_SUBTYPES` in `excalidraw-app/data/index.ts`), follow-mode related types (`UserToFollow` in `packages/excalidraw/types.ts`). |
| **Solo users / local-first** | Debounced save to **localStorage** (`SAVE_TO_LOCAL_STORAGE_TIMEOUT` in `excalidraw-app/app_constants.ts`; `excalidraw-app/data/localStorage.ts`), **File System Access** / fallback via `browser-fs-access` (`packages/excalidraw/data/filesystem.ts`). |
| **Global audience** | **~57 locale JSON files** under `packages/excalidraw/locales/` plus language UI (`excalidraw-app/app-language/`). |
| **Mobile / small screens** | `useEditorInterface` / form factor handling (`packages/excalidraw/index.tsx` props), `MobileToolBar` and related UI under `packages/excalidraw/components/`. |
| **Diagram / productivity workflows** | Frames, charts dialog (`AppState.openDialog` charts branch in `packages/excalidraw/types.ts`), **TTD** (text-to-diagram / Mermaid) under `packages/excalidraw/components/TTDDialog/`, **hosted AI** `DiagramToCodePlugin` + `VITE_APP_AI_BACKEND` (`excalidraw-app/components/AI.tsx`). |

No persona beyond the above is asserted.

---

## 3. Core features → code locations

### 3.1 Canvas editing & tools

- **Tool modes** (`ToolType`, `AppState.activeTool`): `packages/excalidraw/types.ts`; pointer routing in `packages/excalidraw/components/App.tsx`.
- **Shape creation & manipulation**: element helpers `packages/element/src/*.ts` (e.g. `newElement.ts`, `resizeElements.ts`, `dragElements.ts`).
- **Selection, groups, z-order, align/distribute, flip**: actions under `packages/excalidraw/actions/` (`actionGroup`, `actionAlign`, `actionZindex`, `actionFlip`, …).
- **Text, arrows, bindings, linear editor**: `actionBoundText`, `actionLinearEditor`, `actionToggleArrowBinding`, related modules in `packages/excalidraw/`.
- **Frames & clipping**: frame types in `packages/element/src/types.ts`; frame actions and rendering paths reference `frameRendering` on `AppState`.
- **Image insert & crop**: image tool, `MAX_ALLOWED_FILE_BYTES` (**4 MiB**) in `packages/common/src/constants.ts` (enforced in `App.tsx`); crop action `actionCropEditor`.
- **Embeddables / iframes**: `ExcalidrawEmbeddableElement`, `validateEmbeddable` / `renderEmbeddable` props on `ExcalidrawProps` (`packages/excalidraw/types.ts`).

### 3.2 UI chrome & modes

- **Main menu & defaults**: `packages/excalidraw/components/main-menu/DefaultItems.tsx`; app wiring `excalidraw-app/components/AppMainMenu.tsx`.
- **Welcome screen**: `packages/excalidraw/components/welcome-screen/*`, app-specific `excalidraw-app/components/AppWelcomeScreen.tsx`.
- **Zen / grid / view mode / stats**: `actionToggleZenMode`, `actionToggleGridMode`, `actionToggleViewMode`, `actionToggleStats`.
- **Sidebars & library panel**: `packages/excalidraw/components/LayerUI.tsx`, `LibraryMenu*.tsx`, `AppSidebar.tsx` (hosted).
- **Command palette & search**: `packages/excalidraw/components/CommandPalette/`, `actionToggleSearchMenu`.

### 3.3 Library (reusable shapes)

- **Runtime & persistence API**: `Library` class, `libraryItemsAtom`, `onLibraryChange` — `packages/excalidraw/data/library.ts`.
- **Types**: `LibraryItem`, `LibraryItems` — `packages/excalidraw/types.ts`.
- **Hosted storage adapters**: IndexedDB / migration — `excalidraw-app/data/LocalData.ts` (`STORAGE_KEYS.IDB_LIBRARY` in `app_constants.ts`).

### 3.4 Persistence & import/export

- **JSON / blob / restore pipeline**: `packages/excalidraw/data/json.ts`, `blob.ts`, `restore.ts`, `encode.ts`.
- **Raster / vector export**: `packages/excalidraw/actions/actionExport.tsx` and related export helpers.
- **Native file open/save**: `packages/excalidraw/data/filesystem.ts` (`nativeFileSystemSupported` from `browser-fs-access`).
- **Hosted: share link backend** (`exportToBackend` / `importFromBackend`): `excalidraw-app/data/index.ts` using `VITE_APP_BACKEND_V2_*` URLs, **compression + encryption**.
- **Hosted: Firebase** (Firestore transactions, Storage uploads): `excalidraw-app/data/firebase.ts`; encrypted payloads with room context (see architecture notes in `docs/technical/architecture.md`).

### 3.5 Collaboration (hosted)

- **Transport**: Socket.IO (`excalidraw-app/collab/Portal.tsx`); event names `WS_EVENTS`, message subtypes `WS_SUBTYPES` in `excalidraw-app/app_constants.ts` / `excalidraw-app/data/index.ts`.
- **Room URL**: hash pattern `#room=<id>,<key>` (`getCollaborationLink`, `isCollaborationLink` in `excalidraw-app/data/index.ts`).
- **Presence**: pointer/laser, idle state, visible bounds — types in `SocketUpdateDataSource` (`excalidraw-app/data/index.ts`).
- **Reconciliation**: `reconcileElements` from package used in `Collab.tsx` / `firebase.ts`.
- **Sync filters**: `isSyncableElement` excludes tiny/deleted-old elements (`DELETED_ELEMENT_TIMEOUT` **24h**) — `excalidraw-app/data/index.ts`.

### 3.6 Additional product modules (hosted)

- **Share dialog / QR**: `excalidraw-app/share/ShareDialog.tsx`, `share/qrcode.chunk.ts`.
- **Tab sync version stamps**: `excalidraw-app/data/tabSync.ts` (detect newer localStorage state across tabs).
- **TTD chat persistence**: `STORAGE_KEYS.IDB_TTD_CHATS`, `excalidraw-app/data/TTDStorage.ts`.
- **Error reporting**: `excalidraw-app/sentry.ts` (hostname-gated, quota/network errors ignored per config).

---

## 4. User flows (state / code–derived)

1. **Cold start (hosted)**  
   Load `importFromLocalStorage` (`excalidraw-app/data/localStorage.ts`) into editor initial data; theme/username from storage (`STORAGE_KEYS` in `app_constants.ts`). `App.tsx` orchestrates initialization, loading flags on `AppState`.

2. **Draw → edit**  
   Pointer/keyboard → `App` handlers → optional `ActionManager.executeAction` → `syncActionResult` → `Store.scheduleAction` + `Scene.replaceAllElements` + `setState` (see `docs/technical/architecture.md` §2).

3. **Save locally**  
   Debounced persist (~`SAVE_TO_LOCAL_STORAGE_TIMEOUT` **300 ms**); `clearAppStateForLocalStorage` strips non-persistable `AppState` keys (`packages/excalidraw/appState.ts` referenced from localStorage path).

4. **Load / save file**  
   `actionLoadScene` / `actionSaveToActiveFile` → `fileOpen` / `fileSave` (`packages/excalidraw/data/filesystem.ts`); confirm overwrite via `OverwriteConfirm` components.

5. **Export image / JSON**  
   Export actions and dialogs (`actionExport`, image export dialogs in `packages/excalidraw/components/`); hosted may call `exportToBackend` and show share URL.

6. **Start collaboration**  
   User opens collab flow from menu (`AppMainMenu` → `LiveCollaborationTrigger` when enabled) → `generateCollaborationLinkData` → socket connect in `Portal` → broadcast `SCENE_INIT` / `SCENE_UPDATE` / volatile mouse updates (`WS_SUBTYPES`).

7. **Join via link**  
   Parse `#room=` → `getCollaborationLinkData` (validates key length) → collab initialization in `excalidraw-app/App.tsx` / `Collab.tsx`.

8. **Remote updates**  
   Incoming socket payloads decrypted → applied with **`CaptureUpdateAction.NEVER`** so they do not enter local undo stack (`docs/technical/architecture.md`).

9. **Library**  
   Add via `actionAddToLibrary`; items updated through `Library` class and `libraryItemsAtom`; persistence via adapters on hosted app.

10. **Optional AI (hosted)**  
    `AIComponents` posts to `VITE_APP_AI_BACKEND` (`excalidraw-app/components/AI.tsx`); TTD flows use `TTDDialog` / `TTDStreamFetch` from package + IndexedDB adapter.

---

## 5. Technical constraints (explicit in code)

| Constraint | Source |
|------------|--------|
| **Canvas + browser APIs** | Rendering assumes HTML canvas and DOM; polyfills for `Array.prototype.at` and `replaceChildren` (`packages/excalidraw/polyfill.ts`). |
| **Image size cap** | **4 MiB** `MAX_ALLOWED_FILE_BYTES` / aligned `FILE_UPLOAD_MAX_BYTES` (`packages/common/src/constants.ts`, `excalidraw-app/app_constants.ts`). |
| **Storage availability** | `localStorage` / `IndexedDB` access wrapped in try/catch; Sentry ignores `QuotaExceededError` patterns (`excalidraw-app/sentry.ts`). |
| **File system API** | Optional: `browser-fs-access` `supported` flag (`packages/excalidraw/data/filesystem.ts`). |
| **Backend / infra configuration** | Share link and AI behavior depend on **`import.meta.env`** URLs (`excalidraw-app/data/index.ts`, `excalidraw-app/components/AI.tsx`). Firebase requires `VITE_APP_FIREBASE_CONFIG` JSON (`excalidraw-app/data/firebase.ts`). |
| **Collaboration key format** | Collaboration link parsing expects key length **22** (`getCollaborationLinkData` in `excalidraw-app/data/index.ts`). |
| **Syncable subset** | Very small or long-deleted elements may be omitted from sync (`isSyncableElement`). |
| **Encryption** | Web Crypto–based helpers (`packages/excalidraw/data/encryption.ts`); room id from `crypto.getRandomValues` (`generateRoomId` in `excalidraw-app/data/index.ts`). |

---

## 6. Non-functional characteristics

### 6.1 Performance-oriented behavior

- **Cursor / volatile traffic**: `CURSOR_SYNC_TIMEOUT` **33 ms** (~30 fps) — `excalidraw-app/app_constants.ts`.
- **Full scene sync interval**: `SYNC_FULL_SCENE_INTERVAL_MS` **20 s** — `app_constants.ts`.
- **Local save debounce**: `SAVE_TO_LOCAL_STORAGE_TIMEOUT` **300 ms** — `app_constants.ts`.
- **Tab storage conflict window**: `SYNC_BROWSER_TABS_TIMEOUT` **50 ms** — `app_constants.ts`.
- **Rendering**: `Scene.getSceneNonce()` invalidates renderer cache (`packages/element/src/Scene.ts`); interactive vs static canvas split (`StaticCanvas` / `InteractiveCanvas` under `packages/excalidraw/components/canvases/`).

### 6.2 Offline / online

- **`isOfflineAtom`** exists in collab layer (`excalidraw-app/collab/Collab.tsx`) for connectivity-aware behavior; exact UX is implementation-dependent but the state is first-class.
- **Local editing** does not require network when not using collab or cloud save; **hosted** features (socket, Firebase, backend export, AI) require network.

### 6.3 Collaboration model

- **Real-time**, **room-based**, **encrypted payloads** over Socket.IO; **element-level reconciliation** (`reconcileElements`).
- **Undo/redo**: local history via `Store` / `History`; **remote patches are not undoable** (`CaptureUpdateAction.NEVER` for remote).
- **Presence**: cursors, laser tool, idle state, optional visible bounds — see `SocketUpdateDataSource` in `excalidraw-app/data/index.ts` and `Collaborator` in `packages/excalidraw/types.ts`.

### 6.4 Observability & errors

- **Sentry** initialized for configured hostnames; disabled via `VITE_APP_DISABLE_SENTRY` (`excalidraw-app/sentry.ts`).
- **Top-level error boundary** in hosted app (`excalidraw-app/components/TopErrorBoundary.tsx`).

---

## 7. Out of scope for this PRD

Anything not reachable from the paths above (commercial terms, SLAs, legal promises, or features not present in this tree) is **not** documented here.
