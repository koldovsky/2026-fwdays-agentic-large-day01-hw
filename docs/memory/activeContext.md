# Active Context

## Snapshot Date
- 2026-03-25

## What Is Currently Being Worked On
- This workspace now includes a reverse-engineered memory bank/documentation pass under `docs/*`.
- Observable product-level focus areas in the codebase:
  - AI-assisted workflows via Diagram-to-Code and TTD
  - embeddable package distribution and examples
  - offline/local persistence robustness
  - realtime collaboration stability and bandwidth control

## Current Priorities
- Keep the main web app and the published package aligned.
- Preserve local-first behavior while still supporting collaboration and share links.
- Avoid regressions in collaboration history and remote-update behavior.
- Maintain deployable static output for Vercel/Docker while depending on external runtime services.

## Known Blockers
- Collaboration server implementation is not in this repository.
- Share-link backend implementation is not in this repository.
- AI backend implementation is not in this repository.
- Production security posture for Firebase cannot be fully evaluated from this repo alone because the rules are permissive and rely on external assumptions.

## Open Questions
- Is permissive Firebase access intentionally acceptable for OSS deployment, or is tighter rule enforcement handled elsewhere?
- What compatibility guarantees exist between this frontend and the external collab server version?
- What SLAs or fallback UX exist for the AI backend when rate limits are hit?
- How far should Excalidraw+ hooks remain in OSS app flows versus being isolated?

## Working Assumptions
- Assumption: the current repo state is mid-workshop and not necessarily a release branch.
- If you see local changes in files such as `package.json`, `yarn.lock`, `.gitignore`, or `.cursorignore`, verify them against the current branch diff and CI status before treating them as authoritative product priorities.
- Assumption: current maintainers care about onboarding/documentation debt, because the PR template explicitly asks for these docs.

## Immediate Risks
- Documentation can drift quickly because the app, packages, and external services evolve independently.
- The collaboration model has several implicit behaviors that are easy to break with innocent refactors.

## Related Docs
- Product requirements and user-facing priorities: [../product/PRD.md](../product/PRD.md)
- Runtime structure and service boundaries: [../technical/architecture.md](../technical/architecture.md)
- Fragile runtime details and hidden constraints: [decisionLog.md](decisionLog.md)
- Local environment assumptions and external prerequisites: [../technical/dev-setup.md](../technical/dev-setup.md)