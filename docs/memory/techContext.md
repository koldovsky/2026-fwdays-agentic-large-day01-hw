# Technical Context - Excalidraw

## Project Overview
- **Type**: Monorepo (Yarn Workspaces)
- **Package Manager**: Yarn 1.22.22
- **License**: MIT
- **Node**: >=18.0.0

## Core Stack

### Frontend
- **React**: 19.0.0 (react-jsx)
- **TypeScript**: 5.9.3 (strict, ESNext)
- **Jotai**: 2.11.0 (state), jotai-scope: 0.7.2

### Build & Dev Tools
- **Vite**: 5.0.12 (dev server, bundler)
- **ESBuild**: 0.19.10
- **Sass**: 1.51.0
- **Vitest**: 3.0.6 (testing)
- **@testing-library/react**: 16.2.0
- **JSDOM**: 22.1.0

### Graphics & Canvas
- **RoughJS**: 4.6.4 (hand-drawn rendering)
- **Perfect Freehand**: 1.2.0
- **Pako**: 2.0.3 (compression)
- **Pica**: 7.1.1 (image processing)

### Collaboration & Backend
- **Firebase**: 11.3.1 (auth, storage)
- **Socket.io Client**: 4.7.2 (real-time)

### Code Editor
- **CodeMirror**: 6.x (@codemirror/commands, state, view, language)

### Utilities
- **Nanoid**: 3.3.3 (IDs)
- **Lodash**: debounce 4.0.8, throttle 4.1.1
- **Fractional Indexing**: 3.2.0
- **Tunnel Rat**: 0.1.2 (portals)

### Quality & DevOps
- **ESLint**: 7.0.1, **Prettier**: 2.6.2
- **Husky**: 7.0.4, **Lint-staged**: 12.3.7
- **Sentry**: 9.0.1 (monitoring)

### Vite Plugins
- @vitejs/plugin-react: 3.1.0, vite-plugin-pwa: 0.21.1, vite-plugin-svgr: 4.2.0

## Workspace Structure

### Packages
```text
excalidraw-app/               # Standalone app
packages/
  ├── excalidraw/ (0.18.0)   # Core library (@excalidraw/excalidraw)
  ├── common/ (0.18.0)       # Shared utilities
  ├── element/ (0.18.0)      # Element types
  ├── math/ (0.18.0)         # Geometry
  └── utils/                 # Helpers
examples/
  ├── with-nextjs/
  └── with-script-in-browser/
```

### TypeScript Paths (tsconfig.json)
```text
@excalidraw/common      → packages/common/src/index.ts
@excalidraw/excalidraw  → packages/excalidraw/index.tsx
@excalidraw/element     → packages/element/src/index.ts
@excalidraw/math        → packages/math/src/index.ts
@excalidraw/utils       → packages/utils/src/index.ts
```

## Commands

### Development
```bash
yarn start              # Dev server (port 3001)
yarn start:production   # Build + serve
```

### Build
```bash
yarn build             # Build app
yarn build:app         # App only
yarn build:packages    # All packages (common, math, element, excalidraw)
yarn build:version     # Generate version.json
```

### Test
```bash
yarn test              # Vitest
yarn test:all          # All tests (typecheck + code + app)
yarn test:coverage     # With coverage
yarn test:ui           # Vitest UI
```

### Quality
```bash
yarn fix               # Prettier + ESLint --fix
yarn test:code         # ESLint
yarn test:typecheck    # TypeScript check
```

### Maintenance
```bash
yarn clean-install     # Remove node_modules + reinstall
yarn rm:build          # Remove build artifacts
```

### Release
```bash
yarn release           # Release package
yarn release:latest    # @latest tag
yarn release:next      # @next tag
```

## TypeScript Config

### Compiler Options
- Target: ESNext, Module: ESNext
- JSX: react-jsx, Strict: true
- Module Resolution: node
- No Emit: true (type checking only)

### Paths
- BaseUrl: ".", Include: excalidraw-app (та workspace packages), Exclude: examples/dist/types/tests

## Package Exports (@excalidraw/excalidraw)

```javascript
{
  ".": {
    types: "./dist/types/excalidraw/index.d.ts",
    development: "./dist/dev/index.js",
    production: "./dist/prod/index.js"
  },
  "./index.css": {
    development: "./dist/dev/index.css",
    production: "./dist/prod/index.css"
  }
}
```

## Browser Support

### Production
- >0.2%, not dead, not IE <=11, Safari >=12, Edge >=79, Chrome >=70, Not Opera Mini, KaiOS >2.5

### Development
- Last Chrome/Firefox/Safari version

## File Structure
```text
.
├── excalidraw-app/          # Standalone web app
│   ├── App.tsx, index.tsx
│   ├── components/, collab/, data/
├── packages/excalidraw/     # Core library
│   ├── components/ (App.tsx 12,818 lines)
│   ├── actions/ (32+), scene/, renderer/
│   ├── data/, fonts/, locales/
├── packages/                # Utilities
│   ├── common/src/, element/src/
│   ├── math/src/, utils/src/
├── scripts/                 # Build tools
└── docs/memory/             # Documentation
```

## Environment Variables
- `VITE_APP_GIT_SHA` - Commit SHA
- `VITE_APP_ENABLE_TRACKING` - Analytics
- `VITE_APP_DISABLE_SENTRY` - Disable error tracking

## Related Documentation

### Memory Bank
[System Patterns](systemPatterns.md) • [Project Brief](projectbrief.md) • [Product Context](productContext.md)

### Technical Documentation
[Architecture](../technical/architecture.md) • [Dev Setup](../technical/dev-setup.md)

### Product Documentation
[Domain Glossary](../product/domain-glossary.md)
