# Domain Glossary

## Excalidraw
- Definition: core drawing editor experience and package exported as a React component.
- Used in: `packages/excalidraw`, `excalidraw-app`.
- Do not confuse with: only the demo app; it is also a reusable package.

## Scene
- Definition: logical drawing state containing elements plus related app state context.
- Used in: `excalidraw-app/App.tsx`, `packages/excalidraw/data/*`.
- Do not confuse with: browser DOM scene graph; this is Excalidraw domain state.

## Element
- Definition: drawable object on canvas (shape, text, arrow, frame, etc.).
- Used in: `packages/element/*`, `packages/excalidraw/types.ts`.
- Do not confuse with: DOM element.

## AppState
- Definition: editor/UI/session state (tool, theme, selection details, view settings).
- Used in: `packages/excalidraw/appState.ts`, `packages/excalidraw/types.ts`.
- Do not confuse with: generic React app state in unrelated apps.

## BinaryFiles
- Definition: file map for scene-linked binary assets (for example image resources).
- Used in: `packages/excalidraw/types.ts`, `excalidraw-app/App.tsx`.
- Do not confuse with: arbitrary filesystem files outside scene context.

## Collaboration
- Definition: multi-user session behavior synchronized through collaboration APIs.
- Used in: `excalidraw-app/collab/*`, `excalidraw-app/App.tsx`.
- Do not confuse with: simple share links (collab implies live session behaviors).

## Library
- Definition: reusable set of drawing items that can be stored/loaded and inserted into scenes.
- Used in: `packages/excalidraw/data/library.ts`, app library handlers.
- Do not confuse with: npm package libraries.

## Restore/Reconcile
- Definition: normalization and merge logic applied to loaded/imported/collab scene data.
- Used in: `packages/excalidraw/data/restore.ts`, `data/reconcile` usage in app init.
- Do not confuse with: browser refresh/restore operations.

## Related Docs
- [PRD](./PRD.md)
- [Architecture](../technical/architecture.md)
- [Memory Product Context](../memory/productContext.md)
