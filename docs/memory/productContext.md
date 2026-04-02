# Product context — UI/UX keys and scripts

Verified against `packages/excalidraw/locales/en.json`, `packages/excalidraw/actions/shortcuts.ts`, `packages/excalidraw/shortcut.ts`, `packages/excalidraw/types.ts`, `packages/common/src/constants.ts`, and workspace `package.json` files.

## i18n: modifier keys (`keys.*`)

Displayed shortcuts are localized via `getShortcutKey` in `packages/excalidraw/shortcut.ts`, which substitutes tokens using these JSON keys:

| Key path | English value (`en.json`) |
|----------|---------------------------|
| `keys.ctrl` | Ctrl |
| `keys.cmd` | Cmd |
| `keys.option` | Option |
| `keys.alt` | Alt |
| `keys.shift` | Shift |
| `keys.enter` | Enter |
| `keys.escape` | Esc |
| `keys.spacebar` | Space |
| `keys.delete` | Delete |
| `keys.mmb` | Scroll wheel |

On macOS (`isDarwin` from `@excalidraw/common`), `Alt`/`Option` and `Ctrl`/`Cmd` labels follow Apple conventions; other platforms use Alt/Ctrl.

## i18n: help and labels used with shortcuts

Representative strings wired into the help UI and menus (see `HelpDialog.tsx`, `main-menu/DefaultItems.tsx`):

- **Help dialog section titles:** `helpDialog.editor`, `helpDialog.tools`, `helpDialog.view`, `helpDialog.shortcuts`, `helpDialog.title` (“Help”).
- **Interaction wording in shortcut strings:** `helpDialog.drag`, `helpDialog.click`, `helpDialog.doubleClick` (e.g. duplicate uses `Alt+` + localized “drag”).
- **Common action labels:** under `labels.*` — e.g. `labels.moveCanvas`, `labels.cut`, `labels.copy`, `labels.paste`, `labels.selectAll`, `labels.delete`, `labels.clearCanvas`, etc.

## Shortcut map (logical keys)

Source of truth: `shortcutMap` in `packages/excalidraw/actions/shortcuts.ts`. Values are produced with `getShortcutKey(...)` (platform-specific labels). `CtrlOrCmd` means Cmd on macOS, Ctrl elsewhere.

| Area | Shortcut names (examples) |
|------|---------------------------|
| File / scene | `saveScene`, `loadScene`, `saveFileToDisk`, `saveToActiveFile` → Ctrl/Cmd+S; `loadScene` → Ctrl/Cmd+O |
| Canvas | `clearCanvas` → Ctrl/Cmd+Delete |
| Export | `imageExport` → Ctrl/Cmd+Shift+E; `copyAsPng` → Shift+Alt+C |
| Edit | `cut`/`copy`/`paste`, `copyStyles`/`pasteStyles`, `selectAll`, `deleteSelectedElements`, `duplicateSelection` (Ctrl/Cmd+D or Alt+drag) |
| Z-order | `sendBackward`, `bringForward`; `sendToBack` / `bringToFront` differ on Darwin vs non-Darwin |
| Groups | `group`, `ungroup` |
| View | `gridMode`, `zenMode`, `objectsSnapMode`, `viewMode`, `stats`, `toggleTheme` (Shift+Alt+D) |
| Transform | `flipHorizontal`, `flipVertical`, `hyperlink`, `toggleElementLock` |
| Zoom | `resetZoom`, `zoomOut`, `zoomIn`, `zoomToFit`, `zoomToFitSelectionInViewport`, `zoomToFitSelection` (Shift+1/2/3) |
| Tools | `toggleEraserTool` (E), `toggleHandTool` (H), `setFrameAsActiveTool` (F), `toolLock` (Q) |
| UI | `commandPalette` (Ctrl/Cmd+/ or Ctrl/Cmd+Shift+P), `searchMenu` (Ctrl/Cmd+F), `toggleShortcuts` (?) |

Some names have empty shortcut arrays in the map (`addToLibrary`, `wrapSelectionInFrame`); behavior may still be exposed via actions or UI without a listed chord.

## Embed API: UI toggles

- **`UIOptions`** (`packages/excalidraw/types.ts`): optional `canvasActions`, `tools.image`, `dockedSidebarBreakpoint`, `getFormFactor`, etc. `welcomeScreen` is deprecated (comment: removed in 0.15).
- **`CanvasActions`:** flags such as `changeViewBackgroundColor`, `clearCanvas`, `export`, `loadScene`, `saveToActiveFile`, `toggleTheme`, `saveAsImage`. Comment in `types.ts`: if an action name matches a `canvasActions` key, truthiness controls whether the action is shown (`ActionManager` / `renderAction`).
- **Defaults:** `DEFAULT_UI_OPTIONS` in `packages/common/src/constants.ts` enables clear/load/save/export/background tools by default; `toggleTheme: null` unless overridden (see merge logic in `packages/excalidraw/index.tsx` when `theme` is undefined).

## Scripts (run from repo root unless noted)

### Root `package.json` (`excalidraw-monorepo`)

| Script | Purpose |
|--------|---------|
| `start` | Dev server: `yarn --cwd ./excalidraw-app start` |
| `start:production` | Build app then production static serve |
| `start:example` | `build:packages` then script-in-browser example |
| `build` / `build:app` / `build:preview` | Delegate to `excalidraw-app` |
| `build:packages` | `build:common` → `math` → `element` → `excalidraw` |
| `build:common` / `build:element` / `build:excalidraw` / `build:math` | Per-package ESM build |
| `build-node` | `node ./scripts/build-node.js` |
| `test` / `test:app` | Vitest |
| `test:all` | typecheck + eslint + prettier + app tests |
| `test:typecheck` | `tsc` |
| `test:code` | ESLint |
| `test:other` | Prettier check |
| `fix` / `fix:code` / `fix:other` | Prettier write + ESLint fix |
| `locales-coverage` / `locales-coverage:description` | Locale coverage scripts |
| `release` / `release:*` | `scripts/release.js` |
| `rm:build` / `rm:node_modules` / `clean-install` | Clean artifacts or reinstall |

### `excalidraw-app/package.json`

| Script | Purpose |
|--------|---------|
| `start` | `yarn && vite` (dev) |
| `build` | `build:app` + `build:version` |
| `build:app` | Vite production build (tracking env when set) |
| `build:app:docker` | Build with Sentry disabled |
| `build:version` | `node ../scripts/build-version.js` |
| `serve` | `http-server` on port 5001 |
| `build:preview` | Build then `vite preview` on 5000 |

Dev server port: `excalidraw-app/vite.config.mts` uses `VITE_APP_PORT` from parent `envDir` or defaults to **3000**.

### `packages/excalidraw/package.json`

| Script | Purpose |
|--------|---------|
| `build:esm` | `rimraf dist`, `node ../../scripts/buildPackage.js`, `yarn gen:types` |
| `gen:types` | `rimraf types && tsc` |

### Examples

- **`examples/with-script-in-browser`:** `start` (vite), `build`, `preview` (5002), `build:packages` via root.
- **`examples/with-nextjs`:** `dev` (3005), `start` (3006), `build` / `build:workspace` with font copy from `packages/excalidraw/dist/prod/fonts`.

## Verification notes

- Shortcut resolution at runtime also depends on per-action `keyTest` in `packages/excalidraw/actions/manager.tsx` (sorted by `keyPriority`; warns if multiple actions match).
- Full help content including flowchart and canvas navigation chords is in `packages/excalidraw/components/HelpDialog.tsx` (not every chord is duplicated in `shortcutMap`).
