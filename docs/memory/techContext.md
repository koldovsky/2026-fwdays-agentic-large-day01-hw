# Tech Context (Verified Artifact)


---
## Technology Stack (verified from package manifests)
### Repo / tooling
- Package manager: Yarn workspaces (`packageManager: yarn@1.22.22`, root `package.json`)
- Node engine: `>=18.0.0` (root and `excalidraw-app`)
- Language: TypeScript `5.9.3` (root `package.json` devDependencies)
- Bundling: Vite `5.0.12` (root `package.json` devDependencies)
- Testing: Vitest `3.0.6` (root `package.json` devDependencies)
- Typechecking command: `tsc` (root `test:typecheck` script)
- Lint/format:
  - ESLint via `eslint --max-warnings=0 --ext .js,.ts,.tsx .` (root `test:code`)
  - Prettier `2.6.2` (root `test:other`, `fix:other`, and `prettier` script)
- Git hooks: `husky install` (root `prepare`)

### Hosted app (`excalidraw-app`)
- React `19.0.0` / ReactDOM `19.0.0`
- Socket.IO client `4.7.2`
- Firebase `11.3.1`
- Sentry browser `9.0.1`
- i18next language detection `6.1.4`
- idb-keyval `6.0.3`

### Embeddable editor package (`packages/excalidraw`)
- Jotai `2.11.0` and `jotai-scope` `0.7.2`
- UI primitives: `radix-ui` `1.4.3`
- “Hand-drawn” rendering style uses `roughjs` `4.6.4`
- Canvas/editor tooling uses CodeMirror packages (`@codemirror/*` at `^6.0.0`)
- Styling build: `sass` `1.51.0`
- Text/code conversions include `@excalidraw/mermaid-to-excalidraw` `2.1.1`

## Key Commands (verified from root and package scripts)
### Build / run
- `yarn build` (root: `yarn --cwd ./excalidraw-app build`)
- `yarn build:packages` (root: build common/math/element/excalidraw packages)
- `yarn build:preview` (root: `yarn --cwd ./excalidraw-app build:preview`)
- `yarn start` (root: `yarn --cwd ./excalidraw-app start`)
- `yarn start:production` (root: `yarn --cwd ./excalidraw-app start:production`)
- `yarn build:app:docker` (root: `yarn --cwd ./excalidraw-app build:app:docker`)

### Tests / checks
- `yarn test:app` (root: `vitest`)
- `yarn test:typecheck` (root: `tsc`)
- `yarn test:code` (root: `eslint --max-warnings=0 --ext .js,.ts,.tsx .`)
- `yarn test:other` (root: `yarn prettier --list-different`)
- `yarn test:all` (root: `test:typecheck && test:code && test:other && test:app --watch=false`)

### Formatting / auto-fix
- `yarn fix:code` (root: `yarn test:code --fix`)
- `yarn fix:other` (root: `yarn prettier --write`)
- `yarn fix` (root: `yarn fix:other && yarn fix:code`)

### Cleanup
- `yarn clean-install` (root: `yarn rm:node_modules && yarn install`)
- `yarn rm:build` (root: `rimraf` glob for `build`/`dist` outputs)

## Package-specific scripts (verified)
### `excalidraw-app`
- `yarn --cwd ./excalidraw-app start` (`vite`)
- `yarn --cwd ./excalidraw-app serve` (`npx http-server build ... -p 5001`)
- `yarn --cwd ./excalidraw-app build:preview` (build + `vite preview --port 5000`)

### `packages/excalidraw`
- `yarn --cwd ./packages/excalidraw build:esm` (build ESM bundle + `yarn gen:types`)
- `yarn --cwd ./packages/excalidraw gen:types` (`rimraf types && tsc`)

---

## Repomix compression metrics (minimal include)
- Generated with:
  - `npx repomix@latest --remove-comments --include "packages/excalidraw/components/**" --style plain`
- Raw output file referenced by the artifact:
  - `repomix-minimal-raw.txt`
- Compressed output file referenced by the artifact:
  - `repomix-minimal.txt`

## Raw vs compressed metrics (as recorded)
- Raw (no `--compress`): `382,088` tokens; `1,489,380` bytes (`1,489,338` chars)
- Compressed (`--compress`): `98,747` tokens; `369,105` bytes (`366,311` chars)

## Highlights (as recorded)
- Token count difference:
  - `-283,341` tokens (`-74.16%` reduction)
- Size difference (bytes):
  - `-1,120,275` bytes (`-75.22%` reduction)
- Char size difference:
  - `-1,123,027` chars (`-75.40%` reduction)

## Conclusion (as recorded)
- Compression is highly efficient here:
  - ~`3.9x` smaller by tokens
  - ~`4.0x` smaller by bytes

## Notable observations (as recorded)
- "Top token file share" drops sharply under compression:
  - example shown: `packages/excalidraw/components/App.tsx`: `20.2%` -> `5.2%`
- (as recorded) Example value indicates a sharp drop in token file share for the highlighted file under compression.



## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md

## Related Documentation
- [`../technical/dev-setup.md`](../technical/dev-setup.md)
- [`../technical/architecture.md`](../technical/architecture.md)
- [`../technical/code-notes.md`](../technical/code-notes.md)
- [`../product/PRD.md`](../product/PRD.md)
- [`../product/domain-glossary.md`](../product/domain-glossary.md)