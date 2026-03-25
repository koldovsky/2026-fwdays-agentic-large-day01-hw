# Developer Setup

## Prerequisites
- Node.js `>=18`
- Yarn `1.22.x`
- A browser supported by the app's browserslist
- Optional but useful:
  - Docker and Docker Compose
  - access to a compatible collaboration server
  - access to the AI backend if testing AI features

## Initial Setup
1. Run `yarn install` from the repository root.
2. Verify root workspace scripts are available with `yarn --silent run` if needed.
3. Review `.env.development` and provide local overrides in `.env.local` or `.env.development.local` if your environment differs.

## Run Locally
1. Start the app with `yarn start`.
2. Default local app port comes from `.env.development` and is `3001`.
3. Collaboration expects a Socket.IO backend at `http://localhost:3002` unless overridden.
4. AI flows expect a backend at `http://localhost:3016` unless overridden.
5. Share-link backend defaults to hosted dev endpoints, so basic share-link behavior may work without running a local backend.

## Build
- Main app build: `yarn build`
- Docker-oriented app build: `yarn build:app:docker`
- Package builds: `yarn build:packages`
- Preview built app: `yarn build:preview`

## Test And Quality Workflow
- App tests: `yarn test:app`
- Full validation: `yarn test:all`
- Coverage: `yarn test:coverage`
- Typecheck only: `yarn test:typecheck`
- ESLint only: `yarn test:code`
- Prettier check: `yarn test:other`
- Autofix: `yarn fix`

## Package Development Notes
- Vite and Vitest use path aliases to point `@excalidraw/*` imports at workspace source during development.
- The app is therefore a real consumer of workspace packages, not just a demo.
- Published package consumers should use the built package exports, not workspace-specific aliases.

## Docker Workflow
- `docker-compose.yml` mounts the repo into `/opt/node_app/app` and exposes container port `80` on host `3000`.
- Docker build path runs `yarn build:app:docker` and serves static output through Nginx.
- Use Docker when you need a static-asset runtime close to production behavior, not when you need fast inner-loop UI changes.

## Common Issues And Fixes

### App Starts But Collaboration Does Not Work
- Check `VITE_APP_WS_SERVER_URL`.
- This repo does not include the collaboration server implementation.

### AI Buttons Exist But Requests Fail
- Check `VITE_APP_AI_BACKEND`.
- Rate limits and backend availability are external concerns.

### Canvas State Does Not Persist Reliably
- Check for browser storage quota issues.
- Large image-heavy scenes are more likely to hit `localStorage` or IndexedDB edge cases.

### Weird Asset Or Chunk Loading Errors
- Suspect stale service worker or cached chunk mismatch first.
- The app explicitly ignores several dynamic-import/service-worker related errors in Sentry because they happen in the wild.

### Share Links Or Imported URLs Overwrite Unexpectedly
- The app prompts before overwriting a non-empty local scene in many external import cases.
- Reproduce from a clean local state before debugging overwrite behavior.

## PR Workflow
- Pre-commit hooks run via Husky and lint-staged.
- PR titles are validated by GitHub Actions, so use a semantic title such as `feat: add dev setup notes` or `docs: expand PR workflow guidance`.
- The provided PR template is workshop-specific and asks for completed deliverables, including the memory-bank docs. Update the checklist to reflect what is actually included in your branch and use the notes section for anything reviewers should verify manually.
- Pull requests trigger CI for linting, typechecking, coverage, and the semantic-title check. The main branch also runs `yarn test:app` on push.
- Before opening a PR, run at least:
  - `yarn test:typecheck`
  - `yarn test:code`
  - `yarn test:other`
  - `yarn test:app --watch=false`
- If your change affects behavior in a way reviewers cannot infer from the diff alone, include a short reproduction path, screenshots, or a note about required local services such as the collab or AI backend.
- Keep PRs narrowly scoped. Changes to docs, product-memory files, and implementation can land together when they describe the same piece of work, but unrelated cleanup should be split into a separate PR.

## Coding Standards In This Repo
- TypeScript is the default for new code.
- Prefer immutable data and avoid unnecessary allocation where practical.
- Use functional React components and hooks for new React code.
- Do not import directly from raw `jotai`; use project-specific wrappers.
- Formatting baseline:
  - UTF-8
  - LF
  - 2 spaces
- Linting enforces consistent type-only imports and import ordering.