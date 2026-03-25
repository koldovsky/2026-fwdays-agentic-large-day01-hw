# Excalidraw — Project Guide for AI Assistants

## What This Project Is

Excalidraw is a collaborative, open-source virtual whiteboard with a hand-drawn aesthetic. It is both:
- A **standalone web app** deployed at excalidraw.com
- A **React component library** (`@excalidraw/excalidraw`) embeddable in any React project

## Key Commands

```bash
# Development
yarn start                   # Dev server at http://localhost:3001

# Building
yarn build:app               # Build main application (output: excalidraw-app/build)
yarn build:packages          # Build all publishable packages

# Testing
yarn test:app                # Run Vitest unit tests
yarn test:all                # ESLint + Prettier + Vitest
yarn test:coverage           # Coverage report

# Code Quality
yarn fix:code                # Auto-fix ESLint issues
yarn fix:other               # Auto-format with Prettier

# Utilities
yarn locales-coverage        # Check translation completeness
yarn clean-install           # Fresh dependency install
```

## Monorepo Structure

```
/
├── excalidraw-app/      # Deployed web application
├── packages/
│   ├── excalidraw/      # Core React component library (@excalidraw/excalidraw)
│   ├── element/         # Element types and operations
│   ├── common/          # Shared constants, utilities, event bus
│   ├── math/            # 2D math / vector operations
│   └── utils/           # Miscellaneous utilities
├── examples/            # Integration examples (Next.js, browser script)
├── firebase-project/    # Firebase rules and config
├── public/              # Static assets
└── docs/                # Project documentation (Memory Bank)
```

> Full documentation index: [docs/index.md](docs/index.md)

## Memory Bank (docs/memory/)

| File | Purpose |
|------|---------|
| [projectbrief.md](docs/memory/projectbrief.md) | Core goals, vision, and current project scope |
| [productContext.md](docs/memory/productContext.md) | Target audience and problems being solved |
| [techContext.md](docs/memory/techContext.md) | Tech stack, architecture, and infrastructure |
| [systemPatterns.md](docs/memory/systemPatterns.md) | Design patterns, data structures, and flows |
| [activeContext.md](docs/memory/activeContext.md) | Current state of code and development focus |
| [progress.md](docs/memory/progress.md) | Implementation status (Done / Backlog) |
| [decisionLog.md](docs/memory/decisionLog.md) | Registry of architectural decisions |

## Technical Docs (docs/technical/)

| File | Purpose |
|------|---------|
| [architecture.md](docs/technical/architecture.md) | Package layers, component hierarchy, rendering pipeline, public API |
| [infrastructure.md](docs/technical/infrastructure.md) | Docker, CI/CD workflows, Vercel config, Firebase, PWA caching |
| [dev-setup.md](docs/technical/dev-setup.md) | Step-by-step local development setup |

## Product Docs (docs/product/)

| File | Purpose |
|------|---------|
| [domain-glossary.md](docs/product/domain-glossary.md) | All domain terms found in source code, organized by area |
| [feature-catalog.md](docs/product/feature-catalog.md) | Complete catalog of implemented features with source references |
| [PRD.md](docs/product/PRD.md) | Reverse-engineered Product Requirements Document |

## Reference (docs/reference/)

| File | Purpose |
|------|---------|
| [dependency-map.md](docs/reference/dependency-map.md) | All external libraries, roles, criticality, and upgrade risks |
| [api-schema.md](docs/reference/api-schema.md) | ExcalidrawProps, ImperativeAPI, core types, backend JSON API, WebSocket protocol |

## Operations (docs/operations/)

| File | Purpose |
|------|---------|
| [rollback-guide.md](docs/operations/rollback-guide.md) | Rollback procedures for Vercel/Docker/NPM, incident playbook, data recovery |

## Coding Guidelines

### TypeScript
- Strict mode enabled — no implicit `any`, all types must be explicit
- Use type-only imports: `import type { Foo } from '...'`
- Path aliases: `@excalidraw/common`, `@excalidraw/element`, etc. (configured in tsconfig)

### State Management
- **Always** use the local Jotai wrappers (`app-jotai.ts`, `editor-jotai.ts`) — never import `jotai` directly (enforced by ESLint)

### Naming Conventions
- React components: `PascalCase`
- Utilities and hooks: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- CSS classes: `kebab-case`

### Package Boundaries
- Each package exports from a single `index.ts`
- Avoid deep imports into other packages
- `@excalidraw/excalidraw` package: do not use `types/*` prefixed deep imports (removed in 0.18.x)

### Testing
- Unit tests with Vitest + jsdom environment
- Canvas must be mocked (`vitest-canvas-mock`)
- Coverage thresholds: lines 60%, branches 70%, functions 63%

### Formatting
- Prettier config from `@excalidraw/prettier-config`
- ESLint config from `@excalidraw/eslint-config`
- Run `yarn fix:code && yarn fix:other` before committing
