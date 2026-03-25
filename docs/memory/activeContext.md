# Active Context (Working Notes)

## Current focus
- Expand `docs/memory/techContext.md` to include:
  - technology stack and versions (verified from root + package manifests)
  - key repo commands (verified from `package.json` scripts)
- Update `docs/memory/decisionLog.md` to include “key design decisions” in addition to the existing findings.

## What I’m basing this on (verified sources)
- Root `package.json` scripts + devDependencies (tooling + versions)
- `excalidraw-app/package.json` dependencies/scripts (host app runtime deps)
- `packages/excalidraw/package.json` dependencies/scripts (embeddable editor runtime deps)
- `packages/excalidraw/components/App.tsx` for verified UX/state behaviors (welcome screen, web-share-target restore, plain paste mode)
- `excalidraw-app/collab/Portal.tsx` and `excalidraw-app/data/firebase.ts` for verified collaboration/persistence boundaries

