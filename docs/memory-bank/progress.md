# Progress

See [activeContext.md](./activeContext.md) for the current session state.

## Done
- Core editor packages and the reference app are already present; architecture details live in [systemPatterns.md](./systemPatterns.md) and user-facing workflows in [productContext.md](./productContext.md).
- Memory Bank has now been initialized and linked into repo startup instructions.
- The command inventory in [techContext.md](./techContext.md) has been checked against current `package.json` scripts and Docker config.
- Added source-grounded architecture reference in [architecture.md](../technical/architecture.md) with high-level structure, data/state/rendering flow, and package dependency mapping.
- Added deep package-level architecture documentation in [packages-architecture.md](../technical/packages-architecture.md), focused on `packages/*` boundaries, flows, and build/runtime coupling.
- Expanded [hidden-invariants.md](../technical/hidden-invariants.md) with package-level invariants for lifecycle events, increment subscriptions, store observation scope, fractional-index sync behavior, and utility export normalization.

## In Progress
- Backend/service setup is still inferred from source code rather than a checked-in setup guide.

## Remaining
- Add canonical contributor-facing setup docs for required app services and env vars.
- Document repo-specific divergences if this checkout intentionally differs from upstream Excalidraw.
- Expand ADR depth if future work is expected in collaboration, persistence, or import/export internals.

## Known Issues
- The codebase contains legacy migration paths and TODO/FIXME hotspots around restore, store/delta behavior, and editor edge cases.
- Some advanced app features cannot be fully exercised without external services.

## Risks
- Highest-risk edit zones are summarized in [hidden invariants](../technical/hidden-invariants.md); the main ones are restore/reconcile, store capture modes/observation scope, fractional index repair/sync, collaboration sync, and image/file persistence.
