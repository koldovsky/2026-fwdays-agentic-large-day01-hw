# System Patterns

## 1. Monorepo boundaries

- Root workspace routes development through source packages, not published artifacts.
- `tsconfig.json`, `vitest.config.mts`, and `excalidraw-app/vite.config.mts` all alias `@excalidraw/*` imports directly to local source trees.
- This means app, tests, and examples work against the current workspace code.

## 2. Layered package architecture

### Package roles

- `@excalidraw/common`
  - shared constants, utilities, cross-cutting helpers
- `@excalidraw/math`
  - math/vector helpers used by higher layers
- `@excalidraw/element`
  - element model + element-related logic
- `@excalidraw/utils`
  - export/serialization and helper utilities
- `@excalidraw/excalidraw`
  - top-level React editor package and public API

### Dependency direction

- `element` depends on `common` and `math`
- `math` depends on `common`
- `excalidraw` depends on `common`, `element`, `math`, `utils`-adjacent helpers, React, Jotai
- `excalidraw-app` consumes the published-style API from `@excalidraw/excalidraw`

## 3. App composition pattern

- App entrypoint is minimal:
  - initialize Sentry
  - set git SHA
  - register service worker
  - render `<ExcalidrawApp />` in `StrictMode`
- `ExcalidrawApp` then composes cross-cutting providers:
  - `TopErrorBoundary`
  - app-level Jotai `Provider`
  - `ExcalidrawAPIProvider`
- The actual editor shell lives in `ExcalidrawWrapper`, which renders `<Excalidraw>` plus app-specific UI.

## 4. Reusable editor + host app pattern

- `packages/excalidraw/index.tsx` exposes a reusable `Excalidraw` component and public helpers/hooks.
- The hosted app does not reimplement the editor core; it configures and extends the reusable package.
- This separation lets the repo ship:
  - a production whiteboard app
  - an embeddable React component
  - integration examples

## 5. State management pattern

### Dual-store model

- App shell state uses `appJotaiStore` from `excalidraw-app/app-jotai.ts`.
- Editor internals use `EditorJotaiProvider` / `editorJotaiStore` inside `packages/excalidraw/index.tsx`.
- This keeps app concerns and editor concerns loosely separated.

### Atom-based shared capabilities

- Collaboration state is exposed via atoms:
  - `collabAPIAtom`
  - `isCollaboratingAtom`
  - `isOfflineAtom`
  - `activeRoomLinkAtom`
- Dialogs and UI features also use atoms, e.g. `shareDialogStateAtom`.

## 6. Collaboration pattern

### High-level flow

- `Collab` is a long-lived class component that owns collaboration lifecycle.
- `Portal` owns socket connection details and encrypted broadcasting.
- Firebase is used for durable room/file persistence.
- Socket transport is used for low-latency scene/user updates.

### Important implementation details

- Room links are generated as `#room=<roomId>,<roomKey>`.
- Socket payloads are encrypted before emit.
- Only syncable elements are broadcast to save bandwidth.
- Full-scene resync is still used periodically to reduce divergence risk.
- Image/file upload is throttled and coordinated through `FileManager`.

## 7. Persistence pattern

### Local persistence

- `LocalData.ts` explicitly stores:
  - elements/app state in `localStorage`
  - files/library data in `indexedDB`
- Saves are debounced.
- Saves can be paused with a locking mechanism during collaboration/visibility changes.
- File retrieval updates `lastRetrieved` timestamps for cleanup behavior.

### Remote/share persistence

- `data/index.ts` implements backend export/import with compression + encryption.
- Collaboration persistence uses Firebase save/load helpers.
- Share dialog can start a live room or share exported scene links.

## 8. Performance-oriented patterns

- Manual chunking for locales, CodeMirror, Mermaid conversion in Vite build.
- Throttling is used for:
  - collaboration updates
  - file uploads
  - viewport-related events
- Sync logic sends incremental element updates where possible.
- Fonts/locales/chunks are cached with dedicated PWA runtime caching strategies.

## 9. Reliability / UX guardrails

- Top-level error boundary around app shell.
- Sentry setup with environment gating and ignored noisy browser/storage errors.
- `beforeunload` handling attempts to prevent losing unsaved collaborative state.
- Quota issues in browser storage are tracked via atom state.
- Browser/offline status is surfaced into app state.

## 10. API surface pattern

- `packages/excalidraw/index.tsx` re-exports both UI pieces and programmatic helpers:
  - `Excalidraw`
  - `MainMenu`, `Footer`, `Sidebar`
  - `LiveCollaborationTrigger`
  - hooks like `useExcalidrawAPI`
  - data/element helpers like `convertToExcalidrawElements`, `zoomToFitBounds`
- Public API is intentionally broader than just one component, supporting host-app extensions.

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
