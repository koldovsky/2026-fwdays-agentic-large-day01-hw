# System Patterns

## Rendering Architecture

Excalidraw uses a **dual-canvas** approach:

1. **Static canvas** — renders all non-selected elements; re-renders only when the scene changes
2. **Interactive canvas** — renders the active selection, handles pointer events, always on top

Both canvases use the HTML5 Canvas API. SVG export uses a separate static rendering pipeline that mirrors the canvas logic but outputs SVG nodes.

Scene graph invalidation is version-based: each element has a monotonically increasing `version` number. Renderers skip re-drawing elements whose version hasn't changed.

## State Management

**Jotai atoms** are used for global state. Each Excalidraw instance gets its own isolated `editorJotaiStore` (via `jotai-scope`) to support multiple editors on the same page.

Key atoms:
- `collabAPIAtom` — reference to the collaboration API
- `isCollaboratingAtom` — boolean flag
- `isOfflineAtom` — network status
- `activeRoomLinkAtom` — current room URL

**AppState** (separate from Jotai) is the canonical editor state — immutable, managed inside the core component, and passed down as props. Each key in `APP_STATE_STORAGE_CONF` has flags controlling whether it persists to localStorage, appears in exports, or syncs to the server.

## Action System

Every user-visible operation (add element, change stroke color, undo, etc.) is an **Action** — a plain object with:
- `name` — unique identifier
- `perform` — reducer function `(elements, appState, formData) => newState`
- `keyTest` — keyboard shortcut matcher
- `PanelComponent` — optional React component for toolbar/properties panel

Actions are registered globally and dispatched through `actionManager.executeAction()`.

## Element Versioning (Conflict Resolution)

Each element carries:
- `version: number` — incremented on every mutation
- `versionNonce: number` — random integer generated on each change

During collaborative reconciliation, the element with the **higher version** wins. If versions are equal, `versionNonce` is used as a tiebreaker (higher nonce wins). This ensures deterministic, last-writer-wins merge without a central clock.

`index` (FractionalIndex) maintains Z-order across concurrent inserts without full array reindexing.

## Encryption Pattern

```
scene JSON
  → pako compress
  → AES-GCM encrypt (128-bit key, 12-byte IV)
  → base64 encode
  → store in Firebase / broadcast via Socket.io

Key lives only in the URL fragment (#key=...)
Server never receives the plaintext key.
```

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAppStateValue(key)` | Subscribe to a single AppState key |
| `useOnAppStateChange(cb)` | Side-effect on any state change |
| `useExcalidrawAPI()` | Access imperative Excalidraw API |
| `useEmitter()` | Pub/sub for non-state events |
| `useOutsideClick(ref, cb)` | Close dropdowns/menus |

## Event System

Collaboration events are exchanged via Socket.io with named event types defined in `@excalidraw/common` (`EVENT` object). UI events use a lightweight custom emitter for cases where Jotai/React state would cause unnecessary re-renders.

## File Manager Pattern

`FileManager` handles all binary assets (images embedded in the canvas):
1. Blob is resized (pica) and compressed before upload
2. Uploaded to Firebase Storage; status tracked per `FileId`: `"pending" | "saved" | "error"`
3. Other collaborators lazy-load files on demand
4. Files use a namespaced prefix per collab room to avoid collisions

## Tunnel / Portal Pattern

React portals are used for rendering UI panels (properties panel, context menu) outside the normal DOM hierarchy. A custom `Tunnel` abstraction allows child components deep in the tree to inject content into top-level containers without prop drilling.

## Related Docs

- Tech stack details: [`techContext.md`](techContext.md)
- Architecture overview: [`docs/technical/architecture.md`](../technical/architecture.md)
- Decision log: [`decisionLog.md`](decisionLog.md)
