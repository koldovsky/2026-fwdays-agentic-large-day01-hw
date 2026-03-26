# Product context (UX goals & scenarios)

## Related documentation (`docs/product/`)

- **PRD** (formal product requirements): [`PRD.md`](../product/PRD.md)
- **Domain glossary** (terms as in code: `Scene`, `AppState`, `Action`, `Library`, collaboration types, …): [`domain-glossary.md`](../product/domain-glossary.md)

## Primary UX goals (evidence-based)

- **Low-friction diagramming:** Default welcome messaging emphasizes picking tools and drawing (“Pick a tool & Start drawing!”, “Diagrams. Made. Simple.”) with hints for menu, toolbar, and help/shortcuts.
- **Local-first clarity:** Hosted-app variant warns that drawings live in **browser storage** and can be cleared; users are nudged to **save to a file** regularly.
- **Destructive-action safety:** Loading from file or shareable link uses **overwrite confirmation** with explicit backup options (export as image, save to disk, Excalidraw+ path in copy).
- **International use:** Broad **locale** set (`packages/excalidraw/locales/*.json`) with percentage coverage metadata (`percentages.json`).
- **Accessible power usage:** **Command palette** and **shortcuts** are first-class (`CommandPalette` in app shell; `actionShortcuts` on welcome help).

_Sources:_ `packages/excalidraw/locales/en.json` (`welcomeScreen`, `overwriteConfirm`); `packages/excalidraw/components/welcome-screen/WelcomeScreen.tsx`; `WelcomeScreen.Center.tsx` (menu: load scene, help); `excalidraw-app/App.tsx` imports (`CommandPalette`, `actionShortcuts`).

## Core user scenarios

### First session / empty canvas

1. User sees **welcome center** (logo, heading, menu entries).
2. **Hints** surface: main menu (export, preferences, languages), toolbar tool choice, help/shortcuts.
3. User starts drawing with shape/pen/text tools (standard `App` / `LayerUI` flow).

_Sources:_ `WelcomeScreen.tsx`; `WelcomeScreen.Center.tsx`; `WelcomeScreen.Hints` module.

### Save, export, and backup

1. **Export** and **save to disk** paths exist with **overwrite modal** patterns when replacing content (`overwriteConfirm.action.*`, `overwriteConfirm.modal.loadFromFile`).
2. **Export as image** is a distinct confirmed action in copy.

_Sources:_ `packages/excalidraw/locales/en.json` → `overwriteConfirm`; `packages/excalidraw/actions/actionExport.tsx` (registered export actions).

### Open existing work

1. **Load from file** and **load from shareable link** flows warn before replacing the current scene (`overwriteConfirm.modal.*`).
2. **Library** items can be driven from URL tokens (`useHandleLibrary`, `parseLibraryTokensFromUrl` in `excalidraw-app/App.tsx` imports).

_Sources:_ `en.json` `overwriteConfirm.modal`; `excalidraw-app/App.tsx` library imports.

### Collaboration & sharing (hosted app)

1. **Live collaboration** UI (`LiveCollaborationTrigger`) and a **`Collab`** module coordinate **socket** scenes, cursors, idle state, and reconciliation with remote elements.
2. **Shareable link** dialog exists in the app shell (`ShareableLinkDialog`).
3. **Firebase storage prefixes** separate share-link files vs room files in constants.

_Sources:_ `excalidraw-app/App.tsx`; `excalidraw-app/collab/Collab.tsx`; `excalidraw-app/app_constants.ts` (`FIREBASE_STORAGE_PREFIXES`, `WS_EVENTS`, `WS_SUBTYPES`).

### Diagram generation & Mermaid

1. **Mermaid → Excalidraw** supports listed diagram families in UI copy (flowchart, sequence, class, ER); others fall back to image behavior per strings.
2. **TTD / chat** UX: welcome message invites natural-language diagram description; chat UI includes rate-limit messaging, retry, mermaid preview, and error states (`promptTooShort`, `generationFailed`, etc.).
3. **IndexedDB** stores TTD chats (`STORAGE_KEYS.IDB_TTD_CHATS`).

_Sources:_ `en.json` → `mermaid`, `chat`; `excalidraw-app/app_constants.ts` → `IDB_TTD_CHATS`; `TTDWelcomeMessage.tsx`.

### Mobile / form factors

- Editor exposes **form factor** (e.g. phone) to hide keyboard shortcut labels on welcome items where inappropriate (`editorInterface.formFactor !== "phone"` in `WelcomeScreen.Center.tsx`).

_Source:_ `WelcomeScreen.Center.tsx`.

## UX constraints visible in code

- **File uploads:** Max **4 MiB** aligned with constants comment (`FILE_UPLOAD_MAX_BYTES`).
- **Sync cadence:** Periodic full scene sync and fast browser-tab sync timeouts defined (`SYNC_FULL_SCENE_INTERVAL_MS`, `SYNC_BROWSER_TABS_TIMEOUT`).
- **Cursor updates:** Throttled (~30 fps) via `CURSOR_SYNC_TIMEOUT`.

_Source:_ `excalidraw-app/app_constants.ts`.
