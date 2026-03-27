# Undocumented Behaviors

Non-obvious implementation details discovered by reading source code. Each behavior is verified against the actual code.

---

## 1. `mutateElement` Skips Index 0 When Comparing Points Arrays

**File:** `packages/element/src/mutateElement.ts:98-118`

When an update includes a `points` array (lines, arrows, freehand), `mutateElement` checks whether the points actually changed before applying the update. The comparison loop uses `while (--index)` — a pre-decrement — which means it starts at `length - 1` and stops when `index` reaches `1`, **never checking index 0** (the first point).

```typescript
let index = prevPoints.length;
while (--index) {          // stops at 1, never reaches 0
  const prevPoint = prevPoints[index];
  const nextPoint = nextPoints[index];
  if (prevPoint[0] !== nextPoint[0] || prevPoint[1] !== nextPoint[1]) {
    didChangePoints = true;
    break;
  }
}
```

**Consequence:** If you mutate only the first point of a multi-point element (e.g., move the start of an arrow) while leaving all other points identical, `mutateElement` will consider the element unchanged and return early — skipping the version bump, cache invalidation, and `ShapeCache.delete()`. The element will not re-render until something else changes it.

**When this matters:** Writing code that manipulates arrow start points directly, or restoring element positions from external state.

---

## 2. `EVENTUALLY` Actions Do Not Update the Store Snapshot

**File:** `packages/element/src/store.ts:332-384`

The Store has three `CaptureUpdateAction` modes. Two of them (`IMMEDIATELY`, `NEVER`) update `this.snapshot` after each commit. `EVENTUALLY` does **not**:

```typescript
// finally block — runs after every commit:
switch (action) {
  case CaptureUpdateAction.IMMEDIATELY:
  case CaptureUpdateAction.NEVER:
    this.snapshot = nextSnapshot;  // snapshot updated
    break;
  // EVENTUALLY is intentionally absent — snapshot NOT updated
}
```

This means that after an `EVENTUALLY` commit, `this.snapshot` still reflects the state before the commit. The next call to `IMMEDIATELY` or `NEVER` will diff against that older snapshot, potentially double-capturing the same changes. This is intentional — `EVENTUALLY` is used for intermediate states (ongoing text edits, freedraw in progress) where you want to emit ephemeral sync increments without polluting the undo stack or advancing the snapshot baseline.

There is also a short-circuit: if no subscribers are listening for increments when `EVENTUALLY` fires, the entire commit is skipped without cloning the snapshot at all (line 335-340).

**When this matters:** If you add a listener to `onStoreIncrementEmitter` and try to compute diffs, `EVENTUALLY` increments may appear to contain more changes than expected because the baseline snapshot is older than the last commit.

---

## 3. Uninitialized Image Elements Are Silently Ignored in Change Detection

**File:** `packages/element/src/store.ts:937-943`

When the Store scans for changed elements to include in a `StoreChange`, it explicitly skips image elements that haven't been fully initialized yet:

```typescript
if (
  isImageElement(nextElement) &&
  !isInitializedImageElement(nextElement)
) {
  // ignore any updates on uninitialized image elements
  continue;
}
```

An image element is "uninitialized" until its `status` is set to `"saved"` or `"error"` (i.e., the image data has been resolved from the file map). During the download/processing window, any mutations to the image element — including setting its `width`, `height`, `x`, `y`, or `fileId` — will not appear in store increments and will not be synced to collaborators.

**Consequence:** If you add an image programmatically and then immediately read back store increments, the image element will be absent. You must wait for the image to be initialized before the element participates in normal change tracking and collaboration sync.

---

## 4. Undo/Redo Automatically Skips Invisible History Entries

**File:** `packages/excalidraw/history.ts:178-219`

When the user triggers undo (or redo), the History engine loops through the stack instead of popping exactly one entry. After applying each `HistoryDelta`, it checks a `containsVisibleChange` flag. If the applied delta resulted in no visible change (e.g., only deselection was recorded), it immediately pops and applies the next entry:

```typescript
while (historyDelta) {
  [nextElements, nextAppState, containsVisibleChange] =
    historyDelta.applyTo(nextElements, nextAppState, prevSnapshot);

  // ... emit store increment for sync ...

  if (containsVisibleChange) {
    break;            // stop at the first visually meaningful change
  }

  historyDelta = pop();  // invisible — consume and keep going
}
```

**Consequence:** A single Ctrl+Z can consume multiple stack entries. All consumed deltas are still pushed to the redo stack (in the `finally` block), so Ctrl+Y replays them individually — meaning redo can take more steps than undo did. This is by design: "invisible" intermediate states (selection changes, viewport moves) should not force users to press undo repeatedly to reach meaningful changes.

---

## 5. Collaboration Conflict Resolution: Active Edits Always Win; Ties Go to Lowest `versionNonce`

**File:** `packages/excalidraw/data/reconcile.ts:23-44`

When a remote element arrives, `shouldDiscardRemoteElement` decides whether the local copy wins. There are two separate rules:

**Rule 1 — Active editing always beats remote:** If the local element is currently being edited, resized, or is the `newElement` in progress, the remote update is always discarded regardless of version numbers:

```typescript
local.id === localAppState.editingTextElement?.id ||
local.id === localAppState.resizingElement?.id ||
local.id === localAppState.newElement?.id
```

This means a remote user editing the same element while you are also editing it will have their changes silently dropped on your client until you finish your edit and the versions reconcile. There is no visual indication.

**Rule 2 — Equal versions resolved by `versionNonce`:** When both clients have the same version, the element with the **lower** `versionNonce` wins:

```typescript
local.version === remote.version && local.versionNonce <= remote.versionNonce
// → discard remote (local wins if its nonce is lower or equal)
```

`versionNonce` is assigned via `randomInteger()` on every mutation. The conflict resolution is deterministic and consistent across all peers (everyone sees the same winner), but which user's edit survives is arbitrary — the one who happened to get the lower random integer.

---

## 6. `mutateElement` Does Not Trigger React Re-renders — `scene.mutateElement` Does

**File:** `packages/element/src/mutateElement.ts:29-36` and `packages/element/src/Scene.ts`

The top-level `mutateElement` export mutates the element object in-place and bumps `version`/`versionNonce`, but it has no knowledge of React or the rendering pipeline. The docblock warns:

> **WARNING: this won't trigger the component to update, so if you need to trigger component update, use `scene.mutateElement` or `ExcalidrawImperativeAPI.mutateElement` instead.**

`Scene.mutateElement()` is a wrapper that calls the bare `mutateElement` and then notifies registered callbacks so the canvas re-renders. Using the bare export is correct for in-flight mutations during pointer move (where render is driven by `requestAnimationFrame`), but calling it outside that context — e.g., in a one-off imperative update — will mutate the element silently with no visual effect until the next unrelated render.
