# Infrastructure

> Cross-reference: [techContext.md](../memory/techContext.md) for external services, [dev-setup.md](dev-setup.md) for local setup.

## Environments

| Environment | Purpose | Notes |
|-------------|---------|-------|
| `development` | Local dev server | Port 3001, local WS server required on 3002 |
| `production` | excalidraw.com | Vercel hosting, prod Firebase project |
| `docker` | Container build | Uses `yarn build:app:docker` target |

### Environment Variables

| Variable | Dev | Production |
|----------|-----|-----------|
| `VITE_APP_BACKEND_V2_GET_URL` | `https://json-dev.excalidraw.com/api/v2/` | `https://json.excalidraw.com/api/v2/` |
| `VITE_APP_BACKEND_V2_POST_URL` | `https://json-dev.excalidraw.com/api/v2/post` | `https://json.excalidraw.com/api/v2/post` |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | `https://oss-collab.excalidraw.com` |
| `VITE_APP_AI_BACKEND` | `http://localhost:3016` | `https://oss-ai.excalidraw.com` |
| `VITE_APP_LIBRARY_URL` | `https://libraries.excalidraw.com` | same |
| `VITE_APP_FIREBASE_CONFIG` | Dev project JSON | Prod project JSON |
| `VITE_APP_DISABLE_SENTRY` | `true` | `false` (opt-in) |
| `VITE_APP_DISABLE_TRACKING` | `false` | `true` |

## Docker

### Dockerfile (Multi-stage)

**Stage 1 — Builder** (`node:18`)
```
COPY source → yarn install → yarn build:app:docker → output: /opt/node_app/excalidraw-app/build
```

**Stage 2 — Server** (`nginx:1.27-alpine`)
```
COPY /opt/node_app/excalidraw-app/build → /usr/share/nginx/html
HEALTHCHECK: wget -q -O /dev/null http://localhost || exit 1
```

Cross-platform support: `BUILDPLATFORM` / `TARGETPLATFORM` build args for `amd64`, `arm64`, `arm/v7`.

### docker-compose.yml

```yaml
services:
  excalidraw:
    build: .
    ports: ["3000:80"]
    volumes:
      - ./:/opt/node_app/app:delegated
      - ./package.json:/opt/node_app/package.json
      - ./yarn.lock:/opt/node_app/yarn.lock
      - notused:/opt/node_app/app/node_modules   # isolated node_modules
    environment: [development env vars]
    healthcheck: disabled
```

### Self-Hosting Checklist
1. Build image: `docker build -t excalidraw .`
2. Set `window.EXCALIDRAW_ASSET_PATH` to your CDN URL for fonts
3. Configure your own Firebase project (see `firebase-project/`) or remove Firebase deps
4. Point `VITE_APP_WS_SERVER_URL` to your own collab server (see excalidraw-room repo)
5. Run: `docker run -p 3000:80 excalidraw`

## Vercel Deployment

Config: `vercel.json`

| Rule | Detail |
|------|--------|
| CORS headers | `Access-Control-Allow-Origin: https://excalidraw.com` (restricted for API endpoints) |
| Font CORS | Open (`*`) for font files |
| Font caching | `Cache-Control: public, max-age=31536000` (1 year) |
| Redirect `/webex` | → `https://for-webex.excalidraw.com` |
| Redirect `vscode.excalidraw.com` | Host-based redirect → VS Code marketplace page |

## CI/CD Pipelines (GitHub Actions)

### On Push to `master`
| Workflow | Action |
|----------|--------|
| `test.yml` | `yarn install && yarn test:app` on Node 20.x |

### On Pull Request
| Workflow | Action |
|----------|--------|
| `lint.yml` | ESLint + type-check |
| `test-coverage-pr.yml` | Vitest coverage + PR comment report |
| `size-limit.yml` | `@excalidraw/excalidraw` bundle size check |
| `semantic-pr-title.yml` | Validate conventional commit title format |
| `cancel.yml` | Cancel stale CI runs |

### On Release Branch Push
| Workflow | Action |
|----------|--------|
| `autorelease-excalidraw.yml` | Semantic release → npm publish (`@next` tag) |
| `build-docker.yml` | Test Docker build |
| `publish-docker.yml` | Push multi-arch image to DockerHub (`amd64`, `arm64`, `arm/v7`) |
| `sentry-production.yml` | Sentry release + sourcemap upload |

### Utility Workflows
| Workflow | Trigger | Action |
|----------|---------|--------|
| `locales-coverage.yml` | `l10n_master` branch push | Generate translation percentages, auto-commit |

## Firebase Project

Config: `firebase-project/firebase.json`

| Resource | Config File |
|----------|------------|
| Firestore rules | `firestore.rules` |
| Firestore indexes | `firestore.indexes.json` |
| Storage rules | `storage.rules` |

**Storage prefix layout:**
```
/files/shareLinks/   ← encrypted blobs for share links
/files/rooms/        ← files attached to collab rooms
```

## PWA / Service Worker

Config: `excalidraw-app/vite.config.mts` (vite-plugin-pwa + Workbox)

| Asset | Strategy | Max Age |
|-------|----------|---------|
| Fonts (`/fonts/**`) | CacheFirst | 90 days |
| Locales (`/locales/**`) | StaleWhileRevalidate | 30 days |
| CodeMirror chunk | CacheFirst | 60 days |
| Mermaid chunk | CacheFirst | 60 days |
| App shell | NetworkFirst | — |
| Max cached file | — | 2.3 MB |

**Update strategy:** `autoUpdate` — service worker updates silently in the background and activates on next page load.

## Code Quality Gates

| Check | Tool | Threshold |
|-------|------|-----------|
| Linting | ESLint | No errors |
| Formatting | Prettier | No diff |
| Type safety | `tsc --noEmit` | No errors |
| Unit tests | Vitest | Pass |
| Coverage (lines) | v8 | ≥ 60% |
| Coverage (branches) | v8 | ≥ 70% |
| Coverage (functions) | v8 | ≥ 63% |
| Bundle size | size-limit | Defined limit per package |
| PR title | semantic-pr-title | Conventional Commits format |

## CodeRabbit AI Review

Config: `.coderabbit.yaml`

Automated AI code review is configured with path-specific instructions for workshop grading (fwdays 2026 context). Pre-merge checks validate:
- `.cursorignore` file present
- Memory Bank files in `docs/memory/`
- Technical documentation in `docs/technical/`
- Domain glossary in `docs/product/`
- PRD in `docs/product/`
