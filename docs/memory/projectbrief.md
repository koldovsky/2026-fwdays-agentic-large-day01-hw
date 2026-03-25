# Project Brief

## What Is This Project

**Excalidraw** is an open-source, browser-based virtual whiteboard for creating diagrams and
sketches with a hand-drawn aesthetic. This repository is the official monorepo, cloned as a
course homework workspace for a 2026 fwdays agentic workshop.

## Dual-Product Structure

The monorepo ships two distinct products from one codebase:

### 1. `@excalidraw/excalidraw` (npm library)
- An embeddable **React component** that any application can install and render
- Exposes a clean public API: `<Excalidraw />` component + imperative API (`ExcalidrawImperativeAPI`)
- Client-side only — requires a non-zero height container; must be loaded without SSR
- Current published version: **0.18.0**

### 2. `excalidraw-app` (full web application)
- The hosted product at **excalidraw.com**
- Adds collaboration (Socket.io), Firebase persistence, Sentry observability, PWA support
- Thin shell on top of the library package — does not re-implement drawing logic

## Core Capabilities

- **Drawing tools**: rectangle, ellipse, diamond, arrow, line, freehand, text, image, frame, embeds
- **Hand-drawn style**: powered by roughjs for sketch-like rendering
- **Real-time collaboration**: multi-user cursors, follow mode, live element sync
- **Persistence**: local IndexedDB, cloud via Firebase, file export (PNG, SVG, JSON, clipboard)
- **Library**: reusable element library shared across sessions
- **i18n**: multi-language support via locale JSON files
- **Accessibility**: keyboard shortcuts for all major operations

## Monorepo Packages

| Package | npm name | Purpose |
|---|---|---|
| `excalidraw-app` | (private) | Full hosted web app |
| `packages/excalidraw` | `@excalidraw/excalidraw` | Main library / React component |
| `packages/element` | `@excalidraw/element` | Element model, Scene, Store, rendering primitives |
| `packages/math` | `@excalidraw/math` | Geometry: points, lines, curves, angles |
| `packages/common` | `@excalidraw/common` | Shared constants, utilities, color palette |
| `packages/utils` | `@excalidraw/utils` | Export helpers, bbox utilities |

## Intended Users

- **End users**: whiteboarding at excalidraw.com
- **Developers**: embedding `@excalidraw/excalidraw` in their own React apps
- **Contributors**: extending the open-source editor

## Repository

- GitHub: https://github.com/excalidraw/excalidraw
- License: MIT
- Package manager: Yarn 1 workspaces

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
