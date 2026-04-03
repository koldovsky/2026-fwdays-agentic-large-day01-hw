# Decision Log

Records architectural decisions and undocumented behaviors discovered through code archaeology.

---

## Undocumented Behavior 1: Deleted Elements Are Kept Alive for 24 Hours During Sync

**File:** `excalidraw-app/app_constants.ts:9`, `excalidraw-app/data/index.ts:46-56`

**What the code does:**
```typescript
export const DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day

export const isSyncableElement = (element) => {
  if (element.isDeleted) {
    if (element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT) {
      return true;  // Sync deleted elements if < 24h old
    }
    return false;
  }
  return !isInvisiblySmallElement(element);
};
```

**What documentation says:** There is no mention in any user-facing docs that deleted elements continue to be synchronized.

**Why this exists:** In a collaborative session, if User A deletes an element and User B is offline, when B reconnects their local scene might still have the element. By keeping `isDeleted: true` elements in the sync payload for 24 hours, B's client receives the deletion and removes it. After 24 hours the element is pruned from sync payloads, assuming all clients have received the deletion.

**Impact:** Deleted elements are not truly gone immediately — they remain in the wire protocol and in Firebase for up to 24 hours.

---

## Undocumented Behavior 2: `window.EXCALIDRAW_ASSET_PATH` Overrides CDN for Self-Hosting

**File:** `excalidraw-app/index.html:132`

**What the code does:**
```html
<script>
  window.EXCALIDRAW_ASSET_PATH = window.origin;
</script>
```

The `@excalidraw/excalidraw` package loads fonts and other static assets from a CDN by default. Setting `window.EXCALIDRAW_ASSET_PATH` before the app initializes redirects all asset requests to that origin instead.

**What documentation says:** The npm package README does not document this global override. Self-hosting guides (if any) don't mention it.

**Why this exists:** Allows self-hosters to serve assets from their own domain, which is required for strict Content Security Policy (CSP) environments. The `excalidraw-app/index.html` sets it to `window.origin` so the hosted app serves its own assets instead of the external CDN.

**Impact:** Embedders who set `window.EXCALIDRAW_ASSET_PATH` to their own server can completely avoid external CDN dependencies. Without this, font loading will attempt to reach the Excalidraw CDN.

---

## Undocumented Behavior 3: Scene Data Embedded in Exported PNG Metadata Chunks

**File:** `packages/excalidraw/data/image.ts:1`, `packages/excalidraw/global.d.ts:35-48`

**What the code does:**
```typescript
import tEXt from "png-chunk-text";
// ...
// Scene JSON is written into a tEXt PNG chunk with key "excalidraw"
// This allows re-importing a PNG and recovering the full editable scene
```

When exporting to PNG, the full Excalidraw scene (all elements + appState) is serialized as JSON and embedded in a `tEXt` PNG metadata chunk. When a user drags the exported PNG back into the Excalidraw canvas, the scene is reconstructed from this hidden chunk — not from the visual pixels.

**What documentation says:** The export dialog says "Export as PNG" with no mention that the file contains hidden scene data.

**Why this exists:** Provides a lossless round-trip — a PNG exported from Excalidraw is also a valid Excalidraw file. Users get a universally viewable image that also retains full editability.

**Impact:** Exported PNGs are larger than minimal PNGs because they carry the full scene JSON. Also means exported PNGs may contain data the user did not intend to share (e.g., hidden elements with `isDeleted: true` that were in the session).

---

## Undocumented Behavior 4: Encryption Key Lives Only in the URL Fragment — Server Provably Cannot Decrypt

**File:** `excalidraw-app/data/index.ts`, `excalidraw-app/collab/Collab.tsx`

**What the code does:**
```
Room URL format: https://excalidraw.com/#room=<roomId>,<base64Key>
```

The AES-GCM encryption key is stored after the `#` (fragment) in the collaboration URL. HTTP clients never send the fragment to the server — it stays in the browser. So Firebase and the Socket.io server receive only ciphertext; they cannot decrypt scene data even if compelled.

**What documentation says:** The homepage says "end-to-end encrypted" but does not explain the URL fragment mechanism or its security implications.

**Why this exists:** This is a deliberate privacy-by-design decision. Using the URL fragment means the architecture provably prevents server-side decryption without needing users to trust Excalidraw's privacy policy.

**Impact for developers:** The room ID and the encryption key are both in the URL fragment. When building on top of Excalidraw's collab, do not log or proxy the full URL — doing so would expose the encryption key.

---

## Undocumented Behavior 5: `versionNonce` as a Deterministic Tiebreaker in Conflict Resolution

**File:** `packages/element/tests/delta.test.tsx:43-55`, element types

**What the code does:**
```typescript
// Each element has two versioning fields:
version: number       // Incremented on every mutation
versionNonce: number  // Random integer, regenerated on every mutation

// Reconciliation logic (paraphrased):
if (remoteEl.version > localEl.version) { use remote }
else if (remoteEl.version === localEl.version) {
  if (remoteEl.versionNonce > localEl.versionNonce) { use remote }
  else { use local }
}
```

When two clients mutate the same element simultaneously, both end up with `version = N+1` but different `versionNonce` values. The higher nonce wins — this provides deterministic last-writer-wins without requiring a central timestamp.

**What documentation says:** The public API docs describe `version` as "used for reconciliation" but do not mention `versionNonce` or explain the tiebreaker logic.

**Why this exists:** A purely version-based system would cause split-brain when two clients make the same number of edits concurrently. `versionNonce` breaks the tie without a central clock or coordination round-trip, keeping the collaboration protocol simple and peer-to-peer.

**Impact:** When integrating with the Excalidraw element API, never set `versionNonce` to a fixed value — doing so breaks concurrent edit merging. Always generate it randomly (as the library does internally).

---

## Architectural Decision: Jotai Scope Isolation Per Editor Instance

**Date discovered:** 2026-04-03

**Decision:** Each Excalidraw component instance gets its own `editorJotaiStore` (via `jotai-scope`) rather than sharing the global Jotai store.

**Why:** Allows multiple independent Excalidraw editors on the same page (e.g., a page with multiple canvases) without state leakage. Without scoping, atom writes in one editor would affect all editors.

**Trade-off:** Slightly more complex initialization; Jotai DevTools need to be connected to the per-instance store to inspect atoms.

---

## Related Docs

- System patterns: [`systemPatterns.md`](systemPatterns.md)
- Active context: [`activeContext.md`](activeContext.md)
- Architecture: [`docs/technical/architecture.md`](../docs/technical/architecture.md)
