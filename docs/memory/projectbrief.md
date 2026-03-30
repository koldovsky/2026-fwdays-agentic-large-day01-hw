## Project overview
- **What it is**: Excalidraw monorepo containing:
  - A **web app** (“Excalidraw Whiteboard”) (excalidraw-app/index.html)
  - A **React component package** `@excalidraw/excalidraw` for embedding (packages/excalidraw/README.md, packages/excalidraw/package.json)
  - Supporting packages: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils` (packages/*/package.json)

## Target users
- **End users**: People using a “virtual collaborative whiteboard tool” (excalidraw-app/index.html)
- **Developers**: Apps embedding Excalidraw as a React component (packages/excalidraw/README.md)

## Key features (high-level)
- **Whiteboard UI**: “virtual collaborative whiteboard… hand-drawn feel” (excalidraw-app/index.html, excalidraw-app/vite.config.mts)
- **Real-time collaboration**: room links encoded in URL hash (excalidraw-app/data/index.ts)
- **Shareable links**: export/import via backend endpoints + encryption key in URL hash (excalidraw-app/data/index.ts)
- **Persistence**:
  - Local storage keys for elements/app state/theme (excalidraw-app/app_constants.ts)
  - Firebase-backed storage for collaboration rooms and share links (excalidraw-app/data/firebase.ts, firebase-project/*)
- **PWA**: service worker registration + Vite PWA config (excalidraw-app/index.tsx, excalidraw-app/vite.config.mts)
- **Tests**: Vitest + jsdom setup (package.json, vitest.config.mts, setupTests.ts)

## Main use cases (2–5)
- **Draw and edit** a scene in the web app (excalidraw-app/App.tsx)
- **Collaborate** by sharing a `#room=...,...` link (excalidraw-app/data/index.ts)
- **Create a shareable link** for a scene (`exportToBackend`) and open it later (`importFromBackend`) (excalidraw-app/data/index.ts)
- **Embed** Excalidraw in another React app via `<Excalidraw />` (packages/excalidraw/README.md)

## Tech stack (short summary)
- **Language**: TypeScript (tsconfig.json)
- **Frontend**: React 19 + Vite 5 (excalidraw-app/package.json, package.json)
- **State**: Jotai (excalidraw-app/package.json, excalidraw-app/app-jotai.ts, packages/excalidraw/editor-jotai.ts)
- **Testing**: Vitest + Testing Library + jsdom (package.json, vitest.config.mts, setupTests.ts)
- **Deploy/runtime packaging**: Docker build to nginx static serving (Dockerfile, docker-compose.yml), Vercel output dir config (vercel.json)

## Repository structure (main folders + purpose)
- **excalidraw-app/**: Web application entry + app-specific modules (excalidraw-app/index.html, excalidraw-app/index.tsx, excalidraw-app/App.tsx)
- **packages/**: Published and internal packages (packages/*/package.json)
  - **packages/excalidraw/**: React component package + core editor UI/logic (packages/excalidraw/index.tsx)
  - **packages/element/**: elements/store/delta/rendering utilities (packages/element/src/store.ts)
  - **packages/common/**: shared constants/utils (packages/common/src/index.ts via tsconfig paths)
  - **packages/math/**: geometry/math helpers (packages/math/src/index.ts via tsconfig paths)
  - **packages/utils/**: export/utility helpers (packages/utils/src/index.ts via tsconfig paths)
- **examples/**: Integration examples (examples/with-nextjs/package.json, examples/with-script-in-browser/package.json)
- **public/**: Static public assets used by the app (excalidraw-app/vite.config.mts sets `publicDir: "../public"`)
- **scripts/**: build and tooling scripts referenced by root/app scripts (package.json, excalidraw-app/vite.config.mts)
- **firebase-project/**: Firebase rules/config for Firestore/Storage (firebase-project/firebase.json, firebase-project/*.rules)
- **docs/memory/**: Memory Bank output location (docs/memory/)

## Entry points (with file paths)
- **Web app HTML**: `excalidraw-app/index.html` (loads `index.tsx`)
- **Web app JS entry**: `excalidraw-app/index.tsx` (renders `<ExcalidrawApp />`, registers SW)
- **Web app root component**: `excalidraw-app/App.tsx`
- **Vite config**: `excalidraw-app/vite.config.mts`
- **Package export entry**: `packages/excalidraw/index.tsx`

## Documentation references

**Product**

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)

**Technical**

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)
- [Technical decision log](../technical/decisionlog.md)
