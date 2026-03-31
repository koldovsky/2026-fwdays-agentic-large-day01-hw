# Tech Context (Verified Artifact)

## Summary
- Technical snapshot of stack, scripts, and recorded repomix metrics.
- Based on package manifests and repository scripts.

## Current State

### Repository Tooling
- Package manager: Yarn workspaces (`packageManager: yarn@1.22.22` in root `package.json`)
- Node engine: `>=18.0.0` (root and `excalidraw-app`)
- Language: TypeScript `5.9.3` (root `devDependencies`)
- Bundler: Vite `5.0.12` (root `devDependencies`)
- Test runner: Vitest `3.0.6` (root `devDependencies`)
- Type checking: `tsc` (root `test:typecheck`)
- Linting and formatting:
  - ESLint: `eslint --max-warnings=0 --ext .js,.ts,.tsx .` (root `test:code`)
  - Prettier `2.6.2` (root `test:other`, `fix:other`, and `prettier`)
- Git hooks: `husky install` (root `prepare`)

### Hosted App (`excalidraw-app`)
- React `19.0.0` and ReactDOM `19.0.0`
- Socket.IO client `4.7.2`
- Firebase `11.3.1`
- Sentry browser SDK `9.0.1`
- i18next language detector `6.1.4`
- idb-keyval `6.0.3`

### Embeddable Editor Package (`packages/excalidraw`)
- State management: Jotai `2.11.0`, `jotai-scope` `0.7.2`
- UI primitives: `radix-ui` `1.4.3`
- Rendering style: `roughjs` `4.6.4`
- Code editing support: `@codemirror/*` at `^6.0.0`
- Styling pipeline: `sass` `1.51.0`
- Diagram conversion: `@excalidraw/mermaid-to-excalidraw` `2.1.1`

### Key Commands

#### Build and Run
- `yarn build` -> `yarn --cwd ./excalidraw-app build`
- `yarn build:packages` -> builds common/math/element/excalidraw packages
- `yarn build:preview` -> `yarn --cwd ./excalidraw-app build:preview`
- `yarn start` -> `yarn --cwd ./excalidraw-app start`
- `yarn start:production` -> `yarn --cwd ./excalidraw-app start:production`
- `yarn build:app:docker` -> `yarn --cwd ./excalidraw-app build:app:docker`

#### Tests and Quality Checks
- `yarn test` -> `vitest`
- `yarn test:typecheck` -> `tsc`
- `yarn test:code` -> `eslint --max-warnings=0 --ext .js,.ts,.tsx .`
- `yarn test:other` -> `yarn prettier --list-different`
- `yarn test:all` -> `test:typecheck && test:code && test:other && test:app --watch=false`

#### Formatting and Auto-Fix
- `yarn fix:code` -> `yarn test:code --fix`
- `yarn fix:other` -> `yarn prettier --write`
- `yarn fix` -> `yarn fix:other && yarn fix:code`

#### Cleanup
- `yarn clean-install` -> `yarn rm:node_modules && yarn install`
- `yarn rm:build` -> removes generated `build`/`dist` outputs via `rimraf`

### Package-Specific Scripts

#### `excalidraw-app`
- `yarn --cwd ./excalidraw-app start` -> `vite`
- `yarn --cwd ./excalidraw-app serve` -> `npx http-server build ... -p 5001`
- `yarn --cwd ./excalidraw-app build:preview` -> build + `vite preview --port 5000`

#### `packages/excalidraw`
- `yarn --cwd ./packages/excalidraw build:esm` -> ESM build + `yarn gen:types`
- `yarn --cwd ./packages/excalidraw gen:types` -> `rimraf types && tsc`

- Command used:
  - `npx repomix@latest --remove-comments --include "packages/excalidraw/components/**" --style plain`
- Raw artifact file: `repomix-minimal-raw.txt`
- Compressed artifact file: `repomix-minimal.txt`

### Raw vs Compressed (Recorded Values)

- Raw (no `--compress`): `382,088` tokens; `1,489,380` bytes (`1,489,338` chars)
- Compressed (`--compress`): `98,747` tokens; `369,105` bytes (`366,311` chars)

### Compression Deltas

- Token reduction: `-283,341` (`-74.16%`)
- Byte reduction: `-1,120,275` (`-75.22%`)
- Character reduction: `-1,123,027` (`-75.40%`)

### Conclusion

- Compression is highly effective for this sample:
  - approximately `3.9x` smaller by tokens
  - approximately `4.0x` smaller by bytes

### Notable Observation

- Top token-share concentration drops significantly after compression.
- Recorded example: `packages/excalidraw/components/App.tsx` shifts from `20.2%` to `5.2%`.

## Actions
- Keep stack and command references synchronized with `package.json` files.
- Refresh metric section only when new repomix runs are recorded.

## Source Checkpoints
- `package.json`
- `excalidraw-app/package.json`
- `packages/excalidraw/package.json`
- `repomix-output.xml`

## Related Documentation

- [`../technical/dev-setup.md`](../technical/dev-setup.md)
- [`../technical/architecture.md`](../technical/architecture.md)
- [`../technical/code-notes.md`](../technical/code-notes.md)
- [`../product/PRD.md`](../product/PRD.md)
- [`../product/domain-glossary.md`](../product/domain-glossary.md)
