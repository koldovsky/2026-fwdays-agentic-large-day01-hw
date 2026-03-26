# External Integrations

**Analysis Date:** 2025-03-26

## APIs & External Services

**Collaboration & sync (Excalidraw.com-style backend):**
- **HTTP v2 API** — Scene/data fetch and post URLs from `import.meta.env.VITE_APP_BACKEND_V2_GET_URL` and `VITE_APP_BACKEND_V2_POST_URL` (`excalidraw-app/data/index.ts`)
- **WebSocket (Socket.IO client)** — Real-time collaboration; server URL from `VITE_APP_WS_SERVER_URL` (declared in `excalidraw-app/vite-env.d.ts`; client package `socket.io-client` in `excalidraw-app/package.json`)

**Google Firebase:**
- **Firebase App + Firestore + Storage** — Initialized from JSON in `VITE_APP_FIREBASE_CONFIG` (`excalidraw-app/data/firebase.ts`); used for collaborative storage flows (e.g. file upload paths reference `firebasestorage.googleapis.com` in that module)
- SDK: `firebase` package (`excalidraw-app/package.json`)

**AI features:**
- **Configurable AI backend** — Base URL from `VITE_APP_AI_BACKEND` (`excalidraw-app/components/AI.tsx`); server-side contract is external to this repo
- Types/docs in `packages/excalidraw/data/ai/types.ts` reference OpenAI-style APIs as documentation links only (not a bundled OpenAI SDK)

**Excalidraw+ / product links:**
- **Plus landing and app URLs** — `VITE_APP_PLUS_LP`, `VITE_APP_PLUS_APP` (`packages/excalidraw/components/TTDDialog/Chat/ChatMessage.tsx`, `packages/excalidraw/vite-env.d.ts`)

**Library portal:**
- **Public library browse** — `VITE_APP_LIBRARY_URL` (`packages/excalidraw/components/LibraryMenuBrowseButton.tsx`)
- **Library submission API** — `POST` to `${VITE_APP_LIBRARY_BACKEND}/submit` (`packages/excalidraw/components/PublishLibrary.tsx`)

**Portal:**
- **Collaboration portal URL** — `VITE_APP_PORTAL_URL` (typed in `excalidraw-app/vite-env.d.ts` / `packages/excalidraw/vite-env.d.ts` for hosted collaboration UX)

## Data Storage

**Databases:**
- **Cloud Firestore** (via Firebase client) — Collaboration-related persistence when Firebase is configured (`excalidraw-app/data/firebase.ts`)
- **No server-side SQL/ORM in this repo** — App is primarily a static frontend

**File Storage:**
- **Firebase Storage** — Binary uploads when Firebase is enabled (`excalidraw-app/data/firebase.ts`)
- **Browser IndexedDB** — Via `idb-keyval` (`excalidraw-app/package.json`) for local/offline-oriented data
- **Local / File System Access API** — `browser-fs-access` in packages (`packages/excalidraw/package.json`, `packages/utils/package.json`)

**Caching:**
- **Service Worker / Workbox** (Vite PWA plugin) — Precache and runtime caching for fonts, locales, chunks (`excalidraw-app/vite.config.mts`)

## Authentication & Identity

**Auth Provider:**
- **Firebase** — Used as the integration point for hosted scenarios when `VITE_APP_FIREBASE_CONFIG` is set (`excalidraw-app/data/firebase.ts`); not a separate OAuth-only SDK in `excalidraw-app/package.json`
- **Random usernames** — `@excalidraw/random-username` for display names in collab (`excalidraw-app/package.json`)

## Monitoring & Observability

**Error Tracking:**
- **Sentry (Browser SDK)** — `@sentry/browser`; initialized in `excalidraw-app/sentry.ts`, imported from `excalidraw-app/index.tsx`; disabled when `VITE_APP_DISABLE_SENTRY === "true"` (e.g. `build:app:docker` in `excalidraw-app/package.json`)
- **Top-level errors** — `excalidraw-app/components/TopErrorBoundary.tsx` integrates Sentry for user-facing error reporting
- **CI:** `/.github/workflows/sentry-production.yml` creates Sentry releases on `release` branch (uses Sentry CLI; requires CI secrets)

**Logs:**
- Browser `console` + Sentry capture for console errors (`excalidraw-app/sentry.ts` `captureConsoleIntegration`)

## Analytics

**Simple Analytics:**
- Production HTML injects script from `https://scripts.simpleanalyticscdn.com/latest.js` when EJS `PROD` is true (`excalidraw-app/index.html`)
- In-app events call `window.sa_event` when loaded (`packages/excalidraw/analytics.ts`); gated by `VITE_APP_ENABLE_TRACKING === "true"` and `VITE_WORKER_ID` check

**Matomo (typed only):**
- `VITE_APP_MATOMO_URL`, `VITE_APP_CDN_MATOMO_TRACKER_URL`, `VITE_APP_MATOMO_SITE_ID` are declared in `packages/excalidraw/vite-env.d.ts` — **no references in `.ts`/`.tsx` sources found**; treat as optional/legacy wiring unless added later

## CI/CD & Deployment

**Hosting:**
- Static files suitable for any static host; reference Dockerfile uses **nginx** (`Dockerfile`)
- `vite-plugin-sitemap` uses hostname `https://excalidraw.com` (`excalidraw-app/vite.config.mts`)

**CI Pipeline:**
- **GitHub Actions** — `/.github/workflows/test.yml` (install + `yarn test:app`), `lint.yml`, `locales-coverage.yml`, `size-limit.yml`, `test-coverage-pr.yml`, `semantic-pr-title.yml`, `cancel.yml`
- **Docker:** `build-docker.yml` / `publish-docker.yml` on `release` branch; push to Docker Hub (`excalidraw/excalidraw` tags)
- **Autorelease:** `autorelease-excalidraw.yml`

**Vercel-oriented build vars:**
- `excalidraw-app/package.json` `build:app` sets `VITE_APP_GIT_SHA` from `VERCEL_GIT_COMMIT_SHA` when present

## Environment Configuration

**Required env vars (for full hosted feature parity):**
- Collaboration: `VITE_APP_BACKEND_V2_GET_URL`, `VITE_APP_BACKEND_V2_POST_URL`, `VITE_APP_WS_SERVER_URL`
- Firebase-backed flows: `VITE_APP_FIREBASE_CONFIG` (JSON string for `initializeApp`)
- AI panel: `VITE_APP_AI_BACKEND`
- Optional: `VITE_APP_PORTAL_URL`, `VITE_APP_LIBRARY_URL`, `VITE_APP_LIBRARY_BACKEND`, `VITE_APP_PLUS_LP`, `VITE_APP_PLUS_APP`

**Dev / tooling toggles:**
- `VITE_APP_PORT`, `VITE_APP_ENABLE_ESLINT`, `VITE_APP_COLLAPSE_OVERLAY`, `VITE_APP_ENABLE_PWA`, `VITE_APP_DEV_DISABLE_LIVE_RELOAD`, `VITE_APP_DISABLE_SENTRY`, `VITE_APP_GIT_SHA`
- Package-only debug: `VITE_APP_DEBUG_ENABLE_TEXT_CONTAINER_BOUNDING_BOX` (`packages/excalidraw/vite-env.d.ts`, `packages/element/src/renderElement.ts`)

**Secrets location:**
- Local: root `.env`, `.env.development`, `.env.production` (existence only — **do not commit or paste values**)
- CI: GitHub Actions secrets (e.g. Docker Hub in `publish-docker.yml`, Sentry project/auth for `sentry-production.yml`)

## Webhooks & Callbacks

**Incoming:**
- **Web Share Target** — PWA manifest defines `POST` to `/web-share-target` (`excalidraw-app/vite.config.mts` under `VitePWA` `manifest.share_target`); handled by app routing, not a separate server in this repo

**Outgoing:**
- **HTTP** — Library submit (`PublishLibrary.tsx`), backend v2 GET/POST (`excalidraw-app/data/index.ts`), AI requests (`excalidraw-app/components/AI.tsx`)
- **WebSocket** — Socket.IO client to `VITE_APP_WS_SERVER_URL` for collaboration
- **Firebase** — Firestore/Storage client operations (`excalidraw-app/data/firebase.ts`)

---

*Integration audit: 2025-03-26*
