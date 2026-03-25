# Product Requirements Document (reverse-engineered from implementation)

This PRD is reconstructed from code paths, component names, and inline markers (`TODO`, `FIXME`, `HACK`) that exist in this repository. It avoids unstated goals.

## Product Goal

- **What the product does**
  - Provides **Excalidraw as an embeddable React component** (`@excalidraw/excalidraw`) that renders a canvas-based editor with tool-driven diagram creation and editing.
  - Supports **export** (JSON and image/SVG/canvas flows), **sharing** (share dialogs and shareable links in the host app), optional **collaboration UI**, and **library-based reuse** (sidebar + insertion).
  - Includes **Text-to-Diagram** via `TTDDialog` with **Mermaid** conversion (and auto-fix candidates).
- **Core problem it solves**
  - Interactive creation and manipulation of diagram-like drawings in a web UI, with persistence/export and optional multi-user awareness.
- **Main value proposition**
  - “Drop-in” embedding: host apps can render the editor and integrate via typed callbacks and an imperative API.
  - Feature completeness through built-in UI flows: welcome screen (empty canvas), dialogs, command palette, library, and export.
- **Evidence from the code**
  - Embedding + SSR assumptions: `packages/excalidraw/README.md` (“import `index.css`”, render inside container with non-zero height; Next.js SSR advice).
  - Editor UI composition: `packages/excalidraw/components/App.tsx` → `LayerUI` + `StaticCanvas` + `NewElementCanvas` + `InteractiveCanvas`.
  - Canvas interactivity: `StaticCanvas.tsx` calls `renderStaticScene`, `InteractiveCanvas.tsx` calls `renderInteractiveScene` and builds remote pointer rendering from `appState.collaborators`.

## Target Users

- **Primary user groups (inferred from components and props)**
  - **End users** drawing/editing on the canvas using built-in tools (`ToolType` in `packages/excalidraw/types.ts`).
  - **Collaborators** in a session (`isCollaborating` prop + `appState.collaborators` rendering in `InteractiveCanvas`).
  - **Host app developers** embedding the component and integrating persistence/export through props callbacks and the imperative API (`ExcalidrawProps.onChange`, `onExport`, `onExcalidrawAPI`, etc.).
- **Goals and needs (evidence)**
  - End users need: tool switching and interactive editing surfaces (canvas layers), welcome/onboarding when empty (`showWelcomeScreen`).
  - Collaborators need: visible remote cursors/selection state (`InteractiveCanvas` iterates `appState.collaborators`).
  - Host developers need: integration points (`onChange`, `onIncrement`, `onExport` with async/progress support in `packages/excalidraw/types.ts`).
- **Implicit assumptions about user behavior**
  - Host apps run client-side: README recommends client-only rendering in SSR frameworks.
  - The editor is used inside a visible container (canvas invisible if parent has no height).

## Key Features

- **Editing + interaction**
  - Tools: selection, lasso, shapes, arrow/line, freedraw, text, image, eraser, frame, magicframe, embeddable, laser (`ToolType` union).
  - Editing layers: `StaticCanvas` + `NewElementCanvas` + `InteractiveCanvas`.
  - Welcome screen: `App.tsx` sets `showWelcomeScreen: true` when there are no elements; `LayerUI` renders `WelcomeScreen`.
- **Export and persistence integration**
  - JSON and image export dialogs in `LayerUI` (`JSONExportDialog`, `ImageExportDialog`).
  - Host interception: `ExcalidrawProps.onExport` supports async operations and progress toasts.
  - Host callbacks: `onChange` emitted after initialization (`App.tsx` gates with `!isLoading`).
- **Sharing**
  - Host app includes share dialogs and shareable link flows (`excalidraw-app/App.tsx` renders `ShareableLinkDialog` and `ShareDialog`).
- **Collaboration**
  - Editor UI toggles based on `isCollaborating`; remote pointers/selection derived from `appState.collaborators` in `InteractiveCanvas`.
  - Host app wiring includes collaboration session controls and collaboration-specific command palette items.
- **Library**
  - Sidebar library menu (`LibraryMenu`) can add items to library and insert stored elements into the canvas.
  - Command palette includes library commands (inserts distributed library items).
- **AI-adjacent diagram generation**
  - `TTDDialog` rendered from `LayerUI` when `appState.openDialog?.name === "ttd"`.
  - `MermaidToExcalidraw` implements auto-fix candidate exploration and inserts via parse/convert paths.

## Core User Flows

- **Empty canvas onboarding → draw**
  1. User loads editor embed.
  2. If there are no elements, `App.tsx` sets `showWelcomeScreen: true`.
  3. `LayerUI` renders `WelcomeScreen`.
  4. User selects a tool and interacts via pointer handlers in `InteractiveCanvas`.
- **Edit → undo/redo (via History/Store)**
  - Actions return `ActionResult` and include `captureUpdate`; `App.syncActionResult` schedules updates into `Store`, and undo/redo actions are registered from `actions/actionHistory`.
- **Export**
  1. User opens export via menus/dialog triggers (e.g. `openDialog: { name: "jsonExport" }` / `imageExport`).
  2. `LayerUI` conditionally renders `JSONExportDialog` / `ImageExportDialog`.
  3. Export can be intercepted by host via `ExcalidrawProps.onExport` and includes progress support.
- **Collaboration**
  1. Host sets `isCollaborating` and collaboration session is started in host app.
  2. Remote state updates populate `appState.collaborators`.
  3. `InteractiveCanvas` converts `appState.collaborators` into maps used by `renderInteractiveScene` for remote cursors/selections.
- **Text-to-Diagram / Mermaid conversion**
  1. User opens `TTDDialog` (via `TTDDialogTrigger` and `openDialog` state).
  2. User uses “text-to-diagram” or “mermaid” tab.
  3. `MermaidToExcalidraw` supports parsing and auto-fix candidate probing.
  4. User inserts result into the editor.
- **Library reuse**
  1. User opens library sidebar (`LibraryMenu`).
  2. User selects library item(s) and inserts distributed elements.
  3. Editor focuses container after insertion.

## Technical Constraints

- **Client-side rendering assumptions**
  - README instructs client rendering for SSR frameworks (disable SSR / SSR disabled dynamic import).
  - Editor uses `window` and DOM measurement (e.g. canvas mounting + `window.innerWidth/innerHeight` in `App.tsx` constructor).
- **Rendering performance constraints**
  - Static canvas uses `isRenderThrottlingEnabled()` and memoization keyed by `sceneNonce`, `scale`, `elementsMap`, `visibleElements`.
  - Interactive canvas uses an `AnimationController` loop keyed by `INTERACTIVE_SCENE_ANIMATION_KEY` and avoids rerenders on cursor move by design notes.
- **Synchronization/reconciliation constraints**
  - Element ordering/reconciliation uses `version`, `versionNonce`, and fractional `index` with explicit comments referencing collaboration and undo/redo ordering.

## Non-goals

- **No server-side rendering support**: the editor is expected to be rendered client-side (SSR workarounds are host responsibility).
- **No real-time peer-to-peer sync**: collaboration is not a P2P protocol; real-time sync (if any) is mediated by host-controlled backends/services.
- **No mobile-specific transform-handles parity guarantee**: mobile UX may intentionally differ (e.g., linear-element transform handles can be disabled via in-code HACK).
- **Stakeholder placeholder**: Define which enterprise requirements are explicitly out of scope (e.g., audit logging, SSO, admin roles).
- **Stakeholder placeholder**: Define which export/persistence guarantees are out of scope (e.g., deterministic SVG output across browser engines).

## Technical Deficiencies

- Interaction and event model inconsistencies
  - `App.tsx` contains TODO to unify touch vs pointer event handling and consolidate double-click logic.
  - `App.tsx` contains a HACK disabling transform handles for linear elements on mobile.
  - Tests note a TODO: memory leak if `pointer up` is not triggered (`packages/excalidraw/tests/selection.test.tsx`).
- Undo/redo and update capture edge cases
  - `packages/element/src/store.ts`: TODO “Suspicious … called so many places. Seems error-prone.”
  - `packages/element/src/delta.ts`: TODO `#7348` about potentially empty undo/redo due to assumptions around deleted element references (especially remote updates).
- Restore/import sync/versioning risk
  - `packages/excalidraw/data/restore.ts`: TODO about deleting empty text breaking sync/versioning when applying/exchanging deltas + restoring.
- Export regression risk
  - `packages/utils/tests/export.test.ts`: FIXME that `utils.exportToSvg` no longer filters out deleted elements; test is skipped.
- WYSIWYG update coupling
  - `packages/excalidraw/wysiwyg/textWysiwyg.tsx`: FIXME indicating update behavior is coupled to when Store emits `appState.theme`.

## Non-Functional Characteristics (if inferable)

- **Performance**
  - Viewport culling / “renderable elements” filtering is used in renderer (`Renderer` computes visible elements passed into canvas).
  - Render throttling and memoization used in static rendering.
- **Reliability**
  - Extensive teardown in `App.componentWillUnmount` and explicit gating to prevent overwriting host state during initialization (`componentDidUpdate` checks `!isLoading`).
  - Undo/redo capture is controlled by `captureUpdate` policy (`IMMEDIATELY` / `NEVER` / `EVENTUALLY`).

