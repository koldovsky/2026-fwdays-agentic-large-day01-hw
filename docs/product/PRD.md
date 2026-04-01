# PRD

This is a reverse-engineered product requirements document based only on checked-in source code and repository configuration.
It describes what Excalidraw appears to optimize for, which user groups are visible in the code, which features are clearly implemented, and which constraints are explicit in the current implementation.

## Product Purpose

Excalidraw is a browser-based whiteboard and diagramming product centered on a canvas-first editing experience with a hand-drawn visual style.
The repository supports both a first-party web app and an embeddable React editor package.

From the code, the product purpose is to:

- let users start drawing immediately in the browser
- preserve work locally and restore it reliably
- support static sharing and live collaboration
- provide export paths for scenes and assets
- expose the editor as a reusable package for host applications

Source support:

- `excalidraw-app/vite.config.mts` defines the PWA manifest and product metadata
- `excalidraw-app/App.tsx` composes the standalone app around `<Excalidraw />`
- `packages/excalidraw/package.json` describes the package as a React component
- `packages/excalidraw/index.tsx` exports the public editor APIs

## Product Form

The repository implements two visible product forms:

- Standalone app in `excalidraw-app/` with app shell, dialogs, persistence, share flows, and collaboration UI
- Embeddable editor in `packages/excalidraw/` with hooks, UI components, restore helpers, export helpers, and imperative APIs

## Target Audience

The code suggests four primary audience groups.

### 1. Solo diagramming users

These users need fast access to the canvas, local persistence, and export/save flows.

Signals in code:

- welcome screen and immediate editor entry in `excalidraw-app/components/AppWelcomeScreen.tsx`
- local save and restore paths in `excalidraw-app/App.tsx` and `excalidraw-app/data/LocalData.ts`
- file/export actions in `excalidraw-app/components/AppMainMenu.tsx`

### 2. Collaborative users

These users need room creation, shared links, participant presence, and live session controls.

Signals in code:

- collaboration orchestration in `excalidraw-app/collab/Collab.tsx`
- collaboration dialog flows in `excalidraw-app/share/ShareDialog.tsx`
- collaborator state integration in `excalidraw-app/App.tsx`

### 3. Power users

These users need command surfaces beyond direct canvas interaction.

Signals in code:

- command palette integration in `excalidraw-app/App.tsx`
- menu actions for search, preferences, theme, and language in `excalidraw-app/components/AppMainMenu.tsx`

### 4. Embedded-product developers

These users integrate the editor into other apps and need a stable component/API surface.

Signals in code:

- public exports in `packages/excalidraw/index.tsx`
- package positioning in `packages/excalidraw/package.json`
- consumer examples in `examples/with-nextjs` and `examples/with-script-in-browser`

## Product Requirements

### 1. Fast entry into editing

The product must let users reach the canvas quickly without setup-heavy flows.

Evidence:

- `AppWelcomeScreen.tsx` exposes immediate draw/load/help/collaboration entry points
- `excalidraw-app/App.tsx` renders the editor as the central surface
- the app is configured as a browser product rather than a server-driven document workflow

### 2. Local-first preservation of work

The product must preserve work in the browser and restore it on return.

Evidence:

- `LocalData.save(...)` persists elements, app state, and files
- `excalidraw-app/data/localStorage.ts` stores scene-related browser state
- `excalidraw-app/data/tabSync.ts` supports cross-tab version checks
- `excalidraw-app/App.tsx` restores scene state from multiple sources

### 3. Sharing support

The product must let users share diagrams through static links and live sessions.

Evidence:

- static share/export logic in `excalidraw-app/data/index.ts`
- share dialog handling in `excalidraw-app/share/ShareDialog.tsx`
- collaboration room startup and stop flows in `excalidraw-app/collab/Collab.tsx`

### 4. Export support

The product must support saving or exporting work in multiple forms.

Evidence:

- menu-driven export and save flows in `excalidraw-app/components/AppMainMenu.tsx`
- app-level export integration in `excalidraw-app/App.tsx`
- package-level export helpers re-exported from `packages/excalidraw/index.tsx`

### 5. Multiple editing modes and tools

The editor must support multiple drawing and interaction modes.

Evidence:

- `packages/excalidraw/types.ts` defines tool-related types such as `ToolType` and `ActiveTool`
- `packages/excalidraw/components/App.tsx` contains runtime logic for tool state, selection, and interaction

Visible built-in tool family includes:

- selection
- lasso
- rectangle
- diamond
- ellipse
- arrow
- line
- freedraw
- text
- image
- eraser
- hand
- frame
- magicframe
- embeddable
- laser

### 6. Installable browser app behavior

The standalone app must remain installable on supported browsers.

Evidence:

- service worker registration in `excalidraw-app/index.tsx`
- PWA manifest, share target, file handling, and runtime caching config in `excalidraw-app/vite.config.mts`

## Key Features

### 1. Canvas editing

The product provides a central drawing canvas with element creation, selection, text editing, image handling, and frame-related behaviors.

Key files:

- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/types.ts`
- `packages/excalidraw/renderer/interactiveScene.ts`

### 2. Scene lifecycle and restoration

The app can initialize scenes from URLs, backend/share sources, and browser persistence.

Key files:

- `excalidraw-app/App.tsx`
- `excalidraw-app/data/index.ts`
- `excalidraw-app/data/LocalData.ts`

### 3. Live collaboration

The app supports starting a collaboration session, syncing scene state, showing collaborators, and stopping the session.

Key files:

- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/share/ShareDialog.tsx`
- `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`

### 4. Static sharing

The app supports shareable links separate from live session presence.

Key files:

- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/data/index.ts`
- `excalidraw-app/App.tsx`

### 5. Export and save flows

The app supports local save/export actions and product-specific export paths.

Key files:

- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/App.tsx`
- `packages/excalidraw/index.tsx`

### 6. Preferences and personalization

The app exposes theme, language, and preference-related controls.

Key files:

- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/App.tsx`

### 7. Installable PWA behavior

The product includes service-worker-backed installability, runtime caching, and related browser integrations.

Key files:

- `excalidraw-app/index.tsx`
- `excalidraw-app/vite.config.mts`

### 8. Embeddable editor package

The repository ships a reusable React editor for host applications.

Key files:

- `packages/excalidraw/index.tsx`
- `packages/excalidraw/package.json`
- `packages/excalidraw/README.md`

## Constraints And Non-goals

### Technical constraints visible in code

- Modern browser target only: `excalidraw-app/package.json` excludes older browser baselines such as IE 11 and older Safari/Edge/Chrome versions
- Node requirement for local work: root and app package manifests require Node `>=18.0.0`
- Collaboration depends on client integrations with `socket.io-client` and Firebase-backed helpers
- Some features depend on browser APIs such as `navigator.share`, `beforeinstallprompt`, IndexedDB, and `localStorage`
- Collaboration is disabled in iframe mode in `excalidraw-app/App.tsx`
- Some collaboration UI differs between mobile and desktop in `excalidraw-app/App.tsx`
- PWA caching is intentionally scoped in `excalidraw-app/vite.config.mts`, including a `maximumFileSizeToCacheInBytes` limit
- Embedded usage requires a non-zero-height container, CSS import, and client-side rendering guidance per `packages/excalidraw/README.md`

### Non-goals or boundaries inferred from code

- Not a server-rendered primary product flow
- Not a legacy-browser-first application
- Not an offline-only local app with no service-backed sharing or collaboration
- Not only a first-party website; it also serves as a reusable editor package

## Quality Signals Visible In Code

The source does not expose business KPIs, but the implementation emphasis suggests the product values:

- fast entry into drawing
- durable local persistence
- easy sharing and collaboration
- export flexibility
- installability on supported browsers
- a reusable public API for integrators

## Source Basis

This document was derived from:

- `excalidraw-app/index.tsx`
- `excalidraw-app/App.tsx`
- `excalidraw-app/components/AppWelcomeScreen.tsx`
- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/data/index.ts`
- `excalidraw-app/data/LocalData.ts`
- `excalidraw-app/package.json`
- `excalidraw-app/vite.config.mts`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/package.json`
- `packages/excalidraw/README.md`
- `packages/excalidraw/types.ts`
