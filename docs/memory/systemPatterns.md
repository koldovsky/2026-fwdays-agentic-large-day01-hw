# System Patterns

## Architectural Style

- Primary style: client-heavy SPA backed by a monorepo of shared packages.
- Packaging style: one hosted product app plus reusable libraries published independently.
- Persistence style: local-first browser storage with selective backend synchronization.
- Collaboration style: event-driven sync over WebSocket with periodic full-scene correction.

## Core Patterns

### Local-First Persistence

- Scene elements and app state are written to `localStorage` after a `300ms` debounce.
- Files, library data, and TTD chats use IndexedDB instead of `localStorage` for size and structure reasons.
- The app remains usable offline even when realtime sync or remote persistence is unavailable.

### Encrypted Remote Sharing

- Collaboration rooms use a room ID plus a client-side encryption key embedded in the URL hash.
- Shareable links store encrypted and compressed scene payloads remotely while keeping the decryption key client-side in the URL hash.
- Consequence: the server stores opaque payloads, but URL handling becomes part of the security model.

### Incremental Sync With Full Resync Safety Net

- `Portal.broadcastScene()` usually emits only changed syncable elements.
- The app performs a full scene sync every `20s` to reduce drift from dropped or delayed messages.
- Deleted elements remain syncable for roughly `1 day` so stale peers do not revive removed content.

### Multi-Layer Storage

- `localStorage` stores lightweight scene and app state.
- IndexedDB stores heavier binary/file payloads and persisted chat history.
- Firebase Firestore stores encrypted room scene documents.
- Firebase Storage stores room and share-link image binaries.

### Browser-Tab Version Arbitration

- The app writes `version-dataState` and `version-files` timestamps into `localStorage`.
- Before restoring, the app checks whether another tab wrote newer browser state.
- Trade-off: the implementation is lightweight, but ordering is timestamp-based rather than transactional.

### Feature Surface Separation

- Main editor behavior lives in `packages/excalidraw`.
- Product-specific behaviors such as collaboration, AI dialogs, share dialogs, Sentry, and Plus integration stay in `excalidraw-app`.
- Result: the npm package remains embeddable while the hosted app can add product-specific UI and service integrations.

## Data Flow Overview

### Local Editing Flow

1. User edits elements in the `Excalidraw` component.
2. The editor updates in-memory scene state plus `AppState`.
3. The hosted app debounces persistence through `LocalData.save()`.
4. Scene and app state are written to `localStorage`, files go to IndexedDB, and cross-tab version markers are updated.

### Collaboration Flow

1. User opens a `#room=` URL or starts a live session.
2. `Collab.tsx` uses `Portal.tsx` to join a Socket.IO room.
3. Initial room state is loaded from Firebase, then reconciled with current in-memory state.
4. Subsequent updates stream over WebSocket as encrypted event payloads.
5. Scene snapshots are also persisted to Firestore for recovery and late joiners.
6. Files are uploaded to Firebase Storage and peers fetch them on demand.

### Share-Link Flow

1. User exports the current scene to the share backend.
2. Scene JSON is serialized, compressed, encrypted, and POSTed.
3. Image files are uploaded separately to Firebase Storage under a share-link prefix.
4. The returned share ID plus the client-held decryption key becomes a `#json=` URL.

### AI Flow

1. User triggers Diagram-to-Code or TTD UI from the hosted app.
2. The client prepares image/text payloads from the current scene or frame.
3. The request is sent to the external AI backend.
4. Responses stream or return generated HTML/code.
5. TTD chat history is stored locally in IndexedDB.

## Scaling Approach

- Frontend bundle scaling:
  - Vite code-splits locales, Mermaid conversion, and CodeMirror-related chunks.
- Network scaling:
  - incremental sync reduces broadcast size
  - volatile events are used for cursor, viewport, and user-state updates
- Storage scaling:
  - binary data is pushed out of `localStorage` into IndexedDB and Firebase Storage
- Operational scaling:
  - the static app can be hosted on Vercel or Nginx while collaboration, sharing, and AI remain separate services

## Patterns Not Present Or Not Dominant

- Not a microservices repo; external services exist, but this repository is primarily a frontend monorepo.
- No clear CQRS or event-sourcing model; the app uses direct scene mutation plus reconciliation.
- No multi-tenancy model is evident in the product code examined.

## Related Docs

- Product workflows that these patterns support: [../product/PRD.md](../product/PRD.md)
- Terminology for scenes, reconciliation, rooms, and syncable elements: [../product/domain-glossary.md](../product/domain-glossary.md)
- Component/module breakdown and runtime topology: [../technical/architecture.md](../technical/architecture.md)
- Edge cases and hidden runtime rules behind these patterns: [decisionLog.md](decisionLog.md)