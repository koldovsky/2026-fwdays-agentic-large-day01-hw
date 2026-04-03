# Active Context

## Scope Of This Document

This file captures the current application focus as it can be observed from the codebase. It is not a roadmap. No explicit planning document or issue tracker is present in the repository snapshot.

## Current Product Focus

The current app shell is centered on four active concerns:

- editing and rendering diagrams through the reusable editor package;
- live collaboration and sharing;
- local/browser persistence for reliability;
- product-shell UX around onboarding, menu flows, language, theme, and Excalidraw+ entry points.

## Areas With The Most App-Level Attention

### Collaboration And Sharing

This is the strongest visible focus in `excalidraw-app`:

- dedicated `collab/` module;
- room link generation and parsing;
- QR-based sharing;
- session start/stop flows;
- collaborator presence and idle-state handling;
- Firebase scene/file persistence for shared sessions.

### Product-Specific Shell Around The Editor

The hosted app adds substantial logic on top of the reusable editor:

- welcome screen;
- app main menu;
- app footer/sidebar;
- share dialogs;
- top-level error handling;
- app language and theme handling.

### Persistence And Recovery

The code gives clear weight to keeping user work recoverable:

- local scene persistence;
- IndexedDB file storage;
- browser-tab sync versioning;
- import/export helpers;
- backend share import/export flows.

### Integration Readiness

The package side remains active enough to matter as a first-class output:

- public package exports are broad and curated;
- examples exist for Next.js and browser-script usage;
- package README is maintained and migration-aware for `0.18.x`.

## Indicators Of What Is Not The Immediate Focus

Based on the current repository shape, these areas do not appear to be the primary active center of the app shell:

- server-side application code inside this repo;
- native/mobile clients;
- a dedicated backend implementation for collaboration services;
- large amounts of marketing-site content.

This does not mean those areas do not exist elsewhere, only that they are not central in this repository.

## Operational Focus Signals

- `App.tsx` in both app shell and editor package are large orchestration points.
- Vite config has explicit chunking and PWA setup, indicating performance and delivery remain active concerns.
- Test infrastructure is extensive, which suggests ongoing effort to stabilize editor behavior.
- Git history in this snapshot is shallow and does not expose a detailed feature narrative, so active focus is inferred mainly from code organization.

## Current Working Assumption

If new work is added to this repository, the safest assumption is that it will land in one of these areas:

- editor behavior and UI;
- collaboration/share flows;
- persistence/recovery;
- library integration surface.

## Related Docs

- Architecture details for current runtime focus: `docs/technical/architecture.md`
- Setup and local workflow context: `docs/technical/dev-setup.md`
- Product-level focus and goals: `docs/product/PRD.md`

## Verified From Source

- `excalidraw-app/App.tsx`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/collab/Portal.tsx`
- `excalidraw-app/share/ShareDialog.tsx`
- `excalidraw-app/data/LocalData.ts`
- `excalidraw-app/data/index.ts`
- `excalidraw-app/components/AppWelcomeScreen.tsx`
- `excalidraw-app/components/AppMainMenu.tsx`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/README.md`
- `excalidraw-app/vite.config.mts`
- `git log -5 --oneline`
