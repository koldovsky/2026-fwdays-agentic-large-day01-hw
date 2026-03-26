# System Patterns: Excalidraw

## Architecture Overview

Excalidraw is a **Yarn monorepo** with a clear dual-product structure:
- `excalidraw-app/` — the hosted web product
- `packages/` — publishable npm packages

The architecture enforces strict package boundaries: app-layer code can depend on packages, but packages must not depend on the app.

---

## Component Tree

```
excalidraw-app/index.tsx        (React root, Sentry init, PWA registration)
└── ExcalidrawApp (App.tsx)     (Firebase init, theme)
    └── [ExcalidrawAPIProvider] (optional external wrapper — exposes useExcalidrawAPI() outside <Excalidraw>)
        └── Excalidraw          (packages/excalidraw/index.tsx — library root, exported as ExcalidrawBase)
            └── EditorJotaiProvider (Jotai atom store: editorJotaiStore)
                └── InitializeApp
                    └── App     (packages/excalidraw/components/App.tsx — core editor)
                        ├── components/canvases/   (canvas rendering, not DOM)
                        ├── UI overlays, menus, toolbars
                        └── Event handlers
```

> Note: `ExcalidrawAPIProvider` is **not** rendered inside `<Excalidraw>`. It is a separately exported provider that consumers wrap around `<Excalidraw>` to enable `useExcalidrawAPI()` outside the component tree.

---

## State Management Pattern

### Two-Layer State

1. **Jotai atoms** — reactive state for UI, live subscriptions, per-component state
   - `editorJotaiStore` (`packages/excalidraw/editor-jotai.ts`) — editor-scoped store
   - `appJotaiStore` (`excalidraw-app/app-jotai.ts`) — app-scoped store
   - **Jotai scope restriction**: ESLint rule enforces using scoped store, not global `useAtom`

2. **Centralized AppState** — plain object with all editor state
   - Defaults defined in `packages/excalidraw/appState.ts`
   - Passed as props through the tree
   - Key fields: `zoom`, `scrollX/Y`, `selectedElementIds`, `activeTool`, `editingGroupId`, `viewModeEnabled`, etc.

### Data Flow

```
User interaction
  → App.tsx event handler
  → AppState / Scene mutation
  → Canvas re-render (Rough.js)
  → Persist to localStorage / IndexedDB / Firebase
```

---

## Element Immutability Pattern

All `ExcalidrawElement` instances are **immutable objects**.

### Rules

- Never mutate elements directly
- Always use `newElementWith(element, { ...changes })` to produce updated copies
- Deleted elements stay in scene with `isDeleted: true` — never remove from array
- Use `getNonDeletedElements()` to get visible elements for rendering

### Why

- Enables cheap reference equality checks (`===`) for change detection
- Required for collaboration version tracking (`version` increments on each mutation)
- Enables undo/redo via history snapshots

---

## Collaboration Pattern

### Version-Based Reconciliation

- Each element has `version: number` + `versionNonce: number`
- On conflict: higher `version` wins; equal versions use `versionNonce` as tiebreaker
- Logic in `packages/excalidraw/data/reconcile.ts`

### Sync Strategy

- **Full sync** every 20 seconds (entire scene state; `SYNC_FULL_SCENE_INTERVAL_MS = 20000`)
- **Incremental updates** on each change (only changed elements)
- **Transport**: Socket.io-client over WebSocket

### Z-Order Stability

- **Fractional indexing** (library: `fractional-indexing` 3.2.0)
- Each element has `index: FractionalIndex` property
- Allows inserting elements between existing ones without reindexing all others
- Stable across concurrent edits from multiple peers

---

## Package Dependency Pattern

Strict one-way dependency chain:

```
excalidraw-app
  └─ @excalidraw/excalidraw
       └─ @excalidraw/element
            ├─ @excalidraw/math
            └─ @excalidraw/common

@excalidraw/utils     (standalone — no internal deps)
```

### Package Roles

| Package | Role |
|---------|------|
| `common` | Shared constants, utilities, branded types |
| `math` | 2D vectors, geometry operations |
| `element` | Element type definitions, constructors, transforms |
| `excalidraw` | Main React component, rendering, actions, UI |
| `utils` | Export/import, compression, file handling |

---

## Rendering Pattern

- **Canvas-based rendering** — all drawing happens on HTML5 `<canvas>`, not DOM elements
- **Rough.js** produces hand-drawn strokes from element geometry
- **perfect-freehand** handles freehand (`freedraw`) element stroke smoothing
- Canvas components live in `packages/excalidraw/components/canvases/`
- Re-render triggered by AppState / Scene changes (not React reconciliation for canvas)

---

## Action Pattern

All user actions (tool selection, style changes, copy/paste, etc.) are handled via a centralized action system in `packages/excalidraw/actions/` (~102 named actions).

- Each action is registered with `register()` from `packages/excalidraw/actions/register.ts`
- Actions receive `(elements, appState, formData, app)` and return `{ elements?, appState?, files?, captureUpdate: CaptureUpdateActionType, replaceFiles? } | false`
- History (undo/redo) driven by `captureUpdate` field in action result

---

## Persistence Pattern

Three storage layers, used in priority order:

| Layer | Technology | Scope |
|-------|-----------|-------|
| In-memory | React state / Jotai | Current session |
| Local | localStorage + IndexedDB | Per-browser |
| Remote | Firebase Firestore + Storage | Cross-device, collab rooms |

- Scene data is compressed (pako/zlib) before storage
- PNG exports embed scene JSON in PNG metadata chunks (png-chunks-*)
- `excalidraw-app/data/` handles all persistence logic

---

## Build Pattern

### App Build (Vite)

- Entry: `excalidraw-app/index.tsx`
- Asset chunking: locale files split per language for lazy loading
- Environment variables injected at build time (git SHA, Firebase config, Sentry DSN)
- PWA: Service Worker precache via vite-plugin-pwa

### Package Build (esbuild)

- Each package builds independently via `esbuild`
- Outputs: ESM + CJS
- Type declarations generated separately by `tsc`

### CI/CD

- GitHub Actions workflows in `.github/workflows/`
- Full test suite runs on PRs: typecheck + lint + Prettier + Vitest
- Coverage thresholds enforced: 60% lines / 70% branches / 63% functions

---

## Key Patterns Summary

| Pattern | Where Used |
|---------|-----------|
| Immutable elements via `newElementWith()` | All element mutations |
| Version + versionNonce for conflict resolution | Collaboration reconcile |
| Fractional indexing for z-order | Element ordering |
| Jotai scoped stores | State isolation |
| Canvas rendering (not DOM) | All drawing |
| Centralized action handlers | User interactions |
| Compressed JSON in PNG metadata | Scene export/import |

---

## Related Documents

| Document | Relevance |
|----------|-----------|
| [decisionLog.md](./decisionLog.md) | Rationale and consequences behind each architectural pattern |
| [techContext.md](./techContext.md) | Library versions powering these patterns (Rough.js, Jotai, Socket.io, etc.) |
| [projectbrief.md](./projectbrief.md) | Element model details (immutability, types, key files) |
| [activeContext.md](./activeContext.md) | Current coding standards and reminders for active work |
| [architecture.md](../technical/architecture.md) | Deep dive: rendering pipeline, data flow diagrams, state management internals |
| [domain-glossary.md](../product/domain-glossary.md) | Precise definitions for Scene, AppState, Action, Reconciliation, FractionalIndex |
