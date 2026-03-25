# Implementation progress (verified from source code)

This file categorizes what appears implemented vs. partially implemented based on:
- Full, wired UI/component flows (dialogs rendered, actions reachable, data passed through)
- Explicit code markers: `TODO`, `FIXME`, `HACK`, `WORKAROUND`, and skipped/disabled tests

## Completed

- **Embeddable React editor component**
  - `@excalidraw/excalidraw` is exported as a React component (`packages/excalidraw/index.tsx`).
  - Integration assumptions are documented: import CSS and render into a container with non-zero height (`packages/excalidraw/README.md`).

- **Canvas rendering split: static vs interactive overlays**
  - `StaticCanvas` renders the scene via `renderStaticScene(...)` (`packages/excalidraw/components/canvases/StaticCanvas.tsx`).
  - `NewElementCanvas` renders in-progress element via `renderNewElementScene(...)` (`packages/excalidraw/components/canvases/NewElementCanvas.tsx`).
  - `InteractiveCanvas` renders interactive overlays and collaboration cursors via `renderInteractiveScene(...)` (`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`).

- **Editor core UI flows (tool selection + welcome screen)**
  - When there are no elements, the editor shows `showWelcomeScreen` and `LayerUI` renders `WelcomeScreen` (`packages/excalidraw/components/App.tsx`, `packages/excalidraw/components/LayerUI.tsx`).

- **Export to JSON and image**
  - `LayerUI` renders `JSONExportDialog` and `ImageExportDialog` based on `appState.openDialog?.name` (`packages/excalidraw/components/LayerUI.tsx`).
  - “Export to disk / share” entrypoints exist in UI actions (e.g. menu items open `jsonExport` / `imageExport`) (`packages/excalidraw/components/main-menu/DefaultItems.tsx`).

- **Command palette + search**
  - `CommandPalette` exists and is opened by `openDialog: { name: "commandPalette" }` (`packages/excalidraw/components/CommandPalette/CommandPalette.tsx`, `DefaultItems.tsx`).
  - Command palette wiring includes library insertion commands and collaboration/share commands in the host app (`excalidraw-app/App.tsx`).

- **Library UI and insertion**
  - `LibraryMenu` is a sidebar component with an insertion path (`onInsertLibraryItems`) calling `onInsertElements(...)` and then `app.focusContainer()` (`packages/excalidraw/components/LibraryMenu.tsx`).
  - Command palette includes “Library” commands (inserts distributed library items) (`CommandPalette.tsx` excerpt around `libraryItemsData.libraryItems`).

- **Collaboration UX (remote cursors/laser + user list)**
  - `LayerUI` shows `UserList` when `appState.collaborators.size > 0` and shows collaboration tool UI when `isCollaborating` is true (`packages/excalidraw/components/LayerUI.tsx`).
  - `InteractiveCanvas` consumes `props.appState.collaborators` to build render params for remote pointers/selections (`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`).
  - Host app wiring includes `ShareableLinkDialog`, collaboration session control, and collaboration-specific entries in `CommandPalette` (`excalidraw-app/App.tsx`).

- **Text-to-Diagram / Mermaid conversion**
  - `LayerUI` renders `TTDDialog` when `appState.openDialog?.name === "ttd"` (`packages/excalidraw/components/LayerUI.tsx`).
  - `TTDDialog` switches between “text-to-diagram” and “mermaid” tabs and renders `TextToDiagram` and `MermaidToExcalidraw` (`packages/excalidraw/components/TTDDialog/TTDDialog.tsx`).
  - `MermaidToExcalidraw` implements auto-fix candidate exploration and calls `parseMermaidToExcalidraw` on user insert/apply paths (`packages/excalidraw/components/TTDDialog/MermaidToExcalidraw.tsx`).

## In Progress

- **Touch vs pointer unification + double-click logic**
  - TODO explicitly calls this a “hack”: unify touch/pointer events and implement consistent double-click handling (`packages/excalidraw/components/App.tsx` around `lastPointerUpIsDoubleClick` comment).

- **Mobile-specific UX workaround**
  - HACK disables transform handles for linear elements on mobile until a better solution is found (`packages/excalidraw/components/App.tsx` around transform-handle gating).

- **Undo/redo + update capture correctness is actively being worked on**
  - `packages/element/src/store.ts`: TODO notes `scheduleCapture` is “suspicious” and “error-prone” because it’s called from many places.
  - `packages/element/src/delta.ts`: TODO `#7348` discusses possible empty undo/redo due to assumptions around deleted element references (especially for remote updates).

- **Restore/sync/versioning invariants**
  - `packages/excalidraw/data/restore.ts`: TODO states restoring may mark empty text elements deleted, which “breaks sync / versioning” for certain delta/restore exchange paths.

- **Export correctness regression / incomplete contract**
  - `packages/utils/tests/export.test.ts`: FIXME reports `exportToSvg` no longer filters out deleted elements; the “deleted elements” test is skipped (`it.skip`).

- **WYSIWYG update subscription coupling**
  - `packages/excalidraw/wysiwyg/textWysiwyg.tsx`: FIXME indicates behavior is tied to when Store starts emitting `appState.theme` updates.

- **Interaction lifecycle leak risk**
  - `packages/excalidraw/tests/selection.test.tsx`: TODO explicitly mentions a memory leak if `pointer up` is not triggered.

## Evidence

- Core flows (implemented, wired):
  - `packages/excalidraw/components/LayerUI.tsx` (export dialogs, welcome screen, TTDDialog rendering)
  - `packages/excalidraw/components/canvases/*` (renderStaticScene/renderInteractiveScene layers)
  - `packages/excalidraw/components/CommandPalette/CommandPalette.tsx` (openDialog wiring + commands)
  - `packages/excalidraw/components/LibraryMenu.tsx` (insertion path)
  - `packages/excalidraw/components/TTDDialog/*` (tabbed UI + Mermaid conversion)
  - `excalidraw-app/App.tsx` (ShareableLinkDialog + collaboration controls)

- In-progress indicators (explicit markers):
  - `packages/excalidraw/components/App.tsx` (`TODO` + `HACK`)
  - `packages/element/src/store.ts` (`TODO` on scheduleCapture)
  - `packages/element/src/delta.ts` (`TODO #7348`)
  - `packages/excalidraw/data/restore.ts` (`TODO`)
  - `packages/utils/tests/export.test.ts` (`FIXME` + `it.skip`)
  - `packages/excalidraw/wysiwyg/textWysiwyg.tsx` (`FIXME`)
  - `packages/excalidraw/tests/selection.test.tsx` (`TODO` about memory leak)

## Cross-doc Links

- For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
- For developer setup → see [docs/technical/dev-setup.md](../technical/dev-setup.md)
- For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
- For product requirements (PRD) → see [docs/product/PRD.md](../product/PRD.md)

