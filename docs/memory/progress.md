# Progress

## Current Maturity Snapshot

- The monorepo structure is already established and usable.
- The reusable package `@excalidraw/excalidraw` is versioned at `0.18.0`.
- The hosted app is a separate workspace with its own build/start scripts.
- Root-level validation commands already exist for typecheck, lint, prettier, and tests.

## Capability Areas Present In Code

### Editor Core

- editor shell and public component export
- command/action execution
- scene ownership
- rendering pipeline
- store increments and deltas
- undo/redo history

### Hosted Product Shell

- welcome and sidebar UI
- sharing dialog flows
- collaboration trigger and state
- local persistence
- PWA registration

### Advanced Flows

- text-to-diagram dialog
- streamed AI response handling
- IndexedDB persistence for TTD chat history

## Evidence Of Delivery

- Recent history shows five commits on `master`.
- A large earlier commit added:
  - `Collab`
  - `Portal`
  - `AI.tsx`
  - `TTDStorage.ts`
  - the full `packages/excalidraw/components/TTDDialog/*` subsystem

## Documentation Status

- Existing docs already cover architecture and product/domain context.
- This Memory Bank extends that baseline with:
  - product context
  - active context
  - progress tracking
  - decision log
  - developer onboarding

## Remaining Doc Gaps

- There is still no root `README.md` for first-time contributors.
- Local setup for external companion services is implied by env files, but not fully documented in the repo.
- Package-to-package dependency rationale is visible in code and scripts, but not summarized in one short contributor page.

## Sources

- `package.json`
- `excalidraw-app/package.json`
- `packages/excalidraw/package.json`
- `git log --oneline -5`
- `git log --stat -3 -- packages/excalidraw/components/TTDDialog excalidraw-app/components/AI.tsx excalidraw-app/data/TTDStorage.ts excalidraw-app/collab/Collab.tsx excalidraw-app/collab/Portal.tsx`
