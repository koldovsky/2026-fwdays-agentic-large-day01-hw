# 🛠️ Developer Setup Guide

> **Excalidraw** — An open-source, browser-based virtual whiteboard for creating hand-drawn-style diagrams and sketches, featuring real-time collaboration, end-to-end encryption, and an embeddable React component library.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Prerequisites](#-prerequisites)
3. [Step-by-Step Setup](#-step-by-step-setup)
4. [Environment Variables](#-environment-variables)
5. [Docker & Containers](#-docker--containers)
6. [Monorepo & Package Structure](#-monorepo--package-structure)
7. [Services & Ports](#-services--ports)
8. [Common Issues & Troubleshooting](#-common-issues--troubleshooting)
9. [Development Best Practices](#-development-best-practices)
10. [Testing](#-testing)
11. [Security & Authentication](#-security--authentication)
12. [CI/CD Notes](#-cicd-notes)
13. [Additional Resources](#-additional-resources)

---

## 🗺️ Project Overview

Excalidraw is a fully client-side whiteboard application with no traditional server-side backend. All persistence and real-time features are handled through external services.

### Key Technologies

| Layer                       | Technology                                          |
|-----------------------------|-----------------------------------------------------|
| **UI Framework**            | React 19, TypeScript 5.9                            |
| **Build Tool**              | Vite 5                                              |
| **State Management**        | Jotai (atomic state)                                |
| **Styling**                 | SCSS Modules                                        |
| **Canvas Rendering**        | HTML5 Canvas + Rough.js                             |
| **Cloud Persistence**       | Firebase Firestore & Storage (E2E encrypted)        |
| **Real-time Collaboration** | Socket.IO WebSocket server                          |
| **AI Backend**              | External REST API (configurable)                    |
| **Hosting**                 | Vercel (production), Nginx via Docker (self-hosted) |
| **Infrastructure**          | Docker, Docker Compose                              |
| **CI/CD**                   | GitHub Actions                                      |
| **Testing**                 | Vitest + jsdom                                      |
| **Linting**                 | ESLint + Prettier                                   |
| **Package Manager**         | Yarn 1.22.22 (workspaces monorepo)                  |

### Repository Structure

```
excalidraw/
├── excalidraw-app/        # Deployable web application (excalidraw.com)
├── packages/
│   ├── excalidraw/        # Embeddable React component (npm: @excalidraw/excalidraw)
│   ├── common/            # Shared constants and color utilities
│   ├── element/           # Element model and operations
│   ├── math/              # Geometry and vector math utilities
│   └── utils/             # General-purpose utilities
├── examples/
│   └── with-nextjs/       # Example: embedding in a Next.js app
├── scripts/               # Build, release, and tooling scripts
├── docs/                  # Project documentation
├── .github/workflows/     # GitHub Actions CI/CD pipelines
├── Dockerfile
└── docker-compose.yml
```

---

## ✅ Prerequisites

Ensure the following tools are installed before starting.

### Required

| Tool               | Version                    | Install                                                                              |
|--------------------|----------------------------|--------------------------------------------------------------------------------------|
| **Node.js**        | ≥ 18.0.0 (LTS recommended) | [nodejs.org](https://nodejs.org)                                                     |
| **Yarn**           | 1.22.22                    | `npm install -g yarn`                                                                |
| **Git**            | Any recent version         | [git-scm.com](https://git-scm.com)                                                   |
| **Docker Desktop** | Latest stable              | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |

### Recommended IDE

**VS Code** with the following extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier – Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) *(optional)*
- [Vitest](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) — for in-editor test running

### Optional Tools

- **Postman** or **Insomnia** — for testing the backend JSON API endpoints
- **Firebase CLI** (`npm install -g firebase-tools`) — if working with Firestore/Storage locally
- **ngrok** — for exposing local collaboration server to remote teammates

---

## 🚀 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw
```

### 2. Verify Node.js Version

The project requires **Node.js ≥ 18.0.0**.

```bash
node --version
# Should output v18.x.x or higher
```

> 💡 Using [nvm](https://github.com/nvm-sh/nvm)? Run `nvm install 18 && nvm use 18`.

### 3. Install Dependencies

Install all workspace dependencies from the root. This installs packages for the app, all sub-packages, and examples simultaneously.

```bash
yarn install
```

> ⏳ First install may take 1–3 minutes due to workspace linking.

### 4. Configure Environment Variables

Copy the development environment file and create a local override for secrets:

```bash
# The .env.development file is already committed and safe to use as-is for most developers.
# For local overrides (e.g., custom Firebase config, feature flags), create:
cp .env.development .env.development.local
```

Edit `.env.development.local` with any local overrides. See the [Environment Variables](#-environment-variables) section for details.

### 5. Start the Development Server

```bash
yarn start
```

This starts the Vite dev server for `excalidraw-app` on **port 3001** with Hot Module Replacement (HMR) enabled.

### 6. Open the App in Your Browser

```
http://localhost:3001
```

You should see the Excalidraw whiteboard canvas. ✅

### 7. Verify the Setup

Confirm the app loaded correctly by:

- Drawing a shape on the canvas
- Opening the **hamburger menu** → confirming version info is present
- Checking the browser console for any critical errors

> 💡 To test the embeddable component in isolation, run the example app:
> ```bash
> yarn start:example
> ```

---

## 🔐 Environment Variables

The project uses Vite's layered `.env` system. Files are loaded in this order (later files take precedence):

| File                     | Purpose                 | Committed?        |
|--------------------------|-------------------------|-------------------|
| `.env.development`       | Shared dev defaults     | ✅ Yes             |
| `.env.development.local` | Your personal overrides | ❌ No (gitignored) |
| `.env.production`        | Production settings     | ✅ Yes             |

### Key Variables

```bash
# ──────────────────────────────────────────────
# Server mode
# ──────────────────────────────────────────────
MODE="development"

# ──────────────────────────────────────────────
# Dev server port
# ──────────────────────────────────────────────
VITE_APP_PORT=3001

# ──────────────────────────────────────────────
# Backend JSON persistence API
# ──────────────────────────────────────────────
VITE_APP_BACKEND_V2_GET_URL=https://json-dev.excalidraw.com/api/v2/
VITE_APP_BACKEND_V2_POST_URL=https://json-dev.excalidraw.com/api/v2/post/

# ──────────────────────────────────────────────
# Real-time collaboration (Socket.IO server)
# Run locally: https://github.com/excalidraw/excalidraw-room
# ──────────────────────────────────────────────
VITE_APP_WS_SERVER_URL=http://localhost:3002

# ──────────────────────────────────────────────
# AI diagramming backend
# ──────────────────────────────────────────────
VITE_APP_AI_BACKEND=http://localhost:3016

# ──────────────────────────────────────────────
# Excalidraw+ integration
# ──────────────────────────────────────────────
VITE_APP_PLUS_LP=https://plus.excalidraw.com
VITE_APP_PLUS_APP=http://localhost:3000

# ──────────────────────────────────────────────
# Firebase config (JSON string)
# The default points to the OSS dev Firebase project.
# Replace with your own Firebase project config if needed.
# ──────────────────────────────────────────────
VITE_APP_FIREBASE_CONFIG='{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}'

# ──────────────────────────────────────────────
# Feature flags / debug
# ──────────────────────────────────────────────
VITE_APP_ENABLE_TRACKING=true
VITE_APP_ENABLE_ESLINT=true
VITE_APP_ENABLE_PWA=false
VITE_APP_COLLAPSE_OVERLAY=true
VITE_APP_DISABLE_PREVENT_UNLOAD=       # Set to "true" to skip unsaved-changes dialog
VITE_APP_DEV_DISABLE_LIVE_RELOAD=      # Set to "true" when debugging Service Workers

FAST_REFRESH=false
```

> ⚠️ **Never commit `.env.*.local` files.** They are gitignored for a reason — they may contain sensitive API keys or personal Firebase credentials.

---

## 🐳 Docker & Containers

Docker is the recommended way to run a **self-hosted production build** locally, or to mirror the production environment.

### Build the Docker Image

```bash
docker build -t excalidraw:local .
```

This performs a multi-stage build:
1. **Stage 1 (build):** Node 18 — installs deps and runs `yarn build:app:docker`
2. **Stage 2 (runtime):** Nginx 1.27-alpine — serves the static build on port 80

### Start All Services with Docker Compose

```bash
docker-compose up
```

The app will be available at **http://localhost:3000** (Nginx serving the production build).

To run in detached (background) mode:

```bash
docker-compose up -d
```

### Check Logs

```bash
# All services (follow mode)
docker-compose logs -f

# Specific service
docker-compose logs -f excalidraw
```

### Stop Services

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

### Rebuilding After Code Changes

```bash
docker-compose up --build
```

> 💡 **Docker vs `yarn start`:** For active development, use `yarn start` (port 3001) for HMR. Use Docker (port 3000) only to validate the production build or test the Nginx configuration.

---

## 📦 Monorepo & Package Structure

This is a **Yarn workspaces monorepo**. All packages are installed from the root.

### Building Sub-packages

If you're working on the embeddable component or a utility package, build it first:

```bash
# Build all packages (common, math, element, utils, excalidraw)
yarn build:packages

# Build a specific package (from within its directory)
cd packages/excalidraw
yarn build:esm
```

### Cleaning Builds

```bash
# Remove all build artifacts across all workspaces
yarn rm:build

# Fresh dependency install (removes node_modules + reinstalls)
yarn clean-install
```

---

## 🌐 Services & Ports

| Service              | URL                   | Notes                                                                          |
|----------------------|-----------------------|--------------------------------------------------------------------------------|
| **Dev App**          | http://localhost:3001 | `yarn start` — Vite dev server with HMR                                        |
| **Docker App**       | http://localhost:3000 | `docker-compose up` — Nginx production build                                   |
| **Collab Server**    | ws://localhost:3002   | Optional; see [excalidraw-room](https://github.com/excalidraw/excalidraw-room) |
| **AI Backend**       | http://localhost:3016 | Optional; external AI diagramming service                                      |
| **Build Preview**    | http://localhost:5000 | `yarn build:preview` — Vite preview server                                     |
| **Production Serve** | http://localhost:5001 | `yarn start:production` — http-server                                          |

### Optional: Running the Collaboration Server Locally

Real-time multiplayer collaboration requires the `excalidraw-room` Socket.IO server:

```bash
# Clone and run the collaboration server
git clone https://github.com/excalidraw/excalidraw-room.git
cd excalidraw-room
npm install
npm start
# Server starts on port 3002
```

The `.env.development` already points `VITE_APP_WS_SERVER_URL` to `http://localhost:3002`.

---

## 🧯 Common Issues & Troubleshooting

### Port Conflicts

**Symptom:** `Error: listen EADDRINUSE :::3001`

```bash
# Find and kill the process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change the port in .env.development.local
VITE_APP_PORT=3099
```

### Missing or Incorrect Environment Variables

**Symptom:** Features like sharing, collaboration, or Firebase storage silently fail.

- Ensure `.env.development` exists at the repo root (not inside `excalidraw-app/`)
- Confirm `VITE_APP_FIREBASE_CONFIG` is a valid JSON string (single-quoted in the file)
- Vite only exposes variables prefixed with `VITE_` to the browser — other vars are not accessible at runtime

### Docker Permission Errors

**Symptom:** `permission denied while trying to connect to the Docker daemon socket`

```bash
# macOS/Linux: ensure Docker Desktop is running
open -a Docker

# Linux: add your user to the docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Dependency Installation Failures

**Symptom:** `yarn install` hangs or fails with network errors

```bash
# Increase network timeout and retry
yarn install --network-timeout 600000

# If node_modules is corrupted, do a clean install
yarn clean-install
```

### CORS Issues

**Symptom:** API requests to Firebase or collaboration server fail with CORS errors.

- This typically happens when running a local collab server without CORS headers configured
- Ensure `VITE_APP_WS_SERVER_URL` matches the actual server URL (including protocol and port)
- For Firebase: the OSS dev project is pre-configured for `localhost` origins

### TypeScript / Build Errors After Switching Branches

```bash
# Rebuild all packages to sync types
yarn build:packages

# If types are still stale
yarn rm:build && yarn build:packages
```

### HMR (Hot Reload) Not Working

- Set `VITE_APP_DEV_DISABLE_LIVE_RELOAD=` (empty, not `true`) in `.env.development.local`
- Check that no browser extension is blocking WebSocket connections
- Hard-refresh with `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R` (Windows/Linux)

---

## 🧹 Development Best Practices

### Code Structure

- Components live in `excalidraw-app/` (app-level) or `packages/excalidraw/src/` (library-level)
- Shared utilities go in the appropriate sub-package (`packages/common`, `packages/utils`, etc.)
- Avoid importing from `excalidraw-app/` within any `packages/` package — the dependency direction must be `app → packages`, never the reverse

### Linting & Formatting

```bash
# Check for lint errors (zero-tolerance: no warnings allowed)
yarn test:code

# Check formatting
yarn test:other

# Auto-fix both
yarn fix
```

> 💡 Husky + lint-staged run automatically on `git commit`, so many issues are caught before you push.

### Commit Message Guidelines

This project uses **semantic commit messages** enforced via `semantic-pr-title` in CI:

```
<type>(<scope>): <short summary>

Types: feat | fix | docs | refactor | test | chore | perf | style | ci
```

**Examples:**

```
feat(collab): add cursor presence indicator
fix(canvas): prevent double-tap zoom on iOS Safari
docs(readme): update self-hosting instructions
chore(deps): upgrade vite to 5.1.0
```

### Git Branch Strategy

| Branch           | Purpose                                  |
|------------------|------------------------------------------|
| `main`           | Stable, production-ready code            |
| `feature/<name>` | New features (`feature/lasso-select`)    |
| `fix/<name>`     | Bug fixes (`fix/text-wrapping`)          |
| `chore/<name>`   | Maintenance tasks (`chore/upgrade-deps`) |

```bash
# Start a new feature
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Keep up to date with main
git fetch origin
git rebase origin/main
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests once
yarn test

# Run all checks (typecheck + lint + prettier + tests)
yarn test:all

# Run with coverage report
yarn test:coverage

# Run specific test file
yarn test -- packages/excalidraw/src/tests/your-test.test.ts

# Run in watch mode
yarn test -- --watch

# Open the Vitest UI dashboard
yarn test:ui
```

### Coverage Thresholds

Tests must maintain the following minimum coverage (enforced in CI):

| Metric     | Minimum |
|------------|---------|
| Lines      | 60%     |
| Branches   | 70%     |
| Functions  | 63%     |
| Statements | 60%     |

### Type Checking

```bash
yarn test:typecheck
```

---

## 🔐 Security & Authentication

Excalidraw uses **end-to-end encryption** for shared scenes — the server never sees plaintext data. No traditional auth is required to run locally.

### Collaboration Links & Encryption Keys

- When you share a drawing, a random **128-bit AES-GCM key** is generated in the browser
- The key is embedded in the URL fragment (`#key=...`) and never sent to the server
- Only users with the full link can decrypt the scene

### Firebase Authentication (Excalidraw+)

The OSS version does not require Firebase Auth. The Excalidraw+ paid product uses OAuth2 (Google). If you are integrating with `VITE_APP_PLUS_APP`, you will need:

1. A Firebase project with Google Auth enabled
2. The project config set in `VITE_APP_FIREBASE_CONFIG`
3. `localhost` added to Firebase's authorized domains

### Obtaining Test Tokens (Internal API)

If your team runs a private backend API:

```bash
# Example: Get a JWT from an internal auth endpoint
curl -X POST https://your-auth-server/token \
  -H "Content-Type: application/json" \
  -d '{"clientId": "dev", "clientSecret": "your-secret"}'
```

Store the token in `.env.development.local` — never hardcode secrets in committed files.

---

## ⚙️ CI/CD Notes

### GitHub Actions Workflows

Every push and PR triggers the relevant CI checks automatically.

| Workflow                     | Trigger       | What it does                                |
|------------------------------|---------------|---------------------------------------------|
| `test.yml`                   | Push / PR     | Runs Vitest unit tests                      |
| `lint.yml`                   | Push / PR     | ESLint + Prettier checks                    |
| `test-coverage-pr.yml`       | PR            | Posts coverage diff as a PR comment         |
| `size-limit.yml`             | PR            | Checks bundle size hasn't regressed         |
| `build-docker.yml`           | PR            | Validates Docker image builds successfully  |
| `semantic-pr-title.yml`      | PR            | Enforces semantic commit format in PR title |
| `publish-docker.yml`         | Release tag   | Publishes Docker image to registry          |
| `autorelease-excalidraw.yml` | Merge to main | Auto-bumps versions and publishes to npm    |
| `sentry-production.yml`      | Deployment    | Uploads source maps to Sentry               |
| `locales-coverage.yml`       | Push          | Reports i18n translation coverage           |
| `cancel.yml`                 | Push          | Cancels superseded workflow runs            |

### PRs & Merging

- All CI checks must pass before merging
- PR titles must follow semantic format (enforced by `semantic-pr-title.yml`)
- The `autorelease` workflow handles versioning automatically — **do not manually bump versions**

### Local CI Simulation

```bash
# Run the same checks CI runs
yarn test:all
```
