# System Patterns

## Element Mutation

Two functions handle element changes — never modify element properties directly:

| Function | Where | When to use |
|----------|-------|-------------|
| `mutateElement(el, updates)` | `packages/element/src/mutateElement.ts` | In-place update during user interaction; increments `version`/`versionNonce`, updates `updated` timestamp, clears shape cache |
| `newElementWith(el, updates)` | same file | Immutable copy for Store operations; does not mutate original |

## Scene / Store / History

```
mutateElement() or newElementWith()
        ↓
Scene.replaceAllElements() / Scene.mapElements()   ← element tree (array + Map)
        ↓
Store.commit() / Store.scheduleCapture()           ← creates StoreSnapshot
        ↓
Store emits DurableIncrement (→ History) or EphemeralIncrement
        ↓
History.record(delta)                              ← undo stack entry
```

**CaptureUpdateAction modes** (controls whether a change goes to undo history):
- `IMMEDIATELY` — pushed to undo stack right away (most user actions)
- `NEVER` — never recorded (remote/collaboration updates)
- `EVENTUALLY` — emits an ephemeral increment (like `NEVER`) but does **not** advance the snapshot; the next `IMMEDIATELY` diff will include these changes

## Rendering Pipeline

```
Scene.getNonDeletedElements()
        ↓
Renderer.getRenderableElements()     ← viewport culling + memoization
        ↓
renderStaticScene()                  ← background, grid, all shapes
renderInteractiveScene()             ← selections, cursors, snap guides
renderNewElementScene()              ← preview of element being drawn
```

Both static and interactive renders target separate `<canvas>` layers.

## State Management (Jotai)

- **Never** import directly from `jotai` — always use `app-jotai` (in `excalidraw-app`) or `editor-jotai` (in packages)
- Atoms are defined in `excalidraw-app/app-jotai.ts`
- Central store: `appJotaiStore = createStore()`
- `AppState` (the large monolithic state object) lives outside Jotai and is managed by `App.tsx` via `setState`

## Import Rules

- No barrel imports from `packages/excalidraw/index.tsx` inside the packages themselves
- Type-only imports must use `import type { ... }`
- Custom ESLint import grouping enforced via `.eslintrc.json`

## Math / Coordinates

- Always use `Point` type from `packages/math/src/types.ts` — never plain `{ x, y }` tuples
- All geometry utilities (vectors, curves, polygons, ellipses) live in `packages/math/src/`

## CSS / Styling

- Component styles use CSS Modules (`.module.scss`)
- Global styles in `packages/excalidraw/css/`
- Theme tokens: `THEME.LIGHT` / `THEME.DARK` (from `@excalidraw/common`)

## Collaboration Pattern

```
Local change
    ↓
Encrypt payload (AES-GCM, key in URL hash)
    ↓
Socket.io broadcast to room peers
    ↓
Remote peers receive → Store.commit(NEVER) → merge into Scene
    ↓
Collaborator cursors tracked in AppState.collaborators Map
```

Element ordering in multiplayer uses **fractional indices** (`element.index`) to avoid conflicts.
