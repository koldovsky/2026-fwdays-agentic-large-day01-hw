# System Patterns

> See also: [architecture.md](../technical/architecture.md) for component hierarchy and rendering pipeline.

## Core Design Patterns

### 1. Monorepo with Yarn Workspaces
Five packages share one `yarn.lock` and can reference each other via `@excalidraw/*` path aliases without publishing to NPM during development.

### 2. Jotai Wrapper Pattern
Direct Jotai imports are **banned by ESLint**. All state access goes through:
- `excalidraw-app/app-jotai.ts` — app-level atoms
- `packages/excalidraw/editor-jotai.ts` — editor-level atoms

**Why:** Allows swapping the state library in one place without touching consumers.

### 3. Single-Entry-Point Package Exports
Each package exposes one `index.ts`. Deep imports (e.g., `@excalidraw/excalidraw/types/element`) are forbidden. This enforces a stable public API.

### 4. Action System
Canvas operations are modeled as **actions** (`packages/excalidraw/actions/`). Each action has:
- `name` — unique identifier
- `perform()` — execution function
- Optional `keyTest`, `contextItemLabel`, `PanelComponent`

This decouples UI from business logic and enables keyboard shortcuts, context menus, and command palette from a single definition.

## Data Flows

### Real-time Collaboration

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant App as App State (Jotai)
    participant Enc as Encrypt/Compress
    participant WS as WebSocket Server
    participant U2 as User 2

    U1->>App: Draw element
    App->>Enc: Serialize + compress (Pako)
    Enc->>WS: Emit via Socket.io
    WS->>U2: Broadcast
    U2->>App: reconcileElements()
    App->>U2: Re-render canvas
```

### Persistence Flow

```mermaid
sequenceDiagram
    participant User
    participant LS as localStorage
    participant FB as Firebase
    participant IDB as IndexedDB

    User->>LS: Save elements (excalidraw key)
    User->>LS: Save state (excalidraw-state key)
    User->>IDB: Save libraries
    User->>FB: Upload files (authenticated)
```

### Share Link Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant JSON as json.excalidraw.com
    participant Recipient

    User->>App: Click Share
    App->>App: Generate encryption key
    App->>App: Encrypt scene data
    App->>JSON: POST encrypted blob
    JSON-->>App: Return ID
    App->>User: URL = /share/{id}#{key}
    Recipient->>JSON: GET /share/{id}
    Recipient->>Recipient: Decrypt with #key (never sent to server)
```

## Key Data Structures

### Element
All canvas objects are plain objects conforming to `ExcalidrawElement`:
```ts
{
  id: string               // unique ID
  type: ElementType        // "rectangle" | "ellipse" | "text" | ...
  x, y: number             // position
  width, height: number    // dimensions
  angle: number            // rotation in radians
  strokeColor, fillColor   // visual properties
  groupIds: string[]       // grouping
  version: number          // for CRDT reconciliation
  versionNonce: number     // tie-breaking for reconciliation
}
```

### Scene Reconciliation (CRDT-like)
`reconcileElements()` merges remote elements with local state using `version` + `versionNonce`. Higher version wins; equal versions use `versionNonce` as tiebreaker.

### Collaboration User
```ts
{
  socketId: string
  pointer: { x, y, tool }   // cursor position
  button: "up" | "down"
  selectedElementIds: {}
  username: string
}
```

## Rendering Architecture

```
Scene State (Jotai)
    │
    ▼
renderer/
    ├── interactiveScene.ts  (interactive canvas — selections, handles)
    ├── staticScene.ts       (static canvas — final element rendering)
    ├── staticSvgScene.ts    (SVG export renderer)
    └── renderNewElementScene.ts (in-progress element preview)
    │
    ├──► Rough.js (hand-drawn stroke paths)
    ├──► Perfect-freehand (freedraw strokes)
    └──► HTML Canvas 2D API
```

The renderer is **pure** — given the same scene state it produces the same visual output. No side effects.

## Font Management
Fonts (Virgil, Cascadia, Assistant) are:
1. Loaded from CDN or self-hosted via `window.EXCALIDRAW_ASSET_PATH`
2. Subsetted per character set used in the scene
3. Embedded in exported SVGs

## Error Handling
- `TopErrorBoundary.tsx` — catches React render errors in the app
- Sentry integration — reports runtime errors to monitoring
- Graceful degradation — missing Firebase config → collaboration disabled silently

## Encryption Pattern
```
key = generateEncryptionKey()       // random bytes → base64url
iv  = generateIV()                  // random bytes
ciphertext = AES-GCM.encrypt(plaintext, key, iv)
shareUrl = `${origin}/share/${id}#${key}`
                                    // key is ONLY in the fragment (never sent to server)
```

## Undocumented Behaviors

These behaviors exist in the codebase but are not documented in official docs:

1. **PNG files carry hidden scene data.** When exporting to PNG, the full Excalidraw JSON (elements + appState) is embedded in the image as a PNG text chunk (`tEXt`). Opening the PNG back in Excalidraw restores the full scene — not just the visual. This means a PNG screenshot IS also a save file.

2. **URL fragment key is cryptographically load-bearing.** The collaboration room key (`#room=id,KEY`) is never sent to the server — it exists only in the browser's URL fragment. If the key portion is stripped (e.g., by a link shortener or some chat apps), the room becomes permanently inaccessible. There is no recovery mechanism server-side.

3. **`versionNonce` is a tie-breaker, not a sequence number.** During CRDT-style reconciliation, when two collaborators modify the same element in the same tick (`version` tie), the winner is determined by whichever has the **higher `versionNonce`** — a random number. This means the "last write wins" is actually "random wins" on exact ties, which is intentional to avoid infinite conflicts.

4. **Deep type imports are allowed, shallow runtime imports are not.** ESLint bans `import { atom } from 'jotai'` (direct Jotai import) and `import X from '@excalidraw/excalidraw/components/...'` (deep runtime imports), but `import type { Foo } from '@excalidraw/element/types'` is explicitly permitted. The rule targets runtime coupling, not type-only coupling.

5. **`DELETED_ELEMENT_TIMEOUT` keeps deleted elements alive for 24 hours.** Elements marked `isDeleted: true` are still synced over WebSocket for 24 hours (`DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000 ms`). This prevents "resurrection" of deleted elements when a collaborator who was offline comes back online.

## PWA Caching Strategy
| Asset Type | Strategy | TTL |
|------------|----------|-----|
| Fonts | CacheFirst | 90 days |
| Locales | StaleWhileRevalidate | 30 days |
| CodeMirror chunk | CacheFirst | 60 days |
| App shell | NetworkFirst | — |
