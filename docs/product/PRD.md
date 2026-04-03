# Product Requirements Document

## Document Status

- Type: Reverse-engineered PRD
- Product: Excalidraw
- Repository: `excalidraw-monorepo`
- Basis: inferred from the current source tree, not an official upstream product spec

## 1. Project Meta

### Product Summary

Excalidraw is a browser-based whiteboard and diagramming product focused on fast sketching with a hand-drawn visual style. The codebase supports both a hosted end-user application and an embeddable React editor package, `@excalidraw/excalidraw`.

### Product Shape

- Delivery model: web application plus reusable React library
- Primary interface: browser canvas editor with DOM-based overlays and menus
- Core value proposition: low-friction diagram creation, sharing, and live collaboration
- Packaging model: Yarn monorepo with separate app, editor package, shared packages, and examples

### Inferred Business Goals

- Let users open the app and start drawing immediately
- Make diagram sharing and live collaboration first-class workflows
- Preserve the editor as an integration-ready component for third-party products
- Support offline-friendly and installable browser usage through PWA patterns

### Repository Components

- `excalidraw-app/`: hosted app shell, collaboration, sharing, persistence, and app-specific UI
- `packages/excalidraw/`: public editor component, hooks, APIs, import/export helpers
- `packages/element/`: element data model, scene operations, mutations, versioning
- `packages/common/`, `packages/math/`, `packages/utils/`: shared infrastructure
- `examples/`: integration examples for host developers

## 2. Target Audience

### Primary Audience

- Individual users who need to sketch diagrams quickly without heavy setup
- Small teams collaborating on diagrams in real time
- Users who want to share scenes by link or export visual outputs

### Secondary Audience

- Developers embedding Excalidraw into their own React applications
- Product teams that need a customizable whiteboard/editor inside a larger workflow

### User Needs

- Immediate access to a blank canvas
- Simple, discoverable editing tools
- Reliable save, export, and load workflows
- Fast collaboration setup through links or rooms
- Browser-native behavior including installability, clipboard, and local persistence
- A stable integration surface for embedded use cases

## 3. Key Functions

### Core Editing

- Create and edit diagram elements on a canvas
- Select, move, group, and transform elements
- Maintain scene state, history, and undo/redo
- Render a sketch-style visual output instead of a rigid vector-editor appearance

### Scene Management

- Load and restore scenes
- Save scenes locally and export them to files or images
- Import and export scene libraries
- Persist scene-related data in browser storage

### Collaboration and Sharing

- Create shareable scene links
- Join live collaboration rooms
- Track collaborators, pointers, bounds, and room presence
- Surface collaboration entry points from both the welcome flow and main app UI

### User Experience Features

- Welcome screen for rapid onboarding
- Main menu, command palette, and search-driven actions
- Theme and language switching
- Offline-aware loading and installable PWA behavior
- QR-code-based collaboration/share flows

### Developer Platform Functions

- Expose the editor as `@excalidraw/excalidraw`
- Provide public APIs for scene updates and event callbacks
- Support host-defined UI composition and initial data loading
- Include integration examples for frameworks and browser-script usage

## 4. Technical Limitations

### Platform Constraints

- The product is fundamentally browser-first; major capabilities depend on web platform APIs, browser storage, canvas rendering, and client-side interaction state
- The hosted app and the embeddable package must remain decoupled enough that app-shell behavior does not leak into library consumers

### Collaboration Constraints

- Real-time collaboration depends on room lifecycle management, encrypted payload flows, sockets, and Firebase-backed infrastructure
- Collaboration quality is therefore bounded by network availability and backend service health

### Persistence Constraints

- Local persistence relies on browser storage mechanisms, which can vary across browsers and environments
- File handling and local restoration are constrained by browser permissions and storage limits

### Rendering and Interaction Constraints

- Canvas-based rendering must balance performance with a rich editing surface, including static scene rendering, in-progress element previews, and interactive overlays
- Large or highly complex scenes are likely to stress render performance, history tracking, and scene-diff workflows

### State Architecture Constraints

- Editor state is split across scene data, React state, store increments, and history deltas, which increases implementation complexity for features that touch multiple layers
- Undo/redo durability depends on the store/history pipeline rather than simple direct state snapshots

### Integration Constraints

- The public library API must stay stable enough for host applications while the hosted app continues evolving
- Features tightly coupled to the app shell, such as collaboration and share dialogs, cannot be assumed to exist in every embedded deployment

### Environment Constraints

- Some behaviors degrade or vary in test/dev environments compared with full browser runtime behavior
- Offline and installable behavior are best-effort browser capabilities rather than guaranteed product invariants

## 5. Success Criteria

The following success criteria are inferred from the implemented product shape:

- A new user can reach a usable drawing surface with minimal onboarding friction
- A user can create, save, export, and reload diagram work without relying on a desktop client
- A collaborator can join and interact in a shared room with visible live presence
- A developer can embed the editor and control it through documented public APIs
- The same core editor runtime can support both the hosted app and embedded integrations

## 6. Evidence Base

This PRD is reverse-engineered from repository structure and implementation signals, primarily:

- `docs/memory/projectbrief.md`
- `docs/memory/productContext.md`
- `docs/technical/architecture.md`
- `excalidraw-app/App.tsx`
- `excalidraw-app/components/AppWelcomeScreen.tsx`
- `excalidraw-app/components/AppMainMenu.tsx`
- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/index.tsx`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/components/App.tsx`
