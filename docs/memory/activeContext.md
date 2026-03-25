> Last updated: 2026-03-25 (session 4)
> Related: [progress.md](progress.md) | [decisionLog.md](decisionLog.md) | [PRD](../product/PRD.md) | [architecture](../technical/architecture.md) | [undocumented-behavior](../technical/undocumented-behavior.md)

## Current focus

Workshop PR deliverables: only `.cursorignore` remains. All docs complete and linked.

## What was just done

- Added 6 undocumented-behavior entries to `decisionLog.md` (verified against source):
  1. ShapeCache WeakMap keying — only geometry busts cache; style changes safe only via action system's `newElementWith()` (`mutateElement.ts:130–137`, `shape.ts:83`)
  2. EVENTUALLY stale snapshot — deliberately holds `this.snapshot` stale to merge all EVENTUALLY changes into next IMMEDIATELY undo entry (`store.ts:376–385`)
  3. Undo version exclusion — `version`/`versionNonce` excluded from delta application so each undo appears as a new user action to collaborators (`history.ts:33`)
  4. Uninitialized image delta skip — pending image elements silently excluded from Store delta detection (`store.ts:937–943`)
  5. triggerUpdate unconditional nonce — every call regenerates `sceneNonce`, busting renderer memo even without element changes (`Scene.ts:303–309`)
  6. Object.assign binding bypass — `fixBindingsAfterDuplication()` bypasses `mutateElement()`; no version bump on binding ref updates (`binding.ts:1992–2047`)
- Added markdown links to all reference and product docs in every pre-loaded Memory Bank file.
- Updated `progress.md` (17 decisionLog entries, session 4 timestamp).

## Active decisions

- `docs/memory/` files are capped at ~200 lines — they are loaded every session; keep them scannable, not exhaustive.
- `docs/memory/decisionLog.md` is exempt from the pre-loaded cap — it is append-only and lives in the reference docs list in `CLAUDE.md`.
- `docs/technical/` and `docs/product/` files are reference docs — longer is fine, depth over brevity.
- All docs are facts-only, source-verified — no assumptions or inferred behavior without a cited file/line.
- Memory Bank files cross-reference each other via relative markdown links, not plain text.

## In progress (not finished)

- **`.cursorignore`** — not yet created; last remaining required PR checklist item.
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

1. Create `.cursorignore` in repo root — last required PR deliverable.
2. Open the Workshop PR with the PR template filled.
3. Identify the first implementation task — needs user direction; no code has been changed yet.
4. Run `yarn test:all` to establish a clean baseline before any code changes.

## Context that expires

- `yarn.lock` shows `M yarn.lock` in git status (observed across multiple sessions) — check before running `yarn install` or adding dependencies; root cause not yet investigated.
- No feature flags or temporary workarounds are currently active in the codebase (from this session's perspective).
