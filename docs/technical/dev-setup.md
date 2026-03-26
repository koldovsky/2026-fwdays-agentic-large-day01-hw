# Dev Setup

## Prerequisites
- Node.js >= 18
- Yarn 1.x (workspace manager in this repo)

## Install
```bash
yarn
```

## Common Commands
```bash
yarn start
yarn test
yarn test:all
yarn build
yarn build:packages
```

## Optional: CodeGraphContext (CGC)
If using CGC in this repository, use wrapper script:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\cgc.ps1 --version
powershell -ExecutionPolicy Bypass -File .\scripts\cgc.ps1 index .
powershell -ExecutionPolicy Bypass -File .\scripts\cgc.ps1 list
```
This script routes CGC state into local `.cgc_home` to avoid profile permission issues.

For current CGC status and value, see `docs/reference/codegraphcontext.md`.


