# Conflict Reconciliation

**Status:** Active

---

## Overview

Concurrent edits from multiple collaborators are resolved client-side using a **Last-Write-Wins (LWW)** strategy with deterministic tiebreaking. This is not full OT (Operational Transformation) or CRDT, but is sufficient for the eventual-consistency requirements of a whiteboard with periodic full-scene syncs.

**File:** `packages/excalidraw/data/reconcile.ts`

---

## Algorithm

Every element carries two version fields:

| Field | Type | Purpose |
|---|---|---|
| `version` | Monotonic integer | Incremented on every local mutation |
| `versionNonce` | Random integer | Tiebreaker when versions are equal |

### Decision logic — `shouldDiscardRemoteElement`

A remote element is **discarded** (local wins) if any of the following hold:

1. The element is currently being edited locally (editing / resizing / new element in progress).
2. The local `version` is strictly newer than the remote `version`.
3. Versions are equal **and** the local `versionNonce` is lower or equal to the remote's (`local.versionNonce <= remote.versionNonce`) (deterministic winner — lower or equal nonce wins).

Otherwise the remote element wins and replaces the local copy.

### Merge step

Winning remote elements are merged with uncontested local elements into a single reconciled list.

### Z-order repair

After merging, the full element list is re-ordered by **fractional index** to preserve stable z-ordering across clients. Invalid or conflicting indices are validated and repaired by `syncInvalidIndices`.

---

## Consistency Model

This is **eventual consistency** — not strong consistency or causal consistency. The 20-second full-scene sync (see [`docs/technical/realtime-collaboration.md`](./realtime-collaboration.md)) acts as a convergence safety net: even if a delta is dropped, all peers will converge on the same state within one sync interval.

Known limitations:
- Concurrent text edits to the same element will result in one client's change being silently discarded (last-write wins, not merged).
- No conflict notification is shown to the user.

---

## Related Documentation

| Document | Location | Relationship |
|---|---|---|
| **System Patterns** | [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md) | Pattern-level summary of conflict reconciliation (§3.7) |
| **Real-Time Collaboration** | [`docs/technical/realtime-collaboration.md`](./realtime-collaboration.md) | Transport layer that delivers remote deltas for reconciliation |
| **Technical Architecture** | [`docs/technical/architecture.md`](./architecture.md) | System-wide design context for the eventual-consistency model |
