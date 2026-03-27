# Project Brief

See [productContext.md](./productContext.md) for user-facing intent and [techContext.md](./techContext.md) for stack/tooling.

## Overview
- This repo is the Excalidraw monorepo: a publishable React editor package, supporting core packages, a standalone web app, and example integrations.
- Root workspaces are `packages/*`, `excalidraw-app`, and `examples/*`.
- The repo is browser-first and centered on scene editing, rendering, import/export, persistence, collaboration, and optional AI-assisted workflows.

## Goals
- Ship `@excalidraw/excalidraw` as a stable embeddable editor for external React apps.
- Maintain a layered split between reusable core packages and the standalone host app.
- Keep `excalidraw-app` as the reference implementation for local-first editing, collaboration, share links, library workflows, and premium/AI integrations.
- Preserve backward compatibility for scenes, library data, and legacy share payloads while evolving the editor.

## Scope
- In scope: editor runtime, UI, scene model, rendering, import/export, local persistence, collaboration client logic, package builds, tests, and examples.
- In scope: client integrations with Firebase, websocket collaboration, share-link backend, library publishing, and AI endpoints.
- Out of scope: backend implementations for those services; this repo consumes them through env vars and network APIs.

## Constraints
- Node `>=18` and Yarn `1.x` workspaces are required by the root toolchain.
- The embeddable package must remain compatible with React `17`, `18`, and `19`; the standalone app currently runs on React `19`.
- Scene integrity depends on element `version`/`versionNonce`, fractional indices, restore migrations, and strict use of store capture semantics.
- The consumer contract stays browser-first; detailed runtime/setup constraints live in [techContext.md](./techContext.md).

## Success Criteria
- Workspace packages build and expose the expected entrypoints/types.
- `excalidraw-app` can boot from local state, external share links, or collaboration rooms without corrupting scenes.
- Undo/redo, file/image flows, import/export, library updates, and collaboration preserve data integrity.
- Durable project context stays in `docs/memory-bank/` instead of being re-derived from code each session.
