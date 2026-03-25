# Product context

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)  
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)

## Product in one sentence

- **Excalidraw** is a **collaborative whiteboard** for sketching hand-drawn-style diagrams in the browser (see `excalidraw-app/index.html` meta description/title).

## Primary user value

- **Fast idea-to-diagram sketching** with minimal setup (app is a static web app; library can be embedded as `<Excalidraw />`).
- **Collaboration + sharing** flows exist in the app codebase (e.g. `excalidraw-app/App.tsx` references `Collab` and share dialogs).

## User types

- **End users (browser app)**:
  - Individuals sketching notes/diagrams.
  - Teams co-editing a scene (collaboration modules exist in `excalidraw-app/App.tsx`).
- **Developers/integrators (library)**:
  - Embed Excalidraw inside a React app via `@excalidraw/excalidraw` (explicitly documented in `packages/excalidraw/README.md`).

## Core surfaces shipped from this repo

- **Web app**: `excalidraw-app/`
  - Runs as a Vite SPA; build output is served as static assets (see `excalidraw-app/vite.config.mts` and root `Dockerfile` nginx stage).
- **Embeddable component**: `packages/excalidraw/` → `@excalidraw/excalidraw`
  - Distributed as ESM with an `exports` map + `index.css` entry (see `packages/excalidraw/package.json`).
- **Examples**: `examples/`\*
  - Next.js and “script in browser” examples are referenced in `packages/excalidraw/README.md`.

## Key product capabilities (verified by code/config)

- **Embedding as React component**
  - `<Excalidraw />` usage + required CSS import are documented (see `packages/excalidraw/README.md`).
- **Client-only rendering guidance for SSR frameworks**
  - Next.js dynamic import with `ssr: false` is shown (see `packages/excalidraw/README.md`).
- **Offline-ish / installable app behavior (PWA)**
  - PWA is configured via `VitePWA` with runtime caching for fonts/locales/chunks (see `excalidraw-app/vite.config.mts`).
- **Performance-aware delivery**
  - Manual chunking for locales and heavy deps is configured (see `excalidraw-app/vite.config.mts` `manualChunks`).
- **Theme initialization**
  - Early theme selection is applied before app init to reduce flash (see `excalidraw-app/index.html` script toggling `html.dark`).
- **Sharing & collaboration entrypoints**
  - App references share dialogs and collab API (see `excalidraw-app/App.tsx` imports and usage of `collabAPIAtom`, `ShareDialog`).

## Non-goals / boundaries (as implied by repo)

- **Not backend-centric**: deliverables are frontend packages + static app; runtime deployment is nginx serving a build.
- **Library vs product split**:
  - `@excalidraw/excalidraw` focuses on the reusable editor component.
  - `excalidraw-app` focuses on “product shell” concerns (collaboration/sharing/integrations).

## Success criteria (practical, repo-aligned)

- **For app contributors**: `yarn start` runs the app locally; `yarn build` produces a deployable static build.
- **For library users**: following `packages/excalidraw/README.md` yields a visible editor (CSS import + non-zero-height container).
- **For distribution**: Docker build serves the app via nginx (`Dockerfile`, `docker-compose.yml`).
