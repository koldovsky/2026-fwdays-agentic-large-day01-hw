# Excalidraw Architecture

## Overview

Excalidraw is a Yarn monorepo. It ships two primary artifacts:

1. **`@excalidraw/excalidraw`** — a React component library published to npm
2. **`excalidraw-app`** — the standalone web application hosted at excalidraw.com

```
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

## Package Responsibilities

| Package | npm name | Responsibility |
|---------|----------|---------------|
| `packages/excalidraw` | `@excalidraw/excalidraw` | Canvas rendering, actions, keyboard, history, import/export |
| `packages/element` | `@excalidraw/element` | Element schema, binding, resize, transform, group logic |
| `packages/common` | `@excalidraw/common` | Event names, storage keys, math constants, shared TS types |
| `packages/math` | `@excalidraw/math` | Point, vector, curve geometry utilities |
| `packages/utils` | `@excalidraw/utils` | String, array, object helpers |
| `excalidraw-app` | (not published) | Firebase storage, Socket.io collab, AI features, PWA |

## Rendering Pipeline

```
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
| `id` | `string` | Stable unique identifier |
| `version` | `number` | Monotonically increasing; conflict resolution |
| `versionNonce` | `number` | Random tiebreaker when versions collide |
| `index` | `FractionalIndex \| null` | Z-order (stable under concurrent inserts) |
| `isDeleted` | `boolean` | Soft delete; kept in sync for 24 h then pruned |
| `boundElements` | `BoundElement[] \| null` | Arrows / labels attached to this element |
| `customData` | `Record<string, any>` | Extension point (used by AI Magic Frame) |

## State Management

**AppState** — the canonical editor state. Immutable, managed inside the core component. Every key has storage flags:

```typescript
APP_STATE_STORAGE_CONF[key] = {
  browser: boolean,  // Persist to localStorage / IDB?
  export: boolean,   // Include in exported .excalidraw file?
  server: boolean,   // Send to collab server?
}
```

**Jotai atoms** — used for cross-component global state. Each editor instance gets an isolated `editorJotaiStore` (via `jotai-scope`) to support multiple editors on one page.

## Collaboration Architecture

```
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

## AI Features

```
User prompt
  → TTDDialog (Text-to-Diagram)
    → POST /ai-backend (streaming)
      → Mermaid syntax
        → @excalidraw/mermaid-to-excalidraw
          → ExcalidrawElement[]
            → Inserted into scene
```

Magic Frame generates diagram content inside a selected frame area. Generation status (`"pending" | "done" | "error"`) is stored in `element.customData`.

## File / Image Handling

```
User drops image
  → Blob ──► pica resize ──► image-blob-reduce compress
    → FileManager.save()
      → Firebase Storage (namespaced per room)
        → FileId stored on ExcalidrawImageElement
          → Other clients lazy-load by FileId
```

Max upload: 4 MiB (`FILE_UPLOAD_MAX_BYTES`). Status per file: `"pending" | "saved" | "error"`.

## Build System

- **Vite 5** for both `excalidraw-app` and package builds
- **esbuild** for production minification of packages
- **Yarn workspaces** for monorepo dependency resolution
- **TypeScript 5.9** with strict mode

Package exports use the `exports` field in `package.json` for conditional `development` / `production` / `types` resolution.

## Related Docs

- Developer onboarding: [`dev-setup.md`](dev-setup.md)
- Memory Bank system patterns: [`../../memory-bank/systemPatterns.md`](../../memory-bank/systemPatterns.md)
- Decision log: [`../../memory-bank/decisionLog.md`](../../memory-bank/decisionLog.md)
