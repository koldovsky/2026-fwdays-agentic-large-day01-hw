# Project Brief — Excalidraw

## What Is This Project

Excalidraw is an **open-source virtual whiteboard** for sketching hand-drawn-like
diagrams. It ships as both:

- A **standalone web app** (excalidraw.com) — PWA with real-time collaboration
- An **embeddable React component** (`@excalidraw/excalidraw` on npm) for
  third-party integrations

Repository name: `excalidraw-monorepo`
License: MIT
Repository: <https://github.com/excalidraw/excalidraw>

## Core Purpose

Provide a simple, intuitive drawing tool where every element looks hand-drawn
(via roughjs), supporting:

- Freehand drawing, shapes, arrows, text, images
- Real-time multi-user collaboration (Socket.IO)
- Import/export (`.excalidraw` JSON, PNG, SVG)
- Embedding as a React component in any app
- Progressive Web App with offline support

## Monorepo Structure

The project is organized as a **Yarn workspaces monorepo** with five workspace
roots:

| Workspace | Path | Role |
|-----------|------|------|
| `excalidraw-app` | `excalidraw-app/` | Vite-based web app (the product) |
| `@excalidraw/excalidraw` | `packages/excalidraw/` | Core React editor component (npm package) |
| `@excalidraw/common` | `packages/common/` | Shared constants, utilities, types |
| `@excalidraw/element` | `packages/element/` | Element model, store, bindings |
| `@excalidraw/math` | `packages/math/` | 2D geometry (vectors, lines, curves) |
| `@excalidraw/utils` | `packages/utils/` | Export and bounding-box helpers |
| Examples | `examples/` | Next.js and browser-script demos |

## Library vs App Separation

- **`packages/excalidraw`** — the reusable library. Peer-depends on React
  17/18/19. Published to npm as `@excalidraw/excalidraw@0.18.0`. Contains the
  full editor UI, rendering, data serialization, i18n, and fonts.
- **`excalidraw-app`** — the product layer. Adds Firebase storage, Sentry error
  tracking, Socket.IO collaboration, PWA registration, and the top-level shell
  UI. Not published; deployed to Vercel and Docker.

## Key Capabilities

### Drawing Engine
- Canvas-based rendering with roughjs for hand-drawn aesthetics
- Element types: rectangles, ellipses, diamonds, lines, arrows, freehand,
  text, images, frames, embeddables
- Undo/redo via a central `Store` with `CaptureUpdateAction`

### Collaboration
- Real-time via WebSocket (Socket.IO client)
- End-to-end encrypted room sharing (encryption key in URL hash)
- Reconciliation algorithm for concurrent edits

### Data & Storage
- JSON-based `.excalidraw` file format
- Firebase for cloud persistence (optional)
- IndexedDB + localStorage for local state
- PNG/SVG export with embedded scene data in PNG metadata

### Internationalization
- i18next-based with 30+ locale files
- Language detection via `i18next-browser-languagedetector`

### Progressive Web App
- Service worker via `vite-plugin-pwa`
- Offline support with runtime caching (fonts, locales, chunks)
- File handler registration for `.excalidraw` files

## Deployment Targets

| Target | Config | Output |
|--------|--------|--------|
| **Vercel** | `vercel.json` | `excalidraw-app/build` |
| **Docker** | `Dockerfile` | Node 18 build → nginx:1.27-alpine |
| **npm** | `packages/excalidraw/package.json` | `dist/prod/`, `dist/dev/` |

## Package Versions (Current)

| Package | Version |
|---------|---------|
| `@excalidraw/excalidraw` | 0.18.0 |
| `@excalidraw/common` | 0.18.0 |
| `@excalidraw/element` | 0.18.0 |
| `@excalidraw/math` | 0.18.0 |
| `@excalidraw/utils` | 0.1.2 |
| `excalidraw-app` | 1.0.0 |

## Source of Truth

- Root config: `package.json`, `tsconfig.json`, `vitest.config.mts`
- App config: `excalidraw-app/vite.config.mts`
- Library entry: `packages/excalidraw/index.tsx`
- App entry: `excalidraw-app/index.tsx` → `excalidraw-app/App.tsx`
