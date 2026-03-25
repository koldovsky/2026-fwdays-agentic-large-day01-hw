# Product Requirements Document — Excalidraw

_Reverse-engineered from source code and Memory Bank._

---

## 1. Product Reason

Existing diagramming and whiteboarding tools are either heavyweight (require accounts, complex UIs, proprietary formats) or lack the informal, approachable aesthetic that encourages quick ideation. Excalidraw fills the gap: a frictionless, open-source, hand-drawn-style canvas that works instantly in the browser — no sign-up, no install, no ceremony.

---

## 2. Product Goal

1. **Component**: Ship `@excalidraw/excalidraw` (npm) as a best-in-class, embeddable React whiteboard component with a clean imperative API.
2. **Hosted app**: Operate `excalidraw.com` as a zero-friction collaborative whiteboard available to anyone with a browser.
3. **Ecosystem**: Maintain an MIT-licensed codebase that the community can fork, extend, and integrate freely.

---

## 3. Target Audience

| Segment | Description |
|---|---|
| **End users** | Anyone needing a quick sketch, flowchart, or brainstorm board — no technical background required. |
| **Developers / integrators** | Engineers embedding `<Excalidraw />` inside SaaS products, internal tools, IDEs, or note-taking apps. |
| **Open-source contributors** | Maintainers and community members extending drawing tools, locales, or the collaboration backend. |
| **Technical communicators** | Engineers and architects producing architecture diagrams, flow charts, and teaching visuals. |

---

## 4. Key Features

### 4.1 Core Drawing

- Shapes: rectangle, ellipse, diamond, line, arrow (including elbow/smart-routing arrows), freehand pencil, text, image, frame.
- Infinite canvas with pan and zoom.
- Layer-level grouping and frame containers.
- Flowchart auto-layout.
- Mermaid-to-diagram (TTD) and AI diagram generation.

### 4.2 Collaboration

- One-click shareable room URL (no account needed).
- Real-time multi-user cursor and scene sync via Socket.io (volatile events for cursors, persistent events for scene mutations).
- End-to-end encryption: room key embedded in URL hash, never transmitted to server.
- Firebase Firestore for scene snapshots (late-join recovery); Firebase Storage for binary files.
- Follow-mode, idle/active status broadcast, laser pointer for presentations.
- Animated SVG overlay layer for laser-pointer trails and lasso-selection trails (rendered outside the React cycle via `requestAnimationFrame`).

### 4.3 Export & Persistence

- Export: PNG, SVG, JSON (`.excalidraw`), clipboard copy, Excalidraw+ cloud.
- Auto-save to `localStorage` (scene) and IndexedDB (binary files) every ~300 ms (debounced).
- PWA: installable, offline-first service worker.
- Multi-tab sync via `BroadcastChannel` — all open tabs receive scene updates without a server round-trip.
- Soft-delete semantics: deleted elements are marked `isDeleted: true` and retained for 24 h before being pruned, enabling late-joining collaborators to receive complete diffs.

### 4.4 Embeddable Component API

- `<Excalidraw />` React component with imperative `ExcalidrawAPI` ref.
- Props: `initialData`, `onChange`, `onMount`, `langCode`, `theme`, `UIOptions`, etc.
- Supports Next.js (SSR-safe) and plain-browser (CDN/script) integration.
- Published as ESM-only (`@excalidraw/excalidraw` v0.18+).

### 4.5 Localisation & Accessibility

- 70+ community-translated locales managed via Crowdin.
- Auto-detection from browser language.
- Keyboard-navigable toolbar, ARIA labels, screen reader support.

---

## 5. Technical Restrictions

### 5.1 Runtime

| Constraint | Value |
|---|---|
| Minimum Node.js | 18.0.0 |
| Package manager | Yarn 1.22 (classic workspaces) |
| TypeScript | 5.x, strict mode |
| React | 19.x (peer dependency for consumers) |
| Bundle format | ESM only — no UMD (deprecated in 0.18.0) |

### 5.2 Architecture Constraints

**Package boundary rules** — enforced by import discipline, not tooling:

| Package | Allowed imports |
|---|---|
| `packages/math` | None (no DOM, no React, no internal packages) |
| `packages/common` | `math` only |
| `packages/element` | `math`, `common` (no React) |
| `packages/excalidraw` | all internal packages; React allowed |
| `excalidraw-app` | `@excalidraw/excalidraw` public API only |

- **Monorepo layering**: lower packages must never import from higher-layer packages.
- **Immutable elements**: `ExcalidrawElement` must only be mutated via `mutateElement()` / `newElementWith()`. Direct property assignment is forbidden outside designated helpers. `element.version` is the sole cache-invalidation signal.
- **Branded coordinate types**: All coordinate values must use `GlobalPoint`, `LocalPoint`, or `ViewportPoint` from `@excalidraw/math` — never plain `{x, y}` or `number[]`.
- **Dual Jotai store isolation**: Editor state (`editorJotaiStore`) and app-level state (`appJotaiStore`) are kept in separate Jotai stores via `jotai-scope` to support multiple mounted instances.
- **Delta-based undo/redo**: Undo stack uses property-level `ElementsDelta` / `AppStateDelta`; full-snapshot undo is prohibited for scalability in collaborative sessions.
- **`CaptureUpdateAction.NEVER`**: Remote collab updates, scene initialisation, and programmatic `updateScene()` calls must pass `captureUpdate: NEVER` to bypass the undo stack.
- **E2E encryption**: Collaboration room key must never be sent to any server; it lives exclusively in the URL hash fragment.
- **Fractional z-ordering**: Element stacking order is maintained via fractional indices (`syncInvalidIndices` / `syncMovedIndices`); arbitrary array reordering outside these helpers is forbidden.
- **Renderer architecture**: Three composited `<canvas>` layers — `StaticCanvas` (finalized elements), `NewElementCanvas` (in-progress drawing), `InteractiveCanvas` (selection, cursors). Redraws are gated by `sceneNonce` / `selectionNonce` changes and throttled during rapid pan/zoom via `isRenderThrottlingEnabled()`.
- **`AppEventBus` lifecycle**: Embed integrators must use `AppEventBus` events (`editor:mount`, `editor:initialize`, `editor:unmount`) rather than polling or React ref side-effects for lifecycle coordination.

### 5.3 External Service Dependencies

| Service | Provider | Purpose |
|---|---|---|
| Real-time relay | Socket.io server | WebSocket room management; relays encrypted scene events between peers |
| Scene persistence | Firebase Firestore | Stores scene snapshots for late-joining collaborators |
| Binary file storage | Firebase Storage | Stores uploaded images and other binary assets |
| Error monitoring | Sentry (`@sentry/browser`) | Captures and reports runtime exceptions in production |
| Hosting (app) | Vercel | Primary deployment target for `excalidraw.com` |
| Hosting (self-hosted) | Docker / `docker-compose` | Alternative self-hosted deployment path |

All collaboration traffic is end-to-end encrypted; the Socket.io server and Firebase see only ciphertext.

### 5.4 Non-Goals

- SVG path editing or vector graphics manipulation.
- Multi-page / slide documents.
- Rich text beyond simple text elements.
- Excalidraw+ SaaS features (handled by a separate closed-source product).
- CommonJS / UMD consumers without a modern bundler.
