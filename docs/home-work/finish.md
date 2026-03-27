# Project Overview

Date: 2026-03-27

## Notes

- Reviewed all Memory Bank files in `docs/memory-bank/` as required by repo instructions.
- Used the repo manifests and technical/product docs to ground the summary:
  - root `package.json`
  - `excalidraw-app/package.json`
  - `packages/*/package.json`
  - `docs/technical/architecture.md`
  - `docs/technical/packages-architecture.md`
  - `docs/product/PRD.md`
- Verified the workspace layout from the repository tree instead of assuming an upstream-default structure.
- Kept the reasoning summary concise and source-based instead of storing internal hidden deliberation.

## Result

This repository is an Excalidraw monorepo. Its purpose is to provide:

- a publishable React editor package, `@excalidraw/excalidraw`
- a standalone/reference web app in `excalidraw-app`
- integration examples in `examples/*`
- supporting internal packages for shared logic, geometry, scene modeling, and export utilities

The product goal is a browser-first whiteboard/diagramming experience for both direct end users and developers embedding Excalidraw into their own React applications. The documented feature scope includes local-first editing, scene import/export, library workflows, live collaboration, Mermaid-based flows, and optional AI-assisted capabilities. Backend implementations for sharing, websockets, Firebase services, and AI services are not part of this repository.

## Main Technology Stack

- TypeScript with `strict: true`
- React 19 in the standalone app
- React 17/18/19 compatibility for `@excalidraw/excalidraw`
- Yarn 1 workspaces
- Node.js `>=18`
- Vite for development/build
- Vitest with `jsdom` for tests
- ESLint and Prettier
- Docker and Nginx for containerized app build/serve

Notable runtime dependencies include Jotai, Firebase, `socket.io-client`, RoughJS, CodeMirror, `browser-fs-access`, `pako`, and `@excalidraw/mermaid-to-excalidraw`.

## Repository Structure

- `packages/common`: shared utilities, constants, event primitives
- `packages/math`: geometry primitives and math helpers
- `packages/element`: canonical element model, scene state, store, delta logic
- `packages/excalidraw`: main editor runtime, React UI, public API
- `packages/utils`: export and bounds-related utilities
- `excalidraw-app`: standalone/reference web application
- `examples/with-nextjs`: Next.js integration example
- `examples/with-script-in-browser`: browser/Vite integration example
- `docs/memory-bank`: durable compact project context
- `docs/technical`: architecture and setup documentation
- `docs/product`: product intent, feature catalog, glossary, UX notes
- `scripts`: build/release/tooling scripts
- `public`: static assets
- `firebase-project`: Firebase config and rules

## Architectural Summary

The repo is organized as a layered monorepo. `@excalidraw/excalidraw` is the main public editor package and depends on lower-level workspace packages for shared utilities, math, and scene/element mechanics. `excalidraw-app` sits on top as a richer host application with app-specific integrations such as persistence, collaboration wiring, sharing, and language/application behavior.

Important architectural behavior called out by the docs:

- external scene data is restored and migrated before reconciliation
- store capture modes control history semantics and undo/redo correctness
- local-first persistence yields to collaboration state
- advanced integrations are intentionally kept app-specific rather than pushed into the base package

## Caveat

The repo documentation explicitly notes an open question: it is not fully clear whether this checkout is intended to track upstream Excalidraw closely or operate as a long-lived customized fork. Structurally and functionally, it is clearly an Excalidraw monorepo.
