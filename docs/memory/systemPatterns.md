# System Patterns

## Architecture pattern
- Monorepo with layered package boundaries:
  - App shell (`excalidraw-app`) orchestrates lifecycle, persistence, collab UX.
  - Core editor package (`packages/excalidraw`) manages state, rendering, actions.
  - Element/math/common packages provide deterministic primitives.

## State pattern
- Scene state is split into:
  - `elements` (canvas objects, including deleted/history-aware items).
  - `appState` (tooling/UI/session state).
  - `files` (binary assets, e.g. image blobs).
- Updates are driven by event handlers and Excalidraw API methods (`updateScene`, `addFiles`, etc.).

## Persistence/sync pattern
- Local persistence is handled through LocalData and browser storage checks.
- Multi-tab sync reconciles local app state with browser storage versions.
- Collaboration mode changes behavior (network sync and asset fetching paths differ).

## Recovery/import pattern
- Startup and hash change flows can import scene from:
  - Local storage
  - Backend share links
  - External URLs
- Data is restored through `restoreElements` and `restoreAppState` to normalize and repair bindings.

## Safety pattern
- Potentially expensive/risky operations are guarded through:
  - Debounced sync
  - Explicit unload/visibility handlers
  - Conditional capture modes to avoid polluting history in system updates

## Related Docs
- [Project Brief](./projectBrief.md)
- [Tech Context](./techContext.md)
- [Decision Log](./decisionLog.md)
- [Architecture](../technical/architecture.md)
- [Domain Glossary](../product/domain-glossary.md)
