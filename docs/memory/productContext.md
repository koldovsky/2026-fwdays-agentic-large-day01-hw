## Product goal
- **Goal**: “virtual collaborative whiteboard tool” that lets users “sketch diagrams that have a hand-drawn feel” (excalidraw-app/index.html, excalidraw-app/vite.config.mts manifest description)

## User types (if inferable)
- **Anonymous/regular users**: create/edit diagrams locally (excalidraw-app/app_constants.ts `STORAGE_KEYS`)
- **Collaborators**: join a shared room link and sync scene updates (excalidraw-app/data/index.ts, excalidraw-app/collab/Collab.tsx)
- **Developers**: embed Excalidraw as a component (packages/excalidraw/README.md)
- **Excalidraw+ users**: cookie-gated behaviors exist (excalidraw-app/app_constants.ts `COOKIES`, excalidraw-app/index.html redirect)

## Main user flows
- **Open app and draw**:
  - App served as SPA with `#root` mount (excalidraw-app/index.html, excalidraw-app/index.tsx)
- **Start/Join collaboration**:
  - Generate/join room via `#room=<roomId>,<roomKey>` (excalidraw-app/data/index.ts)
  - Sync elements/files via socket + Firebase (excalidraw-app/collab/Collab.tsx, excalidraw-app/data/firebase.ts)
- **Create a shareable link**:
  - Export compresses/encrypts scene, POSTs to backend, stores key in hash (excalidraw-app/data/index.ts)
- **Open an imported scene**:
  - Import reads id/key, fetches data, decompresses/decrypts (excalidraw-app/data/index.ts)
- **Embed in another app**:
  - Import CSS + render `<Excalidraw />` in non-zero-height container (packages/excalidraw/README.md)

## UX patterns
- **Dialogs/modals**:
  - Error dialog (excalidraw-app/App.tsx imports `ErrorDialog`)
  - Overwrite confirm modal (excalidraw-app/App.tsx imports `OverwriteConfirmDialog`, `openConfirmModal`)
  - Share dialog / shareable link dialog (excalidraw-app/App.tsx imports `ShareDialog`, `ShareableLinkDialog`)
- **Command palette**: present via `CommandPalette` imports (excalidraw-app/App.tsx)
- **Theme**:
  - Early dark-mode class toggle to avoid “white flash” on load (excalidraw-app/index.html)
  - Theme stored under `excalidraw-theme` local storage key (excalidraw-app/app_constants.ts)
- **PWA install**:
  - `beforeinstallprompt` handling and SW registration (excalidraw-app/App.tsx, excalidraw-app/index.tsx)

## Critical flows
- **Link security**:
  - Encryption keys are placed in URL hash (not query) “to never send it to the server” (excalidraw-app/data/index.ts)
- **Collaboration durability**:
  - Uses periodic syncing and offline detection (constants + listeners) (excalidraw-app/app_constants.ts, excalidraw-app/collab/Collab.tsx)
- **File uploads**:
  - Enforced max upload bytes constant `FILE_UPLOAD_MAX_BYTES` (excalidraw-app/app_constants.ts)

## Platform-specific considerations
- **Mobile**:
  - Viewport disables user scaling and sets `viewport-fit=cover` (excalidraw-app/index.html)
  - Touch/pinch zoom prevention patterns exist in component package (packages/excalidraw/index.tsx adds `touchmove` handler)
- **iOS/Safari**:
  - Explicit pinch-zoom blocking mentioned for iOS (packages/excalidraw/index.tsx)
- **SSR frameworks**:
  - Docs recommend client-only rendering with dynamic import in Next.js (packages/excalidraw/README.md)

## Documentation references

**Product**

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)

**Technical**

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)
- [Technical decision log](../technical/decisionlog.md)
