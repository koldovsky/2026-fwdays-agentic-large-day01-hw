# Key Decisions & Undocumented Behaviors

## Architectural Decisions

### 1. Jotai over Redux for State Management

- **Decision**: Use Jotai (atomic state) instead of Redux or Context-heavy patterns
- **Context**: The project needs lightweight, granular state updates without boilerplate. Two separate Jotai stores isolate app-shell concerns from editor internals
- **Consequences**: Simpler API, less boilerplate, but two stores (`appJotaiStore`, `editorJotaiStore`) require careful import discipline. ESLint restricts direct Jotai imports to force use of wrapper modules
- **Source**: `packages/excalidraw/editor-jotai.ts` (uses `jotai-scope` `createIsolation()`), `excalidraw-app/app-jotai.ts` (plain `createStore()`)

### 2. Vite over Webpack/CRA

- **Decision**: Use Vite for development server and production builds
- **Context**: Migrated from Create React App. Vite provides faster HMR and simpler configuration. Multiple Vite plugins handle React, SVG, PWA, EJS templating, TypeScript checking
- **Consequences**: Path aliases must be configured in both `tsconfig.json` and `vitest.config.mts`/`vite.config.mts`. Package builds use esbuild scripts directly instead of Vite
- **Source**: `excalidraw-app/vite.config.mts`, `vitest.config.mts`, `scripts/buildPackage.js`

### 3. Monorepo with Yarn Workspaces (Classic)

- **Decision**: Split code into `@excalidraw/common`, `@excalidraw/math`, `@excalidraw/element`, `@excalidraw/excalidraw`, `@excalidraw/utils`
- **Context**: Separation of concerns — math primitives have no React dependency, element logic is framework-agnostic, the excalidraw package is the React library, the app is a specific deployment
- **Consequences**: Strict build order required (common → math → element → excalidraw). Path aliases needed for dev mode since packages import from source, not built output
- **Source**: Root `package.json` workspaces config, `tsconfig.json` paths, `scripts/buildPackage.js`

### 4. Delta-Based History (Store/Delta System)

- **Decision**: Implement undo/redo via a delta-based system rather than full snapshot cloning
- **Context**: Full snapshots of elements array would be memory-intensive for large scenes. Deltas capture only changes, and `CaptureUpdateAction` categorizes updates as IMMEDIATELY (undoable), NEVER (remote), or EVENTUALLY (deferred)
- **Consequences**: Complex code in `Store`, `StoreDelta`, `HistoryDelta`, `ElementsDelta`, `AppStateDelta`. Undo/redo must handle collaboration correctly — remote changes use `NEVER` to avoid polluting local undo stack
- **Source**: `packages/element/src/store.ts`, `packages/element/src/delta.ts`, `packages/excalidraw/history.ts`

### 5. Fractional Indexing for Element Ordering

- **Decision**: Use fractional indexing (`fractional-indexing` library) for element Z-order instead of integer indices
- **Context**: In collaborative editing, integer indices conflict when two users reorder simultaneously. Fractional indices can always be inserted between any two values without reindexing
- **Consequences**: Every element has an `index: FractionalIndex` field. Indices must be kept in sync via `syncMovedIndices()` and `syncInvalidIndices()`. Adds complexity but enables conflict-free ordering
- **Source**: `packages/element/src/types.ts` (`FractionalIndex` type), `packages/element/src/fractionalIndex.ts`

### 6. Two-Canvas Rendering Architecture

- **Decision**: Use two separate `<canvas>` layers — static (elements) and interactive (selection/cursors)
- **Context**: Separating static content (shapes, text) from frequently-changing interactive content (selection handles, cursors) avoids redrawing all elements when only the selection changes
- **Consequences**: Two render pipelines (`staticScene.ts`, `interactiveScene.ts`), two AppState subsets (`StaticCanvasAppState`, `InteractiveCanvasAppState`). Coordinating scroll/zoom between canvases
- **Source**: `packages/excalidraw/renderer/staticScene.ts`, `packages/excalidraw/renderer/interactiveScene.ts`, `packages/excalidraw/types.ts` (line ~187)

### 7. Class Component for App Core

- **Decision**: Keep `App` as a class component rather than converting to functional component
- **Context**: The `App` component is ~6000+ lines with complex imperative logic (canvas management, pointer event handling, state machines). Converting to hooks would require massive refactoring with no clear benefit
- **Consequences**: Mixes class lifecycle with hooks in child components. The `Collab` class is also a `PureComponent` for similar reasons
- **Source**: `packages/excalidraw/components/App.tsx`, `excalidraw-app/collab/Collab.tsx`

---

## Undocumented Behaviors

## Undocumented Behavior #1

- **File**: `excalidraw-app/collab/Collab.tsx` (line 380)
- **What happens**: When stopping collaboration with `keepRemoteState = true`, the code calls `resetBrowserStateVersions()` before pushing a new browser history state. This hack ensures that any scene state saved to localStorage by other browser tabs during the collaboration session is **disregarded** in favor of the current collaborative scene state.
- **Why it matters**: Without this reset, switching from collab to local mode could pick up stale localStorage data from a tab that was saving independently, causing data loss or element duplication.
- **Documented in**: Partial inline comment: "hack to ensure that we prefer we disregard any new browser state that could have been saved in other tabs while we were collaborating"
- **Risk**: Removing `resetBrowserStateVersions()` or reordering it relative to `window.history.pushState()` could cause the app to load stale data instead of the collaborative scene, resulting in silent data loss.

## Undocumented Behavior #2

- **File**: `packages/excalidraw/wysiwyg/textWysiwyg.tsx` (line 964)
- **What happens**: The WYSIWYG text editor subscribes to `app.onChangeEmitter` to detect theme changes. It compares `app.state.theme` against a captured `LAST_THEME` variable on every scene change event, and calls `updateWysiwygStyle()` when the theme differs. This is a workaround because the Store doesn't emit granular updates for individual `appState` fields.
- **Why it matters**: The text editing overlay (a DOM `<textarea>` positioned over the canvas) must match the canvas theme for colors and styling. Without this subscription, changing theme while editing text would leave the textarea with the wrong colors.
- **Documented in**: FIXME comment: "FIXME after we start emitting updates from Store for appState.theme"
- **Risk**: If this subscription is removed before the Store gains per-field emission support, theme changes during text editing will produce visual glitches (wrong text color on canvas).

## Undocumented Behavior #3

- **File**: `packages/excalidraw/scene/export.ts` (line 99)
- **What happens**: When exporting frames, the code creates temporary `ExcalidrawTextElement` objects to render frame labels. These labels are normally rendered in the DOM during editing, but during export they must be drawn on the canvas. The "tempScene hack" creates throwaway text elements that are injected into the export rendering pipeline via `addFrameLabelsAsTextElements()`. These elements get temporary IDs and are never persisted.
- **Why it matters**: Frame labels would be invisible in exported PNGs/SVGs without this hack. The temporary elements bypass normal element lifecycle (no Store tracking, no history).
- **Documented in**: Inline comment: "Adding the labels as regular text elements seems like a simple hack. In the future we'll want to move to proper canvas rendering"
- **Risk**: Refactoring element creation to require Scene registration or Store tracking would break this export path silently. The temp elements would be captured by the Store or cause ID collisions.

## Undocumented Behavior #4

- **File**: `packages/element/src/linearElementEditor.ts` (line 1446)
- **What happens**: When adding a point to the end of a linear element, the code performs a "temp hack" — after inserting the point, it immediately calls `LinearElementEditor.movePoints()` to shift the new point by `(30, 30)`. This prevents the bounding box from unexpectedly expanding in a way that would visually shift the entire line on screen.
- **Why it matters**: Without this adjustment, adding a point to a line's end causes the bounding box recalculation to shift the line's visual position, making it appear to "jump" for the user.
- **Documented in**: Inline comment: "temp hack to ensure the line doesn't move when adding point to the end, potentially expanding the bounding box"
- **Risk**: Removing this move or changing the offset value would cause lines to visually jump when users add points, breaking the UX. The `(30, 30)` offset is a magic number with no documented rationale.

## Cross-References

- For active context → see [`docs/memory/activeContext.md`](activeContext.md)
- For architecture → see [`docs/technical/architecture.md`](../technical/architecture.md)
- For system patterns → see [`docs/memory/systemPatterns.md`](systemPatterns.md)
- For tech stack → see [`docs/memory/techContext.md`](techContext.md)
