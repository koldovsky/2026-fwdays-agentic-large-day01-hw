# Long Feature Trace Map

Expanded (still non-exhaustive) pointers for deeper audits:

## Core editor package

- Rendering core: `packages/excalidraw/components/App.tsx`, `components/canvases/*`, `renderer/*`
- Actions: `packages/excalidraw/actions/*.ts(x)`
- UI composition: `packages/excalidraw/components/LayerUI.tsx`
- Dialog surfaces: `packages/excalidraw/components/*Dialog*.tsx`
- Library model: `packages/excalidraw/data/library.ts`
- Data/crypto: `packages/excalidraw/data/encode.ts`, `data/encryption.ts`

## Hosted app layer

- Collaboration orchestration: `excalidraw-app/collab/*`
- Sharing/storage adapters: `excalidraw-app/data/index.ts`, `data/firebase.ts`, `data/localStorage.ts`
- Boot/runtime shell: `excalidraw-app/App.tsx`, `index.tsx`
- PWA/build strategy: `excalidraw-app/vite.config.mts`
- Hosted integrations: `excalidraw-app/components/AI.tsx`, `components/DebugCanvas.tsx`, Plus-related modules

## Review usage guidance

Use this map with `docs/product/PRD.md` sections 3 and 7 for feature verification and implementation audits.
