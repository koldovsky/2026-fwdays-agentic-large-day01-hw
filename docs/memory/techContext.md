# Tech Context: Excalidraw

**Version:** 1.0
**Date:** 2026-03-28
**Status:** Active

---

## 1. Introduction

This document captures the complete technical environment of the Excalidraw monorepo. It exists as a single point of reference for engineers, DevOps practitioners, and architects who need to understand:

- **What** technology is used and **why** it was chosen.
- **How** the system is built, deployed, and operated.
- **Where** the known limitations and future evolution points lie.

It is intended to accelerate onboarding, reduce debugging time, and ensure that new work is consistent with established patterns. This document covers the `excalidraw-app` deployable web application and the `@excalidraw/excalidraw` embeddable npm component. External systems (the collaboration WebSocket server, Firebase project, and AI API endpoint) are documented as integration points but are not managed in this repository.

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

| Concern                     | Technology                          | Notes                                                                                                         |
|-----------------------------|-------------------------------------|---------------------------------------------------------------------------------------------------------------|
| **Real-time collaboration** | Socket.IO client 4.7.2              | Client-only; connects to an externally managed WebSocket relay server configured via `VITE_APP_WS_SERVER_URL` |
| **Cross-tab sync**          | BroadcastChannel API                | 50 ms debounce (`SYNC_BROWSER_TABS_TIMEOUT`); backed by `VersionedSnapshotStore`                              |
| **Internal event bus**      | Custom `Emitter<T>` + `AppEventBus` | Typed, in-process only; no external message broker                                                            |
| **Collaboration protocol**  | Custom delta-diff over Socket.IO    | `SCENE_UPDATE` (incremental), full-scene sync every 20 s (`SYNC_FULL_SCENE_INTERVAL_MS`)                      |
| **Cursor sync**             | Socket.IO volatile events           | ~30 fps, `CURSOR_SYNC_TIMEOUT = 33 ms`                                                                        |

There is no Kafka, RabbitMQ, or cloud pub/sub service. All messaging is either in-browser or over the Socket.IO WebSocket connection.

---

### 2.5 Storage

| Layer                       | Technology                         | Data Stored                                                 | Trigger                              |
|-----------------------------|------------------------------------|-------------------------------------------------------------|--------------------------------------|
| **L1 — localStorage**       | Browser localStorage (~5–10 MB)    | Serialised scene elements + filtered AppState               | 300 ms debounce on every change      |
| **L2 — IndexedDB**          | Browser IndexedDB (large capacity) | Binary file assets (images), shape library, AI chat history | On file import / library change      |
| **L3 — Firebase Firestore** | Google Cloud Firestore (encrypted) | Collaboration room scene JSON                               | On join/mutation in a collab session |
| **L4 — Firebase Storage**   | Google Cloud Storage (encrypted)   | Binary files for collab rooms and share links               | Throttled upload on file add         |

- On startup, the app hydrates from the highest available layer (Firebase for active collab sessions; localStorage for solo sessions).
- There is no Redis, Memcached, or server-side cache. Caching is entirely client-side (PWA service worker for static assets, localStorage for scene data, IndexedDB for file assets).
- File uploads are capped at **4 MiB** per file (`FILE_UPLOAD_MAX_BYTES`).

---

### 2.6 Authentication & Security

| Mechanism                 | Detail                                                                                                                                                                          |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **End-to-end encryption** | AES-GCM, 256-bit keys generated client-side via `window.crypto.subtle` (Web Crypto API)                                                                                         |
| **Key distribution**      | Keys are embedded in the **URL fragment** (`#roomId,key`) — never transmitted to any server                                                                                     |
| **Collaboration access**  | Possession of the room link URL = access. No authentication layer.                                                                                                              |
| **Excalidraw Plus auth**  | Detected via the presence of an `excplus-auth` cookie set by the Plus backend (external system)                                                                                 |
| **Secrets management**    | All secrets (`VITE_APP_FIREBASE_CONFIG`, etc.) are supplied via environment variables, injected by Vercel or Docker `--env-file` at build time. Nothing is committed to source. |

There is **no built-in user authentication, RBAC, or session management** in this repository. User identity is ephemeral and locally stored (display name only). Account management is delegated entirely to the Excalidraw Plus backend.

---

## 3. Development Environment

### 3.1 Local Setup

**Prerequisites:**
- Node.js ≥ 18.0.0
- Yarn 1.22.22 (specified in `packageManager` field)

**Install and start:**
```bash
yarn install
yarn start          # starts Vite dev server for excalidraw-app
```

**Docker Compose (self-hosted simulation):**
```bash
docker compose up   # builds the Docker image and serves on http://localhost:3000
```
The Compose file mounts the local directory into the container for development.

**Environment variables:** Copy `env.development` (or create a `.env.local`) with the required `VITE_APP_*` variables. A minimal setup (no Firebase, no AI) works for local canvas editing; collaboration and share-link features require a configured Firebase project.

### 3.2 Monorepo Package Build Order

Packages must be built in dependency order before running `excalidraw-app`:
```
common → math → element → excalidraw → excalidraw-app
```
Use `yarn build:packages` to build all sub-packages before starting the app.

### 3.3 Recommended IDE

**VS Code** is the de facto standard (`.vscode` config is present in the repo). Recommended extensions:
- ESLint
- Prettier – Code formatter
- TypeScript and JavaScript Language Features

### 3.4 CLI Tools

| Tool                        | Purpose                                           |
|-----------------------------|---------------------------------------------------|
| `yarn`                      | Package management and workspace task runner      |
| `vite`                      | Dev server and production bundler                 |
| `tsc`                       | TypeScript type-checking (`yarn test:typecheck`)  |
| `eslint`                    | Linting (`yarn test:code`)                        |
| `prettier`                  | Code formatting (`yarn test:other`)               |
| `vitest`                    | Unit and integration testing (`yarn test`)        |
| `docker` / `docker compose` | Local container builds and self-hosted simulation |
| `gh`                        | GitHub CLI for PR/release workflows               |

---

## 4. CI/CD Pipeline

All pipelines run on **GitHub Actions**.

### 4.1 Workflows

| Workflow File                | Trigger           | Purpose                                                                                                                             |
|------------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `test.yml`                   | Push to `master`  | Install deps → run Vitest test suite                                                                                                |
| `lint.yml`                   | Pull request      | Install deps → Prettier check → ESLint → TypeScript typecheck                                                                       |
| `build-docker.yml`           | Push to `release` | Build Docker image (smoke test)                                                                                                     |
| `publish-docker.yml`         | Push to `release` | Build multi-arch Docker image (`linux/amd64`, `linux/arm64`, `linux/arm/v7`) and push to DockerHub (`excalidraw/excalidraw:latest`) |
| `autorelease-excalidraw.yml` | Tag-based         | npm package publish to registry                                                                                                     |
| `size-limit.yml`             | Pull request      | Check npm bundle size budget (prevents accidental bloat)                                                                            |
| `sentry-production.yml`      | Push to `main`    | Upload source maps to Sentry for production release tracking                                                                        |
| `test-coverage-pr.yml`       | Pull request      | Coverage report on PRs                                                                                                              |
| `locales-coverage.yml`       | Schedule          | Track Crowdin translation completeness                                                                                              |
| `semantic-pr-title.yml`      | Pull request      | Enforce Conventional Commits format on PR titles                                                                                    |
| `cancel.yml`                 | Push              | Cancel stale runs on the same branch                                                                                                |

### 4.2 Stages (per PR)

```
1. Cancel stale runs
2. Lint (Prettier + ESLint + TypeScript)
3. Tests (Vitest)
4. Coverage report
5. Bundle size check
```

### 4.3 Deployment Strategy

| Target | Strategy |
|---|---|
| **excalidraw.com (Vercel)** | Automatic deployment on push to `main`; Vercel handles atomic swap (no downtime). Effectively a **blue/green** model managed by the Vercel platform — not custom-managed in this repo. |
| **Docker image (DockerHub)** | Push to the `release` branch triggers a multi-arch build and publishes `excalidraw/excalidraw:latest`. Rolling updates for self-hosted deployments are the operator's responsibility. |
| **npm package** | Tag-triggered publish via `autorelease-excalidraw.yml`; semantic versioning enforced. |

There are no canary releases, feature flags managed at the pipeline level, or custom blue/green infrastructure defined in this repository. Feature flags are build-time Vite env variables (`VITE_APP_ENABLE_*`).

---

## 5. Observability

### 5.1 Logging

There is no centralised log aggregation (no ELK, Loki, or Datadog Logs). Logging strategy:

| Level                 | Mechanism                                                                                                                                                     |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Development**       | `console.error` / `console.warn` in browser DevTools                                                                                                          |
| **Production errors** | Captured by Sentry (see below); URL fragments (which contain encryption keys) are stripped from all Sentry payloads via `beforeSend()` to prevent key leakage |

### 5.2 Monitoring & Alerting

| Tool       | Usage                        | Notes                                                                                                                                                                               |
|------------|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Sentry** | Client-side error monitoring | `@sentry/browser` 9.0.1; enabled only in production builds; disabled for Docker (`VITE_APP_DISABLE_SENTRY=true`); release tagged with `VITE_APP_GIT_SHA` for source-map correlation |
| **Matomo** | Usage analytics (opt-in)     | Enabled via `VITE_APP_ENABLE_TRACKING=true` on Vercel; not active in self-hosted/Docker builds                                                                                      |

There is no Prometheus, Grafana, or PagerDuty integration. No structured metrics pipeline exists for client-side performance (canvas render time, collaboration latency).

### 5.3 Tracing

There is **no distributed tracing** (no OpenTelemetry, Jaeger, or Zipkin). The application is entirely client-side; "distributed" tracing across the Socket.IO relay or Firebase is not implemented. Sentry performance traces are available ad hoc in the Sentry dashboard for production sessions.

> **Note:** Introducing OpenTelemetry client-side spans (canvas render latency, TTD pipeline duration, collab sync latency) is listed as a future consideration.

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

| Environment              | Secrets injection mechanism                                                                 |
|--------------------------|---------------------------------------------------------------------------------------------|
| **Vercel**               | Vercel project environment variables (set in Vercel dashboard; injected at build time)      |
| **Docker / self-hosted** | `--env-file` passed to `docker run`, or environment block in `docker-compose.yml`           |
| **CI (GitHub Actions)**  | GitHub repository secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`, `SENTRY_AUTH_TOKEN`, etc.) |

There is no HashiCorp Vault, AWS Secrets Manager, or equivalent secrets management service. The AES-GCM encryption keys used for collaboration are **never stored** anywhere — they exist only in user URL fragments.

---

## 7. Networking

### 7.1 API Endpoints

The application itself does not expose any API endpoints (it is a static SPA). It consumes the following external endpoints:

| Endpoint                                          | Protocol               | Direction                          | Purpose                                                   |
|---------------------------------------------------|------------------------|------------------------------------|-----------------------------------------------------------|
| Firebase Firestore REST/gRPC                      | HTTPS                  | Outbound                           | Read/write encrypted scene data for rooms and share links |
| Firebase Storage                                  | HTTPS                  | Outbound                           | Upload/download encrypted binary files                    |
| Socket.IO relay server (`VITE_APP_WS_SERVER_URL`) | WSS (WebSocket Secure) | Outbound                           | Real-time scene deltas and cursor updates                 |
| AI API (`VITE_APP_AI_BACKEND`)                    | HTTPS (streaming)      | Outbound                           | Text-to-Diagram and Diagram-to-Code requests              |
| Excalidraw Plus backend                           | HTTPS                  | Outbound (redirect / cookie check) | Account detection and Plus feature redirect               |

### 7.2 Ingress & Load Balancing

| Environment            | Ingress                                                                                                                                         |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| **excalidraw.com**     | Vercel edge network — global CDN, automatic TLS, no operator-managed load balancer                                                              |
| **Docker self-hosted** | Nginx 1.27-alpine serves static files on port 80; the operator is responsible for any reverse proxy, TLS termination, or load balancer in front |

### 7.3 DNS

DNS for `excalidraw.com` is managed via Vercel DNS. Subdomains:
- `vscode.excalidraw.com` — redirected to the VS Code marketplace extension (configured in `vercel.json`).
- `for-webex.excalidraw.com` — external Webex integration.

### 7.4 Service Mesh

No service mesh (Istio, Linkerd, etc.) is applicable. The client application makes direct HTTPS/WSS calls to external services.

### 7.5 HTTP Security Headers (Vercel)

Configured in `vercel.json`:

| Header                   | Value                      |
|--------------------------|----------------------------|
| `X-Content-Type-Options` | `nosniff`                  |
| `Referrer-Policy`        | `origin`                   |
| `Feature-Policy`         | `*`                        |
| `Cache-Control` (fonts)  | `public, max-age=31536000` |

---

## 8. Security & Compliance

### 8.1 Data Encryption

| Data Type                               | Encryption                    | Details                                                                                                        |
|-----------------------------------------|-------------------------------|----------------------------------------------------------------------------------------------------------------|
| Collaboration scene data                | AES-GCM 256-bit               | Encrypted client-side before any network transmission; only ciphertext reaches Firebase or the Socket.IO relay |
| Share-link scene data                   | AES-GCM 256-bit               | Same mechanism; key in URL fragment                                                                            |
| Binary file assets (images)             | AES-GCM 256-bit               | Encrypted before upload to Firebase Storage                                                                    |
| Local storage (localStorage, IndexedDB) | None (browser security model) | Data at rest in browser storage is unencrypted; protected only by the browser's origin sandbox                 |
| Transport                               | TLS (HTTPS / WSS)             | All external communication is over encrypted transport                                                         |

### 8.2 Role-Based Access Control (RBAC)

There is **no RBAC** in this repository. Access to a collaboration room is controlled solely by possession of the room URL (which embeds the AES-GCM key in the fragment). This is an intentional design decision aligned with the zero-friction, no-account product philosophy.

### 8.3 Personally Identifiable Information (PII)

- No PII is required. Display names used in collaboration are ephemeral and locally stored only.
- No user accounts, email addresses, or personal data are collected or stored in this codebase.
- The Sentry `beforeSend()` hook strips URL fragments (which contain encryption keys) before any error report is transmitted.

### 8.4 Audit Logs

There are no audit logs generated by the client application. The Socket.IO relay server and Firebase project may log connection metadata (IP, timestamp) at the infrastructure level — this is outside the scope of this repository.

### 8.5 Compliance

| Requirement                  | Status                                                                                                                                       |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| **MIT License**              | All source code and dependencies must be MIT-compatible                                                                                      |
| **GDPR**                     | No PII collected or processed. Analytics (Matomo) are opt-in and disabled in Docker builds. No cookie consent required for the core product. |
| **SOC 2**                    | Not formally certified. Firebase (Google Cloud) holds SOC 2 certification for the storage backend.                                           |
| **Self-hosted / air-gapped** | Fully supported via Docker; all analytics and error reporting disabled by default in Docker builds                                           |

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

### 10.1 Performance Bottlenecks

| Issue                      | Detail                                                                                                                                                                                                                                                                                      |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Large-canvas rendering** | Scene rendering can degrade noticeably for very large diagrams (hundreds of elements). The canvas rendering pipeline and virtual viewport clipping are actively being optimised, but there is no current hard limit on element count. Target is P95 render time < 16 ms for ≤ 500 elements. |
| **Main-thread blocking**   | All heavy computation (reconciliation, AES-GCM encryption, Mermaid-to-Excalidraw conversion) runs on the main browser thread. Web Worker offloading is planned but not yet implemented.                                                                                                     |
| **Mobile / touch UX**      | The product is desktop-first. Touch and pen input are supported via Pointer Events and the PEP polyfill, but the mobile experience lags behind desktop in ergonomics and performance.                                                                                                       |

### 10.2 Tech Debt & Deprecated Components

| Item                            | Detail                                                                                                                                                                                                                                        |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Firebase vendor coupling**    | Cloud persistence is tightly coupled to Firebase Firestore and Storage. An abstraction layer exists (`excalidraw-app/data/firebase.ts`) but migrating to an alternative backend (S3, Supabase, self-hosted) would require significant effort. |
| **Build-time feature flags**    | Feature flags are `VITE_APP_ENABLE_*` environment variables baked in at build time. Changing a flag requires a full rebuild and redeployment. Runtime feature flag management is not implemented.                                             |
| **LWW conflict reconciliation** | The Last-Write-Wins algorithm with nonce tiebreaking is not a full CRDT. Occasional brief inconsistencies during concurrent edits are possible. The 20-second full-scene sync mitigates but does not eliminate this.                          |
| **No e2e test coverage**        | There are no Playwright or Cypress end-to-end tests. Coverage is provided by Vitest integration tests with React Testing Library (which renders the full component in jsdom). Real-browser testing is not automated.                          |
| **TTD reliability**             | AI-generated Mermaid output frequently contains syntax errors. The `mermaidAutoFix` utility repairs common issues but does not cover all failure modes, leading to occasional failed renders.                                                 |
| **Monorepo build complexity**   | The `common → math → element → excalidraw` dependency chain requires strict build ordering. Changes to lower-level packages require rebuilding all dependents. This adds overhead for contributors.                                           |

### 10.3 Scaling Challenges

| Concern                            | Detail                                                                                                                                                                                                   |
|------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Collaboration room scalability** | The Socket.IO relay server (external) is the bottleneck for large collaboration sessions. The client broadcasts full scenes every 20 seconds as a safety net, which increases relay load with room size. |
| **Encryption key loss**            | Loss of the share link URL (which embeds the AES key in the URL fragment) means permanent, unrecoverable data loss for that encrypted payload stored in Firebase. This is a known, accepted trade-off.   |
| **npm package API stability**      | As the package matures, maintaining a stable public API surface while refactoring internals is an ongoing tension. Breaking changes require careful semantic versioning and consumer migration guidance. |

---

## 11. Future Tech Considerations

| Consideration                             | Context                                                                                                                                                                                                              |
|-------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **CRDT-based collaboration (Yjs)**        | As canvas complexity and session sizes grow, replacing the LWW reconciliation algorithm with a proper CRDT (e.g., Yjs) could eliminate periodic full-scene syncs and improve conflict resolution fidelity.           |
| **Web Workers for heavy computation**     | Offloading reconciliation, AES-GCM encryption, and Mermaid-to-Excalidraw conversion to dedicated Web Worker threads would free the main thread for uninterrupted canvas rendering.                                   |
| **Runtime feature flags**                 | Moving from build-time `VITE_APP_ENABLE_*` flags to a runtime feature flag service (e.g., LaunchDarkly, GrowthBook) would enable gradual rollouts and A/B testing without requiring a full rebuild and redeployment. |
| **OpenTelemetry client-side tracing**     | Introducing structured spans for canvas render latency, collaboration sync round-trip time, and TTD pipeline duration would provide actionable performance visibility beyond ad-hoc Sentry traces.                   |
| **Backend storage abstraction**           | Decoupling from Firebase by formalising the storage interface in `excalidraw-app/data/` would enable alternative backends (S3/MinIO, Supabase, self-hosted object storage) without rewriting the data layer.         |
| **SSR for share previews**                | Adding a lightweight SSR layer (e.g., Next.js or Astro) for share-preview pages would improve SEO and social card previews without affecting the canvas runtime.                                                     |
| **PWA Background Sync**                   | Using the Background Sync API to queue Firebase writes when offline and flush on reconnect would reduce data loss risk during intermittent connectivity in collab sessions.                                          |
| **AI sidecar for Docker**                 | Containerising the AI/TTD proxy as a sidecar alongside the Docker image would allow self-hosted operators to run the full AI feature set without an external API contract.                                           |
| **Module federation for Excalidraw Plus** | If the Plus team needs to inject UI surface into the open-source shell without forking, Vite Module Federation could provide a clean, version-independent boundary.                                                  |

---

## 12. Related Documentation

| Document | Location | Relationship |
|---|---|---|
| **Technical Architecture** | [`docs/technical/architecture.md`](../technical/architecture.md) | Comprehensive system design document covering component topology, data flows, rendering pipeline, security model, and deployment in full detail — expands on every section of this document |
| **Developer Setup Guide** | [`docs/technical/dev-setup.md`](../technical/dev-setup.md) | Step-by-step guide for standing up the local development environment, covering all environment variables, Docker configuration, and troubleshooting scenarios referenced in §§4–6 |
