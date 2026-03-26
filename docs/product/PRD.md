# Product Requirements Document (Reverse-Engineered): Excalidraw

## 1. Product Goal

Excalidraw is a web-based whiteboard for creating hand-drawn style diagrams quickly, collaboratively, and without onboarding friction.

Primary product goals:

- Reduce time from "idea" to "visual explanation" to seconds.
- Enable synchronous collaboration in shared rooms with near real-time updates.
- Keep editing intuitive for both first-time and advanced users.
- Support two usage modes:
  - standalone app for direct usage;
  - embeddable editor package for integration into external products.

Success criteria (product-level):

- User can create a meaningful diagram in less than 2 minutes without training.
- Shared room participants see each other's changes with low perceived latency.
- Typical whiteboard workflows (draw, select, align, edit text, export) are completed without leaving the editor.

## 2. Target Audience

Primary audiences:

- Product and engineering teams:
  - architecture sketches, flows, API diagrams, incident analysis.
- Designers and UX specialists:
  - low-fidelity wireframes and user-flow discussions.
- Educators and students:
  - visual explanations during classes and workshops.
- Cross-functional business teams:
  - brainstorming, process mapping, planning sessions.

Secondary audiences:

- Developers integrating Excalidraw as a reusable component in React applications.
- Teams requiring lightweight visual collaboration without heavy enterprise whiteboard tooling.

## 3. Key Features

### 3.1 Core Canvas and Editing

- Infinite canvas with viewport controls (pan/zoom).
- Shape/text/line/arrow/free-draw/image/frame tools.
- Selection, multi-selection, grouping, transform operations.
- Rich text editing on canvas elements.
- Layer-like ordering and scene-level element management.

### 3.2 Reusable Content

- Library of reusable element bundles.
- Import/export library items and merge/update flows.
- Fast reuse of recurring diagram patterns.

### 3.3 Collaboration

- Shared rooms with real-time synchronization.
- Presence indicators (cursors/collaborators).
- Scene reconciliation for concurrent changes.
- Shared file/image synchronization in collaborative sessions.

### 3.4 Interoperability and Output

- Export to common output formats for sharing.
- Scene serialization/deserialization for persistence and transfer.
- Programmatic control via imperative API for host applications.
- Embedding support through `@excalidraw/excalidraw` package.

### 3.5 User Experience

- Low-friction welcome/onboarding flow.
- Keyboard-first productivity (shortcuts and actions).
- Visual style optimized for quick communication over pixel-perfect precision.

## 4. Technical Constraints and Boundaries

### 4.1 Architecture Constraints

- Monorepo with Yarn workspaces (`excalidraw-app`, `packages/*`, `examples/*`).
- Strong package boundaries:
  - `@excalidraw/element` for scene/element domain and rendering primitives;
  - `@excalidraw/excalidraw` for editor runtime and UI orchestration.
- Standalone app and embeddable package must remain compatible and co-evolve.

### 4.2 Runtime Constraints

- Browser-based runtime with React application shell.
- Rendering pipeline depends on canvas layers and viewport-driven visible-element filtering.
- State updates are action-driven and include capture policies (`IMMEDIATELY`, `NEVER`, `EVENTUALLY`) that affect history/sync semantics.

### 4.3 Collaboration Constraints

- Collaboration flow includes socket lifecycle and fallback initialization paths.
- Concurrent edits require deterministic reconciliation of remote/local element versions.
- File upload can have scene-side side effects (e.g., image status updates), impacting sync behavior.

### 4.4 Performance and Reliability Constraints

- Must preserve responsiveness with medium/large scenes and frequent updates.
- Undo/redo and store increment behavior must remain predictable under burst edits.
- Global caches/registries (e.g., snapping/fonts) require careful lifecycle handling to avoid stale state in embed scenarios.

### 4.5 Product Boundaries (Non-Goals)

- Not intended to replace high-fidelity design tools.
- Not intended as a full project/document management platform.
- Focus is visual communication speed and collaborative diagramming, not formal diagram standard enforcement.

## 5. Assumptions for This Reverse-Engineered PRD

- This document is inferred from repository structure, architecture docs, and domain terminology.
- Requirements reflect current implementation behavior and constraints, not a future product strategy roadmap.
