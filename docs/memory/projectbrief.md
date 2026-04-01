# Project Brief

## What This Project Is
- A Yarn workspaces monorepo for Excalidraw.
- It contains:
- The main web application in `excalidraw-app/`
- The reusable React library in `packages/excalidraw/`
- Supporting internal packages in `packages/common/`, `packages/element/`, `packages/math/`, and `packages/utils/`
- Example integrations in `examples/`

## Primary Goal
- Deliver Excalidraw in two forms:
- A production web app for sketching, diagramming, exporting, and collaborating
- An embeddable React component published as `@excalidraw/excalidraw`

## Core User Value
- Hand-drawn-style diagramming and whiteboarding
- Local-first editing with browser persistence
- Shareable links for read-only scene sharing
- Live collaboration sessions
- Image/file handling and export flows
- Progressive web app behavior for installability and caching

## Evidence From Source
- Root workspace definition and scripts are in `package.json`
- The reusable package is described as "Excalidraw as a React component" in `packages/excalidraw/package.json`
- The web app mounts `ExcalidrawApp` and registers a PWA service worker in `excalidraw-app/index.tsx`
- The app shell wires collaboration, local data, backend export, dialogs, and theming in `excalidraw-app/App.tsx`

## Scope Boundaries
- `excalidraw-app/` is the product application layer
- `packages/excalidraw/` is the public integration surface for host apps
- Lower-level packages isolate shared logic:
- `common`: constants, shared utils, app events
- `element`: scene element and geometry behavior
- `math`: 2D math primitives
- `utils`: export and helper utilities

## Non-Goals Of This Repo
- It is not only a single website repo
- It is not only a library repo
- It is not a backend-heavy system; backend integration is used mainly for collaboration and shared scene/file storage

## Delivery Model
- Local development primarily runs the Vite app in `excalidraw-app/`
- Package builds produce distributable artifacts for the internal packages
- Examples demonstrate consumer integration patterns, including Next.js and a browser-script/Vite setup
