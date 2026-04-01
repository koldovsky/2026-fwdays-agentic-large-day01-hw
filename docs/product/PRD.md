# PRD

## Document Type

This is a reverse-engineered product requirements document based only on the repository source code and checked-in product configuration.
It describes what the product appears to do, who it appears to serve, which capabilities are clearly implemented, and which technical limits are visible in the current codebase.

## Product Name

- `Excalidraw`

This name is used directly in:

- `excalidraw-app/vite.config.mts` PWA manifest
- `packages/excalidraw/package.json`

## Product Goal

## Primary goal

The product is a browser-based whiteboard and diagramming tool that lets users sketch diagrams with a hand-drawn feel.

This is directly supported by:

- the PWA manifest description in `excalidraw-app/vite.config.mts`
- the app shell and editor integration in `excalidraw-app/App.tsx`
- the reusable package description in `packages/excalidraw/package.json`

## Secondary goals visible in code

- Provide a full standalone web app for direct end-user use
- Provide an embeddable React component for host applications
- Support local-first editing and restoration
- Support static sharing and live collaboration
- Support export workflows and installable PWA behavior
- Provide clear product paths into `Excalidraw+`

## Product Form

The repository supports two product forms:

### Standalone app

The app in `excalidraw-app/` is a first-party end-user product with:

- welcome screen
- main menu
- command palette
- dialogs
- local persistence
- collaboration UI
- export and sharing flows

### Embeddable editor

The package in `packages/excalidraw/` exports `Excalidraw` as a React component and exposes hooks, UI components, and APIs for host apps.

## Target Audience

## Primary audience inferred from the app

The clearest target audience from the product code is people who need to:

- sketch diagrams quickly
- work on a browser-based whiteboard
- share diagrams with others
- collaborate in real time
- export diagrams or save them locally

This inference is supported by:

- the app welcome screen in `excalidraw-app/components/AppWelcomeScreen.tsx`
- the menu structure in `excalidraw-app/components/AppMainMenu.tsx`
- the collaboration/share dialog in `excalidraw-app/share/ShareDialog.tsx`
- the PWA manifest and screenshots in `excalidraw-app/vite.config.mts`

## Secondary audience inferred from the package

The repository also serves developers integrating Excalidraw into other products.
This is supported by:

- `packages/excalidraw/package.json` description
- the public exports in `packages/excalidraw/index.tsx`
- example consumers in `examples/with-nextjs` and `examples/with-script-in-browser`

## Audience segments visible from code

### Solo users

Supported by:

- immediate canvas access
- load scene
- save/export flows
- local persistence

### Collaborative users

Supported by:

- live collaboration trigger
- room link creation
- QR code sharing
- username entry
- offline warning state

### Power users

Supported by:

- command palette
- search menu
- preferences
- theme switching
- language switching

### Embedded-product developers

Supported by:

- reusable React package
- exported hooks and imperative API
- examples for integration

## Product Requirements

## Core requirement 1: Users must be able to start drawing immediately

The code strongly indicates that the product is optimized for fast entry into the canvas:

- `AppWelcomeScreen.tsx` shows load/help/collaboration options
- `App.tsx` renders the editor with `autoFocus={true}`
- the standalone app centers the editor as the primary experience

## Core requirement 2: The product must preserve user work locally

This is implemented through:

- `LocalData.save(...)`
- local storage for elements and app state
- IndexedDB-backed file persistence
- browser-tab sync checks
- unload protection when files are still in a sensitive state

Relevant files:

- `excalidraw-app/App.tsx`
- `excalidraw-app/data/LocalData.ts`
- `excalidraw-app/data/localStorage.ts`
- `excalidraw-app/data/tabSync.ts`

## Core requirement 3: Users must be able to share diagrams

The product supports at least two distinct share modes:

### Static shareable links

Supported by:

- backend export flow
- share dialog option for link creation
- shareable link dialog after export

Relevant files:

- `excalidraw-app/App.tsx`
- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/data/index.ts`

### Live collaboration

Supported by:

- room creation
- active room links
- QR code sharing
- remote collaborator state
- stop-session flow

Relevant files:

- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/App.tsx`

## Core requirement 4: Users must be able to export content

Visible export capabilities include:

- save to active file
- save to disk
- save as image
- export dialog
- backend-based share export
- Excalidraw+ export path

Relevant files:

- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/App.tsx`
- `packages/excalidraw/index.tsx`

## Core requirement 5: The editor must support multiple workflows and input modes

The product supports many tools and interaction modes through `ToolType` and `AppState.activeTool`.
Visible built-in tools include:

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

Relevant files:

- `packages/excalidraw/types.ts`
- `packages/excalidraw/components/App.tsx`

## Core requirement 6: The standalone app must remain installable and browser-friendly

The PWA configuration shows explicit product requirements for:

- installability
- runtime caching
- file handling
- web share target support

Relevant file:

- `excalidraw-app/vite.config.mts`

## Key Functions

## 1. Canvas editing

Implemented by the reusable editor package and the app shell around it.
Visible features from source include:

- drawing with multiple tools
- element selection
- text editing
- image handling
- frame support
- embeddable and iframe-like content
- command palette access
- search menu access

Key files:

- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/types.ts`
- `excalidraw-app/App.tsx`

## 2. File and scene lifecycle

The app supports:

- loading a scene
- restoring state from browser storage
- reading scenes from URLs and backend links
- file save and export paths

Key files:

- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/App.tsx`
- `excalidraw-app/data/index.ts`
- `excalidraw-app/data/LocalData.ts`

## 3. Collaboration

The app exposes:

- live session start
- live session stop
- username entry
- room link copy/share
- QR code generation
- offline collaboration warning

Key files:

- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/App.tsx`

## 4. Sharing and publishing

The app supports:

- readonly or static shareable links
- collaboration links
- system share integration when `navigator.share` is available

Key files:

- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/App.tsx`

## 5. Export

The app exposes:

- save to disk
- save as image
- JSON/export dialog flows
- backend share export
- Excalidraw+ export

Key files:

- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/App.tsx`
- `packages/excalidraw/components/LayerUI.tsx`

## 6. Preferences and personalization

The app visibly supports:

- theme switching
- system theme mode
- language selection
- preferences dialog
- canvas background changes

Key files:

- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/App.tsx`

## 7. Product navigation and discovery

The app provides:

- welcome screen hints
- help
- menu shortcuts
- command palette
- socials/community links
- GitHub link

Key files:

- `excalidraw-app/components/AppWelcomeScreen.tsx`
- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/App.tsx`

## 8. Excalidraw+ entry points

There are multiple visible links and flows into `Excalidraw+`, including:

- welcome screen links
- menu links
- promo banner
- export actions
- command palette links

Key files:

- `excalidraw-app/components/AppWelcomeScreen.tsx`
- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/App.tsx`

## Technical Limitations And Constraints

## Browser support constraint

`excalidraw-app/package.json` defines a browser compatibility target.
It excludes older browsers such as:

- Internet Explorer <= 11
- Safari < 12
- Edge < 79
- Chrome < 70

This means the product is intended for modern browsers only.

## Node and local tooling constraint

The app and root package both require:

- Node `>=18.0.0`

This affects local development and build environments.

## Collaboration dependency constraint

Live collaboration depends on:

- `socket.io-client`
- Firebase helpers and storage

This means collaboration behavior is coupled to those runtime services and client-side integration paths.

Relevant files:

- `excalidraw-app/package.json`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/data/firebase.ts`

## Browser API constraint

Several product capabilities depend on browser APIs:

- `navigator.share` for system share
- `beforeinstallprompt` for install flow
- PWA file handlers and share target support
- IndexedDB for local file persistence
- localStorage for app state persistence

As a result, feature availability can vary by browser or platform.

Relevant files:

- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/App.tsx`
- `excalidraw-app/vite.config.mts`
- `excalidraw-app/data/LocalData.ts`

## Collaboration-in-iframe constraint

In `excalidraw-app/App.tsx`, collaboration is disabled when running in an iframe through `isRunningInIframe()`.
That means the standalone collaboration UX is not universally available in all embedding contexts.

## Mobile/Desktop UI constraint

In `excalidraw-app/App.tsx`, some top-right collaboration UI is not rendered on mobile.
This shows that parts of the visible product surface differ by form factor.

## PWA caching constraint

The Vite PWA config excludes certain assets from precache and configures runtime caching rules for:

- fonts
- locales
- chunked JavaScript

It also sets a `maximumFileSizeToCacheInBytes` limit of about `2.3MB`.

This means installability and offline behavior are intentionally scoped rather than fully unlimited.

## Packaging and runtime constraint

The public package README says:

- the package must be rendered in a container with a non-zero height
- host apps must import `@excalidraw/excalidraw/index.css`
- SSR frameworks should render it on the client

These are product-integration constraints for embedded use.

Relevant file:

- `packages/excalidraw/README.md`

## Explicitly Visible Non-Goals Or Boundaries

The codebase does not suggest that the app is built as:

- a server-rendered primary experience
- a legacy-browser-first product
- an offline-only local app with no service-backed features

Instead, the product is clearly optimized for:

- modern browser use
- interactive canvas editing
- optional online sharing and collaboration
- host-app embedding through React

## Product Success Signals Visible In Code

The source does not include explicit business KPIs, but implementation emphasis suggests the product values:

- fast entry into drawing
- durable local persistence
- easy sharing and collaboration
- export flexibility
- installability on supported platforms
- a public reusable API for integrators

## Source Basis

This reverse-engineered PRD was derived from:

- `excalidraw-app/App.tsx`
- `excalidraw-app/components/AppWelcomeScreen.tsx`
- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/package.json`
- `excalidraw-app/vite.config.mts`
- `packages/excalidraw/package.json`
- `packages/excalidraw/README.md`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/types.ts`
