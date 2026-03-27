# Active Context

See [progress.md](./progress.md) for broader status and [hidden invariants](../technical/hidden-invariants.md) for risky source-grounded behavior notes.

## Current Focus
- Memory Bank now exists and is the primary durable context for the repo.
- The highest-value documentation gap is now contributor-facing setup for backend/env dependencies, not more architecture summary.

## Recent Changes
- Added the core Memory Bank files under `docs/memory-bank/`.
- Added the deep technical doc [hidden invariants](../technical/hidden-invariants.md) to capture behavior that is easy to miss during future edits.
- Added a repo-level `AGENTS.md` instructing future sessions to read all Memory Bank markdown files first.
- Audited `docs/memory-bank/` and removed obvious duplicate context so stable architecture stays in [systemPatterns.md](./systemPatterns.md) while deeper caveats live in [hidden invariants](../technical/hidden-invariants.md).
- Validated the `## Commands` section in [techContext.md](./techContext.md) against current root/app package scripts and corrected the `yarn test:app` label.

## Next Steps
- If this repo is actively customized beyond upstream Excalidraw, document those local deltas explicitly instead of relying on code discovery.
- Add a checked-in setup document or `.env.example` if contributors routinely need the app backends locally.
- Consider deeper technical docs for collaboration/persistence if those areas are expected to change soon.

## Open Questions
- This repo exposes many app env vars in code, but there is no canonical local setup document describing required values and services.
- It is unclear whether this checkout is meant to track upstream Excalidraw closely or serve as a long-lived custom fork.

## Active Decision Points
- Whether to keep backend/service setup implicit in code or document it explicitly for contributors.
- Whether collaboration and persistence need dedicated ADR-style docs beyond the summary kept in [decisinLog.md](./decisinLog.md).

## Validation Notes
- No test suite was run as part of this Memory Bank initialization; the task changed documentation only.
