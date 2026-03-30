# Product Requirements Document (Reverse Engineered)

This document describes the product **as implemented** in this repository. Claims cite modules; where intent is not explicit in code, that is stated.

---

## 1. Product Overview

**What the product does (observed from code)**

- A **Yarn monorepo** (`package.json`, name `excalidraw-monorepo`) containing:
  - **`@excalidraw/excalidraw`** (`packages/excalidraw/`) — a React **canvas editor** packaged as a library (`packages/excalidraw/package.json`, `packages/excalidraw/index.tsx`).
  - **`excalidraw-app/`** — a **Vite** host application that mounts the editor, wires **local persistence**, optional **share-link backend**, **Firebase file storage**, **live collaboration**, and **PWA** service worker registration (`excalidraw-app/index.tsx`, `excalidraw-app/App.tsx`).
- The editor models drawings as **serializable elements** (`ExcalidrawElement` in `packages/element/src/types.ts`), keeps **UI/editor state** in **`AppState`** (`packages/excalidraw/types.ts`), and renders via **HTML canvas** layers (`packages/excalidraw/components/canvases/`, `packages/excalidraw/renderer/`).

**Core value proposition**

- **Inferred (supported by features):** whiteboard-style drawing, structured export/import, embeddable editor API, optional real-time multi-user sessions, and offline-friendly local storage — evidenced by `ExcalidrawImperativeAPI` (`packages/excalidraw/types.ts`), `exportToBackend` / `importFromBackend` (`excalidraw-app/data/index.ts`), `Collab` + `Portal` (`excalidraw-app/collab/`), and `LocalData` (`excalidraw-app/data/LocalData.ts`).

**Key capabilities (observed)**

- Drawing tools as string unions and state (`ToolType`, `activeTool` in `packages/excalidraw/types.ts`; defaults in `packages/excalidraw/appState.ts`).
- Command execution through **`ActionManager`** and registered **`Action`**s (`packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/actions/*.tsx`).
- Undo/redo via **`History`** and store deltas (`packages/excalidraw/history.ts`, `packages/element/src/store.ts`).
- Layered UI: main menu, sidebars, stats, export dialogs, command palette, mobile menu (`packages/excalidraw/components/LayerUI.tsx` and referenced components).

**Reference files**

- App shell: `excalidraw-app/App.tsx`, `excalidraw-app/index.tsx`
- Core editor: `packages/excalidraw/components/App.tsx`, `packages/excalidraw/index.tsx`
- Element model / scene: `packages/element/src/types.ts`, `packages/element/src/Scene.ts`

---

## 2. Product Goals

### Observed from code

- **Persist work locally:** debounced save of elements + app state to **localStorage**, files to **IndexedDB** (`excalidraw-app/data/LocalData.ts`, `STORAGE_KEYS` in `excalidraw-app/app_constants.ts`).
- **Load prior work on startup:** `importFromLocalStorage()` inside `initializeScene` (`excalidraw-app/App.tsx`).
- **Share static snapshots via URL:** compress + encrypt JSON payload, `POST` to backend URL from env, return link with `#json=id,key`; images uploaded to Firebase under a share prefix (`excalidraw-app/data/index.ts`, `FIREBASE_STORAGE_PREFIXES` in `excalidraw-app/app_constants.ts`).
- **Collaborate in real time:** WebSocket client (`socket.io-client` in root `package.json`), room join, scene init/update broadcasts, pointer and idle payloads (`excalidraw-app/collab/Portal.tsx`, `SocketUpdateDataSource` in `excalidraw-app/data/index.ts`).
- **Embed in other apps:** `Excalidraw` component + `ExcalidrawProps` / `ExcalidrawImperativeAPI` (`packages/excalidraw/index.tsx`, `packages/excalidraw/types.ts`).

### Inferred from implementation (strongly supported, not marketing copy)

- **Reduce data loss:** local persistence + `preventUnload` usage patterns in collab (`excalidraw-app/collab/Collab.tsx` imports).
- **Support teams:** collaborator map in `AppState`, user list UI (`packages/excalidraw/types.ts` `Collaborator`; `packages/excalidraw/components/UserList.tsx` referenced from `LayerUI.tsx`).

### Not clearly defined in code

- **Business goals** (retention, monetization beyond presence of `ExportToExcalidrawPlus` and cookie check `isExcalidrawPlusSignedUser` in `excalidraw-app/app_constants.ts`).
- **Target SLAs** for backend or collaboration service.

---

## 3. Target Audience

**Evidence-based segments**

| Segment | Evidence in code |
|--------|-------------------|
| **Host app developers** | Public package `@excalidraw/excalidraw`, `ExcalidrawProps`, `ExcalidrawImperativeAPI`, `examples/*` workspace (`package.json` workspaces). |
| **End users of the web app** | Full UI in `packages/excalidraw/components/*`, i18n (`packages/excalidraw/i18n`), welcome screen hooks in `excalidraw-app/components/AppWelcomeScreen.tsx`. |
| **Users in shared sessions** | `CollabAPI`, `ShareDialog`, collaboration link format `#room=...` (`excalidraw-app/collab/Collab.tsx`, `excalidraw-app/data/index.ts`, `excalidraw-app/share/ShareDialog.tsx`). |

**Not clearly derivable from code alone**

- Job titles (e.g. “designer” vs “developer”) — only **roles implied by features** as above.
- Primary geographic or industry focus.

---

## 4. Key Features

### Drawing & Editing

- **Description:** Create and edit primitive and composite canvas objects typed as `ExcalidrawElement` (shapes, text, arrows/lines, freedraw, images, frames, embeddables, etc.) (`packages/element/src/types.ts`).
- **How it works:** Pointer pipeline on `InteractiveCanvas` → handlers in `App` → `scene.mutateElement` / `replaceAllElements` and `setState` (`docs/technical/architecture.md` §2; `packages/excalidraw/components/App.tsx`).
- **Key files:** `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`, `packages/excalidraw/components/App.tsx`, `packages/element/src/mutateElement.ts`
- **Style properties:** stroke/fill/opacity/roughness etc. on element base type (`packages/element/src/types.ts`); current tool defaults in `AppState` (`packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`).

### Selection & Manipulation

- **Description:** Selection and lasso tools (`ToolType` includes `selection`, `lasso` — `packages/excalidraw/types.ts`); selection maps in `AppState` (`selectedElementIds`, `selectedGroupIds`, …).
- **How it works:** `Scene.getSelectedElements` caches by selection options (`packages/element/src/Scene.ts`); alignment, z-order, flip, group/ungroup, lock, crop, linear editor actions exist under `packages/excalidraw/actions/` (e.g. `actionAlign.tsx`, `actionZindex.tsx`, `actionGroup.tsx`, `actionElementLock` coverage in tests).
- **Key files:** `packages/excalidraw/types.ts`, `packages/element/src/Scene.ts`, `packages/excalidraw/actions/actionClipboard.tsx`, `packages/excalidraw/actions/actionDuplicateSelection.tsx`

### State & History (undo/redo)

- **Description:** Local undo/redo stacks of `HistoryDelta` (`packages/excalidraw/history.ts`); updates classified by `CaptureUpdateAction` (`packages/element/src/store.ts`).
- **How it works:** Durable increments feed `History.record`; undo/redo actions return `CaptureUpdateAction.NEVER` when applying history (`packages/excalidraw/actions/actionHistory.tsx`).
- **Key files:** `packages/excalidraw/history.ts`, `packages/element/src/store.ts`, `packages/excalidraw/actions/actionHistory.tsx`

### Collaboration

- **Description:** Optional live session: encrypted room id/key in URL hash, socket connection, scene sync, collaborator pointers and related payloads (`excalidraw-app/data/index.ts`, `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/collab/Collab.tsx`).
- **How it works:** `initializeScene` calls `collabAPI.startCollaboration(roomLinkData)` and reconciles elements (`excalidraw-app/App.tsx`); `Portal` emits/listens for `WS_SUBTYPES` (`excalidraw-app/app_constants.ts`); periodic full sync interval `SYNC_FULL_SCENE_INTERVAL_MS` (`excalidraw-app/app_constants.ts`).
- **Key files:** `excalidraw-app/App.tsx`, `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/data/firebase.ts` (used from collab flows)
- **Constraint observed:** collaboration disabled in iframe (`isCollabDisabled = isRunningInIframe()` — `excalidraw-app/App.tsx`).

### Import / Export

- **Description:** JSON save/load helpers (`packages/excalidraw/actions/actionExport.tsx` uses `loadFromJSON`, `saveAsJSON` from `packages/excalidraw/data`); image export paths and export dialog; embedding scene data in PNG/SVG via `loadFromBlob` (`packages/excalidraw/data/blob.ts`).
- **Hosted app share links:** `exportToBackend` / `importFromBackend` with `VITE_APP_BACKEND_V2_GET_URL` / `VITE_APP_BACKEND_V2_POST_URL` (`excalidraw-app/data/index.ts`).
- **Key files:** `packages/excalidraw/actions/actionExport.tsx`, `packages/excalidraw/data/blob.ts`, `packages/excalidraw/data/json.ts` (referenced from blob/export), `excalidraw-app/data/index.ts`

### Libraries / Assets

- **Description:** Library items are versioned structures holding `NonDeleted<ExcalidrawElement>[]` (`LibraryItem`, `LibraryItems` — `packages/excalidraw/types.ts`); `Library` class manages items and `onLibraryChange` (`packages/excalidraw/data/library.ts`).
- **How it works:** URL token parsing for library import (`parseLibraryTokensFromUrl`, `useHandleLibrary` — used in `excalidraw-app/App.tsx`); persisted library key in `STORAGE_KEYS.IDB_LIBRARY` (`excalidraw-app/app_constants.ts`).
- **Key files:** `packages/excalidraw/data/library.ts`, `packages/excalidraw/types.ts`, `excalidraw-app/App.tsx`

### UI / Interaction

- **Description:** Toolbar / shape switcher, main menu, sidebars, stats panel, image export dialog, help, command palette, text-to-diagram (TTD) dialog, mobile menu, footers (`packages/excalidraw/components/LayerUI.tsx`).
- **How it works:** Actions rendered via `ActionManager` / `renderAction`; keyboard routing `handleKeyDown` (`packages/excalidraw/actions/manager.tsx`; architecture notes in `docs/technical/architecture.md`).
- **Key files:** `packages/excalidraw/components/LayerUI.tsx`, `packages/excalidraw/components/main-menu/MainMenu.tsx`, `packages/excalidraw/components/CommandPalette/CommandPalette.tsx` (imported from `excalidraw-app/App.tsx`), `packages/excalidraw/components/TTDDialog/TTDDialog.tsx`
- **Theming / modes:** `theme`, `zenModeEnabled`, `viewModeEnabled`, `gridModeEnabled` in `AppState` (`packages/excalidraw/types.ts`).

---

## 5. User Flows

### Creating a drawing

1. User opens app → `createRoot` renders `ExcalidrawApp` (`excalidraw-app/index.tsx`).
2. `initializeScene` builds initial `scene` from `importFromLocalStorage()` defaults unless URL overrides (`excalidraw-app/App.tsx`).
3. User picks a tool (`activeTool` / `ToolType`) and uses pointer events on `InteractiveCanvas` → `App` creates/updates `newElement` or related state (`packages/excalidraw/types.ts` comments on `newElement`, `multiElement`; `packages/excalidraw/components/App.tsx`).
4. Scene updates trigger render via `Scene` callbacks and canvas renderers (`packages/element/src/Scene.ts`, `packages/excalidraw/renderer/*`).

### Editing elements

1. User switches to selection/lasso (`ToolType`).
2. Selection stored in `AppState.selectedElementIds`; optional group/frame editing state (`packages/excalidraw/types.ts`).
3. Property changes flow through **actions** (e.g. `actionProperties.tsx`) returning `ActionResult` → `syncActionResult` (`packages/excalidraw/actions/types.ts`, `packages/excalidraw/components/App.tsx`).
4. In-place mutation path: `mutateElement` / `scene.mutateElement` (`packages/element/src/mutateElement.ts`).

### Saving / exporting

1. **Local save:** debounced `saveDataStateToLocalStorage` (`excalidraw-app/data/LocalData.ts`, timeout `SAVE_TO_LOCAL_STORAGE_TIMEOUT` in `excalidraw-app/app_constants.ts`).
2. **JSON / file:** `saveAsJSON` / `loadFromJSON` from export actions (`packages/excalidraw/actions/actionExport.tsx`).
3. **Shareable link (hosted app):** `exportToBackend` posts encrypted payload; optional Firebase file upload (`excalidraw-app/data/index.ts`).
4. **Image / SVG with scene:** `loadFromBlob` path for PNG/SVG metadata (`packages/excalidraw/data/blob.ts`).

### Collaboration (hosted app)

1. User opens link with `#room=roomId,roomKey` (`getCollaborationLinkData` — `excalidraw-app/data/index.ts`).
2. `initializeScene` invokes `collabAPI.startCollaboration(roomLinkData)` (`excalidraw-app/App.tsx`).
3. `Portal` connects socket, joins room, handles `SCENE_INIT` / `SCENE_UPDATE`, mouse location, idle status, visible bounds (`excalidraw-app/collab/Portal.tsx`, `SocketUpdateDataSource` in `excalidraw-app/data/index.ts`).
4. Remote elements reconciled with `reconcileElements` when applying scene (`excalidraw-app/App.tsx`).

---

## 6. Technical Constraints

### Observed constraints

- **Browser-centric runtime:** `window`, `document`, `localStorage`, `fetch`, `crypto.getRandomValues`, canvas APIs; **IndexedDB** via `idb-keyval` (`excalidraw-app/data/LocalData.ts`).
- **Build toolchain:** Node `>=18` (`package.json` `engines`).
- **Canvas rendering:** Multiple canvases (static, interactive, new-element) and renderer modules using canvas 2D (`packages/excalidraw/components/canvases/`, `packages/excalidraw/renderer/staticScene.ts` uses `throttleRAF` from `@excalidraw/common`).
- **Workers:** `Worker` construction and pooling for off-main-thread work (`packages/excalidraw/workers.ts`); worker URL/env errors defined in `packages/excalidraw/errors` (referenced by workers module).
- **Hosted backend coupling:** Share import/export requires `VITE_APP_BACKEND_V2_GET_URL` / `VITE_APP_BACKEND_V2_POST_URL` (`excalidraw-app/data/index.ts`); behavior when unset is **not fully documented in this PRD** (would require tracing all call sites).
- **File size limits:** `FILE_UPLOAD_MAX_BYTES` (4 MiB) used in export upload path (`excalidraw-app/app_constants.ts`, `excalidraw-app/data/index.ts`).
- **Collaboration sync filtering:** Recently deleted elements remain syncable within `DELETED_ELEMENT_TIMEOUT` (`excalidraw-app/data/index.ts` `isSyncableElement`, `excalidraw-app/app_constants.ts`).
- **PWA:** `registerSW` from `virtual:pwa-register` (`excalidraw-app/index.tsx`); Vite PWA plugin in `excalidraw-app/vite.config.mts`.

### Inferred constraints (strongly supported)

- **Performance:** Throttling / debouncing used in rendering and saves (`throttleRAF` in `packages/excalidraw/renderer/staticScene.ts`; debounced local save in `excalidraw-app/data/LocalData.ts`).
- **Real-time traffic:** Cursor updates throttled (`CURSOR_SYNC_TIMEOUT` in `excalidraw-app/app_constants.ts`).

### Not clearly defined in code (without deeper tracing)

- Exact behavior when backend env URLs are missing for every UI entry point.
- Full list of environments where Firebase rules apply beyond import sites.

---

## 7. Non-Functional Characteristics

| Topic | What the code shows |
|-------|---------------------|
| **Performance** | `throttleRAF` on static scene render path (`packages/excalidraw/renderer/staticScene.ts`); debounced persistence (`excalidraw-app/data/LocalData.ts`); viewport culling via `Renderer.getRenderableElements` (`packages/excalidraw/scene/Renderer.ts`). |
| **Offline / resilience** | Local storage + IndexedDB (`excalidraw-app/data/LocalData.ts`); PWA service worker registration (`excalidraw-app/index.tsx`). **No guarantee** of full offline collaboration without network — sockets require connectivity (`excalidraw-app/collab/Portal.tsx`). |
| **Reliability patterns** | `TopErrorBoundary` in app shell (`excalidraw-app/App.tsx`); `ErrorDialog` usage in collab (`excalidraw-app/collab/Collab.tsx`); try/catch around backend import (`excalidraw-app/data/index.ts`). |
| **Scalability** | **Not found in code** as explicit limits (e.g. max room size); only constants such as upload size and sync intervals. |

If a topic is absent from the table, treat it as **not found in code** from this pass.

---

## 8. Open Questions / Gaps

- **Product positioning vs Excalidraw Plus:** Code references Plus export and auth cookie (`excalidraw-app/components/ExportToExcalidrawPlus.tsx`, `excalidraw-app/app_constants.ts`) but **end-user product boundaries** are not spelled out in requirements form here.
- **AI / TTD:** `TTDDialog`, `aiEnabled` prop on `ExcalidrawBase` (`packages/excalidraw/index.tsx`), and `IDB_TTD_CHATS` key (`excalidraw-app/app_constants.ts`) indicate features exist; **detailed behavior and external service contracts** need reading of those modules to document precisely.
- **Partial vs complete flows:** `FIXME` / `TODO` in core wrapper and `AppState` (`docs/technical/architecture.md` §2) indicate **ongoing refactors**, not stable “requirements.”
- **Third-party service policy:** Firebase and custom backend URLs are integrated; **operational SLOs and data policies** are outside the repository’s code expressions.

---

*Document generated from repository source. For structural architecture detail, see `docs/technical/architecture.md`.*
