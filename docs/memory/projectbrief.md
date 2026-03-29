# Project Brief

## What Is This Project?

**Excalidraw** is an open-source, browser-based virtual whiteboard that renders sketches in a hand-drawn style. This repository (`excalidraw-monorepo`) is the official Yarn monorepo containing the full web application, the embeddable React component library, and supporting packages.

> Source: `LICENSE` (Copyright 2020 Excalidraw), `package.json` (`"name": "excalidraw-monorepo"`)

---

## Main Goal

To provide:

1. **A polished collaborative whiteboard web app** (`excalidraw-app`) — the same product powering excalidraw.com — with real-time collaboration, Firebase backend, and offline PWA support.
2. **An embeddable React component** (`@excalidraw/excalidraw`) — a published npm package that lets third-party projects embed a full-featured whiteboard canvas.

---

## Repository Structure

```
excalidraw-monorepo/
├── excalidraw-app/          # Main Vite web application (excalidraw.com)
├── packages/
│   ├── excalidraw/          # @excalidraw/excalidraw — embeddable React component
│   ├── common/              # @excalidraw/common — shared constants & utilities
│   ├── element/             # @excalidraw/element — element data model & rendering logic
│   ├── math/                # @excalidraw/math — geometry & math utilities
│   └── utils/               # @excalidraw/utils — standalone utilities (sanitization, etc.)
├── examples/
│   ├── with-script-in-browser/   # Vite + CDN embed example
│   └── with-nextjs/              # Next.js 14 integration example
├── firebase-project/        # Firestore & storage rules for collab backend
└── scripts/                 # Build and release automation
```

> Source: `package.json` `workspaces` field, directory listing

---

## Technology Stack

### Core
| Concern | Technology |
|---|---|
| Language | TypeScript 5.9 (strict), TSX |
| UI framework | React 19 |
| App bundler | Vite 5 |
| Package manager | Yarn 1.22 (classic workspaces) |

### Application (`excalidraw-app`)
| Concern | Technology |
|---|---|
| State management | Jotai |
| Collaboration | Socket.io client + Firebase (Firestore/Storage) |
| Error tracking | Sentry |
| Offline/PWA | vite-plugin-pwa |
| i18n | i18next + Crowdin pipeline |

### Library (`@excalidraw/excalidraw`)
| Concern | Technology |
|---|---|
| Canvas rendering | Rough.js (hand-drawn style) |
| Code editor embedding | CodeMirror 6 |
| UI primitives | Radix UI |
| Diagramming bridge | Mermaid → Excalidraw |
| Build output | esbuild (ESM) |

### Testing & Quality
| Concern | Technology |
|---|---|
| Test runner | Vitest 3 + jsdom |
| Coverage | @vitest/coverage-v8 |
| Linting | ESLint (`@excalidraw/eslint-config`) |
| Formatting | Prettier 2 |
| Git hooks | Husky + lint-staged |
| Type checking | `tsc` (strict) |

> Source: root `package.json`, `excalidraw-app/package.json`, `packages/excalidraw/package.json`

---

## Package Dependency Graph

```
@excalidraw/common
       ↑
@excalidraw/math ─────────────────────────────────────────┐
       ↑                                                   ↓
@excalidraw/element (depends on common + math)    @excalidraw/excalidraw
                                                           ↑
                                                    excalidraw-app
```

> Source: individual `package.json` `dependencies` fields in `packages/*/`

---

## Key Configuration Files

| File | Purpose |
|---|---|
| `package.json` | Root workspace, scripts, shared devDeps |
| `tsconfig.json` | Monorepo path aliases (`@excalidraw/*`) |
| `vitest.config.mts` | Test setup, coverage thresholds, jsdom |
| `Dockerfile` | Multi-stage: Node 18 build → nginx:alpine serve |
| `docker-compose.yml` | Local container on port `3000:80` |
| `vercel.json` | Deploy config: output `excalidraw-app/build`, security headers |
| `crowdin.yml` | i18n source: `packages/excalidraw/locales/en.json` |
| `firebase-project/firebase.json` | Firestore + storage rules for collab |

---

## Deployment

- **Web app:** `excalidraw-app/build/` (static HTML/JS/CSS)
- **Production serve:** nginx (Docker) or Vercel
- **Library:** published to npm as `@excalidraw/excalidraw` (and sibling packages)
- **Collab backend:** Firebase project (Firestore real-time + Storage)
- **CI/CD:** GitHub Actions (lint, test, Docker publish, Sentry releases, auto-release, size-limit checks)

---

## Key Scripts

```bash
yarn start              # Dev server for excalidraw-app (Vite)
yarn build              # Production build of excalidraw-app
yarn build:packages     # Build all packages (common → math → element → excalidraw)
yarn test               # Run Vitest
yarn test:all           # typecheck + lint + prettier + tests
yarn fix                # Auto-fix lint + formatting issues
```

> Source: root `package.json` `scripts` field

## Details

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md)
