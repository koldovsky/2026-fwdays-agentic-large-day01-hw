# Architecture

## High-level Architecture

This repository is a client-heavy TypeScript monorepo built around one hosted web app and a set of reusable packages. The browser is the primary execution environment; backend services are used for collaboration, persistence, sharing, AI features, and telemetry rather than for server-side rendering or domain orchestration.

### Workspace Layers

#### Root Workspace
- Orchestrates yarn workspaces, shared build scripts, linting, tests, Docker, and deployment configuration.
- Owns repo-wide entrypoints such as `package.json`, `Dockerfile`, `docker-compose.yml`, `vercel.json`, `vitest.config.mts`, and `scripts/*`.

#### Hosted Application: `excalidraw-app`
- Contains the production SPA shell, runtime integrations, and product-specific UI.
- Boots from `index.tsx`, then composes the app in `App.tsx` around the reusable `@excalidraw/excalidraw` component.
- Keeps hosted-only concerns out of the published package:
  - collaboration lifecycle in `collab/Collab.tsx` and `collab/Portal.tsx`
  - local persistence in `data/LocalData.ts`
  - Firebase persistence in `data/firebase.ts`
  - share-link import/export in `data/index.ts`
  - app-specific menus, dialogs, footer, sidebar, AI, telemetry, and theme handling

#### Shared Packages
- `packages/excalidraw`
  - reusable React editor package consumed by the hosted app and external integrators
  - owns the editor UI, event handling, rendering coordination, export paths, and public API surface
- `packages/element`
  - element data structures, mutation helpers, ordering, hit testing, bindings, and the scene model
- `packages/math`
  - geometry and vector primitives used throughout drawing and selection logic
- `packages/common`
  - shared constants, feature flags, helpers, branded types, and utilities
- `packages/utils`
  - extra standalone utilities with a separate release cadence

#### Example Integrations
- `examples/with-nextjs` demonstrates client-only embedding in a Next.js app
- `examples/with-script-in-browser` demonstrates direct browser usage without the hosted app shell

### Runtime Topology

```text
Browser
  |
  |-- Excalidraw SPA (React + Vite)
  |     |
  |     |-- Editor runtime: @excalidraw/excalidraw
  |     |-- Local scene/app state: localStorage
  |     |-- Local binary/library/chat data: IndexedDB
  |     |-- Realtime sync: Socket.IO collaboration server
  |     |-- Room snapshots: Firebase Firestore
  |     |-- Binary files: Firebase Storage
  |     |-- Share links: Backend V2 GET/POST API
  |     |-- AI features: external AI backend
  |     \-- Telemetry: Sentry
  |
  \-- Static hosting: Vercel or Nginx container
```

### Deployment and Infrastructure

- Production hosting can be done through Vercel or through the provided multi-stage Docker build.
- The Docker path builds the app with Node.js and serves `excalidraw-app/build` from Nginx.
- Firebase is split by concern:
  - Firestore stores encrypted room scene snapshots
  - Storage stores room and share-link file blobs
- The monorepo intentionally does not contain all runtime services. Collaboration, share-link, and AI backends are external dependencies with stable client contracts.
- During local development, the app resolves workspace package aliases directly to source files in `packages/*`, so the hosted app and package code run against the same implementation.

## Data Flow

### Critical Path: App Startup

1. `excalidraw-app/index.tsx` registers the service worker and mounts the React tree.
2. `App.tsx` initializes app-wide listeners and examines the URL for one of several entry paths:
   - local scene restore
   - share-link import via `#json=`
   - collaboration room via `#room=`
   - external file import via `#url=`
3. Local scene state is restored from browser storage first.
4. If an external scene is requested, the app may prompt before overwriting current content.
5. For collaboration rooms, the remote scene is loaded and then reconciled against the current editor state instead of blindly replacing it.

### Local Editing And Persistence

1. User input changes the editor scene inside `@excalidraw/excalidraw`.
2. The hosted app receives `onChange(elements, appState, files)` from the editor.
3. `LocalData.save()` debounces persistence work:
   - scene elements and app state go to `localStorage`
   - binary files go to IndexedDB via `idb-keyval`
4. Cross-tab version markers are updated so newer browser state can win when multiple tabs are open.
5. Image file statuses are updated after successful local file persistence.

### Critical Path: Collaboration Save Path

1. The app creates and exposes a collaboration API through `collab/Collab.tsx`.
2. `App.tsx` forwards current element state to `collabAPI.syncElements()` when collaboration is active.
3. `Collab.tsx` filters to syncable elements and delegates transport work to `Portal.tsx`.
4. `Portal.tsx` encrypts payloads and emits updates over Socket.IO.
5. `data/firebase.ts` stores encrypted scene snapshots in Firestore and uploads files to Firebase Storage.
6. Incoming remote updates are reconciled against the current scene instead of treated as authoritative server state.

### Critical Path: Share-Link Export Path

1. The current scene is serialized by the editor and app shell.
2. Share-link export compresses and encrypts the payload client-side.
3. The opaque payload is sent to the Backend V2 API.
4. Associated files are uploaded to Firebase Storage under a share-specific prefix.
5. The resulting URL stores the decryption key in the hash fragment.
6. Import follows the reverse path, with remote payloads decrypted and restored into editor state.

### AI and Ancillary Flows

- Diagram-to-Code and Text-to-Diagram features live in the hosted app and call an external AI backend.
- TTD chat history is persisted in IndexedDB rather than localStorage.
- Telemetry initialization happens early through `sentry.ts`, but it observes the app rather than shaping editor state.

## State Management

### In-Memory Editor State

- The canonical drawing state is centered on the `Scene` model from `packages/element/src/Scene.ts`.
- `Scene` stores:
  - all elements, including deleted ones
  - derived non-deleted maps and frame collections
  - selection caches
  - a scene nonce used for render invalidation
- Scene mutations eventually call `scene.triggerUpdate()`, which notifies the editor runtime that a redraw is required.
- The core editor also tracks app state, history, and interaction state inside `packages/excalidraw`, where the main editor `App` subscribes to scene updates.

### Editor-Scoped UI State

- `packages/excalidraw/editor-jotai.ts` defines an isolated Jotai store for editor-internal UI state.
- This store is provided by `EditorJotaiProvider` inside the public `Excalidraw` component.
- It is used for editor-owned UI concerns such as dialogs, command palette state, language state, library state, and other package-internal controls.
- Isolation matters because the published package should not leak or depend on the hosted app's atoms.

### Hosted-App State

- `excalidraw-app/app-jotai.ts` defines a separate Jotai store for product-specific concerns.
- App-level atoms cover concerns that do not belong in the reusable editor package, including:
  - collaboration API availability
  - collaboration/offline status
  - share dialog visibility
  - localStorage quota warnings
  - app language selection
- This split keeps the npm package embeddable while allowing the hosted app to add product features on top.

### Actions And Command Dispatch

- `packages/excalidraw/actions/manager.tsx` owns `ActionManager`, the command-dispatch layer for toolbar, keyboard, context-menu, command-palette, and API-triggered actions.
- `ActionManager` evaluates `Action` definitions against the current `AppState`, ordered elements, and app props, then routes the resulting mutations through the editor updater.
- This matters architecturally because canvas behavior is not driven only by pointer interaction; many state transitions flow through reusable action definitions shared by menus, shortcuts, and embedders.

### Persisted State and Browser Coordination

- `localStorage` stores lightweight scene and app metadata such as:
  - elements
  - app state
  - collaboration metadata
  - theme
  - browser-state version markers
- IndexedDB stores heavier or structured data:
  - image binaries in `files-db/files-store`
  - library data in `excalidraw-library-db/excalidraw-library-store`
  - TTD chat history in `excalidraw-ttd-chats-db/excalidraw-ttd-chats-store`
- Remote persistence is layered on top of local-first behavior:
  - Firestore stores encrypted scene snapshots
  - Firebase Storage stores encrypted or upload-processed binary assets
- Cross-tab arbitration relies on version timestamps rather than transactions, which is simple but intentionally lightweight.

## Rendering Pipeline

### Entry and Render Ownership

1. React mounts the hosted app.
2. The hosted app renders the public `Excalidraw` component from `packages/excalidraw`.
3. The package-level editor `App` subscribes to `scene.onUpdate(this.triggerRender)`.
4. Scene mutations or editor-state changes invalidate rendering and schedule redraw work.

### Static vs Interactive Rendering

The editor splits canvas work into two distinct rendering paths.

#### Static Scene
- Implemented in `packages/excalidraw/renderer/staticScene.ts`.
- Responsible for painting stable scene content such as:
  - background and grid
  - frames and regular elements
  - element links and clipped frame content
- Uses normalized canvas dimensions and bootstraps the canvas with theme, scaling, and background settings.
- Delegates element painting to shared element rendering logic from `@excalidraw/element`.

#### Interactive Scene
- Implemented in `packages/excalidraw/renderer/interactiveScene.ts`.
- Responsible for transient overlays such as:
  - selection outlines and resize handles
  - binding hints and snap guides
  - text/linear-element editing affordances
  - remote cursors and collaborator viewport hints
  - scrollbars and hover indicators
- This separation keeps transient interaction repainting from forcing a full redraw of every stable element on every pointer move.

### Render Triggers and Performance Characteristics

- The scene model exposes `triggerUpdate()` and a callback registry so rendering is invalidated explicitly.
- The hosted app enables throttled rendering through `window.EXCALIDRAW_THROTTLE_RENDER = true`.
- The renderer normalizes for device pixel ratio and zoom before painting.
- The Vite build also supports runtime performance by splitting large optional code paths:
  - non-core locales
  - Mermaid conversion
  - CodeMirror-related chunks
- Export paths are separate from interactive painting, with dedicated renderers for SVG and other export flows.

## Package Dependencies

### Internal Dependency Graph

```text
@excalidraw/common
  |
  +--> @excalidraw/math
  |       |
  |       +--> @excalidraw/element
  |               |
  |               +--> @excalidraw/excalidraw
  |
  \--> shared by all workspace packages

@excalidraw/utils
  - supplementary utilities with separate release cadence

excalidraw-app
  - consumes @excalidraw/excalidraw
  - also imports package internals directly through Vite aliases in development
```

### Package Roles and Boundaries

- `@excalidraw/common`
  - lowest-level shared helpers and constants
- `@excalidraw/math`
  - depends on `@excalidraw/common`
  - provides geometry primitives used by selection, transforms, and drawing math
- `@excalidraw/element`
  - depends on `@excalidraw/common` and `@excalidraw/math`
  - provides element types, mutation helpers, scene storage, bindings, and element rendering primitives
- `@excalidraw/excalidraw`
  - depends on `@excalidraw/common`, `@excalidraw/math`, and `@excalidraw/element`
  - packages the reusable editor runtime and public React API
- `@excalidraw/utils`
  - offers standalone utilities and does not sit in the critical runtime chain of the hosted app

### External Runtime Dependencies

- UI/runtime: React 19, React DOM, Jotai, Jotai Scope
- Persistence and sync: Firebase, Socket.IO client, `idb-keyval`
- Rendering and export support: RoughJS, CodeMirror, Mermaid conversion, image/font helpers
- Operations: Sentry, Vite, Vite PWA tooling

### Architectural Constraints

- The browser is the system of record during active editing; remote systems extend, but do not replace, local behavior.
- Collaboration correctness depends on client reconciliation and sync contracts rather than authoritative server-side domain logic.
- Security for collaboration and share links depends on client-side encryption and keys kept in URL fragments.
- Because the app resolves workspace packages to source during development, package boundaries must remain disciplined even when cross-package imports are convenient.

## Related Docs

- Memory-bank summary for decisions and priorities: [../memory/decisionLog.md](../memory/decisionLog.md)
- System-level patterns and trade-offs: [../memory/systemPatterns.md](../memory/systemPatterns.md)
- Runtime caveats and hidden behavior: [../memory/decisionLog.md](../memory/decisionLog.md)
- Local setup, CI, and troubleshooting workflow: [dev-setup.md](dev-setup.md)