# Real-Time Collaboration

**Status:** Active

---

## Overview

Excalidraw collaboration follows an **encrypted relay** topology — clients never communicate directly. All payloads are AES-GCM encrypted on the client before reaching the Socket.IO relay server, which stores and forwards only ciphertext.

```
Client A                    Relay Server                 Client B
  │                              │                           │
  ├── delta-diff encrypted ──►  WS relay  ──► decrypt ──►  │
  │   (only changed elements)    │             reconcile    │
  ◄── full-scene sync (20s) ────►│◄──────────────────────── │
```

---

## Key Files

| File | Responsibility |
|---|---|
| `excalidraw-app/collab/Portal.tsx` | WebSocket transport, delta tracking, emit/receive |
| `excalidraw-app/collab/Collab.tsx` | Orchestrator — wires Portal, FileManager, LocalData, Firebase |

---

## Sync Strategies

### Delta sync
`Portal.broadcastScene()` filters the element list on two criteria before building a `SCENE_UPDATE` payload: it checks `isSyncableElement(element)` to exclude non-syncable element types, and it consults `broadcastedElementVersions` (`Map<id, version>`) to skip any element whose version does not exceed the last-broadcast version. Only elements that pass both filters are included in the payload, minimising bandwidth.

### Full-scene sync
A periodic full broadcast fires every `SYNC_FULL_SCENE_INTERVAL_MS = 20 000 ms`. This acts as a safety net for dropped deltas and catches up newly joined peers.

### Cursor sync
Pointer positions are broadcast at `CURSOR_SYNC_TIMEOUT = 33 ms` (~30 fps) as volatile messages — no acknowledgement required, no storage.

---

## Class Responsibilities

The `Collab` class orchestrates four subsystems:

| Subsystem | Role |
|---|---|
| `Portal` | Socket.IO transport — emits/receives encrypted scene and cursor events |
| `FileManager` | Uploads and caches binary file assets (images) for the room |
| `LocalData` | Reads/writes localStorage and IndexedDB for offline persistence |
| `Firebase` | Cloud backup of room scene state (Firestore + Storage) |

---

## Encryption

Every payload is encrypted with AES-GCM before being emitted. See [`docs/technical/encryption.md`](./encryption.md) for full details.

---

## Conflict Resolution

Concurrent element edits are resolved client-side with a Last-Write-Wins strategy. See [`docs/technical/conflict-reconciliation.md`](./conflict-reconciliation.md) for the algorithm.

---

## Related Documentation

| Document | Location | Relationship |
|---|---|---|
| **System Patterns** | [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md) | Pattern-level summary of the encrypted relay model (§3.5) |
| **Encryption** | [`docs/technical/encryption.md`](./encryption.md) | AES-GCM implementation used to secure all collaboration payloads |
| **Conflict Reconciliation** | [`docs/technical/conflict-reconciliation.md`](./conflict-reconciliation.md) | LWW algorithm applied to incoming delta updates |
| **Technical Architecture** | [`docs/technical/architecture.md`](./architecture.md) | System-wide component topology and deployment context |
