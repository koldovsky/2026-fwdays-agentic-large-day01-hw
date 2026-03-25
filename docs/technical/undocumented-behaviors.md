# Undocumented Behaviors

This document tracks system behaviors that are real, important, and easy to break, but are not clearly documented in normal architecture, API, or type documentation.

Use this document when:
- refactoring behavior-sensitive code
- changing lifecycle, state transitions, or event flow
- investigating fragile runtime behavior
- reviewing AI-generated changes for hidden risks

Decision rule for inclusion:
- the behavior is real and supported by code/tests/comments
- it affects correctness, stability, or user-visible behavior
- it is easy to break during refactoring
- it is not already clearly documented elsewhere

---

## Entry Template

## <Behavior Title>

**Category**: implicit state machine | side effect | initialization dependency | workaround | hidden contract | other

**Status**: candidate | verified | partially verified

**Confidence**: low | medium | high

**Files**:
- path/to/file.ts:123
- path/to/other-file.ts:456

**Verified behavior**:
Describe the actual behavior in concrete terms.

**Why this qualifies as undocumented behavior**:
Explain why this behavior is encoded in implementation details rather than clearly documented contracts.

**Evidence**:
- code path:
- test:
- comment:
- runtime observation:

**Risk**:
Explain what kind of change could break it and what symptoms would appear.

**Impact**:
low | medium | high

**What AI or a developer might do wrong**:
Describe the likely incorrect simplification, refactor, or assumption.

**Safe refactor boundary**:
Describe what must be preserved if this area is modified.

**Follow-up opportunities**:
Describe useful next investigations, tests, or documentation steps.

**Related docs**:
- docs/memory/systemPatterns.md
- docs/technical/code-archaeology-patterns.md

---

## Capture Snapshot Update State Machine

**Category**: implicit state machine

**Status**: verified

**Confidence**: high

**Files**:
- packages/element/src/store.ts:38
- packages/element/src/store.ts:117
- packages/element/src/store.ts:332
- packages/element/src/store.ts:377
- packages/element/src/store.ts:395
- packages/excalidraw/components/App.tsx:4532
- packages/excalidraw/history.ts:17
- excalidraw-app/tests/collab.test.tsx:194

**Verified behavior**:
- `CaptureUpdateAction` encodes a three-mode state machine, not a simple "capture vs do not capture" flag.
- `IMMEDIATELY` emits a durable increment and advances `store.snapshot`.
- `NEVER` emits an ephemeral increment and still advances `store.snapshot`.
- `EVENTUALLY` emits an ephemeral increment and intentionally does not advance `store.snapshot`.
- When multiple macro actions are scheduled before a commit, precedence is `IMMEDIATELY` over `NEVER` over `EVENTUALLY`.
- `updateScene()` uses `scheduleMicroAction()` to freeze a change against the current live scene/state before the next commit. This is semantically different from macro scheduling.
- The stale baseline kept by `EVENTUALLY` is compensated by hash-based dedupe. Without that dedupe, the same logical change would be emitted repeatedly on later commits.
- The snapshot intentionally retains prior elements, including deleted ones, because diff calculation and undo/redo fallback rely on that preserved baseline.
- Change detection ignores updates on uninitialized image elements, which means some scene mutations are intentionally excluded from snapshot advancement.

**Why this qualifies as undocumented behavior**:
The behavior is spread across scheduling, commit precedence, snapshot mutation rules, hash dedupe, and history fallback. The public API exposes action names, but the actual contract depends on internal branching and timing.

**Evidence**:
- code path:
  - `processAction()` updates the snapshot only for `IMMEDIATELY` and `NEVER`, not `EVENTUALLY`.
  - `getScheduledMacroAction()` collapses many scheduled macro actions into one action with precedence `IMMEDIATELY > NEVER > EVENTUALLY`.
  - `scheduleMicroAction()` computes an immutable change against the current live scene/state instead of the stored snapshot because the snapshot may lag async updates.
  - `updateScene()` routes `captureUpdate` through `scheduleMicroAction()` rather than normal macro scheduling.
  - `HistoryDelta.applyTo()` explicitly uses the local snapshot as fallback state when applying history deltas.
- comment:
  - `EVENTUALLY` "does not update the snapshot" and therefore needs extra change detection against the latest hash.
  - snapshot must be updated "no-matter what" for `IMMEDIATELY` and `NEVER` or the next action will be wrong.
  - previous elements are cloned and never deleted from the snapshot because the next element set may be only a subset.
- test:
  - collaboration tests assert that local snapshot entries are intentionally retained after force deletion because diff calculation depends on them.
  - history tests assert that unrelated app-state changes with `NEVER` still leave the element snapshot available and correct.

**Risk**:
A refactor that collapses action modes into "durable vs ephemeral", removes stale-baseline dedupe, or unifies micro and macro scheduling will break snapshot timing, history capture, or diff fallback. Symptoms include repeated ephemeral increments, lost undo/redo fidelity, incorrect redo clearing, or missing element restoration after remote deletion / collaboration flows.

**Impact**:
high

**What AI or a developer might do wrong**:
- Treat `NEVER` as "do not touch the snapshot".
- Make `EVENTUALLY` update the snapshot immediately to "simplify" the code.
- Replace macro precedence with last-write-wins behavior.
- Reuse `store.snapshot` instead of current scene/state when scheduling micro actions.
- Delete removed elements from the snapshot to "save memory" or make the snapshot mirror the scene exactly.
- Remove the uninitialized-image ignore path as an apparent inconsistency.

**Safe refactor boundary**:
- Safe:
  - extract explicit helpers or data tables that describe action semantics, precedence, and snapshot policy
  - add focused tests that lock current behavior
  - improve naming and comments around stale-baseline dedupe and micro-vs-macro semantics
- Must preserve:
  - `IMMEDIATELY` durable + snapshot advance
  - `NEVER` ephemeral + snapshot advance
  - `EVENTUALLY` ephemeral + snapshot hold
  - macro precedence `IMMEDIATELY > NEVER > EVENTUALLY`
  - micro actions comparing against live scene/state
  - retained deleted elements in snapshot for diff/history fallback
  - ignored updates for uninitialized image elements

**Follow-up opportunities**:
- Add a small truth-table test suite for action semantics and macro precedence.
- Promote the same semantics into architecture docs if Store/History write-ups are expanded.
- Consider extracting an explicit internal `action semantics` resolver before any behavioral refactor, but do not change runtime policy first.

**Related docs**:
- docs/memory/systemPatterns.md
- docs/technical/code-archaeology-patterns.md

---

## Clipboard Paste Timing Constraint

**Category**: hidden contract

**Status**: candidate

**Confidence**: medium

**Files**:
- App.tsx:3849
- textWysiwyg.tsx:548

**Verified behavior**:
Clipboard and paste handling must happen in the same browser frame or tick. If the flow is deferred, browser clipboard data may no longer be available.

**Why this qualifies as undocumented behavior**:
The constraint depends on browser/runtime behavior and is easy to miss because it may not be visible in normal type signatures or architecture docs.

**Evidence**:
- code path: paste flow in App.tsx and textWysiwyg.tsx
- comment:
- test:
- runtime observation:

**Risk**:
Async refactoring or delayed event handling may silently break paste behavior.

**Impact**:
high

**What AI or a developer might do wrong**:
Move paste processing to a deferred callback, queue, or async step.

**Safe refactor boundary**:
Preserve same-tick execution semantics for clipboard access and verify with manual testing after changes.

**Follow-up opportunities**:
- Add direct evidence and concrete tests if this path is investigated further.

**Related docs**:
- docs/memory/systemPatterns.md
- docs/technical/code-archaeology-patterns.md

---

## Candidates for Further Documentation

- editor lifecycle as event-state-machine
- collaboration initialization gate and fallback flow
- global hit-test cache side effects
- image update ignore path for uninitialized elements
- flushSync before finalize
- onMount before onInitialize dependency
- API available before full initialization
- HACK / FIXME / TODO review
