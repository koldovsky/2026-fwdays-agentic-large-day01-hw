# Active Context

Captures the active development context and working state of the Excalidraw project.

## Now
- Project mode: active maintenance and incremental evolution of a Yarn-workspaces monorepo.
- Primary focus: preserve editor performance and correctness in scene rendering, state capture, and undo/redo history.
- Stability focus: protect collaboration and persistence pathways (Socket.IO + Firebase + encrypted payload handling + local-first storage).

## Next
- Keep host app and reusable editor boundaries explicit:
  - app runtime and integration in `excalidraw-app/`
  - reusable editor API/runtime in `packages/excalidraw/`
- Guard critical runtime paths during changes:
  - scene/store/history update pipeline
  - viewport-aware render path
  - local persistence and file lifecycle
  - remote reconciliation and collab sync
- Maintain compatibility with build/test/release automation across the monorepo.

## Risks
- Regressions in undo/redo behavior when modifying capture/update flow.
- Performance regressions from render-path changes affecting visible-element filtering.
- Collaboration data divergence or payload handling issues when changing sync/encryption logic.
- Build or CI breakage from cross-workspace dependency/config changes.

## Open Questions
- Which runtime area is currently the highest-priority workstream: rendering, history/store, persistence, or collaboration?
- Are there active known regressions that should be tracked here as first-class context items?
- Should this file include an explicit per-sprint focus and date-stamped status updates?

## Owners
- Product/web app surface: `excalidraw-app/` maintainers.
- Editor runtime/API surface: `packages/excalidraw/` maintainers.
- Shared primitives and math/element logic: `packages/common/`, `packages/element/`, `packages/math/`, `packages/utils/` maintainers.
- Delivery and infra pathways: tooling/CI/release maintainers (root scripts, Docker, Firebase, workflow config).

## References
- Project framing: `docs/memory/projectbrief.md`
- Architecture patterns: `docs/memory/systemPatterns.md`
- Stack/tooling details: `docs/memory/techContext.md`
- Architectural decisions: `docs/memory/decisionLog.md`
