# Tech Context: Excalidraw

**Version:** 1.0 | **Date:** 2026-03-28 | **Status:** Active

---

## 1. Introduction

This document captures the complete technical environment of the Excalidraw monorepo — a single point of reference covering what technology is used and why, how the system is built and deployed, and where known limitations lie. It covers the `excalidraw-app` deployable web application and the `@excalidraw/excalidraw` embeddable npm component. External systems (collaboration WebSocket server, Firebase, AI API) are documented as integration points only.

---

## 2. Core Technology Stack

### 2.1 Frontend

| Concern                  | Technology                            | Version / Notes                                                                 |
|--------------------------|---------------------------------------|---------------------------------------------------------------------------------|
| **UI Framework**         | React                                 | 19.0.0                                                                          |
| **Language**             | TypeScript                            | 5.9.3 (strict mode)                                                             |
| **Build tool**           | Vite                                  | 5.0.12                                                                          |
| **State management**     | Jotai (atoms)                         | 2.11.0 — see rationale below                                                    |
| **Component state**      | `React.useState` / `React.useReducer` | Local, ephemeral UI state only                                                  |
| **Styling**              | SCSS modules                          | No CSS-in-JS or utility-class framework                                         |
| **Hand-drawn rendering** | Rough.js                              | 4.6.4 — provides the sketch aesthetic on top of the Canvas 2D API               |
| **Canvas rendering**     | HTML5 Canvas API                      | Two canvases: `StaticCanvas` (scene) + `InteractiveCanvas` (selection, cursors) |
| **Free-hand strokes**    | perfect-freehand                      | 1.2.0                                                                           |
| **Mermaid conversion**   | @excalidraw/mermaid-to-excalidraw     | 2.1.1                                                                           |
| **Code editing (TTD)**   | CodeMirror 6                          | @codemirror/{state,view,language,commands}                                      |
| **UI primitives**        | Radix UI                              | 1.4.3                                                                           |
| **i18n**                 | Custom `t()` system                   | JSON locale files lazy-loaded at runtime; Crowdin-managed                       |
| **PWA**                  | vite-plugin-pwa (Workbox)             | Service worker for offline and cached repeat loads                              |

**State management rationale:** Jotai's atomic model was chosen over Redux to eliminate boilerplate and avoid global re-renders when a single UI boolean changes. `jotai-scope` isolates multiple `<Excalidraw />` instances on the same page, which is critical for the embeddable component use case.

**Anti-patterns intentionally avoided:** Redux, MobX, React Context for reactive data, Higher-Order Components, Server-Side Rendering (the Canvas and Web Crypto APIs are browser-only).

---

### 2.2 Backend

There is **no application server in this repository.** The entire product runs client-side in the browser. Backend responsibilities are delegated to external services:

| Concern              | Delegated To                                         |
|----------------------|------------------------------------------------------|
| Cloud persistence    | Firebase Firestore (encrypted scene JSON)            |
| Binary file storage  | Firebase Storage (encrypted image blobs)             |
| Real-time relay      | Socket.IO collaboration server (externally operated) |
| AI / Text-to-Diagram | External AI API (endpoint configurable via env var)  |
| Error monitoring     | Sentry (opt-in)                                      |

Node.js ≥ 18.0.0 is required only for the **build toolchain** (Vite, TypeScript, Vitest), not for any runtime.

---

### 2.3 Infrastructure

| Environment                       | Hosting        | Mechanism                                                                                         |
|-----------------------------------|----------------|---------------------------------------------------------------------------------------------------|
| **Production** (`excalidraw.com`) | Vercel         | CD on push to `main`; static SPA served from Vercel edge CDN                                      |
| **Self-hosted**                   | Docker + Nginx | Multi-stage Docker build: Node 18 build stage → Nginx 1.27-alpine serving static files on port 80 |
| **npm package**                   | npm registry   | Published on tagged release; semantic versioning enforced                                         |

The production deployment model is a **static single-page application** — no server processes run as part of `excalidraw-app`. All dynamic behaviour is client-side. Horizontal scalability of the application layer is handled transparently by Vercel's CDN.

---

### 2.4 Messaging & Eventing

> Full details in [architecture.md §5 — Communication Patterns](../technical/architecture.md#5-communication-patterns): Socket.IO real-time relay, BroadcastChannel cross-tab sync, custom `Emitter<T>` event bus, delta-diff collaboration protocol, and volatile cursor events.

---

### 2.5 Storage

> Full details in [architecture.md §6 — Data Storage](../technical/architecture.md#6-data-storage): four-layer model (localStorage → IndexedDB → Firebase Firestore → Firebase Storage), hydration order, 4 MiB file cap, and service worker cache.

---

### 2.6 Authentication & Security

> Full details in [architecture.md §7 — Security](../technical/architecture.md#7-security): AES-GCM 128-bit E2EE, URL-fragment key distribution, no RBAC or server-side auth, `excplus-auth` cookie detection, and build-time secrets injection.

---

### 2.7 Monorepo Structure

| Package                    | Path                   | Purpose                                     |
|:---------------------------|:-----------------------|:--------------------------------------------|
| **excalidraw-app**         | `excalidraw-app/`      | Deployable web application (excalidraw.com) |
| **@excalidraw/excalidraw** | `packages/excalidraw/` | Embeddable React component published to npm |
| **@excalidraw/common**     | `packages/common/`     | Shared constants, types, and utilities      |
| **@excalidraw/element**    | `packages/element/`    | Element definitions and mutation helpers    |
| **@excalidraw/math**       | `packages/math/`       | Geometry and canvas math functions          |
| **@excalidraw/utils**      | `packages/utils/`      | Additional shared utilities                 |

**Build orchestration:** Managed by yarn workspaces; shared dependencies hoisted to root `node_modules/`.

---

## 3. Core Development Commands

| Command               | Purpose                                                   |
|:----------------------|:----------------------------------------------------------|
| `yarn install`        | Install all dependencies for the monorepo                 |
| `yarn start`          | Start Vite dev server for excalidraw-app (port 3000)      |
| `yarn build:app`      | Production build of excalidraw-app                        |
| `yarn build:packages` | Production build of all `@excalidraw/*` npm packages      |
| `yarn test`           | Run Vitest unit tests                                     |
| `yarn fix`            | Run ESLint + Prettier auto-fix                            |
| `yarn test:typecheck` | TypeScript compilation check (no emit)                    |

**Package manager:** This project uses **yarn** (v1.x classic). Do not use npm or pnpm.

---

## 4. CI/CD Pipeline

> Full details in [architecture.md §9.3 — CI/CD Pipeline](../technical/architecture.md#93-cicd-pipeline): all GitHub Actions workflows (test, lint, Docker build/publish, npm release, bundle size, Sentry source maps, Crowdin), per-PR stages, and deployment strategy for Vercel, DockerHub, and the npm registry.

---

## 5. Observability

> Full details in [architecture.md §8 — Observability](../technical/architecture.md#8-observability): Sentry error monitoring (`@sentry/browser`, key-safe `beforeSend()`), Matomo opt-in analytics, browser-console-only logging, and the absence of distributed tracing (OpenTelemetry planned as a future consideration).

---

## 6. Configuration & Secrets

### 6.1 Configuration Management

All runtime configuration is **baked in at build time** via Vite environment variables (prefix: `VITE_APP_`). There are no config files loaded at runtime.

| Variable                       | Purpose                                                              |
|--------------------------------|----------------------------------------------------------------------|
| `VITE_APP_FIREBASE_CONFIG`     | Firebase project JSON (base64 or JSON string)                        |
| `VITE_APP_WS_SERVER_URL`       | Socket.IO collaboration relay server URL                             |
| `VITE_APP_AI_BACKEND`          | AI / TTD endpoint URL                                                |
| `VITE_APP_BACKEND_V2_GET_URL`  | Share-link scene fetch endpoint                                      |
| `VITE_APP_BACKEND_V2_POST_URL` | Share-link scene store endpoint                                      |
| `VITE_APP_DISABLE_SENTRY`      | Set `"true"` to suppress Sentry in Docker builds                     |
| `VITE_APP_ENABLE_TRACKING`     | Set `"true"` to enable Matomo analytics (Vercel prod only)           |
| `VITE_APP_GIT_SHA`             | Injected by CI (`$VERCEL_GIT_COMMIT_SHA`) for Sentry release tagging |

**Environment files:** `env.development` and `env.production` at repo root hold non-secret defaults. These files are committed; actual secrets are never committed.

### 6.2 Secrets Management

> Full details in [architecture.md §7.5 — Secrets Management](../technical/architecture.md#75-secrets-management): injection via Vercel dashboard, Docker `--env-file`, and GitHub Actions secrets; no Vault or cloud secrets service; collaboration AES-GCM keys are never stored anywhere.

---

## 7. Networking

> Outbound endpoints (Firebase, Socket.IO, AI API, Plus backend) are documented in [architecture.md §5 — Communication Patterns](../technical/architecture.md#5-communication-patterns). Ingress, DNS, service mesh (none), and Vercel HTTP security headers are documented in [architecture.md §9.1–9.2 — Deployment & Infrastructure](../technical/architecture.md#9-deployment--infrastructure).

---

## 8. Security & Compliance

> Full details in [architecture.md §7 — Security](../technical/architecture.md#7-security): AES-GCM 128-bit E2EE per data type, no RBAC (URL possession = access), no PII collected, no client-side audit logs, MIT/GDPR/SOC 2 compliance posture, and input sanitisation. See also [encryption.md](../technical/encryption.md) for implementation specifics.

---

## 9. Third-Party Integrations

| Integration                        | Purpose                                                                       | Configuration                                                                                |
|------------------------------------|-------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| **Firebase Firestore**             | Encrypted cloud persistence for collaboration room scenes and share-link data | `VITE_APP_FIREBASE_CONFIG` — full Firebase project JSON                                      |
| **Firebase Storage**               | Encrypted cloud storage for binary file assets in rooms and share links       | Same Firebase project; prefixes `/files/rooms`, `/files/shareLinks`                          |
| **Socket.IO Collaboration Server** | WebSocket relay for real-time scene delta and cursor synchronisation          | `VITE_APP_WS_SERVER_URL` — externally operated; not in this repo                             |
| **External AI API**                | Text-to-Diagram (TTD) and Diagram-to-Code generation via Mermaid intermediary | `VITE_APP_AI_BACKEND` — externally operated; required for AI features                        |
| **Sentry**                         | Client-side error and exception monitoring                                    | `VITE_APP_SENTRY_DSN`; `@sentry/browser` 9.0.1; disabled in Docker                           |
| **Matomo**                         | Usage analytics (page views, action events)                                   | `VITE_APP_ENABLE_TRACKING=true`; not active in Docker builds                                 |
| **Crowdin**                        | Community-driven i18n translation management                                  | `crowdin.yml` in repo root; synced via `locales-coverage.yml` CI workflow                    |
| **Vercel**                         | Production hosting, CDN, and CD pipeline for `excalidraw.com`                 | `vercel.json` in repo root; deploy on push to `main`                                         |
| **DockerHub**                      | Distribution of the official self-hosted Docker image                         | `excalidraw/excalidraw:latest`; published via `publish-docker.yml` CI                        |
| **Excalidraw Plus Backend**        | Paid tier: account management, advanced persistence, team features            | Detected via `excplus-auth` cookie; UI-level redirect only — no API integration in this repo |
| **Community Library Portal**       | Browsable repository of shareable shape libraries (`.excalidrawlib`)          | Opened via in-app "Browse libraries" button; external URL                                    |

---

## 10. Known Limitations & Constraints

> **Performance:** large-canvas render degradation, main-thread blocking for encryption/reconciliation/TTD, mobile UX lag. **Tech Debt:** Firebase vendor coupling, LWW reconciliation gaps, missing e2e tests, monorepo build complexity. **Scaling:** Socket.IO relay as collaboration bottleneck, URL-fragment key-loss risk. See [technical-debt-catalog.md](../technical/technical-debt-catalog.md) and [architecture.md §10](../technical/architecture.md#10-scalability--availability).

---

## 11. Related Documentation

| Document | Location |
|---|---|
| **Technical Architecture** | [`docs/technical/architecture.md`](../technical/architecture.md) |
| **Developer Setup Guide** | [`docs/technical/dev-setup.md`](../technical/dev-setup.md) |
