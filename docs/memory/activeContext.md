> Last updated: 2026-03-26 (session 6)
> Related: [progress.md](progress.md) | [decisionLog.md](decisionLog.md) | [PRD](../product/PRD.md) | [architecture](../technical/architecture.md) | [undocumented-behavior](../technical/undocumented-behavior.md)

## Current focus

Doc audit pass complete — all reference docs corrected against source. Ready to open Workshop PR.

## What was just done

Full audit and correction of all docs/memory/ and reference docs. Every finding was verified against source before fixing. Changes made:

- `docs/memory/activeContext.md` — marked `.cursorignore` step as done (commit `ad88a75`)
- `docs/memory/decisionLog.md` — added missing H1; split into active (158 lines, 6 undocumented-behavior entries) + archive
- `docs/technical/decisionLog-archive.md` — created; holds 11 pre-2026 architectural + policy decisions (259 lines)
- `CLAUDE.md` — updated two `decisionLog` references to point to archive for pre-2026 entries
- `docs/product/domain-glossary.md` — ExcalidrawElement entry: added note on 6 missing fields (`seed`, `strokeWidth`, `strokeStyle`, `roundness`, `link`, `customData`) with reference to `_ExcalidrawElementBase` at `packages/element/src/types.ts:40`
- `docs/product/PRD.md` — trimmed 324→233 lines: extracted Technical considerations to `prd-technical-notes.md`, Launch plan to `launch-plan.md`; added 4 mandated sections (Product Purpose, Target Audience, Key Features, Technical constraints / Non-goals)
- `docs/technical/prd-technical-notes.md` — created; known constraints, Q-1–Q-3, dependency table
- `docs/product/launch-plan.md` — created; full phase gates, launch checklist, comm plan
- `docs/technical/architecture.md` — "Four layers" → "Five layers" (line 204); ShapeCache description corrected: keyed by element object reference not id, value type is `{ shape: ElementShape; theme: AppState["theme"] }` not `{ shape: Drawable, version: number }`
- `docs/technical/dev-setup.md` — H1 moved to line 1 (MD041); 3 bare fences tagged `text` (MD040); hardcoded upstream GitHub URL replaced with `<your-username>/<your-fork-repo>` placeholder
- `docs/technical/undocumented-behavior.md` — flushSync count corrected: 14 in App.tsx (not 15), 2 in ConfirmDialog.tsx, 1 in UnlockPopup.tsx; mutateElement ShapeCache.delete trigger fields corrected: only `height`, `width`, `fileId`, `points` (not `x`, `y`, `angle`, `scale`)

## Active decisions

- `docs/memory/` files are capped at ~200 lines — they are loaded every session; keep them scannable, not exhaustive.
- `docs/memory/decisionLog.md` holds only 6 undocumented-behavior entries (active findings); pre-2026 architectural decisions are in `docs/technical/decisionLog-archive.md`.
- `docs/technical/` and `docs/product/` files are reference docs — longer is fine, depth over brevity.
- All docs are facts-only, source-verified — no assumptions or inferred behavior without a cited file/line.
- Memory Bank files cross-reference each other via relative markdown links, not plain text.

## In progress (not finished)

- **Workshop PR** — deliverables complete; PR not yet opened.
- **Implementation work** — 0% — no feature tasks started; awaiting user direction.

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
3. Open the Workshop PR with the PR template filled.
4. Identify the first implementation task — needs user direction; no code has been changed yet.
5. Run `yarn test:all` to establish a clean baseline before any code changes.

## Context that expires

- `yarn.lock` shows `M yarn.lock` in git status (observed across multiple sessions) — check before running `yarn install` or adding dependencies; root cause not yet investigated.
- No feature flags or temporary workarounds are currently active in the codebase (from this session's perspective).
