# Product / UX context

Audiences and flows inferred from **`excalidraw-app`** (hosted product) and **`packages/excalidraw`** (embeddable editor). Repo identity and goals: `docs/memory/projectbrief.md`. Stack/commands: `docs/memory/techContext.md`.

## Audiences

| Audience | Evidence |
|----------|----------|
| **Canvas users** | Full editor via `Excalidraw` wrapped in `excalidraw-app/App.tsx`; core logic in `packages/excalidraw/components/App.tsx`. |
| **Collaborators** | `LiveCollaborationTrigger`, `Collab` (`excalidraw-app/collab/Collab.tsx`), share/import helpers from `excalidraw-app/data` (see `App.tsx` imports). |
| **Embedders** | `packages/excalidraw/README.md`; examples `examples/with-script-in-browser`, `examples/with-nextjs`. |

## Jobs-to-be-done (supported in code)

- **Draw and edit** diagrams on a canvas (tools, scene, history—`App` constructor in `packages/excalidraw/components/App.tsx`: `Scene`, `Store`, `History`, `ActionManager`, RoughJS canvas).
- **Learn the UI** on first open — welcome hints and menu (`excalidraw-app/components/AppWelcomeScreen.tsx`: `welcomeScreen.app.menuHint`, toolbar/help hints, center heading i18n keys).
- **Load prior work** — welcome `MenuItemLoadScene`; `loadFromBlob`, restore APIs used from `excalidraw-app/App.tsx`.
- **Get help** — `MenuItemHelp` on welcome screen (same file).
- **Live collaboration** (when enabled) — `MenuItemLiveCollaborationTrigger` → `onCollabDialogOpen` prop (`AppWelcomeScreen.tsx`).
- **Account / Excalidraw+ funnel** — `Sign up` link when `!isExcalidrawPlusSignedUser`; Plus heading branch when `isExcalidrawPlusSignedUser` (`app_constants.ts` cookie check + `VITE_APP_PLUS_*` env in `AppWelcomeScreen.tsx`).
- **Share / export** — `ShareableLinkDialog`, backend helpers (`exportToBackend`, `importFromBackend`, `getCollaborationLinkData`, etc.) from `excalidraw-app/data` in `App.tsx`.
- **Install / offline (PWA)** — `registerSW()` in `excalidraw-app/index.tsx`; `beforeinstallprompt` handling in `excalidraw-app/App.tsx`.
- **Power users** — `CommandPalette` + `DEFAULT_CATEGORIES` (`App.tsx`).

## Flows (scenario → modules)

1. **Land on app → welcome → pick next step** — `AppWelcomeScreen.tsx` + `WelcomeScreen` from `@excalidraw/excalidraw`.
2. **Open menu / use toolbar / shortcuts** — hints point users there; implementation spans `packages/excalidraw/components/` and `packages/excalidraw/actions/`.
3. **Persist locally** — keys in `excalidraw-app/app_constants.ts` (`STORAGE_KEYS`); `LocalData`, `importFromLocalStorage` wired from `App.tsx`.
4. **Sync files / rooms** — Firebase paths `FIREBASE_STORAGE_PREFIXES` in `app_constants.ts`; `excalidraw-app/data/index.ts` uses `VITE_APP_BACKEND_V2_GET_URL` / `VITE_APP_BACKEND_V2_POST_URL`.
5. **Embed in another site** — consumer loads `@excalidraw/excalidraw` + CSS; Next example copies fonts from `packages/excalidraw/dist/prod/fonts` (`examples/with-nextjs/package.json` scripts).

## UX constraints visible in shell code

- **Iframe** — `isRunningInIframe` from `@excalidraw/common` in `excalidraw-app/App.tsx`.
- **Theme / language** — `useHandleAppTheme`, `excalidraw-app/app-language/` (imported from `App.tsx`).

## Not evidenced in this repo

Exact marketing copy per locale lives in `packages/excalidraw/locales/*.json` (not enumerated here). Production URLs and secrets for `VITE_*` variables are deployment-specific and not defined in this snapshot.
