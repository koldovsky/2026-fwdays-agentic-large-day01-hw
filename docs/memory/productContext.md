# UX Goals & Scenarios

## UX Principles

- **Simplicity**: Minimal UI, focus on the canvas. Zen mode hides all UI. Welcome screen provides gentle onboarding (see `excalidraw-app/components/AppWelcomeScreen.tsx`)
- **Speed**: Instant tool switching, keyboard shortcuts for everything, throttled rendering for smooth interaction, memoized components
- **Hand-drawn feel**: Rough.js rendering gives all shapes an informal, sketch-like appearance. `roughness` and `seed` properties on every element control the hand-drawn style (see `packages/element/src/shape.ts`)
- **Collaboration-first**: Share a link and start drawing together. End-to-end encryption for privacy. Cursor sync at ~30fps for real-time feel

## Key User Scenarios

### Solo Sketching

1. User opens excalidraw.com — the `ExcalidrawApp` component loads (see `excalidraw-app/App.tsx`)
2. Welcome screen shown on first visit (`showWelcomeScreen` in AppState)
3. Previous scene restored from localStorage via `importFromLocalStorage()` (see `excalidraw-app/data/localStorage.ts`)
4. User selects a tool from the toolbar or uses keyboard shortcut
5. Drawing creates elements via `newElement()`, stored in Scene
6. Auto-saved to localStorage every 300ms (`SAVE_TO_LOCAL_STORAGE_TIMEOUT` in `excalidraw-app/app_constants.ts`)

### Real-Time Collaboration

1. User clicks "Share" → `ShareDialog` opens (see `excalidraw-app/share/ShareDialog.tsx`)
2. Clicking "Live collaboration" triggers `Collab.startCollaboration()` (see `excalidraw-app/collab/Collab.tsx`)
3. Room ID and key generated, URL updated with hash containing encrypted room info
4. Socket.IO connection established via `Portal.open()` (see `excalidraw-app/collab/Portal.tsx`)
5. Existing scene loaded from Firebase if room has data (`loadFromFirebase()`)
6. Both users see each other's cursors, synced via `WS_SUBTYPES.MOUSE_LOCATION`
7. Element changes broadcast via `Portal.broadcastScene()` with encryption
8. Remote changes reconciled via `reconcileElements()` — version-based conflict resolution
9. User can follow another user's viewport (`userToFollow` in AppState)

### Embedding in Other Apps

1. Developer installs `@excalidraw/excalidraw` npm package
2. Renders `<Excalidraw>` component with props: `initialData`, `onChange`, `theme`, etc. (see `packages/excalidraw/index.tsx`)
3. Uses `<ExcalidrawAPIProvider>` + `useExcalidrawAPI()` for imperative control outside the component tree
4. Customizes UI via children components: `<MainMenu>`, `<WelcomeScreen>`, `<Footer>`, `<Sidebar>`
5. Listens to changes via `onChange` callback, manages persistence externally
6. Examples in `examples/with-nextjs/` and `examples/with-script-in-browser/`

### Library Management

1. User draws elements, selects them, clicks "Add to library" (see `packages/excalidraw/actions/actionAddToLibrary.ts`)
2. Library items stored in IndexedDB via `LibraryIndexedDBAdapter` (see `excalidraw-app/data/LocalData.ts`)
3. Library sidebar shows saved items, user can drag them onto canvas
4. Libraries can be exported as JSON and imported from file or URL
5. Allowed library URLs are whitelisted (see `ALLOWED_LIBRARY_URLS` in `packages/excalidraw/data/library.ts`)

## Onboarding Flow

1. Fresh visit shows `AppWelcomeScreen` (see `excalidraw-app/components/AppWelcomeScreen.tsx`)
2. Welcome screen includes: live collaboration button, help menu hints, Excalidraw+ promo banner
3. First interaction dismisses the welcome screen (`showWelcomeScreen` set to `false`)
4. Tool hints visible in toolbar via tooltips
5. Help dialog accessible via `?` key or menu (action: `toggleShortcutDialog`)

## Theming

### Dark/Light Mode

- Three modes: `THEME.LIGHT`, `THEME.DARK`, and `"system"` (see `excalidraw-app/useHandleAppTheme.ts`)
- System mode listens to `prefers-color-scheme` media query
- Theme persisted in localStorage under key `excalidraw-theme` (see `STORAGE_KEYS.LOCAL_STORAGE_THEME`)
- Keyboard shortcut: `Alt+Shift+D` toggles between light and dark
- Canvas elements apply `applyDarkModeFilter()` when theme is dark (see `packages/common/`)
- `editorTheme` (actual rendered theme) vs `appTheme` (user preference) distinction in `useHandleAppTheme()`

## Localization Strategy

- Source language: English (`packages/excalidraw/locales/en.json`)
- Managed via Crowdin (see `crowdin.yml` — maps `en.json` → `%locale%.json`)
- Language detection: `i18next-browser-languagedetector` (see `excalidraw-app/app-language/language-detector.ts`)
- `getPreferredLanguage()` matches browser language to available locales with fallback
- Language state managed in `excalidraw-app/app-language/language-state.ts`
- `t()` function from `packages/excalidraw/i18n.ts` used throughout for translations
- `<Trans>` component for interpolated translations (see `packages/excalidraw/components/Trans.tsx`)

## Cross-References

- For project brief → see [`docs/memory/projectbrief.md`](projectbrief.md)
- For PRD → see [`docs/product/PRD.md`](../product/PRD.md)
- For architecture → see [`docs/technical/architecture.md`](../technical/architecture.md)
- For domain glossary → see [`docs/product/domain-glossary.md`](../product/domain-glossary.md)
