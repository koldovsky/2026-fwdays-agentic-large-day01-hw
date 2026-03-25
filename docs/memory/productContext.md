# Product context (Excalidraw monorepo)

This glossary/UX context is inferred from verified code paths in:
- `packages/excalidraw/*` (editor component, dialogs, canvases)
- `excalidraw-app/*` (host app wiring, collaboration triggers)
- `packages/excalidraw/README.md` (integration assumptions)

---

## Project Purpose

- **What it does**
  - Provides an **embeddable React editor** (`@excalidraw/excalidraw`) for drawing/diagramming on a canvas, with export and optional collaborative mode.
  - The package is explicitly documented as “exported as a React component that you can embed directly in your app” (`packages/excalidraw/README.md`).
- **Problem it solves**
  - Lets users create and manipulate diagram-like drawings in a web UI (shapes/tools, selection, editing).
  - Enables **sharing/exporting** via built-in export dialogs and host callbacks.
  - Adds optional **real-time collaboration** (remote cursors/selections rendered from `AppState.collaborators`).
  - Supports **Text-to-Diagram** generation from text and/or **Mermaid** (`TTDDialog`, including `MermaidToExcalidraw`).
- **Key use cases (verifiable)**
  - Embed editor into another web app (requires importing CSS and rendering in a container with non-zero height).
  - Draw using tools like `selection`, `rectangle`, `ellipse`, `arrow`, `freedraw`, `text`, `image`, `eraser`, `frame`, `magicframe`, `embeddable`, `laser` (`packages/excalidraw/types.ts`).
  - Export: open `ImageExportDialog` / `JSONExportDialog` from `LayerUI` (`packages/excalidraw/components/LayerUI.tsx`), and support host-side export interception via `ExcalidrawProps.onExport`.
  - Collaboration: enable `isCollaborating` and use `LiveCollaborationTrigger`; remote users are represented in `AppState.collaborators` and rendered by `InteractiveCanvas`.
  - Reuse saved diagrams via **Library** UI (`LibraryMenu` and sidebar integration).
  - Generate diagrams via **TTDDialog** (`openDialog?.name === "ttd"`) and Mermaid conversion (`convertMermaidToExcalidraw`).

---

## Target Users

- **Primary user groups (from code + integration docs)**
  - **Diagram/drawing end users** using the editor UI to create/edit shapes and text.
  - **Collaborators** in a multi-user session when `isCollaborating` is enabled.
  - **Host developers** embedding the component in their app and integrating persistence/export/collaboration via callbacks and the imperative API.
- **Their goals and needs (code-evidenced)**
  - End users want access to tool-driven editing (see `ToolType` union in `packages/excalidraw/types.ts`) and interactive editing layers (`StaticCanvas`, `NewElementCanvas`, `InteractiveCanvas`).
  - Collaboration participants need remote cursor/selection feedback (handled by iterating `appState.collaborators` in `InteractiveCanvas`).
  - Host developers need integration points:
    - `onChange` for elements + `AppState`
    - `onIncrement` for durable/ephemeral increments
    - `onExcalidrawAPI` / `onInitialize` for imperative API access
    - `onExport` to intercept exporting and show progress while async operations complete.
- **Implicit assumptions about users**
  - Users (or host apps) render Excalidraw **client-side**; SSR requires disabling SSR (Next.js guidance in `packages/excalidraw/README.md`).
  - The canvas is expected to be visible: the parent container must have non-zero height (README).
  - Some UX differs on mobile: `LayerUI` renders `MobileMenu` only when `editorInterface.formFactor === "phone"`.

---

## UX Goals

- **What UX the system aims to provide (evidence-based)**
  - **Interactive canvas editing** with separate static and interactive rendering layers:
    - `StaticCanvas` renders scene bitmap via `renderStaticScene(...)`
    - `InteractiveCanvas` renders cursors, handles, and selection UI via `renderInteractiveScene(...)`
  - **Performance-aware rendering**
    - Static/new-element rendering uses `isRenderThrottlingEnabled()` passed into `renderStaticScene` / `renderNewElementScene`.
  - **Reliability around updates**
    - Editor exposes structured update hooks (`onChange`, `onIncrement`) and an imperative API that includes `updateScene`, `applyDeltas`, and history control (`history.clear`).
  - **Collaboration feedback**
    - Remote pointers/selection sets are computed from `appState.collaborators` in `InteractiveCanvas`.
  - **Product versatility via embedding**
    - Host apps can override/extend UI via `renderTopLeftUI`, `renderTopRightUI`, `renderCustomStats`, and can inject custom embed rendering (`renderEmbeddable`).
- **Key qualities**
  - Speed/perceived smoothness (render throttling + animation controller in `InteractiveCanvas`).
  - Reliability/undoable changes (documented `captureUpdate` semantics in editor API paths like `updateScene`; undo/redo uses `History`).
  - Flexibility (callback-rich `ExcalidrawProps`).
  - Collaboration (live-collab trigger + remote cursor rendering).

---

## Key User Flows

- **1. Embed & start drawing**
  - Host imports styles (`@excalidraw/excalidraw/index.css`) and renders `<Excalidraw />` inside a container with non-zero height (README).
  - Editor mounts; `InitializeApp` sets language before `App` renders.
  - When there are no elements, `App` sets `showWelcomeScreen: true` and `LayerUI` renders `WelcomeScreen` based on `renderWelcomeScreen`.
  - User selects a tool (`activeTool` from `ToolType`) and interacts via pointer handlers routed through `InteractiveCanvas`.
- **2. Edit existing diagram**
  - User uses selection and transformation states represented in `AppState` (e.g. `selectionElement`, `resizingElement`, `editingTextElement`, `activeTool`).
  - Updates propagate to the host via `onChange(elements, appState, files)` after initialization is done (`App` checks `!this.state.isLoading` before calling `onChange`).
- **3. Quick navigation/search and executing actions**
  - User opens the `CommandPalette` / search UI (exists as a component and is wired into default items).
  - User triggers commands like export/save and library-related operations through `ActionManager` wiring.
- **4. Export / share**
  - User opens `ImageExportDialog` and `JSONExportDialog` from `LayerUI`.
  - Export operations can be intercepted by host via `ExcalidrawProps.onExport` (documented: may return async work; progress toast while it completes).
  - Collaboration/share surfaces include `LiveCollaborationTrigger` and `ShareableLinkDialog`.
- **5. Library-based reuse**
  - User opens the sidebar library (`DefaultSidebar` → `LibraryMenu`).
  - User can add elements to library and insert saved library items (`LibraryMenu` provides `onAddToLibrary` and `onInsertLibraryItems`).
- **6. Generate diagrams from text and Mermaid**
  - User opens `TTDDialog` when `appState.openDialog?.name === "ttd"` (LayerUI).
  - The dialog provides tabs for text-to-diagram and Mermaid (`TextToDiagram`, `MermaidToExcalidraw`).
  - Successful Mermaid conversion uses `convertMermaidToExcalidraw` (used in `TTDDialog/TTDDialog.tsx` integration paths).

---

## Constraints & Assumptions

- **Rendering integration assumptions**
  - Must import package CSS and render into a container with a non-zero height; otherwise canvas is not visible (README).
  - In SSR frameworks, Excalidraw should be rendered client-only (`ssr: false`, `"use client"` guidance in README).
- **Performance**
  - Static and new-element canvas rendering uses render throttling (`isRenderThrottlingEnabled`) to avoid over-rendering.
- **UX mode constraints**
  - Behavior/UI depends on mode flags in `ExcalidrawProps` and `AppState`, including `viewModeEnabled`, `zenModeEnabled`, and `gridModeEnabled`.
- **Async export integration**
  - Host can delay saving/export until async operations (e.g., images) complete; UX expectation is progress feedback during `onExport`.

## Cross-doc Links

- For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
- For developer setup → see [docs/technical/dev-setup.md](../technical/dev-setup.md)
- For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
- For product requirements (PRD) → see [docs/product/PRD.md](../product/PRD.md)

