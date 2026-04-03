# Project Brief

## What This Project Is

This is the `excalidraw-monorepo`, built with Yarn workspaces. The main web app lives in `excalidraw-app`, while the reusable editor library and domain modules are split across `packages/*`.

The product identity is confirmed in the PWA manifest: the app is named `Excalidraw` and described as a whiteboard tool for sketching diagrams with a hand-drawn feel.

## Primary Goal

The project serves two core goals:

- Provide a complete web application for drawing and collaborating on diagrams.
- Maintain the editor as a reusable React library, `@excalidraw/excalidraw`, for embedding into other applications.

This is verified by:

- `excalidraw-app/index.tsx`, which renders the full `ExcalidrawApp`.
- `packages/excalidraw/index.tsx`, which exports the `Excalidraw` component, API, hooks, UI components, import/export functions, and host-facing utilities.

## Product Capabilities

The codebase clearly supports:

- Drawing and editing graphical elements on a canvas.
- Importing and exporting scenes and libraries.
- Live collaboration through the dedicated `excalidraw-app/collab` layer.
- Local persistence of scenes and files in the browser.
- PWA behavior through a service worker.
- Internationalization with lazy-loaded locales.
- Integrations with Mermaid, CodeMirror, and Firebase.

## Repository Scope

The repository is organized into several responsibility areas:

- `excalidraw-app/` - product shell, collaboration, sharing flows, local persistence, Firebase integration.
- `packages/excalidraw/` - core editor package and public React API.
- `packages/common/` - shared constants, helpers, event bus, editor interface.
- `packages/element/` - element model, geometry, mutations, versioning.
- `packages/math/`, `packages/utils/` - supporting math and utility modules.
- `examples/*` - integration examples for the library.

## Main Runtime Flow

- Root script `yarn start` delegates startup to `excalidraw-app`.
- `excalidraw-app/index.tsx` registers the service worker and mounts `ExcalidrawApp`.
- `excalidraw-app/App.tsx` composes the editor, collaboration, local data, share/dialog flows, and app-specific UI.

## Summary

This repository is not only a drawing app. It is a combined platform with two deliverables:

- the end-user Excalidraw web application;
- an embeddable React editor package for integration into other systems.

## Related Docs

- Technical architecture details: `docs/technical/architecture.md`
- Product requirements context: `docs/product/PRD.md`
- Domain terminology: `docs/product/domain-glossary.md`

## Verified From Source

- `package.json`
- `excalidraw-app/index.tsx`
- `excalidraw-app/App.tsx`
- `excalidraw-app/vite.config.mts`
- `packages/excalidraw/package.json`
- `packages/excalidraw/index.tsx`
