# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** Monorepo with a **library + host application** split. The reusable editor is `@excalidraw/excalidraw` (React component + imperative API). The **excalidraw-app** workspace is the production web app (Vite) that embeds that library and adds collaboration, cloud storage, and product-specific UI.

**Key Characteristics:**

- **Layered packages:** `@excalidraw/common` → `@excalidraw/math` → `@excalidraw/element` → `@excalidraw/excalidraw`, with `@excalidraw/utils` as a separate helper package. Dependencies flow downward (excalidraw depends on element/common/math; element depends on common/math).
- **Single large editor shell:** Most interaction, canvas lifecycle, and state orchestration live in `packages/excalidraw/components/App.tsx`, which composes actions, renderers, data I/O, and UI chrome.
- **Dual Jotai stores:** Editor-scoped isolation via `jotai-scope` in `packages/excalidraw/editor-jotai.ts`; app-level atoms in `excalidraw-app/app-jotai.ts` for collab, dialogs, and host-only state.
- **Command-style mutations:** User operations are expressed as **actions** (`packages/excalidraw/actions/`) registered and dispatched from the editor; history uses deltas on a versioned store from `@excalidraw/element`.

## Layers

**Foundation (`@excalidraw/common`, `@excalidraw/math`, `@excalidraw/utils`):**

- Purpose: Shared constants, geometry/math primitives, utilities, event bus, editor interface types, and cross-cutting helpers without React or canvas specifics.
- Location: `packages/common/src/`, `packages/math/src/`, `packages/utils/src/`
- Contains: Pure functions, `Emitter` / `AppEventBus`, `versionedSnapshotStore`, vector/point types.
- Depends on: Minimal third-party (e.g. `tinycolor2` in common).
- Used by: `packages/element`, `packages/excalidraw`.

**Domain model & scene logic (`@excalidraw/element`):**

- Purpose: Element types, mutations, hit-testing, bindings, frames, z-order, store/snapshot/delta types used for collaboration and history.
- Location: `packages/element/src/` (barrel: `packages/element/src/index.ts`)
- Contains: `Scene`, `newElement`, `mutateElement`, `renderElement`, selection, collision, `store` / `StoreDelta` / `CaptureUpdateAction`.
- Depends on: `@excalidraw/common`, `@excalidraw/math`.
- Used by: `packages/excalidraw` (and re-exported concepts in `packages/excalidraw/scene/index.ts` for selection helpers).

**Editor package (`@excalidraw/excalidraw`):**

- Purpose: React UI, canvas rendering (Rough.js), file/json/blob pipeline, i18n, workers, WYSIWYG text, charts, laser/eraser, public `Excalidraw` component and types.
- Location: `packages/excalidraw/` (entry: `packages/excalidraw/index.tsx`)
- Contains: `components/App.tsx`, `actions/`, `data/`, `renderer/`, `scene/` (thin exports), `hooks/`, `history.ts`, `workers.ts`, `locales/`, `fonts/`.
- Depends on: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, Jotai, Radix, CodeMirror, Rough.js, etc. (see `packages/excalidraw/package.json`).
- Used by: `excalidraw-app`, embedders, `examples/with-script-in-browser`.

**Host application (`excalidraw-app`):**

- Purpose: Deployable app: wiring `Excalidraw` with backend URLs, Firebase, Socket.IO collab, local/IndexedDB library adapters, Sentry, PWA, marketing chrome.
- Location: `excalidraw-app/`
- Contains: `App.tsx`, `collab/`, `data/` (sync, encryption, backend), `share/`, `components/`, `app-jotai.ts`, `app_constants.ts`.
- Depends on: `@excalidraw/excalidraw` (deep imports for submodules are used), Firebase, Sentry, `socket.io-client`, Jotai.
- Used by: End users via Vite dev server or static `build/` output.

**Build & tooling:**

- Purpose: Workspace scripts, package builds (esbuild-based via `scripts/buildBase.js` / `scripts/buildPackage.js`), WOFF2 plugins, release/version.
- Location: `scripts/`, root `package.json` workspaces list.

## Data Flow

**Local editing loop:**

1. Pointer/keyboard events are handled in `packages/excalidraw/components/App.tsx` (throttled/batched updates, `flushSync` where needed).
2. Tool and menu commands resolve to **actions** in `packages/excalidraw/actions/` (see `packages/excalidraw/actions/index.ts`), which mutate element maps and `AppState`-shaped UI state.
3. **History:** `packages/excalidraw/history.ts` defines `HistoryDelta` extending `StoreDelta` from `@excalidraw/element`, applying changes while excluding `version` / `versionNonce` fields for undo/redo semantics.
4. **Rendering:** `packages/excalidraw/renderer/` (`interactiveScene.ts`, `staticScene.ts`, `staticSvgScene.ts`, `renderNewElementScene.ts`, `renderSnaps.ts`, `animation.ts`) produces canvas/SVG output from the current element list and app state.

**Serialization & import/export:**

1. `packages/excalidraw/data/` handles JSON (`json.ts`), blobs (`blob.ts`), encoding/encryption (`encode.ts`, `encryption.ts`), library (`library.ts`), restore/reconcile (`restore.ts`, `reconcile.ts`).
2. `packages/excalidraw/data/index.ts` composes export helpers with `packages/excalidraw/scene/export` for canvas/SVG export paths.

**Collaboration (host):**

1. `excalidraw-app/collab/Collab.tsx` and `excalidraw-app/collab/Portal.tsx` synchronize scene updates over Socket.IO, using `reconcileElements`, `restoreElements`, and file sync from `excalidraw-app/data/` (`index.ts`, `FileManager.ts`, `firebase.ts`).
2. `excalidraw-app/data/index.ts` defines syncable element branding, compression, and backend URL usage (env-driven; do not commit secrets).

**State Management:**

- Editor-internal and component-local React state in `App.tsx` and children; Jotai **isolated** provider/store in `packages/excalidraw/editor-jotai.ts` for scoped atoms.
- Host uses `excalidraw-app/app-jotai.ts` (`appJotaiStore`, `Provider`) for collaboration API handles, dialog atoms, offline flags, etc.
- `ExcalidrawAPIProvider` in `packages/excalidraw/index.tsx` exposes imperative API via context for hooks like `useAppStateValue` outside the inner tree when needed.

## Key Abstractions

**`Excalidraw` component & imperative API:**

- Purpose: Embeddable editor; props and callbacks defined in `packages/excalidraw/types.ts`; mounts `App` inside `InitializeApp` for i18n loading (`packages/excalidraw/components/InitializeApp.tsx`).
- Examples: `packages/excalidraw/index.tsx`, `packages/excalidraw/components/App.tsx`
- Pattern: Controlled-ish scene via `onChange` / `initialData`; `onExcalidrawAPI` yields `ExcalidrawImperativeAPI`.

**Actions:**

- Purpose: Named operations (delete, z-index, properties, canvas, export, …) with consistent `Action` typing (`packages/excalidraw/actions/types.ts`).
- Examples: `packages/excalidraw/actions/index.ts`, individual `action*.ts` files under `packages/excalidraw/actions/`
- Pattern: Register actions with the editor; keyboard shortcuts and UI invoke the same action objects.

**Element store & deltas:**

- Purpose: Canonical representation of elements plus versioning for merge and history; `CaptureUpdateAction` marks update kinds for collab/history.
- Examples: `packages/element/src/store.ts` (via exports in `packages/element/src/index.ts`), `packages/excalidraw/history.ts`
- Pattern: Snapshots and `StoreDelta` diff/apply rather than ad hoc cloning everywhere.

**Renderer split:**

- Purpose: Separate static vs interactive drawing passes and SVG export paths.
- Examples: `packages/excalidraw/renderer/interactiveScene.ts`, `packages/excalidraw/renderer/staticScene.ts`, `packages/excalidraw/renderer/staticSvgScene.ts`
- Pattern: Scene functions take elements + app state + Rough.js canvas instance / helpers.

**Worker pool:**

- Purpose: Short-lived Web Workers for CPU-heavy tasks without blocking the main thread.
- Examples: `packages/excalidraw/workers.ts` (`WorkerPool` class)
- Pattern: Construct with bundled worker URL; debounced terminate after TTL.

## Entry Points

**Web app bootstrap:**

- Location: `excalidraw-app/index.tsx`
- Triggers: Browser loads `excalidraw-app/index.html` via Vite (`excalidraw-app/vite.config.mts`).
- Responsibilities: PWA `registerSW()`, optional Sentry init via `excalidraw-app/sentry`, `createRoot` → `<ExcalidrawApp />` from `excalidraw-app/App.tsx`.

**Library entry:**

- Location: `packages/excalidraw/index.tsx`
- Triggers: Import from `@excalidraw/excalidraw` (path alias in root `tsconfig.json` and Vite `resolve.alias` in `excalidraw-app/vite.config.mts`).
- Responsibilities: Export `Excalidraw`, providers, selected data hooks/APIs, side-effect `polyfill()` from `packages/excalidraw/polyfill`.

**Published package shape (build output):**

- Consumption of built artifacts uses `packages/excalidraw/package.json` `exports` (dev uses source aliases in this repo).

## Error Handling

**Strategy:** React error boundaries for catastrophic UI failures; typed errors for worker URL misuse (`packages/excalidraw/errors.ts`); user-facing dialogs (`packages/excalidraw/components/ErrorDialog.tsx`, overwrite confirm flow under `packages/excalidraw/components/OverwriteConfirm/`). Host adds `excalidraw-app/components/TopErrorBoundary.tsx` and Sentry.

**Patterns:**

- `AbortError` and domain errors from `packages/excalidraw/errors.ts` used in async flows (e.g. collab-related cancellation).
- `muteFSAbortError` and similar helpers from `@excalidraw/common` to avoid noisy handling of user-cancelled file operations.

## Cross-Cutting Concerns

**Logging:** No dedicated logging framework in core; Sentry in `excalidraw-app` for production telemetry; dev/test guards via `isDevEnv` / `isTestEnv` from `@excalidraw/common`.

**Validation:** URL sanitization (`@braintree/sanitize-url`), element restore/reconcile in `packages/excalidraw/data/`, type-level brands in `packages/excalidraw/types.ts` and `@excalidraw/common/utility-types`.

**Authentication:** Product-specific (Excalidraw Plus, Firebase) lives under `excalidraw-app/` (e.g. `excalidraw-app/data/firebase.ts`, constants in `excalidraw-app/app_constants.ts`); the core library remains embeddable without auth.

---

*Architecture analysis: 2026-03-26*
