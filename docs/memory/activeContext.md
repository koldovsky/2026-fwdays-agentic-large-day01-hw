# Active Context

## Current focus

- Repository exploration and architecture mapping for documentation.
- Capturing verified project context in `docs/memory/*` and `docs/technical/architecture.md`.
- Keeping generated artifacts out of AI context/indexing (`.cursorignore` updates were discussed).

## What appears to be active in working tree

- Modified: `yarn.lock`
- Untracked: `.cursorignore`
- Untracked: `repomix-output.xml`
- New docs: `docs/memory/*`, `docs/technical/architecture.md`, `docs/technical/dev-setup.md`

## Why this matters now

- The project is large; memory-bank files reduce onboarding cost and repeated rediscovery.
- Current chat activity indicates focus on:
  - understanding architecture,
  - identifying generated artifacts,
  - preparing codebase context for agent workflows.

## Extension opportunities

- Add module-level memory pages:
  - `packages/excalidraw/components/`
  - `packages/excalidraw/actions/`
  - `packages/excalidraw/data/`
- Add runbook files:
  - local debug workflow,
  - release workflow,
  - common troubleshooting scenarios.
- Extend architecture docs if needed (e.g. `excalidraw-app` collab layer).

## Suggested next steps

- Verify and commit `docs/memory/*` and `docs/technical/*` when content is approved.
- Decide final `.cursorignore` policy for generated outputs.
- Optionally split memory files by domain owner (app/runtime/package/integration/release).
- Optionally add a root `docs/README.md` linking to `docs/memory/` and `docs/technical/`.

## Source verification

- `git status --short --branch` output (working tree state).
- Current repository files analyzed in this session:
  - root `package.json`,
  - `excalidraw-app/package.json`,
  - `packages/excalidraw/*`.

---

## Related documentation

**Technical** (`docs/technical/`)

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)

**Product** (`docs/product/`)

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)
