# Active Context

## Current work focus

- Keep the repository aligned with the `0.18.x` product direction:
  - ESM-first packaging for `@excalidraw/excalidraw`;
  - stronger collaboration/history semantics (`captureUpdate`);
  - continued editor UX quality improvements.
- Maintain a dual focus on:
  - stable embeddable library experience for integrators;
  - polished `excalidraw.com` app behavior (local-first + realtime collab + sharing).
- Ensure Memory Bank docs stay synchronized with actual code and upstream release direction.

## Recent changes

- Latest release tracked in upstream is `v0.18.0` (2025-03-11), marked as latest.
- Major feature highlights in `0.18.0` include:
  - command palette;
  - multiplayer undo/redo;
  - editable element stats;
  - flowcharts, scene search, image cropping, element linking;
  - broader font support (including CJK) and SVG font subsetting.
- Breaking-change themes from `0.18.0`:
  - deprecation of UMD in favor of ESM-only distribution;
  - stricter TypeScript/bundler compatibility expectations around `exports` and module resolution;
  - API migration from `commitToHistory` to `captureUpdate` in `updateScene`.
- These release updates match current repository shape:
  - package currently publishes ESM structure via `dist/dev`, `dist/prod`, `dist/types`;
  - app code uses `CaptureUpdateAction` extensively for local vs remote update control.

## Next steps

- Prioritize triage around currently visible open PR themes:
  - editor correctness fixes (selection, grouping, frame behavior, pasted text, focus handling);
  - WYSIWYG and text UX fixes (caret color, scroll behavior, width/overflow adjustments);
  - rendering and geometry correctness (freedraw NaN filtering, bounds calculations);
  - accessibility/UX polish (RTL logical properties, shortcut hints, dark-mode behavior);
  - platform/build updates (Node requirement updates, actions pinning).
- Suggested execution flow for maintainers:
  - merge low-risk bugfix PRs first (pure correctness/style fixes);
  - validate potentially behavior-changing editor PRs with regression tests;
  - cluster related changes into release notes by theme (editor UX, collab, build/tooling).
- Watch specifically for release-readiness concerns:
  - ESM/toolchain compatibility fallout for integrators;
  - history/collaboration edge cases where `captureUpdate` modes can regress undo behavior;
  - text editor and mobile viewport regressions (frequent PR area).

## Active decisions and considerations

- **Packaging direction**: remain ESM-first; avoid reintroducing UMD assumptions.
- **API semantics**: prefer `captureUpdate` modes explicitly:
  - `IMMEDIATELY` for local undoable actions;
  - `EVENTUALLY` for deferred capture flows;
  - `NEVER` for remote/init updates.
- **Product layering**: keep app-level concerns (collab/share/local persistence) separated from core editor APIs.
- **Compatibility posture**: document migration expectations clearly for host apps (module resolution, bundler behavior, import paths).
- **Risk management**: treat editor text/WYSIWYG and frame/grouping logic as high-regression zones needing focused verification.

## Important patterns and preferences

- Source-of-truth preference:
  - product intent from root `README.md`;
  - architecture/behavior from code (`excalidraw-app/*`, `packages/*`);
  - change momentum from Releases + open PR queues.
- Architecture preference:
  - reusable core in `packages/excalidraw`;
  - app orchestration in `excalidraw-app`;
  - shared utilities/domain separation across `common`, `element`, `math`, `utils`.
- Reliability patterns:
  - local-first persistence (`localStorage` + IndexedDB);
  - encrypted collaboration transport;
  - controlled scene-history capture via explicit update actions.
- Documentation preference:
  - concise, sectioned Memory Bank files;
  - each context file should remain actionable for next implementation pass.

## Learnings and project insights

- Excalidraw’s product strategy is consistent: simple drawing UX on top, sophisticated collaboration/state management underneath.
- Release `0.18.0` confirms a platform-maturity phase:
  - stronger module packaging standards;
  - richer editor feature set;
  - more explicit state/history APIs for correctness at scale.
- Open PR stream suggests high velocity in editor polish and bug-fixing, which is good for UX but requires disciplined regression coverage.
- The repository remains a strong “app + embeddable engine” model; maintaining clear boundaries between these layers is key to long-term maintainability.

