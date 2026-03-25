# Technical Context

## Tech Stack & Versions

### Core Dependencies

**Frontend Framework**
- React 19.0.10 - UI components and state management
- TypeScript 5.9.3 - Type-safe JavaScript
- JSX/TSX - React components

**Build & Bundling**
- Vite 5.0.12 - Lightning-fast build tool, replaces Webpack
- Babel 7.26.9 - JavaScript transpilation
- esbuild - Fast bundler (via Vite)

**State Management**
- Jotai 2.11.0 - Atomic state management, lightweight alternative to Redux
- EditorJotaiProvider - Scoped context for editor state
- AppJotaiProvider - Scoped context for app state

**Real-time Collaboration**
- Socket.io 4.7.2 - WebSocket communication for live updates
- Firebase 11.3.1 - Cloud backend for authentication, storage, real-time db

**Styling**
- SCSS/Sass - CSS preprocessing with variables and nesting
- CSS Modules - Component-scoped styling

**Testing**
- Vitest 3.0.6 - Fast unit test runner
- @vitest/ui 2.0.5 - Interactive test UI
- Chai 4.3.6 - Assertion library
- jsdom 22.1.0 - DOM implementation for Node.js

**Code Quality**
- ESLint 7.0.1 - JavaScript linting
- Prettier 2.6.2 - Code formatting
- TypeScript strict mode - Type checking

**Internationalization**
- i18n - Multi-language support (50+ languages)
- Crowdin integration - Translation management

**PWA & Offline**
- vite-plugin-pwa 0.21.1 - Progressive Web App support
- Service Workers - Offline functionality
- IndexedDB - Client-side data persistence

**Development Tools**
- Husky 7.0.4 - Git hooks
- lint-staged 12.3.7 - Pre-commit linting
- http-server 14.1.1 - Simple HTTP server
- Vite dev server - HMR with instant reload

### Optional/Plugin Dependencies

- vite-plugin-svgr 4.2.0 - Import SVGs as React components
- vite-plugin-ejs 1.7.0 - EJS templating
- vite-plugin-checker 0.7.2 - TS, ESLint checking during build
- Sentry 9.x.x - Error tracking and monitoring
- Pepjs 0.5.3 - Pointer events polyfill

## Project Structure

### Monorepo Workspaces

```
root/
├── excalidraw-app/             # Web application (Vite + React)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── index.tsx          # React root, PWA setup
│   │   ├── App.tsx            # Main app component (39KB)
│   │   ├── components/        # UI components
│   │   ├── collab/            # Collaboration logic
│   │   ├── data/              # Local storage & Firebase
│   │   └── ...
│   └── vite.config.ts
│
├── packages/
│   ├── excalidraw/            # Core library (npm: @excalidraw/excalidraw)
│   │   ├── index.tsx          # Entry point
│   │   ├── types.ts           # Public TypeScript API (33KB)
│   │   ├── components/        # Reusable UI components
│   │   ├── renderer/          # Canvas rendering engines
│   │   ├── actions/           # 40+ editor actions
│   │   ├── data/              # Serialization & storage
│   │   ├── handlers/          # Event handlers
│   │   ├── tests/             # Unit tests
│   │   └── package.json
│   │
│   ├── element/               # @excalidraw/element package
│   │   ├── types.ts           # Element type definitions (448 lines)
│   │   ├── typeChecks.ts      # Type guard functions
│   │   ├── textElement.ts     # Text element utilities
│   │   ├── bounds.ts          # Bounds calculation
│   │   └── package.json
│   │
│   ├── math/                  # @excalidraw/math package
│   │   ├── index.ts           # Point and matrix operations
│   │   └── package.json
│   │
│   ├── common/                # @excalidraw/common package
│   │   ├── constants.ts       # Theme, font, size constants
│   │   ├── types.ts           # Shared TypeScript types
│   │   └── package.json
│   │
│   └── utils/                 # @excalidraw/utils package
│       ├── export.ts          # exportToBlob, exportToSvg
│       ├── serialize.ts       # serializeAsJSON
│       └── package.json
│
├── examples/
│   ├── with-nextjs/           # Next.js integration example
│   └── with-script-in-browser/ # Vanilla JS example
│
└── scripts/
    ├── release.js             # NPM release automation
    └── build-*.js             # Build helpers
```

## Key Commands

### Development

```bash
# Start development server with HMR
yarn start

# Start production preview
yarn start:production

# Run a specific example
yarn start:example
```

### Building

```bash
# Build all packages (math, common, element, excalidraw)
yarn build:packages

# Build web application
yarn build:app

# Build Docker image
yarn build:app:docker

# Full production build
yarn build

# Build for preview/staging
yarn build:preview
```

### Testing

```bash
# Run Vitest tests (unit & integration)
yarn test

# Run tests with UI (interactive)
yarn test:ui

# Run all quality checks
yarn test:all

# Components: test:typecheck, test:code, test:other, test:app

# Type checking only
yarn test:typecheck

# Linting (ESLint)
yarn test:code

# Formatting check (Prettier)
yarn test:other

# Code coverage
yarn test:coverage
yarn test:coverage:watch
```

### Code Quality

```bash
# Fix all linting and formatting issues
yarn fix

# Fix code style only
yarn fix:code

# Fix formatting only
yarn fix:other

# Update test snapshots
yarn test:update
```

### Release

```bash
# Release to npm (tagged releases)
yarn release              # Latest tag
yarn release:next         # Next tag (pre-release)
yarn release:test         # Test tag (before real release)
```

### Cleanup

```bash
# Remove all build artifacts
yarn rm:build

# Remove all node_modules
yarn rm:node_modules

# Clean reinstall
yarn clean-install
```

## Configuration Files

### Build Configuration
- `vite.config.ts` - Vite bundler config
- `tsconfig.json` - TypeScript compiler options (strict mode)
- `.babelrc` - Babel transpilation rules

### Code Quality
- `.eslintrc.json` - ESLint rules (extends react-app preset)
- `.prettierrc.js` - Prettier formatting rules
- `.lintstagedrc.js` - Pre-commit hooks configuration

### Environment
- `.env.development` - Dev server variables
- `.env.production` - Production build variables
- `firebase-project/` - Firebase config directory

### Other
- `vite-plugin-pwa/` - PWA manifest configuration
- `crowdin.yml` - Translation workflow
- `docker-compose.yml` - Local Docker setup

## Node & Package Manager

```
Node.js:     >= 18.0.0 (ES2020 target)
Package Mgr: Yarn 1.22.22 (workspaces)
Package Mgr: Not npm (use yarn exclusively)
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Modern mobile browsers

## Performance Characteristics

- **Dev Server HMR**: < 100ms hot reload
- **Bundle Size**: Main bundle ~500KB (gzipped ~150KB)
- **Render Time**: < 100ms for typical 100-element diagrams
- **Memory**: ~100MB for 1000+ element canvas
- **Real-time Sync**: < 1 second for multi-user updates
- **Offline Support**: Full functionality, sync on reconnect

## Build Output Structure

```
build/                              # Web app production build
├── index.html                      # Entry HTML with sw.js registration
├── assets/
│   ├── [hash].js                  # JavaScript bundles
│   ├── [hash].css                 # CSS stylesheets
│   └── [hash].[ext]               # Images, fonts, etc.
└── manifest.webmanifest           # PWA manifest

dist/                               # Package builds (ESM)
├── index.js                        # UMD bundle
├── index.d.ts                      # TypeScript declarations
└── ...
```

## Important Notes for Development

1. **Immutable Updates**: Always use `mutateElement()` or `newElementWith()` - never mutate directly
2. **Fractional Indexing**: Element ordering uses `index` property - don't rely on array position
3. **Version Numbers**: Elements have `version` and `versionNonce` for conflict detection
4. **Canvas Rendering**: Three layers - static background, interactive, SVG export
5. **Jotai Atoms**: Use hooks to subscribe to state, don't access store directly
6. **TypeScript**: Strict mode enabled - all types must be explicit
7. **No Webpack**: Vite is the build tool, not Webpack - different config syntax
