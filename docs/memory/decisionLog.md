# Decision Log

> Last updated: 2026-03-25 · Pre-2026 architectural decisions: [../technical/decisionLog-archive.md](../technical/decisionLog-archive.md)

## How to read this log

Status tags: `[ACTIVE]` — in effect now | `[SUPERSEDED]` — replaced (see linked entry) | `[REVERSED]` — tried and explicitly undone | `[PENDING]` — identified, not finalized.
Entries are chronological, oldest first. Each entry is self-contained — no cross-entry reading required.
This log is append-only. Superseded decisions are marked, never deleted.

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
`docs/memory/systemPatterns.md` and `docs/technical/decisionLog-archive.md` (CaptureUpdateAction entry) document that EVENTUALLY is "deferred and merged into the next IMMEDIATELY commit." Neither document explains the mechanism: the snapshot is intentionally left stale, so the next IMMEDIATELY call produces a combined delta covering all EVENTUALLY changes since the last snapshot advance. Developers reading the store code will see the missing `this.snapshot = nextSnapshot` branch and may assume it is a bug.

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