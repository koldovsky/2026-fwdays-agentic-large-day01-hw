# Excalidraw Architecture

## High-level Architecture

Excalidraw is a Yarn monorepo. It ships two primary artifacts:

1. **`@excalidraw/excalidraw`** — a React component library published to npm
2. **`excalidraw-app`** — the standalone web application hosted at excalidraw.com

```text
excalidraw (monorepo)
├── excalidraw-app/          # Web app (Vite, Firebase, Socket.io collab)
├── packages/
│   ├── excalidraw/          # Core React component (@excalidraw/excalidraw)
│   ├── element/             # Element types + manipulation (@excalidraw/element)
│   ├── common/              # Shared constants + utilities (@excalidraw/common)
│   ├── math/                # Geometry math (@excalidraw/math)
│   └── utils/               # General utilities (@excalidraw/utils)
└── examples/                # Integration examples (Next.js, browser script)
```

The architecture follows a layered approach:

- **Presentation Layer**: React components, Canvas rendering
- **Business Logic Layer**: Actions, Scene management, State management
- **Data Layer**: Firebase, localStorage, IndexedDB
- **Collaboration Layer**: Socket.io, encryption, conflict resolution

## Package Responsibilities

| Package | npm name | Responsibility |
|---------|----------|---------------|
| `packages/excalidraw` | `@excalidraw/excalidraw` | Canvas rendering, actions, keyboard, history, import/export |
| `packages/element` | `@excalidraw/element` | Element schema, binding, resize, transform, group logic |
| `packages/common` | `@excalidraw/common` | Event names, storage keys, math constants, shared TS types |
| `packages/math` | `@excalidraw/math` | Point, vector, curve geometry utilities |
| `packages/utils` | `@excalidraw/utils` | String, array, object helpers |
| `excalidraw-app` | (not published) | Firebase storage, Socket.io collab, AI features, PWA |

## Package Dependencies

The monorepo has a clear dependency hierarchy to avoid circular dependencies:

```text
excalidraw-app/
  ├─→ @excalidraw/excalidraw
  ├─→ @excalidraw/random-username
  ├─→ firebase
  ├─→ socket.io-client
  └─→ jotai

@excalidraw/excalidraw (core library)
  ├─→ @excalidraw/element
  ├─→ @excalidraw/common
  ├─→ @excalidraw/math
  ├─→ @excalidraw/utils
  ├─→ roughjs (hand-drawn rendering)
  ├─→ perfect-freehand
  ├─→ jotai + jotai-scope
  └─→ react + react-dom (peer dependency)

@excalidraw/element
  ├─→ @excalidraw/common
  ├─→ @excalidraw/math
  └─→ fractional-indexing

@excalidraw/math
  └─→ @excalidraw/common

@excalidraw/utils
  └─→ (no internal dependencies)

@excalidraw/common
  └─→ (no internal dependencies)
```

**Dependency Rules:**

- `common` and `utils` are leaf packages with zero internal dependencies
- `math` depends only on `common`
- `element` depends on `common` and `math`
- `excalidraw` (core) depends on all other packages
- `excalidraw-app` depends on `excalidraw` + external services (Firebase, Socket.io)

This hierarchy ensures:

- Tree-shaking works correctly for npm consumers
- Circular dependencies are impossible
- Build order is deterministic: `common` → `utils` → `math` → `element` → `excalidraw`

## Data Flow

### User Interaction Flow

Complete flow from user action to screen update:

```text
1. User Input
   ├─ Mouse/touch event on InteractiveCanvas
   ├─ Keyboard shortcut
   └─ Toolbar button click

2. Event Handler (packages/excalidraw/components/App.tsx)
   ├─ onPointerDown/Move/Up
   ├─ onKeyDown
   └─ onClick

3. Action Dispatch
   ├─ ActionManager.executeAction(actionName)
   └─ action.perform(elements, appState, formData, app)

4. Action Result
   ├─ elements?: ExcalidrawElement[]  (new element state)
   ├─ appState?: Partial<AppState>    (new UI state)
   ├─ files?: BinaryFiles             (new images)
   └─ captureUpdate: "incremental" | "replace" | "delete"

5. State Update (App.setState + Scene.replaceAllElements)
   ├─ React state update
   ├─ Scene graph update
   └─ Store delta recording (for history/collab)

6. Render Cycle
   ├─ React re-render (LayerUI, etc.)
   ├─ Renderer.getRenderableElements() [memoized]
   └─ Canvas drawing (StaticCanvas + InteractiveCanvas)

7. Side Effects
   ├─ localStorage update (debounced, 300ms)
   ├─ Collaboration sync (if room active)
   └─ History stack push (for undo/redo)
```

### Rendering Pipeline

```text
User interaction
  → Action dispatch (actionManager)
    → AppState mutation + Element array mutation
      → Scene graph update
        → Static canvas re-render (non-selected elements)
        → Interactive canvas re-render (selection, handles)
```

Two separate HTML5 canvases are layered:

- **Static canvas**: Renders all background elements. Invalidated only on scene change.
- **Interactive canvas**: Renders selection state and handles pointer events. Always live.

For SVG export, a mirrored rendering pipeline produces SVG nodes instead of canvas draw calls.

**Rendering Optimization:**

- Visibility culling: Only elements in the viewport are rendered
- Memoization: `Renderer.getRenderableElements()` caches results until dependencies change
- Throttling: High-frequency events (pointer move) are throttled to 60fps
- Batched updates: Multiple state changes grouped into single render cycle

### Collaboration Sync Flow

Real-time collaboration data flow:

```text
Local Change
  ↓
Store.applyDeltas(localDelta)
  ↓
Serialize → Compress → Encrypt (AES-GCM)
  ↓
WebSocket.emit("SERVER", encryptedPayload)
  ↓
Socket.io Server (broadcasts to room)
  ↓
Other Clients receive encrypted payload
  ↓
Decrypt → Decompress → Deserialize
  ↓
Conflict Resolution (version + versionNonce)
  ↓
Scene.replaceAllElements(mergedElements)
  ↓
Render update
```

**Conflict Resolution Rules:**

1. Compare `element.version` (monotonically increasing counter)
   - Higher version wins
2. If versions are equal, compare `element.versionNonce` (random)
   - Higher nonce wins (deterministic last-write-wins)
3. Z-order conflicts resolved via `FractionalIndex`
   - Allows concurrent inserts without full array reindex

### Persistence Flow

Three persistence mechanisms work in parallel:

```text
State Change
  ↓
┌─────────────────┬─────────────────┬─────────────────┐
│  localStorage   │   IndexedDB     │  Firebase       │
│  (300ms debounce)│  (immediate)    │  (collab only)  │
├─────────────────┼─────────────────┼─────────────────┤
│ AppState        │ Library items   │ Encrypted scene │
│ Elements        │ TTD chat history│ Images (FileId) │
│ Files metadata  │                 │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

**localStorage** stores:

- Scene state (elements + appState filtered by `APP_STATE_STORAGE_CONF`)
- Auto-saves every 300ms
- Max ~5-10 MB depending on browser

**IndexedDB** stores:

- `excalidraw-library`: User's saved element groups
- `excalidraw-ttd-chats`: AI chat history

**Firebase** stores:

- Encrypted scene (AES-GCM ciphertext only)
- Images (namespaced by room ID)
- Collaboration metadata

### Image Handling Flow

```text
User drops image
  → Blob ──► pica resize ──► image-blob-reduce compress
    → FileManager.save()
      → Firebase Storage (namespaced per room)
        → FileId stored on ExcalidrawImageElement
          → Other clients lazy-load by FileId
```

Max upload: 4 MiB (`FILE_UPLOAD_MAX_BYTES`). Status per file: `"pending" | "saved" | "error"`.

**Image optimization:**

- Resize to max 4096×4096 using `pica` (high-quality Lanczos3)
- Compress using `image-blob-reduce`
- Store as JPEG (quality 0.8) or PNG (if transparency needed)
- Generate FileId: `sha256(imageData).slice(0, 16)`

## Element Data Model

Every drawable object is an `ExcalidrawElement`:

```typescript
type ExcalidrawElement =
  | ExcalidrawGenericElement    // rectangle, diamond, ellipse
  | ExcalidrawTextElement
  | ExcalidrawLinearElement     // line, arrow
  | ExcalidrawFreeDrawElement
  | ExcalidrawImageElement
  | ExcalidrawFrameElement
  | ExcalidrawMagicFrameElement
  | ExcalidrawEmbeddableElement // iframes, embeds
```

Key base fields:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | `string` | Stable unique identifier (nanoid) |
| `version` | `number` | Monotonically increasing; conflict resolution |
| `versionNonce` | `number` | Random tiebreaker when versions collide |
| `index` | `FractionalIndex \| null` | Z-order (stable under concurrent inserts) |
| `isDeleted` | `boolean` | Soft delete; kept in sync for 24 h then pruned |
| `boundElements` | `BoundElement[] \| null` | Arrows / labels attached to this element |
| `customData` | `Record<string, any>` | Extension point (used by AI Magic Frame) |
| `seed` | `number` | RoughJS deterministic rendering seed |
| `groupIds` | `string[]` | Groups this element belongs to |
| `locked` | `boolean` | Prevents editing |

**Element Lifecycle:**

1. **Creation**: `id` generated, `version = 1`, `versionNonce` randomized
2. **Mutation**: `version++`, `versionNonce` re-randomized
3. **Deletion**: `isDeleted = true` (soft delete, kept in sync for 24h)
4. **Pruning**: After 24h, deleted elements removed from sync payloads

## State Management

**AppState** — the canonical editor state. Immutable, managed inside the core component. Every key has storage flags:

```typescript
APP_STATE_STORAGE_CONF[key] = {
  browser: boolean,  // Persist to localStorage / IDB?
  export: boolean,   // Include in exported .excalidraw file?
  server: boolean,   // Send to collab server?
}
```

**AppState** contains 472 properties organized into:

- **Canvas state**: zoom, scrollX, scrollY, width, height, offsetLeft, offsetTop
- **Tool state**: activeTool, selectedElementIds, hoveredElementIds
- **Editing state**: editingTextElement, resizingElement, multiElement
- **UI state**: openDialog, openPopup, contextMenu, toast
- **Collaboration state**: collaborators, userToFollow
- **Preferences**: theme, gridModeEnabled, snapToObjects

**Jotai atoms** — used for cross-component global state. Each editor instance gets an isolated `editorJotaiStore` (via `jotai-scope`) to support multiple editors on one page.

**Jotai is used for:**

- UI component state (dialogs, popovers, sidebar)
- NOT for main app state (that's React component state)

## Collaboration Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                    │
│                                                         │
│  Canvas ──► Scene ──► Serialize ──► Compress ──► Encrypt│
│                                                    │     │
│  Room URL: https://excalidraw.com/#room=<id>,<key> │     │
│                                        └─── Key lives   │
│                                             in fragment │
└──────────────────────────────────────────┬──────────────┘
                                           │ (ciphertext only)
                    ┌──────────────────────▼──────────────┐
                    │        Socket.io Server              │
                    │   Broadcasts encrypted blobs         │
                    │   Never sees plaintext               │
                    └──────────────────────┬──────────────┘
                                           │
                    ┌──────────────────────▼──────────────┐
                    │           Firebase Storage           │
                    │   Stores encrypted scene + images    │
                    └─────────────────────────────────────┘
```

**Encryption:** AES-GCM, 128-bit key, 12-byte random IV. Key is embedded in the URL fragment — never sent to any server.

**Conflict resolution:**

1. Higher `version` wins
2. On tie: higher `versionNonce` wins
3. Z-order maintained by `FractionalIndex` (no full array reindex on insert)

**Deleted elements** are kept in sync payloads for 24 hours (`DELETED_ELEMENT_TIMEOUT`) to ensure late-joining clients receive deletions.

**WebSocket Events:**

- `SERVER` — Scene updates (reliable, ordered)
- `SERVER_VOLATILE` — Cursor positions (lossy, unordered)
- `USER_FOLLOW_CHANGE` — Follow mode toggle
- `IDLE_STATUS` — User idle state (3s timeout)

## AI Features

```text
User prompt
  → TTDDialog (Text-to-Diagram)
    → POST /ai-backend (streaming)
      → Mermaid syntax
        → @excalidraw/mermaid-to-excalidraw
          → ExcalidrawElement[]
            → Inserted into scene
```

Magic Frame generates diagram content inside a selected frame area. Generation status (`"pending" | "done" | "error"`) is stored in `element.customData`.

**AI Backend Integration:**

- Backend URL configured via `VITE_APP_AI_BACKEND`
- API key stored in localStorage: `excalidraw-oai-api-key`
- Streaming responses using Server-Sent Events (SSE)
- Chat history persisted to IndexedDB (`excalidraw-ttd-chats`)

## Build System

- **Vite 5** for both `excalidraw-app` and package builds
- **esbuild** for production minification of packages
- **Yarn workspaces** for monorepo dependency resolution
- **TypeScript 5.9** with strict mode

Package exports use the `exports` field in `package.json` for conditional `development` / `production` / `types` resolution.

**Build Flow:**

```bash
yarn build:packages  # Builds in dependency order:
  → yarn build:common
  → yarn build:math
  → yarn build:element
  → yarn build:excalidraw

yarn build:app      # Builds excalidraw-app
  → Vite build
  → Generate version.json
  → PWA service worker generation
```

**Output Artifacts:**

- `packages/*/dist/prod/` — Production build (minified)
- `packages/*/dist/dev/` — Development build (with sourcemaps)
- `packages/*/dist/types/` — TypeScript declarations
- `excalidraw-app/build/` — Static web app

## Security Considerations

**End-to-end Encryption:**

- AES-GCM with 128-bit key
- Key stored in URL fragment (never sent to server)
- Server stores only ciphertext
- Even with server compromise, data cannot be decrypted

**Content Security Policy (CSP):**

- `EXCALIDRAW_ASSET_PATH` allows custom asset origin
- Fonts loaded from configurable CDN or self-hosted
- Strict iframe sandbox for embeddables

**Input Validation:**

- Max image size: 4 MiB
- File type whitelist for imports
- Sanitized URLs via `@braintree/sanitize-url`

## Performance Characteristics

**Scalability Limits:**

- **Elements**: Tested up to 10,000 elements per scene
- **Collaborators**: Up to 30 concurrent users per room
- **Image size**: 4 MiB per image, compressed
- **Scene size**: ~50 MB uncompressed (localStorage limit)

**Performance Optimizations:**

- Visibility culling (only render viewport elements)
- Memoized rendering calculations
- Throttled pointer events (60fps)
- Debounced localStorage saves (300ms)
- WebWorker for image compression (future)

## Related Documentation

### Memory Bank

- [System Patterns](../memory/systemPatterns.md) - Architecture patterns
- [Tech Context](../memory/techContext.md) - Technology stack
- [Decision Log](../memory/decisionLog.md) - Undocumented behaviors
- [Project Brief](../memory/projectbrief.md) - Project overview

### Technical Documentation

- [Dev Setup](dev-setup.md) - Development guide

### Product Documentation

- [PRD](../product/PRD.md) - Product requirements
- [Domain Glossary](../product/domain-glossary.md) - Terminology
