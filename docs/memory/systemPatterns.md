# System Patterns

## High-Level Architecture
- Layered monorepo with a clear split between product app and reusable library
- Main layers:
- `excalidraw-app/`: application shell and product-specific behavior
- `packages/excalidraw/`: public React component and host-facing API
- `packages/common/`: shared constants, utilities, app/event helpers
- `packages/element/`: scene element logic, transforms, selection, rendering helpers
- `packages/math/`: geometry primitives and math helpers
- `packages/utils/`: export and supporting utilities

## Main Architectural Pattern
- The app consumes the library package the same way external consumers do
- In development, path aliases point `@excalidraw/*` imports to source instead of built artifacts
- This keeps package boundaries visible while preserving fast local iteration

## Composition Pattern
- `excalidraw-app/index.tsx` boots the app, registers the service worker, and mounts `ExcalidrawApp`
- `excalidraw-app/App.tsx` composes the full product experience around the core `<Excalidraw />` component
- `packages/excalidraw/index.tsx` exposes the reusable editor component, hooks, UI building blocks, restore/export helpers, and public utility exports

## State Management Pattern
- Jotai is used for both app-level and editor-level state
- App state is provided through `Provider store={appJotaiStore}` in `excalidraw-app/App.tsx`
- Editor state is provided through `EditorJotaiProvider` in `packages/excalidraw/index.tsx`
- The public `ExcalidrawAPIProvider` pattern exposes imperative editor access outside the component tree

## Persistence Pattern
- Local-first persistence:
- Scene elements and app state are saved to `localStorage`
- Binary files and library data are saved to IndexedDB
- `excalidraw-app/data/LocalData.ts` centralizes debounced local saves, file persistence, and save-pausing rules
- Browser-tab synchronization is handled by version tracking in the data layer and re-hydration logic in `excalidraw-app/App.tsx`

## Collaboration Pattern
- Live collaboration is an app concern implemented in `excalidraw-app/collab/`
- Real-time signaling uses `socket.io-client`
- Shared scene state and files are backed by Firebase
- Collaboration links embed `roomId` and encryption key in the URL hash so the key is not sent to the server
- `excalidraw-app/data/index.ts` generates and parses collaboration/share links and filters syncable elements

## Data Security Pattern
- Shared scenes and collaboration payloads are encrypted client-side
- `excalidraw-app/data/index.ts` generates encryption keys for share links
- `excalidraw-app/data/firebase.ts` encrypts scene payloads before writing to Firebase
- URL hashes are used for decryption material in share flows

## Export And Share Pattern
- Export is split between local export utilities and backend-backed share/export flows
- The library exposes export helpers from `@excalidraw/utils/export`
- The app adds product-specific export behaviors such as shareable-link creation and Excalidraw+ export UI
- Share-link creation uploads encrypted scene payloads plus referenced files

## PWA And Asset Delivery Pattern
- The app is configured as a progressive web app via `vite-plugin-pwa`
- `excalidraw-app/vite.config.mts` defines runtime caching for fonts, locale chunks, and lazy-loaded JS chunks
- The service worker is registered from `excalidraw-app/index.tsx`

## Feature Organization Pattern
- The app code is grouped mostly by feature/domain:
- `collab/`
- `data/`
- `components/`
- `share/`
- `app-language/`
- The core library is grouped around reusable editor capabilities and public APIs

## Testing Pattern
- Tests run against source aliases rather than package build output
- Vitest uses jsdom and shared setup from `setupTests.ts`
- Coverage thresholds are defined centrally in `vitest.config.mts`

## Source Verification
- This summary was verified against:
- `package.json`
- `tsconfig.json`
- `vitest.config.mts`
- `excalidraw-app/index.tsx`
- `excalidraw-app/App.tsx`
- `excalidraw-app/vite.config.mts`
- `excalidraw-app/data/index.ts`
- `excalidraw-app/data/firebase.ts`
- `excalidraw-app/data/LocalData.ts`
- `excalidraw-app/collab/Collab.tsx`
- `packages/excalidraw/index.tsx`
