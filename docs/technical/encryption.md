# End-to-End Encryption

**Status:** Active

---

## Overview

All collaboration and share-link data is encrypted **client-side before leaving the browser**. Servers (Firebase, Socket.IO relay) receive and store only ciphertext — they never see plaintext diagram data.

**File:** `packages/excalidraw/data/encryption.ts`

---

## Encryption Parameters

| Property | Value |
|---|---|
| **Algorithm** | AES-GCM |
| **Key length** | 128-bit |
| **IV** | 12-byte random per message |
| **Key format** | JWK (exportable) |
| **API** | Web Crypto API (`window.crypto.subtle`) |
| **Key distribution** | URL fragment (`#roomId,key`) — never transmitted to server |

---

## Key Distribution

The encryption key lives exclusively in the URL fragment (`#roomId,key`). Fragments are not sent in HTTP requests, so the key never reaches any server. This means:

- Firebase Firestore and Firebase Storage hold only AES-GCM ciphertext blobs.
- The Socket.IO relay forwards only ciphertext.
- Sentry's `beforeSend()` hook strips the URL fragment before logging (see [`docs/technical/error-handling.md`](./error-handling.md)).

**Known trade-off:** Key loss (URL fragment cleared or lost) means permanent, unrecoverable data loss. This is an accepted consequence of the zero-trust storage model.

---

## Usage Contexts

| Context | What is encrypted |
|---|---|
| Collaboration rooms | Every `SCENE_UPDATE` and `FULL_SCENE_UPDATE` payload |
| Share links | Exported scene JSON stored in Firebase Storage |
| Binary file assets | Images uploaded to Firebase Storage for collab rooms |

---

## Anti-Patterns Avoided

- **Synchronous crypto** — all operations use the async `window.crypto.subtle` API; synchronous crypto would block the main thread.
- **Key transmission** — keys are never sent to Firebase, the Socket.IO relay, or any logging/analytics pipeline.
- **Plaintext server storage** — servers are treated as untrusted relays; no plaintext is persisted remotely.

---

## Related Documentation

| Document | Location | Relationship |
|---|---|---|
| **System Patterns** | [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md) | Pattern-level summary of E2E encryption (§3.6) |
| **Real-Time Collaboration** | [`docs/technical/realtime-collaboration.md`](./realtime-collaboration.md) | Collaboration transport that uses this encryption for every payload |
| **Error Handling** | [`docs/technical/error-handling.md`](./error-handling.md) | Sentry `beforeSend()` hook that strips the key fragment before logging |
| **Technical Architecture** | [`docs/technical/architecture.md`](./architecture.md) | System-wide zero-trust storage design |
