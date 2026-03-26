# System Patterns — Excalidraw Monorepo

## Monorepo Architecture

### Workspace Layout

```
excalidraw-monorepo/
├── excalidraw-app/         # Product (Vite SPA)
├── packages/
│   ├── common/src/         # Shared utilities & types
│   ├── math/src/           # 2D geometry primitives
│   ├── element/src/        # Element model & store
│   ├── excalidraw/         # Core editor (React component)
│   └── utils/src/          # Export & bbox helpers
├── examples/
│   ├── with-nextjs/        # Next.js 14 integration example
│   └── with-script-in-browser/  # Vanilla browser example
├── scripts/                # Build, release, wasm, locale tools
├── public/                 # Static assets
└── firebase-project/       # Firebase config
```

### Dependency Graph (packages)

```
math ──► common
element ──► common, math
excalidraw ──► common, math, element
utils ──► (standalone)
excalidraw-app ──► excalidraw (+ app-only deps)
```

All packages at `0.18.0`, resolving to **source** via path aliases in TS, Vite, and Vitest.

### Library / App Boundary

A strict separation enforced by project structure:

- **Library** (`packages/excalidraw`) — embeddable, no opinions on storage or
  collaboration backend. Peer-depends on React.
- **App** (`excalidraw-app`) — product opinions: Firebase, Sentry, Socket.IO
  collaboration, PWA, and shell menus.

This separation lets third-party consumers embed `<Excalidraw />` without
pulling in Firebase, Sentry, or collaboration code.

## State Management Pattern

### Jotai with Store Isolation

Two isolated Jotai stores prevent atom leakage between layers:

- **`editor-jotai`** (`packages/excalidraw/editor-jotai.ts`) — atoms for the
  drawing editor internals (tool state, selection, zoom, etc.). Uses
  `jotai-scope` for isolation.
- **`app-jotai`** (`excalidraw-app/app-jotai.ts`) — atoms for the host app
  (collaboration state, UI preferences, etc.).

**ESLint enforcement**: direct `import { ... } from "jotai"` is forbidden.
All code must import from `editor-jotai` or `app-jotai`.

Source: `.eslintrc.json` → `no-restricted-imports` rule.

### Imperative API via Context

The library exposes `ExcalidrawImperativeAPI` through React context:

```
ExcalidrawAPIProvider
  └── ExcalidrawAPIContext.Provider (value = API instance)
       └── ExcalidrawAPISetContext.Provider (setter)
            └── <Excalidraw /> (creates App, sets API on mount)
```

External consumers use:
- `useExcalidrawAPI()` — get imperative API handle
- `useAppStateValue()` — subscribe to app state slices
- `useOnAppStateChange()` — listen for state changes

Source: `packages/excalidraw/index.tsx`

## Element Model

### Store & Mutation Pipeline

`Store` in `packages/element/src/store.ts` is the central mutation system:

- All element mutations go through `CaptureUpdateAction`
- Supports undo/redo via captured deltas
- Reconciliation algorithm for merging remote changes (`reconcileElements`)

### Element Ordering

Uses **fractional indexing** (`fractional-indexing@3.2.0`) for z-order,
allowing insertions between elements without renumbering.

### Element Types

All elements share a base type (`ExcalidrawElement`) extended by specific
element types. Key abstractions:

- `OrderedExcalidrawElement` — element with fractional index
- `NonDeletedExcalidrawElement` — excludes soft-deleted elements
- `ExcalidrawInitialDataState` — initial data shape for loading scenes

## Rendering Architecture

### Canvas-Based Drawing

- **roughjs** renders shapes with hand-drawn aesthetics on HTML Canvas
- **perfect-freehand** generates freehand stroke paths
- The renderer lives in `packages/excalidraw/renderer/`
- Separate render passes for static elements, interactive elements, and
  selection UI

### Font System

- Custom subsetting via **harfbuzzjs** + **fonteditor-core**; WOFF2 from CDN
- `ExcalidrawFontFace` wraps Font Loading API; Vite plugin for processing

## Communication Patterns

### Event Bus

`AppEventBus` in `packages/common/src/appEventBus.ts` — typed pub/sub for
decoupled cross-module communication within the editor.

Built on a lightweight `Emitter` class (`packages/common/src/emitter.ts`).

### Collaboration Protocol

- `Collab.tsx` orchestrates; `Portal.tsx` wraps socket.io-client
- Events: `init-room`, `join-room`, `room-user-change` + custom `WS_EVENTS`
- Encryption key in URL hash (never sent to server)
- `reconcileElements()` merges remote changes with local state

### External Services

| Service | Module | Pattern |
|---------|--------|---------|
| Firebase | `excalidraw-app/data/firebase.ts` | Client SDK, lazy init |
| Backend v2 | `excalidraw-app/data/index.ts` | REST via `fetch()` |
| Sentry | `excalidraw-app/sentry.ts` | Global error handler |

## Error Handling

- **Typed errors** in `packages/excalidraw/errors.ts`: `ExcalidrawError`,
  `CanvasError`, `AbortError`, `RequestError` (with status/data),
  `ImageSceneDataError`, `WorkerUrlNotDefinedError`
- **React Error Boundary**: `TopErrorBoundary` catches render errors → Sentry

## Import & Module Conventions

- **Import order** (ESLint): builtin → external → `@excalidraw/*` → internal → types
- **Barrel restriction**: inside `packages/excalidraw/`, importing from
  `@excalidraw/excalidraw` barrel is forbidden — use direct relative imports
- **Type-only imports**: `import type { ... }` enforced with separate style

## Build Patterns

### Package Build Pipeline

Packages build sequentially (dependency order):

```
common → math → element → excalidraw
```

Each package uses esbuild (`scripts/buildPackage.js`) to emit:
- `dist/dev/` — development build
- `dist/prod/` — production build (minified)
- `dist/types/` — TypeScript declarations

### App Build

Vite with manual chunk splitting for optimal caching:

| Chunk | Content |
|-------|---------|
| `locales/*` | Individual locale JSON files (except en, percentages) |
| `mermaid-to-excalidraw` | Mermaid diagram conversion |
| `codemirror.chunk` | CodeMirror + Lezer packages |

### PWA Caching Strategy

| Resource | Strategy | TTL |
|----------|----------|-----|
| Fonts (`.woff2`) | CacheFirst | 90 days |
| `fonts.css` | StaleWhileRevalidate | — |
| Locales | CacheFirst | 30 days |
| Code chunks | CacheFirst | 90 days |

## Testing Patterns

- **Setup** (`setupTests.ts`): mocks Canvas, IndexedDB, matchMedia, FontFace,
  throttleRAF; overrides font fetching for local FS reads
- **Organization**: co-located `*.test.ts(x)` + dedicated `packages/*/tests/`
  dirs + snapshot tests + shared helpers in `packages/excalidraw/tests/helpers/`
- **Config**: Vitest with `globals: true`, `jsdom`, parallel hooks
