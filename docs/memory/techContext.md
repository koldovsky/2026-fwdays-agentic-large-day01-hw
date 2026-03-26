# Tech Context

## Technologies Used

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| UI Framework | React | 19.0.0 | Component rendering |
| Language | TypeScript | 5.9.3 | Type-safe JS |
| Bundler | Vite | 5.0.12 | Dev server + production build |
| State | Jotai | 2.11.0 | Atom-based state management |
| Canvas | Rough.js | 4.6.4 | Hand-drawn rendering |
| Drawing | Perfect Freehand | 1.2.0 | Smooth freehand strokes |
| Styling | SCSS (Sass) | — | Component styles |
| Auth | Firebase | 11.3.1 | Authentication |
| Realtime | Socket.io | 4.7.2 | Collaboration WebSocket |
| Errors | Sentry | 9.0.1 | Error tracking (prod) |
| Testing | Vitest | 3.0.6 | Unit & integration tests |
| Linting | ESLint + Prettier | — | Code quality |
| Package Mgr | Yarn | 1.22.22 | Monorepo workspaces |
| Node | Node.js | >=18.0.0 | Runtime requirement |

## External APIs & Services

| Service | Dev URL | Prod URL |
|---------|---------|----------|
| Data API (GET) | `https://json-dev.excalidraw.com/api/v2/` | `https://json.excalidraw.com/api/v2/` |
| Data API (POST) | `https://json-dev.excalidraw.com/api/v2/post/` | `https://json.excalidraw.com/api/v2/post/` |
| Collaboration WS | `http://localhost:3002` | `https://oss-collab.excalidraw.com` |
| AI Backend | `http://localhost:3016` | `https://oss-ai.excalidraw.com` |
| Libraries | `https://libraries.excalidraw.com` | same |
| Excalidraw+ | `http://localhost:3000` | `https://app.excalidraw.com` |

Firebase projects: `excalidraw-oss-dev` (dev), `excalidraw-room-persistence` (prod).

## Dev Setup

**Prerequisites:** Node >=18, Yarn 1.22

```bash
yarn install          # Install all workspace dependencies
yarn start            # Dev server on port 3001 (excalidraw-app)
yarn build            # Full production build
yarn test:app         # Run Vitest test suite
yarn test:all         # Typecheck + lint + format + tests
yarn fix              # Auto-fix ESLint + Prettier issues
```

**Path aliases** (configured in tsconfig + vite):
```
@excalidraw/common    → packages/common/src/
@excalidraw/element   → packages/element/src/
@excalidraw/excalidraw → packages/excalidraw/
@excalidraw/math      → packages/math/src/
@excalidraw/utils     → packages/utils/src/
```

## Environment Variables

Key variables (set in `.env.development` / `.env.production`):

| Variable | Purpose |
|----------|---------|
| `VITE_APP_BACKEND_V2_GET_URL` | Data retrieval endpoint |
| `VITE_APP_BACKEND_V2_POST_URL` | Data storage endpoint |
| `VITE_APP_WS_SERVER_URL` | Collaboration WebSocket |
| `VITE_APP_FIREBASE_CONFIG` | Firebase JSON config |
| `VITE_APP_DISABLE_SENTRY` | Disable error tracking |
| `VITE_APP_ENABLE_TRACKING` | Analytics toggle |
| `VITE_APP_PORT` | Dev server port (default 3001) |
| `VITE_APP_GIT_SHA` | Commit hash (set by Vercel) |

## Docker

Multi-stage build: Node 18 (compile) → Nginx Alpine (serve).
```bash
docker build -t excalidraw .
docker run -p 80:80 excalidraw
```
Sentry is disabled in Docker builds (`VITE_APP_DISABLE_SENTRY=true`).

## CI/CD (GitHub Actions)

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `test.yml` | Push to master | Runs `yarn test:app` |
| `lint.yml` | Pull requests | Lint + format + typecheck |
| `test-coverage-pr.yml` | Pull requests | Coverage report |
| `build-docker.yml` | Push to release | Build Docker image |
| `autorelease-excalidraw.yml` | Push to release | Publish `@excalidraw/excalidraw@next` to npm |
| `sentry-production.yml` | Push to release | Upload sourcemaps to Sentry |

**Coverage thresholds:** lines 60%, branches 70%, functions 63%, statements 60%.

## Known Constraints
1. **Container height required** — Excalidraw fills 100% of parent; if parent has no height, canvas is invisible.
2. **CSS import mandatory** — Must import `@excalidraw/excalidraw/index.css`.
3. **Client-only rendering** — Cannot SSR; Next.js requires `dynamic(..., { ssr: false })`.
4. **Font hosting** — Fonts load from CDN by default; self-hosting needs `window.EXCALIDRAW_ASSET_PATH`.
5. **Asset inlining disabled** — `assetsInlineLimit: 0` in Vite to keep fonts as separate cacheable files.

## Coding Conventions (from .github/copilot-instructions.md)
- Functional components with hooks (except App.tsx which is class-based).
- PascalCase for components, camelCase for variables, ALL_CAPS for constants.
- Use `Point` type from `packages/math` instead of `{x, y}` objects.
- Immutable data patterns; use optional chaining.
- Always run `yarn test:app` after changes.
