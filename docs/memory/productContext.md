# Product Context

## What the Product Is

**Excalidraw** is an open-source virtual whiteboard for creating hand-drawn-style diagrams and sketches directly in the browser. It is both:

1. A **hosted web application** at excalidraw.com — the primary user-facing product.
2. A **React component library** (`@excalidraw/excalidraw`) — published on npm so any developer can embed the editor in their own application.

The hand-drawn aesthetic is the deliberate design identity: all shapes are rendered using rough.js, giving them a sketchy appearance by default (controlled per-element via `roughness`).

---

## Main User-Facing Capabilities

### Drawing tools (verified in `ToolType`, `packages/excalidraw/types.ts`)

| Category | Tools |
|---|---|
| Selection | `selection` (click/drag), `lasso` (freeform selection) |
| Shapes | `rectangle`, `diamond`, `ellipse` |
| Lines | `line`, `arrow` (sharp / round / elbow variants) |
| Freehand | `freedraw` |
| Text | `text` (inline WYSIWYG editor) |
| Media | `image` (paste, drag-drop, file open) |
| Containers | `frame` (visual clip group), `magicframe` (AI generation trigger) |
| Embeds | `embeddable` (URL-based iframes) |
| Utility | `eraser`, `hand` (pan), `laser` (presentation pointer) |

### Fonts (verified in `packages/common/src/font-metadata.ts`)
Built-in: **Excalifont** (default hand-drawn), Virgil, Cascadia, Comic Shanns, Nunito, Lilita One, Assistant, Liberation Sans, Helvetica. Fallbacks include Xiaolai (CJK) and Segoe UI Emoji.

### Export (verified in `packages/excalidraw/types.ts`, `CanvasActions`)
- PNG, SVG, clipboard — via `exportToCanvas`, `exportToSvg`, `exportToBlob`, `exportToClipboard`
- `.excalidraw` JSON file (includes elements + appState subset + embedded files)
- Export scales: 1×, 2×, 3× (`EXPORT_SCALES`, `packages/common/src/constants.ts`)
- Option to embed the full scene JSON inside exported SVG (`exportEmbedScene`)
- Dark mode export override independent of editor theme

### Persistence and sharing
- **Local autosave** — `AppState` and elements written to `localStorage` / `IndexedDB` via `LocalData`
- **Shareable link** — scene saved to Firebase (encrypted), URL contains `#json={id},{encryptionKey}`; the encryption key never leaves the client
- **Collaboration room** — URL contains `#room={roomId},{roomKey}`; all collaboration traffic is end-to-end encrypted

### Real-time collaboration (verified in `excalidraw-app/collab/Collab.tsx`, `Portal.tsx`)
- Socket.io rooms; each client broadcasts element changes when its local scene version differs from `lastBroadcastedOrReceivedSceneVersion`
- Remote peers are shown as `Collaborator` objects: cursor position, selection, username, avatar, idle state
- Idle states: `active`, `away`, `idle` (`UserIdleState`, `@excalidraw/common`)
- **Follow mode**: a user can follow another collaborator's viewport in real time (`userToFollow`, `followedBy` in `AppState`)

### AI features (gated by `aiEnabled` prop, default enabled)
- **Text-to-diagram** (TTD dialog) — converts a natural language prompt to an Excalidraw diagram via `VITE_APP_AI_BACKEND`
- **Mermaid-to-Excalidraw** — converts Mermaid syntax to elements via `@excalidraw/mermaid-to-excalidraw`
- **Magic frame** (`magicframe` tool) — frames a region of the canvas, sends it to the AI backend to generate code (`diagramToCode` plugin)

### PWA (verified in `excalidraw-app/vite.config.mts`)
- Installable as a desktop/mobile app via `vite-plugin-pwa` with `autoUpdate` strategy
- Works offline after first load (fonts cached 90 days, chunks 90 days, locales 30 days)
- Registered as a **file handler** for `.excalidraw` files (`application/vnd.excalidraw+json`)
- Registered as a **web share target** — other apps can share `.excalidraw` / `.json` files directly to the editor

---

## Key Domain Concepts and Terminology

*(Full definitions in [`docs/product/domain-glossary.md`](../product/domain-glossary.md))*

| Term | One-line summary |
|---|---|
| `ExcalidrawElement` | Immutable plain object representing one canvas shape; all subtypes share `id`, `x/y`, `version`, `isDeleted`, `index` |
| `Scene` | In-memory ordered list of elements; owns `sceneNonce` for render invalidation |
| `AppState` | React state of `App`; controls all UI: active tool, selection, viewport, dialogs, theme |
| `Store` | Diffs scene snapshots; feeds `History` (undo) and collaboration (broadcast) |
| `History` | Two stacks of `HistoryDelta`; undo entry created only on `CaptureUpdateAction.IMMEDIATELY` |
| `Action` | Named command with a `perform` function and optional `PanelComponent` |
| `Tool` | Active drawing mode; stored in `AppState.activeTool.type` |
| `Frame` | Container element that visually clips child elements |
| `Group` | Logical grouping via shared `groupIds[]` on elements; no separate object |
| `Library` | User-curated set of `LibraryItem[]` (named groups of elements), persisted in IDB |
| `BinaryFiles` | Flat record of attached file data stored separately from elements; image elements reference files through `fileId` |
| `FractionalIndex` | Stable z-order string per element; allows concurrent insert without renumbering |

---

## Main User Flows

### 1. Drawing
1. User selects a tool from the toolbar (or presses keyboard shortcut).
2. Pointer down on canvas → `App.handleCanvasPointerDown` → `newElement` set in `AppState`.
3. Pointer move → element updated via `mutateElement`.
4. Pointer up → element committed to `Scene`, `Store.commit` records undo entry.
5. Tool returns to `selection` unless `activeTool.locked === true`.

### 2. Text editing
1. Double-click on canvas (or a shape) → WYSIWYG editor opens (`editingTextElement` set in `AppState`).
2. Font, size, alignment controlled via `CombinedTextProperties` popover.
3. Blur or Escape → text committed; wrapping and auto-resize applied based on element's `autoResize` flag.

### 3. Collaboration session
1. User clicks "Live collaboration" → `Collab.startCollaboration` → new `roomId` + `roomKey` generated.
2. Shareable URL produced: `#room={roomId},{roomKey}`.
3. Joining user visits URL → Collab connects to Socket.io room, downloads scene from Firebase, calls `reconcileElements` to merge with any local state.
4. Every element change triggers a broadcast (only when local `sceneVersion` > `lastBroadcastedOrReceivedSceneVersion`).
5. Received elements go through `restoreElements` → `reconcileElements` → `bumpElementVersions` → `updateScene`.

### 4. Saving and loading
- **Auto**: elements serialized to `localStorage` on every `onChange`.
- **File**: "Save to disk" produces a `.excalidraw` JSON file (elements + selective `AppState` + `BinaryFiles`).
- **Share link**: scene saved to Firebase with client-generated encryption key; key embedded in URL hash (never sent to server).
- **Load**: drag-drop or file picker → `loadSceneOrLibraryFromBlob` → `restoreElements` normalizes schema → `updateScene`.

### 5. Export
1. User opens export dialog.
2. Selects format (PNG / SVG) and scale (1×/2×/3×).
3. Optional: dark mode override, background toggle, embed scene JSON in SVG.
4. `exportToCanvas` / `exportToSvg` renders the scene off-screen; result downloaded or copied.

### 6. Library
1. Select elements → "Add to library" action → `LibraryItem` created with `status: "unpublished"`.
2. Library panel (sidebar) shows all items; click to insert at canvas center.
3. Items persisted to IDB via `Library` class; optionally loaded from `VITE_APP_LIBRARY_URL`.

---

## Important Product and Business Rules (from source code)

### State storage partitioning (`packages/excalidraw/appState.ts`, `APP_STATE_STORAGE_CONF`)
`AppState` fields are tagged with three flags controlling where they are saved:

| Flag | Meaning |
|---|---|
| `browser: true` | Persisted to `localStorage` / IDB (survives page reload) |
| `export: true` | Written into `.excalidraw` file / shared scene |
| `server: true` | Sent over collaboration WebSocket or Firebase |

Critical rule: `viewModeEnabled` is **never** exported or sent to server (`{ browser: false, export: false, server: false }`). Grid size, grid step, view background color, and `lockedMultiSelections` **are** exported and shared. User tool preferences (stroke color, font, etc.) are browser-only, never exported.

### Soft delete — elements are never removed from the array
Deleting an element sets `isDeleted: true`; the element remains in `scene.getElementsIncludingDeleted()`. Only `scene.getNonDeletedElements()` filters them out. This preserves collaboration history and enables undo without re-insertion.

### Element locking (`element.locked`, `AppState.lockedMultiSelections`)
A locked element cannot be selected, moved, or edited via pointer events (`App.tsx`, `handleCanvasPointerDown`). Locking state **is** exported and synced (`lockedMultiSelections: { browser: true, export: true, server: true }`).

### Arrow binding (verified in `packages/element/src/binding.ts`)
Arrows auto-bind to nearby `ExcalidrawBindableElement` targets when the arrow endpoint is dragged within `maxBindingDistance_simple(zoom)` pixels. The binding gap is zoom-dependent to maintain consistent visual distance. Binding can be disabled globally (`AppState.isBindingEnabled`) or per element (`bindingPreference`).

### Undo granularity (`CaptureUpdateAction`, `packages/element/src/store.ts`)
- `IMMEDIATELY` — creates one undo entry per commit (regular user actions)
- `EVENTUALLY` — debounced; all intermediate changes roll into the next `IMMEDIATELY` entry (sliders, continuous dragging)
- `NEVER` — no undo entry (viewport pan, collaboration sync, view-only interactions)

### Collaboration broadcasting guard
A scene is only broadcast when the local `sceneVersion` differs from `lastBroadcastedOrReceivedSceneVersion`. The version must be set **before** calling `updateScene` (which renders synchronously) to prevent the just-received scene from being re-broadcast to all peers.

### Share link size limit
If the scene data exceeds Firebase storage limits, `createShareLink` returns `{ url: null, errorMessage: t("alerts.couldNotCreateShareableLinkTooBig") }`. Undefined maximum size — the limit is enforced by Firebase, not validated client-side before upload.

### AI feature gating
All AI features (`TTDDialog`, magic frame, diagram-to-code) are gated by `props.aiEnabled !== false`. The default is enabled; host apps embedding the component must explicitly pass `aiEnabled={false}` to disable.

### `viewModeEnabled` — read-only embed mode
When `viewModeEnabled` is `true`, all editing interactions are disabled. The toolbar is hidden. This flag is intended for embedding Excalidraw as a diagram viewer. It cannot be set via the exported file or collaboration — host app props only.

---

## What Is Not Defined In This Repository

- **Excalidraw+**: The codebase references `VITE_APP_PLUS_LP` and `VITE_APP_PLUS_APP` env vars and a "Plus" product, but the Plus feature set, paywall logic, and backend are not present in this repository.
- **AI backend contract**: `VITE_APP_AI_BACKEND` is used for TTD and magic frame, but the API schema is not defined in this repo.
- **Firebase size threshold**: the exact byte limit that triggers "too big" for share links is not validated in client code — it depends on Firebase response errors.
- **External collaboration server**: local development expects a separate `excalidraw-room` server via `VITE_APP_WS_SERVER_URL`, but that server does not live in this repository.
