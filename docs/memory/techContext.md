# Tech Context

> Sources: `package.json`, `excalidraw-app/package.json`, `packages/*/package.json`, `tsconfig.json`, `vitest.config.mts`, `Dockerfile`, `docker-compose.yml`, `.github/workflows/`

---

## Language & Runtime

| Concern | Technology | Version |
|---|---|---|
| Language | TypeScript (strict mode, `noEmit`) | 5.9.3 |
| JSX transform | `react-jsx` (no React import needed) | — |
| Target | ESNext (`lib: ["dom", "dom.iterable", "esnext"]`) | — |
| Module format | ESM (`"type": "module"` in all packages) | — |
| Node.js (runtime) | Node.js | ≥18.0.0 (engines); CI uses 20.x |
| Package manager | Yarn Classic workspaces | 1.22.22 |

---

## Frontend Framework

| Concern | Technology | Version |
|---|---|---|
| UI framework | React | 19.0.0 |
| React DOM | react-dom | 19.0.0 |
| Peer deps (library) | react / react-dom | `^17 \|\| ^18 \|\| ^19` |

---

## Build Tooling

| Concern | Technology | Version |
|---|---|---|
| App bundler (dev + prod) | Vite | 5.0.12 |
| React plugin for Vite | @vitejs/plugin-react | 3.1.0 |
| Library bundler | esbuild | 0.19.10 |
| Type generation | `tsc` (`gen:types` script) | — |
| CSS preprocessor | Sass | 1.51.0 (dep in excalidraw pkg) |
| SVG imports | vite-plugin-svgr | 4.2.0 |
| PWA | vite-plugin-pwa | 0.21.1 |
| EJS templating | vite-plugin-ejs / vite-plugin-html | 1.7.0 / 3.2.2 |
| Type-check in dev | vite-plugin-checker | 0.7.2 |
| Sitemap | vite-plugin-sitemap | 0.7.1 |

---

## Core Application Libraries (`excalidraw-app`)

| Concern | Library | Version |
|---|---|---|
| State management | Jotai | 2.11.0 |
| Real-time collaboration | socket.io-client | 4.7.2 |
| Backend (collab) | Firebase (Firestore + Storage) | 11.3.1 |
| Error tracking | @sentry/browser | 9.0.1 |
| Offline storage | idb-keyval | 6.0.3 |
| i18n detection | i18next-browser-languagedetector | 6.1.4 |
| QR codes | uqr | 0.1.2 |

---

## Core Library Packages (`@excalidraw/excalidraw`)

| Concern | Library | Version |
|---|---|---|
| Canvas (hand-drawn style) | roughjs | 4.6.4 |
| Freehand drawing | perfect-freehand | 1.2.0 |
| Code editor embedding | @codemirror/state, view, commands, language | ^6.0.0 |
| UI primitives | radix-ui | 1.4.3 |
| Mermaid diagrams | @excalidraw/mermaid-to-excalidraw | 2.1.1 |
| Color utilities | tinycolor2 (in @excalidraw/common) | 1.6.0 |
| State management | Jotai + jotai-scope | 2.11.0 / 0.7.2 |
| ID generation | nanoid | 3.3.3 |
| Compression | pako | 2.0.3 |
| URL sanitization | @braintree/sanitize-url | 6.0.2 |
| Image processing | pica + image-blob-reduce | 7.1.1 / 3.0.1 |
| File system access | browser-fs-access | 0.38.0 |
| Laser pointer | @excalidraw/laser-pointer | 1.3.1 |
| Random usernames | @excalidraw/random-username | 1.1.0 / 1.0.0 |

---

## Testing & Quality

| Concern | Technology | Version |
|---|---|---|
| Test runner | Vitest | 3.0.6 |
| Test environment | jsdom | 22.1.0 |
| Coverage | @vitest/coverage-v8 | 3.0.7 |
| DOM testing | @testing-library/react + dom + jest-dom | 16.2.0 / 10.4.0 / 6.6.3 |
| Canvas mock | vitest-canvas-mock | 0.3.3 |
| Fake IndexedDB | fake-indexeddb | 3.1.7 |
| Linting | ESLint (`@excalidraw/eslint-config`) | 1.0.3 |
| Formatting | Prettier (`@excalidraw/prettier-config`) | 2.6.2 / 1.0.2 |
| Git hooks | Husky | 7.0.4 |
| Staged linting | lint-staged | 12.3.7 |

### Coverage Thresholds (`vitest.config.mts`)

| Metric | Threshold |
|---|---|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

---

## TypeScript Path Aliases (`tsconfig.json`)

| Alias | Resolves to |
|---|---|
| `@excalidraw/common` | `packages/common/src/index.ts` |
| `@excalidraw/excalidraw` | `packages/excalidraw/index.tsx` |
| `@excalidraw/element` | `packages/element/src/index.ts` |
| `@excalidraw/math` | `packages/math/src/index.ts` |
| `@excalidraw/utils` | `packages/utils/src/index.ts` |

---

## Infrastructure & Deployment

| Concern | Technology | Detail |
|---|---|---|
| Containerization | Docker multi-stage | Stage 1: `node:18`, Stage 2: `nginx:1.27-alpine` |
| Local containers | docker-compose | Port `3000:80` |
| Production hosting | Vercel | Output: `excalidraw-app/build/` |
| CDN / static serve | nginx (Docker) or Vercel | — |
| Collab backend | Firebase | Firestore (real-time) + Storage (assets) |
| Firebase rules | `firebase-project/firebase.json` | Firestore + Storage rules |

---

## CI/CD (GitHub Actions)

| Workflow file | Trigger | What it does |
|---|---|---|
| `test.yml` | Push → `master` | `yarn install` + `yarn test:app` (Node 20.x) |
| `lint.yml` | Pull request | Prettier + ESLint + `tsc` typecheck (Node 20.x) |
| `build-docker.yml` | — | Docker image build |
| `publish-docker.yml` | — | Docker image publish |
| `sentry-production.yml` | — | Sentry release upload |
| `size-limit.yml` | — | Bundle size checks |
| `test-coverage-pr.yml` | — | Coverage report on PRs |
| `autorelease-excalidraw.yml` | — | Automated package release |
| `locales-coverage.yml` | — | i18n coverage check |
| `semantic-pr-title.yml` | Pull request | Enforce conventional commit PR titles |

---

## Monorepo Package Versions

Core packages are released at `0.18.0`, while `@excalidraw/utils` is versioned separately.

| Package | npm name | Current version |
|---|---|---|
| Main library | `@excalidraw/excalidraw` | 0.18.0 |
| Common utilities | `@excalidraw/common` | 0.18.0 |
| Element model | `@excalidraw/element` | 0.18.0 |
| Math utilities | `@excalidraw/math` | 0.18.0 |
| Standalone utils | `@excalidraw/utils` | 0.1.2 |
| Web app | `excalidraw-app` (private) | 1.0.0 |

---

## Browser Targets

Defined via `browserslist` in package `package.json` files.

**Production:**
- `>0.2%` share, not dead, no IE ≤11, no Opera Mini
- Safari ≥12, Edge ≥79, Chrome ≥70, Samsung ≥10

**Development:**
- Last 1 version of Chrome, Firefox, Safari

## Details

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md)
