# Excalidraw Project Brief

## Overview

**Excalidraw** is an open-source virtual whiteboard/drawing application for creating sketches, diagrams, and illustrations with a distinctive hand-drawn aesthetic. It serves as both a standalone web application and a reusable React component library.

**License:** MIT
**Package:** `@excalidraw/excalidraw`

## Purpose

Excalidraw provides a collaborative drawing tool designed for:
- Creating technical diagrams, wireframes, and flowcharts
- Real-time collaboration on sketches and diagrams
- Building visual representations with a hand-drawn look
- Embedding as a React component in other applications

### Key Features
- Real-time collaboration via WebSocket
- Firebase integration for persistence and authentication
- Multiple export formats (SVG, PNG, etc.)
- Reusable component library system
- Progressive Web App (PWA) support
- Internationalization (i18n) with multiple locales
- AI integration capabilities
- Text-to-diagram functionality

## Technology Stack

### Core Technologies
- **React 19.0.0** - UI framework with functional components and hooks
- **TypeScript 5.9.3** - Type-safe development
- **Vite 5.0.12** - Build tool and development server
- **Vitest 3.0.6** - Testing framework with coverage
- **Yarn 1.22.22** - Package manager (monorepo workspace)

### State Management
- **Jotai 2.11.0** - Atomic state management library

### Collaboration & Backend
- **Socket.io-client 4.7.2** - Real-time collaboration via WebSocket
- **Firebase 11.3.1** - Authentication, storage, and persistence
- **Firestore** - Database for collaborative features

### Graphics & Rendering
- **Canvas API** - Primary rendering engine
- **RoughJS 4.6.4** - Hand-drawn/sketchy rendering style
- **Perfect-freehand 1.2.0** - Freehand drawing capabilities
- **Pako 2.0.3** - Compression library
- Image processing libraries (pica, image-blob-reduce)

### Additional Libraries
- **CodeMirror 6** - Code editing functionality
- **Mermaid-to-Excalidraw** - Diagram format conversion
- **i18next** - Internationalization framework
- **Sentry** - Error tracking and monitoring
- **Sass 1.51.0** - CSS preprocessing

### Build & Development Tools
- **ESLint** - Code linting
- **Prettier 2.6.2** - Code formatting
- **Husky 7.0.4** - Git hooks management
- **Vite plugins** - PWA, SVGR, EJS, HTML, checker, sitemap
- **Docker** - Containerization support
- **Nginx** - Production deployment server

## Project Structure

### Monorepo Architecture

The project uses **Yarn workspaces** to manage a monorepo structure:

```
├── excalidraw-app/              # Main standalone application
│   ├── App.tsx                  # Main app component
│   ├── index.tsx                # Entry point
│   ├── components/              # App-specific components (AI, AppMainMenu)
│   ├── collab/                  # Collaboration features
│   ├── data/                    # Data handling
│   ├── share/                   # Sharing functionality
│   ├── tests/                   # Application tests
│   └── vite.config.mts         # Vite configuration
│
├── packages/                    # Shared packages
│   ├── excalidraw/             # Core library (@excalidraw/excalidraw)
│   │   ├── components/         # 100+ UI components
│   │   ├── actions/            # User actions
│   │   ├── data/               # Data management
│   │   ├── scene/              # Scene rendering
│   │   ├── renderer/           # Rendering logic
│   │   ├── fonts/              # Font handling
│   │   └── locales/            # Translations
│   │
│   ├── common/                 # Shared utilities (@excalidraw/common)
│   ├── element/                # Element types/utilities (@excalidraw/element)
│   ├── math/                   # Math utilities (@excalidraw/math)
│   └── utils/                  # General utilities (@excalidraw/utils)
│
├── examples/                   # Integration examples
│   ├── with-nextjs/           # Next.js integration
│   └── with-script-in-browser/ # Browser script integration
│
├── scripts/                    # Build and utility scripts
│   ├── buildPackage.js        # Package building
│   ├── release.js             # Release automation
│   └── build-version.js       # Version building
│
├── firebase-project/          # Firebase configuration
│   ├── firestore.rules        # Security rules
│   └── storage.rules          # Storage rules
│
├── docs/                      # Documentation
└── public/                    # Static assets
```

### Key Packages

1. **`@excalidraw/excalidraw`** - Main React component library (published to npm)
2. **`@excalidraw/common`** - Shared utilities across packages
3. **`@excalidraw/element`** - Element manipulation and types
4. **`@excalidraw/math`** - Geometric calculations and operations
5. **`@excalidraw/utils`** - General helper functions

### Architecture Patterns

- **Monorepo Structure** - Yarn workspaces with modular packages
- **Dual Export** - Both standalone app and embeddable library
- **Path Aliases** - TypeScript paths for clean imports
- **Component-Based** - Modular React components with hooks
- **Type Safety** - Comprehensive TypeScript coverage
- **Testing** - Vitest with 60%+ coverage requirements

## Development Workflow

### Common Commands
```bash
yarn start              # Start development server (port 3001)
yarn test:app          # Run tests
yarn build:packages    # Build all packages
yarn build:app         # Build application
yarn fix               # Auto-fix linting/formatting issues
```

### Development Setup
- Uses Husky for git hooks
- Lint-staged for pre-commit checks
- ESLint + Prettier for code quality
- Vitest with JSDOM for testing

### Deployment
- Docker support with nginx for production
- Vercel integration
- PWA capabilities for offline usage
- Firebase hosting for collaboration features

## Project Maturity

This is a mature, well-architected open-source project with:
- Strong focus on performance and user experience
- Extensive collaboration features
- High extensibility as both standalone app and embeddable component
- Active development and maintenance
- Comprehensive testing and quality standards

## Related Documentation

### Memory Bank
- [System Patterns](systemPatterns.md) - Architecture patterns and state management
- [Tech Context](techContext.md) - Technology stack and versions
- [Product Context](productContext.md) - Product vision and user problems
- [Decision Log](decisionLog.md) - Undocumented behaviors discovered

### Technical Documentation
- [Architecture](../technical/architecture.md) - System architecture overview
- [Dev Setup](../technical/dev-setup.md) - Getting started guide

### Product Documentation
- [PRD](../product/PRD.md) - Product requirements
- [Domain Glossary](../product/domain-glossary.md) - Term definitions
