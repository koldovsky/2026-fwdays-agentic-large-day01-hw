# Progress

See [activeContext.md](./activeContext.md) for the current session state.

## Done
- Core editor packages and the reference app are already present; architecture details live in [systemPatterns.md](./systemPatterns.md) and user-facing workflows in [productContext.md](./productContext.md).
- Memory Bank has now been initialized and linked into repo startup instructions.
- The command inventory in [techContext.md](./techContext.md) has been checked against current `package.json` scripts and Docker config.
- Added source-grounded architecture reference in [architecture.md](../technical/architecture.md) with high-level structure, data/state/rendering flow, and package dependency mapping.
- Added deep package-level architecture documentation in [packages-architecture.md](../technical/packages-architecture.md), focused on `packages/*` boundaries, flows, and build/runtime coupling.
- Expanded [hidden-invariants.md](../technical/hidden-invariants.md) with package-level invariants for lifecycle events, increment subscriptions, store observation scope, fractional-index sync behavior, and utility export normalization.
- Added full contributor onboarding guide in [dev-setup.md](../technical/dev-setup.md) from clone to first PR, including CI/local-check mapping and current PR workflow constraints.
- Added foundational product docs under `docs/product/`: [README](../product/README.md), [baseline PRD](../product/PRD.md), [feature catalog](../product/feature-catalog.md), [domain glossary](../product/domain-glossary.md), and [UX patterns](../product/ux-patterns.md).
- Reduced Memory Bank duplication versus deep technical/product docs by compacting context files and keeping link-first references.

## In Progress
- Validate and refine service-specific setup details in the new onboarding guide as backend assumptions evolve.

## Remaining
- Document repo-specific divergences if this checkout intentionally differs from upstream Excalidraw.
- Expand ADR depth if future work is expected in collaboration, persistence, or import/export internals.
- Validate product doc assumptions with maintainers (especially advanced-feature status and required vs optional service dependencies).

## Known Issues
- The codebase contains legacy migration paths and TODO/FIXME hotspots around restore, store/delta behavior, and editor edge cases.
- Some advanced app features cannot be fully exercised without external services.

## Risks
- Highest-risk edit zones are summarized in [hidden invariants](../technical/hidden-invariants.md); the main ones are restore/reconcile, store capture modes/observation scope, fractional index repair/sync, collaboration sync, and image/file persistence.
