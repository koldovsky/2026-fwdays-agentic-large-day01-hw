# Tech Context

## Languages and Runtimes

| Item | Version |
| --- | --- |
| TypeScript | 5.9.3 — `strict: true`, `isolatedModules: true`, target `ESNext` |
| Node.js | `>=18.0.0` (engines field) |
| React | 19.0.0 (app); peerDep `^17\|\|^18\|\|^19` (library) |
| react-dom | 19.0.0 |

## Frameworks and Key Libraries

| Library | Version | Role |
| --- | --- | --- |
| Vite | 5.0.12 | Build tool for app; `esbuild` used for package builds |
| Vitest | 3.0.6 | Test runner (jsdom environment) |
| roughjs | 4.6.4 | Hand-drawn rendering of shapes via `RoughCanvas` / `RoughGenerator` |
| perfect-freehand | 1.2.0 | Pressure-sensitive stroke paths for freedraw elements |
| Jotai | 2.11.0 | Atom-based state for isolated UI pieces |
| jotai-scope | 0.7.2 | Creates isolated Jotai stores (prevents atom bleed-through to host apps) |
| Socket.IO client | 4.7.2 | WebSocket transport for collaboration (in `excalidraw-app` only) |
| Firebase | 11.3.1 | Firestore for encrypted scene storage; Storage for binary files (app only) |
| @excalidraw/mermaid-to-excalidraw | 2.1.1 | Converts Mermaid syntax to Excalidraw elements |
| @sentry/browser | 9.0.1 | Error monitoring (app only, gated to `excalidraw.com` hosts) |
| idb-keyval | 6.0.3 | IndexedDB wrapper for binary file and library persistence |
| pako | 2.0.3 | Deflate compression for encoded scenes and file uploads |
| nanoid | 3.3.3 | Random ID generation for elements and room IDs |
| fractional-indexing | 3.2.0 | Stable fractional string keys for element ordering |
| i18next | (via `i18next-browser-languagedetector 6.1.4`) | i18n with Crowdin-managed translations |
| sass | 1.51.0 | SCSS styling (CSS Modules + global styles) |
| tinycolor2 | 1.6.0 | Color manipulation in `@excalidraw/common` |
| radix-ui | 1.4.3 | Accessible UI primitives |
| CodeMirror | ^6 | Code editor for the TTD/Mermaid dialog |

## Package / Workspace Layout

```text
excalidraw-monorepo/          (Yarn 1.22.22 workspaces)
├── excalidraw-app/           private web app
├── packages/
│   ├── common/               @excalidraw/common@0.18.0
│   ├── math/                 @excalidraw/math@0.18.0
│   ├── element/              @excalidraw/element@0.18.0
│   ├── excalidraw/           @excalidraw/excalidraw@0.18.0
│   └── utils/                @excalidraw/utils@0.1.2
└── examples/
    ├── with-nextjs/
    └── with-script-in-browser/
```

Dependency direction (strict): `common ← math ← element ← excalidraw ← excalidraw-app`

TypeScript path aliases in `tsconfig.json` and `vitest.config.mts` map `@excalidraw/*` to the local `src/` files, enabling live source-level resolution without building first during development and testing.

## Build System

### App build (`excalidraw-app`)

- `yarn start` → Vite dev server, port 3000 (configurable via `VITE_APP_PORT`), resolves `@excalidraw/*` from local source.
- `yarn build` → `vite build` → output in `excalidraw-app/build/`; Sentry tracking enabled, Vite sourcemaps on.
- `yarn build:app:docker` → same but `VITE_APP_DISABLE_SENTRY=true`; used in Dockerfile.
- Custom Rollup chunks: locale files split per locale, `mermaid-to-excalidraw`, `codemirror.chunk`, font files.
- PWA manifest baked in via `vite-plugin-pwa` / Workbox (service worker with `CacheFirst` for fonts and lazy chunks).

### Package builds (`packages/*`)

- `yarn build:packages` (root) runs `common → math → element → excalidraw` in order.
- Each package uses `scripts/buildBase.js` (or `buildPackage.js` for `excalidraw`) with `esbuild` + `esbuild-sass-plugin`.
- Output: `dist/dev/index.js` + `dist/prod/index.js` (minified) + `dist/types/` (from `tsc`).
- Packages expose an `exports` map with `development`/`default` conditions.

## Dev Commands Reference

| Command | Effect |
| --- | --- |
| `yarn start` | Start Vite dev server for `excalidraw-app` |
| `yarn build` | Build the web app for production |
| `yarn build:packages` | Build all sub-packages in dependency order |
| `yarn test:app` | Run Vitest in watch mode |
| `yarn test:coverage` | Run Vitest with coverage report |
| `yarn test:all` | typecheck + eslint + prettier + vitest (no watch) |
| `yarn fix` | Auto-fix ESLint + Prettier issues |
| `yarn release:next` | Publish `@excalidraw/excalidraw` as `next` dist-tag |
| `yarn release:latest` | Publish as `latest` |
| `yarn locales-coverage` | Compute translation coverage |

## Environment Variables (App)

| Variable | Purpose |
| --- | --- |
| `VITE_APP_WS_SERVER_URL` | Socket.IO server URL for collaboration |
| `VITE_APP_BACKEND_V2_POST_URL` | Backend for shareable link POST |
| `VITE_APP_BACKEND_V2_GET_URL` | Backend for shareable link GET |
| `VITE_APP_FIREBASE_CONFIG` | Firebase project config JSON |
| `VITE_APP_GIT_SHA` | Injected by Vercel (`$VERCEL_GIT_COMMIT_SHA`) |
| `VITE_APP_ENABLE_TRACKING` | Enables analytics/Sentry on build |
| `VITE_APP_DISABLE_SENTRY` | Disables Sentry (used for Docker build) |
| `VITE_APP_PORT` | Dev server port (default 3000) |
| `VITE_APP_COLLAPSE_OVERLAY` | Controls vite-plugin-checker overlay |

`envDir` in Vite config is set to `../` — `.env` files are read from the monorepo root.

## Testing Stack

- **Runner**: Vitest 3 with `jsdom` environment and `globals: true`
- **Canvas**: `vitest-canvas-mock` for `HTMLCanvasElement` mocking
- **Components**: `@testing-library/react` 16 + `@testing-library/jest-dom`
- **IndexedDB**: `fake-indexeddb/auto`
- **Pointer events**: `pepjs` polyfill
- **Coverage**: `@vitest/coverage-v8` — thresholds: lines 60%, branches 70%, functions 63%, statements 60%
- Setup in `setupTests.ts`: mocks `throttleRAF`, polyfills `FontFace`, `matchMedia`

## Deployment

### Vercel (primary)

- `vercel.json` points `outputDirectory: "excalidraw-app/build"`, `installCommand: "yarn install"`.
- Custom headers: `X-Content-Type-Options`, `Referrer-Policy`, 1-year cache for `.woff2` fonts.
- Redirects: `/webex/*` → external, `vscode.excalidraw.com` → VS Code Marketplace.

### Docker / nginx (self-hosting)

- Multi-stage Dockerfile: Node 18 build stage → `nginx:1.27-alpine` serve stage.
- Build uses `--platform=${BUILDPLATFORM}` / `--platform=${TARGETPLATFORM}` for cross-compilation.
- Published to `excalidraw/excalidraw:latest` on DockerHub as `linux/amd64`, `linux/arm64`, `linux/arm/v7`.
- Health check: `wget -q -O /dev/null http://localhost`.

## Related Docs

- [Technical Architecture](../technical/architecture.md) — how these technologies are wired together: data flow, state management, rendering pipeline, package dependency graph
- [Developer Setup](../technical/dev-setup.md) — step-by-step clone, install, build, validation commands, common pitfalls, and PR checklist

## Source Evidence

- `package.json` (root) — workspaces, scripts, devDependencies, engines
- `excalidraw-app/package.json` — app dependencies, build scripts
- `packages/excalidraw/package.json` — library dependencies, exports map
- `packages/*/package.json` — sub-package dependencies
- `tsconfig.json` — compiler options, path aliases
- `vitest.config.mts` — test config, resolve aliases, coverage
- `excalidraw-app/vite.config.mts` — Vite plugins, Rollup chunks, PWA config, envDir
- `Dockerfile` — multi-stage build process
- `vercel.json` — deployment settings, headers, redirects
- `.github/workflows/` — CI pipeline definitions
