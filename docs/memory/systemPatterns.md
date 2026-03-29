# System Patterns

## Architecture shape

- For a full technical write-up, see `docs/technical/architecture.md`.
- Monorepo with clear separation between:
  - product application (`excalidraw-app`)
  - reusable library package (`packages/excalidraw`)
  - lower-level shared modules (`packages/common`, `element`, `math`, `utils`)
  - integration samples (`examples/*`)
- Internal packages are consumed through stable `@excalidraw/*` aliases in TS/Vite/Vitest config.

## Layering pattern

- `packages/common`: shared constants/utilities and cross-cutting helpers.
- `packages/element`: element-level operations and geometry/editor primitives.
- `packages/math`: math utilities used by editor logic.
- `packages/utils`: export and helper utilities.
- `packages/excalidraw`: composition layer exposing the `Excalidraw` React API and wiring editor runtime.
- `excalidraw-app`: host app that adds product concerns (collaboration, sharing, persistence, app UI).

## Composition and state patterns

- React composition pattern: top-level app/library entry renders provider-wrapped component trees.
- Context-based API exposure pattern in library:
  - `ExcalidrawAPIContext` and `ExcalidrawAPISetContext`
  - `ExcalidrawAPIProvider` enables hooks outside immediate component subtree.
- Jotai store/provider pattern appears in both library and app integration layers.

## Runtime and delivery patterns

- Vite-based frontend pipeline with alias mirroring to keep local package resolution consistent.
- Build chunking strategy includes manual chunking for locales and selected heavy dependencies.
- PWA-first optimizations:
  - service worker registration at app startup
  - runtime caching for fonts/locales/chunks
  - manifest with file handlers/share target

## Collaboration and persistence patterns

- App-level collaboration module (`excalidraw-app/collab`) orchestrates multiplayer behavior.
- Firebase integration pattern in app data layer:
  - lazy-initialized app/firestore/storage singletons
  - encrypted scene persistence (`encryptData`/`decryptData`)
  - transaction-based save semantics for scene updates
- Local-first recovery pattern:
  - initializes from local storage
  - conditionally merges/overrides based on external links and collaboration context

## Public API pattern (library)

- `packages/excalidraw/index.tsx` exports:
  - primary `Excalidraw` component
  - hooks, helper functions, and typed subpath exports
  - grouped exports from internal `@excalidraw/*` packages
- Package exports map in `packages/excalidraw/package.json` controls runtime and type entrypoints.

## Source-verified references

- Monorepo + scripts: `package.json`.
- Alias/path strategy: `tsconfig.json`, `vitest.config.mts`, `excalidraw-app/vite.config.mts`.
- App entrypoint and service worker registration: `excalidraw-app/index.tsx`.
- Library composition and exports: `packages/excalidraw/index.tsx`.
- App host integration: `excalidraw-app/App.tsx`.
- Firebase/encryption persistence flow: `excalidraw-app/data/firebase.ts`.
