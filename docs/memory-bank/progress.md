# Progress

See [activeContext.md](./activeContext.md) for the current session state.

## Done
- Core editor packages and the reference app are already present; architecture details live in [systemPatterns.md](./systemPatterns.md) and user-facing workflows in [productContext.md](./productContext.md).
- Memory Bank has now been initialized and linked into repo startup instructions.
- The command inventory in [techContext.md](./techContext.md) has been checked against current `package.json` scripts and Docker config.

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
- Highest-risk edit zones are summarized in [hidden invariants](../technical/hidden-invariants.md); the main ones are restore/reconcile, store capture modes, collaboration sync, and image/file persistence.
