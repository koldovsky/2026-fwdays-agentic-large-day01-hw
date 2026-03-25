# Progress

## Done
- Monorepo is set up with workspace builds for app, packages, and examples.
- Main app supports:
  - local drawing
  - realtime collaboration
  - encrypted shareable links
  - AI feature hooks
  - theme and language persistence
- Published package flow exists for `@excalidraw/{common,math,element,excalidraw}`.
- Quality gates are wired:
  - typecheck
  - ESLint
  - Prettier
  - Vitest
  - pre-commit lint-staged hooks
- This memory bank documentation set has been created under the required paths.

## In Progress
- AI capabilities appear actively integrated but depend on an external backend and rate limits.
- Collaboration correctness continues to depend on reconciliation heuristics, periodic full sync, and external service compatibility.
- Onboarding/docs debt is being addressed, but it is still vulnerable to drift because there was no existing `docs/` structure in the repo.

## Planned Or Likely Next Work
- Tighten and validate developer onboarding with external service prerequisites.
- Improve collaboration confidence with more multi-client test coverage.
- Revisit Firebase security assumptions and document operational expectations more formally.
- Continue evolving package-consumer docs and examples as the package export surface changes.

## Progress Assessment
- Core product functionality is mature.
- Operational/documentation maturity is lower than feature maturity.
- The biggest maintenance cost is not feature absence; it is the number of cross-cutting behaviors spanning browser storage, sockets, Firebase, and external services.

## Related Docs
- Product scope and requirement baseline: [../product/PRD.md](../product/PRD.md)
- Architectural surface area behind the current maturity assessment: [../technical/architecture.md](../technical/architecture.md)
- Setup and validation work still needed for contributor onboarding: [../technical/dev-setup.md](../technical/dev-setup.md)
- Behavior-level risks still likely to drive regressions: [decisionLog.md](decisionLog.md)