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
- **Encrypted / versioned backend payloads** — `excalidraw-app/data/index.ts` uses `compressData` / `decompressData`, `encrypt`/`decrypt` helpers from `@excalidraw/excalidraw/data/*`, `BACKEND_V2_GET` / `BACKEND_V2_POST` env URLs.
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

## Changelog for this file

- **2026-03-28** — Replaced prior content (long `App` lifecycle dump) with decision-style entries; lifecycle detail remains in `systemPatterns.md`.
