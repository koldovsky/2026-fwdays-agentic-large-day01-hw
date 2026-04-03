# Tech Context

## Stack
- Language: TypeScript across app and packages.
- UI: React 19 + React DOM 19.
- Build tool: Vite (app build and preview).
- Tests: Vitest.
- Monorepo: Yarn workspaces.

## Workspace packages
- `excalidraw-app`
- `packages/common`
- `packages/math`
- `packages/element`
- `packages/excalidraw`
- `packages/utils`
- `examples/*`

## Runtime integrations
- Collaboration/file flows include Firebase and Socket.IO client dependencies.
- Error/telemetry hooks include Sentry package integration.

## Key commands (root)
- Install: `yarn install --immutable`
- Start app: `yarn start`
- Run tests: `yarn test`
- Build app: `yarn build`
- Lint: `yarn test:code`
- Typecheck: `yarn test:typecheck`
- Full check: `yarn test:all`

## Context budget measurements (Repomix)
- Full package (`npx repomix`): ~3,314,085 tokens.
- Compressed (`--compress`, excluding repomix artifacts): ~1,254,621 tokens.
- Scoped compressed (`--compress --remove-comments --include "packages/excalidraw/**/*.ts"`): ~63,840 tokens.

## Risks for AI agents
- Full repository exceeds typical default model context windows.
- High-token files (fonts/subset assets) can dominate context if not scoped.
- Scoped queries and Memory Bank are required for reliable answers.

## Related Docs
- [Project Brief](./projectBrief.md)
- [System Patterns](./systemPatterns.md)
- [Active Context](./activeContext.md)
- [Architecture](../technical/architecture.md)
- [Dev Setup](../technical/dev-setup.md)
