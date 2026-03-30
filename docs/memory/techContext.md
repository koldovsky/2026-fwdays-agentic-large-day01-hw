## Frontend stack
- **Framework**: React `19.0.0` (excalidraw-app/package.json)
- **Renderer**: `react-dom` `19.0.0` (excalidraw-app/package.json)
- **Bundler/dev server**: Vite `5.0.12` (package.json)
- **React plugin**: `@vitejs/plugin-react` `3.1.0` (package.json)

## Backend stack (if present)
- **App backend API**: Fetch calls to env-configured endpoints:
  - `VITE_APP_BACKEND_V2_GET_URL`, `VITE_APP_BACKEND_V2_POST_URL` (excalidraw-app/data/index.ts)
  - Backend implementation code: **Not found in code**
- **Realtime transport**: `socket.io-client` `4.7.2` (excalidraw-app/package.json, excalidraw-app/collab/Collab.tsx)
- **Firebase**: `firebase` `11.3.1` (excalidraw-app/package.json, excalidraw-app/data/firebase.ts)
  - Firestore & Storage rules/config in `firebase-project/` (firebase-project/firebase.json, firebase-project/firestore.rules, firebase-project/storage.rules)

## State management
- **Jotai**:
  - App-level store wrapper: `excalidraw-app/app-jotai.ts`
  - Editor isolation (jotai-scope): `packages/excalidraw/editor-jotai.ts` (referenced by packages/excalidraw/index.tsx and other modules)
- **Restrictions**: eslint rule forbids importing `jotai` directly in most places; requires app-specific modules (`editor-jotai` or `app-jotai`) (.eslintrc.json)

## UI libraries / styling
- **CSS/Sass**: `sass` `1.51.0` (packages/excalidraw/package.json)
- **Classnames**: `clsx` `1.1.1` (packages/excalidraw/package.json, excalidraw-app/App.tsx)
- **UI components**:
  - `radix-ui` `1.4.3` (packages/excalidraw/package.json)
  - Command palette present (packages/excalidraw/components/CommandPalette/CommandPalette via excalidraw-app/App.tsx)

## Tooling
- **TypeScript**: `5.9.3` (package.json)
- **Linting**:
  - ESLint config extends `@excalidraw/eslint-config` + `react-app` (.eslintrc.json)
  - `eslint-plugin-import` `2.31.0` (package.json)
- **Formatting**: Prettier `2.6.2` + `@excalidraw/prettier-config` (package.json)
- **Testing**:
  - Vitest `3.0.6` (package.json)
  - Coverage: `@vitest/coverage-v8` `3.0.7` (package.json, vitest.config.mts)
  - Environment: `jsdom` `22.1.0` (package.json, vitest.config.mts)
  - Setup file: `setupTests.ts` (vitest.config.mts)

## Key dependency versions (selected)
- **Monorepo manager**: Yarn `1.22.22` (package.json)
- **Node engine**: `>=18.0.0` (package.json, excalidraw-app/package.json)
- **Excalidraw package version**: `@excalidraw/excalidraw` `0.18.0` (packages/excalidraw/package.json)
- **App Sentry SDK**: `@sentry/browser` `9.0.1` (excalidraw-app/package.json)

## Environment/config handling
- **Vite env**:
  - Env loaded from repo root via `loadEnv(mode, "../")` and `envDir: "../"` (excalidraw-app/vite.config.mts)
  - Example vars used: `VITE_APP_PORT`, `VITE_APP_ENABLE_PWA`, `VITE_APP_ENABLE_ESLINT`, `VITE_APP_COLLAPSE_OVERLAY` (excalidraw-app/vite.config.mts)
  - Backend URLs: `VITE_APP_BACKEND_V2_GET_URL`, `VITE_APP_BACKEND_V2_POST_URL` (excalidraw-app/data/index.ts)
  - Firebase config: `VITE_APP_FIREBASE_CONFIG` parsed as JSON (excalidraw-app/data/firebase.ts)
- **.env files**: ignored by git (e.g. `.env.local`) (.gitignore)

## CI/CD
- **GitHub Actions**:
  - Lint/typecheck/prettier list: `.github/workflows/lint.yml`
  - Tests (push to master): `.github/workflows/test.yml`
  - Coverage report on PR: `.github/workflows/test-coverage-pr.yml`
  - Docker build/publish on `release` branch: `.github/workflows/build-docker.yml`, `.github/workflows/publish-docker.yml`
  - Sentry production release on `release` branch: `.github/workflows/sentry-production.yml`

## Deployment / hosting
- **Docker**:
  - Build stage Node 18, final stage nginx static hosting (Dockerfile)
  - Compose maps `3000:80` (docker-compose.yml)
- **Vercel**:
  - Output directory: `excalidraw-app/build` (vercel.json)

## Team ownership
- **CODEOWNERS**: Not found in code

## Documentation references

**Product**

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)

**Technical**

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)
- [Technical decision log](../technical/decisionlog.md)
