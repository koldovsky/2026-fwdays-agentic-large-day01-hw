# Project brief

## What this project is

- A **monorepo** using Yarn Workspaces named `excalidraw-monorepo` (root `package.json`, `name` field).
- Based on **Excalidraw** — a library and application for sketching diagrams and a whiteboard with a hand-drawn look.
- The repository root is **private** (`"private": true` in the root `package.json`). The distributable library name is **`@excalidraw/excalidraw`** (`packages/excalidraw/package.json`, `name`; `publishConfig` is `public` there), matching the upstream Excalidraw npm package identity.

## Primary goals

### Product (Excalidraw)

- Provide a **virtual whiteboard** for sketches and diagrams with a distinctive hand-drawn style.
- Copy from the web app meta: a *“virtual collaborative whiteboard tool”* that makes it easy to sketch diagrams with a hand-drawn feel (`excalidraw-app/index.html`, `description` meta tag).
- The app is positioned as a **whiteboard** with collaboration in mind (page title: “Excalidraw Whiteboard”; same metadata source).

### Repository (role of the code)

- **Integrator-facing API**: a **React component** you can embed in your app (`packages/excalidraw/README.md` — first paragraph).
- **Full web client** (`excalidraw-app/`) — a shell around `@excalidraw/excalidraw` with export flows, collaboration, dialogs, etc. (imports from `@excalidraw/excalidraw` in `excalidraw-app/App.tsx`).
- **Examples** for third-party setups (`examples/*` listed in the root `package.json` `workspaces`).

## Monorepo layout (top level)

From the root `package.json` `workspaces` field:

| Workspace | Role (from repo layout) |
|-----------|-------------------------|
| `excalidraw-app` | Vite app; entry for `yarn start` / `yarn build` |
| `packages/*` | Libraries: `common`, `element`, `excalidraw`, `math`, `utils` |
| `examples/*` | Integration examples (e.g. Next.js, script-in-browser) |

## Usage constraints (from package docs)

- The component requires **importing CSS** (`@excalidraw/excalidraw/index.css`) and a **container with non-zero height** — otherwise the canvas is not visible (`packages/excalidraw/README.md`, Quick start).
- Under SSR (e.g. Next.js) the component should render on the client (dynamic import, `ssr: false`) — per the same README.

## Details

For detailed architecture → see [`docs/technical/architecture.md`](../technical/architecture.md).
For domain glossary → see [`docs/product/domain-glossary.md`](../product/domain-glossary.md).

## Source verification

| Claim | Verified in |
|-------|-------------|
| Monorepo name, workspaces, private | Root `package.json` |
| Package `@excalidraw/excalidraw`, version | `packages/excalidraw/package.json` |
| Embeddable React component | `packages/excalidraw/README.md` |
| Whiteboard / collaborative description | `excalidraw-app/index.html` (`<title>`, `<meta name="description">`) |
| App imports the library | `excalidraw-app/App.tsx` |

---

*Memory Bank: [`README.md`](./README.md). Full set: `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`, `decisionLog.md`.*
