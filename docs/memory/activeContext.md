# Active context

## Related documentation

Deep product and technical write-ups live under:

- [`docs/product/PRD.md`](../product/PRD.md) — product requirements
- [`docs/product/domain-glossary.md`](../product/domain-glossary.md) — domain terms aligned with code
- [`docs/technical/architecture.md`](../technical/architecture.md) — architecture
- [`docs/technical/dev-setup.md`](../technical/dev-setup.md) — local development setup
- [`docs/technical/decisionLog.md`](../technical/decisionLog.md) — fragile / undocumented behavior and code markers

## What “current focus” means in this repo

There is **no** checked-in artifact (no `ROADMAP.md`, ticket IDs, or “active sprint” doc) that defines team focus. This file therefore states:

1. **Verified working-tree signals** from git (point in time of last update to Memory Bank).
2. **Evergreen engineering hotspots** implied by module layout and failing-safe development practices.

## Repository state (verified via git)

> **Snapshot timestamp:** 2026-03-25 18:35:54 +0200 — commit `4888f1e` ("Add cursor docs").
> Facts below reflect the working tree at that moment. Re-run `git status -sb` to verify current state.

- **Branch:** `master` tracking `origin/master` (as reported by `git status -sb` during Memory Bank authoring).
- **Dirty / modified areas (examples):**
  - Numerous **Vitest snapshot** files under `packages/excalidraw/tests/**` and related packages.
  - **Font registration** files: `packages/excalidraw/fonts/ComicShanns/index.ts`, `Excalifont/index.ts`, `Xiaolai/index.ts`.
  - `packages/excalidraw/locales/percentages.json`.
  - `yarn.lock`.
- **Untracked:** `docs/` (Memory Bank tree), `.cursorignore`, `repomix-compressed.txt` (per status snapshot).

**Interpretation for contributors:** Local changes cluster around **test snapshots**, **font packaging**, **locale coverage metadata**, and **lockfile** — typical of running/updating tests or dependency installs. _Re-run `yarn test:app` / `yarn test:all` before merging._

_Source:_ `git status -sb` + `git log` (commit `4888f1eefa6eb8593cea61b8809fcc82e88e2bca`).

## Product surface “in focus” by code mass (not priority)

These areas have substantial dedicated modules and are likely touch points for any active feature work:

- **Real-time collaboration:** `excalidraw-app/collab/` (`Collab.tsx`, `Portal.tsx`, `CollabError.tsx`).
- **Cloud / share:** `excalidraw-app/data/firebase.ts`, `ShareableLinkDialog`, encryption utilities imported by collab.
- **AI / text-to-diagram:** TTD dialog stack (`packages/excalidraw/components/TTDDialog/*`), chat storage key in `app_constants.ts`.
- **Core editor:** `packages/excalidraw/components/App.tsx` (very large orchestration surface), `actions/*`, `scene/*`, `renderer/*`.

_Sources:_ directory listings; import graph from `excalidraw-app/collab/Collab.tsx` and `packages/excalidraw/index.tsx`.

## Tooling focus for this workspace

- **Dev server:** Vite in `excalidraw-app` with **monorepo aliases** to `packages/*/src` (not only `dist`).
- **CI:** Docker image build workflow triggers on pushes to **`release`** branch only.

_Sources:_ `excalidraw-app/vite.config.mts`; `.github/workflows/build-docker.yml`.

## How to refresh this file

Replace the **Repository state** section after meaningful local work (merge, rebase, new homework phase) using `git status` / `git log`. Do not treat this file as authoritative project management unless you add external links or dates explicitly.
