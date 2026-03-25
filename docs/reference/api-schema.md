# API Schema Reference

> Documents the public API surface of `@excalidraw/excalidraw` and the backend JSON API. Evidence sourced from `packages/excalidraw/types.ts` and `excalidraw-app/data/index.ts`.

---

## React Component Props (`ExcalidrawProps`)

```typescript
interface ExcalidrawProps {
  // Initial scene data (elements + appState + files). Can be async.
  initialData?:
    | (() => MaybePromise<ExcalidrawInitialDataState | null>)
    | MaybePromise<ExcalidrawInitialDataState | null>

  // Called every time elements, appState, or files change.
  onChange?: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void

  // Called for durable (history-creating) or ephemeral incremental changes.
  onIncrement?: (event: DurableIncrement | EphemeralIncrement) => void

  // Called with the imperative API once the component mounts.
  onExcalidrawAPI?: (api: ExcalidrawImperativeAPI | null) => void

  // Lifecycle
  onMount?: (payload: ExcalidrawMountPayload) => void
  onUnmount?: () => void
  onInitialize?: (api: ExcalidrawImperativeAPI) => void

  // Collaboration
  isCollaborating?: boolean
  onPointerUpdate?: (payload: { pointer, button, pointersMap }) => void
  onUserFollow?: (payload: OnUserFollowedPayload) => void

  // Pointer events
  onPointerDown?: (activeTool: AppState["activeTool"], pointerDownState: PointerDownState) => void
  onPointerUp?: (activeTool: AppState["activeTool"], pointerDownState: PointerDownState) => void
  onScrollChange?: (scrollX: number, scrollY: number, zoom: Zoom) => void

  // Custom UI injection (use UIAppState, a read-only subset of AppState)
  renderTopLeftUI?: (isMobile: boolean, appState: UIAppState) => JSX.Element | null
  renderTopRightUI?: (isMobile: boolean, appState: UIAppState) => JSX.Element | null

  // Feature flags
  viewModeEnabled?: boolean
  zenModeEnabled?: boolean
  gridModeEnabled?: boolean
  objectsSnapModeEnabled?: boolean

  // Theming
  theme?: "light" | "dark"
  langCode?: Language["code"]

  // UI customization
  UIOptions?: Partial<UIOptions>

  // Element lifecycle
  generateIdForFile?: (file: File) => string | Promise<string>
  validateEmbeddable?:
    | boolean
    | string[]
    | RegExp
    | RegExp[]
    | ((link: string) => boolean | undefined)
  renderEmbeddable?: (
    element: NonDeleted<ExcalidrawEmbeddableElement>,
    appState: AppState,
  ) => JSX.Element | null
}
```

---

## Imperative API (`ExcalidrawImperativeAPI`)

Obtained via `onExcalidrawAPI` prop callback or `useExcalidrawAPI()` hook.

### Scene Manipulation

```typescript
// Replace or merge scene elements and/or appState
updateScene(sceneData: {
  elements?: readonly ExcalidrawElement[]
  appState?: Partial<AppState>
  files?: BinaryFiles
  collaborators?: Map<string, Collaborator>
  captureUpdate?: CaptureUpdateAction
}): void

// Apply incremental deltas (for CRDT-style sync)
applyDeltas(deltas: { elements?: ElementsDelta, appState?: AppStateDelta }): void

// Mutate a single element in place
mutateElement(element: ExcalidrawElement, updates: Partial<ExcalidrawElement>): void

// Reset canvas to empty state
resetScene(opts?: { resetLoadingState?: boolean }): void
```

### Read State

```typescript
getSceneElements(): readonly NonDeletedExcalidrawElement[]
getSceneElementsIncludingDeleted(): readonly ExcalidrawElement[]
getAppState(): AppState
getFiles(): BinaryFiles
isDestroyed: boolean
```

### Navigation

```typescript
scrollToContent(
  target?: ExcalidrawElement | readonly ExcalidrawElement[],
  opts?: { fitToContent?: boolean, fitToViewport?: boolean, viewportZoomFactor?: number, animate?: boolean, duration?: number }
): void
```

### UI Control

```typescript
setActiveTool(tool: { type: ToolType, ... }): void
setCursor(cursor: string): void
resetCursor(): void
toggleSidebar(opts: { name: string, tab?: string, force?: boolean }): boolean
refresh(): void
```

### Library

```typescript
updateLibrary(opts: {
  libraryItems: LibraryItemsSource
  prompt?: boolean
  merge?: boolean
  defaultStatus?: "published" | "unpublished"
  openLibraryMenu?: boolean
}): Promise<LibraryItems>
```

### Events (all return unsubscribe function)

```typescript
onChange(callback: (elements, appState, files) => void): () => void
onIncrement(callback: (event: DurableIncrement | EphemeralIncrement) => void): () => void
onPointerDown(callback: (activeTool, pointerDownState: PointerDownState, event: React.PointerEvent<HTMLElement>) => void): () => void
onPointerUp(callback: (activeTool, pointerDownState: PointerDownState, event: PointerEvent) => void): () => void
onScrollChange(callback: (scrollX, scrollY, zoom) => void): () => void
onUserFollow(callback: (payload: OnUserFollowedPayload) => void): () => void
onStateChange(callback: (appState) => void): () => void
onEvent(callback: (event) => void): () => void
```

### Actions

```typescript
registerAction(action: Action): void
```

---

## Core Types

### `ExcalidrawElement` (base)

```typescript
interface ExcalidrawElement {
  readonly id: string
  readonly type: ElementType
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly angle: number                // radians
  readonly strokeColor: string
  readonly backgroundColor: string
  readonly fillStyle: FillStyle
  readonly strokeWidth: number
  readonly strokeStyle: StrokeStyle
  readonly roughness: number
  readonly opacity: number
  readonly groupIds: readonly string[]
  readonly frameId: string | null
  readonly roundness: Roundness | null
  readonly seed: number
  readonly version: number
  readonly versionNonce: number
  readonly isDeleted: boolean
  readonly link: string | null
  readonly locked: boolean
}
```

### `AppState` (key fields)

```typescript
interface AppState {
  zoom: { value: NormalizedZoomValue }
  scrollX: number
  scrollY: number
  theme: "light" | "dark"
  activeTool: { type: ToolType, ... }
  viewModeEnabled: boolean
  zenModeEnabled: boolean
  gridModeEnabled: boolean
  isCollaborating: boolean
  collaborators: Map<SocketId, Collaborator>
  selectedElementIds: Record<string, boolean>
  // ... (AppState has many more fields — exact count varies by release)
}
```

### `Collaborator`

```typescript
interface Collaborator {
  pointer?: { x: number; y: number; tool: "pointer" | "laser"; renderCursor?: boolean; laserColor?: string }
  button?: "up" | "down"
  selectedElementIds?: Record<string, boolean>
  username?: string | null
  userState?: UserIdleState     // "active" | "away" | "idle"
  color?: { background: string; stroke: string }
  avatarUrl?: string
  id?: string
  socketId?: SocketId
  isCurrentUser?: boolean
  isInCall?: boolean
  isSpeaking?: boolean
  isMuted?: boolean
}
```

### `BinaryFileData`

```typescript
interface BinaryFileData {
  mimeType: ValueOf<IMAGE_MIME_TYPES> | typeof MIME_TYPES.binary
  id: FileId          // string & { _brand: "FileId" }
  dataURL: DataURL
  created: number     // unix timestamp ms
  lastRetrieved?: number
  version?: number
}
```

---

## Backend JSON API

Base URL: `https://json.excalidraw.com/api/v2/` (production)

### Store Scene (POST)

```http
POST /api/v2/post
Content-Type: application/json

Body: { data: string }   // base64-encoded encrypted+compressed scene
```

Response:

```json
{ "id": "<scene-id>" }
```

### Load Scene (GET)

```http
GET /api/v2/<scene-id>
```

Response:

```json
{
  "data": { "ciphertext": "...", "iv": "..." }
}
```

> Legacy format: `{ "data": "<base64-buffer>" }`

**Encryption scheme:** AES-GCM, 128-bit key, key embedded in URL fragment only.

---

## WebSocket Protocol

Server: `wss://oss-collab.excalidraw.com`

### Events Emitted by Client

| Event | Payload | Description |
|-------|---------|-------------|
| `server-broadcast` | `SocketUpdateData` | Persistent scene update (stored by server) |
| `server-volatile-broadcast` | `SocketUpdateData` | Ephemeral update (cursor, idle status) |
| `user-follow` | `{ userToFollow, action }` | Join/leave a follow session |
| `user-follow-room-change` | — | Notify room of follow change |

### Events Received by Client

Same event names, server fans out to all room members.

### `SocketUpdateData` Subtypes

```typescript
enum WS_SUBTYPES {
  INVALID_RESPONSE = "INVALID_RESPONSE",
  INIT = "SCENE_INIT",              // Initial scene on room join
  UPDATE = "SCENE_UPDATE",          // Incremental element updates
  MOUSE_LOCATION = "MOUSE_LOCATION",      // Cursor position (volatile)
  IDLE_STATUS = "IDLE_STATUS",            // User idle state (volatile)
  USER_VISIBLE_SCENE_BOUNDS = "USER_VISIBLE_SCENE_BOUNDS",  // Viewport bounds (volatile)
}
```

### Collaboration Link Format

```text
https://excalidraw.com/#room=[roomId],[roomKey]
```

- `roomId`: 10 random bytes → 20 hex chars
- `roomKey`: 128-bit AES key → 22 Base64URL chars
- Pattern regex: `/#room=([a-zA-Z0-9_-]+),([a-zA-Z0-9_-]+)$/`
