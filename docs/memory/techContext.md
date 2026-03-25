# Tech Context

## Core Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.0.0 |
| Language | TypeScript | 5.9.3 (strict mode) |
| Bundler | Vite | 5.0.12 |
| Package Manager | Yarn | 1.22.22 (workspaces) |
| Testing | Vitest | 3.0.6 (jsdom env) |
| State Management | Jotai | 2.11.0 |

## Key Dependencies

### Drawing & Graphics
- **roughjs 4.6.4** — Hand-drawn style shape rendering
- **perfect-freehand 1.2.0** — Stroke smoothing for freehand drawing
- **image-blob-reduce 3.0.1** — Image compression
- **canvas-roundrect-polyfill** — Canvas API polyfill

### Collaboration & Backend
- **socket.io-client 4.7.2** — WebSocket for real-time collaboration
- **firebase 11.3.1** — Auth, Firestore, Storage

### Data Processing
- **pako 2.0.3** — Compression/decompression
- **nanoid 3.3.3** — Unique ID generation
- **fractional-indexing 3.2.0** — Stable list ordering
- **png-chunk-text / png-chunks-encode / png-chunks-extract** — PNG metadata embedding

### UI & Utilities
- **jotai-scope 0.7.2** — Per-instance Jotai store isolation
- **clsx** — Conditional class names
- **fuzzy 0.1.3** — Fuzzy search (command palette)
- **idb-keyval 6.0.3** — IndexedDB wrapper
- **i18next-browser-languagedetector** — Auto language detection
- **@braintree/sanitize-url** — URL sanitization
- **uqr 0.1.2** — QR code generation

### Code Editing
- **CodeMirror 6** (@codemirror/*) — In-app code/text editing

### Monitoring
- **@sentry/browser 9.0.1** — Error tracking (production)
- **SimpleAnalytics** — Privacy-friendly analytics

## Build & Dev Tools
- **vite-plugin-pwa** — PWA support
- **vite-plugin-svgr** — SVG as React components
- **vite-plugin-checker** — Type/lint checking during dev
- **vite-plugin-ejs** — EJS templating for HTML
- **ESLint + Prettier** — Code quality
- **Husky + lint-staged** — Git hooks

## Environment Configuration

### Development
- Dev server: `http://localhost:3001`
- WebSocket: `http://localhost:3002`
- AI backend: `http://localhost:3016`
- Firebase project: `excalidraw-oss-dev`
- Tracking enabled, PWA disabled by default

### Production
- Backend API: `https://json.excalidraw.com/api/v2/`
- WebSocket: `https://oss-collab.excalidraw.com`
- AI backend: `https://oss-ai.excalidraw.com`
- Firebase project: `excalidraw-room-persistence`
- Tracking disabled, PWA enabled

## Monorepo Packages
| Package | Purpose |
|---------|---------|
| `@excalidraw/excalidraw` | Core React component library |
| `@excalidraw/element` | Element types & manipulation |
| `@excalidraw/math` | Geometry & math utilities |
| `@excalidraw/common` | Shared constants, types |
| `@excalidraw/utils` | Helper functions |

## Test Coverage Thresholds
- Lines: 60%, Branches: 70%, Functions: 63%, Statements: 60%

## Key Scripts
```bash
yarn start          # Dev server (port 3001)
yarn build          # Production build
yarn test:all       # All tests (typecheck + code + app)
yarn fix            # Auto-fix lint/format
yarn build:packages # Build all shared packages
```

## Related Docs
- [Dev Setup](../technical/dev-setup.md) — full onboarding from clone to first PR
- [Architecture](../technical/architecture.md) — system design diagrams
- [System Patterns](./systemPatterns.md) — state management, rendering, collaboration
- [Decision Log](./decisionLog.md) — why these technologies were chosen
