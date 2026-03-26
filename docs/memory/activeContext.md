# Active Context

> Last updated: 2026-03-26 (session 9)
> Related: [progress.md](progress.md) | [decisionLog.md](decisionLog.md) | [PRD](../product/PRD.md) | [architecture](../technical/architecture.md) | [undocumented-behavior](../technical/undocumented-behavior.md)

## Current focus

Workshop PR open; review follow-up fixes applied. Awaiting further review or implementation direction.

## What was just done

Session 9 — doc precision fixes (proper noun capitalisation, feature-flag fact, progress placeholders). All findings verified against source before fixing.

- `docs/memory/activeContext.md` — `markdown` → `Markdown` (proper noun); replaced broad feature-flag claim with source-verified statement referencing `packages/common/src/utils.ts:1282` (commit `37fa37f`)
- `docs/memory/progress.md` — replaced `*(nothing actively in progress)*` and `*(nothing blocked)*` placeholders with timestamped factual entries (commit `37fa37f`)

## Active decisions

- `docs/memory/` files are capped at ~200 lines — they are loaded every session; keep them scannable, not exhaustive.
- `docs/memory/decisionLog.md` holds only 6 undocumented-behavior entries (active findings); pre-2026 architectural decisions are in `docs/technical/decisionLog-archive.md`.
- `docs/technical/` and `docs/product/` files are reference docs — longer is fine, depth over brevity.
- All docs are facts-only, source-verified — no assumptions or inferred behavior without a cited file/line.
- Memory Bank files cross-reference each other via relative Markdown links, not plain text.

## In progress (not finished)

- **Workshop PR** — open; review follow-up fixes applied (commit `90d52b7`); awaiting review outcome.
- **Implementation work** — not yet started; awaiting direction after PR review.

## Known issues & open questions

*Issues*:
- `docs/memory/techContext.md` and `systemPatterns.md` were modified by the user after creation (cross-reference links added at top) — treat user edits as authoritative, do not overwrite.
- `frame.test.tsx` FIXME: frame detection passes in browser, fails in jsdom — root cause unknown, do not attempt to fix without more context.
- Arrow label version-bump test (`textWysiwyg.test.tsx:335`) is non-deterministically flaky — do not mark as fixed without a reproducible root cause.
- `fixBindingsAfterDuplication()` uses `Object.assign` bypassing `mutateElement()` — latent collaboration bug: binding ref updates on duplicated elements may not propagate to remote clients (version not bumped). See `decisionLog.md` — Object.assign binding bypass entry.

*Questions* (also tracked in [docs/product/PRD.md](../product/PRD.md) Open Questions):
- Q-1: Minimum supported browser version — check `excalidraw-app/vite.config.ts` `build.target` — Owner: Engineering Lead.
- Q-2: Maximum acceptable gzipped bundle size for `@excalidraw/excalidraw` — Owner: Engineering Lead.
- Q-3: Collaboration server encryption — Owner: Infrastructure.
- Q-4: PRD scope — reverse-engineered vs. new work — Owner: Workshop Facilitator/PM.

## Next steps

1. ✓ `.cursorignore` created (copied from `.claudeignore`) — committed `ad88a75`.
2. ✓ Doc audit pass complete — all reference docs corrected against source.
3. ✓ Workshop PR opened; review follow-up fixes applied (commit `90d52b7`).
4. Identify the first implementation task — needs user direction after PR review; no feature code changed yet.
5. Run `yarn test:all` to establish a clean baseline before any code changes.

## Context that expires

- `yarn.lock` has an unstaged modification (last observed: 2026-03-26) — check before running `yarn install` or adding dependencies; root cause not yet investigated.
- Feature flag system exists at `packages/common/src/utils.ts:1282` (`FEATURE_FLAGS` type, `getFeatureFlag`/`setFeatureFlag`); one defined flag: `COMPLEX_BINDINGS: false` (disabled by default). No `tempWorkaround`, `WORKAROUND`, or `isWorkaroundActive` identifiers found in `.ts`/`.tsx` files (searched 2026-03-26).
