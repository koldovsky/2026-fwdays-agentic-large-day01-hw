# Project Brief: Excalidraw Monorepo (Verified Memory)

## Summary
- Repository-level product and architecture overview based on verified code and package metadata.
- Defines the high-level purpose, capabilities, and reading entrypoints.

## Current State

- The repository is a Yarn workspace monorepo with workspaces:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`
- `excalidraw-app/` contains the hosted application and its Vite-based run/build scripts.
- `packages/excalidraw/` publishes Excalidraw as an embeddable React component.
  - Package metadata describes it as "Excalidraw as a React component" in `packages/excalidraw/package.json`.
  - The public component entry point is `packages/excalidraw/index.tsx` (exports `Excalidraw`).

- Embeddable editor component:
  - `packages/excalidraw/index.tsx` wraps internal `<App />` with `EditorJotaiProvider` and `InitializeApp`.
  - It exposes an imperative API through `ExcalidrawAPIContext` and `ExcalidrawAPISetContext`.
- Internal editor orchestration:
  - Core engine logic is in `packages/excalidraw/components/App.tsx`.
  - The engine constructs and owns `Scene`, `Store`, `History`, and `ActionManager`.
  - It also owns React `AppState` (`this.state`).
- Action-driven mutation pipeline:
  - `ActionManager` is created with `this.syncActionResult` as the action result handler.
  - `syncActionResult` applies updates to:
    - scene elements via `this.scene.replaceAllElements(...)`
    - store/history via `this.store.scheduleAction(...)`
    - React state via `this.setState(...)`
    - renderer updates via `this.scene.triggerUpdate()` when needed
- Collaboration and persistence in `excalidraw-app`:
  - `excalidraw-app/package.json` includes `socket.io-client` and `firebase`.
  - `excalidraw-app/data/firebase.ts` initializes Firebase and uses Firestore, Storage, and encryption helpers (`encryptData` and `decryptData`) with a `roomKey`.
  - `excalidraw-app/collab/Portal.tsx` accepts `socket`, `roomId`, and `roomKey`; encrypts outbound payloads; and emits socket updates.

### Export and Serialization Surface

- `packages/excalidraw/index.tsx` re-exports:
  - export helpers: `exportToCanvas`, `exportToBlob`, `exportToSvg`, `exportToClipboard`
  - serialization helpers: `serializeAsJSON`, `serializeLibraryAsJSON`
  - blob loading helpers: `loadFromBlob`, `loadSceneOrLibraryFromBlob`

- TypeScript, Vite, and Yarn workspaces (root/package metadata)
- React (component entry and hosted app dependency)
- Jotai for editor UI state (`EditorJotaiProvider` and `./editor-jotai`)
- roughjs-based "hand-drawn" canvas rendering
  - `packages/excalidraw/components/App.tsx` imports `roughjs/bin/rough` and initializes with `rough.canvas(...)`

## Actions

- Component entry point: `packages/excalidraw/index.tsx`
- Editor engine: `packages/excalidraw/components/App.tsx`
- Hosted app collaboration and persistence:
  - `excalidraw-app/collab/Portal.tsx`
  - `excalidraw-app/data/firebase.ts`

## Source Checkpoints
- `package.json`
- `packages/excalidraw/package.json`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/components/App.tsx`
- `excalidraw-app/package.json`
- `excalidraw-app/collab/Portal.tsx`
- `excalidraw-app/data/firebase.ts`

## Related Documentation

- [`../product/PRD.md`](../product/PRD.md)
- [`../product/domain-glossary.md`](../product/domain-glossary.md)
- [`../technical/architecture.md`](../technical/architecture.md)
- [`../technical/dev-setup.md`](../technical/dev-setup.md)
- [`../technical/code-notes.md`](../technical/code-notes.md)