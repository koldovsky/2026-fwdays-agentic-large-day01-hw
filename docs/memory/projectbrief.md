# Project Brief

## Product functionality

This repository is the Excalidraw monorepo: a browser-based virtual whiteboard for sketching diagrams with a hand-drawn look.

Core capabilities:

- Drawing and editing on a canvas (shapes, arrows, text, images, frames, etc.).
- Import/export flows (including scene data and images).
- Reusable libraries of elements.
- Live multi-user collaboration using Socket.io (via external collab backend).
- Cloud save/sharing with Firebase (Firestore + Storage).
- Local persistence with IndexedDB (`idb-keyval`).
- Additional app features like command palette, i18n, Sentry integration, and PWA-related build tooling.

In short, the product is both:

1. the Excalidraw web app, and
2. the publishable packages for embedding Excalidraw in other apps.

## Tech stack

### Front-end

- React 19
- TypeScript
- Vite
- SCSS
- Jotai (state management in app code)

### Back-end

- No dedicated in-repo API server.
- The app is primarily a static SPA.
- Collaboration uses `socket.io-client` to connect to an external service.

### Database/persistence

- Firebase (Firestore + Storage) for cloud save/share.
- IndexedDB (via `idb-keyval`) for local browser persistence.

There is no traditional SQL/ORM-backed server in this repository.

### Tooling

- Yarn workspaces (monorepo)
- Vitest (tests)
- ESLint + Prettier
- Husky (git hooks)

## Repository structure

- `excalidraw-app/`: main Vite application shell; app wiring for Excalidraw, Firebase, collaboration, and runtime behavior.
- `packages/`: workspace libraries published/used across the project:
  - `excalidraw/`: main React component, canvas logic, actions, UI, i18n.
  - `common/`, `element/`, `math/`, `utils/`: shared types, element model, geometry, utilities.
- `examples/`: integration examples (`with-nextjs`, `with-script-in-browser`).
- `scripts/`: build/release/locales/docs/wasm helper scripts.
- Root config: workspace scripts, Docker/Vercel config, and shared dev tooling.

## Build and run

### Prerequisites

- Node.js >= 18
- Yarn 1.x (`yarn@1.22.22`)

### Install dependencies

```bash
yarn install
```

### Run in development

```bash
yarn start
```

This starts the app from `excalidraw-app` using Vite dev server.

### Build for production

```bash
yarn build
```

### Build packages only

```bash
yarn build:packages
```

### Preview production build locally

```bash
yarn build:preview
```

### Run tests and checks

```bash
yarn test:all
```

Useful subsets:

```bash
yarn test
yarn test:code
yarn test:typecheck
yarn test:coverage
```

### Run via Docker

```bash
docker compose up --build
```

The compose setup maps container port `80` to host port `3000`.

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md