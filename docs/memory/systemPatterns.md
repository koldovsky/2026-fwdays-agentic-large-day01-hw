# System Patterns

## Monorepo architecture

This repository follows a workspace-based monorepo pattern:

- `excalidraw-app/`: runnable web app shell (integration, runtime behavior, deployment build)
- `packages/excalidraw/`: main editor package (React component + editor runtime)
- `packages/common`, `packages/element`, `packages/math`, `packages/utils`: shared domain and utility layers
- `examples/*`: integration references for consumers

The app layer composes package capabilities rather than duplicating editor logic.

## Core editor architecture (`packages/excalidraw`)

### 1. Orchestrator pattern

`components/App.tsx` acts as a central orchestrator:

- creates and wires `Scene`, `Store`, `Renderer`, `History`, `ActionManager`
- owns editor lifecycle
- exposes imperative API
- coordinates rendering and side effects

### 2. Layered rendering pattern

Rendering is split into separate canvas responsibilities:

- `StaticCanvas`: durable scene render (elements/background/grid/frame rendering)
- `InteractiveCanvas`: transient interaction overlay (selection, pointers, interaction feedback)

This separation improves performance and avoids full redraw pressure for transient UI.

### 3. Command/action pattern

User operations are represented as actions (`actions/*`) and executed by `ActionManager`:

- action definitions encapsulate intent and transform rules
- keyboard and UI dispatch both converge to same action execution path
- action results are normalized and merged centrally

### 4. Hybrid state pattern

State is organized into coordinated channels:

- React app/editor state (`AppState`) for UI and interaction mode
- scene/store snapshots and deltas for element-level changes
- history stacks (undo/redo) from durable increments
- localized atom-based state via isolated Jotai provider

### 5. Event/observer pattern

State change observation is handled through observer/emitters:

- granular subscriptions (`onStateChange` style selectors)
- store increment emitters
- lifecycle event bus (`mount`, `initialize`, `unmount`)

This supports host integration and internal decoupling.

## Data and synchronization patterns

### Serialization boundaries

The project distinguishes local/export/server app state shapes:

- `data/json.ts` + `appState.ts` clean/strip app state differently by destination
- files and scene metadata are filtered depending on persistence target

### Restore and migration pipeline

`data/restore.ts` normalizes imported scenes:

- backward compatibility handling
- app state normalization
- element and binding repair/migration

### Reconciliation for collaboration

`data/reconcile.ts` merges remote and local element updates deterministically:

- conflict resolution using version/versionNonce rules
- local editing protection for active edits
- index validation and resync

## UI composition patterns

- Context-provider based dependency propagation for app, state, elements, action manager, API
- Slot/custom-render hooks for host extensibility (`renderTopLeftUI`, `renderTopRightUI`, etc.)
- Feature-specific modules (charts, TTD dialog, command palette, sidebar) plugged into shared action/state system

## Operational patterns

- Build orchestration at root script level with workspace delegation
- Strict lint/type/test automation for repo-wide consistency
- Optional Dockerized app serving for predictable local runtime

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
