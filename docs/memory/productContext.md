# Product Context: Excalidraw

**Version:** 1.0
**Date:** 2026-03-28
**Status:** Active

---

## 1. Product Vision

Excalidraw is a browser-based virtual whiteboard that lets anyone create beautiful, hand-drawn-style diagrams instantly — no sign-up, no friction. It is both a production web app (`excalidraw.com`) and a reusable React component (`@excalidraw/excalidraw`) that third-party developers can embed in their own products.

---

## 2. Core User Personas

| Persona | Description | Primary Goals |
|---|---|---|
| **Individual Creator** | Student, freelancer, or knowledge worker using excalidraw.com ad-hoc | Quickly sketch ideas, diagrams, or notes; export/share results |
| **Team Collaborator** | Team member in a live whiteboard session | Co-edit a diagram in real time with colleagues via a shared room link |
| **Technical / Engineering User** | Software engineer or architect creating system diagrams, flowcharts, or ERDs | Build structured technical diagrams; use AI-assisted Mermaid generation |
| **Third-Party Developer** | Engineer embedding `@excalidraw/excalidraw` in their product | Integrate the canvas component; control the scene programmatically via the imperative API |
| **Excalidraw Plus User** | Subscriber to the paid tier managed externally | Access additional persistence, team features, and cloud storage provided by the Plus backend |
| **Open-Source Contributor** | Community member submitting code, translations, or library shapes | Fix bugs, add features, contribute translations via Crowdin |

---

## 3. Key Workflows

### 3.1 Create & Edit a Diagram (Solo)
1. Open excalidraw.com — canvas is ready immediately (no login required).
2. Select a drawing tool (shape, arrow, text, freedraw, image, frame, embeddable).
3. Add, style, resize, rotate, and group elements on the canvas.
4. Use undo/redo, snap-to-grid, and alignment tools to refine the layout.
5. Export as PNG, SVG, or `.excalidraw` JSON, or copy to clipboard.

### 3.2 Real-Time Collaboration
1. Click **Live Collaboration** → a shareable room link is generated (URL fragment holds the encryption key).
2. Share the link with collaborators; each joins the same encrypted room.
3. All cursor positions and scene mutations are broadcast via WebSocket and applied with conflict reconciliation.
4. Use **Follow Mode** to track a specific collaborator's viewport.
5. Session ends when participants leave; scene is also saved locally.

### 3.3 AI-Assisted Diagramming (Text-to-Diagram)
1. Open the **TTD (Text-to-Diagram)** dialog.
2. Describe a diagram in natural language or paste Mermaid syntax.
3. The AI backend returns a Mermaid diagram; the app validates, auto-fixes, and renders it to the canvas.
4. Chat history is stored in IndexedDB for continuity across sessions.

### 3.4 Import Data as Charts
1. Copy tabular data (e.g., from a spreadsheet).
2. Paste into the canvas — Excalidraw detects the structure and offers chart types (bar, line, radar).
3. The chart is rendered as native Excalidraw elements (editable and exportable).

### 3.5 Library Management
1. Build a personal shape library by adding selected elements.
2. Import/export library files (`.excalidrawlib`).
3. Browse and import shapes from the community library portal.

### 3.6 Embed the Component (Developer)
1. Install `@excalidraw/excalidraw` from npm.
2. Mount the `<Excalidraw />` React component with desired props and callbacks.
3. Use `ExcalidrawImperativeAPI` to read/write scene state, listen to events, and customise the UI surface.

---

## 4. Data Flows

### Canvas Scene Data
```
User interaction (pointer/keyboard)
  → React state + Jotai atoms
  → Element mutations (packages/element)
  → Scene store (versioned snapshot)
  → Auto-save to localStorage (300 ms debounce)
  → [If collaboration] Delta-diff + AES-GCM encryption → WebSocket (Socket.IO) → Collaboration server → Peers
  → [If share link] AES-GCM encryption → Firebase Firestore
```

### Binary File Data (Images)
```
User pastes / drops image
  → Blob → DataURL → IndexedDB (local)
  → [If collaboration or share link] AES-GCM encryption → Firebase Storage (/files/rooms or /files/shareLinks)
  → Referenced by element via FileId; fetched and decrypted on demand by peers
```

### AI / TTD Flow
```
User inputs text / Mermaid
  → TTDStreamFetch → External AI API endpoint (env-configured)
  → Streaming Mermaid response → mermaid validation + auto-fix
  → Mermaid-to-Excalidraw conversion → elements placed on canvas
  → Chat history written to IndexedDB (IDB_TTD_CHATS key)
```

### Collaboration Sync
```
Local scene mutation
  → Portal (Socket.IO client)
  → Encrypted SCENE_UPDATE event → Collaboration WebSocket server → all room peers
  → Full scene sync every 20 s (SYNC_FULL_SCENE_INTERVAL_MS) as safety net
  → Cursor position broadcast ~30 fps (CURSOR_SYNC_TIMEOUT = 33 ms)
```

### Cross-Tab Sync
```
Scene write → localStorage → BroadcastChannel (SYNC_BROWSER_TABS_TIMEOUT = 50 ms) → other open tabs reconcile state
```

---

## 5. Integration Points

| System | Purpose | Configuration |
|---|---|---|
| **Firebase Firestore** | Persist encrypted collaboration room state and share-link scene data | `VITE_APP_FIREBASE_CONFIG` env var |
| **Firebase Storage** | Store encrypted binary files (images) for rooms and share links | Same Firebase project; prefixes `/files/rooms`, `/files/shareLinks` |
| **Socket.IO Collaboration Server** | WebSocket relay for real-time scene delta and cursor updates | `VITE_APP_WS_SERVER_URL` env var (external server, not in this repo) |
| **External AI API** | Text-to-Diagram and Diagram-to-Code generation | `VITE_APP_AI_BACKEND` / TTD endpoint env var |
| **Crowdin** | Community-driven i18n translation management | `crowdin.yml` in repo root; CI sync |
| **Sentry** | Client-side error monitoring (opt-in) | `VITE_APP_SENTRY_DSN` env var; disabled in Docker builds |
| **Excalidraw Plus Backend** | Paid tier account management, advanced persistence | UI-level redirect/prompt only; auth detected via `excplus-auth` cookie |
| **Community Library Portal** | Browsable repository of shareable shape libraries | Opened via in-app "Browse libraries" button (external URL) |
| **Vercel** | Hosting for `excalidraw.com` | `vercel.json` in repo root |
| **Docker** | Self-hosted deployment | `Dockerfile` + `docker-compose.yml` in repo root |

---

## 6. Domain Concepts

| Term | Definition |
|---|---|
| **Scene** | The complete set of elements and app state that constitutes a drawing. Serialised as `.excalidraw` JSON. |
| **Element** | A single drawable object on the canvas (rectangle, ellipse, arrow, text, image, frame, etc.). Each has a stable `id`, type, geometry, and style properties. |
| **AppState** | Transient UI state (selected tool, zoom level, scroll position, open panels) that accompanies but is separate from the scene's elements. |
| **Collaboration Room** | A temporary shared session identified by a random room ID. All participants connect via WebSocket and share an AES-GCM encryption key embedded in the URL fragment. |
| **Portal** | The Socket.IO client abstraction (`excalidraw-app/collab/Portal.ts`) that manages the WebSocket connection lifecycle for a collaboration room. |
| **FileId** | A content-addressable identifier (hash) for a binary file asset (image). Elements reference files by `FileId`; the file data is stored separately in IndexedDB or Firebase Storage. |
| **Frame** | A named rectangular container element that groups child elements; used for organising canvases and as the unit for Diagram-to-Code exports. |
| **Library** | A named, persistent collection of reusable element groups stored in IndexedDB. Importable/exportable as `.excalidrawlib` files. |
| **TTD (Text-to-Diagram)** | The AI-assisted workflow where natural language or Mermaid syntax is converted into Excalidraw elements via an external AI API. |
| **Mermaid** | A text-based diagram syntax used as an intermediate representation in the TTD pipeline before conversion to native elements. |
| **End-to-End Encryption** | AES-GCM 128-bit encryption applied on the client before any data leaves the browser. Keys live exclusively in the URL fragment and are never transmitted to any server. |
| **Reconciliation** | The algorithm (`data/reconcile.ts`) that merges divergent element states from multiple collaborators, using scene version numbers and element version vectors to resolve conflicts. |
| **Fractional Index** | A sortable key assigned to each element to determine z-order (rendering stack), enabling stable ordering across concurrent edits. |
| **Embeddable** | An element type that renders an external URL (e.g., YouTube, Figma) as an iframe within the canvas. |
| **ExcalidrawImperativeAPI** | The programmatic handle exposed to consumers of the npm component, allowing external code to read/write the scene, execute actions, and subscribe to events. |

---

## 7. Assumptions & Constraints

- **Browser-only:** The entire product runs client-side. There is no server-side rendering or SSR; Node.js ≥ 18 is required only for the build toolchain.
- **Modern evergreen browsers:** Chrome ≥ 70, Firefox, Safari ≥ 12, Edge ≥ 79. No IE 11 support. Web Crypto API, Canvas API, and IndexedDB are required.
- **External collaboration server:** The WebSocket relay server is operated separately and is not part of this repository. The client gracefully degrades to offline/solo mode if it is unavailable.
- **External AI endpoint:** TTD and Diagram-to-Code features require a separately hosted AI API. Without it, those panels are non-functional.
- **Firebase project required for cloud features:** Share links and collaboration persistence only work when a Firebase project is configured via environment variables. Self-hosted deployments without Firebase lose these features.
- **Collaboration data is ephemeral:** Room data is tied to the room lifetime; users must export their scene to persist it beyond a session unless using Excalidraw Plus.
- **No built-in authentication:** User identity is ephemeral and locally stored. Account management is out of scope for this repository (delegated to Excalidraw Plus).
- **File size limit:** Binary file uploads are capped at 4 MiB (`FILE_UPLOAD_MAX_BYTES`).
- **Translations are community-maintained:** Core engineering does not own translation coverage; Crowdin manages locale contributions.
- **MIT license:** All dependencies must be open-source-compatible.

---

## 8. Current State & Challenges

### Current State
Excalidraw is a mature, production-grade open-source product actively used at `excalidraw.com` and widely embedded via the npm package. The monorepo has been refactored into focused sub-packages (`common`, `math`, `element`, `excalidraw`, `utils`) to improve modularity and tree-shakeability. AI-assisted diagramming (TTD + Diagram-to-Code) is a relatively recent addition and is actively being developed.

### Known Pain Points & Challenges

| Challenge | Detail |
|---|---|
| **Large-canvas performance** | Scene rendering can degrade for very large diagrams (hundreds of elements). Ongoing optimisation of the canvas rendering pipeline and virtual viewport clipping is required. |
| **Collaboration state conflicts** | Concurrent edits can produce briefly inconsistent states. The reconciliation algorithm and periodic full-scene syncs (`20 s`) mitigate but do not fully eliminate conflicts. |
| **Encryption key loss** | If a user loses the share link URL (which embeds the AES key in the fragment), encrypted scene data stored in Firebase becomes permanently inaccessible. |
| **Firebase vendor coupling** | Cloud persistence is tightly coupled to Firebase Firestore/Storage, making migration to an alternative backend a significant effort despite the abstraction layer. |
| **npm package API stability** | As the package grows, maintaining a stable public API surface while refactoring internals is an ongoing tension. Breaking changes require careful semantic versioning. |
| **TTD reliability** | AI-generated Mermaid output frequently contains syntax errors; the `mermaidAutoFix` utilities mitigate this but do not cover all cases, leading to occasional failed renders. |
| **Mobile / touch experience** | The product is desktop-first; touch and pen input are supported via pointer events and the PEP polyfill, but the mobile experience lags behind the desktop UX. |
| **Monorepo build complexity** | Managing inter-package dependencies, build order (`common → math → element → excalidraw`), and consistent TypeScript types across packages adds overhead for contributors. |

---

## 9. Related Documentation

| Document | Location | Relationship |
|---|---|---|
| **Product Requirements Document** | [`docs/product/PRD.md`](../product/PRD.md) | Full feature specifications, user role definitions, and acceptance criteria that expand on the workflows and integration points in §3–§5 |
| **Domain Glossary** | [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Complete, authoritative definitions for all domain terms listed in §6; use the glossary as the canonical reference when terminology is ambiguous |
