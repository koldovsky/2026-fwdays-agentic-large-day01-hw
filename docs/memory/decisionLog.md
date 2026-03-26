# Decision log

> **Scope:** Architectural and product-technical choices **observable in source**, not meeting minutes. Each entry lists **effect** and **where it lives**.

**Related docs:** [`docs/technical/decisionLog.md`](../technical/decisionLog.md) covers **fragile / easy-to-break behavior** and high-signal `FIXME` / `HACK` / `WORKAROUND` markers (different scope from this file). Product-level requirements: [`docs/product/PRD.md`](../product/PRD.md). Domain terms: [`docs/product/domain-glossary.md`](../product/domain-glossary.md). Full architecture narrative: [`docs/technical/architecture.md`](../technical/architecture.md). Local development: [`docs/technical/dev-setup.md`](../technical/dev-setup.md).

---

## D1 — Yarn workspaces monorepo

- **Decision:** Single repo with workspaces for app, libraries, and examples.
- **Rationale (inferred):** Shared versioning, local package linking, one-shot scripts (`build:packages`, `test:all`).
- **Evidence:** Root `package.json` → `workspaces`: `excalidraw-app`, `packages/*`, `examples/*`; `packageManager` yarn 1.x.

---

## D2 — Develop against package source, not only `dist`

- **Decision:** Vite and Vitest rewrite `@excalidraw/*` imports to `packages/*/src` (or `excalidraw/index.tsx`).
- **Effect:** Fast iteration without publishing; consistent behavior between dev and unit tests.
- **Evidence:** `excalidraw-app/vite.config.mts` `resolve.alias`; `vitest.config.mts`; `tsconfig.json` `paths`.

---

## D3 — Dual Jotai stores (app vs editor)

- **Decision:** `excalidraw-app` uses a plain `createStore()` (`app-jotai.ts`); the editor uses `jotai-scope` isolation (`editor-jotai.ts`).
- **Effect:** App-level collaboration/UI atoms do not collide with per-editor atom namespaces when embedding.
- **Evidence:** `excalidraw-app/app-jotai.ts`; `packages/excalidraw/editor-jotai.ts`; `packages/excalidraw/package.json` dependency `jotai-scope`.

---

## D4 — Excalidraw imperative API via React context

- **Decision:** `ExcalidrawAPIProvider` + `ExcalidrawAPIContext` expose API to siblings/parents so hooks work outside inner tree.
- **Evidence:** `packages/excalidraw/index.tsx` comment + `ExcalidrawAPIProvider` implementation.

---

## D5 — Static hosting for production web app

- **Decision:** Vite emits static files to `excalidraw-app/build`; Docker copies them to nginx document root.
- **Effect:** No Node server required at runtime for the SPA.
- **Evidence:** `excalidraw-app/vite.config.mts` `build.outDir`; `Dockerfile` final stage `nginx:1.27-alpine`.

---

## D6 — Disable Sentry in Docker build variant

- **Decision:** `build:app:docker` sets `VITE_APP_DISABLE_SENTRY=true`.
- **Evidence:** `excalidraw-app/package.json` script `build:app:docker`.

---

## D7 — PWA / offline-first caching strategy

- **Decision:** Register service worker (`virtual:pwa-register`); `VitePWA` plugin in Vite config; Rollup `manualChunks` splits locale bundles (keeping `en.json` / `percentages.json` behavior called out in comments).
- **Evidence:** `excalidraw-app/index.tsx`; `excalidraw-app/vite.config.mts` (`VitePWA`, `manualChunks`).

---

## D8 — Collaboration transport & storage layout

- **Decision:** Socket.IO + strongly named WS event/subtype constants; Firebase storage prefixes separate share-link files vs room (collab) files.
- **Evidence:** `excalidraw-app/package.json` `socket.io-client`; `excalidraw-app/app_constants.ts` (`WS_EVENTS`, `WS_SUBTYPES`, `FIREBASE_STORAGE_PREFIXES`).

---

## D9 — Persistence keys and dual storage

- **Decision:** Scene/app state keys in `localStorage` namespace `excalidraw*`; library and TTD chats in IndexedDB keys (`IDB_LIBRARY`, `IDB_TTD_CHATS`).
- **Evidence:** `excalidraw-app/app_constants.ts` → `STORAGE_KEYS`.

---

## D10 — Upload and sync limits

- **Decision:** Cap uploads at **4 MiB**; throttle cursor sync (~33 ms); periodic full scene sync (20 s) and fast cross-tab sync (50 ms).
- **Evidence:** `FILE_UPLOAD_MAX_BYTES`, `CURSOR_SYNC_TIMEOUT`, `SYNC_FULL_SCENE_INTERVAL_MS`, `SYNC_BROWSER_TABS_TIMEOUT` in `app_constants.ts`.

---

## D11 — CI scope for Docker

- **Decision:** Docker image workflow runs on **`release`** branch pushes only (not every PR).
- **Evidence:** `.github/workflows/build-docker.yml` `on.push.branches`.

---

## How to extend

For new decisions, add **D12+** with: short title, decision, effect, and **file path(s)**. Avoid unverifiable rationale (“stakeholders wanted”) unless you link an ADR or issue.
