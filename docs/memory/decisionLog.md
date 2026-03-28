# Decision Log

## 1. Use A Yarn Workspace Monorepo

- Decision:
  - keep app, packages, and examples in one repo
- Evidence:
  - root `package.json` defines `workspaces`
  - `packageManager` is `yarn@1.22.22`
- Consequence:
  - one lockfile and root-level orchestration for build/test flows

## 2. Split Reusable Editor Code From Product Shell

- Decision:
  - keep reusable editor logic in `packages/*`
  - keep hosted-product integrations in `excalidraw-app`
- Evidence:
  - `@excalidraw/excalidraw` is published as a React component
  - `excalidraw-app/App.tsx` composes product-specific UI and integrations
- Consequence:
  - the same editor can be embedded outside the hosted app

## 3. Develop Against Local Source Through Aliases

- Decision:
  - resolve `@excalidraw/*` imports to in-repo source files in TS and Vite
- Evidence:
  - root `tsconfig.json`
  - `excalidraw-app/vite.config.mts`
- Consequence:
  - contributors can edit packages and see changes in the app without local publishing

## 4. Centralize Runtime Editing Around `App`

- Decision:
  - keep the editor orchestrator in `packages/excalidraw/components/App.tsx`
- Evidence:
  - `App` constructs `ActionManager`, `Scene`, `Renderer`, `Store`, and `History`
- Consequence:
  - command execution, rendering, state capture, and undo/redo remain coordinated in one runtime hub

## 5. Separate Collaboration Transport From Collaboration Orchestration

- Decision:
  - use `Collab` as app-level orchestrator and `Portal` as transport
- Evidence:
  - `Collab` creates `new Portal(this)`
- Consequence:
  - room lifecycle and lower-level transport concerns stay distinct

## 6. Keep AI Text-To-Diagram As A Shell-Level Integration

- Decision:
  - wire TTD through app components and adapters instead of burying backend concerns in the core editor runtime
- Evidence:
  - `AI.tsx` connects `TTDDialog`, `TTDStreamFetch`, and `TTDIndexedDBAdapter`
- Consequence:
  - AI flows remain optional and integration-driven

## 7. Support Installable Web Delivery

- Decision:
  - register a service worker and configure Vite PWA support
- Evidence:
  - `excalidraw-app/index.tsx`
  - `excalidraw-app/vite.config.mts`
- Consequence:
  - the hosted app can support offline-oriented caching and install-like behavior

## Sources

- `package.json`
- `packages/excalidraw/package.json`
- `tsconfig.json`
- `excalidraw-app/vite.config.mts`
- `packages/excalidraw/components/App.tsx`
- `excalidraw-app/App.tsx`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/collab/Portal.tsx`
- `excalidraw-app/components/AI.tsx`
- `excalidraw-app/index.tsx`
