# Active Context

## Current development focus

The immediate focus is onboarding and repository understanding, with emphasis on documenting stable project memory for future development sessions.

Current priority areas:

1. Build and maintain a practical Memory Bank in `docs/memory/`.
2. Capture architecture and state-management understanding of `packages/excalidraw`.
3. Keep runnable workflow knowledge explicit (install, build, run, test).

## What has been established in this session

- Project-level brief created (`projectbrief.md`).
- Technical stack and command context documented (`techContext.md`).
- Architecture and key implementation patterns documented (`systemPatterns.md`).
- Product and UX intent documented (`productContext.md`).
- Build and run flow validated in this environment using Corepack Yarn.

## Active assumptions

- This is an Excalidraw monorepo with the main app in `excalidraw-app/`.
- Core editor behavior is centered in `packages/excalidraw/components/App.tsx`.
- Development commands should prefer `corepack yarn ...` in this machine context.
- Collaboration and cloud persistence rely on external services (Socket.io backend and Firebase), not a dedicated in-repo API server.

## Immediate next-step focus (recommended)

- Keep Memory Bank files synchronized with code-level reality as understanding evolves.
- Add targeted deep dives when needed (for example: collaboration flow, persistence flow, rendering pipeline, or action system).
- When implementation work starts, align changes to documented system patterns to avoid architecture drift.

## Risks and watchouts

- Tooling/version warnings may appear in local runs (for example TypeScript-eslint support matrix warnings); they should be tracked but not confused with runtime failures.
- Given the size of `App.tsx`, changes should be scoped carefully to avoid regressions in lifecycle-heavy and side-effect-heavy paths.
- Collaboration-related behavior depends on integration boundaries outside this repository; local behavior may differ from production setups.

## Definition of done for current context phase

- Memory Bank contains a coherent baseline of:
  - product purpose and UX goals,
  - technical context and commands,
  - architecture patterns,
  - current active focus.
- Team can resume work quickly from these documents without re-discovering fundamentals.

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
