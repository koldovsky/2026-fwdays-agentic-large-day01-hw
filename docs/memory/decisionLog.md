> Last updated: 2026-03-25

## How to read this log

Status tags: `[ACTIVE]` — in effect now | `[SUPERSEDED]` — replaced (see linked entry) | `[REVERSED]` — tried and explicitly undone | `[PENDING]` — identified, not finalized.
Entries are chronological, oldest first. Each entry is self-contained — no cross-entry reading required.
This log is append-only. Superseded decisions are marked, never deleted.

---

### ~2021 — Architecture — Yarn workspaces monorepo over single package
<!-- date approximate — exact commit not verified -->

**Status:** ACTIVE

**Context**
Excalidraw ships both a deployed web app (excalidraw.com) and a published npm library (`@excalidraw/excalidraw`). Without a monorepo, the library and the app would need to be separate repos kept in sync, or the app would depend on the published npm package, making it impossible to develop both simultaneously without `npm link` hacks.

**Decision**
The repository is a Yarn 1.22 workspaces monorepo with five packages (`math`, `common`, `element`, `excalidraw`, `utils`) and one app (`excalidraw-app`).

**Alternatives considered**
- Single package (app + library merged): Would require consumers to take the entire web app as a dependency; prevents clean library/app separation.
- Separate repos with npm dependency: Requires publishing a new library version to test any change in the app; makes atomic commits across the boundary impossible.
- npm workspaces: Yarn 1 workspaces were chosen — adopted by default before npm workspaces were stable; no explicit re-evaluation recorded.

**Consequences**
- *Makes easier:* Library changes are immediately reflected in the app without publishing; a single CI pipeline covers everything; version bumps are atomic.
- *Makes harder:* Build order matters (`common` → `math` → `element` → `excalidraw`); local development requires `yarn build:packages` before running the app against local package changes.

**Do not re-open unless:** The library and app need to evolve on independent release cadences, or a Turborepo/nx migration is being evaluated for build performance.

---

### ~2020 — State — App.tsx as a React class component (not functional)
<!-- date approximate — original project architecture, exact commit not verified -->

**Status:** ACTIVE

**Context**
`App.tsx` is 12,800+ lines and is the central coordinator of four concurrent state systems: React `this.state`, mutable `Scene`, `Store`/`History`, and Jotai atoms. Refactoring it to a functional component was not completed before React class components became the established pattern in this file.

**Decision**
Adopted by default — never explicitly evaluated as a class-vs-hooks decision. `App` remains a class component with `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` lifecycle methods.

**Alternatives considered**
- Functional component with hooks: Would enable cleaner effect management and easier testing, but refactoring 12,800 lines carries extreme risk of regressions across all four state systems.
- Partial migration (extract hooks while keeping class shell): Technically possible but creates an inconsistent pattern that is harder to reason about than either extreme.

**Consequences**
- *Makes easier:* Lifecycle ordering is explicit and deterministic (`componentDidMount` wiring always before `initializeScene`); `this.unmounted` guard pattern is straightforward in a class.
- *Makes harder:* Cannot use hooks directly inside the `App` class component itself — child functional components use hooks normally; `App` bridges to Jotai via `this.updateEditorAtom(atom, ...args)` instead of `useSetAtom`; `flushSync` is needed more often due to class-based batching behavior.

**Do not re-open unless:** A deliberate, scoped refactor of `App.tsx` is planned with full test coverage established first.

---

### ~2020 — State — Elements stored as mutable objects in Scene (outside React state)
<!-- date approximate — original project architecture, exact commit not verified -->

**Status:** ACTIVE

**Context**
Excalidraw scenes can contain thousands of elements. Storing them in React state (`this.setState({ elements })`) would trigger a full React reconciliation on every pointer move during drag/resize — potentially at 60fps. This is a hard performance constraint, not a preference.

**Decision**
Elements are stored as mutable objects in a `Scene` instance outside React state. React is notified only when explicitly needed via `scene.triggerUpdate()` → `setState({})`.

**Alternatives considered**
- Immutable React state (standard React pattern): Every drag event would create a new array of element objects, trigger reconciliation, and paint the canvas — unacceptable at 60fps with hundreds of elements.
- Zustand/Redux external store: Would still produce a new reference on every update, causing downstream re-renders unless heavily memoized; adds a dependency without solving the core problem.

**Consequences**
- *Makes easier:* `mutateElement()` during drag is O(1) with no React overhead; `ShapeCache` can be invalidated per-element without triggering a re-render.
- *Makes harder:* React does not know about element changes unless explicitly notified; callers must understand the two mutation paths (`mutateElement` vs `scene.mutateElement({ informMutation: true })`); testing requires manual trigger of scene updates.

**Do not re-open unless:** A concurrent/offscreen rendering approach is needed that requires React to own element state.

---

### ~2020 — Rendering — Five separate canvas/DOM layers over a single canvas

**Status:** ACTIVE

**Context**
The editor must render thousands of elements at 60fps during drag/resize while simultaneously showing selection handles that update on every pointer event, an in-progress element being actively drawn, and static UI chrome. A single canvas would require repainting everything on every pointer move. Pure React DOM cannot achieve canvas-level performance for the shape rendering.

**Decision**
The renderer uses five stacked layers: StaticCanvas (throttled, all persisted elements), InteractiveCanvas (pointer-rate handles and cursors), NewElementCanvas (the element being actively drawn), SVG layer (resize handles), and React DOM (UI chrome).

**Alternatives considered**
- Single canvas for everything: Every pointer event triggers a full repaint of all elements — unacceptable at 60fps with hundreds of shapes.
- Two canvases (static + interactive): Considered, but the actively-drawn new element needs its own layer to avoid flicker between the throttled static canvas and the pointer-rate interactive canvas.
- Pure React DOM with CSS transforms: Cannot match canvas rendering performance for RoughJS-generated hand-drawn strokes.

**Consequences**
- *Makes easier:* StaticCanvas throttling is independent of pointer-rate InteractiveCanvas updates; new element rendering does not pollute the persisted element layer.
- *Makes harder:* z-order across layers is managed by CSS stacking, not a single draw order; testing rendering requires understanding which layer is responsible for each visual element.

**Do not re-open unless:** A WebGL or OffscreenCanvas approach is being evaluated that could handle all layers in a single composited context.

---

### ~2020 — Performance — withBatchedUpdates on all DOM event handlers

**Status:** ACTIVE

**Context**
`App` is a React class component with DOM `addEventListener` calls managed outside React's synthetic event system. In React 17 and earlier, only React synthetic event handlers received automatic state batching. Direct DOM listeners calling `setState` multiple times would trigger one re-render per call. With thousands of pointer events per second during drag, unbatched re-renders would cause severe performance degradation.

**Decision**
All DOM `addEventListener` handlers and pointer event handlers in `App` are wrapped in `withBatchedUpdates`, which calls `React.unstable_batchedUpdates` to coalesce multiple `setState` calls into a single re-render.

**Alternatives considered**
- React 18 automatic batching: React 18 batches all state updates by default, including in setTimeout and native event handlers. However, `App` pre-dates React 18 and the pattern is retained for compatibility. Removing `withBatchedUpdates` would require verifying no regressions across all pointer handlers.
- Consolidating state updates manually: Requires every handler to be refactored to compute all state changes in one `setState` call — error-prone at 12,800 lines.

**Consequences**
- *Makes easier:* Pointer events are performant regardless of how many `setState` calls a handler makes; pattern is explicit and greppable.
- *Makes harder:* New event handlers must remember to apply `withBatchedUpdates`; React synthetic event handlers and `useEffect` do not need it (React handles those) — applying it unnecessarily is harmless but confusing.

**Do not re-open unless:** `App` is refactored to a functional component, at which point React 18 automatic batching makes `withBatchedUpdates` unnecessary in most cases.

---

### ~2022 — State — Jotai with jotai-scope isolation over global Jotai store
<!-- date approximate — introduced when library became embeddable, exact commit not verified -->

**Status:** ACTIVE

**Context**
`@excalidraw/excalidraw` is an embeddable library. Multiple instances can appear on the same page (e.g., a page with two editors). Standard Jotai uses a global atom store; atoms defined at module scope would be shared across all instances, leaking state between editors.

**Decision**
All Jotai usage inside `packages/excalidraw` goes through `editor-jotai.ts`, which uses `jotai-scope`'s `createIsolation()` to produce per-instance versions of `useAtom`, `useSetAtom`, `useAtomValue`, and `useStore`. Direct `jotai` imports are a lint error.

**Alternatives considered**
- Direct `jotai` with `Provider`: Would require wrapping every atom in a `Provider` context, adding boilerplate at every use site and making it easy to accidentally use a global atom.
- Zustand with `createStore()`: Each instance creates its own store natively, but Zustand lacks Jotai's atom composition model, which is relied upon for fine-grained subscriptions.
- Context-only (no external state library): For the scale and number of independent UI atoms in Excalidraw (~30+), prop drilling or context nesting would produce deeply coupled component trees.

**Consequences**
- *Makes easier:* Multiple editors on one page work correctly without any additional configuration from the host app.
- *Makes harder:* New code must never import from `jotai` directly — the lint rule enforces this, but it surprises contributors unfamiliar with the pattern; atoms defined outside the isolation scope will silently share state.

**Do not re-open unless:** `jotai-scope` stops being maintained or a breaking incompatibility with a new Jotai major version appears.

---

### ~2022 — Z-order — FractionalIndex strings over integer z-index
<!-- date approximate — introduced with collaboration improvements, exact commit not verified -->

**Status:** ACTIVE

**Context**
In a real-time collaborative editor, two clients may independently insert elements between the same pair of elements. Integer z-indices require renumbering the entire array on conflict; this produces unbounded write amplification and conflict resolution complexity.

**Decision**
Elements use `index: FractionalIndex | null` (a string type from the `fractional-indexing` package) for z-ordering. New indices are generated between existing neighbours; no renumbering is ever required.

**Alternatives considered**
- Integer z-index with conflict resolution: Conflicts require a canonical ordering pass that must be agreed upon by all collaborating clients — complex and expensive.
- Floating-point index: Suffers from precision exhaustion after many insertions between the same two elements; not a reliable long-term solution.

**Consequences**
- *Makes easier:* Concurrent insertions by two clients never conflict; the ordering is merge-friendly by construction.
- *Makes harder:* String sorting must be used for display order instead of numeric comparison; `null` indices (legacy or invalid elements) must be handled explicitly; the `Ordered<T>` type wrapper adds a layer of type ceremony.

**Do not re-open unless:** The `fractional-indexing` library is abandoned or a simpler CRDT ordering primitive becomes available in the ecosystem.

---

### ~2023 — History — CaptureUpdateAction with three modes over binary undo/no-undo
<!-- date approximate — Store/History refactor, exact commit not verified -->

**Status:** ACTIVE

**Context**
Some operations (remote collaboration updates, scene initialization) must never appear in the undo stack. Others (multi-step async operations like image upload) should be merged into a single undo entry rather than producing a separate undo step for each async phase.

**Decision**
`Store` uses a `CaptureUpdateAction` enum with three values: `IMMEDIATELY` (record now), `EVENTUALLY` (defer and merge into next IMMEDIATELY), `NEVER` (remote/init, never recorded).

**Alternatives considered**
- Boolean `captureUndo: true/false`: Cannot express the deferred/merge case; async operations would either create too many undo steps or be unrecordable.
- Transaction API (group multiple updates into one undo step explicitly): More expressive but requires callers to explicitly open and close transactions; the `EVENTUALLY`→`IMMEDIATELY` pattern is simpler for the common async case.

**Consequences**
- *Makes easier:* Remote collaboration updates never pollute the local undo stack; multi-step ops produce clean single-step undo behavior transparently.
- *Makes harder:* Callers must choose the right enum value; choosing `NEVER` by mistake silently makes an action non-undoable with no warning.

**Do not re-open unless:** The deferred-merge behavior of `EVENTUALLY` causes bugs with concurrent async operations, requiring a proper transaction model.

---

### ~2023 — Rendering — flushSync to force synchronous re-renders in specific flows

**Status:** ACTIVE

**Context**
React 18 automatic batching defers state updates asynchronously by default. In certain flows — committing text edits, processing specific keyboard sequences, and working around a Chromium 131 crash on focus during DOM transitions — the DOM must reflect updated state synchronously before the current JS call stack continues. Without synchronous re-render, subsequent code reads stale DOM state or triggers browser bugs.

**Decision**
`flushSync` is used at 15+ specific call sites in `App.tsx` where a synchronous DOM update is required before continuing. Each site has a distinct reason; `flushSync` is never used for convenience, only for correctness.

**Alternatives considered**
- `useLayoutEffect` / `useEffect` with dependencies: Cannot guarantee synchronous execution in the same call stack; unsuitable for event handler flows that need immediate DOM consistency.
- Restructuring state to avoid the need for synchronous renders: Would require decomposing tightly coupled pointer-event → state → DOM flows that span thousands of lines in the class component.

**Consequences**
- *Makes easier:* Text commit, keyboard flows, and browser-crash workarounds are correct without complex async coordination.
- *Makes harder:* `flushSync` forces a synchronous render which can cause performance issues if overused; it bypasses React's scheduler and should never be added without a specific verified reason. Each existing call site is load-bearing — do not remove without testing the specific flow.

**Do not re-open unless:** The class component is fully refactored and all flows are re-examined for whether synchronous rendering is still required.

---

### 2026-03-25 — Memory Bank — docs/memory/ files capped at ~200 lines

**Status:** ACTIVE

**Context**
Memory Bank files (`projectbrief.md`, `techContext.md`, `systemPatterns.md`, `productContext.md`, `activeContext.md`, `progress.md`) are loaded into the AI's context at the start of every session. Context window space is finite. Files that grow unbounded will eventually be truncated, causing the AI to have partial or missing orientation data. `decisionLog.md` is append-only by policy and will grow indefinitely, making it incompatible with the pre-loaded cap.

**Decision**
Memory Bank files in `docs/memory/` are capped at approximately 200 lines. Deeper reference material lives in `docs/technical/` and `docs/product/` and is read on demand, not pre-loaded. `decisionLog.md` is explicitly exempt from the pre-loaded set — it lives in `docs/memory/` but is listed under reference docs in `CLAUDE.md` due to its append-only nature.

**Alternatives considered**
- No size limit, allow files to grow: Files become too large to be reliably read in full; the AI skims rather than absorbs them, defeating their purpose.
- Single combined memory file: Easier to maintain but harder to update selectively; a session focused on architecture should not require rewriting product context.

**Consequences**
- *Makes easier:* Each session starts with a complete, untruncated picture of the project state; files are fast to update at session end.
- *Makes harder:* Decisions about what to include vs. defer to reference docs require judgment; information that doesn't fit must be cut or moved, not simply appended.

**Do not re-open unless:** Context window sizes increase to the point where pre-loading 1000+ lines of memory is practical.

---

### 2026-03-25 — Memory Bank — Facts-only policy for all documentation

**Status:** ACTIVE

**Context**
During Memory Bank creation, there was a risk of writing plausible-sounding but unverified architectural claims (e.g., "the Store uses event sourcing" without checking the actual code). AI-generated documentation that contains inaccuracies is worse than no documentation — it produces confident wrong answers in future sessions.

**Decision**
All Memory Bank and reference documentation is written only from facts verified directly in source files, with file paths and line numbers cited where specific. If something cannot be verified, it is marked as a question, not stated as fact.

**Alternatives considered**
- Allow inferred/synthesized claims with a disclaimer: Reduces the effort to produce docs but shifts the burden of verification to each future session — negating the purpose of pre-written docs.
- Generate docs from type signatures only (no behavioral claims): Too shallow; misses the non-obvious behavioral patterns (initialization order, flushSync usage, StrictMode workarounds) that are the most valuable things to document.

**Consequences**
- *Makes easier:* Future sessions can trust documented claims without re-verifying; the AI can confidently act on memory file content.
- *Makes harder:* Documentation takes longer to produce; any claim requires tracing it to a specific file and line; gaps in knowledge must be called out explicitly rather than papered over.

**Do not re-open unless:** A faster, structured code-extraction tool makes automated verification practical at scale.

---

### 2026-03-25 — Rendering — ShapeCache keyed by element object reference, not by version

**Status:** ACTIVE

**Context**
`ShapeCache` stores the computed RoughJS `Drawable` per element. The cache must be invalidated when the element's visual shape changes. Two strategies exist: key by element identity (object reference) and explicitly delete on geometry change, or key by element id+version and auto-invalidate when version bumps.

**Decision**
`ShapeCache` uses a `WeakMap<ExcalidrawElement, ...>` keyed by object reference (`packages/element/src/shape.ts:83`). `mutateElement` explicitly calls `ShapeCache.delete(element)` only when `height`, `width`, `points`, or `fileId` change (`packages/element/src/mutateElement.ts:130–137`). Properties that do NOT trigger explicit deletion: `x`, `y`, `angle`, `roundness`, `strokeStyle`, `fillStyle`, `strokeColor`, `backgroundColor`.

**What docs say vs. what code does**
`docs/memory/systemPatterns.md` states "`mutateElement` invalidates ShapeCache". This is true for geometry changes only. Position (`x`, `y`) and rotation (`angle`) do not bust the cache — by design, because the renderer applies these as canvas transforms, not baked into the RoughJS shape. However, style properties (`roundness`, `strokeStyle`, `fillStyle`) also do not bust the cache. Style changes are safe in practice because they always go through the action system, which returns new element objects via `newElementWith()` — a new object reference has no cache entry. But calling `mutateElement(element, map, { roundness: ... })` directly would leave a stale cached shape with no warning.

**Alternatives considered**
- Key by id+version: auto-invalidates on any version bump, no explicit deletion needed. Adds a version lookup on every cache read; breaks the WeakMap memory-management model.
- Explicit deletion on every field: safe but requires maintaining a list of all shape-affecting fields in sync with `_generateElementShape`.

**Consequences**
- *Makes easier:* Cache reads are O(1) pointer lookups; position/rotation changes never require cache deletion.
- *Makes harder:* Any caller using `mutateElement` to change style properties (`roundness`, `strokeStyle`, `fillStyle`, etc.) will silently render stale shapes. This is currently safe only because style mutations always go through `newElementWith()` in the action system — a non-obvious invariant not enforced by the type system.

**Do not re-open unless:** A developer adds a direct `mutateElement` call that changes style properties outside the action system, causing stale rendering. At that point, add the relevant fields to the deletion guard or switch to id+version keying.

---

### 2026-03-25 — Store — CaptureUpdateAction.EVENTUALLY deliberately holds snapshot stale

**Status:** ACTIVE

**Context**
Multi-step async operations (e.g., image upload: paste triggers one update, file resolves in a second update) should produce a single undo entry, not two. The store must somehow defer committing the snapshot until the full operation completes.

**Decision**
`CaptureUpdateAction.EVENTUALLY` emits an ephemeral increment (for collaboration) but does NOT update `this.snapshot` (`packages/element/src/store.ts:376–385`). The snapshot only advances when `IMMEDIATELY` or `NEVER` fires. This means all EVENTUALLY changes accumulate as a diff between the stale snapshot and the current state — they are all captured in the next `IMMEDIATELY` delta as a single undo entry.

**What docs say vs. what code does**
`docs/memory/systemPatterns.md` and `docs/memory/decisionLog.md` (CaptureUpdateAction entry) document that EVENTUALLY is "deferred and merged into the next IMMEDIATELY commit." Neither document explains the mechanism: the snapshot is intentionally left stale, so the next IMMEDIATELY call produces a combined delta covering all EVENTUALLY changes since the last snapshot advance. Developers reading the store code will see the missing `this.snapshot = nextSnapshot` branch and may assume it is a bug.

**Alternatives considered**
- Update snapshot on EVENTUALLY, merge deltas later: requires maintaining a separate pending-delta accumulator and a merge step.
- Explicit transaction open/close: more expressive but requires every async caller to manage open/close, which is error-prone.

**Consequences**
- *Makes easier:* Async multi-step operations produce clean single-step undo without callers needing to manage transaction state.
- *Makes harder:* While snapshot is stale, calling `store.commit()` with NEVER (e.g., a remote update arriving mid-async-operation) will also see the stale snapshot and produce a larger-than-expected ephemeral delta — the diff covers everything since the last IMMEDIATELY, not just the remote change.

**Do not re-open unless:** Concurrent async operations cause the stale-snapshot window to span unrelated changes, producing incorrect merged undo entries.

---

### 2026-03-25 — History — version and versionNonce excluded from undo/redo delta application

**Status:** ACTIVE

**Context**
In a collaborative session, elements have `version` and `versionNonce` that identify the originating user action. If undo restored the exact prior version number, remote clients receiving the undo would treat it as a duplicate of the original change (same version) and discard it, breaking collaborative undo.

**Decision**
`history.ts` passes `excludedProperties: new Set(["version", "versionNonce"])` when applying undo/redo deltas (`packages/excalidraw/history.ts:33`). Each undo/redo produces a fresh version bump via `mutateElement`, making it appear as a new user action to all collaborators.

**What docs say vs. what code does**
No Memory Bank document mentions this exclusion. A developer reading the undo code would see element fields restored from the delta but notice version is not reset — without this entry, the reason is opaque. The inline comment explains the intent ("always need to end up with a new version due to collaboration") but the implication — that undo in a collab session cannot be distinguished from a new edit by remote clients — is not documented.

**Alternatives considered**
- Restore version from delta: remote clients would receive a version equal to the original action's version and potentially discard the undo as a duplicate.
- Separate undo-event type in the collaboration protocol: would allow remote clients to explicitly handle undo, but requires protocol changes.

**Consequences**
- *Makes easier:* Collaborative undo works without protocol changes; each undo propagates as a new version that remote clients accept.
- *Makes harder:* Remote clients cannot distinguish an undo from a new edit — there is no "undo" signal in the collaboration event stream. Follow-mode and presence-aware features cannot show "User A undid their last action."

**Do not re-open unless:** A collaboration protocol version is introduced that supports explicit undo events with original-version metadata.

---

### 2026-03-25 — Store — Uninitialized image elements silently excluded from delta detection

**Status:** ACTIVE

**Context**
Image elements go through a two-phase lifecycle: created (element exists in scene, `status: "pending"`) then initialized (file loaded, `status: "saved"` or `"error"`). During the pending phase, the element's visual content is not yet available. If Store delta detection included pending images, collaboration would sync incomplete image state to other clients before the file is ready.

**Decision**
`detectChangedElements()` in the Store explicitly skips elements where `isImageElement(nextElement) && !isInitializedImageElement(nextElement)` (`packages/element/src/store.ts:937–943`). The skip is silent — no event, no log entry, no indication to the caller.

**What docs say vs. what code does**
No Memory Bank document mentions this exclusion. `docs/memory/systemPatterns.md` describes Store → History pipeline as committing "unconditionally every `componentDidUpdate`" — which is true, but the unconditional commit silently drops uninitialized images from the diff. A developer debugging missing image sync in collaboration would not find this in any documentation.

**Alternatives considered**
- Include pending images, filter at the collaboration layer: requires collaboration consumers to understand image lifecycle; couples sync logic to element type.
- Defer scene insertion until image is initialized: prevents the two-phase state but breaks the UX of showing a placeholder while loading.

**Consequences**
- *Makes easier:* Collaboration never sends a half-loaded image state; undo stack never captures the unresolved pending state.
- *Makes harder:* If an image element is modified while still pending (e.g., moved before the file loads), those changes are not captured in the delta and will not appear in undo or collaboration sync until the image is initialized.

**Do not re-open unless:** Image loading failures leave elements permanently in pending state, causing their subsequent modifications to be silently lost from history.

---

### 2026-03-25 — Scene — triggerUpdate() always regenerates sceneNonce unconditionally

**Status:** ACTIVE

**Context**
`Renderer.getRenderableElements()` is memoized by `sceneNonce` — it re-filters the full element array only when the nonce changes. The nonce must change whenever elements change, so the renderer doesn't show stale data. The question is whether the nonce should also change on non-element updates (e.g., pure callback notifications).

**Decision**
`Scene.triggerUpdate()` unconditionally assigns `this.sceneNonce = randomInteger()` before firing all registered callbacks (`packages/element/src/Scene.ts:303–309`). There is no "notify without invalidating" path — any caller that calls `triggerUpdate()` busts the renderer memo cache, even if no elements changed.

**What docs say vs. what code does**
`docs/memory/systemPatterns.md` documents the Scene → React bridge: "`scene.triggerUpdate()` → triggerRender callback → setState({})". It does not document that every `triggerUpdate()` call busts the `getRenderableElements` memo cache regardless of whether elements changed. Developers calling `triggerUpdate()` to notify subscribers (e.g., after a viewport change, not an element change) will unknowingly force a full viewport filter pass.

**Alternatives considered**
- Separate `notifyCallbacks()` from `invalidateRendererCache()`: would allow notifications without cache-busting, but adds API surface and requires callers to decide which to call.
- Key renderer memo by element array reference instead of nonce: would auto-invalidate only when elements array actually changes, but `mutateElement` mutates in place and doesn't change the array reference.

**Consequences**
- *Makes easier:* No stale renderer output is possible; any notification path automatically forces re-evaluation.
- *Makes harder:* Callers that trigger `triggerUpdate()` for non-element reasons (e.g., collaboration cursor moves) force a full `getRenderableElements` pass on every call; the throttled StaticCanvas partially mitigates this.

**Do not re-open unless:** Profiling shows `getRenderableElements` is a bottleneck on cursor-move events, at which point a separate notify/invalidate path should be considered.

---

### 2026-03-25 — Element — Object.assign in fixBindingsAfterDuplication bypasses mutateElement

**Status:** ACTIVE

**Context**
When elements are duplicated, their binding references (boundElements, containerId, startBinding, endBinding) must be remapped to point to the new duplicate IDs instead of the originals. This fixup happens after the elements are already created with their initial versions.

**Decision**
`fixBindingsAfterDuplication()` in `packages/element/src/binding.ts:1992–2047` uses `Object.assign(duplicateElement, { boundElements: [...], containerId: ..., ... })` directly, bypassing `mutateElement()`. This means the binding fixup does NOT bump `version` or `versionNonce`, and does NOT invalidate ShapeCache.

**What docs say vs. what code does**
`docs/memory/systemPatterns.md` states: "callers must understand the two mutation paths (`mutateElement` vs `scene.mutateElement({ informMutation: true })`)". It does not document that binding fixup uses a third path — direct `Object.assign` — that bypasses both. The inline code has no comment explaining the intent. ShapeCache invalidation is not needed here (binding metadata doesn't affect shape rendering), but version non-bumping means collaboration clients comparing element versions will not see binding reference updates as new changes.

**Alternatives considered**
- Use `mutateElement` for binding fixup: would bump version, making binding corrections visible to collaboration diff detection. But the version bump would appear as a separate undo entry following the duplicate operation, which is undesirable.
- Use `bumpVersion` explicitly after Object.assign: would make the collaboration intent explicit without incurring an action-system undo entry.

**Consequences**
- *Makes easier:* Binding fixup on duplication is atomic with the duplicate action from the undo/redo perspective — no extra history entry.
- *Makes harder:* In a collaboration session, binding reference corrections on duplicated elements may not propagate to remote clients because the version hasn't changed; this is a latent collaboration bug for multi-user duplication workflows.

**Do not re-open unless:** Collaboration testing reveals that duplicated elements show broken bindings on remote clients, pointing to this missed version bump as the cause.
