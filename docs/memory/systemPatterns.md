# System Patterns

## Architecture shape

- For a full technical write-up, see [architecture.md](../technical/architecture.md).
- For undocumented behavior, doc/implementation gaps, and refactor hazards (scene render cycle, `componentDidUpdate` ordering, flagged `TODO`/`FIXME`/`HACK` clusters), see [decisionLog.md](./decisionLog.md).
- Monorepo with clear separation between:
  - product application (`excalidraw-app`)
  - reusable library package (`packages/excalidraw`)
  - lower-level shared modules (`packages/common`, `packages/element`, `packages/math`, `packages/utils`)
  - integration samples (`examples/*`)
- Internal packages are consumed through stable `@excalidraw/*` aliases defined in `tsconfig.json` `paths` and mirrored in `vitest.config.mts` and `excalidraw-app/vite.config.mts`, so imports like `@excalidraw/element` resolve to local source (`./packages/element/src/index.ts`) during development and tests.

## Layering pattern

- `packages/common`: shared constants/utilities and cross-cutting helpers (depends on `tinycolor2` only).
- `packages/math`: 2D math utilities (depends on `@excalidraw/common`).
- `packages/element`: element-level operations, geometry, bindings, `Scene`, `Store` (depends on `common` + `math`).
- `packages/utils`: export, shape, and bounding-box utilities (depends on `common`, plus `roughjs`, `pako`, `perfect-freehand`, etc.).
- `packages/excalidraw`: composition layer exposing the `Excalidraw` React component and wiring editor runtime (depends on `common`, `element`, `math`; peer-depends on `react`, `react-dom`).
- `excalidraw-app`: host app that adds product concerns (collaboration, sharing, persistence, app UI).
- Build order is enforced: `common` → `math` → `element` → `excalidraw` (`yarn build:packages`).

## Composition and state patterns

### Dual state model: React class state + Jotai atoms

The editor uses two coexisting state systems:

- **React class state (`App.state`):** The `App` class component in `packages/excalidraw/components/App.tsx` owns the canonical `AppState` via `this.state` / `setState`. This covers the active tool, selection, viewport (zoom/scroll), theme, open dialogs, collaboration fields, and ephemeral editor state. Scene elements live separately in `Scene`, not in React state.
- **Jotai atoms:** `EditorJotaiProvider` wraps the component tree with an isolated store (`editorJotaiStore` from `packages/excalidraw/editor-jotai.ts`, using `jotai-scope` `createIsolation()`). Atoms handle UI concerns that benefit from fine-grained subscriptions outside the full `App` render: sidebar docking (`isSidebarDockedAtom`), dialog state (`activeConfirmDialogAtom`), search focus, overwrite confirmation, i18n language code, and feature-local error state (e.g. `errorAtom` in `TTDDialog`).
- **Bridge:** `App.updateEditorAtom` writes to `editorJotaiStore.set(atom, ...)` and then calls `this.triggerRender()` so the class component picks up the change. Direct reads use `editorJotaiStore.get(...)`.

### Context-based API exposure

- `ExcalidrawAPIContext` / `ExcalidrawAPISetContext` and `ExcalidrawAPIProvider` enable hooks outside the immediate component subtree.
- `UIAppStateContext` exposes a UI-safe subset (`UIAppState`) to descendant components (`packages/excalidraw/context/ui-appState.ts`).
- `useAppStateValue` / `useOnAppStateChange` hooks (`packages/excalidraw/hooks/useAppStateValue.ts`) allow fine-grained re-renders via `api.onStateChange`.

## Code organization patterns

### `packages/excalidraw/` (editor package)

Hybrid layout mixing domain folders with concern-based modules:

- `components/` — React component tree (large; includes `App.tsx`, canvases, menus, dialogs).
- `actions/` — editor commands (`Action` objects registered on `ActionManager`).
- `data/` — serialization, restore, library, export, reconciliation.
- `scene/` — `Renderer`, export-to-canvas helpers.
- `renderer/` — low-level `renderStaticScene` / `renderInteractiveScene` functions.
- `hooks/` — React hooks for app state, stabilized callbacks.
- `fonts/`, `locales/` — font loading, i18n JSON files.
- Feature-specific top-level folders: `charts/`, `lasso/`, `eraser/`, `wysiwyg/`.
- Top-level `.ts` modules for cross-cutting concerns: `clipboard.ts`, `history.ts`, `snapping.ts`, `types.ts`.
- Tests live in `tests/` and as co-located `*.test.ts(x)` files.

### `packages/element/` (element package)

Flat domain modules under `src/`: `Scene.ts`, `store.ts`, `binding.ts`, `resizeElements.ts`, `renderElement.ts`, etc. Named by concern/capability, not feature-folder-per-screen. Subfolder `arrows/` for arrow-specific logic. Tests in `__tests__/` and `tests/`.

## Testing patterns

- **Runner:** Vitest (`vitest@3.0.6`) with `jsdom` environment and `globals: true` (`vitest.config.mts`).
- **Global setup:** `setupTests.ts` at repo root — `vitest-canvas-mock`, `@testing-library/jest-dom`, mocked `throttleRAF`, `setPointerCapture`, `matchMedia`, `FontFace`, `fake-indexeddb`, and a `#root` div.
- **Integration-style rendering:** Tests render the full `<Excalidraw />` component via a custom `render` function in `packages/excalidraw/tests/test-utils.ts`. It uses `@testing-library/react`, waits for both canvases and `window.h.state.isLoading === false` before returning.
- **Test helpers:** `packages/excalidraw/tests/helpers/` provides `api.ts`, `ui.ts` (Pointer, Keyboard, UI interaction simulators), mocks, and polyfills.
- **Dev/test hook (`window.h`):** Populated in `App.componentDidMount` when `isTestEnv() || isDevEnv()`. Exposes `state`, `setState`, `app`, `history`, `store`, `fonts` — allows tests to inspect and drive editor state directly.
- **Assertion styles:** Mix of snapshot tests (`toMatchSnapshot()`, `toMatchInlineSnapshot()` on DOM, SVG, app state, element arrays, undo stacks) and explicit assertions (`toBe`, query-based checks). Both coexist within the same test files.
- **Coverage:** `@vitest/coverage-v8` provider; CI runs `yarn test:coverage` on PRs via `.github/workflows/test-coverage-pr.yml`.

## Error handling patterns

- **App shell error boundary:** `TopErrorBoundary` in `excalidraw-app/components/TopErrorBoundary.tsx` — `componentDidCatch` with Sentry reporting (`Sentry.captureException`), fallback UI offering reload, clear localStorage, or GitHub issue link. This wraps the entire hosted app.
- **No error boundary in the library package:** The embeddable `<Excalidraw />` component does not ship its own `ErrorBoundary`. Hosts are expected to provide one.
- **Defensive try/catch:** Scattered throughout `App.tsx` for external data parsing (e.g. `JSON.parse(event.data)` in message handlers), clipboard operations, font loading, and file I/O. Failures are typically swallowed or surfaced via atoms/state rather than thrown.
- **Feature-local error atoms:** `errorAtom` in `packages/excalidraw/components/TTDDialog/TTDContext.tsx` drives error UI for text-to-diagram flows; consumed by `useTextGeneration.ts`, `useMermaidRenderer.ts`, and `TextToDiagram.tsx`.
- **Browser-specific detection:** `BraveMeasureTextError` handles a known Brave browser issue with `measureText`, surfacing a modal when detected.

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
  - grouped exports from internal `@excalidraw/`\* packages
- Package exports map in `packages/excalidraw/package.json` controls runtime and type entrypoints.

<a id="cicd-pipeline"></a>

## CI/CD pipeline

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `lint.yml` | PR | `yarn test:other` + `yarn test:code` + `yarn test:typecheck` |
| `test-coverage-pr.yml` | PR | `yarn test:coverage` + vitest-coverage-report-action |
| `semantic-pr-title.yml` | PR | Enforces semantic PR titles (`amannn/action-semantic-pull-request`) |
| `size-limit.yml` | PR to `master` | Size-limit check on `packages/excalidraw` (`build:esm`) |
| `test.yml` | Push to `master` | `yarn test:app` |
| `cancel.yml` | Various | Cancels superseded runs for `release` / PR workflows |
| `locales-coverage.yml` | Push to `l10n_master` | `yarn locales-coverage`, may commit `percentages.json` |
| `autorelease-excalidraw.yml` | Push to `release` | `yarn release --tag=next` |
| `build-docker.yml` | Push to `release` | `docker build -t excalidraw .` |
| `publish-docker.yml` | Push to `release` | Buildx multi-arch push `excalidraw/excalidraw:latest` |
| `sentry-production.yml` | Push to `release` | Build app, Sentry release + sourcemaps upload |

## Source-verified references

- Monorepo + scripts: `package.json`.
- Alias/path strategy: `tsconfig.json` (`paths`), `vitest.config.mts`, `excalidraw-app/vite.config.mts`.
- Jotai isolation + provider: `packages/excalidraw/editor-jotai.ts`, `packages/excalidraw/index.tsx`.
- App entrypoint and service worker registration: `excalidraw-app/index.tsx`.
- Library composition and exports: `packages/excalidraw/index.tsx`.
- App host integration: `excalidraw-app/App.tsx`.
- Firebase/encryption persistence flow: `excalidraw-app/data/firebase.ts`.
- Test infrastructure: `vitest.config.mts`, `setupTests.ts`, `packages/excalidraw/tests/test-utils.ts`.
- Error boundary (app): `excalidraw-app/components/TopErrorBoundary.tsx`.
- CI workflows: `.github/workflows/*.yml`.
