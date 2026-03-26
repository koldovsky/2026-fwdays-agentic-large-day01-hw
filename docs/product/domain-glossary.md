# Domain Glossary

Project-scoped terms below are derived from source code in this repository.

## `ExcalidrawElement`

- **Name (as in code):** `ExcalidrawElement`
- **Definition (project scope):** JSON-serializable shareable scene entity type used in scene arrays/maps and peer synchronization. It is a union of element variants (generic, text, linear, arrow, freedraw, image, frame, magic frame, iframe, embeddable).
- **Key file where used:** `packages/element/src/types.ts`

## `ExcalidrawNonSelectionElement`

- **Name (as in code):** `ExcalidrawNonSelectionElement`
- **Definition (project scope):** Element union used for newly created drawable entities excluding selection element type.
- **Key file where used:** `packages/element/src/types.ts`

## `Scene`

- **Name (as in code):** `Scene`
- **Definition (project scope):** Runtime container for element collections (including deleted/non-deleted maps), selection cache, and scene update callbacks. It owns element replacement/mutation and emits updates via `triggerUpdate()` with `sceneNonce`.
- **Key file where used:** `packages/element/src/Scene.ts`

## `AppState`

- **Name (as in code):** `AppState`
- **Definition (project scope):** Main editor UI/runtime state model containing tool/mode flags, selection, dialog/menu/sidebar state, viewport (`scrollX`, `scrollY`, `zoom`, dimensions/offsets), collaboration data, and editing-specific transient fields.
- **Key file where used:** `packages/excalidraw/types.ts`

## `getDefaultAppState`

- **Name (as in code):** `getDefaultAppState`
- **Definition (project scope):** Factory for baseline `AppState` values used by editor initialization and scene reset; sets defaults for tool, view/collab flags, grid, snapping, selection, dialogs, and render preferences.
- **Key file where used:** `packages/excalidraw/appState.ts`

## `ToolType`

- **Name (as in code):** `ToolType`
- **Definition (project scope):** Allowed active tool identifiers (`selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`) used by `activeTool`.
- **Key file where used:** `packages/excalidraw/types.ts`

## `Action`

- **Name (as in code):** `Action`
- **Definition (project scope):** Command contract for editor operations. Each action defines name/label, optional UI panel + shortcuts, predicates, tracking metadata, and `perform(...)` that returns `ActionResult` (elements/appState/files patch + capture policy).
- **Key file where used:** `packages/excalidraw/actions/types.ts`

## `ActionManager`

- **Name (as in code):** `ActionManager`
- **Definition (project scope):** Runtime action dispatcher that registers actions, handles keyboard matching, executes actions from UI/API, and routes action results through updater callback (wired to `App.syncActionResult`).
- **Key file where used:** `packages/excalidraw/actions/manager.tsx`

## `ActionResult`

- **Name (as in code):** `ActionResult`
- **Definition (project scope):** Action output envelope used to mutate editor state: optional `elements`, optional `appState`, optional `files`, mandatory `captureUpdate` flag, optional `replaceFiles`, or `false` to cancel.
- **Key file where used:** `packages/excalidraw/actions/types.ts`

## `Collaborator`

- **Name (as in code):** `Collaborator`
- **Definition (project scope):** Per-user collaboration payload stored in app state collaborators map (pointer/button/selection/username/user state/colors/avatar/socket/user media flags).
- **Key file where used:** `packages/excalidraw/types.ts`

## `reconcileElements`

- **Name (as in code):** `reconcileElements`
- **Definition (project scope):** Local-vs-remote merge function for ordered scene elements. It preserves local edits under active edit conditions/version precedence and returns deduplicated, index-validated ordered results.
- **Key file where used:** `packages/excalidraw/data/reconcile.ts`

## `Library`

- **Name (as in code):** `Library`
- **Definition (project scope):** Editor subsystem managing reusable `LibraryItem` collections, update queue, persistence/migration adapters, and `onLibraryChange` notifications; also updates Jotai atom state for library UI.
- **Key file where used:** `packages/excalidraw/data/library.ts`

## `libraryItemsAtom`

- **Name (as in code):** `libraryItemsAtom`
- **Definition (project scope):** Jotai atom representing library loading status, initialization state, and current library items for UI/state synchronization in library workflows.
- **Key file where used:** `packages/excalidraw/data/library.ts`

## `ExcalidrawImperativeAPI`

- **Name (as in code):** `ExcalidrawImperativeAPI`
- **Definition (project scope):** Public runtime API object created by `App.createExcalidrawAPI()` exposing scene updates, deltas, element mutation, library/files operations, state getters, action registration, UI helpers, and event subscriptions.
- **Key file where used:** `packages/excalidraw/components/App.tsx`
