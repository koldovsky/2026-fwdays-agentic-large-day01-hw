# System Patterns

## Architecture Overview
Excalidraw is a monorepo with Yarn workspaces. The main web app (`excalidraw-app/`) consumes shared packages (`packages/*`). The core library is published as `@excalidraw/excalidraw` for third-party use.

```mermaid
graph TD
    A[excalidraw-app<br/>Main Web App] --> B["@excalidraw/excalidraw<br/>Core UI + Logic"]
    B --> C["@excalidraw/element<br/>Element Operations"]
    B --> D["@excalidraw/math<br/>Geometry & Math"]
    B --> E["@excalidraw/common<br/>Shared Types & Constants"]
    B --> F["@excalidraw/utils<br/>Helper Functions"]
    C --> E
    C --> D
    D --> E
```

## State Management

### Jotai (Primary)
- Atomic state model — one atom per piece of state
- Isolated per editor instance via `jotai-scope` (`createIsolation()`)
- Centralized in `packages/excalidraw/editor-jotai.ts`
- Exports wrapped hooks: `useAtom`, `useSetAtom`, `useAtomValue`, `useStore`

### AppState (Imperative)
- Traditional state object (`AppState` type) managed by `AppStateObserver`
- Subscription-based with flexible selectors (single key, arrays, custom functions)
- Supports one-time subscriptions and Promise-based waiting
- Batched updates via React's `unstable_batchedUpdates`

### Context Patterns
- **TunnelsContext** (via `tunnel-rat`): Portal-based component composition for UI extension points (MainMenuTunnel, WelcomeScreenTunnel, FooterCenterTunnel, etc.)
- **UIAppStateContext**: Simple context for UI-related state
- **ExcalidrawAPIContext**: Imperative API access across component tree

## Rendering Pipeline

### Multi-Layer Canvas
- **Static layer** (`staticScene.ts`): Background rendering of elements
- **Interactive layer** (`interactiveScene.ts`, ~57KB): Selection handles, transform controls, snapping guides
- **SVG layer** (`staticSvgScene.ts`): Export rendering
- **New element layer** (`renderNewElementScene.ts`): Elements being created

### Rendering Flow

```mermaid
flowchart LR
    A[State Change] --> B[getNormalizedCanvasDimensions<br/>DPI/Scaling]
    B --> C{Render Phase}
    C --> D[Static Layer<br/>staticScene.ts]
    C --> E[Interactive Layer<br/>interactiveScene.ts]
    C --> F[New Element Layer<br/>renderNewElementScene.ts]
    D --> G[Canvas Output]
    E --> G
    F --> G
```

- Canvas-based (not DOM) for performance
- Separate chunks for different render phases (optimization)

## Collaboration Architecture

### Real-time Sync
- `Collab.tsx` (PureComponent) — main collaboration manager
- **Portal**: WebSocket abstraction via socket.io-client
- **FileManager**: Asset upload/download synchronization
- Throttled sync: `SYNC_FULL_SCENE_INTERVAL_MS`

### WebSocket Events
- `SERVER_VOLATILE`, `SERVER` — server messages
- `USER_FOLLOW`, `USER_FOLLOW_ROOM_CHANGE` — user following
- Subtypes: `SCENE_INIT`, `SCENE_UPDATE`, `MOUSE_LOCATION`, `IDLE_STATUS`, `USER_VISIBLE_SCENE_BOUNDS`

### Collaboration Flow

```mermaid
sequenceDiagram
    participant C1 as Client A
    participant WS as WebSocket Server
    participant C2 as Client B
    participant FB as Firebase

    C1->>WS: SCENE_UPDATE (element changes)
    WS->>C2: Broadcast SCENE_UPDATE
    C2->>C2: reconcileElements()<br/>merge local + remote
    C1->>FB: Save scene snapshot (throttled)
    C2->>WS: MOUSE_LOCATION (cursor pos)
    WS->>C1: Broadcast cursor position
    C1->>WS: IDLE_STATUS
    WS->>C2: Update presence indicator
```

### Conflict Resolution (`reconcileElements()`)

```mermaid
flowchart TD
    A[Receive Remote Elements] --> B{Element exists locally?}
    B -->|No| C[Add to local scene]
    B -->|Yes| D{Compare versions}
    D -->|remote.version > local.version| E[Use remote]
    D -->|remote.version < local.version| F[Keep local]
    D -->|versions equal| G{Compare versionNonce}
    G -->|Deterministic<br/>tie-break| H[Higher nonce wins]
    E --> I[Update fractional index<br/>for stable ordering]
    F --> I
    H --> I
```

- Preserves local edits if element is actively being edited
- Fractional indices (`fractional-indexing`) for stable element ordering

### Presence
- Cursor positions tracked per collaborator
- Idle state management: `IDLE_THRESHOLD`, `ACTIVE_THRESHOLD`
- Laser pointer mode support

## Component Patterns

### Structure
- Flat, single-file per component (e.g., `Button.tsx`, `Dialog.tsx`)
- PascalCase naming with colocated `.scss` files
- 156+ components in `packages/excalidraw/components/`
- Complex components get subdirectories (ColorPicker, CommandPalette)

### Props Pattern
```tsx
interface ButtonProps extends React.DetailedHTMLProps<...> {
  type?: "button" | "submit" | "reset";
  onSelect: () => any;
  selected?: boolean;
  children: React.ReactNode;
}
```

## Data Flow

### Unidirectional

```mermaid
flowchart LR
    A[User Action] --> B[App.tsx]
    B --> C[AppState mutation]
    C --> D[AppStateObserver.flush]
    D --> E[Subscriber notifications]
    E --> F[UIAppStateContext]
    F --> G[Child Components re-render]
    B --> H[ExcalidrawAPIContext<br/>Imperative API]
    H --> I[External Host App]
```

### Persistence
- **LocalStorage**: `EditorLocalStorage.ts` + `idb-keyval` (IndexedDB)
- **Cloud**: Firebase Firestore + Storage
- **API**: JSON backend (`json.excalidraw.com/api/v2/`)
- **File**: PNG metadata embedding for scene data in exports

## Error Handling
Custom error hierarchy in `packages/excalidraw/errors.ts`:
- `CanvasError` — Canvas rendering failures
- `AbortError` — Request cancellation
- `ImageSceneDataError` — Scene encoding/decoding
- `WorkerUrlNotDefinedError` — Worker bundle issues
- `RequestError` — HTTP failures with status codes
- `ExcalidrawError` — Generic handled errors

Errors surface via error dialogs + Sentry tracking.

## File Naming Conventions
- **Components**: PascalCase (`Button.tsx`, `App.tsx`)
- **Utilities**: camelCase (`appState.ts`, `clipboard.ts`)
- **Styles**: Colocated `.scss` with matching name
- **Tests**: `*.test.ts` suffix, colocated with source
- **Imports**: Path aliases via tsconfig (`@excalidraw/*`)

## Related Docs
- [Architecture](../docs/technical/architecture.md) — high-level system diagrams
- [Dev Setup](../docs/technical/dev-setup.md) — onboarding and common commands
- [Tech Context](./techContext.md) — full dependency list
- [Decision Log](./decisionLog.md) — rationale for architectural choices
- [Domain Glossary](../docs/product/domain-glossary.md) — terminology reference
