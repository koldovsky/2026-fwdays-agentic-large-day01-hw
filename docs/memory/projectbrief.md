# Project Brief

## What this project is

- A Yarn workspace monorepo named `excalidraw-monorepo` that contains the Excalidraw web app, reusable packages, and integration examples.
- Core product domain: a browser-based whiteboard/diagramming tool with a hand-drawn sketch style. The hosted web app supports collaborative drawing (shared sessions and synced edits); the same editor ships as an embeddable React package for third-party apps.
- Delivery shapes:
  - hosted app (`excalidraw-app`)
  - embeddable library (`@excalidraw/excalidraw`)

## Primary purpose

- Offer end users the full editor experience in the main app, including collaboration features implemented in app-level code.
- Provide a reusable React component and supporting packages so other apps can embed Excalidraw.
- Keep product app and reusable library in one repo so features, fixes, and shared logic evolve together.

## Repo scope at a glance

- `excalidraw-app/`: main web application entrypoint and app-specific UX/features.
- `packages/excalidraw/`: exported React component package and public API surface.
- `packages/common/`, `packages/element/`, `packages/math/`, `packages/utils/`: shared internal building blocks.
- `examples/`: integration demos (`with-nextjs`, `with-script-in-browser`).
- `firebase-project/`: Firebase rules/config for collaboration storage infrastructure.
- `public/`: static assets and service-worker related resources.

## Functional capabilities visible in source

- Interactive drawing canvas and editor UI via `Excalidraw` component.
- Collaboration-related paths in app code (`excalidraw-app/collab`, share dialog, backend import/export).
- PWA behavior (service worker registration and Vite PWA plugin usage).
- Localization support via extensive locale files under `packages/excalidraw/locales`.
- Embedding/SSR guidance and examples for host apps (especially Next.js).

## Details

- For detailed architecture → see `docs/technical/architecture.md`.
- For domain glossary → see `docs/product/domain-glossary.md`.

## Source-verified references

- Monorepo/workspaces and scripts: `package.json`.
- App runtime entrypoint: `excalidraw-app/index.tsx`.
- Embeddable package purpose and install/usage: `packages/excalidraw/README.md`.
- Package metadata and exports: `packages/excalidraw/package.json`.
