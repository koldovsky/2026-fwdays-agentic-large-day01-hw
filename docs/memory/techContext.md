# Tech Context

## Tech Stack

- Languages:
  - TypeScript across app and packages
  - JavaScript for build and release scripts
  - SCSS for app styling
- Frontend runtime:
  - React 19
  - Jotai for app-level atoms
  - Vite 5 for dev server and build
- Core Excalidraw internals:
  - `@excalidraw/common`
  - `@excalidraw/element`
  - `@excalidraw/math`
  - `@excalidraw/excalidraw`
  - `@excalidraw/utils`
- Realtime and persistence:
  - Socket.IO client for room sync
  - Firebase Firestore for scene persistence
  - Firebase Storage for image and file blobs
  - `idb-keyval` over IndexedDB for local files, library data, and TTD chat history
  - `localStorage` for scene, app, and browser-state metadata
- Observability and operations:
  - Sentry Browser SDK
  - Vercel deployment config
  - Docker multi-stage image with Nginx runtime
- Quality:
  - Vitest + jsdom
  - ESLint
  - Prettier
  - Husky + lint-staged

## Monorepo Layout

- Root package manager: `yarn@1.22.22`
- Workspaces:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`
- Publishable packages:
  - `@excalidraw/common`
  - `@excalidraw/math`
  - `@excalidraw/element`
  - `@excalidraw/excalidraw`
  - `@excalidraw/utils` exists but follows a separate release cadence

## Key Services

- Browser storage:
  - `localStorage` keys such as `excalidraw`, `excalidraw-state`, and browser-state version markers
  - IndexedDB stores for files, library items, and text-to-diagram chats
- Collaboration:
  - WebSocket endpoint via `VITE_APP_WS_SERVER_URL`
  - room links encoded in the URL hash as `#room=<roomId>,<roomKey>`
- Shareable links:
  - GET/POST backend endpoints via `VITE_APP_BACKEND_V2_GET_URL` and `VITE_APP_BACKEND_V2_POST_URL`
- AI:
  - backend via `VITE_APP_AI_BACKEND`
- Hosting and CDN:
  - Vercel for deployment
  - Firebase Storage for shared and collaboration file blobs

## Common Commands

- Install dependencies:
  - `yarn install`
- Run the app locally:
  - `yarn start`
- Run the built app preview:
  - `yarn build:preview`
- Build the main app:
  - `yarn build`
- Build only the app Docker target:
  - `yarn build:app:docker`
- Build packages:
  - `yarn build:packages`
  - `yarn build:excalidraw`
  - `yarn build:math`
- Test:
  - `yarn test:app`
  - `yarn test:all`
  - `yarn test:coverage`
  - `yarn test:typecheck`
- Lint and format:
  - `yarn test:code`
  - `yarn test:other`
  - `yarn fix`
- Release:
  - `yarn release --tag=test`
  - `yarn release --tag=next --non-interactive`
  - `yarn release --tag=latest --version=<semver>`

## Environment Model

- Development:
  - defaults come from `.env.development`
  - app dev server defaults to port `3001`
  - expected local collab server URL is `http://localhost:3002`
  - expected local AI backend URL is `http://localhost:3016`
- Production:
  - defaults come from `.env.production`
  - share backend points to `json.excalidraw.com`
  - collab points to `https://oss-collab.excalidraw.com`
  - AI points to `https://oss-ai.excalidraw.com`
- Staging-like behavior:
  - Sentry maps `staging.excalidraw.com` and `*.vercel.app` to a staging environment

## Notable Environment Variables

- The checked-in `.env.development` and `.env.production` files are the source of truth for default runtime configuration in this repository.
- Keys present in the checked-in env files:
  - `MODE`
  - `VITE_APP_BACKEND_V2_GET_URL`
  - `VITE_APP_BACKEND_V2_POST_URL`
  - `VITE_APP_LIBRARY_URL`
  - `VITE_APP_LIBRARY_BACKEND`
  - `VITE_APP_WS_SERVER_URL`
  - `VITE_APP_PLUS_LP`
  - `VITE_APP_PLUS_APP`
  - `VITE_APP_AI_BACKEND`
  - `VITE_APP_FIREBASE_CONFIG`
  - `VITE_APP_ENABLE_TRACKING`
  - `VITE_APP_PORT`
  - `VITE_APP_DEBUG_ENABLE_TEXT_CONTAINER_BOUNDING_BOX`
  - `VITE_APP_COLLAPSE_OVERLAY`
  - `VITE_APP_ENABLE_ESLINT`
  - `VITE_APP_ENABLE_PWA`
  - `VITE_APP_PLUS_EXPORT_PUBLIC_KEY`
  - `VITE_APP_DEV_DISABLE_LIVE_RELOAD` (development only)
  - `VITE_APP_DISABLE_PREVENT_UNLOAD` (development only)
- Additional keys are typed in `excalidraw-app/vite-env.d.ts` but are not set in the checked-in `.env.*` files:
  - `VITE_APP_PORTAL_URL`
  - `VITE_APP_DISABLE_SENTRY`
  - `VITE_APP_GIT_SHA`

## Deployment Notes

- Docker builds the app with Node 18 and serves static output from Nginx.
- Vercel uses `excalidraw-app/build` as the output directory.
- Firebase rules in this repo are permissive for `get` and `write`; operational security depends on encrypted payloads and external controls.

## Related Docs

- Product requirements that drive the technical stack choices: [../product/PRD.md](../product/PRD.md)
- Glossary for storage, collaboration, and sharing terminology: [../product/domain-glossary.md](../product/domain-glossary.md)
- Detailed system and module structure: [../technical/architecture.md](../technical/architecture.md)
- Runtime caveats for storage, sync, telemetry, and embedding: [decisionLog.md](decisionLog.md)
- Contributor setup, commands, and troubleshooting: [../technical/dev-setup.md](../technical/dev-setup.md)