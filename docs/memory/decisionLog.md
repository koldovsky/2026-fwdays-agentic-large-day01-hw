# Decision log — architecture and UX rules

Entries describe **observable design choices in the codebase**, not historical meeting minutes. Citations point to implementation files.

## Monorepo and tooling

- **Yarn classic workspaces** — Single install at root; `workspaces` lists app, packages, and examples (`package.json`). **Decision:** centralized dependency management with per-package `package.json` for boundaries and scripts.
- **Node ≥ 18** — Documented in root and `excalidraw-app` `engines` for runtime compatibility.
- **Vite for the main app** — `excalidraw-app` uses Vite 5 with React plugin, PWA, SVGR, EJS, checker, sitemap, and custom `woff2` plugin (`vite.config.mts`). **Decision:** fast dev server and modern ESM-first app build.

## Development vs published package paths

- **Alias `@excalidraw/*` to TypeScript sources in Vite** — `excalidraw-app/vite.config.mts` resolves `@excalidraw/common`, `element`, `excalidraw`, `math`, `utils` to `packages/.../src` (or `index.tsx`). **Decision:** edit packages and see changes in the app without publishing locally.
- **TypeScript path mapping mirrors aliases** — Root `tsconfig.json` `paths` align with those packages for `tsc` and editor resolution.

## Library packaging

- **`@excalidraw/excalidraw` as ESM with dual dev/prod bundles** — `package.json` `exports` expose `development` vs `production` JS and CSS. **Decision:** smaller prod bundles while keeping dev ergonomics.
- **Build pipeline** — `packages/excalidraw` `build:esm` runs `scripts/buildPackage.js` then generates types (`gen:types`). **Decision:** dist output is the publishable artifact; examples that need fonts copy from `dist/prod/fonts` (Next example).

## Editor architecture

- **Class-based `App` + `ActionManager`** — `packages/excalidraw/components/App.tsx` registers actions; `ActionManager` (`actions/manager.tsx`) handles keyboard events, sorts actions by `keyPriority`, requires **exactly one** matching `keyTest`, and blocks shortcuts in view mode unless `action.viewMode === true`. **Decision:** predictable shortcut dispatch; conflicts log a console warning.
- **Central shortcut display map** — `packages/excalidraw/actions/shortcuts.ts` maps `ShortcutName` to display strings via `getShortcutKey` (`shortcut.ts`) for menus and help. **Decision:** single map for UX consistency; actual triggering still lives on actions’ `keyTest`.
- **Default UI capabilities** — `DEFAULT_UI_OPTIONS` in `packages/common/src/constants.ts` defines which file/canvas/export actions exist by default; `packages/excalidraw/index.tsx` merges host `UIOptions` and normalizes `toggleTheme` when `theme` prop is unset. **Decision:** embedders opt out per feature via `canvasActions` / `tools`.

## Internationalization

- **Locale JSON for labels and key names** — e.g. `packages/excalidraw/locales/en.json` provides `keys.*` and `helpDialog.*`; `getShortcutKey` swaps Ctrl/Cmd and Alt/Option by platform. **Decision:** shortcuts read naturally per OS and language.

## App-layer concerns (excalidraw-app)

- **Optional telemetry and error reporting** — Build scripts pass `VITE_APP_ENABLE_TRACKING`, git SHA, and Docker build disables Sentry (`build:app:docker`). **Decision:** environment-specific behavior for production vs container images.
- **Collab and storage dependencies** — Firebase, `idb-keyval`, `socket.io-client`, Jotai listed in `excalidraw-app/package.json`. **Decision:** full product features stay in the app package, not the core embeddable library.

## Testing strategy

- **Vitest at repository root** — `test:app` runs `vitest`; types include `vitest/globals` and Testing Library jest-dom (`tsconfig.json`). **Decision:** one test runner for cross-package tests under configured includes.

## Verification note

- Deprecated or commented APIs (e.g. `UIOptions.welcomeScreen` in `types.ts`) remain in types for compatibility; consumers should follow inline comments when upgrading.
