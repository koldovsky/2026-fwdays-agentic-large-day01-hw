# Technical Context

## Tech Stack

| Layer              | Technology                                    |
|--------------------|-----------------------------------------------|
| Language           | TypeScript 5.9, strict mode                   |
| UI framework       | React 19 (class component for App, hooks elsewhere) |
| State management   | Jotai 2.11 (isolated stores via jotai-scope)  |
| Canvas rendering   | HTML Canvas API + Rough.js 4.6 (hand-drawn)   |
| Build tool         | Vite 5 (dev server + production build)         |
| Package bundler    | esbuild (for npm package builds)               |
| Test framework     | Vitest 3 + jsdom + @testing-library/react      |
| Linting            | ESLint + Prettier (pre-commit via Husky + lint-staged) |
| Package manager    | Yarn 1.22 (workspaces)                         |
| Backend (app only) | Firebase (auth, storage), Sentry (errors), socket.io (collab) |
| Node requirement   | >= 18.0.0                                      |

## Key Dependencies

- **roughjs** — hand-drawn rendering style on canvas
- **perfect-freehand** — pressure-sensitive freehand drawing
- **jotai / jotai-scope** — atomic state management with editor isolation
- **nanoid** — unique element ID generation
- **pako** — compression for data serialization
- **fractional-indexing** — element ordering
- **radix-ui** — accessible UI primitives
- **lodash.throttle / lodash.debounce** — performance optimization
- **@excalidraw/mermaid-to-excalidraw** — Mermaid diagram conversion

## Development Commands

```bash
yarn                          # Install dependencies
yarn start                    # Dev server (Vite, excalidraw-app)
yarn build                    # Production build
yarn build:packages           # Build all packages (common → math → element → excalidraw)

# Testing
yarn test:app                 # Vitest in watch mode
yarn test:app --watch=false   # Single run
vitest run path/to/file.test.tsx  # Single test file
yarn test:all                 # Full suite: typecheck + lint + prettier + tests
yarn test:typecheck           # tsc only
yarn test:code                # ESLint (--max-warnings=0)
yarn test:other               # Prettier check

# Fixing
yarn fix                      # Auto-fix prettier + eslint
yarn fix:code                 # ESLint --fix only

# Cleanup
yarn rm:build                 # Remove all build artifacts
yarn rm:node_modules          # Remove all node_modules
yarn clean-install            # Full clean reinstall
```

## Monorepo Structure

Yarn workspaces with 5 packages + the app:

| Package               | Import as             | Purpose                              |
|-----------------------|-----------------------|--------------------------------------|
| `packages/common`     | `@excalidraw/common`  | Shared utilities, constants, types   |
| `packages/math`       | `@excalidraw/math`    | Geometry, vectors, curves, Point type|
| `packages/element`    | `@excalidraw/element` | Element types, mutations, bounds, Scene |
| `packages/excalidraw` | `@excalidraw/excalidraw` | Main React component, UI, actions, rendering |
| `packages/utils`      | `@excalidraw/utils`   | Public utility helpers (export, bounds) |
| `excalidraw-app`      | (private)             | Hosted web app (Firebase, collab)    |

**Build order matters:** `common → math → element → excalidraw`

Path aliases (`@excalidraw/*`) resolve to source during dev/test via `tsconfig.json` paths and `vitest.config.mts` aliases.

## Build & Deploy

- **Dev:** `yarn start` runs Vite dev server for `excalidraw-app`
- **Production:** `yarn build` builds the app via Vite + generates version file
- **Packages:** `yarn build:packages` builds ESM bundles via esbuild + generates TypeScript types
- **Docker:** `yarn build:app:docker` builds with Sentry disabled
- **Deployment:** Vercel (configured via `vercel.json`)
- **CI:** GitHub Actions (`.github/` directory)

## Related Docs

### Technical
- [Architecture](../technical/architecture.md) — system design, data flow, rendering pipeline
- [Dev Setup](../technical/dev-setup.md) — onboarding guide, from git clone to first PR

### Product
- [PRD](../product/PRD.md) — reverse-engineered product requirements
- [Domain Glossary](../product/domain-glossary.md) — core domain terms