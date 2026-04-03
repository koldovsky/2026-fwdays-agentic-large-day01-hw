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

## Undocumented Behavior 3: Encryption Key Lives Only in the URL Fragment — Server Provably Cannot Decrypt

**File:** `excalidraw-app/data/index.ts`, `excalidraw-app/collab/Collab.tsx`

**What the code does:**
```text
Room URL format: https://excalidraw.com/#room=<roomId>,<base64Key>
```

The AES-GCM encryption key is stored after the `#` (fragment) in the collaboration URL. HTTP clients never send the fragment to the server — it stays in the browser. So Firebase and the Socket.io server receive only ciphertext; they cannot decrypt scene data even if compelled.

**What documentation says:** The homepage says "end-to-end encrypted" but does not explain the URL fragment mechanism or its security implications.

**Why this exists:** This is a deliberate privacy-by-design decision. Using the URL fragment means the architecture provably prevents server-side decryption without needing users to trust Excalidraw's privacy policy.

**Impact:** The room ID and the encryption key are both in the URL fragment. When building on top of Excalidraw's collab, do not log or proxy the full URL — doing so would expose the encryption key.

---

## Related Documentation

### Memory Bank
- [System Patterns](systemPatterns.md) - Architecture patterns
- [Tech Context](techContext.md) - Technology stack
- [Project Brief](projectbrief.md) - Project overview

### Technical Documentation
- [Architecture](../technical/architecture.md) - System architecture
- [Dev Setup](../technical/dev-setup.md) - Development guide

### Product Documentation
- [Domain Glossary](../product/domain-glossary.md) - Terminology
- [PRD](../product/PRD.md) - Product requirements
