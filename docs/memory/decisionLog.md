# Decision Log: Undocumented Behaviors

## Related Docs
- [System Patterns — architecture context for these decisions](systemPatterns.md)
- [PRD — what is officially documented vs what is not](../product/PRD.md)
- [Product Context — UX flows where these behaviors appear](productContext.md)

---

> 4 behaviors discovered through source code inspection that are not mentioned in any README, docs, or inline comments.

---

## 1. Double-tap creates text on mobile

**File:** `packages/excalidraw/components/App.tsx:3582–3641`

### What the code does
`onTouchStart` implements a custom double-tap detector using module-level variables:

```typescript
let didTapTwice: boolean = false;
let tappedTwiceTimer = 0;
let firstTapPosition: { x: number; y: number } | null = null;
```

On the first tap: sets `didTapTwice = true`, stores coordinates, starts a 300ms timer.
On the second tap — **only if**:
- occurs within `TAP_TWICE_TIMEOUT` = 300ms
- within `DOUBLE_TAP_POSITION_THRESHOLD` = 35px of the first tap
- `event.touches.length === 1` (single finger — prevents triggering during pinch-to-zoom)

→ calls `handleCanvasDoubleClick()` → creates a text element at that position.

### What is documented
Nothing. The README has no mention of mobile text creation. The only comment in the code references Apple Pencil Scribble (`// fix for Apple Pencil Scribble`), not the double-tap behavior itself.

### Why it matters
Users on mobile discover text creation by accident (or not at all). The 35px threshold and 300ms window are invisible constraints — slightly miss them and nothing happens.

---

## 2. versionNonce as conflict resolution tiebreaker

**File:** `packages/excalidraw/data/reconcile.ts:23–44`

### What the code does
When two collaborators edit the same element simultaneously, `reconcileElements()` resolves the conflict deterministically:

```typescript
// Priority order:
// 1. If local element is actively being edited → keep local
// 2. If local.version > remote.version → keep local
// 3. If local.version === remote.version AND local.versionNonce <= remote.versionNonce → keep local
```

`versionNonce` is a **random integer** assigned on every `mutateElement()` call. When versions collide (both clients incremented to the same number), the lower nonce wins — no server arbitration needed.

### What is documented
The public README mentions "collaboration" and "real-time sync" but says nothing about conflict resolution strategy. `versionNonce` appears in `types.ts` with zero explanation.

### Why it matters
This is the entire distributed consistency model of Excalidraw. Without understanding it, debugging "why did my edit disappear?" in a collab session is impossible. The lower nonce deterministically loses — which means a client with a lower random number always loses ties, regardless of who edited first.

---

## 3. Arrow bind mode has an invisible 700ms hover delay

**File:** `packages/excalidraw/components/App.tsx:926–1028, 1033–1234`

### What the code does
Arrow binding has three modes: `"orbit"` (default), `"inside"`, `"skip"`.

When dragging an arrow endpoint over a bindable shape:
1. A `setTimeout` fires after `BIND_MODE_TIMEOUT = 700ms`
2. After 700ms of hovering, `bindMode` switches from `"orbit"` → `"inside"`
3. `flushSync()` forces the state update immediately so the next pointer move uses the new mode
4. Pressing `Alt` triggers `handleSkipBindMode()` → switches to `"skip"` (arrow passes through without binding), also via `flushSync()`

```typescript
this.bindModeHandler = setTimeout(effector, BIND_MODE_TIMEOUT); // 700ms
```

### What is documented
Zero documentation. The UI shows no indicator that a timer is running. Users who move the mouse slightly during the 700ms window reset the timer unknowingly. The `Alt` key to skip binding is not shown in any tooltip.

### Why it matters
Users experience "arrow randomly snaps inside elements" without understanding why. The 700ms threshold is a UX decision buried in code — fast movers never trigger inside binding, slow movers always do.

---

## 4. Deleted elements are kept alive for 24 hours in sync

**File:** `excalidraw-app/app_constants.ts:52`, `excalidraw-app/data/index.ts:49–54`

### What the code does
`isSyncableElement()` controls what gets included in collaboration sync payloads:

```typescript
const DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

if (element.isDeleted) {
  if (element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT) {
    return true;  // still sync this deletion to peers
  }
  return false;   // garbage collect — stop sending
}
```

Deleted elements are **not purged from sync**. They keep the `isDeleted: true` flag and continue being broadcast to other clients for 24 hours after deletion. After 24h they are silently dropped from all sync payloads.

### What is documented
Nothing. The collaboration docs mention real-time sync but say nothing about deletion propagation windows, eventual consistency guarantees, or the 24-hour garbage collection window.

### Why it matters
- A client that was offline for >24h rejoining a session **will not receive deletions** that happened while they were gone — their canvas will show elements others deleted
- Deleted elements consume sync bandwidth and localStorage for up to 24 hours
- This is the mechanism that prevents "ghost elements" in normal usage — but it silently breaks for long offline periods
