# Tech Context

## Repository Model
- Monorepo managed with Yarn workspaces
- Workspace roots:
- `excalidraw-app`
- `packages/*`
- `examples/*`

## Runtime And Language
- Language: TypeScript `5.9.3`
- Runtime target: modern browsers
- Minimum Node version for development/builds: `>=18.0.0`
- Package manager: Yarn `1.22.22`

## Frontend Stack
- React `19.0.0`
- React DOM `19.0.0`
- Vite `5.0.12`
- `@vitejs/plugin-react` for React integration
- Sass in the library package
- Jotai `2.11.0` for state management

## App-Level Platform Integrations
- Firebase `11.3.1`
- `socket.io-client` `4.7.2`
- Sentry browser SDK `9.0.1`
- `idb-keyval` `6.0.3` for IndexedDB-backed local storage
- `vite-plugin-pwa` `0.21.1` for PWA features

## Testing And Quality
- Vitest `3.0.6`
- jsdom `22.1.0`
- `@testing-library/react` `16.2.0`
- TypeScript type-checking via `tsc`
- ESLint and Prettier are configured at the repo root
- Husky + lint-staged are used for local git-hook enforcement

## Internal Packages
- `@excalidraw/excalidraw` version `0.18.0`
- `@excalidraw/common` version `0.18.0`
- `@excalidraw/element` version `0.18.0`
- `@excalidraw/math` version `0.18.0`
- `@excalidraw/utils` version `0.1.2`

## Build And Resolution Model
- Root `tsconfig.json` maps `@excalidraw/*` imports directly to source files during development
- `vitest.config.mts` mirrors those aliases for tests
- `excalidraw-app/vite.config.mts` mirrors the same aliases for app builds
- This setup lets the app consume unpublished package source directly inside the monorepo

## Example Consumers
- `examples/with-nextjs` uses Next.js `14.1`
- `examples/with-script-in-browser` uses Vite `5.0.12`

## Teams And Ownership
- No explicit team ownership, CODEOWNERS file, or service-owner metadata was found in the repository root during this review
- Ownership appears to be organized by package and feature boundaries instead of checked-in team manifests

## Main Commands
- `yarn start` runs the app workspace
- `yarn build` builds the app
- `yarn build:packages` builds the internal packages
- `yarn test` runs Vitest
- `yarn test:all` runs typecheck, lint, formatting, and app tests

## Source Verification
- Versions and scripts were verified from:
- `package.json`
- `excalidraw-app/package.json`
- `packages/*/package.json`
- `examples/*/package.json`
- `tsconfig.json`
- `vitest.config.mts`
- `excalidraw-app/vite.config.mts`
