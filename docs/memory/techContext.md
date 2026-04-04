# Excalidraw — Technology Context

## Language & Runtime

- **TypeScript 5.9** — strict mode across all packages
- **React 19** + React DOM 19 — UI rendering
- **Canvas 2D API** — primary drawing surface

## Build & Bundling

- **Vite 5.0** — dev server and app bundler
- **ESBuild 0.19** — package bundling (for npm distribution)
- **Yarn Workspaces** — monorepo management
- **Sass 1.51** — CSS preprocessing

## Core Libraries

| Library | Purpose |
|---------|---------|
| Rough.js 4.6 | Hand-drawn sketch rendering |
| Perfect Freehand 1.2 | Smooth freedraw strokes |
| Jotai 2.11 | Atomic state management |
| Pako 2.0 | zlib compression for data serialization |
| Nanoid 3.3 | Unique element ID generation |
| Fractional-indexing 3.2 | Collaborative element ordering |
| i18next | Internationalization (58 locales) |
| Socket.io-client 4.7 | Real-time collaboration transport |

## Testing

- **Vitest 3.0** — unit and integration tests
- **@testing-library/react 16** — React component testing
- **vitest-canvas-mock** — Canvas API mocking
- **@vitest/coverage-v8** — code coverage

## Code Quality

- **ESLint** with `@excalidraw/eslint-config`
- **Prettier 2.6** with `@excalidraw/prettier-config`
- **Husky 7** + **lint-staged 12** — pre-commit hooks
- **TypeScript strict mode** — compile-time type safety

## Infrastructure

- **Firebase 11.3** — backend for excalidraw.com (auth, storage, database)
- **Sentry 9.0** — error tracking and monitoring
- **Docker** — containerized deployment option
- **Vercel** — hosting and deployment (via `vercel.json`)

## Key Commands

```bash
yarn install          # Install dependencies
yarn start            # Dev server on port 5173 (Vite default)
yarn build            # Production build
yarn test:all         # Run all tests
yarn test:app         # Unit/integration tests (Vitest)
yarn test:typecheck   # TypeScript type checking
yarn test:code        # ESLint
yarn fix              # Auto-fix lint + formatting
```

## Monorepo Packages

| Package | Role |
|---------|------|
| `packages/common` | Shared constants, utilities, types |
| `packages/element` | Element types, transforms, rendering logic |
| `packages/excalidraw` | Main React component library (published to npm) |
| `packages/math` | 2D geometry: vectors, points, matrices, angles |
| `packages/utils` | Export/import utilities (JSON, PNG, SVG, Blob) |
| `excalidraw-app` | Standalone web application (excalidraw.com) |
