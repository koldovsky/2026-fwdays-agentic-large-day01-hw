# Project Brief: Excalidraw Monorepo (Verified Memory)

## Purpose (as evidenced in repo)
- This repository is configured as a Yarn workspace monorepo with workspaces:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*` (from the root `package.json`)
- `excalidraw-app/` contains the hosted application package, with scripts that start/build a Vite app.
- `packages/excalidraw/` publishes the editor as an embeddable React component:
  - package metadata describes it as "Excalidraw as a React component" (`packages/excalidraw/package.json`)
  - the public component entrypoint is `packages/excalidraw/index.tsx` (exports `Excalidraw`).

## Primary goals / capabilities (from code & package metadata)
- Embeddable editor component
  - `packages/excalidraw/index.tsx` wraps the internal editor `<App />` with:
    - `EditorJotaiProvider`
    - `InitializeApp`
  - The wrapper exposes an imperative API via React contexts (`ExcalidrawAPIContext`, `ExcalidrawAPISetContext`).
- Internal editor orchestration ("engine") lives in `packages/excalidraw/components/App.tsx`
  - The editor engine constructs and owns:
    - `Scene`
    - `Store`
    - `History`
    - `ActionManager`
  - It also owns the React `AppState` instance (`this.state`).
- Action-driven mutation pipeline
  - The editor creates `ActionManager` with `this.syncActionResult` as the handler for action results.
  - `syncActionResult` applies action results to:
    - scene elements (`this.scene.replaceAllElements(...)`)
    - store/history capture (`this.store.scheduleAction(...)`)
    - React `this.state` (via `this.setState(...)`)
    - renderer updates (via `this.scene.triggerUpdate()` when needed).
- Collaboration and persistence in the hosted app (`excalidraw-app`)
  - `excalidraw-app/package.json` includes:
    - `socket.io-client`
    - `firebase`
  - `excalidraw-app/data/firebase.ts`:
    - initializes Firebase (`initializeApp`)
    - uses Firestore (`getFirestore`, `doc`, `runTransaction`)
    - uses Storage (`getStorage`, `uploadBytes`)
    - encrypts elements with a `roomKey` (`encryptData` / `decryptData`)
  - `excalidraw-app/collab/Portal.tsx`:
    - receives a `socket` and `roomId`/`roomKey`
    - encrypts outbound socket payloads with `encryptData`
    - emits updates through the socket.

## Export/serialization surface (what the component exposes)
- `packages/excalidraw/index.tsx` re-exports export and serialization helpers, including:
  - `exportToCanvas`, `exportToBlob`, `exportToSvg`, `exportToClipboard`
  - `serializeAsJSON`, `serializeLibraryAsJSON`
  - blob loading helpers such as `loadFromBlob` / `loadSceneOrLibraryFromBlob`

## Key stack elements (verified from dependencies/imports)
- TypeScript + Vite + Yarn workspaces (root `package.json` and package metadata)
- React (used by `packages/excalidraw/index.tsx` and React dependency in app package)
- Jotai for UI state management (used by `EditorJotaiProvider` and imported from `./editor-jotai`)
- roughjs-based rendering for "hand-drawn" canvas appearance
  - `packages/excalidraw/components/App.tsx` imports `roughjs/bin/rough` and initializes it via `rough.canvas(...)`.

## What to read first (code entrypoints)
- Component entrypoint: `packages/excalidraw/index.tsx`
- Editor engine: `packages/excalidraw/components/App.tsx`
- Hosted app collaboration/persistence integration:
  - `excalidraw-app/collab/Portal.tsx`
  - `excalidraw-app/data/firebase.ts`



## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md

## Related Documentation
- [`../product/PRD.md`](../product/PRD.md)
- [`../product/domain-glossary.md`](../product/domain-glossary.md)
- [`../technical/architecture.md`](../technical/architecture.md)
- [`../technical/dev-setup.md`](../technical/dev-setup.md)
- [`../technical/code-notes.md`](../technical/code-notes.md)