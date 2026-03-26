# Codebase Concerns

**Analysis Date:** 2026-03-26

## Tech Debt

**Monolithic editor surface (`App.tsx`):**
- Issue: The primary editor class/component is extremely large, mixing input handling, scene lifecycle, clipboard, collaboration hooks, and tool logic in one file.
- Files: `packages/excalidraw/components/App.tsx`
- Impact: Hard to reason about, high merge-conflict risk, difficult to test or refactor safely without regressions.
- Fix approach: Incrementally extract cohesive subsystems (e.g. pointer pipeline, paste, text editing orchestration) into modules with explicit interfaces; keep behavior covered by existing Vitest suites while moving code.

**History / store semantics (#7348 cluster):**
- Issue: Multiple `TODO: #7348` comments describe tradeoffs around group rebinding, undo/redo capturing invisible elements, and postprocessed `groupIds` ordering—acknowledged as potential data-integrity or UX inconsistencies.
- Files: `packages/excalidraw/tests/history.test.tsx`, `packages/excalidraw/actions/actionFinalize.tsx`
- Impact: Edge cases in undo/redo and grouping may confuse users or produce empty history steps.
- Fix approach: Treat as a dedicated initiative: define invariants for group/bindings in history, then align `Store` capture rules and tests with those invariants.

**Restore pipeline vs collaboration deltas:**
- Issue: Empty text elements can be marked deleted during restore when `deleteInvisibleElements` is set; an inline `TODO` states this can break sync/versioning when applying deltas because deletion may not be recorded the same way as explicit deletes.
- Files: `packages/excalidraw/data/restore.ts`
- Impact: Multiplayer or incremental sync paths could diverge from local-only restore behavior.
- Fix approach: Record deletions explicitly in the delta/reconcile path, or stop mutating `isDeleted` during restore for shared scenes; add targeted reconcile tests.

**Export typing vs deleted elements:**
- Issue: A skipped test documents that `utils.exportToSvg` no longer guarantees filtering of `isDeleted` elements; callers are expected to pass non-deleted elements but enforcement is weak.
- Files: `packages/utils/tests/export.test.ts`, `packages/utils/src/export.ts` (calls `restoreElements` with `deleteInvisibleElements: true` but restored arrays can still retain `isDeleted: true` elements unless filtered elsewhere)
- Impact: SVG/canvas export could include deleted elements if the type contract is violated at call sites.
- Fix approach: Filter `!element.isDeleted` after restore in `exportToSvg`/`exportToCanvas`, or narrow types and add runtime assertions in dev; un-skip and fix the test.

**Math API migration (`Point` tuples):**
- Issue: Duplicated APIs and overloads are kept until the codebase migrates to `Point` tuples everywhere.
- Files: `packages/math/src/types.ts`, `packages/math/src/point.ts`
- Impact: Ongoing maintenance cost and subtle coordinate bugs at tuple/object boundaries.
- Fix approach: Complete migration to tuple `Point` in public APIs; remove deprecated overloads in one coordinated change.

**Linear vs arrow model:**
- Issue: `restore` still carries legacy `line`/`draw` migration and a `TODO` to separate arrow from linear element handling.
- Files: `packages/excalidraw/data/restore.ts`
- Impact: Harder to evolve arrow-specific behavior without touching shared linear paths.
- Fix approach: Extract migration tables and normalize arrow/line in dedicated functions with focused tests in `packages/excalidraw/tests/data/restore.test.ts`.

**Store cloning and binary data:**
- Issue: Comments flag frequent internal calls as error-prone, note possible need for binary payloads in store-related flows, and consider lazy or immutable snapshot strategies.
- Files: `packages/element/src/store.ts`
- Impact: Performance cost or subtle bugs when history snapshots large scenes or images.
- Fix approach: Profile hot paths; introduce structural sharing or lazy clone where elements are immutable; audit `CaptureUpdateAction` call sites.

**Frame membership hot path:**
- Issue: `isElementInFrame` is explicitly marked as a bottleneck for large scenes.
- Files: `packages/element/src/frame.ts`
- Impact: Jank when dragging many grouped elements or large frames.
- Fix approach: Cache frame membership per frame/version, reduce repeated `getElementsInGroup` work, add benchmarks on representative scenes.

**Rounded rectangle / bounds duplication:**
- Issue: Placeholder or duplicate geometry work between `shape` and `bounds` modules.
- Files: `packages/utils/src/shape.ts`, `packages/element/src/bounds.ts`
- Impact: Inconsistent hit-testing or export bounds for some shapes.
- Fix approach: Consolidate rounded-rect math in one module and share from both paths.

**Legacy `AppState` typing:**
- Issue: `LegacyAppState` / `isSidebarDocked` remains `@deprecated` with a removal TODO tied to issue #6213.
- Files: `packages/excalidraw/data/types.ts`
- Impact: Confusing imports API for embedders still sending old keys.
- Fix approach: Remove legacy key after migration window; document breaking change in changelog.

**WASM font loaders:**
- Issue: Loaders note possible future support for fetching WASM from external URLs/CDN.
- Files: `packages/excalidraw/subset/woff2/woff2-loader.ts`, `packages/excalidraw/subset/harfbuzz/harfbuzz-loader.ts`
- Impact: Larger bundles or inflexible deployment for self-hosted apps.
- Fix approach: Optional URL-based loading behind a host-provided config with CSP guidance.

**App wrapper memo / props defaults:**
- Issue: `FIXME` to normalize defaults in parent so memo comparison stays correct.
- Files: `packages/excalidraw/index.tsx`
- Impact: Unnecessary re-renders or stale props for embedded consumers.
- Fix approach: Single source of default props at package boundary; test with React Profiler or explicit render counters.

## Known Bugs

**Bounding box for curved linear elements when flipped:**
- Symptoms: Tests assert wrong bounding boxes for elements whose curves extend outside min/max axis-aligned bounds.
- Files: `packages/excalidraw/tests/flip.test.tsx`
- Trigger: Flip operations on certain linear/freedraw-like geometry.
- Workaround: None documented in code; behavior may be visually wrong for export/selection.

**Z-index / frame ordering expectations:**
- Symptoms: Test comments mark expected ordering as incorrect (`FIXME incorrect, should put F1_1 after R3`).
- Files: `packages/element/tests/zindex.test.tsx`
- Trigger: Specific multi-step z-order operations with frames.
- Workaround: None.

**Frame membership in tests:**
- Symptoms: `FIXME failing in tests` when adding elements to frames.
- Files: `packages/element/tests/frame.test.tsx`
- Trigger: Test scenario for frame insertion.
- Workaround: None documented.

**Flaky WYSIWYG test:**
- Symptoms: Test marked `FIXME too flaky. No one knows why.`
- Files: `packages/excalidraw/wysiwyg/textWysiwyg.test.tsx`
- Trigger: Timing/async in text editor.
- Workaround: Likely skipped or unstable in CI; investigate with deterministic fake timers.

**Memory leak risk in selection tests:**
- Symptoms: Comments note a leak if `pointerup` is not fired in certain flows.
- Files: `packages/excalidraw/tests/selection.test.tsx`
- Trigger: Interrupted pointer sequences in tests or real UI.
- Workaround: Ensure pointer lifecycle completes; audit listeners in `App` pointer handlers.

**Theme sync in text WYSIWYG:**
- Issue: `FIXME after we start emitting updates from Store for appState.theme`—theme may not propagate correctly to the WYSIWYG layer until store wiring is complete.
- Files: `packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- Impact: Wrong colors/styles while editing text when theme changes mid-edit.

**EyeDropper preview position:**
- Issue: `FIXME swap offset when the preview gets outside viewport`.
- Files: `packages/excalidraw/components/EyeDropper.tsx`
- Impact: Misaligned preview near viewport edges.

**Duplicate selection / group selection:**
- Issue: Tests expect certain elements not to be selected after duplicate; marked `FIXME` in selection logic.
- Files: `packages/excalidraw/actions/actionDuplicateSelection.test.tsx` (references `selectGroupsForSelectedElements` behavior)
- Impact: Unexpected multi-selection after duplicate.

**Untyped `FIXME` in double-click-to-text path:**
- Issue: Bare `FIXME` before resolving text container from position.
- Files: `packages/excalidraw/components/App.tsx` (near double-click text creation)
- Impact: Possible wrong container binding or edge-case text placement.

## Security Considerations

**HTML injection surfaces (SVG / innerHTML):**
- Risk: `dangerouslySetInnerHTML` and `innerHTML` assignments can become XSS vectors if strings ever originate from untrusted input without sanitization.
- Files: `excalidraw-app/share/QRCode.tsx` (QR SVG from `generateQRCodeSVG`), `packages/excalidraw/hooks/useLibraryItemSvg.ts`, `packages/excalidraw/components/PublishLibrary.tsx`, `packages/excalidraw/polyfill.ts`
- Current mitigation: QR path uses local generation (`uqr` via dynamic import); library paths typically use app-generated SVG—still assume trust boundaries for any future user-supplied SVG.
- Recommendations: Keep generation pipeline strict; if accepting external SVG, run through a sanitizer or DOMParser whitelist; document CSP requirements for self-hosters.

**Collaboration and cloud backends:**
- Risk: Room data and files transit over WebSocket (`socket.io-client`) and Firebase (`firebase` in `excalidraw-app`); misconfiguration could expose data.
- Files: `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/package.json`, `excalidraw-app/app_constants.ts`
- Current mitigation: End-to-end encryption helpers exist (`decryptData` import path in `Collab.tsx`); Firebase paths namespaced via `FIREBASE_STORAGE_PREFIXES`.
- Recommendations: Never commit real keys; `.env` present in deployment only—verify Firebase rules and Socket.IO auth for any fork; file upload capped by `FILE_UPLOAD_MAX_BYTES` in `excalidraw-app/app_constants.ts`.

**Third-party script example:**
- Risk: Example app writes to `innerHTML` for export preview.
- Files: `examples/with-script-in-browser/components/ExampleApp.tsx`
- Current mitigation: Example-only; not production app surface.
- Recommendations: Treat as demo code; do not copy patterns into production embeds without hardening.

## Performance Bottlenecks

**Large-scene frame checks:**
- Problem: `isElementInFrame` noted as major cost for large scenes.
- Files: `packages/element/src/frame.ts`
- Cause: Group expansion and overlap tests on drag paths.
- Improvement path: Spatial indexing, caching, or reducing per-pointer work.

**Snapping configuration:**
- Problem: Comment references increasing limits once optimized.
- Files: `packages/excalidraw/snapping.ts`
- Cause: Candidate set size for snap targets.
- Improvement path: Tune thresholds after profiling on large boards.

**Subset / font shaping WASM:**
- Problem: Font subsetting and HarfBuzz run in WASM; main-thread or worker cost can spike on first use.
- Files: `packages/excalidraw/subset/*.ts`, related workers in `packages/excalidraw/workers.ts`
- Cause: Cold start and large font coverage.
- Improvement path: Lazy load, cache compiled WASM, optional CDN hosting (see loader TODOs).

**Massive unit test file:**
- Problem: `history.test.tsx` is thousands of lines and exercises deep state—slow CI feedback.
- Files: `packages/excalidraw/tests/history.test.tsx`
- Cause: Single file accumulates scenarios.
- Improvement path: Split by feature area; share fixtures from `packages/excalidraw/tests/fixtures/`.

## Fragile Areas

**Pointer / touch unification:**
- Why fragile: Explicit `TODO` calls current touch vs pointer handling a hack pending unification.
- Files: `packages/excalidraw/components/App.tsx`
- Safe modification: Change touch and desktop paths together; run `packages/excalidraw/tests/` pointer and mobile-related suites.
- Test coverage: Gaps possible on exotic devices; rely on manual QA for touch.

**Mobile transform handles for linear elements:**
- Why fragile: `HACK` disables transform handles for linear elements on mobile until UX is redesigned.
- Files: `packages/excalidraw/components/App.tsx`
- Safe modification: Any change to `getElementWithTransformHandleType` or mobile detection must preserve this guard or replace it with a tested UX.
- Test coverage: Behavior tied to `editorInterface.userAgent.isMobileDevice`.

**Main menu / canvas actions coupling:**
- Why fragile: `FIXME move me` suggests misplaced responsibility between action and default menu items.
- Files: `packages/excalidraw/actions/actionCanvas.tsx`, related menu code under `packages/excalidraw/components/mainMenu/`
- Safe modification: Move logic with paired updates to both action registration and menu composition tests.

**Interactive scene multiplayer selection:**
- Why fragile: `TODO: support multiplayer selected group IDs` indicates incomplete remote selection visualization.
- Files: `packages/excalidraw/renderer/interactiveScene.ts`
- Safe modification: Coordinate with `excalidraw-app/collab/Collab.tsx` cursor/sync types.

**Collaboration type usage:**
- Why fragile: `TODO: ImportedDataState type here seems abused` in collab layer.
- Files: `excalidraw-app/collab/Collab.tsx`
- Safe modification: Introduce explicit DTO types for socket payloads before refactoring sync.

**Linear element editor:**
- Why fragile: Open `TODO fix #7029` tied to test rewrite.
- Files: `packages/element/tests/linearElementEditor.test.tsx`
- Safe modification: Fix underlying bug #7029 first; avoid papering over with looser assertions.

## Scaling Limits

**Large element counts:**
- Current capacity: No hard cap in core editor; practical limits set by browser memory, raster cache, and frame/group logic.
- Limit: Interaction latency degrades when `isElementInFrame` and rendering paths scan large maps repeatedly.
- Scaling path: Virtualization is not typical for canvas editors; optimize hot paths, consider off-main-thread rendering already partially addressed via workers.

**Collaboration file uploads:**
- Current capacity: `FILE_UPLOAD_MAX_BYTES` (4 MiB) and timeouts in `excalidraw-app/app_constants.ts`.
- Limit: Larger assets rejected or time out.
- Scaling path: Raise limits with storage/backend agreement; stream or chunk uploads.

**Local storage keys:**
- Current capacity: Browser quota for `STORAGE_KEYS` and IndexedDB library keys in `excalidraw-app/app_constants.ts`.
- Limit: Quota errors for heavy library or scene data.
- Scaling path: Compression, pruning, or server-side libraries.

## Dependencies at Risk

**Vitest UI vs Vitest core version skew:**
- Risk: Root `package.json` pins `@vitest/ui` to `2.0.5` while `vitest` is `3.0.6`.
- Impact: Incompatible UI or misleading coverage reporting.
- Migration plan: Align `@vitest/ui` (and `@vitest/coverage-v8`) on the same major/minor as `vitest`.

**Socket.IO typings package:**
- Risk: Root devDependency `@types/socket.io-client` at `3.0.0` while runtime `socket.io-client` is `4.7.2` in `excalidraw-app/package.json`.
- Impact: Incorrect or missing types; possible `@ts-expect-error` sprawl.
- Migration plan: Use maintained typings for v4 or rely on built-in types if provided.

**Sentry optional in builds:**
- Risk: Error telemetry disabled via env in some builds (`VITE_APP_DISABLE_SENTRY` in `excalidraw-app` scripts).
- Impact: Production forks may ship without crash reporting unless configured.
- Migration plan: Document expected env vars; validate in deployment checklist.

## Missing Critical Features

**Multiplayer selected group IDs in renderer:**
- Problem: Not implemented; remote users may not see consistent group selection affordances.
- Files: `packages/excalidraw/renderer/interactiveScene.ts`
- Blocks: Full parity between solo and collab selection UX.

**Align / distribute for frames:**
- Problem: Actions deferred until frames behave correctly in those operations.
- Files: `packages/excalidraw/actions/actionAlign.tsx`, `packages/excalidraw/actions/actionDistribute.tsx`
- Blocks: Power-user layout workflows involving frames.

**Mermaid / TTD and external diagram parsers:**
- Problem: Any text-to-diagram path depends on parsing user text; failures or unsupported syntax are user-visible (not a TODO but operational concern for forks enabling AI/TTD).
- Files: `packages/excalidraw/components/TTDDialog/` (multiple modules)
- Blocks: None for core drawing; relevant for optional features.

## Test Coverage Gaps

**Skipped SVG export with deleted elements:**
- What's not tested: Regression guard for deleted elements in `exportToSvg` is skipped with explicit `FIXME`.
- Files: `packages/utils/tests/export.test.ts`
- Risk: Deleted content could leak into exports.
- Priority: High

**Linear, freedraw, diamond `withinBounds`:**
- What's not tested: Commented `TODO` for additional element types (+ rotated cases).
- Files: `packages/utils/tests/withinBounds.test.ts`
- Risk: Wrong hit targets or export crops for those shapes.
- Priority: Medium

**Resize / flip combinations:**
- What's not tested: Tests disabled pending fixes for text flip and resize-from-center.
- Files: `packages/element/tests/resize.test.tsx`
- Risk: Regressions in text geometry when resizing or flipping.
- Priority: Medium

**App-level behavior marked TODO for tests:**
- What's not tested: Large areas of `App.tsx` called out for missing coverage (e.g. paste formatting cleanup).
- Files: `packages/excalidraw/components/App.tsx`
- Risk: Clipboard and gesture regressions ship unnoticed.
- Priority: Medium

**Z-index and frame interaction:**
- What's not tested: Known-wrong expectations documented in `FIXME` comments.
- Files: `packages/element/tests/zindex.test.tsx`
- Risk: Tests may pass for wrong reasons or be disabled locally.
- Priority: High until expectations are fixed.

---

*Concerns audit: 2026-03-26*
