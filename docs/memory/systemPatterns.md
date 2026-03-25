# systemPatterns.md

## Details
For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
For WHY these patterns were chosen → see [docs/memory/decisionLog.md](decisionLog.md)
For undocumented behaviors → see [docs/technical/undocumented-behavior.md](../technical/undocumented-behavior.md)

## Top-Level Architecture

Excalidraw uses a **layered monorepo** where each package has a strict upward dependency direction. No circular imports are allowed and ESLint enforces this.

```
excalidraw-app  (web app)
packages/utils  (public export API)
      ↑
packages/excalidraw  (React library: App, renderer, actions, UI)
      ↑
packages/element  (element types, Scene, Store, mutation, delta)
      ↑
packages/common  (constants, utilities, event primitives)
packages/math   (pure 2D geometry, no internal deps)
```

## State Management: Four Concurrent Systems

`App` (a React class component) coordinates four state systems:

| System | Location | Mechanism | Purpose |
|--------|----------|-----------|---------|
| `AppState` | `this.state` | React `setState` | UI, viewport, tool, selection |
| Elements | `this.scene` (Scene instance) | Mutable objects + callbacks | Element registry |
| History | `this.store` → `this.history` | Store diffs → undo/redo stack | Undo/redo |
| Fine-grained UI | Jotai atoms | `editorJotaiStore.set()` | Per-feature isolated state |

**Critical rule**: Jotai must never be imported from `jotai` directly — always use `editor-jotai` or `app-jotai` wrappers to stay inside the isolated `createIsolation()` scope.

## Element Mutation Pattern

Elements are **mutable objects** stored in `Scene`, not immutable React state. There are two mutation paths:

```
mutateElement(element, elementsMap, updates)
  → mutates in place
  → bumps version, versionNonce, updated
  → invalidates ShapeCache
  → does NOT trigger React re-render

scene.mutateElement(element, updates, { informMutation: true })
  → calls mutateElement
  → calls scene.triggerUpdate() → triggerRender() → setState({})
  → triggers React re-render
```

`newElementWith(element, updates)` — immutable version, returns new object. Use when you cannot mutate in place (e.g. inside delta application).

## Scene → React Bridge

`Scene` fires callbacks on every update. `App` registers `this.scene.onUpdate(this.triggerRender)` in `componentDidMount`. This is the only bridge between the mutable element world and the React render cycle.

```
scene.mutateElement / replaceAllElements
  → scene.triggerUpdate()
  → triggerRender callback
  → setState({}) or scene.triggerUpdate()
  → React re-render
```

## Action System (Command Pattern)

All user-initiated mutations go through `ActionManager`:

```
User gesture / keyboard shortcut
  → ActionManager.executeAction(name)
  → action.perform(elements, appState, formData, app)
  → returns ActionResult { elements?, appState?, files?, captureUpdate }
  → syncActionResult(result)
      ├── store.scheduleAction(captureUpdate)
      ├── scene.replaceAllElements(result.elements)
      └── setState(result.appState)
```

`CaptureUpdateAction` enum controls undo-ability:
- `IMMEDIATELY` — goes to undo stack right away
- `EVENTUALLY` — deferred, merged into next IMMEDIATELY commit (async ops)
- `NEVER` — remote updates, scene init, never recorded

## Store → History Pipeline

At the **end of every `componentDidUpdate`**, `store.commit(elementsMap, appState)` is called unconditionally. It diffs the current state against the last `StoreSnapshot` and emits:
- `DurableIncrement` → wired to `history.record(delta)` in `componentDidMount`
- `EphemeralIncrement` → forwarded to `props.onIncrement` if registered

`Delta<T>` holds `{ deleted: Partial<T>, inserted: Partial<T> }`. `inverse()` swaps them for undo. The history stack stores `StoreDelta` objects that span both elements and AppState.

## Rendering Pipeline (Five Layers)

```
1. StaticCanvas      ← grid + all non-deleted elements (throttled)
2. InteractiveCanvas ← selection handles, remote cursors, snap lines, binding highlights
3. NewElementCanvas  ← element currently being drawn (active pointer gesture only)
4. SVG layer         ← bounding boxes, resize handles
5. React DOM layer   ← toolbars, menus, dialogs, sidebars
```

`ShapeCache` stores the computed RoughJS `Drawable` per element (keyed by id+version). `mutateElement` invalidates it on geometry changes. `renderElement.ts` reads from it during canvas draw.

`scene/Renderer.ts` provides `getRenderableElements()` — memoized filtering of non-deleted, in-viewport elements. The static canvas render is throttled. The interactive canvas re-renders on every pointer event.

## Portal/Tunnel System

`context/tunnels.ts` uses `tunnel-rat` to let child components inject content into named slots higher in the tree. Consumers pass JSX as children to `<Excalidraw.MainMenu>`, `<Excalidraw.Footer>`, etc., which teleport via tunnel into `LayerUI` at the correct DOM position.

## Event Listener Lifecycle Pattern

All DOM event listeners are managed through `onRemoveEventListenersEmitter`:

```
addEventListeners()
  → addEventListener(target, event, handler) returns unsubscribe fn
  → onRemoveEventListenersEmitter.once(unsubscribeFn, ...)

removeEventListeners()
  → onRemoveEventListenersEmitter.trigger()  ← fires all unsubscribe fns at once
```

Two tiers: **view+edit** (always active) and **edit-only** (skipped when `viewModeEnabled`). When `viewModeEnabled` toggles, `addEventListeners()` is called again, which first calls `removeEventListeners()`.

## Coordinate System Convention

From `packages/math/src/types.ts` — all geometry uses **branded tuple types**:

- `GlobalPoint` — world/scene space `[x, y]`
- `LocalPoint` — element-local space `[x, y]` (before rotation)
- `Vector` — direction + magnitude, no position
- `Radians` / `Degrees` — branded numbers preventing unit mix-up

TypeScript rejects mixing coordinate spaces at compile time. `GlobalCoord / LocalCoord` (`{ x, y }` objects) exist as a migration shim with TODO to remove.

## Jotai Isolation Pattern

Multiple Excalidraw instances on one page must not share state. `editor-jotai.ts` uses `jotai-scope`'s `createIsolation()` to produce isolated versions of `useAtom`, `useSetAtom`, `useAtomValue`, and `useStore`. `EditorJotaiProvider` wraps the entire component tree.

## Key Design Rules (from .github/copilot-instructions.md)

- **No allocation in hot paths** — prefer implementations that avoid object creation; trade RAM for CPU
- **Immutable data** — use `const` and `readonly` throughout
- **No barrel imports inside `packages/excalidraw`** — import directly from the source file
- **No direct `jotai` import** — always go through `editor-jotai` or `app-jotai`
- **Use `Point` type** (`packages/math/src/types.ts`) not raw `{ x, y }` objects
- **`withBatchedUpdates`** — wrap all DOM `addEventListener` handlers and pointer event handlers to batch React state updates (wraps `React.unstable_batchedUpdates`). Not needed for React synthetic event handlers — those are already batched by React. Not needed inside `useEffect` — React 18 batches those automatically.
- **`flushSync`** — use only when a synchronous re-render is required before continuing (text commit, some keyboard flows)

## AppState Persistence Configuration

`APP_STATE_STORAGE_CONF` in `appState.ts` is a per-field map controlling where each AppState field is persisted. Three dimensions per field:

- `browser` — survives page reload (localStorage)
- `export` — included in `.excalidraw` file export
- `server` — synced to collaboration server / share link

Fields not listed in a dimension are stripped before that operation.

## `onChange` Notification Contract

`props.onChange(elements, appState, files)` (and `onChangeEmitter`) fires in `componentDidUpdate` **only when `!state.isLoading`**. This prevents overwriting localStorage with empty state during tab-not-focused initialization.
