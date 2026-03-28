# Product context

This repository is the **Excalidraw monorepo**: an open-source, hand-drawn virtual whiteboard. The **product surface** splits into an embeddable library and a full web app.

**Verified in:** root `package.json` (workspaces), `excalidraw-app/package.json`, `packages/excalidraw/index.tsx`.

---

## Primary users

- **End users (excalidraw-app)** — sketch diagrams, share read-only links, collaborate in rooms, persist work locally and in cloud backends.
- **Integrators** — embed `<Excalidraw />` via `@excalidraw/excalidraw` (see `examples/with-nextjs`, `examples/with-script-in-browser`).

---

## UX goals

### Fast, low-friction drawing

- Canvas-first editor with tools, undo/redo, and hand-drawn rendering (RoughJS / related stack in packages).
- **Global keyboard handling** in the hosted app: `handleKeyboardGlobally={true}` and `autoFocus={true}` on `<Excalidraw />` in `excalidraw-app/App.tsx` so shortcuts work without extra focus management.

### Clear onboarding on empty canvas

- **Welcome screen** explains menu, toolbar, and help; offers load scene, help, live collaboration (when enabled), and Excalidraw+ sign-up for guests — `excalidraw-app/components/AppWelcomeScreen.tsx` composing `WelcomeScreen` from the package.

### Sharing and collaboration

- **Read-only / snapshot sharing** via backend export and shareable link dialog (`onExportToBackend`, `ShareableLinkDialog` in `App.tsx`).
- **Live collaboration** — `LiveCollaborationTrigger` in top-right (desktop), `Collab` child component, `ShareDialog`; **disabled in iframes** (`isCollabDisabled = isRunningInIframe()`).
- **Excalidraw+** — optional export UI (`ExportToExcalidrawPlus`), promo banner, command-palette entries using `VITE_APP_PLUS_*` env URLs.

### Resilience and honesty about limits

- **Collab offline** warning when collaborating and offline (`isOffline` + `alerts.collabOfflineWarning`).
- **Local storage quota** exceeded banner (`localStorageQuotaExceededAtom`).
- **Self-embedding guard** — same-origin iframe shows a minimal “I'm not a pretzel!” message instead of nested app (`isSelfEmbedding` in `App.tsx`).

### Discoverability

- **Command palette** with app-specific items: live collaboration, stop session, share, social links — `App.tsx` `customCommandPaletteItems`.
- **AI / TTD** — `AIComponents` and `TTDDialogTrigger` included as children of `<Excalidraw />` in `App.tsx`.

### Progressive web app

- Service worker registration in `excalidraw-app/index.tsx` via `virtual:pwa-register`; `beforeinstallprompt` cached in `App.tsx` for install UX.

---

## Representative scenarios (from code paths)

1. **Open app, draw, auto-save locally** — `importFromLocalStorage` / save paths in `initializeScene` and data layer; keys in `excalidraw-app/app_constants.ts` (`STORAGE_KEYS`).
2. **Open `#json=id,key` link** — `initializeScene` parses hash, `importFromBackend`, optional overwrite confirm if local scene non-empty.
3. **Open collaboration URL** — `getCollaborationLinkData`, `collabAPI.startCollaboration`, `reconcileElements` merge with live state.
4. **Open `#url=...` scene URL** — fetch + `loadFromBlob`; invalid URL surfaces `appState.errorMessage` (`alerts.invalidSceneUrl`).
5. **Export while images loading** — `onExport` generator waits on `FileStatusStore` and yields progress (`App.tsx`).
6. **Library from URL** — `parseLibraryTokensFromUrl` / `useHandleLibrary` with IndexedDB adapter and localStorage migration adapter (`App.tsx`).

---

## Non-goals / constraints visible in code

- Collaboration **not offered** when running in an iframe (`isRunningInIframe()`).
- **File size cap** for uploads: `FILE_UPLOAD_MAX_BYTES` (4 MiB) in `app_constants.ts`.
- **Node** >= 18 (`package.json` `engines`).

---

## Related memory files

- **Architecture detail:** `systemPatterns.md`, `projectbrief.md`
- **Current sprint focus:** `activeContext.md`
- **Decisions:** `decisionLog.md`

---

## Details

For detailed architecture → see `docs/technical/architecture.md`.

For domain glossary → see `docs/product/domain-glossary.md`.
