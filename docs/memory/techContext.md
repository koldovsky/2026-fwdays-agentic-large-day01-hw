# Tech Context

## Runtime and package management

- Node.js: `>=18.0.0` (from root `package.json` engines)
- Package manager: `yarn@1.22.22` (root `package.json`)
- Monorepo: Yarn workspaces
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`

## Core stack

### Front-end

- React `19.0.0` / React DOM `19.0.0` (app)
- TypeScript `5.9.3`
- Vite `5.0.12`
- SCSS/CSS modules and package-level styling
- Jotai `2.11.0` (editor-local state atoms)

### Data, collaboration, and platform APIs

- Firebase `11.3.1` (Firestore + Storage integration in app layer)
- socket.io-client `4.7.2` (live collaboration transport client)
- idb-keyval `6.0.3` (IndexedDB local persistence)

### Testing and quality

- Vitest `3.0.6`
- ESLint + project eslint config
- Prettier + project prettier config
- Husky + lint-staged

## Important scripts (root)

### Install

```bash
corepack yarn install
```

### Start (development)

```bash
corepack yarn start
```

Runs `excalidraw-app` via Vite dev server.

### Build

```bash
corepack yarn build
```

### Build package workspaces only

```bash
corepack yarn build:packages
```

### Production preview

```bash
corepack yarn build:preview
```

### Tests

```bash
corepack yarn test
corepack yarn test:all
corepack yarn test:code
corepack yarn test:typecheck
corepack yarn test:coverage
```

### Cleanup and reinstall helpers

```bash
corepack yarn rm:build
corepack yarn rm:node_modules
corepack yarn clean-install
```

## Docker

- `docker-compose.yml` and `Dockerfile` are present at repo root.
- Typical run:

```bash
docker compose up --build
```

Default compose mapping exposes container port `80` on host `3000`.

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
