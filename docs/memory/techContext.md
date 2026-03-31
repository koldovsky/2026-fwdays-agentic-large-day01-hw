# Technical Context: Excalidraw

## Technology Stack

### Frontend Framework
- **React 19.0.0** - UI library with functional and class components
- **TypeScript 5.9.3** - Static type checking and development-time safety
- **Vite 5.0.12** - Fast build tool and dev server (replacing Webpack)

### State Management
- **Jotai 2.11.0** - Primitive atom-based state management with `jotai-scope` for isolated stores
- **React Class Component** - App.tsx uses `React.Component<AppProps, AppState>` for centralized state
- **Custom AppStateObserver** - Subscription pattern for reactive state changes

### Real-time Collaboration
- **Socket.io-client 4.7.2** - WebSocket client for real-time updates
- **Firebase 11.3.1** - Authentication, database, cloud storage

### Canvas & Rendering
- **RoughJS 4.6.4** - Hand-drawn style rendering
- **Perfect Freehand 1.2.0** - Smooth freehand drawing curves
- **Pica 7.1.1** - Image resizing and processing
- **Canvas Roundrect Polyfill 0.0.1** - Rounded rectangles support

### UI Components & Styling
- **Radix UI 1.4.3** - Accessible component primitives
- **SCSS 1.51.0** - Styling (Sass preprocessor)
- **CSS Modules** - Scoped styling

### Code Quality & Testing
- **Vitest 3.0.6** - Unit test framework
- **@testing-library/react 16.2.0** - React component testing utilities
- **ESLint 7.0.1** - Code linting with custom Excalidraw config
- **Prettier 2.6.2** - Code formatting
- **TypeScript Compiler** - Type checking via `tsc`

### Build & Packaging
- **Esbuild 0.19.10** - Fast JavaScript bundler
- **Vite Plugins**:
  - `@vitejs/plugin-react 3.1.0` - React support
  - `vite-plugin-pwa 0.21.1` - Progressive Web App
  - `vite-plugin-svgr 4.2.0` - SVG as React components
  - `vite-plugin-checker 0.7.2` - Type checking during build

### Utilities
- **Nanoid 3.3.3** - Unique ID generation
- **Lodash debounce/throttle** - Event rate limiting
- **CodeMirror 6** - Code editor for text input
- **Mermaid 2.1.1** - Diagram generation

## Project Structure

```
excalidraw-monorepo/
├── excalidraw-app/          # Main web application
├── packages/                # Reusable libraries
│   ├── excalidraw/         # Core React component
│   ├── element/            # Element types and utilities
│   ├── math/               # Vector/geometry math
│   ├── common/             # Shared constants and utilities
│   └── utils/              # Export utilities (SVG, PNG, Canvas)
├── examples/                # Integration examples
├── scripts/                 # Build and release scripts
├── public/                  # Static assets
└── node_modules/            # Dependencies (pnpm/yarn)
```

## Key Commands

### Development
```bash
yarn start                    # Start dev server (excalidraw-app)
yarn build                    # Build production bundle
yarn build:packages           # Build all package distributions
yarn test                     # Run unit tests (Vitest)
yarn test:code               # Lint code (ESLint)
yarn test:typecheck          # Type check (TypeScript)
yarn fix                      # Fix linting and formatting
```

### Package Builds
```bash
yarn build:excalidraw         # Build @excalidraw/excalidraw package
yarn build:element            # Build @excalidraw/element package
yarn build:math               # Build @excalidraw/math package
yarn build:common             # Build @excalidraw/common package
```

### Testing & Quality
```bash
yarn test:all                 # Run all checks (typecheck, lint, format, tests)
yarn test:coverage            # Generate coverage report
yarn test:ui                  # Vitest UI mode with coverage
```

## Node & Package Manager
- **Node.js**: ≥18.0.0
- **Package Manager**: Yarn 1.22.22 (workspaces for monorepo)
- **Browser Support**: Modern browsers (Chrome 70+, Firefox, Safari 12+, Edge 79+)

## Key Dependencies Versions
| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.0.0 | UI framework |
| TypeScript | 5.9.3 | Type safety |
| Vite | 5.0.12 | Build tool |
| Jotai | 2.11.0 | State management |
| Socket.io | 4.7.2 | Real-time sync |
| Firebase | 11.3.1 | Cloud services |
| RoughJS | 4.6.4 | Hand-drawn style |

## Development Environment Setup
```bash
# Install dependencies
yarn install

# Start development server
yarn start              # Runs on http://localhost:5173

# Type checking in IDE
yarn test:typecheck    # Or configure IDE to use TypeScript 5.9.3

# Pre-commit hooks
# Uses Husky 7.0.4 + lint-staged for automated checks
```

## Build Output Locations
- Production bundle: `excalidraw-app/build/`
- Dev bundle: `excalidraw-app/dev-dist/`
- Package distributions: `packages/*/dist/`
- Type definitions: `packages/*/dist/types/`

---

## 🔗 Related Documentation

**Deep dive into specific areas:**
- **System Architecture**: See [`docs/technical/architecture.md`](../technical/architecture.md) for data flow and rendering pipeline
- **Developer Setup**: See [`docs/technical/dev-setup.md`](../technical/dev-setup.md) for step-by-step environment setup
- **Design Decisions**: See [`decisionLog.md`](decisionLog.md) for why these tech choices were made
- **Product Requirements**: See [`docs/product/PRD.md`](../product/PRD.md) for feature requirements
- **Architecture Patterns**: See [`systemPatterns.md`](systemPatterns.md) for design patterns and state management details
