# Tech Context

## Runtime Requirements

- **Node.js**: `>=18.0.0` (enforced via `engines` in root `package.json`)
- **Package manager**: Yarn `1.22.22` (classic, enforced via `packageManager`
  field)
- **Browser targets (production)**: >0.2% market share, no IE≤11, no Safari<12,
  no Chrome<70, no Edge<79

## Core Language & Framework

| Technology | Version  | Role                                         |
| ---------- | -------- | -------------------------------------------- |
| TypeScript | `5.9.3`  | Primary language, strict mode                |
| React      | `19.0.0` | UI framework (class + functional components) |
| React DOM  | `19.0.0` | DOM rendering                                |

## Build System

| Tool                   | Version   | Role                                              |
| ---------------------- | --------- | ------------------------------------------------- |
| Vite                   | `5.0.12`  | Dev server and app bundler                        |
| esbuild                | `0.19.10` | Library package build (`scripts/buildPackage.js`) |
| `@vitejs/plugin-react` | `3.1.0`   | React Fast Refresh in Vite                        |
| `vite-plugin-pwa`      | `0.21.1`  | PWA / service worker generation                   |
| `vite-plugin-svgr`     | `4.2.0`   | SVG-as-React-component imports                    |
| `vite-plugin-checker`  | `0.7.2`   | Type check in dev mode                            |

### Package Build Flow (library)

```text
scripts/buildPackage.js (esbuild) → dist/dev/ + dist/prod/
tsc → dist/types/
```

### App Build Flow

```text
vite build → excalidraw-app/build/
```

## Drawing & Rendering

| Library                     | Version | Role                                  |
| --------------------------- | ------- | ------------------------------------- |
| roughjs                     | `4.6.4` | Hand-drawn stroke rendering on canvas |
| perfect-freehand            | `1.2.0` | Freehand / pencil stroke generation   |
| `@excalidraw/laser-pointer` | `1.3.1` | Laser pointer trail animation         |

## State Management

| Library     | Version  | Role                                                   |
| ----------- | -------- | ------------------------------------------------------ |
| Jotai       | `2.11.0` | Scoped UI state atoms (library, search, sidebar, i18n) |
| jotai-scope | `0.7.2`  | Isolated Jotai provider per editor instance            |

> Core canvas/element state is plain React class component state (`AppState`) —
> not Jotai.

## UI Components & Styling

| Library      | Version  | Role                                              |
| ------------ | -------- | ------------------------------------------------- |
| radix-ui     | `1.4.3`  | Accessible primitive components (dialogs, popups) |
| tunnel-rat   | `0.1.2`  | React portal tunneling (`context/tunnels.ts`)     |
| clsx         | `1.1.1`  | Conditional className utility                     |
| Sass         | `1.51.0` | Component stylesheets (`.scss`)                   |
| CodeMirror 6 | `^6.0.0` | Code editor for mermaid / formula inputs          |

## Collaboration & Real-time

| Library          | Version  | Role                                                       |
| ---------------- | -------- | ---------------------------------------------------------- |
| socket.io-client | `4.7.2`  | WebSocket-based real-time collaboration (`excalidraw-app`) |
| firebase         | `11.3.1` | Cloud persistence / sharing (`excalidraw-app`)             |

## Persistence

| Library           | Version  | Role                                     |
| ----------------- | -------- | ---------------------------------------- |
| idb-keyval        | `6.0.3`  | IndexedDB key-value store (local save)   |
| browser-fs-access | `0.38.0` | File System Access API (open/save files) |
| pako              | `2.0.3`  | gzip compression for exported data       |

## Font Subsetting (WASM)

| Library         | Version | Role                              |
| --------------- | ------- | --------------------------------- |
| harfbuzzjs      | `0.3.6` | HarfBuzz WASM for font subsetting |
| fonteditor-core | `2.4.1` | Font parsing/editing              |

## Observability & Tooling

| Library             | Version | Role                                    |
| ------------------- | ------- | --------------------------------------- |
| `@sentry/browser`   | `9.0.1` | Error tracking in production app        |
| nanoid              | `3.3.3` | ID generation for elements and sessions |
| fractional-indexing | `3.2.0` | Stable element ordering                 |
| lodash.debounce     | `4.0.8` | Debounced scroll/input handlers         |
| lodash.throttle     | `4.1.1` | Throttled high-frequency handlers       |

## Testing

| Tool                     | Version  | Role                        |
| ------------------------ | -------- | --------------------------- |
| Vitest                   | `3.0.6`  | Test runner (replaces Jest) |
| `@vitest/coverage-v8`    | `3.0.7`  | Code coverage               |
| `@testing-library/react` | `16.2.0` | React component testing     |
| jsdom                    | `22.1.0` | DOM environment for tests   |
| vitest-canvas-mock       | `0.3.3`  | Canvas API mock for tests   |
| fake-indexeddb           | `3.1.7`  | IndexedDB mock              |

## Linting & Formatting

| Tool        | Version                               | Config                        |
| ----------- | ------------------------------------- | ----------------------------- |
| ESLint      | (via `eslint-config-react-app 7.0.1`) | `@excalidraw/eslint-config`   |
| Prettier    | `2.6.2`                               | `@excalidraw/prettier-config` |
| lint-staged | `12.3.7`                              | Pre-commit hooks              |
| husky       | `7.0.4`                               | Git hooks                     |

## Deployment

- **Docker**: multi-stage build — Node builds static assets → nginx serves them
  (`Dockerfile`)
- **Vercel**: `vercel.json` points output at `excalidraw-app/build`, sets
  CORS/security headers

## Key Scripts

```bash
# Development
yarn start                    # start excalidraw-app dev server (Vite)

# Building
yarn build                    # build full app (Vite)
yarn build:packages           # build all library packages in order
yarn build:app:docker         # docker build (Sentry disabled)

# Testing
yarn test                     # vitest (watch mode)
yarn test:all                 # typecheck + lint + prettier + vitest
yarn test:typecheck           # tsc only
yarn test:code                # eslint only
yarn test:coverage            # vitest with coverage

# Fixing
yarn fix                      # prettier + eslint --fix

# Releasing
yarn release:latest           # publish @latest to npm
yarn release:next             # publish @next tag
```
