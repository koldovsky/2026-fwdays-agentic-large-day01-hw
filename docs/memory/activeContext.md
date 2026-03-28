# Active Context

## Current Working State

- Current branch: `master`
- Current visible unrelated local modification: `.cursorignore`
- Existing documentation already includes:
  - `docs/product/*`
  - `docs/technical/architecture.md`
  - older memory notes in `docs/memory/`

## Current Focus In The Codebase

- The repo centers on one main split:
  - reusable editor logic in `packages/*`
  - hosted product shell in `excalidraw-app`
- The runtime core is concentrated in `packages/excalidraw/components/App.tsx`, which constructs:
  - `ActionManager`
  - `Scene`
  - `Renderer`
  - `Store`
  - `History`
- The host shell focus is visible in `excalidraw-app/App.tsx`, which integrates:
  - collaboration UI
  - sharing dialogs
  - welcome flows
  - AI / TTD flows
  - sidebar and product chrome

## Feature Areas That Look Most Active

- Collaboration:
  - `Collab` exposes atoms and creates `Portal`
- AI text-to-diagram:
  - `AI.tsx` mounts `TTDDialog`
  - `TTDStreamFetch` handles streamed responses
  - `TTDIndexedDBAdapter` persists chats

## Practical Guidance For Contributors

- Treat `packages/excalidraw` as the editor application layer for reusable embedding.
- Treat `excalidraw-app` as the product integration shell.
- Treat `packages/element` as the source of truth for scene/state-delta mechanics.
- When documenting behavior, prefer manifests, entry points, and package internals over assumptions from folder names.

## Sources

- `git status --short`
- `git log --oneline -5`
- `packages/excalidraw/components/App.tsx`
- `excalidraw-app/App.tsx`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/collab/Portal.tsx`
- `excalidraw-app/components/AI.tsx`
- `excalidraw-app/data/TTDStorage.ts`
