# Code Archaeology Patterns

This document captures reusable heuristics for discovering hidden behavior in large or legacy codebases.

Use this document when:
- exploring an unfamiliar codebase
- asking an AI agent to investigate fragile behavior
- reviewing suspicious runtime logic
- building repeatable analysis workflows

Pattern inclusion rule:
- the pattern helped reveal a real behavior
- it can be reused in other parts of the codebase
- it improves the quality of future investigations

---

## Pattern Template

## <Pattern Title>

**Goal**:
What this pattern helps detect.

**Signals**:
- signal 1
- signal 2
- signal 3

**Why it matters**:
Explain why this pattern often reveals hidden or fragile behavior.

**How to search**:
- query 1
- query 2
- query 3

**How to validate**:
- check control flow
- inspect related tests
- inspect comments
- trace runtime timing or ordering

**What to document if confirmed**:
Describe what should be added to undocumented-behaviors.md and systemPatterns.md.

**Example**:
- reference to concrete code or document entry

---

## Hidden State Machine Behind Enums or Flags

**Goal**:
Detect behavioral contracts that are encoded as state values with transition logic.

**Signals**:
- enum-like values or string unions used in multiple branches
- priority-dependent transitions
- the same state checked across lifecycle or update paths

**Why it matters**:
State-machine behavior is often undocumented and easy to oversimplify during refactoring.

**How to search**:
- search for enum values used in conditionals
- trace all assignments to the same state field
- inspect whether timing or updates depend on transition order

**How to validate**:
- follow all transitions
- compare behavior before and after update points
- inspect tests for ordering assumptions

**What to document if confirmed**:
- state names
- transition rules
- timing/ordering risks
- what must not be simplified

**Example**:
- CaptureUpdateAction in store.ts

---

## Stale Baseline Plus Dedupe Is a Behavioral Contract

**Goal**:
Detect code paths where correctness depends on intentionally not advancing a baseline and suppressing repeated emissions with a secondary dedupe mechanism.

**Signals**:
- comments that describe a baseline as intentionally stale
- hashes, version checks, or memoized fingerprints used only on selected branches
- code that emits changes without updating the stored reference state
- bugs that would appear as repeated change notifications or duplicated captures

**Why it matters**:
This pattern often looks like accidental inconsistency. In practice it can be the core contract that preserves batching or deferred-capture semantics.

**How to search**:
- search for `hash`, `version`, `dedupe`, `stale`, `snapshot`, `baseline`
- search for comments explaining why one path does not update stored state
- compare branches that emit events with branches that mutate the baseline

**How to validate**:
- confirm which branch intentionally leaves state stale
- identify the dedupe mechanism that prevents repeated emissions
- verify tests or comments that rely on the stale baseline remaining intact
- check what future action finally advances the baseline

**What to document if confirmed**:
- which baseline is intentionally stale
- why it must stay stale
- what dedupe mechanism compensates for that choice
- what repeated or missing behavior would appear if either side changes

**Example**:
- `CaptureUpdateAction.EVENTUALLY` in `packages/element/src/store.ts` does not advance `store.snapshot` and relies on hash comparison to avoid repeated ephemeral increments.

---

## Micro vs Macro Actions Can Carry Different Semantics

**Goal**:
Detect systems where two scheduling layers use similar action names but operate on different source-of-truth timing or comparison rules.

**Signals**:
- separate queues for micro and macro work
- one path captures immediate immutable state while another defers to commit time
- comments about batching, async gaps, or stale snapshots
- API entry points that route to a different queue than normal internal actions

**Why it matters**:
Developers often merge these paths during cleanup because they look redundant. If the queues compare against different baselines, that simplification changes behavior.

**How to search**:
- search for `scheduleMicroAction`, `scheduleAction`, `commit`, `flush`
- trace which public APIs feed each queue
- inspect comments mentioning batching, async updates, or stale snapshots

**How to validate**:
- compare the state source used by each queue
- identify when the change object is materialized
- verify whether one path survives async gaps that the other path would miss
- inspect tests or comments that explain why the immediate snapshot is needed

**What to document if confirmed**:
- semantic difference between the queues
- which API paths use each one
- what timing or batching assumptions each queue preserves
- what would break if the queues were unified

**Example**:
- `updateScene()` in `packages/excalidraw/components/App.tsx` uses `scheduleMicroAction()` so the change is frozen against live scene/state before the next commit, unlike normal macro action scheduling in `packages/element/src/store.ts`.

---

## Browser Timing Dependency

**Goal**:
Detect runtime behavior that depends on same-tick, same-frame, or browser event timing.

**Signals**:
- comments mentioning frame, tick, browser behavior, clipboard, focus, drag, selection
- use of flushSync
- fallback timers around event handling
- fragile UI event pipelines

**Why it matters**:
Async refactoring can break behavior without obvious type or compile errors.

**How to search**:
- search for flushSync
- search for setTimeout around event logic
- search comments mentioning frame, tick, clipboard, browser

**How to validate**:
- inspect exact event flow
- check when data becomes unavailable
- verify whether delayed execution changes behavior

**What to document if confirmed**:
- exact timing constraint
- user-visible failure mode
- safe change boundary

**Example**:
- clipboard paste flow in App.tsx and textWysiwyg.tsx

---

## Global Mutable Cache Side Effects

**Goal**:
Detect hidden behavior caused by module-level mutable caches.

**Signals**:
- cached* variables at module scope
- state reused across calls without explicit invalidation
- comments about cache problems or invalidation gaps

**Why it matters**:
Global mutable caches can create non-obvious coupling between calls and stale results.

**How to search**:
- search for cached*
- search for module-level let variables
- search for invalidate, cache, stale, reuse

**How to validate**:
- trace reads and writes
- identify invalidation rules
- check whether behavior depends on call order

**What to document if confirmed**:
- cache scope
- invalidation rules
- stale-data risks
- refactoring hazards

**Example**:
- collision.ts and bounds.ts cache-related behavior
