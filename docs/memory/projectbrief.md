# Project Brief: Excalidraw

**Version:** 1.0  
**Date:** 2026-03-28  
**Status:** Active

---

## 1. Project Overview

Excalidraw is an open-source, browser-based virtual whiteboard application that enables users to create hand-drawn-style diagrams, sketches, and illustrations. The application is built as a React-based monorepo and delivered in two complementary forms:

1. **`excalidraw-app`** — A fully featured, deployable web application (hosted at [excalidraw.com](https://excalidraw.com)) with real-time collaboration, cloud persistence via Firebase, and AI-assisted diagramming.
2. **`@excalidraw/excalidraw`** — A self-contained, embeddable React component package published to npm, enabling third-party developers to integrate the drawing canvas into their own products.

The tool targets a broad audience: individual creators, design teams, engineers doing technical diagramming, educators, and developers who want to embed a whiteboard component in their applications.

---

## 2. Objectives

### Business Objectives
- Deliver a best-in-class, zero-friction diagramming experience that works instantly in any modern browser with no account required.
- Grow ecosystem adoption by providing a high-quality, well-documented npm package (`@excalidraw/excalidraw`) for embedding.
- Drive conversion to Excalidraw Plus (paid tier) through in-app promotion while keeping the core product fully open-source.
- Maintain a healthy, active open-source community with a low barrier to contribution.

### Technical Objectives
- **Modularity:** Decompose the codebase into well-scoped packages (`common`, `element`, `math`, `utils`, `excalidraw`) enabling independent versioning and tree-shakeable consumption.
- **Performance:** Achieve smooth, low-latency rendering on large canvases using canvas-based rendering, virtual scene management, and optimistic UI updates.
- **Real-Time Collaboration:** Support low-latency multi-user editing via Socket.IO with end-to-end encryption.
- **Offline-First:** Persist state locally (localStorage + IndexedDB) so the app is fully usable without internet connectivity.
- **Embeddability:** Export a clean, well-typed public API surface from the npm package for easy third-party integration.
- **Accessibility & Internationalisation:** Support multiple languages via i18n and comply with web accessibility standards.

---

## 3. Scope

### In-Scope

| Area | Features |
|---|---|
| **Canvas & Drawing** | Shapes (rectangle, ellipse, diamond, arrow, line, freedraw, text, image, frame, embeddable), eraser, lasso selection, hand tool |
| **Element Editing** | Resize, rotate, duplicate, group/ungroup, align/distribute, z-index ordering, lock/unlock, crop, flip |
| **Text & Fonts** | Inline WYSIWYG text editing, font picker (Virgil, Excalifont, Cascadia, Nunito, Lilita, Comic Shanns, etc.), text auto-resize, bound text on shapes |
| **Styling** | Color picker, stroke width, fill style, opacity, arrowhead options |
| **Scene Management** | Undo/redo history, zoom, scroll, fit-to-content, grid snapping, object snapping, search |
| **Export** | PNG, SVG, JSON (`.excalidraw`), clipboard copy, export to Excalidraw Plus |
| **Import** | JSON scene files, image files, paste from clipboard, chart/spreadsheet data |
| **Library** | Reusable shape library with browse, add, publish, and community library import |
| **Collaboration** | Real-time multi-user sessions via shareable room links, cursor presence, follow mode, user idle detection |
| **Encryption** | End-to-end AES-GCM encryption of all collaboration scene data and shared link payloads |
| **Cloud Persistence** | Firebase Firestore (scene data) + Firebase Storage (binary files/images) for collaborative rooms and share links |
| **Local Persistence** | Auto-save to localStorage and IndexedDB; cross-tab synchronisation |
| **AI Features** | Text-to-Diagram (Mermaid-based), Diagram-to-Code (frame export to AI), AI chat panel with history (IndexedDB-backed) |
| **Progressive Web App** | Installable PWA with service worker caching for offline use |
| **Command Palette** | Searchable command palette for all actions |
| **Embeddable Component** | `@excalidraw/excalidraw` npm package with full TypeScript types and imperative API |
| **Multi-package SDK** | `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils` sub-packages |
| **Internationalisation** | i18n string system with locale detection and Crowdin-managed translations |
| **Error Monitoring** | Sentry integration (opt-in, disabled in Docker builds) |

### Out-of-Scope

- Native desktop or mobile applications (iOS/Android).
- Server-side storage or user account management within this repository (delegated to the Excalidraw Plus backend).
- Real-time audio/video communication during collaboration sessions.
- Diagram import from third-party formats (e.g., Visio, Lucidchart, draw.io) beyond Mermaid.
- Backend/server infrastructure code for the collaboration WebSocket server (managed externally).
- Built-in user authentication and access control (Excalidraw Plus concern).

---

## 4. Stakeholders

| Role | Responsibility |
|---|---|
| **Product Owner / Maintainers** | Define roadmap priorities, approve contributions, manage releases and npm publishing |
| **Core Engineering Team** | Architecture decisions, feature development across the monorepo packages, code review |
| **Open-Source Contributors** | Community-driven bug fixes, features, translations, and library shapes |
| **Ops / DevOps Team** | Manage Vercel deployment for `excalidraw.com`, Firebase project configuration, Docker image builds |
| **End Users — Individual** | Creators, students, and professionals using excalidraw.com for personal diagramming |
| **End Users — Teams** | Teams using live collaboration rooms for whiteboarding sessions |
| **Third-Party Developers** | Engineers embedding `@excalidraw/excalidraw` in their own products |
| **Excalidraw Plus Team** | Manages the paid tier and integrates with the open-source component |

---

## 5. Key Features

### Drawing & Editing
A rich, intuitive canvas with support for all common diagramming primitives. Elements are rendered using the HTML5 Canvas API and support full transformation (move, resize, rotate, mirror, crop). The hand-drawn aesthetic is achieved via the Rough.js-inspired rendering pipeline.

### Real-Time Collaboration
Users share a randomly generated room link. All scene mutations are synchronised via a Socket.IO WebSocket server. Payloads are end-to-end encrypted with AES-GCM before leaving the client; the server has no visibility into diagram content. Full-scene syncs occur on a 20-second interval as a safety net alongside incremental delta updates.

### End-to-End Encryption
Every collaborative session and shareable link embeds an AES-GCM encryption key in the URL fragment (never sent to the server). Files are stored encrypted in Firebase Storage. The encryption layer uses the Web Crypto API.

### AI-Assisted Diagramming (TTD — Text-to-Diagram)
An AI panel allows users to describe a diagram in natural language or provide Mermaid syntax; the system renders it onto the canvas. A "Diagram-to-Code" plugin exports a selected frame as an image to an AI backend for code generation. Chat history is persisted in IndexedDB.

### Offline-First & PWA
The app persists the entire scene to localStorage and binary files to IndexedDB on every change. A Vite-powered service worker enables installation and offline operation. Cross-tab sync ensures consistency when the app is open in multiple browser tabs.

### Embeddable React Component
`@excalidraw/excalidraw` provides a well-defined, TypeScript-typed React component and imperative API (`ExcalidrawImperativeAPI`). Consumers can control the scene programmatically, subscribe to events, and customise the UI surface.

### Library & Asset Management
Users maintain a personal shape library stored in IndexedDB. Libraries can be imported, exported, and published to the community library portal. File assets (images) are managed with reference counting and TTL-based cleanup.

### Charts & Data Import
Tabular data (e.g., from a spreadsheet) pasted into the canvas is parsed and rendered as bar, line, or radar charts composed of native Excalidraw elements.

---

## 6. Non-Functional Requirements

### Performance
- Canvas rendering must remain smooth (target ≥ 60 fps) for scenes containing hundreds of elements.
- Collaboration cursor synchronisation is capped at ~30 fps (`CURSOR_SYNC_TIMEOUT = 33ms`).
- File uploads are limited to 4 MiB per file (`FILE_UPLOAD_MAX_BYTES`).
- Scene data is compressed and delta-diffed before transmission to minimise WebSocket payload size.

### Scalability
- The client-side architecture is stateless; horizontal scaling of the WebSocket collaboration server is an external concern.
- Firebase Firestore and Storage handle persistence scalability without client-side changes.
- The npm package is tree-shakeable and split into focused sub-packages to avoid unnecessary bundle bloat in consuming applications.

### Availability
- The PWA service worker ensures the application remains available and functional with no network connection after the initial load.
- Local auto-save protects against data loss on unexpected browser closure.
- Firebase and Socket.IO connection errors are surfaced to the user gracefully, with offline state indicators.

### Security
- All collaboration and shared-link data is end-to-end encrypted (AES-GCM, 128-bit keys) on the client; the server stores only ciphertext.
- Encryption keys are embedded in URL fragments and are never transmitted to the server.
- No personally identifiable information (PII) is required; usernames are ephemeral and locally stored.
- The `VITE_APP_FIREBASE_CONFIG` and other secrets are supplied via environment variables, never committed to source.

### Compatibility
- **Browsers:** Modern evergreen browsers (Chrome ≥ 70, Firefox, Safari ≥ 12, Edge ≥ 79). No IE 11 support.
- **Node.js:** ≥ 18.0.0 required for development and build tooling.
- **Devices:** Desktop-first; touch and pen input supported on mobile/tablet via pointer event handling (PEP polyfill).

### Internationalisation & Accessibility
- UI strings are managed via an i18n system with browser locale detection and Crowdin-managed translations.
- Keyboard shortcuts and focus management are implemented throughout for keyboard-accessible operation.

### Compliance
- The project is MIT licensed; all dependencies must be compatible with open-source distribution.
- No tracking or analytics data is collected in self-hosted/Docker deployments (`VITE_APP_DISABLE_SENTRY=true`).
- Optional analytics (Sentry error tracking, event analytics) are gated behind build-time environment variables.

---

## 7. Risks & Assumptions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Firebase vendor lock-in for persistence and real-time sync | Medium | High | The data layer (`excalidraw-app/data/firebase.ts`) is abstracted behind a clear interface; migrating to an alternative backend is feasible with moderate effort. |
| WebSocket server availability for collaboration | Medium | High | The client gracefully degrades to offline mode; local persistence ensures no data loss. |
| Large scene performance degradation | Medium | Medium | Scene rendering is canvas-based (not DOM), virtual viewports limit off-screen work; incremental optimisation is ongoing. |
| npm package API breaking changes affecting downstream consumers | Low | High | Semantic versioning enforced; types are exported and reviewed; a `CHANGELOG` documents breaking changes. |
| Encryption key loss (URL fragment cleared) | Low | High | Users are advised to save the link; scenes are also auto-saved locally. |
| Browser compatibility regressions | Low | Medium | CI runs type-checking, lint, and unit/integration tests; browserslist targets are pinned. |
| Stale or conflicting collaboration state | Medium | Medium | Periodic full-scene syncs (`SYNC_FULL_SCENE_INTERVAL_MS = 20s`) and a reconciliation algorithm correct divergent state. |

### Assumptions

- Users have access to a modern evergreen browser; no legacy browser support is planned.
- The external collaboration WebSocket server and Firebase project are configured and operational independently of this repository.
- AI features (`TTDDialog`, `DiagramToCodePlugin`) require an external AI API endpoint provided via environment configuration.
- The Excalidraw Plus backend is a separate system; this repository only integrates with it at the UI prompt/redirect level.
- Translations are community-maintained via Crowdin; core engineering is not responsible for translation coverage of all locales.
- End users accept that collaboration room data is ephemeral (tied to room lifecycle) unless explicitly exported.

---

## 8. Success Metrics

### Adoption & Usage
- npm weekly downloads of `@excalidraw/excalidraw` (target: sustained growth quarter-over-quarter).
- Monthly active users on excalidraw.com.
- Number of active collaboration rooms created per day.

### Quality & Reliability
- Test coverage maintained across unit tests (Vitest) and integration tests; no regressions in CI.
- P95 canvas render time < 16ms for scenes with ≤ 500 elements.
- Error rate (Sentry) < 0.1% of sessions.
- Zero known end-to-end encryption bypasses.

### Developer Experience
- Time-to-first-draw for new users < 5 seconds (no sign-up, no configuration required).
- Successful embedding in a new React project achievable in < 15 minutes using published documentation.
- npm package bundle size remains within an agreed budget (tracked in CI).

### Community Health
- Open-source contributor activity: pull requests reviewed and merged within a defined SLA.
- Crowdin translation coverage ≥ 80% for top-10 languages by user base.
- GitHub issue resolution time for critical bugs < 48 hours.

### Business
- Measurable Excalidraw Plus conversion rate from in-app prompts.
- Self-hosted Docker image pull count growth.

---

## 9. Related Documentation

| Document | Location | Relationship |
|---|---|---|
| **Product Requirements Document** | [`docs/product/PRD.md`](../product/PRD.md) | Full feature specifications, acceptance criteria, and non-functional requirements that expand on §3–§6 of this brief |
| **Domain Glossary** | [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Canonical definitions for all domain terms used in this brief |
| **Technical Architecture** | [`docs/technical/architecture.md`](../technical/architecture.md) | System design, component topology, data flows, and deployment model that realise the technical objectives in §2 |
| **Developer Setup Guide** | [`docs/technical/dev-setup.md`](../technical/dev-setup.md) | Step-by-step onboarding guide for contributors; covers the environment assumptions stated in §7 |
