# Product Requirements Document
## Excalidraw — Reverse-Engineered PRD

> **Note:** This PRD is reverse-engineered from the codebase and public product. It reflects the product as it exists, not a forward-looking specification.

---

## 1. Product Vision

Excalidraw is a **privacy-first, collaborative whiteboard** for creating hand-drawn style diagrams, wireframes, and sketches in the browser. It is designed to feel as low-friction as paper while enabling real-time collaboration with strong privacy guarantees.

**North star:** Anyone should be able to open a blank canvas, draw something meaningful, and share it securely — in under 60 seconds, without creating an account.

---

## 2. Target Audiences

### Primary: Individual Knowledge Workers
- Engineers sketching system designs before writing code
- Product managers wireframing flows for stakeholder review
- Designers creating low-fidelity mockups to avoid premature polish

**Key need:** A fast, low-barrier tool that signals "this is a draft" without the formality of Figma or Lucidchart.

### Secondary: Development Teams
- Teams that want a shared whiteboard embedded in their tooling (Notion, Linear, custom apps)
- Engineering teams that need collaborative architecture diagrams during incidents

**Key need:** An embeddable React component (`@excalidraw/excalidraw`) with a clean API and zero vendor lock-in.

### Tertiary: Privacy-Sensitive Organizations
- Legal, healthcare, or government teams that cannot use cloud SaaS tools
- Organizations with strict CSP/data residency requirements

**Key need:** A self-hostable deployment with no data leaving their infrastructure, backed by E2E encryption.

---

## 3. Core Use Cases

### UC-1: Instant Whiteboarding
1. User navigates to excalidraw.com
2. Canvas is ready immediately (no login, no onboarding wizard)
3. User draws shapes, adds text, connects with arrows
4. User exports as PNG/SVG or saves the URL

**Success criteria:** Time-to-first-draw < 3 seconds.

### UC-2: Real-Time Collaboration
1. User clicks "Share" → gets an encrypted URL
2. Collaborators open the URL → join the same live canvas
3. All cursors and changes appear in real time (< 100 ms latency on LAN)
4. Session is end-to-end encrypted; the server never sees plaintext

**Success criteria:** Multi-user session works with zero account creation on either side.

### UC-3: Embed in Another Application
1. Developer installs `@excalidraw/excalidraw` from npm
2. Renders `<Excalidraw />` inside their React app
3. Uses the imperative API to read/write elements programmatically

**Success criteria:** npm package works without any Excalidraw backend dependency.

### UC-4: Text-to-Diagram (AI)
1. User opens TTD dialog, describes a diagram in natural language
2. AI generates a Mermaid diagram
3. Mermaid is auto-converted to Excalidraw elements and inserted
4. User refines via chat or direct editing

**Success criteria:** Usable diagram in < 10 seconds from prompt submission.

### UC-5: Offline Editing
1. User draws on canvas with no network connection
2. Changes persist to localStorage automatically (every 300 ms)
3. When network returns, changes sync to collab room

**Success criteria:** Zero data loss on browser crash or network drop.

---

## 4. Key Features

### 4.1 Drawing Tools
| Tool | Description |
|------|-------------|
| Selection | Click/lasso to select and move elements |
| Rectangle, Diamond, Ellipse | Basic shapes with fill styles |
| Arrow, Line | Linear elements with arrowheads and binding |
| Text | Inline text editing, auto-sizing |
| Freedraw | Pressure-sensitive freehand strokes |
| Image | Drag-and-drop image embedding (max 4 MiB) |
| Frame | Named containers for grouping elements |
| Eraser | Remove elements by painting over them |
| Laser Pointer | Presentation tool, broadcast-only, no canvas marks |

### 4.2 Collaboration
- Real-time multi-user editing via WebSocket
- Cursor broadcasting with user labels
- Idle state tracking (IDLE after 3 s)
- User follow mode (lock viewport to another user)
- End-to-end encryption (AES-GCM, key in URL fragment)

### 4.3 Export & Import
- **Export:** PNG (1×/2×/3× scale), SVG, JSON (`.excalidraw`)
- **Import:** Excalidraw JSON, Mermaid diagrams, image drag-and-drop
- **Round-trip:** Exported PNGs embed full scene in metadata; dragging back into the canvas recovers all elements

### 4.4 AI Features
- **TTD (Text to Diagram):** Natural language → Mermaid → Excalidraw elements
- **Magic Frame:** Select area → AI fills with diagram content
- Chat interface for iterative refinement

### 4.5 Library System
- Save element groups to a personal reusable library
- Share libraries via URL
- Import community libraries from the library portal

### 4.6 Offline / PWA
- Works fully offline (PWA, Service Worker)
- Auto-saves to localStorage every 300 ms
- No data loss on browser crash

---

## 5. Technical Constraints

| Constraint | Detail |
|-----------|--------|
| Browser-only | No server-side rendering of canvas; all rendering is client-side Canvas2D |
| No persistent accounts (free tier) | Collaboration via shared encrypted URL only; no user identity |
| Encryption mandatory | All collaboration data is AES-GCM encrypted; server stores only ciphertext |
| Max image size: 4 MiB | Images are compressed before upload; oversized files are rejected |
| React 19 dependency | The npm package requires React 19 as a peer dependency |
| Offline-first | Core features must work without network; collab is progressive enhancement |
| Package size discipline | The core library is split into packages to enable tree-shaking |

---

## 6. Non-Goals

- **Pixel-perfect design tool**: Excalidraw is intentionally imprecise; it is not a Figma replacement
- **Presentation mode**: While a laser pointer exists, slide-show features are out of scope
- **Version history**: No built-in undo beyond the session; no revision history UI
- **Access control**: The free tier has no concept of who can view/edit a shared URL (anyone with the link can edit)
- **Real-time video/audio**: Collaboration is canvas-only; no built-in voice/video

---

## 7. Success Metrics (Inferred)

| Metric | Target |
|--------|--------|
| Time-to-first-draw | < 3 s on average connection |
| Collab session join latency | < 2 s to receive initial scene |
| Scene sync latency | < 100 ms for incremental updates |
| Offline resilience | Zero data loss on network drop |
| npm weekly downloads | Growing (package is widely embedded) |

---

## 8. Open Questions

1. What is the maximum supported scene size (element count) before performance degrades?
2. Is there a rate limit on the Firebase Storage uploads for images?
3. What is the retention policy for encrypted scenes stored in Firebase?
4. Does the AI backend have a fallback if the primary endpoint is unavailable?

---

## Related Docs

- Product context: [`../memory/productContext.md`](../memory/productContext.md)
- Domain glossary: [`domain-glossary.md`](domain-glossary.md)
- Architecture: [`../technical/architecture.md`](../technical/architecture.md)
- Project brief: [`../memory/projectbrief.md`](../memory/projectbrief.md)
