# Decision Log

> Decisions reconstructed by reverse-engineering the codebase. Marked as **[inferred]** where the rationale was not explicitly documented.

---

## ADR-001: Yarn Workspaces Monorepo

**Status:** Active

**Decision:** Use a Yarn Workspaces monorepo with five packages (`common`, `element`, `math`, `utils`, `excalidraw`) plus the main app.

**Rationale [inferred]:**

- The core library and app share significant code
- Publishing separate NPM packages needed independent versioning
- Yarn workspaces avoids duplicate dependencies in a single repo

**Consequences:**

- All packages must be built before the app can run
- Path aliases (`@excalidraw/*`) must be configured in tsconfig, Vite, and Vitest separately

---

## ADR-002: Jotai for State Management

**Status:** Active

**Decision:** Use Jotai (atom-based) for global state, wrapped in local files (`app-jotai.ts`, `editor-jotai.ts`). Direct Jotai imports are banned by ESLint rule.

**Rationale [inferred]:**

- Atom-based state avoids Redux boilerplate
- Local wrappers allow swapping the library without mass refactoring
- ESLint enforcement ensures no accidental direct imports

---

## ADR-003: End-to-End Encryption for Share Links

**Status:** Active

**Decision:** Encrypt scene data with AES-GCM before sending to backend. The encryption key lives only in the URL fragment (`#key`) and is never sent to the server.

**Rationale:**

- Users share sensitive diagrams (architecture, business flows)
- Server-side storage should not be able to read content
- URL fragment is not sent in HTTP requests (browser enforced)

**Consequences:**

- If user loses the share URL, the diagram cannot be recovered
- Server can never implement search or indexing of shared content

---

## ADR-004: Canvas Rendering via Rough.js

**Status:** Active

**Decision:** Use Rough.js to render all shapes with a hand-drawn, sketchy appearance instead of clean geometric shapes.

**Rationale:**

- Core product differentiator — "looks like a whiteboard sketch"
- Reduces psychological pressure to produce "perfect" diagrams
- Integrates cleanly with HTML Canvas 2D API

---

## ADR-005: Action System for Canvas Operations

**Status:** Active

**Decision:** Model all canvas operations (draw, delete, copy, etc.) as Action objects with `name`, `perform()`, `keyTest`, and optional UI components.

**Rationale [inferred]:**

- Decouples UI (keyboard, context menu, panel) from business logic
- Enables command palette without code duplication
- Makes it easy to add new operations in one place

---

## ADR-006: No SSR for Excalidraw Component

**Status:** Active

**Decision:** The `@excalidraw/excalidraw` package is client-only. Next.js integration requires `dynamic(() => import(...), { ssr: false })`.

**Rationale:**

- Canvas API, localStorage, and Web APIs are browser-only
- SSR would require extensive environment detection and fallbacks
- Risk of hydration mismatch outweighs benefits for this use case

---

## ADR-007: Vite for Build Tooling

**Status:** Active

**Decision:** Replaced older bundler with Vite for both dev server and production builds.

**Rationale [inferred]:**

- Fast HMR (Hot Module Replacement) in development
- ESBuild-based transforms for speed
- Good PWA plugin ecosystem
- esbuild also used for package builds (fast)

---

## ADR-008: Firebase as Storage Backend

**Status:** Active

**Decision:** Use Firebase (Firestore + Cloud Storage) for file persistence and library management.

**Rationale [inferred]:**

- Managed service — no need to operate a file storage server
- Firebase Auth provides anonymous sessions for collab rooms
- Cloud Functions used for library management

**Consequence:** Self-hosted deployments need to configure their own Firebase project or replace the storage layer.

---

## ADR-009: PWA with Workbox Caching

**Status:** Active

**Decision:** Ship a Progressive Web App with Workbox-based asset caching.

**Rationale:**

- Enables offline use after first load
- Long-cache strategy for fonts (90 days) and locales (30 days) reduces server load
- Installable as a desktop/mobile app

---

## ADR-010: Simple Analytics (Privacy-Friendly)

**Status:** Active

**Decision:** Use Simple Analytics instead of Google Analytics.

**Rationale:**

- Excalidraw positions itself as privacy-respecting
- Simple Analytics does not use cookies or fingerprinting
- Disabled in production (`VITE_APP_DISABLE_SENTRY=true` approach used)
