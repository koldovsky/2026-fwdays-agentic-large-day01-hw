# Product context (UX and scenarios)

## Related documentation

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md), [Code vs documentation](../technical/code-vs-documentation.md)

Evidence is limited to **`excalidraw-app`** and its integration with **`@excalidraw/excalidraw`**. This repo does not ship the collaboration room server or JSON backend; those are configured via `VITE_*` URLs.

## UX goals (user-centric, code-backed)

- **Sketch and edit** on an infinite canvas with standard Excalidraw tools, menus, command palette, and help (`excalidraw-app/App.tsx` embeds `<Excalidraw />` with `AppMainMenu`, `AppWelcomeScreen`, `CommandPalette` wiring).
- **Keep work across sessions** in the same browser via debounced saves to **localStorage** (scene/app state) and **IndexedDB** (files, library) (`excalidraw-app/data/LocalData.ts`, `onChange` → `LocalData.save` in `App.tsx`).
- **Share a static snapshot** as a link: scene JSON is encrypted, posted to the configured backend, and the app replaces the URL hash with `#json=<id>,<key>` so the key is not sent as a normal query string (`exportToBackend` in `excalidraw-app/data/index.ts`; `initializeScene` reads that hash and calls `importFromBackend`).
- **Attach large assets to shared / collab scenes** by uploading encrypted blobs to **Firebase Storage** under documented prefixes (`saveFilesToFirebase`, prefixes in `excalidraw-app/app_constants.ts`: `shareLinkFiles`, `collabFiles`).
- **Collaborate in real time** with others in a **room**: URL hash `#room=<roomId>,<roomKey>`; updates go through **Socket.IO** to `VITE_APP_WS_SERVER_URL` with payloads encrypted using `roomKey` (`collab/Collab.tsx`, `collab/Portal.tsx` emits `server-broadcast` / `server-volatile-broadcast`).
- **Open a scene from an arbitrary URL** using `#url=<encoded-url>`: `fetch` + `loadFromBlob` after optional overwrite confirm (`initializeScene` in `App.tsx`).
- **Use the product in the user’s language** via `langCode` / `getPreferredLanguage` (`app-language/*`, `App.tsx`).
- **Install or use offline-capable behavior** where supported: **PWA** service worker registration (`excalidraw-app/index.tsx` `registerSW()`), deferred install prompt handling (`beforeinstallprompt` in `App.tsx`).
- **Generate code from a diagram** and **stream text-to-diagram** through backends under `VITE_APP_AI_BACKEND` (`excalidraw-app/components/AI.tsx`).
- **Move the current scene toward Excalidraw+**: export flow encrypts scene + files, uploads to Firebase Storage under `/migrations/...`, then opens `VITE_APP_PLUS_APP/import?excalidraw=<id>,<key>` (`components/ExportToExcalidrawPlus.tsx`).

## User flows / scenarios

### First visit / empty canvas

- **UI**: `AppWelcomeScreen` shows hints and center actions (load scene, help, live collaboration if enabled, sign-up link when no Plus cookie) (`components/AppWelcomeScreen.tsx`).
- **Data**: Initial scene from `importFromLocalStorage()` unless an external loader runs (`initializeScene` in `App.tsx`).

### Load / save / export (core editor)

- **UI**: `MainMenu.DefaultItems.*` in `AppMainMenu.tsx` — Load scene, save to active file, export, save as image, command palette, search, help, clear canvas; collaboration trigger when `isCollabEnabled`.
- **Edge**: Export shareable link **rejects empty canvas** (`onExportToBackend` throws `t("alerts.cannotExportEmptyCanvas")` in `App.tsx`).
- **Edge**: Export waits for **pending image loads** via `FileStatusStore` and `onExport` generator (`App.tsx`).

### Shareable link (JSON backend + Firebase files)

1. User triggers backend export from the editor’s export UI (wired through `onExportToBackend` → `exportToBackend`).
2. **POST** body to `import.meta.env.VITE_APP_BACKEND_V2_POST_URL` (`excalidraw-app/data/index.ts`).
3. On success: set `location.hash` to `#json=<id>,<encryptionKey>`; upload image files to Firebase under `/files/shareLinks/<id>`.
4. Recipient opens link: **GET** `VITE_APP_BACKEND_V2_GET_URL + id`, decompress/decrypt with key from hash; on failure, `window.alert` and legacy decode attempt (`importFromBackend`).
5. **Edge**: Backend may return `error_class === "RequestTooLargeError"` → user-facing error string (`exportToBackend`).
6. **Edge**: If canvas has content, import may show **overwrite confirm** (`openConfirmModal` + `shareableLinkConfirmDialog` in `initializeScene`).

### Live collaboration

1. User opens share UI (`ShareDialog` types `"share"` | `"collaborationOnly"` from `shareDialogStateAtom`, opened from `LiveCollaborationTrigger` / menu / welcome) (`share/ShareDialog.tsx`, `App.tsx`).
2. **New room**: `generateCollaborationLinkData` → push URL with `#room=...` (`Collab.startCollaboration`).
3. **Socket**: `socketIOClient(VITE_APP_WS_SERVER_URL, { transports: ["websocket", "polling"] })`; join flow `init-room` → `join-room` (`Portal.open`).
4. **Sync**: Encrypted scene deltas and pointer/idle/bounds events (`WS_SUBTYPES`, `WS_EVENTS` in `app_constants.ts`).
5. **Files**: `FileManager` loads/saves encrypted files via Firebase paths `files/rooms/<roomId>` (`Collab.tsx` constructor).
6. **Edge**: `connect_error` triggers fallback initialization (`Collab.startCollaboration`); timer `INITIAL_SCENE_UPDATE_TIMEOUT` also triggers fallback.
7. **Edge**: While collaborating, **local persistence is paused** (`LocalData.pauseSave("collaboration")` in `Collab.tsx`).
8. **Hash change** away from a room link stops collaboration (`onHashChange` in `App.tsx`).

### Open collaboration link

- **Validation**: `#room=<id>,<key>` must have key length **22** or `getCollaborationLinkData` alerts and returns null (`excalidraw-app/data/index.ts`).
- **Flow**: `startCollaboration(roomLinkData)` resets scene when joining existing room (`Collab.tsx`).

### Import from `#url=...`

- Decode URL, `fetch`, `loadFromBlob`; on error, scene gets `appState.errorMessage` from `t("alerts.invalidSceneUrl")` (`initializeScene`).

### AI: diagram → code

- **POST** `${VITE_APP_AI_BACKEND}/v1/ai/diagram-to-code/generate` with JSON body `{ texts, image (data URL), theme }` (`components/AI.tsx`).
- **Edge**: HTTP **429** returns inline HTML telling the user to try again tomorrow and linking to Excalidraw+ (`components/AI.tsx`).

### AI: text → diagram (streaming)

- **TTDDialog** calls `TTDStreamFetch` on `${VITE_APP_AI_BACKEND}/v1/ai/text-to-diagram/chat-streaming` with `messages`, `signal`, etc.; persistence via `TTDIndexedDBAdapter` (`components/AI.tsx`).

### Excalidraw+ iframe export route

- If `window.location.pathname === "/excalidraw-plus-export"`, render **`ExcalidrawPlusIframeExport`** instead of the main app (`ExcalidrawApp` in `App.tsx`).
- That component exchanges **postMessage** with origin `VITE_APP_PLUS_APP` (`ExcalidrawPlusIframeExport.tsx`).

### Library deep link

- On `hashchange`, if `parseLibraryTokensFromUrl()` returns tokens, **full scene re-init from hash is skipped** (`onHashChange` in `App.tsx`).

### Self-embedding guard

- If framed from same origin, render **“I'm not a pretzel!”** instead of the editor (`isSelfEmbedding`, `App.tsx`).

## User roles

- **No role or permission model** is implemented in `excalidraw-app` (no checks for admin, org, etc.).
- **Excalidraw+ sign-in state** is inferred only by presence of cookie name **`excplus-auth`** in `document.cookie` (`isExcalidrawPlusSignedUser` in `app_constants.ts`). UI changes links/labels (e.g. “Sign up” vs “Sign in”, welcome heading) in `AppMainMenu.tsx`, `AppWelcomeScreen.tsx`, `App.tsx` command palette entries.

## UX constraints

- **Collaboration UI disabled in iframes** (`isCollabDisabled = isRunningInIframe()` in `App.tsx` — live collaboration triggers hidden).
- **Per-file upload budget** for encoded uploads: **`FILE_UPLOAD_MAX_BYTES` = 4 MiB** (`app_constants.ts`; used in `data/index.ts`, `Collab.tsx`, `ExportToExcalidrawPlus.tsx`).
- **Deleted elements** stay syncable for **`DELETED_ELEMENT_TIMEOUT` (24h)** before exclusion (`app_constants.ts`, `isSyncableElement` in `data/index.ts`).
- **Clipboard / Web Share**: copying room link can surface `errors.copyToSystemClipboardFailed`; Web Share API used when `"share" in navigator` (`ShareDialog.tsx`).
- **Tab sync**: debounced refresh from storage when document visible (`SYNC_BROWSER_TABS_TIMEOUT`, `syncData` in `App.tsx`).
- **Unload warning**: `preventUnload` when `LocalData.fileStorage.shouldPreventUnload` unless `VITE_APP_DISABLE_PREVENT_UNLOAD === "true"` (`App.tsx`).
- **Overwrite confirm deferred** if document hidden when user declines import (`initializeScene` focus listener).

## Interaction surfaces

| Surface | What exists in repo |
|--------|----------------------|
| **Web UI** | Single-page **`excalidraw-app`**: main canvas (`<Excalidraw />`), `ShareDialog`, `CollabError`, `AppFooter`, `AppSidebar` (comments/presentation promo tabs), `DebugCanvas` (dev), `TopErrorBoundary`, Plus promo banner, custom stats (`CustomStats.tsx`). |
| **HTTP APIs (client-called)** | **Backend v2**: GET/POST via `VITE_APP_BACKEND_V2_GET_URL` / `VITE_APP_BACKEND_V2_POST_URL`. **AI**: `VITE_APP_AI_BACKEND` paths above. **Arbitrary**: `fetch` for `#url=` imports. **Firebase**: Firestore/Storage client SDK (`data/firebase.ts`). |
| **Realtime** | Socket.IO client to **`VITE_APP_WS_SERVER_URL`**; server event names consumed include `init-room`, `new-user`, `room-user-change`, `client-broadcast` (`Portal.tsx`, `Collab.tsx`). |
| **Browser storage** | localStorage keys and IndexedDB stores defined in `STORAGE_KEYS` / `LocalData.ts`. |
| **postMessage** | `ExcalidrawPlusIframeExport.tsx` ↔ parent on `VITE_APP_PLUS_APP`. |
| **CLI / jobs** | **Not end-user**: Yarn scripts at repo root are developer tooling only (`package.json`). No user-facing CLI in `excalidraw-app`. |

## Verification summary

- **Primary files**: `excalidraw-app/App.tsx` (routing, scene init, persistence, collab wiring), `excalidraw-app/data/index.ts` (share link + collab URL helpers), `excalidraw-app/collab/{Collab,Portal}.tsx`, `excalidraw-app/share/ShareDialog.tsx`, `excalidraw-app/components/{AI,AppMainMenu,AppWelcomeScreen,ExportToExcalidrawPlus}.tsx`, `excalidraw-app/data/{firebase,LocalData}.tsx`, `excalidraw-app/app_constants.ts`, `excalidraw-app/index.tsx`.
- **Not verified**: Semantics of query param **`?id=`** alone (it affects `isExternalScene` in `initializeScene` but no `fetch` using that param was found). Behavior of **remote servers** (room server, JSON API, AI service) beyond request shapes and status handling shown above.
