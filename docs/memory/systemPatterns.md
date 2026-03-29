# System Patterns

Architecture, key design patterns, and structural conventions verified against source code.

---

## Monorepo Structure

Yarn Classic (v1) workspace monorepo — `excalidraw-monorepo`.

**Workspaces** (`package.json` lines 6–9):
```
excalidraw-app/       — Private Vite + React SPA (production product)
packages/*            — Published @excalidraw/* library packages
examples/*            — Integration demos (NextJS, browser script)
```

**No Node API server** — backend interactions go through Firebase SDK and HTTP endpoints directly from the browser.

---

## Package Dependency Graph

Strict layering enforced by ESLint boundaries (`packages/eslintrc.base.json`):

```
@excalidraw/common          ← base primitives, no internal deps
@excalidraw/math            ← depends on common
@excalidraw/element         ← depends on common, math
@excalidraw/excalidraw      ← depends on common, element, math + all runtime deps
@excalidraw/utils           ← standalone utility bundle
excalidraw-app              ← consumes excalidraw via Vite alias (not semver)
```

- All core packages share version `0.18.0`; `@excalidraw/utils` is versioned separately (`0.1.2`)
- In development the app resolves `@excalidraw/excalidraw` via Vite/TS aliases to `packages/excalidraw/index.tsx` — no npm install required for local iteration

---

## Path Aliases

Consistent aliasing across TypeScript, Vite, and Vitest (`tsconfig.json` lines 20–31):

```json
"@excalidraw/common"     → packages/common/src/index.ts
"@excalidraw/math"       → packages/math/src/index.ts
"@excalidraw/element"    → packages/element/src/index.ts
"@excalidraw/excalidraw" → packages/excalidraw/index.tsx
"@excalidraw/utils"      → packages/utils/src/index.ts
```

Same aliases are mirrored in `vitest.config.mts` and `excalidraw-app/vite.config.mts`.

---

## Application Architecture (Feature Folders, Not MVC)

The codebase is organized by **feature / concern**, not by traditional controller–service–repository tiers.

### `excalidraw-app/` (Product Shell)

```
App.tsx             — top-level shell, mounts library + product-level UI
app-jotai.ts        — shared Jotai store atoms for the app layer
components/         — app-only UI (sidebars, AI entry, error indicators)
data/               — Firebase bridge, local persistence, file upload pipeline
collab/             — real-time collaboration lifecycle (Collab.tsx, Portal.tsx)
share/              — share/QR dialog flows
app-language/       — language detection + selector UI
```

### `packages/excalidraw/` (Embeddable Library)

```
components/         — all UI and toolbars
scene/              — canvas/scene coordination
renderer/           — drawing pipeline
data/               — serialization, restore, reconcile, encryption
hooks/              — reusable React hooks
actions/            — user command bindings
tests/              — Vitest suites
```

### `packages/element/`

Pure functions for element geometry, hashing, and filtering — no class hierarchies. Barrel re-exports from `src/index.ts`.

---

## State Management Patterns

### Jotai — Scoped Atomic State

Two distinct Jotai stores to prevent state leakage when multiple library instances are embedded:

- **Editor store** (`packages/excalidraw/editor-jotai.ts`): uses `jotai-scope` isolation
  ```ts
  const jotai = createIsolation();
  export const editorJotaiStore = createStore();
  export const EditorJotaiProvider = jotai.Provider;
  ```
- **App store** (`excalidraw-app/app-jotai.ts`): global product-level atoms
  ```ts
  export const collabAPIAtom = atom<CollabAPI | null>(null);
  export const isCollaboratingAtom = atom(false);
  ```

### React Context — Imperative API Surface

`ExcalidrawAPIContext` / `ExcalidrawAPISetContext` expose the canvas imperative API so host apps and internal hooks can access it without prop drilling:

```ts
// packages/excalidraw/index.tsx
import App, { ExcalidrawAPIContext, ExcalidrawAPISetContext } from "./components/App";
```

Custom hooks (`useExcalidrawAPI`, `useAppStateValue`, `useOnAppStateChange`) are built on top of these contexts.

---

## Collaboration Architecture

Real-time collaboration is handled **entirely client-side**:

- **`Collab.tsx`** (`excalidraw-app/collab/`) — a `PureComponent` that owns the collaboration lifecycle; registered into the Jotai store via `collabAPIAtom`
- **`Portal.tsx`** — Socket.io wrapper; manages the room connection and message broadcast
- **Firebase Firestore** — persistent scene storage and reconciliation
- **Socket.io** — live cursor + incremental scene updates between peers
- **Encryption** — end-to-end scene encryption via browser Web Crypto API (`packages/excalidraw/data/`)

---

## Key Design Patterns

### Functional Core for Elements

`packages/element` exports pure functions (no side effects, no classes). All element mutation is via **immutable-style updates** — elements are replaced rather than mutated in place.

### Branded / Nominal Typing

Used in sync code to prevent passing unsanitized data across trust boundaries:

```ts
// excalidraw-app/data/index.ts
type SyncableExcalidrawElement = MakeBrand<ExcalidrawElement, "SyncableExcalidrawElement">;
```

### Module-Oriented Services (Plain Imports)

No DI containers (no Inversify / tsyringe). Services like `FileManager`, `LocalData`, and `firebase` helpers are **plain TypeScript modules** imported directly. Coordination happens through Jotai atoms and React context.

### Embeddable Library with Compound Component API

The library entry (`packages/excalidraw/index.tsx`) exports a compound component tree:

```ts
export { default } from "./components/App";
export { MainMenu, Footer, WelcomeScreen, LiveCollaborationTrigger };
export { EditorJotaiProvider, editorJotaiStore };
// + type exports, hooks, utilities
```

Consumers compose features by rendering sub-components as children of the main `<Excalidraw>` component.

### PWA / Offline-First

- Service worker registered at app entry (`excalidraw-app/index.tsx`) via `vite-plugin-pwa`
- Offline persistence via `idb-keyval` (IndexedDB) and localStorage wrappers in `excalidraw-app/data/`

---

## Testing Conventions

- **Vitest** + jsdom + Testing Library for unit and component tests
- Test files colocated under `packages/excalidraw/tests/` and `excalidraw-app/tests/`
- Coverage thresholds enforced in `vitest.config.mts`
- Same TypeScript path aliases applied in test config for consistent imports

---

## ESLint Import Boundaries

`packages/eslintrc.base.json` prevents lower-level packages (`common`, `math`, `element`) from importing `@excalidraw/excalidraw` implementation (only types allowed). This enforces the one-way dependency graph above.

---

## Build Pipeline

| Target | Tool |
|--------|------|
| App (`excalidraw-app`) | Vite 5 (`vite.config.mts`) |
| Library packages | esbuild + `esbuild-sass-plugin` (`scripts/buildPackage.js`) |
| Root orchestration | `yarn build:packages` → then `yarn build` for the app |

Library packages publish CommonJS + ESM dual builds; the app produces a chunked static bundle with PWA assets.

## Details

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md)
