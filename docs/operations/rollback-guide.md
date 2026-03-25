# Rollback Guide & Incident Playbook

> Evidence-based: sourced from CI/CD workflows, Docker config, Vercel config, and app architecture.

---

## Deployment Targets

| Target | How Deployed | Rollback Method |
|--------|-------------|----------------|
| **Vercel (excalidraw.com)** | Auto on release branch | Vercel dashboard → Deployments → Instant Rollback |
| **Docker (self-hosted)** | `docker pull excalidraw/excalidraw:<tag>` | Re-run with previous image tag |
| **NPM packages** | `autorelease-excalidraw.yml` workflow | Publish patch with revert or `npm deprecate` |

---

## Vercel Rollback (Production)

1. Go to **Vercel Dashboard → excalidraw project → Deployments**
2. Find the last known-good deployment
3. Click **"..."** → **"Promote to Production"**
4. Deployment activates in ~30 seconds (no rebuild needed — Vercel caches builds)

> Vercel preserves all previous deployments indefinitely. Instant rollback is always available.

---

## Docker Rollback

### Identify the Previous Image Tag

```bash
# List available tags on DockerHub
docker pull excalidraw/excalidraw --list-tags
# or check: https://hub.docker.com/r/excalidraw/excalidraw/tags
```

### Roll Back

```bash
# Stop current container
docker stop excalidraw && docker rm excalidraw

# Pull and run previous version
docker run -d \
  --name excalidraw \
  -p 3000:80 \
  excalidraw/excalidraw:<previous-tag>
```

### docker-compose Rollback

```yaml
# docker-compose.yml — pin to previous version
services:
  excalidraw:
    image: excalidraw/excalidraw:<previous-tag>  # was: latest
```

```bash
docker-compose up -d
```

---

## NPM Package Rollback

If a bad version of `@excalidraw/excalidraw` was published:

```bash
# Option 1: Deprecate the bad version
npm deprecate @excalidraw/excalidraw@0.18.x "Broken release, use 0.17.x"

# Option 2: Re-publish previous source as a patch
git checkout <last-good-tag>
yarn build:excalidraw
npm publish --tag latest
```

> Note: npm does not allow un-publishing versions older than 72 hours (except for security issues).

---

## Service Dependencies & Their Failure Modes

| Service | Failure Symptom | Degradation Mode |
|---------|----------------|-----------------|
| `oss-collab.excalidraw.com` (Socket.io) | No real-time collaboration | App works fully offline/locally |
| `json.excalidraw.com` | Cannot share/load via link | Local save/export still works |
| `Firebase Storage` | File uploads fail | Images not synced; local canvas unaffected |
| `oss-ai.excalidraw.com` | TTD dialog errors | AI features unavailable; rest of app works |
| `localStorage` (browser) | Elements not persisted | Drawing works but refreshing loses data |

---

## Incident Response Checklist

### P1 — excalidraw.com Down

- [ ] Check Vercel status: https://vercel-status.com
- [ ] Check if last deployment caused the issue → Vercel Dashboard → Instant Rollback
- [ ] Check GitHub Actions `test.yml` — did recent CI pass before deploy?
- [ ] If DNS/CDN: check Vercel domain config

### P2 — Collaboration Not Working

- [ ] Check `oss-collab.excalidraw.com` WebSocket server status (separate repo)
- [ ] Verify `VITE_APP_WS_SERVER_URL` env var points to correct server
- [ ] Check Firebase project quota/billing (`excalidraw-room-persistence`)
- [ ] Confirm `socket.io-client` version matches server version

### P3 — Share Links Broken

- [ ] Check `json.excalidraw.com` API status
- [ ] Verify `VITE_APP_BACKEND_V2_GET_URL` / `POST_URL` env vars
- [ ] Test: `curl https://json.excalidraw.com/api/v2/health` (if endpoint exists)
- [ ] Check `legacy_decodeFromBackend()` — old links may use different format

### P4 — NPM Package Breaking Consumers

- [ ] Check `size-limit.yml` — did bundle size spike?
- [ ] Check `test-coverage-pr.yml` — did coverage drop below threshold?
- [ ] Verify deep imports: v0.18+ removed `types/*` deep import paths
- [ ] Check breaking changes in `CHANGELOG.md` or release notes

---

## Environment Variable Checklist for Self-Hosting

Before deploying, verify these are set correctly:

```bash
# Required for share links
VITE_APP_BACKEND_V2_GET_URL=https://your-json-backend/api/v2/
VITE_APP_BACKEND_V2_POST_URL=https://your-json-backend/api/v2/post

# Required for collaboration
VITE_APP_WS_SERVER_URL=https://your-collab-server

# Optional — AI features
VITE_APP_AI_BACKEND=https://your-ai-backend

# Optional — Firebase (disable if not using)
VITE_APP_FIREBASE_CONFIG={"apiKey":"...","projectId":"..."}

# Font hosting (critical for export quality)
# Set window.EXCALIDRAW_ASSET_PATH in your HTML or env
```

---

## Data Recovery

### Recover Unsaved Drawing from localStorage

```javascript
// In browser DevTools console on excalidraw.com
const data = localStorage.getItem('excalidraw');
const state = localStorage.getItem('excalidraw-state');
console.log(data);     // JSON with elements
console.log(state);    // JSON with appState
```

Copy the output and restore via File → Open or `loadFromBlob()` programmatically.

### Recover from Collab Room

Collab data is persisted in Firebase Firestore under the room ID. Contact Firebase admin with the room ID from the URL fragment to retrieve the last known scene state.

---

## Sentry Error Investigation

Sentry is configured via `sentry-production.yml` (production builds only).

1. Go to Sentry project for Excalidraw
2. Filter by release tag matching the broken deploy
3. Check for `ChunkLoadError` (bad code split) or `TypeError` (API breakage)
4. Match error stack to source maps uploaded by `@sentry/vite-plugin`

To create a new Sentry release after hotfix:
```bash
# Handled automatically by sentry-production.yml on release branch push
# Manual trigger if needed:
yarn build:app
sentry-cli releases new <version>
sentry-cli releases files <version> upload-sourcemaps excalidraw-app/build
sentry-cli releases finalize <version>
```
