# Project Brief

## What this project is

- This is the `excalidraw-monorepo` monorepo with workspaces for:
  - the `excalidraw-app` web application;
  - the `@excalidraw/excalidraw` library;
  - internal packages `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`;
  - integration examples (`examples/*`).
- The main product: the browser-based Excalidraw whiteboard plus a separate embeddable React component for integration into other applications.

## Main goal

- Provide a full-featured online diagram/sketch editor with:
  - local scene persistence;
  - sharing via link;
  - live collaboration;
  - export and integration APIs.
- Support two usage models:
  - as a standalone app (`excalidraw-app`);
  - as an npm library of a React component (`@excalidraw/excalidraw`).

## Key user scenarios

- Drawing and editing a scene in the browser.
- Opening/importing a scene from URL (`#json=...`, `#url=...`, `#room=...`).
- Collaborative editing in realtime rooms with payload encryption.
- Scene export (to backend/share-link and to Excalidraw+).

## What is important for the team

- The monorepo centralizes development of the app + reusable packages.
- There are clear npm scripts for build/test/lint/typecheck.
- CI validates tests and code quality on Node 20.x.
- Production delivery can be done as a static build (via Docker + nginx).

## Boundaries and non-goals (at this repository level)

- The WebSocket collaboration server is not implemented in this repo (only client integration via `VITE_APP_WS_SERVER_URL`).
- External backend services (json API, Firebase storage, AI backend) are connected via env configuration.

## Verified against source code

- Monorepo, workspaces, scripts, Node/Yarn: `package.json`.
- Package role as a React component: `packages/excalidraw/README.md`, `packages/excalidraw/package.json`.
- App entry point: `excalidraw-app/index.tsx`.
- Main orchestration UI/app-flow: `excalidraw-app/App.tsx`.
- CI Node 20.x and test pipeline: `.github/workflows/test.yml`, `.github/workflows/lint.yml`.
- Docker build + nginx runtime: `Dockerfile`, `docker-compose.yml`.
