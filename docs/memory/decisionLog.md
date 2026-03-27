# Decision Log — Undocumented Behavior

Four instances of implicit state machines, non-obvious side effects, and initialization order dependencies found in the source code.

---

## Undocumented Behavior #1

**Category:** Initialization order dependency

**File:** `packages/excalidraw/components/App.tsx`, lines 832–841

**What happens:**  
`History` is constructed **twice** inside the `App` constructor. The first instance (line 833) is created immediately after `Store`, then silently overwritten nine lines later (line 841) after `Fonts` is initialized. Only the second instance is passed to `createUndoAction` / `createRedoAction` (lines 844–845).

```ts
// line 832–833
this.store = new Store(this);
this.history = new History(this.store);   // ← first instance, thrown away

this.fonts = new Fonts(this.scene);
this.history = new History(this.store);   // ← second instance, the real one (line 841)

this.actionManager.registerAction(createUndoAction(this.history));
this.actionManager.registerAction(createRedoAction(this.history));
```

**Where documented:** Nowhere. There is no comment explaining why two constructions are needed or that the first is intentionally discarded.

**Risk:** Any code or test that holds a reference to `this.history` captured between lines 833 and 841 (e.g. early lifecycle hooks, subclass constructors) will hold a stale, unregistered `History` instance. Adding a side effect in `History`'s constructor (subscription, timer) would fire twice per `App` mount. An AI assistant could also suggest deduplicating the two lines as a "cleanup", which would silently change which instance the undo/redo actions operate on.

---

## Undocumented Behavior #2

**Category:** Non-obvious side effect (implicit guard in `componentDidUpdate`)

**File:** `packages/excalidraw/components/App.tsx`, lines 3503–3509

**What happens:**  
Every React update cycle, before `store.commit` runs, `componentDidUpdate` silently checks whether `editingTextElement` now points to a deleted element and forces `setState({ editingTextElement: null })` if so. This guard runs unconditionally on every update — including unrelated updates — and is explicitly labelled a **failsafe** for incorrect update ordering.

```ts
// failsafe in case the state is being updated in incorrect order resulting
// in the editingTextElement being now a deleted element
if (this.state.editingTextElement?.isDeleted) {
  this.setState({ editingTextElement: null });
}

this.store.commit(elementsMap, this.state);
```

**Where documented:** Only the inline comment; no architectural note explains what "incorrect order" means, which code paths trigger it, or whether the underlying bug has ever been fixed.

**Risk:** The guard masks an update ordering bug rather than fixing it. Code that deletes a text element while the WYSIWYG editor is open can rely on this silent correction. Removing or reordering the guard (e.g. moving `store.commit` before the check) would cause `Store` to record a snapshot where `editingTextElement` still references a deleted element, which corrupts undo history. An AI assistant could flag the guard as unnecessary defensive code and propose removing it.

---

## Undocumented Behavior #3

**Category:** Implicit state machine (`CaptureUpdateAction.EVENTUALLY` does not advance the snapshot)

**File:** `packages/element/src/store.ts`, lines 362–385

**What happens:**  
`Store.commit` implements a three-state enum (`IMMEDIATELY` / `EVENTUALLY` / `NEVER`) with an asymmetric snapshot update rule that is easy to misread:

- `IMMEDIATELY` → emits a **durable** increment (creates undo entry) **and** advances `this.snapshot`.
- `NEVER` → emits an **ephemeral** increment (no undo entry) **and** advances `this.snapshot`.
- `EVENTUALLY` → emits an **ephemeral** increment **but does NOT advance** `this.snapshot`.

```ts
// emit phase
case CaptureUpdateAction.NEVER:
case CaptureUpdateAction.EVENTUALLY:
  this.emitEphemeralIncrement(nextSnapshot, change);  // same branch!
  break;

// snapshot advance phase (finally block)
case CaptureUpdateAction.IMMEDIATELY:
case CaptureUpdateAction.NEVER:
  this.snapshot = nextSnapshot;  // EVENTUALLY is intentionally absent
  break;
```

Because `EVENTUALLY` never advances the baseline snapshot, the next `IMMEDIATELY` commit computes its delta **against the last `IMMEDIATELY` or `NEVER` commit**, accumulating all intermediate `EVENTUALLY` changes into a single, larger undo entry. This is the batched "debounced undo" mechanism for sliders and continuous input.

**Where documented:** The enum values carry JSDoc (lines 38–68 of `store.ts`), but the asymmetric snapshot rule is only visible by reading the `finally` block directly. The interaction with undo stack granularity is not surfaced anywhere in the public API or architecture docs.

**Risk:** Using `EVENTUALLY` for a new action expecting snapshot parity with the UI will cause the store's baseline to drift until the next `IMMEDIATELY` commit, producing oversized undo entries. Using `NEVER` instead of `EVENTUALLY` for a debounced value will produce one undo entry per slider tick. An AI assistant could swap `EVENTUALLY` and `NEVER` believing they are equivalent (both produce ephemeral increments), breaking undo granularity.

---

## Undocumented Behavior #4

**Category:** Non-obvious side effect (collab receive must set version before scene update)

**File:** `excalidraw-app/collab/Collab.tsx`, lines 755–786

**What happens:**  
`_reconcileElements` has a strict operation order that must not be changed. Three constraints are enforced by comments rather than code structure:

1. **`restoreElements` runs before `reconcileElements`**, not after — because running it after would regenerate in-progress editor elements (e.g. `appState.newElement`), breaking drawing state. The comment says "ideally we restore _after_ reconciliation but we can't".

2. **`setLastBroadcastedOrReceivedSceneVersion` is called before `updateScene`** — because `updateScene` triggers a synchronous render, which could read the stale version and re-broadcast the just-received scene to all collaborators (a broadcast storm).

3. **`bumpElementVersions` runs between reconcile and scene update** — to ensure locally reconciled elements are considered newer than what remote peers hold, preventing their next broadcast from being rejected.

```ts
// NOTE ideally we restore _after_ reconciliation but we can't do that
// as we'd regenerate even elements such as appState.newElement which would break the state
remoteElements = restoreElements(remoteElements, existingElements);

let reconciledElements = reconcileElements(existingElements, remoteElements, appState);
reconciledElements = bumpElementVersions(reconciledElements, existingElements);

// Avoid broadcasting to the rest of the collaborators the scene we just received!
// Note: this needs to be set before updating the scene as it synchronously calls render.
this.setLastBroadcastedOrReceivedSceneVersion(getSceneVersion(reconciledElements));

return reconciledElements;
```

**Where documented:** Only the inline comments; no integration test exercises all three ordering constraints together.

**Risk:** Reordering any of these three steps produces distinct failure modes: (1) swap restore and reconcile → drawing state corruption when receiving remote updates mid-draw; (2) move version set after `updateScene` → every received scene is immediately re-broadcast, causing a feedback loop; (3) remove `bumpElementVersions` → remote peers reject locally reconciled elements as stale. An AI assistant refactoring this for readability could reorder the steps without recognizing the coupling.
