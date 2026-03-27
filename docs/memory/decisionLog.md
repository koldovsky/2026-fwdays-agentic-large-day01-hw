# Decision log

**Context → Decision → Consequences** (+ reference). Dates for decisions are **not evidenced in this repo**; entries reflect the **current tree**.

---

**1. Yarn classic workspaces**

- **Context**: Multiple packages and apps in one repo.
- **Decision**: Private root `excalidraw-monorepo` with `workspaces: ["excalidraw-app", "packages/*", "examples/*"]` and `packageManager` `yarn@1.22.22`.
- **Consequences**: Root scripts use `yarn --cwd` to target workspaces; `package-lock.json` is gitignored (`.gitignore`).
- **Ref**: `package.json`, `.gitignore`

**2. Vite for the host app**

- **Context**: Modern dev server, PWA, HTML/env integration.
- **Decision**: `excalidraw-app` builds with Vite (`vite` in root devDeps; app scripts `vite`, `vite build`).
- **Consequences**: `import.meta.env` for `VITE_*`; build `outDir` configured in `excalidraw-app/vite.config.mts`.
- **Ref**: `package.json`, `excalidraw-app/package.json`, `excalidraw-app/vite.config.mts`

**3. Source aliases for `@excalidraw/*`**

- **Context**: Fast iteration without publishing to the app workspace.
- **Decision**: `tsconfig.json` `paths` + Vite `resolve.alias` point into `packages/`.
- **Consequences**: Vitest duplicates aliases in `vitest.config.mts`.
- **Ref**: `tsconfig.json`, `excalidraw-app/vite.config.mts`, `vitest.config.mts`

**4. esbuild for publishable editor bundle**

- **Context**: Ship `@excalidraw/excalidraw` as ESM + types + CSS export map.
- **Decision**: `packages/excalidraw` `build:esm` runs `scripts/buildPackage.js` then `gen:types`.
- **Consequences**: Examples and consumers rely on `dist/prod` / `dist/dev` layout in `exports`.
- **Ref**: `packages/excalidraw/package.json`, `scripts/buildPackage.js`

**5. Smaller packages use `buildBase`**

- **Context**: Shared build for `common`, `element`, `math`.
- **Decision**: Each uses `node ../../scripts/buildBase.js` in `build:esm`.
- **Ref**: `packages/common/package.json`, `packages/element/package.json`, `packages/math/package.json`

**6. Class-based `App` + `ActionManager` + `History`**

- **Context**: Unified commands and undo.
- **Decision**: `App` constructs `ActionManager`, registers `actions` and undo/redo; `Store` + `History` back mutations.
- **Consequences**: New editor commands extend `packages/excalidraw/actions/`.
- **Ref**: `packages/excalidraw/components/App.tsx`, `packages/excalidraw/actions/register.ts`, `packages/excalidraw/actions/types.ts`

**7. Product backend and Firebase in `excalidraw-app`**

- **Context**: Share links, file storage, collaboration.
- **Decision**: `excalidraw-app/data/index.ts` uses `VITE_APP_BACKEND_V2_*`; Firebase helpers and `firebase` dependency on the app.
- **Consequences**: Pure npm embeds can avoid `excalidraw-app` entirely.
- **Ref**: `excalidraw-app/data/index.ts`, `excalidraw-app/package.json`, `excalidraw-app/app_constants.ts`

**8. Socket.IO client for collab**

- **Context**: Realtime room sync.
- **Decision**: `socket.io-client` in app dependencies; `excalidraw-app/collab/Collab.tsx`.
- **Ref**: `excalidraw-app/package.json`, `excalidraw-app/collab/Collab.tsx`

**9. PWA via vite-plugin-pwa**

- **Context**: Offline/install.
- **Decision**: `registerSW` from `virtual:pwa-register` in `excalidraw-app/index.tsx`; plugin in root devDependencies.
- **Ref**: `excalidraw-app/index.tsx`, `package.json`

**10. Sentry in browser entry**

- **Context**: Production error reporting.
- **Decision**: Sentry import from `excalidraw-app/index.tsx`; `@sentry/browser` in app deps; `sentry-production.yml`.
- **Ref**: `excalidraw-app/index.tsx`, `excalidraw-app/package.json`, `.github/workflows/sentry-production.yml`

**11. CI split: tests on push, lint on PR, coverage on PR**

- **Context**: Signal vs cost.
- **Decision**: `test.yml` on push to `master` (`yarn test:app`); `lint.yml` on PR (prettier/eslint/tsc); `test-coverage-pr.yml` runs `yarn test:coverage`.
- **Ref**: `.github/workflows/test.yml`, `.github/workflows/lint.yml`, `.github/workflows/test-coverage-pr.yml`

**12. Bundle size gate on library package**

- **Context**: Regressions in `@excalidraw/excalidraw` size.
- **Decision**: `size-limit.yml` runs against `packages/excalidraw` with `build:esm`.
- **Ref**: `.github/workflows/size-limit.yml`, `packages/excalidraw/package.json`
