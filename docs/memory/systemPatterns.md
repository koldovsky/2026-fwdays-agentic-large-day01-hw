# System Patterns: Excalidraw

**Version:** 1.0 | **Date:** 2026-03-28 | **Status:** Active

---

## 1. Architectural Style

Excalidraw is a **client-side monolithic SPA** — Vite-bundled React, no SSR. All business logic, encryption, and reconciliation run on the client; servers act as dumb relays.

| Dimension              | Description                                                                             |
|------------------------|-----------------------------------------------------------------------------------------|
| **Deployment targets** | Web app (`excalidraw-app/`) + embeddable npm component (`packages/excalidraw/`)         |
| **Package topology**   | Yarn workspaces: `common → math → element → excalidraw → excalidraw-app`                |
| **External backends**  | Firebase (persistence), Socket.IO (collab relay), AI API — none in this repo            |
| **Offline capability** | Offline-first; localStorage + IndexedDB                                                 |
| **Real-time**          | Relayed WebSocket model (not peer-to-peer)                                              |

---

## 2. Core Patterns

### 2.1 State Management — Hybrid Jotai + React State

| Tier                      | Technology       | Scope                           | Location                          |
|---------------------------|------------------|---------------------------------|-----------------------------------|
| **Global UI / app state** | Jotai atoms      | Cross-component, session-scoped | `app-jotai.ts`, `editor-jotai.ts` |
| **Component-local state** | `React.useState` | Ephemeral, UI-only              | Per-component                     |

- **Jotai** chosen for atomic granularity (avoids over-rendering); `jotai-scope` isolates multiple `<Excalidraw />` instances on the same page.
- `AppState` — transient UI state (tool, zoom, scroll). Selectively persisted via `clearAppStateForLocalStorage()`.
- `Element state` — canonical scene data in `Store` (`packages/element/src/store.ts`) as immutable snapshots; never in React state.
- No Redux, no MobX, no Context-for-data.

---

### 2.2 Scene Store — Immutable Snapshot + Increment Model

**Files:** `packages/element/src/store.ts`, `packages/common/src/versionedSnapshotStore.ts`

The scene is managed through an **immutable snapshot + named increment** pattern:

```text
User interaction → App.mutateElement() → Store.capture()
                                          ├─ DurableIncrement  → undo/redo history + collab broadcast
                                          └─ EphemeralIncrement → collab cursor/idle (not stored)
```

- `StoreSnapshot` — immutable point-in-time copy of all elements and appState.
- `DurableIncrement` — versioned change with `StoreDelta` (inserted/deleted element sets). Feeds undo/redo (`History`) and collab delta sync.
- `EphemeralIncrement` — transient cursor/idle broadcasts; not stored.
- `CaptureUpdateAction` — `IMMEDIATELY` / `EVENTUALLY` / `NEVER` — controls whether a mutation enters undo history.
- `VersionedSnapshotStore` provides a `pull(sinceVersion)` async API for cross-tab sync via `BroadcastChannel`.

---

### 2.3 Action Pattern — Centralised Command Registry

**Files:** `packages/excalidraw/actions/`

All user-level operations are implemented as **registered actions** — pure functions with a standard signature:

```typescript
const myAction = register({
  name: "myAction",
  perform: (elements, appState, value, app): ActionResult => {
    return {
      elements: [...],
      appState: { ...appState, ... },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
});
```

- `register()` appends to a global registry; `ActionManager` discovers all actions at startup.
- Actions are **pure**: receive state, return new state — no side effects in `perform`.
- `ActionSource` (`"ui"` / `"keyboard"` / `"api"` / `"commandPalette"`) tracked for analytics.
- Command Palette consumes the same registry — all actions are keyboard-searchable for free.

---

### 2.4 Canvas Rendering — Dual-Canvas Pipeline

**Files:** `renderer/staticScene.ts`, `renderer/interactiveScene.ts`, `components/canvases/`

Excalidraw renders through **two separate `<canvas>` elements** stacked in the DOM:

| Layer | Component | Responsibility |
|---|---|---|
| **StaticCanvas** (background) | `StaticCanvas.tsx` | Persistent elements — shapes, text, images |
| **InteractiveCanvas** (foreground) | `InteractiveCanvas.tsx` | Transient overlays — selections, cursors, binding highlights |

**Pipeline per frame:**

```
viewport transform (scroll, zoom, DPR)
  → renderStaticScene()      — Canvas 2D + RoughJS rasterisation (throttled)
  → renderInteractiveScene() — selection handles, remote pointers, animations
  → Browser composite        — GPU composites two canvases
```

- Static canvas is **throttled** — cursor movement never triggers full re-rasterisation.
- Hit-testing (`collision.ts`) iterates elements in **reverse order** (highest z-index first).
- **Z-order** via `FractionalIndex` per element; stable across concurrent peers; repaired via `syncMovedIndices()` / `syncInvalidIndices()`.

---

### 2.5 Element System — Model and Invariants

**Files:** `packages/element/src/types.ts`, `mutateElement.ts`, `delta.ts`

**Canonical element model** — all elements extend `_ExcalidrawElementBase` (declared `Readonly<{...}>`):

| Field group | Fields | Purpose |
|---|---|---|
| Identity | `id`, `type` | Unique id; shape-type discriminant (`"rectangle"`, `"ellipse"`, `"text"`, `"arrow"`, `"freedraw"`, `"image"`, `"frame"`, …) |
| Geometry / props | `x`, `y`, `width`, `height`, `angle`, `strokeColor`, `fillStyle`, `opacity`, … | Visual appearance and layout |
| Collab / ordering | `version`, `versionNonce`, `index: FractionalIndex \| null`, `updated` | Reconciliation, z-order, timestamp |
| Graph | `groupIds`, `frameId`, `boundElements` | Grouping and connector binding |

**Invariants:**

1. **Immutable at the type level.** Mutations use `mutateElement()` (increments `version`/`versionNonce`) or `newElementWith()` (returns a new object).
2. **`version` + `versionNonce`** — monotonic version + random nonce for concurrent tiebreaking.
3. **No direct React state.** Elements live in `SceneElementsMap` inside `StoreSnapshot`.

---

### 2.6 Event Bus / Emitter

- **`Emitter<T>`** (`packages/common/src/emitter.ts`) — lightweight typed pub/sub; used by `Store` to emit increment events to `History` and `Collab`.
- **`AppEventBus`** (`packages/common/src/appEventBus.ts`) — application-level bus with cardinality control (`"once"` / `"many"`), replay behaviour (`"last"` / `"none"`), and `await`-able one-shot events.

---

### 2.7 Real-Time Collaboration

Encrypted Socket.IO relay (never peer-to-peer). Delta sync per change + 20-second full-scene broadcast. AES-GCM encrypted before leaving the client. `Collab` orchestrates Portal, FileManager, LocalData, Firebase.

See [`docs/technical/realtime-collaboration.md`](../technical/realtime-collaboration.md).

---

### 2.8 End-to-End Encryption

AES-GCM via `window.crypto.subtle`; key lives only in the URL fragment, never transmitted. Firebase and Socket.IO relay store/forward ciphertext only.

See [`docs/technical/encryption.md`](../technical/encryption.md).

---

### 2.9 Conflict Reconciliation

LWW with `version` (monotonic) + `versionNonce` (random tiebreaker) per element. Locally-active elements protected from remote overwrites. Fractional indices repaired after merge. Not OT/CRDT — eventual consistency via periodic full-scene syncs.

See [`docs/technical/conflict-reconciliation.md`](../technical/conflict-reconciliation.md).

---

### 2.10 Data Persistence

Four layers: localStorage (L1) → IndexedDB (L2) → Firebase Firestore (L3) → Firebase Storage (L4). Cross-tab sync via `BroadcastChannel` backed by `VersionedSnapshotStore`.

See [`docs/technical/data-persistence.md`](../technical/data-persistence.md).

---

## 3. Patterns to Avoid

| Anti-Pattern | Reason |
|---|---|
| **Redux / global mutable store** | Jotai provides fine-grained reactivity without boilerplate |
| **SSR** | Canvas + Web Crypto API are browser-only |
| **Transmitting encryption keys** | Keys live only in URL fragments, never sent to any server |
| **Storing plaintext server-side** | All cloud storage holds only AES-GCM ciphertext |
| **Direct DOM mutation outside React** | Canvas via `requestAnimationFrame` + Canvas 2D; UI via state only |
| **Polling** | WebSocket / BroadcastChannel / `VersionedSnapshotStore.pull()` replace polling |

---

## 4. Related Documentation

| Document | Path |
|---|---|
| Technical Architecture | [`docs/technical/architecture.md`](../technical/architecture.md) |
| Real-Time Collaboration | [`docs/technical/realtime-collaboration.md`](../technical/realtime-collaboration.md) |
| End-to-End Encryption | [`docs/technical/encryption.md`](../technical/encryption.md) |
| Conflict Reconciliation | [`docs/technical/conflict-reconciliation.md`](../technical/conflict-reconciliation.md) |
| Data Persistence | [`docs/technical/data-persistence.md`](../technical/data-persistence.md) |
