# Data Persistence

**Status:** Active

---

## Overview

Persistence is implemented as a four-layer hierarchy of stores with different durability and capacity characteristics. The app is offline-first: all layers below Firebase operate with zero network connectivity.

**Files:** `excalidraw-app/data/`

---

## Storage Layers

| Layer | Storage | Data | Write trigger |
|---|---|---|---|
| **L1 — localStorage** | Browser localStorage (~5–10 MB) | Serialised elements + filtered AppState | 300 ms debounce on every change |
| **L2 — IndexedDB** | Browser IndexedDB (large) | Binary file assets (images), shape library, TTD chat history | On file import / library change |
| **L3 — Firebase Firestore** | Cloud (encrypted) | Collaboration room scene JSON | On join/mutation in collab session |
| **L4 — Firebase Storage** | Cloud (encrypted) | Binary files for collab rooms and share links | Throttled upload on file add |

---

## Hydration Order

On app load, the app hydrates from the highest available layer:

- **Active collab session** → Firebase Firestore is authoritative; local layers are refreshed from it.
- **Solo session** → localStorage is authoritative; Firebase layers are not consulted.

If a higher layer is unavailable (network loss, quota exceeded), the app falls back to the next available layer and degrades gracefully to offline mode.

---

## Cross-Tab Synchronisation

Changes are propagated across open browser tabs using `BroadcastChannel` with a `SYNC_BROWSER_TABS_TIMEOUT = 50 ms` debounce. `VersionedSnapshotStore.pull()` is used to ensure only genuine state changes — not spurious broadcasts — trigger re-renders.

---

## AppState Filtering

Not all AppState is persisted. `clearAppStateForLocalStorage()` strips ephemeral fields (e.g., active tool, open panels, in-progress gestures) before writing to L1, keeping the localStorage footprint small and avoiding stale UI state on reload.

---

## Cloud Storage and Encryption

L3 and L4 (Firebase) hold only AES-GCM ciphertext. Plaintext is never written to any remote store. See [`docs/technical/encryption.md`](./encryption.md) for the encryption model.

---

## Related Documentation

| Document | Location | Relationship |
|---|---|---|
| **System Patterns** | [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md) | Pattern-level summary of the offline-first persistence strategy (§3.8) |
| **Encryption** | [`docs/technical/encryption.md`](./encryption.md) | AES-GCM model used for all cloud-layer writes |
| **Real-Time Collaboration** | [`docs/technical/realtime-collaboration.md`](./realtime-collaboration.md) | Collab layer that triggers L3/L4 writes |
| **Technical Architecture** | [`docs/technical/architecture.md`](./architecture.md) | System-wide offline-first design rationale |
